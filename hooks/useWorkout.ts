'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { WorkoutState, WorkoutData, ExerciseKey } from '@/lib/types';
import { EXERCISES, REST_DURATION } from '@/lib/constants';
import { loadWorkoutData, saveSession, getFirstSessionDate, setFirstSessionDate } from '@/lib/storage';
import { formatDateKey, getWeekNumber, getSetsForWeek } from '@/lib/workout-utils';
import { getTargets } from '@/lib/progression';
import {
  playSetLogged,
  playCountdownTick,
  playRestComplete,
  playSessionComplete,
} from '@/lib/audio';

export function useWorkout(date: Date) {
  const [state, setState] = useState<WorkoutState>('idle');
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(0);
  const [timer, setTimer] = useState(REST_DURATION);
  const [sessionReps, setSessionReps] = useState<Record<string, number[]>>({});
  const [data, setData] = useState<WorkoutData>(() => loadWorkoutData());
  const [flashColor, setFlashColor] = useState<'green' | 'red' | null>(null);
  const [nextExerciseName, setNextExerciseName] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const countdownPlayedRef = useRef<Set<number>>(new Set());

  const dateKey = formatDateKey(date);
  const firstSession = getFirstSessionDate();
  const weekNumber = getWeekNumber(firstSession, date);
  const setsPerExercise = getSetsForWeek(weekNumber);
  const currentExercise = EXERCISES[exerciseIndex];

  const targets = currentExercise
    ? getTargets(currentExercise.key, weekNumber, date, data)
    : [];

  const currentTarget = targets[currentSet] ?? targets[0] ?? 10;

  // Get previous session reps for comparison
  const getPreviousReps = useCallback(
    (key: ExerciseKey, setIndex: number): number | null => {
      const dates = Object.keys(data)
        .filter((d) => d < dateKey && data[d].logged_at)
        .sort()
        .reverse();
      if (dates.length === 0) return null;
      const prevSession = data[dates[0]];
      const reps = prevSession?.[key];
      if (!reps || reps.length <= setIndex) return null;
      return reps[setIndex];
    },
    [data, dateKey]
  );

  const previousRep = currentExercise
    ? getPreviousReps(currentExercise.key, currentSet)
    : null;

  // Wake Lock
  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch {
      // Wake Lock not supported or denied
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    wakeLockRef.current?.release();
    wakeLockRef.current = null;
  }, []);

  // Timer logic
  useEffect(() => {
    if (state === 'resting' && timer > 0) {
      // Reset countdown tracking when timer starts fresh
      if (timer === REST_DURATION) {
        countdownPlayedRef.current = new Set();
      }

      timerRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            // Timer done
            clearInterval(timerRef.current!);
            timerRef.current = null;
            playRestComplete();
            advanceAfterRest();
            return 0;
          }
          // Countdown ticks at 3, 2, 1
          if (t - 1 <= 3 && t - 1 > 0 && !countdownPlayedRef.current.has(t - 1)) {
            countdownPlayedRef.current.add(t - 1);
            playCountdownTick(t - 1);
          }
          return t - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, timer === REST_DURATION]);

  const advanceAfterRest = useCallback(() => {
    const nextSet = currentSet + 1;
    if (nextSet < setsPerExercise) {
      setCurrentSet(nextSet);
      setState('exercising');
    } else {
      // Next exercise
      const nextExercise = exerciseIndex + 1;
      if (nextExercise < EXERCISES.length) {
        // Show transition interstitial
        setNextExerciseName(EXERCISES[nextExercise].name);
        setExerciseIndex(nextExercise);
        setCurrentSet(0);
        setState('transitioning');
      } else {
        // Session complete
        completeSession();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSet, setsPerExercise, exerciseIndex]);

  const finishTransition = useCallback(() => {
    setState('exercising');
  }, []);

  const completeSession = useCallback(() => {
    const session: WorkoutData[string] = {
      logged_at: new Date().toISOString(),
      week_number: weekNumber,
    };
    for (const ex of EXERCISES) {
      if (sessionReps[ex.key]) {
        (session as Record<string, unknown>)[ex.key] = sessionReps[ex.key];
      }
    }
    saveSession(dateKey, session);
    setFirstSessionDate(dateKey);
    setData(loadWorkoutData());
    setState('complete');
    playSessionComplete();
    releaseWakeLock();
  }, [dateKey, weekNumber, sessionReps, releaseWakeLock]);

  const startWorkout = useCallback(() => {
    setExerciseIndex(0);
    setCurrentSet(0);
    setSessionReps({});
    setState('exercising');
    requestWakeLock();
  }, [requestWakeLock]);

  const logSet = useCallback(
    (value: number) => {
      if (!currentExercise) return;
      const key = currentExercise.key;

      // Flash feedback
      const target = currentTarget;
      const hitTarget = value >= target;
      setFlashColor(hitTarget ? 'green' : 'red');
      playSetLogged(hitTarget);
      setTimeout(() => setFlashColor(null), 600);

      setSessionReps((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), value],
      }));

      // Start rest timer (unless last set of last exercise)
      const isLastSet = currentSet + 1 >= setsPerExercise;
      const isLastExercise = exerciseIndex + 1 >= EXERCISES.length;

      if (isLastSet && isLastExercise) {
        // Complete after brief delay for flash
        setTimeout(() => {
          // Need to manually build session since state hasn't updated yet
          const finalReps = {
            ...sessionReps,
            [key]: [...(sessionReps[key] || []), value],
          };
          const session: WorkoutData[string] = {
            logged_at: new Date().toISOString(),
            week_number: weekNumber,
          };
          for (const ex of EXERCISES) {
            if (finalReps[ex.key]) {
              (session as Record<string, unknown>)[ex.key] = finalReps[ex.key];
            }
          }
          saveSession(dateKey, session);
          setFirstSessionDate(dateKey);
          setData(loadWorkoutData());
          setState('complete');
          playSessionComplete();
          releaseWakeLock();
        }, 700);
      } else {
        setTimeout(() => {
          setTimer(REST_DURATION);
          setState('resting');
        }, 700);
      }
    },
    [
      currentExercise,
      currentSet,
      setsPerExercise,
      exerciseIndex,
      currentTarget,
      sessionReps,
      dateKey,
      weekNumber,
      releaseWakeLock,
    ]
  );

  const skipTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    advanceAfterRest();
  }, [advanceAfterRest]);

  const quitWorkout = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setState('idle');
    setExerciseIndex(0);
    setCurrentSet(0);
    setSessionReps({});
    releaseWakeLock();
  }, [releaseWakeLock]);

  const refreshData = useCallback(() => {
    setData(loadWorkoutData());
  }, []);

  return {
    state,
    exerciseIndex,
    currentSet,
    setsPerExercise,
    timer,
    currentExercise,
    currentTarget,
    previousRep,
    flashColor,
    sessionReps,
    weekNumber,
    data,
    nextExerciseName,
    startWorkout,
    logSet,
    skipTimer,
    quitWorkout,
    refreshData,
    finishTransition,
  };
}

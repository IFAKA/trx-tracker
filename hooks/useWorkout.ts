'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { WorkoutState, WorkoutData, ExerciseKey, Exercise } from '@/lib/types';
import { PUSH_EXERCISES, PULL_EXERCISES, LEGS_EXERCISES, REST_DURATION } from '@/lib/constants';
import { loadWorkoutData, saveSession, getFirstSessionDate, setFirstSessionDate } from '@/lib/storage';
import { formatDateKey, getWeekNumber, getSetsForWeek } from '@/lib/workout-utils';
import { getTargets } from '@/lib/progression';
import { useDevTools, useDevToolsRegisterWorkout } from '@/lib/devtools';
import { getWorkoutType } from '@/lib/schedule';
import {
  unlockAudio, playStart, playSetLogged, playCountdownTick,
  playRestComplete, playNextExercise, playSkip, playSessionComplete,
  playExerciseReady, playUndo,
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
  const [timerPaused, setTimerPaused] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const countdownPlayedRef = useRef<Set<number>>(new Set());
  const sessionRepsRef = useRef<Record<string, number[]>>({});

  const devtools = useDevTools();
  const dateKey = formatDateKey(date);
  const firstSession = getFirstSessionDate();
  const weekNumber = getWeekNumber(firstSession, date);
  const setsPerExercise = getSetsForWeek(weekNumber);
  const workoutType = getWorkoutType(date);

  const exercises = useMemo<Exercise[]>(() => {
    if (workoutType === 'push') return PUSH_EXERCISES;
    if (workoutType === 'pull') return PULL_EXERCISES;
    if (workoutType === 'legs') return LEGS_EXERCISES;
    return [];
  }, [workoutType]);

  const currentExercise = exercises[exerciseIndex];
  const targets = currentExercise ? getTargets(currentExercise.key, weekNumber, date, data) : [];
  const currentTarget = targets[currentSet] ?? targets[0] ?? 8;

  const previousRep = useMemo(() => {
    if (!currentExercise) return null;
    const prev = Object.keys(data).filter((d) => d < dateKey && data[d].logged_at).sort().reverse()[0];
    if (!prev) return null;
    const reps = data[prev]?.[currentExercise.key as ExerciseKey];
    return reps && reps.length > currentSet ? reps[currentSet] : null;
  }, [data, dateKey, currentExercise, currentSet]);

  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) wakeLockRef.current = await navigator.wakeLock.request('screen');
    } catch {}
  }, []);

  const releaseWakeLock = useCallback(() => {
    wakeLockRef.current?.release();
    wakeLockRef.current = null;
  }, []);

  useEffect(() => { if (state !== 'resting') setTimerPaused(false); }, [state]);

  useEffect(() => {
    if (state === 'resting' && timer > 0 && !timerPaused) {
      if (timer === REST_DURATION) countdownPlayedRef.current = new Set();
      timerRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            playRestComplete();
            advanceAfterRest();
            return 0;
          }
          if (t - 1 <= 3 && t - 1 > 0 && !countdownPlayedRef.current.has(t - 1)) {
            countdownPlayedRef.current.add(t - 1);
            playCountdownTick(t - 1);
          }
          return t - 1;
        });
      }, 1000 / (devtools?.timerSpeed ?? 1));
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, timer === REST_DURATION, devtools?.timerSpeed, timerPaused]);

  const completeSession = useCallback(() => {
    const reps = sessionRepsRef.current;
    const session: WorkoutData[string] = {
      logged_at: new Date().toISOString(),
      week_number: weekNumber,
      workout_type: workoutType === 'rest' ? 'push' : workoutType,
    };
    for (const ex of exercises) {
      if (reps[ex.key]) (session as Record<string, unknown>)[ex.key] = reps[ex.key];
    }
    saveSession(dateKey, session);
    setFirstSessionDate(dateKey);
    setData(loadWorkoutData());
    playSessionComplete();
    setState('complete');
    releaseWakeLock();
  }, [dateKey, weekNumber, exercises, workoutType, releaseWakeLock]);

  const advanceAfterRest = useCallback(() => {
    const nextSet = currentSet + 1;
    if (nextSet < setsPerExercise) {
      setCurrentSet(nextSet);
      setState('exercising');
    } else {
      const nextIdx = exerciseIndex + 1;
      if (nextIdx < exercises.length) {
        playNextExercise();
        setNextExerciseName(exercises[nextIdx].name);
        setExerciseIndex(nextIdx);
        setCurrentSet(0);
        setState('transitioning');
      } else {
        completeSession();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSet, setsPerExercise, exerciseIndex, exercises, completeSession]);

  const finishTransition = useCallback(() => {
    playExerciseReady();
    setState('exercising');
  }, []);

  const startWorkout = useCallback(() => {
    unlockAudio();
    playStart();
    sessionRepsRef.current = {};
    setExerciseIndex(0);
    setCurrentSet(0);
    setSessionReps({});
    setState('exercising');
    requestWakeLock();
  }, [requestWakeLock]);

  const logSet = useCallback((value: number) => {
    if (!currentExercise) return;
    const key = currentExercise.key;
    const hitTarget = value >= currentTarget;
    setFlashColor(hitTarget ? 'green' : 'red');
    playSetLogged(hitTarget);
    setTimeout(() => setFlashColor(null), 600);

    const newReps = { ...sessionRepsRef.current, [key]: [...(sessionRepsRef.current[key] || []), value] };
    sessionRepsRef.current = newReps;
    setSessionReps(newReps);

    const isLastSet = currentSet + 1 >= setsPerExercise;
    const isLastExercise = exerciseIndex + 1 >= exercises.length;

    setTimeout(() => {
      if (isLastSet && isLastExercise) {
        completeSession();
      } else {
        setTimer(REST_DURATION);
        setState('resting');
      }
    }, 700);
  }, [currentExercise, currentSet, setsPerExercise, exerciseIndex, exercises, currentTarget, completeSession]);

  const skipTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (currentSet + 1 < setsPerExercise) playSkip();
    advanceAfterRest();
  }, [advanceAfterRest, currentSet, setsPerExercise]);

  const quitWorkout = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    sessionRepsRef.current = {};
    setState('idle');
    setExerciseIndex(0);
    setCurrentSet(0);
    setSessionReps({});
    releaseWakeLock();
  }, [releaseWakeLock]);

  // Browser back button
  useEffect(() => {
    if (state !== 'idle') window.history.pushState({ workoutState: state }, '');
  }, [state]);

  useEffect(() => {
    const handler = () => { if (state !== 'idle') quitWorkout(); };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [state, quitWorkout]);

  const togglePauseTimer = useCallback(() => setTimerPaused((p) => !p), []);

  const undoLastSet = useCallback(() => {
    if (!currentExercise) return;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const key = currentExercise.key;
    const updated = { ...sessionRepsRef.current, [key]: (sessionRepsRef.current[key] || []).slice(0, -1) };
    sessionRepsRef.current = updated;
    setSessionReps(updated);
    playUndo();
    setTimer(REST_DURATION);
    setState('exercising');
  }, [currentExercise]);

  const refreshData = useCallback(() => setData(loadWorkoutData()), []);

  useDevToolsRegisterWorkout({
    state, exerciseIndex, currentSet, setsPerExercise, timer, currentTarget, sessionReps,
    weekNumber, currentExerciseName: currentExercise?.name ?? '',
    setState, setExerciseIndex, setCurrentSet, setTimer, logSet, skipTimer, startWorkout, quitWorkout,
  });

  return {
    state, exerciseIndex, currentSet, setsPerExercise, timer, currentExercise, currentTarget,
    previousRep, flashColor, sessionReps, weekNumber, data, nextExerciseName, timerPaused,
    startWorkout, logSet, skipTimer, quitWorkout, refreshData, finishTransition, togglePauseTimer, undoLastSet,
  };
}

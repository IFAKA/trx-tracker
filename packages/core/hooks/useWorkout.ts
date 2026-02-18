/**
 * Platform-agnostic workout state machine
 *
 * Removed platform-specific code:
 * - navigator.wakeLock (browser-only)
 * - window.history (browser-only)
 * - Direct localStorage calls (replaced with StorageAdapter)
 *
 * Platform implementations should provide:
 * - storageAdapter: Platform-specific storage implementation
 * - audioCallbacks: Optional sound playback functions
 * - onWakeLockRequest/Release: Optional wake lock handlers
 * - onHistoryPush: Optional browser history handler
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { WorkoutState, WorkoutData, ExerciseKey, Exercise } from '../lib/types';
import { PUSH_EXERCISES, PULL_EXERCISES, LEGS_EXERCISES, REST_DURATION } from '../lib/constants';
import { formatDateKey, getWeekNumber, getSetsForWeek } from '../lib/workout-utils';
import { getTargets } from '../lib/progression';
import { getWorkoutType } from '../lib/schedule';
import type { StorageAdapter } from '../lib/storage-interface';

// ============================================================================
// TYPES
// ============================================================================

export interface UseWorkoutOptions {
  /** Current date for workout session */
  date: Date;

  /** Platform-specific storage adapter */
  storageAdapter: StorageAdapter;

  /** Optional audio callbacks */
  audioCallbacks?: {
    unlockAudio?: () => void;
    playStart?: () => void;
    playSetLogged?: (hitTarget: boolean) => void;
    playCountdownTick?: (secondsLeft: number) => void;
    playRestComplete?: () => void;
    playNextExercise?: () => void;
    playSkip?: () => void;
    playSessionComplete?: () => void;
    playExerciseReady?: () => void;
    playUndo?: () => void;
  };

  /** Optional wake lock handlers (browser/mobile) */
  onWakeLockRequest?: () => Promise<void>;
  onWakeLockRelease?: () => void;

  /** Optional browser history handler (PWA only) */
  onHistoryPush?: (state: WorkoutState) => void;

  /** Optional DevTools integration */
  devTools?: {
    timerSpeed?: number; // Speed multiplier for testing
    registerState?: (state: unknown) => void;
  };
}

export interface UseWorkoutReturn {
  // State
  state: WorkoutState;
  exerciseIndex: number;
  currentSet: number;
  setsPerExercise: number;
  timer: number;
  currentExercise: Exercise | undefined;
  currentTarget: number;
  previousRep: number | null;
  flashColor: 'green' | 'red' | null;
  sessionReps: Record<string, number[]>;
  weekNumber: number;
  data: WorkoutData;
  nextExerciseName: string;

  // Actions
  startWorkout: () => void;
  logSet: (value: number) => void;
  skipTimer: () => void;
  quitWorkout: () => void;
  refreshData: () => void;
  finishTransition: () => void;
  togglePauseTimer: () => void;
  undoLastSet: () => void;
  timerPaused: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

export function useWorkout(options: UseWorkoutOptions): UseWorkoutReturn {
  const {
    date,
    storageAdapter,
    audioCallbacks = {},
    onWakeLockRequest,
    onWakeLockRelease,
    onHistoryPush,
    devTools,
  } = options;

  // State
  const [state, setState] = useState<WorkoutState>('idle');
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(0);
  const [timer, setTimer] = useState(REST_DURATION);
  const [sessionReps, setSessionReps] = useState<Record<string, number[]>>({});
  const [data, setData] = useState<WorkoutData>({});
  const [flashColor, setFlashColor] = useState<'green' | 'red' | null>(null);
  const [nextExerciseName, setNextExerciseName] = useState('');
  const [firstSessionDate, setFirstSessionDate] = useState<string | null>(null);
  const [timerPaused, setTimerPaused] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownPlayedRef = useRef<Set<number>>(new Set());

  // Load data on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      const [loadedData, firstDate] = await Promise.all([
        storageAdapter.loadWorkoutData(),
        storageAdapter.getFirstSessionDate(),
      ]);
      if (mounted) {
        setData(loadedData);
        setFirstSessionDate(firstDate);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [storageAdapter]);

  const dateKey = formatDateKey(date);
  const weekNumber = getWeekNumber(firstSessionDate, date);
  const setsPerExercise = getSetsForWeek(weekNumber);

  const { workoutType, exercises } = useMemo(() => {
    const wt = getWorkoutType(date);
    let exs: Exercise[];
    if (wt === 'push') exs = PUSH_EXERCISES;
    else if (wt === 'pull') exs = PULL_EXERCISES;
    else if (wt === 'legs') exs = LEGS_EXERCISES;
    else exs = PUSH_EXERCISES; // rest day fallback (shouldn't start workout on rest day)
    return { workoutType: wt, exercises: exs };
  }, [date]);

  const currentExercise = exercises[exerciseIndex];

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

  // Reset pause when leaving rest state
  useEffect(() => {
    if (state !== 'resting') setTimerPaused(false);
  }, [state]);

  // Timer logic
  useEffect(() => {
    if (state === 'resting' && timer > 0 && !timerPaused) {
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
            audioCallbacks.playRestComplete?.();
            advanceAfterRest();
            return 0;
          }
          // Countdown ticks at 3, 2, 1
          if (t - 1 <= 3 && t - 1 > 0 && !countdownPlayedRef.current.has(t - 1)) {
            countdownPlayedRef.current.add(t - 1);
            audioCallbacks.playCountdownTick?.(t - 1);
          }
          return t - 1;
        });
      }, 1000 / (devTools?.timerSpeed ?? 1));

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, timer === REST_DURATION, devTools?.timerSpeed, timerPaused]);

  const advanceAfterRest = useCallback(() => {
    const nextSet = currentSet + 1;
    if (nextSet < setsPerExercise) {
      setCurrentSet(nextSet);
      setState('exercising');
    } else {
      // Next exercise
      const nextExercise = exerciseIndex + 1;
      if (nextExercise < exercises.length) {
        // Show transition interstitial
        audioCallbacks.playNextExercise?.();
        setNextExerciseName(exercises[nextExercise].name);
        setExerciseIndex(nextExercise);
        setCurrentSet(0);
        setState('transitioning');
      } else {
        // Session complete
        completeSession();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSet, setsPerExercise, exerciseIndex, exercises]);

  const finishTransition = useCallback(() => {
    audioCallbacks.playExerciseReady?.();
    setState('exercising');
  }, [audioCallbacks]);

  const completeSession = useCallback(() => {
    (async () => {
      const session: WorkoutData[string] = {
        logged_at: new Date().toISOString(),
        week_number: weekNumber,
        workout_type: workoutType as Exclude<typeof workoutType, 'rest'>,
      };
      for (const ex of exercises) {
        if (sessionReps[ex.key]) {
          (session as Record<string, unknown>)[ex.key] = sessionReps[ex.key];
        }
      }
      await storageAdapter.saveSession(dateKey, session);
      await storageAdapter.setFirstSessionDate(dateKey);

      const updatedData = await storageAdapter.loadWorkoutData();
      setData(updatedData);
      audioCallbacks.playSessionComplete?.();
      setState('complete');
      onWakeLockRelease?.();
    })();
  }, [dateKey, weekNumber, sessionReps, storageAdapter, audioCallbacks, onWakeLockRelease, exercises, workoutType]);

  const startWorkout = useCallback(() => {
    audioCallbacks.unlockAudio?.();
    audioCallbacks.playStart?.();
    setExerciseIndex(0);
    setCurrentSet(0);
    setSessionReps({});
    setState('exercising');
    onWakeLockRequest?.();
  }, [audioCallbacks, onWakeLockRequest]);

  const logSet = useCallback(
    (value: number) => {
      if (!currentExercise) return;
      const key = currentExercise.key;

      // Flash feedback
      const target = currentTarget;
      const hitTarget = value >= target;
      setFlashColor(hitTarget ? 'green' : 'red');
      audioCallbacks.playSetLogged?.(hitTarget);
      setTimeout(() => setFlashColor(null), 600);

      setSessionReps((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), value],
      }));

      // Start rest timer (unless last set of last exercise)
      const isLastSet = currentSet + 1 >= setsPerExercise;
      const isLastExercise = exerciseIndex + 1 >= exercises.length;

      if (isLastSet && isLastExercise) {
        // Complete after brief delay for flash
        setTimeout(() => {
          // Build final session
          const finalReps = {
            ...sessionReps,
            [key]: [...(sessionReps[key] || []), value],
          };
          (async () => {
            const session: WorkoutData[string] = {
              logged_at: new Date().toISOString(),
              week_number: weekNumber,
              workout_type: workoutType as Exclude<typeof workoutType, 'rest'>,
            };
            for (const ex of exercises) {
              if (finalReps[ex.key]) {
                (session as Record<string, unknown>)[ex.key] = finalReps[ex.key];
              }
            }
            await storageAdapter.saveSession(dateKey, session);
            await storageAdapter.setFirstSessionDate(dateKey);

            const updatedData = await storageAdapter.loadWorkoutData();
            setData(updatedData);
            audioCallbacks.playSessionComplete?.();
            setState('complete');
            onWakeLockRelease?.();
          })();
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
      storageAdapter,
      audioCallbacks,
      onWakeLockRelease,
      exercises,
      workoutType,
    ]
  );

  const skipTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Only play skip when staying on the same exercise (next set).
    // When advancing to next exercise, advanceAfterRest plays playNextExercise instead.
    const movingToNextExercise = currentSet + 1 >= setsPerExercise;
    if (!movingToNextExercise) {
      audioCallbacks.playSkip?.();
    }
    advanceAfterRest();
  }, [advanceAfterRest, audioCallbacks, currentSet, setsPerExercise]);

  const quitWorkout = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setState('idle');
    setExerciseIndex(0);
    setCurrentSet(0);
    setSessionReps({});
    onWakeLockRelease?.();
  }, [onWakeLockRelease]);

  const togglePauseTimer = useCallback(() => {
    setTimerPaused((prev) => !prev);
  }, []);

  const undoLastSet = useCallback(() => {
    if (!currentExercise) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setSessionReps((prev) => {
      const key = currentExercise.key;
      const current = prev[key] || [];
      if (current.length === 0) return prev;
      return { ...prev, [key]: current.slice(0, -1) };
    });
    audioCallbacks.playUndo?.();
    setTimer(REST_DURATION);
    setState('exercising');
  }, [currentExercise, audioCallbacks]);

  const refreshData = useCallback(() => {
    (async () => {
      const updatedData = await storageAdapter.loadWorkoutData();
      setData(updatedData);
    })();
  }, [storageAdapter]);

  // Platform-specific: Browser history support (optional)
  useEffect(() => {
    if (state !== 'idle' && onHistoryPush) {
      onHistoryPush(state);
    }
  }, [state, onHistoryPush]);

  // DevTools integration (optional)
  useEffect(() => {
    if (devTools?.registerState) {
      devTools.registerState({
        state,
        exerciseIndex,
        currentSet,
        setsPerExercise,
        timer,
        currentTarget,
        sessionReps,
        weekNumber,
        currentExerciseName: currentExercise?.name ?? '',
      });
    }
  }, [
    state,
    exerciseIndex,
    currentSet,
    setsPerExercise,
    timer,
    currentTarget,
    sessionReps,
    weekNumber,
    currentExercise,
    devTools,
  ]);

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
    togglePauseTimer,
    undoLastSet,
    timerPaused,
  };
}

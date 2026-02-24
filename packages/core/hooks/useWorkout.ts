import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { WorkoutState, WorkoutData, ExerciseKey, Exercise } from '../lib/types';
import { PUSH_EXERCISES, PULL_EXERCISES, LEGS_EXERCISES, REST_DURATION } from '../lib/constants';
import { formatDateKey, getWeekNumber, getSetsForWeek } from '../lib/workout-utils';
import { getTargets } from '../lib/progression';
import { getWorkoutType } from '../lib/schedule';
import type { StorageAdapter } from '../lib/storage-interface';

export interface UseWorkoutOptions {
  date: Date;
  storageAdapter: StorageAdapter;
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
  onWakeLockRequest?: () => Promise<void>;
  onWakeLockRelease?: () => void;
  onHistoryPush?: (state: WorkoutState) => void;
  devTools?: {
    timerSpeed?: number;
    registerState?: (state: unknown) => void;
  };
}

export interface UseWorkoutReturn {
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
  totalExercises: number;
  nextExerciseName: string;
  timerPaused: boolean;
  startWorkout: () => void;
  logSet: (value: number) => void;
  skipTimer: () => void;
  quitWorkout: () => void;
  refreshData: () => void;
  finishTransition: () => void;
  togglePauseTimer: () => void;
  undoLastSet: () => void;
}

export function useWorkout(options: UseWorkoutOptions): UseWorkoutReturn {
  const { date, storageAdapter, audioCallbacks = {}, onWakeLockRequest, onWakeLockRelease, onHistoryPush, devTools } = options;

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
  // Absolute wall-clock timestamp when the rest period ends (for background-safe timing)
  const timerEndRef = useRef<number | null>(null);
  // Timestamp when the timer was paused (to extend deadline on resume)
  const timerPauseStartRef = useRef<number | null>(null);
  // Ref mirrors sessionReps so completeSession always reads the latest value
  const sessionRepsRef = useRef<Record<string, number[]>>({});

  useEffect(() => {
    let mounted = true;
    Promise.all([storageAdapter.loadWorkoutData(), storageAdapter.getFirstSessionDate()]).then(
      ([loadedData, firstDate]) => {
        if (mounted) { setData(loadedData); setFirstSessionDate(firstDate); }
      }
    );
    return () => { mounted = false; };
  }, [storageAdapter]);

  const dateKey = formatDateKey(date);
  const weekNumber = getWeekNumber(firstSessionDate, date);
  const setsPerExercise = getSetsForWeek(weekNumber);

  const { workoutType, exercises } = useMemo(() => {
    const wt = getWorkoutType(date);
    const exs = wt === 'push' ? PUSH_EXERCISES : wt === 'pull' ? PULL_EXERCISES : wt === 'legs' ? LEGS_EXERCISES : PUSH_EXERCISES;
    return { workoutType: wt, exercises: exs };
  }, [date]);

  const currentExercise = exercises[exerciseIndex];
  const targets = currentExercise ? getTargets(currentExercise.key, weekNumber, date, data) : [];
  const currentTarget = targets[currentSet] ?? targets[0] ?? 10;

  const previousRep = useMemo(() => {
    if (!currentExercise) return null;
    const prev = Object.keys(data).filter((d) => d < dateKey && data[d].logged_at).sort().reverse()[0];
    if (!prev) return null;
    const reps = data[prev]?.[currentExercise.key as ExerciseKey];
    return reps && reps.length > currentSet ? reps[currentSet] : null;
  }, [data, dateKey, currentExercise, currentSet]);

  useEffect(() => { if (state !== 'resting') setTimerPaused(false); }, [state]);

  useEffect(() => {
    if (state === 'resting' && timer > 0 && !timerPaused) {
      const speed = devTools?.timerSpeed ?? 1;
      if (timer === REST_DURATION) {
        // New rest period: reset countdown sounds and set absolute deadline
        countdownPlayedRef.current = new Set();
        timerEndRef.current = Date.now() + (REST_DURATION * 1000) / speed;
      }
      timerRef.current = setInterval(() => {
        const remaining = timerEndRef.current
          ? Math.max(0, Math.ceil(((timerEndRef.current - Date.now()) * speed) / 1000))
          : 0;
        setTimer((t) => {
          if (remaining <= 0 || t <= 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            audioCallbacks.playRestComplete?.();
            advanceAfterRest();
            return 0;
          }
          if (remaining <= 3 && !countdownPlayedRef.current.has(remaining)) {
            countdownPlayedRef.current.add(remaining);
            audioCallbacks.playCountdownTick?.(remaining);
          }
          return remaining;
        });
      }, 1000 / speed);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, timer === REST_DURATION, devTools?.timerSpeed, timerPaused]);

  const saveAndComplete = useCallback(async () => {
    const reps = sessionRepsRef.current;
    const session: WorkoutData[string] = {
      logged_at: new Date().toISOString(),
      week_number: weekNumber,
      workout_type: workoutType as Exclude<typeof workoutType, 'rest'>,
    };
    for (const ex of exercises) {
      if (reps[ex.key]) (session as Record<string, unknown>)[ex.key] = reps[ex.key];
    }
    await storageAdapter.saveSession(dateKey, session);
    await storageAdapter.setFirstSessionDate(dateKey);
    setData(await storageAdapter.loadWorkoutData());
    audioCallbacks.playSessionComplete?.();
    setState('complete');
    onWakeLockRelease?.();
  }, [dateKey, weekNumber, exercises, workoutType, storageAdapter, audioCallbacks, onWakeLockRelease]);

  const advanceAfterRest = useCallback(() => {
    const nextSet = currentSet + 1;
    if (nextSet < setsPerExercise) {
      setCurrentSet(nextSet);
      setState('exercising');
    } else {
      const nextIdx = exerciseIndex + 1;
      if (nextIdx < exercises.length) {
        audioCallbacks.playNextExercise?.();
        setNextExerciseName(exercises[nextIdx].name);
        setExerciseIndex(nextIdx);
        setCurrentSet(0);
        setState('transitioning');
      } else {
        saveAndComplete();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSet, setsPerExercise, exerciseIndex, exercises, saveAndComplete]);

  // Catch up timer when returning from background (setInterval is throttled by Android)
  useEffect(() => {
    const speed = devTools?.timerSpeed ?? 1;
    const handleVisibilityChange = () => {
      if (!document.hidden && state === 'resting' && !timerPaused && timerEndRef.current) {
        const remaining = Math.max(0, Math.ceil(((timerEndRef.current - Date.now()) * speed) / 1000));
        if (remaining <= 0) {
          if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
          setTimer(0);
          audioCallbacks.playRestComplete?.();
          advanceAfterRest();
        } else {
          setTimer(remaining);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state, timerPaused, advanceAfterRest, audioCallbacks, devTools?.timerSpeed]);

  const finishTransition = useCallback(() => {
    audioCallbacks.playExerciseReady?.();
    setState('exercising');
  }, [audioCallbacks]);

  const startWorkout = useCallback(() => {
    audioCallbacks.unlockAudio?.();
    audioCallbacks.playStart?.();
    sessionRepsRef.current = {};
    setExerciseIndex(0);
    setCurrentSet(0);
    setSessionReps({});
    setState('exercising');
    onWakeLockRequest?.();
  }, [audioCallbacks, onWakeLockRequest]);

  const logSet = useCallback((value: number) => {
    if (!currentExercise) return;
    const key = currentExercise.key;
    const hitTarget = value >= currentTarget;
    setFlashColor(hitTarget ? 'green' : 'red');
    audioCallbacks.playSetLogged?.(hitTarget);
    setTimeout(() => setFlashColor(null), 600);

    const newReps = { ...sessionRepsRef.current, [key]: [...(sessionRepsRef.current[key] || []), value] };
    sessionRepsRef.current = newReps;
    setSessionReps(newReps);

    const isLastSet = currentSet + 1 >= setsPerExercise;
    const isLastExercise = exerciseIndex + 1 >= exercises.length;

    setTimeout(() => {
      if (isLastSet && isLastExercise) {
        saveAndComplete();
      } else {
        setTimer(REST_DURATION);
        setState('resting');
      }
    }, 700);
  }, [currentExercise, currentSet, setsPerExercise, exerciseIndex, exercises, currentTarget, audioCallbacks, saveAndComplete]);

  const skipTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (currentSet + 1 < setsPerExercise) audioCallbacks.playSkip?.();
    advanceAfterRest();
  }, [advanceAfterRest, audioCallbacks, currentSet, setsPerExercise]);

  const quitWorkout = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    sessionRepsRef.current = {};
    setState('idle');
    setExerciseIndex(0);
    setCurrentSet(0);
    setSessionReps({});
    onWakeLockRelease?.();
  }, [onWakeLockRelease]);

  const togglePauseTimer = useCallback(() => {
    setTimerPaused((p) => {
      if (p) {
        // Resuming: extend the deadline by however long we were paused
        if (timerPauseStartRef.current !== null && timerEndRef.current !== null) {
          timerEndRef.current += Date.now() - timerPauseStartRef.current;
          timerPauseStartRef.current = null;
        }
      } else {
        // Pausing: record when we paused
        timerPauseStartRef.current = Date.now();
      }
      return !p;
    });
  }, []);

  const undoLastSet = useCallback(() => {
    if (!currentExercise) return;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const key = currentExercise.key;
    const updated = { ...sessionRepsRef.current, [key]: (sessionRepsRef.current[key] || []).slice(0, -1) };
    sessionRepsRef.current = updated;
    setSessionReps(updated);
    audioCallbacks.playUndo?.();
    setTimer(REST_DURATION);
    setState('exercising');
  }, [currentExercise, audioCallbacks]);

  const refreshData = useCallback(() => {
    storageAdapter.loadWorkoutData().then(setData);
  }, [storageAdapter]);

  useEffect(() => {
    if (state !== 'idle' && onHistoryPush) onHistoryPush(state);
  }, [state, onHistoryPush]);

  useEffect(() => {
    devTools?.registerState?.({ state, exerciseIndex, currentSet, setsPerExercise, timer, currentTarget, sessionReps, weekNumber, currentExerciseName: currentExercise?.name ?? '' });
  }, [state, exerciseIndex, currentSet, setsPerExercise, timer, currentTarget, sessionReps, weekNumber, currentExercise, devTools]);

  return {
    state, exerciseIndex, currentSet, setsPerExercise, timer, currentExercise, currentTarget,
    previousRep, flashColor, sessionReps, weekNumber, data, totalExercises: exercises.length, nextExerciseName, timerPaused,
    startWorkout, logSet, skipTimer, quitWorkout, refreshData, finishTransition, togglePauseTimer, undoLastSet,
  };
}

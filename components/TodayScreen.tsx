'use client';

import { useState, useEffect, useMemo } from 'react';
import { Dumbbell, Play, CheckCircle, Calendar, Smartphone, Flame, ChartBar } from 'lucide-react';
import { Button } from '@traindaily/ui';
import {
  ExerciseScreen,
  RestTimer,
  ExerciseTransition,
  SessionComplete,
  RestDayScreen,
  Onboarding,
  WeeklySplit,
  HistoryScreen,
} from '@traindaily/ui';
import { useWorkout } from '@/hooks/useWorkout';
import { useSchedule } from '@/hooks/useSchedule';
import { useDevTools } from '@/lib/devtools';
import { useMobility } from '@/hooks/useMobility';
import { formatDisplayDate, getWeekNumber } from '@/lib/workout-utils';
import { getFirstSessionDate } from '@/lib/storage';
import { getWorkoutType, getTrainingStreak } from '@/lib/schedule';
import { PUSH_EXERCISES, PULL_EXERCISES, LEGS_EXERCISES } from '@/lib/constants';
import { syncWithDesktop, getStoredDesktopInfo, clearDesktopInfo } from '@/lib/sync-client';
import { playWentOffline, playBackOnline } from '@/lib/audio';

const ONBOARDING_KEY = 'traindaily_onboarding_completed';

function useOfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOnline(false);
      playWentOffline();
    };
    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      playBackOnline();
      setTimeout(() => setShowBackOnline(false), 2000);
    };
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return { isOnline, showBackOnline };
}

export function TodayScreen() {
  const [mounted, setMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const devtools = useDevTools();
  const { isOnline, showBackOnline } = useOfflineIndicator();

  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect

    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const today = useMemo(() => {
    if (!mounted) return null;
    return devtools?.dateOverride ?? new Date();
  }, [mounted, devtools?.dateOverride]);

  const handleCompleteOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  const visible = !isOnline || showBackOnline;
  const offlineLine = (
    <div
      className="fixed top-0 left-0 right-0 h-[2px] z-50 transition-opacity duration-300"
      style={{
        backgroundColor: showBackOnline ? 'var(--system-green)' : 'var(--system-orange)',
        opacity: visible ? 1 : 0,
        animation: visible ? 'slide-down-in 300ms cubic-bezier(0.4, 0.0, 0.2, 1)' : undefined,
      }}
    />
  );

  if (showOnboarding) {
    return <>{offlineLine}<Onboarding onComplete={handleCompleteOnboarding} /></>;
  }

  if (!today) {
    return (
      <>
        {offlineLine}
        <div className="flex items-center justify-center h-[100dvh] bg-background">
          <Dumbbell className="w-8 h-8 animate-pulse" />
        </div>
      </>
    );
  }

  return <>{offlineLine}<TodayContent date={today} /></>;
}

function TodayContent({ date }: { date: Date }) {
  const schedule = useSchedule(date);
  const workout = useWorkout(date);
  const mobility = useMobility();
  const firstSession = getFirstSessionDate();
  const weekNumber = getWeekNumber(firstSession, date);
  const workoutType = getWorkoutType(date);
  const streak = getTrainingStreak(date, workout.data);
  const [showHistory, setShowHistory] = useState(false);

  // Get current day's exercises
  const EXERCISES = workoutType === 'push' ? PUSH_EXERCISES : workoutType === 'pull' ? PULL_EXERCISES : workoutType === 'legs' ? LEGS_EXERCISES : [];

  // Check if desktop is paired
  const [isPaired, setIsPaired] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [showPairHint, setShowPairHint] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const desktopInfo = localStorage.getItem('traindaily_desktop_info');
      setIsPaired(!!desktopInfo);
    }
  }, []);

  const handlePairButton = async () => {
    if (isPaired) {
      setSyncStatus('syncing');
      const result = await syncWithDesktop();
      setSyncStatus(result.success ? 'success' : 'error');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } else {
      setShowPairHint(true);
      setTimeout(() => setShowPairHint(false), 4000);
    }
  };

  const handleUnpair = () => {
    clearDesktopInfo();
    setIsPaired(false);
    setSyncStatus('idle');
  };

  // History screen
  if (showHistory) {
    return (
      <HistoryScreen
        data={workout.data}
        currentDate={date}
        onBack={() => setShowHistory(false)}
      />
    );
  }

  // Rest day
  if (!schedule.isTraining) {
    return (
      <RestDayScreen
        nextTraining={schedule.nextTraining}
        weekCompleted={schedule.weekProgress.completed}
        weekTotal={schedule.weekProgress.total}
        mobility={mobility}
      />
    );
  }

  // Already done
  if (schedule.isDone && workout.state === 'idle') {
    const session = workout.data[schedule.dateKey];
    const sessionWorkoutType = session?.workout_type || workoutType;
    const completedExercises = sessionWorkoutType === 'push'
      ? PUSH_EXERCISES
      : sessionWorkoutType === 'pull'
      ? PULL_EXERCISES
      : LEGS_EXERCISES;

    return (
      <div className="flex flex-col h-[100dvh] overflow-hidden bg-background">
        {/* Header */}
        <div className="flex flex-col items-center flex-shrink-0 p-6 pt-12 gap-3">
          <CheckCircle className="w-16 h-16 text-green-500" />
          <h1 className="text-xl font-bold tracking-tight uppercase">{sessionWorkoutType} DONE</h1>
          <p className="text-sm text-muted-foreground">{formatDisplayDate(date)}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground/60 uppercase tracking-widest w-full max-w-xs mt-2">
            <span>Exercise</span>
            <span>Sets</span>
          </div>
        </div>

        {/* Scrollable exercises list */}
        <div className="flex-1 overflow-y-auto px-6">
          <div className="w-full max-w-xs mx-auto space-y-1">
            {completedExercises.map((ex) => {
              const reps = session?.[ex.key];
              if (!reps) return null;
              return (
                <div key={ex.key} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate font-[family-name:var(--font-geist-sans)]">{ex.name}</span>
                  <span className="font-mono">
                    {reps.join('·')}
                    {ex.unit === 'seconds' ? 's' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex-shrink-0 flex flex-col items-center gap-3 p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-mono">
              {schedule.weekProgress.completed}/{schedule.weekProgress.total} this week
            </span>
          </div>
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 hover:bg-muted active:scale-95 transition-all"
          >
            <ChartBar className="w-4 h-4" />
            <span className="text-sm">History</span>
          </button>
        </div>
      </div>
    );
  }

  // Workout in progress
  if (workout.state === 'exercising') {
    return (
      <ExerciseScreen
        exercise={workout.currentExercise!}
        exerciseIndex={workout.exerciseIndex}
        totalExercises={workout.totalExercises}
        currentSet={workout.currentSet}
        setsPerExercise={workout.setsPerExercise}
        currentTarget={workout.currentTarget}
        previousRep={workout.previousRep}
        flashColor={workout.flashColor}
        onLogSet={workout.logSet}
        onQuit={workout.quitWorkout}
      />
    );
  }

  if (workout.state === 'transitioning') {
    return (
      <ExerciseTransition
        exerciseName={workout.nextExerciseName}
        onComplete={workout.finishTransition}
      />
    );
  }

  if (workout.state === 'resting') {
    return (
      <RestTimer
        seconds={workout.timer}
        isPaused={workout.timerPaused}
        onPauseToggle={workout.togglePauseTimer}
        onSkip={workout.skipTimer}
        onQuit={workout.quitWorkout}
        onUndo={workout.undoLastSet}
      />
    );
  }

  if (workout.state === 'complete') {
    const onSync = getStoredDesktopInfo()
      ? () => syncWithDesktop()
      : undefined;
    return (
      <SessionComplete
        mode="workout"
        sessionReps={workout.sessionReps}
        data={workout.data}
        date={date}
        onSync={onSync}
      />
    );
  }

  // Idle — ready to start
  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-background">
      {/* Top content */}
      <div className="flex flex-col items-center flex-shrink-0 px-6 pt-12 pb-4 gap-5">
        <div className="flex flex-col items-center gap-3">
          <Dumbbell
            className="w-10 h-10"
            style={{ animation: 'bounce-in 600ms ease-out backwards' }}
          />
          <h1 className="text-2xl font-bold tracking-tight uppercase text-foreground">
            {workoutType === 'push' ? 'PUSH' : workoutType === 'pull' ? 'PULL' : 'LEGS'}
          </h1>
          <p className="text-sm text-muted-foreground">{formatDisplayDate(date)}</p>
        </div>

        <div
          className="flex items-center gap-3 text-sm text-muted-foreground"
          style={{ animation: 'stagger-in 400ms ease-out 200ms backwards' }}
        >
          <span className="font-mono">WEEK {weekNumber}</span>
          <span>·</span>
          <span className="font-mono">{workout.setsPerExercise} SETS</span>
          {streak > 0 && (
            <>
              <span>·</span>
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-mono text-orange-500">{streak}</span>
              </div>
            </>
          )}
        </div>

        <Button
          size="lg"
          onClick={workout.startWorkout}
          className="rounded-full w-20 h-20 animate-pulse active:scale-95 transition-transform"
        >
          <Play className="w-10 h-10" />
        </Button>
      </div>

      {/* Weekly Split — scrollable if needed */}
      <div className="flex-1 overflow-y-auto px-6 pb-2">
        <WeeklySplit currentDate={date} data={workout.data} />
      </div>

      {/* Bottom actions */}
      <div className="flex-shrink-0 flex flex-col items-center gap-2 p-4 pb-6">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handlePairButton}
            disabled={syncStatus === 'syncing'}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 hover:bg-muted active:scale-95 transition-all disabled:opacity-50"
          >
            <Smartphone className="w-4 h-4" />
            <span className="text-sm">
              {syncStatus === 'syncing' ? 'Syncing...' :
               syncStatus === 'success' ? 'Synced!' :
               syncStatus === 'error' ? 'Sync failed' :
               isPaired ? 'Sync with Desktop' : 'Pair with Desktop'}
            </span>
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 hover:bg-muted active:scale-95 transition-all"
          >
            <ChartBar className="w-4 h-4" />
            <span className="text-sm">History</span>
          </button>
        </div>

        {/* Inline hint when not paired */}
        {showPairHint && (
          <p className="text-xs text-muted-foreground text-center animate-in fade-in">
            Open the desktop app → Pair Device → scan QR with your camera
          </p>
        )}

        {/* Unpair option when paired */}
        {isPaired && syncStatus === 'idle' && (
          <button
            onClick={handleUnpair}
            className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors"
          >
            Disconnect desktop
          </button>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Dumbbell, Play, CheckCircle, Calendar, Smartphone, Flame, ChartBar } from 'lucide-react';
import { Button } from '@traindaily/ui';
import { useRouter } from 'next/navigation';
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
import { syncWithDesktop, getStoredDesktopInfo } from '@/lib/sync-client';

const ONBOARDING_KEY = 'traindaily_onboarding_completed';

function useOfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOnline(false);
    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
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

  const offlineLine = (
    <div
      className="fixed top-0 left-0 right-0 h-[2px] z-50 transition-all duration-500"
      style={{
        backgroundColor: showBackOnline ? 'oklch(0.7 0.2 145)' : !isOnline ? 'oklch(0.75 0.15 60)' : 'transparent',
        opacity: isOnline && !showBackOnline ? 0 : 1,
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
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Dumbbell className="w-8 h-8 animate-pulse" />
        </div>
      </>
    );
  }

  return <>{offlineLine}<TodayContent date={today} /></>;
}

function TodayContent({ date }: { date: Date }) {
  const router = useRouter();
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
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const desktopInfo = localStorage.getItem('traindaily_desktop_info');
      setIsPaired(!!desktopInfo);
    }
  }, []);

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 gap-6">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <h1 className="text-xl font-bold tracking-tight uppercase">{sessionWorkoutType} DONE</h1>
        <p className="text-sm text-muted-foreground">{formatDisplayDate(date)}</p>

        {/* Quick summary */}
        <div className="w-full max-w-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground/60 uppercase tracking-widest mb-2">
            <span>Exercise</span>
            <span>Sets</span>
          </div>
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

        <div className="flex items-center gap-2 text-muted-foreground mt-4">
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
    );
  }

  // Workout in progress
  if (workout.state === 'exercising') {
    return (
      <ExerciseScreen
        exerciseIndex={workout.exerciseIndex}
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 gap-6">
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

      {/* Weekly Split Schedule */}
      <WeeklySplit currentDate={date} data={workout.data} />

      {/* Bottom actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/pair')}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 hover:bg-muted active:scale-95 transition-all"
        >
          <Smartphone className="w-4 h-4" />
          <span className="text-sm">
            {isPaired ? 'Paired with Desktop' : 'Pair with Desktop'}
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
    </div>
  );
}

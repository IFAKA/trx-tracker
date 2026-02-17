'use client';

import { useState, useEffect, useMemo } from 'react';
import { Dumbbell, Play, CheckCircle, Calendar, Smartphone, Flame, ChartBar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ExerciseScreen } from './ExerciseScreen';
import { RestTimer } from './RestTimer';
import { ExerciseTransition } from './ExerciseTransition';
import { SessionComplete } from './SessionComplete';
import { RestDayScreen } from './RestDayScreen';
import { Onboarding } from './Onboarding';
import { WeeklySplit } from './WeeklySplit';
import { HistoryScreen } from './HistoryScreen';
import { useWorkout } from '@/hooks/useWorkout';
import { useSchedule } from '@/hooks/useSchedule';
import { useDevTools } from '@/lib/devtools';
import { formatDisplayDate, getWeekNumber } from '@/lib/workout-utils';
import { getFirstSessionDate } from '@/lib/storage';
import { getWorkoutType, getTrainingStreak } from '@/lib/schedule';
import { PUSH_EXERCISES, PULL_EXERCISES, LEGS_EXERCISES } from '@/lib/constants';

const ONBOARDING_KEY = 'traindaily_onboarding_completed';

export function TodayScreen() {
  const [mounted, setMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const devtools = useDevTools();

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

  if (showOnboarding) {
    return <Onboarding onComplete={handleCompleteOnboarding} />;
  }

  if (!today) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Dumbbell className="w-8 h-8 animate-pulse" />
      </div>
    );
  }

  return <TodayContent date={today} />;
}

function TodayContent({ date }: { date: Date }) {
  const router = useRouter();
  const schedule = useSchedule(date);
  const workout = useWorkout(date);
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
    return (
      <SessionComplete
        mode="workout"
        sessionReps={workout.sessionReps}
        data={workout.data}
        date={date}
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
        <h1 className="text-2xl font-bold tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-blue-400 to-green-400">
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

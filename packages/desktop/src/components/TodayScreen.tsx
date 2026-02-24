'use client';

import { useState, useEffect, useMemo } from 'react';
import { Dumbbell, Play, CheckCircle, Calendar, Smartphone } from 'lucide-react';
import { Button, ExerciseScreen, RestTimer, ExerciseTransition, SessionComplete, RestDayScreen, Onboarding } from '@traindaily/ui';
import { SettingsDialog } from '@/components/SettingsDialog';
import { useRouter } from 'next/navigation';
import { useWorkout } from '@/hooks/useWorkout';
import { useSchedule } from '@/hooks/useSchedule';
import { useFirstSessionDate } from '@/hooks/useFirstSessionDate';
import { useMobility } from '@/hooks/useMobility';
import { useDevTools } from '@/lib/devtools';
import { formatDisplayDate, getWeekNumber } from '@/lib/workout-utils';
import { PUSH_EXERCISES, PULL_EXERCISES, LEGS_EXERCISES } from '@/lib/constants';
import { getWorkoutType } from '@traindaily/core';

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
  const mobility = useMobility();
  const firstSession = useFirstSessionDate();
  const weekNumber = getWeekNumber(firstSession, date);
  const workoutType = getWorkoutType(date);

  const content = (() => {
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
      const restLabel = workout.currentSet + 1 < workout.setsPerExercise
        ? `Set ${workout.currentSet + 2} of ${workout.setsPerExercise}`
        : workout.nextExercise?.name ? `Next · ${workout.nextExercise.name}` : undefined;
      return (
        <RestTimer
          seconds={workout.timer}
          isPaused={workout.timerPaused}
          onPauseToggle={workout.togglePauseTimer}
          onSkip={workout.skipTimer}
          onQuit={workout.quitWorkout}
          onUndo={workout.undoLastSet}
          restLabel={restLabel}
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
          onDone={workout.quitWorkout}
        />
      );
    }

    // Idle — ready to start
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 gap-8">
        <div className="flex flex-col items-center gap-3">
          <Dumbbell
            className="w-10 h-10"
            style={{ animation: 'bounce-in 600ms ease-out backwards' }}
          />
          <h1 className="text-2xl font-bold tracking-tight uppercase">
            {workoutType === 'push' ? 'PUSH' : workoutType === 'pull' ? 'PULL' : workoutType === 'legs' ? 'LEGS' : 'TRAINING'}
          </h1>
          <p className="text-sm text-muted-foreground">{formatDisplayDate(date)}</p>
        </div>

        <div
          className="flex items-center gap-2 text-sm text-muted-foreground"
          style={{ animation: 'stagger-in 400ms ease-out 200ms backwards' }}
        >
          <span className="font-mono">WEEK {weekNumber}</span>
          <span>·</span>
          <span className="font-mono">{workout.setsPerExercise} SETS</span>
        </div>

        <Button
          size="lg"
          onClick={workout.startWorkout}
          className="rounded-full w-20 h-20 animate-pulse active:scale-95 transition-transform"
        >
          <Play className="w-10 h-10" />
        </Button>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-mono">
            {schedule.weekProgress.completed}/{schedule.weekProgress.total} this week
          </span>
        </div>

        {/* Sync button */}
        <button
          onClick={() => router.push('/pair')}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 hover:bg-muted active:scale-95 transition-all mt-4"
        >
          <Smartphone className="w-4 h-4" />
          <span className="text-sm">Pair with Phone</span>
        </button>
      </div>
    );
  })();

  return (
    <div className="relative">
      {content}
      <SettingsDialog />
    </div>
  );
}

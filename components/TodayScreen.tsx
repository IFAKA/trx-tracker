'use client';

import { useState, useEffect } from 'react';
import { Dumbbell, Play, CheckCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExerciseScreen } from './ExerciseScreen';
import { RestTimer } from './RestTimer';
import { ExerciseTransition } from './ExerciseTransition';
import { SessionComplete } from './SessionComplete';
import { RestDayScreen } from './RestDayScreen';
import { useWorkout } from '@/hooks/useWorkout';
import { useSchedule } from '@/hooks/useSchedule';
import { formatDisplayDate, getWeekNumber } from '@/lib/workout-utils';
import { getFirstSessionDate } from '@/lib/storage';
import { EXERCISES } from '@/lib/constants';

export function TodayScreen() {
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    setToday(new Date());
  }, []);

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
  const schedule = useSchedule(date);
  const workout = useWorkout(date);
  const firstSession = getFirstSessionDate();
  const weekNumber = getWeekNumber(firstSession, date);

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
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 gap-6">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <h1 className="text-xl font-bold tracking-tight">DONE</h1>
        <p className="text-sm text-muted-foreground">{formatDisplayDate(date)}</p>

        {/* Quick summary */}
        <div className="w-full max-w-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground/60 uppercase tracking-widest mb-2">
            <span>Exercise</span>
            <span>Sets</span>
          </div>
          {EXERCISES.map((ex) => {
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
    return <RestTimer seconds={workout.timer} onSkip={workout.skipTimer} onQuit={workout.quitWorkout} />;
  }

  if (workout.state === 'complete') {
    return (
      <SessionComplete
        sessionReps={workout.sessionReps}
        data={workout.data}
        date={date}
      />
    );
  }

  // Idle — ready to start
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 gap-8">
      <div className="flex flex-col items-center gap-3">
        <Dumbbell className="w-10 h-10" />
        <h1 className="text-2xl font-bold tracking-tight">TRAINING</h1>
        <p className="text-sm text-muted-foreground">{formatDisplayDate(date)}</p>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-mono">WEEK {weekNumber}</span>
        <span>·</span>
        <span className="font-mono">{workout.setsPerExercise} SETS</span>
      </div>

      <Button
        size="lg"
        onClick={workout.startWorkout}
        className="rounded-full w-20 h-20"
      >
        <Play className="w-10 h-10" />
      </Button>

      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar className="w-4 h-4" />
        <span className="text-sm font-mono">
          {schedule.weekProgress.completed}/{schedule.weekProgress.total} this week
        </span>
      </div>
    </div>
  );
}

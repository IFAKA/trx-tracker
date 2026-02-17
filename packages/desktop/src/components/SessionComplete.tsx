'use client';

import { Trophy, TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { EXERCISES, MOBILITY_EXERCISES } from '@/lib/constants';
import { WorkoutData } from '@/lib/types';
import { formatDateKey } from '@/lib/workout-utils';
import { getTrainingDaysCompletedThisWeek } from '@/lib/schedule';

type SessionCompleteProps =
  | { mode: 'workout'; sessionReps: Record<string, number[]>; data: WorkoutData; date: Date }
  | { mode: 'mobility'; date: Date; weekCompleted: number; weekTotal: number; nextTraining: string | null };

export function SessionComplete(props: SessionCompleteProps) {
  const isWorkout = props.mode === 'workout';

  const weekProgress = isWorkout
    ? getTrainingDaysCompletedThisWeek(props.date, props.data)
    : { completed: props.weekCompleted, total: props.weekTotal };

  // Build exercise cards
  let cards: React.ReactNode[];

  if (isWorkout) {
    const dateKey = formatDateKey(props.date);
    const { sessionReps, data } = props;

    // Get previous session for comparison
    const prevDates = Object.keys(data)
      .filter((d) => d < dateKey && data[d].logged_at)
      .sort()
      .reverse();
    const prevSession = prevDates[0] ? data[prevDates[0]] : null;

    const exercisesWithData = EXERCISES.filter((ex) => {
      const reps = sessionReps[ex.key] || data[dateKey]?.[ex.key];
      return !!reps;
    });

    cards = exercisesWithData.map((ex, index) => {
      const reps = sessionReps[ex.key] || data[formatDateKey(props.date)]?.[ex.key];
      if (!reps) return null;
      const prevReps = prevSession?.[ex.key];
      const improved =
        prevReps && reps[0] > prevReps[0]
          ? 'up'
          : prevReps && reps[0] < prevReps[0]
            ? 'down'
            : 'same';

      return (
        <Card
          key={ex.key}
          className="bg-card/50"
          style={{
            animation: 'stagger-in 400ms ease-out backwards',
            animationDelay: `${500 + index * 80}ms`,
          }}
        >
          <CardContent className="flex items-center justify-between py-3 px-4">
            <span className="text-sm font-medium truncate flex-1 font-[family-name:var(--font-geist-sans)]">
              {ex.name}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">
                {reps.join(' · ')}
                {ex.unit === 'seconds' ? 's' : ''}
              </span>
              {improved === 'up' && (
                <TrendingUp className="w-4 h-4 text-green-500" />
              )}
              {improved === 'down' && (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              {improved === 'same' && prevReps && (
                <Minus className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </CardContent>
        </Card>
      );
    });
  } else {
    cards = MOBILITY_EXERCISES.map((ex, index) => (
      <Card
        key={ex.name}
        className="bg-card/50"
        style={{
          animation: 'stagger-in 400ms ease-out backwards',
          animationDelay: `${500 + index * 80}ms`,
        }}
      >
        <CardContent className="flex items-center justify-between py-3 px-4">
          <span className="text-sm font-medium truncate flex-1 font-[family-name:var(--font-geist-sans)]">
            {ex.name}
          </span>
          <span className="font-mono text-sm text-muted-foreground">
            {ex.duration}s{ex.sides ? ' × 2 sides' : ''}
          </span>
        </CardContent>
      </Card>
    ));
  }

  const cardCount = isWorkout
    ? EXERCISES.filter((ex) => {
        const reps = props.sessionReps[ex.key] || props.data[formatDateKey(props.date)]?.[ex.key];
        return !!reps;
      }).length
    : MOBILITY_EXERCISES.length;

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-6 gap-6">
      {/* Trophy */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <Trophy
          className="w-16 h-16 text-yellow-500"
          style={{ animation: 'bounce-in 600ms ease-out 100ms backwards' }}
        />
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ animation: 'slide-up-in 500ms ease-out 300ms backwards' }}
        >
          {isWorkout ? 'SESSION COMPLETE' : 'MOBILITY COMPLETE'}
        </h1>
        {!isWorkout && props.nextTraining && (
          <p
            className="text-sm text-muted-foreground"
            style={{ animation: 'slide-up-in 500ms ease-out 400ms backwards' }}
          >
            NEXT: {props.nextTraining}
          </p>
        )}
      </div>

      {/* Summary */}
      <div className="w-full max-w-sm space-y-2">
        <div
          className="flex items-center justify-between px-4 text-xs text-muted-foreground uppercase tracking-widest"
          style={{ animation: 'stagger-in 400ms ease-out 400ms backwards' }}
        >
          <span>Exercise</span>
          <span>{isWorkout ? 'Sets' : 'Duration'}</span>
        </div>
        {cards}
      </div>

      {/* Week progress */}
      <div
        className="flex items-center gap-3 w-full max-w-sm"
        style={{
          animation: 'stagger-in 400ms ease-out backwards',
          animationDelay: `${500 + cardCount * 80}ms`,
        }}
      >
        <Calendar className="w-5 h-5 text-muted-foreground" />
        <Progress
          value={(weekProgress.completed / weekProgress.total) * 100}
          className="flex-1 h-2"
        />
        <span className="text-sm font-mono text-muted-foreground">
          {weekProgress.completed}/{weekProgress.total} this week
        </span>
      </div>
    </div>
  );
}

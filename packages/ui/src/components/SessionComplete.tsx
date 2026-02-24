'use client';

import { useEffect, useState } from 'react';
import { Trophy, TrendingUp, TrendingDown, Minus, Calendar, Loader2, Check, WifiOff } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { EXERCISES, MOBILITY_EXERCISES, WorkoutData, formatDateKey, getTrainingDaysCompletedThisWeek } from '@traindaily/core';

type SessionCompleteProps =
  | {
      mode: 'workout';
      sessionReps: Record<string, number[]>;
      data: WorkoutData;
      date: Date;
      /** Called when user taps Done — resets workout state to idle. */
      onDone: () => void;
      /** Optional: called to sync with desktop after session. PWA-only. */
      onSync?: () => Promise<{ success: boolean }>;
    }
  | { mode: 'mobility'; date: Date; weekCompleted: number; weekTotal: number; nextTraining: string | null; onDone: () => void };

export function SessionComplete(props: SessionCompleteProps) {
  const isWorkout = props.mode === 'workout';
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'failed'>('idle');

  // Sync with desktop after session (PWA only, when onSync is provided)
  useEffect(() => {
    if (!isWorkout) return;
    const onSync = (props as Extract<typeof props, { mode: 'workout' }>).onSync;
    if (!onSync) return;
    setSyncStatus('syncing');
    onSync().then(({ success }) => {
      setSyncStatus(success ? 'success' : 'failed');
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detect difficulty increase: any exercise maxed out all sets at 20+ reps
  const maxedExercises = isWorkout
    ? EXERCISES.filter((ex) => {
        const reps = (props as Extract<typeof props, { mode: 'workout' }>).sessionReps[ex.key];
        return reps && reps.length > 0 && reps.every((r) => r >= 20);
      })
    : [];
  const hasDifficultyIncrease = maxedExercises.length > 0;

  const weekProgress = isWorkout
    ? getTrainingDaysCompletedThisWeek(
        (props as Extract<typeof props, { mode: 'workout' }>).date,
        (props as Extract<typeof props, { mode: 'workout' }>).data
      )
    : {
        completed: (props as Extract<typeof props, { mode: 'mobility' }>).weekCompleted,
        total: (props as Extract<typeof props, { mode: 'mobility' }>).weekTotal,
      };

  // Build exercise cards
  let cards: React.ReactNode[];

  if (isWorkout) {
    const workoutProps = props as Extract<typeof props, { mode: 'workout' }>;
    const dateKey = formatDateKey(workoutProps.date);
    const { sessionReps, data } = workoutProps;

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
      const reps = sessionReps[ex.key] || data[formatDateKey(workoutProps.date)]?.[ex.key];
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
          className="bg-card/50 py-0"
          style={{
            animation: 'stagger-in 260ms ease-out backwards',
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
        className="bg-card/50 py-0"
        style={{
          animation: 'stagger-in 260ms ease-out backwards',
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

  const workoutProps = isWorkout ? (props as Extract<typeof props, { mode: 'workout' }>) : null;
  const cardCount = isWorkout
    ? EXERCISES.filter((ex) => {
        const reps = workoutProps!.sessionReps[ex.key] || workoutProps!.data[formatDateKey(workoutProps!.date)]?.[ex.key];
        return !!reps;
      }).length
    : MOBILITY_EXERCISES.length;

  const mobilityProps = !isWorkout ? (props as Extract<typeof props, { mode: 'mobility' }>) : null;

  return (
    <div className="flex flex-col items-center h-[100dvh] bg-background p-6 gap-6 overflow-hidden">
      {/* Trophy */}
      <div className="flex flex-col items-center justify-center gap-4 py-2">
        <Trophy
          className="w-16 h-16 text-yellow-500"
          style={{ animation: 'bounce-in 350ms cubic-bezier(0.34, 1.56, 0.64, 1) 100ms backwards' }}
        />
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ animation: 'slide-up-in 260ms ease-out 200ms backwards' }}
        >
          {isWorkout ? 'SESSION COMPLETE' : 'MOBILITY COMPLETE'}
        </h1>
        {hasDifficultyIncrease && (
          <p
            className="text-xs text-orange-400 uppercase tracking-widest font-mono"
            style={{ animation: 'slide-up-in 260ms ease-out 340ms backwards' }}
          >
            ↑ DIFFICULTY UP NEXT SESSION
          </p>
        )}
        {!isWorkout && mobilityProps?.nextTraining && (
          <p
            className="text-sm text-muted-foreground"
            style={{ animation: 'slide-up-in 260ms ease-out 280ms backwards' }}
          >
            NEXT: {mobilityProps.nextTraining}
          </p>
        )}
      </div>

      {/* Summary */}
      <div className="w-full max-w-sm flex-1 min-h-0 flex flex-col gap-2">
        <div
          className="flex items-center justify-between px-4 text-xs text-muted-foreground uppercase tracking-widest shrink-0"
          style={{ animation: 'stagger-in 260ms ease-out 280ms backwards' }}
        >
          <span>Exercise</span>
          <span>{isWorkout ? 'Sets' : 'Duration'}</span>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
          {cards}
        </div>
      </div>

      {/* Week progress */}
      <div
        className="flex items-center gap-3 w-full max-w-sm"
        style={{
          animation: 'stagger-in 260ms ease-out backwards',
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

      {/* Sync status */}
      {syncStatus !== 'idle' && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {syncStatus === 'syncing' && <Loader2 className="w-3 h-3 animate-spin" />}
          {syncStatus === 'success' && <Check className="w-3 h-3 text-green-500" />}
          {syncStatus === 'failed' && <WifiOff className="w-3 h-3" />}
          <span>
            {syncStatus === 'syncing' ? 'Syncing with desktop...' : syncStatus === 'success' ? 'Synced' : 'Desktop not reachable'}
          </span>
        </div>
      )}

      {/* Done button */}
      <Button
        onClick={props.onDone}
        className="w-full max-w-sm rounded-full active:scale-95 transition-transform shrink-0"
        style={{
          animation: 'stagger-in 260ms ease-out backwards',
          animationDelay: `${600 + cardCount * 80}ms`,
        }}
      >
        Done
      </Button>
    </div>
  );
}

'use client';

import { Trophy, TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { EXERCISES } from '@/lib/constants';
import { WorkoutData } from '@/lib/types';
import { formatDateKey } from '@/lib/workout-utils';
import { getTrainingDaysCompletedThisWeek } from '@/lib/schedule';

interface SessionCompleteProps {
  sessionReps: Record<string, number[]>;
  data: WorkoutData;
  date: Date;
}

export function SessionComplete({ sessionReps, data, date }: SessionCompleteProps) {
  const weekProgress = getTrainingDaysCompletedThisWeek(date, data);
  const dateKey = formatDateKey(date);

  // Get previous session for comparison
  const prevDates = Object.keys(data)
    .filter((d) => d < dateKey && data[d].logged_at)
    .sort()
    .reverse();
  const prevSession = prevDates[0] ? data[prevDates[0]] : null;

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-6 gap-6">
      {/* Trophy */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <Trophy className="w-16 h-16 text-yellow-500" />
        <h1 className="text-2xl font-bold tracking-tight">SESSION COMPLETE</h1>
      </div>

      {/* Summary */}
      <div className="w-full max-w-sm space-y-2">
        <div className="flex items-center justify-between px-4 text-xs text-muted-foreground uppercase tracking-widest">
          <span>Exercise</span>
          <span>Sets</span>
        </div>
        {EXERCISES.map((ex) => {
          const reps = sessionReps[ex.key] || data[dateKey]?.[ex.key];
          if (!reps) return null;
          const prevReps = prevSession?.[ex.key];
          const improved =
            prevReps && reps[0] > prevReps[0]
              ? 'up'
              : prevReps && reps[0] < prevReps[0]
                ? 'down'
                : 'same';

          return (
            <Card key={ex.key} className="bg-card/50">
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
        })}
      </div>

      {/* Week progress */}
      <div className="flex items-center gap-3 w-full max-w-sm">
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

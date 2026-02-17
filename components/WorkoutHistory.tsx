'use client';

import { useMemo } from 'react';
import { subDays, format, startOfWeek } from 'date-fns';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkoutData, WorkoutType } from '@/lib/types';
import { formatDateKey } from '@/lib/workout-utils';
import { getWorkoutType } from '@/lib/schedule';

interface WorkoutHistoryProps {
  currentDate: Date;
  data: WorkoutData;
}

interface WeekSummary {
  weekStart: Date;
  weekLabel: string;
  push: number;
  pull: number;
  legs: number;
  total: number;
}

export function WorkoutHistory({ currentDate, data }: WorkoutHistoryProps) {
  const weekSummaries = useMemo<WeekSummary[]>(() => {
    const summaries: WeekSummary[] = [];

    // Last 4 weeks
    for (let i = 0; i < 4; i++) {
      const weekStart = startOfWeek(subDays(currentDate, i * 7), { weekStartsOn: 1 });
      const weekLabel = format(weekStart, 'MMM d');

      let push = 0;
      let pull = 0;
      let legs = 0;

      // Check all 7 days in this week
      for (let d = 0; d < 7; d++) {
        const checkDate = new Date(weekStart);
        checkDate.setDate(checkDate.getDate() + d);
        const dateKey = formatDateKey(checkDate);
        const session = data[dateKey];

        if (session?.logged_at) {
          // Calculate total volume (sets × reps)
          let volume = 0;
          Object.entries(session).forEach(([key, value]) => {
            if (key !== 'logged_at' && key !== 'week_number' && key !== 'workout_type' && Array.isArray(value)) {
              volume += value.reduce((sum: number, reps: number) => sum + reps, 0);
            }
          });

          // Add to appropriate category
          const workoutType = session.workout_type || getWorkoutType(checkDate);
          if (workoutType === 'push') push += volume;
          if (workoutType === 'pull') pull += volume;
          if (workoutType === 'legs') legs += volume;
        }
      }

      summaries.unshift({
        weekStart,
        weekLabel,
        push,
        pull,
        legs,
        total: push + pull + legs,
      });
    }

    return summaries;
  }, [currentDate, data]);

  const latestWeek = weekSummaries[weekSummaries.length - 1];
  const previousWeek = weekSummaries[weekSummaries.length - 2];
  const volumeChange = latestWeek && previousWeek ? latestWeek.total - previousWeek.total : 0;

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground/60 uppercase tracking-widest">
        <span>Volume Progression</span>
        <div className="flex items-center gap-1">
          {volumeChange > 0 && <TrendingUp className="w-3.5 h-3.5 text-green-500" />}
          {volumeChange < 0 && <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
          {volumeChange === 0 && <Minus className="w-3.5 h-3.5 text-muted-foreground/40" />}
          <span className={cn(
            'font-mono text-xs',
            volumeChange > 0 && 'text-green-500',
            volumeChange < 0 && 'text-red-500'
          )}>
            {volumeChange > 0 ? '+' : ''}{volumeChange}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {weekSummaries.map((week, index) => {
          const isLatest = index === weekSummaries.length - 1;
          const maxVolume = Math.max(...weekSummaries.map(w => w.total));

          return (
            <div
              key={week.weekLabel}
              className={cn(
                'p-3 rounded-lg transition-colors',
                isLatest ? 'bg-muted/50' : 'opacity-60'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{week.weekLabel}</span>
                <span className="text-sm font-mono text-muted-foreground">
                  {week.total} reps
                </span>
              </div>

              {/* Volume bars */}
              <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-muted/20">
                {week.push > 0 && (
                  <div
                    className="bg-orange-400"
                    style={{ width: `${(week.push / week.total) * 100}%` }}
                    title={`Push: ${week.push}`}
                  />
                )}
                {week.pull > 0 && (
                  <div
                    className="bg-blue-400"
                    style={{ width: `${(week.pull / week.total) * 100}%` }}
                    title={`Pull: ${week.pull}`}
                  />
                )}
                {week.legs > 0 && (
                  <div
                    className="bg-green-400"
                    style={{ width: `${(week.legs / week.total) * 100}%` }}
                    title={`Legs: ${week.legs}`}
                  />
                )}
              </div>

              {/* Split breakdown */}
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground/60">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-orange-400" />
                  <span>{week.push}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>{week.pull}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span>{week.legs}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

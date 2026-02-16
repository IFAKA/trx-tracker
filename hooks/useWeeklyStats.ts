'use client';

import { useMemo } from 'react';
import { startOfWeek } from 'date-fns';
import { WorkoutData } from '@/lib/types';
import { getWeeklyStats } from '@/lib/workout-utils';

export function useWeeklyStats(date: Date, data: WorkoutData) {
  return useMemo(() => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    return getWeeklyStats(data, weekStart);
  }, [date, data]);
}

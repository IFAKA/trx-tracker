'use client';

import { useMemo } from 'react';
import { isTrainingDay, getTrainingDaysCompletedThisWeek, getNextTrainingMessage } from '@/lib/schedule';
import { loadWorkoutData } from '@/lib/storage';
import { formatDateKey } from '@/lib/workout-utils';
import { useDevToolsRegisterSchedule } from '@/lib/devtools';

export function useSchedule(date: Date) {
  const result = useMemo(() => {
    const data = loadWorkoutData();
    const dateKey = formatDateKey(date);
    const training = isTrainingDay(date);
    const todayDone = !!data[dateKey]?.logged_at;
    const weekProgress = getTrainingDaysCompletedThisWeek(date, data);
    const nextTraining = !training ? getNextTrainingMessage(date) : null;

    return {
      isTraining: training,
      isDone: todayDone,
      weekProgress,
      nextTraining,
      dateKey,
    };
  }, [date]);

  useDevToolsRegisterSchedule(result);

  return result;
}

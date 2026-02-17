import { useMemo } from 'react';
import { isTrainingDay, getTrainingDaysCompletedThisWeek, getNextTrainingMessage } from '../lib/schedule';
import { formatDateKey } from '../lib/workout-utils';
import { WorkoutData } from '../lib/types';

export interface UseScheduleOptions {
  date: Date;
  data: WorkoutData;
}

export function useSchedule(options: UseScheduleOptions) {
  const { date, data } = options;

  return useMemo(() => {
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
  }, [date, data]);
}

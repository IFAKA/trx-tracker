import { useState, useEffect } from 'react';
import { useSchedule as useCoreSchedule } from '@traindaily/core';
import { loadWorkoutData } from '../lib/storage';
import { WorkoutData } from '../lib/types';

export function useSchedule(date: Date) {
  const [data, setData] = useState<WorkoutData>({});

  useEffect(() => {
    loadWorkoutData().then(setData);
  }, []);

  return useCoreSchedule({ date, data });
}

'use client';

import { useSchedule as useCoreSchedule } from '@traindaily/core';
import { loadWorkoutData } from '@/lib/storage';
import { useDevToolsRegisterSchedule } from '@/lib/devtools';

export function useSchedule(date: Date) {
  const data = loadWorkoutData();
  const result = useCoreSchedule({ date, data });

  useDevToolsRegisterSchedule(result);

  return result;
}

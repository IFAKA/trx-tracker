'use client';

import { useMemo } from 'react';
import { ExerciseKey, WorkoutData } from '@/lib/types';
import { getTargets, shouldIncreaseDifficulty } from '@/lib/progression';
import { getWeekNumber } from '@/lib/workout-utils';

export function useProgression(
  exerciseKey: ExerciseKey,
  currentDate: Date,
  data: WorkoutData,
  firstSessionDate: string | null
) {
  return useMemo(() => {
    const weekNumber = getWeekNumber(firstSessionDate, currentDate);
    const targets = getTargets(exerciseKey, weekNumber, currentDate, data);
    const increaseDifficulty = shouldIncreaseDifficulty(exerciseKey, data);

    return { targets, weekNumber, increaseDifficulty };
  }, [exerciseKey, currentDate, data, firstSessionDate]);
}

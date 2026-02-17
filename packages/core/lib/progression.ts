/**
 * Evidence-Based Progressive Overload System
 *
 * Rep range: 6-20 reps for hypertrophy (not just 8-12)
 * Research: Practical benefit in prioritizing intermediate loads
 * Source: https://calisteniapp.com/articles/Compilation-of-ALL-Scientific-Evidence-on-Hypertrophy-training
 *
 * Progressive overload: Increase reps to 20, then increase difficulty
 * Periodization: 4-week mesocycles with exercise progressions
 */

import { WorkoutData, ExerciseKey } from './types';
import { getPreviousSessionDate, getSetsForWeek } from './workout-utils';

export function getTargets(
  exerciseKey: ExerciseKey,
  weekNumber: number,
  currentDate: Date,
  data: WorkoutData
): number[] {
  const sets = getSetsForWeek(weekNumber);
  const prevDateKey = getPreviousSessionDate(currentDate, data);

  // Evidence-based rep range: 6-20 reps for hypertrophy
  const MIN_REPS = 6;
  const MAX_REPS = 20;
  const START_REPS = 8; // Start conservative

  if (!prevDateKey) {
    // First session ever - start with 8 reps (middle of 6-20 range)
    return Array(sets).fill(START_REPS);
  }

  const prevSession = data[prevDateKey];
  const prevReps = prevSession?.[exerciseKey];

  if (!prevReps || prevReps.length === 0) {
    return Array(sets).fill(START_REPS);
  }

  // Progressive overload: Increase reps until hitting 20, then increase difficulty
  // Research shows 6-20 reps effective for hypertrophy

  // Check if all previous sets hit 20+ reps (time to progress exercise variation)
  const allHit20Plus = prevReps.every((r) => r >= MAX_REPS);

  if (allHit20Plus) {
    // Reset to starting reps with harder variation (handled by progression system)
    // Exercise difficulty increases every 4 weeks (see exercise-progression.ts)
    return Array(sets).fill(START_REPS);
  }

  // Progressive overload: Use previous average + 1 rep as target
  const avgPrevReps = Math.floor(prevReps.reduce((sum, r) => sum + r, 0) / prevReps.length);
  const newTarget = Math.min(MAX_REPS, Math.max(MIN_REPS, avgPrevReps + 1));

  return Array(sets).fill(newTarget);
}

export function shouldIncreaseDifficulty(
  exerciseKey: ExerciseKey,
  data: WorkoutData
): boolean {
  // Check last session for this exercise
  const dates = Object.keys(data).sort().reverse();
  for (const d of dates) {
    const session = data[d];
    const reps = session?.[exerciseKey];
    if (reps && reps.length > 0) {
      // If all sets hit 20+ reps, time to increase difficulty
      // This triggers exercise progression (see exercise-progression.ts)
      return reps.every((r) => r >= 20);
    }
  }
  return false;
}

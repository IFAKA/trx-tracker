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

  // Default starting targets: 3-4 sets of 8 reps
  const baseTarget = 8;

  if (!prevDateKey) {
    // First session ever - start with 8 reps
    return Array(sets).fill(baseTarget);
  }

  const prevSession = data[prevDateKey];
  const prevReps = prevSession?.[exerciseKey];

  if (!prevReps || prevReps.length === 0) {
    return Array(sets).fill(baseTarget);
  }

  // Progressive overload logic for 8-12 rep range
  // Goal: increase reps until all sets hit 12, then suggest difficulty increase

  // Check if all previous sets hit 12+ reps (time to increase difficulty)
  const allHit12Plus = prevReps.every((r) => r >= 12);

  if (allHit12Plus) {
    // Reset to 8 reps with harder variation
    // Note: User needs to manually increase difficulty (e.g., harder angle, slower tempo)
    return Array(sets).fill(baseTarget);
  }

  // Otherwise, use previous performance as targets
  // If user hit target on previous sets, maintain that target
  const avgPrevReps = Math.floor(prevReps.reduce((sum, r) => sum + r, 0) / prevReps.length);
  const newTarget = Math.min(12, Math.max(baseTarget, avgPrevReps));

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
      // If all sets hit 12+ reps, time to increase difficulty
      return reps.every((r) => r >= 12);
    }
  }
  return false;
}

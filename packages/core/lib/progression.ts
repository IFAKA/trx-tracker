import { WorkoutData, ExerciseKey } from './types';
import { EXERCISES, DEFAULT_TARGETS_REPS, DEFAULT_TARGETS_PLANK } from './constants';
import { getPreviousSessionDate, getSetsForWeek } from './workout-utils';

export function getTargets(
  exerciseKey: ExerciseKey,
  weekNumber: number,
  currentDate: Date,
  data: WorkoutData
): number[] {
  const exercise = EXERCISES.find((e) => e.key === exerciseKey)!;
  const sets = getSetsForWeek(weekNumber);
  const prevDateKey = getPreviousSessionDate(currentDate, data);

  if (!prevDateKey) {
    // First session ever
    const defaults: number[] =
      exercise.unit === 'seconds'
        ? [...DEFAULT_TARGETS_PLANK]
        : [...DEFAULT_TARGETS_REPS];
    if (sets === 3) {
      defaults.push(defaults[defaults.length - 1] - 2);
    }
    return defaults;
  }

  const prevSession = data[prevDateKey];
  const prevReps = prevSession?.[exerciseKey];

  if (!prevReps || prevReps.length === 0) {
    const defaults: number[] =
      exercise.unit === 'seconds'
        ? [...DEFAULT_TARGETS_PLANK]
        : [...DEFAULT_TARGETS_REPS];
    if (sets === 3) defaults.push(defaults[defaults.length - 1] - 2);
    return defaults;
  }

  // Get previous targets by looking at what the target was
  // We derive targets from the previous performance
  const prevTargets = getPreviousTargets(exerciseKey, prevDateKey, data);
  const increment = exercise.unit === 'seconds' ? 5 : 1;

  // Check if all sets hit target
  const prevSetsCount = Math.min(prevReps.length, prevTargets.length);
  let allHitTarget = true;
  let anyWayBelow = false;

  for (let i = 0; i < prevSetsCount; i++) {
    if (prevReps[i] < prevTargets[i]) allHitTarget = false;
    if (prevReps[i] < prevTargets[i] - 3) anyWayBelow = true;
  }

  let newTarget: number;
  if (allHitTarget) {
    newTarget = prevTargets[0] + increment;
  } else if (anyWayBelow) {
    newTarget = prevTargets[0]; // keep same
  } else {
    newTarget = prevTargets[0]; // keep same
  }

  // Build targets array for current sets count
  if (sets === 2) {
    return [newTarget, Math.max(1, newTarget - 2)];
  }
  return [newTarget, Math.max(1, newTarget - 2), Math.max(1, newTarget - 4)];
}

function getPreviousTargets(
  exerciseKey: ExerciseKey,
  dateKey: string,
  data: WorkoutData
): number[] {
  // Walk backwards to reconstruct target chain
  // For simplicity, use the reps as approximate targets
  const session = data[dateKey];
  const reps = session?.[exerciseKey];
  if (!reps) {
    const exercise = EXERCISES.find((e) => e.key === exerciseKey)!;
    return exercise.unit === 'seconds'
      ? [...DEFAULT_TARGETS_PLANK]
      : [...DEFAULT_TARGETS_REPS];
  }
  // Use max rep from first set as the target baseline
  return reps.map((_, i) => {
    if (i === 0) return reps[0];
    return Math.max(1, reps[0] - i * 2);
  });
}

export function shouldIncreaseDifficulty(
  exerciseKey: ExerciseKey,
  data: WorkoutData
): boolean {
  const exercise = EXERCISES.find((e) => e.key === exerciseKey)!;
  if (exercise.unit === 'seconds') return false;

  // Check last session
  const dates = Object.keys(data).sort().reverse();
  for (const d of dates) {
    const session = data[d];
    const reps = session?.[exerciseKey];
    if (reps && reps.length > 0) {
      return reps.every((r) => r >= 15);
    }
  }
  return false;
}

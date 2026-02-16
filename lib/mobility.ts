import { MOBILITY_EXERCISES, MICRO_BREAK_EXERCISES } from './constants';
import { MobilityExercise, MicroBreakExercise } from './types';

export function getMobilityRoutine(): MobilityExercise[] {
  return MOBILITY_EXERCISES;
}

export function getMobilityTotalDuration(): number {
  return MOBILITY_EXERCISES.reduce((sum, ex) => {
    return sum + (ex.sides ? ex.duration * 2 : ex.duration);
  }, 0);
}

export function getNextMicroBreak(index: number): MicroBreakExercise {
  return MICRO_BREAK_EXERCISES[index % MICRO_BREAK_EXERCISES.length];
}

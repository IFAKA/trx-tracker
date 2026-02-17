import { getDay, addDays, startOfWeek, subDays } from 'date-fns';
import { WorkoutType } from './types';
import { formatDateKey, formatDisplayDate } from './workout-utils';

/**
 * 6-day PPL cycle: Push → Pull → Legs → Push → Pull → Legs → Rest (Sunday)
 * Monday = Push, Tuesday = Pull, Wednesday = Legs, Thursday = Push, Friday = Pull, Saturday = Legs, Sunday = Rest
 */
export function getWorkoutType(date: Date): WorkoutType {
  const day = getDay(date); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

  if (day === 0) return 'rest'; // Sunday is rest day

  // Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6
  // Pattern: Push, Pull, Legs, Push, Pull, Legs
  const cycle = ['push', 'pull', 'legs', 'push', 'pull', 'legs'] as const;
  return cycle[(day - 1) % 6];
}

export function isTrainingDay(date: Date): boolean {
  return getWorkoutType(date) !== 'rest';
}

export function nextTrainingDay(date: Date): Date {
  let d = addDays(date, 1);
  while (!isTrainingDay(d)) {
    d = addDays(d, 1);
  }
  return d;
}

export function getTrainingDaysCompletedThisWeek(
  date: Date,
  data: Record<string, { logged_at?: string }>
): { completed: number; total: number } {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  let completed = 0;
  const total = 6; // 6 training days per week

  for (let i = 0; i < 7; i++) {
    const d = addDays(weekStart, i);
    const key = formatDateKey(d);
    if (data[key]?.logged_at) {
      completed++;
    }
  }

  return { completed, total };
}

export function getNextTrainingMessage(date: Date): string {
  const next = nextTrainingDay(date);
  const workoutType = getWorkoutType(next);
  return `${formatDisplayDate(next)} - ${workoutType.toUpperCase()}`;
}

/**
 * Calculate current training streak (consecutive training days completed)
 */
export function getTrainingStreak(
  currentDate: Date,
  data: Record<string, { logged_at?: string }>
): number {
  let streak = 0;
  let checkDate = subDays(currentDate, 1); // Start from yesterday

  // Count backwards until we find a missed training day
  for (let i = 0; i < 365; i++) { // Max 1 year lookback
    if (!isTrainingDay(checkDate)) {
      // Rest day doesn't break streak
      checkDate = subDays(checkDate, 1);
      continue;
    }

    const key = formatDateKey(checkDate);
    if (data[key]?.logged_at) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else {
      // Found a missed training day, streak ends
      break;
    }
  }

  return streak;
}

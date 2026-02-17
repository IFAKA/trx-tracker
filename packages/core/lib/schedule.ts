import { getDay, addDays, startOfWeek } from 'date-fns';
import { TRAINING_DAYS } from './constants';
import { formatDateKey, formatDisplayDate } from './workout-utils';

export function isTrainingDay(date: Date): boolean {
  const day = getDay(date);
  // getDay: 0=Sun, 1=Mon... but TRAINING_DAYS uses same convention
  return (TRAINING_DAYS as readonly number[]).includes(day);
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
  const total = 3; // Mon, Wed, Fri

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
  return formatDisplayDate(next);
}

import { describe, it, expect } from 'vitest';
import {
  formatDateKey,
  getWeekNumber,
  getSetsForWeek,
  compareReps,
  getWeeklyStats,
} from '../workout-utils';
import { WorkoutData } from '../types';

describe('workout-utils', () => {
  describe('formatDateKey', () => {
    it('formats date as YYYY-MM-DD', () => {
      const date = new Date('2026-02-17T14:30:00Z');
      expect(formatDateKey(date)).toBe('2026-02-17');
    });
  });

  describe('getWeekNumber', () => {
    it('returns 1 when no first session', () => {
      const result = getWeekNumber(null, new Date('2026-02-17'));
      expect(result).toBe(1);
    });

    it('returns 1 for same week as first session', () => {
      const firstSession = '2026-02-16';
      const currentDate = new Date('2026-02-17');
      expect(getWeekNumber(firstSession, currentDate)).toBe(1);
    });

    it('returns 2 for one week after first session', () => {
      const firstSession = '2026-02-16';
      const currentDate = new Date('2026-02-23');
      expect(getWeekNumber(firstSession, currentDate)).toBe(2);
    });

    it('returns 5 for four weeks after first session', () => {
      const firstSession = '2026-02-16';
      const currentDate = new Date('2026-03-16');
      expect(getWeekNumber(firstSession, currentDate)).toBe(5);
    });
  });

  describe('getSetsForWeek', () => {
    it('returns 2 sets for week 1', () => {
      expect(getSetsForWeek(1)).toBe(2);
    });

    it('returns 2 sets for week 4', () => {
      expect(getSetsForWeek(4)).toBe(2);
    });

    it('returns 3 sets for week 5', () => {
      expect(getSetsForWeek(5)).toBe(3);
    });

    it('returns 3 sets for week 10', () => {
      expect(getSetsForWeek(10)).toBe(3);
    });
  });

  describe('compareReps', () => {
    it('returns "none" when no previous data', () => {
      const result = compareReps(10, null);
      expect(result).toEqual({ status: 'none', previousValue: null });
    });

    it('returns "improved" when current > previous', () => {
      const result = compareReps(12, 10);
      expect(result).toEqual({ status: 'improved', previousValue: 10 });
    });

    it('returns "decreased" when current < previous', () => {
      const result = compareReps(8, 10);
      expect(result).toEqual({ status: 'decreased', previousValue: 10 });
    });

    it('returns "same" when current = previous', () => {
      const result = compareReps(10, 10);
      expect(result).toEqual({ status: 'same', previousValue: 10 });
    });
  });

  describe('getWeeklyStats', () => {
    it('returns 0 sessions when no data', () => {
      const data: WorkoutData = {};
      const weekStart = new Date('2026-02-16'); // Monday

      const stats = getWeeklyStats(data, weekStart);

      expect(stats).toEqual({
        sessionsCompleted: 0,
        totalSets: 0,
        vsLastWeek: null,
      });
    });

    it('counts sessions and sets correctly', () => {
      const data: WorkoutData = {
        '2026-02-16': {
          pushup: [10, 8],
          plank: [20, 15],
          logged_at: '2026-02-16T10:00:00Z',
          week_number: 1,
        },
        '2026-02-18': {
          pushup: [12, 10],
          logged_at: '2026-02-18T10:00:00Z',
          week_number: 1,
        },
      };
      const weekStart = new Date('2026-02-16');

      const stats = getWeeklyStats(data, weekStart);

      expect(stats.sessionsCompleted).toBe(2);
      expect(stats.totalSets).toBe(6); // 4 sets + 2 sets
    });

    it('compares with previous week', () => {
      const data: WorkoutData = {
        // Previous week (1 session)
        '2026-02-09': {
          pushup: [10, 8],
          logged_at: '2026-02-09T10:00:00Z',
          week_number: 1,
        },
        // Current week (2 sessions)
        '2026-02-16': {
          pushup: [10, 8],
          logged_at: '2026-02-16T10:00:00Z',
          week_number: 1,
        },
        '2026-02-18': {
          pushup: [12, 10],
          logged_at: '2026-02-18T10:00:00Z',
          week_number: 1,
        },
      };
      const weekStart = new Date('2026-02-16');

      const stats = getWeeklyStats(data, weekStart);

      expect(stats.vsLastWeek).toBe(1); // 2 - 1 = +1
    });

    it('returns null vsLastWeek when no previous week data', () => {
      const data: WorkoutData = {
        '2026-02-16': {
          pushup: [10, 8],
          logged_at: '2026-02-16T10:00:00Z',
          week_number: 1,
        },
      };
      const weekStart = new Date('2026-02-16');

      const stats = getWeeklyStats(data, weekStart);

      expect(stats.vsLastWeek).toBe(null);
    });
  });
});

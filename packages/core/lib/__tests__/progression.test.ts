import { describe, it, expect } from 'vitest';
import { getTargets, shouldIncreaseDifficulty } from '../progression';
import { WorkoutData } from '../types';

describe('progression', () => {
  describe('getTargets', () => {
    it('returns default targets for first session (reps)', () => {
      const data: WorkoutData = {};
      const targets = getTargets('pushup', 1, new Date('2026-02-17'), data);

      expect(targets).toEqual([10, 8]); // Week 1-4: 2 sets
    });

    it('returns default targets for first session (seconds)', () => {
      const data: WorkoutData = {};
      const targets = getTargets('plank', 1, new Date('2026-02-17'), data);

      expect(targets).toEqual([20, 15]); // Plank defaults
    });

    it('adds 3rd set for week 5+', () => {
      const data: WorkoutData = {};
      const targets = getTargets('pushup', 5, new Date('2026-03-17'), data);

      expect(targets).toEqual([10, 8, 6]); // Week 5+: 3 sets
    });

    it('increases target when all sets hit previous target', () => {
      const data: WorkoutData = {
        '2026-02-15': {
          pushup: [10, 8], // Hit both targets
          logged_at: '2026-02-15T10:00:00Z',
          week_number: 1,
        },
      };

      const targets = getTargets('pushup', 1, new Date('2026-02-17'), data);

      expect(targets).toEqual([11, 9]); // Increased by +1
    });

    it('keeps same target when any set misses by 3+', () => {
      const data: WorkoutData = {
        '2026-02-15': {
          pushup: [10, 5], // Missed 2nd set by 3+
          logged_at: '2026-02-15T10:00:00Z',
          week_number: 1,
        },
      };

      const targets = getTargets('pushup', 1, new Date('2026-02-17'), data);

      expect(targets).toEqual([10, 8]); // Kept same (not increased)
    });

    it('keeps same target when some sets miss slightly', () => {
      const data: WorkoutData = {
        '2026-02-15': {
          pushup: [10, 7], // Missed 2nd set by 1
          logged_at: '2026-02-15T10:00:00Z',
          week_number: 1,
        },
      };

      const targets = getTargets('pushup', 1, new Date('2026-02-17'), data);

      expect(targets).toEqual([10, 8]); // Kept same
    });

    it('increases plank target by 5 seconds', () => {
      const data: WorkoutData = {
        '2026-02-15': {
          plank: [20, 18], // Hit both targets (default [20, 15], derived [20, 18])
          logged_at: '2026-02-15T10:00:00Z',
          week_number: 1,
        },
      };

      const targets = getTargets('plank', 1, new Date('2026-02-17'), data);

      expect(targets).toEqual([25, 23]); // +5 for seconds
    });

    it('handles transition from 2 sets to 3 sets (week 4 → 5)', () => {
      const data: WorkoutData = {
        '2026-02-15': {
          pushup: [12, 10], // 2 sets, hit targets
          logged_at: '2026-02-15T10:00:00Z',
          week_number: 4,
        },
      };

      const targets = getTargets('pushup', 5, new Date('2026-03-17'), data);

      expect(targets).toEqual([13, 11, 9]); // 3 sets now, increased
    });
  });

  describe('shouldIncreaseDifficulty', () => {
    it('returns true when all reps >= 15', () => {
      const data: WorkoutData = {
        '2026-02-15': {
          pushup: [15, 15],
          logged_at: '2026-02-15T10:00:00Z',
          week_number: 1,
        },
      };

      expect(shouldIncreaseDifficulty('pushup', data)).toBe(true);
    });

    it('returns false when any rep < 15', () => {
      const data: WorkoutData = {
        '2026-02-15': {
          pushup: [15, 14],
          logged_at: '2026-02-15T10:00:00Z',
          week_number: 1,
        },
      };

      expect(shouldIncreaseDifficulty('pushup', data)).toBe(false);
    });

    it('returns false for plank (seconds)', () => {
      const data: WorkoutData = {
        '2026-02-15': {
          plank: [60, 60],
          logged_at: '2026-02-15T10:00:00Z',
          week_number: 1,
        },
      };

      expect(shouldIncreaseDifficulty('plank', data)).toBe(false);
    });

    it('returns false when no data', () => {
      expect(shouldIncreaseDifficulty('pushup', {})).toBe(false);
    });
  });
});

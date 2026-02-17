import { describe, it, expect } from 'vitest';
import { isTrainingDay, nextTrainingDay, getTrainingDaysCompletedThisWeek } from '../schedule';

describe('schedule', () => {
  describe('isTrainingDay', () => {
    it('returns true for Monday', () => {
      const monday = new Date('2026-02-16'); // Monday
      expect(isTrainingDay(monday)).toBe(true);
    });

    it('returns true for Wednesday', () => {
      const wednesday = new Date('2026-02-18'); // Wednesday
      expect(isTrainingDay(wednesday)).toBe(true);
    });

    it('returns true for Friday', () => {
      const friday = new Date('2026-02-20'); // Friday
      expect(isTrainingDay(friday)).toBe(true);
    });

    it('returns false for Tuesday', () => {
      const tuesday = new Date('2026-02-17'); // Tuesday
      expect(isTrainingDay(tuesday)).toBe(false);
    });

    it('returns false for Saturday', () => {
      const saturday = new Date('2026-02-21'); // Saturday
      expect(isTrainingDay(saturday)).toBe(false);
    });

    it('returns false for Sunday', () => {
      const sunday = new Date('2026-02-22'); // Sunday
      expect(isTrainingDay(sunday)).toBe(false);
    });
  });

  describe('nextTrainingDay', () => {
    it('returns Monday when given Sunday', () => {
      const sunday = new Date('2026-02-22');
      const next = nextTrainingDay(sunday);
      expect(next.getDay()).toBe(1); // Monday
      expect(next.getDate()).toBe(23);
    });

    it('returns Wednesday when given Monday', () => {
      const monday = new Date('2026-02-16');
      const next = nextTrainingDay(monday);
      expect(next.getDay()).toBe(3); // Wednesday
      expect(next.getDate()).toBe(18);
    });

    it('returns Friday when given Wednesday', () => {
      const wednesday = new Date('2026-02-18');
      const next = nextTrainingDay(wednesday);
      expect(next.getDay()).toBe(5); // Friday
      expect(next.getDate()).toBe(20);
    });

    it('skips weekend to next Monday', () => {
      const friday = new Date('2026-02-20');
      const next = nextTrainingDay(friday);
      expect(next.getDay()).toBe(1); // Monday
      expect(next.getDate()).toBe(23);
    });
  });

  describe('getTrainingDaysCompletedThisWeek', () => {
    it('returns 0/3 when no workouts logged', () => {
      const monday = new Date('2026-02-16');
      const data = {};
      const result = getTrainingDaysCompletedThisWeek(monday, data);

      expect(result).toEqual({ completed: 0, total: 3 });
    });

    it('returns 1/3 when Monday logged', () => {
      const wednesday = new Date('2026-02-18');
      const data = {
        '2026-02-16': { logged_at: '2026-02-16T10:00:00Z' }, // Monday
      };
      const result = getTrainingDaysCompletedThisWeek(wednesday, data);

      expect(result).toEqual({ completed: 1, total: 3 });
    });

    it('returns 2/3 when Monday and Wednesday logged', () => {
      const friday = new Date('2026-02-20');
      const data = {
        '2026-02-16': { logged_at: '2026-02-16T10:00:00Z' }, // Monday
        '2026-02-18': { logged_at: '2026-02-18T10:00:00Z' }, // Wednesday
      };
      const result = getTrainingDaysCompletedThisWeek(friday, data);

      expect(result).toEqual({ completed: 2, total: 3 });
    });

    it('returns 3/3 when all training days logged', () => {
      const sunday = new Date('2026-02-22');
      const data = {
        '2026-02-16': { logged_at: '2026-02-16T10:00:00Z' }, // Monday
        '2026-02-18': { logged_at: '2026-02-18T10:00:00Z' }, // Wednesday
        '2026-02-20': { logged_at: '2026-02-20T10:00:00Z' }, // Friday
      };
      const result = getTrainingDaysCompletedThisWeek(sunday, data);

      expect(result).toEqual({ completed: 3, total: 3 });
    });

    it('ignores workouts from previous weeks', () => {
      const monday = new Date('2026-02-23');
      const data = {
        '2026-02-16': { logged_at: '2026-02-16T10:00:00Z' }, // Previous week
        '2026-02-23': { logged_at: '2026-02-23T10:00:00Z' }, // Current week
      };
      const result = getTrainingDaysCompletedThisWeek(monday, data);

      expect(result).toEqual({ completed: 1, total: 3 });
    });
  });
});

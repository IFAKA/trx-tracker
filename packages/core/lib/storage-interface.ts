/**
 * Storage Adapter Interface
 *
 * Platform-agnostic storage abstraction for TrainDaily workout data.
 *
 * Implementations:
 * - PWA: localStorage wrapper (lib/storage.ts)
 * - Desktop (Tauri): SQLite via Rust commands
 * - Mobile (React Native): AsyncStorage
 */

import { WorkoutData, WorkoutSession } from './types';

export interface StorageAdapter {
  /**
   * Load all workout data from storage
   * @returns Promise resolving to WorkoutData object
   */
  loadWorkoutData(): Promise<WorkoutData>;

  /**
   * Save a single workout session
   * @param dateKey - Date key in YYYY-MM-DD format
   * @param session - Workout session data
   */
  saveSession(dateKey: string, session: WorkoutSession): Promise<void>;

  /**
   * Get the date of the first recorded session
   * Used to calculate week numbers
   * @returns Promise resolving to date key or null
   */
  getFirstSessionDate(): Promise<string | null>;

  /**
   * Set the first session date (only called once)
   * @param dateKey - Date key in YYYY-MM-DD format
   */
  setFirstSessionDate(dateKey: string): Promise<void>;

  /**
   * Check if mobility flow was completed today
   * @param dateKey - Date key in YYYY-MM-DD format
   * @returns Promise resolving to boolean
   */
  getMobilityDone(dateKey: string): Promise<boolean>;

  /**
   * Mark mobility flow as completed for a date
   * @param dateKey - Date key in YYYY-MM-DD format
   */
  setMobilityDone(dateKey: string): Promise<void>;

  /**
   * Clear all workout data (for testing/reset)
   * Optional: not required for production use
   */
  clearAll?(): Promise<void>;
}

/**
 * Helper type for storage operations
 */
export type StorageKey =
  | 'traindaily_sessions'
  | 'traindaily_first_session'
  | 'traindaily_mobility_done';

/**
 * Validates a date key is in correct format (YYYY-MM-DD)
 */
export function isValidDateKey(dateKey: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateKey);
}

/**
 * Validates workout session data structure
 */
export function isValidSession(session: unknown): session is WorkoutSession {
  if (!session || typeof session !== 'object') return false;
  const s = session as Record<string, unknown>;

  // Must have logged_at and week_number
  if (typeof s.logged_at !== 'string' || typeof s.week_number !== 'number') {
    return false;
  }

  // Exercise data must be arrays of numbers
  for (const key of Object.keys(s)) {
    if (key === 'logged_at' || key === 'week_number') continue;

    const value = s[key];
    if (!Array.isArray(value)) return false;
    if (!value.every((v) => typeof v === 'number')) return false;
  }

  return true;
}

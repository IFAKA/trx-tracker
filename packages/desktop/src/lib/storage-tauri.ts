/**
 * Tauri Storage Adapter
 *
 * Implements StorageAdapter interface for Tauri desktop app
 * Uses Tauri commands to interact with Rust backend (SQLite)
 */

import { invoke } from '@tauri-apps/api/core';
import type { StorageAdapter, WorkoutData, WorkoutSession } from '@traindaily/core';

export class TauriStorageAdapter implements StorageAdapter {
  async loadWorkoutData(): Promise<WorkoutData> {
    try {
      const sessions = await invoke<Record<string, any>>('get_all_sessions');

      // Convert Rust types to TypeScript types
      const workoutData: WorkoutData = {};
      for (const [dateKey, session] of Object.entries(sessions)) {
        workoutData[dateKey] = session as WorkoutSession;
      }

      return workoutData;
    } catch (error) {
      console.error('Failed to load workout data:', error);
      return {};
    }
  }

  async saveSession(dateKey: string, session: WorkoutSession): Promise<void> {
    try {
      await invoke('save_session', { dateKey, session });
    } catch (error) {
      console.error('Failed to save session:', error);
      throw error;
    }
  }

  async getFirstSessionDate(): Promise<string | null> {
    try {
      const result = await invoke<string | null>('get_first_session_date');
      return result;
    } catch (error) {
      console.error('Failed to get first session date:', error);
      return null;
    }
  }

  async setFirstSessionDate(dateKey: string): Promise<void> {
    try {
      await invoke('set_first_session_date', { dateKey });
    } catch (error) {
      console.error('Failed to set first session date:', error);
    }
  }

  async getMobilityDone(dateKey: string): Promise<boolean> {
    // TODO: Implement mobility tracking in Rust backend
    return false;
  }

  async setMobilityDone(dateKey: string): Promise<void> {
    // TODO: Implement mobility tracking in Rust backend
  }
}

/**
 * Singleton instance
 */
let storageInstance: TauriStorageAdapter | null = null;

export function getStorage(): TauriStorageAdapter {
  if (!storageInstance) {
    storageInstance = new TauriStorageAdapter();
  }
  return storageInstance;
}

import { invoke } from '@tauri-apps/api/core';
import type { StorageAdapter, WorkoutData, WorkoutSession } from '@traindaily/core';

export const tauriStorage: StorageAdapter = {
  async loadWorkoutData(): Promise<WorkoutData> {
    try {
      return await invoke<WorkoutData>('get_all_sessions');
    } catch {
      return {};
    }
  },

  async saveSession(dateKey: string, session: WorkoutSession): Promise<void> {
    await invoke('save_session', { dateKey, session });
  },

  async getFirstSessionDate(): Promise<string | null> {
    try {
      return await invoke<string | null>('get_first_session_date');
    } catch {
      return null;
    }
  },

  async setFirstSessionDate(dateKey: string): Promise<void> {
    try {
      await invoke('set_first_session_date', { dateKey });
    } catch {}
  },

  async getMobilityDone(_dateKey: string): Promise<boolean> {
    return false;
  },

  async setMobilityDone(_dateKey: string): Promise<void> {},
};

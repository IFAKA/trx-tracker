// Storage wrapper for compatibility with PWA components
import { getStorage as getTauriStorage } from './storage-tauri';
import { invoke } from '@tauri-apps/api/core';
import { WorkoutData, WorkoutSession } from './types';

export async function getFirstSessionDate(): Promise<string | null> {
  try {
    return await invoke<string | null>('get_first_session_date');
  } catch (err) {
    console.error('Failed to get first session date:', err);
    return null;
  }
}

export async function setFirstSessionDate(dateKey: string): Promise<void> {
  try {
    await invoke('set_first_session_date', { dateKey });
  } catch (err) {
    console.error('Failed to set first session date:', err);
  }
}

export async function loadWorkoutData(): Promise<WorkoutData> {
  const storage = getTauriStorage();
  return storage.loadWorkoutData();
}

export async function saveWorkoutData(data: WorkoutData): Promise<void> {
  // Not used in new architecture (individual sessions saved via storage adapter)
  console.warn('saveWorkoutData is deprecated, use storage adapter instead');
}

// Re-export storage adapter for compatibility
export { getTauriStorage as getStorage };

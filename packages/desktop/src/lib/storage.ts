import { WorkoutData } from './types';
import { tauriStorage } from './storage-tauri';

export const loadWorkoutData = () => tauriStorage.loadWorkoutData();
export const getFirstSessionDate = () => tauriStorage.getFirstSessionDate();
export const setFirstSessionDate = (dateKey: string) => tauriStorage.setFirstSessionDate(dateKey);

export async function saveWorkoutData(data: WorkoutData): Promise<void> {
  for (const [dateKey, session] of Object.entries(data)) {
    await tauriStorage.saveSession(dateKey, session);
  }
}

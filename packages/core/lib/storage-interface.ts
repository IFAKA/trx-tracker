import { WorkoutData, WorkoutSession } from './types';

export interface StorageAdapter {
  loadWorkoutData(): Promise<WorkoutData>;
  saveSession(dateKey: string, session: WorkoutSession): Promise<void>;
  getFirstSessionDate(): Promise<string | null>;
  setFirstSessionDate(dateKey: string): Promise<void>;
  getMobilityDone(dateKey: string): Promise<boolean>;
  setMobilityDone(dateKey: string): Promise<void>;
  clearAll?(): Promise<void>;
}

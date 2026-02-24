import { WorkoutData, WorkoutSession } from './types';

export interface WorkoutDraft {
  exerciseIndex: number;
  currentSet: number;
  sessionReps: Record<string, number[]>;
  savedAt: number;
}

export interface StorageAdapter {
  loadWorkoutData(): Promise<WorkoutData>;
  saveSession(dateKey: string, session: WorkoutSession): Promise<void>;
  getFirstSessionDate(): Promise<string | null>;
  setFirstSessionDate(dateKey: string): Promise<void>;
  getMobilityDone(dateKey: string): Promise<boolean>;
  setMobilityDone(dateKey: string): Promise<void>;
  clearAll?(): Promise<void>;
  saveDraft?(dateKey: string, draft: WorkoutDraft): Promise<void>;
  loadDraft?(dateKey: string): Promise<WorkoutDraft | null>;
  clearDraft?(dateKey: string): Promise<void>;
}

export type ExerciseKey =
  | 'inverted_row'
  | 'single_arm_row'
  | 'pike_pushup'
  | 'face_pull'
  | 'pushup'
  | 'wall_lateral_raise'
  | 'plank';

export interface Exercise {
  key: ExerciseKey;
  name: string;
  unit: 'reps' | 'seconds';
  instruction: string;
}

export type WorkoutSession = {
  [K in ExerciseKey]?: number[];
} & {
  logged_at: string;
  week_number: number;
};

export interface WorkoutData {
  [dateKey: string]: WorkoutSession;
}

export interface ComparisonResult {
  status: 'improved' | 'decreased' | 'same' | 'none';
  previousValue: number | null;
}

export interface WeeklyStats {
  sessionsCompleted: number;
  totalSets: number;
  vsLastWeek: number | null; // difference in sessions
}

export type WorkoutState = 'idle' | 'exercising' | 'resting' | 'transitioning' | 'complete';

export interface MobilityExercise {
  name: string;
  duration: number; // seconds
  sides?: boolean; // if true, duration is per side
  instruction: string;
}

export interface MicroBreakExercise {
  name: string;
  duration: number;
  instruction: string;
}

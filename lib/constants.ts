import { Exercise, MobilityExercise, MicroBreakExercise } from './types';

export const EXERCISES: Exercise[] = [
  { key: 'inverted_row', name: 'TRX INVERTED ROW', unit: 'reps' },
  { key: 'single_arm_row', name: 'TRX SINGLE-ARM ROW', unit: 'reps' },
  { key: 'pike_pushup', name: 'TRX PIKE PUSH-UP', unit: 'reps' },
  { key: 'face_pull', name: 'TRX FACE PULL', unit: 'reps' },
  { key: 'pushup', name: 'PUSH-UPS', unit: 'reps' },
  { key: 'wall_lateral_raise', name: 'WALL LATERAL RAISE', unit: 'reps' },
  { key: 'plank', name: 'TRX PLANK', unit: 'seconds' },
];

export const STORAGE_KEY = 'trx_tracker_sessions';
export const FIRST_SESSION_KEY = 'trx_tracker_first_session';

export const REST_DURATION = 90; // seconds

export const DEFAULT_TARGETS_REPS = [10, 8] as const;
export const DEFAULT_TARGETS_PLANK = [20, 15] as const;

export const TRAINING_DAYS = [1, 3, 5] as const; // Mon, Wed, Fri (date-fns: 1=Mon)

export const MOBILITY_EXERCISES: MobilityExercise[] = [
  {
    name: 'HIP FLEXOR STRETCH',
    duration: 60,
    sides: true,
    instruction: 'Kneel on one knee, push hips forward. Hold.',
  },
  {
    name: 'CHEST DOORWAY STRETCH',
    duration: 60,
    sides: false,
    instruction: 'Arms on doorframe at 90°. Lean through. Hold.',
  },
  {
    name: 'THORACIC EXTENSION',
    duration: 60,
    sides: false,
    instruction: 'Drape back over TRX straps or foam roller. Arms overhead.',
  },
  {
    name: 'SHOULDER DISLOCATES',
    duration: 30,
    sides: false,
    instruction: 'Band or towel overhead, rotate behind back. Slow.',
  },
  {
    name: 'GLUTE BRIDGES',
    duration: 60,
    sides: false,
    instruction: 'Lying face up, squeeze glutes, lift hips. Hold 3s at top.',
  },
];

export const MICRO_BREAK_EXERCISES: MicroBreakExercise[] = [
  {
    name: 'WALL SLIDES',
    duration: 120,
    instruction: 'Back against wall, arms at 90°. Slide up and down slowly.',
  },
  {
    name: 'THORACIC ROTATION',
    duration: 120,
    instruction: 'On all fours, hand behind head. Rotate open. Alternate sides.',
  },
  {
    name: 'HIP FLEXOR STRETCH',
    duration: 120,
    instruction: 'Kneel on one knee, push hips forward. 60s each side.',
  },
  {
    name: 'CHEST DOORWAY STRETCH',
    duration: 120,
    instruction: 'Arms on doorframe at 90°. Lean through and hold.',
  },
];

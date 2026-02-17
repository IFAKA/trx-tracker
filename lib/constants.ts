import { Exercise, MobilityExercise, MicroBreakExercise } from './types';

export const EXERCISES: Exercise[] = [
  {
    key: 'inverted_row',
    name: 'TRX INVERTED ROW',
    unit: 'reps',
    instruction: 'Hang under TRX, body straight. Pull chest to handles, squeeze shoulder blades. Lower with control.',
    youtubeId: 'FyXAZW5zDhw',
  },
  {
    key: 'single_arm_row',
    name: 'TRX SINGLE-ARM ROW',
    unit: 'reps',
    instruction: 'One hand on TRX, other arm free. Pull chest to handle, rotate slightly. Do all reps then switch.',
    youtubeId: 'fZjzpiOJjpg',
  },
  {
    key: 'pike_pushup',
    name: 'TRX PIKE PUSH-UP',
    unit: 'reps',
    instruction: 'Feet in TRX cradles, pike hips up. Bend elbows, lower head toward floor. Press back up.',
    youtubeId: 'FnQYhyUzVpQ',
  },
  {
    key: 'face_pull',
    name: 'TRX FACE PULL',
    unit: 'reps',
    instruction: 'Lean back holding TRX. Pull handles to face, elbows high and wide. Squeeze rear delts.',
    youtubeId: 'zgZ7_o5aYlw',
  },
  {
    key: 'pushup',
    name: 'PUSH-UPS',
    unit: 'reps',
    instruction: 'Hands shoulder-width, body straight. Lower chest to floor, elbows at 45°. Push back up.',
    youtubeId: 'IODxDxX7oi4',
  },
  {
    key: 'wall_lateral_raise',
    name: 'WALL LATERAL RAISE',
    unit: 'reps',
    instruction: 'Stand with back flat against wall. Raise arms to sides up to shoulder height. Lower slowly.',
    youtubeId: 'HSBGLOLXmM0',
  },
  {
    key: 'plank',
    name: 'TRX PLANK',
    unit: 'seconds',
    instruction: 'Feet in TRX cradles, forearms on floor. Keep body straight, core tight. Hold position.',
    youtubeId: 'nLgeqEtm49M',
  },
];

export const STORAGE_KEY = 'traindaily_sessions';
export const FIRST_SESSION_KEY = 'traindaily_first_session';
export const MOBILITY_DONE_KEY = 'traindaily_mobility_done';

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
    youtubeId: 'iZ1eZBY4fwM',
  },
  {
    name: 'CHEST DOORWAY STRETCH',
    duration: 60,
    sides: false,
    instruction: 'Arms on doorframe at 90°. Lean through. Hold.',
    youtubeId: '8wiZpixdHPU',
  },
  {
    name: 'THORACIC EXTENSION',
    duration: 60,
    sides: false,
    instruction: 'Drape back over TRX straps or foam roller. Arms overhead.',
    youtubeId: 'SQF-0s1CckA',
  },
  {
    name: 'SHOULDER DISLOCATES',
    duration: 30,
    sides: false,
    instruction: 'Band or towel overhead, rotate behind back. Slow.',
    youtubeId: 'a9rqTzZaI7s',
  },
  {
    name: 'GLUTE BRIDGES',
    duration: 60,
    sides: false,
    instruction: 'Lying face up, squeeze glutes, lift hips. Hold 3s at top.',
    youtubeId: 'wPM8icPu6H8',
  },
];

export const MICRO_BREAK_EXERCISES: MicroBreakExercise[] = [
  {
    name: 'WALL SLIDES',
    duration: 120,
    instruction: 'Back against wall, arms at 90°. Slide up and down slowly.',
    youtubeId: 'oMSVe7PWJ3o',
  },
  {
    name: 'THORACIC ROTATION',
    duration: 120,
    instruction: 'On all fours, hand behind head. Rotate open. Alternate sides.',
    youtubeId: 'QWwiOHexU8I',
  },
  {
    name: 'HIP FLEXOR STRETCH',
    duration: 120,
    instruction: 'Kneel on one knee, push hips forward. 60s each side.',
    youtubeId: 'iZ1eZBY4fwM',
  },
  {
    name: 'CHEST DOORWAY STRETCH',
    duration: 120,
    instruction: 'Arms on doorframe at 90°. Lean through and hold.',
    youtubeId: '8wiZpixdHPU',
  },
];

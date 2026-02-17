import { Exercise, MobilityExercise, MicroBreakExercise } from './types';

// PUSH DAY EXERCISES
export const PUSH_EXERCISES: Exercise[] = [
  {
    key: 'trx_pushup',
    name: 'TRX PUSH-UP',
    unit: 'reps',
    instruction: 'Hands in TRX handles, body straight. Lower chest between handles, press back up. Harder than regular pushups.',
    youtubeId: 'IODxDxX7oi4',
    workoutType: 'push',
  },
  {
    key: 'pike_pushup',
    name: 'PIKE PUSH-UP',
    unit: 'reps',
    instruction: 'Pike position, hips high. Bend elbows, lower head toward floor. Press back up. Targets shoulders.',
    youtubeId: 'FnQYhyUzVpQ',
    workoutType: 'push',
  },
  {
    key: 'tricep_extension',
    name: 'TRX TRICEP EXTENSION',
    unit: 'reps',
    instruction: 'Face away from anchor, arms extended. Bend elbows, lower body. Extend arms. Keep elbows tight.',
    youtubeId: 'zgZ7_o5aYlw',
    workoutType: 'push',
  },
  {
    key: 'regular_pushup',
    name: 'REGULAR PUSH-UP',
    unit: 'reps',
    instruction: 'Hands shoulder-width, body straight. Lower chest to floor, elbows at 45°. Push back up.',
    youtubeId: 'IODxDxX7oi4',
    workoutType: 'push',
  },
];

// PULL DAY EXERCISES
export const PULL_EXERCISES: Exercise[] = [
  {
    key: 'trx_row',
    name: 'TRX ROW',
    unit: 'reps',
    instruction: 'Hang under TRX, body straight. Pull chest to handles, squeeze shoulder blades. Lower with control.',
    youtubeId: 'FyXAZW5zDhw',
    workoutType: 'pull',
  },
  {
    key: 'face_pull',
    name: 'TRX FACE PULL',
    unit: 'reps',
    instruction: 'Lean back holding TRX. Pull handles to face, elbows high and wide. Squeeze rear delts.',
    youtubeId: 'zgZ7_o5aYlw',
    workoutType: 'pull',
  },
  {
    key: 'bicep_curl',
    name: 'TRX BICEP CURL',
    unit: 'reps',
    instruction: 'Lean back, palms up. Curl handles to shoulders, keep elbows high. Lower with control.',
    youtubeId: 'fZjzpiOJjpg',
    workoutType: 'pull',
  },
  {
    key: 'inverted_row',
    name: 'INVERTED ROW',
    unit: 'reps',
    instruction: 'Under TRX, feet forward. Pull chest to handles, body straight. Harder angle = harder exercise.',
    youtubeId: 'FyXAZW5zDhw',
    workoutType: 'pull',
  },
];

// LEGS DAY EXERCISES
export const LEGS_EXERCISES: Exercise[] = [
  {
    key: 'bulgarian_split_squat',
    name: 'BULGARIAN SPLIT SQUAT',
    unit: 'reps',
    instruction: 'Rear foot elevated on chair/couch. Lower front knee to 90°. Press back up. Do all reps, switch legs.',
    youtubeId: 'FyXAZW5zDhw',
    workoutType: 'legs',
  },
  {
    key: 'pistol_squat_progression',
    name: 'PISTOL SQUAT PROGRESSION',
    unit: 'reps',
    instruction: 'One leg, hold TRX for balance. Lower slowly on one leg. Press back up. Switch legs each rep.',
    youtubeId: 'fZjzpiOJjpg',
    workoutType: 'legs',
  },
  {
    key: 'trx_hamstring_curl',
    name: 'TRX HAMSTRING CURL',
    unit: 'reps',
    instruction: 'Heels in TRX cradles, face up. Lift hips, curl heels to glutes. Extend legs. Keep hips up entire set.',
    youtubeId: 'FnQYhyUzVpQ',
    workoutType: 'legs',
  },
  {
    key: 'calf_raise',
    name: 'CALF RAISE',
    unit: 'reps',
    instruction: 'Stand on edge of step, hold TRX for balance. Raise up on toes. Lower heels below step. Full range.',
    youtubeId: 'zgZ7_o5aYlw',
    workoutType: 'legs',
  },
];

// All exercises combined
export const EXERCISES: Exercise[] = [...PUSH_EXERCISES, ...PULL_EXERCISES, ...LEGS_EXERCISES];

export const STORAGE_KEY = 'traindaily_sessions';
export const FIRST_SESSION_KEY = 'traindaily_first_session';
export const MOBILITY_DONE_KEY = 'traindaily_mobility_done';

export const REST_DURATION = 90; // seconds (90-120 sec range, starting at 90)

export const DEFAULT_TARGETS_REPS = [8, 8, 8] as const; // 3 sets of 8 reps to start

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

import { Pose } from './body-model';
import { ExerciseKey } from './types';

export interface ExerciseEnvironment {
  floor?: boolean;
  wall?: 'left' | 'right';
  trxAnchor?: { x: number; y: number };
  trxAttach?: 'hands' | 'feet';
}

export interface ExercisePoseData {
  startPose: Pose;
  endPose: Pose;
  environment: ExerciseEnvironment;
}

export const exercisePoses: Record<ExerciseKey, ExercisePoseData> = {
  // --- PUSH ---

  // TRX Push-Up: feet in TRX, body horizontal, arms push
  trx_pushup: {
    startPose: {
      bodyX: 80, bodyY: 110, bodyAngle: 85,
      shoulderL: 80, shoulderR: 80,
      elbowL: 0, elbowR: 0,
      hipL: 5, hipR: 5,
      kneeL: 0, kneeR: 0,
    },
    endPose: {
      bodyX: 80, bodyY: 120, bodyAngle: 85,
      shoulderL: 80, shoulderR: 80,
      elbowL: 90, elbowR: 90,
      hipL: 5, hipR: 5,
      kneeL: 0, kneeR: 0,
    },
    environment: {
      floor: true,
      trxAnchor: { x: 170, y: 15 },
      trxAttach: 'feet',
    },
  },

  // Pike Push-Up: body forms inverted V, head lowers toward floor
  pike_pushup: {
    startPose: {
      bodyX: 100, bodyY: 70, bodyAngle: 45,
      shoulderL: 80, shoulderR: 80,
      elbowL: 0, elbowR: 0,
      hipL: -100, hipR: -100,
      kneeL: 0, kneeR: 0,
    },
    endPose: {
      bodyX: 100, bodyY: 80, bodyAngle: 55,
      shoulderL: 70, shoulderR: 70,
      elbowL: 90, elbowR: 90,
      hipL: -100, hipR: -100,
      kneeL: 0, kneeR: 0,
    },
    environment: {
      floor: true,
    },
  },

  // Tricep Extension: standing, arms overhead pressing down
  tricep_extension: {
    startPose: {
      bodyX: 100, bodyY: 112, bodyAngle: 0,
      shoulderL: -160, shoulderR: -160,
      elbowL: 0, elbowR: 0,
      hipL: 0, hipR: 0,
      kneeL: 0, kneeR: 0,
    },
    endPose: {
      bodyX: 100, bodyY: 112, bodyAngle: 0,
      shoulderL: -160, shoulderR: -160,
      elbowL: 110, elbowR: 110,
      hipL: 0, hipR: 0,
      kneeL: 0, kneeR: 0,
    },
    environment: {
      floor: true,
      trxAnchor: { x: 100, y: 15 },
      trxAttach: 'hands',
    },
  },

  // Regular Push-Up: horizontal on floor, arms push up/down
  regular_pushup: {
    startPose: {
      bodyX: 80, bodyY: 110, bodyAngle: 85,
      shoulderL: 80, shoulderR: 80,
      elbowL: 0, elbowR: 0,
      hipL: 5, hipR: 5,
      kneeL: 0, kneeR: 0,
    },
    endPose: {
      bodyX: 80, bodyY: 120, bodyAngle: 85,
      shoulderL: 80, shoulderR: 80,
      elbowL: 90, elbowR: 90,
      hipL: 5, hipR: 5,
      kneeL: 0, kneeR: 0,
    },
    environment: {
      floor: true,
    },
  },

  // --- PULL ---

  // TRX Row: body nearly horizontal under TRX, arms pull
  trx_row: {
    startPose: {
      bodyX: 100, bodyY: 110, bodyAngle: 75,
      shoulderL: -10, shoulderR: -10,
      elbowL: 0, elbowR: 0,
      hipL: 5, hipR: 5,
      kneeL: 0, kneeR: 0,
    },
    endPose: {
      bodyX: 100, bodyY: 100, bodyAngle: 75,
      shoulderL: -50, shoulderR: -50,
      elbowL: 120, elbowR: 120,
      hipL: 5, hipR: 5,
      kneeL: 0, kneeR: 0,
    },
    environment: {
      floor: true,
      trxAnchor: { x: 100, y: 15 },
      trxAttach: 'hands',
    },
  },

  // Face Pull: standing leaned back ~25°, arms pull handles to face
  face_pull: {
    startPose: {
      bodyX: 105, bodyY: 110, bodyAngle: 20,
      shoulderL: 30, shoulderR: 30,
      elbowL: 0, elbowR: 0,
      hipL: -10, hipR: -10,
      kneeL: 5, kneeR: 5,
    },
    endPose: {
      bodyX: 100, bodyY: 105, bodyAngle: 12,
      shoulderL: -40, shoulderR: -40,
      elbowL: 140, elbowR: 140,
      hipL: -10, hipR: -10,
      kneeL: 5, kneeR: 5,
    },
    environment: {
      floor: true,
      trxAnchor: { x: 90, y: 15 },
      trxAttach: 'hands',
    },
  },

  // Bicep Curl: standing, arms curl TRX handles up
  bicep_curl: {
    startPose: {
      bodyX: 105, bodyY: 112, bodyAngle: 15,
      shoulderL: 20, shoulderR: 20,
      elbowL: 0, elbowR: 0,
      hipL: -5, hipR: -5,
      kneeL: 5, kneeR: 5,
    },
    endPose: {
      bodyX: 100, bodyY: 108, bodyAngle: 8,
      shoulderL: 20, shoulderR: 20,
      elbowL: 130, elbowR: 130,
      hipL: -5, hipR: -5,
      kneeL: 5, kneeR: 5,
    },
    environment: {
      floor: true,
      trxAnchor: { x: 100, y: 15 },
      trxAttach: 'hands',
    },
  },

  // Inverted Row: body horizontal under bar, arms pull from extended to bent
  inverted_row: {
    startPose: {
      bodyX: 100, bodyY: 110, bodyAngle: 75,
      shoulderL: -10, shoulderR: -10,
      elbowL: 0, elbowR: 0,
      hipL: 5, hipR: 5,
      kneeL: 0, kneeR: 0,
    },
    endPose: {
      bodyX: 100, bodyY: 100, bodyAngle: 75,
      shoulderL: -50, shoulderR: -50,
      elbowL: 120, elbowR: 120,
      hipL: 5, hipR: 5,
      kneeL: 0, kneeR: 0,
    },
    environment: {
      floor: true,
      trxAnchor: { x: 100, y: 15 },
      trxAttach: 'hands',
    },
  },

  // --- LEGS ---

  // Bulgarian Split Squat: rear foot elevated, front leg squats
  bulgarian_split_squat: {
    startPose: {
      bodyX: 100, bodyY: 108, bodyAngle: 5,
      shoulderL: 5, shoulderR: 5,
      elbowL: 40, elbowR: 40,
      hipL: -10, hipR: -10,
      kneeL: 0, kneeR: 0,
    },
    endPose: {
      bodyX: 100, bodyY: 118, bodyAngle: 8,
      shoulderL: 5, shoulderR: 5,
      elbowL: 40, elbowR: 40,
      hipL: -40, hipR: -40,
      kneeL: 80, kneeR: 80,
    },
    environment: {
      floor: true,
    },
  },

  // Pistol Squat Progression: single-leg squat, other leg extended
  pistol_squat_progression: {
    startPose: {
      bodyX: 100, bodyY: 108, bodyAngle: 5,
      shoulderL: 30, shoulderR: 30,
      elbowL: 0, elbowR: 0,
      hipL: -5, hipR: -5,
      kneeL: 0, kneeR: 0,
    },
    endPose: {
      bodyX: 100, bodyY: 120, bodyAngle: 15,
      shoulderL: 30, shoulderR: 30,
      elbowL: 0, elbowR: 0,
      hipL: -50, hipR: 30,
      kneeL: 100, kneeR: 0,
    },
    environment: {
      floor: true,
      trxAnchor: { x: 100, y: 15 },
      trxAttach: 'hands',
    },
  },

  // TRX Hamstring Curl: lying on floor, feet in TRX, curl heels to glutes
  trx_hamstring_curl: {
    startPose: {
      bodyX: 85, bodyY: 112, bodyAngle: 88,
      shoulderL: 5, shoulderR: 5,
      elbowL: 0, elbowR: 0,
      hipL: 5, hipR: 5,
      kneeL: 0, kneeR: 0,
    },
    endPose: {
      bodyX: 85, bodyY: 108, bodyAngle: 75,
      shoulderL: 5, shoulderR: 5,
      elbowL: 0, elbowR: 0,
      hipL: -20, hipR: -20,
      kneeL: 110, kneeR: 110,
    },
    environment: {
      floor: true,
      trxAnchor: { x: 170, y: 15 },
      trxAttach: 'feet',
    },
  },

  // Calf Raise: standing, rise onto toes
  calf_raise: {
    startPose: {
      bodyX: 100, bodyY: 115, bodyAngle: 0,
      shoulderL: 5, shoulderR: 5,
      elbowL: 0, elbowR: 0,
      hipL: 0, hipR: 0,
      kneeL: 0, kneeR: 0,
    },
    endPose: {
      bodyX: 100, bodyY: 110, bodyAngle: 0,
      shoulderL: 5, shoulderR: 5,
      elbowL: 0, elbowR: 0,
      hipL: 0, hipR: 0,
      kneeL: 0, kneeR: 0,
    },
    environment: {
      floor: true,
    },
  },
};

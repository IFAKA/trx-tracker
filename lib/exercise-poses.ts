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
  // PUSH DAY EXERCISES

  // TRX Push-Up: hands in TRX handles, harder than regular pushup
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
      trxAnchor: { x: 120, y: 15 },
      trxAttach: 'hands',
    },
  },

  // Pike Push-Up: body forms inverted V, head lowers
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

  // TRX Tricep Extension: facing away, elbows bend/extend
  tricep_extension: {
    startPose: {
      bodyX: 90, bodyY: 105, bodyAngle: 70,
      shoulderL: 120, shoulderR: 120,
      elbowL: 0, elbowR: 0,
      hipL: 5, hipR: 5,
      kneeL: 0, kneeR: 0,
    },
    endPose: {
      bodyX: 95, bodyY: 115, bodyAngle: 75,
      shoulderL: 120, shoulderR: 120,
      elbowL: 110, elbowR: 110,
      hipL: 5, hipR: 5,
      kneeL: 0, kneeR: 0,
    },
    environment: {
      floor: true,
      trxAnchor: { x: 70, y: 15 },
      trxAttach: 'hands',
    },
  },

  // Regular Push-Up: horizontal on floor
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

  // PULL DAY EXERCISES

  // TRX Row: body nearly horizontal under TRX
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

  // Face Pull: standing leaned back, pull to face
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

  // TRX Bicep Curl: leaned back, palms up, curl
  bicep_curl: {
    startPose: {
      bodyX: 105, bodyY: 115, bodyAngle: 50,
      shoulderL: 10, shoulderR: 10,
      elbowL: 0, elbowR: 0,
      hipL: 5, hipR: 5,
      kneeL: 10, kneeR: 10,
    },
    endPose: {
      bodyX: 100, bodyY: 108, bodyAngle: 45,
      shoulderL: 10, shoulderR: 10,
      elbowL: 130, elbowR: 130,
      hipL: 5, hipR: 5,
      kneeL: 10, kneeR: 10,
    },
    environment: {
      floor: true,
      trxAnchor: { x: 90, y: 15 },
      trxAttach: 'hands',
    },
  },

  // Inverted Row: body horizontal, harder variation
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

  // LEGS DAY EXERCISES

  // Bulgarian Split Squat: rear foot elevated, single leg squat
  bulgarian_split_squat: {
    startPose: {
      bodyX: 100, bodyY: 100, bodyAngle: 0,
      shoulderL: 0, shoulderR: 0,
      elbowL: 0, elbowR: 0,
      hipL: 0, hipR: 35,
      kneeL: 0, kneeR: 70,
    },
    endPose: {
      bodyX: 100, bodyY: 115, bodyAngle: 5,
      shoulderL: 0, shoulderR: 0,
      elbowL: 0, elbowR: 0,
      hipL: 90, hipR: 35,
      kneeL: 90, kneeR: 70,
    },
    environment: {
      floor: true,
    },
  },

  // Pistol Squat Progression: one leg, TRX-assisted
  pistol_squat_progression: {
    startPose: {
      bodyX: 100, bodyY: 105, bodyAngle: 10,
      shoulderL: 20, shoulderR: 20,
      elbowL: 0, elbowR: 0,
      hipL: 0, hipR: 45,
      kneeL: 0, kneeR: 0,
    },
    endPose: {
      bodyX: 105, bodyY: 125, bodyAngle: 20,
      shoulderL: 10, shoulderR: 10,
      elbowL: 0, elbowR: 0,
      hipL: 100, hipR: 45,
      kneeL: 110, kneeR: 0,
    },
    environment: {
      floor: true,
      trxAnchor: { x: 95, y: 15 },
      trxAttach: 'hands',
    },
  },

  // TRX Hamstring Curl: face up, heels in TRX, curl
  trx_hamstring_curl: {
    startPose: {
      bodyX: 100, bodyY: 95, bodyAngle: -85,
      shoulderL: -10, shoulderR: -10,
      elbowL: 0, elbowR: 0,
      hipL: -5, hipR: -5,
      kneeL: 0, kneeR: 0,
    },
    endPose: {
      bodyX: 100, bodyY: 95, bodyAngle: -85,
      shoulderL: -10, shoulderR: -10,
      elbowL: 0, elbowR: 0,
      hipL: -5, hipR: -5,
      kneeL: 90, kneeR: 90,
    },
    environment: {
      floor: true,
      trxAnchor: { x: 140, y: 15 },
      trxAttach: 'feet',
    },
  },

  // Calf Raise: stand on edge, raise on toes
  calf_raise: {
    startPose: {
      bodyX: 100, bodyY: 110, bodyAngle: 0,
      shoulderL: 5, shoulderR: 5,
      elbowL: 0, elbowR: 0,
      hipL: 0, hipR: 0,
      kneeL: 0, kneeR: 0,
    },
    endPose: {
      bodyX: 100, bodyY: 105, bodyAngle: 0,
      shoulderL: 5, shoulderR: 5,
      elbowL: 0, elbowR: 0,
      hipL: 0, hipR: 0,
      kneeL: 0, kneeR: 0,
    },
    environment: {
      floor: true,
      trxAnchor: { x: 95, y: 15 },
      trxAttach: 'hands',
    },
  },
};

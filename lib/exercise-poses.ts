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
  // Inverted Row: body nearly horizontal under TRX, arms pull from extended to bent
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

  // Single-Arm Row: leaned back at ~40°, one arm pulls
  single_arm_row: {
    startPose: {
      bodyX: 105, bodyY: 115, bodyAngle: 50,
      shoulderL: -5, shoulderR: 10,
      elbowL: 0, elbowR: 5,
      hipL: 5, hipR: 5,
      kneeL: 10, kneeR: 10,
    },
    endPose: {
      bodyX: 100, bodyY: 108, bodyAngle: 45,
      shoulderL: -55, shoulderR: 10,
      elbowL: 130, elbowR: 5,
      hipL: 5, hipR: 5,
      kneeL: 10, kneeR: 10,
    },
    environment: {
      floor: true,
      trxAnchor: { x: 90, y: 15 },
      trxAttach: 'hands',
    },
  },

  // Pike Push-Up: feet in TRX, body forms inverted V, head lowers
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
      trxAnchor: { x: 170, y: 15 },
      trxAttach: 'feet',
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

  // Push-Up: horizontal on floor, arms push up/down
  pushup: {
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

  // Wall Lateral Raise: standing against wall, arms raise to sides
  wall_lateral_raise: {
    startPose: {
      bodyX: 100, bodyY: 112, bodyAngle: 0,
      shoulderL: 5, shoulderR: 5,
      elbowL: 0, elbowR: 0,
      hipL: 0, hipR: 0,
      kneeL: 0, kneeR: 0,
    },
    endPose: {
      bodyX: 100, bodyY: 112, bodyAngle: 0,
      shoulderL: -80, shoulderR: -80,
      elbowL: 0, elbowR: 0,
      hipL: 0, hipR: 0,
      kneeL: 0, kneeR: 0,
    },
    environment: {
      floor: true,
      wall: 'right',
    },
  },

  // Plank: feet in TRX, forearms on floor, body straight
  plank: {
    startPose: {
      bodyX: 85, bodyY: 105, bodyAngle: 82,
      shoulderL: 70, shoulderR: 70,
      elbowL: 100, elbowR: 100,
      hipL: 5, hipR: 5,
      kneeL: 0, kneeR: 0,
    },
    endPose: {
      bodyX: 85, bodyY: 103, bodyAngle: 80,
      shoulderL: 72, shoulderR: 72,
      elbowL: 100, elbowR: 100,
      hipL: 5, hipR: 5,
      kneeL: 0, kneeR: 0,
    },
    environment: {
      floor: true,
      trxAnchor: { x: 170, y: 15 },
      trxAttach: 'feet',
    },
  },
};

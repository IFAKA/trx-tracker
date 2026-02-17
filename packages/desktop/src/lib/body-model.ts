// Fixed body proportions in SVG units
export const HEAD_RADIUS = 7;
export const NECK_LENGTH = 4;
export const TORSO_LENGTH = 30;
export const UPPER_ARM_LENGTH = 18;
export const FOREARM_LENGTH = 16;
export const UPPER_LEG_LENGTH = 22;
export const LOWER_LEG_LENGTH = 20;
export const JOINT_RADIUS = 2.5;

export interface Pose {
  bodyX: number;
  bodyY: number;
  bodyAngle: number; // degrees, 0 = upright, 90 = horizontal facing right
  shoulderL: number; // angle from torso axis (degrees)
  shoulderR: number;
  elbowL: number; // angle at elbow (degrees, 0 = straight)
  elbowR: number;
  hipL: number; // angle from torso axis
  hipR: number;
  kneeL: number; // angle at knee (0 = straight)
  kneeR: number;
}

export interface JointPositions {
  hip: [number, number];
  shoulder: [number, number];
  neck: [number, number];
  head: [number, number];
  shoulderL: [number, number];
  elbowL: [number, number];
  handL: [number, number];
  shoulderR: [number, number];
  elbowR: [number, number];
  handR: [number, number];
  hipL: [number, number];
  kneeL: [number, number];
  footL: [number, number];
  hipR: [number, number];
  kneeR: [number, number];
  footR: [number, number];
}

function deg2rad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Calculate all joint positions from a pose.
 * Body angle: 0 = upright (head up), 90 = lying right, -90 = lying left
 * Limb angles are relative to the torso direction.
 */
export function calculatePositions(pose: Pose): JointPositions {
  const { bodyX, bodyY, bodyAngle } = pose;
  const bodyRad = deg2rad(bodyAngle);

  // Torso direction: from hip toward shoulder (opposite of gravity when upright)
  // When bodyAngle=0 (upright), torso points up (negative Y in SVG)
  const torsoDir = bodyRad - Math.PI / 2; // -90deg offset so 0 = up

  // Hip is the anchor
  const hip: [number, number] = [bodyX, bodyY];

  // Shoulder is at the top of the torso
  const shoulder: [number, number] = [
    hip[0] + Math.cos(torsoDir) * TORSO_LENGTH,
    hip[1] + Math.sin(torsoDir) * TORSO_LENGTH,
  ];

  // Neck
  const neck: [number, number] = [
    shoulder[0] + Math.cos(torsoDir) * NECK_LENGTH,
    shoulder[1] + Math.sin(torsoDir) * NECK_LENGTH,
  ];

  // Head
  const head: [number, number] = [
    neck[0] + Math.cos(torsoDir) * HEAD_RADIUS,
    neck[1] + Math.sin(torsoDir) * HEAD_RADIUS,
  ];

  // Arms - angles relative to torso, positive = forward/down
  // Left arm
  const lArmAngle = torsoDir + Math.PI + deg2rad(pose.shoulderL); // hang from shoulder
  const shoulderL = shoulder; // same position as shoulder
  const elbowL: [number, number] = [
    shoulder[0] + Math.cos(lArmAngle) * UPPER_ARM_LENGTH,
    shoulder[1] + Math.sin(lArmAngle) * UPPER_ARM_LENGTH,
  ];
  const lForearmAngle = lArmAngle + deg2rad(pose.elbowL);
  const handL: [number, number] = [
    elbowL[0] + Math.cos(lForearmAngle) * FOREARM_LENGTH,
    elbowL[1] + Math.sin(lForearmAngle) * FOREARM_LENGTH,
  ];

  // Right arm
  const rArmAngle = torsoDir + Math.PI + deg2rad(pose.shoulderR);
  const shoulderR = shoulder;
  const elbowR: [number, number] = [
    shoulder[0] + Math.cos(rArmAngle) * UPPER_ARM_LENGTH,
    shoulder[1] + Math.sin(rArmAngle) * UPPER_ARM_LENGTH,
  ];
  const rForearmAngle = rArmAngle + deg2rad(pose.elbowR);
  const handR: [number, number] = [
    elbowR[0] + Math.cos(rForearmAngle) * FOREARM_LENGTH,
    elbowR[1] + Math.sin(rForearmAngle) * FOREARM_LENGTH,
  ];

  // Legs - angles relative to torso, positive = forward
  // Left leg
  const lLegAngle = torsoDir + Math.PI + deg2rad(pose.hipL);
  const hipL = hip;
  const kneeL: [number, number] = [
    hip[0] + Math.cos(lLegAngle) * UPPER_LEG_LENGTH,
    hip[1] + Math.sin(lLegAngle) * UPPER_LEG_LENGTH,
  ];
  const lShinAngle = lLegAngle - deg2rad(pose.kneeL);
  const footL: [number, number] = [
    kneeL[0] + Math.cos(lShinAngle) * LOWER_LEG_LENGTH,
    kneeL[1] + Math.sin(lShinAngle) * LOWER_LEG_LENGTH,
  ];

  // Right leg
  const rLegAngle = torsoDir + Math.PI + deg2rad(pose.hipR);
  const hipR = hip;
  const kneeR: [number, number] = [
    hip[0] + Math.cos(rLegAngle) * UPPER_LEG_LENGTH,
    hip[1] + Math.sin(rLegAngle) * UPPER_LEG_LENGTH,
  ];
  const rShinAngle = rLegAngle - deg2rad(pose.kneeR);
  const footR: [number, number] = [
    kneeR[0] + Math.cos(rShinAngle) * LOWER_LEG_LENGTH,
    kneeR[1] + Math.sin(rShinAngle) * LOWER_LEG_LENGTH,
  ];

  return {
    hip, shoulder, neck, head,
    shoulderL, elbowL, handL,
    shoulderR, elbowR, handR,
    hipL, kneeL, footL,
    hipR, kneeR, footR,
  };
}

/** Linearly interpolate between two poses */
export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const lerp = (v1: number, v2: number) => v1 + (v2 - v1) * t;
  return {
    bodyX: lerp(a.bodyX, b.bodyX),
    bodyY: lerp(a.bodyY, b.bodyY),
    bodyAngle: lerp(a.bodyAngle, b.bodyAngle),
    shoulderL: lerp(a.shoulderL, b.shoulderL),
    shoulderR: lerp(a.shoulderR, b.shoulderR),
    elbowL: lerp(a.elbowL, b.elbowL),
    elbowR: lerp(a.elbowR, b.elbowR),
    hipL: lerp(a.hipL, b.hipL),
    hipR: lerp(a.hipR, b.hipR),
    kneeL: lerp(a.kneeL, b.kneeL),
    kneeR: lerp(a.kneeR, b.kneeR),
  };
}

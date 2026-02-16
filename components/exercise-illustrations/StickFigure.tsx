'use client';

import { Pose, calculatePositions, HEAD_RADIUS, JOINT_RADIUS } from '@/lib/body-model';

interface StickFigureProps {
  pose: Pose;
  opacity?: number;
  className?: string;
}

export function StickFigure({ pose, opacity = 1, className }: StickFigureProps) {
  const pos = calculatePositions(pose);

  return (
    <g opacity={opacity} className={className} strokeLinecap="round" strokeLinejoin="round">
      {/* Head */}
      <circle
        cx={pos.head[0]}
        cy={pos.head[1]}
        r={HEAD_RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
      />

      {/* Neck */}
      <line
        x1={pos.neck[0]} y1={pos.neck[1]}
        x2={pos.shoulder[0]} y2={pos.shoulder[1]}
        stroke="currentColor" strokeWidth={2.5}
      />

      {/* Torso */}
      <line
        x1={pos.shoulder[0]} y1={pos.shoulder[1]}
        x2={pos.hip[0]} y2={pos.hip[1]}
        stroke="currentColor" strokeWidth={2.5}
      />

      {/* Left arm */}
      <line
        x1={pos.shoulderL[0]} y1={pos.shoulderL[1]}
        x2={pos.elbowL[0]} y2={pos.elbowL[1]}
        stroke="currentColor" strokeWidth={2.5}
      />
      <line
        x1={pos.elbowL[0]} y1={pos.elbowL[1]}
        x2={pos.handL[0]} y2={pos.handL[1]}
        stroke="currentColor" strokeWidth={2.5}
      />

      {/* Right arm */}
      <line
        x1={pos.shoulderR[0]} y1={pos.shoulderR[1]}
        x2={pos.elbowR[0]} y2={pos.elbowR[1]}
        stroke="currentColor" strokeWidth={2.5}
      />
      <line
        x1={pos.elbowR[0]} y1={pos.elbowR[1]}
        x2={pos.handR[0]} y2={pos.handR[1]}
        stroke="currentColor" strokeWidth={2.5}
      />

      {/* Left leg */}
      <line
        x1={pos.hipL[0]} y1={pos.hipL[1]}
        x2={pos.kneeL[0]} y2={pos.kneeL[1]}
        stroke="currentColor" strokeWidth={2.5}
      />
      <line
        x1={pos.kneeL[0]} y1={pos.kneeL[1]}
        x2={pos.footL[0]} y2={pos.footL[1]}
        stroke="currentColor" strokeWidth={2.5}
      />

      {/* Right leg */}
      <line
        x1={pos.hipR[0]} y1={pos.hipR[1]}
        x2={pos.kneeR[0]} y2={pos.kneeR[1]}
        stroke="currentColor" strokeWidth={2.5}
      />
      <line
        x1={pos.kneeR[0]} y1={pos.kneeR[1]}
        x2={pos.footR[0]} y2={pos.footR[1]}
        stroke="currentColor" strokeWidth={2.5}
      />

      {/* Joint dots */}
      {[pos.shoulder, pos.hip, pos.elbowL, pos.elbowR, pos.kneeL, pos.kneeR].map(
        ([x, y], i) => (
          <circle
            key={i}
            cx={x} cy={y}
            r={JOINT_RADIUS}
            fill="currentColor"
          />
        )
      )}
    </g>
  );
}

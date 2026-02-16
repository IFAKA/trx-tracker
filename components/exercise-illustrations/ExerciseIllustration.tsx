'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ExerciseKey } from '@/lib/types';
import { Pose, lerpPose, calculatePositions } from '@/lib/body-model';
import { exercisePoses } from '@/lib/exercise-poses';
import { StickFigure } from './StickFigure';

interface ExerciseIllustrationProps {
  exerciseKey: ExerciseKey;
}

export function ExerciseIllustration({ exerciseKey }: ExerciseIllustrationProps) {
  const data = exercisePoses[exerciseKey];
  const [currentPose, setCurrentPose] = useState<Pose>(data.startPose);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const animate = useCallback((time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const elapsed = time - startTimeRef.current;
    const duration = 3000; // 3s full cycle
    // Sine wave for smooth ping-pong
    const t = (Math.sin((elapsed / duration) * Math.PI * 2 - Math.PI / 2) + 1) / 2;
    setCurrentPose(lerpPose(data.startPose, data.endPose, t));
    rafRef.current = requestAnimationFrame(animate);
  }, [data.startPose, data.endPose]);

  useEffect(() => {
    if (reducedMotionRef.current) {
      // Show midpoint for reduced motion
      setCurrentPose(lerpPose(data.startPose, data.endPose, 0.5));
      return;
    }
    startTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate, data.startPose, data.endPose]);

  const { environment } = data;
  const currentPositions = calculatePositions(currentPose);

  // Calculate TRX strap endpoints
  let trxLines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  if (environment.trxAnchor) {
    const anchor = environment.trxAnchor;
    if (environment.trxAttach === 'hands') {
      trxLines = [
        { x1: anchor.x - 3, y1: anchor.y, x2: currentPositions.handL[0], y2: currentPositions.handL[1] },
        { x1: anchor.x + 3, y1: anchor.y, x2: currentPositions.handR[0], y2: currentPositions.handR[1] },
      ];
    } else if (environment.trxAttach === 'feet') {
      trxLines = [
        { x1: anchor.x - 3, y1: anchor.y, x2: currentPositions.footL[0], y2: currentPositions.footL[1] },
        { x1: anchor.x + 3, y1: anchor.y, x2: currentPositions.footR[0], y2: currentPositions.footR[1] },
      ];
    }
  }

  return (
    <div className="flex justify-center">
      <svg
        viewBox="0 0 200 150"
        className="max-w-[240px] w-full"
        role="img"
        aria-label={`Exercise illustration for ${exerciseKey.replace(/_/g, ' ')}`}
      >
        {/* Environment */}
        {environment.floor && (
          <line
            x1={0} y1={140} x2={200} y2={140}
            className="stroke-muted-foreground/30"
            strokeWidth={1}
          />
        )}
        {environment.wall === 'left' && (
          <line
            x1={20} y1={20} x2={20} y2={140}
            className="stroke-muted-foreground/30"
            strokeWidth={1}
          />
        )}
        {environment.wall === 'right' && (
          <line
            x1={180} y1={20} x2={180} y2={140}
            className="stroke-muted-foreground/30"
            strokeWidth={1}
          />
        )}

        {/* TRX anchor point */}
        {environment.trxAnchor && (
          <>
            {/* Anchor bar */}
            <line
              x1={environment.trxAnchor.x - 8}
              y1={environment.trxAnchor.y}
              x2={environment.trxAnchor.x + 8}
              y2={environment.trxAnchor.y}
              className="stroke-muted-foreground/30"
              strokeWidth={2}
            />
            {/* Straps */}
            {trxLines.map((line, i) => (
              <line
                key={i}
                x1={line.x1} y1={line.y1}
                x2={line.x2} y2={line.y2}
                className="text-amber-500"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeDasharray="4 2"
              />
            ))}
            {/* Handles/cradles */}
            {trxLines.map((line, i) => (
              <circle
                key={`h${i}`}
                cx={line.x2} cy={line.y2}
                r={2}
                className="text-amber-500"
                fill="currentColor"
              />
            ))}
          </>
        )}

        {/* Ghost pose (start position) */}
        <StickFigure pose={data.startPose} opacity={0.2} />

        {/* Animated pose */}
        <g className="text-foreground">
          <StickFigure pose={currentPose} />
        </g>
      </svg>
    </div>
  );
}

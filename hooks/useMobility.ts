'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MOBILITY_EXERCISES } from '@/lib/constants';

export function useMobility() {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [side, setSide] = useState<'left' | 'right' | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const exercise = MOBILITY_EXERCISES[exerciseIndex];

  const startMobility = useCallback(() => {
    setExerciseIndex(0);
    setIsComplete(false);
    const first = MOBILITY_EXERCISES[0];
    setTimer(first.duration);
    setSide(first.sides ? 'left' : null);
    setIsActive(true);
  }, []);

  useEffect(() => {
    if (isActive && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }

    if (isActive && timer === 0) {
      // Advance
      if (exercise?.sides && side === 'left') {
        // Switch to right side
        setSide('right');
        setTimer(exercise.duration);
      } else {
        // Next exercise
        const next = exerciseIndex + 1;
        if (next < MOBILITY_EXERCISES.length) {
          setExerciseIndex(next);
          const nextEx = MOBILITY_EXERCISES[next];
          setTimer(nextEx.duration);
          setSide(nextEx.sides ? 'left' : null);
        } else {
          setIsActive(false);
          setIsComplete(true);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, timer]);

  const skip = useCallback(() => {
    setTimer(0);
  }, []);

  return {
    exercise,
    exerciseIndex,
    timer,
    side,
    isActive,
    isComplete,
    totalExercises: MOBILITY_EXERCISES.length,
    startMobility,
    skip,
  };
}

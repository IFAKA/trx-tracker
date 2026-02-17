'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MOBILITY_EXERCISES, MOBILITY_DONE_KEY } from '@/lib/constants';
import { formatDateKey } from '@/lib/workout-utils';
import { unlockAudio, playStart, playCountdownTick, playNextExercise, playSkip, playMobilityComplete } from '@/lib/audio';

function isMobilityDoneToday(): boolean {
  try {
    const saved = localStorage.getItem(MOBILITY_DONE_KEY);
    return saved === formatDateKey(new Date());
  } catch {
    return false;
  }
}

function saveMobilityDone(): void {
  try {
    localStorage.setItem(MOBILITY_DONE_KEY, formatDateKey(new Date()));
  } catch {
    // ignore
  }
}

export function useMobility() {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [side, setSide] = useState<'left' | 'right' | null>(null);
  const [isComplete, setIsComplete] = useState(() => isMobilityDoneToday());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownPlayedRef = useRef<Set<string>>(new Set());

  const exercise = MOBILITY_EXERCISES[exerciseIndex];

  const startMobility = useCallback(() => {
    unlockAudio();
    playStart();
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
        setTimer((t) => {
          // Countdown ticks at 3, 2, 1
          const next = t - 1;
          const tickKey = `${exerciseIndex}-${side}-${next}`;
          if (next <= 3 && next > 0 && !countdownPlayedRef.current.has(tickKey)) {
            countdownPlayedRef.current.add(tickKey);
            playCountdownTick(next);
          }
          return next;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }

    if (isActive && timer === 0) {
      // Advance
      if (exercise?.sides && side === 'left') {
        // Switch to right side
        playNextExercise();
        setSide('right');
        setTimer(exercise.duration);
      } else {
        // Next exercise
        const next = exerciseIndex + 1;
        if (next < MOBILITY_EXERCISES.length) {
          playNextExercise();
          setExerciseIndex(next);
          const nextEx = MOBILITY_EXERCISES[next];
          setTimer(nextEx.duration);
          setSide(nextEx.sides ? 'left' : null);
        } else {
          setIsActive(false);
          setIsComplete(true);
          saveMobilityDone();
          playMobilityComplete();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, timer]);

  const quit = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsActive(false);
    setExerciseIndex(0);
    setTimer(0);
    setSide(null);
  }, []);

  // Browser back button support
  useEffect(() => {
    if (isActive) {
      window.history.pushState({ mobilityActive: true }, '');
    }
    // Only push when becoming active, not on every re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  useEffect(() => {
    const handlePopState = () => {
      if (isActive) {
        quit();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isActive, quit]);

  const skip = useCallback(() => {
    playSkip();
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

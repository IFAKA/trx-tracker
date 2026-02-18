'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MOBILITY_EXERCISES } from '../lib/constants';
import { formatDateKey } from '../lib/workout-utils';
import { unlockAudio, playStart, playCountdownTick, playNextExercise, playSkip, playMobilityComplete } from '../lib/audio';

import { tauriStorage } from '../lib/storage-tauri';

const isMobilityDoneToday = () =>
  tauriStorage.getMobilityDone(formatDateKey(new Date())).catch(() => false);

const saveMobilityDone = () =>
  tauriStorage.setMobilityDone(formatDateKey(new Date())).catch(() => {});

export function useMobility() {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [side, setSide] = useState<'left' | 'right' | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownPlayedRef = useRef<Set<string>>(new Set());

  // Load mobility status on mount
  useEffect(() => {
    isMobilityDoneToday().then(setIsComplete);
  }, []);

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

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);

  useEffect(() => {
    if (isActive && !isPaused && timer > 0) {
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

    /* eslint-disable react-hooks/set-state-in-effect -- state machine advancement on timer reaching 0 */
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
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [isActive, isPaused, timer, exercise, exerciseIndex, side]);

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
    isPaused,
    isComplete,
    totalExercises: MOBILITY_EXERCISES.length,
    startMobility,
    skip,
    pause,
    resume,
  };
}

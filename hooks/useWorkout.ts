'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useWorkout as useCoreWorkout } from '@traindaily/core';
import { pwaStorage } from '@/lib/storage';
import { useDevTools } from '@/lib/devtools';
import {
  unlockAudio, playStart, playSetLogged, playCountdownTick,
  playRestComplete, playNextExercise, playSkip, playSessionComplete,
  playExerciseReady, playUndo,
} from '@/lib/audio';

export function useWorkout(date: Date) {
  const devtools = useDevTools();
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  // Tracks whether a workout is in progress so we can re-acquire wake lock on visibility change
  const isActiveRef = useRef(false);

  const requestWakeLock = useCallback(async () => {
    try {
      if (!('wakeLock' in navigator)) return;
      const sentinel = await navigator.wakeLock.request('screen');
      wakeLockRef.current = sentinel;
      // Clear ref when the OS releases the lock (e.g. screen turned off)
      sentinel.addEventListener('release', () => { wakeLockRef.current = null; });
    } catch {}
  }, []);

  const releaseWakeLock = useCallback(() => {
    isActiveRef.current = false;
    wakeLockRef.current?.release();
    wakeLockRef.current = null;
  }, []);

  const workout = useCoreWorkout({
    date,
    storageAdapter: pwaStorage,
    audioCallbacks: {
      unlockAudio,
      playStart,
      playSetLogged,
      playCountdownTick,
      playRestComplete,
      playNextExercise,
      playSkip,
      playSessionComplete,
      playExerciseReady,
      playUndo,
    },
    onWakeLockRequest: requestWakeLock,
    onWakeLockRelease: releaseWakeLock,
    devTools: devtools ? {
      timerSpeed: devtools.timerSpeed,
    } : undefined,
  });

  // Keep isActiveRef in sync with workout state
  useEffect(() => {
    isActiveRef.current = workout.state !== 'idle' && workout.state !== 'complete';
  }, [workout.state]);

  // Re-acquire wake lock when the user returns to the app (Android releases it when screen turns off)
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden && isActiveRef.current && !wakeLockRef.current) {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [requestWakeLock]);

  return workout;
}

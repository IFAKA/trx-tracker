'use client';

import { useCallback, useRef } from 'react';
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

  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) wakeLockRef.current = await navigator.wakeLock.request('screen');
    } catch {}
  }, []);

  const releaseWakeLock = useCallback(() => {
    wakeLockRef.current?.release();
    wakeLockRef.current = null;
  }, []);

  return useCoreWorkout({
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
}

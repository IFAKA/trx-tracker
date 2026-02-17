import { useWorkout as useCoreWorkout } from '@traindaily/core';
import { getStorage } from '../lib/storage-tauri';
import {
  unlockAudio,
  playStart,
  playSetLogged,
  playCountdownTick,
  playRestComplete,
  playNextExercise,
  playSkip,
  playSessionComplete,
} from '../lib/audio';

export function useWorkout(date: Date) {
  const storage = getStorage();

  return useCoreWorkout({
    date,
    storageAdapter: storage,
    audioCallbacks: {
      unlockAudio: () => unlockAudio(),
      playStart: () => playStart(),
      playSetLogged: (hitTarget: boolean) => playSetLogged(hitTarget),
      playCountdownTick: (secondsLeft: number) => playCountdownTick(secondsLeft),
      playRestComplete: () => playRestComplete(),
      playNextExercise: () => playNextExercise(),
      playSkip: () => playSkip(),
      playSessionComplete: () => playSessionComplete(),
    },
    onWakeLockRequest: async () => {
      // Desktop doesn't need wake lock (always on when app is open)
    },
    onWakeLockRelease: () => {
      // No-op
    },
    onHistoryPush: () => {
      // Desktop doesn't use browser history
    },
  });
}

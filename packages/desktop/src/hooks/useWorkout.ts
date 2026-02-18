import { useWorkout as useCoreWorkout } from '@traindaily/core';
import { tauriStorage } from '../lib/storage-tauri';
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
  return useCoreWorkout({
    date,
    storageAdapter: tauriStorage,
    audioCallbacks: {
      unlockAudio,
      playStart,
      playSetLogged,
      playCountdownTick,
      playRestComplete,
      playNextExercise,
      playSkip,
      playSessionComplete,
    },
  });
}

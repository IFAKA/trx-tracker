import type { StorageAdapter, WorkoutData, WorkoutSession, WorkoutDraft } from '@traindaily/core';
import { STORAGE_KEY, FIRST_SESSION_KEY, MOBILITY_DONE_KEY } from './constants';
import { formatDateKey } from './workout-utils';

export function loadWorkoutData(): WorkoutData {
  try {
    if (typeof window === 'undefined') return {};
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as WorkoutData;
  } catch {
    return {};
  }
}

export function saveWorkoutData(data: WorkoutData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    if (err instanceof DOMException && (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      throw new Error('Storage full — free up space to save workouts');
    }
    throw new Error('Could not save workout data');
  }
}

export function saveSession(dateKey: string, session: WorkoutSession): void {
  const data = loadWorkoutData();
  data[dateKey] = session;
  saveWorkoutData(data);
}

export function getFirstSessionDate(): string | null {
  try {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(FIRST_SESSION_KEY);
  } catch {
    return null;
  }
}

export function setFirstSessionDate(dateKey: string): void {
  try {
    if (!localStorage.getItem(FIRST_SESSION_KEY)) {
      localStorage.setItem(FIRST_SESSION_KEY, dateKey);
    }
  } catch {
    // ignore
  }
}

const DRAFT_KEY = 'traindaily_draft';

export const pwaStorage: StorageAdapter = {
  loadWorkoutData: async () => loadWorkoutData(),
  saveSession: async (dateKey, session) => saveSession(dateKey, session),
  getFirstSessionDate: async () => getFirstSessionDate(),
  setFirstSessionDate: async (dateKey) => setFirstSessionDate(dateKey),
  getMobilityDone: async (dateKey) => {
    try {
      return localStorage.getItem(MOBILITY_DONE_KEY) === dateKey;
    } catch {
      return false;
    }
  },
  setMobilityDone: async () => {
    try {
      localStorage.setItem(MOBILITY_DONE_KEY, formatDateKey(new Date()));
    } catch {
      // ignore
    }
  },
  saveDraft: async (dateKey, draft) => {
    try {
      localStorage.setItem(`${DRAFT_KEY}_${dateKey}`, JSON.stringify(draft));
    } catch {
      // ignore — draft is best-effort
    }
  },
  loadDraft: async (dateKey) => {
    try {
      const raw = localStorage.getItem(`${DRAFT_KEY}_${dateKey}`);
      if (!raw) return null;
      return JSON.parse(raw) as WorkoutDraft;
    } catch {
      return null;
    }
  },
  clearDraft: async (dateKey) => {
    try {
      localStorage.removeItem(`${DRAFT_KEY}_${dateKey}`);
    } catch {
      // ignore
    }
  },
};

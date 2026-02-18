import { createContext, useContext } from 'react';
import { WorkoutState } from '@traindaily/core';

export interface WorkoutRegistration {
  state: WorkoutState;
  exerciseIndex: number;
  currentSet: number;
  setsPerExercise: number;
  timer: number;
  currentTarget: number;
  sessionReps: Record<string, number[]>;
  weekNumber: number;
  currentExerciseName: string;
  setState: (s: WorkoutState) => void;
  setExerciseIndex: (i: number) => void;
  setCurrentSet: (s: number) => void;
  setTimer: (t: number) => void;
  logSet: (value: number) => void;
  skipTimer: () => void;
  startWorkout: () => void;
  quitWorkout: () => void;
}

export interface ScheduleRegistration {
  isTraining: boolean;
  isDone: boolean;
  weekProgress: { completed: number; total: number };
  nextTraining: string | null;
  dateKey: string;
}

export interface DevToolsContextValue {
  registerWorkout: (reg: WorkoutRegistration) => void;
  registerSchedule: (reg: ScheduleRegistration) => void;
  getWorkout: () => WorkoutRegistration | null;
  getSchedule: () => ScheduleRegistration | null;
  timerSpeed: number;
  setTimerSpeed: (speed: number) => void;
  dateOverride: Date | null;
  setDateOverride: (date: Date | null) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const DevToolsContext = createContext<DevToolsContextValue | null>(null);

export function useDevTools(): DevToolsContextValue | null {
  return useContext(DevToolsContext);
}

export function useDevToolsRegisterWorkout(registration: WorkoutRegistration) {
  const devtools = useDevTools();
  if (devtools) {
    devtools.registerWorkout(registration);
  }
}

export function useDevToolsRegisterSchedule(registration: ScheduleRegistration) {
  const devtools = useDevTools();
  if (devtools) {
    devtools.registerSchedule(registration);
  }
}

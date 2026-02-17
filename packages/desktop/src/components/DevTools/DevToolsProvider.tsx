'use client';

import { useState, useRef, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { DevToolsContext, WorkoutRegistration, ScheduleRegistration } from '@/lib/devtools';

const DevToolsPanel = lazy(() => import('./DevToolsPanel'));

export function DevToolsProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [timerSpeed, setTimerSpeed] = useState(1);
  const [dateOverride, setDateOverride] = useState<Date | null>(null);
  const workoutRef = useRef<WorkoutRegistration | null>(null);
  const scheduleRef = useRef<ScheduleRegistration | null>(null);

  const registerWorkout = useCallback((reg: WorkoutRegistration) => {
    workoutRef.current = reg;
  }, []);

  const registerSchedule = useCallback((reg: ScheduleRegistration) => {
    scheduleRef.current = reg;
  }, []);

  const getWorkout = useCallback(() => workoutRef.current, []);
  const getSchedule = useCallback(() => scheduleRef.current, []);

  const toggle = useCallback(() => setIsOpen((o) => !o), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle]);

  const contextValue = useMemo(() => ({
    registerWorkout,
    registerSchedule,
    getWorkout,
    getSchedule,
    timerSpeed,
    setTimerSpeed,
    dateOverride,
    setDateOverride,
    isOpen,
    setIsOpen,
  }), [registerWorkout, registerSchedule, getWorkout, getSchedule, timerSpeed, dateOverride, isOpen]);

  return (
    <DevToolsContext.Provider value={contextValue}>
      {children}

      {/* FAB toggle */}
      <button
        onClick={toggle}
        className="fixed bottom-4 right-4 z-[9999] w-10 h-10 rounded-full bg-amber-500/90 text-black font-bold text-sm flex items-center justify-center shadow-lg hover:bg-amber-400 active:scale-95 transition-transform"
        title="DevTools (Ctrl+Shift+D)"
      >
        D
      </button>

      {/* Panel */}
      {isOpen && (
        <Suspense fallback={null}>
          <DevToolsPanel />
        </Suspense>
      )}
    </DevToolsContext.Provider>
  );
}

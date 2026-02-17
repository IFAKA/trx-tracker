'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronDown, ChevronRight, Play, SkipForward, Trash2, Download, Upload, Database, Zap } from 'lucide-react';
import { useDevTools, WorkoutRegistration, ScheduleRegistration } from '@/lib/devtools';
import { EXERCISES, STORAGE_KEY, FIRST_SESSION_KEY, REST_DURATION } from '@/lib/constants';
import { WorkoutState } from '@/lib/types';
import { loadWorkoutData, saveWorkoutData } from '@/lib/storage';
import { formatDateKey } from '@/lib/workout-utils';
import { isTrainingDay } from '@/lib/schedule';
import { addDays, subWeeks, startOfWeek } from 'date-fns';

// --- Helpers ---

async function seedFakeSessions(count: number) {
  const data = await loadWorkoutData();
  const today = new Date();
  let seeded = 0;
  let daysBack = 1;

  while (seeded < count) {
    const d = addDays(today, -daysBack);
    const key = formatDateKey(d);
    daysBack++;

    if (!isTrainingDay(d) || data[key]) continue;

    const weekNum = Math.max(1, Math.ceil(daysBack / 7));
    const sets = weekNum <= 4 ? 2 : 3;
    const session: Record<string, unknown> = {
      logged_at: d.toISOString(),
      week_number: weekNum,
    };

    for (const ex of EXERCISES) {
      const baseTarget = ex.unit === 'seconds' ? 20 : 10;
      const reps: number[] = [];
      for (let s = 0; s < sets; s++) {
        const variance = Math.floor(Math.random() * 3) - 1;
        reps.push(Math.max(1, baseTarget + variance - s * 2));
      }
      session[ex.key] = reps;
    }

    data[key] = session as typeof data[string];
    seeded++;

    // Set first session date to earliest - for desktop, use Tauri command
    // Skipping localStorage in desktop environment
  }

  await saveWorkoutData(data);
}

async function setWeekNumber(targetWeek: number) {
  const today = new Date();
  const weeksBack = targetWeek - 1;
  const fakeFirst = startOfWeek(subWeeks(today, weeksBack), { weekStartsOn: 1 });
  // For desktop, use Tauri command instead of localStorage
  const { setFirstSessionDate } = await import('@/lib/storage');
  await setFirstSessionDate(formatDateKey(fakeFirst));
}

// --- Section component ---

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 w-full px-3 py-2 text-xs font-bold uppercase tracking-wider text-amber-400 hover:bg-white/5"
      >
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {title}
      </button>
      {open && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-white/50">{label}</span>
      <span className="font-mono text-white/90">{value ?? '—'}</span>
    </div>
  );
}

function ActionButton({ onClick, children, variant = 'default' }: { onClick: () => void; children: React.ReactNode; variant?: 'default' | 'danger' }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
        variant === 'danger'
          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
          : 'bg-white/10 text-white/80 hover:bg-white/20'
      }`}
    >
      {children}
    </button>
  );
}

// --- Main panel ---

export default function DevToolsPanel() {
  const devtools = useDevTools();
  const [workout, setWorkout] = useState<WorkoutRegistration | null>(null);
  const [schedule, setSchedule] = useState<ScheduleRegistration | null>(null);
  const [localStorageView, setLocalStorageView] = useState<string | null>(null);
  const [seedCount, setSeedCount] = useState(5);
  const [weekInput, setWeekInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Poll refs on 200ms interval
  useEffect(() => {
    if (!devtools) return;
    const id = setInterval(() => {
      const w = devtools.getWorkout();
      setWorkout(w ? { ...w } : null);
      const s = devtools.getSchedule();
      setSchedule(s ? { ...s } : null);
    }, 200);
    return () => clearInterval(id);
  }, [devtools]);

  // Drag handling
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, input, select, textarea')) return;
    setDragging(true);
    setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    };
    const handleUp = () => setDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragging, dragOffset]);

  if (!devtools) return null;

  const handleClose = () => devtools.setIsOpen(false);

  const handleJumpExercise = (index: number) => {
    workout?.setExerciseIndex(index);
    workout?.setCurrentSet(0);
    workout?.setState('exercising');
  };

  const handleForceState = (s: WorkoutState) => {
    workout?.setState(s);
    if (s === 'resting') {
      workout?.setTimer(REST_DURATION);
    }
  };

  const handleAutoComplete = () => {
    if (!workout) return;
    // Trigger a full auto-complete by calling logSet in a loop is tricky
    // since it involves async state. Instead, just fast-forward to complete.
    workout.setState('complete');
  };

  const handleLogPerfectSet = () => {
    if (!workout || workout.state !== 'exercising') return;
    workout.logSet(workout.currentTarget);
  };

  const handleSkipRest = () => {
    if (!workout || workout.state !== 'resting') return;
    workout.skipTimer();
  };

  const handleViewLocalStorage = async () => {
    const data = await loadWorkoutData();
    setLocalStorageView(JSON.stringify(data, null, 2));
  };

  const handleClearData = async () => {
    // For desktop, clear via Tauri commands
    const { invoke } = await import('@tauri-apps/api/core');
    try {
      // Would need a clear_all_data command in Rust
      console.warn('Clear data not fully implemented for desktop');
      window.location.reload();
    } catch (err) {
      console.error('Failed to clear data:', err);
    }
  };

  const handleExportData = () => {
    const data: Record<string, string | null> = {};
    for (const key of [STORAGE_KEY, FIRST_SESSION_KEY]) {
      data[key] = localStorage.getItem(key);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trx-data-${formatDateKey(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      const data = JSON.parse(text);
      for (const [key, value] of Object.entries(data)) {
        if (value !== null) {
          localStorage.setItem(key, value as string);
        }
      }
      window.location.reload();
    };
    input.click();
  };

  const handleSeedSessions = async () => {
    await seedFakeSessions(seedCount);
    window.location.reload();
  };

  const handleSetWeek = async () => {
    const week = parseInt(weekInput);
    if (week >= 1) {
      await setWeekNumber(week);
      window.location.reload();
    }
  };

  const handleDateOverride = () => {
    if (!dateInput) {
      devtools.setDateOverride(null);
    } else {
      devtools.setDateOverride(new Date(dateInput + 'T12:00:00'));
    }
  };

  const handleClearDateOverride = () => {
    setDateInput('');
    devtools.setDateOverride(null);
  };

  return (
    <div
      className="fixed z-[9998] w-80 max-h-[80vh] bg-zinc-900/95 backdrop-blur-sm border border-white/10 rounded-lg shadow-2xl overflow-hidden flex flex-col select-none"
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-amber-500/10 border-b border-white/10 cursor-move">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">DevTools</span>
        </div>
        <button onClick={handleClose} className="text-white/40 hover:text-white/80">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-y-auto flex-1">
        {/* State Inspector */}
        <Section title="State Inspector">
          {workout ? (
            <div className="space-y-1">
              <StatRow label="State" value={workout.state} />
              <StatRow label="Exercise" value={workout.currentExerciseName || '—'} />
              <StatRow label="Index" value={`${workout.exerciseIndex}/${EXERCISES.length - 1}`} />
              <StatRow label="Set" value={`${workout.currentSet + 1}/${workout.setsPerExercise}`} />
              <StatRow label="Timer" value={`${workout.timer}s`} />
              <StatRow label="Target" value={workout.currentTarget} />
              <StatRow label="Week" value={workout.weekNumber} />
              <StatRow label="Sets/ex" value={workout.setsPerExercise} />
              {Object.keys(workout.sessionReps).length > 0 && (
                <div className="mt-1 pt-1 border-t border-white/5">
                  <span className="text-[10px] text-white/40 uppercase">Session Reps</span>
                  {Object.entries(workout.sessionReps).map(([key, reps]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-white/50 truncate max-w-[120px]">{key}</span>
                      <span className="font-mono text-white/90">{reps.join(' · ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-white/30">No workout state registered</p>
          )}

          {schedule && (
            <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
              <StatRow label="Training day" value={schedule.isTraining ? 'Yes' : 'No'} />
              <StatRow label="Done today" value={schedule.isDone ? 'Yes' : 'No'} />
              <StatRow label="Week progress" value={`${schedule.weekProgress.completed}/${schedule.weekProgress.total}`} />
              <StatRow label="Date key" value={schedule.dateKey} />
            </div>
          )}
        </Section>

        {/* Quick Actions */}
        <Section title="Quick Actions">
          <div className="flex flex-wrap gap-1.5">
            <ActionButton onClick={handleSkipRest}>
              <span className="flex items-center gap-1"><SkipForward className="w-3 h-3" /> Skip Rest</span>
            </ActionButton>
            <ActionButton onClick={handleLogPerfectSet}>
              <span className="flex items-center gap-1"><Play className="w-3 h-3" /> Log Perfect</span>
            </ActionButton>
            <ActionButton onClick={handleAutoComplete}>
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Complete</span>
            </ActionButton>
          </div>

          {/* Jump to exercise */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-white/40 uppercase shrink-0">Jump to</span>
            <select
              onChange={(e) => handleJumpExercise(parseInt(e.target.value))}
              value={workout?.exerciseIndex ?? 0}
              className="flex-1 bg-white/10 border border-white/10 rounded px-2 py-1 text-xs text-white/80"
            >
              {EXERCISES.map((ex, i) => (
                <option key={ex.key} value={i} className="bg-zinc-900">{i}. {ex.name}</option>
              ))}
            </select>
          </div>

          {/* Force state */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-white/40 uppercase shrink-0">Force</span>
            <div className="flex gap-1 flex-wrap">
              {(['idle', 'exercising', 'resting', 'transitioning', 'complete'] as WorkoutState[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleForceState(s)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    workout?.state === s
                      ? 'bg-amber-500/30 text-amber-300'
                      : 'bg-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Data Tools */}
        <Section title="Data Tools" defaultOpen={false}>
          <div className="flex flex-wrap gap-1.5">
            <ActionButton onClick={handleViewLocalStorage}>
              <span className="flex items-center gap-1"><Database className="w-3 h-3" /> View Data</span>
            </ActionButton>
            <ActionButton onClick={handleExportData}>
              <span className="flex items-center gap-1"><Download className="w-3 h-3" /> Export</span>
            </ActionButton>
            <ActionButton onClick={handleImportData}>
              <span className="flex items-center gap-1"><Upload className="w-3 h-3" /> Import</span>
            </ActionButton>
            <ActionButton onClick={handleClearData} variant="danger">
              <span className="flex items-center gap-1"><Trash2 className="w-3 h-3" /> Clear All</span>
            </ActionButton>
          </div>

          {/* Seed sessions */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-white/40 uppercase shrink-0">Seed</span>
            <input
              type="number"
              min={1}
              max={50}
              value={seedCount}
              onChange={(e) => setSeedCount(parseInt(e.target.value) || 1)}
              className="w-14 bg-white/10 border border-white/10 rounded px-2 py-1 text-xs text-white/80"
            />
            <ActionButton onClick={handleSeedSessions}>
              Seed Sessions
            </ActionButton>
          </div>

          {/* Set week */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-white/40 uppercase shrink-0">Week</span>
            <input
              type="number"
              min={1}
              placeholder="e.g. 5"
              value={weekInput}
              onChange={(e) => setWeekInput(e.target.value)}
              className="w-14 bg-white/10 border border-white/10 rounded px-2 py-1 text-xs text-white/80"
            />
            <ActionButton onClick={handleSetWeek}>
              Set Week
            </ActionButton>
          </div>

          {/* localStorage viewer */}
          {localStorageView !== null && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-white/40 uppercase">localStorage</span>
                <button onClick={() => setLocalStorageView(null)} className="text-white/30 hover:text-white/60">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <pre className="text-[10px] text-white/60 bg-black/30 rounded p-2 max-h-40 overflow-auto font-mono whitespace-pre-wrap">
                {localStorageView}
              </pre>
            </div>
          )}
        </Section>

        {/* Time Controls */}
        <Section title="Time Controls" defaultOpen={false}>
          {/* Timer speed */}
          <div>
            <span className="text-[10px] text-white/40 uppercase">Timer Speed</span>
            <div className="flex gap-1 mt-1">
              {[1, 2, 5, 10].map((speed) => (
                <button
                  key={speed}
                  onClick={() => devtools.setTimerSpeed(speed)}
                  className={`px-2 py-1 rounded text-xs font-mono ${
                    devtools.timerSpeed === speed
                      ? 'bg-amber-500/30 text-amber-300'
                      : 'bg-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Date override */}
          <div className="mt-2">
            <span className="text-[10px] text-white/40 uppercase">Override Date</span>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="flex-1 bg-white/10 border border-white/10 rounded px-2 py-1 text-xs text-white/80"
              />
              <ActionButton onClick={handleDateOverride}>Set</ActionButton>
              {devtools.dateOverride && (
                <ActionButton onClick={handleClearDateOverride}>Clear</ActionButton>
              )}
            </div>
            {devtools.dateOverride && (
              <p className="text-[10px] text-amber-400/60 mt-1">
                Overriding to: {formatDateKey(devtools.dateOverride)}
              </p>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}

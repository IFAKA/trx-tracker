'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { Timer, SkipForward, X, Pause, Play, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { REST_DURATION } from '@traindaily/core';
import { QuitConfirmDialog } from './QuitConfirmDialog';

const UNDO_HOLD_DURATION = 600; // ms to hold before undo fires

interface RestTimerProps {
  seconds: number;
  isPaused: boolean;
  onPauseToggle: () => void;
  onSkip: () => void;
  onQuit: () => void;
  onUndo: () => void;
  restLabel?: string;
}

export function RestTimer({ seconds, isPaused, onPauseToggle, onSkip, onQuit, onUndo, restLabel }: RestTimerProps) {
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [undoProgress, setUndoProgress] = useState(0);
  const showQuitConfirmRef = useRef(false);
  const prevSeconds = useRef(seconds);
  const undoRafRef = useRef<number | null>(null);
  const undoStartRef = useRef<number | null>(null);

  // Announcement for screen readers at key moments
  const srAnnouncement = useMemo(() => {
    if (seconds === REST_DURATION) return 'Rest started';
    if (seconds === 10) return '10 seconds remaining';
    if (seconds === 0) return 'Rest complete';
    return '';
  }, [seconds]);

  useEffect(() => { prevSeconds.current = seconds; }, [seconds]);

  useEffect(() => {
    showQuitConfirmRef.current = showQuitConfirm;
  }, [showQuitConfirm]);

  // Trap back gesture: show quit confirm (or dismiss it if already open)
  useEffect(() => {
    const handlePopState = () => {
      if (showQuitConfirmRef.current) {
        setShowQuitConfirm(false);
      } else {
        setShowQuitConfirm(true);
      }
      window.history.pushState({ rest: true }, '');
    };
    window.history.pushState({ rest: true }, '');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Hold-to-undo logic
  const startUndo = () => {
    undoStartRef.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - (undoStartRef.current ?? Date.now());
      const progress = Math.min(elapsed / UNDO_HOLD_DURATION, 1);
      setUndoProgress(progress);
      if (progress < 1) {
        undoRafRef.current = requestAnimationFrame(tick);
      } else {
        undoStartRef.current = null;
        setUndoProgress(0);
        onUndo();
      }
    };
    undoRafRef.current = requestAnimationFrame(tick);
  };

  const cancelUndo = () => {
    if (undoRafRef.current !== null) {
      cancelAnimationFrame(undoRafRef.current);
      undoRafRef.current = null;
    }
    undoStartRef.current = null;
    setUndoProgress(0);
  };

  // Clean up on unmount
  useEffect(() => () => { if (undoRafRef.current !== null) cancelAnimationFrame(undoRafRef.current); }, []);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const progress = ((REST_DURATION - seconds) / REST_DURATION) * 100;

  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] bg-background p-4 sm:p-6 gap-6 sm:gap-8">
      {/* Quit */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <button
          type="button"
          onClick={() => setShowQuitConfirm(true)}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Quit workout"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <Timer className="w-8 h-8 text-muted-foreground" />

      {/* Screen reader announcement at key moments */}
      {srAnnouncement && (
        <span className="sr-only" aria-live="polite" aria-atomic="true">{srAnnouncement}</span>
      )}

      {/* Circular timer — conic-gradient ring, compositor-accelerated via @property */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        <div
          aria-label="Rest timer progress"
          className="absolute inset-0 rounded-full"
          style={{
            '--timer-progress': progress,
            background: isPaused
              ? `conic-gradient(from -90deg, oklch(0.55 0 0) calc(var(--timer-progress) * 1%), oklch(0.70 0 0 / 25%) 0%)`
              : `conic-gradient(from -90deg, oklch(0.95 0 0) calc(var(--timer-progress) * 1%), oklch(0.70 0 0 / 25%) 0%)`,
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 6px), black calc(100% - 6px))',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 6px), black calc(100% - 6px))',
            transition: '--timer-progress 1s linear',
          } as CSSProperties}
        />
        <span
          role="timer"
          aria-live="off"
          className={`font-mono font-bold tracking-wider transition-colors duration-300 ${
            seconds <= 3 && seconds > 0
              ? 'text-yellow-500 text-6xl'
              : isPaused
                ? 'text-muted-foreground text-5xl'
                : 'text-5xl'
          }`}
          style={seconds <= 3 && seconds > 0 ? { animation: 'countdown-pulse 0.15s ease-out' } : undefined}
          key={seconds <= 3 ? seconds : 'normal'}
        >
          {display}
        </span>
      </div>

      {/* Context label — tells user what's coming next */}
      {restLabel && (
        <p className="text-xs uppercase tracking-widest text-muted-foreground/60 -mt-2">
          {restLabel}
        </p>
      )}

      {/* Action buttons: undo · pause · skip */}
      <div className="flex items-center gap-4">
        {/* Hold-to-undo button — prevents accidental taps */}
        <button
          type="button"
          onPointerDown={startUndo}
          onPointerUp={cancelUndo}
          onPointerLeave={cancelUndo}
          onPointerCancel={cancelUndo}
          className="relative rounded-full w-14 h-14 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors select-none touch-none overflow-hidden"
          aria-label="Hold to undo last set"
          style={{ WebkitUserSelect: 'none' }}
        >
          {/* Fill ring that grows as user holds */}
          {undoProgress > 0 && (
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(from -90deg, oklch(0.7 0.15 250 / 35%) ${undoProgress * 360}deg, transparent 0deg)`,
              }}
            />
          )}
          <RotateCcw className="w-5 h-5 relative z-10" />
        </button>

        <Button
          variant="outline"
          size="lg"
          onClick={onPauseToggle}
          className="rounded-full w-16 h-16 active:scale-95 transition-transform"
          aria-label={isPaused ? 'Resume timer' : 'Pause timer'}
        >
          {isPaused ? <Play className="w-7 h-7" /> : <Pause className="w-7 h-7" />}
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={onSkip}
          className="rounded-full w-14 h-14 active:scale-95 transition-transform text-muted-foreground hover:text-foreground"
          aria-label="Skip rest"
        >
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>

      <QuitConfirmDialog
        open={showQuitConfirm}
        onOpenChange={setShowQuitConfirm}
        onConfirm={onQuit}
      />
    </div>
  );
}

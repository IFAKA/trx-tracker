'use client';

import { useState, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { Timer, SkipForward, X, Pause, Play, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { REST_DURATION } from '@traindaily/core';
import { QuitConfirmDialog } from './QuitConfirmDialog';

interface RestTimerProps {
  seconds: number;
  isPaused: boolean;
  onPauseToggle: () => void;
  onSkip: () => void;
  onQuit: () => void;
  onUndo: () => void;
}

export function RestTimer({ seconds, isPaused, onPauseToggle, onSkip, onQuit, onUndo }: RestTimerProps) {
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const showQuitConfirmRef = useRef(false);

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

      {/* Circular timer — conic-gradient ring, compositor-accelerated via @property */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        <div
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

      {/* Action buttons: undo · pause · skip */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="lg"
          onClick={onUndo}
          className="rounded-full w-14 h-14 active:scale-95 transition-transform text-muted-foreground hover:text-foreground"
          aria-label="Undo last set"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>

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

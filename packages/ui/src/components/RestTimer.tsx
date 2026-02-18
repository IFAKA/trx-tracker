'use client';

import { useState } from 'react';
import { Timer, SkipForward, X, Pause, Play, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { REST_DURATION } from '@traindaily/core';

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
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const progress = ((REST_DURATION - seconds) / REST_DURATION) * 100;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background p-6 gap-8">
      {/* Quit */}
      <div className="absolute top-6 left-6">
        {showQuitConfirm ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Quit?</span>
            <button
              onClick={onQuit}
              className="text-xs text-destructive hover:text-destructive/80 transition-colors font-medium"
            >
              Yes
            </button>
            <button
              onClick={() => setShowQuitConfirm(false)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              No
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowQuitConfirm(true)}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Quit workout"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <Timer className="w-8 h-8 text-muted-foreground" />

      {/* Circular timer */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="45"
            fill="none" stroke="currentColor" strokeWidth="2"
            className="text-muted/30"
          />
          <circle
            cx="50" cy="50" r="45"
            fill="none" stroke="currentColor" strokeWidth="3"
            className={isPaused ? 'text-muted-foreground' : 'text-foreground'}
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <span
          className={`font-mono font-bold tracking-wider transition-colors duration-300 ${
            seconds <= 3 && seconds > 0
              ? 'text-yellow-500 text-6xl'
              : isPaused
                ? 'text-muted-foreground text-5xl'
                : 'text-5xl'
          }`}
          style={seconds <= 3 && seconds > 0 ? { animation: 'countdown-pulse 1s ease-out' } : undefined}
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
    </div>
  );
}

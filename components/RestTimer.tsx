'use client';

import { Timer, SkipForward, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RestTimerProps {
  seconds: number;
  onSkip: () => void;
  onQuit: () => void;
}

export function RestTimer({ seconds, onSkip, onQuit }: RestTimerProps) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const progress = ((90 - seconds) / 90) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 gap-8">
      <button
        type="button"
        onClick={onQuit}
        className="absolute top-6 left-6 p-1 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Quit workout"
      >
        <X className="w-5 h-5" />
      </button>
      <Timer className="w-8 h-8 text-muted-foreground" />

      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted/30"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-foreground"
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
              : 'text-5xl'
          }`}
          style={
            seconds <= 3 && seconds > 0
              ? {
                  animation: 'countdown-pulse 1s ease-out',
                }
              : undefined
          }
          key={seconds <= 3 ? seconds : 'normal'}
        >
          {display}
        </span>
      </div>

      <Button
        variant="ghost"
        size="lg"
        onClick={onSkip}
        className="rounded-full w-16 h-16 active:scale-95 transition-transform"
      >
        <SkipForward className="w-8 h-8" />
      </Button>
    </div>
  );
}

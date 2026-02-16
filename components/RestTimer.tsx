'use client';

import { Timer, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RestTimerProps {
  seconds: number;
  onSkip: () => void;
}

export function RestTimer({ seconds, onSkip }: RestTimerProps) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const progress = ((90 - seconds) / 90) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 gap-8">
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
        <span className="text-5xl font-mono font-bold tracking-wider">
          {display}
        </span>
      </div>

      <Button
        variant="ghost"
        size="lg"
        onClick={onSkip}
        className="rounded-full w-16 h-16"
      >
        <SkipForward className="w-8 h-8" />
      </Button>
    </div>
  );
}

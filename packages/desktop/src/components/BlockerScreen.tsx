'use client';

import { Dumbbell, Calendar, Lock } from 'lucide-react';
import { formatDisplayDate } from '../lib/workout-utils';

export function BlockerScreen() {
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });

  // Time until end of training day (midnight)
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const msLeft = midnight.getTime() - today.getTime();
  const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
  const unlockMessage =
    hoursLeft > 0
      ? `${hoursLeft}h ${minutesLeft}m left today`
      : minutesLeft > 0
        ? `${minutesLeft}m left today`
        : 'Last chance — midnight in seconds';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 gap-8">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Dumbbell className="w-16 h-16 text-muted-foreground animate-pulse" />
          <Lock className="w-8 h-8 text-destructive absolute -bottom-1 -right-1" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-center">
          COMPLETE YOUR WORKOUT
        </h1>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-5 h-5" />
          <span className="text-lg">{dayName}</span>
        </div>
        <p className="text-sm text-muted-foreground">{formatDisplayDate(today)}</p>
      </div>

      <div className="max-w-md text-center space-y-4">
        <p className="text-muted-foreground">
          This is a training day. Complete your workout to unlock your computer.
        </p>

        <div className="bg-secondary/50 rounded-lg p-4 space-y-2 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Training Schedule</p>
          <p>Monday • Wednesday • Friday</p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            No excuses. Your future self will thank you.
          </p>
        </div>
      </div>

      <div className="mt-8 text-xs text-muted-foreground/40 text-center space-y-1">
        <p>Open TrainDaily from the menu bar to log your workout</p>
        <p className="text-muted-foreground/60 font-mono">{unlockMessage}</p>
      </div>
    </div>
  );
}

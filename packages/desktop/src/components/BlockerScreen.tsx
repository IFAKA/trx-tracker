'use client';

import { Dumbbell, Calendar, Lock } from 'lucide-react';
import { formatDisplayDate } from '../lib/workout-utils';

export function BlockerScreen() {
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });

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

      <div className="mt-8 text-xs text-muted-foreground/40 text-center">
        <p>Open TrainDaily from the menu bar to log your workout</p>
      </div>
    </div>
  );
}

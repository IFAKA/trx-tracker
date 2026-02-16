'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MicroBreakExercise } from '@/lib/types';

interface MicroBreakProps {
  exercise: MicroBreakExercise;
  onDismiss: () => void;
}

export function MicroBreak({ exercise, onDismiss }: MicroBreakProps) {
  const [timer, setTimer] = useState(exercise.duration);
  const [canDismiss, setCanDismiss] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          setCanDismiss(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const mins = Math.floor(timer / 60);
  const secs = timer % 60;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 gap-6">
      <Activity className="w-10 h-10 text-muted-foreground" />

      <h1 className="text-2xl font-bold tracking-tight">{exercise.name}</h1>

      <p className="text-sm text-muted-foreground text-center max-w-xs">
        {exercise.instruction}
      </p>

      <span className="text-5xl font-mono font-bold">
        {mins}:{secs.toString().padStart(2, '0')}
      </span>

      {canDismiss && (
        <Button
          variant="ghost"
          size="lg"
          onClick={onDismiss}
          className="rounded-full w-14 h-14"
        >
          <X className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}

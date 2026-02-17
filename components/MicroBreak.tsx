'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MicroBreakExercise } from '@/lib/types';
import { ExerciseDemo } from '@/components/ExerciseDemo';
import { playBreakStart, playCountdownTick, playBreakDone } from '@/lib/audio';

interface MicroBreakProps {
  exercise: MicroBreakExercise;
  onDismiss: () => void;
}

export function MicroBreak({ exercise, onDismiss }: MicroBreakProps) {
  const [timer, setTimer] = useState(exercise.duration);
  const [canDismiss, setCanDismiss] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownPlayedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    playBreakStart();

    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          setCanDismiss(true);
          playBreakDone();
          return 0;
        }
        // Countdown ticks at 3, 2, 1
        const next = t - 1;
        if (next <= 3 && next > 0 && !countdownPlayedRef.current.has(next)) {
          countdownPlayedRef.current.add(next);
          playCountdownTick(next);
        }
        return next;
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
      {exercise.youtubeId && (
        <ExerciseDemo youtubeId={exercise.youtubeId} title={exercise.name} />
      )}

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

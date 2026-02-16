'use client';

import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface ExerciseTransitionProps {
  exerciseName: string;
  onComplete: () => void;
}

export function ExerciseTransition({ exerciseName, onComplete }: ExerciseTransitionProps) {
  useEffect(() => {
    const timeout = setTimeout(onComplete, 2000);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 gap-6">
      <ArrowRight
        className="w-8 h-8 text-muted-foreground"
        style={{ animation: 'slide-down-in 500ms ease-out backwards' }}
      />
      <p
        className="text-xs uppercase tracking-widest text-muted-foreground"
        style={{ animation: 'stagger-in 400ms ease-out 150ms backwards' }}
      >
        Next up
      </p>
      <h1
        className="text-2xl font-bold tracking-tight text-center"
        style={{ animation: 'slide-up-in 500ms ease-out 300ms backwards' }}
      >
        {exerciseName}
      </h1>
    </div>
  );
}

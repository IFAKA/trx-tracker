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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 gap-6 animate-in fade-in duration-500">
      <ArrowRight className="w-8 h-8 text-muted-foreground" />
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Next up</p>
      <h1 className="text-2xl font-bold tracking-tight text-center">{exerciseName}</h1>
    </div>
  );
}

'use client';

import { SkipForward, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MobilityExercise } from '@/lib/types';

interface MobilityFlowProps {
  exercise: MobilityExercise;
  exerciseIndex: number;
  totalExercises: number;
  timer: number;
  side: 'left' | 'right' | null;
  onSkip: () => void;
}

export function MobilityFlow({
  exercise,
  exerciseIndex,
  totalExercises,
  timer,
  side,
  onSkip,
}: MobilityFlowProps) {
  const progressPercent = (exerciseIndex / totalExercises) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-background p-6">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-2">
        <Progress value={progressPercent} className="flex-1 h-1.5" />
        <span className="text-xs text-muted-foreground font-mono">
          {exerciseIndex + 1}/{totalExercises}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <Activity className="w-8 h-8 text-muted-foreground" />

        <h1 className="text-2xl font-bold tracking-tight text-center">
          {exercise.name}
        </h1>

        {side && (
          <span className="text-lg font-mono text-muted-foreground uppercase">
            {side} SIDE
          </span>
        )}

        <p className="text-sm text-muted-foreground text-center max-w-xs">
          {exercise.instruction}
        </p>

        <span className="text-5xl font-mono font-bold">{timer}s</span>

        <Button
          variant="ghost"
          size="lg"
          onClick={onSkip}
          className="rounded-full w-14 h-14"
        >
          <SkipForward className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}

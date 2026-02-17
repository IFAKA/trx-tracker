'use client';

import { useCallback } from 'react';
import { Pause, SkipForward } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { MobilityExercise } from '@traindaily/core';
import { ExerciseDemo } from './ExerciseDemo';

interface MobilityFlowProps {
  exercise: MobilityExercise;
  exerciseIndex: number;
  totalExercises: number;
  timer: number;
  side: 'left' | 'right' | null;
  isPaused: boolean;
  onSkip: () => void;
  onPause: () => void;
  onResume: () => void;
}

export function MobilityFlow({
  exercise,
  exerciseIndex,
  totalExercises,
  timer,
  side,
  isPaused,
  onSkip,
  onPause,
  onResume,
}: MobilityFlowProps) {
  const progressPercent = (exerciseIndex / totalExercises) * 100;

  const handlePlayingChange = useCallback(
    (isPlaying: boolean) => {
      if (isPlaying) {
        onPause();
      } else {
        onResume();
      }
    },
    [onPause, onResume]
  );

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
        {exercise.youtubeId && (
          <ExerciseDemo
            youtubeId={exercise.youtubeId}
            title={exercise.name}
            onPlayingChange={handlePlayingChange}
          />
        )}

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

        <div className="flex items-center gap-2">
          <span
            className={`text-5xl font-mono font-bold transition-opacity ${
              isPaused ? 'opacity-40' : ''
            }`}
          >
            {timer}s
          </span>
          {isPaused && (
            <Pause className="w-5 h-5 text-muted-foreground animate-pulse" />
          )}
        </div>

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

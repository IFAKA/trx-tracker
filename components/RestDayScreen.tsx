'use client';

import { Moon, Play, CheckCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobilityFlow } from './MobilityFlow';
import { useMobility } from '@/hooks/useMobility';

interface RestDayScreenProps {
  nextTraining: string | null;
  weekCompleted: number;
  weekTotal: number;
}

export function RestDayScreen({ nextTraining, weekCompleted, weekTotal }: RestDayScreenProps) {
  const mobility = useMobility();

  if (mobility.isActive) {
    return (
      <MobilityFlow
        exercise={mobility.exercise}
        exerciseIndex={mobility.exerciseIndex}
        totalExercises={mobility.totalExercises}
        timer={mobility.timer}
        side={mobility.side}
        isPaused={mobility.isPaused}
        onSkip={mobility.skip}
        onPause={mobility.pause}
        onResume={mobility.resume}
      />
    );
  }

  if (mobility.isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 gap-6">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <h2 className="text-xl font-bold">MOBILITY DONE</h2>
        {nextTraining && (
          <p className="text-sm text-muted-foreground">
            NEXT: {nextTraining}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 gap-8">
      <Moon className="w-12 h-12 text-muted-foreground" />
      <h1 className="text-2xl font-bold tracking-tight">REST DAY</h1>

      <Button
        size="lg"
        onClick={mobility.startMobility}
        className="rounded-full w-16 h-16 animate-pulse active:scale-95 transition-transform"
      >
        <Play className="w-8 h-8" />
      </Button>
      <p className="text-xs text-muted-foreground">5 MIN MOBILITY</p>

      {nextTraining && (
        <p className="text-sm text-muted-foreground mt-4">
          NEXT: {nextTraining}
        </p>
      )}

      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar className="w-4 h-4" />
        <span className="text-sm font-mono">
          {weekCompleted}/{weekTotal} this week
        </span>
      </div>
    </div>
  );
}

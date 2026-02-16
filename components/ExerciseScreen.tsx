'use client';

import { useState, useRef, useEffect } from 'react';
import { Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { EXERCISES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ExerciseScreenProps {
  exerciseIndex: number;
  currentSet: number;
  setsPerExercise: number;
  currentTarget: number;
  previousRep: number | null;
  flashColor: 'green' | 'red' | null;
  onLogSet: (value: number) => void;
}

export function ExerciseScreen({
  exerciseIndex,
  currentSet,
  setsPerExercise,
  currentTarget,
  previousRep,
  flashColor,
  onLogSet,
}: ExerciseScreenProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const exercise = EXERCISES[exerciseIndex];
  const progressPercent = ((exerciseIndex) / EXERCISES.length) * 100;

  useEffect(() => {
    setInputValue('');
    // Focus input on mount and exercise/set change
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [exerciseIndex, currentSet]);

  const handleSubmit = () => {
    const val = parseInt(inputValue);
    if (isNaN(val) || val < 0) return;
    onLogSet(val);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div
      className={cn(
        'flex flex-col min-h-screen bg-background p-6 transition-colors duration-500',
        flashColor === 'green' && 'bg-green-950/30',
        flashColor === 'red' && 'bg-red-950/30'
      )}
    >
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-2">
        <Progress value={progressPercent} className="flex-1 h-1.5" />
        <span className="text-xs text-muted-foreground font-mono">
          {exerciseIndex + 1}/{EXERCISES.length}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        {/* Exercise name */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-center">
          {exercise.name}
        </h1>

        {/* Set dots */}
        <div className="flex gap-2">
          {Array.from({ length: setsPerExercise }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-3 h-3 rounded-full transition-colors',
                i < currentSet
                  ? 'bg-foreground'
                  : i === currentSet
                    ? 'border-2 border-foreground'
                    : 'border border-muted-foreground/40'
              )}
            />
          ))}
        </div>

        {/* Target */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Target className="w-5 h-5" />
          <span className="text-3xl font-mono font-bold text-foreground">
            {currentTarget}
          </span>
          {exercise.unit === 'seconds' && (
            <span className="text-sm text-muted-foreground">s</span>
          )}
        </div>

        {/* Input */}
        <div className="w-32">
          <Input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-center text-4xl font-mono h-16 border-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="—"
            min={0}
          />
        </div>

        {/* Previous performance */}
        {previousRep !== null && (
          <div className="flex items-center gap-2 text-muted-foreground">
            {flashColor === 'green' ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : flashColor === 'red' ? (
              <TrendingDown className="w-4 h-4 text-red-500" />
            ) : (
              <Minus className="w-4 h-4" />
            )}
            <span className="text-lg font-mono">{previousRep}</span>
          </div>
        )}
      </div>

      {/* Flash feedback icons */}
      {flashColor && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          {flashColor === 'green' ? (
            <TrendingUp className="w-24 h-24 text-green-500 animate-ping" />
          ) : (
            <TrendingDown className="w-24 h-24 text-red-500 animate-ping" />
          )}
        </div>
      )}
    </div>
  );
}

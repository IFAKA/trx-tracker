'use client';

import { useState, useRef, useEffect } from 'react';
import { Target, TrendingUp, TrendingDown, Minus, Info, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  onQuit: () => void;
}

export function ExerciseScreen({
  exerciseIndex,
  currentSet,
  setsPerExercise,
  currentTarget,
  previousRep,
  flashColor,
  onLogSet,
  onQuit,
}: ExerciseScreenProps) {
  const [inputValue, setInputValue] = useState('');
  const [showInstruction, setShowInstruction] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const exercise = EXERCISES[exerciseIndex];
  const progressPercent = ((exerciseIndex) / EXERCISES.length) * 100;

  useEffect(() => {
    setInputValue('');
    setShowInstruction(false);
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
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-2">
        <button
          type="button"
          onClick={onQuit}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Quit workout"
        >
          <X className="w-5 h-5" />
        </button>
        <Progress value={progressPercent} className="flex-1 h-1.5" />
        <span className="text-xs text-muted-foreground font-mono">
          {exerciseIndex + 1}/{EXERCISES.length}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        {/* Exercise name + info */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-center font-[family-name:var(--font-geist-sans)]">
            {exercise.name}
          </h1>
          <button
            type="button"
            onClick={() => setShowInstruction(!showInstruction)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground/80 hover:text-foreground transition-colors border border-muted-foreground/30 rounded-full px-3 py-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showInstruction ? 'hide' : 'how to'}</span>
          </button>
          {showInstruction && (
            <p className="text-sm text-muted-foreground text-center max-w-[280px] leading-relaxed">
              {exercise.instruction}
            </p>
          )}
        </div>

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
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Target</span>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-muted-foreground" />
            <span className="text-3xl font-mono font-bold text-foreground">
              {currentTarget}
            </span>
            {exercise.unit === 'seconds' && (
              <span className="text-sm text-muted-foreground">s</span>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="flex flex-col items-center gap-3 w-40">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            {exercise.unit === 'seconds' ? 'Seconds held' : 'Reps done'}
          </span>
          <Input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-center text-4xl font-mono h-16 border-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="0"
            min={0}
          />
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={inputValue === ''}
            className="rounded-full w-14 h-14"
          >
            <Check className="w-7 h-7" />
          </Button>
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

'use client';

import { useState, useRef, useEffect } from 'react';
import { Target, TrendingUp, TrendingDown, Minus, Info, X, Check, ChevronLeft } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import type { Exercise } from '@traindaily/core';
import { cn } from '../lib/utils';
import { ExerciseDemo } from './ExerciseDemo';
import { QuitConfirmDialog } from './QuitConfirmDialog';

interface ExerciseScreenProps {
  exercise: Exercise;
  exerciseIndex: number;
  totalExercises: number;
  currentSet: number;
  setsPerExercise: number;
  currentTarget: number;
  previousRep: number | null;
  flashColor: 'green' | 'red' | null;
  onLogSet: (value: number) => void;
  onQuit: () => void;
}

export function ExerciseScreen({
  exercise,
  exerciseIndex,
  totalExercises,
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
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const progressPercent = (exerciseIndex / totalExercises) * 100;

  useEffect(() => {
    setInputValue('');
    setShowInstruction(false);
    setShowQuitConfirm(false);
    inputRef.current?.focus();
  }, [exerciseIndex, currentSet]);

  // Back button: close how-to if open, otherwise show quit confirm
  useEffect(() => {
    const handlePopState = () => {
      if (showInstruction) {
        setShowInstruction(false);
      } else {
        setShowQuitConfirm(true);
      }
    };
    window.history.pushState({ exercise: true }, '');
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [showInstruction]);

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
        'flex flex-col h-[100dvh] bg-background transition-colors duration-500 overflow-hidden',
        flashColor === 'green' && 'bg-green-950/30',
        flashColor === 'red' && 'bg-red-950/30'
      )}
    >
      {/* Fullscreen how-to overlay */}
      {showInstruction && (
        <div className="fixed inset-0 z-40 bg-background flex flex-col">
          <div className="flex items-center gap-3 p-4">
            <button
              type="button"
              onClick={() => setShowInstruction(false)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="Close how to"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold flex-1">{exercise.name}</h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 pb-8 overflow-y-auto min-h-0">
            {exercise.youtubeId && (
              <div className="w-full max-w-sm">
                <ExerciseDemo youtubeId={exercise.youtubeId} title={exercise.name} />
              </div>
            )}
            <p className="text-sm text-muted-foreground text-center max-w-sm leading-relaxed">
              {exercise.instruction}
            </p>
            <Button
              variant="outline"
              className="rounded-full px-6"
              onClick={() => setShowInstruction(false)}
            >
              Got it
            </Button>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center gap-3 p-4 pb-0 shrink-0">
        <button
          type="button"
          onClick={() => setShowQuitConfirm(true)}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
          aria-label="Quit workout"
        >
          <X className="w-5 h-5" />
        </button>
        <Progress value={progressPercent} className="flex-1 h-1.5" />
        <span className="text-xs text-muted-foreground font-mono">
          {exerciseIndex + 1}/{totalExercises}
        </span>
      </div>

      {/* Main content - scrollable, compact for keyboard */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3 overflow-y-auto min-h-0 px-4 py-2">
        {/* Exercise name + how to */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-center font-[family-name:var(--font-geist-sans)]">
            {exercise.name}
          </h1>
          <button
            type="button"
            onClick={() => setShowInstruction(true)}
            className="flex items-center gap-1.5 text-xs transition-colors border rounded-full px-3 py-1 text-muted-foreground/80 hover:text-foreground border-muted-foreground/30"
          >
            <Info className="w-3.5 h-3.5" />
            <span>how to</span>
          </button>
        </div>

        {/* Set dots */}
        <div className="flex gap-2 shrink-0">
          {Array.from({ length: setsPerExercise }).map((_, i) => (
            <div
              key={i === currentSet - 1 ? `dot-${i}-${currentSet}` : i}
              className={cn(
                'w-3 h-3 rounded-full transition-colors',
                i < currentSet
                  ? 'bg-foreground'
                  : i === currentSet
                    ? 'border-2 border-foreground'
                    : 'border border-muted-foreground/40'
              )}
              style={
                i === currentSet - 1 && currentSet > 0
                  ? { animation: 'dot-pop 280ms ease-out' }
                  : undefined
              }
            />
          ))}
        </div>

        {/* Target */}
        <div className="flex flex-col items-center shrink-0">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Target</span>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-2xl font-mono font-bold text-foreground">
              {currentTarget}
            </span>
            {exercise.unit === 'seconds' && (
              <span className="text-sm text-muted-foreground">s</span>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="flex flex-col items-center gap-2 w-40 shrink-0">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
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
            className="text-center text-4xl font-mono h-14 border-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder=""
            min={0}
          />
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={inputValue === ''}
            className="rounded-full w-12 h-12 active:scale-95 transition-transform"
          >
            <Check className="w-6 h-6" />
          </Button>
        </div>

        {/* Previous performance */}
        {previousRep !== null && (
          <div className="flex items-center gap-2 text-muted-foreground shrink-0">
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
            <TrendingUp
              className="w-24 h-24 text-green-500"
              style={{ animation: 'feedback-pop 400ms ease-out forwards' }}
            />
          ) : (
            <TrendingDown
              className="w-24 h-24 text-red-500"
              style={{ animation: 'feedback-pop 400ms ease-out forwards' }}
            />
          )}
        </div>
      )}

      <QuitConfirmDialog
        open={showQuitConfirm}
        onOpenChange={setShowQuitConfirm}
        onConfirm={onQuit}
      />
    </div>
  );
}

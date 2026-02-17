'use client';

import { MicroBreak } from './MicroBreak';
import { invoke } from '@tauri-apps/api/core';
import { MicroBreakExercise } from '../lib/types';

// Rotate through different micro-break exercises
const MICRO_BREAK_EXERCISES: MicroBreakExercise[] = [
  {
    name: 'Wall Slides',
    duration: 120, // 2 minutes
    instruction: 'Stand with your back against a wall. Slide your arms up and down, keeping contact with the wall.',
    youtubeId: 'Ev0wRJ6h9Ao',
  },
  {
    name: 'Shoulder Circles',
    duration: 60, // 1 minute
    instruction: 'Stand tall. Make large circles with your shoulders, forward and backward.',
  },
  {
    name: 'Neck Stretches',
    duration: 90, // 1.5 minutes
    instruction: 'Gently tilt your head to each side, holding for 15 seconds. Avoid forcing the stretch.',
  },
  {
    name: 'Wrist Extensions',
    duration: 60, // 1 minute
    instruction: 'Extend your arm forward, palm up. Gently pull your fingers back with the other hand.',
  },
];

export function MicroBreakScreen() {
  // Randomly select an exercise
  const exercise = MICRO_BREAK_EXERCISES[Math.floor(Math.random() * MICRO_BREAK_EXERCISES.length)];

  const handleDismiss = async () => {
    try {
      await invoke('dismiss_micro_break');
      console.log('Micro-break dismissed');
    } catch (err) {
      console.error('Failed to dismiss micro-break:', err);
    }
  };

  return <MicroBreak exercise={exercise} onDismiss={handleDismiss} />;
}

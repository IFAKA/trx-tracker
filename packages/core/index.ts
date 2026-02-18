/**
 * @traindaily/core
 *
 * Platform-agnostic business logic for TrainDaily workout tracking.
 * Used by both desktop (Tauri) and mobile (PWA) apps.
 */

// Types
export * from './lib/types';

// Constants
export * from './lib/constants';

// Business logic
export * from './lib/workout-utils';
export * from './lib/progression';
export * from './lib/schedule';

// Storage abstraction
export * from './lib/storage-interface';

// React hooks
export * from './hooks/useWorkout';
export * from './hooks/useSchedule';

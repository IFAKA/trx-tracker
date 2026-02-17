/**
 * @traindaily/ui
 *
 * Shared workout UI components used by both the PWA and Desktop app.
 */

// Primitive UI components
export * from './src/components/ui/button';
export * from './src/components/ui/card';
export * from './src/components/ui/input';
export * from './src/components/ui/progress';

// Shared utilities
export { cn } from './src/lib/utils';

// Workout screens
export { ExerciseDemo } from './src/components/ExerciseDemo';
export { ExerciseScreen } from './src/components/ExerciseScreen';
export { ExerciseTransition } from './src/components/ExerciseTransition';
export { HistoryScreen } from './src/components/HistoryScreen';
export { MicroBreak } from './src/components/MicroBreak';
export { MobilityFlow } from './src/components/MobilityFlow';
export { Onboarding } from './src/components/Onboarding';
export { RestDayScreen } from './src/components/RestDayScreen';
export type { MobilityHookState } from './src/components/RestDayScreen';
export { RestTimer } from './src/components/RestTimer';
export { SessionComplete } from './src/components/SessionComplete';
export { WeeklySplit } from './src/components/WeeklySplit';

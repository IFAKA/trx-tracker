# @traindaily/core

Platform-agnostic business logic for TrainDaily workout tracking. This package contains pure TypeScript logic and React hooks that work across desktop (Tauri), mobile (PWA), and future platforms.

## Philosophy

**Zero platform dependencies.** All code in this package is portable and testable. Platform-specific implementations (storage, audio, wake lock) are injected as dependencies.

## What's Inside

### Business Logic (`lib/`)

- **`types.ts`** - TypeScript definitions for workouts, exercises, sessions
- **`constants.ts`** - Exercise definitions, training schedule, defaults
- **`workout-utils.ts`** - Date formatting, week calculations, stats aggregation
- **`progression.ts`** - Progressive overload algorithm (auto-increment targets)
- **`schedule.ts`** - Training day detection (Mon/Wed/Fri)
- **`storage-interface.ts`** - Storage abstraction layer (platform-agnostic)

### React Hooks (`hooks/`)

- **`useWorkout.ts`** - Main workout state machine (idle → exercising → resting → complete)
- **`useProgression.ts`** - Target calculation for exercises
- **`useSchedule.ts`** - Training day status and week progress
- **`useWeeklyStats.ts`** - Weekly workout statistics

## Installation

```bash
# Internal monorepo package
npm install @traindaily/core
```

## Usage

### Basic Example (PWA)

```typescript
import { useWorkout, type StorageAdapter } from '@traindaily/core';
import { createLocalStorageAdapter } from '@/lib/storage';

function WorkoutScreen() {
  const storage = createLocalStorageAdapter();

  const workout = useWorkout({
    date: new Date(),
    storageAdapter: storage,
    audioCallbacks: {
      playStart: () => audio.play('start'),
      playSetLogged: (hit) => audio.play(hit ? 'success' : 'error'),
    },
    onWakeLockRequest: async () => {
      await navigator.wakeLock.request('screen');
    },
  });

  return (
    <div>
      {workout.state === 'idle' && (
        <button onClick={workout.startWorkout}>Start Workout</button>
      )}
      {/* ... rest of UI */}
    </div>
  );
}
```

### Storage Adapter (Platform-Specific)

Each platform implements the `StorageAdapter` interface:

```typescript
import { StorageAdapter, WorkoutData } from '@traindaily/core';

// PWA: localStorage implementation
export function createLocalStorageAdapter(): StorageAdapter {
  return {
    async loadWorkoutData(): Promise<WorkoutData> {
      const json = localStorage.getItem('traindaily_sessions');
      return json ? JSON.parse(json) : {};
    },
    async saveSession(dateKey, session) {
      const data = await this.loadWorkoutData();
      data[dateKey] = session;
      localStorage.setItem('traindaily_sessions', JSON.stringify(data));
    },
    // ... other methods
  };
}

// Desktop (Tauri): SQLite via Rust commands
export function createTauriStorageAdapter(): StorageAdapter {
  return {
    async loadWorkoutData(): Promise<WorkoutData> {
      return await invoke('get_all_sessions');
    },
    async saveSession(dateKey, session) {
      await invoke('insert_session', { dateKey, session });
    },
    // ... other methods
  };
}
```

### Progressive Overload Algorithm

The core logic automatically increases targets when you hit them:

```typescript
import { getTargets } from '@traindaily/core';

const targets = getTargets(
  'pushup',      // Exercise key
  5,             // Week number
  new Date(),    // Current date
  workoutData    // Historical data
);

console.log(targets); // [12, 10, 8] (3 sets, week 5+)
```

**Rules**:
- Weeks 1-4: 2 sets
- Weeks 5+: 3 sets
- Hit all targets → increase by +1 rep (or +5 seconds for plank)
- Miss target by 3+ reps → keep same target
- Otherwise → keep same target

### Schedule Detection

```typescript
import { isTrainingDay, nextTrainingDay } from '@traindaily/core';

const today = new Date('2026-02-17'); // Monday
isTrainingDay(today); // true (Mon/Wed/Fri)

const restDay = new Date('2026-02-18'); // Tuesday
isTrainingDay(restDay); // false

const next = nextTrainingDay(restDay); // Wednesday 2026-02-19
```

## Progressive Overload Algorithm

The `progression.ts` module implements automatic target increases:

```
Week 1-4: 2 sets per exercise
Week 5+:  3 sets per exercise

Initial targets:
  - Reps: [10, 8]
  - Plank: [20, 15] seconds

Auto-increment:
  - If all sets hit target → +1 rep (or +5 seconds)
  - If any set misses by 3+ → keep same
  - Otherwise → keep same

Example progression (Push-ups):
  Week 1: [10, 8]  → Actual: [12, 10]  → ✓ Hit targets
  Week 2: [11, 9]  → Actual: [11, 8]   → ✗ Missed 2nd set
  Week 3: [11, 9]  → Actual: [11, 9]   → ✓ Hit targets
  Week 4: [12, 10] → Actual: [12, 10]  → ✓ Hit targets
  Week 5: [13, 11, 9] → 3 sets now
```

## Testing

```bash
cd packages/core
npm test
```

Unit tests cover:
- Progressive overload algorithm
- Week calculation
- Training day detection
- Stats aggregation

## Type Safety

All exports are fully typed:

```typescript
import type {
  WorkoutData,
  WorkoutSession,
  ExerciseKey,
  WorkoutState,
  StorageAdapter,
  UseWorkoutOptions,
} from '@traindaily/core';
```

## Dependencies

**Runtime**:
- `date-fns` - Date utilities (portable, no platform dependencies)

**Peer Dependencies**:
- `react` - Required for hooks (provided by platform)

**Dev Dependencies**:
- `vitest` - Unit testing
- `typescript` - Type checking

## Platform Support

This package is designed to work on:
- ✅ **Desktop (Tauri)** - SQLite storage, native audio
- ✅ **PWA (Browser)** - localStorage, Web Audio API
- ✅ **Mobile (React Native)** - AsyncStorage, react-native-sound
- ✅ **Future platforms** - Any JavaScript runtime

## Principles

1. **No browser globals** - No `window`, `navigator`, `localStorage` (injected via adapters)
2. **No Node.js APIs** - No `fs`, `path`, `process` (pure JS/TS only)
3. **Testable** - Pure functions, no side effects in core logic
4. **Portable** - Works in any JavaScript runtime
5. **Type-safe** - Full TypeScript coverage

## File Structure

```
packages/core/
├── lib/
│   ├── types.ts              # TypeScript definitions
│   ├── constants.ts          # Exercise data, defaults
│   ├── workout-utils.ts      # Date/stats utilities
│   ├── progression.ts        # Progressive overload
│   ├── schedule.ts           # Training day logic
│   └── storage-interface.ts  # Storage abstraction
├── hooks/
│   ├── useWorkout.ts         # Main state machine
│   ├── useProgression.ts     # Target calculation
│   ├── useSchedule.ts        # Schedule status
│   └── useWeeklyStats.ts     # Stats aggregation
├── index.ts                  # Main export
├── package.json
├── README.md                 # This file
└── tsconfig.json
```

## License

Private - TrainDaily internal use only

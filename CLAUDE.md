# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server on localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npx playwright test  # E2E tests (requires dev server running)
npx playwright test e2e/workout-flow.spec.ts  # Single test file
```

## Architecture

**TrainDaily** is a PWA workout coach (Next.js 16 App Router + React 19 + TypeScript) paired with a Chrome extension that enforces training accountability.

### PWA (Next.js)

Single-page app driven by state, not routes. `app/page.tsx` renders `TodayScreen`, which orchestrates all screens based on workout state.

**State machine in `useWorkout.ts`:** `idle → exercising → resting → transitioning → complete`

- **`components/`** — UI screens: `TodayScreen` (orchestrator), `ExerciseScreen`, `RestTimer`, `ExerciseTransition`, `SessionComplete`, `RestDayScreen`, `MobilityFlow`, `MicroBreak`
- **`hooks/`** — State logic: `useWorkout` (main state machine), `useSchedule` (Mon/Wed/Fri training days), `useProgression` (auto-increment targets), `useWeeklyStats`, `useMobility`
- **`lib/`** — Pure business logic: exercise definitions in `constants.ts`, localStorage persistence in `storage.ts`, progressive overload algorithm in `progression.ts`, Web Audio sound cues in `audio.ts`

**Data flow:** `EXERCISES` array (constants) → hooks consume and manage state → localStorage persists as `{ dateKey: { exercise_key: [reps], logged_at, week_number } }`

**Progressive overload:** Week 1-4 = 2 sets, week 5+ = 3 sets. Targets auto-increase when all sets hit previous target.

### Chrome Extension (`extension/`)

Manifest V3 with three layers:
- **`background.js`** — Service worker: hourly alarms, workout-blocking logic
- **`content.js`** — Injects overlays (block screen on training days, micro-break UI)
- **`popup/`** — Dashboard showing workout status, break schedule, mic status
- **`native/`** — Native Messaging: Swift script checks CoreAudio mic status to skip breaks during calls

### UI Stack

- Tailwind CSS v4 with OKLCh color variables, dark mode only
- shadcn/ui (new-york style) — components in `components/ui/`
- `cn()` utility (clsx + tailwind-merge) from `lib/utils.ts`
- Custom keyframe animations defined in `globals.css`
- Mobile-first, touch-optimized (haptic feedback, wake lock, active:scale-95)

### Browser APIs Used

Wake Lock (screen on during workout), Vibration (haptic feedback), Web Audio (sound cues), localStorage (persistence). All wrapped in try-catch for graceful degradation.

## Conventions

- All interactive components use `'use client'` directive
- Path alias: `@/*` maps to project root
- No external state management — custom hooks only
- Icon library: Lucide React
- Date utilities: date-fns
- Charts: Recharts

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# PWA (root directory)
npm run dev          # Dev server on localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npx playwright test  # E2E tests (requires dev server running)

# Desktop App (packages/desktop)
cd packages/desktop
pnpm tauri dev       # Run desktop app in dev mode
pnpm tauri build     # Build production .dmg
```

## Architecture

**TrainDaily** is a monorepo with two apps that work together or independently:
1. **PWA** (Next.js) - Public web app at traindaily.vercel.app for workout tracking
2. **Desktop App** (Tauri) - Optional macOS app for enforcement + local sync server

### PWA (Next.js) - Mobile/Web Tracking

Single-page app driven by state, not routes. `app/page.tsx` renders `TodayScreen`, which orchestrates all screens based on workout state.

**State machine in `useWorkout.ts`:** `idle → exercising → resting → transitioning → complete`

- **`components/`** — UI screens: `TodayScreen` (orchestrator), `ExerciseScreen`, `RestTimer`, `ExerciseTransition`, `SessionComplete`, `RestDayScreen`, `MobilityFlow`, `MicroBreak`, `Onboarding`
- **`hooks/`** — State logic: `useWorkout` (main state machine), `useSchedule` (Mon/Wed/Fri training days), `useProgression` (auto-increment targets), `useWeeklyStats`, `useMobility`
- **`lib/`** — Pure business logic: exercise definitions in `constants.ts`, localStorage persistence in `storage.ts`, progressive overload algorithm in `progression.ts`, Web Audio sound cues in `audio.ts`, desktop sync client in `sync-client.ts`

**Data flow:** `EXERCISES` array (constants) → hooks consume and manage state → localStorage persists as `{ dateKey: { exercise_key: [reps], logged_at, week_number } }`

**Progressive overload:** Week 1-4 = 2 sets, week 5+ = 3 sets. Targets auto-increase when all sets hit previous target.

### Desktop App (`packages/desktop/`) - Optional macOS Enforcement

Tauri v2 app (Rust backend + React frontend in WebView):
- **Rust Backend** (`src-tauri/src/`) — SQLite database, HTTPS sync server, mic detection, app blocker, hourly overlays
- **React Frontend** (`src/`) — Reuses PWA components, Tauri-specific storage adapter, pairing QR code UI
- **Features** — Full-screen app blocking on training days, mic detection to defer breaks during calls, local network sync server
- **Multi-user** — Shared data at `/Users/Shared/TrainDaily/` works across macOS user accounts

### Sync Protocol (Optional)

Desktop runs HTTPS server (port 8841) with self-signed TLS cert. PWA scans QR code to pair, then syncs over local network. Bidirectional sync: log workouts on either device, both stay in sync. Works standalone without sync.

### UI Stack

- Tailwind CSS v4 with OKLCh color variables, dark mode only
- shadcn/ui (new-york style) — components in `components/ui/`
- `cn()` utility (clsx + tailwind-merge) from `lib/utils.ts`
- Custom keyframe animations defined in `globals.css`
- Mobile-first, touch-optimized (haptic feedback, wake lock, active:scale-95)

### Browser APIs Used

Wake Lock (screen on during workout), Vibration (haptic feedback), Web Audio (sound cues), localStorage (persistence). All wrapped in try-catch for graceful degradation.

## Workflow

- After making changes: always run `npm run build` and `npm run lint`, and if everything passes, commit and `git push` automatically. Do not wait for the user to ask.
- Before committing, always check `git status` and `git diff` for uncommitted changes in other packages (especially `packages/core/`) that the build depends on. Include them in the commit to avoid Vercel build failures.

## Conventions

- All interactive components use `'use client'` directive
- Path alias: `@/*` maps to project root
- No external state management — custom hooks only
- Icon library: Lucide React
- Date utilities: date-fns
- Charts: Recharts

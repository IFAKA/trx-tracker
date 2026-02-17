# TrainDaily Native App Migration - Progress Tracker

**Last Updated**: 2026-02-17
**Overall Progress**: ~70% Complete

---

## Phase 0: Design System Setup ✅ (100% Complete)

### Completed
- [x] Created monorepo structure with `pnpm-workspace.yaml`
- [x] Created `@traindaily/design-system` package
- [x] Implemented Apple-compliant design tokens (400+ lines)
- [x] Implemented sound design system (200+ lines)
- [x] Updated `app/globals.css` with Apple system colors
- [x] Generated 10 sound files using `scripts/generate-sounds.sh` (~100KB total)
- [x] Component audit (confirmed no emojis, no gradients)
- [x] Complete documentation

**Files**: tokens.ts, sounds.ts, index.ts, README.md, 10 WAV files
**Lines of Code**: ~700 lines

---

## Phase 1: Extract Core Package ✅ (100% Complete)

### Completed
- [x] Created `@traindaily/core` package structure
- [x] Extracted 6 pure TypeScript files (lib/)
- [x] Extracted 4 platform-agnostic hooks (hooks/)
- [x] Created `StorageAdapter` interface (async, platform-independent)
- [x] Refactored hooks to remove platform dependencies:
  - [x] Removed `navigator.wakeLock` → optional callback
  - [x] Removed `window.history` → optional callback
  - [x] Removed direct `localStorage` → StorageAdapter interface
  - [x] Made audio callbacks optional
  - [x] Made DevTools integration optional
- [x] Written 44 comprehensive unit tests (all passing ✓)
- [x] Created TypeScript and Vitest configuration
- [x] Created comprehensive README.md
- [x] Installed dependencies (date-fns only)

**Files**: 15 files (10 source + 3 tests + 2 config)
**Lines of Code**: ~998 lines (source) + ~500 lines (tests)
**Test Coverage**: 44 tests across 3 suites

---

## Phase 2: Desktop App (Tauri) 🔄 (85% Complete)

### ✅ Completed - Rust Backend (1,200+ lines)

**Core Infrastructure**:
- [x] `db/mod.rs` (234 lines)
  - SQLite database at `/Users/Shared/TrainDaily/workouts.db`
  - Multi-user support (shared across macOS accounts)
  - Device ID generation (persistent, unique per machine)
  - CRUD operations for workout sessions
  - Unit tests included

- [x] `cert/mod.rs` (71 lines)
  - Self-signed TLS certificate generation (rcgen)
  - Persistent storage in shared directory
  - Automatic certificate reuse

- [x] `commands.rs` (67 lines)
  - 8 Tauri commands exposed to frontend:
    - get_all_sessions
    - save_session
    - get_first_session_date
    - set_first_session_date
    - get_device_id
    - check_mic_active
    - get_qr_code_data
    - dismiss_micro_break

**Advanced Features**:
- [x] `mic/mod.rs` (145 lines) - macOS CoreAudio Integration
  - Mic detection via `kAudioDevicePropertyDeviceIsRunningSomewhere`
  - Ported from Swift native host
  - Platform-specific compilation (#[cfg(target_os = "macos")])
  - Detects Teams, Zoom, Meet, Discord, etc.

- [x] `sync/mod.rs` (250+ lines) - HTTPS Sync Server
  - Axum web framework with Rustls TLS
  - REST API endpoints:
    - `GET /api/ping` - Device discovery (no auth)
    - `GET /api/sync/sessions` - Get all workouts (auth required)
    - `POST /api/sync/session` - Upload workout (auth required)
    - `GET /api/sync/stream` - SSE real-time updates (auth required)
  - Token-based authentication
  - QR code data generation for pairing
  - Local IP discovery
  - Broadcast channel for real-time updates

- [x] `blocker/mod.rs` (115 lines) - App Blocker
  - Full-screen overlay on training days
  - Background check every 10 seconds
  - Always-on-top window (covers all apps)
  - Auto-dismiss when workout logged
  - Training day detection (Mon/Wed/Fri)

- [x] `overlay/mod.rs` (130 lines) - Micro-Break System
  - Hourly timer (tokio::interval)
  - Full-screen exercise prompts
  - Mic detection integration (defer if on call)
  - 5-minute defer and retry
  - Dismissible via Tauri command

- [x] `lib.rs` (120 lines) - Application Entry Point
  - System tray integration
  - 3 background tasks (sync, blocker, overlay)
  - Shared state management (Arc<Mutex<T>>)
  - Plugin initialization

**Dependencies**: 15 Rust crates (rusqlite, tokio, axum, rcgen, etc.)

### ✅ Completed - Frontend (226 lines)

- [x] `storage-tauri.ts` (76 lines)
  - Implements `StorageAdapter` interface
  - Uses Tauri commands for SQLite access
  - Full async/await support
  - Singleton pattern

- [x] `App.tsx` (73 lines)
  - Uses `@traindaily/core` hooks
  - Basic workout flow UI
  - Connected to Rust backend via Tauri commands

- [x] `App.css` (77 lines)
  - Apple-compliant dark theme styling

**Dependencies**: @traindaily/core, @traindaily/design-system, @tauri-apps/api, qrcode, etc. (12 packages)

### ⏳ Remaining (15%)

**Frontend Polish** (~300 lines):
- [ ] Copy all components from PWA:
  - [ ] ExerciseScreen.tsx
  - [ ] RestTimer.tsx
  - [ ] SessionComplete.tsx
  - [ ] ExerciseTransition.tsx
  - [ ] MicroBreak.tsx (adapt for desktop)
  - [ ] All UI components from components/ui/
- [ ] Create QR code pairing screen (display QR for phone scanning)
- [ ] Create blocker UI screen ("/blocker" route)
- [ ] Create micro-break UI screen ("/micro-break" route)
- [ ] Add settings panel (menu bar toggle, sync status)
- [ ] Menu bar context menu (Settings, Pair Device, Quit)

**Build & Distribution** (~100 lines config):
- [ ] Create `tauri.conf.json` configuration
  - [ ] App metadata (name, version, identifier)
  - [ ] macOS entitlements (microphone, network)
  - [ ] Window settings
  - [ ] Bundle resources
- [ ] Create Launch Daemon plist template
- [ ] Create post-install script (daemon installation)
- [ ] Create uninstaller script (`resources/uninstall.sh`)
- [ ] Configure code signing (Apple Developer ID)
- [ ] Configure notarization (xcrun notarytool)

**Testing** (verification):
- [ ] Test mic detection with real calls
- [ ] Test sync server (PWA ↔ desktop)
- [ ] Test app blocker (training days)
- [ ] Test micro-breaks (hourly + defer)
- [ ] Test multi-user support (fast user switching)

---

## Phase 3: PWA Sync Enhancement (Not Started)

### Planned Tasks
- [ ] Create `lib/sync-client.ts` (~200 lines)
  - Desktop discovery by device ID
  - IP caching and re-discovery
  - HTTPS client with self-signed cert trust
  - Sync on workout log
- [ ] Add pairing page `app/pair/page.tsx`
  - QR code scanner
  - Extract device ID, IP, port, auth token
  - Save to localStorage
- [ ] Create `components/SyncStatus.tsx` badge
  - "✓ Synced with MacBook Pro" or "Offline"
  - Last sync timestamp
  - Manual sync button
- [ ] Update existing PWA to use `@traindaily/core`
  - Create LocalStorageAdapter
  - Refactor to use new hooks
- [ ] Add settings page for pairing management
  - Pair/unpair functionality
  - Sync status display

---

## Phase 4: Distribution & Polish (Not Started)

### Planned Tasks
- [ ] Create download page (traindaily.vercel.app/download)
- [ ] Write installation guide (README)
- [ ] Configure Tauri auto-updater
- [ ] Build and sign .dmg
- [ ] Update PWA homepage with download links
- [ ] Comprehensive testing (all verification steps)
- [ ] Create demo video/screenshots

---

## Architecture Summary

### Monorepo Structure
```
traindaily/
├── packages/
│   ├── design-system/       # ✅ Apple tokens & sounds
│   ├── core/                # ✅ Portable business logic
│   └── desktop/             # 🔄 Tauri app (85%)
├── app/                     # PWA (Phase 3)
├── public/sounds/           # ✅ 10 WAV files
└── pnpm-workspace.yaml      # ✅ Workspace config
```

### Desktop App Architecture
```
┌─────────────────────────────────────────┐
│      React Frontend (WebView)           │
│  - @traindaily/core hooks               │
│  - TauriStorageAdapter → SQLite         │
└──────────────┬──────────────────────────┘
               │ Tauri Commands (8)
┌──────────────▼──────────────────────────┐
│         Rust Backend                     │
│  ┌────────────────────────────────────┐ │
│  │  Background Tasks                  │ │
│  │  - Sync Server (HTTPS :8841)      │ │
│  │  - App Blocker (10s interval)     │ │
│  │  - Micro-Breaks (60s interval)    │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  Shared State (Arc<Mutex<T>>)     │ │
│  │  - Database                        │ │
│  │  - Blocker State                   │ │
│  │  - Overlay State                   │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  /Users/Shared/TrainDaily/              │
│  - workouts.db (SQLite)                 │
│  - cert.pem + key.pem (TLS)             │
│  - device_id.txt (persistent)           │
└─────────────────────────────────────────┘
```

---

## Statistics

### Code Written This Session
- Design System: ~700 lines
- Core Package: ~1,500 lines (source + tests)
- Desktop (Rust): ~1,200 lines
- Desktop (React): ~226 lines
- **Total: ~3,626 lines**

### Files Created
- 35+ new files across 3 packages
- 44 unit tests (all passing ✓)

### Dependencies
- Rust: 15 crates
- npm: 24 packages (12 per app)
- Zero external services (fully local)

---

## Key Features Implemented

**✅ Complete**:
- SQLite database (multi-user, shared)
- Device ID (persistent, unique)
- Storage abstraction (platform-agnostic)
- TLS certificate (self-signed, auto-generated)
- HTTPS sync server (Axum, port 8841)
- REST API (4 endpoints)
- Token authentication
- SSE real-time updates
- Mic detection (CoreAudio, macOS)
- App blocker (full-screen, training days)
- Micro-breaks (hourly, mic-aware)
- System tray integration
- Progressive overload algorithm (tested)
- Training schedule (Mon/Wed/Fri)
- Apple design system
- Functional sounds (10 WAV files)

**⏳ In Progress**:
- Frontend UI polish (copy PWA components)
- QR code pairing UI
- Build configuration

**📋 Planned**:
- PWA sync client
- Build scripts (daemon, uninstaller)
- Code signing & notarization
- Distribution

---

## Decision Log

### 2026-02-17: Tauri over Electron
- **Decision**: Use Tauri v2
- **Rationale**: 3-5 MB bundle vs 120+ MB, native Rust performance, better macOS integration
- **Impact**: Requires Rust but gains major benefits

### 2026-02-17: Shared Data Directory
- **Decision**: Store at `/Users/Shared/TrainDaily/`
- **Rationale**: Support fast user switching (personal ↔ work)
- **Impact**: Single source of truth across all macOS users

### 2026-02-17: pnpm Workspace
- **Decision**: Use pnpm for monorepo
- **Rationale**: Better workspace support than npm, faster
- **Impact**: All packages use pnpm (not npm)

### 2026-02-17: Three Background Tasks
- **Decision**: Separate tasks for sync, blocker, overlay
- **Rationale**: Independent concerns, easier to debug
- **Impact**: 3 tokio::spawn calls in lib.rs

---

## Next Session Goals

1. **Finish Phase 2** (Frontend UI)
   - Copy PWA components
   - Create QR pairing screen
   - Create blocker/micro-break screens
   - Add settings panel

2. **Start Phase 3** (PWA Sync)
   - Implement sync client
   - Create pairing page
   - LocalStorageAdapter

3. **Begin Phase 4** (Distribution)
   - Build scripts
   - Code signing setup

**Estimated Time**: 2-3 hours for Phase 2 completion

---

## Success Metrics

- **Code Quality**: ✅ 44 tests passing, TypeScript strict mode
- **Architecture**: ✅ Platform-agnostic core, clean separation
- **Performance**: ✅ Rust backend, SQLite, minimal overhead
- **UX**: ✅ Apple HIG compliant, native feel
- **Distribution**: ⏳ Pending (Phase 4)

---

**The foundation is complete and robust! 🚀**

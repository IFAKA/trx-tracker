# TrainDaily

A no-excuses workout tracker with native desktop app (macOS) and mobile PWA that sync over local network. Progressive overload, accountability features, and hourly micro-breaks.

## What It Does

### Desktop App (macOS)
- **Full workout tracking** with 7 exercises, progressive overload, and rest timers
- **App blocker** - Full-screen overlay on training days (Mon/Wed/Fri) until workout logged
- **Hourly micro-breaks** - Prompts for mobility exercises (deferred during calls)
- **Mic detection** - Detects Teams/Zoom/Meet calls, skips breaks automatically
- **Local sync server** - HTTPS server for syncing with mobile
- **Multi-user support** - Works across macOS user accounts (personal ↔ work)
- **SQLite storage** - All data stored locally at `/Users/Shared/TrainDaily/`

### Mobile PWA
- **Same workout features** as desktop (full parity)
- **QR code pairing** - Scan once, syncs forever
- **Offline support** - Works without desktop, syncs when connected
- **Auto-sync** - Bidirectional sync with desktop over local network
- **Installable** - Add to home screen for native-like experience

## Architecture

```
traindaily/
├── packages/
│   ├── core/              # Platform-agnostic business logic (TypeScript)
│   ├── design-system/     # Apple design tokens & sounds
│   └── desktop/           # Tauri app (Rust backend + React frontend)
├── app/                   # Next.js PWA (mobile)
├── components/            # Shared React components
└── lib/                   # Shared utilities
```

## Prerequisites

### For Desktop App Development
1. **Rust** (latest stable)
   - Install: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
   - Verify: `rustc --version`

2. **Node.js** (v18+) and pnpm
   - Install Node: [nodejs.org](https://nodejs.org)
   - Install pnpm: `npm install -g pnpm`
   - Verify: `node --version && pnpm --version`

3. **macOS** (required for desktop app)
   - Xcode Command Line Tools: `xcode-select --install`

### For PWA Development Only
- Node.js (v18+)
- Any modern browser

## Setup

### Option 1: Desktop App (Full Features)

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/IFAKA/traindaily.git
   cd traindaily
   pnpm install
   ```

2. **Build and run desktop app**
   ```bash
   cd packages/desktop
   pnpm tauri dev
   ```

   This will:
   - Build the React frontend
   - Compile the Rust backend
   - Launch the desktop app
   - Create SQLite database at `/Users/Shared/TrainDaily/`

3. **Build production .dmg**
   ```bash
   cd packages/desktop
   pnpm tauri build
   ```

   Output: `src-tauri/target/release/bundle/dmg/TrainDaily_*.dmg`

4. **Pair mobile device**
   - Open desktop app
   - QR code appears on screen
   - Scan with phone camera
   - Automatic sync!

### Option 2: PWA Only (No Desktop)

1. **Clone and install**
   ```bash
   git clone https://github.com/IFAKA/traindaily.git
   cd traindaily
   pnpm install
   ```

2. **Run development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

3. **Install on mobile**
   - Visit `http://YOUR_COMPUTER_IP:3000` on phone
   - Tap "Add to Home Screen"

4. **Deploy to production**
   ```bash
   pnpm build
   vercel deploy --prod
   ```

## Key Features

### Progressive Overload
- Weeks 1-4: 2 sets per exercise
- Weeks 5+: 3 sets per exercise
- Auto-increments targets when you hit all reps

### Accountability
- **Desktop only**: Full-screen blocker on training days
- **Desktop only**: Can't close app until workout logged
- **Both platforms**: Track weekly progress, view stats

### Micro-Breaks (Desktop)
- Prompts every hour with mobility exercise
- 4 exercises: Wall slides, Thoracic rotation, Hip flexor stretch, Chest doorway stretch
- Auto-deferred if microphone active (Teams/Zoom detection)

### Sync (Desktop + Mobile)
- QR code pairing (one-time setup)
- HTTPS with self-signed cert
- Token-based authentication
- Router-agnostic (survives IP changes)
- Bidirectional (both devices can log workouts)

## Development

### Monorepo Structure

```bash
pnpm install              # Install all dependencies (root + all packages)

# Desktop app
cd packages/desktop
pnpm tauri dev            # Run in dev mode
pnpm tauri build          # Build production .dmg
pnpm build                # Build frontend only

# Core package (shared logic)
cd packages/core
pnpm test                 # Run 44 unit tests
pnpm test:ui              # Run tests with UI

# PWA
cd ../..                  # Back to root
pnpm dev                  # Run Next.js dev server
pnpm build                # Build for production
```

### Testing

```bash
# Unit tests (core package)
cd packages/core
pnpm test

# E2E tests (PWA)
cd ../..
pnpm dev                  # Start dev server first
npx playwright test       # Run all e2e tests
npx playwright test --ui  # Run with UI
```

### Tech Stack

**Desktop (Tauri)**
- Rust backend: Axum, Rustls, SQLite, CoreAudio
- React frontend: TypeScript, Vite, Tailwind CSS v4
- 15 Rust crates, 30+ npm packages

**Core Package**
- Pure TypeScript (no platform dependencies)
- Progressive overload algorithm (tested)
- Storage abstraction (works with SQLite, localStorage, AsyncStorage)

**PWA**
- Next.js 16 (App Router) + React 19
- Tailwind CSS v4 with OKLCh colors
- shadcn/ui components
- Web Audio, Wake Lock, Vibration APIs

## Uninstall (Desktop)

Removes all traces (app, data, certificates):

```bash
sudo bash /Applications/TrainDaily.app/Contents/Resources/uninstall.sh
```

Or manually:
```bash
sudo rm -rf /Applications/TrainDaily.app
sudo rm -rf /Users/Shared/TrainDaily
```

## Folder Structure

```
packages/desktop/src-tauri/src/
├── lib.rs              # App entry, spawns 3 background tasks
├── commands.rs         # 8 Tauri commands exposed to frontend
├── db/mod.rs          # SQLite wrapper
├── cert/mod.rs        # Self-signed TLS certificate generation
├── sync/mod.rs        # HTTPS server (Axum + Rustls)
├── mic/mod.rs         # CoreAudio mic detection (macOS)
├── blocker/mod.rs     # App blocker (training day enforcement)
└── overlay/mod.rs     # Micro-break system (hourly prompts)

packages/desktop/src/
├── components/        # React UI (copied from PWA)
├── hooks/            # Platform-specific hook wrappers
├── lib/
│   ├── storage-tauri.ts   # SQLite adapter
│   ├── audio.ts          # Web Audio sound engine
│   └── sync-client.ts    # Desktop discovery & sync
└── App.tsx           # Main app with routing

packages/core/
├── lib/              # Business logic (progression, schedule, utils)
├── hooks/            # Platform-agnostic hooks
└── __tests__/        # 44 unit tests

app/                  # Next.js PWA
├── page.tsx          # Main workout interface
└── pair/page.tsx     # QR code pairing
```

## Troubleshooting

### Desktop App

**"cargo: command not found"**
- Install Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- Restart terminal

**Build fails with "missing xcrun"**
- Install Xcode Command Line Tools: `xcode-select --install`

**"Failed to initialize database"**
- Check permissions: `ls -la /Users/Shared/TrainDaily/`
- Should be readable/writable by all users

**Mic detection not working**
- Grant microphone permission: System Preferences > Security & Privacy > Microphone
- Check logs: `tail -f /Users/Shared/TrainDaily/logs/daemon.log`

### PWA

**"Port 3000 already in use"**
- Kill process: `lsof -ti:3000 | xargs kill`
- Or use different port: Edit `package.json` dev script

**Sync not working**
- Verify desktop app is running
- Check both devices on same WiFi network
- Try re-pairing (scan QR code again)
- Check browser console for errors

**QR code doesn't scan**
- Ensure phone camera can access URL (use phone's default camera app)
- Verify QR contains valid URL starting with `https://traindaily.vercel.app/pair?`

## Documentation

- **MIGRATION_COMPLETE.md** - Full migration documentation
- **MIGRATION_PROGRESS.md** - Phase-by-phase progress tracker
- **packages/core/README.md** - Core package API docs
- **packages/desktop/README.md** - Desktop app architecture

## License

MIT

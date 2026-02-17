# Project Cleanup (Feb 17, 2026)

## Removed Files and Directories

### 1. Chrome Extension (`extension/`)
**Reason**: Replaced by Tauri desktop app in `packages/desktop/`

The old Chrome extension architecture has been fully migrated to a native macOS desktop app using Tauri. The extension required complex setup (native host installer, Developer mode) and had limitations (couldn't detect native app mic usage).

**Deleted files**:
- `extension/background.js` - Service worker (replaced by Rust background tasks)
- `extension/content.js` - Content script (replaced by Tauri overlays)
- `extension/popup/` - Extension popup (replaced by desktop GUI)
- `extension/native/` - Native messaging host (replaced by Rust CoreAudio)
- `extension/manifest.json` - Extension manifest
- `extension/install-native-host.sh` - Installer (no longer needed)
- `extension/uninstall-native-host.sh` - Uninstaller (no longer needed)

### 2. Test Artifacts
**Reason**: Build artifacts should not be committed to git

**Deleted directories**:
- `test-results/` - Playwright test results (now in .gitignore)
- `playwright-report/` - Playwright HTML reports (now in .gitignore)
- `.playwright-mcp/` - Temporary Playwright MCP logs (now in .gitignore)

### 3. Temporary Screenshots
**Reason**: Screenshots belong in documentation folder

**Moved to `docs/screenshots/`**:
- `devtools-panel.png`
- `exercise-fixed.png`
- `exercise-screen.png`
- `hip-flexor-stretch.png`
- `hip-flexor-v2.png`
- `inverted-row-door.png`
- `inverted-row-illustration.png`
- `today-fixed.png`
- `today-screen.png`

### 4. Migration Documentation
**Reason**: Migration docs belong in documentation folder

**Moved to `docs/`**:
- `MIGRATION_COMPLETE.md` - Complete migration documentation
- `MIGRATION_PROGRESS.md` - Phase-by-phase progress tracker

## Updated Files

### `.gitignore`
- Added `.playwright-mcp/` to prevent committing temporary Playwright logs

### `CLAUDE.md`
- Updated architecture section to reflect Tauri desktop app (removed Chrome extension references)
- Added desktop app commands (`pnpm tauri dev`, `pnpm tauri build`)
- Updated file paths and descriptions

## Current Project Structure

```
traindaily/
├── app/                    # Next.js PWA (pages)
├── components/             # Shared React components (PWA)
├── hooks/                  # React hooks (PWA)
├── lib/                    # Utilities and business logic (PWA)
├── e2e/                    # Playwright E2E tests
├── public/                 # Static assets
├── packages/
│   └── desktop/           # Tauri macOS app
│       ├── src/           # React frontend
│       └── src-tauri/     # Rust backend
├── docs/                   # Documentation and screenshots
│   ├── screenshots/       # UI screenshots
│   ├── MIGRATION_COMPLETE.md
│   ├── MIGRATION_PROGRESS.md
│   └── CLEANUP.md         # This file
├── scripts/               # Build scripts
├── README.md              # Main documentation
├── CLAUDE.md              # AI assistant guidance
└── package.json           # PWA dependencies
```

## Duplicate Components (Intentional)

The following components exist in both `components/` (PWA) and `packages/desktop/src/components/` (Desktop):

- `TodayScreen.tsx`
- `ExerciseScreen.tsx`
- `RestTimer.tsx`
- `ExerciseTransition.tsx`
- `SessionComplete.tsx`
- `RestDayScreen.tsx`
- `MicroBreak.tsx`
- `MobilityFlow.tsx`
- `Onboarding.tsx`
- `ExerciseDemo.tsx`
- `ui/*` (shadcn/ui components)

**Why duplicated?**
- Desktop and PWA have slightly different storage adapters (Tauri vs localStorage)
- Platform-specific features (desktop has sync server, PWA has QR scanning)
- Both apps need to work independently

**Future consideration**: Could extract shared components to `packages/core` to reduce duplication while handling platform differences.

## Impact

- **Reduced repository size**: Removed ~100KB of unused code
- **Clearer structure**: All docs in `docs/`, all code in proper directories
- **No feature loss**: All functionality preserved, just better organized
- **Easier onboarding**: New contributors see only relevant code (no old extension confusion)

# TRX Tracker

A no-excuses workout coach: PWA for guided TRX workouts with progressive overload, paired with a Chrome extension that blocks browsing until you train and enforces hourly micro-break mobility exercises.

## What It Does

**PWA (the app)**
- Guided TRX workout flow with 7 exercises, set/rep tracking, and rest timers
- Progressive overload — automatically suggests weight/rep increases
- Session history and weekly stats
- Sound cues and haptic feedback
- Installable on your phone (standalone PWA)

**Chrome Extension**
- Blocks all browsing on training days until workout is logged
- Hourly micro-break overlays with mobility exercises (wall slides, thoracic rotation, hip flexor stretch, chest doorway stretch)
- Auto mic detection — suppresses breaks during calls (Teams, Zoom, etc.) so you don't get embarrassed on screen share

## Setup

### 1. Run the PWA

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On mobile, use "Add to Home Screen" to install as a standalone app.

### 2. Load the Chrome Extension

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** and select the `extension/` folder
4. Note your extension ID (shown under the extension name)

### 3. Set Up Mic Detection (macOS only)

The extension uses a Native Messaging host to detect active microphone usage via CoreAudio. This lets it skip micro-breaks while you're on a call.

```bash
./extension/install-native-host.sh
```

Then update the extension ID in the installed manifest:

```bash
# Open the manifest and replace EXTENSION_ID with your actual ID from step 2
nano ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/com.trx.mic_check.json
```

Change `"allowed_origins": ["chrome-extension://EXTENSION_ID/"]` to your actual extension ID.

> If you skip this step, the extension still works — mic detection will just be inactive and all breaks fire normally.

## Project Structure

```
app/                  # Next.js app (pages, layout, PWA manifest)
components/           # React components (TodayScreen, ExerciseScreen, RestTimer, etc.)
hooks/                # Custom hooks (useWorkout, useProgression, useSchedule, etc.)
lib/                  # Types, constants, utilities
extension/            # Chrome extension
  ├── background.js   # Service worker (alarms, workout blocking, mic check)
  ├── content.js      # Injected UI (block overlay, micro-break overlay)
  ├── popup/          # Extension popup (status dashboard)
  ├── native/         # Native Messaging host (CoreAudio mic detection)
  └── install-native-host.sh
```

## Tech Stack

- Next.js, React 19, TypeScript, Tailwind CSS
- Radix UI + shadcn/ui components
- Recharts (stats), date-fns, Lucide icons
- Chrome Extension Manifest V3
- CoreAudio (via Swift) for mic detection

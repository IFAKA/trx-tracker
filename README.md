# TrainDaily

A no-excuses workout coach: PWA for guided workouts with progressive overload, paired with a Chrome extension that blocks browsing until you train and enforces hourly micro-break mobility exercises.

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

## Prerequisites

Before you start, make sure you have these installed on your computer:

1. **Node.js** (version 18 or higher)
   - Download from [nodejs.org](https://nodejs.org)
   - This includes npm (Node Package Manager) which you'll need to run commands
   - To check if you have it: Open Terminal (Mac) or Command Prompt (Windows) and type `node --version`

2. **Google Chrome** or **Brave Browser**
   - Download from [google.com/chrome](https://www.google.com/chrome) or [brave.com](https://brave.com)

3. **Terminal/Command Line basics**
   - Mac: Use the Terminal app (in Applications > Utilities)
   - Windows: Use Command Prompt or PowerShell
   - You'll need to type commands and press Enter

## Setup

### Step 1: Download and Run the PWA

The PWA (Progressive Web App) is the main workout tracker that runs in your browser.

1. **Download this project**
   - Click the green "Code" button on GitHub and select "Download ZIP"
   - Unzip the file to a location you'll remember (like your Desktop or Documents folder)

2. **Open Terminal/Command Prompt**
   - Mac: Press `Cmd + Space`, type "Terminal", and press Enter
   - Windows: Press `Windows + R`, type "cmd", and press Enter

3. **Navigate to the project folder**
   - Type `cd` followed by a space
   - Drag the unzipped folder into the Terminal window (this auto-fills the path)
   - Press Enter
   - Example: `cd /Users/yourname/Desktop/traindaily`

4. **Install dependencies**
   - Type: `npm install`
   - Press Enter
   - Wait for it to finish (this downloads all required code libraries, may take 1-2 minutes)

5. **Start the app**
   - Type: `npm run dev`
   - Press Enter
   - You should see "Ready started server on 0.0.0.0:3000"

6. **Open the app in your browser**
   - Go to [http://localhost:3000](http://localhost:3000)
   - You should see the TrainDaily workout interface

7. **Install on mobile (optional)**
   - On your phone's browser, visit `http://YOUR_COMPUTER_IP:3000`
   - To find your computer's IP: Mac - System Preferences > Network, Windows - type `ipconfig` in Command Prompt
   - Tap "Add to Home Screen" to install as a standalone app

### Step 2: Install the Chrome Extension

The extension blocks browsing on training days and shows hourly micro-break exercises.

1. **Open Chrome Extensions page**
   - Open Google Chrome or Brave
   - In the address bar, type: `chrome://extensions`
   - Press Enter

2. **Enable Developer Mode**
   - Look for a toggle switch in the top-right corner that says "Developer mode"
   - Click it so it turns blue (ON)
   - You should now see new buttons appear: "Load unpacked", "Pack extension", "Update"

3. **Load the extension**
   - Click the "Load unpacked" button
   - A file picker window will open
   - Navigate to where you unzipped TrainDaily
   - Open the `extension` folder (you should see files like `manifest.json`, `background.js` inside)
   - Click "Select" or "Open"

4. **Save your Extension ID (important for Step 3)**
   - You should now see "TrainDaily" in your extensions list
   - Below the extension name, you'll see a line like "ID: abcdefghijklmnop..."
   - Copy this ID somewhere (you'll need it in Step 3)
   - Example: `abcdefghijklmnopqrstuvwxyz123456`

The extension is now active. It will block browsing on training days (Mon/Wed/Fri) until you log your workout.

### Step 3: Set Up Mic Detection (macOS only, optional)

This feature detects when your microphone is active (Zoom, Teams, etc.) and skips micro-breaks so you don't get interrupted during calls.

**Windows users:** Skip this step. Mic detection is only available on macOS.

**macOS users:** You have two options:

#### Option A: Automatic Setup (recommended)

1. **Open Terminal** (if not already open)

2. **Make sure you're in the project folder**
   - Type: `pwd` and press Enter
   - It should show the path to the traindaily folder
   - If not, navigate back using `cd /path/to/traindaily`

3. **Run the installer script**
   - Type: `./extension/install-native-host.sh`
   - Press Enter
   - If you see "Permission denied", first type: `chmod +x extension/install-native-host.sh` and press Enter, then try again

4. **Update the extension ID**
   - Type: `open ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/com.trx.mic_check.json`
   - Press Enter
   - This opens the file in TextEdit
   - Find the line: `"allowed_origins": ["chrome-extension://EXTENSION_ID/"]`
   - Replace `EXTENSION_ID` with the actual ID you saved from Step 2
   - Example: `"allowed_origins": ["chrome-extension://abcdefghijklmnopqrstuvwxyz123456/"]`
   - Save the file (Cmd + S) and close TextEdit

5. **If using Brave browser**
   - The file location is slightly different
   - Type: `open ~/Library/Application\ Support/BraveSoftware/Brave-Browser/NativeMessagingHosts/com.trx.mic_check.json`
   - Follow the same steps to replace the extension ID

#### Option B: Skip This Step

If this seems too technical, you can skip it entirely. The extension will still work perfectly, but micro-breaks will appear every hour even during calls. You can manually dismiss them by clicking "Skip Break".

## Troubleshooting

### "npm: command not found"
- You don't have Node.js installed
- Download and install from [nodejs.org](https://nodejs.org)
- Close and reopen Terminal/Command Prompt after installing

### "Cannot find module" errors
- Run `npm install` again
- Make sure you're in the correct folder (the one containing `package.json`)

### Port 3000 is already in use
- Something else is using port 3000
- Stop the other app, or edit `package.json` to use a different port
- Or kill the process: `lsof -ti:3000 | xargs kill` (Mac) or `netstat -ano | findstr :3000` (Windows)

### Extension doesn't appear in Chrome
- Make sure you selected the `extension` folder, not the root `traindaily` folder
- Check that Developer mode is enabled (toggle should be blue/on)
- Try clicking "Update" button on the extensions page

### Micro-breaks still appear during calls (macOS)
- Double-check the extension ID in the manifest file matches exactly
- Make sure there are no extra spaces or quotes
- Restart Chrome after editing the manifest
- Grant microphone permissions to Chrome in System Preferences > Security & Privacy > Microphone

### Browser blocks are not working
- Check that today is a training day (Monday, Wednesday, or Friday)
- Make sure you haven't already logged a workout today
- Reload the extension: go to `chrome://extensions` and click the reload icon

### Need more help?
- Check the browser console for errors: Right-click > Inspect > Console tab
- Check extension errors: `chrome://extensions` > Details > Errors button

## How It Works (For Developers)

### Folder Structure

```
app/                  # Next.js app (pages, layout, PWA manifest)
components/           # React components (TodayScreen, ExerciseScreen, RestTimer, etc.)
hooks/                # Custom hooks (useWorkout, useProgression, useSchedule, etc.)
lib/                  # Types, constants, utilities
extension/            # Chrome extension files
  ├── background.js   # Service worker (alarms, workout blocking, mic check)
  ├── content.js      # Injected UI (block overlay, micro-break overlay)
  ├── popup/          # Extension popup (status dashboard)
  ├── native/         # Native Messaging host (CoreAudio mic detection)
  └── install-native-host.sh
```

### Key Files Explained

- **app/page.tsx** - Main workout interface
- **components/TodayScreen.tsx** - Orchestrates all workout screens
- **hooks/useWorkout.ts** - State machine for workout flow (idle → exercising → resting → complete)
- **extension/background.js** - Runs in the background, manages alarms and blocking logic
- **extension/content.js** - Injects overlays onto web pages
- **extension/native/mic_check.swift** - Checks if your microphone is in use

### Tech Stack

**Web App:**
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 with OKLCh colors
- shadcn/ui components (New York style)
- Recharts for stats visualization
- date-fns for date handling
- Lucide React for icons

**Chrome Extension:**
- Manifest V3
- Service worker architecture
- Native Messaging for mic detection

**Browser APIs:**
- Wake Lock (keeps screen on during workout)
- Vibration API (haptic feedback)
- Web Audio (sound cues)
- localStorage (data persistence)

### Development Commands

```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Build for production
npm run lint         # Run ESLint
npx playwright test  # Run end-to-end tests (requires dev server running)
```

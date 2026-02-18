# TrainDaily — Desktop App

macOS app for workout enforcement, micro-breaks, and local sync with the TrainDaily PWA.

## Installation

1. Download the latest `TrainDaily_x.x.x_aarch64.dmg`
2. Open the DMG and drag **TrainDaily.app** into your **Applications** folder
3. Eject the DMG

### "TrainDaily is damaged and can't be opened"

macOS blocks apps that aren't signed by a paid Apple Developer account. This is a known limitation for indie/open-source apps distributed outside the App Store.

**Fix — run this once in Terminal:**

```bash
xattr -cr /Applications/TrainDaily.app
```

Then open TrainDaily normally. You won't need to do this again.

> To open Terminal: press `Cmd + Space`, type "Terminal", hit Enter.

## Features

- Full-screen app blocking on training days
- Hourly micro-break overlays
- Mic detection — pauses breaks during calls
- Local network sync with the TrainDaily PWA (scan QR code to pair)
- Works across macOS user accounts via `/Users/Shared/TrainDaily/`

## Uninstall

```bash
sudo rm -rf /Applications/TrainDaily.app /Users/Shared/TrainDaily/ /Library/LaunchAgents/com.traindaily.desktop.plist && rm -rf ~/Library/Application\ Support/com.traindaily.desktop ~/Library/LaunchAgents/com.traindaily.desktop.plist ~/Library/Preferences/com.traindaily.desktop.plist ~/Library/Caches/com.traindaily.desktop ~/Library/Logs/com.traindaily.desktop
```

## Development

```bash
cd packages/desktop
pnpm tauri dev     # Run in dev mode
pnpm tauri build   # Build .dmg
```

Requires Rust, Xcode Command Line Tools, and Node.js. See [Tauri prerequisites](https://tauri.app/start/prerequisites/).

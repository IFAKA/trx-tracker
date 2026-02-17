#!/bin/bash
# Uninstall TRX Mic Check Native Messaging Host from Chrome and Brave
set -euo pipefail

HOST_NAME="com.trx.mic_check"
CHROME_PATH="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts/$HOST_NAME.json"
BRAVE_PATH="$HOME/Library/Application Support/BraveSoftware/Brave-Browser/NativeMessagingHosts/$HOST_NAME.json"

echo "=== TRX Mic Check — Native Host Uninstaller ==="

FOUND=0

if [ -f "$CHROME_PATH" ]; then
  rm "$CHROME_PATH"
  echo "[OK] Removed Chrome native messaging manifest"
  FOUND=1
fi

if [ -f "$BRAVE_PATH" ]; then
  rm "$BRAVE_PATH"
  echo "[OK] Removed Brave native messaging manifest"
  FOUND=1
fi

if [ "$FOUND" -eq 0 ]; then
  echo "[OK] No native messaging manifests found — nothing to remove."
fi

echo ""
echo "To fully remove the extension:"
echo "  1. Open chrome://extensions or brave://extensions"
echo "  2. Find 'TrainDaily' and click Remove"
echo ""
echo "That's it — no other files are left on your system."

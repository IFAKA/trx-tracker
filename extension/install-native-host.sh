#!/bin/bash
# Install TRX Mic Check Native Messaging Host for Chrome
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NATIVE_DIR="$SCRIPT_DIR/native"
HOST_NAME="com.trx.mic_check"
MANIFEST_SRC="$NATIVE_DIR/$HOST_NAME.json"
SCRIPT_PATH="$NATIVE_DIR/trx_mic_check.sh"
NM_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"

echo "=== TRX Mic Check — Native Host Installer ==="

# 1. Make the mic check script executable
chmod +x "$SCRIPT_PATH"
echo "[OK] Made trx_mic_check.sh executable"

# 2. Create NM hosts directory if needed
mkdir -p "$NM_DIR"

# 3. Copy manifest and patch the path to point to the actual script location
sed "s|/PLACEHOLDER/trx_mic_check.sh|$SCRIPT_PATH|" "$MANIFEST_SRC" > "$NM_DIR/$HOST_NAME.json"
echo "[OK] Installed manifest to $NM_DIR/$HOST_NAME.json"

# 4. Remind user to update extension ID
echo ""
echo "IMPORTANT: After loading the extension in Chrome, update the allowed_origins"
echo "in $NM_DIR/$HOST_NAME.json with your actual extension ID:"
echo ""
echo '  "allowed_origins": ["chrome-extension://YOUR_ACTUAL_ID/"]'
echo ""
echo "You can find your extension ID at chrome://extensions"
echo ""
echo "Done!"

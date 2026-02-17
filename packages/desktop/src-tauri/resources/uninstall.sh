#!/bin/bash
set -e

echo "==============================================="
echo "  TrainDaily Uninstaller"
echo "==============================================="
echo ""
echo "This will permanently delete:"
echo "  - Application (/Applications/TrainDaily.app)"
echo "  - Shared data (/Users/Shared/TrainDaily/)"
echo "  - All workout history and certificates"
echo ""
read -p "Continue? (y/N): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
  echo "Uninstall cancelled"
  exit 0
fi

echo ""
echo "Removing shared data directory..."
sudo rm -rf /Users/Shared/TrainDaily

echo "Removing application..."
sudo rm -rf /Applications/TrainDaily.app

echo "Removing user caches..."
rm -rf ~/Library/Logs/TrainDaily 2>/dev/null || true
rm -rf ~/Library/Caches/com.traindaily.desktop 2>/dev/null || true

echo ""
echo "✓ TrainDaily fully removed. Zero traces left."
echo ""

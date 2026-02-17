#!/bin/bash

# Generate sound files for TrainDaily
# Uses macOS built-in 'afplay' and 'say' commands to generate simple audio files
# Requires: ffmpeg (install via: brew install ffmpeg)

set -e

SOUNDS_DIR="/Users/faka/code/projects/mobile/traindaily/public/sounds"
mkdir -p "$SOUNDS_DIR"

echo "Generating TrainDaily sound files..."
echo "===================================="

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "Error: ffmpeg is required but not installed."
    echo "Install with: brew install ffmpeg"
    exit 1
fi

# Function to generate a simple tone
generate_tone() {
    local filename="$1"
    local frequency="$2"
    local duration="$3"
    local description="$4"

    echo "Generating $filename ($description)..."
    ffmpeg -f lavfi -i "sine=frequency=$frequency:duration=$duration" \
           -ar 44100 -ac 1 -y "$SOUNDS_DIR/$filename" 2>/dev/null
}

# Function to generate a multi-tone sound (chord)
generate_chord() {
    local filename="$1"
    local freq1="$2"
    local freq2="$3"
    local freq3="$4"
    local duration="$5"
    local description="$6"

    echo "Generating $filename ($description)..."
    ffmpeg -f lavfi -i "sine=frequency=$freq1:duration=$duration" \
           -f lavfi -i "sine=frequency=$freq2:duration=$duration" \
           -f lavfi -i "sine=frequency=$freq3:duration=$duration" \
           -filter_complex "[0:a][1:a][2:a]amix=inputs=3:duration=shortest:normalize=0" \
           -ar 44100 -ac 1 -y "$SOUNDS_DIR/$filename" 2>/dev/null
}

# 1. Success sound - Ascending chime (C major triad: C-E-G)
generate_chord "success.wav" 523 659 784 0.1 "Success chime (100ms)"

# 2. Complete sound - Triumphant chime (C major chord, longer)
generate_chord "complete.wav" 523 659 784 0.2 "Session complete (200ms)"

# 3. Click sound - Subtle tap (higher pitch, short)
generate_tone "click.wav" 800 0.05 "Button click (50ms)"

# 4. Tap sound - Soft tap (slightly lower pitch)
generate_tone "tap.wav" 600 0.04 "Increment/decrement tap (40ms)"

# 5. Info sound - Neutral tone
generate_tone "info.wav" 440 0.08 "Information tone (80ms)"

# 6. Error sound - Descending buzz (lower frequencies)
ffmpeg -f lavfi -i "sine=frequency=200:duration=0.1" \
       -af "afade=t=in:st=0:d=0.01,afade=t=out:st=0.09:d=0.01,vibrato=f=5:d=0.5" \
       -ar 44100 -ac 1 -y "$SOUNDS_DIR/error.wav" 2>/dev/null
echo "Generating error.wav (Error buzz 100ms)..."

# 7. Warning sound - Alert tone
generate_tone "warning.wav" 880 0.12 "Warning tone (120ms)"

# 8. Tick sound - Clock tick (very short)
generate_tone "tick.wav" 1000 0.03 "Timer tick (30ms)"

# 9. Timer end sound - Bell (longer tone with fade)
ffmpeg -f lavfi -i "sine=frequency=880:duration=0.15" \
       -af "afade=t=in:st=0:d=0.01,afade=t=out:st=0.13:d=0.02" \
       -ar 44100 -ac 1 -y "$SOUNDS_DIR/timer-end.wav" 2>/dev/null
echo "Generating timer-end.wav (Timer complete bell 150ms)..."

# 10. Whoosh sound - Screen transition (white noise burst)
ffmpeg -f lavfi -i "anoisesrc=duration=0.07:color=white:amplitude=0.3" \
       -af "afade=t=in:st=0:d=0.01,afade=t=out:st=0.06:d=0.01,highpass=f=400,lowpass=f=2000" \
       -ar 44100 -ac 1 -y "$SOUNDS_DIR/whoosh.wav" 2>/dev/null
echo "Generating whoosh.wav (Screen transition 70ms)..."

echo ""
echo "✓ All sound files generated successfully!"
echo ""
echo "Files created in: $SOUNDS_DIR"
ls -lh "$SOUNDS_DIR"

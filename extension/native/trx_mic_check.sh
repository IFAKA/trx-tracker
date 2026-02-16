#!/bin/bash
# TRX Mic Check - Native Messaging Host
# Checks if macOS microphone is actively in use via CoreAudio.
# Communicates with Chrome extension using Native Messaging protocol
# (4-byte little-endian length prefix + JSON).

# Read one NM message (we don't actually need the content, just the trigger)
read_message() {
  # Read 4-byte length header
  local len_bytes
  len_bytes=$(dd bs=1 count=4 2>/dev/null | xxd -p)
  [ -z "$len_bytes" ] && return 1
  # Convert little-endian hex to decimal
  local b0 b1 b2 b3
  b0=$((16#${len_bytes:0:2}))
  b1=$((16#${len_bytes:2:2}))
  b2=$((16#${len_bytes:4:2}))
  b3=$((16#${len_bytes:6:2}))
  local length=$(( b0 + (b1 << 8) + (b2 << 16) + (b3 << 24) ))
  # Read the JSON payload (discard it — any message means "check mic")
  dd bs=1 count="$length" 2>/dev/null > /dev/null
}

# Send a NM response
send_message() {
  local msg="$1"
  local len=${#msg}
  # Write 4-byte little-endian length
  printf "\\x$(printf '%02x' $((len & 0xFF)))"
  printf "\\x$(printf '%02x' $(((len >> 8) & 0xFF)))"
  printf "\\x$(printf '%02x' $(((len >> 16) & 0xFF)))"
  printf "\\x$(printf '%02x' $(((len >> 24) & 0xFF)))"
  printf '%s' "$msg"
}

# Check microphone status using CoreAudio via Swift
check_mic() {
  /usr/bin/swift - 2>/dev/null <<'SWIFT'
import CoreAudio
import Foundation

var deviceID = AudioDeviceID(0)
var size = UInt32(MemoryLayout<AudioDeviceID>.size)
var address = AudioObjectPropertyAddress(
    mSelector: kAudioHardwarePropertyDefaultInputDevice,
    mScope: kAudioObjectPropertyScopeGlobal,
    mElement: kAudioObjectPropertyElementMain
)

var status = AudioObjectGetPropertyData(
    AudioObjectID(kAudioObjectSystemObject),
    &address, 0, nil, &size, &deviceID
)
guard status == noErr, deviceID != kAudioObjectUnknown else {
    print("false")
    exit(0)
}

var isRunning: UInt32 = 0
size = UInt32(MemoryLayout<UInt32>.size)
address.mSelector = kAudioDevicePropertyDeviceIsRunningSomewhere
address.mScope = kAudioObjectPropertyScopeGlobal

status = AudioObjectGetPropertyData(deviceID, &address, 0, nil, &size, &isRunning)
guard status == noErr else {
    print("false")
    exit(0)
}

print(isRunning != 0 ? "true" : "false")
SWIFT
}

# Main loop — handle one message per invocation (Chrome spawns us per connect)
while true; do
  read_message || exit 0
  mic_active=$(check_mic)
  send_message "{\"micActive\":${mic_active}}"
done

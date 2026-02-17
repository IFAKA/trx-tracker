# TrainDaily Sound Files

This directory contains functional sound files for the TrainDaily app, following Apple's audio design principles.

## Sound Design Principles

- **Subtle, not musical**: Short functional sounds (30-200ms)
- **Clear volume hierarchy**: Success > Info > Click
- **Semantic pairing**: Same sound for same action type
- **Respect accessibility**: Honor `prefers-reduced-motion` and allow user disable

## Sound Files

### Success Sounds
- **success.wav** (100ms) - Ascending C major triad, workout logged
- **complete.wav** (200ms) - Triumphant C major chord, session complete

### UI Interactions
- **click.wav** (50ms) - Subtle tap, standard button press
- **tap.wav** (40ms) - Soft tap, increment/decrement buttons

### Information
- **info.wav** (80ms) - Neutral tone, notifications

### Errors/Warnings
- **error.wav** (100ms) - Descending buzz, validation failures
- **warning.wav** (120ms) - Alert tone, warning messages

### Timers
- **tick.wav** (30ms) - Subtle clock tick, countdown
- **timer-end.wav** (150ms) - Bell tone, rest timer complete

### Transitions
- **whoosh.wav** (70ms) - Swoosh sound, screen transitions

## Generating Sounds

Run the generation script to create all sound files:

```bash
npm run sounds:generate
# or
./scripts/generate-sounds.sh
```

**Requirements**:
- macOS or Linux
- ffmpeg (`brew install ffmpeg`)

## Usage in Code

```typescript
import { sounds, volume } from '@traindaily/design-system';

// Play a sound
audioPlayer.play('success'); // Uses default volume from design system

// Play with custom volume
audioPlayer.play('click', 0.3);

// Semantic action mapping
audioPlayer.play(soundActions.logWorkout); // Maps to 'success' sound
```

## Volume Levels

Default volumes are defined in `packages/design-system/sounds.ts`:

- **complete**: 0.7 (loudest)
- **success**: 0.5
- **error**: 0.4
- **info**: 0.3
- **click**: 0.2
- **tap**: 0.15
- **tick**: 0.1 (quietest)

## Accessibility

All sounds respect user preferences:
- ✓ `prefers-reduced-motion` (disable sounds when set)
- ✓ User settings toggle (can disable in app settings)
- ✓ Master volume control (adjust all sounds)
- ✓ Silent mode detection (mobile only)

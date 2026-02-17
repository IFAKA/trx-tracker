# @traindaily/design-system

Apple-compliant design tokens and sound system for TrainDaily, following macOS and iOS Human Interface Guidelines.

## Overview

This package provides:
- **Design tokens**: Colors, typography, spacing, animations (Apple system palette)
- **Sound system**: Functional sounds with volume hierarchy and haptic feedback
- **Zero custom styling**: Uses native system colors that adapt to dark mode

## Installation

```bash
# Internal package (monorepo)
import { colors, typography, spacing } from '@traindaily/design-system';
```

## Design Principles

### Visual Design
- ✅ **No emojis** - Use SF Symbols/Lucide icons only
- ✅ **No gradients** - Flat system colors only
- ✅ **SF Pro typography** - System font stack
- ✅ **8pt grid system** - Consistent spacing
- ✅ **12px standard radius** - macOS/iOS corners

### Sound Design
- ✅ **Functional, not musical** - Short tones (30-200ms)
- ✅ **Volume hierarchy** - Success > Info > Click
- ✅ **Semantic pairing** - Same sound for same action
- ✅ **Accessibility first** - Respect `prefers-reduced-motion`

## Usage

### Colors

```typescript
import { colors } from '@traindaily/design-system';

// Use in CSS-in-JS
const styles = {
  color: colors.label,              // Primary text
  backgroundColor: colors.background, // App background
};

// Use in Tailwind (via CSS custom properties)
<div className="bg-[var(--system-background)] text-[var(--system-label)]">
```

**Available Colors**:
- **Text**: `label`, `secondaryLabel`, `tertiaryLabel`, `quaternaryLabel`
- **Backgrounds**: `background`, `secondaryBackground`, `tertiaryBackground`
- **Semantic**: `systemRed`, `systemOrange`, `systemYellow`, `systemGreen`, `systemBlue`, etc.
- **Aliases**: `success`, `error`, `warning`, `info`

### Typography

```typescript
import { typography } from '@traindaily/design-system';

// Use in CSS-in-JS
const titleStyle = typography.title1; // { fontSize: 28, fontWeight: 700, lineHeight: 34 }

// Use in Tailwind
<h1 className="text-[28px] font-bold leading-[34px]">
```

**Type Scale**:
- **Display**: `largeTitle` (34px)
- **Titles**: `title1` (28px), `title2` (22px), `title3` (20px)
- **Body**: `headline` (17px), `body` (17px), `callout` (16px), `subheadline` (15px)
- **Small**: `footnote` (13px), `caption1` (12px), `caption2` (11px)

### Spacing

```typescript
import { spacing } from '@traindaily/design-system';

// Use in CSS-in-JS
const styles = {
  padding: spacing.md,  // 16px
  margin: spacing.lg,   // 24px
};

// Use in Tailwind
<div className="p-4 m-6"> {/* 16px, 24px */}
```

**Spacing Scale** (8pt grid):
- `xxs: 2`, `xs: 4`, `sm: 8`, `md: 16`, `lg: 24`, `xl: 32`, `xxl: 48`, `xxxl: 64`

### Sounds

```typescript
import { sounds, volume, soundActions } from '@traindaily/design-system';

// Play a sound (use in lib/audio.ts)
audioPlayer.play('success');           // Default volume (0.5)
audioPlayer.play('click', 0.3);        // Custom volume

// Semantic action mapping (recommended)
audioPlayer.play(soundActions.logWorkout);  // Maps to 'success' sound
audioPlayer.play(soundActions.buttonPress); // Maps to 'click' sound
```

**Available Sounds**:
- **Success**: `success` (100ms), `complete` (200ms)
- **UI**: `click` (50ms), `tap` (40ms)
- **Info**: `info` (80ms)
- **Errors**: `error` (100ms), `warning` (120ms)
- **Timers**: `tick` (30ms), `timerEnd` (150ms)
- **Transitions**: `whoosh` (70ms)

**Volume Hierarchy**:
```typescript
complete: 0.7   // Loudest (celebration)
success: 0.5
error: 0.4
info: 0.3
click: 0.2
tick: 0.1       // Quietest (background)
```

### Haptic Feedback

```typescript
import { haptics } from '@traindaily/design-system';

// iOS (Taptic Engine)
haptics.ios.selection         // Light tap
haptics.ios.impactMedium      // Button press
haptics.ios.notificationSuccess // Success feedback

// Android (vibration patterns in ms)
haptics.android.click         // [20]
haptics.android.success       // [50, 30, 50]
```

### Animations

```typescript
import { animation } from '@traindaily/design-system';

// Duration
const styles = {
  transition: `all ${animation.duration.normal}ms ${animation.easing.standard}`,
};

// Use in Tailwind
<div className="transition-all duration-300 ease-out">
```

**Timing**:
- `instant: 100ms`, `fast: 200ms`, `normal: 300ms`, `slow: 500ms`, `slower: 700ms`

**Easing**:
- `standard` (ease-out), `decelerate`, `accelerate`, `sharp`, `spring`

### Border Radius

```typescript
import { borderRadius } from '@traindaily/design-system';

// Use in CSS-in-JS
const styles = {
  borderRadius: borderRadius.md,  // 12px (standard)
};

// Use in Tailwind
<div className="rounded-xl"> {/* 12px */}
```

**Radius Scale**:
- `sm: 6px`, `md: 12px` (standard), `lg: 16px`, `xl: 20px`, `full: 9999px`

### Touch Targets

```typescript
import { touchTarget } from '@traindaily/design-system';

// Minimum sizes for accessibility
const buttonStyle = {
  minHeight: touchTarget.minHeight,  // 44px (iOS)
  minWidth: touchTarget.minWidth,    // 44px (iOS)
};
```

## CSS Custom Properties

All design tokens are available as CSS custom properties in `app/globals.css`:

```css
/* Colors */
var(--system-label)                  /* Primary text */
var(--system-secondary-label)        /* Secondary text */
var(--system-background)             /* App background */
var(--system-secondary-background)   /* Cards, modals */

/* Semantic colors */
var(--system-red)
var(--system-orange)
var(--system-yellow)
var(--system-green)
var(--system-blue)
/* ... etc */
```

## Accessibility

### Reduced Motion

All animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Sound Control

Sounds respect user preferences:
- ✓ `prefers-reduced-motion` (disable sounds)
- ✓ User settings toggle (app-level disable)
- ✓ Master volume control
- ✓ Silent mode detection (mobile)

## File Structure

```
packages/design-system/
├── index.ts          # Main export
├── tokens.ts         # Design tokens
├── sounds.ts         # Sound system
├── README.md         # This file
└── package.json      # Package config
```

## Type Safety

All tokens are fully typed:

```typescript
import type {
  TypographyStyle,
  SpacingKey,
  BorderRadiusKey,
  AnimationDuration,
  SoundKey,
  HapticType,
} from '@traindaily/design-system';

const typo: TypographyStyle = 'title1';        // ✓
const space: SpacingKey = 'md';                // ✓
const sound: SoundKey = 'success';             // ✓
const invalid: SoundKey = 'explosion';         // ✗ Type error
```

## Platform Support

- **Desktop (macOS)**: Full support via Tauri WebView
- **Mobile (iOS/Android)**: Full support via PWA
- **Web**: Full support (degrades gracefully)

## Future Enhancements

- [ ] SF Symbols integration (macOS/iOS native icons)
- [ ] Dark/light mode variants (currently dark-only)
- [ ] Additional semantic tokens (e.g., `success-background`, `error-foreground`)
- [ ] Accessibility utilities (focus rings, high contrast mode)

## License

Private - TrainDaily internal use only

/**
 * Apple-Compliant Design Tokens
 * Based on macOS and iOS Human Interface Guidelines
 *
 * - No custom colors (use system palette only)
 * - SF Pro typography (system font)
 * - 8pt grid spacing
 * - Standard 12px border radius
 * - No emojis, no gradients
 */

// ============================================================================
// COLORS (macOS/iOS System Palette)
// ============================================================================
// All colors use CSS custom properties that adapt to light/dark mode automatically
// These map to native system colors on macOS/iOS

export const colors = {
  // Text colors
  label: 'var(--system-label)',                     // Primary text
  secondaryLabel: 'var(--system-secondary-label)',  // Secondary text
  tertiaryLabel: 'var(--system-tertiary-label)',    // Tertiary text (hints, captions)
  quaternaryLabel: 'var(--system-quaternary-label)', // Disabled text

  // Fill colors (backgrounds)
  background: 'var(--system-background)',           // App background
  secondaryBackground: 'var(--system-secondary-background)', // Secondary areas
  tertiaryBackground: 'var(--system-tertiary-background)',   // Tertiary areas

  // Grouped backgrounds (for lists, tables)
  groupedBackground: 'var(--system-grouped-background)',
  secondaryGroupedBackground: 'var(--system-secondary-grouped-background)',
  tertiaryGroupedBackground: 'var(--system-tertiary-grouped-background)',

  // UI element colors
  separator: 'var(--system-separator)',             // Dividers, borders
  opaqueSeparator: 'var(--system-opaque-separator)', // Opaque dividers
  link: 'var(--system-link)',                       // Hyperlinks

  // Semantic colors (system palette)
  systemRed: 'var(--system-red)',
  systemOrange: 'var(--system-orange)',
  systemYellow: 'var(--system-yellow)',
  systemGreen: 'var(--system-green)',
  systemMint: 'var(--system-mint)',
  systemTeal: 'var(--system-teal)',
  systemCyan: 'var(--system-cyan)',
  systemBlue: 'var(--system-blue)',
  systemIndigo: 'var(--system-indigo)',
  systemPurple: 'var(--system-purple)',
  systemPink: 'var(--system-pink)',
  systemBrown: 'var(--system-brown)',
  systemGray: 'var(--system-gray)',

  // Semantic aliases (for clarity in code)
  success: 'var(--system-green)',
  error: 'var(--system-red)',
  warning: 'var(--system-orange)',
  info: 'var(--system-blue)',
} as const;

// ============================================================================
// TYPOGRAPHY (SF Pro - Apple System Font)
// ============================================================================
// Based on Apple's type scale hierarchy
// All sizes use SF Pro with appropriate weights and line heights

export const typography = {
  // Display styles (large, attention-grabbing)
  largeTitle: {
    fontSize: 34,
    fontWeight: 700,
    lineHeight: 41,
    letterSpacing: 0.37,
  },

  // Title styles (section headers)
  title1: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 34,
    letterSpacing: 0.36,
  },
  title2: {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 28,
    letterSpacing: 0.35,
  },
  title3: {
    fontSize: 20,
    fontWeight: 600,
    lineHeight: 25,
    letterSpacing: 0.38,
  },

  // Body and UI text
  headline: {
    fontSize: 17,
    fontWeight: 600,
    lineHeight: 22,
    letterSpacing: -0.41,
  },
  body: {
    fontSize: 17,
    fontWeight: 400,
    lineHeight: 22,
    letterSpacing: -0.41,
  },
  callout: {
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 21,
    letterSpacing: -0.32,
  },
  subheadline: {
    fontSize: 15,
    fontWeight: 400,
    lineHeight: 20,
    letterSpacing: -0.24,
  },

  // Small text (captions, footnotes)
  footnote: {
    fontSize: 13,
    fontWeight: 400,
    lineHeight: 18,
    letterSpacing: -0.08,
  },
  caption1: {
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 16,
    letterSpacing: 0,
  },
  caption2: {
    fontSize: 11,
    fontWeight: 400,
    lineHeight: 13,
    letterSpacing: 0.06,
  },
} as const;

// ============================================================================
// SPACING (8pt Grid System)
// ============================================================================
// All spacing follows Apple's 8pt grid for visual consistency

export const spacing = {
  xxs: 2,   // Tightest spacing (rare use)
  xs: 4,    // Very tight (icon-to-text gaps)
  sm: 8,    // Compact (list item padding)
  md: 16,   // Standard (card padding, section gaps)
  lg: 24,   // Comfortable (screen margins)
  xl: 32,   // Generous (section spacing)
  xxl: 48,  // Large (hero sections)
  xxxl: 64, // Extra large (major section breaks)
} as const;

// ============================================================================
// BORDER RADIUS (macOS/iOS Standard Corners)
// ============================================================================

export const borderRadius = {
  sm: 6,    // Small elements (buttons, chips)
  md: 12,   // Standard macOS/iOS (cards, modals) - DEFAULT
  lg: 16,   // Large cards
  xl: 20,   // Extra large (bottom sheets)
  full: 9999, // Circular (avatars, badges)
} as const;

// ============================================================================
// SHADOWS (macOS/iOS Elevation)
// ============================================================================
// Subtle shadows matching Apple's depth hierarchy

export const shadows = {
  sm: '0 1px 2px 0 oklch(0 0 0 / 0.05)',
  md: '0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -1px oklch(0 0 0 / 0.06)',
  lg: '0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -2px oklch(0 0 0 / 0.05)',
  xl: '0 20px 25px -5px oklch(0 0 0 / 0.1), 0 10px 10px -5px oklch(0 0 0 / 0.04)',
} as const;

// ============================================================================
// ANIMATION (Standard macOS/iOS Motion)
// ============================================================================
// Timing and easing based on Apple's motion guidelines

export const animation = {
  duration: {
    instant: 100,  // Immediate feedback (button press)
    fast: 200,     // Quick transitions (hover states)
    normal: 300,   // Standard (modals, sheets) - DEFAULT
    slow: 500,     // Deliberate (page transitions)
    slower: 700,   // Very slow (complex animations)
  },

  // Apple's standard easing curves
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',      // Ease out (DEFAULT)
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',    // Ease out (strong)
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',      // Ease in
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',         // Quick in/out
    spring: 'cubic-bezier(0.5, 1.75, 0.75, 1.25)',   // Bounce effect
  },
} as const;

// ============================================================================
// TOUCH TARGETS (iOS/macOS Accessibility)
// ============================================================================
// Minimum touch target sizes for usability

export const touchTarget = {
  minHeight: 44,  // iOS minimum (44pt)
  minWidth: 44,   // iOS minimum (44pt)
  desktop: {
    minHeight: 32, // macOS minimum (smaller for mouse precision)
    minWidth: 32,
  },
} as const;

// ============================================================================
// Z-INDEX SCALE (Layering Hierarchy)
// ============================================================================
// Consistent z-index values for stacking order

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type TypographyStyle = keyof typeof typography;
export type SpacingKey = keyof typeof spacing;
export type BorderRadiusKey = keyof typeof borderRadius;
export type AnimationDuration = keyof typeof animation.duration;
export type AnimationEasing = keyof typeof animation.easing;

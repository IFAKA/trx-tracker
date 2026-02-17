/**
 * Sound Design System
 * Subtle, functional sounds matching Apple's audio design principles
 *
 * - No music, only functional sounds
 * - Short duration (50-200ms typical)
 * - Clear volume hierarchy (success > info > click)
 * - Semantic pairing (action → sound)
 */

// ============================================================================
// SOUND DEFINITIONS
// ============================================================================

export const sounds = {
  // Success sounds (positive reinforcement)
  success: '/sounds/success.wav',         // Ascending chime (100ms) - workout logged
  complete: '/sounds/complete.wav',       // Triumphant chime (200ms) - session complete

  // Interaction sounds
  click: '/sounds/click.wav',             // Subtle tap (50ms) - button press
  tap: '/sounds/tap.wav',                 // Soft tap (40ms) - increment/decrement

  // Informational sounds
  info: '/sounds/info.wav',               // Neutral tone (80ms) - notification

  // Error/warning sounds
  error: '/sounds/error.wav',             // Descending buzz (100ms) - validation failure
  warning: '/sounds/warning.wav',         // Alert tone (120ms) - warning message

  // Timer sounds
  tick: '/sounds/tick.wav',               // Clock tick (30ms) - countdown
  timerEnd: '/sounds/timer-end.wav',      // Bell (150ms) - rest timer complete

  // Transition sounds
  whoosh: '/sounds/whoosh.wav',           // Swoosh (70ms) - screen transition
} as const;

// ============================================================================
// VOLUME LEVELS (0.0 - 1.0)
// ============================================================================
// Clear hierarchy: Success loudest, UI sounds quietest

export const volume = {
  // Celebratory (loudest)
  complete: 0.7,    // Session complete

  // Confirmations (loud)
  success: 0.5,     // Workout logged
  timerEnd: 0.5,    // Rest timer complete

  // Errors (medium-loud, attention-grabbing)
  error: 0.4,
  warning: 0.45,

  // Information (medium)
  info: 0.3,

  // UI interactions (quietest)
  click: 0.2,
  tap: 0.15,
  tick: 0.1,        // Subtle background tick
  whoosh: 0.25,
} as const;

// ============================================================================
// HAPTIC FEEDBACK (iOS/Android Vibration Patterns)
// ============================================================================
// Paired with sounds for tactile reinforcement on mobile

export const haptics = {
  // iOS haptic types (when available via Taptic Engine)
  ios: {
    selection: 'selection',           // Light tap (UI selection)
    impactLight: 'impactLight',       // Soft bump (increment/decrement)
    impactMedium: 'impactMedium',     // Medium bump (button press)
    impactHeavy: 'impactHeavy',       // Strong bump (success)
    notificationSuccess: 'notificationSuccess',
    notificationWarning: 'notificationWarning',
    notificationError: 'notificationError',
  },

  // Android vibration patterns (milliseconds)
  android: {
    selection: [10],                  // Short tap
    click: [20],                      // Button press
    success: [50, 30, 50],            // Double bump (success)
    error: [100],                     // Single long buzz (error)
    warning: [50, 50, 50],            // Triple short buzz (warning)
  },
} as const;

// ============================================================================
// SOUND-ACTION MAPPING (Semantic Pairing)
// ============================================================================
// Consistent sound for each action type across the app

export const soundActions = {
  // Workout logging
  logReps: 'tap',                     // Each rep tap
  logSet: 'click',                    // Set complete
  logWorkout: 'success',              // Workout saved
  completeSession: 'complete',        // All exercises done

  // Timers
  restTick: 'tick',                   // Each second of rest
  restComplete: 'timerEnd',           // Rest period over

  // Navigation
  screenTransition: 'whoosh',         // Moving between screens

  // Errors
  validation: 'error',                // Input validation failure
  networkError: 'error',              // Sync failure

  // Information
  notification: 'info',               // General notification

  // UI interactions
  buttonPress: 'click',               // Standard button
  toggle: 'tap',                      // Switch, checkbox
} as const;

// ============================================================================
// AUDIO CONTEXT SETUP (Web Audio API)
// ============================================================================
// Utility to preload and play sounds efficiently

export interface AudioPlayer {
  play: (soundKey: keyof typeof sounds, volumeOverride?: number) => void;
  preload: () => Promise<void>;
  setMasterVolume: (volume: number) => void;
}

/**
 * Creates an audio player with preloaded sounds
 * Usage:
 *   const player = createAudioPlayer();
 *   await player.preload();
 *   player.play('success');
 */
export function createAudioPlayer(): AudioPlayer {
  // Implementation would be in actual audio.ts
  // This is just the interface definition
  throw new Error('Not implemented - use lib/audio.ts');
}

// ============================================================================
// ACCESSIBILITY (Respect User Preferences)
// ============================================================================

export const accessibility = {
  // Respect system preferences
  respectReduceMotion: true,          // Disable sounds if prefers-reduced-motion
  respectSilentMode: true,            // Check device silent mode (mobile)

  // Allow user control
  allowDisable: true,                 // Settings toggle to disable sounds
  allowVolumeControl: true,           // Settings slider for master volume
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type SoundKey = keyof typeof sounds;
export type SoundActionKey = keyof typeof soundActions;
export type HapticType = keyof typeof haptics.ios | keyof typeof haptics.android;

// Sound engine — Web Audio API cues + haptic feedback
// Uses a single shared AudioContext, unlocked on first user gesture

let sharedCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  try {
    if (!sharedCtx) {
      sharedCtx = new AudioContext();
    }
    // Resume if suspended (browsers suspend until user gesture)
    if (sharedCtx.state === 'suspended') {
      sharedCtx.resume();
    }
    return sharedCtx;
  } catch {
    return null;
  }
}

/** Call on first user tap to unlock audio for the session */
export function unlockAudio() {
  const ctx = getContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
}

function playTone(
  frequency: number,
  duration: number,
  volume = 0.3,
  startDelay = 0
): void {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, ctx.currentTime + startDelay);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + startDelay + duration
    );
    osc.start(ctx.currentTime + startDelay);
    osc.stop(ctx.currentTime + startDelay + duration + 0.05);
  } catch {
    // Audio not available
  }
}

/** Quick soft "pop" — 520 Hz, 100ms */
export function playSetLoggedHit() {
  playTone(520, 0.1, 0.25);
  vibrate([50]);
}

/** Two-note ascending — 520→780 Hz, rewarding */
export function playTargetHit() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.value = 520;
    gain1.gain.setValueAtTime(0.25, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.15);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 780;
    gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc2.start(ctx.currentTime + 0.1);
    osc2.stop(ctx.currentTime + 0.25);
  } catch {
    // Audio not available
  }
  vibrate([50]);
}

/** Single lower tone — 330 Hz, 150ms, subtle miss */
export function playTargetMiss() {
  playTone(330, 0.15, 0.2);
  vibrate([30, 30, 30]);
}

/** Set logged — plays hit or miss sound based on target comparison */
export function playSetLogged(hitTarget: boolean) {
  if (hitTarget) {
    playTargetHit();
  } else {
    playTargetMiss();
  }
}

/** Countdown tick — pitch rises based on remaining seconds (3→2→1) */
export function playCountdownTick(secondsLeft: number) {
  const freqMap: Record<number, number> = { 3: 660, 2: 770, 1: 880 };
  const freq = freqMap[secondsLeft];
  if (!freq) return;
  playTone(freq, 0.08, 0.2);
  vibrate([40]);
}

/** Rest complete — two quick 880 Hz pulses */
export function playRestComplete() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    // First pulse
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.value = 880;
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.15);

    // Second pulse after 150ms gap (100ms tone + 50ms silence)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 880;
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.3);
  } catch {
    // Audio not available
  }
  vibrate([200, 100, 200]);
}

/** Session complete — major chord arpeggio C5→E5→G5→C6 */
export function playSessionComplete() {
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  const noteLength = 0.1;
  const spacing = 0.1;
  const ctx = getContext();
  if (!ctx) return;
  try {
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * spacing;
      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + noteLength);
      osc.start(start);
      osc.stop(start + noteLength + 0.05);
    });
  } catch {
    // Audio not available
  }
  vibrate([100, 50, 100, 50, 200]);
}

/** Start — soft ascending double-tap to confirm workout/mobility begin */
export function playStart() {
  playTone(440, 0.06, 0.2);
  playTone(660, 0.08, 0.2, 0.08);
  vibrate([40, 30, 40]);
}

/** Next exercise — short bright chirp to signal transition */
export function playNextExercise() {
  playTone(880, 0.08, 0.2);
  vibrate([60]);
}

/** Skip — quick low blip to acknowledge skip action */
export function playSkip() {
  playTone(440, 0.05, 0.15);
  vibrate([30]);
}

/** Break start — attention-grabbing two-tone ping */
export function playBreakStart() {
  playTone(660, 0.1, 0.25);
  playTone(880, 0.1, 0.25, 0.12);
  vibrate([100, 50, 100]);
}

/** Break done — soft completion chime */
export function playBreakDone() {
  playTone(660, 0.1, 0.2);
  vibrate([80]);
}

/** Mobility complete — gentle descending tone, calming */
export function playMobilityComplete() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const notes = [784, 659, 523]; // G5, E5, C5 — descending calm
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.15;
      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
      osc.start(start);
      osc.stop(start + 0.2);
    });
  } catch {
    // Audio not available
  }
  vibrate([80, 40, 80]);
}

// Haptic helpers

function vibrate(pattern: number[]) {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Vibration not available
  }
}

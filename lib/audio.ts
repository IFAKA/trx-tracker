// Sound engine — Web Audio API cues + haptic feedback
// Each function creates a short-lived AudioContext for maximum compatibility

function playTone(
  frequency: number,
  duration: number,
  volume = 0.3,
  startDelay = 0
): { ctx: AudioContext; osc: OscillatorNode; gain: GainNode } | null {
  try {
    const ctx = new AudioContext();
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
    return { ctx, osc, gain };
  } catch {
    return null;
  }
}

/** Quick soft "pop" — 520 Hz, 100ms */
export function playSetLoggedHit() {
  playTone(520, 0.1, 0.25);
  vibrate([50]);
}

/** Two-note ascending — 520→780 Hz, rewarding */
export function playTargetHit() {
  try {
    const ctx = new AudioContext();
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
  try {
    const ctx = new AudioContext();

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
  try {
    const ctx = new AudioContext();
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

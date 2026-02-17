// Sound engine — Web Audio API cues + haptic feedback
// Uses a single shared AudioContext, unlocked on first user gesture

let sharedCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  try {
    if (!sharedCtx) {
      sharedCtx = new AudioContext();
    }
    if (sharedCtx.state === 'suspended') {
      sharedCtx.resume();
    }
    return sharedCtx;
  } catch {
    return null;
  }
}

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
  startDelay = 0,
  waveform: OscillatorType = 'sine'
): void {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = waveform;
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

function playWarmNote(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  volume: number,
  waveform: OscillatorType = 'sine'
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = waveform;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

export function playCountdownTick(secondsLeft: number) {
  const freqMap: Record<number, number> = { 3: 660, 2: 770, 1: 880 };
  const freq = freqMap[secondsLeft];
  if (!freq) return;
  playTone(freq, 0.08, 0.18, 0, 'triangle');
  vibrate([40]);
}

export function playBreakStart() {
  playTone(660, 0.1, 0.25);
  playTone(880, 0.1, 0.25, 0.12);
  vibrate([100, 50, 100]);
}

export function playBreakDone() {
  playTone(880, 0.1, 0.25);
  playTone(660, 0.1, 0.22, 0.12);
  vibrate([80, 40, 60]);
}

export function playSessionComplete() {
  const notes = [523, 659, 784, 1047];
  const ctx = getContext();
  if (!ctx) return;
  try {
    notes.forEach((freq, i) => {
      const start = ctx.currentTime + i * 0.12;
      playWarmNote(ctx, freq, start, 0.15, 0.35);
    });
  } catch {
    // Audio not available
  }
  vibrate([100, 50, 100, 50, 200]);
}

function vibrate(pattern: number[]) {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Vibration not available
  }
}

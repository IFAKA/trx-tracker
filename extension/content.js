// TrainDaily - Content Script
// Syncs PWA localStorage + injects block/break overlays

const MICRO_BREAK_EXERCISES = [
  { name: 'WALL SLIDES', duration: 120, instruction: 'Back against wall, arms at 90°. Slide up and down slowly.' },
  { name: 'THORACIC ROTATION', duration: 120, instruction: 'On all fours, hand behind head. Rotate open. Alternate sides.' },
  { name: 'HIP FLEXOR STRETCH', duration: 120, instruction: 'Kneel on one knee, push hips forward. 60s each side.' },
  { name: 'CHEST DOORWAY STRETCH', duration: 120, instruction: 'Arms on doorframe at 90°. Lean through and hold.' },
];

// Try to sync PWA data
function syncFromPWA() {
  try {
    const raw = localStorage.getItem('traindaily_sessions');
    if (!raw) return;
    const data = JSON.parse(raw);
    const today = new Date().toISOString().split('T')[0];
    if (data[today]?.logged_at) {
      chrome.runtime.sendMessage({ type: 'WORKOUT_SYNCED', dateKey: today });
    }
  } catch {
    // Not on PWA page or no data
  }
}

syncFromPWA();

// Listen for messages from background
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'BLOCK_WORKOUT') {
    showBlockOverlay();
  }
  if (message.type === 'MICRO_BREAK') {
    showMicroBreak(message.breakIndex);
  }
});

function showBlockOverlay() {
  if (document.getElementById('trx-block-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'trx-block-overlay';
  overlay.innerHTML = `
    <div style="
      position: fixed; inset: 0; z-index: 999999;
      background: #0a0a0a; color: #f5f5f5;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      font-family: monospace; gap: 24px;
    ">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m6.5 6.5 11 11"/><path d="m21 21-11-11"/><path d="M14 5.5a4 4 0 0 1 4 4"/><path d="M5.5 14a4 4 0 0 0 4 4"/>
      </svg>
      <h1 style="font-size: 28px; font-weight: bold; letter-spacing: 2px;">LOG YOUR WORKOUT FIRST</h1>
      <p style="color: #888; font-size: 14px;">Complete today's training session to unlock browsing</p>
      <button onclick="window.open('/', '_blank')" style="
        background: #f5f5f5; color: #0a0a0a;
        border: none; padding: 12px 32px; border-radius: 8px;
        font-family: monospace; font-size: 16px; font-weight: bold;
        cursor: pointer;
      ">OPEN TRX</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

function showMicroBreak(breakIndex) {
  if (document.getElementById('trx-break-overlay')) return;

  const exercise = MICRO_BREAK_EXERCISES[breakIndex % MICRO_BREAK_EXERCISES.length];
  let remaining = exercise.duration;

  const overlay = document.createElement('div');
  overlay.id = 'trx-break-overlay';
  overlay.innerHTML = `
    <div style="
      position: fixed; inset: 0; z-index: 999999;
      background: #0a0a0a; color: #f5f5f5;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      font-family: monospace; gap: 24px;
    ">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>
      </svg>
      <h1 style="font-size: 24px; font-weight: bold;">${exercise.name}</h1>
      <p style="color: #888; font-size: 14px; text-align: center; max-width: 300px;">${exercise.instruction}</p>
      <div id="trx-break-timer" style="font-size: 48px; font-weight: bold;">${formatTime(remaining)}</div>
      <button id="trx-break-dismiss" style="
        display: none;
        background: transparent; color: #888;
        border: 1px solid #333; padding: 8px 24px; border-radius: 8px;
        font-family: monospace; font-size: 14px;
        cursor: pointer;
      ">DISMISS</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const timerEl = document.getElementById('trx-break-timer');
  const dismissBtn = document.getElementById('trx-break-dismiss');

  const interval = setInterval(() => {
    remaining--;
    if (timerEl) timerEl.textContent = formatTime(remaining);
    if (remaining <= 0) {
      clearInterval(interval);
      if (dismissBtn) dismissBtn.style.display = 'block';
    }
  }, 1000);

  dismissBtn?.addEventListener('click', () => {
    overlay.remove();
  });
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

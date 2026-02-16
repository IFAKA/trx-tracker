document.addEventListener('DOMContentLoaded', async () => {
  const statusEl = document.getElementById('workout-status');
  const lastBreakEl = document.getElementById('last-break');
  const nextBreakEl = document.getElementById('next-break');
  const openBtn = document.getElementById('open-app');

  // Check workout status
  const today = new Date().toISOString().split('T')[0];
  const { workoutDone } = await chrome.storage.local.get('workoutDone');

  if (workoutDone === today) {
    statusEl.textContent = 'DONE';
    statusEl.classList.add('done');
  } else {
    statusEl.textContent = 'PENDING';
    statusEl.classList.add('pending');
  }

  // Check break timing
  const alarm = await chrome.alarms.get('trx-micro-break');
  if (alarm) {
    const minsLeft = Math.round((alarm.scheduledTime - Date.now()) / 60000);
    nextBreakEl.textContent = `${minsLeft}m`;
  }

  // Last break
  const { breakIndex } = await chrome.storage.local.get('breakIndex');
  if (breakIndex > 0) {
    lastBreakEl.textContent = `#${breakIndex}`;
  }

  // Open app
  openBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000' });
  });
});

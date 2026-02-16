// TRX Tracker - Background Service Worker
// Handles: morning workout block + hourly micro-break alarms

const ALARM_MICRO_BREAK = 'trx-micro-break';
const TRAINING_DAYS = [1, 3, 5]; // Mon, Wed, Fri

// Initialize alarms on install
chrome.runtime.onInstalled.addListener(() => {
  // Set up hourly micro-break alarm
  chrome.alarms.create(ALARM_MICRO_BREAK, {
    delayInMinutes: 60,
    periodInMinutes: 60,
  });
});

// Handle alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_MICRO_BREAK) {
    triggerMicroBreak();
  }
});

async function triggerMicroBreak() {
  // Get current break index
  const { breakIndex = 0 } = await chrome.storage.local.get('breakIndex');

  // Send message to active tab to show break overlay
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]?.id) {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: 'MICRO_BREAK',
      breakIndex,
    });
  }

  // Increment break index
  await chrome.storage.local.set({ breakIndex: breakIndex + 1 });
}

// Check if today is a training day and workout is not logged
async function checkWorkoutBlock() {
  const today = new Date();
  const dayOfWeek = today.getDay();

  if (!TRAINING_DAYS.includes(dayOfWeek)) return false;

  const dateKey = today.toISOString().split('T')[0];
  const { workoutDone } = await chrome.storage.local.get('workoutDone');

  return workoutDone !== dateKey;
}

// Listen for tab updates to potentially block
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;

  const shouldBlock = await checkWorkoutBlock();
  if (shouldBlock) {
    chrome.tabs.sendMessage(tabId, { type: 'BLOCK_WORKOUT' });
  }
});

// Listen for messages from content script (PWA sync)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'WORKOUT_SYNCED') {
    chrome.storage.local.set({ workoutDone: message.dateKey });
    sendResponse({ ok: true });
  }
  if (message.type === 'CHECK_BLOCK') {
    checkWorkoutBlock().then((blocked) => sendResponse({ blocked }));
    return true; // async response
  }
});

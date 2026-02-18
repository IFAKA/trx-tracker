/**
 * Desktop Sync Client
 *
 * Discovers and syncs with TrainDaily desktop app over local network
 * Uses HTTPS with self-signed cert + token authentication
 */

import { WorkoutData, WorkoutSession } from './types';
import { loadWorkoutData, saveWorkoutData } from './storage';

interface DesktopInfo {
  deviceId: string;
  lastKnownIp: string;
  port: number;
  authToken: string;
}

const STORAGE_KEY = 'traindaily_desktop_info';
const DEFAULT_PORT = 8841;

// Get stored desktop info from localStorage
export function getStoredDesktopInfo(): DesktopInfo | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

// Save desktop info to localStorage
export function saveDesktopInfo(info: DesktopInfo): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
  } catch (err) {
    console.error('Failed to save desktop info:', err);
  }
}

// Update cached IP (when desktop IP changes)
export function updateCachedIp(newIp: string): void {
  const info = getStoredDesktopInfo();
  if (info) {
    info.lastKnownIp = newIp;
    saveDesktopInfo(info);
  }
}

// Clear pairing (unpair desktop)
export function clearDesktopInfo(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear desktop info:', err);
  }
}

// Ping desktop at IP to check if it's the right device
async function tryPing(ip: string, port: number, expectedDeviceId?: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000); // 1 second timeout

    const response = await fetch(`https://${ip}:${port}/api/ping`, {
      signal: controller.signal,
      // @ts-ignore - required for self-signed certs
      mode: 'cors',
    });

    clearTimeout(timeout);

    if (!response.ok) return null;

    const { deviceId } = await response.json();
    if (expectedDeviceId && deviceId !== expectedDeviceId) return null;

    return deviceId;
  } catch {
    return null;
  }
}

// Discover desktop by device ID (scan nearby IPs)
async function discoverByDeviceId(targetId: string, port: number, lastKnownIp: string): Promise<string | null> {
  // Get subnet from last known IP
  const parts = lastKnownIp.split('.');
  if (parts.length !== 4) return null;

  const subnet = parts.slice(0, 3).join('.');
  const lastOctet = parseInt(parts[3]);

  // Check nearby IPs first (fast path - desktop IP likely changed by only a few)
  for (let offset = -5; offset <= 5; offset++) {
    const octet = lastOctet + offset;
    if (octet < 1 || octet > 254) continue;

    const ip = `${subnet}.${octet}`;
    const deviceId = await tryPing(ip, port, targetId);
    if (deviceId === targetId) return ip;
  }

  // Full scan if not found nearby (slower)
  for (let i = 1; i <= 254; i++) {
    if (Math.abs(i - lastOctet) <= 5) continue; // Already checked
    const ip = `${subnet}.${i}`;
    const deviceId = await tryPing(ip, port, targetId);
    if (deviceId === targetId) return ip;
  }

  return null;
}

// Sync with desktop
export async function syncWithDesktop(): Promise<{ success: boolean; message: string }> {
  const desktop = getStoredDesktopInfo();
  if (!desktop) {
    return { success: false, message: 'Desktop not paired' };
  }

  try {
    // Try cached IP first (fast)
    let desktopUrl = `https://${desktop.lastKnownIp}:${desktop.port}`;
    let deviceId = await tryPing(desktop.lastKnownIp, desktop.port, desktop.deviceId);

    // If cached IP failed, re-discover
    if (!deviceId) {
      const newIp = await discoverByDeviceId(desktop.deviceId, desktop.port, desktop.lastKnownIp);
      if (newIp) {
        updateCachedIp(newIp);
        desktopUrl = `https://${newIp}:${desktop.port}`;
      } else {
        return { success: false, message: 'Desktop not reachable' };
      }
    }

    // Fetch sessions from desktop
    const response = await fetch(`${desktopUrl}/api/sync/sessions`, {
      headers: {
        'Authorization': `Bearer ${desktop.authToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, message: 'Authentication failed (unpair and re-pair)' };
      }
      return { success: false, message: `Sync failed: ${response.statusText}` };
    }

    const desktopSessions: WorkoutData = await response.json();

    // Deep merge: combine local and desktop data
    // For the same date, merge at the exercise key level (both sides keep their exercises)
    // logged_at and week_number: prefer whichever was logged later
    const localData = loadWorkoutData();
    const merged: WorkoutData = { ...localData };

    for (const [dateKey, desktopSession] of Object.entries(desktopSessions)) {
      const localSession = localData[dateKey];
      if (!localSession) {
        // Desktop has a date we don't — take it as-is
        merged[dateKey] = desktopSession;
      } else {
        // Both have this date — merge exercise keys from both sides.
        // For shared keys, prefer whichever session was logged later.
        const localTime = new Date(localSession.logged_at || 0).getTime();
        const desktopTime = new Date(desktopSession.logged_at || 0).getTime();
        const preferDesktop = desktopTime >= localTime;
        // Spread: all keys from both sides, newer session wins on conflicts
        merged[dateKey] = preferDesktop
          ? { ...localSession, ...desktopSession }
          : { ...desktopSession, ...localSession };
      }
    }

    saveWorkoutData(merged);

    // Push sessions that desktop doesn't have (or that we have newer data for)
    const uploadErrors: string[] = [];
    for (const [dateKey, session] of Object.entries(localData)) {
      const desktopSession = desktopSessions[dateKey];
      const shouldUpload = !desktopSession ||
        new Date(session.logged_at || 0) > new Date(desktopSession.logged_at || 0);

      if (shouldUpload) {
        try {
          const uploadRes = await fetch(`${desktopUrl}/api/sync/session`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${desktop.authToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ dateKey, session }),
          });
          if (!uploadRes.ok) {
            uploadErrors.push(dateKey);
          }
        } catch {
          uploadErrors.push(dateKey);
        }
      }
    }

    if (uploadErrors.length > 0) {
      return { success: true, message: `Synced (${uploadErrors.length} session(s) failed to upload)` };
    }

    return { success: true, message: 'Synced successfully' };
  } catch (err) {
    console.error('Sync error:', err);
    return { success: false, message: 'Sync failed: network error' };
  }
}

// Parse QR code data (format: https://traindaily.vercel.app/pair?deviceId=...&ip=...&port=...&secret=...)
export function parseQRData(url: string): DesktopInfo | null {
  try {
    const parsed = new URL(url);
    const deviceId = parsed.searchParams.get('deviceId');
    const ip = parsed.searchParams.get('ip');
    const port = parsed.searchParams.get('port');
    const token = parsed.searchParams.get('secret') || parsed.searchParams.get('token'); // Support both

    if (!deviceId || !ip || !port || !token) return null;

    return {
      deviceId,
      lastKnownIp: ip,
      port: parseInt(port),
      authToken: token,
    };
  } catch {
    return null;
  }
}

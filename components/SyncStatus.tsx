'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { getStoredDesktopInfo, syncWithDesktop } from '@/lib/sync-client';

export function SyncStatus() {
  const [isPaired, setIsPaired] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncMessage, setSyncMessage] = useState<string>('');

  useEffect(() => {
    const desktop = getStoredDesktopInfo();
    setIsPaired(!!desktop);

    // Try to sync on mount if paired
    if (desktop) {
      handleSync();
    }
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage('');

    const result = await syncWithDesktop();

    setIsSyncing(false);
    setSyncMessage(result.message);

    if (result.success) {
      setLastSync(new Date());
    }
  };

  if (!isPaired) {
    return null; // Don't show status if not paired
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      {isSyncing ? (
        <>
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span className="text-muted-foreground">Syncing...</span>
        </>
      ) : lastSync ? (
        <>
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span className="text-muted-foreground">
            Synced {formatTimeAgo(lastSync)}
          </span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">Not synced</span>
        </>
      )}

      <Button
        size="sm"
        variant="ghost"
        onClick={handleSync}
        disabled={isSyncing}
        className="h-6 px-2 text-xs"
      >
        Sync Now
      </Button>

      {syncMessage && (
        <span className="text-muted-foreground/60">
          {syncMessage}
        </span>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

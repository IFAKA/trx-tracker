'use client';

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface SettingsState {
  trayVisible: boolean;
  openAtLogin: boolean;
}

export function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SettingsState>({
    trayVisible: true,
    openAtLogin: false,
  });

  // Load settings when dialog opens
  useEffect(() => {
    if (!open) return;

    setLoading(true);

    Promise.all([
      invoke<string | null>('get_setting', { key: 'tray_visible' }),
      invoke<string | null>('get_setting', { key: 'open_at_login' }),
    ])
      .then(([trayValue, loginValue]) => {
        setSettings({
          trayVisible: trayValue !== 'false',
          openAtLogin: loginValue === 'true',
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open]);

  const handleTrayChange = async (visible: boolean) => {
    setSettings((s) => ({ ...s, trayVisible: visible }));
    try {
      await invoke('set_tray_visible', { visible });
    } catch (e) {
      console.error('Failed to set tray visibility:', e);
      // Revert on failure
      setSettings((s) => ({ ...s, trayVisible: !visible }));
    }
  };

  const handleLoginChange = async (enabled: boolean) => {
    setSettings((s) => ({ ...s, openAtLogin: enabled }));
    try {
      await invoke('set_open_at_login', { enabled });
    } catch (e) {
      console.error('Failed to set open at login:', e);
      setSettings((s) => ({ ...s, openAtLogin: !enabled }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          aria-label="Settings"
        >
          <Settings className="size-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-0">
          {/* Show in menu bar */}
          <div className="flex items-start justify-between gap-4 py-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium leading-none">Show in menu bar</span>
              <span className="text-xs text-muted-foreground">
                Keep TrainDaily in the menu bar for quick access.
              </span>
              {!settings.trayVisible && !loading && (
                <span className="text-xs text-muted-foreground/70 mt-1">
                  You can still open TrainDaily from the Dock or Spotlight.
                </span>
              )}
            </div>
            <Switch
              checked={settings.trayVisible}
              onCheckedChange={handleTrayChange}
              disabled={loading}
            />
          </div>

          <div className="h-px bg-border" />

          {/* Open at login */}
          <div className="flex items-start justify-between gap-4 py-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium leading-none">Open at login</span>
              <span className="text-xs text-muted-foreground">
                Start TrainDaily automatically when you log in.
              </span>
            </div>
            <Switch
              checked={settings.openAtLogin}
              onCheckedChange={handleLoginChange}
              disabled={loading}
            />
          </div>

          <div className="h-px bg-border" />

          {/* Version */}
          <div className="pt-4 pb-1">
            <span className="text-xs text-muted-foreground/50">v1.6.0</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

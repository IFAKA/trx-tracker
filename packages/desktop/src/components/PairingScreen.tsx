'use client';

import { useState, useEffect, useRef } from 'react';
import { Smartphone, CheckCircle, Wifi, Copy } from 'lucide-react';
import { Button } from './ui/button';
import QRCode from 'qrcode';
import { invoke } from '@tauri-apps/api/core';

export function PairingScreen({ onClose }: { onClose?: () => void }) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrData, setQrData] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncDetected, setSyncDetected] = useState(false);
  const initialSessionCount = useRef<number | null>(null);

  useEffect(() => {
    async function generateQR() {
      try {
        const data = await invoke<string>('get_qr_code_data');
        setQrData(data);

        const url = await QRCode.toDataURL(data, {
          width: 300,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' },
        });
        setQrDataUrl(url);
        setLoading(false);
      } catch (err) {
        console.error('Failed to generate QR code:', err);
        setLoading(false);
      }
    }

    generateQR();
  }, []);

  // Poll for incoming sync from phone
  useEffect(() => {
    if (loading) return;

    async function checkForSync() {
      try {
        const sessions = await invoke<Record<string, unknown>>('get_all_sessions');
        const count = Object.keys(sessions).length;

        if (initialSessionCount.current === null) {
          initialSessionCount.current = count;
          return;
        }

        if (count > initialSessionCount.current) {
          setSyncDetected(true);
        }
      } catch {
        // silently ignore
      }
    }

    const interval = setInterval(checkForSync, 2000);
    checkForSync();
    return () => clearInterval(interval);
  }, [loading]);

  // Auto-close 2s after sync detected
  useEffect(() => {
    if (syncDetected && onClose) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [syncDetected, onClose]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (syncDetected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 gap-6">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <h1 className="text-2xl font-bold tracking-tight">PHONE SYNCED!</h1>
        <p className="text-sm text-muted-foreground">Workout data synced from your phone.</p>
        <p className="text-xs text-muted-foreground/60">Returning to workout...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 gap-6">
      <div className="flex items-center gap-3">
        <Smartphone className="w-8 h-8" />
        <h1 className="text-2xl font-bold tracking-tight">PAIR DEVICE</h1>
      </div>

      <p className="text-sm text-muted-foreground text-center max-w-md">
        Scan this QR code with your phone camera to sync workouts
      </p>

      {loading ? (
        <div className="w-[300px] h-[300px] flex items-center justify-center bg-secondary rounded-lg">
          <div className="animate-pulse text-muted-foreground">Generating QR code...</div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          {qrDataUrl && <img src={qrDataUrl} alt="Pairing QR Code" className="w-[300px] h-[300px]" />}
        </div>
      )}

      <div className="flex flex-col items-center gap-3 max-w-md">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Wifi className="w-4 h-4" />
          <span className="text-xs animate-pulse">Waiting for phone...</span>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={copyToClipboard}
          className="gap-2"
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Pairing URL
            </>
          )}
        </Button>
      </div>

      <div className="text-xs text-muted-foreground/60 text-center max-w-md space-y-2">
        <p>1. Open traindaily.vercel.app on your phone</p>
        <p>2. Scan this QR code with your camera</p>
        <p>3. Tap the sync button in the app</p>
      </div>

      {onClose && (
        <Button onClick={onClose} variant="ghost" className="mt-4">
          Back to Workout
        </Button>
      )}
    </div>
  );
}

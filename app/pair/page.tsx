'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Smartphone, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseQRData, saveDesktopInfo } from '@/lib/sync-client';

export default function PairPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'parsing' | 'success' | 'error'>('parsing');
  const [deviceId, setDeviceId] = useState<string>('');

  useEffect(() => {
    // Get pairing data from URL params
    const url = window.location.href;

    // Parse QR code data
    const desktopInfo = parseQRData(url);

    if (!desktopInfo) {
      setStatus('error');
      return;
    }

    // Save desktop info
    saveDesktopInfo(desktopInfo);
    setDeviceId(desktopInfo.deviceId);
    setStatus('success');

    // Auto-redirect after 2 seconds
    setTimeout(() => {
      router.push('/');
    }, 2000);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 gap-6">
      {status === 'parsing' && (
        <>
          <Smartphone className="w-16 h-16 animate-pulse" />
          <h1 className="text-2xl font-bold tracking-tight">PAIRING...</h1>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle className="w-16 h-16 text-green-500" />
          <h1 className="text-2xl font-bold tracking-tight">PAIRED!</h1>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Successfully paired with desktop
          </p>
          {deviceId && (
            <div className="text-xs text-muted-foreground/60 font-mono">
              {deviceId}
            </div>
          )}
          <p className="text-xs text-muted-foreground/60">
            Redirecting to home...
          </p>
        </>
      )}

      {status === 'error' && (
        <>
          <AlertCircle className="w-16 h-16 text-destructive" />
          <h1 className="text-2xl font-bold tracking-tight">PAIRING FAILED</h1>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Invalid QR code data. Please try scanning again.
          </p>
          <Button onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </>
      )}
    </div>
  );
}

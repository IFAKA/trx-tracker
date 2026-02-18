'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Smartphone, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseQRData, saveDesktopInfo, verifyPairing } from '@/lib/sync-client';

type Status = 'connecting' | 'success' | 'error';

export default function PairPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('connecting');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function pair() {
      const desktopInfo = parseQRData(window.location.href);

      if (!desktopInfo) {
        setErrorMessage('Invalid QR code — please try scanning again.');
        setStatus('error');
        return;
      }

      const result = await verifyPairing(desktopInfo);

      if (!result.ok) {
        setErrorMessage(result.error ?? 'Pairing failed.');
        setStatus('error');
        return;
      }

      saveDesktopInfo(desktopInfo);
      setStatus('success');

      setTimeout(() => {
        router.push('/');
      }, 1500);
    }

    pair();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 gap-6">
      {status === 'connecting' && (
        <>
          <Smartphone className="w-16 h-16 animate-pulse text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">CONNECTING...</h1>
          <p className="text-sm text-muted-foreground">Verifying connection to desktop</p>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle className="w-16 h-16 text-green-500" />
          <h1 className="text-2xl font-bold tracking-tight">PAIRED!</h1>
          <p className="text-xs text-muted-foreground/60">Redirecting to home...</p>
        </>
      )}

      {status === 'error' && (
        <>
          <AlertCircle className="w-16 h-16 text-destructive" />
          <h1 className="text-2xl font-bold tracking-tight">PAIRING FAILED</h1>
          <p className="text-sm text-muted-foreground text-center max-w-sm">{errorMessage}</p>
          <Button onClick={() => router.push('/')}>Back to Home</Button>
        </>
      )}
    </div>
  );
}

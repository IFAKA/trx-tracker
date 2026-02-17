/**
 * Shim for next/navigation in the Tauri Vite build.
 * Vite aliases "next/navigation" to this file so components that
 * import useRouter work without the Next.js App Router.
 */
import { useCallback } from 'react';

export function useRouter() {
  const push = useCallback((path: string) => {
    window.dispatchEvent(new CustomEvent('tauri-navigate', { detail: path }));
  }, []);
  return { push };
}

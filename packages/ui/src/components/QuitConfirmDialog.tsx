'use client';

import { useEffect, useRef } from 'react';
import { Button } from './ui/button';

interface QuitConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function QuitConfirmDialog({ open, onOpenChange, onConfirm }: QuitConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const quitRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const headingId = 'quit-dialog-heading';

  useEffect(() => {
    if (open) {
      // Save current focus to restore on close
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus Cancel button on open
      setTimeout(() => cancelRef.current?.focus(), 0);
    } else {
      // Restore focus on close
      previousFocusRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
        return;
      }
      if (e.key === 'Tab') {
        // Trap focus between cancel and quit buttons
        const focusable = [cancelRef.current, quitRef.current].filter(Boolean) as HTMLElement[];
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/60 animate-in fade-in-0 duration-200"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="relative bg-background border-t border-border rounded-t-2xl p-6 pb-10 w-full max-w-md shadow-xl animate-in slide-in-from-bottom duration-200"
      >
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-5" />
        <h2 id={headingId} className="text-lg font-semibold text-center mb-2">Quit workout?</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Your progress for this session will be lost.
        </p>
        <div className="flex gap-3">
          <Button
            ref={cancelRef}
            variant="outline"
            className="flex-1 rounded-full h-12"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            ref={quitRef}
            variant="destructive"
            className="flex-1 rounded-full h-12"
            onClick={onConfirm}
          >
            Quit
          </Button>
        </div>
      </div>
    </div>
  );
}

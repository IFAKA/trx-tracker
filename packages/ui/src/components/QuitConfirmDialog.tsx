'use client';

import { Button } from './ui/button';

interface QuitConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function QuitConfirmDialog({ open, onOpenChange, onConfirm }: QuitConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 animate-in fade-in-0"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative bg-background border border-border rounded-2xl p-6 w-[280px] shadow-xl animate-in zoom-in-95 fade-in-0 duration-200">
        <h2 className="text-lg font-semibold text-center mb-2">Quit workout?</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Your progress for this session will be lost.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="flex-1 rounded-full"
            onClick={onConfirm}
          >
            Quit
          </Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef } from 'react';
import { Check } from 'lucide-react';

const ITEM_H = 60;
const VISIBLE = 5; // must be odd — center item is selected
const CENTER = Math.floor(VISIBLE / 2); // 2

interface NumberWheelProps {
  defaultValue: number;
  min?: number;
  max: number;
  label: string;
  onConfirm: (value: number) => void;
}

export function NumberWheel({ defaultValue, min = 0, max, label, onConfirm }: NumberWheelProps) {
  const [value, setValue] = useState(() => Math.min(Math.max(defaultValue, min), max));
  const floatVal = useRef(Math.min(Math.max(defaultValue, min), max));
  const lastSnapped = useRef(floatVal.current);
  const startY = useRef(0);
  const startFloat = useRef(0);
  const dragging = useRef(false);
  const raf = useRef<number>(0);
  const velY = useRef(0);
  const lastY = useRef(0);
  const lastT = useRef(0);

  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  function snap(fv: number) {
    floatVal.current = fv;
    const snapped = clamp(Math.round(fv));
    if (snapped !== lastSnapped.current) {
      lastSnapped.current = snapped;
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(2);
    }
    setValue(snapped);
  }

  function onPointerDown(e: React.PointerEvent) {
    cancelAnimationFrame(raf.current);
    dragging.current = true;
    startY.current = e.clientY;
    startFloat.current = floatVal.current;
    lastY.current = e.clientY;
    lastT.current = Date.now();
    velY.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const dy = e.clientY - startY.current;
    // drag down → lower value, drag up → higher value
    snap(clamp(startFloat.current - dy / ITEM_H));

    const now = Date.now();
    const dt = now - lastT.current;
    if (dt > 0) velY.current = (e.clientY - lastY.current) / dt;
    lastY.current = e.clientY;
    lastT.current = now;
  }

  function onPointerUp() {
    if (!dragging.current) return;
    dragging.current = false;

    // Momentum scroll
    let vel = velY.current;
    if (Math.abs(vel) < 0.1) return;

    let fv = floatVal.current;
    const step = () => {
      vel *= 0.88;
      fv = clamp(fv - vel * 16 / ITEM_H);
      snap(fv);
      if (Math.abs(vel) > 0.04) {
        raf.current = requestAnimationFrame(step);
      }
    };
    raf.current = requestAnimationFrame(step);
  }

  // Translate the column so the selected item sits at the center row
  const translateY = CENTER * ITEM_H - (value - min) * ITEM_H;
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="flex flex-col items-center gap-4">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>

      <div
        className="relative overflow-hidden select-none touch-none cursor-ns-resize"
        style={{ height: VISIBLE * ITEM_H, width: 120 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Selection band */}
        <div
          className="absolute inset-x-0 z-10 pointer-events-none border-t border-b border-foreground/25"
          style={{ top: CENTER * ITEM_H, height: ITEM_H }}
        />

        {/* Scrolling number column */}
        <div
          className="absolute w-full will-change-transform"
          style={{ transform: `translateY(${translateY}px)` }}
        >
          {numbers.map((n) => {
            const dist = Math.abs(n - value);
            return (
              <div
                key={n}
                className="flex items-center justify-center font-mono font-bold"
                style={{
                  height: ITEM_H,
                  fontSize: dist === 0 ? 42 : dist === 1 ? 26 : 18,
                  opacity: dist === 0 ? 1 : dist === 1 ? 0.5 : dist === 2 ? 0.2 : 0.05,
                  transition: 'font-size 60ms ease-out, opacity 60ms ease-out',
                }}
              >
                {n}
              </div>
            );
          })}
        </div>

        {/* Top fade */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent pointer-events-none z-20" />
        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none z-20" />
      </div>

      {/* Confirm */}
      <button
        onClick={() => onConfirm(value)}
        className="w-14 h-14 rounded-full bg-foreground text-background flex items-center justify-center active:scale-95 transition-transform shadow-md"
      >
        <Check className="w-7 h-7" />
      </button>
    </div>
  );
}

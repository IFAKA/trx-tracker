'use client';

import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';

const ITEM_H = 60;
const VISIBLE = 5; // odd — center slot is the selected value
const CENTER = Math.floor(VISIBLE / 2); // 2

interface NumberWheelProps {
  defaultValue: number;
  min?: number;
  max: number;
  label: string;
  onConfirm: (value: number) => void;
}

export function NumberWheel({ defaultValue, min = 0, max, label, onConfirm }: NumberWheelProps) {
  const init = Math.min(Math.max(defaultValue, min), max);

  // Single float source of truth — drives both translateY and item opacity/size
  const [float, setFloat] = useState(init);
  const floatRef = useRef(init);

  // Scroll state
  const dragging = useRef(false);
  const hasMoved = useRef(false);
  const startY = useRef(0);
  const startFloat = useRef(0);
  const velY = useRef(0);
  const lastY = useRef(0);
  const lastT = useRef(0);
  const lastHapticInt = useRef(init);
  const raf = useRef<number>(0);
  const animatingTo = useRef<number | null>(null); // target int for snap animation

  // CSS transition toggle — only active during final snap after lift
  const [snapping, setSnapping] = useState(false);

  // Edit (tap-to-type) state
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const editStartVal = useRef(init);
  const editDone = useRef(false); // guards against blur firing after Enter/Escape
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  function setFloatBoth(fv: number) {
    floatRef.current = fv;
    setFloat(fv);
  }

  function tickHaptic(fv: number) {
    const snapped = Math.round(fv);
    if (snapped !== lastHapticInt.current) {
      lastHapticInt.current = snapped;
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(2);
    }
  }

  // ── Drag handlers ─────────────────────────────────────────────────────────

  function onPointerDown(e: React.PointerEvent) {
    if (editing) return;
    cancelAnimationFrame(raf.current);
    animatingTo.current = null;
    dragging.current = true;
    hasMoved.current = false;
    snapping && setSnapping(false);
    startY.current = e.clientY;
    startFloat.current = floatRef.current;
    lastY.current = e.clientY;
    lastT.current = Date.now();
    velY.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const dy = e.clientY - startY.current;
    if (Math.abs(dy) > 4) hasMoved.current = true;
    const fv = clamp(startFloat.current - dy / ITEM_H);
    setFloatBoth(fv);
    tickHaptic(fv);

    const now = Date.now();
    const dt = now - lastT.current;
    if (dt > 0) velY.current = (e.clientY - lastY.current) / dt;
    lastY.current = e.clientY;
    lastT.current = now;
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!dragging.current) return;
    dragging.current = false;

    // Tap on center → open keyboard edit
    if (!hasMoved.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      if (y >= CENTER * ITEM_H && y < (CENTER + 1) * ITEM_H) {
        const current = clamp(Math.round(floatRef.current));
        editDone.current = false;
        editStartVal.current = current;
        setEditText(String(current));
        setEditing(true);
        return;
      }
    }

    // Calculate where momentum will carry the wheel using geometric series:
    //   total displacement = vel / (1 − damping) × frame_ms / ITEM_H
    const vel = velY.current;
    const totalDelta = Math.abs(vel) > 0.08 ? (vel / (1 - 0.88)) * 16 / ITEM_H : 0;
    const target = clamp(Math.round(floatRef.current - totalDelta));

    animatingTo.current = target;
    lastHapticInt.current = target;
    setSnapping(true);
    setFloatBoth(target);

    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(2);

    // Remove transition class after animation finishes
    setTimeout(() => {
      setSnapping(false);
      animatingTo.current = null;
    }, 420);
  }

  // ── Edit handlers ─────────────────────────────────────────────────────────

  function finishEdit(text: string) {
    if (editDone.current) return;
    editDone.current = true;
    const n = parseInt(text, 10);
    const target = !isNaN(n) && text.trim() !== '' ? clamp(n) : editStartVal.current;
    lastHapticInt.current = target;
    setFloatBoth(target);
    setEditing(false);
  }

  function cancelEdit() {
    if (editDone.current) return;
    editDone.current = true;
    const v = editStartVal.current;
    lastHapticInt.current = v;
    setFloatBoth(v);
    setEditing(false);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const translateY = CENTER * ITEM_H - (float - min) * ITEM_H;
  const centerInt = Math.round(float);
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="flex flex-col items-center gap-4">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>

      <div
        ref={containerRef}
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

        {/* Scrolling column */}
        <div
          className="absolute w-full will-change-transform"
          style={{
            transform: `translateY(${translateY}px)`,
            transition: snapping ? 'transform 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
          }}
        >
          {numbers.map((n) => {
            const dist = Math.abs(n - float); // float distance for smooth opacity
            const distInt = Math.abs(n - centerInt); // integer distance for size
            return (
              <div
                key={n}
                className="flex items-center justify-center font-mono font-bold"
                style={{
                  height: ITEM_H,
                  fontSize: distInt === 0 ? 42 : distInt === 1 ? 26 : 18,
                  opacity: Math.max(0.04, 1 - dist * 0.55),
                  transition: snapping
                    ? 'font-size 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                    : 'font-size 60ms ease-out, opacity 40ms linear',
                }}
              >
                {n}
              </div>
            );
          })}
        </div>

        {/* Fade gradients */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent pointer-events-none z-20" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none z-20" />

        {/* Keyboard edit — floats over center slot */}
        {editing && (
          <div
            className="absolute inset-x-0 z-30 flex items-center justify-center"
            style={{ top: CENTER * ITEM_H, height: ITEM_H }}
          >
            <input
              ref={inputRef}
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={() => cancelEdit()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); finishEdit(editText); }
                if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
              }}
              className="w-20 text-center text-3xl font-mono font-bold bg-transparent border-none outline-none text-foreground caret-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        )}
      </div>

      {/* Confirm */}
      <button
        onMouseDown={(e) => e.preventDefault()} // keeps focus on input if editing
        onClick={() => {
          if (editing) finishEdit(editText);
          onConfirm(clamp(Math.round(floatRef.current)));
        }}
        className="w-14 h-14 rounded-full bg-foreground text-background flex items-center justify-center active:scale-95 transition-transform shadow-md"
      >
        <Check className="w-7 h-7" />
      </button>
    </div>
  );
}

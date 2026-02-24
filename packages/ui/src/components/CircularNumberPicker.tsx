'use client';

import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';

const SIZE = 220;
const CENTER = SIZE / 2; // 110
const RING_R = 88;

function polarXY(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
}

function buildArc(value: number, max: number): string {
  const pct = Math.min(value / max, 0.9999);
  if (pct <= 0) return '';
  const start = polarXY(-90, RING_R);
  const end = polarXY(-90 + pct * 360, RING_R);
  const large = pct > 0.5 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${RING_R} ${RING_R} 0 ${large} 1 ${end.x} ${end.y}`;
}

interface CircularNumberPickerProps {
  defaultValue: number;
  max: number;
  label: string;
  onConfirm: (value: number) => void;
}

export function CircularNumberPicker({ defaultValue, max, label, onConfirm }: CircularNumberPickerProps) {
  const [value, setValue] = useState(() => Math.min(defaultValue, max));
  const [typing, setTyping] = useState(false);
  const [typedText, setTypedText] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typing) inputRef.current?.focus();
  }, [typing]);

  function getAngle(cx: number, cy: number): number {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const scale = SIZE / rect.width;
    const x = (cx - rect.left) * scale - CENTER;
    const y = (cy - rect.top) * scale - CENTER;
    return Math.atan2(y, x) * (180 / Math.PI);
  }

  function angleToVal(deg: number): number {
    return Math.round(((deg + 90 + 360) % 360) / 360 * max);
  }

  function applyAngle(cx: number, cy: number) {
    const newVal = Math.min(max, Math.max(0, angleToVal(getAngle(cx, cy))));
    setValue(prev => {
      if (prev !== newVal && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(2);
      }
      return newVal;
    });
  }

  function startDrag(cx: number, cy: number) {
    dragging.current = true;
    applyAngle(cx, cy);
  }

  function moveDrag(cx: number, cy: number) {
    if (!dragging.current) return;
    applyAngle(cx, cy);
  }

  function commitTyped(text: string) {
    const n = parseInt(text);
    if (!isNaN(n)) setValue(Math.min(max, Math.max(0, n)));
    setTyping(false);
  }

  const handleAngle = -90 + (value / max) * 360;
  const handlePos = polarXY(handleAngle, RING_R);
  const arc = buildArc(value, max);

  // Tick marks — every 5 up to max
  const STEP = max <= 60 ? 5 : 10;
  const ticks: { x1: number; y1: number; x2: number; y2: number; major: boolean; v: number }[] = [];
  for (let v = 0; v <= max; v += STEP) {
    const angle = -90 + (v / max) * 360;
    const rad = (angle * Math.PI) / 180;
    const major = v % (STEP * 3) === 0;
    ticks.push({
      x1: CENTER + 98 * Math.cos(rad),
      y1: CENTER + 98 * Math.sin(rad),
      x2: CENTER + (major ? 84 : 91) * Math.cos(rad),
      y2: CENTER + (major ? 84 : 91) * Math.sin(rad),
      major,
      v,
    });
  }
  const labelTicks = ticks.filter(t => t.major);

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>

      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        {/* SVG ring — handles drag on the ring/exterior area */}
        <svg
          ref={svgRef}
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ touchAction: 'none', userSelect: 'none' }}
          onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX, e.clientY); }}
          onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
          onMouseUp={() => { dragging.current = false; }}
          onMouseLeave={() => { dragging.current = false; }}
          onTouchStart={(e) => { e.preventDefault(); startDrag(e.touches[0].clientX, e.touches[0].clientY); }}
          onTouchMove={(e) => { e.preventDefault(); moveDrag(e.touches[0].clientX, e.touches[0].clientY); }}
          onTouchEnd={() => { dragging.current = false; }}
        >
          {/* Background track */}
          <circle
            cx={CENTER} cy={CENTER} r={RING_R}
            fill="none" stroke="currentColor" strokeWidth={10}
            className="text-muted/30"
          />

          {/* Tick marks */}
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke="currentColor"
              strokeWidth={t.major ? 2 : 1}
              strokeLinecap="round"
              className={t.major ? 'text-muted-foreground/50' : 'text-muted-foreground/20'}
            />
          ))}

          {/* Labels at every 3rd major tick */}
          {labelTicks.map((t, i) => {
            const angle = -90 + (t.v / max) * 360;
            const rad = (angle * Math.PI) / 180;
            return (
              <text
                key={i}
                x={CENTER + 71 * Math.cos(rad)}
                y={CENTER + 71 * Math.sin(rad)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={9}
                fill="currentColor"
                className="text-muted-foreground/40"
              >
                {t.v}
              </text>
            );
          })}

          {/* Progress arc */}
          {arc && (
            <path
              d={arc}
              fill="none"
              stroke="currentColor"
              strokeWidth={10}
              strokeLinecap="round"
              className="text-foreground"
            />
          )}

          {/* Handle dot */}
          <circle cx={handlePos.x} cy={handlePos.y} r={13} fill="currentColor" className="text-foreground" />
          <circle cx={handlePos.x} cy={handlePos.y} r={5} fill="currentColor" className="text-background" />
        </svg>

        {/* Center overlay — 140px circular zone captures taps (doesn't propagate to SVG) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-[140px] h-[140px] rounded-full flex items-center justify-center cursor-pointer pointer-events-auto"
            onClick={() => {
              setTypedText(String(value));
              setTyping(true);
            }}
          >
            {typing ? (
              <input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                onBlur={() => commitTyped(typedText)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitTyped(typedText);
                  if (e.key === 'Escape') setTyping(false);
                }}
                className="w-20 text-center text-4xl font-mono font-bold bg-transparent border-none outline-none text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            ) : (
              <span className="text-5xl font-mono font-bold text-foreground leading-none select-none">
                {value}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Confirm button */}
      <button
        onClick={() => onConfirm(value)}
        className="w-14 h-14 rounded-full bg-foreground text-background flex items-center justify-center active:scale-95 transition-transform shadow-md"
      >
        <Check className="w-7 h-7" />
      </button>
    </div>
  );
}

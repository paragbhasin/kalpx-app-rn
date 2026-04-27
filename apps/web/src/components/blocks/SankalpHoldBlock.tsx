/**
 * SankalpHoldBlock — press-and-hold circle for sankalp_embody state.
 * Supports pointer (touch/mouse) and keyboard (Space/Enter) hold.
 * Fires complete_runner when hold_duration ms elapses.
 * Shows the sankalp text from screenData above the hold circle.
 */
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { interpolate } from '../../engine/interpolation';

interface Props {
  block: {
    hold_duration?: number;
    [key: string]: any;
  };
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

const CIRCUMFERENCE = 2 * Math.PI * 64;

export function SankalpHoldBlock({ block, screenData = {}, onAction }: Props) {
  const duration = block.hold_duration ?? 3000;
  const sankalpText = interpolate(
    screenData['sankalp_text'] || screenData['runner_active_item']?.title || '',
    screenData,
  );

  const [progress, setProgress] = useState(0); // 0..1
  const [complete, setComplete] = useState(false);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const cancelHold = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    startRef.current = null;
    setProgress(0);
  }, []);

  const startHold = useCallback(() => {
    if (complete) return;
    startRef.current = performance.now();
    const tick = (now: number) => {
      if (startRef.current === null) return;
      const elapsed = now - startRef.current;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p >= 1) {
        setComplete(true);
        onAction?.({ type: 'complete_runner' });
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [complete, duration, onAction]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const strokeOffset = CIRCUMFERENCE * (1 - progress);

  if (complete) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px', gap: 16 }}>
        <div style={{ width: 144, height: 144, borderRadius: '50%', background: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width={40} height={40} viewBox="0 0 40 40" fill="none">
            <path d="M8 20l8 8 16-16" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p style={{ fontSize: 14, color: '#9A8C78', letterSpacing: 1 }}>Embodied</p>
      </div>
    );
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px', gap: 24 }}
      data-testid="sankalp-hold-block"
    >
      {sankalpText ? (
        <p
          style={{
            fontFamily: "'Roboto Serif', Georgia, serif",
            fontSize: 20,
            fontStyle: 'italic',
            lineHeight: 1.5,
            textAlign: 'center',
            color: '#2C2A26',
            maxWidth: 320,
          }}
        >
          "{sankalpText}"
        </p>
      ) : null}

      <p style={{ fontSize: 13, color: '#9A8C78', textAlign: 'center' }}>
        Hold here. Breathe once, and let your sankalp anchor within you.
      </p>

      <div
        role="button"
        tabIndex={0}
        data-testid="sankalp-hold-circle"
        aria-label="Hold to embody sankalp"
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); startHold(); } }}
        onKeyUp={(e) => { if (e.key === ' ' || e.key === 'Enter') cancelHold(); }}
        style={{ position: 'relative', width: 144, height: 144, cursor: 'pointer', userSelect: 'none', touchAction: 'none' }}
      >
        <svg width={144} height={144} style={{ position: 'absolute', inset: 0 }}>
          <circle cx={72} cy={72} r={64} fill="none" stroke="#F0E8D8" strokeWidth={8} />
          <circle
            cx={72}
            cy={72}
            r={64}
            fill="none"
            stroke="#C9A84C"
            strokeWidth={8}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '72px 72px', transition: progress === 0 ? 'none' : 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: progress > 0 ? 'rgba(201,168,76,0.12)' : 'transparent',
          }}
        >
          <span style={{ fontSize: 11, color: '#9A8C78', letterSpacing: 2, textTransform: 'uppercase' }}>
            {progress > 0 ? 'Holding…' : 'Hold'}
          </span>
        </div>
      </div>
    </div>
  );
}

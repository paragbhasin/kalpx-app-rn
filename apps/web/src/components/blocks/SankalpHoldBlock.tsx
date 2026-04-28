/**
 * SankalpHoldBlock — press-and-hold circle for sankalp_embody state.
 * Supports pointer (touch/mouse) and keyboard (Space/Enter) hold.
 * Fires complete_runner when hold_duration ms elapses.
 * Shows the sankalp text from screenData above the hold circle.
 */
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { interpolate } from '../../engine/interpolation';
import { createAudio, type AudioHandle } from '../../lib/audio/howlerAudio';

interface Props {
  block: {
    hold_duration?: number;
    [key: string]: any;
  };
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

const CIRCUMFERENCE = 2 * Math.PI * 70;

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
  const audioRef = useRef<AudioHandle | null>(null);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.stop();
      audioRef.current.unload();
      audioRef.current = null;
    }
  }, []);

  const cancelHold = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    startRef.current = null;
    setProgress(0);
    stopAudio();
  }, [stopAudio]);

  const startHold = useCallback(() => {
    if (complete) return;
    const audioUrl = screenData?.sankalp_audio_url as string | undefined;
    if (audioUrl && !audioRef.current) {
      audioRef.current = createAudio(audioUrl, { loop: false, volume: 0.6 });
      try { audioRef.current.play(); } catch {}
    }
    startRef.current = performance.now();
    const tick = (now: number) => {
      if (startRef.current === null) return;
      const elapsed = now - startRef.current;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p >= 1) {
        setComplete(true);
        stopAudio();
        onAction?.({ type: 'complete_runner' });
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [complete, duration, onAction, screenData, stopAudio]);

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    stopAudio();
  }, [stopAudio]);

  const strokeOffset = CIRCUMFERENCE * (1 - progress);

  if (complete) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px', gap: 16 }}>
        <div style={{ width: 144, height: 144, borderRadius: '50%', background: 'var(--kalpx-cta)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width={40} height={40} viewBox="0 0 40 40" fill="none">
            <path d="M8 20l8 8 16-16" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p style={{ fontSize: 16, fontFamily: 'var(--kalpx-font-serif)', color: 'var(--kalpx-text)', letterSpacing: 1 }}>Held.</p>
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
            fontFamily: 'var(--kalpx-font-serif)',
            fontSize: 22,
            fontStyle: 'italic',
            lineHeight: 1.5,
            textAlign: 'center',
            color: 'var(--kalpx-text)',
            maxWidth: 320,
          }}
        >
          "{sankalpText}"
        </p>
      ) : null}

      <p style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', textAlign: 'center', transition: 'opacity 1.5s', opacity: progress > 0.5 ? 0 : 1 }}>
        Hold here. Breathe once, and let your sankalp anchor within you.
      </p>

      {/* Hold circle — 160px matches RN, with SVG defs for gradient */}
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
        style={{ position: 'relative', width: 160, height: 160, cursor: 'pointer', userSelect: 'none', touchAction: 'none' }}
      >
        <svg width={160} height={160} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <linearGradient id="sankalpRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5e8c3" />
              <stop offset="100%" stopColor="#c9a84c" />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle cx={80} cy={80} r={70} fill="none" stroke="rgba(240,232,216,0.3)" strokeWidth={8} />
          {/* Progress arc */}
          <circle
            cx={80}
            cy={80}
            r={70}
            fill="none"
            stroke="url(#sankalpRingGrad)"
            strokeWidth={8}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px', transition: progress === 0 ? 'none' : 'stroke-dashoffset 0.05s linear' }}
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
            background: progress > 0 ? 'rgba(201,168,76,0.1)' : 'transparent',
          }}
        >
          <span style={{ fontSize: 12, color: 'var(--kalpx-text-muted)', letterSpacing: 2, textTransform: 'uppercase' }}>
            {progress > 0.8 ? 'Steady…' : progress > 0 ? 'Holding…' : 'Hold'}
          </span>
        </div>
      </div>
    </div>
  );
}

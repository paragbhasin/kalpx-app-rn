import React, { useState, useCallback, useRef } from 'react';

interface Props {
  block: {
    unlimited?: boolean;
    total?: number;
    [key: string]: any;
  };
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

const REP_PRESETS = [1, 9, 27, 54, 108] as const;
const BEAD_COUNT = 18;
const BEAD_R = 86;
const CX = 115;
const CY = 115;

export function RepCounterBlock({ block, screenData = {}, onAction }: Props) {
  const initialTotal: number = block.total ?? (screenData['reps_total'] as number) ?? 108;
  const [repsTotal, setRepsTotal] = useState<number>(initialTotal);
  const unlimited = block.unlimited === true || repsTotal <= 0;

  const initialReps = (screenData['runner_reps_completed'] as number) || 0;
  const [reps, setReps] = useState(initialReps);
  const [pressed, setPressed] = useState(false);
  const pressedRef = useRef(false);

  // Context-safe — all item fields may be absent
  const activeItem = (screenData['runner_active_item'] as any) || null;
  const title: string = activeItem?.title || '';
  const deity: string = activeItem?.source_deity || activeItem?.author || '';

  const increment = useCallback(() => {
    const next = reps + 1;
    setReps(next);
    onAction?.({ type: 'set_screen_value', key: 'runner_reps_completed', value: next });

    if (!unlimited && next >= repsTotal) {
      onAction?.({ type: 'complete_runner' });
    }
  }, [reps, unlimited, repsTotal, onAction]);

  const handlePointerDown = useCallback(() => {
    pressedRef.current = true;
    setPressed(true);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!pressedRef.current) return;
    pressedRef.current = false;
    setPressed(false);
  }, []);

  // 18 rudraksh beads radially at r=86 in 230×230 SVG
  const beads = Array.from({ length: BEAD_COUNT }, (_, i) => {
    const angle = (i * (360 / BEAD_COUNT) - 90) * (Math.PI / 180);
    const x = CX + BEAD_R * Math.cos(angle) - 12;
    const y = CY + BEAD_R * Math.sin(angle) - 12;
    const lit = i < (unlimited ? reps % BEAD_COUNT : Math.min(reps, BEAD_COUNT));
    return { x, y, lit };
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        gap: 12,
        minHeight: '100dvh',
      }}
    >
      {/* Title + deity — conditional on item fields being present */}
      {title ? (
        <p style={{ fontSize: 18, fontFamily: 'var(--kalpx-font-serif)', fontWeight: 600, color: 'var(--kalpx-text)', textAlign: 'center', margin: 0 }}>
          {title}
        </p>
      ) : null}
      {deity ? (
        <p style={{ fontSize: 12, color: 'var(--kalpx-text-muted)', fontStyle: 'italic', textAlign: 'center', margin: 0 }}>
          {deity}
        </p>
      ) : null}

      {/* Counter — above ring */}
      <div style={{ textAlign: 'center', lineHeight: 1 }}>
        <span style={{ fontSize: 52, fontWeight: 300, color: 'var(--kalpx-text)' }}>
          {reps}
        </span>
        {!unlimited ? (
          <span style={{ fontSize: 15, color: 'var(--kalpx-text-muted)', marginLeft: 6 }}>/ {repsTotal}</span>
        ) : null}
      </div>

      {/* Bead ring */}
      <div
        style={{ position: 'relative', width: 230, height: 230 }}
        data-testid="rep-counter"
      >
        <svg width={230} height={230} style={{ position: 'absolute', top: 0, left: 0 }}>
          {beads.map((b, i) => (
            <image
              key={i}
              href="/rudraksh.svg"
              width={24}
              height={24}
              x={b.x}
              y={b.y}
              style={{ opacity: b.lit ? 1 : 0.25, transition: 'opacity 0.2s ease' }}
            />
          ))}
        </svg>
        <button
          onClick={increment}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          data-testid="rep-tap-target"
          style={{
            position: 'absolute',
            inset: 35,
            borderRadius: '50%',
            border: `2px solid var(--kalpx-gold)`,
            background: 'rgba(201,168,76,0.08)',
            boxShadow: '0 0 0 4px rgba(201,168,76,0.15), 0 4px 16px rgba(0,0,0,0.12)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: pressed ? 'scale(0.93)' : 'scale(1)',
            transition: 'transform 200ms ease',
          }}
        >
          {unlimited && (
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span style={{ fontSize: 10, color: 'var(--kalpx-text-muted)', letterSpacing: 2, textTransform: 'uppercase' }}>TAP</span>
              <span style={{ fontSize: 8, color: 'var(--kalpx-text-muted)', letterSpacing: 2, textTransform: 'uppercase' }}>THE BEAD</span>
            </span>
          )}
        </button>
      </div>

      <p style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', letterSpacing: 1, textAlign: 'center', textTransform: unlimited ? 'uppercase' : 'none' }}>
        {unlimited ? 'TAP THE BEAD AFTER EACH MANTRA.' : `${repsTotal - reps} remaining`}
      </p>

      {/* Rep chips — always visible; tap → set target + reset count */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {REP_PRESETS.map((n) => (
          <button
            key={n}
            onClick={() => { setRepsTotal(n); setReps(0); }}
            data-testid={`rep-chip-${n}`}
            style={{
              padding: '5px 14px',
              borderRadius: 20,
              border: '1px solid var(--kalpx-border-gold)',
              background: repsTotal === n && !unlimited ? 'var(--kalpx-border-gold)' : 'transparent',
              color: repsTotal === n && !unlimited ? 'var(--kalpx-text)' : 'var(--kalpx-text-muted)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

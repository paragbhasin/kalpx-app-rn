import React, { useState, useCallback } from 'react';

interface Props {
  block: {
    unlimited?: boolean;
    total?: number;
    [key: string]: any;
  };
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

export function RepCounterBlock({ block, screenData = {}, onAction }: Props) {
  const total: number = block.total ?? (screenData['reps_total'] as number) ?? 108;
  const unlimited = block.unlimited === true || total <= 0;

  const initialReps = (screenData['runner_reps_completed'] as number) || 0;
  const [reps, setReps] = useState(initialReps);

  const increment = useCallback(() => {
    const next = reps + 1;
    setReps(next);
    onAction?.({ type: 'set_screen_value', key: 'runner_reps_completed', value: next });

    if (!unlimited && next >= total) {
      onAction?.({ type: 'complete_runner' });
    }
  }, [reps, unlimited, total, onAction]);

  const progress = unlimited ? null : Math.min(reps / total, 1);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 16px',
        gap: 16,
      }}
    >
      {/* Progress ring / counter */}
      <div
        style={{ position: 'relative', width: 160, height: 160 }}
        data-testid="rep-counter"
      >
        {progress !== null ? (
          <svg width={160} height={160} style={{ position: 'absolute', top: 0, left: 0 }}>
            <circle cx={80} cy={80} r={70} fill="none" stroke="#F0E8D8" strokeWidth={8} />
            <circle
              cx={80}
              cy={80}
              r={70}
              fill="none"
              stroke="#C9A84C"
              strokeWidth={8}
              strokeDasharray={2 * Math.PI * 70}
              strokeDashoffset={2 * Math.PI * 70 * (1 - progress)}
              strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px', transition: 'stroke-dashoffset 0.3s ease' }}
            />
          </svg>
        ) : null}
        <button
          onClick={increment}
          data-testid="rep-tap-target"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid #C9A84C',
            background: 'rgba(201,168,76,0.08)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <span style={{ fontSize: 40, fontWeight: 300, color: '#2C2A26', lineHeight: 1 }}>
            {reps}
          </span>
          {!unlimited ? (
            <span style={{ fontSize: 13, color: '#9A8C78' }}>/ {total}</span>
          ) : (
            <span style={{ fontSize: 12, color: '#9A8C78', letterSpacing: 1 }}>TAP</span>
          )}
        </button>
      </div>

      <p style={{ fontSize: 13, color: '#9A8C78', letterSpacing: 1, textAlign: 'center' }}>
        {unlimited ? 'Tap with each repetition' : `${total - reps} remaining`}
      </p>
    </div>
  );
}

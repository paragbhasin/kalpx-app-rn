/**
 * LifeContextPickerSheet — 2-step context picker before room render.
 * Does not block room entry if user skips.
 */
import React from 'react';
import { LIFE_CONTEXT_OPTIONS, ROOM_DISPLAY_NAMES } from './roomConstants';

interface Props {
  roomId: string;
  allowedContexts?: string[] | null;
  onPick: (context: string) => void;
  onSkip: () => void;
  onBack: () => void;
}

export function LifeContextPickerSheet({ roomId, allowedContexts, onPick, onSkip, onBack }: Props) {
  const roomName = ROOM_DISPLAY_NAMES[roomId] || roomId;
  const options = allowedContexts
    ? LIFE_CONTEXT_OPTIONS.filter((o) => allowedContexts.includes(o.id))
    : LIFE_CONTEXT_OPTIONS;

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: '#FFF8EF', padding: '24px 20px' }}
      data-testid="life-context-picker"
    >
      <button
        onClick={onBack}
        data-testid="context-picker-back"
        style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#9A8C78', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 32 }}
      >
        ← Back
      </button>

      <p style={{ fontSize: 11, color: '#9A8C78', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' }}>
        {roomName} Room
      </p>
      <h2 style={{ fontSize: 20, fontWeight: 400, color: '#2C2A26', marginBottom: 6, lineHeight: 1.4 }}>
        What kind of support would help right now?
      </h2>
      <p style={{ fontSize: 14, color: '#6B6356', lineHeight: 1.6, marginBottom: 28 }}>
        This helps Mitra bring what's most useful for you.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onPick(opt.id)}
            data-testid={`context-option-${opt.id}`}
            style={{
              padding: '14px 20px',
              borderRadius: 12,
              border: '1px solid #E8DCC8',
              background: '#fff',
              color: '#2C2A26',
              fontSize: 15,
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <button
        onClick={onSkip}
        data-testid="context-picker-skip"
        style={{ background: 'none', border: 'none', color: '#9A8C78', fontSize: 13, cursor: 'pointer', padding: '16px 0 0', textAlign: 'center' }}
      >
        Skip — show general guidance
      </button>
    </div>
  );
}

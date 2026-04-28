/**
 * LifeContextPickerSheet — 2-step context picker before room render.
 * Does not block room entry if user skips.
 *
 * Web renders as a full page (not a modal) — intentional for web UX.
 * Browser back is guarded: popstate listener redirects to dashboard.
 */
import React, { useEffect } from 'react';
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

  // Guard browser back — redirect to dashboard instead of popping state
  useEffect(() => {
    const handler = (e: PopStateEvent) => {
      e.preventDefault();
      onBack();
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [onBack]);

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: 'var(--kalpx-bg)', padding: '24px 20px' }}
      data-testid="life-context-picker"
    >
      <button
        onClick={onBack}
        data-testid="context-picker-back"
        style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--kalpx-text-muted)', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 32 }}
      >
        ← Back
      </button>

      <p style={{ fontSize: 11, color: 'var(--kalpx-text-muted)', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' }}>
        {roomName} Room
      </p>
      <h2 style={{ fontSize: 20, fontWeight: 400, color: 'var(--kalpx-text)', marginBottom: 6, lineHeight: 1.4 }}>
        What kind of support would help right now?
      </h2>
      <p style={{ fontSize: 14, color: 'var(--kalpx-text-soft)', lineHeight: 1.6, marginBottom: 28 }}>
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
              border: `1px solid var(--kalpx-border-gold)`,
              background: 'var(--kalpx-card-bg)',
              color: 'var(--kalpx-text)',
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
        style={{ background: 'none', border: 'none', color: 'var(--kalpx-text-muted)', fontSize: 13, cursor: 'pointer', padding: '16px 0 0', textAlign: 'center' }}
      >
        Skip
      </button>
    </div>
  );
}

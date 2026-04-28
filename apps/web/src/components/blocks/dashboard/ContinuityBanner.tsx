import React from 'react';

interface Props {
  sd: Record<string, any>;
}

export function ContinuityBanner({ sd }: Props) {
  const cont = sd.continuity || {};
  const tier: string = cont.tier || 'none';

  // ClearWindowBanner — renders when sd.clear_window_active === true
  const clearWindowActive = sd.clear_window_active === true;
  if (clearWindowActive) {
    return (
      <div
        data-testid="clear-window-banner"
        style={{
          marginBottom: 20,
          padding: '14px 16px',
          borderRadius: 12,
          background: 'var(--kalpx-chip-bg)',
          border: '1px solid var(--kalpx-border-gold)',
          boxShadow: 'var(--kalpx-shadow-card)',
        }}
      >
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--kalpx-text)', marginBottom: 4, fontFamily: 'var(--kalpx-font-serif)' }}>
          {sd.clear_window_headline || 'A moment of stillness'}
        </p>
        {sd.clear_window_body && (
          <p style={{ fontSize: 13, color: 'var(--kalpx-text-soft)', lineHeight: 1.5 }}>
            {sd.clear_window_body}
          </p>
        )}
      </div>
    );
  }

  if (tier === 'none' || !cont.headline) return null;

  return (
    <div
      data-testid="continuity-banner"
      style={{
        marginBottom: 20,
        padding: '14px 16px',
        borderRadius: 12,
        background: 'var(--kalpx-chip-bg)',
        border: '1px solid var(--kalpx-border-gold)',
        boxShadow: 'var(--kalpx-shadow-card)',
      }}
    >
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--kalpx-text)', marginBottom: 4, fontFamily: 'var(--kalpx-font-serif)' }}>
        {cont.headline}
      </p>
      {cont.body && (
        <p style={{ fontSize: 13, color: 'var(--kalpx-text-soft)', lineHeight: 1.5 }}>
          {cont.body}
        </p>
      )}
    </div>
  );
}

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
          background: 'rgba(201,168,76,0.06)',
          border: '1px solid rgba(201,168,76,0.2)',
        }}
      >
        <p style={{ fontSize: 13, fontWeight: 600, color: '#2C2A26', marginBottom: 4, fontFamily: 'Georgia, "Times New Roman", serif' }}>
          {sd.clear_window_headline || 'A moment of stillness'}
        </p>
        {sd.clear_window_body && (
          <p style={{ fontSize: 13, color: '#6B6356', lineHeight: 1.5 }}>
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
        // RN warm brand palette (not harsh yellow)
        background: 'rgba(201,168,76,0.06)',
        border: '1px solid rgba(201,168,76,0.2)',
      }}
    >
      <p style={{ fontSize: 13, fontWeight: 600, color: '#2C2A26', marginBottom: 4 }}>
        {cont.headline}
      </p>
      {cont.body && (
        <p style={{ fontSize: 13, color: '#6B6356', lineHeight: 1.5 }}>
          {cont.body}
        </p>
      )}
    </div>
  );
}

import React from 'react';

interface Props {
  sd: Record<string, any>;
}

const CARD_STYLE: React.CSSProperties = {
  marginBottom: 20,
  padding: '14px 16px',
  borderRadius: 12,
  background: 'var(--kalpx-card-bg)',
  border: '1px solid #E8DFCD',
  boxShadow: 'var(--kalpx-shadow-card)',
};

const TITLE_STYLE: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: 'var(--kalpx-text)',
  marginBottom: 4,
  margin: '0 0 4px',
};

const BODY_STYLE: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--kalpx-text-soft)',
  lineHeight: 1.43,
  margin: 0,
};

export function ContinuityBanner({ sd }: Props) {
  const cont = sd.continuity || {};
  const tier: string = cont.tier || 'none';

  // ClearWindowBanner — renders when sd.clear_window_active === true
  const clearWindowActive = sd.clear_window_active === true;
  if (clearWindowActive) {
    return (
      <div data-testid="clear-window-banner" style={CARD_STYLE}>
        <p style={TITLE_STYLE}>{sd.clear_window_headline || 'A moment of stillness'}</p>
        {sd.clear_window_body && <p style={BODY_STYLE}>{sd.clear_window_body}</p>}
      </div>
    );
  }

  if (tier === 'none' || !cont.headline) return null;

  return (
    <div data-testid="continuity-banner" style={CARD_STYLE}>
      <p style={TITLE_STYLE}>{cont.headline}</p>
      {cont.body && <p style={BODY_STYLE}>{cont.body}</p>}
    </div>
  );
}

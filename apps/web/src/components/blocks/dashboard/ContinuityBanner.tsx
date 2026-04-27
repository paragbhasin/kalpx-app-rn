import React from 'react';

interface Props {
  sd: Record<string, any>;
}

export function ContinuityBanner({ sd }: Props) {
  const cont = sd.continuity || {};
  const tier: string = cont.tier || 'none';
  if (tier === 'none' || !cont.headline) return null;

  return (
    <div
      data-testid="continuity-banner"
      style={{
        marginBottom: 20,
        padding: '14px 16px',
        borderRadius: 12,
        background: '#fff8e1',
        border: '1px solid #fdd835',
      }}
    >
      <p style={{ fontSize: 13, fontWeight: 600, color: '#5d4037', marginBottom: 4 }}>
        {cont.headline}
      </p>
      {cont.body && (
        <p style={{ fontSize: 13, color: '#6b4c1a', lineHeight: 1.5 }}>
          {cont.body}
        </p>
      )}
    </div>
  );
}

import React from 'react';

const LOTUS_SVG = (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="24" cy="12" rx="6" ry="10" fill="rgba(201,168,76,0.2)" stroke="#C9A84C" strokeWidth="1.2" />
    <ellipse cx="24" cy="36" rx="6" ry="10" fill="rgba(201,168,76,0.2)" stroke="#C9A84C" strokeWidth="1.2" />
    <ellipse cx="12" cy="24" rx="10" ry="6" fill="rgba(201,168,76,0.2)" stroke="#C9A84C" strokeWidth="1.2" />
    <ellipse cx="36" cy="24" rx="10" ry="6" fill="rgba(201,168,76,0.2)" stroke="#C9A84C" strokeWidth="1.2" />
    <circle cx="24" cy="24" r="4" fill="rgba(201,168,76,0.3)" stroke="#C9A84C" strokeWidth="1.2" />
  </svg>
);

interface Props {
  sd: Record<string, any>;
}

export function GreetingCard({ sd }: Props) {
  const greet = sd.greeting || {};
  const userName: string = greet.user_name || sd.user_name || '';
  const displayName: string = userName || 'friend';
  const context: string = greet.supporting_line || sd.greeting_context || '';
  const tone: string = greet.tone_line || sd.tone_line || '';
  const joyCarry = sd.joy_carry;

  return (
    <div
      data-testid="greeting-card"
      style={{
        marginBottom: 28,
        borderRadius: 14,
        border: '1px solid #e8d5b0',
        background: '#fdf8ef',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
      }}
    >
      {/* Gold left-accent bar */}
      <div style={{ width: 4, background: '#C9A84C', flexShrink: 0 }} />

      {/* Body */}
      <div style={{ flex: 1, padding: '16px 14px' }}>
        <h1
          style={{
            fontSize: 18,
            fontWeight: 700,
            fontFamily: 'Georgia, "Times New Roman", serif',
            color: '#2C2A26',
            lineHeight: 1.3,
            margin: '0 0 4px',
          }}
        >
          Welcome, {displayName}.
        </h1>
        {context && (
          <p style={{ fontSize: 13, color: '#6B6356', margin: '0 0 4px', lineHeight: 1.5 }}>
            {context}
          </p>
        )}
        {tone && (
          <p style={{ fontSize: 12, color: '#9A8C78', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
            {tone}
          </p>
        )}
        {joyCarry?.label && (
          <div
            data-testid="greeting-joy-carry"
            style={{
              marginTop: 10,
              padding: '6px 12px',
              borderRadius: 12,
              background: 'rgba(201,168,76,0.06)',
              border: '1px solid rgba(201,168,76,0.25)',
              fontSize: 12,
              color: '#2C2A26',
              display: 'inline-block',
            }}
          >
            {joyCarry.label}
          </div>
        )}
      </div>

      {/* Mandala / lotus */}
      <div
        style={{
          flexShrink: 0,
          width: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 12px 12px 4px',
        }}
      >
        {LOTUS_SVG}
      </div>
    </div>
  );
}

import React from 'react';

interface Props {
  sd: Record<string, any>;
}

export function GreetingCard({ sd }: Props) {
  const greet = sd.greeting || {};
  const headline: string = greet.headline || sd.greeting_headline || '';
  const context: string = greet.supporting_line || sd.greeting_context || '';
  const userName: string = greet.user_name || sd.user_name || '';

  const joyCarry = sd.joy_carry;

  if (!headline && !userName) return null;

  return (
    <div
      data-testid="greeting-card"
      style={{ marginBottom: 28 }}
    >
      {userName && (
        <p style={{ fontSize: 12, color: '#b08840', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
          {userName}
        </p>
      )}
      {headline && (
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a0a', lineHeight: 1.3, margin: 0 }}>
          {headline}
        </h1>
      )}
      {context && (
        <p style={{ fontSize: 15, color: '#6b4c1a', marginTop: 6, lineHeight: 1.5 }}>
          {context}
        </p>
      )}
      {joyCarry?.label && (
        <div
          style={{
            marginTop: 10,
            padding: '8px 12px',
            borderRadius: 8,
            background: '#fef3c7',
            border: '1px solid #fbbf24',
            fontSize: 13,
            color: '#92400e',
          }}
        >
          {joyCarry.label}
        </div>
      )}
    </div>
  );
}

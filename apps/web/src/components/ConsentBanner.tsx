import React, { useEffect, useState } from 'react';

const CONSENT_KEY = 'kalpx_analytics_consent';

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(CONSENT_KEY) === null);
  }, []);

  if (!visible) return null;

  const handleChoice = (value: 'granted' | 'denied') => {
    localStorage.setItem(CONSENT_KEY, value);
    window.dispatchEvent(new Event('consent_updated'));
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Analytics consent"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: '#fffaf5',
        borderTop: '1px solid rgba(184, 134, 75, 0.2)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {/* COPY PENDING LEGAL APPROVAL — DO NOT SHIP TO PROD AS-IS */}
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: '#555',
          lineHeight: 1.5,
          flex: 1,
          minWidth: 200,
        }}
      >
        We use analytics to understand how people use Mitra and to improve the experience.
        Analytics are not used to sell your data.
      </p>
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => handleChoice('granted')}
          style={{
            background: '#b8864b',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--kalpx-font-sans)',
          }}
        >
          Accept analytics
        </button>
        <button
          type="button"
          onClick={() => handleChoice('denied')}
          style={{
            background: 'transparent',
            color: '#888',
            border: '1px solid rgba(0,0,0,0.15)',
            borderRadius: 6,
            padding: '8px 16px',
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: 'var(--kalpx-font-sans)',
          }}
        >
          Essential only
        </button>
      </div>
    </div>
  );
}

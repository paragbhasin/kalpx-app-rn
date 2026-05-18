import React, { useEffect, useState } from 'react';
import {
  ANALYTICS_CONSENT_KEY,
  MARKETING_CONSENT_KEY,
  CONSENT_VERSION_KEY,
  CONSENT_UPDATED_AT_KEY,
} from '../lib/webAnalytics';

export const CONSENT_VERSION = 'privacy_banner_v1_2026_05';

type ConsentChoice = 'granted' | 'denied';

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [analyticsChoice, setAnalyticsChoice] = useState<ConsentChoice>('denied');
  const [marketingChoice, setMarketingChoice] = useState<ConsentChoice>('denied');

  useEffect(() => {
    const analyticsMissing = localStorage.getItem(ANALYTICS_CONSENT_KEY) === null;
    const marketingMissing = localStorage.getItem(MARKETING_CONSENT_KEY) === null;
    setVisible(analyticsMissing || marketingMissing);
  }, []);

  if (!visible) return null;

  const handleSave = () => {
    const now = new Date().toISOString();
    localStorage.setItem(ANALYTICS_CONSENT_KEY, analyticsChoice);
    localStorage.setItem(MARKETING_CONSENT_KEY, marketingChoice);
    localStorage.setItem(CONSENT_VERSION_KEY, CONSENT_VERSION);
    localStorage.setItem(CONSENT_UPDATED_AT_KEY, now);
    window.dispatchEvent(new CustomEvent('consent_updated'));
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Privacy preferences"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: '#fffaf5',
        borderTop: '1px solid rgba(184, 134, 75, 0.2)',
        padding: '16px 20px',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {/* COPY PENDING LEGAL APPROVAL — DO NOT SHIP TO PROD AS-IS */}
      <p style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 600, color: '#373737', fontFamily: 'var(--kalpx-font-sans)' }}>
        Privacy preferences
      </p>

      <ConsentRow
        label="Product analytics"
        description="Help us understand how people use Mitra."
        value={analyticsChoice}
        onChange={setAnalyticsChoice}
      />

      <ConsentRow
        label="Marketing & ads"
        description="Allow personalized ads on platforms like Meta."
        value={marketingChoice}
        onChange={setMarketingChoice}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
        <button
          type="button"
          onClick={handleSave}
          style={{
            background: '#b8864b',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 20px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--kalpx-font-sans)',
          }}
        >
          Save preferences
        </button>
      </div>
    </div>
  );
}

function ConsentRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: ConsentChoice;
  onChange: (v: ConsentChoice) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <div style={{ flex: 1, paddingRight: 12 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#373737', fontFamily: 'var(--kalpx-font-sans)' }}>
          {label}
        </p>
        <p style={{ margin: 0, fontSize: 12, color: '#888', fontFamily: 'var(--kalpx-font-sans)' }}>
          {description}
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          type="button"
          aria-pressed={value === 'denied'}
          onClick={() => onChange('denied')}
          style={{
            background: value === 'denied' ? '#f0e6d3' : 'transparent',
            color: value === 'denied' ? '#b8864b' : '#888',
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: 5,
            padding: '5px 12px',
            fontSize: 12,
            fontWeight: value === 'denied' ? 600 : 400,
            cursor: 'pointer',
            fontFamily: 'var(--kalpx-font-sans)',
          }}
        >
          Decline
        </button>
        <button
          type="button"
          aria-pressed={value === 'granted'}
          onClick={() => onChange('granted')}
          style={{
            background: value === 'granted' ? '#b8864b' : 'transparent',
            color: value === 'granted' ? '#fff' : '#888',
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: 5,
            padding: '5px 12px',
            fontSize: 12,
            fontWeight: value === 'granted' ? 600 : 400,
            cursor: 'pointer',
            fontFamily: 'var(--kalpx-font-sans)',
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}

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
  // Both default visually to "Allow" — nothing is written to localStorage until Save.
  const [analyticsChoice, setAnalyticsChoice] = useState<ConsentChoice>('granted');
  const [marketingChoice, setMarketingChoice] = useState<ConsentChoice>('granted');

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
        borderTop: '1px solid rgba(184, 134, 75, 0.22)',
        padding: '20px 20px 20px',
        boxShadow: '0 -4px 20px rgba(67, 33, 4, 0.08)',
      }}
    >
      {/* COPY PENDING LEGAL APPROVAL — DO NOT SHIP TO PROD AS-IS */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 3 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#2d1f0f', fontFamily: 'var(--kalpx-font-sans)', letterSpacing: '-0.01em' }}>
          Privacy preferences
        </p>
        <button
          type="button"
          onClick={handleSave}
          style={{
            flexShrink: 0,
            background: '#b8864b',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '9px 22px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--kalpx-font-sans)',
          }}
        >
          Save preferences
        </button>
      </div>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#7d6b5d', fontFamily: 'var(--kalpx-font-sans)', lineHeight: 1.5 }}>
        Choose how KalpX can use data to improve Mitra and reach people who may benefit from it.
      </p>

      <ConsentRow
        title="Help us improve Mitra"
        description="Allow product analytics so we can understand what feels helpful, where people get stuck, and how to make Mitra easier to use."
        choice={analyticsChoice}
        allowLabel="Allow analytics"
        onAllow={() => setAnalyticsChoice('granted')}
        onDecline={() => setAnalyticsChoice('denied')}
      />

      <ConsentRow
        title="Personalized ads"
        description="Allow marketing cookies so we can measure campaigns and reach people who may benefit from KalpX."
        choice={marketingChoice}
        allowLabel="Allow marketing"
        onAllow={() => setMarketingChoice('granted')}
        onDecline={() => setMarketingChoice('denied')}
      />

      <p style={{ margin: '12px 0 0', fontSize: 11, color: '#a89880', textAlign: 'right', fontFamily: 'var(--kalpx-font-sans)' }}>
        You can change this anytime in Privacy preferences.
      </p>
    </div>
  );
}

function ConsentRow({
  title,
  description,
  choice,
  allowLabel,
  onAllow,
  onDecline,
}: {
  title: string;
  description: string;
  choice: ConsentChoice;
  allowLabel: string;
  onAllow: () => void;
  onDecline: () => void;
}) {
  const isGranted = choice === 'granted';
  return (
    <div
      style={{
        marginBottom: 14,
        paddingBottom: 14,
        borderBottom: '1px solid rgba(184, 134, 75, 0.1)',
      }}
    >
      <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#2d1f0f', fontFamily: 'var(--kalpx-font-sans)' }}>
        {title}
      </p>
      <p style={{ margin: '0 0 10px', fontSize: 12, color: '#9b8b77', fontFamily: 'var(--kalpx-font-sans)', lineHeight: 1.45 }}>
        {description}
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          aria-pressed={!isGranted}
          onClick={onDecline}
          style={{
            background: !isGranted ? '#f5ece0' : 'transparent',
            color: !isGranted ? '#7d5a2f' : '#9b8b77',
            border: `1px solid ${!isGranted ? 'rgba(184, 134, 75, 0.4)' : 'rgba(0,0,0,0.13)'}`,
            borderRadius: 5,
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: !isGranted ? 600 : 400,
            cursor: 'pointer',
            fontFamily: 'var(--kalpx-font-sans)',
            transition: 'background 0.15s, color 0.15s',
          }}
        >
          Not now
        </button>
        <button
          type="button"
          aria-pressed={isGranted}
          onClick={onAllow}
          style={{
            background: isGranted ? '#b8864b' : 'transparent',
            color: isGranted ? '#fff' : '#9b8b77',
            border: `1px solid ${isGranted ? '#b8864b' : 'rgba(0,0,0,0.13)'}`,
            borderRadius: 5,
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: isGranted ? 600 : 400,
            cursor: 'pointer',
            fontFamily: 'var(--kalpx-font-sans)',
            transition: 'background 0.15s, color 0.15s',
          }}
        >
          {allowLabel}
        </button>
      </div>
    </div>
  );
}

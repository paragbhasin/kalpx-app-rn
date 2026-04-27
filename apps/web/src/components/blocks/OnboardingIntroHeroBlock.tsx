/**
 * OnboardingIntroHeroBlock — Phase 6.
 * turn_2: support vs growth path selection.
 */

import React, { useState } from 'react';

interface Chip {
  id: string;
  label: string;
  style?: string;
}

interface Props {
  block: {
    headline?: string;
    subtext?: string;
    reply_chips?: Chip[];
    on_response?: { type: string };
    [key: string]: any;
  };
  onAction?: (action: any) => void;
}

export function OnboardingIntroHeroBlock({ block, onAction }: Props) {
  const [busy, setBusy] = useState(false);
  const chips: Chip[] = block.reply_chips || [];
  const onResponse = block.on_response;

  async function handleChip(chip: Chip) {
    if (busy || !onResponse || !onAction) return;
    setBusy(true);
    try {
      await onAction({ type: onResponse.type, payload: { chip_id: chip.id } });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ marginBottom: 24 }}>
      {block.headline && (
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#2a1a0a',
            lineHeight: 1.3,
            marginBottom: 12,
          }}
        >
          {block.headline}
        </h2>
      )}
      {block.subtext && (
        <p style={{ fontSize: 16, color: '#6b4c1a', marginBottom: 20 }}>
          {block.subtext}
        </p>
      )}
      {chips.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {chips.map((chip) => (
            <button
              key={chip.id}
              data-testid={`chip-${chip.id}`}
              disabled={busy}
              onClick={() => void handleChip(chip)}
              style={{
                padding: '16px 20px',
                borderRadius: 12,
                border: '1px solid #d4b16a',
                background: busy ? '#f5ead6' : '#fdf8ef',
                color: '#2a1a0a',
                fontSize: 16,
                fontWeight: 500,
                cursor: busy ? 'not-allowed' : 'pointer',
                opacity: busy ? 0.7 : 1,
                textAlign: 'left',
                lineHeight: 1.4,
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

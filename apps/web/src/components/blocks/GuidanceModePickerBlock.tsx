/**
 * GuidanceModePickerBlock — Phase 6.
 * turn_6: universal / hybrid / rooted guidance mode selection.
 * Fires on_response with { guidance_mode: 'universal' | 'hybrid' | 'rooted' }.
 */

import React, { useState } from 'react';

type GuidanceMode = 'universal' | 'hybrid' | 'rooted';

const MODES: { id: GuidanceMode; label: string; description: string }[] = [
  {
    id: 'universal',
    label: 'Modern & universal',
    description: 'Simple language. No tradition, no Sanskrit.',
  },
  {
    id: 'hybrid',
    label: 'Blend',
    description: 'Mostly clear and modern, with occasional Sanskrit and tradition.',
  },
  {
    id: 'rooted',
    label: 'Rooted in tradition',
    description: 'Deeper language. Sanskrit terms. The source made visible.',
  },
];

interface Props {
  block: {
    on_response?: { type: string };
    [key: string]: any;
  };
  onAction?: (action: any) => void;
}

export function GuidanceModePickerBlock({ block, onAction }: Props) {
  const [selected, setSelected] = useState<GuidanceMode | null>(null);
  const [busy, setBusy] = useState(false);
  const onResponse = block.on_response;

  async function handleSelect(mode: GuidanceMode) {
    if (busy) return;
    setSelected(mode);
    if (!onResponse || !onAction) return;
    setBusy(true);
    try {
      await onAction({ type: onResponse.type, payload: { guidance_mode: mode } });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
      {MODES.map((mode) => {
        const isSelected = selected === mode.id;
        return (
          <button
            key={mode.id}
            data-testid={`guidance-mode-${mode.id}`}
            disabled={busy}
            onClick={() => void handleSelect(mode.id)}
            style={{
              padding: '16px 20px',
              borderRadius: 12,
              border: isSelected ? '2px solid #d4b16a' : '1px solid #d0b890',
              background: isSelected ? '#fdf0d0' : '#fdf8ef',
              color: '#2a1a0a',
              fontSize: 15,
              cursor: busy ? 'not-allowed' : 'pointer',
              opacity: busy ? 0.7 : 1,
              textAlign: 'left',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{mode.label}</div>
            <div style={{ fontSize: 13, color: '#6b4c1a' }}>{mode.description}</div>
          </button>
        );
      })}
    </div>
  );
}

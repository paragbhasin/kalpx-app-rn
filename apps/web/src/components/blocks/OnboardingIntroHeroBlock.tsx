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
    <div
      style={{
        minHeight: '100dvh',
        backgroundImage: 'url(/new_home.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 24px calc(48px + env(safe-area-inset-bottom))',
        position: 'relative',
      }}
    >
      {/* Lotus overlay — bottom decorative */}
      <img
        src="/new_home_lotus.png"
        alt=""
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '40vw',
          maxWidth: 200,
          opacity: 0.7,
          pointerEvents: 'none',
        }}
      />

      {/* Text stack */}
      <div style={{ textAlign: 'center', marginBottom: 24, position: 'relative', zIndex: 1 }}>
        {block.headline && (
          <h2
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--kalpx-text)',
              lineHeight: 1.3,
              marginBottom: 12,
              fontFamily: 'var(--kalpx-font-serif)',
            }}
          >
            {block.headline}
          </h2>
        )}
        {block.subtext && (
          <p style={{ fontSize: 16, color: 'var(--kalpx-text-soft)', marginBottom: 20, lineHeight: 1.5 }}>
            {block.subtext}
          </p>
        )}
      </div>

      {/* Chips — vertical column, pill-shaped frosted cards */}
      {chips.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            width: '100%',
            maxWidth: 360,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {chips.map((chip) => (
            <button
              key={chip.id}
              data-testid={`chip-${chip.id}`}
              disabled={busy}
              onClick={() => void handleChip(chip)}
              style={{
                padding: '16px 20px',
                borderRadius: 24,
                border: `1px solid var(--kalpx-border-gold)`,
                background: 'var(--kalpx-chip-bg)',
                color: 'var(--kalpx-text)',
                fontSize: 16,
                fontWeight: 500,
                cursor: busy ? 'not-allowed' : 'pointer',
                opacity: busy ? 0.7 : 1,
                textAlign: 'left',
                lineHeight: 1.4,
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                touchAction: 'manipulation',
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

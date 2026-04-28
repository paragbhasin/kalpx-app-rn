/**
 * CompletionReturnBlock — shown after any v3 runner completes.
 * Reads runner_variant to show variant-specific message.
 * CTAs: repeat (repeat_runner) and return to dashboard (return_to_dashboard).
 */
import React from 'react';

interface Props {
  block: {
    variant_key?: string;
    [key: string]: any;
  };
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

const MESSAGES: Record<string, { headline: string; body: string }> = {
  mantra: {
    headline: 'The sound has settled.',
    body: 'You stayed with the practice. That is enough.',
  },
  sankalp: {
    headline: 'Your sankalp is alive.',
    body: 'Carry it gently through your day.',
  },
  practice: {
    headline: 'Complete. You stayed with the practice.',
    body: 'Let what arose remain with you.',
  },
};

export function CompletionReturnBlock({ block, screenData = {}, onAction }: Props) {
  const variantKey = block.variant_key || 'runner_variant';
  const variant: string = (screenData[variantKey] as string) || 'mantra';
  const msg = MESSAGES[variant] || MESSAGES.mantra;
  const item = screenData['runner_active_item'] as Record<string, any> | null;
  const title = item?.title || '';

  // G17: room → return_to_source. G27: trigger → return_to_source. All others → return_to_dashboard.
  const returnSource: string = (screenData['runner_source'] as string) || 'core';
  const RETURN_TO_SOURCE_SOURCES = new Set(['support_room', 'support_trigger']);
  const returnAction = RETURN_TO_SOURCE_SOURCES.has(returnSource) ? 'return_to_source' : 'return_to_dashboard';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '40px 24px',
        gap: 24,
        textAlign: 'center',
      }}
      data-testid="completion-return-block"
    >
      {/* Animated gold checkmark — stroke draws in 600ms (L5) */}
      <style>{`
        @keyframes checkDraw {
          from { stroke-dashoffset: 50; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'var(--kalpx-chip-bg)',
          border: '2px solid var(--kalpx-gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={36} height={36} viewBox="0 0 36 36" fill="none">
          <path
            d="M7 18l7 7 15-15"
            stroke="var(--kalpx-gold)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={50}
            style={{ animation: 'checkDraw 600ms ease forwards' }}
          />
        </svg>
      </div>

      <div style={{ maxWidth: 300 }}>
        {title ? (
          <p style={{ fontSize: 12, color: 'var(--kalpx-text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
            {title}
          </p>
        ) : null}
        <h2
          style={{ fontSize: 22, fontWeight: 400, color: 'var(--kalpx-text)', lineHeight: 1.4, marginBottom: 10, fontFamily: 'var(--kalpx-font-serif)' }}
          data-testid="completion-headline"
        >
          {msg.headline}
        </h2>
        <p style={{ fontSize: 15, color: 'var(--kalpx-text-soft)', lineHeight: 1.6 }}>
          {msg.body}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 280, marginTop: 8 }}>
        <button
          onClick={() => onAction?.({ type: returnAction })}
          data-testid="return-to-dashboard-btn"
          style={{
            padding: '14px 24px',
            borderRadius: 12,
            border: 'none',
            background: 'var(--kalpx-cta)',
            color: '#fff',
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
            letterSpacing: 0.3,
          }}
        >
          Return to Mitra Home
        </button>
        <button
          onClick={() => onAction?.({ type: 'repeat_runner' })}
          data-testid="repeat-runner-btn"
          style={{
            padding: '12px 24px',
            borderRadius: 12,
            border: '1px solid var(--kalpx-gold)',
            background: 'transparent',
            color: 'var(--kalpx-gold)',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Repeat
        </button>
      </div>
    </div>
  );
}

/**
 * CheckpointDay14FinaleBlock — Phase 10B.
 * Renders the completion ceremony after day_14_finale state.
 * Reads completion_ceremony + m25_narrative from screenData.
 */

import React from 'react';

interface Props {
  block?: Record<string, any>;
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

export function CheckpointDay14FinaleBlock({ screenData, onAction }: Props) {
  const sd = screenData || {};
  const ceremony = sd.completion_ceremony || {};
  const m25 = sd.m25_narrative || {};
  const completedDays = ceremony.completed_days ?? sd.journey_day_statuses?.filter((s: string) => s === 'completed').length ?? 0;
  const totalDays = sd.total_days ?? 14;

  const headline = m25.intro_headline || ceremony.headline || 'Your cycle is complete.';
  const body =
    (m25.narrative_template || '')
      .replace('{completed_count}', String(completedDays))
      .replace('{total_days}', String(totalDays)) ||
    `You completed ${completedDays} of ${totalDays} days.`;

  function handleContinue() {
    if (onAction) onAction({ type: 'return_to_dashboard' });
  }

  return (
    <div
      data-testid="checkpoint-day14-finale"
      style={{ padding: '48px 24px 80px', maxWidth: 480, margin: '0 auto', textAlign: 'center' }}
    >
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--kalpx-gold)', textTransform: 'uppercase', marginBottom: 20 }}>
        {m25.eyebrow || 'Cycle Complete'}
      </p>

      <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--kalpx-text)', fontFamily: 'var(--kalpx-font-serif)', lineHeight: 1.3, marginBottom: 16 }}>
        {headline}
      </p>

      <p style={{ fontSize: 16, color: 'var(--kalpx-text-soft)', lineHeight: 1.7, marginBottom: 32 }}>
        {body}
      </p>

      {/* Day dots */}
      {sd.journey_day_statuses && sd.journey_day_statuses.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
          {(sd.journey_day_statuses as string[]).map((status: string, i: number) => (
            <div
              key={i}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: status === 'completed' ? 'var(--kalpx-gold)' : 'var(--kalpx-chip-bg)',
                fontSize: 9,
                color: status === 'completed' ? '#fff' : 'var(--kalpx-text-muted)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      )}

      {ceremony.seal_message && (
        <div
          style={{
            padding: '16px',
            background: 'var(--kalpx-bg)',
            borderRadius: 12,
            border: '1px solid var(--kalpx-chip-bg)',
            marginBottom: 32,
            textAlign: 'left',
          }}
        >
          <p style={{ fontSize: 14, color: 'var(--kalpx-text-soft)', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>
            {ceremony.seal_message}
          </p>
        </div>
      )}

      <button
        data-testid="checkpoint-finale-continue"
        onClick={handleContinue}
        style={{
          width: '100%',
          padding: '16px 24px',
          background: 'var(--kalpx-cta)',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          fontSize: 16,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        {m25.continue_path_cta || 'Begin Your Next Cycle'}
      </button>
    </div>
  );
}

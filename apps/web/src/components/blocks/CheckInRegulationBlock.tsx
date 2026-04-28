/**
 * CheckInRegulationBlock — 3-step regulation sequence.
 * Reads checkin_step from screenData: notice → name → settle.
 * REG-015: touches ONLY checkin_* fields.
 */
import React from 'react';

interface Props {
  block?: { [key: string]: any };
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

type Step = 'notice' | 'name' | 'settle';

const STEP_CONFIG: Record<Step, { title: string; prompt: string; chips: { id: string; label: string }[] }> = {
  notice: {
    title: 'Where do you feel it in your body?',
    prompt: 'Notice the physical sensation first.',
    chips: [
      { id: 'chest', label: 'Chest' },
      { id: 'head', label: 'Head' },
      { id: 'stomach', label: 'Stomach' },
      { id: 'unsure', label: 'Not sure' },
    ],
  },
  name: {
    title: 'What would you name what you are feeling?',
    prompt: 'Name it, even loosely.',
    chips: [
      { id: 'agitated', label: 'Agitated' },
      { id: 'drained', label: 'Drained' },
      { id: 'scared', label: 'Scared' },
      { id: 'heavy', label: 'Heavy' },
    ],
  },
  settle: {
    title: 'What would help right now?',
    prompt: 'One small thing is enough.',
    chips: [
      { id: 'done', label: 'I just needed to name it' },
      { id: 'another', label: 'I want to try something else' },
    ],
  },
};

export function CheckInRegulationBlock({ screenData = {}, onAction }: Props) {
  const step: Step = (screenData.checkin_step as Step) || 'notice';
  const config = STEP_CONFIG[step] || STEP_CONFIG.notice;

  const onChip = (chipId: string) => {
    if (step === 'settle') {
      onAction?.({ type: 'submit_checkin', payload: { final: chipId } });
    } else {
      onAction?.({ type: 'advance_checkin_step', payload: { from: step, value: chipId } });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '60vh',
        padding: '32px 24px',
        gap: 24,
      }}
      data-testid="checkin-regulation-block"
    >
      <div>
        <p style={{ fontSize: 11, color: 'var(--kalpx-text-muted)', letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' }}>
          CHECK-IN
        </p>
        <h2 style={{ fontSize: 24, fontWeight: 400, fontFamily: 'var(--kalpx-font-serif)', color: 'var(--kalpx-text)', lineHeight: 1.4, marginBottom: 8 }}>
          {config.title}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--kalpx-text-soft)', lineHeight: 1.6 }}>
          {config.prompt}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {config.chips.map((chip) => (
          <button
            key={chip.id}
            onClick={() => onChip(chip.id)}
            data-testid={`checkin-chip-${chip.id}`}
            style={{
              padding: '12px 20px',
              borderRadius: 12,
              border: '1px solid var(--kalpx-border-gold)',
              background: 'var(--kalpx-card-bg)',
              color: 'var(--kalpx-text)',
              fontSize: 15,
              textAlign: 'left',
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <button
        onClick={() => onAction?.({ type: 'support_exit' })}
        data-testid="checkin-exit-btn"
        style={{
          alignSelf: 'flex-start',
          background: 'none',
          border: 'none',
          color: 'var(--kalpx-text-muted)',
          fontSize: 13,
          cursor: 'pointer',
          padding: 0,
          marginTop: 'auto',
        }}
      >
        Return to Mitra Home
      </button>
    </div>
  );
}

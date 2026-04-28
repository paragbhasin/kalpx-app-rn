import React from 'react';

interface Props {
  block?: { label?: string; [key: string]: any };
  onAction?: (action: any) => void;
}

export function TriggerEntryBlock({ block, onAction }: Props) {
  const label = block?.label || 'I feel triggered.';
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
      <button
        onClick={() => onAction?.({ type: 'initiate_trigger_support', payload: {} })}
        data-testid="trigger-entry-btn"
        style={{
          border: '1px solid var(--kalpx-border-gold)',
          borderRadius: 999,
          padding: '12px 32px',
          background: 'transparent',
          color: 'var(--kalpx-text)',
          fontSize: 15,
          letterSpacing: 0.4,
          cursor: 'pointer',
          minHeight: 44,
        }}
      >
        {label}
      </button>
    </div>
  );
}

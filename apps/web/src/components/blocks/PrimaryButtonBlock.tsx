import React, { useState } from 'react';

interface Props {
  block: { label?: string; action?: any; style?: string; id?: string; [key: string]: any };
  onAction?: (action: any) => void;
}

export function PrimaryButtonBlock({ block, onAction }: Props) {
  const [busy, setBusy] = useState(false);

  if (!block.label) return null;

  const isGold = block.style === 'gold' || !block.style;

  async function handleClick() {
    if (busy || !onAction || !block.action) return;
    setBusy(true);
    try {
      await onAction(block.action);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      data-testid={block.id ? `btn-${block.id}` : undefined}
      onClick={() => void handleClick()}
      disabled={busy}
      style={{
        display: 'block',
        width: '100%',
        padding: '14px 24px',
        marginTop: 16,
        borderRadius: 10,
        border: 'none',
        background: isGold ? '#d4b16a' : '#1a1a1a',
        color: isGold ? '#1a0a00' : '#fff',
        fontSize: 15,
        fontWeight: 600,
        cursor: busy ? 'not-allowed' : 'pointer',
        opacity: busy ? 0.7 : 1,
      }}
    >
      {busy ? '…' : block.label}
    </button>
  );
}

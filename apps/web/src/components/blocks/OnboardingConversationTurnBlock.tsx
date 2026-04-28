/**
 * OnboardingConversationTurnBlock — Phase 6.
 * Core interactive block for welcome_onboarding turns 1, 3-8.
 * Renders Mitra message, chip options, and optional text input.
 * Fires on_response action when chip is selected or text is submitted.
 */

import React, { useState } from 'react';

interface Chip {
  id: string;
  label: string;
  style?: string;
}

interface Props {
  block: {
    id?: string;
    mitra_message?: string | string[];
    reply_chips?: Chip[];
    open_input?: { enabled: boolean; placeholder?: string };
    on_response?: { type: string };
    [key: string]: any;
  };
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

export function OnboardingConversationTurnBlock({ block, onAction }: Props) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const messages: string[] = Array.isArray(block.mitra_message)
    ? block.mitra_message
    : block.mitra_message
      ? [block.mitra_message]
      : [];

  const chips: Chip[] = block.reply_chips || [];
  const inputEnabled = block.open_input?.enabled === true;
  const onResponse = block.on_response;

  async function fireResponse(payload: Record<string, any>) {
    if (busy || !onResponse || !onAction) return;
    setBusy(true);
    try {
      await onAction({ type: onResponse.type, payload });
    } finally {
      setBusy(false);
    }
  }

  if (!messages.length && !chips.length && !inputEnabled) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Mitra messages */}
      {messages.map((msg, i) => (
        <p
          key={i}
          style={{
            fontSize: 16,
            color: 'var(--kalpx-text)',
            lineHeight: 1.6,
            marginBottom: 10,
            fontStyle: 'italic',
          }}
        >
          {msg}
        </p>
      ))}

      {/* Reply chips */}
      {chips.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
          {chips.map((chip) => (
            <button
              key={chip.id}
              data-testid={`chip-${chip.id}`}
              disabled={busy}
              onClick={() => void fireResponse({ chip_id: chip.id, freeform_text: text || undefined })}
              style={{
                padding: '13px 18px',
                borderRadius: 10,
                border: chip.style === 'primary' ? 'none' : `1px solid var(--kalpx-border-gold)`,
                background: chip.style === 'primary' ? 'var(--kalpx-gold)' : 'var(--kalpx-bg)',
                color: chip.style === 'primary' ? 'var(--kalpx-text)' : 'var(--kalpx-text-soft)',
                fontSize: 15,
                fontWeight: chip.style === 'primary' ? 600 : 400,
                cursor: busy ? 'not-allowed' : 'pointer',
                opacity: busy ? 0.7 : 1,
                textAlign: 'left',
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Optional freeform text input */}
      {inputEnabled && (
        <div style={{ marginTop: 14 }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={block.open_input?.placeholder || 'Type your response…'}
            rows={3}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: `1px solid var(--kalpx-border-gold)`,
              fontSize: 15,
              color: 'var(--kalpx-text)',
              background: 'var(--kalpx-bg)',
              resize: 'none',
              boxSizing: 'border-box',
            }}
          />
          {text.trim() && onResponse && (
            <button
              disabled={busy}
              onClick={() => void fireResponse({ freeform_text: text })}
              style={{
                marginTop: 10,
                padding: '12px 24px',
                borderRadius: 10,
                border: 'none',
                background: 'var(--kalpx-gold)',
                color: 'var(--kalpx-text)',
                fontWeight: 600,
                fontSize: 15,
                cursor: busy ? 'not-allowed' : 'pointer',
                opacity: busy ? 0.7 : 1,
              }}
            >
              {busy ? '…' : 'Continue'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

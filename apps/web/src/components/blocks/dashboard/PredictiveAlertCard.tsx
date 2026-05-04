/**
 * PredictiveAlertCard — Gate 5 in-app surface (web).
 *
 * Renders a calm, dismissible suggestion card from a PredictiveAlert row.
 * Displays copy_text only — no trigger_reason, entity names, evidence lines,
 * confidence scores, or internal labels are ever shown to the user.
 *
 * Actions:
 *   "See suggestion" → accept + navigate to suggested prep context
 *   "Not today"      → dismiss + hide card
 */

import React from 'react';

type Alert = {
  id: number | string;
  copy: string;
  suggested_prep_context?: string;
};

type Props = {
  alert: Alert;
  onDismiss: (alertId: number | string) => void;
  onAccept: (alertId: number | string, prepContext?: string) => void;
};

const CARD_STYLE: React.CSSProperties = {
  marginBottom: 20,
  padding: '14px 16px',
  borderRadius: 12,
  background: 'var(--kalpx-card-bg)',
  border: '1px solid #E8DFCD',
  boxShadow: 'var(--kalpx-shadow-card)',
};

const BODY_STYLE: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--kalpx-text-soft)',
  lineHeight: 1.5,
  margin: '0 0 14px',
  fontFamily: 'var(--kalpx-font-serif)',
};

const ACTIONS_STYLE: React.CSSProperties = {
  display: 'flex',
  gap: 10,
};

const PRIMARY_BTN_STYLE: React.CSSProperties = {
  padding: '7px 14px',
  borderRadius: 8,
  background: 'var(--kalpx-gold)',
  color: '#fff',
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',
  border: 'none',
  letterSpacing: '0.3px',
};

const SECONDARY_BTN_STYLE: React.CSSProperties = {
  padding: '7px 14px',
  borderRadius: 8,
  background: 'transparent',
  color: 'var(--kalpx-text-muted)',
  fontSize: 12,
  cursor: 'pointer',
  border: '1px solid #E8DFCD',
};

export function PredictiveAlertCard({ alert, onDismiss, onAccept }: Props) {
  const copy = typeof alert.copy === 'string' ? alert.copy.trim() : '';
  if (!copy) return null;

  return (
    <div data-testid="predictive-alert-card" style={CARD_STYLE}>
      <p style={BODY_STYLE}>{copy}</p>
      <div style={ACTIONS_STYLE}>
        <button
          style={PRIMARY_BTN_STYLE}
          onClick={() => onAccept(alert.id, alert.suggested_prep_context)}
        >
          See suggestion
        </button>
        <button
          style={SECONDARY_BTN_STYLE}
          onClick={() => onDismiss(alert.id)}
        >
          Not today
        </button>
      </div>
    </div>
  );
}

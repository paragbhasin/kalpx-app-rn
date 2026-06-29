/**
 * PredictiveAlertCard — Gate 6A in-app surface (web).
 *
 * Renders a calm, dismissible suggestion card from a PredictiveAlert row.
 * Displays copy_text only — no trigger_reason, entity names, evidence lines,
 * confidence scores, or internal labels are ever shown to the user.
 *
 * Gate 6A additions:
 *   - safe_explanation: "Why this may help today" (expander)
 *   - "Show me why" toggle: reveals safe_explanation only
 *   - "Add to today" action (calls onAddToday if provided)
 *
 * Actions:
 *   "See suggestion" → accept + navigate to suggested prep context
 *   "Not today"      → dismiss + hide card
 *   "Show me why"    → toggle safe_explanation (in-app only; never push)
 *   "Add to today"   → add suggestion to daily triad (optional)
 */

import React, { useState } from 'react';
import { useTranslation } from '../../../lib/i18n';

type Alert = {
  id: number | string;
  copy: string;
  copy_text?: string;
  safe_explanation?: string;
  suggested_prep_context?: string;
};

type Props = {
  alert: Alert;
  onDismiss: (alertId: number | string) => void;
  onAccept: (alertId: number | string, prepContext?: string) => void;
  onAddToday?: (alertId: number | string) => void;
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
  margin: '0 0 10px',
  fontFamily: 'var(--kalpx-font-serif)',
};

const EXPLANATION_STYLE: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--kalpx-text-muted)',
  lineHeight: 1.5,
  margin: '0 0 12px',
  padding: '8px 10px',
  background: '#FAF6ED',
  borderRadius: 8,
  borderLeft: '3px solid var(--kalpx-gold-hairline)',
  fontFamily: 'var(--kalpx-font-sans)',
};

const WHY_LINK_STYLE: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: 12,
  color: 'var(--kalpx-text-muted)',
  padding: '0 0 10px',
  display: 'block',
  textDecoration: 'underline',
  textDecorationStyle: 'dotted',
};

const ACTIONS_STYLE: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
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

const ADD_BTN_STYLE: React.CSSProperties = {
  padding: '7px 14px',
  borderRadius: 8,
  background: 'transparent',
  color: '#6B7280',
  fontSize: 12,
  cursor: 'pointer',
  border: '1px solid #D1D5DB',
};

export function PredictiveAlertCard({ alert, onDismiss, onAccept, onAddToday }: Props) {
  const { t } = useTranslation();
  const copy = (typeof alert.copy_text === 'string' && alert.copy_text.trim())
    ? alert.copy_text.trim()
    : (typeof alert.copy === 'string' ? alert.copy.trim() : '');

  const [whyOpen, setWhyOpen] = useState(false);

  if (!copy) return null;

  const safeExplanation = typeof alert.safe_explanation === 'string'
    ? alert.safe_explanation.trim()
    : '';

  return (
    <div data-testid="predictive-alert-card" style={CARD_STYLE}>
      <p style={BODY_STYLE}>{copy}</p>

      {safeExplanation && (
        <>
          <button style={WHY_LINK_STYLE} onClick={() => setWhyOpen(o => !o)}>
            {whyOpen ? t('predictiveAlert.hide') : t('predictiveAlert.showMeWhy')}
          </button>
          {whyOpen && (
            <p data-testid="safe-explanation" style={EXPLANATION_STYLE}>
              {safeExplanation}
            </p>
          )}
        </>
      )}

      <div style={ACTIONS_STYLE}>
        <button
          style={PRIMARY_BTN_STYLE}
          onClick={() => onAccept(alert.id, alert.suggested_prep_context)}
        >
          {t('predictiveAlert.seeSuggestion')}
        </button>
        {onAddToday && (
          <button
            style={ADD_BTN_STYLE}
            onClick={() => onAddToday(alert.id)}
          >
            {t('predictiveAlert.addToToday')}
          </button>
        )}
        <button
          style={SECONDARY_BTN_STYLE}
          onClick={() => onDismiss(alert.id)}
        >
          {t('predictiveAlert.notToday')}
        </button>
      </div>
    </div>
  );
}

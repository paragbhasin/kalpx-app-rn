import React from 'react';
import type { ClassPricing } from '@kalpx/types';

interface ClassPriceProps {
  pricing?: ClassPricing;
  showTrial?: boolean;
  style?: React.CSSProperties;
}

export function ClassPrice({ pricing, showTrial = false, style }: ClassPriceProps) {
  if (!pricing) return null;

  const currency = pricing.currency ?? 'INR';
  const perPersonApp = pricing.per_person?.amount?.app;
  const perPersonWeb = pricing.per_person?.amount?.web;
  const price = perPersonApp ?? perPersonWeb;
  const trial = pricing.trial;

  return (
    <div style={style}>
      {price != null && (
        <p style={{ fontSize: 20, fontWeight: 700, color: '#2d1a0e' }}>
          {currency} {price}
          <span style={{ fontSize: 13, fontWeight: 400, color: '#7a5c3a', marginLeft: 4 }}>/ session</span>
        </p>
      )}
      {showTrial && trial?.enabled && trial.amount != null && (
        <p style={{ fontSize: 13, color: '#b06840', marginTop: 4 }}>
          First trial: {currency} {trial.amount}
          {trial.session_length_min ? ` (${trial.session_length_min} min)` : ''}
        </p>
      )}
    </div>
  );
}

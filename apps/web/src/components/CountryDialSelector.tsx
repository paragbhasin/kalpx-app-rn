import React from 'react';
import { PHONE_AUTH_COUNTRIES } from '@kalpx/types';

interface Props {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

export function CountryDialSelector({ value, onChange, disabled }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      aria-label="Country dial code"
      style={{
        height: '46px',
        padding: '0 8px',
        border: '1px solid var(--kalpx-border, #ddd)',
        borderRadius: '8px 0 0 8px',
        background: 'var(--kalpx-surface, #fff)',
        color: 'var(--kalpx-text, #1a1a1a)',
        fontSize: '0.95rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        minWidth: '80px',
      }}
    >
      {PHONE_AUTH_COUNTRIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.dialCode} {c.label}
        </option>
      ))}
    </select>
  );
}

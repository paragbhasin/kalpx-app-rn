import React from 'react';

interface KalpXInputProps {
  label?: string;
  error?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: React.InputHTMLAttributes<HTMLInputElement>['type'];
  autoComplete?: string;
  disabled?: boolean;
  id?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

const inputBaseStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  borderRadius: 'var(--kalpx-r-md)',
  border: '1px solid var(--kalpx-border-gold)',
  background: 'var(--kalpx-bg)',
  color: 'var(--kalpx-text)',
  fontFamily: 'var(--kalpx-font-sans)',
  fontSize: 15,
  outline: 'none',
  transition: 'border-color 0.15s',
};

export function KalpXInput({
  label,
  error,
  placeholder,
  value,
  onChange,
  type = 'text',
  autoComplete,
  disabled,
  id,
  style,
  'data-testid': testId,
}: KalpXInputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--kalpx-text)',
            fontFamily: 'var(--kalpx-font-sans)',
          }}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        disabled={disabled}
        data-testid={testId}
        style={{ ...inputBaseStyle, ...style, opacity: disabled ? 0.6 : 1 }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--kalpx-gold)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--kalpx-border-gold)'; }}
      />
      {error && (
        <p style={{ fontSize: 12, color: '#c0392b', margin: 0, fontFamily: 'var(--kalpx-font-sans)' }}>
          {error}
        </p>
      )}
    </div>
  );
}

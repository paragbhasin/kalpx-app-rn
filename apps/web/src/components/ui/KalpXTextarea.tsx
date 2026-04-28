import React from 'react';

interface KalpXTextareaProps {
  label?: string;
  error?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
  disabled?: boolean;
  id?: string;
  style?: React.CSSProperties;
}

export function KalpXTextarea({
  label,
  error,
  placeholder,
  value,
  onChange,
  rows = 3,
  maxLength,
  showCount = false,
  disabled,
  id,
  style,
}: KalpXTextareaProps) {
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
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        style={{
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
          resize: 'vertical',
          opacity: disabled ? 0.6 : 1,
          ...style,
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--kalpx-gold)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--kalpx-border-gold)'; }}
      />
      {showCount && maxLength && (
        <p style={{ fontSize: 11, color: 'var(--kalpx-text-muted)', textAlign: 'right', margin: 0 }}>
          {value.length}/{maxLength}
        </p>
      )}
      {error && (
        <p style={{ fontSize: 12, color: '#c0392b', margin: 0 }}>
          {error}
        </p>
      )}
    </div>
  );
}

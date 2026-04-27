import React from 'react';

interface ChipProps {
  label: string;
  selected?: boolean;
  onToggle?: () => void;
  variant?: 'filter' | 'tag' | 'support';
  size?: 'sm' | 'md';
  disabled?: boolean;
  style?: React.CSSProperties;
}

export function Chip({
  label,
  selected = false,
  onToggle,
  variant = 'filter',
  size = 'md',
  disabled = false,
  style,
}: ChipProps) {
  const height = size === 'sm' ? 32 : 44;
  const padding = size === 'sm' ? '5px 12px' : '10px 16px';
  const fontSize = size === 'sm' ? 12 : 14;

  let chipStyle: React.CSSProperties;

  if (variant === 'tag') {
    chipStyle = {
      background: '#f0e8d8',
      border: '1px solid var(--kalpx-border)',
      color: 'var(--kalpx-text-soft)',
    };
  } else if (variant === 'support') {
    chipStyle = selected
      ? { background: 'var(--kalpx-cta)', border: '1px solid var(--kalpx-cta)', color: 'var(--kalpx-cta-text)' }
      : { background: '#F5EDEA', border: '1px solid #E5D4CA', color: 'var(--kalpx-text)' };
  } else {
    // filter (default)
    chipStyle = selected
      ? { background: 'var(--kalpx-cta)', border: '1px solid var(--kalpx-cta)', color: 'var(--kalpx-cta-text)' }
      : { background: 'var(--kalpx-chip-bg)', border: '1px solid var(--kalpx-border-gold)', color: 'var(--kalpx-text)' };
  }

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onToggle}
      disabled={disabled}
      style={{
        minHeight: height,
        padding,
        borderRadius: 'var(--kalpx-r-pill)',
        fontFamily: 'var(--kalpx-font-sans)',
        fontSize,
        fontWeight: 500,
        cursor: disabled ? 'default' : (onToggle ? 'pointer' : 'default'),
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.15s, border-color 0.15s',
        display: 'inline-flex',
        alignItems: 'center',
        ...chipStyle,
        ...style,
      }}
    >
      {label}
    </button>
  );
}

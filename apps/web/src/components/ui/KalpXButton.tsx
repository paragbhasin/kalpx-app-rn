import React from 'react';

interface KalpXButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

const SIZE_STYLES: Record<string, React.CSSProperties> = {
  sm: { padding: '7px 16px', fontSize: 13, minHeight: 32 },
  md: { padding: '12px 24px', fontSize: 15, minHeight: 44 },
  lg: { padding: '14px 32px', fontSize: 16, minHeight: 52 },
};

export function KalpXButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  loadingText,
  onClick,
  type = 'button',
  children,
  style,
  'data-testid': testId,
}: KalpXButtonProps) {
  const isDisabled = disabled || loading;

  const base: React.CSSProperties = {
    borderRadius: 'var(--kalpx-r-lg)',
    fontFamily: 'var(--kalpx-font-sans)',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    border: 'none',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'background 0.15s, opacity 0.15s',
    opacity: isDisabled ? 0.6 : 1,
    width: fullWidth ? '100%' : undefined,
    boxSizing: 'border-box',
    ...SIZE_STYLES[size],
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: isDisabled ? '#d4b896' : 'var(--kalpx-cta)',
      color: 'var(--kalpx-cta-text)',
    },
    secondary: {
      background: 'transparent',
      border: '1px solid var(--kalpx-gold)',
      color: 'var(--kalpx-text)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--kalpx-cta)',
    },
    destructive: {
      background: 'transparent',
      border: '1px solid var(--kalpx-border)',
      color: '#c0392b',
    },
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      data-testid={testId}
      style={{ ...base, ...variantStyles[variant], ...style }}
    >
      {loading ? (loadingText ?? 'Loading…') : children}
    </button>
  );
}

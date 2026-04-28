import React from 'react';

interface SectionCardProps {
  children: React.ReactNode;
  p?: number;
  mb?: number;
  variant?: 'default' | 'inset' | 'subtle';
  onClick?: () => void;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

export function SectionCard({
  children,
  p = 20,
  mb = 16,
  variant = 'default',
  onClick,
  style,
  'data-testid': testId,
}: SectionCardProps) {
  const base: React.CSSProperties = {
    borderRadius: 'var(--kalpx-r-lg)',
    marginBottom: mb,
    padding: p,
    boxSizing: 'border-box',
    cursor: onClick ? 'pointer' : undefined,
    transition: onClick ? 'box-shadow 0.15s' : undefined,
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      background: 'var(--kalpx-card-bg)',
      border: '1px solid var(--kalpx-border-gold)',
      boxShadow: 'var(--kalpx-shadow-card)',
    },
    inset: {
      background: 'var(--kalpx-card-bg)',
      border: '1px solid var(--kalpx-border)',
    },
    subtle: {
      background: 'var(--kalpx-bg)',
      border: '1px solid var(--kalpx-gold-hairline)',
    },
  };

  return (
    <div
      data-testid={testId}
      onClick={onClick}
      style={{ ...base, ...variantStyles[variant], ...style }}
    >
      {children}
    </div>
  );
}

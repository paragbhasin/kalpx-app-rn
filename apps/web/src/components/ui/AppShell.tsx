import React from 'react';

interface AppShellProps {
  bg?: 'cream' | 'dark' | 'parchment';
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const BG_MAP: Record<string, string> = {
  cream: 'var(--kalpx-bg)',
  dark: 'var(--kalpx-dark-bg)',
  parchment: 'var(--kalpx-parchment)',
};

export function AppShell({ bg = 'cream', children, style }: AppShellProps) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: BG_MAP[bg],
        color: bg === 'dark' ? '#f0ede8' : 'var(--kalpx-text)',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

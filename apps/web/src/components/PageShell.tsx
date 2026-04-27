import React from 'react';

interface PageShellProps {
  children: React.ReactNode;
  centered?: boolean;
}

export function PageShell({ children, centered = false }: PageShellProps) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: centered ? 'center' : undefined,
        justifyContent: centered ? 'center' : undefined,
        background: '#0a0a0a',
        color: '#f0ede8',
      }}
    >
      {children}
    </div>
  );
}

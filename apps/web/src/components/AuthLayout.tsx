import React from 'react';

interface Props {
  children: React.ReactNode;
  title: string;
}

export function AuthLayout({ children, title }: Props) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        color: '#f0ede8',
      }}
    >
      <div style={{ width: '100%', maxWidth: 400, padding: '32px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 20, letterSpacing: 3, color: '#c9a96e' }}>KALPX</span>
          <h2 style={{ fontWeight: 300, fontSize: 22, marginTop: 8, marginBottom: 0 }}>{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
}

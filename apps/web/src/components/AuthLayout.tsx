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
        background: 'url(/hoomepagebg.jpg) center/cover fixed, var(--kalpx-bg)',
        color: 'var(--kalpx-text)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          padding: '32px 24px',
          boxSizing: 'border-box',
          background: 'var(--kalpx-card-bg)',
          borderRadius: 20,
          boxShadow: 'var(--kalpx-shadow-card-lift)',
          marginBottom: 40,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/kalpx-logo.png" alt="KalpX" style={{ height: 32 }} />
          <h2
            style={{
              fontFamily: 'var(--kalpx-font-serif)',
              fontWeight: 400,
              fontSize: 24,
              color: 'var(--kalpx-text)',
              marginTop: 8,
              marginBottom: 0,
            }}
          >
            {title}
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
}

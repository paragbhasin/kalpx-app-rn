import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  transparent?: boolean;
}

export function MitraTopBar({ transparent = false }: Props) {
  return (
    <div
      style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 18,
        paddingRight: 18,
        flexShrink: 0,
        borderBottom: '1px solid var(--kalpx-border-gold)',
        background: transparent ? 'transparent' : 'rgba(255,248,239,0.88)',
        backdropFilter: transparent ? undefined : 'blur(8px)',
        WebkitBackdropFilter: transparent ? undefined : 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <Link to="/en/mitra/dashboard" style={{ display: 'flex', alignItems: 'center' }}>
        <img src="/kalpx-logo.png" alt="KalpX" style={{ height: 28 }} />
      </Link>
      <button
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--kalpx-text-muted)',
          letterSpacing: 0.5,
          padding: '4px 10px',
          border: '1px solid var(--kalpx-border-gold)',
          borderRadius: 20,
          background: 'transparent',
          cursor: 'default',
        }}
        aria-label="Language: English"
      >
        EN
      </button>
    </div>
  );
}

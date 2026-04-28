import React from 'react';
import { Link } from 'react-router-dom';

export function Footer({ transparent = false }: { transparent?: boolean }) {
  return (
    <footer
      className="kalpx-desktop-only"
      style={{
        background: transparent ? 'rgba(255, 248, 239, 0.18)' : 'var(--kalpx-bg)',
        borderTop: transparent ? '1px solid rgba(237, 222, 180, 0.45)' : '1px solid var(--kalpx-border-gold)',
        backdropFilter: transparent ? 'blur(6px)' : undefined,
        WebkitBackdropFilter: transparent ? 'blur(6px)' : undefined,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <p style={{ fontSize: 12, color: 'var(--kalpx-text-muted)', margin: 0 }}>
        © 2026 KalpX. All rights reserved.
      </p>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <Link to="/en/privacy" style={{ fontSize: 12, color: 'var(--kalpx-text-muted)', textDecoration: 'none' }}>
          Privacy Policy
        </Link>
        <Link to="/en/terms" style={{ fontSize: 12, color: 'var(--kalpx-text-muted)', textDecoration: 'none' }}>
          Terms of Service
        </Link>
        <span style={{ fontSize: 12, color: 'var(--kalpx-text-muted)' }}>Follow us:</span>
        <a
          href="https://www.instagram.com/kalpxofficial"
          target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 12, color: 'var(--kalpx-cta)', textDecoration: 'none', fontWeight: 600 }}
        >
          Instagram
        </a>
        <a
          href="https://www.facebook.com/kalpxofficial"
          target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 12, color: 'var(--kalpx-cta)', textDecoration: 'none', fontWeight: 600 }}
        >
          Facebook
        </a>
      </div>
    </footer>
  );
}

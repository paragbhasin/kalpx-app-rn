/**
 * Header — minimal top bar for non-immersive pages (profile, account).
 * Not used on Mitra immersive pages (full-screen runner, rooms, etc.).
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated } from '@kalpx/auth';
import { webStorage } from '../../lib/webStorage';

export function Header() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    isAuthenticated(webStorage).then(setAuthed);
  }, []);

  return (
    <header
      data-testid="app-header"
      style={{
        width: '100%',
        height: 52,
        background: '#fdf8ef',
        borderBottom: '1px solid #e8d5a0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        boxSizing: 'border-box',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <Link
        to="/en/mitra"
        style={{ fontSize: 14, fontWeight: 700, letterSpacing: 3, color: '#b08840', textDecoration: 'none' }}
      >
        KALPX
      </Link>

      <nav style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {authed ? (
          <>
            <Link
              to="/en/mitra/dashboard"
              data-testid="header-dashboard-link"
              style={{ fontSize: 13, color: '#4a3318', textDecoration: 'none' }}
            >
              Mitra
            </Link>
            <Link
              to="/en/profile"
              data-testid="header-profile-link"
              style={{ fontSize: 13, color: '#4a3318', textDecoration: 'none' }}
            >
              Profile
            </Link>
          </>
        ) : (
          <Link
            to="/login"
            data-testid="header-signin-link"
            style={{
              fontSize: 13,
              color: '#b08840',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}

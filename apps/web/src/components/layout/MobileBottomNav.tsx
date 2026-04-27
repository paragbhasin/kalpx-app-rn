import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useCurrentUser';

const TABS = [
  { to: '/en', label: 'Home', icon: '⌂', exact: true },
  { to: '/en/mitra', label: 'Mitra', icon: '🪷', exact: false },
  { to: '/en/classes', label: 'Classes', icon: '◎', exact: false },
  { to: '/en/community', label: 'Community', icon: '◉', exact: false },
  { to: '/en/profile', label: 'Profile', icon: '○', exact: false },
];

export function MobileBottomNav() {
  const { authed } = useCurrentUser();

  return (
    <nav
      className="kalpx-mobile-only"
      data-testid="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        height: 56,
        background: 'var(--kalpx-bg)',
        borderTop: '1px solid var(--kalpx-border-gold)',
        display: 'flex',
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {TABS.map(({ to, label, icon, exact }) => {
        const dest = to === '/en/profile' && !authed ? '/login' : to;
        return (
          <NavLink
            key={to}
            to={dest}
            end={exact}
            style={({ isActive }) => ({
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              textDecoration: 'none',
              color: isActive ? 'var(--kalpx-cta)' : 'var(--kalpx-text-muted)',
              fontSize: 10,
              fontWeight: isActive ? 700 : 400,
              transition: 'color 0.15s',
              paddingTop: 4,
            })}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{icon}</span>
            <span>{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

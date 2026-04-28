import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Bell, User, Menu } from 'lucide-react';

const TABS = [
  { label: 'Home',          Icon: Home, to: '/en/mitra/dashboard' },
  { label: 'Notifications', Icon: Bell, to: '/en/notifications' },
  { label: 'Profile',       Icon: User, to: '/en/profile' },
  { label: 'Menu',          Icon: Menu, to: '/en/classes' },
] as const;

export function MitraBottomNav4Tab() {
  return (
    <nav
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: 'calc(56px + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)',
        borderTop: '1px solid var(--kalpx-border-gold)',
        background: 'rgba(255,248,239,0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        flexShrink: 0,
      }}
    >
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/en/mitra/dashboard'}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            textDecoration: 'none',
            color: isActive ? 'var(--kalpx-cta)' : 'var(--kalpx-text-muted)',
            fontWeight: isActive ? 700 : 400,
            fontSize: 10,
            touchAction: 'manipulation',
          })}
        >
          {({ isActive }) => (
            <>
              <tab.Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              {tab.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

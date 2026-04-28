import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Bell, User, Menu } from 'lucide-react';

const LINK_TABS = [
  { label: 'Home',          Icon: Home, to: '/en/mitra/dashboard', end: true },
  { label: 'Notifications', Icon: Bell, to: '/en/notifications',   end: false },
  { label: 'Profile',       Icon: User, to: '/en/profile',         end: false },
] as const;

interface Props {
  onMenuOpen: () => void;
}

const tabStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 3,
  textDecoration: 'none',
  fontSize: 10,
  touchAction: 'manipulation',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
};

export function MitraBottomNav4Tab({ onMenuOpen }: Props) {
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
      {LINK_TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          style={({ isActive }) => ({
            ...tabStyle,
            color: isActive ? 'var(--kalpx-cta)' : 'var(--kalpx-text-muted)',
            fontWeight: isActive ? 700 : 400,
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

      {/* Menu tab — opens drawer instead of navigating */}
      <button
        onClick={onMenuOpen}
        aria-label="Open menu"
        style={{ ...tabStyle, color: 'var(--kalpx-text-muted)' }}
      >
        <Menu size={20} strokeWidth={1.8} />
        Menu
      </button>
    </nav>
  );
}

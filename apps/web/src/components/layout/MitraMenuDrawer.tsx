import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, User, LogOut } from 'lucide-react';
import { AUTH_KEYS } from '@kalpx/api-client';

interface Props {
  onClose: () => void;
}

const NAV_ITEMS = [
  { label: 'Mitra',       Icon: LayoutDashboard, to: '/en/mitra/dashboard' },
  { label: 'Community',   Icon: Users,            to: '/en/community' },
  { label: 'Classes',     Icon: BookOpen,         to: '/en/classes' },
  { label: 'Profile',     Icon: User,             to: '/en/profile' },
];

export function MitraMenuDrawer({ onClose }: Props) {
  const navigate = useNavigate();
  const isLoggedIn = typeof localStorage !== 'undefined' && !!localStorage.getItem(AUTH_KEYS.accessToken);

  function handleLogout() {
    localStorage.removeItem(AUTH_KEYS.accessToken);
    localStorage.removeItem(AUTH_KEYS.refreshToken);
    onClose();
    navigate('/login');
  }

  return (
    <div className="kalpx-menu-drawer-overlay" onClick={onClose}>
      <div className="kalpx-menu-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid var(--kalpx-border-gold)' }}>
          <img src="/kalpx-logo.png" alt="KalpX" style={{ height: 24 }} />
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {NAV_ITEMS.map(({ label, Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 20px',
                textDecoration: 'none',
                color: isActive ? 'var(--kalpx-cta)' : 'var(--kalpx-text)',
                fontWeight: isActive ? 600 : 400,
                fontSize: 15,
                background: isActive ? 'rgba(201,168,76,0.06)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--kalpx-cta)' : '3px solid transparent',
              })}
            >
              <Icon size={20} strokeWidth={1.6} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer: logout */}
        <div style={{ borderTop: '1px solid var(--kalpx-border-gold)', padding: '12px 0' }}>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                width: '100%',
                padding: '14px 20px',
                background: 'none',
                border: 'none',
                color: '#e06060',
                fontSize: 15,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <LogOut size={20} strokeWidth={1.6} />
              Logout
            </button>
          ) : (
            <NavLink
              to="/login"
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 20px',
                textDecoration: 'none',
                color: 'var(--kalpx-text)',
                fontSize: 15,
              }}
            >
              <User size={20} strokeWidth={1.6} />
              Sign in
            </NavLink>
          )}
        </div>
      </div>
    </div>
  );
}

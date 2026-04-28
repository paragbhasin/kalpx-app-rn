import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';

// Routes that are full-screen immersive — no header/footer/bottom-nav
const IMMERSIVE_PREFIXES = [
  '/en/mitra/dashboard',
  '/en/mitra/engine',
  '/en/mitra/room/',
  '/en/mitra/checkpoint/',
  '/en/mitra/trigger',
  '/en/mitra/checkin',
  '/en/mitra/start',
  '/en/mitra/onboarding',
];

// Routes that use AuthLayout — also no shell
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password', '/logout'];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  const isImmersive = IMMERSIVE_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuth = AUTH_ROUTES.some((p) => pathname === p || pathname.startsWith(p + '?'));
  const isMitraHome = pathname === '/en/mitra';

  if (isImmersive || isAuth || isMitraHome) {
    return <>{children}</>;
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

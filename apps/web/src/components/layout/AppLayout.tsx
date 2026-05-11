import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';
import { stopRoomAmbient } from '../../lib/audio/calmMusic';

// Routes that are full-screen immersive — no header/footer/bottom-nav
const IMMERSIVE_PREFIXES = [
  '/en/mitra/dashboard',
  '/en/mitra/engine',
  '/en/mitra/inner-path',
  '/en/mitra/quick-reset',
  '/en/mitra/rhythm',
  '/en/mitra/tell-mitra',
  '/en/mitra/checkpoint/',
  '/en/mitra/trigger',
  '/en/mitra/checkin',
  '/en/mitra/start',
  '/en/mitra/onboarding',
  '/en/mitra/welcome-back',
];

// Routes that use AuthLayout — also no shell
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password', '/logout'];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  const isImmersive = IMMERSIVE_PREFIXES.some((p) => {
    const prefix = p.endsWith('/') ? p : p + '/';
    return pathname === p || pathname.startsWith(prefix);
  });
  const isAuth = AUTH_ROUTES.some((p) => pathname === p || pathname.startsWith(p + '?'));
  const isMitraHome = pathname === '/en' || pathname === '/en/mitra';
  const isRoomRoute = pathname.startsWith('/en/mitra/room/');

  useEffect(() => {
    if (!isRoomRoute) stopRoomAmbient();
  }, [isRoomRoute]);

  if (isImmersive || isAuth || isMitraHome) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: isRoomRoute ? '#FFF8EF' : undefined,
        backgroundImage: isRoomRoute ? 'url(/rooms_bg.jpg)' : undefined,
        backgroundSize: isRoomRoute ? 'cover' : undefined,
        backgroundRepeat: isRoomRoute ? 'no-repeat' : undefined,
        backgroundAttachment: isRoomRoute ? 'fixed' : undefined,
      }}
    >
      <Header transparent={isRoomRoute} />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import { stopRoomAmbient } from '../../lib/audio/calmMusic';

// Routes that are full-screen immersive — no header/footer/bottom-nav
const IMMERSIVE_PREFIXES = [
  '/en/mitra/dashboard',
  '/en/mitra/engine',
  '/en/mitra/inner-path',
  '/en/mitra/quick-reset',
  '/en/mitra/rhythm/setup',
  '/en/mitra/rhythm/edit',
  '/en/mitra/tell-mitra',
  '/en/mitra/checkin-quick',
  '/en/mitra/checkpoint/',
  '/en/mitra/trigger',
  '/en/mitra/checkin',
  '/en/mitra/start',
  '/en/mitra/intention',
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
  const { shouldHideChrome } = useScrollDirection();

  useEffect(() => {
    if (!isRoomRoute) stopRoomAmbient();
  }, [isRoomRoute]);

  if (isImmersive || isAuth || isMitraHome) {
    return <>{children}</>;
  }

  return (
    <div
      className="kalpx-app-shell"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: isRoomRoute ? '#FFF8EF' : undefined,
        backgroundImage: isRoomRoute ? 'url(/rooms_bg.jpg)' : undefined,
        backgroundSize: isRoomRoute ? 'cover' : undefined,
        backgroundRepeat: isRoomRoute ? 'no-repeat' : undefined,
        backgroundAttachment: isRoomRoute ? 'scroll' : undefined,
      }}
    >
      <Header transparent={isRoomRoute} hidden={shouldHideChrome} />
      <main className="kalpx-shell-main kalpx-app-main" style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
      <MobileBottomNav hidden={shouldHideChrome} />
    </div>
  );
}

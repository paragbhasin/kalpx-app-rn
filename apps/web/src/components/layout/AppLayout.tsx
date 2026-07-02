import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import { stopRoomAmbient } from '../../lib/audio/calmMusic';
import { ENABLED_LOCALES } from '../../lib/locale';

// Strips the leading locale segment (e.g. /hi/mitra → /mitra, /en → /)
function stripLocale(path: string): string {
  for (const loc of ENABLED_LOCALES) {
    if (path === `/${loc}`) return '/';
    if (path.startsWith(`/${loc}/`)) return path.slice(loc.length + 1);
  }
  return path;
}

// Routes that are full-screen immersive — no header/footer/bottom-nav (locale-agnostic)
const IMMERSIVE_PREFIXES = [
  '/mitra/dashboard',
  '/mitra/engine',
  '/mitra/inner-path',
  '/mitra/quick-reset',
  '/mitra/rhythm',
  '/mitra/rhythm/setup',
  '/mitra/rhythm/edit',
  '/mitra/tell-mitra',
  '/mitra/checkin-quick',
  '/mitra/checkpoint/',
  '/mitra/trigger',
  '/mitra/checkin',
  '/mitra/start',
  '/mitra/intention',
  '/mitra/onboarding',
  '/mitra/welcome-back',
];

// Routes that use AuthLayout — also no shell
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password', '/logout'];

// Ops/guide portal routes — have their own chrome (no global header/footer/bottom-nav)
const PORTAL_PREFIXES = ['/guide/', '/guide', '/ops-login', '/ops/', '/ops', '/programs/admin', '/join'];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const localePath = stripLocale(pathname);

  const isImmersive = IMMERSIVE_PREFIXES.some((p) => {
    const prefix = p.endsWith('/') ? p : p + '/';
    return localePath === p || localePath.startsWith(prefix);
  });
  const isAuth = AUTH_ROUTES.some((p) => pathname === p || pathname.startsWith(p + '?'));
  const isPortal = PORTAL_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?'));
  const isMitraHome = localePath === '/' || localePath === '/mitra';
  const isRoomRoute = localePath.startsWith('/mitra/room/');
  const { shouldHideChrome } = useScrollDirection();

  useEffect(() => {
    if (!isRoomRoute) stopRoomAmbient();
  }, [isRoomRoute]);

  if (isImmersive || isAuth || isMitraHome || isPortal) {
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

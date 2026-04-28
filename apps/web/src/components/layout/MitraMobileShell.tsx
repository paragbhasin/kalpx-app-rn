import React from 'react';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
// import { MitraTopBar } from './MitraTopBar';
// import { MitraBottomNav4Tab } from './MitraBottomNav4Tab';
// import { MitraMenuDrawer } from './MitraMenuDrawer';

interface Props {
  children: React.ReactNode;
  hideBottomNav?: boolean;
  hideTopBar?: boolean;
  backgroundImage?: string;
}

export function MitraMobileShell({ children, hideBottomNav, hideTopBar, backgroundImage }: Props) {
  const transparentChrome = !!backgroundImage;

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: backgroundImage
          ? `url(${backgroundImage}) center/cover fixed, var(--kalpx-bg)`
          : `url(/beige_bg.png) center/cover fixed, var(--kalpx-bg)`,
      }}
    >
      <div style={{ maxWidth: 480, margin: '0 auto', height: '100dvh', display: 'flex', flexDirection: 'column' }}>
        {/* {!hideTopBar && <MitraTopBar transparent={transparentChrome} />} */}
        {!hideTopBar && <Header transparent={transparentChrome} />}
        <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {children}
        </main>
        {/* {!hideBottomNav && <MitraBottomNav4Tab transparent={transparentChrome} onMenuOpen={() => setMenuOpen(true)} />} */}
        {!hideBottomNav && <MobileBottomNav transparent={transparentChrome} />}
      </div>
      {/* {menuOpen && <MitraMenuDrawer onClose={() => setMenuOpen(false)} />} */}
    </div>
  );
}

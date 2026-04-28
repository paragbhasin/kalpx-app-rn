import React from 'react';
import { MitraTopBar } from './MitraTopBar';
import { MitraBottomNav4Tab } from './MitraBottomNav4Tab';

interface Props {
  children: React.ReactNode;
  hideBottomNav?: boolean;
  hideTopBar?: boolean;
}

export function MitraMobileShell({ children, hideBottomNav, hideTopBar }: Props) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: `url(/beige_bg.png) center/cover fixed, var(--kalpx-bg)`,
      }}
    >
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {!hideTopBar && <MitraTopBar />}
        <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {children}
        </main>
        {!hideBottomNav && <MitraBottomNav4Tab />}
      </div>
    </div>
  );
}

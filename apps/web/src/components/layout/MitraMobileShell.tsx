import React, { useState } from "react";
import { MitraBottomNav4Tab } from "./MitraBottomNav4Tab";
import { MitraMenuDrawer } from "./MitraMenuDrawer";
import { MitraTopBar } from "./MitraTopBar";

interface Props {
  children: React.ReactNode;
  hideBottomNav?: boolean;
  hideTopBar?: boolean;
  backgroundImage?: string;
}

export function MitraMobileShell({
  children,
  hideBottomNav,
  hideTopBar,
  backgroundImage,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const transparentChrome = !!backgroundImage;

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: backgroundImage
          ? `url(${backgroundImage}) center/cover fixed, var(--kalpx-bg)`
          : `url(/beige_bg.png) center/cover fixed, var(--kalpx-bg)`,
      }}
    >
      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {!hideTopBar && <MitraTopBar transparent={transparentChrome} />}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </main>
        {!hideBottomNav && (
          <MitraBottomNav4Tab
            transparent={transparentChrome}
            onMenuOpen={() => setMenuOpen(true)}
          />
        )}
      </div>
      {menuOpen && <MitraMenuDrawer onClose={() => setMenuOpen(false)} />}
    </div>
  );
}

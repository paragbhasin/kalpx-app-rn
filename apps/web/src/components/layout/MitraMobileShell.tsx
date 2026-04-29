import React from "react";
import { Header } from "./Header";
import { MobileBottomNav } from "./MobileBottomNav";
// import { MitraTopBar } from './MitraTopBar';
// import { MitraBottomNav4Tab } from './MitraBottomNav4Tab';
// import { MitraMenuDrawer } from './MitraMenuDrawer';

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
  const transparentChrome = !!backgroundImage;

  return (
    <div
      className="kalpx-mitra-shell"
      style={{
        minHeight: "100dvh",
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : "url(/beige_bg.png)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "top 92%",
        backgroundAttachment: "fixed",
      }}
    >
      <div
        className="kalpx-mitra-shell-frame"
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* {!hideTopBar && <MitraTopBar transparent={transparentChrome} />} */}
        {!hideTopBar && <Header transparent={transparentChrome} />}
        <main
          className="kalpx-shell-main kalpx-mitra-shell-main"
          style={{
            flex: 1,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </main>
        {/* {!hideBottomNav && <MitraBottomNav4Tab transparent={transparentChrome} onMenuOpen={() => setMenuOpen(true)} />} */}
        {!hideBottomNav && <MobileBottomNav transparent={transparentChrome} />}
      </div>
      {/* {menuOpen && <MitraMenuDrawer onClose={() => setMenuOpen(false)} />} */}
    </div>
  );
}

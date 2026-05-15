import React from "react";
import { useScrollDirection } from "../../hooks/useScrollDirection";
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
  showBack?: boolean;
  backTo?: string;
  onBack?: () => void;
}

export function MitraMobileShell({
  children,
  hideBottomNav,
  hideTopBar,
  backgroundImage,
  showBack = true,
  backTo = "/en/mitra",
  onBack,
}: Props) {
  // This shell always paints a background image, even when callers omit one
  // and we fall back to /beige_bg.png. Keep chrome transparent so the
  // Mitra surfaces show that background consistently.
  const transparentChrome = true;
  const { shouldHideChrome } = useScrollDirection();
  const shellStyle = {
    minHeight: "100vh",
    backgroundImage: backgroundImage
      ? `url(${backgroundImage})`
      : "url(/beige_bg.png)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "top 92%",
    backgroundAttachment: "scroll",
    "--kalpx-shell-top-space": hideTopBar
      ? "0px"
      : "calc(60px + env(safe-area-inset-top))",
    "--kalpx-shell-bottom-space": hideBottomNav
      ? "24px"
      : "calc(72px + env(safe-area-inset-bottom))",
  } as React.CSSProperties;

  return (
    <div
      className="kalpx-mitra-shell"
      style={shellStyle}
    >
      <div
        className="kalpx-mitra-shell-frame"
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {/* {!hideTopBar && <MitraTopBar transparent={transparentChrome} />} */}
        {!hideTopBar && (
          <Header
            transparent={transparentChrome}
            hidden={shouldHideChrome}
            showBack={showBack}
            backTo={backTo}
            onBack={onBack}
          />
        )}
        <main
          className="kalpx-shell-main kalpx-mitra-shell-main"
          style={{
            flex: 1,
            overflowY: "visible",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </main>
        {/* {!hideBottomNav && <MitraBottomNav4Tab transparent={transparentChrome} onMenuOpen={() => setMenuOpen(true)} />} */}
        {!hideBottomNav && (
          <MobileBottomNav
            transparent={transparentChrome}
            hidden={shouldHideChrome}
          />
        )}
      </div>
      {/* {menuOpen && <MitraMenuDrawer onClose={() => setMenuOpen(false)} />} */}
    </div>
  );
}

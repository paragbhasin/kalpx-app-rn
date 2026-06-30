import { Menu, User } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useTranslation } from "../../lib/i18n";
import { MitraMenuDrawer } from "./MitraMenuDrawer";

export function MobileBottomNav({
  transparent = false,
  hidden = false,
}: {
  transparent?: boolean;
  hidden?: boolean;
}) {
  const { authed, userInitial } = useCurrentUser();
  const { t, locale } = useTranslation();
  const TABS = [
    { to: `/${locale}`, labelKey: "nav.home" as const, icon: "/new-home.svg", activeIcon: "/sel-home.svg", exact: true },
    { to: `/${locale}/profile`, labelKey: "nav.profile" as const, exact: false },
  ];
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav
        className="kalpx-mobile-only"
        data-testid="mobile-bottom-nav"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: transparent
            ? "rgba(255, 248, 239, 0.92)"
            : "rgba(255, 248, 239, 0.97)",
          borderTop: "1px solid rgba(201, 168, 76, 0.18)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          display: "flex",
          zIndex: 50,
          paddingBottom: "env(safe-area-inset-bottom)",
          boxShadow: "0 -8px 24px rgba(67, 33, 4, 0.08)",
          transform: hidden
            ? "translate3d(0, 100%, 0)"
            : "translate3d(0, 0, 0)",
          transition: "transform 0.24s cubic-bezier(0.22, 1, 0.36, 1)",
          willChange: "transform",
          pointerEvents: hidden ? "none" : "auto",
        }}
      >
        {TABS.map(({ to, labelKey, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            style={({ isActive }) => ({
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              textDecoration: "none",
              color: isActive ? "var(--kalpx-cta)" : "#7c746d",
              fontSize: 11,
              fontWeight: isActive ? 700 : 500,
              transition: "color 0.15s",
              paddingTop: 8,
            })}
          >
            {({ isActive }) =>
              labelKey === "nav.home" ? (
                <>
                  <img
                    src={isActive ? "/sel-home.svg" : "/new-home.svg"}
                    alt=""
                    aria-hidden="true"
                    style={{ width: 24, height: 24, objectFit: "contain" }}
                  />
                  <span>{t(labelKey)}</span>
                </>
              ) : (
                <>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: isActive
                        ? "var(--kalpx-cta)"
                        : "rgba(67, 33, 4, 0.08)",
                      color: isActive ? "#fff" : "#6c6259",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    <User size={20} fill="black" stroke="none" />
                  </div>
                  <span>{t(labelKey)}</span>
                </>
              )
            }
          </NavLink>
        ))}

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            background: "none",
            border: "none",
            color: "#7c746d",
            fontSize: 11,
            fontWeight: 500,
            paddingTop: 8,
            cursor: "pointer",
          }}
        >
          <Menu size={24} strokeWidth={2.1} />
          <span>{t('nav.menu')}</span>
        </button>
      </nav>

      {menuOpen && <MitraMenuDrawer onClose={() => setMenuOpen(false)} />}
    </>
  );
}

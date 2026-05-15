import { Menu, User } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { MitraMenuDrawer } from "./MitraMenuDrawer";

const TABS = [
  {
    to: "/en",
    label: "Home",
    icon: "/new-home.svg",
    activeIcon: "/sel-home.svg",
    exact: true,
  },
  {
    to: "/en/profile",
    label: "Profile",
    exact: false,
  },
  // {
  //   to: "/en/mitra",
  //   label: "Mitra",
  //   icon: "/new-routine.svg",
  //   activeIcon: "/sel-routine.svg",
  //   exact: false,
  // },
  // {
  //   to: "/en/classes",
  //   label: "Classes",
  //   icon: "/new-classes.svg",
  //   activeIcon: "/sel-classes.svg",
  //   exact: false,
  // },
  // {
  //   to: "/en/community",
  //   label: "Community",
  //   icon: "/new-kalpxhaat.svg",
  //   activeIcon: "/sel-com.svg",
  //   exact: false,
  // },
  // {
  //   to: "/en/retreats",
  //   label: "Retreats",
  //   icon: "/new-retreat.svg",
  //   activeIcon: "/sel-retreats.svg",
  //   exact: false,
  // },
];

export function MobileBottomNav({
  transparent = false,
  hidden = false,
}: {
  transparent?: boolean;
  hidden?: boolean;
}) {
  const { authed, userInitial } = useCurrentUser();
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
        {TABS.map(({ to, label, exact }) => (
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
              label === "Home" ? (
                <>
                  <img
                    src={isActive ? "/sel-home.svg" : "/new-home.svg"}
                    alt=""
                    aria-hidden="true"
                    style={{ width: 24, height: 24, objectFit: "contain" }}
                  />
                  <span>{label}</span>
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
                  <span>{label}</span>
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
          <span>Menu</span>
        </button>
      </nav>

      {menuOpen && <MitraMenuDrawer onClose={() => setMenuOpen(false)} />}
    </>
  );
}

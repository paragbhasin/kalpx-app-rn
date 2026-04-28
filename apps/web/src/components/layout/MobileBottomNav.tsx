import { NavLink } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";

const TABS = [
  {
    to: "/en",
    label: "Home",
    icon: "/new-home.svg",
    activeIcon: "/sel-home.svg",
    exact: true,
  },
  {
    to: "/en/mitra",
    label: "Mitra",
    icon: "/new-routine.svg",
    activeIcon: "/sel-routine.svg",
    exact: false,
  },
  {
    to: "/en/classes",
    label: "Classes",
    icon: "/new-classes.svg",
    activeIcon: "/sel-classes.svg",
    exact: false,
  },
  {
    to: "/en/community",
    label: "Community",
    icon: "/new-kalpxhaat.svg",
    activeIcon: "/sel-com.svg",
    exact: false,
  },
  {
    to: "/en/retreats",
    label: "Retreats",
    icon: "/new-retreat.svg",
    activeIcon: "/sel-retreats.svg",
    exact: false,
  },
];

export function MobileBottomNav({
  transparent = false,
}: {
  transparent?: boolean;
}) {
  useCurrentUser();

  return (
    <nav
      className="kalpx-mobile-only"
      data-testid="mobile-bottom-nav"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 62,

        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        display: "flex",
        zIndex: 50,
        paddingBottom: "env(safe-area-inset-bottom)",
        boxShadow: "0 -4px 18px rgba(67, 33, 4, 0.04)",
      }}
    >
      {TABS.map(({ to, label, icon, activeIcon, exact }) => {
        return (
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
              fontSize: 10,
              fontWeight: isActive ? 700 : 500,
              transition: "color 0.15s",
              paddingTop: 6,
            })}
          >
            {({ isActive }) => (
              <>
                <img
                  src={isActive ? activeIcon : icon}
                  alt=""
                  aria-hidden="true"
                  style={{ width: 24, height: 24, objectFit: "contain" }}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

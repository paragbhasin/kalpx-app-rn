import { clearTokens } from "@kalpx/auth";
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { webStorage } from "../../lib/webStorage";

const NAV_LINKS = [
  { to: "/en", label: "Home", match: "/en", mobileOnly: true },
  // { to: "/en/mitra", label: "Mitra", match: "/en/mitra" },
  { to: "/en/haat", label: "Kalpx Haat", match: "/en/haat" },
  { to: "/en/classes", label: "Classes", match: "/en/classes" },
  { to: "/en/community", label: "Community", match: "/en/community" },
  // { to: "/en/retreats", label: "Retreats", match: "/en/retreats" },
];

export function Header({ transparent = false }: { transparent?: boolean }) {
  const navigate = useNavigate();
  const { authed, userInitial, refresh } = useCurrentUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const useTransparentChrome = transparent && !isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleLogout() {
    setDropdownOpen(false);
    await clearTokens(webStorage);
    refresh();
    navigate("/login");
  }

  const navItemStyle = (active: boolean): React.CSSProperties => ({
    fontSize: 13,
    fontWeight: active ? 600 : 500,
    color: active ? "var(--kalpx-cta)" : "var(--kalpx-text)",
    textDecoration: "none",
    padding: "4px 2px",
    borderBottom: active
      ? "2px solid var(--kalpx-cta)"
      : "2px solid transparent",
    transition: "color 0.15s, border-color 0.15s",
  });

  return (
    <>
      <header
        data-testid="app-header"
        style={{
          width: "100%",
          height: 60,
          background: useTransparentChrome
            ? "transparent"
            : isScrolled
              ? "rgba(255, 248, 239, 0.88)"
              : "var(--kalpx-bg)",
          backdropFilter: useTransparentChrome
            ? "none"
            : isScrolled
              ? "blur(12px)"
              : "none",
          WebkitBackdropFilter: useTransparentChrome
            ? "none"
            : isScrolled
              ? "blur(12px)"
              : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          boxSizing: "border-box",
          position: "sticky",
          top: 0,
          zIndex: 60,
          transition:
            "background 0.3s, backdrop-filter 0.3s, border-color 0.3s",
          borderBottom: useTransparentChrome
            ? "none"
            : isScrolled
              ? "1px solid rgba(199, 162, 88, 0.16)"
              : "none",
        }}
      >
        {/* Logo */}
        <Link
          to="/en"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <img
            src="/kalpx-logo.png"
            alt="KalpX"
            style={{ height: 33, width: "auto" }}
          />
        </Link>

        {/* Desktop nav — hidden on mobile via CSS class */}
        <nav
          className="kalpx-desktop-nav"
          style={{ display: "flex", alignItems: "center", gap: 24 }}
        >
          {NAV_LINKS.map(({ to, label, match }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => navItemStyle(isActive)}
              data-testid={`header-nav-${label.toLowerCase()}`}
            >
              {label}
            </NavLink>
          ))}

          {authed ? (
            <>
              {/* Notifications bell */}
              {/* <Link
                to="/en/notifications"
                data-testid="header-notifications-link"
                style={{
                  fontSize: 18,
                  textDecoration: "none",
                  lineHeight: 1,
                  color: "var(--kalpx-text-soft)",
                }}
                title="Notifications"
              >
                🔔
              </Link> */}

              {/* Avatar dropdown */}
              <div ref={dropdownRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  data-testid="header-avatar-btn"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "var(--kalpx-cta)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {userInitial}
                </button>

                {dropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: 44,
                      right: 0,
                      background: "#fff",
                      border: "1px solid var(--kalpx-border-gold)",
                      borderRadius: 10,
                      boxShadow: "var(--kalpx-shadow-card)",
                      minWidth: 160,
                      zIndex: 70,
                      overflow: "hidden",
                    }}
                  >
                    {[{ label: "Profile", to: "/en/profile" }].map(
                      ({ label, to }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setDropdownOpen(false)}
                          style={{
                            display: "block",
                            padding: "12px 16px",
                            fontSize: 13,
                            color: "var(--kalpx-text)",
                            textDecoration: "none",
                            borderBottom: "1px solid var(--kalpx-border-gold)",
                          }}
                        >
                          {label}
                        </Link>
                      ),
                    )}
                    <button
                      onClick={handleLogout}
                      data-testid="header-logout-btn"
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "12px 16px",
                        fontSize: 13,
                        color: "#c0392b",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/login"
              data-testid="header-signin-link"
              style={{
                fontSize: 13,
                fontWeight: 600,
                background: "var(--kalpx-cta)",
                color: "#fff",
                textDecoration: "none",
                padding: "8px 18px",
                borderRadius: "var(--kalpx-r-lg)",
              }}
            >
              Sign in
            </Link>
          )}
        </nav>

        {false && (
          <div
            className="kalpx-mobile-only"
            style={{ alignItems: "center", gap: 10 }}
          >
            <button
              onClick={() => {}}
              aria-label="Open menu"
              data-testid="header-hamburger-btn"
              style={{
                width: 38,
                height: 38,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--kalpx-text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
            >
              <span />
            </button>
          </div>
        )}
      </header>

      {false && <div />}
    </>
  );
}

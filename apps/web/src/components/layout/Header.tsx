import { clearTokens } from "@kalpx/auth";
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { webStorage } from "../../lib/webStorage";

const NAV_LINKS = [
  { to: "/en/mitra", label: "Mitra", match: "/en/mitra" },
  { to: "/en/classes", label: "Classes", match: "/en/classes" },
  { to: "/en/community", label: "Community", match: "/en/community" },
  { to: "/en/retreats", label: "Retreats", match: "/en/retreats" },
];

export function Header({ transparent = false }: { transparent?: boolean }) {
  const navigate = useNavigate();
  const { authed, userInitial, refresh } = useCurrentUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Lock body scroll when sidebar open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  async function handleLogout() {
    setDropdownOpen(false);
    setSidebarOpen(false);
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
          height: 56,
          background: transparent
            ? "rgba(255, 248, 239, 0.18)"
            : "var(--kalpx-bg)",
          backdropFilter: transparent ? "blur(6px)" : undefined,
          WebkitBackdropFilter: transparent ? "blur(6px)" : undefined,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          boxSizing: "border-box",
          position: "sticky",
          top: 0,
          zIndex: 60,
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
            style={{ height: 32, width: "auto" }}
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
              <Link
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
              </Link>

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
                    {[
                      { label: "Profile", to: "/en/profile" },
                      { label: "Notifications", to: "/en/notifications" },
                    ].map(({ label, to }) => (
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
                    ))}
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

        {/* Mobile hamburger — hidden on desktop via CSS class */}
        <button
          className="kalpx-mobile-only"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          data-testid="header-hamburger-btn"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 22,
            color: "var(--kalpx-text)",
            padding: "4px 8px",
          }}
        >
          ☰
        </button>
      </header>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              zIndex: 80,
            }}
          />

          {/* Sidebar panel */}
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: 260,
              background: "#fff",
              boxShadow: "-4px 0 24px rgba(67,33,4,0.12)",
              zIndex: 90,
              display: "flex",
              flexDirection: "column",
              animation: "kalpx-slide-in-right 0.22s ease-out",
            }}
          >
            {/* Sidebar header */}
            <div
              style={{
                background: "var(--kalpx-cta)",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {authed ? (
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "#fff",
                    color: "var(--kalpx-cta)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                >
                  {userInitial}
                </div>
              ) : (
                <img
                  src="/kalpx-logo.png"
                  alt="KalpX"
                  style={{ height: 28, width: "auto" }}
                />
              )}
              <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 22,
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {/* Nav links */}
            <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
              {NAV_LINKS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  style={({ isActive }) => ({
                    display: "block",
                    padding: "14px 24px",
                    fontSize: 16,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "var(--kalpx-cta)" : "var(--kalpx-text)",
                    textDecoration: "none",
                    borderBottom: "1px solid var(--kalpx-border-gold)",
                  })}
                >
                  {label}
                </NavLink>
              ))}

              {authed && (
                <>
                  <NavLink
                    to="/en/notifications"
                    onClick={() => setSidebarOpen(false)}
                    style={({ isActive }) => ({
                      display: "block",
                      padding: "14px 24px",
                      fontSize: 16,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive
                        ? "var(--kalpx-cta)"
                        : "var(--kalpx-text)",
                      textDecoration: "none",
                      borderBottom: "1px solid var(--kalpx-border-gold)",
                    })}
                  >
                    Notifications
                  </NavLink>
                  <NavLink
                    to="/en/profile"
                    onClick={() => setSidebarOpen(false)}
                    style={({ isActive }) => ({
                      display: "block",
                      padding: "14px 24px",
                      fontSize: 16,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive
                        ? "var(--kalpx-cta)"
                        : "var(--kalpx-text)",
                      textDecoration: "none",
                      borderBottom: "1px solid var(--kalpx-border-gold)",
                    })}
                  >
                    Profile
                  </NavLink>
                </>
              )}
            </nav>

            {/* Auth action */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid var(--kalpx-border-gold)",
              }}
            >
              {authed ? (
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "var(--kalpx-r-lg)",
                    background: "none",
                    border: "1px solid var(--kalpx-border)",
                    color: "#c0392b",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "12px",
                    borderRadius: "var(--kalpx-r-lg)",
                    background: "var(--kalpx-cta)",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Sign in
                </Link>
              )}
            </div>

            {/* Social / app download */}
            <div style={{ padding: "12px 24px 20px", textAlign: "center" }}>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--kalpx-text-muted)",
                  marginBottom: 8,
                }}
              >
                Follow us
              </p>
              <div
                style={{ display: "flex", gap: 12, justifyContent: "center" }}
              >
                <a
                  href="https://www.instagram.com/kalpxofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 12,
                    color: "var(--kalpx-cta)",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Instagram
                </a>
                <a
                  href="https://www.facebook.com/kalpxofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 12,
                    color: "var(--kalpx-cta)",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

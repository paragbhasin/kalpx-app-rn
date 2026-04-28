import { clearTokens } from "@kalpx/auth";
import { ChevronDown, Menu, User, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { webStorage } from "../../lib/webStorage";

const NAV_LINKS = [
  { to: "/en", label: "Home", match: "/en", mobileOnly: true },
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
          marginTop: 10,
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
            style={{ height: 44, width: "auto" }}
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
        <div
          className="kalpx-mobile-only"
          style={{ alignItems: "center", gap: 10 }}
        >
          <button
            aria-label="Language: English"
            style={{
              height: 44,
              padding: "0 14px",
              borderRadius: 14,
              border: "1px solid rgba(198, 186, 180, 0.95)",
              background: "rgba(255,255,255,0.72)",
              boxShadow: "0 6px 16px rgba(67, 33, 4, 0.06)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "var(--kalpx-text)",
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "inherit",
            }}
          >
            <span>English</span>
            <ChevronDown size={18} strokeWidth={1.8} color="#a89d93" />
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
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
            <Menu size={34} strokeWidth={2.2} />
          </button>
        </div>
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
              top: 14,
              right: 0,
              bottom: 14,
              width: "min(456px, calc(100vw - 80px))",
              background: "#ffffff",
              borderRadius: "42px 0 0 0",
              boxShadow: "-12px 0 30px rgba(67,33,4,0.14)",
              zIndex: 90,
              display: "flex",
              flexDirection: "column",
              animation: "kalpx-slide-in-right 0.22s ease-out",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "#d9a40c",
                padding: "15px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#fff",
                  color: "#d9a40c",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 18px rgba(67,33,4,0.08)",
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                {authed ? (
                  userInitial
                ) : (
                  <User size={28} strokeWidth={2.2} color="#d9a40c" />
                )}
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#fff",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#2b2b2b",
                }}
              >
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "34px 42px 0",
              }}
            >
              <nav
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 28,
                }}
              >
                {NAV_LINKS.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setSidebarOpen(false)}
                    style={({ isActive }) => ({
                      fontSize: 18,
                      fontWeight: 600,
                      color: "#2f3135",
                      textDecoration: "none",
                      lineHeight: 1.1,
                    })}
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>

              <div style={{ marginTop: 20 }}>
                <button
                  aria-label="Language: English"
                  style={{
                    // height: 52,
                    minWidth: 170,
                    padding: "8px",
                    borderRadius: 10,
                    border: "1px solid rgba(198, 206, 218, 0.95)",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 18,
                    color: "#1f2a3a",
                    fontSize: 16,
                    fontWeight: 600,
                    boxShadow: "0 2px 8px rgba(67,33,4,0.04)",
                  }}
                >
                  <span>English</span>
                  <ChevronDown size={20} strokeWidth={1.8} color="#9ba4b5" />
                </button>
              </div>

              <div style={{ marginTop: 20 }}>
                {authed ? (
                  <button
                    onClick={handleLogout}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      color: "var(--kalpx-cta)",
                      fontSize: 18,
                      fontWeight: 700,
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
                      color: "var(--kalpx-cta)",
                      fontSize: 18,
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    Login
                  </Link>
                )}
              </div>

              <div
                style={{
                  marginTop: 28,
                  borderTop: "1px solid #d9d9d9",
                  paddingTop: 34,
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: "0 0 20px",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#2f3135",
                  }}
                >
                  Download App now
                </p>
                <a
                  href="#"
                  style={{
                    width: 45,
                    height: 45,
                    borderRadius: 10,
                    background: "#fff",
                    boxShadow: "0 14px 24px rgba(67,33,4,0.12)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2f3135",
                    textDecoration: "none",
                  }}
                >
                  <img
                    src="/apple-black.svg"
                    width={28}
                    height={33}
                    alt=""
                    aria-hidden="true"
                  />
                </a>
              </div>

              <div
                style={{
                  marginTop: 42,
                  borderTop: "1px solid #d9d9d9",
                  paddingTop: 30,
                  paddingBottom: 28,
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: "0 0 16px",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#3b3d42",
                  }}
                >
                  Follow Us
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 18,
                  }}
                >
                  <img
                    src="/facebook-icon.svg"
                    width={28}
                    height={28}
                    alt=""
                    aria-hidden="true"
                  />
                  <img
                    src="/insta.svg"
                    width={25}
                    height={25}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

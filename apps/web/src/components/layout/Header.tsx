import { clearTokens } from "@kalpx/auth";
import { ArrowLeft, Globe } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useTranslation, type Locale } from "../../lib/i18n";
import { ENABLED_LOCALES, LANG_LABELS } from "../../lib/locale";
import { webStorage } from "../../lib/webStorage";

export function Header({
  transparent = false,
  hidden = false,
  showBack = false,
  backTo = "/en/mitra",
  onBack,
}: {
  transparent?: boolean;
  hidden?: boolean;
  showBack?: boolean;
  backTo?: string;
  onBack?: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { authed, userInitial, refresh } = useCurrentUser();
  const { t, locale, setLocale } = useTranslation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const mobileLangRef = useRef<HTMLDivElement>(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const useTransparentChrome = transparent && !isScrolled;

  const NAV_LINKS = [
    { to: "/en", label: t("nav.home"), match: "/en", mobileOnly: true },
    { to: "/en/classes", label: t("nav.classes"), match: "/en/classes" },
    { to: "/en/community", label: t("nav.community"), match: "/en/community" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
      if (mobileLangRef.current && !mobileLangRef.current.contains(e.target as Node)) {
        setMobileLangOpen(false);
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

  function handleBack() {
    if (onBack) {
      onBack();
      return;
    }
    if (location.key && location.key !== "default") {
      navigate(-1);
      return;
    }
    navigate(backTo);
  }

  function handleLangSelect(lang: Locale) {
    setLocale(lang);
    setLangOpen(false);
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
          transform: hidden
            ? "translate3d(0, -100%, 0)"
            : "translate3d(0, 0, 0)",
          transition:
            "transform 0.24s cubic-bezier(0.22, 1, 0.36, 1), background 0.3s, backdrop-filter 0.3s, border-color 0.3s",
          willChange: "transform",
          borderBottom: useTransparentChrome
            ? "none"
            : isScrolled
              ? "1px solid rgba(199, 162, 88, 0.16)"
              : "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back"
              data-testid="header-back-btn"
              style={{
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                flexShrink: 0,
              }}
            >
              <ArrowLeft size={20} strokeWidth={2.2} />
            </button>
          )}

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
              style={{ height: 33, width: "auto", marginTop: 10 }}
            />
          </Link>
        </div>

        {/* Mobile language switcher — hidden when only one locale is enabled */}
        {ENABLED_LOCALES.length > 1 && (
          <div ref={mobileLangRef} className="kalpx-mobile-only" style={{ position: "relative" }}>
            <button
              onClick={() => setMobileLangOpen((o) => !o)}
              aria-label="Switch language"
              data-testid="header-mobile-lang-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                fontWeight: 600,
                color: "var(--kalpx-text-muted)",
                letterSpacing: 0.5,
                padding: "4px 10px",
                border: "1px solid var(--kalpx-border-gold)",
                borderRadius: 20,
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <Globe size={13} strokeWidth={2} />
              {LANG_LABELS[locale as keyof typeof LANG_LABELS] ?? 'English'}
            </button>

            {mobileLangOpen && (
              <>
                <div
                  onClick={() => setMobileLangOpen(false)}
                  style={{ position: "fixed", inset: 0, zIndex: 59 }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 36,
                    right: 0,
                    background: "#fff",
                    border: "1px solid var(--kalpx-border-gold)",
                    borderRadius: 10,
                    boxShadow: "var(--kalpx-shadow-card)",
                    minWidth: 120,
                    zIndex: 60,
                    overflow: "hidden",
                  }}
                >
                  {ENABLED_LOCALES.map((code, idx) => (
                    <button
                      key={code}
                      onClick={() => { setLocale(code as Locale); setMobileLangOpen(false); }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        padding: "11px 16px",
                        fontSize: 13,
                        fontWeight: locale === code ? 700 : 500,
                        color: locale === code ? "var(--kalpx-cta)" : "var(--kalpx-text)",
                        background: locale === code ? "rgba(184,134,75,0.07)" : "none",
                        border: "none",
                        borderBottom: idx < ENABLED_LOCALES.length - 1 ? "1px solid var(--kalpx-border-gold)" : "none",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      {LANG_LABELS[code] ?? code}
                      {locale === code && (
                        <span style={{ fontSize: 10, color: "var(--kalpx-cta)" }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Desktop nav */}
        <nav
          className="kalpx-desktop-nav"
          style={{ display: "flex", alignItems: "center", gap: 24 }}
        >
          {NAV_LINKS.map(({ to, label, match }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => navItemStyle(isActive)}
              data-testid={`header-nav-${match.replace("/en/", "").replace("/en", "home")}`}
            >
              {label}
            </NavLink>
          ))}

          {/* Language switcher — hidden when only one locale is enabled */}
          {ENABLED_LOCALES.length > 1 && (
            <div ref={langRef} style={{ position: "relative" }}>
              <button
                onClick={() => setLangOpen((o) => !o)}
                aria-label="Switch language"
                data-testid="header-lang-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--kalpx-text-muted)",
                  letterSpacing: 0.5,
                  padding: "4px 10px",
                  border: "1px solid var(--kalpx-border-gold)",
                  borderRadius: 20,
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <Globe size={13} strokeWidth={2} />
                {LANG_LABELS[locale as keyof typeof LANG_LABELS] ?? 'English'}
              </button>

              {langOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: 36,
                    right: 0,
                    background: "#fff",
                    border: "1px solid var(--kalpx-border-gold)",
                    borderRadius: 10,
                    boxShadow: "var(--kalpx-shadow-card)",
                    minWidth: 120,
                    zIndex: 70,
                    overflow: "hidden",
                  }}
                >
                  {ENABLED_LOCALES.map((code, idx) => (
                    <button
                      key={code}
                      onClick={() => handleLangSelect(code as Locale)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        padding: "11px 16px",
                        fontSize: 13,
                        fontWeight: locale === code ? 700 : 500,
                        color: locale === code ? "var(--kalpx-cta)" : "var(--kalpx-text)",
                        background: locale === code ? "rgba(184,134,75,0.07)" : "none",
                        border: "none",
                        borderBottom: idx < ENABLED_LOCALES.length - 1 ? "1px solid var(--kalpx-border-gold)" : "none",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      {LANG_LABELS[code] ?? code}
                      {locale === code && (
                        <span style={{ fontSize: 10, color: "var(--kalpx-cta)" }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {authed ? (
            <>
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
                    <Link
                      to="/en/profile"
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
                      {t("nav.profile")}
                    </Link>
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
                      {t("nav.logout")}
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
              {t("nav.signIn")}
            </Link>
          )}
        </nav>
      </header>
    </>
  );
}

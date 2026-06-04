import { Globe } from "lucide-react";
import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation, type Locale } from "../../lib/i18n";

interface Props {
  transparent?: boolean;
}

export function MitraTopBar({ transparent = false }: Props) {
  const { locale, setLocale } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  function handleSelect(lang: Locale) {
    setLocale(lang);
    setLangOpen(false);
  }

  return (
    <div
      style={{
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 18,
        paddingRight: 18,
        flexShrink: 0,
        background: transparent ? "transparent" : "rgba(255,248,239,0.88)",
        backdropFilter: transparent ? undefined : "blur(8px)",
        WebkitBackdropFilter: transparent ? undefined : "blur(8px)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <Link
        to="/en/mitra"
        style={{ display: "flex", alignItems: "center" }}
      >
        <img src="/kalpx-logo.png" alt="KalpX" style={{ height: 28 }} />
      </Link>

      <div ref={langRef} style={{ position: "relative" }}>
        <button
          onClick={() => setLangOpen((o) => !o)}
          aria-label="Switch language"
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
          <Globe size={12} strokeWidth={2} />
          {locale === "hi" ? "हि" : locale === "te" ? "తె" : "EN"}
        </button>

        {langOpen && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setLangOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 29 }}
            />
            <div
              style={{
                position: "absolute",
                top: 36,
                right: 0,
                background: "#fff",
                border: "1px solid var(--kalpx-border-gold)",
                borderRadius: 10,
                boxShadow: "0 4px 24px rgba(67,33,4,0.10)",
                minWidth: 120,
                zIndex: 30,
                overflow: "hidden",
              }}
            >
              {(
                [
                  { code: "en" as Locale, label: "English" },
                  { code: "hi" as Locale, label: "हिंदी" },
                  { code: "te" as Locale, label: "తెలుగు" },
                ] as const
              ).map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => handleSelect(code)}
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
                    borderBottom: code !== "te" ? "1px solid var(--kalpx-border-gold)" : "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {label}
                  {locale === code && (
                    <span style={{ fontSize: 10, color: "var(--kalpx-cta)" }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

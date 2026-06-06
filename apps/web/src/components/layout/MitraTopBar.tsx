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

      {/* Language switcher — commented out */}
      {/* <div ref={langRef} style={{ position: "relative" }}>...</div> */}
    </div>
  );
}

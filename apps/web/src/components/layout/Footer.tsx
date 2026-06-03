import { Link } from "react-router-dom";
import { useTranslation } from "../../lib/i18n";

export function Footer({ transparent = false }: { transparent?: boolean }) {
  const { t } = useTranslation();

  return (
    <footer
      className="kalpx-desktop-only"
      style={{
        background: transparent
          ? "rgba(255, 248, 239, 0.18)"
          : "var(--kalpx-bg)",
        backdropFilter: transparent ? "blur(6px)" : undefined,
        WebkitBackdropFilter: transparent ? "blur(6px)" : undefined,
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <p style={{ fontSize: 12, color: "var(--kalpx-text-muted)", margin: 0 }}>
        {t("footer.copyright")}
      </p>
      <div
        style={{
          display: "flex",
          gap: 20,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Link
          to="/en/privacy"
          style={{
            fontSize: 12,
            color: "var(--kalpx-text-muted)",
            textDecoration: "none",
          }}
        >
          {t("footer.privacyPolicy")}
        </Link>
        <Link
          to="/en/terms"
          style={{
            fontSize: 12,
            color: "var(--kalpx-text-muted)",
            textDecoration: "none",
          }}
        >
          {t("footer.termsOfService")}
        </Link>
        <Link
          to="/en/data-deletion"
          style={{
            fontSize: 12,
            color: "var(--kalpx-text-muted)",
            textDecoration: "none",
          }}
        >
          {t("footer.dataDeletion")}
        </Link>
        <span style={{ fontSize: 12, color: "var(--kalpx-text-muted)" }}>
          {t("footer.followUs")}
        </span>
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
    </footer>
  );
}

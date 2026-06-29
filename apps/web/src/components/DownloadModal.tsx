import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDownloadModal } from "../hooks/useDownloadModal";
import { useTranslation } from "../lib/i18n";

export function DownloadModal() {
  const { t } = useTranslation();
  const { visible, close, openAppStore, openPlayStore, schedule, cancel } =
    useDownloadModal();
  const { pathname } = useLocation();

  useEffect(() => {
    schedule();
    return () => cancel();
  }, [schedule, cancel]);

  // Close if navigating to creator routes
  useEffect(() => {
    if (pathname.includes("/creator") && visible) close();
  }, [pathname, visible, close]);

  if (!visible) return null;

  return (
    <div
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.45)",
        padding: "0 10px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 760,
          borderRadius: 14,
          backgroundImage: "url('/beige_bg.png')",
          backgroundSize: "cover",
          padding: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          maxHeight: "90vh",
          flexWrap: "wrap",
        }}
      >
        {/* Close button */}
        <button
          onClick={close}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 14,
            right: 16,
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#ebe6e6",
            border: "none",
            fontSize: 18,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#000",
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {/* CTA content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            order: 1,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-piazzolla, serif)",
              fontSize: 24,
              color: "var(--kalpx-cta, #d9a40c)",
            }}
          >
            KalpX
          </div>
          <div
            style={{
              fontFamily: "var(--font-piazzolla, serif)",
              fontSize: 16,
              color: "#8E591A",
            }}
          >
            {t('downloadModal.connectRoots')}
          </div>
          <div
            style={{
              fontFamily: "var(--font-piazzolla, serif)",
              fontWeight: 600,
              fontSize: 20,
              marginTop: 8,
              color: "#000",
            }}
          >
            {t('downloadModal.beginJourney')}
          </div>
          <div
            style={{
              fontFamily: "var(--font-piazzolla, serif)",
              fontSize: 18,
              marginTop: 12,
              color: "#000",
            }}
          >
            {t('downloadModal.carryWisdom')}
          </div>
          <div
            style={{
              fontFamily: "var(--font-piazzolla, serif)",
              fontSize: 18,
              fontWeight: 700,
              color: "#9C6B00",
            }}
          >
            {t('downloadModal.getApp')}
          </div>

          {/* Store buttons */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 20,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <button
              onClick={openAppStore}
              style={{
                background: "#000",
                border: "none",
                borderRadius: 8,
                padding: "6px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: 180,
              }}
            >
              <img src="/apple-black.svg" alt="" width={16} />
              <span style={{ color: "#fff", textAlign: "left", lineHeight: 1.3 }}>
                <span style={{ fontSize: 12 }}>{t('downloadModal.downloadOn')}</span>
                <br />
                <span style={{ fontSize: 18, fontWeight: 600 }}>{t('downloadModal.appStore')}</span>
              </span>
            </button>

            <button
              onClick={openPlayStore}
              style={{
                background: "#000",
                border: "none",
                borderRadius: 8,
                padding: "6px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: 180,
              }}
            >
              <img src="/playstore.svg" alt="" width={18} />
              <span style={{ color: "#fff", textAlign: "left", lineHeight: 1.3 }}>
                <span style={{ fontSize: 12 }}>{t('downloadModal.getItOn')}</span>
                <br />
                <span style={{ fontSize: 18, fontWeight: 600 }}>{t('downloadModal.googlePlay')}</span>
              </span>
            </button>
          </div>
        </div>

        {/* App preview image */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            order: 2,
          }}
        >
          <img
            src="/download-app2.svg"
            alt="KalpX App Preview"
            style={{ width: "100%", maxWidth: 260 }}
          />
        </div>
      </div>
    </div>
  );
}

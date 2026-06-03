import { AUTH_KEYS } from "@kalpx/api-client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MitraMobileShell } from "../../components/layout/MitraMobileShell";
import { useTranslation } from "../../lib/i18n";

const PENDING_KEY = "mitra_intention_pending";

function isAuthed(): boolean {
  return !!(
    localStorage.getItem(AUTH_KEYS.accessToken) ||
    localStorage.getItem("access_token")
  );
}

const OPTION_ACCENTS = {
  daily_rhythm: {
    Icon: "/m3.svg",

    iconBg: "rgba(248, 238, 209, 0.72)",
    chipBg: "rgba(245, 222, 166, 0.34)",
    chipColor: "#C18B12",
  },
  inner_path: {
    Icon: "/mp3.svg",

    iconBg: "rgba(248, 238, 209, 0.72)",
    chipBg: "rgba(222, 200, 232, 0.48)",
    chipColor: "#C18B12",
  },
  quick_chant: {
    Icon: "/mp2.svg",

    iconBg: "rgba(248, 238, 209, 0.72)",
    chipBg: "rgba(225, 228, 190, 0.5)",
    chipColor: "#C18B12",
  },
  tell_mitra: {
    Icon: "/mp4.svg",
    iconBg: "rgba(248, 238, 209, 0.72)",
    chipBg: "rgba(247, 213, 179, 0.48)",
    chipColor: "#C18B12",
  },
} as const;

export function MitraIntentionPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isDesktop =
    typeof window === "undefined" ? true : window.innerWidth >= 1024;

  const INTENTION_OPTIONS = [
    {
      id: "daily_rhythm" as const,
      title: t("intention.dailyRhythmTitle"),
      body: t("intention.dailyRhythmBody"),
      cta: t("intention.dailyRhythmCta"),
    },
    {
      id: "inner_path" as const,
      title: t("intention.innerPathTitle"),
      body: t("intention.innerPathBody"),
      cta: t("intention.innerPathCta"),
    },
    {
      id: "quick_chant" as const,
      title: t("intention.quickChantTitle"),
      body: t("intention.quickChantBody"),
      cta: t("intention.quickChantCta"),
    },
    {
      id: "tell_mitra" as const,
      title: t("intention.tellMitraTitle"),
      body: t("intention.tellMitraBody"),
      cta: t("intention.tellMitraCta"),
    },
  ];

  // After login redirects back here, pick up the door the guest originally selected.
  useEffect(() => {
    if (!isAuthed()) return;
    const pending = sessionStorage.getItem(PENDING_KEY);
    if (!pending) return;
    sessionStorage.removeItem(PENDING_KEY);
    switch (pending) {
      case "daily_rhythm":
        navigate("/en/mitra/rhythm/setup");
        break;
      case "inner_path":
        localStorage.setItem("mitra_entry_intention", "inner_path");
        navigate(
          "/en/mitra/onboarding?containerId=welcome_onboarding&stateId=turn_2",
        );
        break;
      case "quick_chant":
        navigate("/en/mitra/quick-reset");
        break;
      case "tell_mitra":
        navigate("/en/mitra/tell-mitra");
        break;
    }
  }, [navigate]);

  function handleSelect(optionId: string) {
    if (!isAuthed()) {
      sessionStorage.setItem(PENDING_KEY, optionId);
      navigate("/login?returnTo=" + encodeURIComponent("/en/mitra/intention"));
      return;
    }
    switch (optionId) {
      case "daily_rhythm":
        navigate("/en/mitra/rhythm/setup");
        break;
      case "inner_path":
        localStorage.setItem("mitra_entry_intention", "inner_path");
        navigate(
          "/en/mitra/onboarding?containerId=welcome_onboarding&stateId=turn_2",
        );
        break;
      case "quick_chant":
        navigate("/en/mitra/quick-reset");
        break;
      case "tell_mitra":
        navigate("/en/mitra/tell-mitra");
        break;
    }
  }

  return (
    <MitraMobileShell backgroundImage="/beige_bg.png" wideDesktop>
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          padding: isDesktop ? "48px 32px 56px" : "28px 16px 24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: isDesktop ? 1320 : 420,
            position: "relative",
          }}
        >
          <img
            src="/leaves-bird.png"
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              top: isDesktop ? -118 : -160,
              right: isDesktop ? 64 : -26,
              width: isDesktop ? 300 : 220,
              opacity: isDesktop ? 0.28 : 0.36,
              pointerEvents: "none",
              userSelect: "none",
            }}
          />
          <h1
            style={{
              fontFamily: "var(--kalpx-font-serif)",
              fontWeight: 700,
              fontSize: isDesktop ? 56 : 34,
              lineHeight: isDesktop ? 1.12 : 1.28,
              color: "#432104",
              margin: 0,
              textAlign: "center",
            }}
          >
            {t("intention.heading")}
          </h1>
          <div
            style={{
              fontFamily: "var(--kalpx-font-ui, var(--kalpx-font-serif))",
              fontSize: isDesktop ? 24 : 18,
              lineHeight: 1.45,
              color: "rgba(67, 33, 4, 0.72)",
              marginTop: isDesktop ? 8 : 0,
              marginBottom: isDesktop ? 10 : 0,
              textAlign: "center",
            }}
          >
            {t("intention.subtext")}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              color: "#D6A63A",
              marginBottom: isDesktop ? 42 : 24,
            }}
          >
            <div
              style={{
                width: isDesktop ? 220 : 150,
                maxWidth: "36%",
                height: 1,
                background: "rgba(214, 166, 58, 0.28)",
              }}
            />
            <img src="/lotus_icon.png" alt="" width={22} height={22} />
            <div
              style={{
                width: 150,
                maxWidth: "36%",
                height: 1,
                background: "rgba(214, 166, 58, 0.28)",
              }}
            />
          </div>
          {/* {ENTRY_INTENTION_SUBTEXT.split("\n\n").map((para, i, arr) => (
            <p
              key={i}
              style={{
                fontFamily: "var(--kalpx-font-serif)",
                color: "rgba(67, 33, 4, 0.78)",
                fontSize: 17,
                lineHeight: 1.65,
                marginBottom: i === arr.length - 1 ? 10 : 10,
                marginTop: 0,
                textAlign: "center",
              }}
            >
              {para}
            </p>
          ))} */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isDesktop
                  ? "repeat(2, minmax(0, 1fr))"
                  : "minmax(0, 1fr)",
                gap: isDesktop ? 28 : 20,
                maxWidth: isDesktop ? 1180 : "100%",
                margin: "0 auto",
                alignItems: "stretch",
              }}
            >
            {INTENTION_OPTIONS.map((opt) => {
              const accent = OPTION_ACCENTS[opt.id];

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt.id)}
                  style={{
                    width: "100%",
                    background: "rgba(255, 252, 247, 0.92)",
                    border: "1px solid rgba(226, 199, 144, 0.48)",
                    borderRadius: isDesktop ? 22 : 11,
                    padding: isDesktop ? "28px 26px 24px" : "15px",
                    textAlign: "left",
                    cursor: "pointer",
                    boxShadow: "0 16px 40px rgba(201,168,76,0.10)",
                    display: "flex",
                    alignItems: "center",
                    gap: isDesktop ? 22 : 18,
                    minHeight: isDesktop ? 220 : undefined,
                    transition:
                      "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
                  }}
                >
                  <div
                    style={{
                      width: isDesktop ? 72 : 50,
                      height: isDesktop ? 72 : 50,
                      borderRadius: "50%",
                      background: accent.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: "inset 0 0 30px rgba(255,255,255,0.8)",
                    }}
                  >
                    <img
                      src={accent.Icon}
                      alt=""
                      width={isDesktop ? 72 : 50}
                      height={isDesktop ? 72 : 50}
                    />
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: isDesktop ? 166 : undefined,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--kalpx-font-serif)",
                        fontWeight: 700,
                        fontSize: isDesktop ? 24 : 20,
                        lineHeight: isDesktop ? 1.25 : 1.35,
                        color: "#432104",
                        marginBottom: isDesktop ? 12 : 8,
                      }}
                    >
                      {opt.title}
                    </div>
                    <div
                      style={{
                        color: "rgba(67, 33, 4, 0.76)",
                        fontSize: isDesktop ? 16 : 13,
                        lineHeight: isDesktop ? 1.5 : 1.52,
                        marginBottom: isDesktop ? 18 : 14,
                        maxWidth: isDesktop ? 360 : undefined,
                      }}
                    >
                      {opt.body}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 12,
                        width: "100%",
                        fontSize: isDesktop ? 14 : 12,
                        fontWeight: 700,
                        color: accent.chipColor,
                      }}
                    >
                      <span
                        style={{
                          textDecoration: " underline",
                          textUnderlineOffset: "6px",
                        }}
                      >
                        {opt.cta}
                      </span>
                      <span
                        style={{
                          fontSize: isDesktop ? 28 : 18,
                          lineHeight: 1,
                        }}
                      >
                        →
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </MitraMobileShell>
  );
}

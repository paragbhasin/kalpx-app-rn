import { AUTH_KEYS } from "@kalpx/api-client";
import {
  ENTRY_INTENTION_HEADING,
  ENTRY_INTENTION_OPTIONS,
  ENTRY_INTENTION_SUBTEXT,
} from "@kalpx/contracts";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MitraMobileShell } from "../../components/layout/MitraMobileShell";

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
    chipColor: "#8E5D99",
  },
  quick_chant: {
    Icon: "/mp2.svg",

    iconBg: "rgba(248, 238, 209, 0.72)",
    chipBg: "rgba(225, 228, 190, 0.5)",
    chipColor: "#8E9440",
  },
  tell_mitra: {
    Icon: "/mp4.svg",
    iconBg: "rgba(248, 238, 209, 0.72)",
    chipBg: "rgba(247, 213, 179, 0.48)",
    chipColor: "#D27A27",
  },
} as const;

export function MitraIntentionPage() {
  const navigate = useNavigate();

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
          "/en/mitra/onboarding?containerId=welcome_onboarding&stateId=turn_1",
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
          "/en/mitra/onboarding?containerId=welcome_onboarding&stateId=turn_1",
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
    <MitraMobileShell backgroundImage="/beige_bg.png">
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          padding: "24px 16px 24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            position: "relative",
          }}
        >
          <img
            src="/leaves-bird.png"
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              top: -160,
              right: -26,
              width: 220,
              opacity: 0.36,
              pointerEvents: "none",
              userSelect: "none",
            }}
          />
          <h1
            style={{
              fontFamily: "var(--kalpx-font-serif)",
              fontWeight: 700,
              fontSize: 34,
              lineHeight: 1.28,
              color: "#432104",
              marginBottom: 22,
              marginTop: 0,
              textAlign: "center",
            }}
          >
            {ENTRY_INTENTION_HEADING}
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              color: "#D6A63A",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 140,
                maxWidth: "34%",
                height: 1,
                background: "rgba(214, 166, 58, 0.42)",
              }}
            />
            <img src="/lotus_icon.png" alt="" width={22} height={22} />
            <div
              style={{
                width: 140,
                maxWidth: "34%",
                height: 1,
                background: "rgba(214, 166, 58, 0.42)",
              }}
            />
          </div>
          {ENTRY_INTENTION_SUBTEXT.split("\n\n").map((para, i, arr) => (
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
          ))}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {ENTRY_INTENTION_OPTIONS.map((opt) => {
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
                    borderRadius: 11,
                    padding: "15px",
                    textAlign: "left",
                    cursor: "pointer",
                    boxShadow: "0 16px 40px rgba(201,168,76,0.10)",
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                  }}
                >
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: "50%",
                      background: accent.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: "inset 0 0 30px rgba(255,255,255,0.8)",
                    }}
                  >
                    <img src={accent.Icon} alt="" width={50} height={50} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "var(--kalpx-font-serif)",
                        fontWeight: 700,
                        fontSize: 18,
                        lineHeight: 1.35,
                        color: "#432104",
                        marginBottom: 8,
                      }}
                    >
                      {opt.title}
                    </div>
                    <div
                      style={{
                        color: "rgba(67, 33, 4, 0.76)",
                        fontSize: 14,
                        lineHeight: 1.52,
                        marginBottom: 14,
                      }}
                    >
                      {opt.body}
                    </div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 12,
                        borderRadius: 999,
                        background: accent.chipBg,
                        color: accent.chipColor,
                        padding: "8px",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      <span>{opt.cta}</span>
                      <span style={{ fontSize: 18, lineHeight: 1 }}>→</span>
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

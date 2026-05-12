import { AUTH_KEYS } from "@kalpx/api-client";
import {
  ENTRY_INTENTION_HEADING,
  ENTRY_INTENTION_OPTIONS,
  ENTRY_INTENTION_SUBTEXT,
} from "@kalpx/contracts";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PENDING_KEY = "mitra_intention_pending";

function isAuthed(): boolean {
  return !!(
    localStorage.getItem(AUTH_KEYS.accessToken) ||
    localStorage.getItem("access_token")
  );
}

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
          "/en/mitra/onboarding?containerId=welcome_onboarding&stateId=turn_1"
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
          "/en/mitra/onboarding?containerId=welcome_onboarding&stateId=turn_1"
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
    <div
      style={{
        minHeight: "100dvh",
        backgroundImage: "url(/new_home.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          padding:
            "24px 20px calc(92px + env(safe-area-inset-bottom))",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
          }}
        >
          <h1
            style={{
              fontFamily: "var(--kalpx-font-serif)",
              fontWeight: 700,
              fontSize: 26,
              color: "#432104",
              marginBottom: 8,
              marginTop: 0,
            }}
          >
            {ENTRY_INTENTION_HEADING}
          </h1>
          {ENTRY_INTENTION_SUBTEXT.split("\n\n").map((para, i, arr) => (
            <p
              key={i}
              style={{
                fontFamily: "var(--kalpx-font-serif)",
                color: "rgba(67, 33, 4, 0.72)",
                fontSize: 16,
                lineHeight: 1.55,
                marginBottom: i === arr.length - 1 ? 28 : 10,
                marginTop: 0,
              }}
            >
              {para}
            </p>
          ))}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {ENTRY_INTENTION_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                style={{
                  width: "100%",
                  background: "linear-gradient(to right, #E5D4CA, #F5EDEA)",
                  border: "1px solid rgba(199,162,88,0.3)",
                  borderRadius: 20,
                  padding: "16px 18px",
                  textAlign: "left",
                  cursor: "pointer",
                  boxShadow: "0 10px 25px rgba(67,33,4,0.08)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--kalpx-font-serif)",
                    fontWeight: 700,
                    fontSize: 17,
                    color: "#432104",
                    marginBottom: 4,
                  }}
                >
                  {opt.title}
                </div>
                <div
                  style={{
                    color: "rgba(67, 33, 4, 0.65)",
                    fontSize: 14,
                    lineHeight: 1.5,
                    marginBottom: 10,
                  }}
                >
                  {opt.body}
                </div>
                <div
                  style={{
                    color: "#C9A84C",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {opt.cta} →
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

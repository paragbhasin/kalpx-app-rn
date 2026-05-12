import { useNavigate } from "react-router-dom";
import { MitraMobileShell } from "../../components/layout/MitraMobileShell";
import { useGuestIdentity } from "../../hooks/useGuestIdentity";

const SCREEN_STATE_KEY = "kalpx_journey_state";
const PENDING_INTENTION_KEY = "mitra_intention_pending";

const INTRO_LINES = [
  "Hi. I am Mitra.",
  "I am here to help you feel more calm, steady, and clear — on hard days and good days.",
  "I notice small things, like your mood and the shape of your day.",
];

export function MitraStartPage() {
  useGuestIdentity();
  const navigate = useNavigate();

  function handleBegin() {
    sessionStorage.removeItem(PENDING_INTENTION_KEY);

    try {
      const raw = localStorage.getItem(SCREEN_STATE_KEY);
      if (raw) {
        const next = JSON.parse(raw) as Record<string, any>;
        delete next.onboarding_turn;
        delete next.stashed_inference_state;
        delete next.stashed_guidance_mode;
        delete next.onboarding_draft_state;
        localStorage.setItem(SCREEN_STATE_KEY, JSON.stringify(next));
      }
    } catch {
      // Ignore stale localStorage parse failures and continue to the intention page.
    }

    navigate("/en/mitra/intention", { replace: true });
  }

  return (
    <MitraMobileShell backgroundImage="/new_home.png">
      <div
        style={{
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "20px 12px 24px",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          <div
            style={{
              border: "1px solid rgba(217, 190, 137, 0.65)",
              borderRadius: 26,
              padding: "28px 22px 30px",
            }}
            className="shadow-2xl"
          >
            <h1
              style={{
                margin: 0,
                color: "#432104",
                fontFamily: "var(--kalpx-font-serif)",
                fontSize: 28,
                lineHeight: 1.4,
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              I&apos;m Mitra.
              <br />
              I&apos;m here with you.
            </h1>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                margin: "18px 0 22px",
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 1,
                  background: "rgba(201, 168, 76, 0.35)",
                }}
              />
              <div
                style={{
                  width: 10,
                  height: 10,
                  background: "#D5AD4B",
                  transform: "rotate(45deg)",
                }}
              />
              <div
                style={{
                  width: 72,
                  height: 1,
                  background: "rgba(201, 168, 76, 0.35)",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 22,
              }}
            >
              {INTRO_LINES.map((line) => (
                <div
                  key={line}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "22px 1fr",
                    gap: 12,
                    alignItems: "start",
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      color: "#C9A84C",
                      fontSize: 18,
                      lineHeight: 1.4,
                      textAlign: "center",
                    }}
                  >
                    ✦
                  </div>
                  <p
                    style={{
                      margin: 0,
                      color: "#5C3B1A",
                      fontFamily: "var(--kalpx-font-serif)",
                      fontSize: 15,
                      lineHeight: 1.6,
                    }}
                  >
                    {line}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              paddingBottom: 8,
            }}
          >
            <img
              src="/new_home_lotus.png"
              alt=""
              style={{
                width: "56%",
                maxWidth: 220,
                pointerEvents: "none",
                userSelect: "none",
              }}
            />

            <button
              type="button"
              onClick={handleBegin}
              style={{
                width: "100%",
                border: "none",
                borderRadius: 999,
                padding: "16px 20px",
                background: "linear-gradient(90deg, #C89416 0%, #D9AE3A 100%)",
                color: "#FFF8EF",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 12px 24px rgba(132, 91, 10, 0.22)",
              }}
            >
              Yes, let&apos;s begin →
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/login?returnTo=" +
                    encodeURIComponent("/en/mitra/welcome-back"),
                )
              }
              style={{
                width: "100%",
                borderRadius: 999,
                padding: "16px 20px",
                background: "rgba(255, 251, 244, 0.95)",
                color: "#432104",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                border: "1px solid rgba(201, 168, 76, 0.55)",
                boxShadow: "0 10px 24px rgba(67, 33, 4, 0.08)",
              }}
            >
              I&apos;m returning
            </button>
          </div>
        </div>
      </div>
    </MitraMobileShell>
  );
}

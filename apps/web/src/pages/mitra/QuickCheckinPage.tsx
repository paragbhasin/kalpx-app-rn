import type { QuickCheckinEnergyState, QuickCheckinResponse } from "@kalpx/types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "../../components/layout/Footer";
import { Header } from "../../components/layout/Header";
import { MobileBottomNav } from "../../components/layout/MobileBottomNav";
import { postQuickCheckin } from "../../engine/mitraApi";

const ENERGY_OPTIONS: { label: string; value: QuickCheckinEnergyState; desc: string }[] = [
  { label: "Energized", value: "energized", desc: "Ready and moving" },
  { label: "Balanced", value: "balanced", desc: "Steady and clear" },
  { label: "Agitated", value: "agitated", desc: "Restless or tense" },
  { label: "Drained", value: "drained", desc: "Low or heavy" },
];

const DOOR_ROUTES: Record<string, string> = {
  my_rhythm: "/en/mitra/rhythm",
  inner_path: "/en/mitra/inner-path",
  quick_reset: "/en/mitra/quick-reset",
  tell_mitra: "/en/mitra/tell-mitra",
};

export function QuickCheckinPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuickCheckinResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkin(state: QuickCheckinEnergyState) {
    setLoading(true);
    setError(null);
    try {
      const res = await postQuickCheckin(state);
      setResult(res);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCTA() {
    if (!result) return;
    if (result.suggested_action === "navigate_to_room" && result.suggested_room_id) {
      navigate(`/en/mitra/room/${result.suggested_room_id}`);
    } else if (result.suggested_action === "navigate_to_door" && result.suggested_door) {
      navigate(DOOR_ROUTES[result.suggested_door] ?? "/en/mitra");
    } else {
      navigate("/en/mitra");
    }
  }

  const CARD: React.CSSProperties = {
    border: "1px solid rgba(201,168,76,0.22)",
    borderRadius: 18,
    background: "rgba(250,245,240,0.92)",
    padding: "24px 20px",
    boxShadow: "0 8px 20px rgba(67,33,4,0.08)",
  };

  return (
    <div style={{ minHeight: "100dvh", background: "#FFF8EF", display: "flex", flexDirection: "column" }}>
      <Header transparent />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px calc(92px + env(safe-area-inset-bottom))" }}>
        <div style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
          <button
            onClick={() => navigate("/en/mitra/tell-mitra")}
            style={{ background: "none", border: "none", color: "#C99317", fontSize: 14, cursor: "pointer", marginBottom: 20, padding: 0 }}
          >
            ← Back
          </button>

          {!result && (
            <>
              <h2 style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 24, color: "#432104", marginBottom: 6 }}>
                Quick Check-in
              </h2>
              <p style={{ color: "#7B6550", fontSize: 15, marginBottom: 28 }}>
                How are you feeling right now?
              </p>

              {loading ? (
                <p style={{ color: "#A08060" }}>Checking in…</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {ENERGY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => void checkin(opt.value)}
                      style={{
                        padding: "20px 14px",
                        borderRadius: 16,
                        border: "1px solid rgba(201,168,76,0.3)",
                        background: "rgba(250,245,240,0.92)",
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 16, color: "#432104", marginBottom: 4 }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: 13, color: "#7B6550" }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              )}

              {error && <p style={{ color: "#e06060", marginTop: 16, fontSize: 14 }}>{error}</p>}
            </>
          )}

          {result && (
            <div style={CARD}>
              <p style={{ fontFamily: "var(--kalpx-font-serif)", fontSize: 16, color: "#432104", lineHeight: 1.65, marginBottom: 20 }}>
                {result.copy}
              </p>
              <button
                onClick={handleCTA}
                style={{
                  width: "100%",
                  padding: "14px 0",
                  borderRadius: 14,
                  border: "none",
                  background: "linear-gradient(90deg, #C99317 0%, #E0AE21 50%, #C99317 100%)",
                  color: "#fff",
                  fontFamily: "var(--kalpx-font-serif)",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  marginBottom: 10,
                }}
              >
                {result.suggested_action === "navigate_to_room"
                  ? "Go to Room"
                  : result.suggested_action === "navigate_to_door"
                  ? "Open Door"
                  : "Return Home"}
              </button>
              <button
                onClick={() => navigate("/en/mitra")}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: 12,
                  border: "1px solid rgba(201,168,76,0.35)",
                  background: "transparent",
                  color: "#7B6550",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Return Home
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer transparent />
      <MobileBottomNav transparent />
    </div>
  );
}

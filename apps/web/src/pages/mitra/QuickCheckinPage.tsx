import { isValidRoomId } from "@kalpx/contracts";
import type { QuickCheckinEnergyState, QuickCheckinResponse } from "@kalpx/types";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { executeAction } from "../../engine/actionExecutor";
import { postQuickCheckin } from "../../engine/mitraApi";
import type { AppDispatch } from "../../store";
import { useScreenState } from "../../store/screenSlice";

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

const ROOM_CTA_LABELS: Record<string, string> = {
  room_stillness: "Go to Find Calm",
  room_release: "Set It Down",
  room_joy: "Notice What's Good",
  room_growth: "Take the Next Step",
  room_clarity: "Find Clarity",
  room_connection: "Open Connection",
};

const DOOR_CTA_LABELS: Record<string, string> = {
  my_rhythm: "Go to My Rhythm",
  inner_path: "Continue Your Path",
  quick_reset: "Start Quick Reset",
  tell_mitra: "Share with Mitra",
};

export function QuickCheckinPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const screenState = useScreenState();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuickCheckinResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<QuickCheckinEnergyState | null>(null);

  async function handleProceed() {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      const res = await postQuickCheckin(selected);
      setResult(res);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function getCTALabel(): string {
    if (!result) return "Continue";
    if (result.suggested_action === "navigate_to_room" && result.suggested_room_id) {
      return ROOM_CTA_LABELS[result.suggested_room_id] ?? "Go to Practice";
    }
    if (result.suggested_action === "navigate_to_door" && result.suggested_door) {
      return DOOR_CTA_LABELS[result.suggested_door] ?? "Continue";
    }
    return "Return Home";
  }

  function handleCTA() {
    if (!result) return;
    if (result.suggested_action === "navigate_to_room" && isValidRoomId(result.suggested_room_id)) {
      void executeAction(
        { type: "enter_room", payload: { room_id: result.suggested_room_id, source: "quick_checkin" } },
        { dispatch, screenData: screenState.screenData, currentStateId: "quick_checkin" }
      );
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
    padding: "28px 24px",
    boxShadow: "0 8px 20px rgba(67,33,4,0.08)",
    textAlign: "left" as const,
  };

  const RESULT_COPY_BLOCK: React.CSSProperties = {
    borderLeft: "3px solid rgba(201,147,23,0.5)",
    paddingLeft: 16,
    marginBottom: 24,
    fontFamily: "var(--kalpx-font-serif)",
    fontSize: 16,
    color: "#432104",
    lineHeight: 1.65,
    fontStyle: "italic" as const,
  };

  return (
    <div style={{ minHeight: "100dvh", background: "#FFF8EF", display: "flex", flexDirection: "column" }}>
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px calc(92px + env(safe-area-inset-bottom))" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: "none", border: "none", color: "#C99317", fontSize: 14, cursor: "pointer", marginBottom: 20, padding: 0 }}
          >
            ← Back
          </button>

          {!result && (
            <>
              <h2 style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 24, color: "#432104", marginBottom: 6, textAlign: "center" }}>
                Quick Check-in
              </h2>
              <p style={{ color: "#7B6550", fontSize: 15, marginBottom: 28, textAlign: "center" }}>
                Share how you're feeling. Mitra will find a practice that fits.
              </p>

              {loading ? (
                <p style={{ color: "#A08060", textAlign: "center" }}>Checking in…</p>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                    {ENERGY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSelected(opt.value)}
                        style={{
                          padding: "20px 14px",
                          borderRadius: 16,
                          border: selected === opt.value
                            ? "3px solid #C99317"
                            : "1px solid rgba(218,194,142,0.5)",
                          background: selected === opt.value
                            ? "rgba(201,147,23,0.08)"
                            : "#ffffff",
                          cursor: "pointer",
                          textAlign: "center",
                          boxShadow: selected === opt.value
                            ? "0 0 0 3px rgba(201,147,23,0.18)"
                            : "none",
                          transition: "border 0.15s, box-shadow 0.15s",
                        }}
                      >
                        <div style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 16, color: "#432104", marginBottom: 4 }}>
                          {opt.label}
                        </div>
                        <div style={{ fontSize: 13, color: "#7B6550" }}>{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: 13, color: selected ? "transparent" : "#A08060", textAlign: "center", marginBottom: 12, transition: "color 0.2s" }}>
                    Select your energy to continue.
                  </p>
                  <button
                    onClick={() => void handleProceed()}
                    disabled={selected === null}
                    style={{
                      width: "100%",
                      backgroundColor: "#C99317",
                      color: "#fff",
                      borderRadius: 20,
                      padding: "13px 36px",
                      fontSize: 16,
                      fontWeight: 600,
                      border: "none",
                      cursor: selected === null ? "not-allowed" : "pointer",
                      opacity: selected === null ? 0.4 : 1,
                      transition: "opacity 0.2s",
                    }}
                  >
                    Proceed →
                  </button>
                </>
              )}

              {error && <p style={{ color: "#e06060", marginTop: 16, fontSize: 14, textAlign: "center" }}>{error}</p>}
            </>
          )}

          {result && (
            <div style={CARD}>
              <p style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 17, color: "#C99317", marginBottom: 16 }}>
                Mitra heard you.
              </p>
              <div style={RESULT_COPY_BLOCK}>
                {result.copy}
              </div>
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
                {getCTALabel()}
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
    </div>
  );
}

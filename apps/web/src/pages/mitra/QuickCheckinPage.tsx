import { isValidRoomId } from "@kalpx/contracts";
import type {
  QuickCheckinEnergyState,
  QuickCheckinResponse,
} from "@kalpx/types";
import {
  ArrowLeft,
  CloudRain,
  Flower,
  Sparkles,
  SunMedium,
  Zap,
} from "lucide-react";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MitraMobileShell } from "../../components/layout/MitraMobileShell";
import { executeAction } from "../../engine/actionExecutor";
import { postQuickCheckin } from "../../engine/mitraApi";
import type { AppDispatch } from "../../store";
import { useScreenState } from "../../store/screenSlice";

const ENERGY_OPTIONS: {
  label: string;
  value: QuickCheckinEnergyState;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    label: "Energized",
    value: "energized",
    desc: "Ready and moving",
    icon: <SunMedium size={34} strokeWidth={1.8} />,
  },
  {
    label: "Balanced",
    value: "balanced",
    desc: "Steady and clear",
    icon: <Flower size={34} strokeWidth={1.8} />,
  },
  {
    label: "Agitated",
    value: "agitated",
    desc: "Restless or tense",
    icon: <Zap size={34} strokeWidth={1.8} />,
  },
  {
    label: "Drained",
    value: "drained",
    desc: "Low or heavy",
    icon: <CloudRain size={34} strokeWidth={1.8} />,
  },
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
  room_clarity: "Go to Find Clarity",
  room_connection: "Open Connection",
};

const DOOR_CTA_LABELS: Record<string, string> = {
  my_rhythm: "Go to My Rhythm",
  inner_path: "Continue Your Path",
  quick_reset: "Quick Reset",
  tell_mitra: "Tell Mitra more",
};

export function QuickCheckinPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const screenState = useScreenState();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuickCheckinResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<QuickCheckinEnergyState | null>(
    null,
  );

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
    if (
      result.suggested_action === "navigate_to_room" &&
      result.suggested_room_id
    ) {
      return ROOM_CTA_LABELS[result.suggested_room_id] ?? "Go to Practice";
    }
    if (
      result.suggested_action === "navigate_to_door" &&
      result.suggested_door
    ) {
      return DOOR_CTA_LABELS[result.suggested_door] ?? "Continue";
    }
    return "Return Home";
  }

  function handleCTA() {
    if (!result) return;
    if (
      result.suggested_action === "navigate_to_room" &&
      isValidRoomId(result.suggested_room_id)
    ) {
      void executeAction(
        {
          type: "enter_room",
          payload: {
            room_id: result.suggested_room_id,
            source: "quick_checkin",
          },
        },
        {
          dispatch,
          screenData: screenState.screenData,
          currentStateId: "quick_checkin",
        },
      );
    } else if (
      result.suggested_action === "navigate_to_door" &&
      result.suggested_door
    ) {
      navigate(DOOR_ROUTES[result.suggested_door] ?? "/en/mitra");
    } else {
      navigate("/en/mitra");
    }
  }

  const backBtn: React.CSSProperties = {
    background: "none",
    border: "none",
    color: "#C99317",
    fontSize: 15,
    cursor: "pointer",
    marginBottom: 26,
    padding: 0,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };

  const goldBtn: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    borderRadius: 11,
    border: "none",
    background: "linear-gradient(90deg, #C99317 0%, #E0AE21 48%, #D1A124 100%)",
    color: "#fff",
    fontFamily: "var(--kalpx-font-serif)",
    fontSize: 19,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 18px 40px rgba(201,147,23,0.2)",
  };

  return (
    <MitraMobileShell backgroundImage="/beige_bg.png">
      <main
        style={{
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "18px 16px calc(108px + env(safe-area-inset-bottom))",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>
          <img
            src="/leaves-bird.png"
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              top: -118,
              right: -30,
              width: 245,
              pointerEvents: "none",
              userSelect: "none",
              opacity: 0.36,
            }}
          />

          <button onClick={() => navigate(-1)} style={backBtn}>
            <ArrowLeft size={22} strokeWidth={2} />
            Back
          </button>

          {!result ? (
            <>
              <div style={{ textAlign: "center", marginBottom: 34 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 14,
                    color: "#D4A017",
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      width: 68,
                      height: 1,
                      background: "rgba(212,160,23,0.45)",
                    }}
                  />
                  <Sparkles size={24} strokeWidth={1.9} />
                  <div
                    style={{
                      width: 68,
                      height: 1,
                      background: "rgba(212,160,23,0.45)",
                    }}
                  />
                </div>
                <h1
                  style={{
                    fontFamily: "var(--kalpx-font-serif)",
                    fontWeight: 700,
                    fontSize: 34,
                    color: "#432104",
                    margin: "0 0 12px",
                  }}
                >
                  Quick Check-in
                </h1>
                <p
                  style={{
                    color: "#7B6550",
                    fontSize: 17,
                    lineHeight: 1.4,
                    margin: 0,
                  }}
                >
                  Share how you’re feeling.
                  <br />
                  Mitra will find a practice that fits.
                </p>
              </div>

              {loading ? (
                <p style={{ color: "#A08060", textAlign: "center" }}>
                  Checking in…
                </p>
              ) : (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                      marginBottom: 22,
                    }}
                  >
                    {ENERGY_OPTIONS.map((opt) => {
                      const active = selected === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setSelected(opt.value)}
                          style={{
                            padding: "10px",
                            borderRadius: 28,
                            border: active
                              ? "1.6px solid #D4A017"
                              : "1px solid rgba(212,160,23,0.35)",
                            background: active
                              ? "rgba(255, 250, 241, 0.96)"
                              : "rgba(255,255,255,0.86)",
                            cursor: "pointer",
                            textAlign: "center",
                            boxShadow: active
                              ? "0 0 0 3px rgba(212,160,23,0.12), 0 18px 36px rgba(201,168,76,0.12)"
                              : "0 16px 36px rgba(201,168,76,0.08)",
                            transition: "border 0.15s, box-shadow 0.15s",
                          }}
                        >
                          <div
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: "50%",
                              margin: "0 auto 18px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#D4A017",
                              background:
                                "radial-gradient(circle at 50% 35%, rgba(255,255,255,0.95), rgba(246,234,208,0.72))",
                              boxShadow:
                                "inset 0 1px 0 rgba(255,255,255,0.95), 0 10px 26px rgba(201,168,76,0.1)",
                            }}
                          >
                            {opt.icon}
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--kalpx-font-serif)",
                              fontWeight: 700,
                              fontSize: 18,
                              color: "#432104",
                              marginBottom: 6,
                            }}
                          >
                            {opt.label}
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              color: "#7B6550",
                              lineHeight: 1.35,
                            }}
                          >
                            {opt.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <p
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      color: "#8B6A43",
                      fontSize: 14,
                      textAlign: "center",
                      margin: "0 0 20px",
                    }}
                  >
                    <span style={{ color: "#E2C37F" }}>❦</span>
                    Select your energy to continue.
                    <span style={{ color: "#E2C37F" }}>❦</span>
                  </p>

                  <button
                    onClick={() => void handleProceed()}
                    disabled={selected === null}
                    style={{
                      ...goldBtn,
                      opacity: selected === null ? 0.45 : 1,
                      cursor: selected === null ? "not-allowed" : "pointer",
                    }}
                  >
                    Proceed →
                  </button>
                </>
              )}

              {error && (
                <p
                  style={{
                    color: "#e06060",
                    marginTop: 14,
                    fontSize: 14,
                    textAlign: "center",
                  }}
                >
                  {error}
                </p>
              )}
            </>
          ) : (
            <div
              style={{
                border: "1px solid rgba(225, 197, 136, 0.45)",
                borderRadius: 28,
                background: "rgba(255, 252, 247, 0.88)",
                padding: "26px 16px 20px",
                boxShadow: "0 18px 48px rgba(201,168,76,0.12)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--kalpx-font-serif)",
                  fontWeight: 700,
                  fontSize: 18,
                  color: "#C99317",
                  margin: "0 0 18px",
                }}
              >
                Mitra heard you.
              </p>

              <div
                style={{
                  background: "rgba(255,255,255,0.72)",
                  borderLeft: "4px solid rgba(212,160,23,0.45)",
                  borderRadius: 18,
                  padding: "22px 18px",
                  marginBottom: 22,
                  fontFamily: "var(--kalpx-font-serif)",
                  fontSize: 18,
                  color: "#432104",
                  lineHeight: 1.65,
                  fontStyle: "italic",
                }}
              >
                {result.copy}
              </div>

              {result.suggested_room_label && (
                <div
                  style={{
                    border: "1px solid rgba(225, 197, 136, 0.6)",
                    borderRadius: 18,
                    background: "rgba(255,251,244,0.78)",
                    padding: "20px 16px",
                    marginBottom: 22,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--kalpx-font-serif)",
                      fontWeight: 700,
                      fontSize: 17,
                      color: "#432104",
                      marginBottom: 8,
                    }}
                  >
                    {result.suggested_room_label}
                  </div>
                  {result.suggested_room_description && (
                    <div
                      style={{
                        fontSize: 15,
                        color: "#7B6550",
                        lineHeight: 1.45,
                      }}
                    >
                      {result.suggested_room_description}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleCTA}
                style={{ ...goldBtn, marginBottom: 16 }}
              >
                {getCTALabel()}
              </button>

              <button
                onClick={() => navigate("/en/mitra/tell-mitra")}
                style={{
                  width: "100%",
                  padding: "16px 0",
                  borderRadius: 18,
                  border: "1px solid rgba(225, 197, 136, 0.65)",
                  background: "rgba(255,255,255,0.6)",
                  color: "#7B6550",
                  fontSize: 17,
                  cursor: "pointer",
                  marginBottom: 16,
                }}
              >
                Tell Mitra more
              </button>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 18,
                }}
              >
                <button
                  onClick={() => {
                    setResult(null);
                    setSelected(null);
                    setError(null);
                  }}
                  style={{
                    padding: "14px 12px",
                    borderRadius: 18,
                    border: "1px solid rgba(225, 197, 136, 0.65)",
                    background: "rgba(255,255,255,0.6)",
                    color: "#7B6550",
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                >
                  Quick Check-in
                </button>
                <button
                  onClick={() => navigate("/en/mitra/quick-reset")}
                  style={{
                    padding: "14px 12px",
                    borderRadius: 18,
                    border: "1px solid rgba(225, 197, 136, 0.65)",
                    background: "rgba(255,255,255,0.6)",
                    color: "#7B6550",
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                >
                  Quick Reset
                </button>
              </div>

              <button
                onClick={() => navigate("/en/mitra")}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  color: "#8B6A43",
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                Return Home
              </button>
            </div>
          )}
        </div>
      </main>
    </MitraMobileShell>
  );
}

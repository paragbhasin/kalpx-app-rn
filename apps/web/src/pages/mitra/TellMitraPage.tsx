import { getDoorLabel, isValidRoomId } from "@kalpx/contracts";
import type { TellMitraV3Response } from "@kalpx/types";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Footer } from "../../components/layout/Footer";
import { Header } from "../../components/layout/Header";
import { MobileBottomNav } from "../../components/layout/MobileBottomNav";
import { executeAction } from "../../engine/actionExecutor";
import { postTellMitraV3 } from "../../engine/mitraApi";
import type { AppDispatch } from "../../store";
import { useScreenState } from "../../store/screenSlice";

const DOOR_ROUTES: Record<string, string> = {
  my_rhythm: "/en/mitra/rhythm",
  inner_path: "/en/mitra/inner-path",
  quick_reset: "/en/mitra/quick-reset",
  tell_mitra: "/en/mitra/tell-mitra",
};

type ResultScreen = "none" | "navigate_to_room" | "navigate_to_door" | "provide_wisdom_inline" | "fallback";

export function TellMitraPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const screenState = useScreenState();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TellMitraV3Response | null>(null);
  const [screen, setScreen] = useState<ResultScreen>("none");

  async function submit() {
    const trimmed = text.trim();
    if (!trimmed) { setError("Please share what's on your mind"); return; }
    if (trimmed.length > 1000) { setError("Please keep it under 1000 characters"); return; }
    setError(null);
    setSubmitting(true);
    try {
      const resp = await postTellMitraV3({
        text: trimmed,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        source_surface: "tell_mitra_page_web",
      });
      setResult(resp);
      if (resp.suggested_action === "navigate_to_room" && isValidRoomId(resp.suggested_room_id)) {
        setScreen("navigate_to_room");
      } else if (resp.suggested_action === "navigate_to_door" && resp.door) {
        setScreen("navigate_to_door");
      } else if (resp.suggested_action === "provide_wisdom_inline") {
        setScreen("provide_wisdom_inline");
      } else {
        setScreen("fallback");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const CARD: React.CSSProperties = {
    border: "1px solid rgba(201,168,76,0.22)",
    borderRadius: 18,
    background: "rgba(250,245,240,0.92)",
    padding: "20px 20px",
    boxShadow: "0 8px 20px rgba(67,33,4,0.08)",
    marginBottom: 14,
  };

  const GOLD_BTN: React.CSSProperties = {
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
  };

  const GHOST_BTN: React.CSSProperties = {
    width: "100%",
    padding: "12px 0",
    borderRadius: 12,
    border: "1px solid rgba(201,168,76,0.35)",
    background: "transparent",
    color: "#7B6550",
    fontSize: 14,
    cursor: "pointer",
  };

  return (
    <div style={{ minHeight: "100dvh", background: "#FFF8EF", display: "flex", flexDirection: "column" }}>
      <Header transparent />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px calc(92px + env(safe-area-inset-bottom))" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <button
            onClick={() => navigate("/en/mitra")}
            style={{ background: "none", border: "none", color: "#C99317", fontSize: 14, cursor: "pointer", marginBottom: 16, padding: 0 }}
          >
            ← Back
          </button>

          {/* Input section — always visible unless a result screen is shown */}
          {screen === "none" && (
            <div style={CARD}>
              <div style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 20, color: "#432104", marginBottom: 4 }}>
                Tell Mitra
              </div>
              <div style={{ fontSize: 14, color: "#7B6550", marginBottom: 14 }}>
                Share what you're carrying right now.
              </div>
              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value); if (error) setError(null); }}
                maxLength={1000}
                rows={5}
                placeholder="What's on your mind…"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  border: "1px solid rgba(201,168,76,0.3)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  fontSize: 15,
                  fontFamily: "var(--kalpx-font-serif)",
                  color: "#432104",
                  background: "rgba(255,252,248,0.9)",
                  resize: "vertical",
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: "#A08060" }}>{text.length} / 1000</span>
                {error && <span style={{ fontSize: 13, color: "#e06060" }}>{error}</span>}
              </div>
              <button
                onClick={() => void submit()}
                disabled={submitting}
                style={{ ...GOLD_BTN, opacity: submitting ? 0.6 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
              >
                {submitting ? "Sending…" : "Tell Mitra"}
              </button>
              <button
                onClick={() => navigate("/en/mitra/checkin-quick")}
                style={{ ...GHOST_BTN, marginTop: 10 }}
              >
                Quick Check-in instead
              </button>
            </div>
          )}

          {/* navigate_to_room */}
          {screen === "navigate_to_room" && result && (
            <div style={CARD}>
              {result.response_copy && (
                <div style={{
                  background: "rgba(255,253,250,0.96)",
                  borderLeft: "3px solid rgba(201,168,76,0.6)",
                  borderRadius: "0 12px 12px 0",
                  padding: "20px 24px",
                  marginBottom: 24,
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 20,
                  lineHeight: 1.7,
                  color: "#432104",
                  fontStyle: "italic",
                }}>
                  {result.response_copy}
                </div>
              )}
              <div style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
                <div style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 16, color: "#432104" }}>
                  {result.suggested_room_label}
                </div>
                {result.suggested_room_description && (
                  <div style={{ fontSize: 14, color: "#7B6550", marginTop: 4 }}>{result.suggested_room_description}</div>
                )}
              </div>
              <button
                onClick={() => void executeAction(
                  { type: 'enter_room', payload: { room_id: result.suggested_room_id, source: 'tell_mitra' } },
                  { dispatch, screenData: screenState.screenData, currentStateId: 'tell_mitra' }
                )}
                style={GOLD_BTN}
              >
                Go to {result.suggested_room_label || "Room"}
              </button>
              <button onClick={() => { setScreen("none"); setText(""); }} style={{ ...GHOST_BTN, marginTop: 10 }}>
                Ask something else
              </button>
            </div>
          )}

          {/* navigate_to_door */}
          {screen === "navigate_to_door" && result && (
            <div style={CARD}>
              {result.response_copy && (
                <div style={{
                  background: "rgba(255,253,250,0.96)",
                  borderLeft: "3px solid rgba(201,168,76,0.6)",
                  borderRadius: "0 12px 12px 0",
                  padding: "20px 24px",
                  marginBottom: 24,
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 20,
                  lineHeight: 1.7,
                  color: "#432104",
                  fontStyle: "italic",
                }}>
                  {result.response_copy}
                </div>
              )}
              <button
                onClick={() => { if (result.door) navigate(DOOR_ROUTES[result.door] ?? "/en/mitra"); }}
                style={GOLD_BTN}
              >
                Open {result.door ? getDoorLabel(result.door) : "Door"}
              </button>
              <button onClick={() => { setScreen("none"); setText(""); }} style={{ ...GHOST_BTN, marginTop: 10 }}>
                Ask something else
              </button>
            </div>
          )}

          {/* provide_wisdom_inline */}
          {screen === "provide_wisdom_inline" && result && (
            <div style={CARD}>
              <div style={{
                background: "rgba(255,253,250,0.96)",
                borderLeft: "3px solid rgba(201,168,76,0.6)",
                borderRadius: "0 12px 12px 0",
                padding: "20px 24px",
                marginBottom: 24,
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 20,
                lineHeight: 1.7,
                color: "#432104",
                fontStyle: "italic",
              }}>
                {result.response_copy}
              </div>
              <button onClick={() => navigate("/en/mitra")} style={GOLD_BTN}>
                Return Home
              </button>
              <button onClick={() => { setScreen("none"); setText(""); }} style={{ ...GHOST_BTN, marginTop: 10 }}>
                Ask something else
              </button>
            </div>
          )}

          {/* fallback / none */}
          {screen === "fallback" && result && (
            <div style={CARD}>
              {result.response_copy ? (
                <div style={{
                  background: "rgba(255,253,250,0.96)",
                  borderLeft: "3px solid rgba(201,168,76,0.6)",
                  borderRadius: "0 12px 12px 0",
                  padding: "20px 24px",
                  marginBottom: 24,
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 20,
                  lineHeight: 1.7,
                  color: "#432104",
                  fontStyle: "italic",
                }}>
                  {result.response_copy}
                </div>
              ) : (
                <p style={{ fontSize: 15, color: "#7B6550", marginBottom: 16 }}>
                  I'm here with you. Let me help you find where to go next.
                </p>
              )}
              <button onClick={() => navigate("/en/mitra")} style={GOLD_BTN}>
                Return Home
              </button>
              <button onClick={() => { setScreen("none"); setText(""); }} style={{ ...GHOST_BTN, marginTop: 10 }}>
                Try again
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

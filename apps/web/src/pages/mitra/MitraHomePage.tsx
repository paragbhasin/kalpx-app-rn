import { AUTH_KEYS } from "@kalpx/api-client";
import { DOOR_LABELS, getDoorLabel, isValidRoomId } from "@kalpx/contracts";
import { Heart, MessageCircle, MoveRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { RoomEntrySheet } from "../../components/blocks/room/RoomEntrySheet";
import { Footer } from "../../components/layout/Footer";
import { Header } from "../../components/layout/Header";
import { MobileBottomNav } from "../../components/layout/MobileBottomNav";
import { executeAction } from "../../engine/actionExecutor";
import { getJourneyHome, getMitraHomeV3, postTellMitraV3 } from "../../engine/mitraApi";
import { useGuestIdentity } from "../../hooks/useGuestIdentity";
import {
  mapJourneyEntryViewPath,
  useJourneyEntryView,
} from "../../hooks/useJourneyEntryView";
import { useJourneyStatus } from "../../hooks/useJourneyStatus";
import { WEB_ENV } from "../../lib/env";
import { webNavigate } from "../../lib/webRouter";
import type { AppDispatch, RootState } from "../../store";
import { setHomeData } from "../../store/doorSlice";
import { useScreenState } from "../../store/screenSlice";

type JourneyHomeAction = {
  type?: string;
  payload?: Record<string, any>;
};

type JourneyHomeChip = {
  id: string;
  label: string;
  icon?: string | null;
  action?: JourneyHomeAction;
};

type JourneyHomeResponse = {
  response_type?: "render_home" | "route_to_moment" | "fallback";
  headline?: string;
  body_lines?: string[];
  h2_prompt?: string;
  primary_cta?: {
    id?: string;
    label?: string;
    icon?: string | null;
    action?: JourneyHomeAction;
  } | null;
  chips?: JourneyHomeChip[];
  action?: JourneyHomeAction;
};

function iconForHomeChip(icon?: string | null) {
  if (icon === "chat") return <MessageCircle size={22} strokeWidth={1.9} />;
  if (icon === "heart" || icon === "hands_heart") {
    return <Heart size={22} strokeWidth={1.9} />;
  }
  return <span style={{ width: 22, height: 22, display: "inline-block" }} />;
}

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#FFF8EF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          border: "2px solid var(--kalpx-cta)",
          borderTopColor: "transparent",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function MitraHomePage() {
  useGuestIdentity();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const screenState = useScreenState();
  const { loading, error, hasActiveJourney, rawStatus, refetch } =
    useJourneyStatus();
  const {
    loading: entryLoading,
    viewKey,
    error: entryError,
  } = useJourneyEntryView(hasActiveJourney === true);
  const [journeyHome, setJourneyHome] = useState<JourneyHomeResponse | null>(
    null,
  );
  const [journeyHomeLoading, setJourneyHomeLoading] = useState(false);
  const [roomSheetOpen, setRoomSheetOpen] = useState(false);

  // Four-Door V3 state
  const homeData = useSelector((s: RootState) => s.door.homeData);
  const [fourDoorLoading, setFourDoorLoading] = useState(false);
  const [fourDoorError, setFourDoorError] = useState<string | null>(null);

  // Tell Mitra input state
  const [inputText, setInputText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tellMitraError, setTellMitraError] = useState<string | null>(null);
  const [resultCopy, setResultCopy] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const actionContext = useMemo(
    () => ({
      dispatch,
      screenData: screenState.screenData,
      currentStateId: screenState.currentStateId || "day_active",
    }),
    [dispatch, screenState.currentStateId, screenState.screenData],
  );

  const handleJourneyHomeAction = useCallback(
    async (action?: JourneyHomeAction) => {
      if (!action?.type) return;
      if (action.type === "open_support_path") {
        setRoomSheetOpen(true);
        return;
      }
      if (action.type === "continue_practice") {
        webNavigate("/en/mitra/dashboard");
        return;
      }
      if (action.type === "start_support") {
        await executeAction({ type: "initiate_trigger" }, actionContext);
        return;
      }
      await executeAction(action, actionContext);
    },
    [actionContext],
  );

  // Helper: show a brief toast message
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Four-Door V3 fetch
  useEffect(() => {
    let cancelled = false;
    if (hasActiveJourney !== true) return;
    if (homeData) return; // already hydrated

    setFourDoorLoading(true);
    setFourDoorError(null);
    void getMitraHomeV3()
      .then((data) => {
        if (cancelled) return;
        dispatch(setHomeData(data));
      })
      .catch(() => {
        if (!cancelled) setFourDoorError("Could not load your home. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setFourDoorLoading(false);
      });

    return () => { cancelled = true; };
  }, [hasActiveJourney, homeData, dispatch]);

  // Tell Mitra submit
  const handleTellMitraSubmit = useCallback(async () => {
    const text = inputText.trim();
    if (!text) {
      setTellMitraError("Please share what's on your mind");
      return;
    }
    if (text.length > 1000) {
      setTellMitraError("Please keep it under 1000 characters");
      return;
    }
    setTellMitraError(null);
    setResultCopy(null);
    setIsSubmitting(true);
    try {
      const resp = await postTellMitraV3({
        text,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        source_surface: "tell_mitra_web",
      });
      if (resp.response_copy) {
        setResultCopy(resp.response_copy);
      }
      if (resp.suggested_action === "navigate_to_room" && isValidRoomId(resp.suggested_room_id)) {
        navigate(`/en/mitra/room/${resp.suggested_room_id}`);
      } else if (resp.suggested_action === "navigate_to_door" && resp.door) {
        showToast(getDoorLabel(resp.door));
      }
      // provide_wisdom_inline: resultCopy already set above
    } catch {
      setTellMitraError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [inputText, navigate, showToast]);

  useEffect(() => {
    let cancelled = false;
    if (hasActiveJourney !== true) {
      setJourneyHome(null);
      setJourneyHomeLoading(false);
      return;
    }

    setJourneyHomeLoading(true);
    void getJourneyHome({
      locale: "en",
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
    })
      .then(async (result) => {
        if (cancelled) return;
        if (
          result?.response_type === "route_to_moment" &&
          result.action?.type
        ) {
          await handleJourneyHomeAction(result.action);
          return;
        }
        setJourneyHome(result);
      })
      .finally(() => {
        if (!cancelled) setJourneyHomeLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hasActiveJourney, handleJourneyHomeAction]);

  if (
    loading ||
    (hasActiveJourney === true && (journeyHomeLoading || fourDoorLoading)) ||
    (hasActiveJourney === true &&
      (entryLoading || (viewKey === null && !entryError)))
  ) {
    return <LoadingScreen />;
  }

  // ── Four-Door Home (S03) ─────────────────────────────────────────────────
  if (hasActiveJourney === true && (homeData || fourDoorError !== null)) {
    const doorStates = homeData?.door_states;
    const innerPathSummary = homeData?.inner_path_summary;

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
        <Header transparent />
        {/* Toast */}
        {toastMessage && (
          <div
            style={{
              position: "fixed",
              top: 80,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(67,33,4,0.92)",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: 12,
              zIndex: 9999,
              fontSize: 15,
              fontFamily: "var(--kalpx-font-serif)",
            }}
          >
            {toastMessage}
          </div>
        )}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "24px 16px calc(92px + env(safe-area-inset-bottom))",
          }}
        >
          <div style={{ width: "100%", maxWidth: 420 }}>
            {fourDoorError && (
              <p style={{ color: "#e06060", textAlign: "center", marginBottom: 16, fontSize: 15 }}>
                {fourDoorError}
              </p>
            )}

            {/* Four Door Cards */}
            {doorStates && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
                {/* My Rhythm */}
                <button
                  onClick={() => showToast("Coming in next phase")}
                  style={{
                    width: "100%",
                    border: "1px solid rgba(201,168,76,0.22)",
                    borderRadius: 18,
                    background: "rgba(250,245,240,0.92)",
                    padding: "18px 22px",
                    boxShadow: "0 12px 24px rgba(67,33,4,0.10)",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 17, color: "#432104", marginBottom: 4 }}>
                    {DOOR_LABELS.my_rhythm}
                  </div>
                  {doorStates.my_rhythm?.state === "no_rhythm" ? (
                    <div style={{ color: "#7B6550", fontSize: 14 }}>{doorStates.my_rhythm.cta}</div>
                  ) : (
                    <div style={{ color: "#7B6550", fontSize: 14 }}>{doorStates.my_rhythm?.subtitle}</div>
                  )}
                </button>

                {/* Inner Path */}
                <button
                  onClick={() => showToast("Coming in next phase")}
                  style={{
                    width: "100%",
                    border: "1px solid rgba(201,168,76,0.22)",
                    borderRadius: 18,
                    background: "rgba(250,245,240,0.92)",
                    padding: "18px 22px",
                    boxShadow: "0 12px 24px rgba(67,33,4,0.10)",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 17, color: "#432104", marginBottom: 4 }}>
                    {DOOR_LABELS.inner_path}
                  </div>
                  {innerPathSummary?.has_active_path ? (
                    <div style={{ color: "#7B6550", fontSize: 14 }}>{innerPathSummary.path_title ?? doorStates.inner_path?.cta}</div>
                  ) : (
                    <div style={{ color: "#7B6550", fontSize: 14 }}>{doorStates.inner_path?.subtitle}</div>
                  )}
                </button>

                {/* Quick Reset */}
                <button
                  onClick={() => showToast("Coming in next phase")}
                  style={{
                    width: "100%",
                    border: "1px solid rgba(201,168,76,0.22)",
                    borderRadius: 18,
                    background: "rgba(250,245,240,0.92)",
                    padding: "18px 22px",
                    boxShadow: "0 12px 24px rgba(67,33,4,0.10)",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 17, color: "#432104", marginBottom: 4 }}>
                    {DOOR_LABELS.quick_reset}
                  </div>
                  <div style={{ color: "#7B6550", fontSize: 14 }}>{doorStates.quick_reset?.subtitle}</div>
                </button>

                {/* Tell Mitra — header card only; input surface rendered below */}
                <div
                  style={{
                    width: "100%",
                    border: "1px solid rgba(201,168,76,0.22)",
                    borderRadius: 18,
                    background: "rgba(250,245,240,0.92)",
                    padding: "18px 22px",
                    boxShadow: "0 12px 24px rgba(67,33,4,0.10)",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 17, color: "#432104" }}>
                    {DOOR_LABELS.tell_mitra}
                  </div>
                </div>
              </div>
            )}

            {/* Tell Mitra Input Surface (always visible) */}
            <div
              style={{
                background: "rgba(250,245,240,0.95)",
                border: "1px solid rgba(201,168,76,0.25)",
                borderRadius: 18,
                padding: "20px 18px",
                boxShadow: "0 8px 20px rgba(67,33,4,0.08)",
                marginBottom: 16,
              }}
            >
              <div style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 600, fontSize: 16, color: "#432104", marginBottom: 12 }}>
                What's on your mind?
              </div>
              <textarea
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  if (tellMitraError) setTellMitraError(null);
                }}
                maxLength={1000}
                rows={4}
                placeholder="Share what you're carrying right now…"
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6, marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: "#A08060" }}>
                  {inputText.length} / 1000
                </div>
                {tellMitraError && (
                  <div style={{ fontSize: 13, color: "#e06060" }}>{tellMitraError}</div>
                )}
              </div>
              <button
                onClick={() => void handleTellMitraSubmit()}
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: 14,
                  padding: "14px 20px",
                  background: isSubmitting
                    ? "rgba(201,147,23,0.5)"
                    : "linear-gradient(90deg, #C99317 0%, #E0AE21 50%, #C99317 100%)",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {isSubmitting ? (
                  <>
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(255,255,255,0.5)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        display: "inline-block",
                      }}
                    />
                    <span>Sending…</span>
                  </>
                ) : (
                  <span>Tell Mitra</span>
                )}
              </button>
              {resultCopy && (
                <div
                  style={{
                    marginTop: 14,
                    padding: "14px 16px",
                    background: "rgba(201,168,76,0.08)",
                    border: "1px solid rgba(201,168,76,0.2)",
                    borderRadius: 12,
                    color: "#5A3515",
                    fontFamily: "var(--kalpx-font-serif)",
                    fontSize: 15,
                    lineHeight: 1.6,
                  }}
                >
                  {resultCopy}
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer transparent />
        <MobileBottomNav transparent />
      </div>
    );
  }

  if (
    hasActiveJourney === true &&
    journeyHome?.response_type === "render_home"
  ) {
    const headline = journeyHome.headline || "Welcome back.";
    const bodyLines = journeyHome.body_lines || [];
    const prompt = journeyHome.h2_prompt || "";
    const primaryCta = journeyHome.primary_cta || null;
    const chips = journeyHome.chips || [];

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
        <Header transparent />
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "24px 16px calc(92px + env(safe-area-inset-bottom))",
          }}
        >
          <div style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>
            <h1
              style={{
                margin: "0 0 20px",
                color: "#432104",
                fontFamily: "var(--kalpx-font-serif)",
                fontSize: 32,
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              {headline}
            </h1>
            {bodyLines.map((line, index) => (
              <p
                key={`${line}-${index}`}
                style={{
                  margin:
                    index === bodyLines.length - 1 ? "0 0 10px" : "0 0 10px",
                  color: "#7B6550",
                  fontFamily: "var(--kalpx-font-serif)",
                  fontSize: 18,
                  lineHeight: 1.55,
                }}
              >
                {line}
              </p>
            ))}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                margin: "30px 0 18px",
              }}
            >
              <div
                style={{
                  width: 130,
                  maxWidth: "30%",
                  height: 1,
                  background: "rgba(201,168,76,0.35)",
                }}
              />
              <span style={{ color: "#d7b45d", fontSize: 12 }}>◈</span>
              <div
                style={{
                  width: 130,
                  maxWidth: "30%",
                  height: 1,
                  background: "rgba(201,168,76,0.35)",
                }}
              />
            </div>

            {!!prompt && (
              <p
                style={{
                  margin: "0 0 24px",
                  color: "#432104",
                  fontFamily: "var(--kalpx-font-serif)",
                  fontSize: 22,
                  lineHeight: 1.35,
                }}
              >
                {prompt}
              </p>
            )}

            {primaryCta?.label && (
              <button
                onClick={() => void handleJourneyHomeAction(primaryCta.action)}
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: 18,
                  padding: "18px 20px",
                  background:
                    "linear-gradient(90deg, #C99317 0%, #E0AE21 50%, #C99317 100%)",
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  boxShadow: "0 12px 24px rgba(201,147,23,0.28)",
                  marginBottom: 18,
                }}
              >
                <span style={{ width: 24 }} />
                <span>{primaryCta.label}</span>
                <MoveRight size={24} strokeWidth={2.2} />
              </button>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {chips.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => void handleJourneyHomeAction(chip.action)}
                  style={{
                    width: "100%",
                    borderRadius: 18,
                    border: "1px solid rgba(201,168,76,0.22)",
                    background: "rgba(250,245,240,0.92)",
                    padding: "18px 22px",
                    boxShadow: "0 12px 24px rgba(67,33,4,0.10)",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    color: "#5A3515",
                    fontFamily: "var(--kalpx-font-serif)",
                    fontSize: 16,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span style={{ display: "flex", color: "#6B4316" }}>
                    {iconForHomeChip(chip.icon)}
                  </span>
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>
        </main>

        {roomSheetOpen && (
          <RoomEntrySheet
            onClose={() => setRoomSheetOpen(false)}
            onEnterRoom={(roomId) => {
              setRoomSheetOpen(false);
              void executeAction(
                {
                  type: "enter_room",
                  payload: { room_id: roomId, source: "home_support_path" },
                },
                actionContext,
              );
            }}
          />
        )}

        <Footer transparent />
        <MobileBottomNav transparent />
      </div>
    );
  }

  if (hasActiveJourney === true) {
    return (
      <Navigate to={mapJourneyEntryViewPath(viewKey || "daily_view")} replace />
    );
  }

  if (
    rawStatus?.hasReentryPath === true ||
    rawStatus?.has_reentry_path === true ||
    rawStatus?.welcomeBack === true ||
    rawStatus?.reentryTarget === "welcome_back_surface"
  ) {
    return <Navigate to="/en/mitra/welcome-back" replace />;
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
      <Header transparent />
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          padding: "0 24px calc(72px + env(safe-area-inset-bottom))",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 380,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            paddingTop: 30,
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              flex: 1,
              minHeight: 0,
              paddingBottom: 20,
            }}
          >
            <div
              style={{
                color: "#432104",
                fontSize: 20,
                fontWeight: 300,
                fontFamily: "var(--kalpx-font-serif)",
              }}
            >
              "In this path, no effort is ever lost."
            </div>
            <div
              style={{
                color: "#432104",
                fontSize: 16,
                fontWeight: 300,
                fontFamily: "var(--kalpx-font-serif)",
              }}
            >
              — Bhagavad Gita 6.5
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(199,162,88,0.4)",
                  maxWidth: 60,
                }}
              />
              <span style={{ fontSize: 16, color: "#c7a258" }}>◆</span>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(199,162,88,0.4)",
                  maxWidth: 60,
                }}
              />
            </div>

            <h1
              style={{
                fontSize: 32,
                fontWeight: 600,
                color: "#432104",
                marginBottom: 8,
                fontFamily: "var(--kalpx-font-serif)",
              }}
            >
              KalpX Mitra
            </h1>
            <p
              style={{
                color: "#432104",
                marginBottom: 8,
                lineHeight: 1,
                fontWeight: 500,
                fontSize: 20,
              }}
            >
              Your daily companion for life
            </p>
            <p
              style={{
                color: "#432104",
                fontSize: 18,
                lineHeight: 1.6,
              }}
            >
              Grounded in timeless Sanatan wisdom.
            </p>
            <p
              style={{
                color: "#432104",
                fontSize: 18,
                lineHeight: 1.6,
                marginTop: 12,
                marginBottom: 0,
              }}
            >
              A calmer, clearer way to navigate life - one day at a time.
            </p>

            {error && (
              <p
                style={{
                  color: "#e06060",
                  fontSize: 15,
                  marginBottom: 16,
                  marginTop: 12,
                }}
              >
                Could not check status.{" "}
                <button
                  onClick={refetch}
                  style={{
                    background: "none",
                    color: "#e06060",
                    cursor: "pointer",
                    fontSize: 15,
                  }}
                >
                  Retry
                </button>
              </p>
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              width: "100%",
              alignItems: "center",
              marginTop: "auto",
              paddingTop: 8,
              paddingBottom: 94,
            }}
          >
            <img
              src="/new_home_lotus.png"
              alt=""
              style={{
                width: "62%",
                maxWidth: 270,
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
            <Link
              to="/en/mitra/start"
              style={{
                display: "block",
                padding: "10px",
                background: "linear-gradient(to right, #E5D4CA, #F5EDEA)",
                color: "#432104",
                borderRadius: 28,
                fontWeight: 600,
                width: "70%",
                fontSize: 16,
                textAlign: "center",
                textDecoration: "none",
                border: "1px solid rgba(199,162,88,0.3)",
              }}
              className="shadow-2xl flex justify-center align"
            >
              Begin your journey →
            </Link>
          </div>
        </div>

        {WEB_ENV.isDev &&
          typeof window !== "undefined" &&
          window.location.search.includes("debug") && (
            <div
              style={{
                margin: "16px 0",
                padding: "12px 16px",
                background: "rgba(0,0,0,0.5)",
                borderRadius: 8,
                fontSize: 11,
                fontFamily: "monospace",
                color: "#aaa",
                textAlign: "left",
                width: "100%",
                maxWidth: 360,
              }}
            >
              <div>API: {WEB_ENV.apiBaseUrl}</div>
              <div>
                guestUUID: {localStorage.getItem(AUTH_KEYS.guestUUID) ?? "none"}
              </div>
              <div>
                access_token:{" "}
                {localStorage.getItem(AUTH_KEYS.accessToken)
                  ? "present"
                  : "none"}
              </div>
            </div>
          )}
      </main>
      <Footer transparent />
      <MobileBottomNav transparent />
    </div>
  );
}

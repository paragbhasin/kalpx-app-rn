import { AUTH_KEYS } from "@kalpx/api-client";
import {
  DOOR_LABELS,
  type MitraHomeSegment,
  QUICK_CHANT_HAS_MANTRA_SUBTITLE,
  QUICK_CHANT_HISTORY_ONLY_SUBTITLE,
  QUICK_CHANT_NO_STATE_SUBTITLE,
  SEGMENT_INNER_PATH_NO_STATE_SUBTITLE,
  SEGMENT_RHYTHM_NO_STATE_SUBTITLE,
  TELL_MITRA_ACTIVE_PATH_SUBTITLE,
  TELL_MITRA_DEFAULT_SUBTITLE,
  TELL_MITRA_HAS_HISTORY_SUBTITLE,
} from "@kalpx/contracts";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Footer } from "../../components/layout/Footer";
import { Header } from "../../components/layout/Header";
import { MobileBottomNav } from "../../components/layout/MobileBottomNav";
import {
  getMitraHomeV3,
  postPranaAcknowledge,
  postPranaAcknowledgeDismiss,
} from "../../engine/mitraApi";
import { useGuestIdentity } from "../../hooks/useGuestIdentity";
import {
  mapJourneyEntryViewPath,
  useJourneyEntryView,
} from "../../hooks/useJourneyEntryView";
import { useJourneyStatus } from "../../hooks/useJourneyStatus";
import { useScrollDirection } from "../../hooks/useScrollDirection";
import { WEB_ENV } from "../../lib/env";
import type { AppDispatch, RootState } from "../../store";
import { setHomeData } from "../../store/doorSlice";
import { useScreenState } from "../../store/screenSlice";

const ONBOARDING_TURN_1_PATH =
  "/en/mitra/onboarding?containerId=welcome_onboarding&stateId=turn_1";

function getRhythmTimeBand(): "morning" | "afternoon" | "night" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 20) return "afternoon";
  return "night";
}

const FEELING_OPTIONS = ["Agitated", "Drained", "Steady", "Open"] as const;

type FeelingOption = (typeof FEELING_OPTIONS)[number];

function mapFeelingToPranaType(feeling: FeelingOption): string {
  if (feeling === "Open") return "energized";
  if (feeling === "Steady") return "balanced";
  return feeling.toLowerCase();
}

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
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
  const { shouldHideChrome } = useScrollDirection();
  const [selectedFeeling, setSelectedFeeling] = useState<
    (typeof FEELING_OPTIONS)[number] | null
  >(null);
  const [feelingLoading, setFeelingLoading] = useState(false);
  const [dismissingCheckin, setDismissingCheckin] = useState(false);
  const [pendingPranaMessage, setPendingPranaMessage] = useState<string | null>(
    null,
  );
  const { loading, error, hasActiveJourney, rawStatus, refetch } =
    useJourneyStatus();
  const {
    loading: entryLoading,
    viewKey,
    error: entryError,
  } = useJourneyEntryView(hasActiveJourney === true);

  // Four-Door V3 state
  const homeData = useSelector((s: RootState) => s.door.homeData);
  const [fourDoorLoading, setFourDoorLoading] = useState(false);
  const [fourDoorError, setFourDoorError] = useState<string | null>(null);

  // T4 — first-visit orientation gate (localStorage, never overwrites on error/null segment)
  const FOUR_DOOR_VISITED_KEY = "mitra_four_door_home_visited_v1";
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(false);
  useEffect(() => {
    if (!localStorage.getItem(FOUR_DOOR_VISITED_KEY)) {
      setIsFirstVisit(true);
    }
  }, []);

  // Computed once per render — guards both the fetch and the loading check below.
  const isAuthed = !!(
    localStorage.getItem(AUTH_KEYS.accessToken) ||
    localStorage.getItem("access_token")
  );

  // Four-Door V3 fetch — runs once on mount for all authenticated users.
  // homeData excluded from deps intentionally: re-fetches only if user_surface_state
  // is absent (stale Redux cache). Explicit refreshes go through refetchHome().
  useEffect(() => {
    let cancelled = false;
    if (!isAuthed) return;
    if (homeData?.user_surface_state) return; // already hydrated with stream-o data

    setFourDoorLoading(true);
    setFourDoorError(null);
    void getMitraHomeV3()
      .then((data) => {
        if (cancelled) return;
        dispatch(setHomeData(data));
      })
      .catch(() => {
        if (!cancelled)
          setFourDoorError("Could not load your home. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setFourDoorLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed, dispatch]);

  // T4 — write visited key once after first successful four-door render for new-segment users
  useEffect(() => {
    if (
      isFirstVisit &&
      homeData?.user_surface_state?.segment === "new" &&
      !fourDoorError
    ) {
      localStorage.setItem(FOUR_DOOR_VISITED_KEY, "1");
    }
  }, [isFirstVisit, homeData?.user_surface_state?.segment, fourDoorError]);

  async function refetchHome() {
    try {
      const data = await getMitraHomeV3({ forceFresh: true });
      dispatch(setHomeData(data));
    } catch {}
  }

  async function handleFeelingSelect(feeling: FeelingOption) {
    const pranaType = mapFeelingToPranaType(feeling);
    setSelectedFeeling(feeling);
    setFeelingLoading(true);
    try {
      await postPranaAcknowledge({
        pranaType,
        focus:
          (screenState.screenData.scan_focus as string) ||
          (screenState.screenData.active_focus as string) ||
          "peacecalm",
        subFocus:
          (screenState.screenData.prana_baseline_selection as string) || "",
        depth:
          (screenState.screenData.routine_depth as string) ||
          (screenState.screenData.routine_setup as string) ||
          "standard",
        dayNumber: screenState.screenData.day_number || 1,
        journeyId: screenState.screenData.journey_id || null,
        round: 2,
        locale: (screenState.screenData.locale as string) || "en",
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
      });
      if (pranaType === "agitated" || pranaType === "drained") {
        const msg = pranaType === "agitated" ? "I am agitated" : "I am drained";
        setPendingPranaMessage(msg);
        await refetchHome();
      } else {
        await refetchHome();
      }
    } catch {
      if (WEB_ENV.isDev) {
        console.warn("[MitraHomePage] feeling support fetch failed");
      }
    } finally {
      setFeelingLoading(false);
    }
  }

  async function handleCheckinDismiss() {
    setPendingPranaMessage(null);
    setDismissingCheckin(true);
    try {
      await postPranaAcknowledgeDismiss();
      await refetchHome();
    } catch {
    } finally {
      setDismissingCheckin(false);
    }
  }

  // Derive segment from loaded home data (Stream O)
  const segment = (homeData?.user_surface_state?.segment ??
    null) as MitraHomeSegment | null;
  const hasAnyState =
    (!!segment && segment !== "new") || hasActiveJourney === true;

  // Block on LoadingScreen only while we lack enough data to make a render decision.
  // When the user has an active journey, also wait for entry-view so we never
  // flash the four-door home before a checkpoint redirect fires.
  const homeReady = !!homeData?.user_surface_state;
  if (
    fourDoorLoading ||
    (isAuthed && !homeData && !fourDoorError) ||
    (!homeReady && loading) ||
    (hasActiveJourney === true && entryLoading)
  ) {
    return <LoadingScreen />;
  }

  // Entry-view redirects for active-journey users (checkpoint / welcome-back / onboarding)
  // daily_view falls through to the four-door companion home (Stream O)
  if (hasActiveJourney === true && viewKey && viewKey !== "daily_view") {
    const redirectPath = mapJourneyEntryViewPath(viewKey);
    if (redirectPath) return <Navigate to={redirectPath} replace />;
  }

  // ── Four-Door Home — active journey or partial state (Stream O) ──────────
  if (hasAnyState && (homeData || fourDoorError !== null)) {
    const doorStates = homeData?.door_states;
    const innerPathSummary = homeData?.inner_path_summary;
    const greeting = homeData?.greeting;
    const hasRhythm = homeData?.companion_rhythm?.has_rhythm === true;
    const hasMantra =
      homeData?.user_surface_state?.has_quick_chant_mantra === true;
    const hasQuickChantHistory =
      homeData?.user_surface_state?.has_quick_chant_history === true;
    const hasTMHistory =
      homeData?.user_surface_state?.has_tell_mitra_history === true;
    const hasIP = homeData?.user_surface_state?.has_inner_path === true;
    const myRhythmTarget = hasRhythm
      ? "/en/mitra/rhythm"
      : "/en/mitra/rhythm/setup";

    // My Rhythm: prefer backend summary label, then first item in current time-band slot, then door state
    const rhythmBand = getRhythmTimeBand();
    const greetingHeadline = greeting?.headline || "";
    const isNightGreeting = /good\s*night|night/i.test(greetingHeadline);
    const greetingImageSrc = isNightGreeting
      ? "/night-home.png"
      : "/imgsun.png";
    const greetingTextColor = isNightGreeting ? "#FFFFFF" : "#432104";
    const rhythmSlot = homeData?.companion_rhythm?.[rhythmBand];

    // State-aware My Rhythm subtitle — time + completion aware
    const cr = homeData?.companion_rhythm;
    const hasMorning = (cr?.morning?.items?.length ?? 0) > 0;
    const hasAfternoon = (cr?.afternoon?.items?.length ?? 0) > 0;
    const hasNight = (cr?.night?.items?.length ?? 0) > 0;
    const morningDone = (cr as any)?.morning_done ?? false;
    const afternoonDone = (cr as any)?.afternoon_done ?? false;
    const nightDone = (cr as any)?.night_done ?? false;
    const allRhythmDone =
      (!hasMorning || morningDone) &&
      (!hasAfternoon || afternoonDone) &&
      (!hasNight || nightDone);
    let rhythmSubtitle: string;
    if (!hasRhythm) {
      rhythmSubtitle = segment
        ? SEGMENT_RHYTHM_NO_STATE_SUBTITLE[segment]
        : "Build a gentle daily rhythm";
    } else if (allRhythmDone && (hasMorning || hasAfternoon || hasNight)) {
      rhythmSubtitle = "Your rhythm has been held today";
    } else if (hasMorning && !morningDone) {
      rhythmSubtitle = "Begin with your morning rhythm";
    } else if (hasAfternoon && !afternoonDone) {
      rhythmSubtitle =
        hasMorning && morningDone
          ? "Morning held · return at midday"
          : "Return with your afternoon rhythm";
    } else if (hasNight && !nightDone) {
      rhythmSubtitle = hasAfternoon
        ? "Afternoon held · close gently tonight"
        : "Close the day with your night rhythm";
    } else {
      rhythmSubtitle =
        homeData?.my_rhythm_summary?.next_practice_label ??
        doorStates?.my_rhythm?.subtitle ??
        "";
    }

    // Inner Path: day progress + triad held count
    let innerPathSubtitle: string;
    if (innerPathSummary?.has_active_path) {
      const dayLine = `Day ${innerPathSummary.day_number} of ${innerPathSummary.total_days}`;
      const heldCount = (innerPathSummary as any).today_held_count ?? 0;
      const practiceHeld =
        (innerPathSummary as any).today_practice_held ?? false;
      if (practiceHeld || heldCount >= 3) {
        innerPathSubtitle = `${dayLine} · today's practice is held`;
      } else if (heldCount > 0) {
        innerPathSubtitle = `${dayLine} · today's step has begun`;
      } else {
        innerPathSubtitle = dayLine;
      }
    } else {
      innerPathSubtitle = segment
        ? SEGMENT_INNER_PATH_NO_STATE_SUBTITLE[segment]
        : "Begin a 14-day path for what you are moving through.";
    }

    // Quick Chant subtitle — 3-way conditional (CRITICAL: only show "chosen mantra" if has_quick_chant_mantra)
    const quickChantSubtitle = hasMantra
      ? QUICK_CHANT_HAS_MANTRA_SUBTITLE
      : hasQuickChantHistory
        ? QUICK_CHANT_HISTORY_ONLY_SUBTITLE
        : QUICK_CHANT_NO_STATE_SUBTITLE;

    // Tell Mitra subtitle — conditional on state
    const tellMitraSubtitle = hasTMHistory
      ? TELL_MITRA_HAS_HISTORY_SUBTITLE
      : hasIP || segment === "rhythm_and_path"
        ? TELL_MITRA_ACTIVE_PATH_SUBTITLE
        : TELL_MITRA_DEFAULT_SUBTITLE;

    return (
      <div
        className="mitra-home-surface"
        style={{
          minHeight: "100vh",
          backgroundImage: "url(/beige_bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header transparent hidden={shouldHideChrome} />
        <main
          className="mitra-home-main"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            paddingBottom: "calc(72px + env(safe-area-inset-bottom))",
          }}
        >
          {greeting && (
            <div
              className="mitra-home-hero"
              style={{
                width: "100%",
                position: "relative",

                overflow: "hidden",

                marginBottom: 24,
              }}
            >
              <img
                className="mitra-home-hero-img"
                src={greetingImageSrc}
                alt=""
                style={{
                  width: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  inset: 0,
                }}
              />
              <div
                className="mitra-home-hero-content"
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  minHeight: isNightGreeting ? 230 : 230,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  alignItems: "center", // Center the content container
                }}
              >
                <div
                  className="mitra-home-hero-copy"
                  style={{
                    width: "100%",
                    maxWidth: 420,
                    padding: "0px 17px 6px",
                    textAlign: "left",
                  }}
                >
                  <h1
                    className="mitra-home-title"
                    style={{
                      fontFamily: "var(--kalpx-font-serif)",
                      fontWeight: 700,
                      fontSize: 28,
                      color: greetingTextColor,
                      margin: "0 0 -2px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    {greeting.headline}
                  </h1>

                  {greeting.subtext && (
                    <>
                      <p
                        className="mitra-home-subtitle"
                        style={{
                          fontFamily: "var(--kalpx-font-serif)",
                          fontSize: 17,
                          color: greetingTextColor,
                          margin: 0,
                        }}
                      >
                        {greeting.subtext}
                      </p>

                      <div
                        className="mitra-home-divider"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          marginTop: 5,
                          width: "100%",
                          maxWidth: 180,
                        }}
                      >
                        <div
                          style={{
                            height: 1,
                            flex: 1,
                            background:
                              "linear-gradient(to right, transparent, rgba(201,168,76,0.4))",
                          }}
                        />
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            color: "#C9A84C",
                            fontSize: 14,
                            gap: 2,
                          }}
                        >
                          <span style={{ fontSize: 8 }}>◇</span>
                          <span style={{ fontSize: 14 }}>◈</span>
                          <span style={{ fontSize: 8 }}>◇</span>
                        </div>
                        <div
                          style={{
                            height: 1,
                            flex: 1,
                            background:
                              "linear-gradient(to left, transparent, rgba(201,168,76,0.4))",
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <div
            className="mitra-home-content"
            style={{ width: "100%", maxWidth: 420, padding: "0 16px" }}
          >
            {fourDoorError && (
              <p
                style={{
                  color: "#e06060",
                  textAlign: "center",
                  marginBottom: 16,
                  fontSize: 15,
                }}
              >
                {fourDoorError}
              </p>
            )}

            {/* Four Door Cards */}
            {doorStates && (
              <div
                className="mitra-home-door-grid"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  marginBottom: 28,
                }}
              >
                {/* My Rhythm */}
                <button
                  className="mitra-home-door-card"
                  onClick={() => navigate(myRhythmTarget)}
                  style={{
                    width: "100%",
                    border: "1px solid rgba(201,168,76,0.28)",
                    borderRadius: 20,

                    padding: "10px",
                    boxShadow: "0 10px 25px rgba(67,33,4,0.08)",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src="/mitra1.svg"
                      alt=""
                      style={{
                        width: 48,
                        height: 48,
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "var(--kalpx-font-serif)",
                        fontWeight: 700,
                        fontSize: 18,
                        color: "#432104",
                        marginBottom: 4,
                      }}
                    >
                      {DOOR_LABELS.my_rhythm}
                    </div>
                    <div
                      style={{ color: "rgba(67, 33, 4, 0.6)", fontSize: 14 }}
                    >
                      {rhythmSubtitle}
                    </div>
                    {segment === "new" && isFirstVisit && (
                      <div
                        style={{
                          color: "rgba(67,33,4,0.38)",
                          fontSize: 12,
                          fontStyle: "italic",
                          marginTop: 3,
                        }}
                      >
                        Shape the day with a simple rhythm.
                      </div>
                    )}
                  </div>
                  <div style={{ color: "#C9A84C", fontSize: 18 }}>→</div>
                </button>

                {/* Inner Path */}
                <button
                  className="mitra-home-door-card"
                  onClick={() => navigate("/en/mitra/inner-path")}
                  style={{
                    width: "100%",
                    border:
                      segment === "rhythm_only"
                        ? "1.5px solid rgba(201,168,76,0.55)"
                        : "1px solid rgba(201,168,76,0.28)",
                    borderRadius: 20,
                    padding: "10px",
                    boxShadow:
                      segment === "rhythm_only"
                        ? "0 10px 25px rgba(201,168,76,0.14)"
                        : "0 10px 25px rgba(67,33,4,0.08)",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src="/mitra2.svg"
                      alt=""
                      style={{
                        width: 48,
                        height: 48,
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "var(--kalpx-font-serif)",
                        fontWeight: 700,
                        fontSize: 18,
                        color: "#432104",
                        marginBottom: 4,
                      }}
                    >
                      {DOOR_LABELS.inner_path}
                    </div>
                    <div
                      style={{ color: "rgba(67, 33, 4, 0.6)", fontSize: 14 }}
                    >
                      {innerPathSubtitle}
                    </div>
                    {segment === "new" && isFirstVisit && (
                      <div
                        style={{
                          color: "rgba(67,33,4,0.38)",
                          fontSize: 12,
                          fontStyle: "italic",
                          marginTop: 3,
                        }}
                      >
                        Walk a 14-day path with Mitra beside you.
                      </div>
                    )}
                  </div>
                  <div style={{ color: "#C9A84C", fontSize: 18 }}>→</div>
                </button>

                {/* Quick Reset */}
                <button
                  className="mitra-home-door-card"
                  onClick={() => navigate("/en/mitra/quick-reset")}
                  style={{
                    width: "100%",
                    border: "1px solid rgba(201,168,76,0.28)",
                    borderRadius: 20,

                    padding: "10px",
                    boxShadow: "0 10px 25px rgba(67,33,4,0.08)",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src="/mitra3.svg"
                      alt=""
                      style={{
                        width: 48,
                        height: 48,
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "var(--kalpx-font-serif)",
                        fontWeight: 700,
                        fontSize: 18,
                        color: "#432104",
                        marginBottom: 4,
                      }}
                    >
                      {DOOR_LABELS.quick_reset}
                    </div>
                    <div
                      style={{ color: "rgba(67, 33, 4, 0.6)", fontSize: 14 }}
                    >
                      {quickChantSubtitle}
                    </div>
                    {segment === "new" && isFirstVisit && (
                      <div
                        style={{
                          color: "rgba(67,33,4,0.38)",
                          fontSize: 12,
                          fontStyle: "italic",
                          marginTop: 3,
                        }}
                      >
                        Return through mantra, in a single moment.
                      </div>
                    )}
                  </div>
                  <div style={{ color: "#C9A84C", fontSize: 18 }}>→</div>
                </button>

                {/* Tell Mitra */}
                <button
                  className="mitra-home-door-card"
                  onClick={() => navigate("/en/mitra/tell-mitra")}
                  style={{
                    width: "100%",
                    border: "1px solid rgba(201,168,76,0.28)",
                    borderRadius: 20,

                    padding: "10px",
                    boxShadow: "0 10px 25px rgba(67,33,4,0.08)",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src="/mitra4.svg"
                      alt=""
                      style={{
                        width: 48,
                        height: 48,
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "var(--kalpx-font-serif)",
                        fontWeight: 700,
                        fontSize: 18,
                        color: "#432104",
                        marginBottom: 4,
                      }}
                    >
                      {DOOR_LABELS.tell_mitra}
                    </div>
                    <div
                      style={{ color: "rgba(67, 33, 4, 0.6)", fontSize: 14 }}
                    >
                      {tellMitraSubtitle}
                    </div>
                    {segment === "new" && isFirstVisit && (
                      <div
                        style={{
                          color: "rgba(67,33,4,0.38)",
                          fontSize: 12,
                          fontStyle: "italic",
                          marginTop: 3,
                        }}
                      >
                        Share what is moving. Mitra will listen.
                      </div>
                    )}
                  </div>
                  <div style={{ color: "#C9A84C", fontSize: 18 }}>→</div>
                </button>

                {(() => {
                  const acw = homeData?.active_checkin_window;
                  const windowActive = acw?.active === true;
                  const checkinActionLoading =
                    feelingLoading || dismissingCheckin;
                  return (
                    <div
                      className="mitra-home-checkin"
                      style={{
                        width: "100%",
                        border: "1px solid rgba(201,168,76,0.28)",
                        borderRadius: 20,
                        padding: "16px 18px 18px",
                        boxShadow: "0 10px 25px rgba(67,33,4,0.08)",
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(255,250,243,0.9) 100%)",
                        position: "relative",
                      }}
                    >
                      {checkinActionLoading && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: 20,
                            background: "rgba(255, 248, 239, 0.55)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 2,
                          }}
                        >
                          <div
                            style={{
                              width: 24,
                              height: 24,
                              border: "2px solid var(--kalpx-cta)",
                              borderTopColor: "transparent",
                              borderRadius: "50%",
                              animation: "spin 1s linear infinite",
                            }}
                          />
                        </div>
                      )}
                      {windowActive ? (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 6,
                            }}
                          >
                            <div
                              style={{
                                fontFamily: "var(--kalpx-font-serif)",
                                fontWeight: 700,
                                fontSize: 18,
                                color: "#432104",
                              }}
                            >
                              {acw!.prana_label}
                            </div>
                            {acw!.dismissible && (
                              <button
                                type="button"
                                data-testid="dismiss-checkin"
                                onClick={() => void handleCheckinDismiss()}
                                disabled={checkinActionLoading}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: checkinActionLoading
                                    ? "not-allowed"
                                    : "pointer",
                                  color: "rgba(67,33,4,0.4)",
                                  fontSize: 18,
                                  lineHeight: 1,
                                  padding: "0 2px",
                                }}
                                aria-label="Dismiss"
                              >
                                ×
                              </button>
                            )}
                          </div>
                          <div
                            style={{
                              color: "rgba(67,33,4,0.78)",
                              fontSize: 15,
                              lineHeight: 1.55,
                              fontFamily: "var(--kalpx-font-serif)",
                              fontStyle: "italic",
                              marginBottom: acw!.suggestion ? 14 : 0,
                            }}
                          >
                            {acw!.acknowledgment}
                          </div>
                          {pendingPranaMessage && (
                            <button
                              type="button"
                              onClick={() => {
                                navigate(
                                  `/en/mitra/tell-mitra?initialMessage=${encodeURIComponent(pendingPranaMessage)}`,
                                );
                                setPendingPranaMessage(null);
                              }}
                              style={{
                                width: "100%",
                                border: "1px solid rgba(201,168,76,0.38)",
                                background:
                                  "linear-gradient(180deg, rgba(255,255,255,0.88), rgba(255,250,243,0.96))",
                                color: "#432104",
                                borderRadius: 18,
                                padding: "14px 18px",
                                textAlign: "left",
                                cursor: "pointer",
                                boxShadow: "0 8px 18px rgba(201,168,76,0.12)",
                                fontSize: 15,
                                fontFamily: "var(--kalpx-font-serif)",
                                fontWeight: 600,
                                marginTop: 12,
                              }}
                            >
                              Tell Mitra →
                            </button>
                          )}
                          {acw!.suggestion && (
                            <>
                              <div
                                style={{
                                  fontSize: 13,
                                  color: "rgba(67,33,4,0.5)",
                                  marginBottom: 8,
                                  fontFamily: "var(--kalpx-font-sans)",
                                }}
                              >
                                {acw!.suggestion.card_header}
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  navigate("/en/mitra/quick-reset")
                                }
                                style={{
                                  width: "100%",
                                  border: "1px solid rgba(201,168,76,0.38)",
                                  background:
                                    "linear-gradient(180deg, rgba(255,255,255,0.88), rgba(255,250,243,0.96))",
                                  color: "#432104",
                                  borderRadius: 18,
                                  padding: "14px 18px",
                                  textAlign: "left",
                                  cursor: "pointer",
                                  boxShadow: "0 8px 18px rgba(201,168,76,0.12)",
                                  fontSize: 15,
                                  fontFamily: "var(--kalpx-font-serif)",
                                  fontWeight: 600,
                                }}
                              >
                                {acw!.suggestion.label} →
                              </button>
                              {acw!.companion_boundary && (
                                <div
                                  style={{
                                    fontSize: 13,
                                    color: "rgba(67,33,4,0.45)",
                                    marginTop: 10,
                                    textAlign: "center",
                                    fontFamily: "var(--kalpx-font-sans)",
                                  }}
                                >
                                  If this feels heavy to carry,{" "}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      navigate("/en/mitra/tell-mitra")
                                    }
                                    style={{
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      color: "#C99317",
                                      fontSize: 13,
                                      padding: 0,
                                      textDecoration: "underline",
                                    }}
                                  >
                                    Tell Mitra
                                  </button>{" "}
                                  is here.
                                </div>
                              )}
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <div
                            style={{
                              fontFamily: "var(--kalpx-font-serif)",
                              fontWeight: 700,
                              fontSize: 18,
                              color: "#432104",
                              marginBottom: 6,
                            }}
                          >
                            How are you landing?
                          </div>
                          <div
                            style={{
                              color: "rgba(67, 33, 4, 0.62)",
                              fontSize: 14,
                              lineHeight: 1.5,
                              marginBottom: 14,
                            }}
                          >
                            One tap. Mitra meets you where you are.
                          </div>
                          <div
                            className="mitra-home-feeling-grid"
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                              gap: 10,
                            }}
                          >
                            {FEELING_OPTIONS.map((feeling) => {
                              const isSelected = selectedFeeling === feeling;
                              return (
                                <button
                                  key={feeling}
                                  type="button"
                                  onClick={() =>
                                    void handleFeelingSelect(feeling)
                                  }
                                  aria-pressed={isSelected}
                                  disabled={checkinActionLoading}
                                  style={{
                                    width: "100%",
                                    border: isSelected
                                      ? "1px solid rgba(201,168,76,0.85)"
                                      : "1px solid rgba(201,168,76,0.38)",
                                    background: isSelected
                                      ? "linear-gradient(135deg, rgba(243,220,168,0.95), rgba(255,247,230,0.98))"
                                      : "rgba(255,255,255,0.78)",
                                    color: "#432104",
                                    borderRadius: 999,
                                    padding: "10px 14px",
                                    fontSize: 14,
                                    fontWeight: isSelected ? 700 : 500,
                                    cursor: checkinActionLoading
                                      ? "not-allowed"
                                      : "pointer",
                                    boxShadow: isSelected
                                      ? "0 6px 14px rgba(201,168,76,0.18)"
                                      : "none",
                                    transition: "all 160ms ease",
                                    opacity: checkinActionLoading ? 0.7 : 1,
                                  }}
                                >
                                  {feeling}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </main>
        <Footer transparent />
        <MobileBottomNav transparent hidden={shouldHideChrome} />
      </div>
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
        minHeight: "100vh",
        backgroundImage: "url(/new_home.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header transparent hidden={shouldHideChrome} />
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
              marginTop: 60,
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
              — Bhagavad Gita 2.40
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
              support what you carry, strengthen what is growing, and walk one
              day at a time
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
              paddingBottom: 32,
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
              to={ONBOARDING_TURN_1_PATH}
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
              Begin with Mitra →
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
      <MobileBottomNav transparent hidden={shouldHideChrome} />
    </div>
  );
}

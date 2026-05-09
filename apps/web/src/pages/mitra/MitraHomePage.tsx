import { AUTH_KEYS } from "@kalpx/api-client";
import { DOOR_LABELS } from "@kalpx/contracts";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Footer } from "../../components/layout/Footer";
import { Header } from "../../components/layout/Header";
import { MobileBottomNav } from "../../components/layout/MobileBottomNav";
import { getMitraHomeV3 } from "../../engine/mitraApi";
import { useGuestIdentity } from "../../hooks/useGuestIdentity";
import {
  mapJourneyEntryViewPath,
  useJourneyEntryView,
} from "../../hooks/useJourneyEntryView";
import { useJourneyStatus } from "../../hooks/useJourneyStatus";
import { WEB_ENV } from "../../lib/env";
import type { AppDispatch, RootState } from "../../store";
import { setHomeData } from "../../store/doorSlice";

function getRhythmTimeBand(): "morning" | "afternoon" | "night" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "night";
}

const FEELING_OPTIONS = [
  "Agitated",
  "Drained",
  "Energised",
  "Balanced",
] as const;

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
  const [selectedFeeling, setSelectedFeeling] = useState<
    (typeof FEELING_OPTIONS)[number] | null
  >(null);
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
        if (!cancelled)
          setFourDoorError("Could not load your home. Please try again.");
      })
      .finally(() => {
        setFourDoorLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hasActiveJourney, homeData, dispatch]);

  if (
    loading ||
    (hasActiveJourney === true && fourDoorLoading) ||
    (hasActiveJourney === true &&
      (entryLoading || (viewKey === null && !entryError)))
  ) {
    return <LoadingScreen />;
  }

  // ── Four-Door Home (S03) ─────────────────────────────────────────────────
  if (hasActiveJourney === true && (homeData || fourDoorError !== null)) {
    const doorStates = homeData?.door_states;
    const innerPathSummary = homeData?.inner_path_summary;
    const greeting = homeData?.greeting;
    const hasRhythm = homeData?.companion_rhythm?.has_rhythm === true;
    const myRhythmTarget = hasRhythm
      ? "/en/mitra/rhythm"
      : "/en/mitra/rhythm/setup";

    // My Rhythm: prefer backend summary label, then first item in current time-band slot, then door state
    const rhythmBand = getRhythmTimeBand();
    const rhythmSlot = homeData?.companion_rhythm?.[rhythmBand];
    const rhythmSubtitle =
      homeData?.my_rhythm_summary?.next_practice_label ??
      rhythmSlot?.items?.[0]?.title_snapshot ??
      doorStates?.my_rhythm?.subtitle ??
      doorStates?.my_rhythm?.cta ??
      "";

    // Inner Path: prefer Day X of Y when path is active, fallback to path_title or door subtitle
    const innerPathSubtitle = innerPathSummary?.has_active_path
      ? `Day ${innerPathSummary.day_number} of ${innerPathSummary.total_days}`
      : (innerPathSummary?.path_title ??
        doorStates?.inner_path?.subtitle ??
        "");

    return (
      <div
        style={{
          minHeight: "100dvh",
          backgroundImage: "url(/beige_bg.png)",
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
            paddingBottom: "calc(92px + env(safe-area-inset-bottom))",
          }}
        >
          {greeting && (
            <div
              style={{
                width: "100%",
                position: "relative",
                marginTop: -60, // Overlap header

                overflow: "hidden",

                marginBottom: 24,
              }}
            >
              <img
                src="/imgsun.png"
                alt=""
                style={{
                  width: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  inset: 0,
                }}
              />
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  minHeight: 190,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  alignItems: "center", // Center the content container
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxWidth: 420,
                    padding: "0px 17px 6px",
                    textAlign: "left",
                  }}
                >
                  <h1
                    style={{
                      fontFamily: "var(--kalpx-font-serif)",
                      fontWeight: 700,
                      fontSize: 28,
                      color: "#432104",
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
                        style={{
                          fontFamily: "var(--kalpx-font-serif)",
                          fontSize: 17,
                          color: "#432104", // Softer color
                          margin: 0,
                        }}
                      >
                        {greeting.subtext}
                      </p>

                      <div
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

          <div style={{ width: "100%", maxWidth: 420, padding: "0 16px" }}>
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
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  marginBottom: 28,
                }}
              >
                {/* My Rhythm */}
                <button
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
                  </div>
                  <div style={{ color: "#C9A84C", opacity: 0.5, fontSize: 18 }}>
                    →
                  </div>
                </button>

                {/* Inner Path */}
                <button
                  onClick={() => navigate("/en/mitra/inner-path")}
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
                  </div>
                  <div style={{ color: "#C9A84C", opacity: 0.5, fontSize: 18 }}>
                    →
                  </div>
                </button>

                {/* Quick Reset */}
                <button
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
                      {doorStates.quick_reset?.subtitle}
                    </div>
                  </div>
                  <div style={{ color: "#C9A84C", opacity: 0.5, fontSize: 18 }}>
                    →
                  </div>
                </button>

                {/* Tell Mitra */}
                <button
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
                      {doorStates.tell_mitra?.subtitle}
                    </div>
                  </div>
                  <div style={{ color: "#C9A84C", opacity: 0.5, fontSize: 18 }}>
                    →
                  </div>
                </button>

                <div
                  style={{
                    width: "100%",
                    border: "1px solid rgba(201,168,76,0.28)",
                    borderRadius: 20,
                    padding: "16px 18px 18px",
                    boxShadow: "0 10px 25px rgba(67,33,4,0.08)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(255,250,243,0.9) 100%)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--kalpx-font-serif)",
                      fontWeight: 700,
                      fontSize: 18,
                      color: "#432104",
                      marginBottom: 6,
                    }}
                  >
                    How are you feeling today?
                  </div>
                  <div
                    style={{
                      color: "rgba(67, 33, 4, 0.62)",
                      fontSize: 14,
                      lineHeight: 1.5,
                      marginBottom: 14,
                    }}
                  >
                    Choose what best matches your energy right now.
                  </div>
                  <div
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
                          onClick={() => setSelectedFeeling(feeling)}
                          aria-pressed={isSelected}
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
                            cursor: "pointer",
                            boxShadow: isSelected
                              ? "0 6px 14px rgba(201,168,76,0.18)"
                              : "none",
                            transition: "all 160ms ease",
                          }}
                        >
                          {feeling}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
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

/**
 * CycleReflectionBlock — Phase 10B.
 * Handles Day 7 and Day 14 checkpoint display + decision submission.
 * Data is pre-loaded into screenData by CheckpointPage before this block renders.
 * Internal phase: intro → reflection → summary → decisions.
 */

import { useEffect, useMemo, useState } from "react";

type Phase = "intro" | "reflection" | "summary" | "decisions";

interface Props {
  block?: Record<string, any>;
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
  day: 7 | 14;
}

function ButtonLoadingLabel({
  loading,
  label,
}: {
  loading: boolean;
  label: string;
}) {
  if (!loading) return <>{label}</>;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      }}
    >
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          border: "2px solid currentColor",
          borderTopColor: "transparent",
          display: "inline-block",
          animation: "kalpx-spin 0.85s linear infinite",
        }}
      />
      <span>Loading…</span>
    </span>
  );
}

export function CycleReflectionBlock({ screenData, onAction, day }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [selectedDay, setSelectedDay] = useState<number>(day);
  const [showJourneyView, setShowJourneyView] = useState(false);
  const [activeTab, setActiveTab] = useState<"day" | "weekly">("day");
  const sd = screenData || {};
  const isSubmitting = !!sd._isSubmitting;
  const submitError = !!sd.checkpoint_submit_error;

  const checkpointKey = day === 7 ? "checkpoint_day_7" : "checkpoint_day_14";
  const cp = sd[checkpointKey] || {};
  const decisionsAvailable: string[] =
    sd[`day_${day}_decisions_available`] ||
    (day === 7
      ? ["continue", "lighten", "reset"]
      : ["continue_same", "change_focus"]);
  const mitraReflection: string = sd.checkpoint_mitra_reflection || "";
  const dayStatuses: string[] = sd.journey_day_statuses || [];
  const trendGraph = sd.checkpoint_trend_graph || {
    labels: [],
    engaged: [],
    fully_completed: [],
  };
  const completionRates = sd.checkpoint_completion_rates || {};
  const completedCount = dayStatuses.filter((s) => s === "completed").length;
  const totalDays = dayStatuses.length || day;
  const engagedTotal = trendGraph.engaged.reduce(
    (sum: number, value: number) => sum + Number(value || 0),
    0,
  );
  const completedTotal = trendGraph.fully_completed.reduce(
    (sum: number, value: number) => sum + Number(value || 0),
    0,
  );
  const strongestType: string = sd.checkpoint_strongest_type || "";
  const introBg = day === 14 ? "/14day_updated.png" : "/beige_bg.png";
  const introBgPosition = day === 7 ? "center center" : "top 92%";
  const introBgAttachment = "fixed";
  const introBottomOffset = day === 7 ? 24 : 30;

  useEffect(() => {
    const shell = document.querySelector(
      ".kalpx-mitra-shell",
    ) as HTMLElement | null;
    const shellMain = document.querySelector(
      ".kalpx-mitra-shell-main",
    ) as HTMLElement | null;
    if (!shell) return;
    shell.style.backgroundImage =
      phase === "intro" ? `url(${introBg})` : "url(/beige_bg.png)";
    shell.style.backgroundRepeat = "no-repeat";
    shell.style.backgroundSize = "cover";
    shell.style.backgroundPosition =
      phase === "intro" ? introBgPosition : "top 92%";
    shell.style.backgroundAttachment =
      phase === "intro" ? introBgAttachment : "fixed";
    if (shellMain) {
      shellMain.style.overflowY = phase === "intro" ? "hidden" : "auto";
    }
    return () => {
      shell.style.backgroundImage = "url(/beige_bg.png)";
      shell.style.backgroundRepeat = "no-repeat";
      shell.style.backgroundSize = "cover";
      shell.style.backgroundPosition = "top 92%";
      shell.style.backgroundAttachment = "fixed";
      if (shellMain) {
        shellMain.style.overflowY = "auto";
      }
    };
  }, [phase, introBg, introBgAttachment, introBgPosition]);

  const weeklyGroups = useMemo(
    () => [
      { label: "Week 1", days: [1, 2, 3, 4, 5, 6, 7] },
      ...(totalDays > 7
        ? [{ label: "Week 2", days: [8, 9, 10, 11, 12, 13, 14] }]
        : []),
    ],
    [totalDays],
  );

  const dayActivity = useMemo(
    () => ({
      engaged: Number(trendGraph.engaged?.[selectedDay - 1] ?? 0),
      completed: Number(trendGraph.fully_completed?.[selectedDay - 1] ?? 0),
      mantra: Math.round(Number(completionRates.mantra ?? 0)),
      sankalp: Math.round(Number(completionRates.sankalp ?? 0)),
      practice: Math.round(Number(completionRates.practice ?? 0)),
    }),
    [
      trendGraph.engaged,
      trendGraph.fully_completed,
      completionRates.mantra,
      completionRates.sankalp,
      completionRates.practice,
      selectedDay,
    ],
  );

  const weeklyStats = useMemo(
    () =>
      weeklyGroups.map((week) => {
        const dayIndexes = week.days.map((d) => d - 1);
        const engaged = dayIndexes.reduce(
          (sum, index) => sum + Number(trendGraph.engaged?.[index] ?? 0),
          0,
        );
        const completed = dayIndexes.reduce(
          (sum, index) =>
            sum + Number(trendGraph.fully_completed?.[index] ?? 0),
          0,
        );
        return { ...week, engaged, completed };
      }),
    [weeklyGroups, trendGraph.engaged, trendGraph.fully_completed],
  );

  function submitDecision(decision: string) {
    if (onAction) {
      onAction({
        type: "submit_checkpoint_decision",
        payload: { decision, day },
      });
    }
  }

  if (phase === "intro") {
    const eyebrow =
      cp.eyebrow || (day === 7 ? "Day 7 Checkpoint" : "Day 14 Checkpoint");
    const headline =
      cp.intro_headline ||
      cp.headline ||
      (day === 7 ? "A Week Complete" : "Two Weeks. Something Settled.");
    const body =
      cp.intro_body ||
      cp.body ||
      (day === 7
        ? "Take a moment to reflect on your journey."
        : "Can I show you what has changed?");
    const ctaLabel = cp.intro_cta_label || "Continue";

    return (
      <div
        data-testid="checkpoint-intro"
        style={{
          height: "calc(100dvh - 122px - env(safe-area-inset-bottom))",
          boxSizing: "border-box",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: day === 7 ? "center" : "space-between",
          padding: `24px 24px calc(${introBottomOffset}px + 62px + env(safe-area-inset-bottom))`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            width: "100%",
            maxWidth: day === 7 ? 720 : 640,
            margin: day === 7 ? "0 auto" : undefined,
            padding: day === 7 ? "36px 32px" : undefined,

            paddingTop: day === 7 ? undefined : "12vh",
          }}
        >
          <p
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 2,
              color: "var(--kalpx-gold)",
              textTransform: "uppercase",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            {eyebrow}
          </p>
          <p
            style={{
              fontSize: day === 7 ? "clamp(34px, 2vw, 48px)" : 32,
              fontWeight: 700,
              fontFamily: "var(--kalpx-font-serif)",
              color: "var(--kalpx-text)",
              lineHeight: 1.3,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            {headline}
          </p>
          <p
            style={{
              fontSize: day === 7 ? 20 : 19,
              color: "var(--kalpx-text-soft)",
              lineHeight: 1.75,
              marginBottom: 0,
              textAlign: "center",
              maxWidth: day === 7 ? 580 : undefined,
              margin: day === 7 ? "0 auto" : undefined,
            }}
          >
            {body}
          </p>
        </div>
        <button
          data-testid="checkpoint-intro-cta"
          onClick={() => setPhase("reflection")}
          style={{
            width: "100%",
            maxWidth: day === 7 ? 360 : 420,
            marginTop: day === 7 ? 28 : 20,
            margin: "10px auto 0",
            padding: day === 7 ? "16px 24px" : "10px",
            background: "var(--kalpx-cta)",
            color: "#fff",
            border: "none",
            borderRadius: 16,
            fontSize: 18,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            touchAction: "manipulation",
          }}
        >
          {ctaLabel}
        </button>
        <style>{`@keyframes kalpx-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Reflection ────────────────────────────────────────────────────
  if (phase === "reflection" || phase === "summary") {
    const graphCta = cp.graph_cta || "Continue to Choices";

    let narrativeText = mitraReflection;
    if (!narrativeText && cp.narrative_template) {
      narrativeText = cp.narrative_template
        .replace("{completed_count}", String(completedCount))
        .replace("{total_days}", String(totalDays));
    }
    if (!narrativeText) {
      narrativeText = `${completedCount} of ${totalDays} days held with intention.`;
    }

    if (phase === "reflection" && day === 14) {
      return (
        <>
          <div
            data-testid="checkpoint-reflection"
            style={{
              padding: "36px 24px 100px",
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <p
                style={{
                  fontSize: 18,
                  fontFamily: "var(--kalpx-font-serif)",
                  color: "var(--kalpx-text)",
                  lineHeight: 1.4,
                  marginBottom: 10,
                  fontWeight: 700,
                }}
              >
                {cp.day_picker_title || "Your 14-Day Journey"}
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--kalpx-text-soft)",
                  lineHeight: 1.6,
                }}
              >
                {cp.day_picker_subtitle || "Tap a day to see your progress"}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {weeklyGroups.map((week) => (
                <div
                  key={week.label}
                  style={{
                    border: "1.5px solid rgba(212,160,23,0.75)",
                    borderRadius: 28,
                    background: "rgba(255,250,244,0.72)",
                    padding: "22px 20px 26px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "var(--kalpx-text)",
                      marginBottom: 20,
                    }}
                  >
                    {week.label}
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                      rowGap: 20,
                      columnGap: 12,
                    }}
                  >
                    {week.days.map((dayNum) => {
                      const status = dayStatuses[dayNum - 1] || "pending";
                      const isSelected = selectedDay === dayNum;
                      return (
                        <button
                          key={dayNum}
                          onClick={() => {
                            setSelectedDay(dayNum);
                            setShowJourneyView(true);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: "50%",
                              border: `2px solid ${
                                isSelected
                                  ? "var(--kalpx-cta)"
                                  : "rgba(212,160,23,0.8)"
                              }`,
                              background:
                                status === "completed"
                                  ? "rgba(212,160,23,0.12)"
                                  : "#fff",
                              color: "var(--kalpx-text)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 14,
                              fontWeight: 700,
                            }}
                          >
                            {dayNum}
                          </div>
                          <span
                            style={{
                              fontSize: 12,
                              color: "var(--kalpx-text-soft)",
                            }}
                          >
                            Day {dayNum}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              data-testid="checkpoint-reflection-cta"
              onClick={() => setPhase("summary")}
              style={{
                marginTop: 26,
                width: "100%",
                background: "none",
                border: "none",
                color: "var(--kalpx-text)",
                textDecoration: "underline",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Skip
            </button>
          </div>

          {showJourneyView && (
            <div
              onClick={() => setShowJourneyView(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(30,20,10,0.35)",
                zIndex: 120,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "100%",
                  maxWidth: 480,
                  background: "#fffaf4",
                  borderRadius: "28px 28px 0 0",
                  padding: "22px 22px 34px",
                  maxHeight: "78dvh",
                  overflowY: "auto",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 18,
                  }}
                >
                  <div style={{ display: "flex", gap: 26 }}>
                    {(["day", "weekly"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                          background: "none",
                          border: "none",
                          borderBottom:
                            activeTab === tab
                              ? "3px solid rgba(212,160,23,0.85)"
                              : "3px solid transparent",
                          color:
                            activeTab === tab
                              ? "var(--kalpx-text)"
                              : "var(--kalpx-text-soft)",
                          fontSize: 16,
                          fontWeight: 600,
                          padding: "0 0 10px",
                          cursor: "pointer",
                        }}
                      >
                        {tab === "day" ? "Day" : "Weekly"}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowJourneyView(false)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--kalpx-text-soft)",
                      fontSize: 22,
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>

                {activeTab === "day" ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    {[
                      {
                        label: "Engaged",
                        color: "#2D7A5F",
                        value: dayActivity.engaged,
                      },
                      {
                        label: "Fully Completed",
                        color: "#D9A557",
                        value: dayActivity.completed,
                      },
                      {
                        label: "Mantra",
                        color: "#8B6BCB",
                        value: dayActivity.mantra,
                      },
                      {
                        label: "Sankalp",
                        color: "#2D7A5F",
                        value: dayActivity.sankalp,
                      },
                      {
                        label: "Core",
                        color: "#E7774E",
                        value: dayActivity.practice,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "24px 1fr 24px",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            background: item.color,
                            justifySelf: "center",
                          }}
                        />
                        <div>
                          <div
                            style={{
                              fontSize: 14,
                              color: "var(--kalpx-text)",
                              marginBottom: 6,
                            }}
                          >
                            {item.label}
                          </div>
                          <div
                            style={{
                              width: "100%",
                              height: 6,
                              borderRadius: 999,
                              background: "#efe7dd",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            color: "var(--kalpx-text)",
                            fontWeight: 700,
                            textAlign: "right",
                          }}
                        >
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    {weeklyStats.map((week) => (
                      <div
                        key={week.label}
                        style={{
                          borderRadius: 20,
                          background: "#fff",
                          padding: "16px 18px",
                          boxShadow: "0 8px 24px rgba(67,33,4,0.05)",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: "var(--kalpx-text)",
                            marginBottom: 12,
                          }}
                        >
                          {week.label}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 14,
                            color: "var(--kalpx-text-soft)",
                          }}
                        >
                          <span>Engaged</span>
                          <strong style={{ color: "var(--kalpx-text)" }}>
                            {week.engaged}
                          </strong>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 14,
                            color: "var(--kalpx-text-soft)",
                            marginTop: 8,
                          }}
                        >
                          <span>Fully Completed</span>
                          <strong style={{ color: "var(--kalpx-text)" }}>
                            {week.completed}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      );
    }

    if (phase === "reflection" && day === 7) {
      return (
        <>
          <div
            data-testid="checkpoint-reflection"
            style={{
              padding: "36px 24px 100px",
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <p
                style={{
                  fontSize: 18,
                  fontFamily: "var(--kalpx-font-serif)",
                  color: "var(--kalpx-text)",
                  lineHeight: 1.4,
                  marginBottom: 10,
                  fontWeight: 700,
                }}
              >
                {cp.day_picker_title || "Your 7-Day Journey"}
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--kalpx-text-soft)",
                  lineHeight: 1.6,
                }}
              >
                {cp.day_picker_subtitle || "Tap a day to see your progress"}
              </p>
            </div>

            <div
              style={{
                border: "1.5px solid rgba(212,160,23,0.75)",
                borderRadius: 28,
                background: "rgba(255,250,244,0.72)",
                padding: "22px 20px 26px",
              }}
            >
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--kalpx-text)",
                  marginBottom: 20,
                }}
              >
                Week 1
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  rowGap: 20,
                  columnGap: 12,
                }}
              >
                {weeklyGroups[0].days.map((dayNum) => {
                  const status = dayStatuses[dayNum - 1] || "pending";
                  const isSelected = selectedDay === dayNum;
                  return (
                    <button
                      key={dayNum}
                      onClick={() => {
                        setSelectedDay(dayNum);
                        setShowJourneyView(true);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 58,
                          height: 58,
                          borderRadius: "50%",
                          border: `2px solid ${
                            isSelected
                              ? "var(--kalpx-cta)"
                              : "rgba(212,160,23,0.8)"
                          }`,
                          background:
                            status === "completed"
                              ? "rgba(212,160,23,0.12)"
                              : "#fff",
                          color: "var(--kalpx-text)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                          fontWeight: 700,
                        }}
                      >
                        {dayNum}
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--kalpx-text-soft)",
                        }}
                      >
                        Day {dayNum}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              data-testid="checkpoint-reflection-cta"
              onClick={() => setPhase("summary")}
              style={{
                marginTop: 26,
                width: "100%",
                background: "none",
                border: "none",
                color: "var(--kalpx-text)",
                textDecoration: "underline",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Skip
            </button>
          </div>

          {showJourneyView && (
            <div
              onClick={() => setShowJourneyView(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(30,20,10,0.35)",
                zIndex: 120,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "100%",
                  maxWidth: 480,
                  background: "#fffaf4",
                  borderRadius: "28px 28px 0 0",
                  padding: "22px 22px 34px",
                  maxHeight: "78dvh",
                  overflowY: "auto",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 18,
                  }}
                >
                  <div style={{ display: "flex", gap: 26 }}>
                    {(["day", "weekly"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                          background: "none",
                          border: "none",
                          borderBottom:
                            activeTab === tab
                              ? "3px solid rgba(212,160,23,0.85)"
                              : "3px solid transparent",
                          color:
                            activeTab === tab
                              ? "var(--kalpx-text)"
                              : "var(--kalpx-text-soft)",
                          fontSize: 16,
                          fontWeight: 600,
                          padding: "0 0 10px",
                          cursor: "pointer",
                        }}
                      >
                        {tab === "day" ? "Day" : "Weekly"}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowJourneyView(false)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--kalpx-text-soft)",
                      fontSize: 22,
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>

                {activeTab === "day" ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    {[
                      {
                        label: "Engaged",
                        color: "#2D7A5F",
                        value: dayActivity.engaged,
                      },
                      {
                        label: "Fully Completed",
                        color: "#D9A557",
                        value: dayActivity.completed,
                      },
                      {
                        label: "Mantra",
                        color: "#8B6BCB",
                        value: dayActivity.mantra,
                      },
                      {
                        label: "Sankalp",
                        color: "#2D7A5F",
                        value: dayActivity.sankalp,
                      },
                      {
                        label: "Core",
                        color: "#E7774E",
                        value: dayActivity.practice,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "24px 1fr 24px",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            background: item.color,
                            justifySelf: "center",
                          }}
                        />
                        <div>
                          <div
                            style={{
                              fontSize: 14,
                              color: "var(--kalpx-text)",
                              marginBottom: 6,
                            }}
                          >
                            {item.label}
                          </div>
                          <div
                            style={{
                              width: "100%",
                              height: 6,
                              borderRadius: 999,
                              background: "#efe7dd",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            color: "var(--kalpx-text)",
                            fontWeight: 700,
                            textAlign: "right",
                          }}
                        >
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    {weeklyStats.map((week) => (
                      <div
                        key={week.label}
                        style={{
                          borderRadius: 20,
                          background: "#fff",
                          padding: "16px 18px",
                          boxShadow: "0 8px 24px rgba(67,33,4,0.05)",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: "var(--kalpx-text)",
                            marginBottom: 12,
                          }}
                        >
                          {week.label}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 14,
                            color: "var(--kalpx-text-soft)",
                          }}
                        >
                          <span>Engaged</span>
                          <strong style={{ color: "var(--kalpx-text)" }}>
                            {week.engaged}
                          </strong>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 14,
                            color: "var(--kalpx-text-soft)",
                            marginTop: 8,
                          }}
                        >
                          <span>Fully Completed</span>
                          <strong style={{ color: "var(--kalpx-text)" }}>
                            {week.completed}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      );
    }

    if (phase === "summary") {
      const summaryTagline =
        day === 7
          ? cp.surface_label || "DAY 7 • MIDPOINT"
          : cp.surface_label || "DAY 14 • EVOLUTION PIVOT";
      const summaryTitle =
        day === 7 ? "Day 7 Reflection" : cp.summary_label || "What Has Grown";
      const continuityTitle =
        day === 7 ? "7-Day Continuity Mirror" : "14-Day Progress Graph";
      const continuitySubtitle =
        day === 7
          ? "Your engagement over the last 7 days"
          : "Engaged and fully completed across the full cycle";
      const summaryBody =
        mitraReflection ||
        cp.body_narrative ||
        cp.journey_narrative ||
        cp.narrative_template ||
        "";
      const avgCompletionRate = Object.values(completionRates).length
        ? Math.round(
            (Object.values(completionRates).reduce(
              (sum: number, value: unknown) => sum + Number(value || 0),
              0,
            ) /
              Object.values(completionRates).length) *
              100,
          )
        : null;

      return (
        <div
          data-testid="checkpoint-summary"
          style={{
            padding: "24px 24px 100px",
            maxWidth: 480,
            margin: "0 auto",
          }}
        >
          <div style={{ marginBottom: 22 }}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.8,
                color: "#9b7b53",
                textTransform: "uppercase",
                marginBottom: 10,
                textAlign: day === 7 ? "left" : "center",
              }}
            >
              {summaryTagline}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <p
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  fontFamily: "var(--kalpx-font-serif)",
                  color: "var(--kalpx-text)",
                  lineHeight: 1.25,
                  margin: 0,
                }}
              >
                {summaryTitle}
              </p>
              {day === 7 && (
                <div
                  style={{
                    padding: "10px 16px",
                    borderRadius: 999,
                    background: "rgba(240,225,206,0.9)",
                    color: "#a0783b",
                    fontSize: 14,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  Engaged
                </div>
              )}
            </div>
          </div>

          {day === 7 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                marginBottom: 22,
              }}
            >
              {[
                {
                  label: "Days Engaged",
                  value: `${engagedTotal} / ${totalDays}`,
                },
                {
                  label: "Fully Completed",
                  value: `${completedTotal} / ${totalDays}`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: "rgba(255,252,247,0.82)",
                    border: "1px solid rgba(212,160,23,0.26)",
                    borderRadius: 22,
                    padding: "22px 18px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 14,
                      color: "#8c6f50",
                      marginBottom: 18,
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontSize: 26,
                      color: "var(--kalpx-text)",
                      fontFamily: "var(--kalpx-font-serif)",
                      margin: 0,
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              background: "rgba(255,252,247,0.82)",
              border: "1px solid rgba(212,160,23,0.26)",
              borderRadius: 28,
              padding: "22px 18px 26px",
              marginBottom: 22,
            }}
          >
            <p
              style={{
                fontSize: 18,
                fontWeight: 700,
                fontFamily: "var(--kalpx-font-serif)",
                color: "var(--kalpx-text)",
                marginBottom: 6,
              }}
            >
              {continuityTitle}
            </p>
            <p
              style={{
                fontSize: 14,
                color: "var(--kalpx-text-soft)",
                marginBottom: 18,
              }}
            >
              {continuitySubtitle}
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 18,
              }}
            >
              {[
                { label: "Engaged", color: "#432104" },
                { label: "Completed", color: "#D9914A" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: item.color,
                      display: "inline-block",
                    }}
                  />
                  <span style={{ fontSize: 14, color: "var(--kalpx-text)" }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${totalDays}, minmax(0, 1fr))`,
                gap: 6,
                alignItems: "end",
              }}
            >
              {Array.from({ length: totalDays }, (_, index) => index + 1).map(
                (dayNum) => (
                  <div
                    key={dayNum}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        minWidth: 14,
                        height: 12,
                        borderRadius: 3,
                        background: trendGraph.engaged?.[dayNum - 1]
                          ? "#e8d8c3"
                          : "#f1f1f1",
                      }}
                    />
                    <div
                      style={{
                        width: "100%",
                        minWidth: 14,
                        height: 12,
                        borderRadius: 3,
                        background: trendGraph.fully_completed?.[dayNum - 1]
                          ? "#D9914A"
                          : "#f1f1f1",
                      }}
                    />
                  </div>
                ),
              )}
            </div>
          </div>

          {day === 14 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                marginBottom: 22,
              }}
            >
              {[
                { label: "Strongest Area", value: strongestType || "–" },
                {
                  label: "Consistency Score",
                  value:
                    avgCompletionRate != null ? `${avgCompletionRate}%` : "–",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: "rgba(255,252,247,0.82)",
                    border: "1px solid rgba(212,160,23,0.26)",
                    borderRadius: 15,
                    padding: "10px 18px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 14,
                      color: "#8c6f50",
                      marginBottom: 5,
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontSize: 22,
                      color: "var(--kalpx-text)",
                      fontFamily: "var(--kalpx-font-serif)",
                      margin: 0,
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              position: "relative",
              background: "rgba(255,252,247,0.9)",
              borderRadius: 28,
              padding: "26px 20px 24px",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -14,
                right: 18,
                background: "var(--kalpx-cta)",
                color: "#fff",
                borderRadius: 999,
                padding: 5,

                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 0.6,
              }}
            >
              MITRA REFLECTION
            </div>
            {!!strongestType && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  borderRadius: 999,
                  background: "#eaf4e9",
                  color: "#2D7A5F",
                  padding: "10px",
                  fontWeight: 700,
                  marginBottom: 18,
                  fontSize: 13,
                }}
              >
                Strongest area: {strongestType}
              </div>
            )}
            {!!summaryBody && (
              <p
                style={{
                  fontSize: 17,
                  lineHeight: 1.65,
                  color: "var(--kalpx-text)",
                  fontFamily: "var(--kalpx-font-serif)",
                  margin: 0,
                }}
              >
                {summaryBody}
              </p>
            )}
          </div>

          {day === 7 ? (
            <>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <button
                  onClick={() => submitDecision("continue")}
                  disabled={isSubmitting}
                  style={{
                    width: "100%",
                    padding: "18px 24px",
                    background: "var(--kalpx-cta)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 999,
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: isSubmitting ? "default" : "pointer",
                  }}
                >
                  <ButtonLoadingLabel
                    loading={isSubmitting}
                    label={cp.cta_continue_label || "Continue My Path"}
                  />
                </button>
                {decisionsAvailable.includes("lighten") && (
                  <button
                    onClick={() => submitDecision("lighten")}
                    disabled={isSubmitting}
                    style={{
                      width: "100%",
                      padding: "18px 24px",
                      background: "#c8a97a",
                      color: "#fff",
                      border: "none",
                      borderRadius: 999,
                      fontSize: 16,
                      fontWeight: 700,
                      cursor: isSubmitting ? "default" : "pointer",
                    }}
                  >
                    <ButtonLoadingLabel
                      loading={isSubmitting}
                      label={cp.cta_lighten_label || "Lighten"}
                    />
                  </button>
                )}
                {decisionsAvailable.includes("reset") && (
                  <button
                    onClick={() => submitDecision("reset")}
                    disabled={isSubmitting}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--kalpx-text)",
                      textDecoration: "underline",
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: isSubmitting ? "default" : "pointer",
                    }}
                  >
                    {cp.cta_start_fresh_label || "Start Fresh"}
                  </button>
                )}
              </div>
              {!!sd.checkpoint_decision_framing && (
                <p
                  style={{
                    marginTop: 12,
                    textAlign: "center",
                    fontSize: 15,
                    color: "var(--kalpx-text-soft)",
                  }}
                >
                  {sd.checkpoint_decision_framing}
                </p>
              )}
            </>
          ) : (
            <button
              data-testid="checkpoint-summary-cta"
              onClick={() => setPhase("decisions")}
              style={{
                width: "60%",

                margin: "10px auto",
                padding: "10px",
                background: "var(--kalpx-cta)",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",

                alignItems: "center",

                justifyContent: "center",
              }}
            >
              {cp.graph_cta || "Continue to Choices"}
            </button>
          )}
        </div>
      );
    }

    return (
      <div
        data-testid="checkpoint-reflection"
        style={{ padding: "40px 24px 80px", maxWidth: 480, margin: "0 auto" }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 2,
            color: "var(--kalpx-gold)",
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          Your Journey
        </p>

        <div
          style={{
            padding: "16px",
            background: "var(--kalpx-card-bg)",
            borderRadius: 12,
            border: "1px solid var(--kalpx-border-gold)",
            marginBottom: 32,
          }}
        >
          <p
            style={{
              fontSize: 15,
              color: "var(--kalpx-text-soft)",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {narrativeText}
          </p>
          {completedTotal > 0 && completedTotal !== completedCount && (
            <p style={{ fontSize: 13, color: "var(--kalpx-text-soft)", marginTop: 4 }}>
              {completedTotal} {completedTotal === 1 ? "day was" : "days were"} fully complete.
            </p>
          )}
        </div>

        {sd.checkpoint_classification_headline && (
          <div style={{ marginBottom: 24 }}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--kalpx-gold)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 6,
              }}
            >
              {sd.checkpoint_classification_label || "Your Arc"}
            </p>
            <p
              style={{
                fontSize: 18,
                fontWeight: 700,
                fontFamily: "var(--kalpx-font-serif)",
                color: "var(--kalpx-text)",
                marginBottom: 8,
              }}
            >
              {sd.checkpoint_classification_headline}
            </p>
            {sd.checkpoint_classification_body && (
              <p
                style={{
                  fontSize: 14,
                  color: "var(--kalpx-text-soft)",
                  lineHeight: 1.6,
                }}
              >
                {sd.checkpoint_classification_body}
              </p>
            )}
          </div>
        )}

        <button
          data-testid="checkpoint-reflection-cta"
          onClick={() => setPhase("decisions")}
          style={{
            width: "100%",
            padding: "16px 24px",
            background: "var(--kalpx-cta)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            touchAction: "manipulation",
          }}
        >
          {graphCta}
        </button>
      </div>
    );
  }

  // ── Decisions ─────────────────────────────────────────────────────
  const dc = sd.checkpoint_decision_copy || {};
  const framing =
    sd.checkpoint_decision_framing ||
    sd.checkpoint_framing ||
    (day === 7 ? "Choose your next week:" : "How will you move forward?");
  const decisionLayout: string =
    dc.decision_layout ||
    cp.decision_layout ||
    sd.checkpoint_decision_layout ||
    "continue_first";
  const deepenSuggestion: Record<string, any> | null =
    sd.checkpoint_deepen_suggestion || null;
  const classificationHeadline: string =
    sd.checkpoint_classification_headline || "";
  const classificationBody: string = sd.checkpoint_classification_body || "";

  const decisionLabels: Record<string, string> = {
    continue: cp.cta_continue_label || "Continue My Path",
    lighten: cp.cta_lighten_label || "Lighten",
    reset: cp.cta_start_fresh_label || "Start Fresh",
    continue_same:
      cp.continue_path_cta ||
      cp.cta_continue_same ||
      dc.continue_same_cta ||
      "Continue Same Path",
    deepen:
      cp.deepen_practice_cta ||
      cp.cta_deepen ||
      dc.deepen_cta ||
      "Deepen Practice",
    change_focus:
      cp.change_focus_cta ||
      cp.cta_change_focus ||
      dc.change_focus_cta ||
      "Change Focus",
  };

  const decisionDescriptions: Record<string, string> = {
    continue: "Keep going with your current practice rhythm.",
    lighten: "Lower the intensity — stay consistent but easier.",
    reset: "Start a new path with fresh clarity.",
    continue_same: "Keep going with the same practice as the last 14 days.",
    deepen: "Commit to 108 repetitions — deeper engagement.",
    change_focus: "Choose a different focus for your next cycle.",
  };

  // Day 7 decision buttons use RN color hierarchy; Day 14 uses equal-weight cards (approved web divergence)
  function getDecisionButtonStyle(dec: string) {
    const base = {
      padding: "16px 20px",
      borderRadius: 12,
      textAlign: "left" as const,
      cursor: isSubmitting ? "default" : "pointer",
      opacity: isSubmitting ? 0.6 : 1,
      boxShadow: "var(--kalpx-shadow-card)",
      touchAction: "manipulation" as const,
    };
    if (day !== 7)
      return {
        ...base,
        background: "var(--kalpx-card-bg)",
        border: "1.5px solid var(--kalpx-border-gold)",
      };
    if (dec === "continue")
      return { ...base, background: "var(--kalpx-cta)", border: "none" };
    if (dec === "lighten")
      return {
        ...base,
        background: "rgba(200,169,122,0.55)",
        border: "1.5px solid rgba(200,169,122,0.8)",
      };
    return {
      ...base,
      background: "var(--kalpx-card-bg)",
      border: "1.5px solid var(--kalpx-border-gold)",
    };
  }
  function getDecisionLabelColor(dec: string) {
    return day === 7 && dec === "continue" ? "#fff" : "var(--kalpx-text)";
  }
  function getDecisionDescColor(dec: string) {
    return day === 7 && dec === "continue"
      ? "rgba(255,255,255,0.75)"
      : "var(--kalpx-text-muted)";
  }

  if (day === 14 && decisionLayout === "restart_rhythm") {
    return (
      <div
        data-testid="checkpoint-decisions"
        style={{ padding: "28px 24px 100px", maxWidth: 480, margin: "0 auto" }}
      >
        {classificationHeadline && (
          <div
            style={{
              background: "rgba(255,255,255,0.72)",
              border: "1.5px solid rgba(212,160,23,0.45)",
              borderRadius: 28,
              padding: "28px 24px 30px",
              textAlign: "center",
              marginBottom: 44,
            }}
          >
            <p
              style={{
                fontSize: 18,
                fontWeight: 700,
                fontFamily: "var(--kalpx-font-serif)",
                color: "var(--kalpx-text)",
                marginBottom: 18,
              }}
            >
              {classificationHeadline}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                marginBottom: 22,
              }}
            >
              <div
                style={{
                  width: 106,
                  height: 1,
                  background: "rgba(201,168,76,0.7)",
                }}
              />
              <div
                style={{
                  color: "var(--kalpx-gold)",
                  fontSize: 16,
                  lineHeight: 1,
                }}
              >
                ◆
              </div>
              <div
                style={{
                  width: 106,
                  height: 1,
                  background: "rgba(201,168,76,0.7)",
                }}
              />
            </div>
            {!!classificationBody && (
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: "var(--kalpx-text-soft)",
                  fontFamily: "var(--kalpx-font-serif)",
                }}
              >
                {classificationBody}
              </p>
            )}
          </div>
        )}

        {submitError && (
          <p
            data-testid="checkpoint-submit-error"
            style={{
              fontSize: 13,
              color: "#c0392b",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Something went wrong. Please try again.
          </p>
        )}

        {deepenSuggestion && decisionsAvailable.includes("deepen") && (
          <div
            style={{
              background: "rgba(255,255,255,0.78)",
              border: "1.5px solid rgba(212,160,23,0.45)",
              borderRadius: 24,
              padding: "18px 18px 20px",
              marginBottom: 18,
              boxShadow: "0 8px 24px rgba(67,33,4,0.05)",
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.6,
                color: "var(--kalpx-gold)",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              {decisionLabels.deepen}
            </p>
            {!!deepenSuggestion.title && (
              <p
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  fontFamily: "var(--kalpx-font-serif)",
                  color: "var(--kalpx-text)",
                  marginBottom: 10,
                }}
              >
                {deepenSuggestion.title}
              </p>
            )}
            {!!deepenSuggestion.preview && (
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: "var(--kalpx-text-soft)",
                }}
              >
                {deepenSuggestion.preview}
              </p>
            )}
          </div>
        )}

        <button
          data-testid="checkpoint-decision-continue_same"
          onClick={() => !isSubmitting && submitDecision("continue_same")}
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "18px 24px",
            background: "var(--kalpx-cta)",
            color: "#fff",
            border: "none",
            borderRadius: 999,
            fontSize: 16,
            fontWeight: 700,
            cursor: isSubmitting ? "default" : "pointer",
            opacity: isSubmitting ? 0.6 : 1,
            marginBottom: 18,
          }}
        >
          <ButtonLoadingLabel
            loading={isSubmitting}
            label={
              dc.restart_cta || cp.restart_cta || "Start a New 14-Day Rhythm"
            }
          />
        </button>

        {decisionsAvailable.includes("deepen") && (
          <button
            data-testid="checkpoint-decision-deepen"
            onClick={() => !isSubmitting && submitDecision("deepen")}
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "10px",
              background: "rgba(255,255,255,0.82)",
              color: "var(--kalpx-text)",
              border: "1.5px solid rgba(212,160,23,0.55)",
              borderRadius: 18,
              fontSize: 16,
              fontWeight: 700,
              cursor: isSubmitting ? "default" : "pointer",
              opacity: isSubmitting ? 0.6 : 1,
              marginBottom: 14,
              boxShadow: "0 8px 24px rgba(67,33,4,0.05)",
            }}
          >
            <ButtonLoadingLabel
              loading={isSubmitting}
              label={decisionLabels.deepen}
            />
          </button>
        )}

        <button
          data-testid="checkpoint-decision-change_focus"
          onClick={() => !isSubmitting && submitDecision("change_focus")}
          disabled={isSubmitting}
          style={{
            width: "100%",
            background: "none",
            border: "none",
            color: "var(--kalpx-text)",
            textDecoration: "underline",
            fontSize: 16,
            fontWeight: 600,
            cursor: isSubmitting ? "default" : "pointer",
            opacity: isSubmitting ? 0.6 : 1,
          }}
        >
          <ButtonLoadingLabel
            loading={isSubmitting}
            label={decisionLabels.change_focus}
          />
        </button>
      </div>
    );
  }

  if (
    day === 14 &&
    (decisionLayout === "deepen_first" || decisionLayout === "continue_first")
  ) {
    const deepenTitle = String(deepenSuggestion?.title || "").trim();
    const deepenDescription =
      deepenSuggestion?.preview ||
      (deepenTitle
        ? `${decisionDescriptions.deepen} ${deepenTitle}.`
        : decisionDescriptions.deepen);
    const deepenFirst = decisionLayout === "deepen_first";
    const deepenHint = deepenTitle
      ? `Choosing '${decisionLabels.deepen}' gently begins the ${deepenTitle}`
      : "";

    return (
      <div
        data-testid="checkpoint-decisions"
        style={{ padding: "40px 24px 100px", maxWidth: 480, margin: "0 auto" }}
      >
        {classificationHeadline && (
          <div
            style={{
              background: "rgba(255,255,255,0.72)",
              border: "1.5px solid rgba(212,160,23,0.45)",
              borderRadius: 28,
              padding: "28px 24px 30px",
              textAlign: "center",
              marginBottom: 36,
            }}
          >
            <p
              style={{
                fontSize: 18,
                fontWeight: 700,
                fontFamily: "var(--kalpx-font-serif)",
                color: "var(--kalpx-text)",
                marginBottom: 18,
              }}
            >
              {classificationHeadline}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                marginBottom: 22,
              }}
            >
              <div
                style={{
                  width: 106,
                  height: 1,
                  background: "rgba(201,168,76,0.7)",
                }}
              />
              <div
                style={{
                  color: "var(--kalpx-gold)",
                  fontSize: 16,
                  lineHeight: 1,
                }}
              >
                ◆
              </div>
              <div
                style={{
                  width: 106,
                  height: 1,
                  background: "rgba(201,168,76,0.7)",
                }}
              />
            </div>
            {!!classificationBody && (
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: "var(--kalpx-text-soft)",
                  fontFamily: "var(--kalpx-font-serif)",
                }}
              >
                {classificationBody}
              </p>
            )}
          </div>
        )}

        {submitError && (
          <p
            data-testid="checkpoint-submit-error"
            style={{
              fontSize: 13,
              color: "#c0392b",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Something went wrong. Please try again.
          </p>
        )}

        {deepenSuggestion && (
          <div
            style={{
              background: "rgba(238,232,249,0.82)",
              border: "1.5px solid rgba(165,132,220,0.35)",
              borderRadius: 24,
              padding: "20px 20px 22px",
              marginBottom: 28,
              boxShadow: "0 8px 24px rgba(67,33,4,0.05)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px 18px",
                borderRadius: 999,
                background: "rgba(165,132,220,0.14)",
                color: "#8B6BCB",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "lowercase",
                marginBottom: 18,
              }}
            >
              {String(deepenSuggestion.item_type || "practice")}
            </div>
            {deepenTitle && (
              <p
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  fontFamily: "var(--kalpx-font-serif)",
                  color: "var(--kalpx-text)",
                  marginBottom: 10,
                }}
              >
                {deepenTitle}
              </p>
            )}
            {!!deepenSuggestion.preview && (
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: "var(--kalpx-text-soft)",
                  marginBottom: deepenHint ? 18 : 0,
                }}
              >
                {deepenSuggestion.preview}
              </p>
            )}
            {!!deepenHint && (
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.35,
                  color: "#6E53A7",
                  fontWeight: 600,
                }}
              >
                {deepenHint}
              </p>
            )}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {deepenFirst && decisionsAvailable.includes("deepen") && (
            <button
              data-testid="checkpoint-decision-deepen"
              onClick={() => !isSubmitting && submitDecision("deepen")}
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "10px",
                background: "var(--kalpx-cta)",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                fontSize: 16,
                fontWeight: 700,
                cursor: isSubmitting ? "default" : "pointer",
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              <ButtonLoadingLabel
                loading={isSubmitting}
                label={decisionLabels.deepen}
              />
            </button>
          )}

          <button
            data-testid="checkpoint-decision-continue_same"
            onClick={() => !isSubmitting && submitDecision("continue_same")}
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "10px",
              background: "rgba(255,255,255,0.84)",
              color: deepenFirst ? "#000" : "var(--kalpx-text)",
              border: "1.5px solid rgba(212,160,23,0.85)",
              borderRadius: 999,
              fontSize: 16,
              fontWeight: 700,
              cursor: isSubmitting ? "default" : "pointer",
              opacity: isSubmitting ? 0.6 : 1,
              boxShadow: "0 8px 24px rgba(67,33,4,0.05)",
            }}
          >
            <ButtonLoadingLabel
              loading={isSubmitting}
              label={decisionLabels.continue_same}
            />
          </button>

          {!deepenFirst && decisionsAvailable.includes("deepen") && (
            <button
              data-testid="checkpoint-decision-deepen"
              onClick={() => !isSubmitting && submitDecision("deepen")}
              disabled={isSubmitting}
              style={getDecisionButtonStyle("deepen")}
            >
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--kalpx-text)",
                  marginBottom: 6,
                }}
              >
                <ButtonLoadingLabel
                  loading={isSubmitting}
                  label={decisionLabels.deepen}
                />
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--kalpx-text-muted)",
                  lineHeight: 1.6,
                }}
              >
                {deepenDescription}
              </p>
            </button>
          )}

          <button
            data-testid="checkpoint-decision-change_focus"
            onClick={() => !isSubmitting && submitDecision("change_focus")}
            disabled={isSubmitting}
            style={{
              width: "100%",
              background: "none",
              border: "none",
              color: "var(--kalpx-text)",
              textDecoration: "underline",
              fontSize: 16,
              fontWeight: 600,
              cursor: isSubmitting ? "default" : "pointer",
              opacity: isSubmitting ? 0.6 : 1,
              paddingTop: 4,
            }}
          >
            <ButtonLoadingLabel
              loading={isSubmitting}
              label={decisionLabels.change_focus}
            />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="checkpoint-decisions"
      style={{ padding: "40px 24px 80px", maxWidth: 480, margin: "0 auto" }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 2,
          color: "var(--kalpx-gold)",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        {day === 7 ? "Your Next Week" : "Your Next Cycle"}
      </p>
      <p
        style={{
          fontSize: 18,
          fontFamily: "var(--kalpx-font-serif)",
          color: "var(--kalpx-text)",
          lineHeight: 1.5,
          marginBottom: 32,
          fontWeight: 600,
        }}
      >
        {framing}
      </p>

      {submitError && (
        <p
          data-testid="checkpoint-submit-error"
          style={{
            fontSize: 13,
            color: "#c0392b",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Something went wrong. Please try again.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {decisionsAvailable.map((decision) => (
          <button
            key={decision}
            data-testid={`checkpoint-decision-${decision}`}
            onClick={() => !isSubmitting && submitDecision(decision)}
            disabled={isSubmitting}
            style={getDecisionButtonStyle(decision)}
          >
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: getDecisionLabelColor(decision),
                marginBottom: 4,
              }}
            >
              <ButtonLoadingLabel
                loading={isSubmitting}
                label={decisionLabels[decision] || decision}
              />
            </p>
            {decisionDescriptions[decision] && (
              <p
                style={{
                  fontSize: 13,
                  color: getDecisionDescColor(decision),
                  margin: 0,
                }}
              >
                {decisionDescriptions[decision]}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

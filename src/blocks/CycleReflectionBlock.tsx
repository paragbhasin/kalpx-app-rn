import { BlurView } from "expo-blur";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import uuidv4 from "react-native-uuid";
import { useToast } from "../context/ToastContext";
import {
  mitraFetchProgress,
  mitraJourneyDay14Decision,
  mitraJourneyDay14View,
  mitraJourneyDay7Decision,
  mitraJourneyDay7View,
} from "../engine/mitraApi";
import { useScreenStore } from "../engine/useScreenBridge";
import {
  ingestDailyView,
  ingestDay14View,
  ingestDay7View,
} from "../engine/v3Ingest";
import store from "../store";
import { loadScreenWithData, screenActions } from "../store/screenSlice";
import { Fonts } from "../theme/fonts";

// Assets (imported as components via react-native-svg-transformer)

// Raster assets
// TODO: replace with assets/14day_updated.png once Pavani pushes the file
const Day14Bg = require("../../assets/14day_updated.png");
// TODO: replace with assets/7daybg.png once Pavani pushes the file
const Day7Bg = require("../../assets/7daybg.png");
const BeigeBg = require("../../assets/beige_bg.png");

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface CycleReflectionBlockProps {
  block?: any;
}

const METRIC_ALLOWLIST: Record<string, string> = {
  daysEngaged: "Days Engaged",
  daysFullyCompleted: "Fully Completed",
  totalDays: "Total Days",
  consistencyScore: "Consistency",
  mantraDaysActive: "Mantra Days",
  sankalpDaysEmbodied: "Sankalp Days",
  practiceDaysActive: "Practice Days",
};

const CycleReflectionBlock: React.FC<CycleReflectionBlockProps> = () => {
  const { screenData, currentStateId } = useScreenStore();
  const { showToast } = useToast();
  const ss = screenData as Record<string, any>;
  const checkpointDayNum = Number(ss.checkpoint_day || 0);
  const dayNumberNum = Number(ss.day_number || 0);
  const routeCycleDay = useMemo(() => {
    if (currentStateId === "checkpoint_day_7") return 7;
    if (currentStateId === "checkpoint_day_14") return 14;
    return 0;
  }, [currentStateId]);
  const resolvedCycleDay = Number(
    dayNumberNum || checkpointDayNum || routeCycleDay || 0,
  );

  const is14DayCycle = useMemo(() => {
    const day = resolvedCycleDay;
    return (
      day === 14 ||
      ss.checkpoint_tag === "14-DAY COMPLETION" ||
      ss.checkpoint_tag === "CYCLE REFLECTION" ||
      // ingestDay14View sets checkpoint_day_14 (object) but not checkpoint_tag
      !!ss.checkpoint_day_14
    );
  }, [resolvedCycleDay, ss.checkpoint_tag, ss.checkpoint_day_14]);

  const is7DayCycle = useMemo(() => {
    return (
      ss.checkpoint_tag === "7-DAY CHECKPOINT" ||
      ss.checkpoint_tag === "7-DAY COMPLETION" ||
      ss.checkpoint_tag === "MIDWAY REFLECTION" ||
      ss.checkpoint_tag === "MIDPOINT REFLECTION" ||
      (resolvedCycleDay === 7 && !is14DayCycle) ||
      // ingestDay7View sets checkpoint_day_7 (object) but NOT checkpoint_tag / checkpoint_day
      // This is the primary detection path for API-driven 7-day cycles
      (!is14DayCycle && !!ss.checkpoint_day_7)
    );
  }, [resolvedCycleDay, ss.checkpoint_tag, ss.checkpoint_day_7, is14DayCycle]);

  const [showIntro, setShowIntro] = useState(true);
  const [showJourneyInvite, setShowJourneyInvite] = useState(false);
  const [showJourneyView, setShowJourneyView] = useState(false);
  const [introShown, setIntroShown] = useState(false);
  const checkpointViewFetchInFlight = useRef(false);
  const checkpointViewFetchedKey = useRef<string | null>(null);
  const updateBackground = useScreenStore((state) => state.updateBackground);
  const updateHeaderHidden = useScreenStore(
    (state) => state.updateHeaderHidden,
  );

  // Compute background directly from raw day number so it is set correctly
  // on the FIRST render — before is7DayCycle/is14DayCycle memos have a chance
  // to trigger a re-render. checkpoint_day is written to the store BEFORE
  // navigation so it is always available at mount time.
  const screenBackground = useMemo(() => {
    const rawDay = resolvedCycleDay;
    if (showJourneyInvite) {
      return BeigeBg;
    }
    if (showIntro) {
      if (rawDay === 14 || is14DayCycle) return Day14Bg;
      if (rawDay === 7 || is7DayCycle) return Day7Bg;
    }
    return BeigeBg;
  }, [
    showIntro,
    showJourneyInvite,
    resolvedCycleDay,
    is14DayCycle,
    is7DayCycle,
  ]);

  useEffect(() => {
    updateBackground(screenBackground);
    updateHeaderHidden(false);
    return () => {
      updateBackground(null);
      updateHeaderHidden(false);
    };
  }, [screenBackground, updateBackground, updateHeaderHidden]);

  const day14Intro = useMemo(() => {
    const day14 = (ss.checkpoint_day_14 || {}) as Record<string, any>;
    const reflectionText =
      ss.journey_narrative ||
      day14.narrative_template ||
      day14.intro_body ||
      "You stayed with it. Even on the days it felt quiet or uncertain.";

    const introLines = String(reflectionText)
      .split(/[\n]+/)
      .map((line) => line.trim())
      .filter(Boolean);

    return {
      title: day14.intro_headline || "You’ve completed 14 days",
      bodyLine1: introLines[0] || "You stayed with it.",
      bodyLine2:
        introLines[1] || "Even on the days it felt quiet or uncertain.",
      closing:
        day14.summary_line_template ||
        "Something within you has begun to shift - and it will continue, gently.",
      ctaLabel: day14.intro_cta_label || "Reflect on My Journey",
    };
  }, [ss.checkpoint_day_14, ss.journey_narrative]);

  // v3 data sync: fetch milestone data if missing when on Day 7/14
  useEffect(() => {
    const day = resolvedCycleDay;
    if (day !== 7 && day !== 14) return;

    const isDay14Fetch = day === 14;
    const hasHydratedPayload = isDay14Fetch
      ? !!ss.checkpoint_day_14
      : !!ss.checkpoint_day_7;
    const fetchKey = `${currentStateId || "checkpoint"}:${isDay14Fetch ? 14 : 7}:${ss.journey_id || ""}`;

    // Do not refetch if:
    // 1) payload is already present,
    // 2) same checkpoint fetch already completed in this mount,
    // 3) request is currently in flight.
    if (
      hasHydratedPayload ||
      checkpointViewFetchedKey.current === fetchKey ||
      checkpointViewFetchInFlight.current
    ) {
      return;
    }

    checkpointViewFetchInFlight.current = true;
    let isCancelled = false;

    (async () => {
      try {
        const fetcher = isDay14Fetch
          ? mitraJourneyDay14View
          : mitraJourneyDay7View;
        const result = await fetcher();
        if (isCancelled) return;

        if (result.envelope) {
          const ingester = isDay14Fetch ? ingestDay14View : ingestDay7View;
          const flat = ingester(result.envelope as any);
          for (const [k, v] of Object.entries(flat)) {
            if (v !== undefined) {
              store.dispatch(
                screenActions.setScreenValue({ key: k, value: v }),
              );
            }
          }
        }
        checkpointViewFetchedKey.current = fetchKey;
      } finally {
        checkpointViewFetchInFlight.current = false;
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [
    currentStateId,
    resolvedCycleDay,
    ss.checkpoint_day_14,
    ss.checkpoint_day_7,
    ss.journey_id,
  ]);

  useEffect(() => {
    if (!introShown && (is7DayCycle || is14DayCycle)) {
      // Both Day-7 and Day-14 start at intro, then proceed to journey invite.
      setShowIntro(true);
      setShowJourneyInvite(false);
      setIntroShown(true);
      store.dispatch(
        screenActions.setScreenValue({
          key: "checkpoint_show_feelings",
          value: undefined,
        }),
      );
    }
  }, [is7DayCycle, is14DayCycle, introShown]);

  const [activeTab, setActiveTab] = useState<"day" | "weekly">("day");
  const [selectedDay, setSelectedDay] = useState(1);
  const [showDayPicker, setShowDayPicker] = useState(false);
  // Screen 4 for Day 14: classification verdict + decision choices
  const [showDecisions, setShowDecisions] = useState(false);
  // Screen 5 for Day 14: completion ceremony before routing to cycle 2
  const [showFinale, setShowFinale] = useState(false);
  const [sealRitualText, setSealRitualText] = useState("");
  const [deepenConfirmed, setDeepenConfirmed] = useState(false);
  const [carryReflection, setCarryReflection] = useState("");
  // Day 7 reflection text (BUG-4)
  const [day7ReflectionText, setDay7ReflectionText] = useState("");
  const [progressData, setProgressData] = useState<any>(null);

  useEffect(() => {
    if (!showJourneyView) return;
    mitraFetchProgress()
      .then((res) => {
        if (res) setProgressData(res);
      })
      .catch(() => {});
  }, [showJourneyView]);

  const milestoneDayCount = is14DayCycle ? 14 : 7;

  const journeyData = useMemo(() => {
    const log = ss.journey_log || {};
    const currentDay = ss.day_number || 1;
    const beTrend = progressData?.weeklyTrend as any[] | undefined;

    let checkinCount = 0,
      triggerCount = 0,
      mantraCount = 0,
      sankalpCount = 0,
      coreCount = 0;
    if (beTrend && beTrend[selectedDay - 1]) {
      const t = beTrend[selectedDay - 1];
      mantraCount = t.mantraSessions || 0;
      sankalpCount = t.sankalpEmbodied ? 1 : 0;
      coreCount = t.practiceSessions || 0;
      checkinCount = t.checkins || 0;
      triggerCount = t.triggers || 0;
    } else {
      const dayKey = `day_${selectedDay}`;
      const dayLogs = log[dayKey] || [];
      dayLogs.forEach((entry: any) => {
        const desc = entry.description || "";
        const pId = entry.payload?.practiceId || "";
        if (desc.includes("Checked-in Prana")) checkinCount++;
        if (
          desc.includes("awareness_trigger") ||
          desc.includes("breath_reset") ||
          entry.action === "record_pause"
        )
          triggerCount++;
        if (pId === "practice_chant") mantraCount++;
        else if (pId === "practice_embody") sankalpCount++;
        else if (entry.action === "submit" && pId) coreCount++;
      });
    }

    const metrics_src = ss.checkpoint_metrics || {};
    const metricLabels = Object.keys(metrics_src)
      .map((k) => METRIC_ALLOWLIST[k])
      .filter(Boolean);
    const seriesA = {
      label: metricLabels[0] || "Consistency",
      points: [] as { x: number; y: number }[],
    };
    const seriesB = {
      label: metricLabels[1] || "Clarity",
      points: [] as { x: number; y: number }[],
    };

    for (let i = 1; i <= milestoneDayCount; i++) {
      const progress = (i - 1) / (milestoneDayCount - 1);
      const x = 20 + (i - 1) * (260 / (milestoneDayCount - 1));
      const valA = 3 + 2 * progress + ((i % 3) - 1) * 0.3;
      const valB = 2 + 2 * progress + ((i % 4) - 2) * 0.2;
      seriesA.points.push({ x, y: 100 - valA * 8 });
      seriesB.points.push({ x, y: 100 - valB * 8 });
    }

    const createPath = (pts: { x: number; y: number }[]) => {
      if (pts.length === 0) return "";
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const curr = pts[i],
          next = pts[i + 1];
        d += ` Q ${(curr.x + next.x) / 2} ${curr.y}, ${next.x} ${next.y}`;
      }
      return d;
    };

    const weeklyStats: any[] = [];
    const weeklyTotals = {
      checkinCount: 0,
      triggerCount: 0,
      mantraCount: 0,
      sankalpCount: 0,
      coreCount: 0,
    };
    for (let d = 1; d <= milestoneDayCount; d++) {
      let dc = 0,
        dt = 0,
        dm = 0,
        ds = 0,
        dcore = 0;
      if (beTrend && beTrend[d - 1]) {
        const t = beTrend[d - 1];
        dm = t.mantraSessions || 0;
        ds = t.sankalpEmbodied ? 1 : 0;
        dcore = t.practiceSessions || 0;
        dc = t.checkins || 0;
        dt = t.triggers || 0;
      } else {
        const dl = log[`day_${d}`] || [];
        dl.forEach((e: any) => {
          const desc = e.description || "",
            pId = e.payload?.practiceId || "";
          if (desc.includes("Checked-in Prana")) dc++;
          if (
            desc.includes("awareness_trigger") ||
            desc.includes("breath_reset") ||
            e.action === "record_pause"
          )
            dt++;
          if (pId === "practice_chant") dm++;
          else if (pId === "practice_embody") ds++;
          else if (e.action === "submit" && pId) dcore++;
        });
      }
      weeklyStats.push({ day: d, total: dc + dt + dm + ds + dcore });
      weeklyTotals.checkinCount += dc;
      weeklyTotals.triggerCount += dt;
      weeklyTotals.mantraCount += dm;
      weeklyTotals.sankalpCount += ds;
      weeklyTotals.coreCount += dcore;
    }

    return {
      activity: {
        checkinCount,
        triggerCount,
        mantraCount,
        sankalpCount,
        coreCount,
      },
      weeklyStats,
      weeklyTotals,
      maxWeeklyTotal: Math.max(...weeklyStats.map((s) => s.total), 1),
      trend: {
        pathA: createPath(seriesA.points),
        pathB: createPath(seriesB.points),
        currentA: seriesA.points[selectedDay - 1] || { x: 0, y: 0 },
        currentB: seriesB.points[selectedDay - 1] || { x: 0, y: 0 },
      },
      maxUnlockedDay: currentDay,
    };
  }, [
    ss.journey_log,
    ss.day_number,
    ss.checkpoint_metrics,
    selectedDay,
    milestoneDayCount,
    progressData,
  ]);

  const checkpointMetrics = useMemo(() => {
    return Object.entries(ss.checkpoint_metrics || {})
      .filter(([key]) => key in METRIC_ALLOWLIST)
      .map(([key, val]) => ({
        label: METRIC_ALLOWLIST[key],
        value: val as number,
      }));
  }, [ss.checkpoint_metrics]);

  const handleDecision = async (decision: string) => {
    const feelingMap: Record<string, string> = {
      continue_same: "steady",
      deepen: "strong",
      change_focus: "ready",
      continue: "steady",
      lighten: "heavy",
      reset: "ready",
    };
    store.dispatch(
      screenActions.setScreenValue({
        key: "checkpoint_decision",
        value: decision,
      }),
    );
    store.dispatch(
      screenActions.setScreenValue({
        key: "checkpoint_feeling",
        value: decision,
      }),
    );
    store.dispatch(
      screenActions.setScreenValue({
        key: "checkpoint_feeling_simple",
        value: feelingMap[decision] || "steady",
      }),
    );

    const body = {
      decision: decision as any,
      reflection: day7ReflectionText || ss.checkpoint_user_reflection || "",
    };

    try {
      const env = await mitraJourneyDay7Decision(
        body as any,
        String(uuidv4.v4()),
      );
      store.dispatch(
        screenActions.setScreenValue({
          key: "checkpoint_completed",
          value: true,
        }),
      );
      const nv = env?.next_view ?? { view_key: "", payload: {} };
      if (nv.view_key === "onboarding_start") {
        for (const k of [
          "journey_id",
          "day_number",
          "total_days",
          "arc_state",
          "continuity",
        ]) {
          store.dispatch(screenActions.setScreenValue({ key: k, value: null }));
        }
        store.dispatch(
          loadScreenWithData({
            containerId: "welcome_onboarding",
            stateId: "turn_1",
          }) as any,
        );
      } else {
        if (nv.payload && Object.keys(nv.payload).length > 0) {
          const flat = ingestDailyView(nv.payload as any);
          for (const [k, v] of Object.entries(flat)) {
            if (v !== undefined)
              store.dispatch(
                screenActions.setScreenValue({ key: k, value: v }),
              );
          }
        }
        // FIX-2: lighten confirmation — key off persisted cycle_burden_level, not transient flag
        if (
          decision === "lighten" &&
          (nv.payload as any)?.arc_state?.cycle_burden_level === "L0"
        ) {
          showToast("Your path has been lightened.", 4000, "info");
        }
        store.dispatch(
          loadScreenWithData({
            containerId: "companion_dashboard_v3",
            stateId: "day_active",
          }) as any,
        );
      }
    } catch (err: any) {
      console.warn(`[CycleReflectionBlock] day7 submit failed:`, err.message);
    }
  };

  const handleDecision14 = async (
    decision: string,
    carry: string,
    deepenAccepted?: boolean,
  ) => {
    const feelingMap: Record<string, string> = {
      continue_same: "steady",
      deepen: "strong",
      change_focus: "ready",
    };
    store.dispatch(
      screenActions.setScreenValue({
        key: "checkpoint_decision",
        value: decision,
      }),
    );
    store.dispatch(
      screenActions.setScreenValue({
        key: "checkpoint_feeling",
        value: decision,
      }),
    );
    store.dispatch(
      screenActions.setScreenValue({
        key: "checkpoint_feeling_simple",
        value: feelingMap[decision] || "steady",
      }),
    );

    const body: any = {
      decision,
      reflection: carry || ss.checkpoint_user_reflection || "",
      sealRitual: sealRitualText,
    };
    if (deepenAccepted && deepenSuggestion) {
      body.deepenAccepted = true;
      body.deepenItemType = deepenSuggestion.item_type || "";
      body.deepenItemId = deepenSuggestion.item_id || "";
    }

    try {
      const env = await mitraJourneyDay14Decision(
        body as any,
        String(uuidv4.v4()),
      );
      store.dispatch(
        screenActions.setScreenValue({
          key: "checkpoint_completed",
          value: true,
        }),
      );
      const nv = env?.next_view ?? { view_key: "", payload: {} };
      if (decision === "change_focus" || nv.view_key === "onboarding_start") {
        for (const k of [
          "journey_id",
          "day_number",
          "total_days",
          "arc_state",
          "continuity",
        ]) {
          store.dispatch(screenActions.setScreenValue({ key: k, value: null }));
        }
        store.dispatch(
          loadScreenWithData({
            containerId: "welcome_onboarding",
            stateId: "turn_1",
          }) as any,
        );
      } else {
        // continue_same or deepen: apply new cycle payload and route to dashboard immediately
        let pendingPayload = nv.payload;
        if (pendingPayload && Object.keys(pendingPayload).length > 0) {
          // FIX-6: strip the transient arc_complete=true that the BE inlines in the
          // decision response. Prevents duplicate finale/checkpoint triggers.
          if ((pendingPayload as any)?.arc_state?.arc_complete) {
            pendingPayload = {
              ...pendingPayload,
              arc_state: {
                ...(pendingPayload as any).arc_state,
                arc_complete: false,
              },
            };
          }
          const flat = ingestDailyView(pendingPayload as any);
          for (const [k, v] of Object.entries(flat)) {
            if (v !== undefined) {
              store.dispatch(
                screenActions.setScreenValue({ key: k, value: v }),
              );
            }
          }
        }
        // FIX-8: surface carryover count to user before navigating away
        const carriedCount = (env as any)?.carried_items_count ?? 0;
        if (carriedCount > 0) {
          showToast(
            carriedCount === 1
              ? "1 item carried forward to your new cycle."
              : `${carriedCount} items carried forward to your new cycle.`,
            4000,
            "info",
          );
        }
        store.dispatch(
          loadScreenWithData({
            containerId: "companion_dashboard_v3",
            stateId: "day_active",
          }) as any,
        );
      }
    } catch (err: any) {
      console.warn(`[CycleReflectionBlock] day14 submit failed:`, err.message);
    }
  };

  const onReflectJourney = () => {
    setShowIntro(false);
    setShowJourneyInvite(true);
  };
  const onSkipJourney = () => {
    setShowIntro(false);
    setIntroShown(true);
    setShowJourneyInvite(false);
    if (is14DayCycle) {
      setShowDecisions(true);
    }
  };

  const trendGraph = useMemo(() => {
    const tg = ss.checkpoint_trend_graph || {};
    return {
      engaged: (tg.engaged || []) as number[],
      fully_completed: (tg.fully_completed || []) as number[],
      labels: (tg.labels || []) as string[],
    };
  }, [ss.checkpoint_trend_graph]);

  const engagedTotal = useMemo(
    () => trendGraph.engaged.reduce((acc: number, v: number) => acc + v, 0),
    [trendGraph.engaged],
  );
  const completedTotal = useMemo(
    () =>
      trendGraph.fully_completed.reduce((acc: number, v: number) => acc + v, 0),
    [trendGraph.fully_completed],
  );

  const isDayEngaged = (dayNum: number) => {
    if (trendGraph.engaged.length > 0) {
      return !!trendGraph.engaged[dayNum - 1];
    }
    return journeyData.weeklyStats[dayNum - 1]?.total > 0;
  };

  const isDayCompleted = (dayNum: number) => {
    if (trendGraph.fully_completed.length > 0) {
      return !!trendGraph.fully_completed[dayNum - 1];
    }
    return false;
  };

  const d7 = (ss.checkpoint_day_7 || {}) as Record<string, any>;
  const d14 = (ss.checkpoint_day_14 || {}) as Record<string, any>;
  const decisionsAvailable: string[] = ss.day_7_decisions_available || [
    "continue",
  ];
  const strongestType: string = ss.checkpoint_strongest_type || "";
  const mitraReflection: string = ss.checkpoint_mitra_reflection || "";
  const decisionFraming: string = ss.checkpoint_decision_framing || "";
  const classifHeadline: string = ss.checkpoint_classification_headline || "";
  const classifBody: string = ss.checkpoint_classification_body || "";
  const deepenSuggestion: Record<string, any> | null =
    ss.checkpoint_deepen_suggestion || null;
  const decisionLayout: string =
    ss.checkpoint_decision_layout || "continue_first";

  if (showIntro && is7DayCycle) {
    const introHeadline = d7.intro_headline || "A Week Into Your Journey";
    const ctaLabel = d7.intro_cta_label || "Reflect on My Journey";
    return (
      <View style={styles.introContainer}>
        <View style={styles.introOverlay}>
          <View style={{ marginTop: 30, alignSelf: "center" }}>
            <Text style={styles.introTitleSpecial}>{introHeadline}</Text>
            <Text style={styles.introSubtitle}>
              {d7.body ||
                "A week ago, you began this journey with a simple intention."}
            </Text>
            <View style={styles.day14DividerRow}>
              <View style={styles.day14DividerLine} />
              <Text style={styles.day14DividerDiamond}>◆</Text>
              <View style={styles.day14DividerLine} />
            </View>
            <Text style={styles.intro7daytitle}>
              {d7.framing ||
                "Through Sankalp • Mantra • Practice, you have taken the first step inward."}
            </Text>
          </View>
          {/* <Image source={require("../../assets/new_home_lotus.png")} /> */}
          <View style={[styles.bottomGroup, { marginTop: 15 }]}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onReflectJourney}
            >
              <Text style={styles.primaryBtnText}>{ctaLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (showIntro && is14DayCycle) {
    const intro14Headline =
      day14Intro.title || d14.intro_headline || "You've completed 14 days";
    const intro14Body1 =
      day14Intro.bodyLine1 || d14.intro_body || "You stayed with it.";
    const intro14Body2 =
      day14Intro.bodyLine2 || "Even on the days it felt quiet or uncertain.";
    const intro14Closing =
      day14Intro.closing ||
      "Something within you has begun to shift — and it will continue, gently.";
    const intro14Cta =
      day14Intro.ctaLabel || d14.intro_cta_label || "Reflect on My Journey";
    return (
      <View style={styles.introContainer}>
        <View style={styles.introOverlay14Day}>
          <View style={styles.introTopCluster}>
            <Text style={styles.overlayTitleDark}>{intro14Headline}</Text>
            {/* <Day14Lotus width={600} /> */}
          </View>
          <View style={styles.day14Body}>
            <Text style={styles.day14BodyText}>{intro14Body1}</Text>
            <Text style={styles.day14BodyText}>{intro14Body2}</Text>
            <View style={styles.day14DividerRow}>
              <View style={styles.day14DividerLine} />
              <Text style={styles.day14DividerDiamond}>◆</Text>
              <View style={styles.day14DividerLine} />
            </View>
            <Text style={styles.day14BodyText}>{intro14Closing}</Text>
          </View>
          <View style={styles.day14ButtonWrap}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onReflectJourney}
            >
              <Text style={styles.primaryBtnText}>{intro14Cta}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // --- Consolidated Reflection View (Matches Images) ---
  if (
    !showJourneyInvite &&
    !showIntro &&
    !showDecisions &&
    (is7DayCycle || is14DayCycle)
  ) {
    return (
      <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 10 }}>
        {is7DayCycle && (
          <View style={styles.mirrorHeader}>
            <Text style={styles.microLabel}>DAY 7 • MIDPOINT</Text>
            <View style={styles.mirrorTitleRow}>
              <Text style={styles.mirrorTitleText}>Day 7 Reflection</Text>
              <View style={styles.engagedBadge}>
                <Text style={styles.engagedBadgeText}>Engaged</Text>
              </View>
            </View>
          </View>
        )}

        {is14DayCycle && (
          <View style={styles.mirrorHeader}>
            <Text style={styles.microLabel}>DAY 14 • EVOLUTION PIVOT</Text>
            {/* <View style={styles.mirrorTitleRow}>
              <Text style={styles.mirrorTitleText}>Synthesis & Reflection</Text>
              <View style={styles.engagedBadge}>
                <Text style={styles.engagedBadgeText}>Engaged</Text>
              </View>
            </View> */}
          </View>
        )}

        {is7DayCycle && (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Days Engaged</Text>
              <Text style={styles.statValue}>
                {engagedTotal} / {milestoneDayCount}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Fully Completed</Text>
              <Text style={styles.statValue}>
                {completedTotal} / {milestoneDayCount}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.mirrorCard}>
          <Text style={styles.mirrorCardTitle}>
            {is14DayCycle ? "14-Day Progress Graph" : "7-Day Continuity Mirror"}
          </Text>
          <Text style={styles.mirrorCardSubtitle}>
            {is14DayCycle
              ? "Engaged and fully completed across the full cycle"
              : "Your engagement over the last 7 days"}
          </Text>

          <View style={styles.visualMirror}>
            <View style={styles.mirrorLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: "#432104" }]} />
                <Text style={styles.legendText}>Engaged</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: "#D9914A" }]} />
                <Text style={styles.legendText}>Completed</Text>
              </View>
            </View>

            <View
              style={[styles.mirrorGridCompact, is14DayCycle && { gap: 4 }]}
            >
              {(is14DayCycle
                ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
                : [1, 2, 3, 4, 5, 6, 7]
              ).map((d) => (
                <View
                  key={d}
                  style={[styles.mirrorCol, is14DayCycle && { width: 14 }]}
                >
                  <View
                    style={[
                      styles.mirrorBlock,
                      isDayEngaged(d) && { backgroundColor: "#e8d8c3" },
                      is14DayCycle && { width: 14, height: 10 },
                    ]}
                  />
                  <View
                    style={[
                      styles.mirrorBlock,
                      isDayCompleted(d) && { backgroundColor: "#D9914A" },
                      is14DayCycle && { width: 14, height: 10 },
                    ]}
                  />
                </View>
              ))}
            </View>
          </View>
        </View>

        {is14DayCycle && (
          <View style={styles.mirrorCard}>
            <Text style={styles.mirrorCardTitle}>Baseline Comparison</Text>
            <Text style={styles.mirrorCardSubtitle}>
              Then vs now across your tracked baseline metrics
            </Text>

            <View style={styles.comparisonArea}>
              <ComparisonRow
                label="Days Engaged"
                thenVal="2/10"
                nowVal="2/10"
              />
              <ComparisonRow
                label="Fully Completed"
                thenVal="0/10"
                nowVal="0/10"
              />
              <ComparisonRow
                label="Total Days"
                thenVal="14/10"
                nowVal="14/10"
              />
            </View>
          </View>
        )}

        {is14DayCycle && (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Strongest Area</Text>
              <Text style={styles.statValue}>Mantra</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Consistency Score</Text>
              <Text style={styles.statValue}>0%</Text>
            </View>
          </View>
        )}

        <View style={styles.mitraSection}>
          <View style={styles.mitraBadge}>
            <Text style={styles.mitraBadgeText}>MITRA REFLECTION</Text>
          </View>
          <View style={styles.mitraContent}>
            {!!strongestType && (
              <View style={[styles.pill, { backgroundColor: "#eaf4e9" }]}>
                <Text style={[styles.pillText, { color: "#2D7A5F" }]}>
                  Strongest area: {strongestType}
                </Text>
              </View>
            )}
            {!!mitraReflection && (
              <Text style={styles.mitraText}>{mitraReflection}</Text>
            )}
          </View>
        </View>

        {/* Day 7 — reflection input (BUG-4) */}
        {/* {is7DayCycle && (
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.microLabel, { marginBottom: 8 }]}>
              {d7.reflection_prompt_label || "WHAT DO YOU CARRY FORWARD?"}
            </Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.inputField}
                value={day7ReflectionText}
                onChangeText={setDay7ReflectionText}
                placeholder={
                  d7.reflection_placeholder ||
                  "What from this week feels worth continuing?"
                }
                placeholderTextColor="#b8a898"
                multiline
                numberOfLines={3}
                maxLength={1000}
                textAlignVertical="top"
                testID="checkpoint_day_7_reflection_input"
              />
            </View>
          </View>
        )} */}

        {/* Day 7 — decision buttons inline, driven by BE decisions_available */}
        {is7DayCycle && (
          <View style={{ marginTop: 16, gap: 10 }}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => handleDecision("continue")}
            >
              <Text style={styles.primaryBtnText}>
                {d7.cta_continue_label || "Continue My Path"}
              </Text>
            </TouchableOpacity>
            {decisionsAvailable.includes("lighten") && (
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: "#c8a97a" }]}
                onPress={() => handleDecision("lighten")}
              >
                <Text style={styles.primaryBtnText}>
                  {d7.cta_lighten_label || "Lighten"}
                </Text>
              </TouchableOpacity>
            )}
            {decisionsAvailable.includes("reset") && (
              <TouchableOpacity
                style={styles.skipBtn}
                onPress={() => handleDecision("reset")}
              >
                <Text style={styles.skipBtnText}>
                  {d7.cta_start_fresh_label || "Start Fresh"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {is7DayCycle && !!decisionFraming && (
          <Text style={styles.footerSummaryText}>{decisionFraming}</Text>
        )}

        {/* Day 14 — navigate to classification + decision screen (Screen 4) */}
        {is14DayCycle && (
          <TouchableOpacity
            style={styles.goldActionBtn}
            onPress={() => setShowDecisions(true)}
          >
            <Text style={styles.goldActionBtnText}>
              {d14.graph_cta || "Continue to Choices →"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  }

  // --- Screen 4 (Day 14 only): Classification verdict + Decision buttons ---
  if (showDecisions && is14DayCycle) {
    const completedDays = completedTotal;
    const totalDays14 = milestoneDayCount;
    const ceremony14 = ss.completion_ceremony || {};
    const fullCompleted = ceremony14.completed_days ?? completedDays;

    // Determine which decisions to show based on completion + decision_layout.
    // Deepen is only offered when BE has a valid distinct suggestion; null = no valid item exists.
    const showDeepen =
      !!deepenSuggestion &&
      (ss.day_14_decisions_available || []).includes("deepen") &&
      (decisionLayout === "deepen_first" ||
        decisionLayout === "continue_first");
    const showRestart = decisionLayout === "restart_rhythm";
    const deepenFirst = decisionLayout === "deepen_first";
    const deepenSuggestionTitle = String(deepenSuggestion?.title || "").trim();
    const deepenCtaLabel = deepenSuggestionTitle
      ? `${d14.deepen_practice_cta || "Deepen  Practice"}: ${deepenSuggestionTitle}`
      : d14.deepen_practice_cta || "Deepen  Practice";

    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      >
        {/* Classification verdict card */}
        {!!classifHeadline && (
          <View style={styles.classificationCard}>
            <Text style={styles.classificationHeadline}>{classifHeadline}</Text>
            <View style={styles.day14DividerRow}>
              <View style={styles.day14DividerLine} />
              <Text style={styles.day14DividerDiamond}>◆</Text>
              <View style={styles.day14DividerLine} />
            </View>
            {!!classifBody && (
              <Text style={styles.classificationBody}>{classifBody}</Text>
            )}
          </View>
        )}

        {/* Deepen preview card — shown if suggestion is available and user hasn't confirmed yet */}
        {showDeepen && deepenSuggestion && !deepenConfirmed && (
          <View style={styles.deepenPreviewCard}>
            <View
              style={[
                styles.pill,
                { backgroundColor: "#ede4f7", alignSelf: "flex-start" },
              ]}
            >
              <Text style={[styles.pillText, { color: "#9067C6" }]}>
                {deepenSuggestion.item_type || "practice"}
              </Text>
            </View>
            {!!deepenSuggestion.title && (
              <Text style={styles.deepenTitle}>{deepenSuggestion.title}</Text>
            )}
            {!!deepenSuggestion.preview && (
              <Text style={styles.deepenPreview}>
                {deepenSuggestion.preview}
              </Text>
            )}
            {!!deepenSuggestionTitle && (
              <Text style={styles.deepenHint}>
                Choosing ‘Deepen Practice’ gently begins the{" "}
                {deepenSuggestionTitle}
              </Text>
            )}
          </View>
        )}

        {/* Seal This Cycle input */}
        {/* <Text style={[styles.microLabel, { marginBottom: 8 }]}>
          {d14.seal_cycle_label || "SEAL THIS CYCLE"}
        </Text>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.inputField}
            value={sealRitualText}
            onChangeText={setSealRitualText}
            placeholder={
              d14.seal_input_placeholder || "What deserves to be remembered?"
            }
            placeholderTextColor="#b8a898"
            multiline
            numberOfLines={3}
            maxLength={300}
            textAlignVertical="top"
            testID="checkpoint_day_14_seal_input"
          />
        </View>

        <Text style={[styles.microLabel, { marginBottom: 8, marginTop: 16 }]}>
          {d14.carry_label || "CARRY FORWARD"}
        </Text>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.inputField}
            value={carryReflection}
            onChangeText={setCarryReflection}
            placeholder={
              d14.carry_input_placeholder || "How will you continue?"
            }
            placeholderTextColor="#b8a898"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View> */}

        {/* Decision buttons */}
        <View style={{ gap: 12, marginTop: 20 }}>
          {showRestart && (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => handleDecision14("continue_same", carryReflection)}
            >
              <Text style={styles.primaryBtnText}>
                {d14.restart_cta || "Start a New 14-Day Rhythm"}
              </Text>
            </TouchableOpacity>
          )}

          {!showRestart && deepenFirst && showDeepen && (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => handleDecision14("deepen", carryReflection, true)}
            >
              <Text style={styles.primaryBtnText}>
                {d14.deepen_practice_cta || "Deepen Practice"}
              </Text>
            </TouchableOpacity>
          )}

          {!showRestart && (
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                deepenFirst && { backgroundColor: "#c8a97a" },
              ]}
              onPress={() => handleDecision14("continue_same", carryReflection)}
            >
              <Text style={styles.primaryBtnText}>
                {d14.continue_path_cta || "Continue Same Path"}
              </Text>
            </TouchableOpacity>
          )}

          {!showRestart && !deepenFirst && showDeepen && (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: "#c8a97a" }]}
              onPress={() => handleDecision14("deepen", carryReflection, true)}
            >
              <Text style={styles.primaryBtnText}>{deepenCtaLabel}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => handleDecision14("change_focus", carryReflection)}
          >
            <Text style={styles.skipBtnText}>
              {d14.change_focus_cta || "Change Focus"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // --- Day 14 Finale (BUG-5) ---
  // Shown after continue_same / deepen decision, before routing to cycle 2.
  if (showFinale && is14DayCycle) {
    const ceremony = ss.completion_ceremony || {};
    const m25 = ss.m25_narrative || {};
    const finaleHeadline =
      m25.intro_headline || ceremony.sovereignty_line || "A new cycle begins.";
    const finaleNarrative =
      typeof m25.narrative_template === "string" && m25.narrative_template
        ? m25.narrative_template
            .replace("{completed_count}", String(ceremony.completed_days ?? ""))
            .replace("{total_days}", String(ceremony.total_days ?? 14))
        : "";
    const finaleSovereignty = ceremony.sovereignty_line || "";
    const handleFinaleContinue = () => {
      let pendingPayload = ss._pending_daily_view;
      if (pendingPayload && Object.keys(pendingPayload).length > 0) {
        // FIX-6: strip the transient arc_complete=true that the BE inlines in the
        // decision response. The finale already consumed this signal; the next
        // daily-view GET will return false. Prevents duplicate finale on re-open.
        if ((pendingPayload as any)?.arc_state?.arc_complete) {
          pendingPayload = {
            ...pendingPayload,
            arc_state: {
              ...(pendingPayload as any).arc_state,
              arc_complete: false,
            },
          };
        }
        const flat = ingestDailyView(pendingPayload as any);
        for (const [k, v] of Object.entries(flat)) {
          if (v !== undefined)
            store.dispatch(screenActions.setScreenValue({ key: k, value: v }));
        }
      }
      store.dispatch(
        screenActions.setScreenValue({
          key: "_pending_daily_view",
          value: null,
        }),
      );
      // FIX-8: surface carryover count to user before navigating away
      const carriedCount = ss._pending_carried_count ?? 0;
      if (carriedCount > 0) {
        showToast(
          carriedCount === 1
            ? "1 item carried forward to your new cycle."
            : `${carriedCount} items carried forward to your new cycle.`,
          4000,
          "info",
        );
      }
      store.dispatch(
        screenActions.setScreenValue({
          key: "_pending_carried_count",
          value: null,
        }),
      );
      store.dispatch(
        screenActions.setScreenValue({
          key: "_pending_daily_view",
          value: null,
        }),
      );
      store.dispatch(
        loadScreenWithData({
          containerId: "companion_dashboard_v3",
          stateId: "day_active",
        }) as any,
      );
    };
    return (
      <View style={styles.introContainer} testID="checkpoint_day_14_finale">
        <View style={styles.introOverlay14Day}>
          <View style={styles.introTopCluster}>
            <Text style={styles.overlayTitleDark}>{finaleHeadline}</Text>
            {/* <Day14Lotus width={600} /> */}
          </View>
          <View style={styles.day14Body}>
            {!!finaleNarrative && (
              <Text style={styles.day14BodyText}>{finaleNarrative}</Text>
            )}
            {!!finaleSovereignty && (
              <>
                <View style={styles.day14DividerRow}>
                  <View style={styles.day14DividerLine} />
                  <Text style={styles.day14DividerDiamond}>◆</Text>
                  <View style={styles.day14DividerLine} />
                </View>
                <Text style={[styles.day14BodyText, { fontStyle: "italic" }]}>
                  {finaleSovereignty}
                </Text>
              </>
            )}
          </View>
          <View style={styles.day14ButtonWrap}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleFinaleContinue}
            >
              <Text style={styles.primaryBtnText}>
                {d14.begin_cycle_cta || "Begin Cycle 2"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (showJourneyInvite) {
    return (
      <View style={{ marginTop: 30 }}>
        <ScrollView>
          <View style={styles.journeyHeader}>
            <Text style={styles.journeyTitle}>
              Your {milestoneDayCount}-Day Journey
            </Text>
            <Text style={[styles.sevendayContent, { marginBottom: 60 }]}>
              Tap a day to see your progress
            </Text>
          </View>
          <View style={styles.weeksWrapper}>
            {/* <Day14Lotus style={styles.lotus} /> */}
            <View style={styles.weeksContainer}>
              {(() => {
                const dailyRhythm: { day: number; state: string }[] =
                  ss.today?.cycle_metrics?.daily_rhythm || [];
                return [1, 2].map(
                  (w) =>
                    (w === 1 || milestoneDayCount === 14) && (
                      <BlurView
                        key={w}
                        intensity={60}
                        tint="light"
                        style={styles.weekCard}
                      >
                        <Text style={styles.weekLabel}>Week {w}</Text>
                        <View style={styles.daysGrid}>
                          {[1, 2, 3, 4, 5, 6, 7].map((d) => {
                            const dayNum = (w - 1) * 7 + d;
                            const isLocked =
                              dayNum > journeyData.maxUnlockedDay;
                            const isToday = dayNum === ss.day_number;
                            const dayState = !isLocked
                              ? dailyRhythm.find((r) => r.day === dayNum)?.state
                              : undefined;
                            return (
                              <TouchableOpacity
                                key={d}
                                style={[
                                  styles.dayItem,
                                  isToday && styles.dayToday,
                                ]}
                                onPress={() => {
                                  if (!isLocked) {
                                    setSelectedDay(dayNum);
                                    setShowJourneyView(true);
                                  }
                                }}
                              >
                                <View
                                  style={[
                                    styles.dayCircle,
                                    isLocked && styles.dayCircleLocked,
                                    dayState === "done" && styles.dayCircleDone,
                                    dayState === "missed" &&
                                      styles.dayCircleMissed,
                                  ]}
                                >
                                  {!isLocked ? (
                                    <Text style={styles.dayNum}>{dayNum}</Text>
                                  ) : (
                                    <Text style={{ fontSize: 10 }}>🔒</Text>
                                  )}
                                </View>
                                <Text style={styles.dayText}>Day {dayNum}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </BlurView>
                    ),
                );
              })()}
            </View>
          </View>
          <TouchableOpacity style={styles.skipBtn} onPress={onSkipJourney}>
            <Text style={styles.skipBtnText}>Skip</Text>
          </TouchableOpacity>
        </ScrollView>

        <Modal visible={showJourneyView} animationType="slide" transparent>
          <View style={styles.modalRoot}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={styles.tabsRow}>
                  <TouchableOpacity
                    onPress={() => setActiveTab("day")}
                    style={[
                      styles.tab,
                      activeTab === "day" && styles.tabActive,
                    ]}
                  >
                    <Text style={styles.tabText}>Day</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setActiveTab("weekly")}
                    style={[
                      styles.tab,
                      activeTab === "weekly" && styles.tabActive,
                    ]}
                  >
                    <Text style={styles.tabText}>Weekly</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => setShowJourneyView(false)}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView>
                {activeTab === "day" ? (
                  <View>
                    <View style={styles.trendBox}>
                      <Text style={styles.trendTitle}>Growth Trend</Text>
                      <Svg width="300" height="120" viewBox="0 0 300 120">
                        <Path
                          d={journeyData.trend.pathA}
                          stroke="#2D7A5F"
                          strokeWidth="3"
                          fill="none"
                        />
                        <Path
                          d={journeyData.trend.pathB}
                          stroke="#D9A557"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray="4,4"
                        />
                        <Circle
                          cx={journeyData.trend.currentA.x}
                          cy={journeyData.trend.currentA.y}
                          r="4"
                          fill="white"
                          stroke="#2D7A5F"
                          strokeWidth="2"
                        />
                        <Circle
                          cx={journeyData.trend.currentB.x}
                          cy={journeyData.trend.currentB.y}
                          r="4"
                          fill="white"
                          stroke="#D9A557"
                          strokeWidth="2"
                        />
                      </Svg>
                    </View>
                    <ActivityList activity={journeyData.activity} />
                  </View>
                ) : (
                  <View>
                    <View style={styles.trendBox}>
                      <Text style={styles.trendTitle}>Weekly Engagement</Text>
                      <View style={styles.barChart}>
                        {journeyData.weeklyStats.map((s) => (
                          <View key={s.day} style={styles.barCol}>
                            <View style={styles.barTrack}>
                              <View
                                style={[
                                  styles.barFill,
                                  {
                                    height: `${(s.total / journeyData.maxWeeklyTotal) * 100}%`,
                                  },
                                ]}
                              />
                            </View>
                            <Text style={styles.barLabel}>{s.day}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    <ActivityList
                      activity={journeyData.weeklyTotals}
                      isWeekly
                    />
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#D9A557" />
    </View>
  );
};

const ActivityList = ({
  activity,
  isWeekly,
}: {
  activity: any;
  isWeekly?: boolean;
}) => {
  const items = [
    { label: "Check-Ins", count: activity.checkinCount, color: "#3A8FB7" },
    { label: "Triggers", count: activity.triggerCount, color: "#D9A557" },
    { label: "Mantra", count: activity.mantraCount, color: "#9067C6" },
    { label: "Sankalp", count: activity.sankalpCount, color: "#2D7A5F" },
    { label: "Core", count: activity.coreCount, color: "#E97451" },
  ];
  return (
    <View style={styles.activityStatsList}>
      {items.map((item) => (
        <View key={item.label} style={styles.activityItem}>
          <View
            style={[styles.activityIcon, { backgroundColor: item.color }]}
          />
          <View style={styles.activityDetails}>
            <Text style={styles.activityName}>{item.label}</Text>
            <View style={styles.activityProgressBg}>
              <View
                style={[
                  styles.activityProgressBar,
                  {
                    backgroundColor: item.color,
                    width: `${Math.min(item.count * (isWeekly ? 5 : 25), 100)}%`,
                  },
                ]}
              />
            </View>
          </View>
          <Text style={styles.activityCount}>{item.count}</Text>
        </View>
      ))}
    </View>
  );
};

const DecisionBtn = ({ label, id, onPress, isPrimary, isSecondary }: any) => (
  <TouchableOpacity
    style={[styles.decisionBtn, isSecondary && styles.decisionBtnSecondary]}
    onPress={() => onPress(id)}
  >
    <Text style={styles.decisionBtnLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  introContainer: { flex: 1 },
  introOverlay: {
    // flex: 1,
    // paddingHorizontal: 28,
    // paddingTop: 72,
    // paddingBottom: 48,
    justifyContent: "space-between",
  },
  introOverlay14Day: {
    flex: 1,
    paddingHorizontal: 28,
    paddingBottom: 56,
    justifyContent: "space-between",
    alignItems: "center",
  },
  introTopCluster: {
    alignItems: "center",
    gap: 20,
    marginTop: 40,
  },
  visualHeader7Day: { marginTop: 100 },
  introTitleSpecial: {
    fontFamily: Fonts.serif.bold,
    fontSize: 28,
    color: "#4a2f1a",
    alignSelf: "center",
    // marginBottom: 20,
  },
  introSubtitle: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#5e4533",
    alignSelf: "center",
    textAlign: "center",
    paddingHorizontal: 15,
    marginTop: 10,
  },
  intro7daytitle: {
    fontFamily: Fonts.serif.regular,
    paddingHorizontal: 10,
    marginTop: 10,
    fontSize: 16,
    color: "#5e4533",
    alignSelf: "center",
    textAlign: "center",
  },
  overlayTitleDark: {
    position: "absolute",

    top: "20%",

    fontFamily: Fonts.serif.bold,

    fontSize: 25,

    color: "#3f2918",

    textAlign: "center",
  },
  day14Body: {
    alignItems: "center",
    gap: 10,
    marginTop: -150,
    // maxWidth: 320,
  },
  day14BodyText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 19,
    lineHeight: 29,
    color: "#4e3623",
    textAlign: "center",
  },
  day14DividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 8,
    alignSelf: "center",
  },
  day14DividerLine: {
    width: 64,
    height: 1,
    backgroundColor: "rgba(217,165,87,0.6)",
  },
  day14DividerDiamond: {
    color: "#D9A557",
    fontSize: 12,
  },
  day14ClosingText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 17,
    lineHeight: 30,
    color: "#6b4c35",
    textAlign: "center",
    fontStyle: "italic",
  },
  day14ButtonWrap: {
    width: "100%",
    alignItems: "center",
    // marginBottom: 16,
    marginTop: 20,
  },
  primaryBtn: {
    backgroundColor: "#D9A557",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 30,
    alignItems: "center",
    alignSelf: "center",
    minWidth: 250,
  },
  primaryBtnText: { fontFamily: Fonts.sans.bold, fontSize: 16, color: "#fff" },
  bottomGroup: { marginBottom: 40 },

  journeyContent: {},
  journeyHeader: { alignItems: "center", marginBottom: 30 },
  journeyTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 24,
    color: "#432104",
  },
  sevendayContent: {
    position: "absolute",

    top: "170%",

    fontFamily: Fonts.serif.bold,

    fontSize: 16,

    color: "#3f2918",

    textAlign: "center",
    alignSelf: "center",
  },
  weeksContainer: { gap: 20, padding: 10 },
  weekCard: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 24,

    // VERY IMPORTANT for glass effect
    overflow: "hidden",

    // Fallback for Android
    backgroundColor: "rgba(255,255,255,0.18)",

    // Glass border
    borderWidth: 1,
    borderColor: "#D9A557",

    // Shadow (depth)
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },

    elevation: 8, // Android
  },
  weeksWrapper: {
    position: "relative",
    marginTop: 40,
  },

  lotus: {
    position: "absolute",
    top: -30,
    alignSelf: "center",
    width: 120,
    height: 60,
  },

  weekLabel: {
    fontFamily: Fonts.sans.bold,
    fontSize: 16,
    color: "#432104",
    marginBottom: 15,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  dayItem: { width: "22%", alignItems: "center", marginBottom: 15 },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D9A557",
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleLocked: { backgroundColor: "#f0f0f0", borderColor: "#ccc" },
  dayCircleDone: {
    backgroundColor: "#e8f4e8",
    borderColor: "#2d7a5f",
    borderWidth: 2,
  },
  dayCircleMissed: { backgroundColor: "#f5f5f5", borderColor: "#c9b19a" },
  dayNum: { fontFamily: Fonts.sans.bold, fontSize: 14, color: "#432104" },
  dayText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 10,
    color: "#8c7355",
    marginTop: 5,
  },
  statusMarker: {
    position: "absolute",
    top: -5,
    right: 20,
    zIndex: 1,
    alignItems: "center",
  },
  todayTag: {
    backgroundColor: "#D9A557",
    color: "#fff",
    fontSize: 8,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  dayToday: { transform: [{ scale: 1.1 }] },
  overallProgressCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  progressLabel: {
    fontFamily: Fonts.sans.bold,
    fontSize: 14,
    color: "#432104",
  },
  progressValue: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: "#8c7355",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressBarBg: { height: 8, backgroundColor: "#f0f0f0", borderRadius: 4 },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#D9A557",
    borderRadius: 4,
  },
  skipBtn: { alignItems: "center" },
  skipBtnText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 16,
    color: "#8c7355",
    textDecorationLine: "underline",
  },

  modalRoot: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fffdf8",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: "60%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  tabsRow: { flexDirection: "row", gap: 20 },
  tab: {
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: "#D9A557" },
  tabText: { fontFamily: Fonts.sans.medium, fontSize: 16, color: "#8c7355" },
  closeBtnText: { fontSize: 24, color: "#8c7355" },
  trendBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    alignItems: "center",
  },
  trendTitle: { fontFamily: Fonts.sans.bold, fontSize: 14, color: "#8c7355" },
  barChart: {
    flexDirection: "row",
    height: 100,
    gap: 8,
    alignItems: "flex-end",
    marginTop: 10,
  },
  barCol: { flex: 1, alignItems: "center" },
  barTrack: {
    flex: 1,
    width: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    justifyContent: "flex-end",
  },
  barFill: { width: "100%", backgroundColor: "#D9A557", borderRadius: 4 },
  barLabel: { fontSize: 10, color: "#8c7355", marginTop: 4 },

  activityStatsList: { marginTop: 20 },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 15,
  },
  activityIcon: { width: 8, height: 8, borderRadius: 4 },
  activityDetails: { flex: 1 },
  activityName: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: "#432104",
  },
  activityProgressBg: {
    height: 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 2,
  },
  activityProgressBar: { height: "100%", borderRadius: 2 },
  activityCount: { fontFamily: Fonts.sans.bold, fontSize: 14 },

  reflectionRoot: { flex: 1 },
  reflectionContent: { padding: 20, paddingTop: 40, paddingBottom: 80 },
  lotusHeaderCard: { alignItems: "center", marginBottom: 20 },
  reflectionCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    borderColor: "#D9A557",
    borderWidth: 0.5,
  },
  cardTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 24,
    color: "#432104",
    marginBottom: 20,
  },
  textArea: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#D9A557",
    borderRadius: 12,
    padding: 15,
    minHeight: 120,
    textAlignVertical: "top",
    color: "#432104",
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 30,
  },
  metricChip: {
    backgroundColor: "#f9f6f2",
    padding: 12,
    borderRadius: 12,
    flex: 1,
    minWidth: "40%",
  },
  metricLabel: { fontSize: 10, color: "#8c7355" },
  metricValue: { fontFamily: Fonts.sans.bold, fontSize: 16, color: "#432104" },
  decisionList: { gap: 15 },
  decisionBtn: {
    backgroundColor: "#FBF5F5",
    borderWidth: 1,
    borderColor: "#9f9f9f",
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
  },
  decisionBtnSecondary: { backgroundColor: "#fff" },
  decisionBtnLabel: {
    fontFamily: Fonts.sans.bold,
    fontSize: 16,
    color: "#432104",
  },
  // New Mirror Styles
  mirrorHeader: { marginBottom: 20 },
  microLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 12,
    color: "#8c7355",
    letterSpacing: 1,
    textTransform: "uppercase",
    alignSelf: "center",
  },
  mirrorTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  mirrorTitleText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 26,
    color: "#432104",
  },
  engagedBadge: {
    backgroundColor: "#f2e6d9",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  engagedBadgeText: {
    fontFamily: Fonts.sans.bold,
    fontSize: 12,
    color: "#a67c52",
  },
  statsRow: { flexDirection: "row", gap: 15, marginBottom: 20 },
  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(217, 165, 87, 0.2)",
  },
  statLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 12,
    color: "#8c7355",
    marginBottom: 8,
  },
  statValue: {
    fontFamily: Fonts.serif.bold,
    fontSize: 24,
    color: "#432104",
  },
  mirrorCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#f0e0d0",
  },
  mirrorCardTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: "#432104",
    marginBottom: 4,
  },
  mirrorCardSubtitle: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#8c7355",
    marginBottom: 15,
  },
  visualMirror: { gap: 15 },
  mirrorLegend: { gap: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: Fonts.sans.medium, fontSize: 13, color: "#432104" },
  mirrorGridCompact: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    marginTop: 10,
  },
  mirrorCol: { gap: 6 },
  mirrorBlock: {
    width: 35,
    height: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 2,
  },
  mitraSection: {
    backgroundColor: "#fdf8f3",
    borderRadius: 20,
    padding: 20,
    position: "relative",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(217, 165, 87, 0.1)",
  },
  mitraBadge: {
    position: "absolute",
    top: -10,
    right: 20,
    backgroundColor: "#d9a557",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mitraBadgeText: {
    fontFamily: Fonts.sans.bold,
    fontSize: 10,
    color: "#fff",
  },
  mitraContent: { marginTop: 5 },
  pill: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  pillText: { fontFamily: Fonts.sans.bold, fontSize: 12 },
  mitraText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    fontStyle: "italic",
    color: "#432104",
    lineHeight: 22,
  },
  footerSummaryText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    color: "#8c7355",
    textAlign: "center",
    // marginVertical: 30,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  goldActionBtn: {
    backgroundColor: "#d9a557",
    borderRadius: 30,
    // paddingVertical: 20,
    alignItems: "center",
    // marginBottom: 40,
    marginTop: 20,
    padding: 10,
  },
  goldActionBtnText: {
    fontFamily: Fonts.sans.bold,
    fontSize: 16,
    color: "#fff",
  },
  // Screen 4 — classification + decision
  classificationCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(217, 165, 87, 0.3)",
  },
  classificationHeadline: {
    fontFamily: Fonts.serif.bold,
    fontSize: 22,
    color: "#432104",
    textAlign: "center",
    marginBottom: 8,
  },
  classificationBody: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    lineHeight: 26,
    color: "#5e4533",
    textAlign: "center",
  },
  deepenPreviewCard: {
    backgroundColor: "#f5f0fa",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(144, 103, 198, 0.3)",
  },
  deepenTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 17,
    color: "#432104",
    marginTop: 8,
    marginBottom: 4,
  },
  deepenPreview: {
    fontFamily: Fonts.serif.regular,
    fontSize: 14,
    color: "#6b4c35",
    lineHeight: 22,
  },
  deepenHint: {
    marginTop: 10,
    fontFamily: Fonts.sans.medium,
    fontSize: 12,
    color: "#5b3c7e",
  },
  inputWrap: {
    backgroundColor: "#fafaf8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(217, 165, 87, 0.4)",
    padding: 12,
    minHeight: 100,
    marginBottom: 20,
  },
  inputField: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    color: "#432104",
    lineHeight: 24,
    minHeight: 80,
  },
  // Comparison Rows
  comparisonArea: { gap: 20, marginTop: 15 },
  comparisonItem: { gap: 10 },
  comparisonLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  comparisonLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 13,
    color: "#432104",
  },
  comparisonValue: {
    fontFamily: Fonts.sans.bold,
    fontSize: 13,
    color: "#432104",
  },
  comparisonProgressRow: { flexDirection: "row", gap: 10 },
  progressSegment: {
    flex: 1,
    height: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 6 },
});

const ComparisonRow = ({ label, thenVal, nowVal }: any) => (
  <View style={styles.comparisonItem}>
    <View style={styles.comparisonLabelRow}>
      <Text style={styles.comparisonLabel}>{label}</Text>
      <Text style={styles.comparisonValue}>
        {thenVal} → {nowVal}
      </Text>
    </View>
    <View style={styles.comparisonProgressRow}>
      <View style={styles.progressSegment}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: "#d4c3ab", width: "25%" },
          ]}
        />
      </View>
      <View style={styles.progressSegment}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: "#2d7a5f", width: "30%" },
          ]}
        />
      </View>
    </View>
  </View>
);

export default CycleReflectionBlock;

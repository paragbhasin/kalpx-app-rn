import { BlurView } from "expo-blur";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import uuidv4 from "react-native-uuid";
import {
  mitraJourneyDay14Decision,
  mitraJourneyDay14View,
  mitraJourneyDay7Decision,
  mitraJourneyDay7View,
} from "../engine/mitraApi";
import { useScreenStore } from "../engine/useScreenBridge";
import { ingestDay14View, ingestDay7View } from "../engine/v3Ingest";
import store from "../store";
import { loadScreenWithData, screenActions } from "../store/screenSlice";
import { Fonts } from "../theme/fonts";

// Assets (imported as components via react-native-svg-transformer)
import Day14Lotus from "../../assets/14_day_lotus.svg";

// Raster assets
const Day14Bg = require("../../assets/14_day_bg.jpg");
const Day7Bg = require("../../assets/7day_screen.png");
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
  const { screenData } = useScreenStore();
  const ss = screenData as Record<string, any>;

  const is14DayCycle = useMemo(() => {
    const day = Number(ss.day_number || ss.checkpoint_day || 0);
    return (
      day === 14 ||
      day === 1 ||
      ss.checkpoint_tag === "14-DAY COMPLETION" ||
      ss.checkpoint_tag === "CYCLE REFLECTION" ||
      // ingestDay14View sets checkpoint_day_14 (object) but not checkpoint_tag
      !!ss.checkpoint_day_14
    );
  }, [
    ss.day_number,
    ss.checkpoint_day,
    ss.checkpoint_tag,
    ss.checkpoint_day_14,
  ]);

  const is7DayCycle = useMemo(() => {
    return (
      ss.checkpoint_tag === "7-DAY CHECKPOINT" ||
      ss.checkpoint_tag === "7-DAY COMPLETION" ||
      ss.checkpoint_tag === "MIDWAY REFLECTION" ||
      ss.checkpoint_tag === "MIDPOINT REFLECTION" ||
      (ss.checkpoint_day === 7 && !is14DayCycle) ||
      // ingestDay7View sets checkpoint_day_7 (object) but NOT checkpoint_tag / checkpoint_day
      // This is the primary detection path for API-driven 7-day cycles
      (!is14DayCycle && !!ss.checkpoint_day_7)
    );
  }, [ss.checkpoint_tag, ss.checkpoint_day, ss.checkpoint_day_7, is14DayCycle]);

  const [showIntro, setShowIntro] = useState(true);
  const [showJourneyInvite, setShowJourneyInvite] = useState(false);
  const [showJourneyView, setShowJourneyView] = useState(false);
  const [introShown, setIntroShown] = useState(false);
  const updateBackground = useScreenStore((state) => state.updateBackground);
  const updateHeaderHidden = useScreenStore(
    (state) => state.updateHeaderHidden,
  );

  // Compute background directly from raw day number so it is set correctly
  // on the FIRST render — before is7DayCycle/is14DayCycle memos have a chance
  // to trigger a re-render. checkpoint_day is written to the store BEFORE
  // navigation so it is always available at mount time.
  const screenBackground = useMemo(() => {
    const rawDay = Number(ss.checkpoint_day || ss.day_number || 0);
    if (showIntro || showJourneyInvite) {
      if (rawDay === 14 || is14DayCycle) return Day14Bg;
      if (rawDay === 7 || is7DayCycle) return Day7Bg;
    }
    return BeigeBg;
  }, [
    showIntro,
    showJourneyInvite,
    ss.checkpoint_day,
    ss.day_number,
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
    const day = Number(ss.day_number || ss.checkpoint_day || 0);
    if ((day === 7 || day === 14 || day === 1) && !ss.checkpoint_headline) {
      (async () => {
        const fetcher =
          day === 14 || day === 1
            ? mitraJourneyDay14View
            : mitraJourneyDay7View;
        const result = await fetcher();
        if (result.envelope) {
          const ingester =
            day === 14 || day === 1 ? ingestDay14View : ingestDay7View;
          const flat = ingester(result.envelope as any);
          for (const [k, v] of Object.entries(flat)) {
            if (v !== undefined) {
              store.dispatch(
                screenActions.setScreenValue({ key: k, value: v }),
              );
            }
          }
        }
      })();
    }
  }, [ss.day_number, ss.checkpoint_day, ss.checkpoint_headline]);

  useEffect(() => {
    if ((is7DayCycle || is14DayCycle) && !introShown) {
      setShowIntro(true);
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

  const milestoneDayCount = is14DayCycle ? 14 : 7;

  const journeyData = useMemo(() => {
    const log = ss.journey_log || {};
    const currentDay = ss.day_number || 1;
    const dayKey = `day_${selectedDay}`;
    const dayLogs = log[dayKey] || [];

    let checkinCount = 0,
      triggerCount = 0,
      mantraCount = 0,
      sankalpCount = 0,
      coreCount = 0;
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
      const dl = log[`day_${d}`] || [];
      let dc = 0,
        dt = 0,
        dm = 0,
        ds = 0,
        dcore = 0;
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

    const day = ss.checkpoint_day || milestoneDayCount;
    const body = {
      decision: decision as any,
      reflection: ss.checkpoint_user_reflection || "",
    };

    try {
      const fetcher =
        day === 14 ? mitraJourneyDay14Decision : mitraJourneyDay7Decision;
      const env = await fetcher(body as any, String(uuidv4.v4()));
      if (env) {
        const nv = env.next_view || { view_key: "", payload: {} };
        if (nv.view_key === "checkpoint_results" || nv.payload) {
          // results logic...
        }
      }
      store.dispatch(
        screenActions.setScreenValue({
          key: "checkpoint_completed",
          value: true,
        }),
      );
      store.dispatch(
        loadScreenWithData({
          containerId: "cycle_transitions",
          stateId: "checkpoint_results",
        }) as any,
      );
    } catch (err: any) {
      console.warn(`[CycleReflectionBlock] submit failed:`, err.message);
    }
  };

  const onReflectJourney = () => {
    setShowIntro(false);
    setShowJourneyInvite(true);
  };
  const onSkipJourney = () => {
    setShowJourneyInvite(false);
    const hasPractice = ss.checkpoint_engagement_level !== "near_zero";
    // Also clear feelings state if it was pre-set
    store.dispatch(
      screenActions.setScreenValue({
        key: "checkpoint_show_feelings",
        value: hasPractice,
      }),
    );
  };

  const isDayEngaged = (dayNum: number) => {
    if (is7DayCycle) {
      return [true, true, true, false, true, true, true][dayNum - 1];
    }
    if (is14DayCycle) {
      // 14-day hardcoded mockup data
      return [
        true,
        false,
        true,
        true,
        false,
        true,
        true,
        true,
        false,
        true,
        true,
        false,
        true,
        true,
      ][dayNum - 1];
    }
    const engaged = (ss.checkpoint_trend_graph || {}).engaged || [];
    return (
      !!engaged[dayNum - 1] || journeyData.weeklyStats[dayNum - 1]?.total > 0
    );
  };

  const isDayCompleted = (dayNum: number) => {
    if (is7DayCycle) {
      return [true, true, false, false, true, true, false][dayNum - 1];
    }
    if (is14DayCycle) {
      return [
        true,
        false,
        false,
        true,
        false,
        false,
        true,
        true,
        false,
        false,
        true,
        false,
        false,
        true,
      ][dayNum - 1];
    }
    return false;
  };

  if (showIntro && is7DayCycle) {
    return (
      <View style={styles.introContainer}>
        <View style={styles.introOverlay}>
          <View style={styles.visualHeader7Day}>
            <Text style={styles.introTitleSpecial}>
              A Week Into Your Journey
            </Text>
            <Text style={styles.introSubtitle}>
              A week ago, you began this journey with a simple intention.
            </Text>
          </View>
          <View style={styles.bottomGroup}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onReflectJourney}
            >
              <Text style={styles.primaryBtnText}>Reflect on My Journey</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (showIntro && is14DayCycle) {
    return (
      <View style={styles.introContainer}>
        <View style={styles.introOverlay14Day}>
          <View style={styles.introTopCluster}>
            <Text style={styles.overlayTitleDark}>
              You've completed 14 days
            </Text>
            <Day14Lotus width={600} />
          </View>
          <View style={styles.day14Body}>
            <Text style={styles.day14BodyText}>
              You stayed with it. Even on the days it felt quiet or uncertain.
            </Text>
            <View style={styles.day14DividerRow}>
              <View style={styles.day14DividerLine} />
              <Text style={styles.day14DividerDiamond}>◆</Text>
              <View style={styles.day14DividerLine} />
            </View>
            <Text style={styles.day14BodyText}>
              Something within you has begun to shift — and it will continue,
              gently.
            </Text>
          </View>
          <View style={styles.day14ButtonWrap}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onReflectJourney}
            >
              <Text style={styles.primaryBtnText}>Reflect on My Journey</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // --- Consolidated Reflection View (Matches Images) ---
  if (!showJourneyInvite && !showIntro && (is7DayCycle || is14DayCycle)) {
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
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
              <Text style={styles.statValue}>6 / 7</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Fully Completed</Text>
              <Text style={styles.statValue}>4 / 7</Text>
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
            {is7DayCycle && (
              <View style={[styles.pill, { backgroundColor: "#eaf4e9" }]}>
                <Text style={[styles.pillText, { color: "#2D7A5F" }]}>
                  Strongest area: mantra
                </Text>
              </View>
            )}
            <Text style={styles.mitraText}>
              {is14DayCycle
                ? "Your mantra practice was the one you returned to most."
                : "Your mantra practice has been the steadiest anchor this cycle."}
            </Text>
          </View>
        </View>

        {is7DayCycle && (
          <Text style={styles.footerSummaryText}>
            You have walked 7 days of this path. The rhythm is taking hold.
            Continue with the same steadiness.
          </Text>
        )}

        <TouchableOpacity
          style={styles.goldActionBtn}
          onPress={() => handleDecision(is14DayCycle ? "deepen" : "continue")}
        >
          <Text style={styles.goldActionBtnText}>
            {is14DayCycle ? "Continue to Choices →" : "Continue →"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
            14day_screen_lotus
          </View>
          <View style={styles.weeksWrapper}>
            <Image
              source={require("../../assets/14day_screen_lotus.png")}
              style={styles.lotus}
              resizeMode="contain"
            />
            <View style={styles.weeksContainer}>
              {[1, 2].map(
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
                          const isLocked = dayNum > journeyData.maxUnlockedDay;
                          const isToday = dayNum === ss.day_number;
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
                              {/* <View style={styles.statusMarker}>
                                {isDayEngaged(dayNum) && (
                                  <Text style={{ fontSize: 10 }}>✅</Text>
                                )}
                                {isToday && (
                                  <Text style={styles.todayTag}>Today</Text>
                                )}
                              </View> */}
                              <View
                                style={[
                                  styles.dayCircle,
                                  isLocked && styles.dayCircleLocked,
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
              )}
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
    flex: 1,
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
    // marginTop: 28,
  },
  visualHeader7Day: { marginTop: 100 },
  introTitleSpecial: {
    fontFamily: Fonts.serif.bold,
    fontSize: 32,
    color: "#fff",
    marginBottom: 20,
  },
  introSubtitle: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#fff",
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
    marginTop: -100,
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
  weeksContainer: { gap: 20 },
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
    borderColor: "rgba(255,255,255,0.3)",

    // Shadow (depth)
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },

    elevation: 8, // Android
  },
  weeksWrapper: {
    position: "relative",
    // marginTop: 40,
  },

  lotus: {
    position: "absolute",
    top: -20,
    alignSelf: "center",
    width: 120,
    height: 60,
    zIndex: 10,
  },

  weeksContainer: {
    marginTop: 20,
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
    fontFamily: Fonts.serif.italic,
    fontSize: 15,
    color: "#432104",
    lineHeight: 22,
  },
  footerSummaryText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    color: "#8c7355",
    textAlign: "center",
    marginVertical: 30,
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

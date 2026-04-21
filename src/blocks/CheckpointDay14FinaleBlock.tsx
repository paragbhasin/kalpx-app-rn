/**
 * CheckpointDay14FinaleBlock — v3 arc_complete transient moment.
 *
 * Rendered after POST /api/mitra/v3/journey/day-14-decision/ returns
 * next_view.view_key="daily_view" with arc_complete=true. Displays the
 * completion ceremony, then auto-transitions to the cycle-2 dashboard
 * after a short dwell.
 *
 * Reads from screenData.completion_ceremony + .m25_narrative.
 *
 * Tone: sovereignty-strict. No English fallback. All copy sourced from
 * v3 day-14-view envelope; blank fields render zero-height.
 */

import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useScreenStore } from "../engine/useScreenBridge";
import store from "../store";
import { loadScreenWithData } from "../store/screenSlice";
import { Fonts } from "../theme/fonts";

interface Props {
  block?: any;
}

const AUTO_ADVANCE_MS = 6000;

const CheckpointDay14FinaleBlock: React.FC<Props> = () => {
  const { screenData } = useScreenStore();
  const ss = (screenData ?? {}) as Record<string, any>;

  const ceremony = ss.completion_ceremony || {};
  const m25 = ss.m25_narrative || {};

  const eyebrow = m25.eyebrow || "";
  const headline = m25.intro_headline || "";
  const narrative =
    typeof m25.narrative_template === "string" && m25.narrative_template
      ? m25.narrative_template
          .replace("{completed_count}", String(ceremony.completed_days ?? ""))
          .replace("{total_days}", String(ceremony.total_days ?? 14))
      : "";
  const summary =
    typeof m25.summary_line_template === "string" && m25.summary_line_template
      ? m25.summary_line_template
          .replace("{completed_count}", String(ceremony.completed_days ?? ""))
          .replace("{total_days}", String(ceremony.total_days ?? 14))
      : "";
  const sovereigntyLine = ceremony.sovereignty_line || "";

  const goToDashboard = () => {
    store.dispatch(
      loadScreenWithData({
        containerId: "companion_dashboard",
        stateId: "day_active",
      }) as any,
    );
  };

  useEffect(() => {
    const t = setTimeout(goToDashboard, AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.root} testID="checkpoint_day_14_finale">
      <View style={styles.center}>
        {!!eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
        {!!headline && <Text style={styles.headline}>{headline}</Text>}
        {!!narrative && <Text style={styles.narrative}>{narrative}</Text>}
        {!!summary && <Text style={styles.summary}>{summary}</Text>}
        {!!sovereigntyLine && (
          <Text style={styles.sovereignty}>{sovereigntyLine}</Text>
        )}
      </View>
      <TouchableOpacity
        onPress={goToDashboard}
        style={styles.cta}
        activeOpacity={0.85}
        testID="checkpoint_day_14_finale_continue"
      >
        <Text style={styles.ctaText}>Begin the next cycle</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 64,
    paddingBottom: 36,
    backgroundColor: "#FFF8EF",
    justifyContent: "space-between",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  eyebrow: {
    fontFamily: Fonts.sans.medium,
    fontSize: 12,
    letterSpacing: 1.5,
    color: "#9c7c3e",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  headline: {
    fontFamily: Fonts.serif.bold,
    fontSize: 22,
    color: "#432104",
    marginBottom: 18,
    textAlign: "center",
  },
  narrative: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    lineHeight: 24,
    color: "#432104",
    marginBottom: 14,
    textAlign: "center",
  },
  summary: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    lineHeight: 20,
    color: "#6b6155",
    marginBottom: 14,
    textAlign: "center",
  },
  sovereignty: {
    fontFamily: Fonts.serif.italic,
    fontSize: 14,
    lineHeight: 20,
    color: "#9c7c3e",
    textAlign: "center",
  },
  cta: {
    backgroundColor: "#FBF5F5",
    borderColor: "#9f9f9f",
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
  },
  ctaText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 15,
    color: "#432104",
  },
});

export default CheckpointDay14FinaleBlock;

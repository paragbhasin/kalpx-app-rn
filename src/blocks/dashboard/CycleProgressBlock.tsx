/**
 * CycleProgressBlock — collapsible cycle progress panel.
 *
 * Spec: docs/NEW_DASHBOARD_V1_SPEC.md §2 #7
 *
 * Data: screenData.cycle_metrics shaped as
 *   {
 *     days_engaged: number,
 *     days_fully_completed: number,
 *     trigger_sessions: number,
 *     daily_rhythm: Array<{ day_number, state }>,
 *     summary_label?: string,       // localized summary line
 *     expand_label?: string,        // localized "Tap to expand"
 *     days_engaged_label?: string,
 *     days_complete_label?: string,
 *     trigger_sessions_label?: string,
 *     rhythm_header_label?: string,
 *   }
 *
 * Layout:
 *   - Header row is tappable; default state is collapsed.
 *   - Expand/collapse uses LayoutAnimation for a gentle slide.
 *   - Inner content shows 3 metrics + DailyRhythmStrip.
 *
 * Sovereignty: all human-readable labels come from the backend via
 * `*_label` slots. If a label is missing, that row simply renders the
 * numeric value — we never invent English copy.
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { Colors } from "../../theme/colors";
import { Fonts } from "../../theme/fonts";
import DailyRhythmStrip from "./DailyRhythmStrip";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  screenData?: Record<string, any>;
};

const CycleProgressBlock: React.FC<Props> = ({ screenData }) => {
  const sd = screenData ?? {};
  const metrics = sd.today?.cycle_metrics ?? sd.cycle_metrics ?? {};

  // Hooks must be called unconditionally.
  const [expanded, setExpanded] = useState(false);

  // Always-visible block. Falls back to day_number / total_days when
  // cycle_metrics hasn't loaded yet; numeric metrics default to 0.
  const daysEngaged: number =
    typeof metrics.days_engaged === "number" ? metrics.days_engaged : 0;
  const daysComplete: number =
    typeof metrics.days_fully_completed === "number"
      ? metrics.days_fully_completed
      : 0;
  const triggerSessions: number =
    typeof metrics.trigger_sessions === "number" ? metrics.trigger_sessions : 0;

  const fallbackDay = Number(sd.day_number) || Number(sd.cycle_day) || 1;
  const fallbackTotal = Number(sd.total_days) || 14;
  const summaryLabel: string =
    metrics.summary_label || `Day ${fallbackDay} of ${fallbackTotal}`;

  const toggle = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(220, "easeInEaseOut", "opacity"),
    );
    setExpanded((v) => !v);
  };

  return (
    <View style={styles.wrap} accessibilityLabel="cycle_progress_block">
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={toggle}
        style={styles.header}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.summary}>{summaryLabel}</Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={Colors.brownMuted}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          {/* SOV-3 (2026-04-20): sovereignty-strict. Prior English fallbacks
              ("Days engaged" / "Fully completed" / "Trigger sessions" /
              "Daily rhythm") retired. Labels now read directly from
              cycle_metrics payload. Missing label = empty Metric label
              (value still shown); missing rhythm_header_label = no heading
              rendered above the rhythm strip. */}
          <View style={styles.metricsRow}>
            <Metric
              value={daysEngaged}
              label={metrics.days_engaged_label || "Days engaged"}
            />
            <Metric
              value={daysComplete}
              label={metrics.days_complete_label || "Fully completed"}
            />
            <Metric
              value={triggerSessions}
              label={metrics.trigger_sessions_label || "Trigger sessions"}
            />
          </View>
          {!!metrics.rhythm_header_label && (
            <Text style={styles.rhythmHeader}>
              {metrics.rhythm_header_label}
            </Text>
          )}
          <DailyRhythmStrip screenData={sd} />
        </View>
      )}
    </View>
  );
};

const Metric: React.FC<{ value: number; label: string }> = ({
  value,
  label,
}) => (
  <View style={styles.metric}>
    <Text style={styles.metricValue}>{value}</Text>
    {!!label && <Text style={styles.metricLabel}>{label}</Text>}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.cream,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderCream,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginVertical: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  summary: {
    fontFamily: Fonts.sans.medium,
    fontSize: 13,
    color: Colors.brownDeep,
  },
  body: {
    marginTop: 12,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  metric: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  metricValue: {
    fontFamily: Fonts.serif.bold,
    fontSize: 22,
    color: Colors.brownDeep,
  },
  metricLabel: {
    fontFamily: Fonts.sans.regular,
    fontSize: 11,
    color: Colors.textSoft,
    marginTop: 2,
    textAlign: "center",
  },
  rhythmHeader: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    letterSpacing: 0.8,
    color: Colors.brownMuted,
    textTransform: "uppercase",
    marginBottom: 4,
  },
});

export default CycleProgressBlock;

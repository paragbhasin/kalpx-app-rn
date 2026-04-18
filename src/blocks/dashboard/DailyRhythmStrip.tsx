/**
 * DailyRhythmStrip — N-dot visualisation of the journey's daily rhythm.
 *
 * Spec: docs/NEW_DASHBOARD_V1_SPEC.md §2 #8
 *
 * Data: screenData.cycle_metrics.daily_rhythm[] — each entry shaped as
 *   `{ day_number: number, state: "done" | "missed" | "pending" }`.
 *
 * Day-7 and Day-14 milestones are tappable; tap dispatches
 * `navigate_screen` via executeAction to jump to the checkpoint screen.
 * Other dots are non-interactive status glyphs.
 *
 * Sovereignty: the only user-facing text is the day-number inside the
 * dot (rendered by the numeric value in the data), so there are no
 * localizable strings to seed.
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { executeAction } from "../../engine/actionExecutor";
import { useScreenStore } from "../../engine/useScreenBridge";
import store from "../../store";
import { screenActions } from "../../store/screenSlice";
import { Colors } from "../../theme/colors";
import { Fonts } from "../../theme/fonts";

interface RhythmDot {
  day_number?: number;
  day?: number;
  state?: "done" | "missed" | "pending" | string;
}

type Props = {
  screenData?: Record<string, any>;
};

const CHECKPOINT_DAYS = new Set([7, 14]);

const colorForState = (state?: string): string => {
  switch (state) {
    case "done":
      return Colors.successGreen;
    case "missed":
      return Colors.ringTan;
    case "pending":
    default:
      return Colors.borderCream;
  }
};

const DailyRhythmStrip: React.FC<Props> = ({ screenData }) => {
  const sd = screenData ?? {};
  const { loadScreen, goBack } = useScreenStore();
  const metrics = sd.cycle_metrics ?? null;
  const rhythm: RhythmDot[] = Array.isArray(metrics?.daily_rhythm)
    ? metrics.daily_rhythm
    : [];

  if (rhythm.length === 0) return null;

  const handleCheckpointTap = (day: number) => {
    executeAction(
      {
        type: "navigate_screen",
        payload: {
          container_id: "cycle_transitions",
          state_id: `checkpoint_day_${day}`,
        },
      },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          store.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: store.getState().screen.screenData,
      },
    ).catch(() => {
      // Fallback to a direct loadScreen if navigate_screen is not wired.
      loadScreen({
        container_id: "cycle_transitions",
        state_id: `checkpoint_day_${day}`,
      });
    });
  };

  return (
    <View style={styles.row} accessibilityLabel="daily_rhythm_strip">
      {rhythm.map((d, i) => {
        const dayNum: number | undefined =
          typeof d.day_number === "number"
            ? d.day_number
            : typeof d.day === "number"
              ? d.day
              : undefined;
        const color = colorForState(d.state);
        const isCheckpoint =
          typeof dayNum === "number" && CHECKPOINT_DAYS.has(dayNum);

        const dotStyle = [
          styles.dot,
          {
            backgroundColor:
              d.state === "done" ? color : "transparent",
            borderColor: color,
          },
          isCheckpoint && styles.dotCheckpoint,
        ];

        if (isCheckpoint) {
          return (
            <TouchableOpacity
              key={`rhythm-${i}`}
              style={dotStyle}
              activeOpacity={0.7}
              onPress={() => handleCheckpointTap(dayNum)}
              accessibilityRole="button"
              accessibilityLabel={`checkpoint_day_${dayNum}`}
            >
              {typeof dayNum === "number" && (
                <Text style={styles.dotNum}>{dayNum}</Text>
              )}
            </TouchableOpacity>
          );
        }

        return <View key={`rhythm-${i}`} style={dotStyle} />;
      })}
    </View>
  );
};

const DOT_SIZE = 14;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    paddingVertical: 8,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 1,
    marginRight: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  dotCheckpoint: {
    width: DOT_SIZE + 8,
    height: DOT_SIZE + 8,
    borderRadius: (DOT_SIZE + 8) / 2,
    borderWidth: 1.5,
  },
  dotNum: {
    fontFamily: Fonts.sans.medium,
    fontSize: 9,
    color: Colors.brownDeep,
  },
});

export default DailyRhythmStrip;

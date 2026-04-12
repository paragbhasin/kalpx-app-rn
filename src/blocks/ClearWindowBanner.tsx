/**
 * ClearWindowBanner — Moment 43 "Clear Window" warm amber banner.
 *
 * Only renders when the clear-window API has returned non-null data for today.
 * Informative, calm — no exclamations, no comparisons. Dismissible.
 *
 * Web parity:
 *   - Spec: route_dashboard_day_active.md §1 variant 43 (clear_window_expansive), §1 wireframe "Clear Window" chip
 *   - API: GET /api/mitra/clear-window/ (new in Week 2)
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Fonts } from "../theme/fonts";
import { executeAction } from "../engine/actionExecutor";
import { useScreenStore } from "../engine/useScreenBridge";
import store from "../store";
import { screenActions } from "../store/screenSlice";

const ClearWindowBanner: React.FC<{ block?: any }> = () => {
  const { screenData, loadScreen, goBack } = useScreenStore();
  const ss = screenData as Record<string, any>;
  const cw = ss.clear_window;
  if (!cw || typeof cw !== "object") return null;

  const headline = cw.headline || "Today is open";
  const message = cw.message || "You've earned this space. Use it for what matters.";

  const onDismiss = () => {
    executeAction(
      { type: "dismiss_clear_window" },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          store.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: store.getState().screen.screenData,
      },
    );
  };

  return (
    <View style={styles.banner}>
      <View style={styles.row}>
        <View style={styles.chip}>
          <Text style={styles.chipText}>Clear Window</Text>
        </View>
        <TouchableOpacity onPress={onDismiss} hitSlop={8}>
          <Text style={styles.dismiss}>×</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.headline}>{headline}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#fef3d7",
    borderRadius: 12,
    padding: 14,
    marginVertical: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#d4a017",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  chip: {
    backgroundColor: "#fffdf5",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 0.5,
    borderColor: "#d4a017",
  },
  chipText: {
    fontFamily: Fonts.sans.bold,
    fontSize: 10,
    letterSpacing: 1.3,
    color: "#8b6914",
  },
  dismiss: {
    fontFamily: Fonts.sans.regular,
    fontSize: 20,
    color: "#8a7a5a",
    paddingHorizontal: 4,
  },
  headline: {
    fontFamily: Fonts.serif.bold,
    fontSize: 17,
    color: "#432104",
    marginBottom: 4,
  },
  message: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#5a4a2a",
    lineHeight: 19,
  },
});

export default ClearWindowBanner;

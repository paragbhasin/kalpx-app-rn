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
import { useContentSlots, readMomentSlot } from "../hooks/useContentSlots";
import { useScreenStore } from "../engine/useScreenBridge";
import store from "../store";
import { screenActions } from "../store/screenSlice";

const ClearWindowBanner: React.FC<{ block?: any }> = () => {
  const { screenData, loadScreen, goBack } = useScreenStore();
  const ss = screenData as Record<string, any>;

  // Phase D — M43 registry-backed slots (hook fires; if banner hidden,
  // fetched slots are harmless).
  useContentSlots({
    momentId: "M43_clear_window_banner",
    screenDataKey: "clear_window_banner",
    buildCtx: (s) => ({
      path: s.journey_path === "growth" ? "growth" : "support",
      guidance_mode: s.guidance_mode || "hybrid",
      locale: s.locale || "en",
      user_attention_state: "scanning",
      emotional_weight: "light",
      cycle_day: Number(s.day_number) || 0,
      entered_via: "dashboard_embed",
      stage_signals: {},
      today_layer: {},
      life_layer: {
        cycle_id: s.journey_id || s.cycle_id || "",
        life_kosha: s.life_kosha || s.scan_focus || "",
        scan_focus: s.scan_focus || "",
      },
    }),
  });
  const slot = (name: string) => readMomentSlot(ss, "clear_window_banner", name);

  const cw = ss.clear_window;
  if (!cw || typeof cw !== "object") return null;

  // Backend clear_window API can override the defaults for today.
  const headline = cw.headline || slot("default_headline");
  const message = cw.message || slot("default_message");

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
          <Text style={styles.chipText}>{slot("banner_chip")}</Text>
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
    backgroundColor: "#FFF7E8",
    borderRadius: 12,
    padding: 14,
    marginVertical: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#c9a84c",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  chip: {
    backgroundColor: "#fffdf9",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 0.5,
    borderColor: "#c9a84c",
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
    color: "#6b5a45",
    lineHeight: 19,
  },
});

export default ClearWindowBanner;

/**
 * SeasonChangeBanner — Moment 44 dashboard embedded slim banner.
 *
 * Renders when screenData.season_signal is non-null AND the 7-day
 * dismiss window has passed.
 *
 * Web parity:
 *   - Spec: docs/specs/mitra-v3-experience/screens/embedded_season_change_banner.md
 *   - Dismiss action: `dismiss_season_banner` sets season_banner_dismissed_at.
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Fonts } from "../theme/fonts";
import { executeAction } from "../engine/actionExecutor";
import { useScreenStore } from "../engine/useScreenBridge";
import store from "../store";
import { screenActions } from "../store/screenSlice";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const SeasonChangeBanner: React.FC<{ block?: any }> = () => {
  const { screenData, loadScreen, goBack } = useScreenStore();
  const signal = (screenData as any).season_signal;
  const dismissedAt = (screenData as any).season_banner_dismissed_at;

  if (!signal || typeof signal !== "object") return null;
  if (
    dismissedAt &&
    typeof dismissedAt === "number" &&
    Date.now() - dismissedAt < SEVEN_DAYS_MS
  ) {
    return null;
  }

  // SOV-5 (2026-04-20): sovereignty-strict. Prior English fallbacks
  // ("The season is shifting." / "Slower mornings land well now.")
  // retired. Banner reads directly from signal payload; if neither
  // headline nor message is present the banner self-hides below.
  const headline = signal.headline || "";
  const message = signal.message || "";
  if (!headline && !message) return null;

  const onDismiss = () => {
    executeAction(
      { type: "dismiss_season_banner" },
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
    <TouchableOpacity
      style={styles.banner}
      onPress={onDismiss}
      activeOpacity={0.8}
      accessibilityLabel="Season banner, tap to dismiss"
      testID="season-change-banner"
    >
      <Text style={styles.headline}>{headline}</Text>
      <Text style={styles.message}>{message}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#FFF8EF",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 8,
    minHeight: 44,
  },
  headline: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 13,
    color: "#4a3a20",
    marginBottom: 2,
  },
  message: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: "#6a5830",
    lineHeight: 17,
  },
});

export default SeasonChangeBanner;

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

import React, { useState } from "react";
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

  const [expanded, setExpanded] = useState(false);

  const headline =
    signal.headline || "The season is shifting.";
  const message =
    signal.message || "Slower mornings land well now.";
  const detail = signal.detail || signal.long_text || signal.body;

  const onToggle = () => setExpanded((v) => !v);

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
    <View style={styles.banner} testID="season-change-banner">
      <TouchableOpacity
        onPress={detail ? onToggle : onDismiss}
        activeOpacity={0.8}
        accessibilityLabel={
          detail
            ? expanded
              ? "Season banner, tap to collapse"
              : "Season banner, tap to expand"
            : "Season banner, tap to dismiss"
        }
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.message}>{message}</Text>
      </TouchableOpacity>

      {expanded && detail ? (
        <View style={styles.detailWrap} testID="season-change-banner-detail">
          <Text style={styles.detailText}>{detail}</Text>
          <TouchableOpacity
            onPress={onDismiss}
            style={styles.dismiss}
            accessibilityLabel="Dismiss season banner"
            testID="season-change-banner-dismiss"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.dismissText}>Got it</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
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
  detailWrap: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "#d9cfb8",
  },
  detailText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 13,
    color: "#4a3a20",
    lineHeight: 20,
    marginBottom: 10,
  },
  dismiss: {
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dismissText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 12,
    color: "#8b7a55",
  },
});

export default SeasonChangeBanner;

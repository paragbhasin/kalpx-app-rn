/**
 * WhyThisL2Sheet — Moment 36 (Why-This Level 2 overlay).
 *
 * Bottom sheet explaining the principle behind a recommendation.
 * Copy is crisp, not preachy. No exclamations, no emojis.
 *
 * Web parity:
 *   - Spec: docs/specs/mitra-v3-experience/screens/overlay_why_this_level_2.md
 *   - Data source: GET /api/mitra/principles/{id}/ (loaded by open_why_this_l2)
 *   - Falls back to screenData.why_this_principle (may be null if flag/404).
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { Fonts } from "../theme/fonts";
import { executeAction } from "../engine/actionExecutor";
import { useScreenStore } from "../engine/useScreenBridge";
import store from "../store";
import { screenActions } from "../store/screenSlice";

const WhyThisL2Sheet: React.FC<{ block?: any }> = () => {
  const { screenData, loadScreen, goBack } = useScreenStore();
  const p = (screenData as any).why_this_principle;

  // Flag-off / 404 tolerance — render a minimal placeholder and a Got it exit.
  if (!p) {
    return (
      <View style={styles.sheet}>
        <Text style={styles.essence}>
          The reason behind this isn't available right now.
        </Text>
        <TouchableOpacity
          style={styles.dismissPill}
          onPress={() => goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.dismissText}>Got it</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const goDeeper = () => {
    executeAction(
      { type: "open_why_this_l3", payload: { principle_id: p.id } },
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
    <View style={styles.sheet}>
      <View style={styles.handle} />
      <Text style={styles.label}>WHY THIS</Text>
      <Text style={styles.name}>{p.principle_name || p.short_label || p.name || p.title}</Text>
      {(() => {
        const essence = p.core_teaching || p.plain_english || p.essence;
        return essence ? <Text style={styles.essence}>{essence}</Text> : null;
      })()}
      {(() => {
        const body =
          p.universal_explanation ||
          p.rooted_explanation ||
          p.why_this?.level2 ||
          p.context;
        return body ? (
          <ScrollView style={styles.contextWrap}>
            <Text style={styles.context}>{body}</Text>
          </ScrollView>
        ) : null;
      })()}

      <TouchableOpacity
        style={styles.deeper}
        onPress={goDeeper}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.deeperText}>Go deeper</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.dismissPill}
        onPress={() => goBack()}
        accessibilityLabel="Dismiss"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.dismissText}>Got it</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: "#fffdf9",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 22,
    paddingTop: 12,
    minHeight: 320,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d9cfb8",
    marginBottom: 16,
  },
  label: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 10,
    letterSpacing: 1.6,
    color: "#8b7a55",
    marginBottom: 10,
  },
  name: {
    fontFamily: Fonts.serif.bold,
    fontSize: 26,
    color: "#432104",
    marginBottom: 10,
    lineHeight: 32,
  },
  essence: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    color: "#4a3a20",
    lineHeight: 22,
    marginBottom: 14,
  },
  contextWrap: {
    maxHeight: 180,
    marginBottom: 18,
  },
  context: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#6b5a45",
    lineHeight: 21,
  },
  deeper: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    marginBottom: 22,
    minHeight: 44,
    justifyContent: "center",
  },
  deeperText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 14,
    color: "#8b6914",
    letterSpacing: 0.3,
  },
  dismissPill: {
    alignSelf: "center",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#d9cfb8",
    minWidth: 120,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  dismissText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: "#6b5a45",
  },
});

export default WhyThisL2Sheet;

/**
 * RecommendedAdditionalCard — Moment 30.
 *
 * Embedded dashboard card shown below the core triad after core completion.
 * Reads screenData.recommended_additional (set by
 * fetch_companion_intelligence). Flag-off / 404 → null → card hidden.
 *
 * REG-015 (CRITICAL): on "Begin", start_runner MUST receive
 * source="additional_recommended" — NEVER "core". This card is the single
 * most likely source of REG-015 regressions, so the action we dispatch goes
 * through start_recommended_additional in actionExecutor which hard-codes
 * the source (see inline assertion there).
 *
 * Web parity: docs/specs/mitra-v3-experience/screens/embedded_recommended_additional_card.md §1, §7
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Fonts } from "../theme/fonts";
import { executeAction } from "../engine/actionExecutor";
import { useScreenStore } from "../engine/useScreenBridge";
import store from "../store";
import { screenActions } from "../store/screenSlice";

const RecommendedAdditionalCard: React.FC<{ block?: any }> = () => {
  const { screenData, loadScreen, goBack } = useScreenStore();
  const rec = (screenData as any).recommended_additional;

  if (!rec) return null; // graceful hide when flag off / 204

  const dispatch = (action: any) =>
    executeAction(action, {
      loadScreen,
      goBack,
      setScreenValue: (value: any, key: string) =>
        store.dispatch(screenActions.setScreenValue({ key, value })),
      screenState: store.getState().screen.screenData,
    });

  const onBegin = () =>
    // REG-015: this handler MUST set source="additional_recommended".
    // start_recommended_additional enforces that in actionExecutor.ts.
    dispatch({
      type: "start_recommended_additional",
      payload: {
        variant: rec.item_type || "practice",
        item: {
          item_type: rec.item_type || "practice",
          item_id: rec.item_id || rec.id,
          title: rec.title,
        },
        duration_sec: (rec.duration_min || 6) * 60,
      },
    });

  const onNotNow = () => dispatch({ type: "dismiss_recommended_additional" });

  return (
    <View style={styles.card}>
      <Text style={styles.lead}>
        {rec.lead_in || `One small thing might help today: ${rec.title}.`}
      </Text>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{rec.title}</Text>
        {rec.duration_min ? (
          <Text style={styles.duration}>{rec.duration_min} min</Text>
        ) : null}
      </View>
      {rec.benefit_line ? (
        <Text style={styles.benefit}>{rec.benefit_line}</Text>
      ) : null}
      <View style={styles.row}>
        <TouchableOpacity style={styles.primary} onPress={onBegin}>
          <Text style={styles.primaryText}>Begin</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={onNotNow}>
          <Text style={styles.secondaryText}>Not now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF8EF",
    borderRadius: 12,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.2)",
  },
  lead: {
    fontFamily: Fonts.serif.regular,
    fontSize: 14,
    fontStyle: "italic",
    color: "#6b5a45",
    lineHeight: 20,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    fontFamily: Fonts.serif.regular,
    fontSize: 17,
    color: "#432104",
  },
  duration: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: "#8a6a2a",
  },
  benefit: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#432104",
    marginBottom: 12,
  },
  row: { flexDirection: "row", gap: 10, alignItems: "center" },
  primary: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: "#c9a84c",
  },
  primaryText: {
    fontFamily: Fonts.sans.bold,
    fontSize: 13,
    color: "#fffdf9",
  },
  secondary: { paddingHorizontal: 12, paddingVertical: 9 },
  secondaryText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#432104",
  },
});

export default RecommendedAdditionalCard;

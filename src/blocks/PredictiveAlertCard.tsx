/**
 * PredictiveAlertCard — Moment 28 (Predictive Alert — Friction Forecast).
 *
 * Embedded dashboard card. Rendered only when
 * screenData.predictive_alert is non-null (set by
 * fetch_companion_intelligence). Flag-off / 404 path: predictive_alert
 * remains null, this component returns null (graceful hide — no empty card).
 *
 * Tone: quiet forecast. No red, no "URGENT!", no threat framing.
 * Web parity: docs/specs/mitra-v3-experience/screens/embedded_predictive_alert_card.md §1, §7
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Fonts } from "../theme/fonts";
import { executeAction } from "../engine/actionExecutor";
import { useScreenStore } from "../engine/useScreenBridge";
import store from "../store";
import { screenActions } from "../store/screenSlice";

const PredictiveAlertCard: React.FC<{ block?: any }> = () => {
  const { screenData, loadScreen, goBack } = useScreenStore();
  const alert = (screenData as any).predictive_alert;

  // Confidence gate per spec §7: only render if confidence ≥ 0.6.
  if (!alert || (alert.confidence != null && alert.confidence < 0.6)) {
    return null;
  }

  const dispatch = (action: any) =>
    executeAction(action, {
      loadScreen,
      goBack,
      setScreenValue: (value: any, key: string) =>
        store.dispatch(screenActions.setScreenValue({ key, value })),
      screenState: store.getState().screen.screenData,
    });

  const onPrep = () =>
    dispatch({
      type: "open_prep_sheet",
      payload: { context_type: alert.suggested_prep_context, entity: alert.entity },
    });

  const onLater = () =>
    dispatch({ type: "dismiss_predictive_alert", payload: { id: alert.id } });

  return (
    <View style={styles.card}>
      <Text style={styles.when}>
        {alert.entity?.display_name || "Someone"} {alert.when_phrase || "later"}.
      </Text>
      {alert.evidence_line ? (
        <Text style={styles.evidence}>{alert.evidence_line}</Text>
      ) : null}
      <Text style={styles.voice}>Want to prepare?</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.primary} onPress={onPrep}>
          <Text style={styles.primaryText}>Prep</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={onLater}>
          <Text style={styles.secondaryText}>Later</Text>
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
    borderColor: "rgba(201,168,76,0.25)",
  },
  when: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    color: "#432104",
    marginBottom: 6,
  },
  evidence: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#6b5a45",
    lineHeight: 19,
    marginBottom: 10,
  },
  voice: {
    fontFamily: Fonts.serif.regular,
    fontStyle: "italic",
    fontSize: 14,
    color: "#8a6a2a",
    marginBottom: 10,
  },
  row: { flexDirection: "row", gap: 10, alignItems: "center" },
  primary: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "#c9a84c",
  },
  primaryText: {
    fontFamily: Fonts.sans.bold,
    fontSize: 13,
    color: "#fffdf9",
  },
  secondary: { paddingHorizontal: 14, paddingVertical: 8 },
  secondaryText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#432104",
  },
});

export default PredictiveAlertCard;

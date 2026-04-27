/**
 * EntityRecognitionSheet — Moment 29 (Provisional → Confirmed entity).
 *
 * Bottom-sheet overlay rendered on the `entity_recognition_sheet` overlay
 * state. Reads screenData.entity_recognition_pending.
 *
 * Web parity: docs/specs/mitra-v3-experience/screens/overlay_entity_recognition.md §1, §5
 *
 * Actions:
 *   "Yes that's them"  → confirm_entity (PATCH entities/)
 *   "Different person" → reject_entity (local) + check-duplicate lookup
 *   "Not a person"     → dismiss + PATCH status=dismissed
 */

import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { Fonts } from "../theme/fonts";
import { executeAction } from "../engine/actionExecutor";
import { useContentSlots, readMomentSlot } from "../hooks/useContentSlots";
import { useScreenStore } from "../engine/useScreenBridge";
import store from "../store";
import { screenActions } from "../store/screenSlice";

const EntityRecognitionSheet: React.FC<{ block?: any }> = () => {
  const { screenData, loadScreen, goBack } = useScreenStore();
  const ss = screenData as Record<string, any>;
  const pending = ss.entity_recognition_pending;

  useContentSlots({
    momentId: "M29_entity_recognition_sheet",
    screenDataKey: "entity_recognition_sheet",
    buildCtx: (s) => ({
      path: s.journey_path === "growth" ? "growth" : "support",
      guidance_mode: s.guidance_mode || "hybrid",
      locale: s.locale || "en",
      user_attention_state: "scanning",
      emotional_weight: "light",
      cycle_day: Number(s.day_number) || 0,
      entered_via: "dashboard_entity_card_tap",
      stage_signals: {},
      today_layer: {},
      life_layer: {
        cycle_id: s.journey_id || s.cycle_id || "",
        life_kosha: s.life_kosha || s.scan_focus || "",
        scan_focus: s.scan_focus || "",
      },
    }),
  });
  const slot = (name: string) => readMomentSlot(ss, "entity_recognition_sheet", name);

  if (!pending) {
    return (
      <View style={styles.sheet}>
        <Text style={styles.empty}>{slot("empty_state")}</Text>
        <TouchableOpacity style={styles.primary} onPress={() => goBack()}>
          <Text style={styles.primaryText}>{slot("empty_close_cta")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const dispatch = (action: any) =>
    executeAction(action, {
      loadScreen,
      goBack,
      setScreenValue: (value: any, key: string) =>
        store.dispatch(screenActions.setScreenValue({ key, value })),
      screenState: store.getState().screen.screenData,
    });

  const onConfirm = () =>
    dispatch({
      type: "confirm_entity",
      payload: { id: pending.id, name: pending.display_name },
    });

  const onDifferent = () =>
    dispatch({
      type: "reject_entity",
      payload: { id: pending.id, reason: "different_person" },
    });

  const onNotPerson = () =>
    dispatch({
      type: "reject_entity",
      payload: { id: pending.id, reason: "not_a_person" },
    });

  // recognition_context slot holds the verbatim "I've heard this..."
  // line per the registry; dynamic mention_count/phrase are part of
  // the user's data and kept out of the authored slot. If/when the
  // backend accepts these as applies_when signals, the variant can
  // vary; baseline covers the common case.
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.sheet}>
      <Text style={styles.microLabel}>{slot("quick_check_label")}</Text>
      <Text style={styles.question}>{slot("recognition_question")}</Text>
      <Text style={styles.nameGuess}>{pending.display_name}</Text>
      <Text style={styles.context}>{slot("recognition_context")}</Text>

      {/* REG-016: CTAs in bottom 30% */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primary} onPress={onConfirm}>
          <Text style={styles.primaryText}>{slot("confirm_entity_cta")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={onDifferent}>
          <Text style={styles.secondaryText}>{slot("different_person_cta")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tertiary} onPress={onNotPerson}>
          <Text style={styles.tertiaryText}>{slot("not_person_cta")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#fffdf9" },
  sheet: { padding: 20, paddingBottom: 48 },
  microLabel: {
    fontFamily: Fonts.sans.regular,
    fontSize: 11,
    letterSpacing: 1.4,
    color: "#c9a84c",
    marginBottom: 14,
  },
  question: {
    fontFamily: Fonts.serif.regular,
    fontSize: 19,
    color: "#432104",
    marginBottom: 8,
  },
  nameGuess: {
    fontFamily: Fonts.serif.regular,
    fontSize: 24,
    color: "#8a6a2a",
    marginBottom: 8,
  },
  context: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#432104",
    lineHeight: 21,
    marginBottom: 24,
  },
  footer: { gap: 10, marginTop: 12 },
  primary: {
    backgroundColor: "#c9a84c",
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
  },
  primaryText: {
    fontFamily: Fonts.sans.bold,
    fontSize: 15,
    color: "#fffdf9",
  },
  secondary: {
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#c9a84c",
    alignItems: "center",
  },
  secondaryText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#432104",
  },
  tertiary: { alignItems: "center", paddingVertical: 10 },
  tertiaryText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#6b5a45",
  },
  empty: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    color: "#432104",
    textAlign: "center",
    padding: 24,
  },
});

export default EntityRecognitionSheet;

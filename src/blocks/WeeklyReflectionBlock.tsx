/**
 * WeeklyReflectionBlock — Mitra v3 Moment 23 (weekly reflection letter).
 *
 * Spec: /Users/paragbhasin/kalpx-frontend/docs/specs/mitra-v3-experience/screens/route_reflection_weekly.md
 * Web parity: kalpx-frontend/src/containers/CycleTransitionsContainer.vue
 *   (reflection sections pattern) and src/engine/actionExecutor.js
 *   gratitude-ledger batch post pattern.
 *
 * This is a long-scroll reading + reflection surface. Three named sections
 * ("what held you", "what took", "what wants tending") each have a small
 * freeform input. Optional ResilienceNarrativeCard is linked at the top
 * when a narrative is available on screenData.resilience_narrative.
 *
 * Submit batches three gratitude-ledger POSTs (one per section) via the
 * `submit_weekly_reflection` action. 404-tolerant.
 *
 * REG-015: weekly_reflection_draft is cleared on submit and on unmount
 * (without leaking sections back into core state).
 * REG-016: submit CTA sits inside the bottom thumb-zone.
 * Tone lint: no exclamations, no streak counts, no comparisons to other weeks.
 */

import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Fonts } from "../theme/fonts";
import { executeAction } from "../engine/actionExecutor";
import { useContentSlots, readMomentSlot } from "../hooks/useContentSlots";
import { useScreenStore } from "../engine/useScreenBridge";
import store from "../store";
import { screenActions } from "../store/screenSlice";
import ResilienceNarrativeCard from "./ResilienceNarrativeCard";

// Section keys are stable analytics ids. Labels + prompts come from
// the M23_weekly_reflection ContentPack at runtime.
const SECTION_KEYS = ["held", "took", "tending"] as const;

const MAX_SECTION = 600;

interface Props {
  block?: any;
}

const WeeklyReflectionBlock: React.FC<Props> = () => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();
  const ss = screenData as Record<string, any>;

  // Phase D — M23 registry-backed slots.
  useContentSlots({
    momentId: "M23_weekly_reflection",
    screenDataKey: "weekly_reflection",
    buildCtx: (s) => ({
      path: s.journey_path === "growth" ? "growth" : "support",
      guidance_mode: s.guidance_mode || "hybrid",
      locale: s.locale || "en",
      user_attention_state: "reflective_exposed",
      emotional_weight: "moderate",
      cycle_day: Number(s.day_number) || 0,
      entered_via: s._entered_via || "dashboard_card",
      stage_signals: {},
      today_layer: {},
      life_layer: {
        cycle_id: s.journey_id || s.cycle_id || "",
        life_kosha: s.life_kosha || s.scan_focus || "",
        scan_focus: s.scan_focus || "",
        life_klesha: s.life_klesha || null,
        life_vritti: s.life_vritti || null,
        life_goal: s.life_goal || null,
      },
    }),
  });
  const slot = (name: string) => readMomentSlot(ss, "weekly_reflection", name);

  const draft = ss.weekly_reflection_draft || {};
  const [values, setValues] = useState<Record<string, string>>({
    held: draft.held || "",
    took: draft.took || "",
    tending: draft.tending || "",
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    store.dispatch(
      screenActions.setScreenValue({
        key: "weekly_reflection_draft",
        value: values,
      }),
    );
  }, [values]);

  useEffect(() => {
    return () => {
      const s = store.getState().screen.screenData;
      if (s._weekly_reflection_submitted !== true) {
        store.dispatch(
          screenActions.setScreenValue({
            key: "weekly_reflection_draft",
            value: null,
          }),
        );
      }
    };
  }, []);

  const anyContent = Object.values(values).some((v) => v.trim().length > 0);

  const onSubmit = async () => {
    if (!anyContent) return;
    setSubmitted(true);
    await executeAction(
      {
        type: "submit_weekly_reflection",
        payload: { sections: values },
        currentScreen,
      },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          store.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: store.getState().screen.screenData,
      },
    );
  };

  if (submitted) {
    return (
      <View style={styles.ackWrap}>
        <Text style={styles.ackText}>{slot("ack_text")}</Text>
      </View>
    );
  }

  const hasNarrative = !!ss.resilience_narrative;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{slot("title")}</Text>
        <Text style={styles.opening}>{slot("opening")}</Text>

        {hasNarrative && (
          <View style={styles.narrativeWrap}>
            <ResilienceNarrativeCard block={{ embedded: true }} />
          </View>
        )}

        {SECTION_KEYS.map((key) => (
          <View key={key} style={styles.sectionBlock}>
            <Text style={styles.microLabel}>{slot(`section_${key}_label`)}</Text>
            <Text style={styles.sectionPrompt}>{slot(`section_${key}_prompt`)}</Text>
            <TextInput
              value={values[key]}
              onChangeText={(v) =>
                setValues((prev) => ({
                  ...prev,
                  [key]: v.slice(0, MAX_SECTION),
                }))
              }
              multiline
              maxLength={MAX_SECTION}
              placeholder={slot("input_placeholder")}
              placeholderTextColor="rgba(88, 58, 24, 0.4)"
              style={styles.input}
            />
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* REG-016: primary CTA bottom zone */}
      <View style={styles.bottomRegion}>
        <TouchableOpacity
          onPress={onSubmit}
          disabled={!anyContent}
          style={[styles.cta, !anyContent && styles.ctaDisabled]}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>{slot("cta_label")}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },
  title: {
    fontFamily: Fonts.serif.regular,
    fontSize: 26,
    color: "#432104",
    marginBottom: 8,
  },
  opening: {
    fontFamily: Fonts.serif.regular,
    fontStyle: "italic",
    fontSize: 16,
    color: "#6b5a45",
    marginBottom: 24,
    lineHeight: 24,
  },
  narrativeWrap: { marginBottom: 24 },
  sectionBlock: { marginBottom: 24 },
  microLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: "#c9a84c",
    marginBottom: 8,
  },
  sectionPrompt: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    color: "#432104",
    marginBottom: 8,
  },
  input: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: "rgba(199, 166, 75, 0.5)",
    borderRadius: 10,
    padding: 12,
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    color: "#432104",
    backgroundColor: "#fffdf9",
    textAlignVertical: "top",
  },
  bottomRegion: {
    minHeight: "14%",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 12,
    backgroundColor: "#FFF8EF",
  },
  cta: {
    backgroundColor: "#c9a84c",
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 16,
    color: "#432104",
  },
  ackWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  ackText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 22,
    color: "#432104",
    textAlign: "center",
  },
});

export default WeeklyReflectionBlock;

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
import { useScreenStore } from "../engine/useScreenBridge";
import store from "../store";
import { screenActions } from "../store/screenSlice";
import ResilienceNarrativeCard from "./ResilienceNarrativeCard";

const SECTIONS: { key: "held" | "took" | "tending"; label: string; prompt: string }[] = [
  {
    key: "held",
    label: "WHAT HELD YOU",
    prompt: "What helped you stay with yourself this week?",
  },
  {
    key: "took",
    label: "WHAT TOOK",
    prompt: "What pulled energy, took time, or stayed heavy?",
  },
  {
    key: "tending",
    label: "WHAT WANTS TENDING",
    prompt: "What part of you is asking for care next week?",
  },
];

const MAX_SECTION = 600;

interface Props {
  block?: any;
}

const WeeklyReflectionBlock: React.FC<Props> = () => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();
  const ss = screenData as Record<string, any>;

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
        <Text style={styles.ackText}>Held with care.</Text>
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
        <Text style={styles.title}>A letter from the week.</Text>
        <Text style={styles.opening}>
          Let us sit with it together. Nothing to perform — just what is true.
        </Text>

        {hasNarrative && (
          <View style={styles.narrativeWrap}>
            <ResilienceNarrativeCard block={{ embedded: true }} />
          </View>
        )}

        {SECTIONS.map((s) => (
          <View key={s.key} style={styles.sectionBlock}>
            <Text style={styles.microLabel}>{s.label}</Text>
            <Text style={styles.sectionPrompt}>{s.prompt}</Text>
            <TextInput
              value={values[s.key]}
              onChangeText={(v) =>
                setValues((prev) => ({
                  ...prev,
                  [s.key]: v.slice(0, MAX_SECTION),
                }))
              }
              multiline
              maxLength={MAX_SECTION}
              placeholder="Whatever comes..."
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
          <Text style={styles.ctaText}>Hold this with me</Text>
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
    color: "#3a2b12",
    marginBottom: 8,
  },
  opening: {
    fontFamily: Fonts.serif.regular,
    fontStyle: "italic",
    fontSize: 16,
    color: "#615247",
    marginBottom: 24,
    lineHeight: 24,
  },
  narrativeWrap: { marginBottom: 24 },
  sectionBlock: { marginBottom: 24 },
  microLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: "#b8922a",
    marginBottom: 8,
  },
  sectionPrompt: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    color: "#3a2b12",
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
    color: "#3a2b12",
    backgroundColor: "#fffdf5",
    textAlignVertical: "top",
  },
  bottomRegion: {
    minHeight: "14%",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 12,
    backgroundColor: "#fdf9ee",
  },
  cta: {
    backgroundColor: "#d4a017",
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 16,
    color: "#2a1804",
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
    color: "#3a2b12",
    textAlign: "center",
  },
});

export default WeeklyReflectionBlock;

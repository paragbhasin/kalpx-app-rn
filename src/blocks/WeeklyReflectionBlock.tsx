/**
 * WeeklyReflectionBlock — Mitra v3 Moment 23 (weekly reflection letter).
 *
 * Spec: /Users/paragbhasin/kalpx-frontend/docs/specs/mitra-v3-experience/screens/
 *   route_reflection_weekly.md — §1 content plan + §2 fields + §6 API contracts.
 *
 * This is a LETTER FROM MITRA that the user reads — not a form they fill out.
 * Backend returns the generated sections; the block renders them with gold
 * micro-labels and serif prose. A single response input at the end lets the
 * user reply ("That lands" quick ack OR "What stands out to you?" open text).
 *
 * Section keys (backend GET /api/mitra/journey/weekly-reflection/):
 *   response.sections.weather_map   → WHAT I NOTICED
 *   response.sections.what_helped   → WHAT HELPED
 *   response.sections.patterns      → A PATTERN
 *   response.sections.forward_look  → LOOKING FORWARD
 *   response.letter_opening (optional opening paragraph)
 *   response.letter_closing (optional italic closing)
 *
 * Optional ResilienceNarrativeCard embedded when screenData.resilience_narrative
 * is populated from /api/mitra/resilience-ledger/ (§1 Moment 26 embed).
 *
 * Submit posts a track-event `reflection_user_response` per spec §6.
 * REG-016: response CTAs sit inside the bottom thumb-zone.
 */

import React, { useState } from "react";
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

// Section order matches spec §1 content plan.
const SECTIONS: { key: "weather_map" | "what_helped" | "patterns" | "forward_look"; label: string }[] = [
  { key: "weather_map", label: "WHAT I NOTICED" },
  { key: "what_helped", label: "WHAT HELPED" },
  { key: "patterns", label: "A PATTERN" },
  { key: "forward_look", label: "LOOKING FORWARD" },
];

const MAX_RESPONSE = 800;

interface Props {
  block?: any;
}

const WeeklyReflectionBlock: React.FC<Props> = () => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();
  const ss = screenData as Record<string, any>;

  // Backend-provided letter (async-generated; may be pending).
  const letter = ss.weekly_reflection_letter || ss.weekly_reflection || {};
  const sections = letter.sections || {};
  const status = letter.status;
  const cycleDay = ss.cycle_day || letter.cycle_day || ss.day_number;

  const [response, setResponse] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const dispatch = (action: any) =>
    executeAction(
      { ...action, currentScreen },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          store.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: store.getState().screen.screenData,
      },
    );

  // Generating state — spec §4 state machine, §1 "Let me sit with your week…".
  if (status === "generating" || status === "pending") {
    return (
      <View style={styles.generatingWrap}>
        <Text style={styles.generatingText}>
          Let me sit with your week for a moment…
        </Text>
      </View>
    );
  }

  // Error / not-ready — spec §11 error states.
  const hasAnySection = SECTIONS.some((s) => (sections[s.key] || "").trim().length > 0);
  if (!hasAnySection && !letter.letter_opening) {
    return (
      <View style={styles.generatingWrap}>
        <Text style={styles.generatingText}>
          I&apos;m still sitting with your week. Come back in a bit.
        </Text>
      </View>
    );
  }

  const onAcknowledge = async () => {
    setAcknowledged(true);
    await dispatch({
      type: "submit_weekly_reflection",
      payload: { cycle_day: cycleDay, ack_only: true },
    });
  };

  const onSubmitResponse = async () => {
    const text = response.trim().slice(0, MAX_RESPONSE);
    if (!text) return;
    setSubmitted(true);
    await dispatch({
      type: "submit_weekly_reflection",
      payload: { cycle_day: cycleDay, text, response_type: "text" },
    });
  };

  if (submitted || acknowledged) {
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
        {letter.letter_opening ? (
          <Text style={styles.opening}>{letter.letter_opening}</Text>
        ) : (
          <Text style={styles.opening}>
            Let me show you something from this week.
          </Text>
        )}

        {SECTIONS.map((s) => {
          const text = (sections[s.key] || "").trim();
          if (!text) return null;
          return (
            <View key={s.key} style={styles.sectionBlock}>
              <Text style={styles.microLabel}>{s.label}</Text>
              <Text style={styles.sectionBody}>{text}</Text>
            </View>
          );
        })}

        {/* Resilience narrative embed — §1 Moment 26 */}
        {hasNarrative ? (
          <View style={styles.sectionBlock}>
            <Text style={styles.microLabel}>WHAT&apos;S GROWING</Text>
            <ResilienceNarrativeCard block={{ embedded: true }} />
          </View>
        ) : null}

        {letter.letter_closing ? (
          <Text style={styles.closing}>{letter.letter_closing}</Text>
        ) : null}

        {/* End-of-letter response input */}
        <View style={styles.responseWrap}>
          <Text style={styles.responsePrompt}>What stands out to you?</Text>
          <TextInput
            value={response}
            onChangeText={(v) => setResponse(v.slice(0, MAX_RESPONSE))}
            multiline
            maxLength={MAX_RESPONSE}
            placeholder="A line, a word, or nothing at all."
            placeholderTextColor="rgba(88, 58, 24, 0.4)"
            style={styles.input}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* REG-016: CTAs in bottom thumb-zone. */}
      <View style={styles.bottomRegion}>
        <TouchableOpacity
          onPress={response.trim() ? onSubmitResponse : onAcknowledge}
          style={styles.cta}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>
            {response.trim() ? "Hold this with me" : "That lands"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },
  generatingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    minHeight: 200,
  },
  generatingText: {
    fontFamily: Fonts.serif.regular,
    fontStyle: "italic",
    fontSize: 17,
    color: "#6b5a45",
    textAlign: "center",
    lineHeight: 26,
  },
  opening: {
    fontFamily: Fonts.serif.regular,
    fontStyle: "italic",
    fontSize: 18,
    color: "#432104",
    marginBottom: 28,
    lineHeight: 28,
  },
  sectionBlock: { marginBottom: 28 },
  microLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: "#c9a84c",
    marginBottom: 10,
  },
  sectionBody: {
    fontFamily: Fonts.serif.regular,
    fontSize: 17,
    color: "#432104",
    lineHeight: 26,
  },
  closing: {
    fontFamily: Fonts.serif.regular,
    fontStyle: "italic",
    fontSize: 19,
    color: "#432104",
    lineHeight: 28,
    marginTop: 8,
    marginBottom: 28,
  },
  responseWrap: { marginTop: 16 },
  responsePrompt: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#6b5a45",
    marginBottom: 10,
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
    minHeight: 200,
  },
  ackText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 22,
    color: "#432104",
    textAlign: "center",
  },
});

export default WeeklyReflectionBlock;

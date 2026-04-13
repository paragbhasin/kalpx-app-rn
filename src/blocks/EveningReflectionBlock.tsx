/**
 * EveningReflectionBlock — Mitra v3 Moment 34 (end-of-day reflection).
 *
 * Spec: /Users/paragbhasin/kalpx-frontend/docs/specs/mitra-v3-experience/screens/route_reflection_evening.md
 * Web parity: kalpx-frontend/src/engine/actionExecutor.js (track_event "evening_reflection" pattern)
 *   and kalpx-frontend/src/mock/mock/allContainers.js cycle_transitions/daily_reflection:3700+.
 *
 * Shape: Mitra's brief prompt "How did today land?" + 3 chips
 * (steady / mixed / hard) + optional one-line freeform + optional mic. On
 * submit dispatches `submit_evening_reflection` which posts to gratitude-ledger
 * (tolerant of 404), then shows an ack beat and navigates back to dashboard.
 *
 * REG-015: the draft state (evening_reflection_draft) is local to this block
 * and is cleared on submit + on unmount.
 * REG-016: the submit CTA sits inside the bottom 30% thumb-zone wrapper.
 *
 * Tone lint (strict): no exclamations, no "amazing/great/awesome", no streak
 * counts, no comparisons. Mitra acknowledges — she does not cheer.
 */

import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
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

const CHIPS = [
  { id: "steady", label: "Steady" },
  { id: "mixed", label: "Mixed" },
  { id: "hard", label: "Hard" },
];

const MAX_CHARS = 240;

interface Props {
  block?: any;
}

const EveningReflectionBlock: React.FC<Props> = () => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();
  const ss = screenData as Record<string, any>;

  const draft = ss.evening_reflection_draft || {};
  const [chip, setChip] = useState<string | null>(draft.chip || null);
  const [text, setText] = useState<string>(draft.text || "");
  const [submitted, setSubmitted] = useState(false);

  // Persist to draft (kept local — cleared on exit/submit by actionExecutor)
  useEffect(() => {
    store.dispatch(
      screenActions.setScreenValue({
        key: "evening_reflection_draft",
        value: { chip, text },
      }),
    );
  }, [chip, text]);

  // REG-015: on unmount, clear draft if not submitted (prevents leak into
  // other flows).
  useEffect(() => {
    return () => {
      const s = store.getState().screen.screenData;
      if (s._evening_reflection_submitted !== true) {
        store.dispatch(
          screenActions.setScreenValue({
            key: "evening_reflection_draft",
            value: null,
          }),
        );
      }
    };
  }, []);

  const onSubmit = async () => {
    if (!chip) return;
    setSubmitted(true);
    await executeAction(
      {
        type: "submit_evening_reflection",
        payload: { chip, text: text.trim() },
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
        <Text style={styles.ackText}>
          Thank you for showing up. Rest well.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <View style={styles.topRegion}>
        <Text style={styles.prompt}>How did today land?</Text>

        <View style={styles.chipRow}>
          {CHIPS.map((c) => {
            const active = chip === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => setChip(c.id)}
                style={[styles.chip, active && styles.chipActive]}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TextInput
          value={text}
          onChangeText={(v) => setText(v.slice(0, MAX_CHARS))}
          placeholder="One line, if anything wants naming."
          placeholderTextColor="rgba(88, 58, 24, 0.45)"
          style={styles.input}
          multiline
          maxLength={MAX_CHARS}
        />
      </View>

      {/* REG-016: primary CTA in bottom 30% */}
      <View style={styles.bottomRegion}>
        <TouchableOpacity
          onPress={onSubmit}
          disabled={!chip}
          style={[styles.cta, !chip && styles.ctaDisabled]}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Set down the day"
        >
          <Text style={styles.ctaText}>Set it down</Text>
        </TouchableOpacity>
        <Text style={styles.helper}>Mitra will carry it into tomorrow.</Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  topRegion: { flex: 1 },
  bottomRegion: {
    minHeight: "28%",
    justifyContent: "flex-end",
    paddingBottom: 32,
  },
  prompt: {
    fontFamily: Fonts.serif.regular,
    fontSize: 24,
    color: "#432104",
    marginBottom: 20,
    textAlign: "center",
  },
  chipRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#c9a84c",
    backgroundColor: "#fffdf9",
  },
  chipActive: { backgroundColor: "#c9a84c", borderColor: "#c9a84c" },
  chipText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#432104",
  },
  chipTextActive: { color: "#fffdf9" },
  input: {
    minHeight: 72,
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
  cta: {
    backgroundColor: "#c9a84c",
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
  },
  ctaDisabled: { opacity: 0.45 },
  ctaText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 16,
    color: "#432104",
  },
  helper: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: "rgba(88, 58, 24, 0.65)",
    textAlign: "center",
    marginTop: 10,
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

export default EveningReflectionBlock;

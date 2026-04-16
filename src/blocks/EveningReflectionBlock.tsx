/**
 * EveningReflectionBlock — Mitra v3 Moment 35 (end-of-day reflection).
 *
 * Phase C pilot migration — content sovereignty compliant.
 *   Before: every user-facing string hard-coded in this file.
 *   After: all user-facing strings read from screenData slots resolved
 *          by kalpx/core/content backend (moment_id=M35_evening_reflection).
 *
 * Slot keys (null-safe "" fallback; no English in this file):
 *   evening_reflection.prompt
 *   evening_reflection.chip_steady_label / chip_mixed_label / chip_hard_label
 *   evening_reflection.placeholder
 *   evening_reflection.cta_label
 *   evening_reflection.helper
 *   evening_reflection.ack_text
 *
 * If slots are empty strings (backend resolver unreachable or ctx invalid)
 * the render appears short but never crashes. Missing content surfaces via
 * MitraDecisionLog / fallback_rate dashboards, not through a hidden TSX
 * fallback — that was the whole point of the sovereignty gate.
 *
 * Spec refs:
 *   kalpx-app-rn/docs/CONTENT_CONTRACT_V1.md        (slot shape)
 *   kalpx-app-rn/docs/ORCHESTRATION_CONTRACT_V1.md  (null-safe contract)
 *   kalpx-app-rn/docs/PRESENTATION_CONTEXT_WALKTHROUGHS.md §6 (M35 pctx)
 *
 * REG-015: the draft state (evening_reflection_draft) is local to this block
 * and is cleared on submit + on unmount.
 * REG-016: the submit CTA sits inside the bottom 30% thumb-zone wrapper.
 *
 * Chip IDs remain stable: steady / mixed / hard — these are analytics keys,
 * NOT display labels. Display labels come from slots and may rotate.
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

// Chip IDs are stable (analytics keys). Display labels come from the
// M35_evening_reflection ContentPack via screenData slots.
const CHIP_IDS = ["steady", "mixed", "hard"] as const;

const MAX_CHARS = 240;

/**
 * Read a slot from screenData with null-safe "" default. No English
 * fallback — if the slot is empty the UI shows nothing, exposing the
 * missing content via telemetry rather than hiding it.
 */
const readSlot = (ss: Record<string, any>, key: string): string => {
  const moment = ss.evening_reflection;
  if (moment && typeof moment === "object" && typeof moment[key] === "string") {
    return moment[key];
  }
  return "";
};

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

  const prompt = readSlot(ss, "prompt");
  const placeholder = readSlot(ss, "placeholder");
  const ctaLabel = readSlot(ss, "cta_label");
  const helper = readSlot(ss, "helper");
  const ackText = readSlot(ss, "ack_text");
  const chipLabels: Record<string, string> = {
    steady: readSlot(ss, "chip_steady_label"),
    mixed: readSlot(ss, "chip_mixed_label"),
    hard: readSlot(ss, "chip_hard_label"),
  };

  if (submitted) {
    return (
      <View style={styles.ackWrap}>
        <Text style={styles.ackText}>{ackText}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <View style={styles.topRegion}>
        <Text style={styles.prompt}>{prompt}</Text>

        <View style={styles.chipRow}>
          {CHIP_IDS.map((id) => {
            const active = chip === id;
            const label = chipLabels[id];
            return (
              <TouchableOpacity
                key={id}
                onPress={() => setChip(id)}
                style={[styles.chip, active && styles.chipActive]}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TextInput
          value={text}
          onChangeText={(v) => setText(v.slice(0, MAX_CHARS))}
          placeholder={placeholder}
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
          accessibilityLabel={ctaLabel}
        >
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </TouchableOpacity>
        <Text style={styles.helper}>{helper}</Text>
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

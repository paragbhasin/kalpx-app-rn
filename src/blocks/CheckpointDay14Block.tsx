/**
 * CheckpointDay14Block — Mitra v3 Moment 25 (Day 14 evolution point).
 *
 * Spec: /Users/paragbhasin/kalpx-frontend/docs/specs/mitra-v3-experience/screens/route_checkpoint_day_14.md
 * Web parity:
 *   - kalpx-frontend/src/containers/CycleTransitionsContainer.vue (Day 14)
 *   - kalpx-frontend/src/engine/actionExecutor.js:2512-2645 (checkpoint_submit
 *     with csDay === 14 — handles continue_same / deepen / change_focus).
 *   - src/engine/actionExecutor.js seal_day handler (preserved in RN at
 *     actionExecutor.ts case "seal_day":2075).
 *
 * IMPORTANT: we reuse the existing `checkpoint_submit` handler — setting
 * checkpoint_day=14 and submitting with decision values the backend expects
 * (continue_same | deepen | change_focus). The optional seal-day ritual entry
 * uses the existing `seal_day` action on the explicit "Seal this cycle" tap.
 *
 * REG-016: all three primary evolution options live in the bottom 30% zone.
 */

import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
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

const DOTS = 14;

interface Props {
  block?: any;
}

const CheckpointDay14Block: React.FC<Props> = () => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();
  const ss = screenData as Record<string, any>;

  // Phase D — M25 registry-backed slots; null-safe on failure.
  useContentSlots({
    momentId: "M25_checkpoint_day_14",
    screenDataKey: "checkpoint_day_14",
    buildCtx: (s) => ({
      path: s.journey_path === "growth" ? "growth" : "support",
      guidance_mode: s.guidance_mode || "hybrid",
      locale: s.locale || "en",
      user_attention_state: "reflective_exposed",
      emotional_weight: "heavy",
      cycle_day: Number(s.day_number) || 14,
      entered_via: s._entered_via || "dashboard_day_14_auto_navigation",
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
  const slot = (name: string) => readMomentSlot(ss, "checkpoint_day_14", name);

  const [step, setStep] = useState<"intro" | "body">("intro");
  const [reflection, setReflection] = useState<string>(
    ss.checkpoint_user_reflection || "",
  );
  const [sealRitual, setSealRitual] = useState<string>("");

  const statuses: string[] =
    Array.isArray(ss.journey_day_statuses) && ss.journey_day_statuses.length
      ? ss.journey_day_statuses
      : Array(DOTS).fill("completed");

  const completedCount = statuses.filter((s) => s === "completed").length;

  const narrative: string =
    ss.journey_narrative ||
    `Fourteen days. Two weeks of showing up. ${completedCount} of ${DOTS} sealed. Something has settled.`;

  const growth: string | null = ss.what_grew_section || null;

  const submitDecision = async (
    decision: "continue_same" | "deepen" | "change_focus",
  ) => {
    store.dispatch(
      screenActions.setScreenValue({
        key: "checkpoint_user_reflection",
        value: reflection,
      }),
    );
    store.dispatch(
      screenActions.setScreenValue({ key: "checkpoint_day", value: 14 }),
    );
    // Optional seal-day ritual entry — recorded as a screen field consumed by
    // backend meta of checkpoint_submit (web parity).
    if (sealRitual.trim()) {
      store.dispatch(
        screenActions.setScreenValue({
          key: "checkpoint_seal_ritual",
          value: sealRitual.trim(),
        }),
      );
    }

    await executeAction(
      {
        type: "checkpoint_submit",
        payload: { decision },
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

  if (step === "intro") {
    return (
      <View style={styles.root}>
        <View style={styles.topRegion}>
          <Text style={styles.eyebrow}>{slot("eyebrow")}</Text>
          <Text style={styles.headline}>{slot("intro_headline")}</Text>
          <Text style={styles.body}>{slot("intro_body")}</Text>
        </View>
        <View style={styles.bottomRegion}>
          <TouchableOpacity
            onPress={() => setStep("body")}
            style={styles.cta}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>{slot("intro_cta_label")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.eyebrow}>{slot("eyebrow")}</Text>

        <View style={styles.gridWrap}>
          {Array.from({ length: 2 }).map((_, row) => (
            <View style={styles.gridRow} key={row}>
              {statuses
                .slice(row * 7, row * 7 + 7)
                .map((s, i) => (
                  <View
                    key={`${row}-${i}`}
                    style={[
                      styles.dot,
                      s === "completed" && styles.dotFilled,
                      s === "partial" && styles.dotPartial,
                    ]}
                  />
                ))}
            </View>
          ))}
        </View>

        <Text style={styles.summary}>
          {completedCount} of {DOTS} days.
        </Text>

        <Text style={styles.narrative}>{narrative}</Text>

        {growth ? (
          <View style={styles.growthBox}>
            <Text style={styles.microLabel}>{slot("summary_label")}</Text>
            <Text style={styles.narrative}>{growth}</Text>
          </View>
        ) : null}

        <Text style={styles.microLabel}>{slot("seal_cycle_label")}</Text>
        <Text style={styles.helper}>{slot("seal_cycle_helper")}</Text>
        <TextInput
          value={sealRitual}
          onChangeText={(v) => setSealRitual(v.slice(0, 300))}
          placeholder={slot("seal_input_placeholder")}
          placeholderTextColor="rgba(88, 58, 24, 0.4)"
          multiline
          style={styles.input}
          maxLength={300}
        />

        <Text style={[styles.microLabel, { marginTop: 20 }]}>{slot("carry_label")}</Text>
        <TextInput
          value={reflection}
          onChangeText={(v) => setReflection(v.slice(0, 1500))}
          placeholder={slot("carry_input_placeholder")}
          placeholderTextColor="rgba(88, 58, 24, 0.4)"
          multiline
          style={styles.input}
          maxLength={1500}
        />
      </ScrollView>

      {/* REG-016: three evolution options in bottom zone */}
      <View style={styles.bottomRegion}>
        <TouchableOpacity
          onPress={() => submitDecision("continue_same")}
          style={styles.cta}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>{slot("continue_path_cta")}</Text>
        </TouchableOpacity>
        <View style={styles.secondaryRow}>
          <TouchableOpacity
            onPress={() => submitDecision("deepen")}
            style={styles.secondaryBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryText}>{slot("deepen_practice_cta")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => submitDecision("change_focus")}
            style={styles.secondaryBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryText}>{slot("change_focus_cta")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFF8EF" },
  scroll: { padding: 24, paddingBottom: 16 },
  topRegion: { flex: 1, padding: 24, justifyContent: "center" },
  bottomRegion: {
    minHeight: "30%",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 12,
  },
  eyebrow: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: "#c9a84c",
    marginBottom: 10,
  },
  headline: {
    fontFamily: Fonts.serif.regular,
    fontSize: 28,
    color: "#432104",
    marginBottom: 12,
  },
  body: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#6b5a45",
    lineHeight: 26,
  },
  gridWrap: { alignItems: "center", marginVertical: 14, gap: 10 },
  gridRow: { flexDirection: "row", gap: 10 },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#c9a84c",
    backgroundColor: "transparent",
  },
  dotFilled: { backgroundColor: "#c9a84c" },
  dotPartial: { backgroundColor: "rgba(212,160,23,0.45)" },
  summary: {
    textAlign: "center",
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#6b5a45",
    marginBottom: 16,
  },
  narrative: {
    fontFamily: Fonts.serif.regular,
    fontSize: 17,
    color: "#432104",
    lineHeight: 26,
    marginBottom: 16,
  },
  microLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: "#c9a84c",
    marginBottom: 8,
  },
  helper: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#6b5a45",
    marginBottom: 8,
  },
  growthBox: {
    backgroundColor: "#fffdf9",
    borderColor: "rgba(199, 166, 75, 0.4)",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
  },
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
  ctaText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 16,
    color: "#432104",
  },
  secondaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#c9a84c",
    paddingVertical: 12,
    borderRadius: 26,
    alignItems: "center",
    backgroundColor: "#fffdf9",
  },
  secondaryText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#432104",
  },
});

export default CheckpointDay14Block;

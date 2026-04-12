/**
 * CheckpointDay7Block — Mitra v3 Moment 24 (Day 7 continuity mirror).
 *
 * Spec: /Users/paragbhasin/kalpx-frontend/docs/specs/mitra-v3-experience/screens/route_checkpoint_day_7.md
 * Web parity:
 *   - kalpx-frontend/src/containers/CycleTransitionsContainer.vue (Day 7 flow)
 *   - kalpx-frontend/src/engine/actionExecutor.js:2512-2645 (checkpoint_submit)
 *
 * IMPORTANT: we do NOT rewrite the existing `checkpoint_submit` action — we
 * dispatch it verbatim so the backend contract is preserved (actionExecutor.ts
 * case "checkpoint_submit" around line 2509).
 *
 * Vue-internal component-local steps: intro → grid → decision.
 * Decision maps: keep → "continue", evolve → "start_fresh", lighten → "lighten".
 *
 * REG-016: decision CTAs live in the bottom 30% thumb zone.
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
import { useScreenStore } from "../engine/useScreenBridge";
import store from "../store";
import { screenActions } from "../store/screenSlice";

type Step = "intro" | "body";

const DOTS = 7;

interface Props {
  block?: any;
}

const CheckpointDay7Block: React.FC<Props> = () => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();
  const ss = screenData as Record<string, any>;
  const [step, setStep] = useState<Step>("intro");
  const [reflection, setReflection] = useState<string>(
    ss.checkpoint_user_reflection || "",
  );

  const statuses: string[] =
    Array.isArray(ss.journey_day_statuses) && ss.journey_day_statuses.length
      ? ss.journey_day_statuses
      : Array(DOTS).fill("completed");

  const completedCount = statuses.filter((s) => s === "completed").length;

  const narrative: string =
    ss.journey_narrative ||
    `You have been with me for a week. ${completedCount} of ${DOTS} days you came back. That matters more than the count.`;

  const growth: string | null = ss.what_grew_section || null;

  const dispatchDecision = async (decision: "continue" | "lighten" | "start_fresh") => {
    // Persist reflection so checkpoint_submit reads it identically to web.
    store.dispatch(
      screenActions.setScreenValue({
        key: "checkpoint_user_reflection",
        value: reflection,
      }),
    );
    store.dispatch(
      screenActions.setScreenValue({ key: "checkpoint_day", value: 7 }),
    );

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
          <Text style={styles.eyebrow}>DAY 7</Text>
          <Text style={styles.headline}>You’ve been at this a week.</Text>
          <Text style={styles.body}>
            Can I show you what I’ve seen?
          </Text>
        </View>
        <View style={styles.bottomRegion}>
          <TouchableOpacity
            onPress={() => setStep("body")}
            style={styles.cta}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>Show me</Text>
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
        <Text style={styles.eyebrow}>DAY 7</Text>

        {/* Journey grid */}
        <View style={styles.grid}>
          {statuses.slice(0, DOTS).map((s, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                s === "completed" && styles.dotFilled,
                s === "partial" && styles.dotPartial,
              ]}
            />
          ))}
        </View>

        <Text style={styles.summary}>
          {completedCount} of {DOTS} days.
        </Text>

        <Text style={styles.narrative}>{narrative}</Text>

        {growth ? (
          <View style={styles.growthBox}>
            <Text style={styles.microLabel}>WHAT GREW</Text>
            <Text style={styles.narrative}>{growth}</Text>
          </View>
        ) : null}

        <Text style={styles.microLabel}>WHAT TO CARRY</Text>
        <TextInput
          value={reflection}
          onChangeText={(v) => setReflection(v.slice(0, 1000))}
          placeholder="What do you want to carry into next week? (optional)"
          placeholderTextColor="rgba(88, 58, 24, 0.4)"
          multiline
          style={styles.input}
          maxLength={1000}
        />

        <Text style={[styles.microLabel, { marginTop: 20 }]}>NEXT WEEK</Text>
        <Text style={styles.narrative}>
          Do you want to keep this path, evolve it, or lighten it?
        </Text>
      </ScrollView>

      {/* REG-016: all three decisions in bottom region, primary largest */}
      <View style={styles.bottomRegion}>
        <TouchableOpacity
          onPress={() => dispatchDecision("continue")}
          style={styles.cta}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Continue my path</Text>
        </TouchableOpacity>
        <View style={styles.secondaryRow}>
          <TouchableOpacity
            onPress={() => dispatchDecision("lighten")}
            style={styles.secondaryBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryText}>Lighten it</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => dispatchDecision("start_fresh")}
            style={styles.secondaryBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryText}>Start fresh</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fdf9ee" },
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
    color: "#b8922a",
    marginBottom: 10,
  },
  headline: {
    fontFamily: Fonts.serif.regular,
    fontSize: 28,
    color: "#3a2b12",
    marginBottom: 12,
  },
  body: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#615247",
    lineHeight: 26,
  },
  grid: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginVertical: 18,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#c7a64b",
    backgroundColor: "transparent",
  },
  dotFilled: { backgroundColor: "#d4a017" },
  dotPartial: { backgroundColor: "rgba(212,160,23,0.45)" },
  summary: {
    textAlign: "center",
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#615247",
    marginBottom: 16,
  },
  narrative: {
    fontFamily: Fonts.serif.regular,
    fontSize: 17,
    color: "#3a2b12",
    lineHeight: 26,
    marginBottom: 16,
  },
  microLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: "#b8922a",
    marginBottom: 8,
  },
  growthBox: {
    backgroundColor: "#fffdf5",
    borderColor: "rgba(199, 166, 75, 0.4)",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
  },
  input: {
    minHeight: 80,
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
  cta: {
    backgroundColor: "#d4a017",
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
  },
  ctaText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 16,
    color: "#2a1804",
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
    borderColor: "#c7a64b",
    paddingVertical: 12,
    borderRadius: 26,
    alignItems: "center",
    backgroundColor: "#fffdf5",
  },
  secondaryText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#432104",
  },
});

export default CheckpointDay7Block;

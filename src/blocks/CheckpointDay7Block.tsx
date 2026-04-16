/**
 * CheckpointDay7Block — Mitra v3 Moment M24 (Day 7 continuity mirror).
 *
 * Phase C pilot migration — content sovereignty compliant.
 *   Before: narrative fallback + eyebrow + headline + 3 decision CTA
 *           labels all hard-coded English in this file.
 *   After: all user-facing strings read from screenData.checkpoint_day_7.*
 *          slots resolved by kalpx/core/content backend
 *          (moment_id=M24_checkpoint_day_7). NO English fallback here.
 *
 * Compound moment: intro → body. Slots for both steps live in the same
 * ContentPack (see yaml → compound_moment_sequence: [intro, body]).
 *
 * Decision CTAs (irreversibility tone rules enforced by pilot tests):
 *   keep → "continue", evolve → "start_fresh", lighten → "lighten".
 *
 * Spec refs:
 *   kalpx-app-rn/docs/PRESENTATION_CONTEXT_WALKTHROUGHS.md §4 (M24 pctx)
 *   kalpx-app-rn/docs/CONTENT_CONTRACT_V1.md
 *   kalpx-app-rn/docs/ORCHESTRATION_CONTRACT_V1.md
 *
 * REG-016: decision CTAs live in the bottom 30% thumb zone (unchanged).
 */

import React, { useEffect, useRef, useState } from "react";
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
import { mitraResolveMoment } from "../engine/mitraApi";
import { useScreenStore } from "../engine/useScreenBridge";
import store from "../store";
import { screenActions } from "../store/screenSlice";

type Step = "intro" | "body";

const DOTS = 7;

/**
 * Null-safe slot read from screenData.checkpoint_day_7. No English
 * fallback — blank UI on missing content exposes via telemetry.
 */
const readSlot = (ss: Record<string, any>, key: string): string => {
  const moment = ss.checkpoint_day_7;
  if (moment && typeof moment === "object" && typeof moment[key] === "string") {
    return moment[key];
  }
  return "";
};

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
  const resolveFiredRef = useRef(false);

  // Phase C M24 pilot — resolve compound intro→body slots on mount.
  useEffect(() => {
    if (resolveFiredRef.current) return;
    if (ss.checkpoint_day_7 && typeof ss.checkpoint_day_7 === "object") {
      resolveFiredRef.current = true;
      return;
    }
    resolveFiredRef.current = true;
    const cycleId =
      typeof ss.journey_id === "string" && ss.journey_id
        ? ss.journey_id
        : typeof ss.cycle_id === "string" && ss.cycle_id
          ? ss.cycle_id
          : "";
    const resolveCtx = {
      path: (ss.journey_path === "growth" ? "growth" : "support") as
        | "support"
        | "growth",
      guidance_mode: (ss.guidance_mode || "hybrid") as
        | "universal"
        | "hybrid"
        | "rooted",
      locale: (ss.locale || "en") as string,
      user_attention_state: "reflective_exposed",
      emotional_weight: "heavy" as const,
      cycle_day: Number(ss.day_number) || 7,
      entered_via:
        typeof ss._entered_via === "string" && ss._entered_via
          ? ss._entered_via
          : "dashboard_day_7_auto_navigation",
      stage_signals: {},
      today_layer: {},
      life_layer: {
        cycle_id: cycleId,
        life_kosha: (ss.life_kosha || ss.scan_focus || "") as string,
        scan_focus: (ss.scan_focus || "") as string,
        life_klesha: ss.life_klesha || null,
        life_vritti: ss.life_vritti || null,
        life_goal: ss.life_goal || null,
      },
    };
    let cancelled = false;
    (async () => {
      const payload = await mitraResolveMoment("M24_checkpoint_day_7", resolveCtx);
      if (cancelled || !payload) return;
      store.dispatch(
        screenActions.setScreenValue({
          key: "checkpoint_day_7",
          value: payload.slots,
        }),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const statuses: string[] =
    Array.isArray(ss.journey_day_statuses) && ss.journey_day_statuses.length
      ? ss.journey_day_statuses
      : Array(DOTS).fill("completed");

  const completedCount = statuses.filter((s) => s === "completed").length;

  // Slot reads. No English fallback — narrative stays empty if backend
  // hasn't resolved yet. Missing content visible, not hidden.
  const eyebrow = readSlot(ss, "eyebrow");
  const introHeadline = readSlot(ss, "intro_headline");
  const introBody = readSlot(ss, "intro_body");
  const introCtaLabel = readSlot(ss, "intro_cta_label");
  const bodyNarrativeAuthored = readSlot(ss, "body_narrative");
  const whatGrewLabel = readSlot(ss, "what_grew_label");
  const whatToCarryLabel = readSlot(ss, "what_to_carry_label");
  const inputPlaceholder = readSlot(ss, "input_placeholder");
  const nextWeekLabel = readSlot(ss, "next_week_label");
  const nextWeekProse = readSlot(ss, "next_week_prose");
  const ctaContinueLabel = readSlot(ss, "cta_continue_label");
  const ctaLightenLabel = readSlot(ss, "cta_lighten_label");
  const ctaStartFreshLabel = readSlot(ss, "cta_start_fresh_label");

  // Backend-provided journey_narrative takes precedence over authored
  // baseline — it's per-user pattern. If neither is available, slot
  // stays empty (null-safe).
  const narrative: string = ss.journey_narrative || bodyNarrativeAuthored;

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
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.headline}>{introHeadline}</Text>
          <Text style={styles.body}>{introBody}</Text>
        </View>
        <View style={styles.bottomRegion}>
          <TouchableOpacity
            onPress={() => setStep("body")}
            style={styles.cta}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>{introCtaLabel}</Text>
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
        <Text style={styles.eyebrow}>{eyebrow}</Text>

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
            <Text style={styles.microLabel}>{whatGrewLabel}</Text>
            <Text style={styles.narrative}>{growth}</Text>
          </View>
        ) : null}

        <Text style={styles.microLabel}>{whatToCarryLabel}</Text>
        <TextInput
          value={reflection}
          onChangeText={(v) => setReflection(v.slice(0, 1000))}
          placeholder={inputPlaceholder}
          placeholderTextColor="rgba(88, 58, 24, 0.4)"
          multiline
          style={styles.input}
          maxLength={1000}
        />

        <Text style={[styles.microLabel, { marginTop: 20 }]}>{nextWeekLabel}</Text>
        <Text style={styles.narrative}>{nextWeekProse}</Text>
      </ScrollView>

      {/* REG-016: all three decisions in bottom region, primary largest */}
      <View style={styles.bottomRegion}>
        <TouchableOpacity
          onPress={() => dispatchDecision("continue")}
          style={styles.cta}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>{ctaContinueLabel}</Text>
        </TouchableOpacity>
        <View style={styles.secondaryRow}>
          <TouchableOpacity
            onPress={() => dispatchDecision("lighten")}
            style={styles.secondaryBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryText}>{ctaLightenLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => dispatchDecision("start_fresh")}
            style={styles.secondaryBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryText}>{ctaStartFreshLabel}</Text>
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
  growthBox: {
    backgroundColor: "#fffdf9",
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
    fontSize: 14,
    color: "#432104",
  },
});

export default CheckpointDay7Block;

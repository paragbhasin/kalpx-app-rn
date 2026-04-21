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
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import uuidv4 from "react-native-uuid";
import { mitraJourneyDay7Decision, mitraJourneyDay7View } from "../engine/mitraApi";
import { useScreenStore } from "../engine/useScreenBridge";
import { ingestDailyView, ingestDay7View } from "../engine/v3Ingest";
import store from "../store";
import { loadScreenWithData, screenActions } from "../store/screenSlice";
import { Fonts } from "../theme/fonts";

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
  const { screenData } = useScreenStore();
  const ss = screenData as Record<string, any>;
  const [step, setStep] = useState<Step>("intro");
  const [reflection, setReflection] = useState<string>(
    ss.checkpoint_user_reflection || "",
  );
  const [submitting, setSubmitting] = useState(false);
  const fetchedRef = useRef(false);
  const etagRef = useRef<string | null>(null);

  // v3 journey: fetch day-7-view which carries all slot copy + framing
  // + journey_narrative inline. Replaces the legacy M24 mitraResolveMoment
  // compound-moment resolve.
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    let cancelled = false;
    (async () => {
      const result = await mitraJourneyDay7View(etagRef.current);
      if (cancelled) return;
      if (result.etag) etagRef.current = result.etag;
      if (result.notModified || !result.envelope) return;
      const flat = ingestDay7View(result.envelope);
      for (const [k, v] of Object.entries(flat)) {
        if (v !== undefined) {
          store.dispatch(screenActions.setScreenValue({ key: k, value: v }));
        }
      }
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
  const introBodySlot = readSlot(ss, "intro_body");
  // T4B: per-intent framing from checkpoint GET overrides spine intro_body.
  const introBody: string =
    typeof ss.checkpoint_framing === "string" && ss.checkpoint_framing
      ? ss.checkpoint_framing
      : introBodySlot;
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

  const dispatchDecision = async (
    decision: "continue" | "lighten" | "start_fresh",
  ) => {
    if (submitting) return;
    setSubmitting(true);
    // v3 decision names: legacy "start_fresh" → v3 "reset".
    const v3Decision: "continue" | "lighten" | "reset" =
      decision === "start_fresh" ? "reset" : decision;
    const idempotencyKey = String(uuidv4.v4());
    try {
      const env = await mitraJourneyDay7Decision(
        { decision: v3Decision, reflection },
        idempotencyKey,
      );
      if (!env) {
        console.warn("[CheckpointDay7Block] decision network error");
        setSubmitting(false);
        return;
      }
      const nv = env.next_view ?? { view_key: "", payload: {} };
      if (nv.view_key === "daily_view") {
        for (const [k, v] of Object.entries(ingestDailyView(nv.payload as any))) {
          if (v !== undefined) {
            store.dispatch(screenActions.setScreenValue({ key: k, value: v }));
          }
        }
        store.dispatch(
          loadScreenWithData({
            containerId: "companion_dashboard",
            stateId: "day_active",
          }) as any,
        );
      } else if (nv.view_key === "onboarding_start") {
        store.dispatch(
          loadScreenWithData({
            containerId: "welcome_onboarding",
            stateId: "turn_1",
          }) as any,
        );
      } else {
        console.warn(
          "[CheckpointDay7Block] unexpected next_view.view_key",
          nv.view_key,
        );
      }
    } catch (err: any) {
      console.warn("[CheckpointDay7Block] decision threw:", err?.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "intro") {
    return (
      <View style={styles.root}>
        <View style={styles.topRegion}>
          <Text style={styles.eyebrow} testID="checkpoint_day_7_eyebrow">
            {eyebrow}
          </Text>
          <Text style={styles.headline} testID="checkpoint_day_7_headline">
            {introHeadline}
          </Text>
          <Text style={styles.body} testID="checkpoint_day_7_narrative">
            {introBody}
          </Text>
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

        <Text style={[styles.microLabel, { marginTop: 20 }]}>
          {nextWeekLabel}
        </Text>
        <Text style={styles.narrative}>{nextWeekProse}</Text>
      </ScrollView>

      {/* REG-016: all three decisions in bottom region, primary largest */}
      <View style={styles.bottomRegion}>
        <TouchableOpacity
          onPress={() => dispatchDecision("continue")}
          style={styles.cta}
          activeOpacity={0.85}
          testID="checkpoint_day_7_cta_continue"
        >
          <Text style={styles.ctaText}>{ctaContinueLabel}</Text>
        </TouchableOpacity>
        <View style={styles.secondaryRow}>
          <TouchableOpacity
            onPress={() => dispatchDecision("lighten")}
            style={styles.secondaryBtn}
            activeOpacity={0.85}
            testID="checkpoint_day_7_cta_lighten"
          >
            <Text style={styles.secondaryText}>{ctaLightenLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => dispatchDecision("start_fresh")}
            style={styles.secondaryBtn}
            activeOpacity={0.85}
            testID="checkpoint_day_7_cta_start_fresh"
          >
            <Text style={styles.secondaryText}>{ctaStartFreshLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
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
    backgroundColor: "#FBF5F5",
    borderColor: "#9f9f9f",
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 28,
    alignItems: "center",

    elevation: 6,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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

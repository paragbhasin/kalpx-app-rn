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
import {
  mitraJourneyDay14Decision,
  mitraJourneyDay14View,
} from "../engine/mitraApi";
import { useScreenStore } from "../engine/useScreenBridge";
import { ingestDailyView, ingestDay14View } from "../engine/v3Ingest";
import { interpolate, readMomentSlot } from "../hooks/useContentSlots";
import store from "../store";
import { loadScreenWithData, screenActions } from "../store/screenSlice";
import { Fonts } from "../theme/fonts";

const DOTS = 14;

interface Props {
  block?: any;
}

const CheckpointDay14Block: React.FC<Props> = () => {
  const { screenData } = useScreenStore();
  const ss = screenData as Record<string, any>;

  // v3 journey: fetch day-14-view. M25 narrative resolved inline on BE —
  // no separate content-pack resolve required. Stores slots into
  // screenData.checkpoint_day_14 (same slot-key shape) so the existing
  // readMomentSlot/interpolate render path below is preserved.
  const fetchedRef = useRef(false);
  const etagRef = useRef<string | null>(null);
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    let cancelled = false;
    (async () => {
      const result = await mitraJourneyDay14View(etagRef.current);
      if (cancelled) return;
      if (result.etag) etagRef.current = result.etag;
      if (result.notModified || !result.envelope) return;
      const flat = ingestDay14View(result.envelope);
      // Merge M25 narrative slots under checkpoint_day_14 so the
      // existing slot() render continues to work.
      const m25 = result.envelope.m25_narrative || {};
      const merged = {
        ...flat,
        checkpoint_day_14: { ...flat.checkpoint_day_14, ...m25 },
      };
      for (const [k, v] of Object.entries(merged)) {
        if (v !== undefined) {
          store.dispatch(screenActions.setScreenValue({ key: k, value: v }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
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

  // MDR-S1-10 — spine-backed narrative. Priority chain:
  //   1. ss.journey_narrative — server-seeded per-cycle override (unchanged)
  //   2. slot("narrative_template") interpolated with {completed_count}/{total_days}
  //   3. empty string — sovereignty Rule 3 (no English fallback; empty renders
  //      as zero-height Text rather than leaking hardcoded copy)
  const narrativeTpl = slot("narrative_template");
  const narrative: string =
    ss.journey_narrative ||
    interpolate(narrativeTpl, {
      completed_count: completedCount,
      total_days: DOTS,
    });

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

    const idempotencyKey = String(uuidv4.v4());
    try {
      const env = await mitraJourneyDay14Decision(
        {
          decision,
          reflection,
          deepenItemType: ss.deepen_item_type || "",
          deepenItemId: ss.deepen_item_id || "",
          deepenAccepted: !!ss.deepen_accepted,
        },
        idempotencyKey,
      );
      if (!env) {
        console.warn("[CheckpointDay14Block] decision network error");
        return;
      }
      const nv = env.next_view ?? { view_key: "", payload: {} };
      if (nv.view_key === "daily_view") {
        for (const [k, v] of Object.entries(
          ingestDailyView(nv.payload as any),
        )) {
          if (v !== undefined) {
            store.dispatch(screenActions.setScreenValue({ key: k, value: v }));
          }
        }
        // Route to day-14 finale moment first (arc_complete transient),
        // FE then auto-transitions into cycle-2 dashboard.
        store.dispatch(
          loadScreenWithData({
            containerId: "cycle_transitions",
            stateId: "day_14_finale",
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
          "[CheckpointDay14Block] unexpected next_view.view_key",
          nv.view_key,
        );
      }
    } catch (err: any) {
      console.warn("[CheckpointDay14Block] decision threw:", err?.message);
    }
  };

  if (step === "intro") {
    return (
      <View style={styles.root}>
        <View style={styles.topRegion}>
          <Text style={styles.eyebrow} testID="checkpoint_day_14_eyebrow">
            {slot("eyebrow")}
          </Text>
          <Text style={styles.headline} testID="checkpoint_day_14_headline">
            {slot("intro_headline")}
          </Text>
          <Text style={styles.body} testID="checkpoint_day_14_narrative">
            {(typeof ss.checkpoint_framing === "string" &&
              ss.checkpoint_framing) ||
              slot("intro_body")}
          </Text>
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
              {statuses.slice(row * 7, row * 7 + 7).map((s, i) => (
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
          {interpolate(slot("summary_line_template"), {
            completed_count: completedCount,
            total_days: DOTS,
          })}
        </Text>

        {narrative ? (
          <Text style={styles.narrative} testID="checkpoint_day_14_summary">
            {narrative}
          </Text>
        ) : null}

        {growth ? (
          <View style={styles.growthBox}>
            <Text style={styles.microLabel}>
              {slot("summary_label") || "WHAT GREW"}
            </Text>
            <Text style={styles.narrative}>{growth}</Text>
          </View>
        ) : null}

        <View style={{ marginBottom: 16 }}>
          <Text style={styles.microLabel}>
            {slot("seal_cycle_label") || "SEAL THIS CYCLE"}
          </Text>
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
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.microLabel, { marginTop: 8 }]}>
            {slot("carry_label") || "CARRY FORWARD"}
          </Text>
          <TextInput
            value={reflection}
            onChangeText={(v) => setReflection(v.slice(0, 1500))}
            placeholder={slot("carry_input_placeholder")}
            placeholderTextColor="rgba(88, 58, 24, 0.4)"
            multiline
            style={styles.input}
            maxLength={1500}
          />
        </View>

        {/* REG-016: move buttons inside scroll for unified flow */}
        <View style={styles.contentFooter}>
          <TouchableOpacity
            onPress={() => submitDecision("continue_same")}
            style={styles.cta}
            activeOpacity={0.85}
            testID="checkpoint_cta_continue_same"
          >
            <Text style={styles.ctaText}>
              {slot("continue_path_cta") || "Continue"}
            </Text>
          </TouchableOpacity>
          <View style={styles.secondaryRow}>
            <TouchableOpacity
              onPress={() => submitDecision("deepen")}
              style={styles.secondaryBtn}
              activeOpacity={0.85}
              testID="checkpoint_cta_deepen"
            >
              <Text style={styles.secondaryText}>
                {slot("deepen_practice_cta") || "Deepen"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => submitDecision("change_focus")}
              style={styles.secondaryBtn}
              activeOpacity={0.85}
              testID="checkpoint_cta_change_focus"
            >
              <Text style={styles.secondaryText}>
                {slot("change_focus_cta") || "Change"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 16 },
  topRegion: { flex: 1, padding: 24, justifyContent: "center" },
  bottomRegion: {
    minHeight: "30%",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 12,
  },
  contentFooter: {
    marginTop: 40,
    paddingBottom: 40,
  },
  eyebrow: {
    fontFamily: Fonts.sans.medium,
    fontSize: 13,
    letterSpacing: 1.5,
    color: "#c9a84c",
    marginBottom: 10,
    textAlign: "center",
  },
  headline: {
    fontFamily: Fonts.serif.regular,
    fontSize: 28,
    color: "#432104",
    marginBottom: 12,
    textAlign: "center",
  },
  body: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#6b5a45",
    lineHeight: 26,
    textAlign: "center",
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
    textAlign: "center",
  },
  microLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: "#c9a84c",
    marginBottom: 8,
    textAlign: "center",
  },
  helper: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#6b5a45",
    marginBottom: 8,
    textAlign: "center",
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
    fontSize: 13,
    color: "#432104",
  },
});

export default CheckpointDay14Block;

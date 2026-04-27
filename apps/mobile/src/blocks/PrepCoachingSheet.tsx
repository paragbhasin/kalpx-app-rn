/**
 * PrepCoachingSheet — Moment 27 (Strategic Prep).
 *
 * Bottom-sheet overlay rendered on the `prep_coaching_sheet` overlay state.
 * Pulls content from screenData.prep_context (populated by
 * fetch_companion_intelligence action). If missing, renders nothing — the
 * overlay should not be reachable without context, but we guard defensively.
 *
 * Web parity:
 *   - Spec: kalpx-frontend/docs/specs/mitra-v3-experience/screens/overlay_prep_coaching.md §1, §10
 *   - Web: no direct web component yet (Phase 3a in RN)
 *
 * Actions:
 *   "Prepare now" → start_runner with source="additional_recommended"
 *                   and intent=prep (REG-015: never core)
 *   "Got it"     → dismiss overlay (goBack) + track_event prep_acknowledged
 *   "Anything else?" → local expand reveal of do/don't frames
 */

import React, { useState } from "react";
import {
  StyleSheet,
  Text,
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

const PrepCoachingSheet: React.FC<{ block?: any }> = () => {
  const { screenData, loadScreen, goBack } = useScreenStore();
  const ss = screenData as Record<string, any>;
  const ctx = ss.prep_context;
  const [expanded, setExpanded] = useState(false);

  useContentSlots({
    momentId: "M27_prep_coaching_sheet",
    screenDataKey: "prep_coaching_sheet",
    buildCtx: (s) => ({
      path: s.journey_path === "growth" ? "growth" : "support",
      guidance_mode: s.guidance_mode || "hybrid",
      locale: s.locale || "en",
      user_attention_state: "reflective_exposed",
      emotional_weight: "moderate",
      cycle_day: Number(s.day_number) || 0,
      entered_via: "upcoming_event_signal",
      stage_signals: {},
      today_layer: {},
      life_layer: {
        cycle_id: s.journey_id || s.cycle_id || "",
        life_kosha: s.life_kosha || s.scan_focus || "",
        scan_focus: s.scan_focus || "",
      },
    }),
  });
  const slot = (name: string) => readMomentSlot(ss, "prep_coaching_sheet", name);

  if (!ctx) {
    // No data — render graceful empty state from slots.
    return (
      <View style={styles.sheet}>
        <Text style={styles.empty}>{slot("empty_state")}</Text>
        <TouchableOpacity style={styles.primaryPill} onPress={() => goBack()}>
          <Text style={styles.primaryPillText}>{slot("empty_close")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const dispatch = (action: any) =>
    executeAction(action, {
      loadScreen,
      goBack,
      setScreenValue: (value: any, key: string) =>
        store.dispatch(screenActions.setScreenValue({ key, value })),
      screenState: store.getState().screen.screenData,
    });

  const onPrepareNow = () => {
    // REG-015 assertion: prep-driven runner MUST NOT count as core. The
    // start_runner payload explicitly sets source="additional_recommended"
    // and intent="prep" so track_completion logs the correct source.
    dispatch({
      type: "start_recommended_additional",
      payload: {
        variant: ctx.variant || "practice",
        item: ctx.gentle_practice || {
          item_type: ctx.variant || "practice",
          item_id: ctx.item_id || "practice.prep",
          title: ctx.surface || "Prepare",
        },
        intent: "prep",
        duration_sec: (ctx.duration_min || 3) * 60,
      },
    });
  };

  const onGotIt = () => {
    dispatch({ type: "ack_prep" });
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.sheet}>
      <Text style={styles.microLabel}>
        {(ctx.surface || "STEADY BEFORE").toUpperCase()}
      </Text>
      <Text style={styles.strategy}>{ctx.strategy_line}</Text>
      {ctx.grounding_action ? (
        <Text style={styles.grounding}>{ctx.grounding_action}</Text>
      ) : null}
      <Text style={styles.closing}>{slot("closing_affirmation")}</Text>

      <TouchableOpacity
        onPress={() => setExpanded((v) => !v)}
        style={styles.expandRow}
      >
        <Text style={styles.expandText}>
          {expanded ? slot("expand_toggle_open") : slot("expand_toggle_closed")}
        </Text>
      </TouchableOpacity>

      {expanded ? (
        <View style={styles.doDont}>
          {ctx.do_frame ? (
            <Text style={styles.doText}>● DO  {ctx.do_frame}</Text>
          ) : null}
          {ctx.dont_frame ? (
            <Text style={styles.dontText}>○ DON&apos;T  {ctx.dont_frame}</Text>
          ) : null}
          {ctx.principle_hint ? (
            <Text style={styles.principleHint}>
              This follows {ctx.principle_hint} ›
            </Text>
          ) : null}
        </View>
      ) : null}

      {/* REG-016: CTAs in bottom 30% of sheet. */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryPill} onPress={onPrepareNow}>
          <Text style={styles.primaryPillText}>{slot("prepare_now_cta")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={onGotIt}>
          <Text style={styles.secondaryText}>{slot("got_it_cta")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#fffdf9" },
  sheet: { padding: 20, paddingBottom: 48 },
  microLabel: {
    fontFamily: Fonts.sans.regular,
    fontSize: 11,
    letterSpacing: 1.4,
    color: "#c9a84c",
    marginBottom: 14,
  },
  strategy: {
    fontFamily: Fonts.serif.regular,
    fontSize: 19,
    lineHeight: 28,
    color: "#432104",
    marginBottom: 12,
  },
  grounding: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    lineHeight: 22,
    color: "#432104",
    marginBottom: 14,
  },
  closing: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    fontStyle: "italic",
    color: "#8a6a2a",
    marginBottom: 18,
  },
  expandRow: { paddingVertical: 10 },
  expandText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#c9a84c",
  },
  doDont: {
    borderTopWidth: 1,
    borderTopColor: "rgba(201,168,76,0.2)",
    paddingTop: 12,
    marginTop: 4,
    gap: 8,
  },
  doText: { fontFamily: Fonts.sans.regular, fontSize: 14, color: "#5d7a3a" },
  dontText: { fontFamily: Fonts.sans.regular, fontSize: 14, color: "#8a5a2a" },
  principleHint: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#c9a84c",
    marginTop: 6,
  },
  footer: { marginTop: 28, gap: 10 },
  primaryPill: {
    backgroundColor: "#c9a84c",
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
  },
  primaryPillText: {
    fontFamily: Fonts.sans.bold,
    fontSize: 15,
    color: "#fffdf9",
  },
  secondary: { alignItems: "center", paddingVertical: 10 },
  secondaryText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#432104",
  },
  empty: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    color: "#432104",
    textAlign: "center",
    padding: 24,
  },
});

export default PrepCoachingSheet;

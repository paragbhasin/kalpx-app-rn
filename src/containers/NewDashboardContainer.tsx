/**
 * NewDashboardContainer — Phase 3 shell for the Mitra v3 new dashboard.
 *
 * Spec: docs/NEW_DASHBOARD_V1_SPEC.md §1 (composition) + §3 (shell).
 *
 * This file replaces the isolated scaffold at
 * src/extensions/moments/new_dashboard/index.tsx. The scaffold stays in the
 * tree for reference but is no longer the source of truth — the flag is
 * flipped in Phase 5 and Home.tsx will route `companion_dashboard_v3` →
 * NewDashboardContainer via ScreenRenderer's containerMap.
 *
 * Ownership of user-facing strings lives fully in the backend ContentPack
 * registry. Every block below renders null when its data slot is missing,
 * so the dashboard degrades gracefully rather than showing English
 * placeholders (sovereignty rule — CONTENT_CONTRACT_V1 §2).
 *
 * Mount lifecycle:
 *   1. Dispatch `generate_companion` to hydrate the triad (one-shot, guarded
 *      by a ref so remount doesn't refetch).
 *   2. Fetch `/journey/companion/` to populate `cycle_metrics` on
 *      screenData.
 *   3. Triad ✓ hydration from `sd.completed_today` is handled by
 *      TriadCardsRow's own effect.
 *
 * Gating: wiring into containerMap is done in Phase 5 under the
 * EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD=1 flag (see Home.tsx:270).
 */

import React, { useEffect, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { executeAction } from "../engine/actionExecutor";
import { useScreenStore } from "../engine/useScreenBridge";
import { mitraJourneyCompanion } from "../engine/mitraApi";
import store from "../store";
import { screenActions } from "../store/screenSlice";
import { Colors } from "../theme/colors";
import { Fonts } from "../theme/fonts";

// ── Dashboard blocks (Phase 3) ────────────────────────────────────────────
import GreetingCard from "../blocks/dashboard/GreetingCard";
import PathChip from "../blocks/dashboard/PathChip";
import TriadCardsRow from "../blocks/dashboard/TriadCardsRow";
import WhyThisL1Strip from "../blocks/dashboard/WhyThisL1Strip";
import CycleProgressBlock from "../blocks/dashboard/CycleProgressBlock";
import SankalpCarryBlock from "../blocks/dashboard/SankalpCarryBlock";
import QuickSupportBlock from "../blocks/dashboard/QuickSupportBlock";

// ── Registered moment blocks (Phase 3 re-uses existing scaffolds) ─────────
import DayTypeChip from "../extensions/moments/day_type_chip";
import FocusPhraseLine from "../extensions/moments/focus_phrase_line";

// ── Conditional intelligence cards (Phase 5 — show when signal exists) ───
import PredictiveAlertCard from "../extensions/moments/predictive_alert_card";
import ClearWindowBanner from "../blocks/ClearWindowBanner";
import PostConflictMorningCard from "../extensions/moments/post_conflict_morning_card";
import GratitudeSignalCard from "../extensions/moments/gratitude_signal_card";
import SeasonSignalCard from "../extensions/moments/season_signal_card";

// ── Voice input ─────────────────────────────────────────────────────────
import { VoiceTextInput } from "../components/VoiceTextInput";

type Schema = {
  blocks?: any[];
  dashboard_config?: Record<string, any>;
};

type Props = {
  schema?: Schema;
};

// DashboardHeader + SafetyQuietLink removed 2026-04-18:
//   - App shell already renders KalpX brand + English dropdown at top;
//     a second in-container header row was redundant.
//   - Bell moved into GreetingCard (top-right corner) for a tighter
//     visual hierarchy.
//   - "I'm not safe right now" quiet link pulled from the dashboard
//     per founder call. Crisis surface still reachable via other paths.

// ── Main container ─────────────────────────────────────────────────────
const NewDashboardContainer: React.FC<Props> = () => {
  const { screenData, loadScreen, goBack, updateScreenData } =
    useScreenStore();
  const sd = (screenData ?? {}) as Record<string, any>;

  // Fire-once guard for generate_companion + /journey/companion fetch.
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    // 1) generate_companion → hydrate triad.
    //
    // skipReveal=true is load-bearing: by default the generate_companion
    // action handler auto-navigates to insight_summary/path_reveal at
    // the end of its chain (actionExecutor.ts:1834). That was designed
    // for the post-lock onboarding flow, but we're using it here purely
    // to hydrate screenData. Without skipReveal the user would see:
    //   new dashboard → "Understanding your path" bounce → dashboard
    executeAction(
      { type: "generate_companion", payload: { skipReveal: true } },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          store.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: store.getState().screen.screenData,
      },
    ).catch((err: any) => {
      console.warn(
        "[NewDashboard] generate_companion failed:",
        err?.message,
      );
    });

    // 2) /journey/companion/ → populate cycle_metrics + new dashboard
    //    screenData slots (greeting_context, journey_path, support labels,
    //    etc.) that each block reads and self-hides on when missing.
    (async () => {
      try {
        const res = await mitraJourneyCompanion();
        if (!res || typeof res !== "object") return;
        const keys = [
          "cycle_metrics",
          "completed_today",
          "greeting_context",
          "user_name",
          "journey_path",
          "journey_path_label",
          "quick_support_labels",
          "support_rooms_labels",
          "brand_label",
          "language_label",
          "safety_quiet_label",
          "voice_placeholder",
          "dayType",
          "dayTypeCopy",
          "focusName",
          "pathMilestone",
          "continuity",
          "why_this",
          "why_this_l1_items",
          "sankalp_how_to_live",
          "focus_phrase",
          "day_type",
        ];
        for (const k of keys) {
          const v = (res as any)[k];
          if (v !== undefined && v !== null) {
            updateScreenData(k, v);
          }
        }
      } catch (err: any) {
        console.warn(
          "[NewDashboard] journey/companion fetch failed:",
          err?.message,
        );
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVoiceSend = (text: string, type: "text" | "voice") => {
    executeAction(
      { type: "voice_input_send", payload: { text, input_type: type } },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          store.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: store.getState().screen.screenData,
      },
    ).catch(() => {});
  };

  // Bell tap — routes to the Notifications tab (handled at bottom-nav
  // level already; here we just toast-style pass-through via navigate).
  const handleBellPress = () => {
    executeAction(
      { type: "navigate", target: { container_id: "notifications", state_id: "default" } },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          store.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: store.getState().screen.screenData,
      },
    ).catch(() => {});
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Greeting card with bell in top-right corner */}
        <GreetingCard screenData={sd} onBellPress={handleBellPress} />

        {/* 2. Chip row — DayType + Path */}
        <View style={styles.chipRow}>
          <View style={styles.chipWrap}>
            <DayTypeChip screenData={sd} />
          </View>
          <View style={styles.chipWrap}>
            <PathChip screenData={sd} />
          </View>
        </View>

        {/* 3. Focus phrase line */}
        <FocusPhraseLine screenData={sd} />

        {/* 4. Triad + why_this_l1 strip */}
        <TriadCardsRow />
        <WhyThisL1Strip screenData={sd} />

        {/* 5. Cycle progress (collapsible, default closed) */}
        <CycleProgressBlock screenData={sd} />

        {/* 6. Sankalp carry (conditional on practice_embody) */}
        <SankalpCarryBlock screenData={sd} />

        {/* 7. Intelligence cards — each self-hides when its backend
             signal is missing (sovereignty respected at the block).
             Display priority: banners first (PostConflict / ClearWindow),
             then cards (Predictive / Gratitude / Season). */}
        {!!sd.post_conflict && <PostConflictMorningCard screenData={sd} />}
        {!!sd.clear_window_active && <ClearWindowBanner />}
        {!!sd.predictive_alert && <PredictiveAlertCard screenData={sd} />}
        {!!sd.gratitude_card && <GratitudeSignalCard screenData={sd} />}
        {!!sd.season_card && <SeasonSignalCard screenData={sd} />}

        {/* 8. Quick support block (+ More support sheet) */}
        <QuickSupportBlock screenData={sd} />
      </ScrollView>

      {/* 9. Floating voice input bar */}
      <View style={styles.voiceBar}>
        <VoiceTextInput
          placeholder={sd.voice_placeholder ?? ""}
          onSend={handleVoiceSend}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.parchment,
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.parchment,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    // Leave room for the floating voice bar so content isn't hidden.
    paddingBottom: 120,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: Colors.goldBright,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  brand: {
    fontFamily: Fonts.serif.bold,
    fontSize: 20,
    color: Colors.brownDeep,
    letterSpacing: 0.3,
  },
  langPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderCream,
    backgroundColor: Colors.cream,
  },
  langText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 12,
    color: Colors.brownMuted,
    marginLeft: 4,
  },
  bellBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: Colors.borderCream,
    backgroundColor: Colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },

  // Chip row
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 6,
  },
  chipWrap: {
    marginRight: 8,
  },

  // Insights slot placeholder (empty in Phase 3)
  insightsSlot: {
    // no rendered children until Phase 4 conditional cards land
  },

  // Safety quiet link
  safetyBtn: {
    marginTop: 18,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.ringTan,
    backgroundColor: "transparent",
  },
  safetyText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 13,
    color: Colors.textSoft,
    letterSpacing: 0.3,
  },

  // Voice bar
  voiceBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingBottom: 18,
    paddingTop: 10,
    backgroundColor: Colors.parchment,
  },
});

export default NewDashboardContainer;

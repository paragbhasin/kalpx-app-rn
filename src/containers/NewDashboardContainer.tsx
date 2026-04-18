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

import React, { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
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
// DayTypeChip removed 2026-04-18 per founder call — kept scaffold in
// src/extensions/moments/day_type_chip/ for future re-mount if day-
// characterization surface returns.
import FocusPhraseLine from "../extensions/moments/focus_phrase_line";

// ── Conditional intelligence cards (Phase 5 — show when signal exists) ───
import PredictiveAlertCard from "../extensions/moments/predictive_alert_card";
import ClearWindowBanner from "../blocks/ClearWindowBanner";
import PostConflictMorningCard from "../extensions/moments/post_conflict_morning_card";
import GratitudeSignalCard from "../extensions/moments/gratitude_signal_card";
import SeasonSignalCard from "../extensions/moments/season_signal_card";
import ResilienceNarrativeCard from "../blocks/dashboard/insights/ResilienceNarrativeCard";
import EntityRecognitionCard from "../blocks/dashboard/insights/EntityRecognitionCard";

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

  // Re-fetch on every focus (not just first mount). Returning from the
  // runner should refresh the triad ✓ + cycle_metrics from the DB,
  // which is the authoritative source of "is this item done today".
  // Redux flags (practice_chant/embody/act) are only the session cache.
  useFocusEffect(
    useCallback(() => {
      // 1) generate_companion with use_journey_companion=true →
      //    action handler calls /journey/companion/ (read-only), not
      //    /generate-companion/ (which can create journeys as a side
      //    effect). Populates card_mantra_title, card_sankalpa_title,
      //    card_ritual_title + descriptions + per-item wisdom via the
      //    same 50-line setScreenValue cascade that the legacy path
      //    used — we just feed it the read-only payload.
      //
      //    skipReveal=true prevents the action from auto-navigating to
      //    insight_summary/path_reveal at the end of its chain
      //    (actionExecutor.ts:1834).
      executeAction(
        {
          type: "generate_companion",
          payload: { skipReveal: true, use_journey_companion: true },
        },
        {
          loadScreen,
          goBack,
          setScreenValue: (value: any, key: string) =>
            store.dispatch(screenActions.setScreenValue({ key, value })),
          screenState: store.getState().screen.screenData,
        },
      ).catch((err: any) => {
        console.warn(
          "[NewDashboard] journey/companion hydrate failed:",
          err?.message,
        );
      });

      // 2) /journey/companion/ → populate cycle_metrics + new dashboard
      //    screenData slots (greeting_context, journey_path, support
      //    labels, etc.) that each block reads and self-hides on when
      //    missing.
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
    }, []),
  );

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

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Greeting card */}
        <GreetingCard screenData={sd} />

        {/* 2. Focus phrase + Path on one row (user request — save vertical
             space; PathChip carries "Support Path" label, focus phrase
             carries today's one-liner). DayTypeChip removed per prior
             founder call. */}
        <View style={styles.phraseRow}>
          <View style={styles.phraseWrap}>
            <FocusPhraseLine screenData={sd} />
          </View>
          <View style={styles.phraseRightWrap}>
            <PathChip screenData={sd} />
          </View>
        </View>

        {/* 3. Triad + why_this_l1 strip */}
        <TriadCardsRow />
        <WhyThisL1Strip screenData={sd} />

        {/* 5. Cycle progress (collapsible, default closed) */}
        <CycleProgressBlock screenData={sd} />

        {/* 6. Sankalp carry (conditional on practice_embody) */}
        <SankalpCarryBlock screenData={sd} />

        {/* 7. Intelligence cards — each self-hides when its backend
             signal is missing. Founder priority ranking (2026-04-18):
               1. checkpoint / re-entry / critical banner
               2. resilience narrative (M26)
               3. predictive alert (M28)
               4. entity recognition (M29)
               5. gratitude / joy (M44)
               6. season signal (M45)
               7. recommended additional (M30 — not yet shipped)
             Dashboard rendering rule: max 1 banner + max 2 insight
             cards above fold. We render banners unconditionally (they
             self-hide on no signal) and cap the stacked insight cards
             at 2 via renderInsightCards() below. */}
        {(() => {
          // Banners (max 1 — PostConflict wins if both signal).
          const banner = sd.post_conflict ? (
            <PostConflictMorningCard screenData={sd} />
          ) : sd.clear_window_active ? (
            <ClearWindowBanner />
          ) : null;

          // Insight cards in priority order (max 2 shown).
          const candidates: React.ReactNode[] = [];
          if (sd.resilience_narrative) {
            candidates.push(
              <ResilienceNarrativeCard key="rn" screenData={sd} />,
            );
          }
          if (sd.predictive_alert) {
            candidates.push(<PredictiveAlertCard key="pa" screenData={sd} />);
          }
          if (sd.entity_card) {
            candidates.push(
              <EntityRecognitionCard key="er" screenData={sd} />,
            );
          }
          if (sd.gratitude_card) {
            candidates.push(<GratitudeSignalCard key="gj" screenData={sd} />);
          }
          if (sd.season_card) {
            candidates.push(<SeasonSignalCard key="ss" screenData={sd} />);
          }
          const insights = candidates.slice(0, 2);

          return (
            <>
              {banner}
              {insights}
            </>
          );
        })()}

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

  // Focus phrase + Path chip — single row to save vertical space
  // (user feedback 2026-04-18).
  phraseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginVertical: 6,
  },
  phraseWrap: {
    flex: 1,
    flexShrink: 1,
  },
  phraseRightWrap: {
    marginLeft: 8,
  },

  // Voice bar — positioned just above the bottom tab nav (~52px) with
  // a small breathing gap. Was previously pinned to bottom: 0 which
  // overlapped the tabs.
  voiceBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 56, // sits above the bottom-nav tab bar height
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: Colors.parchment,
    borderTopWidth: 1,
    borderTopColor: Colors.borderCream,
  },
});

export default NewDashboardContainer;

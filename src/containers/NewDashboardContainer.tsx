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

import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { executeAction } from "../engine/actionExecutor";
import { mitraJourneyDailyView } from "../engine/mitraApi";
import { ingestDailyView } from "../engine/v3Ingest";
import { useScreenStore } from "../engine/useScreenBridge";
import store from "../store";
import { screenActions } from "../store/screenSlice";
import { Colors } from "../theme/colors";
import { Fonts } from "../theme/fonts";

// ── Dashboard blocks (Phase 3) ────────────────────────────────────────────
import AdditionalItemsSectionBlock from "../blocks/AdditionalItemsSectionBlock";
import CycleProgressBlock from "../blocks/dashboard/CycleProgressBlock";
import GreetingCard from "../blocks/dashboard/GreetingCard";
import PathChip from "../blocks/dashboard/PathChip";
import QuickSupportBlock from "../blocks/dashboard/QuickSupportBlock";
import SankalpCarryBlock from "../blocks/dashboard/SankalpCarryBlock";
import TriadCardsRow from "../blocks/dashboard/TriadCardsRow";
import WhyThisModal from "../blocks/dashboard/WhyThisModal";
import { extractWhyThis } from "../blocks/dashboard/whyThisUtils";

// ── Registered moment blocks (Phase 3 re-uses existing scaffolds) ─────────
// DayTypeChip removed 2026-04-18 per founder call — kept scaffold in
// src/extensions/moments/day_type_chip/ for future re-mount if day-
// characterization surface returns.
import FocusPhraseLine from "../extensions/moments/focus_phrase_line";

// ── Conditional intelligence cards (Phase 5 — show when signal exists) ───
import ClearWindowBanner from "../blocks/ClearWindowBanner";
import EntityRecognitionCard from "../blocks/dashboard/insights/EntityRecognitionCard";
import ResilienceNarrativeCard from "../blocks/dashboard/insights/ResilienceNarrativeCard";
import ContinuityMirrorCard from "../extensions/moments/continuity_mirror_card";
import PathMilestoneBanner from "../extensions/moments/path_milestone_banner";


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
  const {
    screenData,
    loadScreen,
    goBack,
    updateBackground,
    updateHeaderHidden,
  } = useScreenStore();
  const sd = (screenData ?? {}) as Record<string, any>;
  const [whyOpen, setWhyOpen] = useState(false);

  useEffect(() => {
    updateBackground(require("../../assets/beige_bg.png"));
    updateHeaderHidden(false);
    return () => updateHeaderHidden(false);
  }, [updateBackground, updateHeaderHidden]);

  // Re-fetch on every focus (not just first mount). Returning from the
  // runner should refresh the triad ✓ + cycle_metrics from the DB,
  // which is the authoritative source of "is this item done today".
  // Redux flags (practice_chant/embody/act) are only the session cache.
  // v3 journey daily-view fetch — ETag-aware single-call hydrate.
  // Replaces the legacy double-fetch (generate_companion +
  // mitraJourneyCompanion) that ran on every focus event.
  //
  // Flow:
  //   1. Call mitraJourneyDailyView(lastEtag) → 200 + envelope OR 304
  //   2. On 200: ingestDailyView(env) → flat screenData keys (bridge
  //      until block-level namespace migration lands in Step 3)
  //   3. On 304: keep existing screenData; no-op
  //
  // v3Ingest.ts is a temporary adapter; individual blocks migrate to
  // direct namespaced reads (data.identity.day_number etc.) per the
  // journey-v3-fe migration plan. This hydrate call itself stays put.
  const dailyViewEtagRef = React.useRef<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const result = await mitraJourneyDailyView(dailyViewEtagRef.current);
          if (result.etag) dailyViewEtagRef.current = result.etag;
          if (result.notModified || !result.envelope) return;
          const flat = ingestDailyView(result.envelope);
          for (const [k, v] of Object.entries(flat)) {
            if (v !== undefined) {
              store.dispatch(screenActions.setScreenValue({ key: k, value: v }));
            }
          }
        } catch (err: any) {
          console.warn(
            "[NewDashboard] v3 daily-view hydrate failed:",
            err?.message,
          );
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );


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

        {/* 3. Triad + why this was chosen link */}
        <TriadCardsRow />
        {extractWhyThis(sd).hasContent && (
          <>
            <TouchableOpacity
              onPress={() => setWhyOpen(true)}
              style={styles.whyLink}
              accessibilityLabel="why_this_link"
            >
              <Text style={styles.whyLinkText}>Why this was chosen</Text>
              <Ionicons name="arrow-forward" size={13} color={Colors.gold} />
            </TouchableOpacity>
            <WhyThisModal
              visible={whyOpen}
              onClose={() => setWhyOpen(false)}
              screenData={sd}
            />
          </>
        )}

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
          // v3 journey: ContinuityMirrorCard + PathMilestoneBanner finally
          // mounted (scaffolds existed but were orphaned until v3 envelope
          // populated continuity.* and insights.path_milestone coherently).
          // ClearWindowBanner remains as the generic banner.
          // Retired: PostConflictMorningCard (v3 journey migration).
          const contTierActive =
            sd.continuity?.tier && sd.continuity.tier !== "none";
          const banner = contTierActive ? (
            <ContinuityMirrorCard screenData={sd} />
          ) : sd.clear_window_active ? (
            <ClearWindowBanner />
          ) : null;

          // Insight cards in priority order (max 2 shown).
          // Retired: PredictiveAlertCard, GratitudeSignalCard, SeasonSignalCard.
          const candidates: React.ReactNode[] = [];
          const ins = sd.insights ?? {};
          if (ins.path_milestone ?? sd.path_milestone) {
            candidates.push(
              <PathMilestoneBanner key="pm" screenData={sd} />,
            );
          }
          if (ins.resilience_narrative ?? sd.resilience_narrative) {
            candidates.push(
              <ResilienceNarrativeCard key="rn" screenData={sd} />,
            );
          }
          if (ins.entity_card ?? sd.entity_card) {
            candidates.push(<EntityRecognitionCard key="er" screenData={sd} />);
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

        {/* 9. Additional items — PARITY RESTORATION (2026-04-18).
             Legacy CompanionDashboardContainer rendered AdditionalItemsSectionBlock;
             the new dashboard dropped it pending M30 ContentPack (not yet shipped).
             Metro smoke surfaced the gap as a real parity regression; we restore
             the block now (it self-hides when the backend hasn't seeded items)
             while M30 authoring continues. See docs/ADDITIONAL_ITEMS_DISPOSITION.md. */}
        <AdditionalItemsSectionBlock screenData={sd} />
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // backgroundColor: Colors.parchment,
  },
  scroll: {
    flex: 1,
    // backgroundColor: Colors.parchment,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 32,
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

  whyLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  whyLinkText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 13,
    color: Colors.gold,
  },

  // Voice bar — the NewDashboardContainer is rendered INSIDE the tab
  // navigator, so this container's bottom edge already sits just above
  // the tab bar. Pinning to bottom: 0 places the input bar directly
  // above the footer with no overlap. A hairline top border separates
  // it visually from the scrolling content above.
  voiceBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -25,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: Colors.parchment,
    borderTopWidth: 1,
    borderTopColor: Colors.borderCream,
  },
});

export default NewDashboardContainer;

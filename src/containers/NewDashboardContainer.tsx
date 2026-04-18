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

// ── Voice input ─────────────────────────────────────────────────────────
import { VoiceTextInput } from "../components/VoiceTextInput";

type Schema = {
  blocks?: any[];
  dashboard_config?: Record<string, any>;
};

type Props = {
  schema?: Schema;
};

// ── Header ──────────────────────────────────────────────────────────────
const DashboardHeader: React.FC<{ screenData: Record<string, any> }> = ({
  screenData,
}) => {
  const brandLabel: string = screenData.brand_label ?? "KalpX";
  const langLabel: string = screenData.language_label ?? "";
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.logoDot}>
          <Ionicons name="flower-outline" size={16} color={Colors.goldBright} />
        </View>
        <Text style={styles.brand}>{brandLabel}</Text>
      </View>
      <View style={styles.headerRight}>
        {!!langLabel && (
          <TouchableOpacity style={styles.langPill} activeOpacity={0.75}>
            <Ionicons
              name="globe-outline"
              size={13}
              color={Colors.brownMuted}
            />
            <Text style={styles.langText}>{langLabel}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.bellBtn}
          activeOpacity={0.75}
          accessibilityLabel="notifications"
        >
          <Ionicons
            name="notifications-outline"
            size={18}
            color={Colors.brownDeep}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ── SafetyQuietLink ─────────────────────────────────────────────────────
const SafetyQuietLink: React.FC<{ screenData: Record<string, any> }> = ({
  screenData,
}) => {
  const label: string = screenData.safety_quiet_label ?? "";
  const { loadScreen, goBack } = useScreenStore();
  if (!label) return null;
  return (
    <TouchableOpacity
      style={styles.safetyBtn}
      activeOpacity={0.85}
      accessibilityRole="button"
      onPress={() =>
        executeAction(
          { type: "open_crisis" },
          {
            loadScreen,
            goBack,
            setScreenValue: (value: any, key: string) =>
              store.dispatch(screenActions.setScreenValue({ key, value })),
            screenState: store.getState().screen.screenData,
          },
        ).catch(() => {})
      }
    >
      <Text style={styles.safetyText}>{label}</Text>
    </TouchableOpacity>
  );
};

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

    // 2) /journey/companion/ → populate cycle_metrics on screenData.
    (async () => {
      try {
        const res = await mitraJourneyCompanion();
        if (res && typeof res === "object") {
          if (res.cycle_metrics) {
            updateScreenData("cycle_metrics", res.cycle_metrics);
          }
          if (Array.isArray(res.completed_today)) {
            updateScreenData("completed_today", res.completed_today);
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

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header */}
        <DashboardHeader screenData={sd} />

        {/* 2. Greeting card */}
        <GreetingCard screenData={sd} />

        {/* 3. Chip row — DayType + Path */}
        <View style={styles.chipRow}>
          <View style={styles.chipWrap}>
            <DayTypeChip screenData={sd} />
          </View>
          <View style={styles.chipWrap}>
            <PathChip screenData={sd} />
          </View>
        </View>

        {/* 4. Focus phrase line */}
        <FocusPhraseLine screenData={sd} />

        {/* 5. Triad + why_this_l1 strip */}
        <TriadCardsRow />
        <WhyThisL1Strip screenData={sd} />

        {/* 6. Cycle progress (collapsible, default closed) */}
        <CycleProgressBlock screenData={sd} />

        {/* 7. Sankalp carry (conditional on practice_embody) */}
        <SankalpCarryBlock screenData={sd} />

        {/* 8. Insights slot — reserved for Phase 4 conditional cards. */}
        <View style={styles.insightsSlot} />

        {/* 9. Quick support block (+ More support sheet) */}
        <QuickSupportBlock screenData={sd} />

        {/* 10. Safety quiet link */}
        <SafetyQuietLink screenData={sd} />
      </ScrollView>

      {/* 11. Floating voice input bar */}
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

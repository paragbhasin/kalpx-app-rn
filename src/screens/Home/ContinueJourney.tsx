/**
 * ContinueJourney — contextual home surface for authed users.
 * v3 (2026-04-21) — backend-driven per v3 Journey Contract.
 *
 * Data source: GET /api/mitra/v3/journey/entry-view/
 * The entry-view envelope carries a `target.view_key` + `target.payload`:
 *   - target.view_key === "daily_view"            → route to new-dashboard,
 *                                                     hydrate screenData from inline payload
 *   - target.view_key === "day_7_view"            → route to checkpoint-day-7, inline payload
 *   - target.view_key === "day_14_view"           → route to checkpoint-day-14, inline payload
 *   - target.view_key === "crisis_view"           → route to crisis surface
 *   - target.view_key === "onboarding_start"      → route to onboarding turn 1
 *   - target.view_key === "welcome_back_surface"  → render the chip home with
 *                                                   reentry-decision chips (continue | fresh)
 *
 * ETag discipline: client stores last-seen etag; subsequent focus passes
 * If-None-Match; on 304 we keep the previously-rendered view.
 */

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import uuidv4 from "react-native-uuid";
import { useDispatch } from "react-redux";
import {
  mitraJourneyEntryView,
  mitraJourneyReentryDecision,
  V3EntryViewEnvelope,
} from "../../engine/mitraApi";
import { ingestDailyView } from "../../engine/v3Ingest";
import {
  loadScreenWithData,
  screenActions,
} from "../../store/screenSlice";
import { Fonts } from "../../theme/fonts";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Local render shape — derived from v3 entry-view envelope. Intentionally
// small: we either route (target != welcome_back_surface) or render a
// minimal chip home for reentry.
type ChipKey = "reentry_continue" | "reentry_fresh";
interface ReentryHome {
  headline: string;
  body_lines: string[];
  chips: { id: ChipKey; label: string }[];
  user_name: string;
}

interface ContinueJourneyProps {
  userName?: string;
}

// Icon-name → Ionicon glyph.
function ioniconFor(name: string | null | undefined): React.ReactNode {
  if (!name) {
    return <View style={styles.iconPlaceholder} />;
  }
  const glyphMap: Record<string, any> = {
    chat: "chatbubble-outline",
    heart: "heart-outline",
    hands_heart: "heart-outline",
    diamond: "diamond-outline",
  };
  const glyph = glyphMap[name] || "ellipse-outline";
  return (
    <Ionicons name={glyph} size={24} color="#432104" style={styles.btnIcon} />
  );
}

// Module-level ETag cache for entry-view. Cleared only on explicit
// refresh or unmount; matches the room-system ETag pattern.
let _entryViewEtag: string | null = null;

export default function ContinueJourney({
  userName = "friend",
}: ContinueJourneyProps) {
  const dispatch = useDispatch();
  const [reentry, setReentry] = useState<ReentryHome | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingReentry, setSubmittingReentry] = useState(false);
  const routedRef = useRef(false);

  // ActionContext matches the signature expected by actionExecutor:
  //   loadScreen(target), goBack(), setScreenValue(value, key) — note
  //   the reversed arg order — and screenState as the current snapshot.
  // useScreenStore does not expose setScreenValue directly (only
  // updateScreenData with reversed args), so we build it here via
  // dispatch(screenActions.setScreenValue({key, value})) to match the
  // canonical Home.tsx pattern.
  const navigation = useNavigation<any>();

  // routeToView — given a v3 entry-view envelope, either hydrate
  // screenData from the inline target.payload and navigate, or set
  // local reentry state for in-place chip render. No legacy
  // generate_companion prehydration.
  const routeToView = useCallback(
    (env: V3EntryViewEnvelope): ReentryHome | null => {
      const target = env.target;
      const viewKey = target?.view_key;
      const payload = target?.payload ?? {};

      // Inline-hydrate screenData for container targets.
      const writeAll = (flat: Record<string, any>) => {
        for (const [k, v] of Object.entries(flat)) {
          if (v !== undefined) {
            dispatch(screenActions.setScreenValue({ key: k, value: v }));
          }
        }
      };

      if (viewKey === "daily_view") {
        // Inline payload IS the daily-view envelope body.
        writeAll(ingestDailyView(payload as any));
        routedRef.current = true;
        dispatch(
          loadScreenWithData({
            containerId: "companion_dashboard_v3",
            stateId: "day_active",
          }) as any,
        );
        navigation.navigate("DynamicEngine");
        return null;
      }
      if (viewKey === "day_7_view") {
        routedRef.current = true;
        dispatch(
          loadScreenWithData({
            containerId: "cycle_transitions",
            stateId: "checkpoint_day_7",
          }) as any,
        );
        navigation.navigate("DynamicEngine");
        return null;
      }
      if (viewKey === "day_14_view") {
        routedRef.current = true;
        dispatch(
          loadScreenWithData({
            containerId: "cycle_transitions",
            stateId: "checkpoint_day_14",
          }) as any,
        );
        navigation.navigate("DynamicEngine");
        return null;
      }
      if (viewKey === "crisis_view") {
        routedRef.current = true;
        dispatch(
          loadScreenWithData({
            containerId: "safety",
            stateId: "crisis",
          }) as any,
        );
        navigation.navigate("DynamicEngine");
        return null;
      }
      if (viewKey === "onboarding_start") {
        routedRef.current = true;
        dispatch(
          loadScreenWithData({
            containerId: "welcome_onboarding",
            stateId: "turn_1",
          }) as any,
        );
        navigation.navigate("DynamicEngine");
        return null;
      }

      // welcome_back_surface — render chip home inline.
      const cont: any = env.continuity ?? {};
      const greet: any = env.greeting ?? {};
      const decisions: string[] = ((payload as any).decisions_available ?? [
        "continue",
        "fresh",
      ]) as string[];
      const chips: ReentryHome["chips"] = decisions.map((d) => ({
        id: (d === "fresh" ? "reentry_fresh" : "reentry_continue") as ChipKey,
        label: d === "fresh" ? "Begin fresh" : "Continue",
      }));
      return {
        headline: cont.headline || "Welcome back.",
        body_lines: cont.body ? [cont.body] : [],
        chips,
        user_name: greet.user_name || userName || "friend",
      };
    },
    [dispatch, navigation, userName],
  );

  const fetchEntryView = useCallback(async () => {
    setLoading(true);
    try {
      const result = await mitraJourneyEntryView(_entryViewEtag);
      if (result.etag) _entryViewEtag = result.etag;
      if (result.notModified || !result.envelope) {
        // 304 — keep whatever we rendered last. If nothing, fall out
        // and let the ActivityIndicator keep showing (rare in practice).
        setLoading(false);
        return;
      }
      const next = routeToView(result.envelope);
      if (next) setReentry(next);
      setLoading(false);
    } catch (err: any) {
      console.warn("[ContinueJourney] v3 entry-view fetch failed:", err?.message);
      setLoading(false);
    }
  }, [routeToView]);

  // Mount effect: single entry-view fetch. v3 inlines all target
  // payloads so there is no separate prehydration call.
  useEffect(() => {
    let cancelled = false;
    if (routedRef.current) return;
    (async () => {
      if (cancelled) return;
      await fetchEntryView();
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchEntryView]);

  // Reentry chip submit — owns its own POST (Step 7: replaces legacy
  // welcome_back_continue / welcome_back_fresh executor cases).
  const handleReentryChip = useCallback(
    async (chipId: ChipKey) => {
      if (submittingReentry) return;
      setSubmittingReentry(true);
      const decision: "continue" | "fresh" =
        chipId === "reentry_fresh" ? "fresh" : "continue";
      const idempotencyKey = String(uuidv4.v4());
      try {
        const env = await mitraJourneyReentryDecision(decision, idempotencyKey);
        if (!env) {
          console.warn("[ContinueJourney] reentry-decision network error");
          setSubmittingReentry(false);
          return;
        }
        const nv = env.next_view ?? { view_key: "", payload: {} };
        if (nv.view_key === "daily_view") {
          for (const [k, v] of Object.entries(
            ingestDailyView(nv.payload as any),
          )) {
            if (v !== undefined) {
              dispatch(screenActions.setScreenValue({ key: k, value: v }));
            }
          }
          routedRef.current = true;
          dispatch(
            loadScreenWithData({
              containerId: "companion_dashboard_v3",
              stateId: "day_active",
            }) as any,
          );
          navigation.navigate("DynamicEngine");
        } else if (nv.view_key === "onboarding_start") {
          // Clear journey-scoped screenData before onboarding.
          const clearKeys = [
            "journey_id",
            "day_number",
            "total_days",
            "path_cycle_number",
            "cycle_metrics",
            "continuity",
            "today",
            "arc_state",
            "insights",
            "identity",
            "greeting",
          ];
          for (const k of clearKeys) {
            dispatch(screenActions.setScreenValue({ key: k, value: null }));
          }
          routedRef.current = true;
          dispatch(
            loadScreenWithData({
              containerId: "welcome_onboarding",
              stateId: "turn_1",
            }) as any,
          );
          navigation.navigate("DynamicEngine");
        } else {
          console.warn(
            "[ContinueJourney] reentry: unexpected next_view.view_key",
            nv.view_key,
          );
        }
      } catch (err: any) {
        console.warn(
          "[ContinueJourney] reentry-decision threw:",
          err?.message,
        );
      } finally {
        setSubmittingReentry(false);
      }
    },
    [dispatch, navigation, submittingReentry],
  );

  // ── Loading state ────────────────────────────────────────────────
  if (loading || !reentry) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color="#432104" />
        </View>
      </SafeAreaView>
    );
  }

  // ── Reentry chip render ─────────────────────────────────────
  const headline = (reentry.headline || "").replace(
    "{userName}",
    reentry.user_name || userName || "friend",
  );
  const bodyLines = reentry.body_lines;
  const chips = reentry.chips;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          {!!headline && <Text style={styles.welcomeText}>{headline}</Text>}
          {bodyLines.map((line, i) => (
            <Text key={i} style={styles.subtext}>
              {line}
            </Text>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Ionicons name="diamond-outline" size={10} color="#DAC28E" />
          <View style={styles.dividerLine} />
        </View>

        {/* Reentry chips (continue | fresh) */}
        <View style={styles.actionGroup}>
          {chips.map((chip, idx) => (
            <TouchableOpacity
              key={chip.id || `chip_${idx}`}
              style={[
                styles.actionButton,
                submittingReentry && { opacity: 0.5 },
              ]}
              activeOpacity={0.7}
              disabled={submittingReentry}
              onPress={() => handleReentryChip(chip.id)}
            >
              <View style={styles.btnContent}>
                <View style={styles.btnContentInner}>
                  {ioniconFor(chip.id === "reentry_continue" ? "heart" : null)}
                  <Text style={styles.btnText}>{chip.label}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Lotus illustration */}
      <View style={styles.lotusContainer} pointerEvents="none">
        <Image
          source={require("../../../assets/new_home_lotus.png")}
          style={styles.lotusImage}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 220,
    alignItems: "center",
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 10,
  },
  welcomeText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 28,
    color: "#432104",
    textAlign: "center",
    marginBottom: 16,
  },
  subtext: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#6b5a45",
    textAlign: "center",
    lineHeight: 28,
    maxWidth: 320,
    marginBottom: 6,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    width: "60%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#DAC28E",
    marginHorizontal: 10,
    opacity: 0.5,
  },
  promptText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 22,
    color: "#432104",
    textAlign: "center",
    marginBottom: 15,
  },
  primaryCtaWrap: {
    width: "100%",
    marginBottom: 12,
  },
  primaryCtaGradient: {
    // height: 60,
    borderRadius: 30,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // paddingHorizontal: 24,
    width: "80%",
    alignSelf: "center",
    gap: 8,
  },
  primaryCtaLabel: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: "#FFF8E7",
  },
  actionGroup: {
    width: "100%",
    gap: 12,
  },
  actionButton: {
    width: "100%",
    padding: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(107, 77, 40, 0.15)",
    backgroundColor: "rgba(255, 252, 246, 0.5)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  btnContentInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  btnIcon: {
    marginRight: 12,
  },
  btnText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#432104",
  },
  iconPlaceholder: {
    width: 24,
    marginRight: 12,
  },
  footerLinkWrap: {
    marginTop: 16,
    alignItems: "center",
  },
  footerLinkText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: "#6b5a45",
  },
  lotusContainer: {
    position: "absolute",
    bottom: -60,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  lotusImage: {
    width: SCREEN_HEIGHT * 0.25,
    height: SCREEN_HEIGHT * 0.3,
  },
});

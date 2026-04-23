/**
 * ContinueJourney — contextual home surface for authed users.
 *
 * Two modes selected by `hasActiveJourney` prop:
 *
 *   hasActiveJourney = true  → GET /api/mitra/journey/home/
 *     Dispatches on response_type per JOURNEY_HOME_CONTRACT_V1:
 *       render_home      → momentum / choice / minimal_care layouts
 *       route_to_moment  → executeAction immediately
 *       fallback         → minimal 2-chip shell
 *
 *   hasActiveJourney = false → GET /api/mitra/v3/journey/entry-view/
 *     target.view_key === "welcome_back_surface" → reentry chip home
 *     Any other view_key (daily_view / day_7 / day_14 / crisis /
 *     onboarding_start) → route away inline.
 *
 * ETag discipline (returning path only): module-level _entryViewEtag;
 * cleared on stale fresh mount.
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
import { useToast } from "../../context/ToastContext";
import { executeAction } from "../../engine/actionExecutor";
import {
  mitraJourneyEntryView,
  mitraJourneyHome,
  mitraJourneyReentryDecision,
  V3EntryViewEnvelope,
} from "../../engine/mitraApi";
import { useScreenStore } from "../../engine/useScreenBridge";
import { ingestDailyView } from "../../engine/v3Ingest";
import {
  goBackWithData,
  loadScreenWithData,
  screenActions,
} from "../../store/screenSlice";
import { Fonts } from "../../theme/fonts";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// ── Types: journey/home/ response ────────────────────────────────────
interface ActionSpec {
  type:
    | "navigate"
    | "load_screen"
    | "open_mitra_chat"
    | "start_checkin"
    | "start_support"
    | "continue_practice"
    | "view_last_path"
    | "noop";
  target?: { container_id?: string; state_id?: string } | string;
}

interface ChipSpec {
  id: string;
  label: string;
  icon: string | null;
  action: ActionSpec;
}

interface FooterLink {
  label: string;
  action: ActionSpec;
}

interface HomeResponse {
  response_type: "render_home" | "route_to_moment" | "fallback";
  moment_id?: string | null;
  layout?: "momentum" | "choice" | "minimal_care";
  headline?: string;
  body_lines?: string[];
  h2_prompt?: string | null;
  primary_cta?: ChipSpec | null;
  chips?: ChipSpec[];
  footer_link?: FooterLink | null;
  action?: ActionSpec;
  target?: { container_id: string; state_id: string };
  meta: {
    fallback_used?: boolean;
    cache_ttl_sec?: number;
  };
}

// ── Types: entry-view / welcome_back_surface ─────────────────────────
type ChipKey = "reentry_continue" | "reentry_fresh";
interface EarnedContext {
  days_practiced?: number;
  strongest_anchor?: string;
  focus?: string;
  path_cycle_number?: number;
}
interface ReentryHome {
  headline: string;
  body_lines: string[];
  welcome_back_line?: string;
  focus_short?: string;
  cycle_count?: number;
  chips: { id: ChipKey; label: string }[];
  user_name: string;
  // tier-aware additions
  tier?: "short" | "medium" | "long" | "very_long";
  earned_context?: EarnedContext;
  fresh_restart_suggested?: boolean;
  fresh_reason_label?: string;
  primary_recommendation?: "continue" | "fresh";
}

interface ContinueJourneyProps {
  userName?: string;
  hasActiveJourney?: boolean;
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

// Lightweight in-module TTL cache for active-user journey/home/.
let _homeCache: { response: HomeResponse; ts: number } | null = null;

// Module-level ETag for entry-view (returning-user path).
let _entryViewEtag: string | null = null;

export default function ContinueJourney({
  userName = "friend",
  hasActiveJourney = false,
}: ContinueJourneyProps) {
  const screenBridge = useScreenStore();
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const { showToast } = useToast();

  // Active-user path state.
  const [home, setHome] = useState<HomeResponse | null>(null);
  // Returning-user path state.
  const [reentry, setReentry] = useState<ReentryHome | null>(null);
  // Shared.
  const [loading, setLoading] = useState(true);
  const [submittingReentry, setSubmittingReentry] = useState(false);
  const routedRef = useRef(false);

  // ── Active-user path: buildActionContext ─────────────────────────
  const buildActionContext = useCallback(() => {
    return {
      screenState: screenBridge.screenData || {},
      setScreenValue: (value: any, key: string) => {
        dispatch(screenActions.setScreenValue({ key, value }));
      },
      loadScreen: (target: any) => {
        const containerId =
          typeof target === "string"
            ? "generic"
            : target?.container_id || target?.containerId || "generic";
        const stateId =
          typeof target === "string"
            ? target
            : target?.state_id || target?.stateId || "";
        dispatch(loadScreenWithData({ containerId, stateId }) as any);
        navigation.navigate("DynamicEngine");
      },
      goBack: () => {
        dispatch(goBackWithData() as any);
      },
      currentScreen: screenBridge.currentScreen,
    };
  }, [screenBridge.screenData, screenBridge.currentScreen, dispatch, navigation]);

  // ── Active-user path: fetchHome ──────────────────────────────────
  const fetchHome = useCallback(async (forceRefresh = false) => {
    const ttlMs = (_homeCache?.response?.meta?.cache_ttl_sec || 0) * 1000;
    if (
      !forceRefresh &&
      _homeCache &&
      ttlMs > 0 &&
      Date.now() - _homeCache.ts < ttlMs
    ) {
      setHome(_homeCache.response);
      setLoading(false);
      return _homeCache.response;
    }
    setLoading(true);
    let deviceTz: string | undefined;
    try {
      deviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      deviceTz = undefined;
    }
    const res = (await mitraJourneyHome({ tz: deviceTz })) as HomeResponse | null;
    if (res) {
      _homeCache = { response: res, ts: Date.now() };
      setHome(res);
    }
    setLoading(false);
    return res;
  }, []);

  // ── Returning-user path: routeToView ─────────────────────────────
  const routeToView = useCallback(
    (env: V3EntryViewEnvelope): ReentryHome | null => {
      const target = env.target;
      const viewKey = target?.view_key;
      const payload = target?.payload ?? {};

      const writeAll = (flat: Record<string, any>) => {
        for (const [k, v] of Object.entries(flat)) {
          if (v !== undefined) {
            dispatch(screenActions.setScreenValue({ key: k, value: v }));
          }
        }
      };

      if (viewKey === "daily_view") {
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
        const { ingestDay7View } = require("../../engine/v3Ingest");
        writeAll(ingestDay7View(payload as any));
        // Also write checkpoint_day so CycleReflectionBlock can detect the cycle
        dispatch(screenActions.setScreenValue({ key: "checkpoint_day", value: 7 }));
        routedRef.current = true;
        dispatch(
          loadScreenWithData({
            containerId: "checkpoint_reflection",
            stateId: "day_7",
          }) as any,
        );
        navigation.navigate("DynamicEngine");
        return null;
      }
      if (viewKey === "day_14_view") {
        const { ingestDay14View } = require("../../engine/v3Ingest");
        writeAll(ingestDay14View(payload as any));
        // Also write checkpoint_day so CycleReflectionBlock can detect the cycle
        dispatch(screenActions.setScreenValue({ key: "checkpoint_day", value: 14 }));
        routedRef.current = true;
        dispatch(
          loadScreenWithData({
            containerId: "checkpoint_reflection",
            stateId: "day_14",
          }) as any,
        );
        navigation.navigate("DynamicEngine");
        return null;
      }
      if (viewKey === "crisis_view") {
        routedRef.current = true;
        dispatch(
          loadScreenWithData({ containerId: "safety", stateId: "crisis" }) as any,
        );
        navigation.navigate("DynamicEngine");
        return null;
      }
      if (viewKey === "grief_room") {
        routedRef.current = true;
        dispatch(
          loadScreenWithData({ containerId: "companion_dashboard", stateId: "grief_room" }) as any,
        );
        navigation.navigate("DynamicEngine");
        return null;
      }
      if (viewKey === "loneliness_room") {
        routedRef.current = true;
        dispatch(
          loadScreenWithData({ containerId: "companion_dashboard", stateId: "loneliness_room" }) as any,
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
      const decisionLabels: Record<string, string> =
        (payload as any).decision_labels ?? {};
      const chips: ReentryHome["chips"] = decisions.map((d) => ({
        id: (d === "fresh" ? "reentry_fresh" : "reentry_continue") as ChipKey,
        label:
          decisionLabels[d] ?? (d === "fresh" ? "Begin fresh" : "Continue"),
      }));
      return {
        headline: cont.headline || "Welcome back.",
        body_lines: cont.body ? [cont.body] : [],
        welcome_back_line: cont.welcome_back_line || "",
        focus_short: cont.focus_short || "",
        cycle_count: cont.cycle_count ?? undefined,
        chips,
        user_name: greet.user_name || userName || "friend",
        tier: (cont.tier as ReentryHome["tier"]) || "short",
        earned_context: cont.earned_context ?? undefined,
        fresh_restart_suggested: cont.fresh_restart_suggested ?? false,
        fresh_reason_label: cont.fresh_reason_label || "",
        primary_recommendation: (cont.primary_recommendation as "continue" | "fresh") || "continue",
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
        if (!reentry && !routedRef.current) {
          _entryViewEtag = null;
          return fetchEntryView();
        }
        setLoading(false);
        return;
      }
      const next = routeToView(result.envelope);
      if (next) setReentry(next);
      setLoading(false);
    } catch (err: any) {
      console.warn("[ContinueJourney] entry-view fetch failed:", err?.message);
      setLoading(false);
    }
  }, [routeToView]);

  // ── Mount effect ─────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    let prehydrateTimer: ReturnType<typeof setTimeout> | null = null;

    if (routedRef.current) return;

    if (hasActiveJourney) {
      // Active-user path: journey/home/ with optional generate_companion prehydration.
      (async () => {
        const res = await fetchHome();
        if (cancelled || !res || routedRef.current) return;

        if (res.response_type === "route_to_moment" && res.action) {
          routedRef.current = true;
          await executeAction(res.action as any, buildActionContext() as any);
          return;
        }
        prehydrateTimer = setTimeout(() => {
          if (cancelled || routedRef.current) return;
          executeAction(
            {
              type: "generate_companion",
              payload: { skipReveal: true, use_journey_companion: true },
            } as any,
            buildActionContext() as any,
          ).catch((err) => {
            console.debug(
              "[ContinueJourney] generate_companion prehydrate failed:",
              err?.message,
            );
          });
        }, 1500);
      })();
    } else {
      // Returning-user path: entry-view.
      (async () => {
        if (cancelled) return;
        await fetchEntryView();
      })();
    }

    return () => {
      cancelled = true;
      if (prehydrateTimer) clearTimeout(prehydrateTimer);
    };
  }, [hasActiveJourney, fetchHome, fetchEntryView, buildActionContext]);

  // ── Reentry chip submit (returning-user path only) ───────────────
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
          // FIX-8: surface carryover count so user knows items persisted
          const carriedCount = (env as any).carried_items_count ?? 0;
          if (carriedCount > 0) {
            showToast(
              carriedCount === 1
                ? "1 item carried forward to your new cycle."
                : `${carriedCount} items carried forward to your new cycle.`,
              4000,
              "info",
            );
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
          const clearKeys = [
            "journey_id", "day_number", "total_days", "path_cycle_number",
            "cycle_metrics", "continuity", "today", "arc_state", "insights",
            "identity", "greeting",
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
        console.warn("[ContinueJourney] reentry-decision threw:", err?.message);
      } finally {
        setSubmittingReentry(false);
      }
    },
    [dispatch, navigation, submittingReentry],
  );

  // ── Loading state ────────────────────────────────────────────────
  if (loading || (hasActiveJourney ? !home : !reentry)) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color="#432104" />
        </View>
      </SafeAreaView>
    );
  }

  // ── Active-user render (journey/home/) ───────────────────────────
  if (hasActiveJourney && home) {
    if (home.response_type === "route_to_moment") {
      return null;
    }

    const headline = (home.headline || "").replace("{userName}", userName || "friend");
    const bodyLines = home.body_lines || [];
    const layout = home.layout || "minimal_care";
    const chips = home.chips || [];
    const primaryCta = home.primary_cta || null;
    const h2 = home.h2_prompt || null;
    const footer = home.footer_link || null;

    const handleAction = async (action: ActionSpec | undefined) => {
      if (!action) return;
      try {
        await executeAction(action as any, buildActionContext() as any);
      } catch (err: any) {
        console.warn("[ContinueJourney] executeAction threw:", err?.message);
      }
    };

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            {!!headline && <Text style={styles.welcomeText}>{headline}</Text>}
            {bodyLines.map((line, i) => (
              <Text key={i} style={styles.subtext}>{line}</Text>
            ))}
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Ionicons name="diamond-outline" size={10} color="#DAC28E" />
            <View style={styles.dividerLine} />
          </View>

          {!!h2 && <Text style={styles.promptText}>{h2}</Text>}

          {primaryCta && (
            <TouchableOpacity
              style={styles.primaryCtaWrap}
              activeOpacity={0.85}
              onPress={() => handleAction(primaryCta.action)}
            >
              <LinearGradient
                colors={["#C08B31", "#D3A44D", "#B57C26"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.primaryCtaGradient}
              >
                <Text style={styles.primaryCtaLabel}>{primaryCta.label}</Text>
                <Ionicons name="arrow-forward" size={22} color="#FFF8E7" />
              </LinearGradient>
            </TouchableOpacity>
          )}

          <View style={styles.actionGroup}>
            {chips.map((chip, idx) => {
              const isLastWithArrow =
                chip.action?.type === "continue_practice" && !primaryCta;
              return (
                <TouchableOpacity
                  key={chip.id || `chip_${idx}`}
                  style={styles.actionButton}
                  activeOpacity={0.7}
                  onPress={() => handleAction(chip.action)}
                >
                  <View
                    style={[
                      styles.btnContent,
                      isLastWithArrow && { justifyContent: "space-between" },
                    ]}
                  >
                    <View style={styles.btnContentInner}>
                      {ioniconFor(chip.icon)}
                      <Text style={styles.btnText}>{chip.label}</Text>
                    </View>
                    {isLastWithArrow && (
                      <Ionicons name="arrow-forward" size={22} color="#432104" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {footer && layout === "momentum" && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleAction(footer.action)}
              style={styles.footerLinkWrap}
            >
              <Text style={styles.footerLinkText}>{footer.label} →</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

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

  // ── Returning-user render (entry-view welcome_back_surface) ──────
  const rEntry = reentry!;
  const displayName = rEntry.user_name || userName || "friend";
  const headline = (rEntry.headline || "").replace("{userName}", displayName);
  const isDeepTier =
    rEntry.tier === "medium" || rEntry.tier === "long" || rEntry.tier === "very_long";

  // For medium/long/very_long: show dedicated emotional card with earned context.
  // For short (3-7 day gap): keep inline chip layout.
  if (isDeepTier) {
    // BE controls button order via primary_recommendation.
    const freshFirst = rEntry.fresh_restart_suggested || rEntry.primary_recommendation === "fresh";
    const continueChip = rEntry.chips.find((c) => c.id === "reentry_continue");
    const freshChip = rEntry.chips.find((c) => c.id === "reentry_fresh");
    const primaryChip = freshFirst ? freshChip : continueChip;
    const secondaryChip = freshFirst ? continueChip : freshChip;
    const ec = rEntry.earned_context;

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Headline + body */}
          <View style={styles.header}>
            {!!headline && <Text style={styles.welcomeText}>{headline}</Text>}
            {rEntry.body_lines.map((line, i) => (
              <Text key={i} style={styles.subtext}>{line}</Text>
            ))}
          </View>

          {/* Welcome back context line */}
          {!!rEntry.welcome_back_line && (
            <Text style={styles.welcomeBackLine}>{rEntry.welcome_back_line}</Text>
          )}

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Ionicons name="diamond-outline" size={10} color="#DAC28E" />
            <View style={styles.dividerLine} />
          </View>

          {/* Earned context card */}
          {!!ec && (
            <View style={styles.earnedContextCard}>
              {typeof ec.days_practiced === "number" && (
                <View style={styles.earnedRow}>
                  <Text style={styles.earnedKey}>Days practiced</Text>
                  <Text style={styles.earnedVal}>{ec.days_practiced}</Text>
                </View>
              )}
              {typeof rEntry.cycle_count === "number" && rEntry.cycle_count > 0 && (
                <View style={styles.earnedRow}>
                  <Text style={styles.earnedKey}>Full cycles</Text>
                  <Text style={styles.earnedVal}>{rEntry.cycle_count}</Text>
                </View>
              )}
              {!!ec.strongest_anchor && (
                <View style={styles.earnedRow}>
                  <Text style={styles.earnedKey}>Strongest anchor</Text>
                  <Text style={styles.earnedVal}>{ec.strongest_anchor}</Text>
                </View>
              )}
            </View>
          )}

          {/* very_long tier: fresh reason nudge */}
          {!!rEntry.fresh_reason_label && (
            <Text style={styles.freshReasonLabel}>{rEntry.fresh_reason_label}</Text>
          )}

          {/* Decision buttons */}
          <View style={[styles.actionGroup, { marginTop: 24 }]}>
            {primaryChip && (
              <TouchableOpacity
                testID={primaryChip.id}
                style={[styles.actionButton, submittingReentry && { opacity: 0.5 }]}
                activeOpacity={0.7}
                disabled={submittingReentry}
                onPress={() => handleReentryChip(primaryChip.id)}
              >
                <LinearGradient
                  colors={["#C08B31", "#D3A44D", "#B57C26"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.primaryCtaGradient}
                >
                  <Text style={styles.primaryCtaLabel}>{primaryChip.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            {secondaryChip && (
              <TouchableOpacity
                testID={secondaryChip.id}
                style={[styles.actionButton, submittingReentry && { opacity: 0.5 }]}
                activeOpacity={0.7}
                disabled={submittingReentry}
                onPress={() => handleReentryChip(secondaryChip.id)}
              >
                <View style={styles.btnContent}>
                  <View style={styles.btnContentInner}>
                    <Text style={styles.btnText}>{secondaryChip.label}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

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

  // ── Short-tier (3-7 day gap): inline chip layout ─────────────────
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          {!!headline && <Text style={styles.welcomeText}>{headline}</Text>}
          {!!rEntry.welcome_back_line && (
            <Text style={styles.earnedLine}>{rEntry.welcome_back_line}</Text>
          )}
          {rEntry.body_lines.map((line, i) => (
            <Text key={i} style={styles.subtext}>{line}</Text>
          ))}
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Ionicons name="diamond-outline" size={10} color="#DAC28E" />
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.actionGroup}>
          {rEntry.chips.map((chip, idx) => (
            <TouchableOpacity
              key={chip.id || `chip_${idx}`}
              testID={chip.id}
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
  earnedLine: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: "#9b7a4a",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
    marginBottom: 12,
  },
  welcomeBackLine: {
    fontFamily: Fonts.serif.regular,
    fontSize: 17,
    color: "#7a5c35",
    textAlign: "center",
    lineHeight: 26,
    maxWidth: 320,
    marginTop: 4,
    marginBottom: 4,
  },
  earnedContextCard: {
    width: "100%",
    backgroundColor: "rgba(255, 252, 246, 0.85)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(217, 194, 142, 0.4)",
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 10,
  },
  earnedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  earnedKey: {
    fontFamily: Fonts.sans.medium,
    fontSize: 13,
    color: "#8c7355",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  earnedVal: {
    fontFamily: Fonts.serif.bold,
    fontSize: 16,
    color: "#432104",
  },
  freshReasonLabel: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    color: "#9b7a4a",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
    marginTop: 8,
    marginBottom: 4,
    fontStyle: "italic",
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
    borderRadius: 30,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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

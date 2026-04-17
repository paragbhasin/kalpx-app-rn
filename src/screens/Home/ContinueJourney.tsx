/**
 * ContinueJourney — contextual home surface for authed users with an
 * active journey. v2 (2026-04-17) — backend-driven per
 * kalpx/docs/mitra-v3/JOURNEY_HOME_CONTRACT_V1.md.
 *
 * Data source: GET /api/mitra/journey/home/
 * Response dispatching per contract §5:
 *   - response_type === "render_home"      → render headline + body +
 *                                             optional h2 + optional gold
 *                                             primary_cta + chips + optional
 *                                             footer_link. Layout = one of
 *                                             momentum | choice | minimal_care.
 *   - response_type === "route_to_moment"  → executeAction(response.action)
 *                                             immediately; do not render a
 *                                             home card.
 *   - response_type === "fallback"         → render the minimal 2-chip shell.
 *
 * Sovereignty: no hardcoded user-facing strings except a loading indicator.
 * Actions: only the contract-locked action.type enum; dispatched through the
 * existing executeAction pipeline.
 *
 * Cache: lightweight local TTL check. Full Redux-backed cache with
 * completion-event invalidation (Invariant #10) tracked as a follow-up.
 */

import { Ionicons } from "@expo/vector-icons";
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
import { LinearGradient } from "expo-linear-gradient";
import { executeAction } from "../../engine/actionExecutor";
import { mitraJourneyHome } from "../../engine/mitraApi";
import { useScreenStore } from "../../engine/useScreenBridge";
import { Fonts } from "../../theme/fonts";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// ── Types mirror the JSON returned by /journey/home/ ─────────────────
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
  layout_reason?: string;
  priority_source?: string;
  headline?: string;
  body_lines?: string[];
  h2_prompt?: string | null;
  primary_cta?: ChipSpec | null;
  chips?: ChipSpec[];
  footer_link?: FooterLink | null;
  embeds?: any[];
  context?: any;
  action?: ActionSpec;
  target?: { container_id: string; state_id: string };
  presentation?: "replace" | "push" | "modal";
  reason?: string;
  meta: {
    fallback_used?: boolean;
    cache_ttl_sec?: number;
    refetch_triggers?: string[];
  };
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
    <Ionicons
      name={glyph}
      size={24}
      color="#432104"
      style={styles.btnIcon}
    />
  );
}

// Lightweight in-module cache. Not Redux-backed yet — sufficient for v1.
let _homeCache: { response: HomeResponse; ts: number } | null = null;

export default function ContinueJourney({
  userName = "friend",
}: ContinueJourneyProps) {
  const screenBridge = useScreenStore();
  const [home, setHome] = useState<HomeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const routedRef = useRef(false);

  const buildActionContext = useCallback(() => {
    return {
      screenState: screenBridge.screenData || {},
      setScreenValue: screenBridge.setScreenValue,
      loadScreen: screenBridge.loadScreen,
      goBack: screenBridge.goBack,
      currentScreen: screenBridge.currentScreen,
    };
  }, [screenBridge]);

  const fetchHome = useCallback(async (forceRefresh: boolean = false) => {
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
    // Device timezone — per Contract §13, FE SHOULD include tz when it
    // has one from the device. Without this the backend uses
    // UserProfile.timezone (default Asia/Kolkata), which makes every
    // overseas user look like a late-night user to the decision router.
    let deviceTz: string | undefined;
    try {
      deviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      deviceTz = undefined;
    }
    const res = (await mitraJourneyHome({
      tz: deviceTz,
    })) as HomeResponse | null;
    if (res) {
      _homeCache = { response: res, ts: Date.now() };
      setHome(res);
    }
    setLoading(false);
    return res;
  }, []);

  // Fetch on mount.
  // Pre-hydrate the triad (generate_companion) in parallel with /journey/home/
  // so that when the user taps "Continue today's practice" or any dashboard-
  // bound chip, the triad data (mantra_text, sankalp_text, practice_title)
  // is already in screenState. Keeps chip taps synchronous + responsive.
  useEffect(() => {
    (async () => {
      const [res] = await Promise.all([
        fetchHome(),
        executeAction(
          { type: "generate_companion" } as any,
          buildActionContext() as any,
        ).catch((err) => {
          console.debug("[ContinueJourney] generate_companion prehydrate failed:", err?.message);
        }),
      ]);
      if (!res) return;
      // route_to_moment → navigate immediately, do not render home.
      if (res.response_type === "route_to_moment" && res.action && !routedRef.current) {
        routedRef.current = true;
        await executeAction(res.action as any, buildActionContext() as any);
      }
    })();
  }, [fetchHome, buildActionContext]);

  const handleAction = useCallback(
    async (action: ActionSpec | undefined) => {
      console.log("[ContinueJourney] chip tapped, action:", JSON.stringify(action));
      if (!action) {
        console.warn("[ContinueJourney] no action — aborting");
        return;
      }
      try {
        const ctx = buildActionContext();
        console.log(
          "[ContinueJourney] dispatching executeAction, ctx keys:",
          Object.keys(ctx || {}),
        );
        await executeAction(action as any, ctx as any);
        console.log("[ContinueJourney] executeAction returned cleanly for type:", action.type);
      } catch (err: any) {
        console.error("[ContinueJourney] executeAction threw:", err?.message, err);
      }
    },
    [buildActionContext],
  );

  // ── Loading state ────────────────────────────────────────────────
  if (loading || !home) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color="#432104" />
        </View>
      </SafeAreaView>
    );
  }

  // route_to_moment returns nothing visual (navigation fires in effect).
  if (home.response_type === "route_to_moment") {
    return null;
  }

  // ── render_home / fallback ─────────────────────────────────────
  const headline = (home.headline || "").replace("{userName}", userName || "friend");
  const bodyLines = home.body_lines || [];
  const layout = home.layout || "minimal_care";
  const chips = home.chips || [];
  const primaryCta = home.primary_cta || null;
  const h2 = home.h2_prompt || null;
  const footer = home.footer_link || null;

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

        {/* H2 prompt (choice + momentum, not minimal_care) */}
        {!!h2 && <Text style={styles.promptText}>{h2}</Text>}

        {/* Gold primary CTA (momentum only; contract Invariant #2) */}
        {primaryCta && layout === "momentum" && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleAction(primaryCta.action)}
            style={styles.primaryCtaWrap}
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

        {/* Chips (always present; contract Invariant #3) */}
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
                    <Ionicons
                      name="arrow-forward"
                      size={22}
                      color="#432104"
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer link (momentum only when present) */}
        {footer && layout === "momentum" && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleAction(footer.action)}
            style={styles.footerLinkWrap}
          >
            <Text style={styles.footerLinkText}>{footer.label}  →</Text>
          </TouchableOpacity>
        )}
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
    height: 60,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
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

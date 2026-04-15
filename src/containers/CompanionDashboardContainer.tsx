import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import MantraLotus3d from "../../assets/mantra-lotus-3d.svg";
import { executeAction } from "../engine/actionExecutor";
import BlockRenderer from "../engine/BlockRenderer";
import { useScreenStore } from "../engine/useScreenBridge";
import store from "../store";
import { screenActions } from "../store/screenSlice";
import { Fonts } from "../theme/fonts";
import KalpxModal from "../components/KalpxModal";
// Week 2 — Day Active dashboard sections (Mitra v3 Moments 8-15, 40, 41, 43).
// Spec: kalpx-frontend/docs/specs/mitra-v3-experience/screens/route_dashboard_day_active.md §10
import MorningBriefingBlock from "../blocks/MorningBriefingBlock";
import FocusPhraseBlock from "../blocks/FocusPhraseBlock";
import CycleSignalBar from "../blocks/CycleSignalBar";
import ClearWindowBanner from "../blocks/ClearWindowBanner";  // re-added 2026-04-13 (backend B4-v2 shipped)
import CoreItemsList from "../blocks/CoreItemsList";
import CheckInCardCompact from "../blocks/CheckInCardCompact";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardSchema {
  blocks?: any[];
  tone?: { backgroundPosition?: string; backgroundSize?: string };
  dashboard_config?: {
    status_messages?: Record<string, string>;
    seal_button_labels?: Record<string, string>;
    instruction_text?: string;
    journey_summary?: string;
    day_label?: string;
  };
}

interface Props {
  schema: DashboardSchema;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RING_SIZE = 150;
const RING_STROKE = 7;
const RING_RADIUS = 45;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const interpolate = (text: string, values: Record<string, any>) => {
  if (!text) return "";
  let result = text;
  Object.keys(values).forEach((key) => {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), values[key]);
  });
  return result;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const CompanionDashboardContainer: React.FC<Props> = ({ schema }) => {
  const {
    screenData,
    loadScreen,
    updateScreenData,
    goBack,
    updateBackground,
    updateHeaderHidden,
  } = useScreenStore();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showToastModal, setShowToastModal] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Alias: screenData in RN Redux = screenState in Vue
  const ss = screenData as Record<string, any>;

  // -------------------------------------------------------------------------
  // Computed values — mirrors Vue computed properties
  // -------------------------------------------------------------------------

  const isLightened = !!ss.journey_is_lightened;
  const hasDeepen = !!ss.cycle_deepen_item_id;

  const coreCount = useMemo(() => {
    let c = 0;
    if (ss.practice_chant) c++;
    if (ss.practice_embody) c++;
    if (ss.practice_act) c++;
    return c;
  }, [ss.practice_chant, ss.practice_embody, ss.practice_act]);

  const totalRequired = isLightened ? 1 : hasDeepen ? 4 : 3;

  const progress = useMemo(() => {
    let done = coreCount;
    if (hasDeepen && ss.practice_deepen) done++;
    return done / totalRequired;
  }, [coreCount, hasDeepen, ss.practice_deepen, totalRequired]);

  const isDayComplete = useMemo(() => {
    if (isLightened) return coreCount >= 1;
    if (hasDeepen) return coreCount >= 3 && !!ss.practice_deepen;
    return coreCount >= 3;
  }, [isLightened, hasDeepen, coreCount, ss.practice_deepen]);

  const dayNumber = Number(ss.day_number) || 1;
  const totalDays = Number(ss.total_days) || 14;
  const daysRemaining = totalDays - dayNumber;
  const identityLabel = ss.identity_label || "";
  const cycleNumber = Number(ss.path_cycle_number) || 1;
  const pathMilestone = ss.path_milestone || null;
  const streakDisplay = ss.streak_display || "";
  const sankalpHowToLive: string[] = ss.sankalp_how_to_live || [];
  const contextualCta = ss.contextual_cta || null;
  const pranaInsight = ss.prana_ack_insight || "";
  const daysSinceLastPractice = Number(ss.days_since_last_practice) || 0;
  const showReturnBanner = daysSinceLastPractice >= 3;
  const journeyId = ss.journey_id || null;

  // Status message from dashboard_config
  const statusMessage = useMemo(() => {
    const values = { day_number: dayNumber, total_days: totalDays };
    const messages = schema.dashboard_config?.status_messages || {};

    let msg = "";
    if (isDayComplete) msg = messages.completed || "Day Completed";
    else if (dayNumber === 1) msg = messages.start || "Begins Today";
    else if (dayNumber === 7 && totalDays >= 7)
      msg = messages.milestone || "Milestone Reached";
    else if (dayNumber === totalDays) msg = messages.near_end || "Almost There";
    else msg = messages.default || "Continue Journey";

    return interpolate(msg, values);
  }, [isDayComplete, dayNumber, totalDays, schema.dashboard_config]);

  // SVG ring calculations
  const strokeDashoffset = RING_CIRCUMFERENCE - RING_CIRCUMFERENCE * progress;
  const ringStroke = isDayComplete ? "#10b981" : "#bfa58a";

  // Block filtering
  const blocks = schema.blocks || [];
  const practiceBlocks = useMemo(
    () => blocks.filter((b: any) => b.type === "practice_card"),
    [blocks],
  );
  // footer_actions blocks (I Feel Triggered, Quick Check-In) are now
  // rendered directly inline for reliability; see the quickActions JSX.
  const footerBlocks = useMemo(
    () => blocks.filter((b: any) => b.position === "footer"),
    [blocks],
  );

  // Has active journey check (same logic as Vue template v-if)
  const hasJourney = !!(ss.scan_focus || ss.mantra_text);

  // Toast for trigger resolution
  useEffect(() => {
    const toast = ss._trigger_resolution_toast;
    if (toast?.message) {
      setToastMsg(toast.message);
      setShowToastModal(true);
      updateScreenData("_trigger_resolution_toast", null);
    }
  }, [ss._trigger_resolution_toast, updateScreenData]);

  // Apply background (same as ChoiceStackContainer)
  useEffect(() => {
    updateBackground(require("../../assets/beige_bg.png"));
    updateHeaderHidden(false);
    return () => updateHeaderHidden(false);
  }, [updateBackground, updateHeaderHidden]);

  // Audit fix F1 (2026-04-13) — Spec route_dashboard_day_active.md §6 declares
  // 8 parallel calls on dashboard entry. Dispatch dashboard_load on mount;
  // debounce subsequent re-mounts so we don't refetch on every focus.
  const lastDashboardLoadRef = React.useRef<number>(0);
  useEffect(() => {
    const now = Date.now();
    if (now - lastDashboardLoadRef.current < 30000) return; // 30s debounce
    lastDashboardLoadRef.current = now;
    executeAction(
      { type: "dashboard_load" },
      {
        screenState: ss,
        loadScreen: () => {},
        goBack: () => {},
        setScreenValue: (value: any, key: string) =>
          updateScreenData(key, value),
        startFlowInstance: () => {},
        endFlowInstance: () => {},
      },
    ).catch((err: any) => {
      console.warn("[Dashboard] dashboard_load failed:", err?.message);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------------------------------------------------------
  // Reset journey handler
  // -------------------------------------------------------------------------

  const handleReset = () => {
    Alert.alert(
      "Start Over",
      "This will end your current journey. Your progress will be remembered, but you'll begin a new path from scratch.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setShowResetConfirm(false),
        },
        {
          text: "Yes, start over",
          style: "destructive",
          onPress: async () => {
            try {
              // The action executor handles the API call + state reset
              const { executeAction } = require("../engine/actionExecutor");
              await executeAction(
                { type: "reset_journey" },
                {
                  screenState: ss,
                  setScreenValue: (val: any, k: string) =>
                    updateScreenData(k, val),
                  loadScreen,
                  goBack,
                },
              );
            } catch (err) {
              console.error("[RESET] Failed:", err);
            }
            setShowResetConfirm(false);
          },
        },
      ],
    );
  };

  // -------------------------------------------------------------------------
  // Empty state — no active journey
  // -------------------------------------------------------------------------

  if (!hasJourney) {
    return (
      <View style={styles.root}>
        <View style={styles.emptyState}>
          <MantraLotus3d width={120} height={120} />

          <Text style={styles.emptyHeadline}>Your practice space is ready</Text>
          <Text style={styles.emptySubtext}>
            Begin a guided journey rooted in Sanatan wisdom.{"\n"}
            Choose a focus area that resonates with where you are today.
          </Text>
          <TouchableOpacity
            style={styles.emptyCta}
            activeOpacity={0.85}
            onPress={() =>
              loadScreen({
                container_id: "choice_stack",
                state_id: "discipline_select",
              })
            }
          >
            <Text style={styles.emptyCtaText}>Begin My Journey</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // -------------------------------------------------------------------------
  // Main dashboard
  // -------------------------------------------------------------------------

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity section (header: day number + status) */}
        {!!statusMessage && (
          <View style={styles.identitySection}>
            <Text style={styles.identityHeadline}>{statusMessage}</Text>
            {!!ss.identity_guidance && (
              <Text style={styles.identityGuidance}>
                {ss.identity_guidance}
              </Text>
            )}
          </View>
        )}

        {/* ------------------------------------------------------------ */}
        {/* Week 2 — Day Active dashboard sections (Moments 8-15, 40,   */}
        {/* 41, 43). Spec §10 ordering: briefing → focus phrase →       */}
        {/* cycle signal → clear window → triad → check-in.             */}
        {/* Web parity: allContainers.js companion_dashboard.day_active */}
        {/* ------------------------------------------------------------ */}
        <MorningBriefingBlock />
        <FocusPhraseBlock block={{}} />
        <CycleSignalBar />
        <ClearWindowBanner />

        {/* Return banner — absent 3+ days */}
        {showReturnBanner && (
          <View style={styles.returnBanner}>
            <Text style={styles.returnBannerText}>
              Welcome back — your practice is here.
            </Text>
            <Text style={styles.returnBannerSub}>
              Begin with one step today.
            </Text>
          </View>
        )}

        {/* Progress ring with SVG */}
        <View style={styles.progressSection}>
          <View style={styles.progressRingOuter}>
            {/* SVG Ring */}
            <Svg
              width={RING_SIZE}
              height={RING_SIZE}
              viewBox="0 0 100 100"
              style={styles.ringSvg}
            >
              {/* Background ring */}
              <Circle
                cx="50"
                cy="50"
                r={RING_RADIUS}
                fill="none"
                stroke="#efe5d6"
                strokeWidth={RING_STROKE}
              />
              {/* Progress ring */}
              <Circle
                cx="50"
                cy="50"
                r={RING_RADIUS}
                fill="none"
                stroke={ringStroke}
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                strokeDasharray={`${RING_CIRCUMFERENCE}`}
                strokeDashoffset={strokeDashoffset}
                rotation={-90}
                origin="50, 50"
              />
            </Svg>

            {/* Inner text */}
            <View style={styles.progressRingInner}>
              {cycleNumber > 1 && (
                <Text style={styles.cycleLabel}>Cycle {cycleNumber}</Text>
              )}
              <Text style={styles.dayCount}>
                {identityLabel
                  ? interpolate(identityLabel, {
                      day_number: dayNumber,
                      total_days: totalDays,
                    })
                  : interpolate(
                      schema.dashboard_config?.day_label ||
                        "Day {{day_number}}",
                      { day_number: dayNumber },
                    )}
              </Text>
            </View>

            {/* Lotus at bottom of ring */}
            <View style={styles.lotusWrapper}>
              <LinearGradient
                colors={["rgba(212, 160, 23, 0)", "rgba(212, 160, 23, 0.8)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.lotusLine}
              />
              <MantraLotus3d width={100} height={100} />
              <LinearGradient
                colors={["rgba(212, 160, 23, 0.8)", "rgba(212, 160, 23, 0)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.lotusLine}
              />
            </View>
          </View>
        </View>

        {/* Path milestone — 30+ day practitioners, hidden when return banner visible */}
        {!!pathMilestone?.message && !showReturnBanner && (
          <View style={styles.pathMilestoneSection}>
            <Text style={styles.pathMilestoneText}>
              {pathMilestone.message}
            </Text>
          </View>
        )}

        {/* Journey summary / remaining */}
        {daysRemaining > 0 && (
          <View style={styles.reminderSection}>
            <Text style={styles.remainingText}>
              {interpolate(
                schema.dashboard_config?.journey_summary ||
                  `Your ${totalDays}-day practice journey \u2014 ${
                    streakDisplay || `${daysRemaining} sessions remaining`
                  }`,
                { day_number: dayNumber, total_days: totalDays },
              )}
            </Text>
          </View>
        )}

        {/* Instruction text — shown when day is not complete */}
        {!isDayComplete && (
          <View style={styles.instructionSection}>
            <Text style={styles.instructionText}>
              {contextualCta?.label ||
                schema.dashboard_config?.instruction_text ||
                "Tap on any card to start your session."}
            </Text>
          </View>
        )}

        {/* Prana insight — shown after check-in */}
        {!!pranaInsight && (
          <View style={styles.pranaInsightSection}>
            <Text style={styles.pranaInsightText}>{pranaInsight}</Text>
          </View>
        )}

        {/* ------------------------------------------------------------ */}
        {/* Core triad — CoreItemsList wraps mantra/sankalp/practice.   */}
        {/* Preserves legacy practice_card blocks underneath for any    */}
        {/* schema that still drives cards via BlockRenderer.           */}
        {/* Web parity: allContainers.js day_active lines 226-300.      */}
        {/* ------------------------------------------------------------ */}
        <CoreItemsList />

        {/* Dashboard check-in (REG-015: dashboard-local dismiss flag). */}
        <CheckInCardCompact />

        {/* Practice cards — legacy block-driven cards (kept for schema
            parity with other flows / variant overrides) */}
        {/* <View style={styles.practiceList}>
          {practiceBlocks.map((block: any, i: number) => (
            <BlockRenderer key={block.id || `practice-${i}`} block={block} />
          ))}
        </View> */}

        {!!ss.scan_focus && (
          <BlockRenderer
            block={{
              type: "additional_items_section",
              items_key: "additional_items",
              label: "Additional Practices",
            }}
          />
        )}

        {/* Sankalp carry-forward: how to live this vow today */}
        {sankalpHowToLive.length > 0 && !!ss.practice_embody && (
          <View style={styles.carryForwardSection}>
            <Text style={styles.carryForwardLabel}>
              How to carry your vow today
            </Text>
            {sankalpHowToLive.map((item: string, i: number) => (
              <Text key={i} style={styles.carryForwardItem}>
                {item}
              </Text>
            ))}
          </View>
        )}

        {/* Vow-carry state visual */}
        {!!ss.practice_embody && !isDayComplete && (
          <View style={styles.vowCarryIndicator}>
            <Text style={styles.vowCarryText}>
              Your sankalp is alive through this day
            </Text>
          </View>
        )}

        {/* Low-burden day entry */}
        {!isDayComplete && (
          <View style={styles.lowBurdenEntry}>
            <Text style={styles.lowBurdenLink}>What is possible today?</Text>
          </View>
        )}

        {/* ----------------------------------------------------------- */}
        {/* I Feel Triggered + Quick Check-In                           */}
        {/* Web parity: kalpx-frontend/src/mock/mock/allContainers.js   */}
        {/* line 299-336 (day_active footer_actions blocks).            */}
        {/* Rendered directly here (not via BlockRenderer) so the       */}
        {/* primary CTAs + their explainer subtexts are always visible  */}
        {/* regardless of schema load state.                            */}
        {/* ----------------------------------------------------------- */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.triggerBtn}
            activeOpacity={0.88}
            onPress={() => {
              executeAction(
                { type: "initiate_trigger" },
                {
                  loadScreen,
                  goBack,
                  setScreenValue: (value: any, key: string) => {
                    store.dispatch(
                      screenActions.setScreenValue({ key, value }),
                    );
                  },
                  screenState: store.getState().screen.screenData,
                },
              );
            }}
          >
            <LinearGradient
              colors={["#e8c060", "#d9a557"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.triggerBtnInner}
            >
              <Text style={styles.triggerBtnText}>I Feel Triggered</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.quickActionHelp}>
            Feeling overwhelmed or disturbed? Tap here and KalpX will guide you
            through a short reset using a mantra, sankalp, or simple practice.
          </Text>

          <TouchableOpacity
            style={styles.quickCheckinBtn}
            activeOpacity={0.88}
            onPress={() =>
              loadScreen({
                container_id: "cycle_transitions",
                state_id: "quick_checkin",
              })
            }
          >
            <Text style={styles.quickCheckinBtnText}>Quick Check-In</Text>
          </TouchableOpacity>
          <Text style={styles.quickActionHelp}>
            {
              "Share how you\u2019re feeling anytime during the day. Each check-in helps KalpX track your progress and guide your journey."
            }
          </Text>
        </View>

        {/* Diamond divider */}
        <Divider />

        <BlockRenderer
          block={{
            type: "progress_section",
          }}
        />
        {/* Reset section */}
        <View style={styles.resetSection}>
          {!showResetConfirm ? (
            <TouchableOpacity onPress={() => setShowResetConfirm(true)}>
              <Text style={styles.resetLink}>I want to start over</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.resetConfirm}>
              <Text style={styles.resetConfirmText}>
                This will end your current journey. Your progress will be
                remembered, but you'll begin a new path from scratch.
              </Text>
              <View style={styles.resetConfirmActions}>
                <TouchableOpacity
                  style={styles.resetConfirmBtn}
                  onPress={handleReset}
                >
                  <Text style={styles.resetConfirmBtnText}>
                    Yes, start over
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.resetCancelBtn}
                  onPress={() => setShowResetConfirm(false)}
                >
                  <Text style={styles.resetCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <Divider />

        {/* Footer links */}
        <View style={styles.footerLinkWrap}>
          {footerBlocks.map((block: any, i: number) => (
            <BlockRenderer key={block.id || `footer-${i}`} block={block} />
          ))}
        </View>
      </ScrollView>

      <KalpxModal
        visible={showToastModal}
        message={toastMsg}
        onClose={() => setShowToastModal(false)}
      />
    </View>
  );
};

// ---------------------------------------------------------------------------
// Diamond divider sub-component
// ---------------------------------------------------------------------------

const Divider: React.FC = () => (
  <View style={styles.divider}>
    <View style={styles.dividerLineLeft} />
    <View style={styles.diamond} />
    <View style={styles.dividerLineRight} />
  </View>
);

// ---------------------------------------------------------------------------
// Styles — KalpX gold/brown design language
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // backgroundColor: '#FAF9F6',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 50,
  },

  // -- Empty state --
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  emptyLotus: {
    width: 64,
    height: 64,
    resizeMode: "contain",
    marginBottom: 20,
    opacity: 0.8,
  },
  emptyHeadline: {
    fontFamily: Fonts.serif.bold,
    fontSize: 22,
    color: "#3a3225",
    textAlign: "center",
    marginBottom: 12,
  },
  emptySubtext: {
    fontFamily: Fonts.serif.regular,
    fontSize: 14,
    color: "#8b7355",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 28,
    maxWidth: 320,
  },
  emptyCta: {
    backgroundColor: "#c9a84c",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 50,
    shadowColor: "#c9a84c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  emptyCtaText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 15,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  // -- Identity section --
  identitySection: {
    alignItems: "center",
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  identityHeadline: {
    fontFamily: Fonts.serif.bold,
    fontSize: 20,
    color: "#432104",
  },
  identityGuidance: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#615247",
    marginTop: 2,
  },

  // -- Return banner --
  returnBanner: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: "#fffdf5",
    borderWidth: 1,
    borderColor: "#f0e6c8",
    borderRadius: 8,
  },
  returnBannerText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 17,
    color: "#5a4a2a",
  },
  returnBannerSub: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#8a7a5a",
    marginTop: 4,
  },

  // -- Progress ring --
  progressSection: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 14,
  },
  progressRingOuter: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  ringSvg: {
    position: "absolute",
  },
  progressRingInner: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
  },
  cycleLabel: {
    fontFamily: Fonts.sans.regular,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#8b6914",
    marginBottom: 2,
  },
  dayCount: {
    fontFamily: Fonts.serif.bold,
    fontSize: 22,
    color: "#432104",
    lineHeight: 26,
    maxWidth: 140,
    textAlign: "center",
  },
  lotusWrapper: {
    position: "absolute",
    bottom: -25,
    left: -40,
    right: -40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  lotusLine: {
    flex: 1,
    height: 1.5,
    marginHorizontal: 10,
  },
  lotusGlow: {
    position: "absolute",
    bottom: 100,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 230, 150, 0.25)",
  },
  lotusImage: {
    width: 56,
    height: 56,
    resizeMode: "contain",
  },
  mantralotusImage: {
    marginTop: 500,
    width: 100,
    height: 100,
  },

  // -- Path milestone --
  pathMilestoneSection: {
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  pathMilestoneText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 14,
    color: "#d4a017",
    lineHeight: 21,
    textAlign: "center",
  },

  // -- Reminder / journey summary --
  reminderSection: {
    alignItems: "center",
    marginBottom: 4,
  },
  remainingText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: "#432104",
    textAlign: "center",
  },

  // -- Instruction text --
  instructionSection: {
    alignItems: "center",
    marginBottom: 10,
  },
  instructionText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#432104",
    letterSpacing: 0.5,
    textAlign: "center",
  },

  // -- Prana insight --
  pranaInsightSection: {
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  pranaInsightText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: "#615247",
    lineHeight: 26,
    textAlign: "center",
  },

  // -- Practice cards list --
  practiceList: {
    width: "100%",
    gap: 12,
    marginBottom: 10,
  },

  // -- Quick actions (footer action buttons) --
  quickActions: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
  },
  triggerBtn: {
    width: "70%",
    maxWidth: 360,
    borderRadius: 28,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#b8860b",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    marginTop: 4,
  },
  triggerBtnInner: {
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  triggerBtnText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 17,
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  quickActionHelp: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    lineHeight: 19,
    color: "#6a4d28",
    textAlign: "center",
    paddingHorizontal: 8,
    marginTop: 10,
    marginBottom: 16,
    opacity: 0.78,
  },
  quickCheckinBtn: {
    width: "70%",
    maxWidth: 360,
    height: 40,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: "#c7a64b",
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: "#fdfaf3",
  },
  quickCheckinBtnText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 16,
    color: "#432104",
    letterSpacing: 0.3,
  },

  // -- Sankalp carry-forward --
  carryForwardSection: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: "rgba(212, 160, 23, 0.04)",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "rgba(191, 165, 138, 0.2)",
  },
  carryForwardLabel: {
    fontFamily: Fonts.sans.bold,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#bfa58a",
    marginBottom: 8,
  },
  carryForwardItem: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#615247",
    lineHeight: 20,
    paddingVertical: 4,
    textAlign: "center",
  },

  // -- Vow-carry indicator --
  vowCarryIndicator: {
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  vowCarryText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    color: "#d4a017",
    textAlign: "center",
  },

  // -- Low-burden entry --
  lowBurdenEntry: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  lowBurdenLink: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#8c8881",
  },

  // -- Diamond divider --
  divider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginVertical: 16,
  },
  dividerLineLeft: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(191, 165, 138, 0.3)",
  },
  dividerLineRight: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(191, 165, 138, 0.3)",
  },
  diamond: {
    width: 6,
    height: 6,
    backgroundColor: "#bfa58a",
    transform: [{ rotate: "45deg" }],
    marginHorizontal: 8,
  },

  // -- Reset section --
  resetSection: {
    alignItems: "center",
    paddingVertical: 12,
  },
  resetLink: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#bbb",
    textDecorationLine: "underline",
  },
  resetConfirm: {
    padding: 16,
    backgroundColor: "#fef9ef",
    borderWidth: 1,
    borderColor: "#e8d5a8",
    borderRadius: 8,
    maxWidth: 320,
    width: "100%",
  },
  resetConfirmText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#5a4a2a",
    lineHeight: 21,
    marginBottom: 12,
    textAlign: "center",
  },
  resetConfirmActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  resetConfirmBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#d4a853",
    borderRadius: 6,
  },
  resetConfirmBtnText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 14,
    color: "#FFFFFF",
  },
  resetCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#d4c8a8",
    borderRadius: 6,
  },
  resetCancelBtnText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#8a7a5a",
  },

  // -- Footer links --
  footerLinkWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 16,
  },
});

export default CompanionDashboardContainer;

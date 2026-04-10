import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useScreenStore } from '../engine/useScreenBridge';
import BlockRenderer from '../engine/BlockRenderer';
import Header from '../components/Header';
import { Fonts } from '../theme/fonts';

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
  };
}

interface Props {
  schema: DashboardSchema;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RING_SIZE = 200;
const RING_STROKE = 7;
const RING_RADIUS = 45;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const CompanionDashboardContainer: React.FC<Props> = ({ schema }) => {
  const {
    screenData,
    loadScreen,
    updateScreenData,
  } = useScreenStore();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

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
  const identityLabel = ss.identity_label || '';
  const cycleNumber = Number(ss.path_cycle_number) || 1;
  const pathMilestone = ss.path_milestone || null;
  const streakDisplay = ss.streak_display || '';
  const sankalpHowToLive: string[] = ss.sankalp_how_to_live || [];
  const contextualCta = ss.contextual_cta || null;
  const pranaInsight = ss.prana_ack_insight || '';
  const daysSinceLastPractice = Number(ss.days_since_last_practice) || 0;
  const showReturnBanner = daysSinceLastPractice >= 3;
  const journeyId = ss.journey_id || null;

  // Status message from dashboard_config
  const statusMessage = useMemo(() => {
    const messages = schema.dashboard_config?.status_messages || {};
    if (isDayComplete) return messages.completed || 'Day Completed';
    if (dayNumber === 1) return messages.start || 'Begins Today';
    if (dayNumber === 7 && totalDays >= 7) return messages.milestone || 'Milestone Reached';
    if (dayNumber === totalDays) return messages.near_end || 'Almost There';
    return messages.default || 'Continue Journey';
  }, [isDayComplete, dayNumber, totalDays, schema.dashboard_config]);

  // SVG ring calculations
  const strokeDashoffset = RING_CIRCUMFERENCE - RING_CIRCUMFERENCE * progress;
  const ringStroke = isDayComplete ? '#10b981' : '#bfa58a';

  // Block filtering
  const blocks = schema.blocks || [];
  const practiceBlocks = useMemo(
    () => blocks.filter((b: any) => b.type === 'practice_card'),
    [blocks],
  );
  const footerActionBlocks = useMemo(
    () => blocks.filter((b: any) => b.position === 'footer_actions'),
    [blocks],
  );
  const footerBlocks = useMemo(
    () => blocks.filter((b: any) => b.position === 'footer'),
    [blocks],
  );

  // Has active journey check (same logic as Vue template v-if)
  const hasJourney = !!(ss.scan_focus || ss.mantra_text);

  // Toast for trigger resolution
  useEffect(() => {
    const toast = ss._trigger_resolution_toast;
    if (toast?.message) {
      Alert.alert('', toast.message);
      updateScreenData('_trigger_resolution_toast', null);
    }
  }, [ss._trigger_resolution_toast]);

  // -------------------------------------------------------------------------
  // Reset journey handler
  // -------------------------------------------------------------------------

  const handleReset = () => {
    Alert.alert(
      'Start Over',
      'This will end your current journey. Your progress will be remembered, but you\'ll begin a new path from scratch.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setShowResetConfirm(false) },
        {
          text: 'Yes, start over',
          style: 'destructive',
          onPress: async () => {
            try {
              // The action executor handles the API call + state reset
              const { executeAction } = require('../engine/actionExecutor');
              await executeAction(
                { type: 'reset_journey' },
                { screenData: ss, updateScreenData, loadScreen },
              );
            } catch (err) {
              console.error('[RESET] Failed:', err);
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
        <Header isTransparent />
        <View style={styles.emptyState}>
          <Image
            source={require('../../assets/lotus_icon.png')}
            style={styles.emptyLotus}
          />
          <Text style={styles.emptyHeadline}>Your practice space is ready</Text>
          <Text style={styles.emptySubtext}>
            Begin a guided journey rooted in Sanatan wisdom.{'\n'}
            Choose a focus area that resonates with where you are today.
          </Text>
          <TouchableOpacity
            style={styles.emptyCta}
            activeOpacity={0.85}
            onPress={() =>
              loadScreen({
                container_id: 'choice_stack',
                state_id: 'discipline_select',
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
      <Header isTransparent />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity section */}
        {!!statusMessage && (
          <View style={styles.identitySection}>
            <Text style={styles.identityHeadline}>{statusMessage}</Text>
            {!!ss.identity_guidance && (
              <Text style={styles.identityGuidance}>{ss.identity_guidance}</Text>
            )}
          </View>
        )}

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
                {identityLabel || `Day ${dayNumber}`}
              </Text>
            </View>

            {/* Lotus at bottom of ring */}
            <View style={styles.lotusWrapper}>
              <View style={styles.lotusGlow} />
              <Image
                source={require('../../assets/lotus_icon.png')}
                style={styles.lotusImage}
              />
            </View>
          </View>
        </View>

        {/* Path milestone — 30+ day practitioners, hidden when return banner visible */}
        {!!pathMilestone?.message && !showReturnBanner && (
          <View style={styles.pathMilestoneSection}>
            <Text style={styles.pathMilestoneText}>{pathMilestone.message}</Text>
          </View>
        )}

        {/* Journey summary / remaining */}
        {daysRemaining > 0 && (
          <View style={styles.reminderSection}>
            <Text style={styles.remainingText}>
              {schema.dashboard_config?.journey_summary ||
                `Your ${totalDays}-day practice journey \u2014 ${
                  streakDisplay || `${daysRemaining} sessions remaining`
                }`}
            </Text>
          </View>
        )}

        {/* Instruction text — shown when day is not complete */}
        {!isDayComplete && (
          <View style={styles.instructionSection}>
            <Text style={styles.instructionText}>
              {contextualCta?.label ||
                schema.dashboard_config?.instruction_text ||
                'Tap on any card to start your session.'}
            </Text>
          </View>
        )}

        {/* Prana insight — shown after check-in */}
        {!!pranaInsight && (
          <View style={styles.pranaInsightSection}>
            <Text style={styles.pranaInsightText}>{pranaInsight}</Text>
          </View>
        )}

        {/* Practice cards — rendered via BlockRenderer */}
        <View style={styles.practiceList}>
          {practiceBlocks.map((block: any, i: number) => (
            <BlockRenderer key={block.id || `practice-${i}`} block={block} />
          ))}
        </View>

        {/* Diamond divider */}
        <Divider />

        {/* Additional items section */}
        {!!ss.scan_focus && (
          <BlockRenderer
            block={{
              type: 'additional_items_section',
              items_key: 'additional_items',
              label: 'Additional Practices',
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
          <TouchableOpacity
            style={styles.lowBurdenEntry}
            onPress={() => loadScreen('low_burden_day')}
          >
            <Text style={styles.lowBurdenLink}>What is possible today?</Text>
          </TouchableOpacity>
        )}

        {/* Footer action buttons — rendered via BlockRenderer */}
        <View style={styles.quickActions}>
          {footerActionBlocks.map((block: any, i: number) => (
            <BlockRenderer key={block.id || `action-${i}`} block={block} />
          ))}
        </View>

        {/* Diamond divider */}
        <Divider />

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
                  <Text style={styles.resetConfirmBtnText}>Yes, start over</Text>
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
    backgroundColor: '#FAF9F6',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 50,
  },

  // -- Empty state --
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  emptyLotus: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
    marginBottom: 20,
    opacity: 0.8,
  },
  emptyHeadline: {
    fontFamily: Fonts.serif.bold,
    fontSize: 22,
    color: '#3a3225',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtext: {
    fontFamily: Fonts.serif.regular,
    fontSize: 14,
    color: '#8b7355',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
    maxWidth: 320,
  },
  emptyCta: {
    backgroundColor: '#c9a84c',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 50,
    shadowColor: '#c9a84c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  emptyCtaText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // -- Identity section --
  identitySection: {
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  identityHeadline: {
    fontFamily: Fonts.serif.bold,
    fontSize: 20,
    color: '#432104',
  },
  identityGuidance: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: '#615247',
    marginTop: 2,
  },

  // -- Return banner --
  returnBanner: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#fffdf5',
    borderWidth: 1,
    borderColor: '#f0e6c8',
    borderRadius: 8,
  },
  returnBannerText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 17,
    color: '#5a4a2a',
  },
  returnBannerSub: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: '#8a7a5a',
    marginTop: 4,
  },

  // -- Progress ring --
  progressSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  progressRingOuter: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringSvg: {
    position: 'absolute',
  },
  progressRingInner: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  cycleLabel: {
    fontFamily: Fonts.sans.regular,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#8b6914',
    marginBottom: 2,
  },
  dayCount: {
    fontFamily: Fonts.serif.bold,
    fontSize: 22,
    color: '#432104',
    lineHeight: 26,
    maxWidth: 140,
    textAlign: 'center',
  },
  lotusWrapper: {
    position: 'absolute',
    bottom: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  lotusGlow: {
    position: 'absolute',
    bottom: 0,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 230, 150, 0.25)',
  },
  lotusImage: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
  },

  // -- Path milestone --
  pathMilestoneSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  pathMilestoneText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 14,
    color: '#d4a017',
    lineHeight: 21,
    textAlign: 'center',
  },

  // -- Reminder / journey summary --
  reminderSection: {
    alignItems: 'center',
    marginBottom: 4,
  },
  remainingText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: '#432104',
    textAlign: 'center',
  },

  // -- Instruction text --
  instructionSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  instructionText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: '#432104',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // -- Prana insight --
  pranaInsightSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  pranaInsightText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: '#615247',
    lineHeight: 26,
    textAlign: 'center',
  },

  // -- Practice cards list --
  practiceList: {
    width: '100%',
    gap: 12,
    marginBottom: 10,
  },

  // -- Quick actions (footer action buttons) --
  quickActions: {
    width: '100%',
  },

  // -- Sankalp carry-forward --
  carryForwardSection: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: 'rgba(212, 160, 23, 0.04)',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(191, 165, 138, 0.2)',
  },
  carryForwardLabel: {
    fontFamily: Fonts.sans.bold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#bfa58a',
    marginBottom: 8,
  },
  carryForwardItem: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: '#615247',
    lineHeight: 20,
    paddingVertical: 4,
    textAlign: 'center',
  },

  // -- Vow-carry indicator --
  vowCarryIndicator: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  vowCarryText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    color: '#d4a017',
    textAlign: 'center',
  },

  // -- Low-burden entry --
  lowBurdenEntry: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  lowBurdenLink: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: '#8c8881',
  },

  // -- Diamond divider --
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 16,
  },
  dividerLineLeft: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(191, 165, 138, 0.3)',
  },
  dividerLineRight: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(191, 165, 138, 0.3)',
  },
  diamond: {
    width: 6,
    height: 6,
    backgroundColor: '#bfa58a',
    transform: [{ rotate: '45deg' }],
    marginHorizontal: 8,
  },

  // -- Reset section --
  resetSection: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  resetLink: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: '#bbb',
    textDecorationLine: 'underline',
  },
  resetConfirm: {
    padding: 16,
    backgroundColor: '#fef9ef',
    borderWidth: 1,
    borderColor: '#e8d5a8',
    borderRadius: 8,
    maxWidth: 320,
    width: '100%',
  },
  resetConfirmText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: '#5a4a2a',
    lineHeight: 21,
    marginBottom: 12,
    textAlign: 'center',
  },
  resetConfirmActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  resetConfirmBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#d4a853',
    borderRadius: 6,
  },
  resetConfirmBtnText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  resetCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d4c8a8',
    borderRadius: 6,
  },
  resetCancelBtnText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: '#8a7a5a',
  },

  // -- Footer links --
  footerLinkWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 16,
  },
});

export default CompanionDashboardContainer;

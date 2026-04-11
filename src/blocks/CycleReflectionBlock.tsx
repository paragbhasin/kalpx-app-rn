/**
 * CycleReflectionBlock — Day 7 / Day 14 checkpoint primary block.
 *
 * Mirrors the web multi-stage flow in
 * ~/kalpx-frontend/src/blocks/CycleReflectionBlock.vue:
 *
 *   Stage 1: INTRO splash — static day-specific copy + "Reflect" CTA
 *   Stage 2: CONTINUITY MIRROR — live metrics from API, per-day bar chart,
 *            strongest-area badge, Mitra message, "Continue" CTA
 *   Stage 3: DECISION — recommendation-driven buttons:
 *            day 7: auto-routed (continue / lighten / reset)
 *            day 14: user chooses Continue Same / Deepen / Change Focus
 *
 * All metrics bind to checkpoint_* fields that are populated by
 * mitraCheckpoint() via the ensure_checkpoint_data action. The block
 * auto-fetches on mount if the data is missing.
 *
 * Reference screenshots: ~/kalpx-frontend/tests/e2e/screenshots/matrix/
 *   CP7.E.01 (intro), CP7.E.03 (mirror), CP7.E.06 (results-continue)
 *   CP7.N.03 (lightened), CP14.E.01/03/06 (day 14 variants)
 */
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useScreenStore } from '../engine/useScreenBridge';
import { cleanupFlowState } from '../engine/cleanupFields';
import { executeAction } from '../engine/actionExecutor';
import { mitraCheckpoint } from '../engine/mitraApi';
import store from '../store';
import {
  goBackWithData,
  loadScreenWithData,
  screenActions,
} from '../store/screenSlice';
import { Fonts } from '../theme/fonts';

import LotusDay7 from '../../assets/7days_lotus.svg';
import LotusDay14 from '../../assets/14_day_lotus.svg';

const BG_DAY7 = require('../../assets/7day_screen.png');
const BG_DAY14 = require('../../assets/14_day_bg.jpg');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Stage {
  INTRO: 'intro';
  MIRROR: 'mirror';
  DECISION: 'decision';
}
type StageName = 'intro' | 'grid' | 'mirror' | 'decision';

interface DecisionAction {
  id: string;
  label: string;
  description: string;
  target: { containerId: string; stateId: string };
  primary?: boolean;
}

interface CycleReflectionBlockProps {
  block?: any;
}

// ---------------------------------------------------------------------------
// Copy per day + engagement level (matches web reference)
// ---------------------------------------------------------------------------

const INTRO_COPY: Record<number, { title: string; subtitle: string; subtitleSmall: string; arcLabel: string; description: string; cta: string }> = {
  7: {
    title: 'A Week Into Your Journey',
    subtitle: 'A week ago, you began this journey with a simple intention.',
    subtitleSmall:
      'Through Sankalp \u2022 Mantra \u2022 Practice, you have taken the first step inward.',
    arcLabel: 'The first steps on your path',
    description:
      'Every journey begins quietly. Let\u2019s pause for a moment and see what has begun within you.',
    cta: 'Reflect on My Journey',
  },
  14: {
    title: 'You\u2019ve completed 14 days',
    subtitle: 'You stayed with it.',
    subtitleSmall:
      'Even on the days it felt quiet or uncertain, you kept returning.',
    arcLabel: 'Two weeks of returning to yourself',
    description:
      'Something within you has begun to shift. It will continue, gently.',
    cta: 'Reflect on My Journey',
  },
};

// ---------------------------------------------------------------------------
// Decision generator — pure function mapping recommendation to action buttons
// ---------------------------------------------------------------------------

function buildDecisions(
  day: number,
  recAction: string,
  feeling: string,
): DecisionAction[] {
  if (day === 14) {
    const base: DecisionAction[] = [
      {
        id: 'continue_same',
        label: 'Continue Same',
        description:
          'Another cycle on the same path. Consistency becomes resonance.',
        target: {
          containerId: 'companion_dashboard',
          stateId: 'day_active',
        },
        primary: recAction === 'continue_same',
      },
      {
        id: 'deepen',
        label: 'Deepen',
        description:
          'Add one deeper item while staying on the same path.',
        target: {
          containerId: 'companion_dashboard',
          stateId: 'day_active',
        },
        primary: recAction === 'deepen',
      },
      {
        id: 'change_focus',
        label: 'Change Focus',
        description:
          'Carry this steadiness to a new area of your life.',
        target: {
          containerId: 'choice_stack',
          stateId: 'discipline_select',
        },
        primary: recAction === 'change_focus',
      },
    ];
    return base;
  }

  // Day 7 options are surfaced from backend via checkpoint_options
  // (web parity: actionExecutor.js:284-298 Day 7 labelMap).
  if (recAction === 'lighten') {
    return [
      {
        id: 'lighten',
        label: 'Lighten My Path',
        description:
          'Your path has been lightened. One sacred step each day is enough.',
        target: { containerId: 'companion_dashboard', stateId: 'day_active' },
        primary: true,
      },
      {
        id: 'reset',
        label: 'Start Fresh',
        description:
          'Begin a new path with a different focus.',
        target: { containerId: 'choice_stack', stateId: 'discipline_select' },
      },
    ];
  }

  return [
    {
      id: 'continue',
      label: 'Continue',
      description:
        'Your path continues. The rhythm is taking hold.',
      target: { containerId: 'companion_dashboard', stateId: 'day_active' },
      primary: true,
    },
  ];
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface BarChartProps {
  engaged: boolean[];
  fullyCompleted: boolean[];
  labels: string[];
}

const EngagementBarChart: React.FC<BarChartProps> = ({
  engaged,
  fullyCompleted,
  labels,
}) => {
  const days = Math.max(engaged.length, labels.length);
  return (
    <View style={barStyles.chart}>
      <View style={barStyles.legend}>
        <View style={barStyles.legendRow}>
          <View
            style={[barStyles.legendSwatch, { backgroundColor: '#2d7a5f' }]}
          />
          <Text style={barStyles.legendLabel}>Fully completed</Text>
        </View>
        <View style={barStyles.legendRow}>
          <View
            style={[barStyles.legendSwatch, { backgroundColor: '#d9a557' }]}
          />
          <Text style={barStyles.legendLabel}>Engaged</Text>
        </View>
      </View>
      <View style={barStyles.bars}>
        {Array.from({ length: days }).map((_, i) => {
          const isFull = fullyCompleted[i];
          const isEngaged = engaged[i];
          const bg = isFull
            ? '#2d7a5f'
            : isEngaged
              ? '#d9a557'
              : 'rgba(201, 168, 76, 0.15)';
          const height = isFull ? 54 : isEngaged ? 40 : 10;
          return (
            <View key={i} style={barStyles.barCol}>
              <View
                style={[barStyles.bar, { height, backgroundColor: bg }]}
              />
              <Text style={barStyles.barLabel}>{labels[i] || i + 1}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const CycleReflectionBlock: React.FC<CycleReflectionBlockProps> = () => {
  const screenData = useScreenStore((s) => s.screenData);

  const [stage, setStage] = useState<StageName>('intro');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- State-writer helpers ---
  const writeState = (value: any, key: string) => {
    store.dispatch(screenActions.setScreenValue({ key, value }));
  };
  const nav = (target: any) => {
    const containerId = target?.container_id || target?.containerId || 'generic';
    const stateId = target?.state_id || target?.stateId || target || '';
    store.dispatch(loadScreenWithData({ containerId, stateId }));
  };
  const back = () => store.dispatch(goBackWithData());

  // --- API-bound values ---
  const day: number = screenData.checkpoint_day || screenData.day_number || 7;
  const is14 = day === 14;
  const intro = INTRO_COPY[is14 ? 14 : 7];

  const daysEngaged = screenData.checkpoint_days_engaged ?? 0;
  const daysFullyCompleted = screenData.checkpoint_days_fully_completed ?? 0;
  const totalDays = screenData.checkpoint_total_days || day;
  const engagementLevel =
    screenData.checkpoint_engagement_level || 'near_zero';
  const strongestArea = screenData.strongest_area || '';
  const recAction = screenData.checkpoint_recommendation || '';
  const observation = screenData.milestone_reflection || '';
  const mitraMessage = screenData.checkpoint_subtext || '';
  const trendGraph: { engaged?: boolean[]; fullyCompleted?: boolean[]; labels?: string[] } =
    screenData.checkpoint_trend_graph || {};
  const engagedArr: boolean[] = trendGraph.engaged || [];
  const fullArr: boolean[] = trendGraph.fullyCompleted || [];
  const labelsArr: string[] =
    trendGraph.labels && trendGraph.labels.length
      ? trendGraph.labels.map((l: string) => l.replace('Day ', ''))
      : Array.from({ length: totalDays }, (_, i) => String(i + 1));

  // --- Fetch checkpoint data on mount ---
  useEffect(() => {
    if (!screenData.checkpoint_original_data && !loading) {
      setLoading(true);
      mitraCheckpoint(screenData, day)
        .then((data: any) => {
          if (!data) return;
          writeState(data.headline, 'checkpoint_headline');
          writeState(data.subtext, 'checkpoint_subtext');
          writeState(data.question, 'checkpoint_question');
          writeState(data.options || [], 'checkpoint_options');
          writeState(data.metrics || {}, 'checkpoint_metrics');
          writeState(data.originalData || null, 'checkpoint_original_data');
          writeState(data.day || day, 'checkpoint_day');
          writeState(data.type || '', 'checkpoint_type');
          writeState(data.engagementLevel || '', 'checkpoint_engagement_level');
          writeState(data.trendGraph || {}, 'checkpoint_trend_graph');
          writeState(data.strongestArea || '', 'strongest_area');
          writeState(data.observation || '', 'milestone_reflection');
          writeState(data.daysEngaged || 0, 'checkpoint_days_engaged');
          writeState(
            data.daysFullyCompleted || 0,
            'checkpoint_days_fully_completed',
          );
          writeState(data.totalDays || day, 'checkpoint_total_days');
          writeState(
            data.recommendationAction || '',
            'checkpoint_recommendation',
          );
          writeState(
            data.deepenSuggestion || null,
            'checkpoint_deepen_suggestion',
          );
        })
        .catch((err: any) => {
          console.warn('[CYCLE_REFLECTION] fetch failed:', err?.message);
        })
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day]);

  // --- Stage navigation ---
  const goToGrid = () => setStage('grid');
  const goToMirror = () => setStage('mirror');
  const goToDecision = () => setStage('decision');

  const handleDecision = async (action: DecisionAction) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // Persist the decision and fire the checkpoint_submit action
      writeState(action.id, 'checkpoint_decision');
      writeState(true, 'checkpoint_completed');
      writeState(action.id, 'checkpoint_completed_decision');

      await executeAction(
        { type: 'checkpoint_submit' },
        {
          screenState: store.getState().screen.screenData,
          setScreenValue: writeState,
          loadScreen: nav,
          goBack: back,
        },
      );

      // Cleanup flow-local state (contract Rule 4)
      cleanupFlowState('checkpoint', writeState);
      store.dispatch(loadScreenWithData(action.target));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color={GOLD} />
      </View>
    );
  }

  // -------------------------------------------------------------------------
  // Stage 1: INTRO
  // -------------------------------------------------------------------------
  if (stage === 'intro') {
    return (
      <ImageBackground
        source={is14 ? BG_DAY14 : BG_DAY7}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.bgOverlay} />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.introContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.lotusWrap}>
            {is14 ? (
              <LotusDay14 width={140} height={140} />
            ) : (
              <LotusDay7 width={140} height={140} />
            )}
          </View>

          <Text style={styles.title}>{intro.title}</Text>
          <Text style={styles.subtitle}>{intro.subtitle}</Text>
          <Text style={styles.subtitleSmall}>{intro.subtitleSmall}</Text>

          <View style={styles.arcSpacer}>
            <Text style={styles.arcLabel}>{intro.arcLabel}</Text>
          </View>

          <Text style={styles.bottomDescription}>{intro.description}</Text>

          <View style={styles.ctaWrap}>
            <GoldButton label={intro.cta} onPress={goToGrid} />
          </View>
        </ScrollView>
      </ImageBackground>
    );
  }

  // -------------------------------------------------------------------------
  // Stage 2: JOURNEY GRID — per-day engagement circles (web "journey_progress_screen")
  // Mirrors kalpx-frontend/src/blocks/CycleReflectionBlock.vue:596-706
  // -------------------------------------------------------------------------
  if (stage === 'grid') {
    const currentDay = screenData.day_number || day;
    const maxVisible = totalDays;
    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.gridTitle}>Your {maxVisible}-Day Journey</Text>
        <Text style={styles.gridSubtitle}>Tap a day to see your progress</Text>

        <View style={styles.gridLotusWrap}>
          {is14 ? (
            <LotusDay14 width={72} height={72} />
          ) : (
            <LotusDay7 width={72} height={72} />
          )}
        </View>

        {/* Day circles */}
        <View style={styles.dayGrid}>
          {Array.from({ length: maxVisible }).map((_, i) => {
            const dayNum = i + 1;
            const isCurrent = dayNum === currentDay;
            const isEngaged = engagedArr[i] === true;
            const isFully = fullArr[i] === true;
            const isLocked = dayNum > currentDay;
            return (
              <View
                key={dayNum}
                style={[
                  styles.dayCircle,
                  isEngaged && styles.dayCircleEngaged,
                  isFully && styles.dayCircleFull,
                  isCurrent && styles.dayCircleCurrent,
                  isLocked && styles.dayCircleLocked,
                ]}
              >
                <Text
                  style={[
                    styles.dayCircleText,
                    (isFully || isCurrent) && styles.dayCircleTextBright,
                  ]}
                >
                  {dayNum}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.gridLegend}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: '#2d7a5f' },
              ]}
            />
            <Text style={styles.legendText}>Fully completed</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: '#d9a557' },
              ]}
            />
            <Text style={styles.legendText}>Engaged</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                {
                  borderWidth: 1.5,
                  borderColor: GOLD_DARK,
                  backgroundColor: 'transparent',
                },
              ]}
            />
            <Text style={styles.legendText}>Today</Text>
          </View>
        </View>

        {/* Progress summary */}
        <View style={styles.progressSummary}>
          <Text style={styles.progressLabel}>Overall Progress</Text>
          <View style={styles.progressBarOuter}>
            <View
              style={[
                styles.progressBarInner,
                {
                  width: `${(daysEngaged / totalDays) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressCount}>
            {daysEngaged} of {totalDays} Days
          </Text>
        </View>

        <Text style={styles.gridQuote}>
          {daysEngaged >= totalDays - 1
            ? 'Keep moving forward.'
            : daysEngaged > 0
              ? 'Every return deepens the path.'
              : 'Your journey begins with a single breath.'}
        </Text>

        <View style={styles.ctaWrap}>
          <GoldButton label="Continue" onPress={goToMirror} />
          <TouchableOpacity
            style={styles.skipLink}
            onPress={goToMirror}
          >
            <Text style={styles.skipLinkText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // -------------------------------------------------------------------------
  // Stage 3: CONTINUITY MIRROR
  // -------------------------------------------------------------------------
  if (stage === 'mirror') {
    const tagLabel =
      is14 ? `DAY ${day} \u2022 EVOLUTION PIVOT` : `DAY ${day} \u2022 CONTINUITY MIRROR`;
    const mirrorTitle = is14 ? '14-Day Progress Graph' : '7-Day Continuity Mirror';
    const strongestLabel = strongestArea
      ? strongestArea.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : '';
    const anchorLine = strongestLabel
      ? `Your ${strongestLabel.toLowerCase()} practice has been the steadiest anchor this cycle.`
      : '';

    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.mirrorContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.tag}>{tagLabel}</Text>
        <Text style={[styles.title, { marginBottom: 24 }]}>Day {day}</Text>

        {/* Engagement chips */}
        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Text style={styles.chipValue}>
              {daysEngaged}/{totalDays}
            </Text>
            <Text style={styles.chipLabel}>Days Engaged</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipValue}>
              {daysFullyCompleted}/{totalDays}
            </Text>
            <Text style={styles.chipLabel}>Fully Completed</Text>
          </View>
        </View>

        {/* Bar chart card */}
        <View style={styles.mirrorCard}>
          <Text style={styles.mirrorTitle}>{mirrorTitle}</Text>
          <EngagementBarChart
            engaged={engagedArr}
            fullyCompleted={fullArr}
            labels={labelsArr}
          />
        </View>

        {/* Strongest area badge + anchor line */}
        {Boolean(strongestLabel) && (
          <View style={styles.strongestCard}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                Strongest area: {strongestLabel}
              </Text>
            </View>
            <Text style={styles.anchorLine}>{anchorLine}</Text>
          </View>
        )}

        {/* Mitra message / observation */}
        {Boolean(mitraMessage || observation) && (
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>{mitraMessage || observation}</Text>
          </View>
        )}

        <View style={styles.ctaWrap}>
          <GoldButton
            label={is14 ? 'Continue to Choices' : 'Continue'}
            onPress={goToDecision}
          />
        </View>
      </ScrollView>
    );
  }

  // -------------------------------------------------------------------------
  // Stage 3: DECISION
  // -------------------------------------------------------------------------
  const decisions = buildDecisions(day, recAction, engagementLevel);
  const decisionTitle =
    is14 ? 'Choose Your Next Step' : recAction === 'lighten' ? 'Your path has been lightened' : 'Your path continues';
  const decisionSubtitle = is14
    ? 'You have walked 14 days with steadiness. You may now choose to continue, deepen, or shift.'
    : recAction === 'lighten'
      ? 'One sacred step each day is enough. Sometimes less is the truest form of devotion.'
      : mitraMessage || 'The rhythm is taking hold. Continue with the same steadiness.';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.decisionContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.lotusWrap}>
        {is14 ? (
          <LotusDay14 width={140} height={140} />
        ) : (
          <LotusDay7 width={140} height={140} />
        )}
      </View>

      <Text style={styles.tag}>{is14 ? 'DAY 14' : 'DAY 7'}</Text>
      <Text style={styles.title}>{decisionTitle}</Text>
      <Text style={styles.decisionSubtitle}>{decisionSubtitle}</Text>

      <View style={styles.decisionList}>
        {decisions.map((d, idx) => (
          <View key={d.id} style={{ width: '100%' }}>
            {idx > 0 && !d.primary && (
              <Text style={styles.orDivider}>{'\u2014 OR \u2014'}</Text>
            )}
            <GoldButton
              label={d.label}
              onPress={() => handleDecision(d)}
              disabled={submitting}
              variant={d.primary ? 'primary' : 'outline'}
            />
            <Text style={styles.decisionDescription}>{d.description}</Text>
          </View>
        ))}
      </View>

      {decisions.length > 1 && (
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => setStage('mirror')}
        >
          <Text style={styles.backLinkText}>{'\u2190 Back to Reflection'}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

// ---------------------------------------------------------------------------
// GoldButton sub-component
// ---------------------------------------------------------------------------

interface GoldButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
}

const GoldButton: React.FC<GoldButtonProps> = ({
  label,
  onPress,
  disabled,
  variant = 'primary',
}) => {
  if (variant === 'outline') {
    return (
      <TouchableOpacity
        style={[btn.outlineBtn, disabled && btn.disabled]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.9}
      >
        <Text style={btn.outlineText}>{label}</Text>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      style={[btn.primaryBtn, disabled && btn.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.92}
    >
      <LinearGradient
        colors={['#e8c060', '#d9a557']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={btn.primaryInner}
      >
        <Text style={btn.primaryText}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const GOLD = '#d9a557';
const GOLD_DARK = '#c7a64b';
const DARK = '#432104';
const CREAM = '#fffdf8';

const styles = StyleSheet.create({
  bg: { flex: 1, width: '100%', minHeight: 700 },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 253, 248, 0.72)',
  },
  scroll: { flex: 1 },
  introContent: {
    paddingTop: 50,
    paddingBottom: 80,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  mirrorContent: {
    paddingTop: 30,
    paddingBottom: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: CREAM,
  },
  gridContent: {
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#f7efd9',
  },
  gridTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 26,
    color: DARK,
    textAlign: 'center',
    marginBottom: 6,
  },
  gridSubtitle: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: '#8c7355',
    textAlign: 'center',
    marginBottom: 16,
  },
  gridLotusWrap: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 20,
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    maxWidth: 360,
    marginBottom: 20,
  },
  dayCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: 'rgba(201, 168, 76, 0.3)',
    backgroundColor: 'rgba(253, 251, 247, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleEngaged: {
    backgroundColor: '#d9a557',
    borderColor: GOLD_DARK,
  },
  dayCircleFull: {
    backgroundColor: '#2d7a5f',
    borderColor: '#2d7a5f',
  },
  dayCircleCurrent: {
    borderWidth: 2.5,
    borderColor: GOLD_DARK,
    shadowColor: GOLD,
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  dayCircleLocked: {
    opacity: 0.5,
  },
  dayCircleText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 15,
    color: DARK,
  },
  dayCircleTextBright: {
    color: '#ffffff',
  },
  gridLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 11,
    color: DARK,
  },
  progressSummary: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 14,
    alignItems: 'center',
  },
  progressLabel: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 12,
    color: '#8c7355',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  progressBarOuter: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(201, 168, 76, 0.2)',
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarInner: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 4,
  },
  progressCount: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 13,
    color: DARK,
  },
  gridQuote: {
    fontFamily: Fonts.serif.regular,
    fontSize: 14,
    fontStyle: 'italic',
    color: DARK,
    opacity: 0.8,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  skipLink: {
    marginTop: 14,
    paddingVertical: 6,
  },
  skipLinkText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: '#8c7355',
    textDecorationLine: 'underline',
  },
  decisionContent: {
    paddingTop: 30,
    paddingBottom: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: CREAM,
  },
  loadingBox: {
    paddingVertical: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CREAM,
  },
  lotusWrap: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  tag: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 11,
    color: GOLD_DARK,
    letterSpacing: 2.5,
    marginBottom: 8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  title: {
    fontFamily: Fonts.serif.bold,
    fontSize: 26,
    color: DARK,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontFamily: Fonts.serif.regular,
    fontSize: 17,
    color: DARK,
    textAlign: 'center',
    lineHeight: 25,
    marginBottom: 6,
    opacity: 0.92,
    paddingHorizontal: 14,
  },
  subtitleSmall: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    color: DARK,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.82,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  arcSpacer: {
    marginTop: 22,
    marginBottom: 22,
    alignItems: 'center',
  },
  arcLabel: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    fontStyle: 'italic',
    color: DARK,
    opacity: 0.75,
    textAlign: 'center',
  },
  bottomDescription: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: DARK,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 28,
  },

  // Mirror stage
  chipRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
  },
  chip: {
    borderWidth: 0.5,
    borderColor: GOLD_DARK,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: '#f7efd9',
    alignItems: 'center',
    minWidth: 130,
  },
  chipValue: {
    fontFamily: Fonts.serif.bold,
    fontSize: 22,
    color: DARK,
  },
  chipLabel: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 11,
    color: '#8c7355',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  mirrorCard: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 0.5,
    borderColor: GOLD_DARK,
    borderRadius: 20,
    padding: 18,
    backgroundColor: '#ffffff',
    marginBottom: 18,
  },
  mirrorTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 16,
    color: DARK,
    textAlign: 'center',
    marginBottom: 14,
  },
  strongestCard: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#2d7a5f',
    marginBottom: 10,
  },
  badgeText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 12,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  anchorLine: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    color: DARK,
    textAlign: 'center',
    paddingHorizontal: 16,
    opacity: 0.85,
    lineHeight: 22,
  },
  messageCard: {
    width: '100%',
    maxWidth: 400,
    padding: 14,
    marginBottom: 18,
  },
  messageText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: DARK,
    textAlign: 'center',
    opacity: 0.88,
    lineHeight: 25,
    fontStyle: 'italic',
  },

  // Decision stage
  decisionSubtitle: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: DARK,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.85,
    paddingHorizontal: 14,
    marginBottom: 24,
  },
  decisionList: {
    width: '100%',
    maxWidth: 400,
    gap: 6,
  },
  decisionDescription: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: DARK,
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: 14,
    marginTop: 6,
    marginBottom: 12,
  },
  orDivider: {
    fontFamily: Fonts.serif.bold,
    fontSize: 13,
    color: '#bfa58a',
    letterSpacing: 2,
    textAlign: 'center',
    marginVertical: 10,
  },
  backLink: {
    marginTop: 16,
    paddingVertical: 8,
  },
  backLinkText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    color: GOLD_DARK,
    textAlign: 'center',
  },

  ctaWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
});

const btn = StyleSheet.create({
  primaryBtn: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#b8860b',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  primaryInner: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  primaryText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 18,
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  outlineBtn: {
    width: '100%',
    maxWidth: 320,
    height: 58,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: GOLD_DARK,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fdfaf3',
  },
  outlineText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 17,
    color: DARK,
  },
  disabled: {
    opacity: 0.4,
  },
});

const barStyles = StyleSheet.create({
  chart: {
    width: '100%',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    marginBottom: 10,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendLabel: {
    fontFamily: Fonts.sans.regular,
    fontSize: 11,
    color: '#6a4d28',
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 76,
    paddingTop: 6,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    width: 14,
    borderRadius: 4,
  },
  barLabel: {
    fontFamily: Fonts.sans.regular,
    fontSize: 10,
    color: '#6a4d28',
    marginTop: 4,
  },
});

export default CycleReflectionBlock;

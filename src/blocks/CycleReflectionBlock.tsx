/**
 * CycleReflectionBlock — Day 7 / Day 14 checkpoint primary block.
 *
 * Visual structure mirrors the web (~/kalpx-frontend/src/blocks/CycleReflectionBlock.vue):
 *   - Background image (7day_screen / 14_day_bg)
 *   - Lotus header
 *   - Cormorant Garamond serif headline + subtitles
 *   - Metrics chip grid
 *   - 4-feeling picker
 *   - Optional reflection textarea
 *   - Gold-gradient pill CTA (matches .share-btn)
 *
 * Fetches checkpoint data on mount via mitraCheckpoint, submits via the
 * checkpoint_submit action.
 */
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useScreenStore } from '../engine/useScreenBridge';
import { executeAction } from '../engine/actionExecutor';
import { mitraCheckpoint } from '../engine/mitraApi';
import store from '../store';
import {
  goBackWithData,
  loadScreenWithData,
  screenActions,
} from '../store/screenSlice';
import { Fonts } from '../theme/fonts';

interface FeelingOption {
  id: string;
  label: string;
}

interface CycleReflectionBlockProps {
  block: {
    data_key?: string;
    description_options?: FeelingOption[];
    style?: any;
  };
}

const DEFAULT_FEELINGS: FeelingOption[] = [
  { id: 'strong', label: 'I feel more steady' },
  { id: 'slight', label: 'I feel some shift' },
  { id: 'same', label: 'I am still finding my way' },
  { id: 'worse', label: 'I still feel heaviness' },
];

import LotusDay7 from '../../assets/7days_lotus.svg';
import LotusDay14 from '../../assets/14_day_lotus.svg';

const BG_DAY7 = require('../../assets/7day_screen.png');
const BG_DAY14 = require('../../assets/14_day_bg.jpg');

const CycleReflectionBlock: React.FC<CycleReflectionBlockProps> = ({ block }) => {
  const screenData = useScreenStore((s) => s.screenData);

  const writeState = (value: any, key: string) => {
    store.dispatch(screenActions.setScreenValue({ key, value }));
  };
  const nav = (target: any) => {
    const containerId = target?.container_id || target?.containerId || 'generic';
    const stateId = target?.state_id || target?.stateId || target || '';
    store.dispatch(loadScreenWithData({ containerId, stateId }));
  };
  const back = () => store.dispatch(goBackWithData());

  const [loading, setLoading] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(
    screenData.checkpoint_feeling || null,
  );
  const [reflection, setReflection] = useState<string>(
    screenData.checkpoint_user_reflection || '',
  );
  const [submitting, setSubmitting] = useState(false);

  const feelings = block.description_options || DEFAULT_FEELINGS;
  const day = screenData.checkpoint_day || screenData.day_number || 7;
  const is14 = day === 14;
  const headline = is14
    ? 'You\u2019ve completed 14 days'
    : 'A Week Into Your Journey';
  const subtitle = is14
    ? 'Two weeks ago, you stepped onto this path with intention.'
    : 'A week ago, you began this journey with a simple intention.';
  const subtitleSmall = is14
    ? 'Through Sankalp \u2022 Mantra \u2022 Practice, you have cultivated steadiness.'
    : 'Through Sankalp \u2022 Mantra \u2022 Practice, you have taken the first step inward.';
  const bottomDescription = is14
    ? 'Two weeks of returning. Let\u2019s pause and see how this practice has shaped you.'
    : 'Every journey begins quietly. Let\u2019s pause for a moment and see what has begun within you.';

  const daysEngaged = screenData.checkpoint_days_engaged || 0;
  const daysFully = screenData.checkpoint_days_fully_completed || 0;
  const totalDays = screenData.checkpoint_total_days || day;
  const strongestArea = screenData.strongest_area || '';

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

  const handleFeelingSelect = (id: string) => {
    setSelectedFeeling(id);
    writeState(id, 'checkpoint_feeling');
    writeState(id, 'checkpoint_feeling_simple');
  };

  const handleReflectionChange = (text: string) => {
    setReflection(text);
    writeState(text, 'checkpoint_user_reflection');
  };

  const handleSubmit = async () => {
    if (!selectedFeeling || submitting) return;
    setSubmitting(true);
    try {
      await executeAction(
        { type: 'checkpoint_submit' },
        {
          screenState: store.getState().screen.screenData,
          setScreenValue: writeState,
          loadScreen: nav,
          goBack: back,
        },
      );
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

  return (
    <ImageBackground
      source={is14 ? BG_DAY14 : BG_DAY7}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.bgOverlay} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Lotus header */}
        <View style={styles.lotusWrap}>
          {is14 ? (
            <LotusDay14 width={140} height={140} />
          ) : (
            <LotusDay7 width={140} height={140} />
          )}
        </View>

        {/* Title group */}
        <Text style={styles.title}>{headline}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.subtitleSmall}>{subtitleSmall}</Text>

        {/* Decorative arc label */}
        <View style={styles.arcSpacer}>
          <Text style={styles.arcLabel}>
            {is14
              ? 'Two weeks of returning to yourself'
              : 'The first steps on your path'}
          </Text>
        </View>

        {/* Metrics card */}
        <View style={styles.metricsCard}>
          <View style={styles.metricsRow}>
            <View style={styles.metricChip}>
              <Text style={styles.metricValue}>
                {daysEngaged}/{totalDays}
              </Text>
              <Text style={styles.metricLabel}>Days engaged</Text>
            </View>
            <View style={styles.metricChip}>
              <Text style={styles.metricValue}>{daysFully}</Text>
              <Text style={styles.metricLabel}>Fully completed</Text>
            </View>
            {strongestArea ? (
              <View style={styles.metricChip}>
                <Text style={[styles.metricValue, { fontSize: 14 }]}>
                  {formatArea(strongestArea)}
                </Text>
                <Text style={styles.metricLabel}>Strongest</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Reflection prompt */}
        <Text style={styles.question}>How has your practice felt?</Text>

        <View style={styles.feelingList}>
          {feelings.map((feeling) => {
            const isSelected = selectedFeeling === feeling.id;
            return (
              <TouchableOpacity
                key={feeling.id}
                style={[styles.feelingOption, isSelected && styles.feelingSelected]}
                onPress={() => handleFeelingSelect(feeling.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
                <Text
                  style={[
                    styles.feelingLabel,
                    isSelected && styles.feelingLabelSelected,
                  ]}
                >
                  {feeling.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Optional reflection textarea */}
        <Text style={styles.reflectionLabel}>
          IS THERE ANYTHING ELSE YOU WANT TO NOTE?
        </Text>
        <TextInput
          style={styles.textarea}
          multiline
          numberOfLines={4}
          placeholder={'Optional \u2014 a word or sentence\u2026'}
          placeholderTextColor="rgba(67, 33, 4, 0.4)"
          value={reflection}
          onChangeText={handleReflectionChange}
        />

        <Text style={styles.bottomDescription}>{bottomDescription}</Text>

        {/* CTA — gold gradient pill (matches .share-btn) */}
        <View style={styles.ctaWrap}>
          <TouchableOpacity
            style={[
              styles.shareBtn,
              (!selectedFeeling || submitting) && styles.shareBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!selectedFeeling || submitting}
            activeOpacity={0.92}
          >
            <LinearGradient
              colors={['#e8c060', '#d9a557']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.shareBtnInner}
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.shareBtnText}>{'Continue \u2192'}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

function formatArea(area: string): string {
  if (!area) return '';
  return area.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const GOLD = '#d9a557';
const GOLD_DARK = '#c7a64b';
const DARK = '#432104';

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: '100%',
    minHeight: 700,
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 253, 248, 0.75)',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: 40,
    paddingBottom: 80,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  loadingBox: {
    paddingVertical: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lotusWrap: {
    width: 140,
    height: 140,
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  title: {
    fontFamily: Fonts.serif.bold,
    fontSize: 26,
    color: DARK,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontFamily: Fonts.serif.regular,
    fontSize: 17,
    color: DARK,
    textAlign: 'center',
    lineHeight: 25,
    marginBottom: 6,
    opacity: 0.9,
    paddingHorizontal: 16,
  },
  subtitleSmall: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    color: DARK,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  arcSpacer: {
    marginTop: 16,
    marginBottom: 18,
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
  metricsCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 253, 249, 0.92)',
    borderWidth: 0.5,
    borderColor: GOLD_DARK,
    borderRadius: 20,
    padding: 16,
    marginVertical: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  metricChip: {
    flexGrow: 1,
    minWidth: '28%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#f5efe2',
    borderRadius: 14,
    gap: 4,
  },
  metricValue: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: DARK,
    textAlign: 'center',
  },
  metricLabel: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 10,
    color: '#8c7355',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  question: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: DARK,
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 12,
  },
  feelingList: {
    width: '100%',
    maxWidth: 400,
    gap: 10,
    marginBottom: 18,
  },
  feelingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: GOLD_DARK,
    backgroundColor: 'rgba(253, 251, 247, 0.88)',
    gap: 14,
  },
  feelingSelected: {
    borderWidth: 1.5,
    borderColor: GOLD,
    backgroundColor: '#faecd5',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: GOLD_DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: GOLD,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: GOLD,
  },
  feelingLabel: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: DARK,
    flex: 1,
  },
  feelingLabelSelected: {
    fontFamily: Fonts.serif.bold,
  },
  reflectionLabel: {
    width: '100%',
    maxWidth: 400,
    fontFamily: Fonts.sans.semiBold,
    fontSize: 11,
    color: '#8c7355',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  textarea: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 0.5,
    borderColor: GOLD_DARK,
    borderRadius: 16,
    padding: 14,
    minHeight: 84,
    fontSize: 15,
    color: DARK,
    fontFamily: Fonts.serif.regular,
    backgroundColor: 'rgba(255, 253, 249, 0.85)',
    textAlignVertical: 'top',
    marginBottom: 18,
  },
  bottomDescription: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: DARK,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 22,
  },
  ctaWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  shareBtn: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#b8860b',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  shareBtnDisabled: {
    opacity: 0.45,
    elevation: 0,
    shadowOpacity: 0,
  },
  shareBtnInner: {
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  shareBtnText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 19,
    color: '#ffffff',
    letterSpacing: 0.2,
  },
});

export default CycleReflectionBlock;

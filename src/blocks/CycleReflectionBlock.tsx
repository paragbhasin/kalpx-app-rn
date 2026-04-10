/**
 * CycleReflectionBlock — Day 7 / Day 14 checkpoint primary block.
 *
 * Fetches checkpoint data on mount, renders headline/metrics/feeling picker/
 * reflection textarea, and submits via checkpoint_submit action.
 */
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { loadScreenWithData, screenActions, goBackWithData } from '../store/screenSlice';
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

const CycleReflectionBlock: React.FC<CycleReflectionBlockProps> = ({ block }) => {
  const screenData = useScreenStore((s) => s.screenData);

  // Local helpers that write to the Redux store using the action-executor's
  // (value, key) convention (reversed from updateScreenData's (key, value)).
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
  const headline = screenData.checkpoint_headline || `Day ${day} — Reflection`;
  const subtext = screenData.checkpoint_subtext || '';
  const question =
    screenData.checkpoint_question || 'How has your practice felt?';
  const metrics = screenData.checkpoint_metrics || {};
  const daysEngaged = screenData.checkpoint_days_engaged || 0;
  const daysFully = screenData.checkpoint_days_fully_completed || 0;
  const totalDays = screenData.checkpoint_total_days || day;
  const strongestArea = screenData.strongest_area || '';

  useEffect(() => {
    // Auto-fetch checkpoint data if not yet loaded
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
          writeState(data.recommendationAction || '', 'checkpoint_recommendation');
          writeState(data.deepenSuggestion || null, 'checkpoint_deepen_suggestion');
          writeState(data.pathDurationDays || 0, 'checkpoint_path_duration_days');
          writeState(data.growthArea || '', 'checkpoint_growth_area');
          writeState(data.consistencyScore || 0, 'checkpoint_consistency_score');
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
        <ActivityIndicator size="large" color="#C9A84C" />
      </View>
    );
  }

  return (
    <View style={[styles.container, block?.style]}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Day {day} · Reflection</Text>
      </View>

      <Text style={styles.headline}>{headline}</Text>
      {Boolean(subtext) && <Text style={styles.subtext}>{subtext}</Text>}

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>
            {daysEngaged}/{totalDays}
          </Text>
          <Text style={styles.metricLabel}>Days engaged</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{daysFully}</Text>
          <Text style={styles.metricLabel}>Days fully completed</Text>
        </View>
        {Boolean(strongestArea) && (
          <View style={styles.metricCard}>
            <Text style={[styles.metricValue, { fontSize: 16 }]}>
              {formatArea(strongestArea)}
            </Text>
            <Text style={styles.metricLabel}>Strongest anchor</Text>
          </View>
        )}
      </View>

      <Text style={styles.question}>{question}</Text>

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

      <Text style={styles.reflectionLabel}>
        Is there anything else you want to note?
      </Text>
      <TextInput
        style={styles.textarea}
        multiline
        numberOfLines={4}
        placeholder="Optional — share a word or a sentence…"
        placeholderTextColor="rgba(67,33,4,0.4)"
        value={reflection}
        onChangeText={handleReflectionChange}
      />

      <TouchableOpacity
        style={[
          styles.submitBtn,
          (!selectedFeeling || submitting) && styles.submitBtnDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!selectedFeeling || submitting}
        activeOpacity={0.85}
      >
        {submitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitText}>Continue →</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

function formatArea(area: string): string {
  if (!area) return '';
  return area
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const GOLD = '#C9A84C';
const DARK = '#432104';

const styles = StyleSheet.create({
  container: {
    width: '93%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.3)',
    borderRadius: 24,
    padding: 24,
    marginVertical: 12,
    backgroundColor: 'rgba(255, 253, 249, 0.95)',
  },
  loadingBox: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(201, 168, 76, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: Fonts.sans.semiBold,
    color: GOLD,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headline: {
    fontSize: 22,
    color: DARK,
    fontFamily: Fonts.serif.bold,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: 'rgba(67, 33, 4, 0.7)',
    fontFamily: Fonts.sans.regular,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    marginTop: 8,
    marginBottom: 20,
  },
  metricCard: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.2)',
    backgroundColor: 'rgba(201, 168, 76, 0.06)',
    minWidth: '28%',
    flex: 1,
    gap: 4,
  },
  metricValue: {
    fontSize: 20,
    color: DARK,
    fontFamily: Fonts.serif.bold,
    textAlign: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: 'rgba(67, 33, 4, 0.6)',
    fontFamily: Fonts.sans.regular,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  question: {
    fontSize: 16,
    color: DARK,
    fontFamily: Fonts.serif.bold,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  feelingList: {
    width: '100%',
    gap: 10,
    marginBottom: 20,
  },
  feelingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.25)',
    backgroundColor: 'rgba(255, 253, 249, 0.6)',
    gap: 12,
  },
  feelingSelected: {
    borderColor: GOLD,
    backgroundColor: 'rgba(201, 168, 76, 0.12)',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(201, 168, 76, 0.5)',
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
    fontSize: 15,
    color: '#432104',
    fontFamily: Fonts.sans.regular,
    flex: 1,
  },
  feelingLabelSelected: {
    color: DARK,
    fontFamily: Fonts.sans.semiBold,
  },
  reflectionLabel: {
    fontSize: 13,
    color: 'rgba(67, 33, 4, 0.7)',
    fontFamily: Fonts.sans.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  textarea: {
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.3)',
    borderRadius: 12,
    padding: 14,
    minHeight: 90,
    fontSize: 14,
    color: DARK,
    fontFamily: Fonts.sans.regular,
    backgroundColor: 'rgba(255, 253, 249, 0.6)',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: GOLD,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitText: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: Fonts.sans.semiBold,
  },
});

export default CycleReflectionBlock;

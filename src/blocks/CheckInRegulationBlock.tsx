/**
 * CheckInRegulationBlock — Week 4 Moment 21 multi-turn regulation support.
 *
 * Web parity: kalpx-frontend/src/containers/AwarenessTriggerContainer.vue
 * (quick_checkin → checkin_breath_reset). Spec:
 * route_support_checkin_regulation.md §1 (3-step: notice → name → settle), §4.
 *
 * Distinct from dashboard CheckInCardCompact (Moment 13 compact chips). This
 * block is a full-screen regulation sequence, one step per render, driven by
 * screenData.checkin_step. Each step shows a Mitra message, reply chips, and
 * an optional mic. Dispatches `advance_checkin_step` on chip tap and
 * `submit_checkin` after settle step.
 *
 * REG-015: touches ONLY checkin_* screenData; must not clear or overwrite
 * any runner_* / core fields. On completion BalancedAckOverlay renders, then
 * explicit navigate to dashboard.
 *
 * Tone: warm, non-prescriptive. No exclamations. Ack uses "You named it.
 * That's already part of settling." — set by submit_checkin handler.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Fonts } from '../theme/fonts';
import { executeAction } from '../engine/actionExecutor';
import { useContentSlots, readMomentSlot } from '../hooks/useContentSlots';
import { useScreenStore } from '../engine/useScreenBridge';
import store from '../store';
import { screenActions } from '../store/screenSlice';

type Step = 'notice' | 'name' | 'settle';

// Stable chip ids per step (analytics keys). Labels + titles + prompts
// come from the M20_checkin_regulation ContentPack.
const STEP_CHIPS: Record<Step, readonly string[]> = {
  notice: ['chest', 'head', 'stomach', 'unsure'] as const,
  name: ['agitated', 'drained', 'scared', 'heavy'] as const,
  settle: ['done', 'another'] as const,
};

const CheckInRegulationBlock: React.FC<{ block?: any }> = () => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();
  const ss = screenData as Record<string, any>;

  useContentSlots({
    momentId: 'M20_checkin_regulation',
    screenDataKey: 'checkin_regulation',
    buildCtx: (s) => ({
      path: s.journey_path === 'growth' ? 'growth' : 'support',
      guidance_mode: s.guidance_mode || 'hybrid',
      locale: s.locale || 'en',
      user_attention_state: 'scanning',
      emotional_weight: 'moderate',
      cycle_day: Number(s.day_number) || 0,
      entered_via: 'dashboard_card',
      stage_signals: {},
      today_layer: {},
      life_layer: {
        cycle_id: s.journey_id || s.cycle_id || '',
        life_kosha: s.life_kosha || s.scan_focus || '',
        scan_focus: s.scan_focus || '',
      },
    }),
  });
  const slot = (name: string) => readMomentSlot(ss, 'checkin_regulation', name);

  const step: Step = (ss.checkin_step as Step) || 'notice';
  const title = slot(`${step}_title`);
  const prompt = slot(`${step}_prompt`);
  const chipIds = STEP_CHIPS[step];

  const dispatch = (actionType: string, payload: any) => {
    executeAction(
      { type: actionType, payload, currentScreen } as any,
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          store.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: { ...screenData },
      },
    ).catch(() => {});
  };

  const onChip = (chipId: string) => {
    if (step === 'settle') {
      dispatch('submit_checkin', { final: chipId });
    } else {
      dispatch('advance_checkin_step', { from: step, value: chipId });
    }
  };

  const onVoice = () => {
    dispatch('start_voice_note', { source_surface: 'checkin_venting' });
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.prompt}>{prompt}</Text>

      <View style={styles.chips}>
        {chipIds.map((id) => (
          <TouchableOpacity
            key={id}
            style={styles.chip}
            activeOpacity={0.75}
            onPress={() => onChip(id)}
            accessibilityRole="button"
          >
            <Text style={styles.chipText}>{slot(`${step}_${id}_chip`)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.micBtn}
        onPress={onVoice}
        accessibilityRole="button"
        accessibilityLabel={slot('voice_mic_label')}
      >
        <Text style={styles.micIcon}>🎙</Text>
        <Text style={styles.micLabel}>{slot('voice_mic_label')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 28,
    backgroundColor: '#FFF8EF',
    justifyContent: 'center',
  },
  title: {
    fontFamily: Fonts.serif.regular,
    fontSize: 24,
    lineHeight: 32,
    color: '#FFF8EF',
    marginBottom: 14,
  },
  prompt: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: '#bfa58a',
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10 as any,
    marginBottom: 28,
  },
  chip: {
    borderWidth: 1,
    borderColor: 'rgba(237,222,180,0.5)',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 8,
    marginBottom: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: '#432104',
  },
  micBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  micIcon: { fontSize: 18, color: '#432104', marginRight: 8 },
  micLabel: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: '#bfa58a',
  },
});

export default CheckInRegulationBlock;

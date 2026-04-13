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
import { useScreenStore } from '../engine/useScreenBridge';
import store from '../store';
import { screenActions } from '../store/screenSlice';

type Step = 'notice' | 'name' | 'settle';

const STEP_CONTENT: Record<
  Step,
  { title: string; prompt: string; chips: { id: string; label: string }[] }
> = {
  notice: {
    title: "Let's not try to figure anything out right now.",
    prompt: 'What are you noticing in the body?',
    chips: [
      { id: 'chest', label: 'Chest tight' },
      { id: 'head', label: 'Head loud' },
      { id: 'stomach', label: 'Stomach knotted' },
      { id: 'unsure', label: 'Hard to say' },
    ],
  },
  name: {
    title: "You don't need to explain it. Just name it.",
    prompt: 'What word comes closest?',
    chips: [
      { id: 'agitated', label: 'Agitated' },
      { id: 'drained', label: 'Drained' },
      { id: 'scared', label: 'Scared' },
      { id: 'heavy', label: 'Heavy' },
    ],
  },
  settle: {
    title: 'Naming it loosens it a little.',
    prompt: 'Stay for one slow breath with it.',
    chips: [
      { id: 'done', label: 'Done' },
      { id: 'another', label: 'Another breath' },
    ],
  },
};

const CheckInRegulationBlock: React.FC<{ block?: any }> = () => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();
  const step: Step =
    (screenData.checkin_step as Step) || 'notice';
  const content = STEP_CONTENT[step];

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
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.prompt}>{content.prompt}</Text>

      <View style={styles.chips}>
        {content.chips.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={styles.chip}
            activeOpacity={0.75}
            onPress={() => onChip(c.id)}
            accessibilityRole="button"
          >
            <Text style={styles.chipText}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.micBtn}
        onPress={onVoice}
        accessibilityRole="button"
        accessibilityLabel="Voice note"
      >
        <Text style={styles.micIcon}>🎙</Text>
        <Text style={styles.micLabel}>Say it out loud</Text>
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
    color: '#f1e7cf',
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

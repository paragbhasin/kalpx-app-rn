/**
 * TriggerEntryBlock — Week 4 Moment 20 "I feel triggered" dashboard CTA.
 *
 * Web parity: kalpx-frontend/src/containers/CompanionDashboardContainer.vue
 * (SupportEntryRow — "I Feel Triggered" pill). Spec:
 * route_support_trigger.md §7 (entry from dashboard).
 *
 * REG-020 contract: tap initiates the trigger support 3-step flow
 * (OM practice → mantra runner → dashboard). NO recheck screen on the
 * active path. The action `initiate_trigger_support` sets
 * runner_source = "support_trigger" and clears any prior trigger-local state
 * (REG-002 guard on trigger_mantra_text).
 *
 * Tone: warm gold outlined pill, always visible on dashboard. No exclamations.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Fonts } from '../theme/fonts';
import { executeAction } from '../engine/actionExecutor';
import { useScreenStore } from '../engine/useScreenBridge';
import store from '../store';
import { screenActions } from '../store/screenSlice';

const TriggerEntryBlock: React.FC<{ block?: any }> = ({ block }) => {
  const { screenData, loadScreen, goBack } = useScreenStore();
  const label = (block && block.label) || 'I feel triggered.';

  const onPress = () => {
    executeAction(
      { type: 'initiate_trigger_support', payload: {} },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          store.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: { ...screenData },
      },
    ).catch(() => {});
  };

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        style={styles.pill}
        activeOpacity={0.75}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="I feel triggered — open support"
      >
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'center', marginVertical: 12 },
  pill: {
    borderWidth: 1,
    borderColor: '#eddeb4',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: 'transparent',
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    color: '#432104',
    letterSpacing: 0.4,
  },
});

export default TriggerEntryBlock;

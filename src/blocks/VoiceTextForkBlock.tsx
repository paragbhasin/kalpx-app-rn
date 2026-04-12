/**
 * VoiceTextForkBlock — Turn 4 binary choice: Speak vs Keep Written.
 *
 * Web counterpart: no direct web file (Turn 4 is RN-first in v3). Closest:
 *   kalpx-frontend/src/containers/PortalSplashContainer.vue — voice consent overlay pattern.
 * Spec: docs/specs/mitra-v3-experience/screens/route_welcome_onboarding.md §1 Turn 4, §6
 * Regression cases: REG-016 (no open input on binary turns).
 *
 * Behavior:
 *   - "Speak to me" fires action with choice=voice; container triggers voice consent overlay
 *     if voice_consent_given is false (mirrors PortalSplashContainer consent flow).
 *   - "Keep it written" fires action with choice=text.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Fonts } from '../theme/fonts';
import { useScreenStore } from '../engine/useScreenBridge';
import { executeAction } from '../engine/actionExecutor';
import { interpolate } from '../engine/utils/interpolation';

const GOLD = '#eddeb4';

interface Props {
  block: {
    on_response?: any;
    state_acknowledgment?: string; // "Activated.", "Heavy.", etc.
  };
}

const VoiceTextForkBlock: React.FC<Props> = ({ block }) => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();

  const fire = async (choice: 'voice' | 'text') => {
    if (!block.on_response) return;
    const base = interpolate(block.on_response, screenData);
    await executeAction(
      { ...base, payload: { ...(base.payload || {}), choice }, currentScreen },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) => {
          const { screenActions } = require('../store/screenSlice');
          const { store } = require('../store');
          store.dispatch(screenActions.setScreenValue({ key, value }));
        },
        screenState: { ...screenData },
      },
    );
  };

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        style={[styles.option, styles.optionSpeak]}
        onPress={() => fire('voice')}
        activeOpacity={0.8}
      >
        <Text style={styles.icon}>≈</Text>
        <Text style={styles.label}>Speak to me</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, styles.optionWritten]}
        onPress={() => fire('text')}
        activeOpacity={0.8}
      >
        <Text style={styles.icon}>✎</Text>
        <Text style={styles.label}>Keep it written</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginVertical: 12 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: GOLD,
  },
  optionSpeak: { backgroundColor: 'rgba(237,222,180,0.08)' },
  optionWritten: { backgroundColor: 'transparent' },
  icon: {
    color: GOLD,
    fontSize: 22,
    marginRight: 12,
    fontFamily: Fonts.sans.regular,
  },
  label: { color: GOLD, fontSize: 17, fontFamily: Fonts.sans.medium },
});

export default VoiceTextForkBlock;

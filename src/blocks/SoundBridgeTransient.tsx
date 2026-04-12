/**
 * SoundBridgeTransient — Week 4 Moment 42 transient OM audio overlay.
 *
 * Web parity: kalpx-frontend/src/containers/AwarenessTriggerContainer.vue
 * (free_mantra_chanting OM audio rotation). Spec:
 * transient_sound_bridge.md §1, §4 (state machine), §9 (tap-anywhere to skip).
 *
 * Contract:
 *  - Dark background (#0a0a0a) + breathing gold orb + gold humming waveform
 *  - Plays OM (rotates through 3 variants seeded on entry into screenData.om_audio_url)
 *  - Auto-advances to mantra runner after one OM cycle (~12s) OR tap-anywhere
 *  - No back button during playback (spec §9)
 *  - Fires `advance_sound_bridge` on exit → SupportTriggerContainer loads mantra
 *    runner with runner_source="support_trigger"
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Fonts } from '../theme/fonts';
import { executeAction } from '../engine/actionExecutor';
import { useScreenStore } from '../engine/useScreenBridge';
import store from '../store';
import { screenActions } from '../store/screenSlice';

const OM_CYCLE_MS = 12_000;

const SoundBridgeTransient: React.FC<{ block?: any }> = () => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();
  const pulse = useRef(new Animated.Value(0)).current;
  const advancedRef = useRef(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const t = setTimeout(() => advance('auto'), OM_CYCLE_MS);
    return () => clearTimeout(t);
  }, []);

  const advance = (exitType: 'auto' | 'tap') => {
    if (advancedRef.current) return;
    advancedRef.current = true;
    executeAction(
      { type: 'advance_sound_bridge', payload: { exit_type: exitType }, currentScreen } as any,
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          store.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: { ...screenData },
      },
    ).catch(() => {});
  };

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.08] });
  const glow = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.85] });

  return (
    <TouchableWithoutFeedback
      onPress={() => advance('tap')}
      accessibilityRole="button"
      accessibilityLabel="Sound bridge — tap to continue"
    >
      <View style={styles.root}>
        <View style={styles.center}>
          <Animated.View
            style={[
              styles.orb,
              { transform: [{ scale }], opacity: glow },
            ]}
          />
          <Text style={styles.omChar}>ॐ</Text>
        </View>
        <Text style={styles.hint}>Hum with me</Text>
        <Text style={styles.continueHint}>Continue</Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  orb: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(237,222,180,0.18)',
    shadowColor: '#eddeb4',
    shadowOpacity: 0.4,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
  },
  omChar: {
    fontFamily: Fonts.serif.regular,
    fontSize: 96,
    color: '#eddeb4',
  },
  hint: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: '#9a7a3a',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  continueHint: {
    position: 'absolute',
    bottom: 48,
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: '#6a5a3a',
    letterSpacing: 0.5,
  },
});

export default SoundBridgeTransient;

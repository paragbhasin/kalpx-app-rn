/**
 * @deprecated 2026-04-20 — Canonical rich runner is
 * `cycle_transitions/offering_reveal` via `CycleTransitionsContainer`.
 * All dispatch paths to `practice_runner/mantra_runner` (state id that
 * mounts this component) were decommissioned post-Wave-3. This component
 * is parked for coordinated-delete in Sprint 3; Stage 1 deprecation
 * (2026-04-20) adds a runtime warn + `legacy_runner_rendered` telemetry
 * event so any residual dispatcher surfaces in logs before the Stage-4
 * cleanup PR. DO NOT EXTEND. See
 * `docs/LEGACY_COMPONENT_CLASSIFICATION_V1.md` + `mitra_parked_items_2026_04_19.md`.
 *
 * MantraRunnerDisplay — Week 3 Moment 17 immersive mantra runner (bead counter).
 *
 * Web parity: src/blocks/RepCounter.vue + src/containers/PracticeRunnerContainer.vue
 *   rep counter section (see kalpx-frontend/src/containers/PracticeRunnerContainer.vue
 *   mantra_runner variant). Spec: route_practice_mantra_runner.md.
 *
 * Wraps the existing RepCounterBlock pattern with an immersive dark-background
 * chrome: gold 72px Cormorant numeral, 120px circular SVG progress ring that
 * fills clockwise per rep, gentle pulse on tap (1 -> 1.08 -> 1 over 240ms),
 * subtle haptic per count, optional background audio loop.
 *
 * On reps === target_reps (108 default, or whatever is passed in), dispatches
 * the container's `complete_runner` action which fires track_completion and
 * transitions to the completion_return transient.
 *
 * Regression guards:
 *   - REG-003: runner_reps_completed is mirrored to Redux each tap so the
 *     completion_return / cleanup path can read the final count even if this
 *     component unmounts mid-transition.
 *   - REG-016: no tap targets outside the screen safe area; entire surface is
 *     the tap target per spec §1.
 *   - Tone: no exclamations, no streak UI. Only the count.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Platform } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Fonts } from '../theme/fonts';
import { useContentSlots, readMomentSlot } from '../hooks/useContentSlots';
import { useScreenStore } from '../engine/useScreenBridge';
import { executeAction } from '../engine/actionExecutor';
import { mitraTrackEvent } from '../engine/mitraApi';
import AudioPlayerBlock from './AudioPlayerBlock';

interface MantraRunnerDisplayProps {
  block: {
    id?: string;
    total?: number | string;
    audio_url?: string;
    on_complete?: any;
  };
}

const RING_SIZE = 120;
const RING_RADIUS = 56;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const MantraRunnerDisplay: React.FC<MantraRunnerDisplayProps> = ({ block }) => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();
  const ss = screenData as Record<string, any>;

  // DEPRECATED (2026-04-20). Stage-1 deprecation telemetry — fires on every
  // mount so any leaked dispatcher surfaces in logs. Canonical runner is
  // `cycle_transitions/offering_reveal`. Remove with Stage-4 cleanup PR.
  useEffect(() => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(
        "[DEPRECATED] MantraRunnerDisplay rendered — canonical runner is cycle_transitions/offering_reveal. Trace the caller.",
      );
    }
    mitraTrackEvent("legacy_runner_rendered", {
      journeyId: ss.journey_id,
      dayNumber: ss.day_number || 1,
      meta: {
        component: "MantraRunnerDisplay",
        state_id: "practice_runner/mantra_runner",
        source: ss.runner_source,
      },
    }).catch(() => {});
  }, []);

  useContentSlots({
    momentId: 'M17_mantra_runner',
    screenDataKey: 'mantra_runner',
    buildCtx: (s) => ({
      path: s.journey_path === 'growth' ? 'growth' : 'support',
      guidance_mode: s.guidance_mode || 'hybrid',
      locale: s.locale || 'en',
      user_attention_state: 'meditative_single_pointed',
      emotional_weight: 'moderate',
      cycle_day: Number(s.day_number) || 0,
      entered_via: 'dashboard_practice_card',
      stage_signals: {},
      today_layer: {},
      life_layer: {
        cycle_id: s.journey_id || s.cycle_id || '',
        life_kosha: s.life_kosha || s.scan_focus || '',
        scan_focus: s.scan_focus || '',
      },
    }),
  });
  const slot = (name: string) => readMomentSlot(ss, 'mantra_runner', name);

  // Target reps — allow 1, 9, 27, 54, 108. Default 108 per spec.
  const parsedTotal = typeof block.total === 'string'
    ? parseInt(block.total, 10)
    : block.total;
  const total = (parsedTotal && !isNaN(parsedTotal) && parsedTotal > 0)
    ? parsedTotal
    : (Number(screenData.reps_total) || 108);

  const [count, setCount] = useState<number>(0);
  const completedRef = useRef(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Mirror runner_reps_completed into Redux for cleanup safety (REG-003).
  const setScreenValue = (key: string, value: any) => {
    const { screenActions } = require('../store/screenSlice');
    const { store } = require('../store');
    store.dispatch(screenActions.setScreenValue({ key, value }));
  };

  const handleTap = useCallback(() => {
    if (completedRef.current) return;
    if (count >= total) return;

    const newCount = count + 1;
    setCount(newCount);
    setScreenValue('runner_reps_completed', newCount);

    // Tap pulse 1 -> 1.08 -> 1 over 240ms (spec §1)
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.08, duration: 120, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    // Subtle haptic per count (spec §12)
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    if (newCount >= total) {
      completedRef.current = true;
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
      const onComplete = currentScreen?.on_complete || block.on_complete || {
        type: 'complete_runner',
      };
      setTimeout(() => {
        executeAction(
          { ...onComplete, currentScreen },
          {
            loadScreen,
            goBack,
            setScreenValue: (value: any, key: string) => setScreenValue(key, value),
            screenState: { ...screenData, runner_reps_completed: newCount },
          },
        ).catch((err: any) => console.error('[MantraRunnerDisplay] complete failed:', err));
      }, 500);
    }
  }, [count, total, currentScreen, block.on_complete, screenData, loadScreen, goBack, pulseAnim]);

  const progress = total > 0 ? Math.min(count / total, 1) : 0;
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);

  const audioUrl = block.audio_url || screenData.mantra_audio_url;

  return (
    <Pressable
      style={styles.pressArea}
      onPress={handleTap}
      accessibilityLabel={`Mantra practice. Current count: ${count}. Target: ${total}. Tap to count.`}
      accessibilityRole="button"
    >
      <Animated.View style={[styles.ringWrap, { transform: [{ scale: pulseAnim }] }]}>
        <Svg width={RING_SIZE} height={RING_SIZE} viewBox="0 0 120 120">
          <Circle
            cx={60}
            cy={60}
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(237, 222, 180, 0.12)"
            strokeWidth={2}
          />
          <Circle
            cx={60}
            cy={60}
            r={RING_RADIUS}
            fill="none"
            stroke="#eddeb4"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={`${RING_CIRCUMFERENCE}`}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 60 60)"
          />
        </Svg>
        <View style={styles.countCenter} pointerEvents="none">
          <Text style={styles.countText}>{count}</Text>
        </View>
      </Animated.View>
      <Text style={styles.ofLine}>{`${slot('of_separator') || 'of'} ${total}`}</Text>

      <View style={styles.mantraInfo}>
        <Text style={styles.devanagari}>{screenData.runner_active_item?.devanagari}</Text>
        <Text style={styles.iast}>{screenData.runner_active_item?.title || screenData.runner_active_item?.iast}</Text>
      </View>

      {audioUrl ? (
        <View style={styles.hiddenAudio} pointerEvents="none">
          <AudioPlayerBlock block={{ audio_url: audioUrl, autoplay: true, loop: true } as any} />
        </View>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 72,
    color: '#eddeb4',
    fontFamily: Fonts.serif.regular,
    fontWeight: '300',
    lineHeight: 80,
    textAlign: 'center',
  },
  ofLine: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: '#bfa58a',
    letterSpacing: 1.5,
    marginTop: 28,
  },
  hiddenAudio: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
  mantraInfo: {
    position: 'absolute',
    top: 120,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 32,
  },
  devanagari: {
    fontFamily: Fonts.serif.regular,
    fontSize: 28,
    color: '#eddeb4',
    marginBottom: 8,
    textAlign: 'center',
    opacity: 0.9,
  },
  iast: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: '#bfa58a',
    letterSpacing: 1.2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});

export default MantraRunnerDisplay;

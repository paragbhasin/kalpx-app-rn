/**
 * SankalpHoldBlock — Week 3 Moment 18 immersive sankalp hold gesture.
 *
 * Web parity: src/containers/PracticeRunnerContainer.vue sankalp_embody branch
 * + src/blocks/HoldButton.vue. Spec: route_practice_sankalp_hold.md.
 *
 * Extends the existing PressAndHoldCircularBlock pattern: 3-second sustained
 * hold, gold gradient fill (light -> deep) clockwise over 3s, escalating
 * haptic pulses at 750/1500/2250/3000ms, smooth 400ms unfill on early release,
 * double heavy haptic on complete, then dispatch completion.
 *
 * Instruction fade choreography (spec §14A):
 *   - "Hold to embody your intention"  fades OUT at 1500ms
 *   - "Steady..."                     fades IN at 1500ms
 *   - "Held."                         briefly visible on completion
 *
 * Regression guards:
 *   - REG-003: runner_duration_actual_sec is mirrored into Redux on complete
 *     so track_completion can surface the real hold duration.
 *   - Early release does NOT fire completion (spec §4 holding_released_mid_fill).
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Pressable } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Fonts } from '../theme/fonts';
import { useContentSlots, readMomentSlot } from '../hooks/useContentSlots';
import { useScreenStore } from '../engine/useScreenBridge';
import { executeAction } from '../engine/actionExecutor';

interface SankalpHoldBlockProps {
  block: {
    hold_duration?: number;
    on_complete?: any;
  };
}

const RING_SIZE = 160;
const RING_RADIUS = 70;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const HAPTIC_INTERVAL_MS = 750;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SankalpHoldBlock: React.FC<SankalpHoldBlockProps> = ({ block }) => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();
  const ss = screenData as Record<string, any>;
  const duration = block.hold_duration ?? 3000;

  useContentSlots({
    momentId: 'M18_sankalp_embody',
    screenDataKey: 'sankalp_embody',
    buildCtx: (s) => ({
      path: s.journey_path === 'growth' ? 'growth' : 'support',
      guidance_mode: s.guidance_mode || 'hybrid',
      locale: s.locale || 'en',
      user_attention_state: 'focused_receiving',
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
  const slot = (name: string) => readMomentSlot(ss, 'sankalp_embody', name);

  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'holding' | 'held'>('idle');

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hapticTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startRef = useRef<number>(0);
  const instructionOpacity = useRef(new Animated.Value(1)).current;
  const steadyOpacity = useRef(new Animated.Value(0)).current;
  const heldOpacity = useRef(new Animated.Value(0)).current;
  const unfillAnim = useRef(new Animated.Value(0)).current;
  const completedRef = useRef(false);

  const setScreenValue = (key: string, value: any) => {
    const { screenActions } = require('../store/screenSlice');
    const { store } = require('../store');
    store.dispatch(screenActions.setScreenValue({ key, value }));
  };

  const clearTimers = () => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    hapticTimersRef.current.forEach(clearTimeout);
    hapticTimersRef.current = [];
  };

  const onPressIn = useCallback(() => {
    if (completedRef.current) return;
    setPhase('holding');
    startRef.current = Date.now();
    unfillAnim.stopAnimation();
    unfillAnim.setValue(0);

    // Schedule escalating haptic pulses at 750/1500/2250/3000ms (spec §9 haptic)
    for (let i = 1; i <= 4; i++) {
      const style =
        i === 1 ? Haptics.ImpactFeedbackStyle.Light :
        i === 2 ? Haptics.ImpactFeedbackStyle.Medium :
        i === 3 ? Haptics.ImpactFeedbackStyle.Heavy :
                  Haptics.ImpactFeedbackStyle.Heavy;
      const t = setTimeout(() => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(style).catch(() => {});
        }
      }, HAPTIC_INTERVAL_MS * i);
      hapticTimersRef.current.push(t);
    }

    // Instruction fade choreography at 1500ms
    const fadeT = setTimeout(() => {
      Animated.timing(instructionOpacity, {
        toValue: 0, duration: 300, useNativeDriver: true,
      }).start();
      Animated.timing(steadyOpacity, {
        toValue: 1, duration: 300, useNativeDriver: true,
      }).start();
    }, 1500);
    hapticTimersRef.current.push(fadeT);

    tickRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p >= 1 && !completedRef.current) {
        completedRef.current = true;
        clearTimers();
        setPhase('held');

        // Double heavy haptic on complete
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          setTimeout(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
          }, 120);
        }

        // "Held." flash
        Animated.sequence([
          Animated.timing(heldOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.delay(600),
        ]).start();

        setScreenValue('runner_duration_actual_sec', Math.round(duration / 1000));

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
              screenState: { ...screenData },
            },
          ).catch((err: any) => console.error('[SankalpHoldBlock] complete failed:', err));
        }, 900);
      }
    }, 16);
  }, [duration, block.on_complete, currentScreen, screenData, loadScreen, goBack]);

  const onPressOut = useCallback(() => {
    if (completedRef.current) return;
    if (phase !== 'holding') return;
    clearTimers();
    setPhase('idle');

    // Smooth unfill 400ms (spec §4 holding_released_mid_fill)
    const startProgress = progress;
    const t0 = Date.now();
    const unfillDur = 400;
    const unfillTick = setInterval(() => {
      const t = (Date.now() - t0) / unfillDur;
      if (t >= 1) {
        clearInterval(unfillTick);
        setProgress(0);
      } else {
        setProgress(startProgress * (1 - t));
      }
    }, 16);

    // Restore instruction
    Animated.timing(instructionOpacity, {
      toValue: 1, duration: 300, useNativeDriver: true,
    }).start();
    Animated.timing(steadyOpacity, {
      toValue: 0, duration: 300, useNativeDriver: true,
    }).start();
  }, [phase, progress]);

  useEffect(() => () => clearTimers(), []);

  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);
  const sankalpText = screenData.companion_sankalp_line || screenData.sankalp_text || '';

  return (
    <View style={styles.container}>
      {sankalpText ? (
        <Text style={styles.sankalpText} accessibilityRole="text">
          {sankalpText}
        </Text>
      ) : null}

      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.ringTarget}
        accessibilityLabel="Press and hold to embody your intention"
        accessibilityRole="button"
      >
        <Svg width={RING_SIZE} height={RING_SIZE} viewBox="0 0 160 160">
          <Defs>
            <LinearGradient id="sankalpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#f5e8c3" />
              <Stop offset="100%" stopColor="#c9a84c" />
            </LinearGradient>
          </Defs>
          <Circle
            cx={80}
            cy={80}
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(237, 222, 180, 0.15)"
            strokeWidth={2}
          />
          <Circle
            cx={80}
            cy={80}
            r={RING_RADIUS}
            fill="none"
            stroke="url(#sankalpGrad)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={`${RING_CIRCUMFERENCE}`}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 80 80)"
          />
        </Svg>
      </Pressable>

      <View style={styles.instructionSlot}>
        <Animated.Text style={[styles.instruction, { opacity: instructionOpacity }]}>
          {slot('hold_prompt')}
        </Animated.Text>
        <Animated.Text style={[styles.instruction, styles.absolute, { opacity: steadyOpacity }]}>
          {slot('steady_label')}
        </Animated.Text>
        <Animated.Text style={[styles.heldText, styles.absolute, { opacity: heldOpacity }]}>
          {slot('held_label')}
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  sankalpText: {
    fontFamily: Fonts.serif.regular,
    fontStyle: 'italic',
    fontSize: 26,
    lineHeight: 36,
    color: '#eddeb4',
    textAlign: 'center',
    marginBottom: 56,
    maxWidth: 320,
  },
  ringTarget: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionSlot: {
    marginTop: 28,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instruction: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: '#bfa58a',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  heldText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: '#eddeb4',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  absolute: {
    position: 'absolute',
  },
});

export default SankalpHoldBlock;

/**
 * PracticeTimerBlock — Week 3 Moment 19 immersive timed practice runner.
 *
 * Web parity: src/blocks/TimerDisplay.vue + PracticeRunnerContainer.vue
 * sacred_pause/anchor_timer branch. Spec: route_practice_timer.md.
 *
 * Extends the existing TimerDisplayBlock pattern:
 *   - Step name in Cormorant 20px gold + Inter 12px muted "step N of M" above
 *     the countdown
 *   - Ring depletes 100% -> 0%
 *   - Final 10 seconds: ring pulse + subtle gold glow (spec §4 final_10_seconds)
 *   - Step transitions: 280ms fade out + fade in (spec §10 StepInstructionDisplay)
 *   - Sticky bottom-center "End Practice" text link (>= 44x44, REG-016)
 *
 * Regression guards:
 *   - REG-003: runner_duration_actual_sec mirrored to Redux on each tick so a
 *     mid-practice unmount/cleanup still has accurate elapsed data.
 *   - REG-016: End Practice is hitSlop-padded to >= 44x44.
 *   - "End Practice" back exit must NOT fire track_completion — it simply
 *     executes the action object passed in (usually a navigate home). Calling
 *     complete_runner is reserved for natural timer expiry.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Fonts } from '../theme/fonts';
import { useScreenStore } from '../engine/useScreenBridge';
import { executeAction } from '../engine/actionExecutor';

interface PracticeTimerBlockProps {
  block: {
    duration?: number;
    duration_key?: string;
    steps?: string[];
    steps_key?: string;
    on_complete?: any;
    end_practice_action?: any;
  };
}

function parseDuration(raw: any): number {
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    if (raw.includes(':')) {
      const [m, s] = raw.split(':').map(Number);
      return m * 60 + (s || 0);
    }
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return 180;
}

const SIZE = 240;
const RADIUS = 110;
const CIRC = 2 * Math.PI * RADIUS;

const PracticeTimerBlock: React.FC<PracticeTimerBlockProps> = ({ block }) => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();

  const rawDuration =
    block.duration ??
    (block.duration_key ? screenData[block.duration_key] : undefined) ??
    screenData.practice_duration_seconds ??
    180;
  const totalSeconds = parseDuration(rawDuration);

  const steps: string[] =
    block.steps ||
    (block.steps_key ? screenData[block.steps_key] : undefined) ||
    screenData.practice_steps ||
    [];

  const [remaining, setRemaining] = useState(totalSeconds);
  const [stepIndex, setStepIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);
  const final10Triggered = useRef(false);
  const glowAnim = useRef(new Animated.Value(0)).current;
  const stepOpacity = useRef(new Animated.Value(1)).current;

  const setScreenValue = (key: string, value: any) => {
    const { screenActions } = require('../store/screenSlice');
    const { store } = require('../store');
    store.dispatch(screenActions.setScreenValue({ key, value }));
  };

  // Derive stepIndex from elapsed for multi-step practices.
  useEffect(() => {
    if (!steps.length) return;
    const elapsed = totalSeconds - remaining;
    const idx = Math.min(
      Math.floor((elapsed / totalSeconds) * steps.length),
      steps.length - 1,
    );
    if (idx !== stepIndex) {
      // 280ms fade out + in
      Animated.sequence([
        Animated.timing(stepOpacity, { toValue: 0, duration: 140, useNativeDriver: true }),
        Animated.timing(stepOpacity, { toValue: 1, duration: 140, useNativeDriver: true }),
      ]).start();
      setStepIndex(idx);
      setScreenValue('runner_step_index', idx);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    }
  }, [remaining, totalSeconds, steps.length]);

  const fireComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setScreenValue('runner_duration_actual_sec', totalSeconds);
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
          screenState: { ...screenData },
        },
      ).catch((err: any) => console.error('[PracticeTimerBlock] complete failed:', err));
    }, 500);
  }, [totalSeconds, currentScreen, block.on_complete, screenData, loadScreen, goBack]);

  // Tick
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        const next = Math.max(prev - 1, 0);
        setScreenValue('runner_duration_actual_sec', totalSeconds - next);
        if (next <= 10 && !final10Triggered.current) {
          final10Triggered.current = true;
          Animated.loop(
            Animated.sequence([
              Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
              Animated.timing(glowAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
            ]),
          ).start();
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          }
        }
        if (next <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          fireComplete();
        }
        return next;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fireComplete, totalSeconds]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = `${mins}:${secs.toString().padStart(2, '0')}`;
  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;
  const dashOffset = CIRC * (1 - progress);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.6] });

  const stepText = steps.length ? steps[stepIndex] : '';
  const practiceTitle =
    screenData.companion_practice_title ||
    screenData.practice_title ||
    screenData.info?.title ||
    '';

  const handleEndPractice = () => {
    if (completedRef.current) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    const action = block.end_practice_action || {
      type: 'navigate',
      target: { container_id: 'companion_dashboard', state_id: 'day_active' },
    };
    executeAction(
      { ...action, currentScreen },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) => setScreenValue(key, value),
        screenState: { ...screenData },
      },
    ).catch((err: any) => console.error('[PracticeTimerBlock] end failed:', err));
  };

  return (
    <View style={styles.container}>
      {practiceTitle ? (
        <Text style={styles.title}>{practiceTitle}</Text>
      ) : null}

      {steps.length > 0 && (
        <Animated.View style={{ opacity: stepOpacity, alignItems: 'center' }}>
          <Text style={styles.stepName}>{stepText}</Text>
          <Text style={styles.stepCounter}>{`step ${stepIndex + 1} of ${steps.length}`}</Text>
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.ringWrap,
          final10Triggered.current && {
            shadowColor: '#eddeb4',
            shadowRadius: 24,
            shadowOpacity: glowOpacity as any,
          },
        ]}
      >
        <Svg width={SIZE} height={SIZE} viewBox="0 0 240 240">
          <Circle cx={120} cy={120} r={RADIUS} fill="none" stroke="rgba(237,222,180,0.12)" strokeWidth={2} />
          <Circle
            cx={120}
            cy={120}
            r={RADIUS}
            fill="none"
            stroke="#eddeb4"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={`${CIRC}`}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 120 120)"
          />
        </Svg>
        <View style={styles.timerCenter} pointerEvents="none">
          <Text style={styles.timeText}>{display}</Text>
        </View>
      </Animated.View>

      <TouchableOpacity
        onPress={handleEndPractice}
        hitSlop={{ top: 16, bottom: 16, left: 32, right: 32 }}
        style={styles.endPractice}
        accessibilityRole="button"
        accessibilityLabel="End practice"
      >
        <Text style={styles.endPracticeText}>End Practice</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 24,
  },
  title: {
    fontFamily: Fonts.serif.regular,
    fontSize: 22,
    color: '#eddeb4',
    marginBottom: 20,
  },
  stepName: {
    fontFamily: Fonts.serif.regular,
    fontSize: 20,
    color: '#eddeb4',
    textAlign: 'center',
    marginBottom: 4,
    paddingHorizontal: 24,
  },
  stepCounter: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: '#8c7b5c',
    letterSpacing: 1,
    marginBottom: 24,
  },
  ringWrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  timerCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 64,
    color: '#eddeb4',
    fontWeight: '300',
    letterSpacing: -1,
  },
  endPractice: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    minHeight: 44,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endPracticeText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: '#bfa58a',
    letterSpacing: 0.4,
  },
});

export default PracticeTimerBlock;

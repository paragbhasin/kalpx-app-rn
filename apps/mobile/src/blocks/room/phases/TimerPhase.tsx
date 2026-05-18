/**
 * TimerPhase — inline timer body for breathe/sit/walk/heart steps.
 *
 * No modal wrapper. Renders directly inside RoomJourneyRenderer.
 * Auto-starts on mount. Companion line appears above the visual.
 * Muted timer below. Quiet escape link at bottom.
 */
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/fonts';
import type { StepPayload } from '../types';

export type TimerKind = 'timer_breathe' | 'timer_sit' | 'timer_walk' | 'timer_heart';

interface Props {
  kind: TimerKind;
  stepPayload: StepPayload | null | undefined;
  companionLine: string;
  onComplete: () => void;
  onEscape: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeTotalSec(kind: TimerKind, stepPayload: StepPayload | null | undefined): number {
  const raw = stepPayload?.duration_sec;
  if (typeof raw === 'number' && raw > 0) return raw;
  const sc = stepPayload?.step_config;
  if (sc) {
    const cycles = typeof sc['cycles'] === 'number' ? sc['cycles'] : 0;
    const inhale = typeof sc['inhale'] === 'number' ? sc['inhale'] : 0;
    const exhale = typeof sc['exhale'] === 'number' ? sc['exhale'] : 0;
    const hold   = typeof sc['hold']   === 'number' ? sc['hold']   : 0;
    const durationMin = typeof sc['duration_min'] === 'number' ? sc['duration_min'] : 0;
    if (durationMin > 0) return durationMin * 60;
    const computed = cycles * (inhale + exhale + hold);
    if (computed > 0) return computed;
  }
  return kind === 'timer_heart' ? 30 : 60;
}

function getBreathTimings(stepPayload: StepPayload | null | undefined): { inhaleMs: number; holdMs: number; exhaleMs: number } {
  const sc = stepPayload?.step_config;
  if (sc) {
    const inhale = typeof sc['inhale'] === 'number' ? sc['inhale'] : 0;
    const hold   = typeof sc['hold']   === 'number' ? sc['hold']   : 0;
    const exhale = typeof sc['exhale'] === 'number' ? sc['exhale'] : 0;
    if (inhale > 0 && exhale > 0) {
      return { inhaleMs: inhale * 1000, holdMs: hold * 1000, exhaleMs: exhale * 1000 };
    }
  }
  return { inhaleMs: 4000, holdMs: 0, exhaleMs: 6000 };
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
}

const HEART_PHASES = [
  'Rest your hand on your heart.',
  'Feel the warmth.',
  'Breathe slowly.',
];

// ─── BreathingOrb ─────────────────────────────────────────────────────────────

const BreathingOrb: React.FC<{ running: boolean; inhaleMs: number; holdMs: number; exhaleMs: number }> = ({
  running, inhaleMs, holdMs, exhaleMs,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const [phase, setPhase] = useState('Inhale');
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    animRef.current?.stop();
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    clear();
    if (!running) {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
      setPhase('Inhale');
      return;
    }
    // Hold phase: animate from 1.28 → 1.28 (no movement) for holdMs.
    // This keeps the orb fully expanded during hold without a separate animation.
    const sequence = holdMs > 0
      ? Animated.sequence([
          Animated.timing(scale, { toValue: 1.28, duration: inhaleMs, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1.28, duration: holdMs,   useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1,    duration: exhaleMs, useNativeDriver: true }),
        ])
      : Animated.sequence([
          Animated.timing(scale, { toValue: 1.28, duration: inhaleMs, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1,    duration: exhaleMs, useNativeDriver: true }),
        ]);

    const loop = Animated.loop(sequence);
    animRef.current = loop;
    loop.start();

    const tick = () => {
      setPhase('Inhale');
      timerRef.current = setTimeout(() => {
        if (holdMs > 0) {
          setPhase('Hold');
          timerRef.current = setTimeout(() => {
            setPhase('Exhale');
            timerRef.current = setTimeout(tick, exhaleMs);
          }, holdMs);
        } else {
          setPhase('Exhale');
          timerRef.current = setTimeout(tick, exhaleMs);
        }
      }, inhaleMs);
    };
    tick();

    return clear;
  }, [running, inhaleMs, holdMs, exhaleMs, scale, clear]);

  return (
    <View style={styles.orbContainer}>
      <Animated.View style={[styles.orbGlow, {
        transform: [{ scale }],
        opacity: scale.interpolate({ inputRange: [1, 1.28], outputRange: [0.25, 0.55] }),
      }]} />
      <Animated.View style={[styles.orb, { transform: [{ scale }] }]}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={40} style={styles.orbInner}>
            <Text style={styles.orbPhase}>{phase}</Text>
          </BlurView>
        ) : (
          <View style={[styles.orbInner, styles.orbInnerAndroid]}>
            <Text style={styles.orbPhase}>{phase}</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

// ─── TimerPhase ───────────────────────────────────────────────────────────────

const WALK_END_FRAME = 68;
const WALK_COLOR = '#4A3B2F';

const TimerPhase: React.FC<Props> = ({ kind, stepPayload, companionLine, onComplete, onEscape }) => {
  const totalSec = computeTotalSec(kind, stepPayload);
  const { inhaleMs, holdMs, exhaleMs } = getBreathTimings(stepPayload);

  const [remaining, setRemaining] = useState(totalSec);
  const [running, setRunning] = useState(true); // auto-start
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);
  const lottieRef = useRef<LottieView>(null);

  // Heart phases cycling
  const [heartPhaseIndex, setHeartPhaseIndex] = useState(0);
  const heartTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (kind !== 'timer_heart') return;
    heartTimerRef.current = setInterval(() => {
      setHeartPhaseIndex((i) => (i + 1) % HEART_PHASES.length);
    }, 10000);
    return () => {
      if (heartTimerRef.current) clearInterval(heartTimerRef.current);
    };
  }, [kind]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  // Completion fires in a separate effect so it never runs inside a state updater
  useEffect(() => {
    if (remaining === 0 && running && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
    // onComplete intentionally excluded — changes to it must not re-trigger this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, running]);

  useEffect(() => {
    if (kind === 'timer_walk' && lottieRef.current) {
      if (running) lottieRef.current.play(0, WALK_END_FRAME);
      else lottieRef.current.pause();
    }
  }, [running, kind]);

  const handleEscape = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!completedRef.current) {
      completedRef.current = true;
      onEscape();
    }
  }, [onEscape]);

  return (
    <View style={styles.root}>
      {/* Companion line */}
      {companionLine ? (
        <Text style={styles.companion}>{companionLine}</Text>
      ) : null}

      {/* Visual */}
      {kind === 'timer_breathe' && (
        <BreathingOrb running={running} inhaleMs={inhaleMs} holdMs={holdMs} exhaleMs={exhaleMs} />
      )}

      {kind === 'timer_sit' && (
        <View style={styles.lotusContainer}>
          <Text style={styles.lotusEmoji}>🪷</Text>
        </View>
      )}

      {kind === 'timer_heart' && (
        <View style={styles.heartContainer}>
          <Text style={styles.heartEmoji}>🫀</Text>
          <Text style={styles.heartPhase}>{HEART_PHASES[heartPhaseIndex]}</Text>
        </View>
      )}

      {kind === 'timer_walk' && (
        <View style={styles.walkContainer}>
          <LottieView
            ref={lottieRef}
            source={require('../../../../assets/Walking Animation.json')}
            loop
            speed={0.7}
            colorFilters={[{ keypath: '**', color: WALK_COLOR }]}
            style={styles.walkAnim}
          />
        </View>
      )}

      {/* Muted timer */}
      <Text style={styles.timer}>{formatTime(remaining)}</Text>

      {/* Quiet escape */}
      <TouchableOpacity onPress={handleEscape} style={styles.escapeBtn} hitSlop={{ top: 8, bottom: 8 }}>
        <Text style={styles.escapeText}>I'll go now</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TimerPhase;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  companion: {
    fontSize: 15,
    color: Colors.textSoft,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
    fontFamily: Fonts.sans.regular,
    paddingHorizontal: 8,
  },
  // Breathing orb
  orbContainer: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  orbGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.goldPale,
  },
  orb: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
  },
  orbInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbInnerAndroid: {
    backgroundColor: 'rgba(250, 240, 220, 0.9)',
  },
  orbPhase: {
    fontSize: 14,
    fontFamily: Fonts.sans.medium,
    color: '#7A5C2A',
    letterSpacing: 0.5,
  },
  // Sit / lotus
  lotusContainer: {
    marginBottom: 28,
    alignItems: 'center',
  },
  lotusEmoji: {
    fontSize: 72,
  },
  // Heart
  heartContainer: {
    marginBottom: 28,
    alignItems: 'center',
  },
  heartEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  heartPhase: {
    fontSize: 15,
    fontFamily: Fonts.sans.regular,
    color: Colors.textSoft,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Walk
  walkContainer: {
    marginBottom: 28,
  },
  walkAnim: {
    width: 140,
    height: 140,
  },
  // Timer
  timer: {
    fontSize: 14,
    color: '#B8A898',
    fontFamily: Fonts.sans.regular,
    marginBottom: 32,
    letterSpacing: 0.5,
  },
  // Escape
  escapeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  escapeText: {
    fontSize: 13,
    color: '#B8A898',
    fontFamily: Fonts.sans.regular,
    textDecorationLine: 'underline',
  },
});

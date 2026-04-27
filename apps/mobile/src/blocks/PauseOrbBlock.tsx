/**
 * PauseOrbBlock — Practice timer with duration selection and countdown.
 * Mirrors the web PauseOrb.vue: reads info.duration from screenState,
 * shows duration picker (range) or auto-starts (single value / seconds),
 * counts down, and fires on_complete when done.
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Fonts } from '../theme/fonts';
import { useScreenStore } from '../engine/useScreenBridge';
import { executeAction } from '../engine/actionExecutor';
import { sanitizeStyle } from '../engine/utils/sanitizeStyle';
import { useContentSlots, readMomentSlot } from '../hooks/useContentSlots';

/** Convert Indic script digits to ASCII digits */
function toEnglishDigits(str: string): string {
  if (!str) return '';
  return str.replace(
    /[\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F]/g,
    (d) => (d.charCodeAt(0) % 10).toString(),
  );
}

const SECONDS_KEYWORDS = [
  'second', 'sec',
  '\u0C38\u0C46\u0C15\u0C28\u0CCD', // Telugu
  '\u0938\u0947\u0915\u0902\u0921', // Hindi
  '\u09B8\u09C7\u0995\u09C7\u09A8\u09CD\u09A1', // Bengali
  '\u0D38\u0D46\u0D15\u0D4D\u0D15\u0D23\u0D4D\u200D\u0D21\u0D4D', // Malayalam
  '\u0BB5\u0BBF\u0BA9\u0BBE\u0B9F\u0BBF', // Tamil
  '\u0CB8\u0CC6\u0C95\u0CC6\u0C82\u0CA1\u0CCD', // Kannada
  '\u0AB8\u0AC7\u0A95\u0AA8\u0ACD\u0AA1', // Gujarati
];

interface PauseOrbBlockProps {
  block: {
    size?: number;
    color?: string;
    style?: any;
    on_complete?: any;
    show_breathing_labels?: boolean;
  };
}

const PauseOrbBlock: React.FC<PauseOrbBlockProps> = ({ block }) => {
  const { screenData: screenState, loadScreen, goBack, currentScreen } = useScreenStore();
  const ss = screenState as Record<string, any>;

  useContentSlots({
    momentId: 'M_pause_orb',
    screenDataKey: 'pause_orb',
    buildCtx: (s) => ({
      path: s.journey_path === 'growth' ? 'growth' : 'support',
      guidance_mode: s.guidance_mode || 'hybrid',
      locale: s.locale || 'en',
      user_attention_state: 'focused_receiving',
      emotional_weight: 'light',
      cycle_day: Number(s.day_number) || 0,
      entered_via: 'pause_tap_in_runner',
      stage_signals: {},
      today_layer: {},
      life_layer: {
        cycle_id: s.journey_id || s.cycle_id || '',
        life_kosha: s.life_kosha || s.scan_focus || '',
        scan_focus: s.scan_focus || '',
      },
    }),
  });
  const slot = (name: string) => readMomentSlot(ss, 'pause_orb', name);

  // Duration string from screen state (e.g. "1 Minute", "1-3 Minutes", "10-30 Seconds")
  const rawDuration = ss.info?.duration || '1 Minute';
  const normalizedDuration = toEnglishDigits(rawDuration);

  const isSeconds = useMemo(() => {
    const lowered = normalizedDuration.toLowerCase();
    return SECONDS_KEYWORDS.some((kw) => lowered.includes(kw));
  }, [normalizedDuration]);

  // Parse options: "1-3" => [1, 2, 3], single "1" => null (auto-start)
  const options = useMemo(() => {
    const matches = normalizedDuration.match(/(\d+)\D+(\d+)/);
    if (matches) {
      const start = parseInt(matches[1], 10);
      const end = parseInt(matches[2], 10);
      const opts: number[] = [];
      for (let i = start; i <= end; i++) opts.push(i);
      return opts;
    }
    return null;
  }, [normalizedDuration]);

  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [initialSeconds, setInitialSeconds] = useState(60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  // Glow animation
  const glowOpacity = useSharedValue(0.3);
  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const fireOnComplete = useCallback(async () => {
    if (completedRef.current) return;
    completedRef.current = true;

    const action = currentScreen?.on_complete || block.on_complete;
    if (action) {
      try {
        await executeAction(
          { ...action, currentScreen },
          {
            loadScreen,
            goBack,
            setScreenValue: (value: any, key: string) => {
              const { screenActions } = require('../store/screenSlice');
              const { store } = require('../store');
              store.dispatch(screenActions.setScreenValue({ key, value }));
            },
            screenState: { ...screenState },
          },
        );
      } catch (err) {
        console.error('[PauseOrbBlock] on_complete failed:', err);
      }
    }
  }, [currentScreen, block.on_complete, loadScreen, goBack, screenState]);

  const startWithDuration = useCallback(
    (val: number) => {
      const multiplier = isSeconds ? 1 : 60;
      const totalSecs = val * multiplier;
      setInitialSeconds(totalSecs);
      setTimeLeft(totalSecs);
      setIsStarted(true);
      completedRef.current = false;
    },
    [isSeconds],
  );

  // Auto-start logic on duration change
  useEffect(() => {
    if (isSeconds && options) {
      // Range of seconds -> auto-start with max
      startWithDuration(options[options.length - 1]);
    } else if (!options) {
      // Single value -> auto-start
      const singleMatch = normalizedDuration.match(/(\d+)/);
      const val = singleMatch ? parseInt(singleMatch[1], 10) : 1;
      startWithDuration(val);
    } else {
      // Range of minutes -> show selection
      setIsStarted(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [normalizedDuration, isSeconds, options, startWithDuration]);

  // Timer countdown
  useEffect(() => {
    if (!isStarted) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          fireOnComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isStarted, fireOnComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const displayTime = useMemo(() => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  const progress = initialSeconds > 0 ? timeLeft / initialSeconds : 0;
  const size = block.size || 240;
  const color = block.color || '#C9A84C';
  const containerStyle = block.style ? sanitizeStyle(block.style) : undefined;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Outer glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          glowStyle,
          {
            width: size + 40,
            height: size + 40,
            borderRadius: (size + 40) / 2,
            borderColor: color,
          },
        ]}
      />

      {/* Main orb area */}
      <View
        style={[
          styles.orbArea,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        {isStarted ? (
          /* Timer display */
          <View style={styles.timerContent}>
            <Text style={[styles.timeMain, { color: '#615247' }]}>{displayTime}</Text>
            <Text style={styles.returnLabel}>{slot('timer_label')}</Text>
          </View>
        ) : (
          /* Duration selection */
          <View style={styles.selectionContent}>
            <Text style={styles.selectionLabel}>{slot('duration_prompt')}</Text>
            <View style={styles.durationOptions}>
              {options?.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.optBtn}
                  activeOpacity={0.7}
                  onPress={() => startWithDuration(opt)}
                >
                  <Text style={styles.optBtnText}>
                    {opt}{isSeconds ? 's' : 'm'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Progress ring (thin golden circle, visual only) */}
      {isStarted && (
        <View
          style={[
            styles.progressRing,
            {
              width: size + 10,
              height: size + 10,
              borderRadius: (size + 10) / 2,
              borderColor: color,
              opacity: 0.3 + progress * 0.7,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    minHeight: 280,
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 1,
    opacity: 0.15,
  },
  orbArea: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  progressRing: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  timerContent: {
    alignItems: 'center',
  },
  timeMain: {
    fontSize: 72,
    fontWeight: '200',
    fontFamily: Fonts.serif.regular,
    letterSpacing: -3,
    lineHeight: 80,
  },
  returnLabel: {
    fontSize: 15,
    color: '#8c8881',
    marginTop: 5,
    letterSpacing: 0.5,
    opacity: 0.8,
    fontStyle: 'italic',
    fontFamily: Fonts.serif.regular,
  },
  selectionContent: {
    alignItems: 'center',
  },
  selectionLabel: {
    fontSize: 20,
    color: '#615247',
    marginBottom: 24,
    opacity: 0.7,
    fontFamily: Fonts.serif.regular,
  },
  durationOptions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  optBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.3)',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optBtnText: {
    fontSize: 16,
    color: '#615247',
    fontFamily: Fonts.serif.regular,
  },
});

export default PauseOrbBlock;

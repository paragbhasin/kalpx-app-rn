import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Fonts } from '../theme/fonts';
import { useScreenStore } from '../engine/useScreenBridge';
import { executeAction } from '../engine/actionExecutor';

interface TimerDisplayBlockProps {
  block: {
    duration?: number;
    duration_key?: string;
    on_complete?: any;
  };
}

function parseDuration(raw: any): number {
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    if (raw.includes('Minute')) return parseInt(raw, 10) * 60;
    if (raw.includes(':')) {
      const [m, s] = raw.split(':').map(Number);
      return m * 60 + (s || 0);
    }
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return 300;
}

const CIRCUMFERENCE = 2 * Math.PI * 48;
const SIZE = 240;

const TimerDisplayBlock: React.FC<TimerDisplayBlockProps> = ({ block }) => {
  const { screenData: screenState, loadScreen, goBack, currentScreen } = useScreenStore();

  const rawDuration = block.duration ?? screenState[block.duration_key || ''] ?? '5:00';
  const initialSeconds = parseDuration(rawDuration);

  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const displayTime = useCallback(() => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  // Watch for timer_control_event from screenState
  useEffect(() => {
    const event = screenState['timer_control_event'];
    if (!event) return;
    if (event === 'start' || event === 'resume') {
      setIsRunning(true);
    } else if (event === 'pause') {
      setIsRunning(false);
    }
    // Clear the event
    const { screenActions } = require('../store/screenSlice');
    const { store } = require('../store');
    store.dispatch(screenActions.setScreenValue({ key: 'timer_control_event', value: null }));
  }, [screenState['timer_control_event']]);

  // Timer tick
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsRunning(false);
          // Fire completion
          const onComplete = currentScreen?.on_complete || block.on_complete;
          if (onComplete) {
            executeAction(onComplete, {
              loadScreen,
              goBack,
              setScreenValue: (value: any, key: string) => {
                const { screenActions } = require('../store/screenSlice');
                const { store } = require('../store');
                store.dispatch(screenActions.setScreenValue({ key, value }));
              },
              screenState,
            }).catch((err: any) => console.error('[TimerDisplayBlock] Action failed:', err));
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const progress = initialSeconds > 0 ? timeLeft / initialSeconds : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <View style={styles.container}>
      <View style={styles.timerCircle}>
        <Svg width={SIZE} height={SIZE} viewBox="0 0 100 100" style={styles.svg}>
          <Circle
            cx={50}
            cy={50}
            r={48}
            fill="none"
            stroke="rgba(184, 148, 80, 0.15)"
            strokeWidth={2}
          />
          <Circle
            cx={50}
            cy={50}
            r={48}
            fill="none"
            stroke="#C9A84C"
            strokeWidth={2}
            strokeDasharray={`${CIRCUMFERENCE}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
        </Svg>
        <Text style={styles.timeText}>{displayTime()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  timerCircle: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  timeText: {
    fontSize: 56,
    fontWeight: '200',
    color: '#432104',
    fontFamily: Fonts.serif.regular,
    letterSpacing: -2,
  },
});

export default TimerDisplayBlock;

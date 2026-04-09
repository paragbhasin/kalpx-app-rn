import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Fonts } from '../theme/fonts';
import { useScreenStore } from '../engine/useScreenBridge';
import { executeAction } from '../engine/actionExecutor';

interface HoldTriggerBlockProps {
  block: {
    hold_duration?: number;
    label?: string;
    on_complete?: any;
    action?: any;
  };
}

const CIRCUMFERENCE = 2 * Math.PI * 45;

const HoldTriggerBlock: React.FC<HoldTriggerBlockProps> = ({ block }) => {
  const { screenData: screenState, loadScreen, goBack, currentScreen } = useScreenStore();
  const duration = block.hold_duration || 4000;

  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isHolding) {
      // Pulse animation while holding
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isHolding]);

  const startHold = () => {
    if (isComplete) return;
    setIsHolding(true);
    startTimeRef.current = Date.now();

    // Animate glow
    Animated.timing(glowAnim, { toValue: 1, duration: duration, useNativeDriver: false }).start();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min((elapsed / duration) * 100, 100);
      setProgress(p);

      if (p >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setIsComplete(true);
        setIsHolding(false);

        // Fire completion action
        const onComplete = block.on_complete || block.action || currentScreen?.on_complete;
        if (onComplete) {
          executeAction(onComplete, {
            loadScreen,
            goBack,
            setScreenValue: (value: any, key: string) => {
              const { screenActions } = require('../store/screenSlice');
              const { store } = require('../store');
              store.dispatch(screenActions.setScreenValue({ key, value }));
            },
            screenState: { ...screenState },
          }).catch((err: any) => console.error('[HoldTriggerBlock] Action failed:', err));
        }
      }
    }, 16);
  };

  const stopHold = () => {
    setIsHolding(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (progress < 100) {
      setProgress(0);
      Animated.timing(glowAnim, { toValue: 0, duration: 300, useNativeDriver: false }).start();
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const strokeDashoffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  const labelText = isHolding
    ? 'Embodying...'
    : isComplete
      ? 'Integrated'
      : block.label || 'Hold to Embody';

  return (
    <View style={styles.container}>
      <View
        style={[styles.holdTarget, isHolding && styles.holdActive, isComplete && styles.holdComplete]}
        onTouchStart={startHold}
        onTouchEnd={stopHold}
        onTouchCancel={stopHold}
      >
        {/* SVG progress ring */}
        <Svg width={180} height={180} viewBox="0 0 100 100" style={styles.svg}>
          <Circle
            cx={50}
            cy={50}
            r={45}
            fill="none"
            stroke="rgba(212, 177, 106, 0.1)"
            strokeWidth={2}
          />
          <Circle
            cx={50}
            cy={50}
            r={45}
            fill="none"
            stroke="#d4b16a"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE}`}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 50 50)"
          />
        </Svg>

        {/* Center content */}
        <View style={styles.centerContent}>
          <Animated.Text style={[styles.icon, { transform: [{ scale: pulseAnim }] }]}>
            {'\u2740'}
          </Animated.Text>
          <Text style={styles.label}>{labelText}</Text>
        </View>

        {/* Glow effect */}
        <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 20,
  },
  holdTarget: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  holdActive: {
    transform: [{ scale: 1.05 }],
  },
  holdComplete: {
    transform: [{ scale: 0.95 }],
  },
  svg: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    gap: 12,
    zIndex: 2,
  },
  icon: {
    fontSize: 32,
    color: '#d4b16a',
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '600',
    color: '#5c5648',
    opacity: 0.8,
    textAlign: 'center',
    maxWidth: 120,
    fontFamily: Fonts.sans.semiBold,
  },
  glow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 120,
    backgroundColor: 'rgba(212, 177, 106, 0.3)',
    zIndex: 1,
  },
});

export default HoldTriggerBlock;

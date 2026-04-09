/**
 * PressAndHoldCircularBlock — Circular press-and-hold interaction with SVG ring progress.
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Fonts } from '../theme/fonts';
import { useScreenStore } from '../engine/useScreenBridge';
import { executeAction } from '../engine/actionExecutor';

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface PressAndHoldCircularBlockProps {
  block: {
    label?: string;
    hold_duration?: number;
    action?: any;
    on_complete?: any;
    icon?: string;
    style?: any;
  };
}

const PressAndHoldCircularBlock: React.FC<PressAndHoldCircularBlockProps> = ({ block }) => {
  const { screenData: screenState, loadScreen, goBack } = useScreenStore();
  const duration = block.hold_duration || 3000;

  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);

  const start = () => {
    if (isComplete) return;
    setIsHolding(true);
    startRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const p = Math.min(((Date.now() - startRef.current) / duration) * 100, 100);
      setProgress(p);
      if (p >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setIsComplete(true);
        setIsHolding(false);

        const action = block.on_complete || block.action;
        if (action) {
          executeAction(action, {
            loadScreen,
            goBack,
            setScreenValue: (value: any, key: string) => {
              const { screenActions } = require('../store/screenSlice');
              const { store } = require('../store');
              store.dispatch(screenActions.setScreenValue({ key, value }));
            },
            screenState: { ...screenState },
          }).catch(console.error);
        }
      }
    }, 16);
  };

  const stop = () => {
    setIsHolding(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (progress < 100) setProgress(0);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  return (
    <View style={[styles.container, block?.style]}>
      <View
        style={styles.holdTarget}
        onTouchStart={start}
        onTouchEnd={stop}
        onTouchCancel={stop}
      >
        <Svg width={140} height={140} viewBox="0 0 100 100" style={styles.svg}>
          <Circle cx={50} cy={50} r={RADIUS} fill="none" stroke="rgba(201, 168, 76, 0.12)" strokeWidth={3} />
          <Circle
            cx={50}
            cy={50}
            r={RADIUS}
            fill="none"
            stroke="#C9A84C"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE}`}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
          />
        </Svg>
        <View style={styles.center}>
          <Text style={styles.icon}>{isComplete ? '\u2714' : block.icon || '\u2740'}</Text>
          <Text style={styles.label}>
            {isComplete ? 'Done' : isHolding ? 'Hold...' : block.label || 'Hold'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  holdTarget: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 253, 249, 0.3)',
  },
  svg: {
    position: 'absolute',
  },
  center: {
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 28,
    color: '#C9A84C',
  },
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '600',
    color: '#5c5648',
    fontFamily: Fonts.sans.semiBold,
    textAlign: 'center',
    maxWidth: 90,
  },
});

export default PressAndHoldCircularBlock;

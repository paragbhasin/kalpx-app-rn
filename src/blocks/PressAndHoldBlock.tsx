/**
 * PressAndHoldBlock — Generic press-and-hold interaction with linear progress bar.
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';
import { useScreenStore } from '../engine/useScreenBridge';
import { executeAction } from '../engine/actionExecutor';

interface PressAndHoldBlockProps {
  block: {
    label?: string;
    hold_duration?: number;
    action?: any;
    on_complete?: any;
    style?: any;
  };
}

const PressAndHoldBlock: React.FC<PressAndHoldBlockProps> = ({ block }) => {
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
            screenState,
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

  return (
    <View style={[styles.container, block?.style]}>
      <View
        style={styles.holdArea}
        onTouchStart={start}
        onTouchEnd={stop}
        onTouchCancel={stop}
      >
        <Text style={styles.label}>
          {isComplete ? 'Complete' : isHolding ? 'Holding...' : block.label || 'Press & Hold'}
        </Text>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${progress}%` }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '93%',
    alignSelf: 'center',
    marginVertical: 16,
    alignItems: 'center',
  },
  holdArea: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5c5648',
    fontFamily: Fonts.sans.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  barTrack: {
    width: '80%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(201, 168, 76, 0.12)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#C9A84C',
  },
});

export default PressAndHoldBlock;

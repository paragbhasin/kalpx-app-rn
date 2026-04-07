import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Fonts } from '../theme/fonts';
import { useScreenStore } from '../engine/useScreenBridge';
import { executeAction } from '../engine/actionExecutor';

interface RepCounterBlockProps {
  block: {
    id?: string;
    total?: number;
    unlimited?: boolean;
    on_complete?: any;
  };
}

const RepCounterBlock: React.FC<RepCounterBlockProps> = ({ block }) => {
  const { screenData: screenState, loadScreen, goBack, currentScreen } = useScreenStore();
  const total = Number(block.total) || 9;
  const isUnlimited = block.unlimited || total === -1;

  const [count, setCount] = useState<number>(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation for tap target
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const logRep = useCallback(() => {
    if (!isUnlimited && count >= total) return;

    const newCount = count + 1;
    setCount(newCount);

    // Pop animation on count
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    // Check completion
    if (!isUnlimited && newCount >= total) {
      setTimeout(async () => {
        const onComplete = currentScreen?.on_complete || block.on_complete;
        if (onComplete) {
          try {
            await executeAction(
              { ...onComplete, currentScreen },
              {
                loadScreen,
                goBack,
                setScreenValue: (value: any, key: string) => {
                  const { screenActions } = require('../store/screenSlice');
                  const { store } = require('../store');
                  store.dispatch(screenActions.setScreenValue({ key, value }));
                },
                screenState,
              },
            );
          } catch (err) {
            console.error('[RepCounterBlock] Action failed:', err);
          }
        }
      }, 500);
    }
  }, [count, total, isUnlimited, currentScreen, block.on_complete]);

  return (
    <View style={styles.container}>
      {/* Counter display */}
      <View style={styles.counterDisplay}>
        <Animated.Text style={[styles.current, { transform: [{ scale: scaleAnim }] }]}>
          {count}
        </Animated.Text>
        {!isUnlimited && (
          <>
            <Text style={styles.separator}>/</Text>
            <Text style={styles.total}>{total}</Text>
          </>
        )}
      </View>

      {/* Tap target */}
      {(isUnlimited || count < total) && (
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={styles.tapTarget}
            activeOpacity={0.8}
            onPress={logRep}
          >
            <Text style={styles.tapText}>TAP</Text>
            <Text style={styles.subTap}>THE BEAD</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Footer hint */}
      {(isUnlimited || count < total) && (
        <View style={styles.footerHint}>
          <Text style={styles.hintText}>TAP THE BEAD AFTER EACH MANTRA.</Text>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <View style={styles.diamond} />
            <View style={styles.dividerLine} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  counterDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 24,
  },
  current: {
    fontSize: 72,
    fontWeight: '300',
    color: '#b89450',
    fontFamily: Fonts.serif.regular,
    lineHeight: 80,
  },
  separator: {
    fontSize: 32,
    color: '#d1d1d1',
    fontWeight: '200',
  },
  total: {
    fontSize: 40,
    color: '#d1d1d1',
    fontWeight: '300',
  },
  tapTarget: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e3b54c',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e3b54c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 4,
    marginVertical: 20,
  },
  tapText: {
    fontSize: 22,
    letterSpacing: 4,
    fontWeight: '500',
    color: '#b89450',
    fontFamily: Fonts.sans.semiBold,
  },
  subTap: {
    fontSize: 9,
    letterSpacing: 2,
    color: '#615247',
    opacity: 0.6,
    fontWeight: '600',
    fontFamily: Fonts.sans.semiBold,
    marginTop: 2,
  },
  footerHint: {
    alignItems: 'center',
    marginTop: 10,
  },
  hintText: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
    color: '#b89450',
    textTransform: 'uppercase',
    fontFamily: Fonts.sans.bold,
    marginBottom: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: 180,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#b89450',
    opacity: 0.3,
  },
  diamond: {
    width: 4,
    height: 4,
    backgroundColor: '#b89450',
    transform: [{ rotate: '45deg' }],
  },
});

export default RepCounterBlock;

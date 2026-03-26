import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withDelay,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import BlockRenderer from '../engine/BlockRenderer';
import { useScreenStore } from '../engine/ScreenStore';
import Header from '../components/Header';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface LockRitualContainerProps {
  schema: {
    id?: string;
    blocks: any[];
    lock_action?: any;
    hint_text?: string;
    button_label?: string;
  };
}

const LockRitualContainer: React.FC<LockRitualContainerProps> = ({ schema }) => {
  const loadScreen = useScreenStore((state) => state.loadScreen);
  const updateBackground = useScreenStore((state) => state.updateBackground);
  const updateHeaderHidden = useScreenStore((state) => state.updateHeaderHidden);

  const [isReady, setIsReady] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  
  const progress = useSharedValue(0);
  const scale = useSharedValue(0.95);
  const containerOpacity = useSharedValue(0);
  
  useEffect(() => {
    // Immersion settings
    updateBackground(null); // Pure black background handled in styles
    updateHeaderHidden(true);
    
    // Entrance animations
    containerOpacity.value = withTiming(1, { duration: 800 });
    scale.value = withDelay(400, withTiming(1, { 
      duration: 1000, 
      easing: Easing.bezier(0.22, 0.61, 0.36, 1) 
    }));
    
    setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => updateHeaderHidden(false);
  }, []);

  const onCommit = () => {
    const holdButton = schema.blocks?.find(b => b.type === 'hold_button');
    const lockAction = schema.lock_action || holdButton?.on_complete;
    if (lockAction) {
      loadScreen(lockAction.target.container_id, lockAction.target.state_id);
    }
  };

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setIsHolding(true);
      scale.value = withTiming(0.98, { duration: 200 });
      progress.value = withTiming(1, { 
        duration: 1500, 
        easing: Easing.linear 
      }, (finished) => {
        if (finished) {
          runOnJS(onCommit)();
        }
      });
    },
    onPanResponderRelease: () => {
      setIsHolding(false);
      scale.value = withTiming(1, { duration: 300 });
      if (progress.value < 1) {
        progress.value = withTiming(0, { duration: 200 });
      }
    },
    onPanResponderTerminate: () => {
      setIsHolding(false);
      scale.value = withTiming(1, { duration: 300 });
      if (progress.value < 1) {
        progress.value = withTiming(0, { duration: 200 });
      }
    }
  }), [schema, progress, scale]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    height: `${progress.value * 100}%`,
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: containerOpacity.value,
  }));

  const headerBlocks = (schema.blocks || []).filter(b => b.position === 'header');
  const footerBlocks = (schema.blocks || []).filter(b => b.position === 'footer');
  const holdButton = schema.blocks?.find(b => b.type === 'hold_button');

  return (
    <View style={styles.container}>
      {/* Ambient Glow */}
      <View style={styles.ambientGlow} />
      
      <Header isTransparent={true} />

      <View style={styles.header}>
        {headerBlocks.map((block, i) => (
          <BlockRenderer key={`header-${i}`} block={block} textColor="#FFFFFF" />
        ))}
      </View>

      <View style={styles.ritualCenter}>
        <Animated.View 
          {...panResponder.panHandlers}
          style={[
            styles.holdButtonWrap, 
            isHolding && styles.isHolding,
            animatedButtonStyle
          ]}
        >
          {/* Progress Fill */}
          <Animated.View style={[styles.progressFill, animatedProgressStyle]}>
            <LinearGradient
              colors={['#f0c96b', '#d4a017']}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          <View style={styles.buttonContent}>
            {!isHolding && <Text style={styles.lockIcon}>🔒</Text>}
            <Text style={[styles.lockBtn, isHolding && styles.lockBtnHolding]}>
              {isHolding ? (holdButton?.holding_label || "Committing...") : (holdButton?.label || "Hold to Commit")}
            </Text>
          </View>
        </Animated.View>

        <Animated.Text style={[styles.hint, { opacity: containerOpacity.value }]}>
          {schema.hint_text || "Consistency shapes who you become."}
        </Animated.Text>
      </View>

      <View style={styles.footer}>
        {footerBlocks.map((block, i) => (
          <BlockRenderer key={`footer-${i}`} block={block} textColor="rgba(255,255,255,0.6)" />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080a0c',
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ambientGlow: {
    position: 'absolute',
    top: height / 2 - 200,
    left: width / 2 - 200,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(212, 160, 23, 0.08)',
    transform: [{ scale: 1.5 }],
  },
  header: {
    marginBottom: 60,
    alignItems: 'center',
  },
  ritualCenter: {
    alignItems: 'center',
    gap: 24,
    width: '100%',
  },
  holdButtonWrap: {
    width: 280,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(212, 160, 23, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  isHolding: {
    borderColor: 'rgba(212, 160, 23, 0.8)',
    shadowColor: 'rgba(212, 160, 23, 0.2)',
    shadowRadius: 30,
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 5,
  },
  lockIcon: {
    fontSize: 18,
  },
  lockBtn: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'GelicaBold',
    letterSpacing: 0.5,
  },
  lockBtnHolding: {
    color: '#080a0c',
  },
  hint: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
    fontFamily: 'GelicaRegular',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 10,
  },
  footer: {
    marginTop: 60,
  },
});

export default LockRitualContainer;

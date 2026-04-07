import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Image, Easing } from 'react-native';
import { useScreenStore } from '../engine/useScreenBridge';

interface BreathAnimationBlockProps {
  block: {
    type: 'breath_animation';
    cycles: number;
    inhale_duration?: number;
    hold_inhale_duration?: number;
    exhale_duration?: number;
    hold_exhale_duration?: number;
  };
}

const BreathAnimationBlock: React.FC<BreathAnimationBlockProps> = ({ block }) => {
  const { cycles = 3, inhale_duration = 4000, hold_inhale_duration = 4000, exhale_duration = 4000, hold_exhale_duration = 4000 } = block;
  const [currentCycle, setCurrentCycle] = useState(1);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Hold Out'>('Inhale');
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const loadScreen = useScreenStore(state => state.loadScreen);

  useEffect(() => {
    let isMounted = true;

    const runAnimation = async () => {
      for (let i = 1; i <= cycles; i++) {
        if (!isMounted) return;
        setCurrentCycle(i);

        // Inhale
        setPhase('Inhale');
        Animated.timing(scaleAnim, {
          toValue: 2.5,
          duration: inhale_duration,
          easing: Easing.bezier(0.445, 0.05, 0.55, 0.95),
          useNativeDriver: true,
        }).start();
        await new Promise(resolve => setTimeout(resolve, inhale_duration));

        // Hold
        if (!isMounted) return;
        setPhase('Hold');
        await new Promise(resolve => setTimeout(resolve, hold_inhale_duration));

        // Exhale
        if (!isMounted) return;
        setPhase('Exhale');
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: exhale_duration,
          easing: Easing.bezier(0.445, 0.05, 0.55, 0.95),
          useNativeDriver: true,
        }).start();
        await new Promise(resolve => setTimeout(resolve, exhale_duration));

        // Hold Out
        if (!isMounted) return;
        setPhase('Hold Out');
        await new Promise(resolve => setTimeout(resolve, hold_exhale_duration));
      }

      // Complete
      if (isMounted) {
        const { screen } = require('../store').store.getState();
        const currentScreen = screen.currentScreen;
        const onComplete = currentScreen?.on_complete;
        if (onComplete?.target) {
            loadScreen(onComplete.target.container_id, onComplete.target.state_id);
        } else {
            // Fallback or go back
            loadScreen('companion_dashboard', 'day_active');
        }
      }
    };

    runAnimation();

    return () => {
      isMounted = false;
      scaleAnim.stopAnimation();
    };
  }, []);

  const getPhaseText = () => {
    switch (phase) {
      case 'Inhale': return 'Slowly Inhale';
      case 'Hold': return 'Hold with awareness';
      case 'Exhale': return 'Gently Exhale';
      case 'Hold Out': return 'Pause in stillness';
      default: return '';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.cycleText}>Cycle {currentCycle} of {cycles}</Text>
      
      <View style={styles.animationArea}>
        <Animated.View style={[styles.ballContainer, { transform: [{ scale: scaleAnim }] }]}>
          <Image 
            source={require('../../assets/glow_ball.png')} 
            style={styles.ball} 
            resizeMode="contain" 
          />
        </Animated.View>
      </View>

      <Text style={styles.phaseText}>{getPhaseText()}</Text>
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
  cycleText: {
    fontSize: 16,
    color: '#8c8881',
    fontFamily: 'GelicaMedium',
    marginBottom: 40,
  },
  animationArea: {
    height: 350,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ballContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ball: {
    width: '100%',
    height: '100%',
  },
  phaseText: {
    fontSize: 28,
    fontFamily: 'GelicaBold',
    color: '#432104',
    marginTop: 40,
    height: 40,
    textAlign: 'center',
  },
});

export default BreathAnimationBlock;

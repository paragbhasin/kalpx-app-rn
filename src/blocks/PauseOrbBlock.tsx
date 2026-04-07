import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface PauseOrbBlockProps {
  block: {
    size?: number;
    color?: string;
    style?: any;
  };
}

const PauseOrbBlock: React.FC<PauseOrbBlockProps> = ({ block }) => {
  const size = block.size || 120;
  const color = block.color || '#C9A84C';

  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    // Breathing scale animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );

    // Glow pulse
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, []);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={[styles.container, block?.style]}>
      {/* Outer glow */}
      <Animated.View
        style={[
          styles.glow,
          glowStyle,
          {
            width: size * 1.6,
            height: size * 1.6,
            borderRadius: size * 0.8,
            backgroundColor: color,
          },
        ]}
      />
      {/* Main orb */}
      <Animated.View
        style={[
          styles.orb,
          orbStyle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 32,
    height: 200,
  },
  glow: {
    position: 'absolute',
  },
  orb: {
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 8,
  },
});

export default PauseOrbBlock;

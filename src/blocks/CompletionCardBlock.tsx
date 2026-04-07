import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Fonts } from '../theme/fonts';

interface CompletionCardBlockProps {
  block: {
    headline?: string;
    subtext?: string;
    style?: any;
  };
}

const CompletionCardBlock: React.FC<CompletionCardBlockProps> = ({ block }) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    // Entrance animation
    scale.value = withTiming(1, { duration: 600, easing: Easing.bezier(0.175, 0.885, 0.32, 1.275) });
    opacity.value = withTiming(1, { duration: 500 });

    // Gentle glow pulse
    glowOpacity.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: 2000 }),
          withTiming(0.3, { duration: 2000 }),
        ),
        -1,
      ),
    );
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, cardStyle, block?.style]}>
      {/* Glow border effect */}
      <Animated.View style={[styles.glow, glowStyle]} />

      <View style={styles.card}>
        {/* Lotus icon */}
        <Text style={styles.lotus}>{'\u2740'}</Text>

        {Boolean(block.headline) && (
          <Text style={styles.headline}>{block.headline}</Text>
        )}
        {Boolean(block.subtext) && (
          <Text style={styles.subtext}>{block.subtext}</Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
  },
  glow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#C9A84C',
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 4,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(201, 168, 76, 0.4)',
    backgroundColor: 'rgba(255, 253, 249, 0.9)',
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  lotus: {
    fontSize: 40,
    color: '#C9A84C',
    marginBottom: 4,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: '#432104',
    fontFamily: Fonts.serif.bold,
    textAlign: 'center',
    lineHeight: 30,
  },
  subtext: {
    fontSize: 16,
    color: 'rgba(67, 33, 4, 0.7)',
    fontFamily: Fonts.sans.regular,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default CompletionCardBlock;

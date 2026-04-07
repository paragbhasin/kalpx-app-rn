import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Fonts } from '../theme/fonts';

interface ToastMessageBlockProps {
  block: {
    content: string;
    variant?: 'success' | 'error' | 'info';
    duration?: number;
    style?: any;
  };
}

const VARIANT_COLORS = {
  success: { bg: 'rgba(76, 175, 80, 0.12)', border: 'rgba(76, 175, 80, 0.4)', text: '#2E7D32' },
  error: { bg: 'rgba(211, 47, 47, 0.12)', border: 'rgba(211, 47, 47, 0.4)', text: '#C62828' },
  info: { bg: 'rgba(201, 168, 76, 0.12)', border: 'rgba(201, 168, 76, 0.4)', text: '#432104' },
};

const ToastMessageBlock: React.FC<ToastMessageBlockProps> = ({ block }) => {
  const variant = block.variant || 'info';
  const colors = VARIANT_COLORS[variant];
  const duration = block.duration || 3000;

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);

  useEffect(() => {
    // Fade in
    opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
    translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });

    // Auto fade out
    opacity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withDelay(duration, withTiming(0, { duration: 300 })),
    );
    translateY.value = withSequence(
      withTiming(0, { duration: 300 }),
      withDelay(duration, withTiming(-20, { duration: 300 })),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.toast,
        animatedStyle,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
        block?.style,
      ]}
    >
      <Text style={[styles.text, { color: colors.text }]}>{block.content}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 8,
    width: '93%',
    alignSelf: 'center',
  },
  text: {
    fontSize: 14,
    fontFamily: Fonts.sans.regular,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ToastMessageBlock;

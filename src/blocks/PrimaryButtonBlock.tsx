import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Animated as RNAnimated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  withDelay,
  Easing,
  interpolate as reInterpolate
} from 'react-native-reanimated';
import { useScreenStore } from '../engine/ScreenStore';

interface PrimaryButtonBlockProps {
  block: {
    id?: string;
    label: string;
    subtext?: string;
    style?: any;
    variant?: 'gold' | 'outline' | 'trigger_entry';
    action?: any;
    validate?: string;
    validation_message?: string;
  };
}

const PrimaryButtonBlock: React.FC<PrimaryButtonBlockProps> = ({ block }) => {
  const loadScreen = useScreenStore((state) => state.loadScreen);
  const screenState = useScreenStore((state) => state.screenData);

  // Animation values
  const shineProgress = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // Shine animation
    shineProgress.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
      -1,
      false
    );

    // Pulse animation
    pulseScale.value = withRepeat(
      withTiming(1.03, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const shineStyle = useAnimatedStyle(() => {
    const translateX = reInterpolate(shineProgress.value, [0, 1], [-100, 250]);
    return {
      transform: [{ translateX }],
    };
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  const handlePress = () => {
    // Basic validation
    if (block.validate) {
      const value = screenState[block.validate];
      if (!value) {
        // In a real app, we'd trigger a toast here
        console.warn(block.validation_message || 'Please make a selection.');
        return;
      }
    }

    const action = block.action;
    if (action && (action.type === 'navigate' || action.type === 'submit') && action.target) {
      loadScreen(action.target.container_id, action.target.state_id);
    }
  };

  const isGold = block.variant !== 'outline';

  if (block.variant === 'outline') {
    return (
      <TouchableOpacity style={styles.outlineButton} onPress={handlePress}>
        <Text style={styles.outlineLabel}>{block.label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View style={[styles.pulseContainer, animatedContainerStyle]}>
      <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
        <LinearGradient
          colors={['#fff8dc', '#f6d365', '#d4af37', '#b8860b', '#fff8dc']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.borderGradient}
        >
          <LinearGradient
            colors={['#db9928', '#dfac3e']}
            style={styles.innerButton}
          >
            <View style={styles.contentContainer}>
              <Text style={styles.label}>{block.label}</Text>
              {block.subtext && <Text style={styles.subtext}>{block.subtext}</Text>}
            </View>
            
            {/* Shine Effect */}
            <Animated.View style={[styles.shine, shineStyle]}>
              <LinearGradient
                colors={['transparent', 'rgba(255, 255, 255, 0.4)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </LinearGradient>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  pulseContainer: {
    marginVertical: 12,
    alignSelf: 'center',
  },
  borderGradient: {
    padding: 2, // Border thickness
    borderRadius: 50,
  },
  innerButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  contentContainer: {
    alignItems: 'center',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'GelicaBold',
  },
  subtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  shine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 60,
    opacity: 0.5,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#C9A84C',
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    marginVertical: 12,
    alignSelf: 'center',
  },
  outlineLabel: {
    color: '#C9A84C',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default PrimaryButtonBlock;

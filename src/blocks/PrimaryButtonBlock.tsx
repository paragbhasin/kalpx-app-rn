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
import { useScreenStore } from '../engine/useScreenBridge';
import { executeAction } from '../engine/actionExecutor';

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
  const { loadScreen, goBack, screenData: screenState, setOverlayData } = useScreenStore();

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

  const handlePress = async () => {
    console.log('[PrimaryButtonBlock] PRESSED:', block.label, 'validate:', block.validate, 'value:', block.validate ? screenState[block.validate] : 'none');
    // Basic validation
    if (block.validate) {
      const value = screenState[block.validate];
      if (!value) {
        console.warn('[PrimaryButtonBlock] VALIDATION FAILED:', block.validate, '=', value, '| message:', block.validation_message);
        return;
      }
      console.log('[PrimaryButtonBlock] VALIDATION PASSED:', block.validate, '=', value);
    }

    const action = block.action;
    if (!action) { console.warn('[PrimaryButtonBlock] NO ACTION'); return; }

    // Route ALL actions through the centralized executor
    try {
      await executeAction(action, {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) => {
          // Bridge: update Redux screenData
          const { screenActions } = require('../store/screenSlice');
          const { store } = require('../store');
          store.dispatch(screenActions.setScreenValue({ key, value }));
        },
        screenState: { ...screenState }, // Shallow copy — Redux state is frozen
      });
    } catch (err) {
      console.error('[PrimaryButtonBlock] Action failed:', err);
    }
  };

  const variant = block.variant || block.style;
  const isGold = variant !== 'outline';

  if (variant === 'outline') {
    return (
      <TouchableOpacity style={styles.outlineButton} onPress={handlePress}>
        <Text style={styles.outlineLabel}>{block.label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.pulseContainer}>
      <TouchableOpacity activeOpacity={0.85} onPress={handlePress}>
        <LinearGradient
          colors={variant === 'discipline_gold'
            ? ['#F6D98D', '#E7B944', '#B8860B']
            : ['#fff8dc', '#f6d365', '#d4af37', '#b8860b', '#fff8dc']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.borderGradient, variant === 'discipline_gold' && styles.disciplineBorderGradient]}
        >
          <LinearGradient
            colors={variant === 'discipline_gold'
              ? ['#EABB47', '#D6A224', '#EABB47']
              : ['#c49a3c', '#d4a853', '#c49a3c']}
            style={[styles.innerButton, variant === 'discipline_gold' && styles.disciplineInnerButton]}
          >
            <View style={styles.contentContainer}>
              <Text style={[styles.label, variant === 'discipline_gold' && styles.disciplineLabel]}>{block.label}</Text>
              {block.subtext && <Text style={styles.subtext}>{block.subtext}</Text>}
            </View>
          </LinearGradient>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  pulseContainer: {
    marginVertical: 12,
    alignSelf: 'center',
    shadowColor: '#C49A3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  borderGradient: {
    padding: 2, // Border thickness
    borderRadius: 50,
  },
  disciplineBorderGradient: {
    borderRadius: 42,
    padding: 3,
  },
  innerButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  disciplineInnerButton: {
    minWidth: 220,
    paddingVertical: 18,
    paddingHorizontal: 42,
    borderRadius: 38,
    shadowColor: '#A87514',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  contentContainer: {
    alignItems: 'center',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'Inter_600SemiBold',
  },
  disciplineLabel: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond_700Bold',
    letterSpacing: 0.2,
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

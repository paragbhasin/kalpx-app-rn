import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';
import { useScreenStore } from '../engine/useScreenBridge';

interface PracticeStepsBlockProps {
  block: {
    steps?: string[];
    steps_key?: string;
    style?: any;
  };
}

const PracticeStepsBlock: React.FC<PracticeStepsBlockProps> = ({ block }) => {
  const { screenData: screenState } = useScreenStore();

  const steps: string[] =
    block.steps ||
    (block.steps_key ? (screenState[block.steps_key] as string[]) : null) ||
    [];

  if (steps.length === 0) return null;

  return (
    <View style={[styles.container, block?.style]}>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepRow}>
          <View style={styles.numberCircle}>
            <Text style={styles.numberText}>{index + 1}</Text>
          </View>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    marginVertical: 16,
    gap: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  numberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C9A84C',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  numberText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C9A84C',
    fontFamily: Fonts.sans.semiBold,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#432104',
    fontFamily: Fonts.sans.regular,
    lineHeight: 24,
  },
});

export default PracticeStepsBlock;

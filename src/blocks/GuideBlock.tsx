/**
 * GuideBlock — Step-by-step guide with numbered circles.
 * Similar to PracticeStepsBlock but styled as a guide card.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';

interface GuideBlockProps {
  block: {
    title?: string;
    steps: string[];
    style?: any;
  };
  textColor?: string;
}

const GuideBlock: React.FC<GuideBlockProps> = ({ block, textColor }) => {
  const steps = block.steps || [];
  if (steps.length === 0) return null;

  return (
    <View style={[styles.container, block?.style]}>
      {Boolean(block.title) && (
        <Text style={[styles.title, textColor ? { color: textColor } : null]}>{block.title}</Text>
      )}

      {steps.map((step, index) => (
        <View key={index} style={styles.stepRow}>
          <View style={styles.stepIndicator}>
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>{index + 1}</Text>
            </View>
            {index < steps.length - 1 && <View style={styles.connector} />}
          </View>
          <Text style={[styles.stepText, textColor ? { color: textColor } : null]}>{step}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '93%',
    alignSelf: 'center',
    marginVertical: 16,
    paddingVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#432104',
    fontFamily: Fonts.sans.semiBold,
    marginBottom: 16,
    textAlign: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    gap: 14,
    minHeight: 50,
  },
  stepIndicator: {
    alignItems: 'center',
    width: 32,
  },
  numberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(201, 168, 76, 0.15)',
    borderWidth: 1,
    borderColor: '#C9A84C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C9A84C',
    fontFamily: Fonts.sans.semiBold,
  },
  connector: {
    flex: 1,
    width: 1,
    backgroundColor: 'rgba(201, 168, 76, 0.3)',
    marginVertical: 4,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#432104',
    fontFamily: Fonts.sans.regular,
    lineHeight: 22,
    paddingTop: 3,
    paddingBottom: 12,
  },
});

export default GuideBlock;

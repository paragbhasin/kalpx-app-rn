import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';

interface RepCounterFeedbackBlockProps {
  block: {
    completed?: number;
    total?: number;
    label?: string;
    style?: any;
  };
}

const RepCounterFeedbackBlock: React.FC<RepCounterFeedbackBlockProps> = ({ block }) => {
  const completed = block.completed || 0;
  const total = block.total || 0;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <View style={[styles.container, block?.style]}>
      <Text style={styles.count}>
        {completed} <Text style={styles.separator}>of</Text> {total}
      </Text>
      {Boolean(block.label) && <Text style={styles.label}>{block.label}</Text>}

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
    width: '93%',
    alignSelf: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.3)',
    backgroundColor: 'rgba(255, 253, 249, 0.8)',
  },
  count: {
    fontSize: 32,
    fontWeight: '700',
    color: '#432104',
    fontFamily: Fonts.serif.bold,
  },
  separator: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(67, 33, 4, 0.5)',
    fontFamily: Fonts.sans.regular,
  },
  label: {
    fontSize: 13,
    color: 'rgba(67, 33, 4, 0.6)',
    fontFamily: Fonts.sans.regular,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 12,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(201, 168, 76, 0.15)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#C9A84C',
  },
});

export default RepCounterFeedbackBlock;

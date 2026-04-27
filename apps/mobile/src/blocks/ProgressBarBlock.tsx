import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';

interface ProgressBarBlockProps {
  block: {
    current: number;
    total: number;
    label?: string;
    style?: any;
  };
}

const ProgressBarBlock: React.FC<ProgressBarBlockProps> = ({ block }) => {
  const current = Number(block.current) || 0;
  const total = Number(block.total) || 1;
  const progress = Math.min(current / total, 1);

  return (
    <View style={[styles.container, block?.style]}>
      {Boolean(block.label) && <Text style={styles.label}>{block.label}</Text>}

      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
      </View>

      <Text style={styles.progressText}>
        {current} / {total}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 12,
    gap: 8,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#bfa58a',
    fontWeight: '600',
    fontFamily: Fonts.sans.semiBold,
  },
  barBackground: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(201, 168, 76, 0.12)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#C9A84C',
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(67, 33, 4, 0.6)',
    fontFamily: Fonts.sans.regular,
    textAlign: 'right',
  },
});

export default ProgressBarBlock;

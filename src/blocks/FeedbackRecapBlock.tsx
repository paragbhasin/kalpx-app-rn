import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';

interface FeedbackRecapBlockProps {
  block: {
    timing_label?: string;
    quality_label?: string;
    timing_value?: string;
    quality_value?: string;
    items?: Array<{ label: string; value: string }>;
    style?: any;
  };
}

const FeedbackRecapBlock: React.FC<FeedbackRecapBlockProps> = ({ block }) => {
  // Support both explicit fields and generic items array
  const items = block.items || [
    ...(block.timing_label ? [{ label: block.timing_label, value: block.timing_value || '' }] : []),
    ...(block.quality_label ? [{ label: block.quality_label, value: block.quality_value || '' }] : []),
  ];

  return (
    <View style={[styles.card, block?.style]}>
      {items.map((item, index) => (
        <View key={index} style={[styles.row, index < items.length - 1 && styles.rowBorder]}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.3)',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    backgroundColor: 'rgba(255, 253, 249, 0.8)',
    width: '93%',
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 168, 76, 0.15)',
  },
  label: {
    fontSize: 13,
    color: 'rgba(67, 33, 4, 0.6)',
    fontFamily: Fonts.sans.regular,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 15,
    color: '#432104',
    fontFamily: Fonts.sans.semiBold,
  },
});

export default FeedbackRecapBlock;

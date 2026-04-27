/**
 * GraphBlock — Simple bar/line graph for metrics.
 * Uses basic View bars (no chart library).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';

interface DataPoint {
  label: string;
  value: number;
}

interface GraphBlockProps {
  block: {
    data: DataPoint[];
    title?: string;
    max_value?: number;
    variant?: 'bar' | 'line';
    style?: any;
  };
}

const GraphBlock: React.FC<GraphBlockProps> = ({ block }) => {
  const data = block.data || [];
  const maxValue = block.max_value || Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={[styles.container, block?.style]}>
      {Boolean(block.title) && <Text style={styles.title}>{block.title}</Text>}

      <View style={styles.chartArea}>
        {data.map((point, i) => {
          const heightPct = Math.min((point.value / maxValue) * 100, 100);
          return (
            <View key={i} style={styles.barColumn}>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { height: `${heightPct}%` }]} />
              </View>
              <Text style={styles.barLabel}>{point.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '93%',
    alignSelf: 'center',
    marginVertical: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 253, 249, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.2)',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#432104',
    fontFamily: Fonts.sans.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
    textAlign: 'center',
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 120,
    gap: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  barTrack: {
    width: '60%',
    height: 100,
    backgroundColor: 'rgba(201, 168, 76, 0.08)',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#C9A84C',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    color: 'rgba(67, 33, 4, 0.5)',
    fontFamily: Fonts.sans.regular,
    textAlign: 'center',
  },
});

export default GraphBlock;

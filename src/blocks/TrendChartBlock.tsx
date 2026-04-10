/**
 * TrendChartBlock — Mini trend chart (engaged vs completed days sparkline).
 * View-based bars, no external chart libraries.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useScreenStore } from '../engine/useScreenBridge';
import { Fonts } from '../theme/fonts';

interface TrendChartBlockProps {
  block: {
    title?: string;
    data?: number[];
    labels?: string[];
    engaged_days?: number;
    total_days?: number;
    data_key?: string;
    style?: any;
  };
}

const TrendChartBlock: React.FC<TrendChartBlockProps> = ({ block }) => {
  const screenData = useScreenStore((s) => s.screenData);

  // Prefer data from screenState (checkpoint_trend_graph or block.data_key)
  const stateGraph =
    (block.data_key && screenData[block.data_key]) ||
    screenData.checkpoint_trend_graph ||
    {};
  const stateEngaged = stateGraph.engaged || stateGraph.engagedDays || [];
  const stateLabels =
    stateGraph.labels ||
    (stateEngaged.length > 0
      ? stateEngaged.map((_: any, i: number) => `${i + 1}`)
      : []);

  const data: number[] =
    block.data && block.data.length > 0 ? block.data : stateEngaged;
  const labels: string[] =
    block.labels && block.labels.length > 0 ? block.labels : stateLabels;
  const maxVal = Math.max(...data, 1);

  const engagedDays =
    block.engaged_days != null
      ? block.engaged_days
      : screenData.checkpoint_days_engaged;
  const totalDays =
    block.total_days != null
      ? block.total_days
      : screenData.checkpoint_total_days;

  return (
    <View style={[styles.container, block?.style]}>
      {Boolean(block.title) && <Text style={styles.title}>{block.title}</Text>}

      {/* Summary stats */}
      {(engagedDays != null || totalDays != null) && (
        <View style={styles.statsRow}>
          {engagedDays != null && (
            <View style={styles.stat}>
              <Text style={styles.statValue}>{engagedDays}</Text>
              <Text style={styles.statLabel}>Engaged</Text>
            </View>
          )}
          {totalDays != null && (
            <View style={styles.stat}>
              <Text style={styles.statValue}>{totalDays}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          )}
        </View>
      )}

      {/* Sparkline bars */}
      {data.length > 0 && (
        <View style={styles.sparkline}>
          {data.map((val, i) => {
            const h = Math.max((val / maxVal) * 40, 2);
            return (
              <View key={i} style={styles.sparkCol}>
                <View
                  style={[
                    styles.sparkBar,
                    { height: h },
                    val > 0 ? styles.sparkBarActive : null,
                  ]}
                />
                {Boolean(labels[i]) && <Text style={styles.sparkLabel}>{labels[i]}</Text>}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '93%',
    alignSelf: 'center',
    marginVertical: 12,
    padding: 16,
    backgroundColor: 'rgba(255, 253, 249, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.2)',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#432104',
    fontFamily: Fonts.sans.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#C9A84C',
    fontFamily: Fonts.serif.bold,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(67, 33, 4, 0.5)',
    fontFamily: Fonts.sans.regular,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sparkline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 56,
    gap: 2,
  },
  sparkCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  sparkBar: {
    width: '70%',
    borderRadius: 2,
    backgroundColor: 'rgba(201, 168, 76, 0.15)',
  },
  sparkBarActive: {
    backgroundColor: '#C9A84C',
  },
  sparkLabel: {
    fontSize: 8,
    color: 'rgba(67, 33, 4, 0.4)',
    fontFamily: Fonts.sans.regular,
  },
});

export default TrendChartBlock;

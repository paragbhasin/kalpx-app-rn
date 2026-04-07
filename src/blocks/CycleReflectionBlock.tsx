import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';

interface MetricItem {
  label: string;
  value: string | number;
  icon?: string;
}

interface CycleReflectionBlockProps {
  block: {
    day?: number;
    headline?: string;
    subtext?: string;
    metrics?: MetricItem[];
    style?: any;
  };
}

const CycleReflectionBlock: React.FC<CycleReflectionBlockProps> = ({ block }) => {
  return (
    <View style={[styles.container, block?.style]}>
      {/* Day badge */}
      {block.day != null && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Day {block.day}</Text>
        </View>
      )}

      {Boolean(block.headline) && <Text style={styles.headline}>{block.headline}</Text>}
      {Boolean(block.subtext) && <Text style={styles.subtext}>{block.subtext}</Text>}

      {/* Metrics grid */}
      {block.metrics && block.metrics.length > 0 && (
        <View style={styles.metricsGrid}>
          {block.metrics.map((metric, index) => (
            <View key={index} style={styles.metricCard}>
              {Boolean(metric.icon) && <Text style={styles.metricIcon}>{metric.icon}</Text>}
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '93%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.3)',
    borderRadius: 24,
    padding: 24,
    marginVertical: 12,
    backgroundColor: 'rgba(255, 253, 249, 0.9)',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(201, 168, 76, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: Fonts.sans.semiBold,
    color: '#C9A84C',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headline: {
    fontSize: 22,
    fontWeight: '700',
    color: '#432104',
    fontFamily: Fonts.serif.bold,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 8,
  },
  subtext: {
    fontSize: 15,
    color: 'rgba(67, 33, 4, 0.7)',
    fontFamily: Fonts.sans.regular,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  metricCard: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.2)',
    backgroundColor: 'rgba(201, 168, 76, 0.06)',
    minWidth: '40%',
    gap: 4,
  },
  metricIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#432104',
    fontFamily: Fonts.serif.bold,
  },
  metricLabel: {
    fontSize: 11,
    color: 'rgba(67, 33, 4, 0.6)',
    fontFamily: Fonts.sans.regular,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});

export default CycleReflectionBlock;

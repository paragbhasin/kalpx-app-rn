/**
 * ActivityStatsBlock — rendered on day 14 milestone screen.
 * Shows counts of checkin, trigger, mantra, sankalp, core practice activities.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useScreenStore } from '../engine/useScreenBridge';
import { Fonts } from '../theme/fonts';

interface ActivityStatsBlockProps {
  block: {
    data_key?: string;
    style?: any;
  };
}

interface StatItem {
  label: string;
  value: number | string;
  icon: string;
}

const ActivityStatsBlock: React.FC<ActivityStatsBlockProps> = ({ block }) => {
  const screenData = useScreenStore((s) => s.screenData);

  const dataKey = block.data_key || 'milestone_activity_stats';
  const data = screenData[dataKey] || {};

  const stats: StatItem[] = [
    { label: 'Check-ins', value: data.checkin || data.checkins || 0, icon: '\u{1F9D8}' },
    { label: 'Triggers', value: data.trigger || data.triggers || 0, icon: '\u{1F4A8}' },
    { label: 'Mantras', value: data.mantra || data.mantras || 0, icon: '\u{1F4FF}' },
    { label: 'Sankalps', value: data.sankalp || data.sankalps || 0, icon: '\u{1FAB7}' },
    { label: 'Practices', value: data.practice || data.practices || data.core || 0, icon: '\u{1F31F}' },
  ];

  return (
    <View style={[styles.container, block?.style]}>
      <Text style={styles.title}>Your 14 days, at a glance</Text>
      <View style={styles.grid}>
        {stats.map((stat, idx) => (
          <View key={idx} style={styles.card}>
            <Text style={styles.icon}>{stat.icon}</Text>
            <Text style={styles.value}>{stat.value}</Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const GOLD = '#C9A84C';
const DARK = '#432104';

const styles = StyleSheet.create({
  container: {
    width: '93%',
    alignSelf: 'center',
    marginVertical: 12,
    padding: 18,
    backgroundColor: 'rgba(255, 253, 249, 0.9)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.2)',
  },
  title: {
    fontSize: 13,
    color: GOLD,
    fontFamily: Fonts.sans.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    textAlign: 'center',
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  card: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(201, 168, 76, 0.08)',
    minWidth: '28%',
    flex: 1,
    gap: 4,
  },
  icon: {
    fontSize: 22,
  },
  value: {
    fontSize: 22,
    color: DARK,
    fontFamily: Fonts.serif.bold,
  },
  label: {
    fontSize: 10,
    color: 'rgba(67, 33, 4, 0.6)',
    fontFamily: Fonts.sans.regular,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});

export default ActivityStatsBlock;

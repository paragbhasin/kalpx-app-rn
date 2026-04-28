/**
 * TimelineBlock — Vertical timeline with milestone markers.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';

interface TimelineItem {
  label: string;
  description?: string;
  completed?: boolean;
  active?: boolean;
}

interface TimelineBlockProps {
  block: {
    items: TimelineItem[];
    title?: string;
    style?: any;
  };
  textColor?: string;
}

const TimelineBlock: React.FC<TimelineBlockProps> = ({ block, textColor }) => {
  const items = block.items || [];
  if (items.length === 0) return null;

  return (
    <View style={[styles.container, block?.style]}>
      {Boolean(block.title) && (
        <Text style={[styles.title, textColor ? { color: textColor } : null]}>{block.title}</Text>
      )}

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const dotStyle = item.completed
          ? styles.dotCompleted
          : item.active
            ? styles.dotActive
            : styles.dotPending;

        return (
          <View key={index} style={styles.row}>
            <View style={styles.indicator}>
              <View style={[styles.dot, dotStyle]} />
              {!isLast && (
                <View style={[styles.line, item.completed ? styles.lineCompleted : null]} />
              )}
            </View>
            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.label,
                  item.completed && styles.labelCompleted,
                  textColor ? { color: textColor } : null,
                ]}
              >
                {item.label}
              </Text>
              {Boolean(item.description) && (
                <Text style={[styles.description, textColor ? { color: textColor, opacity: 0.6 } : null]}>
                  {item.description}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '93%',
    alignSelf: 'center',
    marginVertical: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#432104',
    fontFamily: Fonts.sans.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    minHeight: 50,
  },
  indicator: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  dotCompleted: {
    backgroundColor: '#C9A84C',
  },
  dotActive: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#C9A84C',
  },
  dotPending: {
    backgroundColor: 'rgba(201, 168, 76, 0.2)',
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(201, 168, 76, 0.2)',
    marginVertical: 4,
  },
  lineCompleted: {
    backgroundColor: 'rgba(201, 168, 76, 0.5)',
  },
  textContainer: {
    flex: 1,
    paddingBottom: 16,
  },
  label: {
    fontSize: 15,
    color: '#432104',
    fontFamily: Fonts.sans.medium,
    lineHeight: 20,
  },
  labelCompleted: {
    color: 'rgba(67, 33, 4, 0.5)',
  },
  description: {
    fontSize: 13,
    color: 'rgba(67, 33, 4, 0.5)',
    fontFamily: Fonts.sans.regular,
    lineHeight: 18,
    marginTop: 4,
  },
});

export default TimelineBlock;

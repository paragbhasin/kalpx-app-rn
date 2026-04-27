/**
 * PracticeBlock — Simple practice info display.
 * Shows practice name, duration, and optional description.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';

interface PracticeBlockProps {
  block: {
    title: string;
    duration?: string;
    description?: string;
    icon?: string;
    style?: any;
  };
  textColor?: string;
}

const PracticeBlock: React.FC<PracticeBlockProps> = ({ block, textColor }) => {
  return (
    <View style={[styles.container, block?.style]}>
      <View style={styles.header}>
        {Boolean(block.icon) && <Text style={styles.icon}>{block.icon}</Text>}
        <View style={styles.headerText}>
          <Text style={[styles.title, textColor ? { color: textColor } : null]}>
            {block.title}
          </Text>
          {Boolean(block.duration) && (
            <Text style={styles.duration}>{block.duration}</Text>
          )}
        </View>
      </View>

      {Boolean(block.description) && (
        <Text style={[styles.description, textColor ? { color: textColor } : null]}>
          {block.description}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '93%',
    alignSelf: 'center',
    marginVertical: 8,
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 253, 249, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#432104',
    fontFamily: Fonts.sans.semiBold,
  },
  duration: {
    fontSize: 12,
    color: 'rgba(67, 33, 4, 0.5)',
    fontFamily: Fonts.sans.regular,
  },
  description: {
    fontSize: 14,
    color: 'rgba(67, 33, 4, 0.7)',
    fontFamily: Fonts.sans.regular,
    lineHeight: 20,
    marginTop: 10,
  },
});

export default PracticeBlock;

/**
 * SankalpBlock — Simple sankalp vow display.
 * Different from SankalpDisplayBlock which pulls from companion data.
 * This renders inline content from the block data.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';

interface SankalpBlockProps {
  block: {
    content: string;
    label?: string;
    style?: any;
  };
  textColor?: string;
}

const SankalpBlock: React.FC<SankalpBlockProps> = ({ block, textColor }) => {
  return (
    <View style={[styles.container, block?.style]}>
      {Boolean(block.label) && (
        <Text style={styles.label}>{block.label || 'Your Sankalp'}</Text>
      )}
      <Text style={styles.quoteMark}>{'\u201C'}</Text>
      <Text style={[styles.sankalpText, textColor ? { color: textColor } : null]}>
        {block.content}
      </Text>
      <Text style={styles.quoteMarkRight}>{'\u201D'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '93%',
    alignSelf: 'center',
    alignItems: 'center',
    marginVertical: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#bfa58a',
    fontFamily: Fonts.sans.semiBold,
    marginBottom: 8,
  },
  quoteMark: {
    fontSize: 40,
    fontFamily: Fonts.serif.bold,
    color: '#D9AD43',
    opacity: 0.3,
    marginBottom: -16,
  },
  sankalpText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 20,
    color: '#432104',
    textAlign: 'center',
    lineHeight: 28,
    fontStyle: 'italic',
    paddingHorizontal: 10,
  },
  quoteMarkRight: {
    fontSize: 40,
    fontFamily: Fonts.serif.bold,
    color: '#D9AD43',
    opacity: 0.3,
    marginTop: -16,
    alignSelf: 'flex-end',
    marginRight: 10,
  },
});

export default SankalpBlock;

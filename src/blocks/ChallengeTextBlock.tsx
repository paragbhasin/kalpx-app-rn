/**
 * ChallengeTextBlock — Displays challenge description text (bold, centered).
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';

interface ChallengeTextBlockProps {
  block: {
    content: string;
    style?: any;
  };
  textColor?: string;
}

const ChallengeTextBlock: React.FC<ChallengeTextBlockProps> = ({ block, textColor }) => {
  return (
    <Text style={[styles.text, textColor ? { color: textColor } : null, block?.style]}>
      {block.content}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    textAlign: 'center',
    lineHeight: 26,
    marginVertical: 12,
    paddingHorizontal: 16,
  },
});

export default ChallengeTextBlock;

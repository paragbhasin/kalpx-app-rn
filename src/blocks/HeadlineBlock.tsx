import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface HeadlineBlockProps {
  block: any;
  textColor?: string;
}

const HeadlineBlock: React.FC<HeadlineBlockProps> = ({ block, textColor }) => {
  return (
    <Text style={[styles.headline, textColor ? { color: textColor } : null, block.style]}>
      {block.content}
    </Text>
  );
};

const styles = StyleSheet.create({
  headline: {
    fontSize: 20,
    fontWeight: '700',
    color: '#432104',
    marginBottom: 12,
    fontFamily: 'CormorantGaramond_700Bold',
    textAlign: 'center',
    lineHeight: 28,
  },
});

export default HeadlineBlock;

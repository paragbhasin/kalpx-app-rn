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
    fontSize: 28,
    fontWeight: '700',
    color: '#432104',
    marginBottom: 12,
    fontFamily: 'GelicaBold',
    textAlign: 'center',
    lineHeight: 34,
  },
});

export default HeadlineBlock;

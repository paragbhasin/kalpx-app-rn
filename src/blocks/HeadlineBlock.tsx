import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface HeadlineBlockProps {
  block: {
    content: string;
    variant?: string;
    style?: any;
  };
}

const HeadlineBlock: React.FC<HeadlineBlockProps> = ({ block }) => {
  return (
    <Text style={[styles.headline, block.style]}>
      {block.content}
    </Text>
  );
};

const styles = StyleSheet.create({
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    fontFamily: 'GelicaBold',
    textAlign: 'center',
    lineHeight: 34,
  },
});

export default HeadlineBlock;

import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface SubtextBlockProps {
  block: {
    content: string;
    variant?: string;
    style?: any;
  };
}

const SubtextBlock: React.FC<SubtextBlockProps> = ({ block }) => {
  return (
    <Text style={[styles.subtext, block.variant === 'small' && styles.small, block.style]}>
      {block.content}
    </Text>
  );
};

const styles = StyleSheet.create({
  subtext: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 26,
    marginBottom: 20,
    fontFamily: 'GelicaRegular',
    textAlign: 'center',
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default SubtextBlock;

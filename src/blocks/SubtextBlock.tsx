import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface SubtextBlockProps {
  block: any;
  textColor?: string;
}

const SubtextBlock: React.FC<SubtextBlockProps> = ({ block, textColor }) => {
  return (
    <Text style={[
      styles.subtext, 
      block.variant === 'small' && styles.small, 
      textColor ? { color: textColor } : null, 
      block.style
    ]}>
      {block.content}
    </Text>
  );
};

const styles = StyleSheet.create({
  subtext: {
    fontSize: 14,
    color: 'rgba(67, 33, 4, 0.8)',
    lineHeight: 20,
    marginBottom: 20,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default SubtextBlock;

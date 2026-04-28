import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';

interface MicroLabelBlockProps {
  block: {
    content: string;
    style?: any;
  };
  textColor?: string;
}

const MicroLabelBlock: React.FC<MicroLabelBlockProps> = ({ block, textColor }) => {
  return (
    <Text style={[styles.label, textColor ? { color: textColor } : null, block?.style]}>
      {block.content}
    </Text>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#C9A84C',
    fontFamily: Fonts.sans.semiBold,
    textAlign: 'center',
    marginBottom: 8,
  },
});

export default MicroLabelBlock;

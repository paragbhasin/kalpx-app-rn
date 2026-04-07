import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';

interface HelperTextBlockProps {
  block: {
    content: string;
    style?: any;
  };
}

const HelperTextBlock: React.FC<HelperTextBlockProps> = ({ block }) => {
  return (
    <Text style={[styles.helper, block?.style]}>
      {block.content}
    </Text>
  );
};

const styles = StyleSheet.create({
  helper: {
    fontSize: 12,
    fontStyle: 'italic',
    color: 'rgba(67, 33, 4, 0.5)',
    fontFamily: Fonts.sans.regular,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
});

export default HelperTextBlock;

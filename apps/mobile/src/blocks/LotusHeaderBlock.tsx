import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';

interface LotusHeaderBlockProps {
  block: {
    content: string;
    icon?: string;
    style?: any;
  };
  textColor?: string;
}

const LotusHeaderBlock: React.FC<LotusHeaderBlockProps> = ({ block, textColor }) => {
  return (
    <View style={[styles.container, block?.style]}>
      <Text style={styles.lotus}>{block.icon || '\u2740'}</Text>
      <Text style={[styles.headline, textColor ? { color: textColor } : null]}>
        {block.content}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  lotus: {
    fontSize: 28,
    color: '#C9A84C',
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: '#432104',
    fontFamily: Fonts.serif.bold,
    textAlign: 'center',
    lineHeight: 30,
  },
});

export default LotusHeaderBlock;

/**
 * MantraBlock — Simple mantra text display.
 * Different from MantraDisplayBlock (which has rep counting, audio, etc.)
 * This is just text display for summaries and info screens.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';

interface MantraBlockProps {
  block: {
    content: string;
    transliteration?: string;
    meaning?: string;
    style?: any;
  };
  textColor?: string;
}

const MantraBlock: React.FC<MantraBlockProps> = ({ block, textColor }) => {
  return (
    <View style={[styles.container, block?.style]}>
      <Text style={[styles.mantraText, textColor ? { color: textColor } : null]}>
        {block.content}
      </Text>

      {Boolean(block.transliteration) && (
        <Text style={[styles.transliteration, textColor ? { color: textColor, opacity: 0.7 } : null]}>
          {block.transliteration}
        </Text>
      )}

      {Boolean(block.meaning) && (
        <Text style={[styles.meaning, textColor ? { color: textColor, opacity: 0.6 } : null]}>
          {block.meaning}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '93%',
    alignSelf: 'center',
    alignItems: 'center',
    marginVertical: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.2)',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 253, 249, 0.6)',
  },
  mantraText: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    textAlign: 'center',
    lineHeight: 32,
  },
  transliteration: {
    fontSize: 14,
    fontFamily: Fonts.sans.regular,
    color: 'rgba(67, 33, 4, 0.7)',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  meaning: {
    fontSize: 13,
    fontFamily: Fonts.sans.regular,
    color: 'rgba(67, 33, 4, 0.5)',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
});

export default MantraBlock;

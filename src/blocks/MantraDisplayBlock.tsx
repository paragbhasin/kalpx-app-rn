import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Fonts } from '../theme/fonts';
import { useScreenStore } from '../engine/useScreenBridge';

interface MantraDisplayBlockProps {
  block: {
    text_key?: string;
    devanagari_key?: string;
    iast_key?: string;
    style?: any;
  };
}

const MantraDisplayBlock: React.FC<MantraDisplayBlockProps> = ({ block }) => {
  const { screenData: screenState } = useScreenStore();

  const iastText = screenState[block.text_key || ''] || screenState[block.iast_key || ''] || '';
  const devanagariText = screenState[block.devanagari_key || ''] || '';

  const [isMantraExpanded, setMantraExpanded] = useState(false);
  const [isHindiExpanded, setHindiExpanded] = useState(false);

  const showMantraToggle = iastText && iastText.length > 60;
  const showHindiToggle = devanagariText && devanagariText.length > 40;

  return (
    <View style={styles.container}>
      {/* IAST / transliteration text */}
      {Boolean(iastText) && (
        <TouchableOpacity
          style={[styles.verseGroup, showMantraToggle && styles.hasToggle]}
          activeOpacity={0.8}
          onPress={() => setMantraExpanded(!isMantraExpanded)}
        >
          <Text
            style={styles.verseIast}
            numberOfLines={isMantraExpanded ? undefined : 2}
          >
            {iastText}
          </Text>
          {showMantraToggle && (
            <Text style={styles.toggleIcon}>
              {isMantraExpanded ? '\u25B2' : '\u25BC'}
            </Text>
          )}
        </TouchableOpacity>
      )}

      {/* Devanagari text */}
      {Boolean(devanagariText) && (
        <TouchableOpacity
          style={[styles.verseGroup, showHindiToggle && styles.hasToggle]}
          activeOpacity={0.8}
          onPress={() => setHindiExpanded(!isHindiExpanded)}
        >
          <Text
            style={styles.verseDevanagari}
            numberOfLines={isHindiExpanded ? undefined : 2}
          >
            {devanagariText}
          </Text>
          {showHindiToggle && (
            <Text style={styles.toggleIcon}>
              {isHindiExpanded ? '\u25B2' : '\u25BC'}
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
    marginVertical: 12,
    gap: 12,
  },
  verseGroup: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(184, 148, 80, 0.1)',
    padding: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  hasToggle: {
    paddingBottom: 28,
  },
  verseIast: {
    fontSize: 15,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#432104',
    fontFamily: Fonts.serif.regular,
    fontWeight: '400',
    opacity: 0.8,
    lineHeight: 22,
    textAlign: 'center',
  },
  verseDevanagari: {
    fontSize: 18,
    lineHeight: 26,
    color: '#432104',
    fontWeight: '500',
    textAlign: 'center',
  },
  toggleIcon: {
    position: 'absolute',
    bottom: 6,
    fontSize: 10,
    color: '#B89450',
  },
});

export default MantraDisplayBlock;

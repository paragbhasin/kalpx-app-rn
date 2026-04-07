import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';
import { useScreenStore } from '../engine/useScreenBridge';

interface TextareaBlockProps {
  block: {
    id: string;
    placeholder?: string;
    character_limit?: number;
    preload_existing?: boolean;
    style?: any;
  };
}

const TextareaBlock: React.FC<TextareaBlockProps> = ({ block }) => {
  const { screenData: screenState } = useScreenStore();
  const charLimit = block.character_limit || 120;

  const [text, setText] = useState<string>(
    (screenState[block.id] as string) || '',
  );

  const onChangeText = (value: string) => {
    const trimmed = value.slice(0, charLimit);
    setText(trimmed);

    // Update screenData
    const { screenActions } = require('../store/screenSlice');
    const { store } = require('../store');
    store.dispatch(screenActions.setScreenValue({ key: block.id, value: trimmed }));
  };

  return (
    <View style={[styles.card, block?.style]}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={onChangeText}
        placeholder={block.placeholder || 'Write your intention...'}
        placeholderTextColor="rgba(67, 33, 4, 0.3)"
        maxLength={charLimit}
        multiline
        textAlignVertical="top"
      />
      <Text style={styles.charCount}>
        {text.length} / {charLimit}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 0.5,
    borderColor: '#d0902d',
    borderRadius: 20,
    padding: 24,
    width: '93%',
    alignSelf: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  input: {
    width: '100%',
    fontFamily: Fonts.serif.regular,
    fontSize: 20,
    lineHeight: 32,
    color: '#1a1a1a',
    minHeight: 150,
  },
  charCount: {
    position: 'absolute',
    bottom: 16,
    right: 20,
    fontSize: 12,
    color: '#999',
    fontFamily: Fonts.sans.regular,
  },
});

export default TextareaBlock;

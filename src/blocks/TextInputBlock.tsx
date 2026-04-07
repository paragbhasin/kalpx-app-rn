import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';
import { useScreenStore } from '../engine/useScreenBridge';

interface TextInputBlockProps {
  block: {
    id: string;
    placeholder?: string;
    label?: string;
    character_limit?: number;
    style?: any;
  };
}

const TextInputBlock: React.FC<TextInputBlockProps> = ({ block }) => {
  const { screenData: screenState } = useScreenStore();
  const charLimit = block.character_limit || 80;

  const [text, setText] = useState<string>(
    (screenState[block.id] as string) || '',
  );

  const onChangeText = (value: string) => {
    const trimmed = value.slice(0, charLimit);
    setText(trimmed);

    const { screenActions } = require('../store/screenSlice');
    const { store } = require('../store');
    store.dispatch(screenActions.setScreenValue({ key: block.id, value: trimmed }));
  };

  return (
    <View style={[styles.container, block?.style]}>
      {Boolean(block.label) && <Text style={styles.label}>{block.label}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={onChangeText}
          placeholder={block.placeholder || 'Type here...'}
          placeholderTextColor="rgba(67, 33, 4, 0.3)"
          maxLength={charLimit}
          multiline={false}
          returnKeyType="done"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '93%',
    alignSelf: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: 'rgba(67, 33, 4, 0.6)',
    fontFamily: Fonts.sans.regular,
    marginBottom: 8,
  },
  inputWrapper: {
    borderWidth: 0.5,
    borderColor: '#d0902d',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  input: {
    fontFamily: Fonts.sans.regular,
    fontSize: 16,
    color: '#1a1a1a',
    height: 44,
  },
});

export default TextInputBlock;

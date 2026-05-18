/**
 * TextPhase — inline text input / journal step.
 *
 * Keyboard-safe. Companion line + prompt + text area.
 * CTA and skip at bottom.
 */
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/fonts';

interface Props {
  companionLine: string;
  prompt: string;
  placeholder: string;
  ctaLabel: string;
  maxChars?: number;
  onSave: (text: string) => void;
  onSkip: () => void;
}

const TextPhase: React.FC<Props> = ({
  companionLine,
  prompt,
  placeholder,
  ctaLabel,
  maxChars = 1000,
  onSave,
  onSkip,
}) => {
  const [text, setText] = useState('');
  const insets = useSafeAreaInsets();
  const charsLeft = maxChars - text.length;
  const nearLimit = charsLeft < 60;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.top + 8}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {companionLine ? (
          <Text style={styles.companion}>{companionLine}</Text>
        ) : null}

        <Text style={styles.prompt}>{prompt}</Text>

        <TextInput
          style={styles.input}
          value={text}
          onChangeText={(t) => setText(t.slice(0, maxChars))}
          placeholder={placeholder}
          placeholderTextColor="#B8A898"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          autoFocus
        />

        {nearLimit && (
          <Text style={styles.charCount}>{charsLeft} remaining</Text>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => onSave(text.trim())}
            activeOpacity={0.7}
          >
            <Text style={styles.ctaText}>{ctaLabel}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onSkip} style={styles.skipBtn} hitSlop={{ top: 8, bottom: 8 }}>
            <Text style={styles.skipText}>Move forward without writing</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default TextPhase;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  companion: {
    fontSize: 14,
    color: Colors.textSoft,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
    fontFamily: Fonts.sans.regular,
    fontStyle: 'italic',
  },
  prompt: {
    fontSize: 20,
    fontFamily: Fonts.serif.regular,
    color: '#432104',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 20,
  },
  input: {
    minHeight: 120,
    backgroundColor: 'rgba(255, 253, 247, 0.9)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.goldHairline,
    padding: 14,
    fontSize: 15,
    color: '#432104',
    fontFamily: Fonts.sans.regular,
    lineHeight: 22,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 11,
    color: '#B8A898',
    textAlign: 'right',
    marginBottom: 12,
    fontFamily: Fonts.sans.regular,
  },
  actions: {
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  ctaBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 24,
    paddingVertical: 13,
    paddingHorizontal: 36,
  },
  ctaText: {
    fontSize: 15,
    fontFamily: Fonts.sans.medium,
    color: '#fff',
    letterSpacing: 0.3,
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 13,
    color: '#B8A898',
    fontFamily: Fonts.sans.regular,
    textDecorationLine: 'underline',
  },
});

/**
 * ReachOutPhase — inline reach out step.
 *
 * Companion line + optional contact field + message textarea.
 * CTA: "Copy and go" → copies to clipboard + dispatches completion.
 * Secondary: "I'll reach out my own way" → dispatches without text.
 * Escape: "I'll go now" → skips.
 */
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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

const ReachOutPhase: React.FC<Props> = ({
  companionLine,
  prompt,
  placeholder,
  ctaLabel,
  maxChars = 500,
  onSave,
  onSkip,
}) => {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleCopyAndGo() {
    const trimmed = text.trim();
    if (trimmed) {
      try {
        await Share.share({ message: trimmed });
        setCopied(true);
        onSave(trimmed);
      } catch {
        onSave(trimmed);
      }
    } else {
      onSave('');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
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
          numberOfLines={4}
          textAlignVertical="top"
          autoFocus
        />

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={handleCopyAndGo}
            activeOpacity={0.7}
          >
            <Text style={styles.ctaText}>
              {copied ? 'Shared ✓' : ctaLabel}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onSave('')}
            style={styles.secondaryBtn}
            hitSlop={{ top: 8, bottom: 8 }}
          >
            <Text style={styles.secondaryText}>I'll reach out my own way</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSkip}
            style={styles.skipBtn}
            hitSlop={{ top: 8, bottom: 8 }}
          >
            <Text style={styles.skipText}>I'll go now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ReachOutPhase;

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
    color: '#8A7968',
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
    minHeight: 110,
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
    marginBottom: 20,
  },
  actions: {
    alignItems: 'center',
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
  secondaryBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  secondaryText: {
    fontSize: 13,
    color: '#8A7968',
    fontFamily: Fonts.sans.regular,
    textDecorationLine: 'underline',
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  skipText: {
    fontSize: 13,
    color: '#B8A898',
    fontFamily: Fonts.sans.regular,
    textDecorationLine: 'underline',
  },
});

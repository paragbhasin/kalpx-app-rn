/**
 * GroundingPhase — inline 30s grounding step.
 *
 * Renders a single instruction + optional text input.
 * 30s timer (from step_config.duration_sec or default).
 * Auto-completes at zero; escape available.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/fonts';
import type { StepPayload } from '../types';

interface Props {
  stepPayload: StepPayload | null | undefined;
  companionLine: string;
  onComplete: (text?: string) => void;
  onEscape: () => void;
}

const GroundingPhase: React.FC<Props> = ({ stepPayload, companionLine, onComplete, onEscape }) => {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';
  const sc = stepPayload?.step_config;
  const totalSec =
    typeof sc?.['duration_sec'] === 'number' && sc['duration_sec'] > 0
      ? sc['duration_sec']
      : 30;

  const [remaining, setRemaining] = useState(totalSec);
  const [text, setText] = useState('');
  const completedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Keep text accessible in effects without stale closure
  const textRef = useRef(text);
  useEffect(() => { textRef.current = text; }, [text]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Completion fires in a separate effect so it never runs inside a state updater
  useEffect(() => {
    if (remaining === 0 && !completedRef.current) {
      completedRef.current = true;
      onComplete(textRef.current || undefined);
    }
    // onComplete intentionally excluded — changes to it must not re-trigger this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  function handleEscape() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!completedRef.current) {
      completedRef.current = true;
      onEscape();
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

        <Text style={[styles.instruction, isHindi && { letterSpacing: 0 }]}>{t('room.phases.grounding.instruction')}</Text>

        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={t('room.phases.grounding.inputPlaceholder')}
          placeholderTextColor="#B8A898"
          multiline
          numberOfLines={3}
          returnKeyType="default"
          onSubmitEditing={Keyboard.dismiss}
        />
        <Text style={[styles.hint, isHindi && { letterSpacing: 0 }]}>{t('room.phases.grounding.writingOptional')}</Text>

        <Text style={styles.timer}>{remaining}s</Text>

        <TouchableOpacity onPress={handleEscape} style={styles.escapeBtn} hitSlop={{ top: 8, bottom: 8 }}>
          <Text style={[styles.escapeText, isHindi && { letterSpacing: 0 }]}>{t('room.phases.common.illGoNow')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default GroundingPhase;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  companion: {
    fontSize: 15,
    color: Colors.textSoft,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    fontFamily: Fonts.sans.regular,
  },
  instruction: {
    fontSize: 22,
    fontFamily: Fonts.serif.regular,
    color: '#432104',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 24,
  },
  input: {
    width: '100%',
    minHeight: 80,
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
  hint: {
    fontSize: 12,
    color: '#B8A898',
    fontFamily: Fonts.sans.regular,
    fontStyle: 'italic',
    marginBottom: 24,
    textAlign: 'center',
  },
  timer: {
    fontSize: 14,
    color: '#B8A898',
    fontFamily: Fonts.sans.regular,
    marginBottom: 32,
    letterSpacing: 0.5,
  },
  escapeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  escapeText: {
    fontSize: 13,
    color: '#B8A898',
    fontFamily: Fonts.sans.regular,
    textDecorationLine: 'underline',
  },
});

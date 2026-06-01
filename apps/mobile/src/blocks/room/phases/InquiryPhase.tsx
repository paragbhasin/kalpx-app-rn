/**
 * InquiryPhase — inline recognition cards + detail view.
 *
 * List sub-phase: full-width cards showing anchor_line (not category label).
 * Detail sub-phase: anchor_line as frame + reflective_prompt + optional textarea.
 *
 * No modal wrapper. Renders directly inside RoomJourneyRenderer.
 *
 * Exit semantics:
 *   onEscape   → opens exit confirm sheet (room-level exit, "I'll go now")
 *   onSkipStep → advances to next step without writing ("Move forward")
 */
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/fonts';
import type { InquiryCategory } from '../types';

interface InquiryListProps {
  categories: InquiryCategory[];
  companionLine: string;
  onSelect: (category: InquiryCategory) => void;
  onSkipStep: () => void;  // advance to next action (step-skip)
  onEscape: () => void;    // open exit confirm sheet (room-exit)
}

interface InquiryDetailProps {
  category: InquiryCategory;
  reflectivePrompt: string;
  onSave: (categoryId: string, text: string) => void;  // saves text + advances
  onSkip: () => void;   // "Move forward without writing" — saves empty + advances
  onEscape: () => void; // "I'll go now" — opens exit confirm sheet
}

// ─── InquiryList ─────────────────────────────────────────────────────────────

export const InquiryList: React.FC<InquiryListProps> = ({
  categories, companionLine, onSelect, onSkipStep, onEscape,
}) => {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';
  return (
    <ScrollView contentContainerStyle={styles.listScroll} showsVerticalScrollIndicator={false}>
      {companionLine ? (
        <Text style={styles.companion}>{companionLine}</Text>
      ) : null}

      <Text style={[styles.listLabel, isHindi && { letterSpacing: 0 }]}>{t('room.phases.inquiry.listLabel')}</Text>

      {categories.map((cat) => (
        <Pressable
          key={cat.id}
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => onSelect(cat)}
          accessibilityRole="button"
          accessibilityLabel={cat.anchor_line || cat.label}
        >
          <Text style={styles.cardText}>{cat.anchor_line || cat.label}</Text>
        </Pressable>
      ))}

      {/* Step-skip: advance without choosing */}
      <TouchableOpacity onPress={onSkipStep} style={styles.skipBtn} hitSlop={{ top: 8, bottom: 8 }}>
        <Text style={[styles.skipText, isHindi && { letterSpacing: 0 }]}>{t('room.phases.inquiry.moveOnForNow')}</Text>
      </TouchableOpacity>

      {/* Visual divider before room-exit */}
      <View style={styles.exitDivider} />

      {/* Room-exit: opens exit confirm, never advances */}
      <TouchableOpacity onPress={onEscape} style={styles.exitBtn} hitSlop={{ top: 8, bottom: 8 }}>
        <Text style={[styles.exitText, isHindi && { letterSpacing: 0 }]}>{t('room.phases.common.illGoNow')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// ─── InquiryDetail ────────────────────────────────────────────────────────────

export const InquiryDetail: React.FC<InquiryDetailProps> = ({
  category, reflectivePrompt, onSave, onSkip, onEscape,
}) => {
  const [text, setText] = useState('');
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top + 8}
    >
      <ScrollView contentContainerStyle={styles.detailScroll} keyboardShouldPersistTaps="handled">
        {/* Frame — anchor_line */}
        <Text style={styles.anchorFrame}>{category.anchor_line || category.label}</Text>

        {/* Question */}
        <Text style={styles.question}>{reflectivePrompt}</Text>

        {/* Optional text area */}
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={t('room.phases.inquiry.inputPlaceholder')}
          placeholderTextColor="#B8A898"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <View style={styles.detailActions}>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => onSave(category.id, text.trim())}
            activeOpacity={0.7}
          >
            <Text style={[styles.ctaText, isHindi && { letterSpacing: 0 }]}>{t('room.phases.inquiry.letThisLand')}</Text>
          </TouchableOpacity>

          {/* Step-skip: saves empty text, advances */}
          <TouchableOpacity
            onPress={() => onSkip()}
            style={styles.skipBtn}
            hitSlop={{ top: 8, bottom: 8 }}
          >
            <Text style={[styles.skipText, isHindi && { letterSpacing: 0 }]}>{t('room.phases.common.moveForwardWithoutWriting')}</Text>
          </TouchableOpacity>

          {/* Visual divider before room-exit */}
          <View style={styles.exitDivider} />

          {/* Room-exit: opens exit confirm, never advances */}
          <TouchableOpacity onPress={onEscape} style={styles.exitBtn} hitSlop={{ top: 8, bottom: 8 }}>
            <Text style={[styles.exitText, isHindi && { letterSpacing: 0 }]}>{t('room.phases.common.illGoNow')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  listScroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  companion: {
    fontSize: 15,
    color: Colors.textSoft,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    fontFamily: Fonts.sans.regular,
    fontStyle: 'italic',
  },
  listLabel: {
    fontSize: 13,
    color: '#8b7a55',
    fontFamily: Fonts.sans.medium,
    textAlign: 'center',
    letterSpacing: 0.8,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: 'rgba(255, 253, 247, 0.95)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.goldHairline,
    padding: 18,
    marginBottom: 10,
  },
  cardPressed: {
    backgroundColor: Colors.goldPale,
  },
  cardText: {
    fontSize: 16,
    fontFamily: Fonts.serif.regular,
    color: '#432104',
    lineHeight: 24,
  },
  // Step-skip (advance without choosing/writing)
  skipBtn: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 16,
  },
  skipText: {
    fontSize: 13,
    color: '#8A7968',
    fontFamily: Fonts.sans.regular,
    textDecorationLine: 'underline',
  },
  // Thin divider separating step-skip from room-exit
  exitDivider: {
    width: 32,
    height: 1,
    backgroundColor: Colors.goldHairline,
    opacity: 0.5,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  // Room-exit ("I'll go now") — lighter than step-skip to signal different intent
  exitBtn: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  exitText: {
    fontSize: 12,
    color: '#C4B49A',
    fontFamily: Fonts.sans.regular,
    textDecorationLine: 'underline',
  },
  detailScroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  anchorFrame: {
    fontSize: 15,
    fontFamily: Fonts.sans.regular,
    fontStyle: 'italic',
    color: '#8b6914',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  question: {
    fontSize: 24,
    fontFamily: Fonts.serif.regular,
    color: '#432104',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 20,
  },
  input: {
    minHeight: 100,
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
  detailActions: {
    alignItems: 'center',
    gap: 0,
  },
  ctaBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 24,
    paddingVertical: 13,
    paddingHorizontal: 36,
    marginBottom: 16,
  },
  ctaText: {
    fontSize: 15,
    fontFamily: Fonts.sans.medium,
    color: '#fff',
    letterSpacing: 0.3,
  },
});

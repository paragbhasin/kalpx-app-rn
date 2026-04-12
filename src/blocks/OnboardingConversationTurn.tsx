/**
 * OnboardingConversationTurn — Atomic "Mitra speaks, user replies" block.
 *
 * Web counterpart: kalpx-frontend/src/engine/BlockRenderer.vue (mitra_message+chip_list composite)
 *   Closest web equivalents: src/blocks/MitraMessageCard (conceptual, no direct file) +
 *   src/blocks/ChipListBlock + inline input pattern used in ConversationContainer.vue.
 * Spec: docs/specs/mitra-v3-experience/screens/route_welcome_onboarding.md §1, §10
 * Regression cases guarded:
 *   - REG-001: state cleanup on next-turn transition (we do not persist draft inside block state)
 *   - REG-015: no auto-completion when user has not tapped (only action.type=onboarding_turn_response)
 *   - REG-016: input placeholder shown only when block.open_input.enabled (turns 4/5 are binary)
 *
 * Tone rules: no exclamations, no "Great!", no emoji, no streak language.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Fonts } from '../theme/fonts';
import { useScreenStore } from '../engine/useScreenBridge';
import { executeAction } from '../engine/actionExecutor';
import { interpolate } from '../engine/utils/interpolation';

interface Props {
  block: {
    id?: string;
    mitra_message?: string | string[];
    reply_chips?: Array<{ id: string; label: string; style?: 'primary' | 'secondary' }>;
    open_input?: { enabled?: boolean; placeholder?: string; max_length?: number };
    voice_available?: boolean;
    on_response?: any; // base action object; { chip_id } or { freeform_text } merged into payload
  };
}

const GOLD = '#eddeb4';
const DEEP_BROWN = '#432104';
const CREAM = '#fffdf9';

const OnboardingConversationTurn: React.FC<Props> = ({ block }) => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const replyAnim = useRef(new Animated.Value(0)).current;
  const [text, setText] = useState('');

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(replyAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, replyAnim]);

  const messages = Array.isArray(block.mitra_message)
    ? block.mitra_message
    : [block.mitra_message || ''];

  const fire = async (payload: Record<string, any>) => {
    if (!block.on_response) return;
    const base = interpolate(block.on_response, screenData);
    try {
      await executeAction(
        { ...base, payload: { ...(base.payload || {}), ...payload }, currentScreen },
        {
          loadScreen,
          goBack,
          setScreenValue: (value: any, key: string) => {
            const { screenActions } = require('../store/screenSlice');
            const { store } = require('../store');
            store.dispatch(screenActions.setScreenValue({ key, value }));
          },
          screenState: { ...screenData },
        },
      );
    } catch (err) {
      console.error('[OnboardingConversationTurn] action failed', err);
    }
  };

  return (
    <View style={styles.wrap}>
      {messages.some((m) => m && String(m).trim().length > 0) && (
        <Animated.View style={[styles.mitraMsgCard, { opacity: fadeAnim }]}>
          {messages.map((para, i) =>
            para && String(para).trim().length > 0 ? (
              <Text key={i} style={[styles.mitraMsg, i > 0 && { marginTop: 12 }]}>
                {interpolate(para, screenData)}
              </Text>
            ) : null,
          )}
        </Animated.View>
      )}

      <Animated.View style={{ opacity: replyAnim }}>
        {(block.reply_chips || []).map((chip) => (
          <TouchableOpacity
            key={chip.id}
            style={[
              styles.chip,
              chip.style === 'primary' ? styles.chipPrimary : styles.chipSecondary,
            ]}
            activeOpacity={0.75}
            onPress={() => fire({ chip_id: chip.id, response_type: 'chip' })}
          >
            <Text
              style={[
                styles.chipLabel,
                chip.style === 'primary' && styles.chipLabelPrimary,
              ]}
            >
              {chip.label}
            </Text>
          </TouchableOpacity>
        ))}

        {block.open_input?.enabled && (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder={block.open_input.placeholder || 'Tell me more...'}
              placeholderTextColor="rgba(237,222,180,0.5)"
              value={text}
              onChangeText={setText}
              maxLength={block.open_input.max_length || 400}
              multiline
              onSubmitEditing={() => {
                if (text.trim().length > 0) {
                  fire({ freeform_text: text.trim(), response_type: 'text' });
                  setText('');
                }
              }}
              returnKeyType="send"
            />
            {block.voice_available && (
              <TouchableOpacity
                style={styles.micBtn}
                onPress={() => fire({ response_type: 'voice_requested' })}
              >
                <Text style={styles.micIcon}>◉</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginVertical: 12 },
  mitraMsgCard: {
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
    paddingLeft: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  mitraMsg: {
    fontFamily: Fonts.serif.regular,
    fontSize: 22,
    lineHeight: 32,
    color: DEEP_BROWN,
  },
  chip: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 10,
    borderWidth: 1,
  },
  chipPrimary: { backgroundColor: GOLD, borderColor: GOLD },
  chipSecondary: { backgroundColor: 'transparent', borderColor: GOLD },
  chipLabel: { fontFamily: Fonts.sans.medium, fontSize: 15, color: GOLD, textAlign: 'center' },
  chipLabelPrimary: { color: '#1a1a1a' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(237,222,180,0.2)',
    paddingTop: 12,
    marginTop: 16,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    color: GOLD,
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
  },
  micBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  micIcon: { color: GOLD, fontSize: 20 },
});

export default OnboardingConversationTurn;

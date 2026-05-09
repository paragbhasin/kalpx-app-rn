/**
 * TellMitraContainer — S04 Phase 2 Tell Mitra door.
 *
 * Embedded inside FourDoorHomeContainer for the tell_mitra door panel.
 * Submits user text to POST /api/mitra/v3/tell-mitra/ and routes based on
 * the normalized suggested_action:
 *   - navigate_to_room  → enter_room via executeAction
 *   - navigate_to_door  → navigate to DynamicEngine (FourDoor home)
 *   - provide_wisdom_inline → display response_copy inline
 *
 * Privacy: inputDraft is cleared via setTellMitraResult (reducer sets it to "")
 * so no raw text persists in Redux after submission.
 *
 * S17-D4B: Thread UI path behind EXPO_PUBLIC_MITRA_TELL_MITRA_THREAD_UI=1
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { Fonts } from '../theme/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { CHIP_SUBMIT_TEXT, getRoomLabel, isValidRoomId } from '@kalpx/contracts';
import type {
  TellMitraConversationItem,
  TellMitraFollowupMeta,
  TellMitraFollowupOption,
  TellMitraFollowupQuestion,
  TellMitraRoomEntryContext,
  TellMitraSupportDepth,
} from '@kalpx/types';
import { postTellMitraV3 } from '../engine/mitraApi';
import { executeAction } from '../engine/actionExecutor';
import { useScreenStore } from '../engine/useScreenBridge';
import { setTellMitraDraft, setTellMitraResult } from '../store/doorSlice';
import { screenActions, loadScreenWithData, goBackWithData } from '../store/screenSlice';

const MAX_CHARS = 1000;
const THREAD_UI_ENABLED = (process.env.EXPO_PUBLIC_MITRA_TELL_MITRA_THREAD_UI ?? '0') === '1';

function genId() { return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

export default function TellMitraContainer() {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const draft = useSelector(
    (state: any) => state.door?.tellMitra?.inputDraft ?? '',
  );

  // ── Shared state ─────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ── Flag-off state ────────────────────────────────────────────────────────
  const [resultCopy, setResultCopy] = useState('');
  const [suggestedRoomId, setSuggestedRoomId] = useState<string | null>(null);
  const [roomEntryCtx, setRoomEntryCtx] = useState<TellMitraRoomEntryContext | null>(null);
  const [conversationSummary, setConversationSummary] = useState<string | null>(null);
  const [followupQuestion, setFollowupQuestion] = useState<TellMitraFollowupQuestion | null>(null);
  const [supportDepth, setSupportDepth] = useState<TellMitraSupportDepth>("direct_room");
  const [parentEventId, setParentEventId] = useState<string | number | null>(null);
  const [parentIntentType, setParentIntentType] = useState<string | null>(null);
  const [secondaryRoomId, setSecondaryRoomId] = useState<string | null>(null);

  // ── Flag-on state ─────────────────────────────────────────────────────────
  const [conversation, setConversation] = useState<TellMitraConversationItem[]>([]);
  const [threadDraft, setThreadDraft] = useState('');
  const [composerPlaceholder, setComposerPlaceholder] = useState("What's on your mind?");
  const scrollViewRef = useRef<ScrollView>(null);
  const composerInputRef = useRef<TextInput>(null);

  const screenBridge = useScreenStore();
  const screenBridgeRef = React.useRef(screenBridge);
  useEffect(() => {
    screenBridgeRef.current = screenBridge;
  });

  const buildActionContext = useCallback(() => {
    return {
      screenState: screenBridgeRef.current.screenData || {},
      setScreenValue: (value: any, key: string) => {
        dispatch(screenActions.setScreenValue({ key, value }));
      },
      loadScreen: (target: any) => {
        const containerId =
          typeof target === 'string'
            ? 'generic'
            : target?.container_id || target?.containerId || 'generic';
        const stateId =
          typeof target === 'string'
            ? target
            : target?.state_id || target?.stateId || '';
        dispatch(loadScreenWithData({ containerId, stateId }) as any);
        navigation.navigate('DynamicEngine');
      },
      goBack: () => {
        dispatch(goBackWithData() as any);
      },
      currentScreen: screenBridgeRef.current.currentScreen,
    };
  }, [dispatch, navigation]);

  // ── Flag-off: original submit ─────────────────────────────────────────────
  const handleSubmit = async (override?: {
    text?: string;
    sourceSurface?: string;
    followup?: TellMitraFollowupMeta;
  }) => {
    const inputText = override?.text ?? draft;
    if (!inputText.trim()) {
      setErrorMsg("Please share what's on your mind");
      return;
    }
    if (inputText.length > MAX_CHARS) {
      setErrorMsg('Please keep it under 1000 characters');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const result = await postTellMitraV3({
        text: inputText,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        source_surface: override?.sourceSurface ?? 'tell_mitra_door',
        ...(override?.followup ? { followup: override.followup } : {}),
      });
      dispatch(
        setTellMitraResult({
          suggested_room_id: result.suggested_room_id,
          door: result.door,
          response_copy: result.response_copy,
          suggested_action: result.suggested_action,
        }),
      );
      if (result.response_copy) {
        setResultCopy(result.response_copy);
      }
      setSuggestedRoomId(result.suggested_room_id ?? null);
      setRoomEntryCtx(result.room_entry_context ?? null);
      setConversationSummary(result.conversation_context?.summary ?? null);
      setFollowupQuestion(result.followup_question ?? null);
      setSupportDepth(result.support_depth ?? "direct_room");
      setParentEventId(result.tell_mitra_event_id ?? null);
      setParentIntentType(result.intent_type ?? null);
      setSecondaryRoomId(result.secondary_room_id ?? null);

      if (
        result.suggested_action === 'navigate_to_room' &&
        isValidRoomId(result.suggested_room_id)
      ) {
        try {
          await executeAction(
            {
              type: 'enter_room',
              payload: {
                room_id: result.suggested_room_id,
                source: 'tell_mitra_door',
                room_entry_context: result.room_entry_context,
              },
            } as any,
            buildActionContext() as any,
          );
        } catch (navErr: any) {
          console.warn('[TellMitraContainer] room nav failed:', navErr?.message);
        }
      } else if (result.suggested_action === 'navigate_to_door' && result.door) {
        navigation.navigate("DynamicEngine" as any);
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Flag-off: original chip click ─────────────────────────────────────────
  const handleChipClick = (opt: TellMitraFollowupOption) => {
    if (opt.value === 'let_me_tell') {
      setResultCopy('');
      setFollowupQuestion(null);
      dispatch(setTellMitraDraft(''));
      return;
    }
    if (opt.value === 'calm_now') {
      void handleSubmit({
        text: 'Just help me calm down',
        sourceSurface: 'tell_mitra_followup_calm_now',
        followup: {
          prompt_id: null,
          selected_value: 'calm_now',
          selected_label: opt.label,
          parent_tell_mitra_event_id: parentEventId,
          parent_intent_type: parentIntentType,
        },
      });
      return;
    }
    const submitText = CHIP_SUBMIT_TEXT[opt.value] ?? opt.label;
    void handleSubmit({
      text: submitText,
      sourceSurface: 'tell_mitra_followup_chip',
      followup: {
        prompt_id: null,
        selected_value: opt.value,
        selected_label: opt.label,
        parent_tell_mitra_event_id: parentEventId,
        parent_intent_type: parentIntentType,
      },
    });
  };

  // ── Flag-on: thread submit ────────────────────────────────────────────────
  // Caller must append user_message/user_chip BEFORE calling this.
  const submitThread = async (
    inputText: string,
    sourceSurface: string,
    followupMeta?: TellMitraFollowupMeta,
  ) => {
    const loadingId = genId();
    const now = new Date().toISOString();
    setConversation(prev => [...prev, { id: loadingId, type: 'loading' }]);
    setIsSubmitting(true);
    try {
      const result = await postTellMitraV3({
        text: inputText.trim(),
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        source_surface: sourceSurface,
        ...(followupMeta ? { followup: followupMeta } : {}),
      });
      dispatch(
        setTellMitraResult({
          suggested_room_id: result.suggested_room_id,
          door: result.door,
          response_copy: result.response_copy,
          suggested_action: result.suggested_action,
        }),
      );
      const newItems: TellMitraConversationItem[] = [];
      if (result.safety_flag) {
        newItems.push({
          id: genId(), type: 'safety',
          response_copy: result.response_copy || 'You are not alone. Please speak to someone you trust right now.',
        });
      } else {
        newItems.push({
          id: genId(), type: 'mitra_response',
          response_copy: result.response_copy,
          prior_context_summary: result.prior_context_summary,
          conversation_stage: result.conversation_stage,
          support_depth: result.support_depth,
          created_at: now,
        });
        if (result.followup_question) {
          newItems.push({
            id: genId(), type: 'followup_chips',
            prompt: result.followup_question.prompt,
            options: result.followup_question.options,
            parent_tell_mitra_event_id: result.tell_mitra_event_id,
            parent_intent_type: result.intent_type,
            disabled: false,
          });
        } else if (result.suggested_action === 'navigate_to_room' && isValidRoomId(result.suggested_room_id)) {
          newItems.push({
            id: genId(), type: 'room_recommendation',
            room_id: result.suggested_room_id,
            room_label: result.suggested_room_label ?? getRoomLabel(result.suggested_room_id),
            room_description: result.suggested_room_description,
            secondary_room_id: result.secondary_room_id,
            tell_mitra_event_id: result.tell_mitra_event_id,
            room_entry_context: result.room_entry_context,
            response_copy: result.response_copy,
          });
        } else if (result.next_options.length > 0) {
          newItems.push({ id: genId(), type: 'wisdom_options', next_options: result.next_options });
        }
      }
      setConversation(prev => [...prev.filter(i => i.id !== loadingId), ...newItems]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {
      setConversation(prev => [
        ...prev.filter(i => i.id !== loadingId),
        { id: genId(), type: 'error', message: 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Flag-on: chip click ───────────────────────────────────────────────────
  const handleChipClickThread = (opt: TellMitraFollowupOption, chipGroupId: string) => {
    const chipGroup = conversation.find(
      (item): item is Extract<TellMitraConversationItem, { type: 'followup_chips' }> =>
        item.id === chipGroupId && item.type === 'followup_chips'
    );
    if (opt.value === 'let_me_tell') {
      setConversation(prev =>
        prev.map(item => item.id === chipGroupId ? { ...item, disabled: true } as TellMitraConversationItem : item)
      );
      setComposerPlaceholder('What would you like Mitra to know?');
      composerInputRef.current?.focus();
      return;
    }
    const userChip: TellMitraConversationItem = {
      id: genId(), type: 'user_chip',
      label: opt.label, value: opt.value,
      created_at: new Date().toISOString(),
    };
    setConversation(prev => [
      ...prev.map(item => item.id === chipGroupId ? { ...item, disabled: true } as TellMitraConversationItem : item),
      userChip,
    ]);
    const mappedText = CHIP_SUBMIT_TEXT[opt.value];
    if (!mappedText) console.warn('[TellMitra] Missing CHIP_SUBMIT_TEXT mapping', opt.value);
    const followupMeta: TellMitraFollowupMeta = {
      prompt_id: null,
      selected_value: opt.value,
      selected_label: opt.label,
      parent_tell_mitra_event_id: chipGroup?.parent_tell_mitra_event_id ?? null,
      parent_intent_type: chipGroup?.parent_intent_type ?? null,
    };
    if (opt.value === 'calm_now') {
      void submitThread('Just help me calm down', 'tell_mitra_followup_calm_now', followupMeta);
    } else {
      void submitThread(mappedText ?? opt.label, 'tell_mitra_followup_chip', followupMeta);
    }
  };

  const handleTellMitraMoreThread = () => {
    setComposerPlaceholder('Add anything else Mitra should understand…');
    composerInputRef.current?.focus();
  };

  // ── Flag-on: thread render ────────────────────────────────────────────────
  if (THREAD_UI_ENABLED) {
    return (
      <View style={threadStyles.root}>
        <ScrollView
          ref={scrollViewRef}
          style={threadStyles.scrollArea}
          contentContainerStyle={threadStyles.scrollContent}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          {conversation.length === 0 && (
            <View style={threadStyles.emptyState}>
              <Text style={threadStyles.emptyTitle}>Tell Mitra</Text>
              <Text style={threadStyles.emptySubtitle}>Share what you're carrying right now.</Text>
            </View>
          )}
          {conversation.map(item => {
            if (item.type === 'user_message') {
              return (
                <View key={item.id} style={threadStyles.userRow}>
                  <View style={threadStyles.userBubble}>
                    <Text style={threadStyles.userBubbleText}>{item.text}</Text>
                  </View>
                </View>
              );
            }
            if (item.type === 'user_chip') {
              return (
                <View key={item.id} style={threadStyles.userRow}>
                  <View style={threadStyles.userChipBubble}>
                    <Text style={threadStyles.userChipText}>{item.label}</Text>
                  </View>
                </View>
              );
            }
            if (item.type === 'mitra_response') {
              return (
                <View key={item.id} style={threadStyles.mitraBlock}>
                  <Text style={threadStyles.mitraLabel}>MITRA</Text>
                  {item.prior_context_summary ? (
                    <Text style={threadStyles.priorContextText}>{item.prior_context_summary}</Text>
                  ) : null}
                  <Text style={threadStyles.mitraResponseText}>{item.response_copy}</Text>
                </View>
              );
            }
            if (item.type === 'followup_chips') {
              return (
                <View key={item.id} style={threadStyles.chipsBlock}>
                  <Text style={threadStyles.chipsPrompt}>{item.prompt}</Text>
                  <View style={threadStyles.chipsWrap}>
                    {item.options.map(opt => (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => { if (!item.disabled && !isSubmitting) handleChipClickThread(opt, item.id); }}
                        disabled={item.disabled || isSubmitting}
                        style={[threadStyles.chip, (item.disabled || isSubmitting) && threadStyles.chipDisabled]}
                        activeOpacity={0.7}
                      >
                        <Text style={[threadStyles.chipText, item.disabled ? threadStyles.chipTextDisabled : undefined]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            }
            if (item.type === 'room_recommendation') {
              return (
                <View key={item.id} style={threadStyles.roomCard}>
                  <Text style={threadStyles.roomCardTitle}>{item.room_label}</Text>
                  {item.room_description ? (
                    <Text style={threadStyles.roomCardDesc}>{item.room_description}</Text>
                  ) : null}
                  <TouchableOpacity
                    style={threadStyles.goldBtn}
                    onPress={() => void executeAction(
                      { type: 'enter_room', payload: { room_id: item.room_id, source: 'tell_mitra', room_entry_context: item.room_entry_context } } as any,
                      buildActionContext() as any,
                    )}
                    activeOpacity={0.8}
                  >
                    <Text style={threadStyles.goldBtnText}>Enter {item.room_label}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={threadStyles.ghostLink} onPress={handleTellMitraMoreThread} activeOpacity={0.7}>
                    <Text style={threadStyles.ghostLinkText}>Tell Mitra more</Text>
                  </TouchableOpacity>
                  {item.secondary_room_id && item.secondary_room_id !== item.room_id ? (
                    <TouchableOpacity
                      style={threadStyles.ghostLink}
                      onPress={() => void executeAction(
                        { type: 'enter_room', payload: { room_id: item.secondary_room_id!, source: 'tell_mitra_secondary' } } as any,
                        buildActionContext() as any,
                      )}
                      activeOpacity={0.7}
                    >
                      <Text style={threadStyles.ghostLinkText}>
                        Or try {getRoomLabel(item.secondary_room_id as any)} →
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              );
            }
            if (item.type === 'wisdom_options') {
              return (
                <View key={item.id} style={threadStyles.wisdomBlock}>
                  <Text style={threadStyles.wisdomLabel}>OR TRY</Text>
                  {item.next_options.map((opt, i) => (
                    <TouchableOpacity
                      key={i}
                      style={threadStyles.ghostBtn}
                      onPress={() => {
                        if (opt.action_type === 'navigate_to_room' && opt.room_id) {
                          void executeAction(
                            { type: 'enter_room', payload: { room_id: opt.room_id, source: 'tell_mitra_next_option' } } as any,
                            buildActionContext() as any,
                          );
                        } else if (opt.action_type === 'navigate_to_door' && opt.door) {
                          navigation.navigate('DynamicEngine' as any);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={threadStyles.ghostBtnText}>{opt.label} — {opt.description}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              );
            }
            if (item.type === 'safety') {
              return (
                <View key={item.id} style={threadStyles.safetyCard}>
                  <Text style={threadStyles.safetyTitle}>Mitra hears you.</Text>
                  <Text style={threadStyles.safetyText}>{item.response_copy}</Text>
                </View>
              );
            }
            if (item.type === 'loading') {
              return (
                <View key={item.id} style={threadStyles.mitraBlock}>
                  <Text style={threadStyles.mitraLabel}>MITRA</Text>
                  <Text style={threadStyles.loadingDots}>…</Text>
                </View>
              );
            }
            if (item.type === 'error') {
              return (
                <View key={item.id} style={threadStyles.errorCard}>
                  <Text style={threadStyles.errorCardText}>{item.message}</Text>
                </View>
              );
            }
            return null;
          })}
        </ScrollView>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
          <View style={threadStyles.composerRow}>
            <TextInput
              ref={composerInputRef}
              style={threadStyles.composerInput}
              value={threadDraft}
              onChangeText={t => { setThreadDraft(t.slice(0, MAX_CHARS)); if (errorMsg) setErrorMsg(''); }}
              multiline
              placeholder={composerPlaceholder}
              placeholderTextColor="#9b8b77"
              maxLength={MAX_CHARS}
            />
            <TouchableOpacity
              style={[threadStyles.sendBtn, (isSubmitting || !threadDraft.trim()) && threadStyles.sendBtnDisabled]}
              onPress={() => {
                if (isSubmitting || !threadDraft.trim()) return;
                const input = threadDraft.trim();
                setConversation(prev => [...prev, { id: genId(), type: 'user_message', text: input, created_at: new Date().toISOString() }]);
                setThreadDraft('');
                void submitThread(input, 'tell_mitra_door');
              }}
              disabled={isSubmitting || !threadDraft.trim()}
              activeOpacity={0.8}
            >
              <Text style={threadStyles.sendBtnText}>{isSubmitting ? '…' : 'Send'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // ── Flag-off: original render (completely unchanged) ──────────────────────
  return (
    <View style={styles.root}>
      <TextInput
        style={styles.input}
        value={draft}
        onChangeText={(t) => dispatch(setTellMitraDraft(t.slice(0, MAX_CHARS)))}
        multiline
        placeholder="What's on your mind?"
        placeholderTextColor="#9b8b77"
        maxLength={MAX_CHARS}
      />
      <Text style={styles.charCount}>
        {draft.length} / {MAX_CHARS}
      </Text>
      {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
      {!!conversationSummary && (
        <Text style={styles.contextSummary}>{conversationSummary}</Text>
      )}
      {!!resultCopy && (
        <View style={styles.resultCard}>
          <Text style={styles.resultCardText}>{resultCopy}</Text>
        </View>
      )}
      {!!followupQuestion && (
        <View style={styles.chipsContainer}>
          <Text style={styles.chipsPrompt}>Want to help Mitra understand what feels heaviest?</Text>
          <View style={styles.chipsRow}>
            {followupQuestion.options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => handleChipClick(opt)}
                disabled={isSubmitting}
                style={[styles.chip, isSubmitting && styles.chipDisabled]}
                activeOpacity={0.7}
              >
                <Text style={styles.chipText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      {!!secondaryRoomId && !!suggestedRoomId && secondaryRoomId !== suggestedRoomId && (
        <TouchableOpacity
          onPress={() => void executeAction(
            {
              type: 'enter_room',
              payload: { room_id: secondaryRoomId, source: 'tell_mitra_secondary' },
            } as any,
            buildActionContext() as any,
          )}
          activeOpacity={0.7}
          style={styles.ghostLink}
          disabled={isSubmitting}
        >
          <Text style={styles.ghostLinkText}>Or try {getRoomLabel(secondaryRoomId as any)} →</Text>
        </TouchableOpacity>
      )}
      {!!resultCopy && (
        <TouchableOpacity
          onPress={() => navigation.navigate('QuickCheckin' as any)}
          activeOpacity={0.7}
          style={styles.ghostLink}
        >
          <Text style={styles.ghostLinkText}>Try Quick Check-in instead</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
        onPress={() => void handleSubmit()}
        disabled={isSubmitting}
        activeOpacity={0.8}
      >
        <Text style={styles.submitBtnText}>
          {isSubmitting ? 'Sending...' : 'Share with Mitra'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Flag-off styles (original, unchanged) ────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DAC28E',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#432104',
    minHeight: 80,
    backgroundColor: '#FFFCF6',
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#9b8b77',
    textAlign: 'right',
  },
  errorText: {
    fontSize: 13,
    color: '#c0392b',
  },
  contextSummary: {
    fontSize: 13,
    color: '#9b8b77',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  resultCard: {
    backgroundColor: 'rgba(255,253,250,0.96)',
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(201,168,76,0.6)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  resultCardText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 20,
    lineHeight: 34,
    color: '#432104',
    fontStyle: 'italic',
  },
  chipsContainer: {
    marginBottom: 12,
  },
  chipsPrompt: {
    fontSize: 13,
    color: '#7B6550',
    marginBottom: 8,
    fontFamily: Fonts.sans.regular,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.35)',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  chipDisabled: {
    opacity: 0.6,
  },
  chipText: {
    fontSize: 13,
    color: '#7B6550',
    fontFamily: Fonts.sans.regular,
  },
  submitBtn: {
    backgroundColor: '#D4A017',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  ghostLink: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  ghostLinkText: {
    fontSize: 14,
    color: '#9b8b77',
    fontFamily: Fonts.sans.regular,
    textDecorationLine: 'underline',
  },
});

// ── Flag-on styles (thread UI) ────────────────────────────────────────────────
const threadStyles = StyleSheet.create({
  root: { flex: 1 },
  scrollArea: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 12 },
  emptyState: { alignItems: 'center', paddingTop: 40 },
  emptyTitle: { fontFamily: Fonts.serif.regular, fontSize: 22, fontWeight: '700', color: '#432104', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: '#7B6550' },
  userRow: { alignItems: 'flex-end', marginBottom: 10 },
  userBubble: { backgroundColor: '#F5E9C8', borderRadius: 18, borderBottomRightRadius: 4, paddingVertical: 10, paddingHorizontal: 14, maxWidth: '78%' },
  userBubbleText: { fontSize: 15, color: '#432104', lineHeight: 22 },
  userChipBubble: { backgroundColor: 'rgba(201,168,76,0.1)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.35)', borderRadius: 16, borderBottomRightRadius: 4, paddingVertical: 6, paddingHorizontal: 12 },
  userChipText: { fontSize: 13, color: '#7B6550', fontStyle: 'italic', fontFamily: Fonts.sans.regular },
  mitraBlock: { marginBottom: 14 },
  mitraLabel: { fontSize: 10, color: '#A08060', fontWeight: '700', letterSpacing: 0.8, marginBottom: 5, fontFamily: Fonts.sans.regular },
  priorContextText: { fontSize: 12, color: '#7B6550', fontStyle: 'italic', marginBottom: 6, padding: 8, backgroundColor: 'rgba(201,168,76,0.05)', borderRadius: 6 },
  mitraResponseText: { fontFamily: Fonts.serif.regular, fontSize: 17, lineHeight: 28, color: '#432104' },
  loadingDots: { fontSize: 22, color: '#C9A84C', letterSpacing: 4 },
  chipsBlock: { marginBottom: 14 },
  chipsPrompt: { fontSize: 13, color: '#7B6550', marginBottom: 8, fontFamily: Fonts.sans.regular },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: 'rgba(201,168,76,0.35)', borderRadius: 20, paddingVertical: 7, paddingHorizontal: 14 },
  chipDisabled: { opacity: 0.45 },
  chipText: { fontSize: 13, color: '#7B6550', fontFamily: Fonts.sans.regular },
  chipTextDisabled: { color: '#BBAA99' },
  roomCard: { borderWidth: 1, borderColor: 'rgba(201,168,76,0.22)', borderRadius: 16, backgroundColor: '#FFFCF8', padding: 16, marginBottom: 14 },
  roomCardTitle: { fontFamily: Fonts.serif.regular, fontSize: 17, fontWeight: '700', color: '#432104', marginBottom: 4 },
  roomCardDesc: { fontSize: 13, color: '#7B6550', marginBottom: 12 },
  goldBtn: { backgroundColor: '#D4A017', borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 8 },
  goldBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  ghostLink: { paddingVertical: 8, alignItems: 'center' },
  ghostLinkText: { fontSize: 13, color: '#9b8b77', fontFamily: Fonts.sans.regular, textDecorationLine: 'underline' },
  wisdomBlock: { marginBottom: 14 },
  wisdomLabel: { fontSize: 10, color: '#A08060', fontWeight: '700', letterSpacing: 0.8, marginBottom: 8, fontFamily: Fonts.sans.regular },
  ghostBtn: { borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)', borderRadius: 10, padding: 12, marginBottom: 6 },
  ghostBtnText: { fontSize: 14, color: '#7B6550', fontFamily: Fonts.sans.regular },
  safetyCard: { backgroundColor: 'rgba(240,235,230,0.85)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)', borderRadius: 12, padding: 16, marginBottom: 14 },
  safetyTitle: { fontFamily: Fonts.serif.regular, fontSize: 16, fontWeight: '700', color: '#432104', marginBottom: 8 },
  safetyText: { fontSize: 15, lineHeight: 26, color: '#432104' },
  errorCard: { backgroundColor: 'rgba(220,50,50,0.04)', borderWidth: 1, borderColor: 'rgba(220,50,50,0.15)', borderRadius: 8, padding: 10, marginBottom: 10 },
  errorCardText: { fontSize: 13, color: '#c0392b' },
  composerRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, borderTopWidth: 1, borderTopColor: 'rgba(201,168,76,0.18)', backgroundColor: '#FAF7F2', paddingTop: 10, paddingBottom: 10, paddingHorizontal: 12 },
  composerInput: { flex: 1, borderWidth: 1, borderColor: '#DAC28E', borderRadius: 10, padding: 10, fontSize: 15, color: '#432104', minHeight: 44, maxHeight: 100, backgroundColor: '#FFFCF6', textAlignVertical: 'top' },
  sendBtn: { backgroundColor: '#D4A017', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
});

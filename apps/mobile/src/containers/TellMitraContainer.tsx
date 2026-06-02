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
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { Fonts } from '../theme/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { CHIP_SUBMIT_TEXT, getRoomLabel, isValidRoomId } from '@kalpx/contracts';
import TellMitraThreadView from '../components/mitra/TellMitraThreadView';
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
const THREAD_STORAGE_KEY = 'tell_mitra_thread_v1';
const RETURN_ROOM_KEY = 'tell_mitra_return_room_v1';

function genId() { return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

async function persistTellMitraThread(
  items: TellMitraConversationItem[],
): Promise<void> {
  try {
    await AsyncStorage.setItem(THREAD_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export default function TellMitraContainer() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const initialMessage = (route?.params as any)?.initialMessage as string | undefined;
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
  const [composerPlaceholder, setComposerPlaceholder] = useState(() => t('tellMitraInput.placeholder'));
  const scrollViewRef = useRef<any>(null);
  const composerInputRef = useRef<TextInput>(null);
  const pendingTellMitraReturnRef = useRef<{
    room_id: string; room_label: string;
    return_key: string;
    tell_mitra_event_id?: string | number | null;
    room_entry_context?: TellMitraRoomEntryContext | null;
  } | null>(null);
  const lastReturnCardKeyRef = useRef<string | null>(null);
  const freshResetPendingRef = useRef(false);

  // ── Prana entry (from quick check-in agitated/drained flow) ─────────────
  const activeContextRef = useRef<{
    parentEventId: string | number | null;
    parentIntentType: string | null;
    lifeContext: string | null;
    supportNeed: string | null;
    patternKey: string | null;
    roomEntryContext: TellMitraRoomEntryContext | null;
  }>({ parentEventId: null, parentIntentType: null, lifeContext: null, supportNeed: null, patternKey: null, roomEntryContext: null });

  const screenBridge = useScreenStore();
  const screenBridgeRef = React.useRef(screenBridge);
  useEffect(() => {
    screenBridgeRef.current = screenBridge;
  });

  useEffect(() => {
    if (!THREAD_UI_ENABLED) return;
    // Prana entry: wait for navigation animation to finish, then typewriter, then auto-submit.
    if (initialMessage) {
      let interval: ReturnType<typeof setInterval> | null = null;
      const startDelay = setTimeout(() => {
        let i = 0;
        interval = setInterval(() => {
          i += 1;
          setThreadDraft(initialMessage.slice(0, i));
          if (i >= initialMessage.length) {
            clearInterval(interval!);
            setTimeout(() => {
              void submitThread(initialMessage, 'tell_mitra_prana_entry', undefined, undefined, true);
              setThreadDraft('');
            }, 400);
          }
        }, 60);
      }, 500);
      return () => {
        clearTimeout(startDelay);
        if (interval) clearInterval(interval);
      };
    }
    let cancelled = false;
    (async () => {
      let restored: TellMitraConversationItem[] = [];
      try {
        const raw = await AsyncStorage.getItem(THREAD_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as TellMitraConversationItem[];
          if (Array.isArray(parsed)) restored = parsed;
        }
      } catch {}

      try {
        const returnRaw = await AsyncStorage.getItem(RETURN_ROOM_KEY);
        if (returnRaw) {
          const pending = JSON.parse(returnRaw) as {
            room_id: string;
            room_label: string;
            return_key?: string;
            tell_mitra_event_id?: string | number | null;
            room_entry_context?: TellMitraRoomEntryContext | null;
          };
          await AsyncStorage.removeItem(RETURN_ROOM_KEY);
          const alreadyHasReturn = restored.some(
            (item) =>
              item.type === 'return_card' &&
              (item.return_key
                ? item.return_key === pending.return_key
                : item.room_id === pending.room_id),
          );
          if (!alreadyHasReturn) {
            restored.push({
              id: genId(),
              type: 'return_card',
              room_id: pending.room_id,
              room_label: pending.room_label,
              return_key: pending.return_key,
              tell_mitra_event_id: pending.tell_mitra_event_id,
              room_entry_context: pending.room_entry_context,
            });
          }
        }
      } catch {}

      if (cancelled || restored.length === 0) return;
      setConversation(restored);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!THREAD_UI_ENABLED) return;
    void AsyncStorage.setItem(THREAD_STORAGE_KEY, JSON.stringify(conversation)).catch(
      () => {},
    );
  }, [conversation]);

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

  // ── Flag-on: return-from-room detection ───────────────────────────────────
  useFocusEffect(
    React.useCallback(() => {
      if (!THREAD_UI_ENABLED) return;
      const pending = pendingTellMitraReturnRef.current;
      if (!pending) return;
      pendingTellMitraReturnRef.current = null;
      if (lastReturnCardKeyRef.current === pending.return_key) return;
      lastReturnCardKeyRef.current = pending.return_key;
      setConversation(prev => {
        const alreadyHasReturn = prev.some(
          item => item.type === 'return_card' &&
            (item.return_key ? item.return_key === pending.return_key : item.room_id === pending.room_id)
        );
        if (alreadyHasReturn) return prev;
        return [...prev, {
          id: genId(), type: 'return_card',
          room_id: pending.room_id, room_label: pending.room_label,
          return_key: pending.return_key,
          tell_mitra_event_id: pending.tell_mitra_event_id,
          room_entry_context: pending.room_entry_context,
        }];
      });
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
      void AsyncStorage.removeItem(RETURN_ROOM_KEY).catch(() => {});
    }, [])
  );

  // ── Flag-off: original submit ─────────────────────────────────────────────
  const handleSubmit = async (override?: {
    text?: string;
    sourceSurface?: string;
    followup?: TellMitraFollowupMeta;
  }) => {
    const inputText = override?.text ?? draft;
    if (!inputText.trim()) {
      setErrorMsg(t('tellMitraInput.errorEmpty'));
      return;
    }
    if (inputText.length > MAX_CHARS) {
      setErrorMsg(t('tellMitraInput.errorTooLong'));
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
        navigation.navigate("Home" as any);
      }
    } catch {
      setErrorMsg(t('tellMitraInput.errorGeneric'));
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
    energyState?: string,
    forceReset?: boolean,
  ) => {
    const effectiveSource = freshResetPendingRef.current ? 'tell_mitra_start_fresh' : sourceSurface;
    const isReset = freshResetPendingRef.current || (forceReset === true);
    freshResetPendingRef.current = false;
    const loadingId = genId();
    const now = new Date().toISOString();
    setConversation(prev => [...prev, { id: loadingId, type: 'loading' }]);
    setIsSubmitting(true);
    try {
      if (__DEV__) console.log('[S17-D4B] chip payload', {
        text: inputText.trim(),
        source_surface: effectiveSource,
        reset_context: isReset,
        followup: followupMeta,
      });
      const result = await postTellMitraV3({
        text: inputText.trim(),
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        source_surface: effectiveSource,
        ...(followupMeta ? { followup: followupMeta } : {}),
        ...(isReset ? { reset_context: true } : {}),
        ...(energyState ? { energy_state: energyState } : {}),
      });
      if (__DEV__) console.log('[S17-D4B] tell_mitra response', {
        suggested_action: result.suggested_action,
        suggested_room_id: result.suggested_room_id,
        followup_question_prompt: result.followup_question?.prompt,
        tell_mitra_event_id: result.tell_mitra_event_id,
        room_entry_context: result.room_entry_context,
      });
      // Update active context from response
      activeContextRef.current = {
        parentEventId: result.tell_mitra_event_id ?? activeContextRef.current.parentEventId,
        parentIntentType: result.intent_type ?? activeContextRef.current.parentIntentType,
        lifeContext:
          result.room_entry_context?.situation?.life_context ??
          result.conversation_context?.current_life_context ??
          activeContextRef.current.lifeContext,
        supportNeed: result.support_need || activeContextRef.current.supportNeed,
        patternKey: result.pattern_key ?? activeContextRef.current.patternKey,
        roomEntryContext: result.room_entry_context ?? activeContextRef.current.roomEntryContext,
      };
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
        { id: genId(), type: 'error', message: t('tellMitraInput.errorGeneric') },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Flag-on: chip click ───────────────────────────────────────────────────
  const handleChipClickThread = (opt: TellMitraFollowupOption, chipGroupId: string) => {
    const isReturnCard = chipGroupId.startsWith('return_card_');
    const chipGroup = conversation.find(
      (item): item is Extract<TellMitraConversationItem, { type: 'followup_chips' }> =>
        item.id === chipGroupId && item.type === 'followup_chips'
    );
    let returnCardItem: Extract<TellMitraConversationItem, { type: 'return_card' }> | undefined;
    if (isReturnCard) {
      const rcId = chipGroupId.replace('return_card_', '');
      returnCardItem = conversation.find(
        (i): i is Extract<TellMitraConversationItem, { type: 'return_card' }> =>
          i.id === rcId && i.type === 'return_card'
      );
    }
    if (opt.value === 'let_me_tell') {
      setConversation(prev =>
        prev.map(item => item.id === chipGroupId ? { ...item, disabled: true } as TellMitraConversationItem : item)
      );
      setComposerPlaceholder(t('tellMitraInput.placeholderLetMeTell'));
      composerInputRef.current?.focus();
      return;
    }
    if (opt.value === 'tell_mitra_more') {
      handleTellMitraMoreThread();
      return;
    }
    // Disable chip group or return card
    if (isReturnCard) {
      const rcId = chipGroupId.replace('return_card_', '');
      setConversation(prev =>
        prev.map(item => item.id === rcId ? { ...item, disabled: true } as TellMitraConversationItem : item)
      );
    } else {
      setConversation(prev =>
        prev.map(item => item.id === chipGroupId ? { ...item, disabled: true } as TellMitraConversationItem : item)
      );
    }
    const userChip: TellMitraConversationItem = {
      id: genId(), type: 'user_chip',
      label: opt.label, value: opt.value,
      created_at: new Date().toISOString(),
    };
    setConversation(prev => [...prev, userChip]);
    const mappedText = CHIP_SUBMIT_TEXT[opt.value];
    const sourceSurface = isReturnCard ? 'room_return_chip' : 'tell_mitra_followup_chip';
    const followupMeta: TellMitraFollowupMeta = {
      prompt_id: null,
      selected_value: opt.value,
      selected_label: opt.label,
      parent_tell_mitra_event_id:
        returnCardItem?.tell_mitra_event_id ??
        chipGroup?.parent_tell_mitra_event_id ??
        activeContextRef.current.parentEventId ?? null,
      parent_intent_type:
        chipGroup?.parent_intent_type ??
        activeContextRef.current.parentIntentType ?? null,
      life_context:
        returnCardItem?.room_entry_context?.situation?.life_context ??
        activeContextRef.current.lifeContext ?? null,
    };
    if (opt.value === 'calm_now') {
      void submitThread('Just help me calm down', 'tell_mitra_followup_calm_now', followupMeta);
    } else {
      void submitThread(mappedText ?? opt.label, sourceSurface, followupMeta);
    }
  };

  const handleTellMitraMoreThread = () => {
    setComposerPlaceholder(t('tellMitraInput.placeholderTellMitraMore'));
    composerInputRef.current?.focus();
  };

  const handleQuickStartChipThread = (value: string, label: string) => {
    const apiText = value === 'calm_now'
      ? 'Just help me calm down'
      : (CHIP_SUBMIT_TEXT[value] ?? label);
    setConversation(prev => [...prev, { id: genId(), type: 'user_message', text: label, created_at: new Date().toISOString() }]);
    void submitThread(apiText, 'tell_mitra_quick_start');
  };

  const handleEnterRoomThread = (item: Extract<TellMitraConversationItem, { type: 'room_recommendation' }>) => {
    const returnKey = `return_card:${item.room_id}:${item.tell_mitra_event_id ?? Math.floor(Date.now() / 60000)}`;
    pendingTellMitraReturnRef.current = {
      room_id: item.room_id, room_label: item.room_label,
      return_key: returnKey,
      tell_mitra_event_id: item.tell_mitra_event_id,
      room_entry_context: item.room_entry_context,
    };
    void (async () => {
      await persistTellMitraThread(conversation);
      try {
        await AsyncStorage.setItem(
          RETURN_ROOM_KEY,
          JSON.stringify({
            room_id: item.room_id,
            room_label: item.room_label,
            tell_mitra_event_id: item.tell_mitra_event_id,
            room_entry_context: item.room_entry_context,
            timestamp: Date.now(),
            return_key: returnKey,
          }),
        );
      } catch {}
      await executeAction(
        {
          type: 'enter_room',
          payload: {
            room_id: item.room_id,
            source: 'tell_mitra',
            tell_mitra_event_id: item.tell_mitra_event_id,
            room_entry_context: item.room_entry_context,
          },
        } as any,
        buildActionContext() as any,
      );
    })();
  };

  // ── Flag-on: thread render ────────────────────────────────────────────────
  if (THREAD_UI_ENABLED) {
    return (
      <>
        <TellMitraThreadView
          conversation={conversation}
          submitting={isSubmitting}
          draft={threadDraft}
          composerPlaceholder={composerPlaceholder}
          inputRef={composerInputRef}
          scrollRef={scrollViewRef}
          onDraftChange={t => { setThreadDraft(t.slice(0, MAX_CHARS)); if (errorMsg) setErrorMsg(''); }}
          onSubmit={input => {
            setConversation(prev => [...prev, { id: genId(), type: 'user_message', text: input, created_at: new Date().toISOString() }]);
            setThreadDraft('');
            void submitThread(input, 'tell_mitra_door');
          }}
          onChipClick={handleChipClickThread}
          onEnterRoom={handleEnterRoomThread}
          onTellMitraMore={handleTellMitraMoreThread}
          onStartFresh={() => {
            setConversation([]);
            setThreadDraft('');
            setComposerPlaceholder(t('tellMitraInput.placeholder'));
            freshResetPendingRef.current = true;
            lastReturnCardKeyRef.current = null;
            pendingTellMitraReturnRef.current = null;
            activeContextRef.current = { parentEventId: null, parentIntentType: null, lifeContext: null, supportNeed: null, patternKey: null, roomEntryContext: null };
            void AsyncStorage.removeItem(THREAD_STORAGE_KEY).catch(() => {});
            void AsyncStorage.removeItem(RETURN_ROOM_KEY).catch(() => {});
          }}
          onQuickStartChip={handleQuickStartChipThread}
          onWisdomOptionPress={opt => {
            if (opt.action_type === 'navigate_to_room' && opt.room_id) {
              void executeAction(
                { type: 'enter_room', payload: { room_id: opt.room_id, source: 'tell_mitra_next_option' } } as any,
                buildActionContext() as any,
              );
            } else if (opt.action_type === 'navigate_to_door' && opt.door) {
              navigation.navigate('Home' as any);
            }
          }}
          buildActionContext={buildActionContext}
          errorMsg={errorMsg}
        />
      </>
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
        placeholder={t('tellMitraInput.placeholder')}
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
          <Text style={styles.chipsPrompt}>{t('tellMitraInput.chipsPrompt')}</Text>
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
          <Text style={styles.ghostLinkText}>{t('tellMitraInput.quickCheckinLink')}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
        onPress={() => void handleSubmit()}
        disabled={isSubmitting}
        activeOpacity={0.8}
      >
        <Text style={styles.submitBtnText}>
          {isSubmitting ? t('tellMitraInput.sending') : t('tellMitraInput.shareWithMitra')}
        </Text>
      </TouchableOpacity>
      <Text style={styles.disclaimerText}>
        {t('tellMitraInput.disclaimer')}
      </Text>
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
    backgroundColor: '#FAF7F2',
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
  disclaimerText: {
    fontSize: 11,
    color: '#9b8b77',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 4,
  },
});

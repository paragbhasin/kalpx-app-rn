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
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Fonts } from '../theme/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { getRoomLabel, isValidRoomId } from '@kalpx/contracts';
import type {
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

const CHIP_SUBMIT_TEXT: Record<string, string> = {
  // Pre-S17-D1 work chips
  workload:             "It is the workload that is overwhelming me",
  people:               "It is the people at work that is getting to me",
  pressure:             "I am feeling the pressure of expectations",
  fear_falling_behind:  "I am afraid of falling behind",
  physical_tired:       "I am physically exhausted",
  emotional_empty:      "I feel emotionally empty",
  no_motivation:        "I have no motivation to continue",
  vent:                 "I need to express what I am feeling",
  disconnected:         "I am feeling disconnected from everyone",
  conflict:             "I am in a conflict with someone close to me",
  immediate_worry:      "I have an immediate financial worry",
  ongoing_stress:       "I am dealing with ongoing financial stress",
  future_uncertainty:   "I feel uncertain about my financial future",
  // S17-D1 broad life-context chips
  work_career:          "Work and my career is where most of this weight is coming from",
  relationships:        "My relationships are where most of this weight is coming from",
  health_energy:        "My body and health is where most of this weight is coming from",
  money_security:       "Money and financial security is weighing on me the most",
  family:               "Family is where most of this weight is coming from",
  purpose_direction:    "Feeling lost or without direction is what is weighing on me",
  not_sure:             "I am not sure where this is coming from",
  // S17-D1 health context chips
  sleep:                "I can't sleep and it is wearing me down",
  physical_exhausted:   "I am physically exhausted and depleted",
  physical_concern:     "Something feels physically wrong and it is concerning me",
  pain:                 "I am in physical pain right now",
  // S17-D1 purpose context chips
  no_direction:         "I have no clear direction and do not know which way to go",
  no_meaning:           "Nothing feels meaningful right now",
  wrong_path:           "I feel like I am on the wrong path or in the wrong place",
  questioning:          "I am questioning everything right now",
  // S17-D1 growth chips
  daily_practice:       "I want to build a daily practice and create consistency",
  focus_clarity:        "I need more focus and clarity in my life",
  inner_steadiness:     "I want more inner steadiness and groundedness",
  facing_hard:          "I am facing something hard and need support moving through it",
  spiritual_deepening:  "I want to deepen my spiritual practice",
  // S17-D1 grief / loneliness chips
  loss_person:          "I have lost someone and I am grieving",
  relationship_ending:  "A relationship has ended and I am struggling with it",
  cut_off:              "I am feeling cut off from people I care about",
  lingering_hurt:       "There is hurt that stays with me and I cannot let it go",
  far_from_loved:       "I am far from the people I love and miss them",
  around_not_felt:      "I am around people but still feel completely alone",
  unseen:               "No one really knows me and I feel unseen",
  after_conflict:       "Something happened between me and someone and now I feel alone",
};

export default function TellMitraContainer() {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const draft = useSelector(
    (state: any) => state.door?.tellMitra?.inputDraft ?? '',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resultCopy, setResultCopy] = useState('');

  // S17-D0: conversational continuity state
  const [suggestedRoomId, setSuggestedRoomId] = useState<string | null>(null);
  const [roomEntryCtx, setRoomEntryCtx] = useState<TellMitraRoomEntryContext | null>(null);
  const [conversationSummary, setConversationSummary] = useState<string | null>(null);
  const [followupQuestion, setFollowupQuestion] = useState<TellMitraFollowupQuestion | null>(null);
  const [supportDepth, setSupportDepth] = useState<TellMitraSupportDepth>("direct_room");
  const [parentEventId, setParentEventId] = useState<string | number | null>(null);
  const [parentIntentType, setParentIntentType] = useState<string | null>(null);
  const [secondaryRoomId, setSecondaryRoomId] = useState<string | null>(null);

  // Mirror the buildActionContext pattern from ContinueJourney.tsx so
  // enter_room can resolve screenState, setScreenValue, loadScreen, goBack.
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
      // clearDoorState clears inputDraft — no raw text persists after submit
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

      // S17-D0: populate continuity state
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
        navigation.navigate("DynamicEngine" as any); // returns user to FourDoor home which has TellMitra visible
      }
      // provide_wisdom_inline: resultCopy already set above
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

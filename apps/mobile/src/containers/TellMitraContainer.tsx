/**
 * TellMitraContainer — S04 Phase 2 Tell Mitra door.
 *
 * Embedded inside FourDoorHomeContainer for the tell_mitra door panel.
 * Submits user text to POST /api/mitra/v3/tell-mitra/ and routes based on
 * the normalized suggested_action:
 *   - navigate_to_room  → enter_room via executeAction
 *   - navigate_to_door  → Alert with door label
 *   - provide_wisdom_inline → display response_copy inline
 *
 * Privacy: inputDraft is cleared via setTellMitraResult (reducer sets it to "")
 * so no raw text persists in Redux after submission.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { getDoorLabel, isValidRoomId } from '@kalpx/contracts';
import { postTellMitraV3 } from '../engine/mitraApi';
import { executeAction } from '../engine/actionExecutor';
import { useScreenStore } from '../engine/useScreenBridge';
import { setTellMitraDraft, setTellMitraResult } from '../store/doorSlice';
import { screenActions, loadScreenWithData, goBackWithData } from '../store/screenSlice';

const MAX_CHARS = 1000;

export default function TellMitraContainer() {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const draft = useSelector(
    (state: any) => state.door?.tellMitra?.inputDraft ?? '',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resultCopy, setResultCopy] = useState('');

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

  const handleSubmit = async () => {
    if (!draft.trim()) {
      setErrorMsg("Please share what's on your mind");
      return;
    }
    if (draft.length > MAX_CHARS) {
      setErrorMsg('Please keep it under 1000 characters');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const result = await postTellMitraV3({
        text: draft,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        source_surface: 'tell_mitra_door',
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
              },
            } as any,
            buildActionContext() as any,
          );
        } catch (navErr: any) {
          console.warn('[TellMitraContainer] room nav failed:', navErr?.message);
        }
      } else if (result.suggested_action === 'navigate_to_door' && result.door) {
        Alert.alert(getDoorLabel(result.door));
      }
      // provide_wisdom_inline: resultCopy already set above
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
      {!!resultCopy && <Text style={styles.resultCopy}>{resultCopy}</Text>}
      <TouchableOpacity
        style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
        onPress={handleSubmit}
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
  resultCopy: {
    fontSize: 15,
    color: '#432104',
    lineHeight: 24,
    fontStyle: 'italic',
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
});

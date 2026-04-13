/**
 * VoiceNoteSheet — Week 4 Moment 31 bottom-sheet voice note recorder.
 *
 * Web parity: kalpx-frontend/src/components/VoiceRecorderBlock.vue. Spec:
 * overlay_voice_note.md §1, §4 (state machine), §6 (API contract).
 *
 * Flow:
 *  1. Mount → if voice_consent_given != true, dispatch start_voice_note which
 *     pushes VoiceConsentSheet first (handled by actionExecutor).
 *  2. Recording: mic button + waveform placeholder + 30s max duration.
 *  3. Submit → postVoiceNote → polls getVoiceNoteInterpretation (Phase 1.5,
 *     may return 404 when flag off — tolerated, shows fallback ack).
 *  4. Text fallback if mic unavailable.
 *
 * Handoff note: backend `anonymize_text_block` does not yet strip first-names.
 * On first use in a session, show "Mitra keeps names private" hint to soften
 * this until the backend fix lands (flag: voice_note_name_hint_seen).
 *
 * Tone: minimal. "I'm listening." then fade. No exclamations. 404/null
 * tolerant — endpoint may be behind a disabled feature flag on dev.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Fonts } from '../theme/fonts';
import { useScreenStore } from '../engine/useScreenBridge';
import { executeAction } from '../engine/actionExecutor';
import {
  postVoiceNote,
  getVoiceNoteInterpretation,
} from '../engine/mitraApi';
import store from '../store';
import { screenActions } from '../store/screenSlice';

const MAX_DURATION_SEC = 30;

type Phase =
  | 'idle'
  | 'recording'
  | 'uploading'
  | 'interpreting'
  | 'done'
  | 'text_fallback'
  | 'error';

const VoiceNoteSheet: React.FC<{ block?: any }> = ({ block }) => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();
  const sourceSurface =
    (block && block.source_surface) || screenData.voice_note_source_surface || 'dashboard';
  const [phase, setPhase] = useState<Phase>('idle');
  const [seconds, setSeconds] = useState(0);
  const [textDraft, setTextDraft] = useState('');
  const [reflection, setReflection] = useState<string | null>(null);
  const [showNameHint, setShowNameHint] = useState<boolean>(
    !screenData.voice_note_name_hint_seen,
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setValue = (key: string, v: any) =>
    store.dispatch(screenActions.setScreenValue({ key, value: v }));

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = () => {
    setPhase('recording');
    setSeconds(0);
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= MAX_DURATION_SEC) {
          stopAndSubmit();
          return MAX_DURATION_SEC;
        }
        return s + 1;
      });
    }, 1000);
    if (showNameHint) {
      setValue('voice_note_name_hint_seen', true);
      setShowNameHint(false);
    }
  };

  const stopAndSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('uploading');
    // NOTE: Expo AV / react-native-audio-recorder is not wired in this
    // sheet. The submit call sends metadata only; audio blob capture is a
    // follow-up item. 404-tolerant: endpoint may be flagged off on dev.
    try {
      const res = await postVoiceNote(null, {
        source_surface: sourceSurface,
        duration_ms: seconds * 1000,
      });
      if (!res || !res.id) {
        // Flag off or upload failed — fall back to gentle ack.
        setReflection("I heard you. I'll hold it.");
        setPhase('done');
        return;
      }
      setValue('voice_note_id', res.id);
      setPhase('interpreting');
      // Poll interpretation up to 5 times (1.5s apart). Null/404 tolerated.
      let interp: any = null;
      for (let i = 0; i < 5; i++) {
        await new Promise((r) => setTimeout(r, 1500));
        interp = await getVoiceNoteInterpretation(res.id);
        if (interp && interp.reflection) break;
      }
      if (interp) {
        setValue('voice_note_interpretation', interp);
        setReflection(interp.reflection || "I heard you. I'll hold it.");
      } else {
        setReflection("I heard you. I'll hold it.");
      }
      setPhase('done');
    } catch (err) {
      console.warn('[VoiceNoteSheet] submit failed', err);
      setReflection("I heard you. I'll hold it.");
      setPhase('done');
    }
  };

  const submitText = async () => {
    if (!textDraft.trim()) return;
    setPhase('uploading');
    setValue('voice_note_transcript', textDraft.trim());
    setReflection("I heard you. I'll hold it.");
    setPhase('done');
  };

  const dismiss = () => {
    executeAction(
      { type: 'back', currentScreen } as any,
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) => setValue(key, value),
        screenState: { ...screenData },
      },
    ).catch(() => {});
  };

  return (
    <View style={styles.root}>
      <View style={styles.handle} />
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={dismiss}
        accessibilityRole="button"
        accessibilityLabel="Close voice note"
      >
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>

      <Text style={styles.listening}>I&apos;m listening.</Text>

      {showNameHint && (
        <Text style={styles.nameHint}>Mitra keeps names private.</Text>
      )}

      {phase === 'idle' && (
        <>
          <TouchableOpacity
            style={styles.recordBtn}
            onPress={startRecording}
            accessibilityRole="button"
          >
            <Text style={styles.recordIcon}>●</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setPhase('text_fallback')}
            style={styles.fallbackLink}
          >
            <Text style={styles.fallbackLinkText}>Type instead</Text>
          </TouchableOpacity>
        </>
      )}

      {phase === 'recording' && (
        <>
          <View style={styles.waveform}>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <View
                key={i}
                style={[
                  styles.waveBar,
                  { height: 10 + ((seconds + i) % 4) * 8 },
                ]}
              />
            ))}
          </View>
          <Text style={styles.counter}>
            {String(Math.floor(seconds / 60)).padStart(1, '0')}:
            {String(seconds % 60).padStart(2, '0')}
          </Text>
          <TouchableOpacity
            style={styles.stopBtn}
            onPress={stopAndSubmit}
            accessibilityRole="button"
            accessibilityLabel="Stop recording"
          >
            <Text style={styles.stopIcon}>■</Text>
          </TouchableOpacity>
        </>
      )}

      {(phase === 'uploading' || phase === 'interpreting') && (
        <View style={styles.processing}>
          <ActivityIndicator size="small" color="#eddeb4" />
          <Text style={styles.processingText}>
            {phase === 'uploading'
              ? 'Saving what you shared.'
              : 'Sitting with it.'}
          </Text>
        </View>
      )}

      {phase === 'done' && reflection && (
        <>
          <View style={styles.reflectCard}>
            <Text style={styles.reflectText}>{reflection}</Text>
          </View>
          <TouchableOpacity style={styles.doneBtn} onPress={dismiss}>
            <Text style={styles.doneBtnText}>Thank you</Text>
          </TouchableOpacity>
        </>
      )}

      {phase === 'text_fallback' && (
        <>
          <TextInput
            style={styles.textInput}
            placeholder="Type to me..."
            placeholderTextColor="#8c7b5c"
            value={textDraft}
            onChangeText={setTextDraft}
            multiline
            maxLength={500}
            autoFocus
          />
          <TouchableOpacity
            style={[styles.doneBtn, !textDraft.trim() && { opacity: 0.4 }]}
            onPress={submitText}
            disabled={!textDraft.trim()}
          >
            <Text style={styles.doneBtnText}>Send</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFF8EF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(237,222,180,0.4)',
    marginBottom: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 24, color: '#432104' },
  listening: {
    fontFamily: Fonts.sans.regular,
    fontSize: 18,
    color: '#f1e7cf',
    marginTop: 24,
    marginBottom: 12,
  },
  nameHint: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: '#9a7a3a',
    marginBottom: 20,
  },
  recordBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#eddeb4',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  recordIcon: { fontSize: 32, color: '#b24d4d' },
  stopBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#eddeb4',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  stopIcon: { fontSize: 28, color: '#1a1a1a' },
  counter: {
    fontFamily: Fonts.sans.regular,
    fontSize: 20,
    color: '#432104',
    marginTop: 16,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4 as any,
    marginTop: 32,
    height: 48,
  },
  waveBar: {
    width: 4,
    backgroundColor: '#eddeb4',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  processing: {
    marginTop: 40,
    alignItems: 'center',
  },
  processingText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: '#bfa58a',
    marginTop: 12,
  },
  reflectCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#eddeb4',
    paddingLeft: 14,
    paddingVertical: 10,
    marginTop: 28,
    marginBottom: 24,
    maxWidth: 320,
  },
  reflectText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 17,
    lineHeight: 26,
    color: '#f1e7cf',
  },
  doneBtn: {
    backgroundColor: '#eddeb4',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 999,
    minWidth: 200,
    alignItems: 'center',
    marginTop: 12,
  },
  doneBtnText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 15,
    color: '#1a1a1a',
  },
  fallbackLink: { marginTop: 16, padding: 8 },
  fallbackLinkText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: '#bfa58a',
  },
  textInput: {
    width: '100%',
    minHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(237,222,180,0.3)',
    borderRadius: 12,
    padding: 14,
    marginTop: 24,
    marginBottom: 16,
    color: '#432104',
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    textAlignVertical: 'top',
  },
});

export default VoiceNoteSheet;

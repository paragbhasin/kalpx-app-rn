/**
 * VoicePhase — inline voice note step.
 *
 * Mobile: record button → tap to start/stop → "Done" saves.
 * Skip available: "Write instead" transitions caller to text variant,
 * or "I'll go now" exits entirely.
 *
 * NOTE: Actual audio recording requires expo-av permissions flow.
 * This component owns the UI contract; recording integration is
 * a thin shim over expo-av Audio.Recording.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Audio } from 'expo-av';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/fonts';

interface Props {
  companionLine: string;
  onSave: (uri: string | null, durationMs: number) => void;
  onWriteInstead: () => void;
  onSkip: () => void;
}

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
}

const VoicePhase: React.FC<Props> = ({ companionLine, onSave, onWriteInstead, onSkip }) => {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [done, setDone] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  const startPulse = useCallback(() => {
    pulseRef.current?.stop();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.18, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    pulseRef.current = loop;
    loop.start();
  }, [pulseAnim]);

  const stopPulse = useCallback(() => {
    pulseRef.current?.stop();
    Animated.spring(pulseAnim, { toValue: 1, useNativeDriver: true }).start();
  }, [pulseAnim]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      pulseRef.current?.stop();
    };
  }, []);

  async function handleToggleRecord() {
    if (isRecording) {
      // Stop recording
      try {
        if (recording) {
          await recording.stopAndUnloadAsync();
          const uri = recording.getURI();
          setRecordingUri(uri ?? null);
          setRecording(null);
        }
      } catch {}
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopPulse();
      setIsRecording(false);
      setDone(true);
      return;
    }

    // Start recording
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      setRecording(rec);
      setIsRecording(true);
      startTimeRef.current = Date.now();
      setElapsedMs(0);
      intervalRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTimeRef.current);
      }, 200);
      startPulse();
    } catch {
      setPermissionDenied(true);
    }
  }

  function handleDone() {
    onSave(recordingUri, elapsedMs);
  }

  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    // Web fallback — shouldn't normally reach here; RoomJourneyRenderer routes web to TextPhase
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      {companionLine ? (
        <Text style={styles.companion}>{companionLine}</Text>
      ) : null}

      <Text style={[styles.instruction, isHindi && { letterSpacing: 0 }]}>
        {done
          ? t('room.phases.voice.ready')
          : isRecording
          ? t('room.phases.voice.recording')
          : t('room.phases.voice.idle')}
      </Text>

      {/* Record circle */}
      <View style={styles.circleWrap}>
        <Animated.View
          style={[
            styles.circleGlow,
            { transform: [{ scale: pulseAnim }], opacity: pulseAnim.interpolate({ inputRange: [1, 1.18], outputRange: [0.2, 0.45] }) },
          ]}
        />
        <TouchableOpacity
          style={[styles.circle, isRecording && styles.circleActive, done && styles.circleDone]}
          onPress={done ? undefined : handleToggleRecord}
          activeOpacity={0.8}
          disabled={done}
        >
          <Text style={styles.circleIcon}>{done ? '✓' : isRecording ? '■' : '●'}</Text>
        </TouchableOpacity>
      </View>

      {(isRecording || done) ? (
        <Text style={styles.elapsed}>{formatElapsed(elapsedMs)}</Text>
      ) : null}

      {permissionDenied ? (
        <Text style={[styles.permissionHint, isHindi && { letterSpacing: 0 }]}>
          {t('room.phases.voice.permissionDenied')}
        </Text>
      ) : null}

      <View style={styles.actions}>
        {done ? (
          <TouchableOpacity style={styles.ctaBtn} onPress={handleDone} activeOpacity={0.7}>
            <Text style={[styles.ctaText, isHindi && { letterSpacing: 0 }]}>{t('room.phases.common.done')}</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity onPress={onWriteInstead} style={styles.secondaryBtn} hitSlop={{ top: 8, bottom: 8 }}>
          <Text style={[styles.secondaryText, isHindi && { letterSpacing: 0 }]}>{t('room.phases.voice.writeInstead')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onSkip} style={styles.skipBtn} hitSlop={{ top: 8, bottom: 8 }}>
          <Text style={[styles.skipText, isHindi && { letterSpacing: 0 }]}>{t('room.phases.common.illGoNow')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default VoicePhase;

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  companion: {
    fontSize: 14,
    color: '#8A7968',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
    fontFamily: Fonts.sans.regular,
    fontStyle: 'italic',
  },
  instruction: {
    fontSize: 17,
    fontFamily: Fonts.serif.regular,
    color: '#432104',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  circleWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  circleGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.goldPale,
  },
  circle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255, 253, 247, 0.95)',
    borderWidth: 2,
    borderColor: Colors.goldHairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: {
    borderColor: '#b85c38',
    backgroundColor: 'rgba(255, 240, 235, 0.95)',
  },
  circleDone: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(255, 248, 230, 0.95)',
  },
  circleIcon: {
    fontSize: 28,
    color: '#432104',
  },
  elapsed: {
    fontSize: 13,
    color: '#B8A898',
    fontFamily: Fonts.sans.regular,
    marginBottom: 28,
    letterSpacing: 0.5,
  },
  permissionHint: {
    fontSize: 13,
    color: '#B8A898',
    textAlign: 'center',
    fontFamily: Fonts.sans.regular,
    marginBottom: 16,
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  actions: {
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  ctaBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 24,
    paddingVertical: 13,
    paddingHorizontal: 44,
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
  },
  skipText: {
    fontSize: 13,
    color: '#B8A898',
    fontFamily: Fonts.sans.regular,
    textDecorationLine: 'underline',
  },
});

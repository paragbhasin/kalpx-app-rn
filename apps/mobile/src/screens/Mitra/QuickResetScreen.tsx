/**
 * QuickResetScreen — Self-contained tap-and-breathe UX.
 *
 * Phase 1 (select): duration selector (1/3/5 min) + Begin.
 * Phase 2 (running): circular tap/breath counter + countdown timer.
 * Phase 3 (done): 4-option completion screen.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Fonts } from '../../theme/fonts';
import MalaMantraCounter from '../../components/MalaMantraCounter';

type Phase = 'select' | 'running' | 'done';

const DURATION_OPTIONS = [
  { label: '1 min', seconds: 60 },
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function QuickResetScreen() {
  const navigation = useNavigation<any>();
  const [phase, setPhase] = useState<Phase>('select');
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[1]); // default 3 min
  const [secondsLeft, setSecondsLeft] = useState(DURATION_OPTIONS[1].seconds);
  const [breathCount, setBreathCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startSession = () => {
    setSecondsLeft(selectedDuration.seconds);
    setBreathCount(0);
    setPhase('running');
  };

  const endEarly = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase('done');
  };

  useEffect(() => {
    if (phase === 'running') {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setPhase('done');
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quick Reset</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Phase: select */}
      {phase === 'select' && (
        <View style={styles.centerContent}>
          <Text style={styles.sectionTitle}>Choose your duration</Text>
          <View style={styles.durationRow}>
            {DURATION_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.seconds}
                style={[
                  styles.durationOption,
                  selectedDuration.seconds === opt.seconds && styles.durationOptionSelected,
                ]}
                onPress={() => setSelectedDuration(opt)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.durationOptionText,
                    selectedDuration.seconds === opt.seconds && styles.durationOptionTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.beginBtn} onPress={startSession} activeOpacity={0.8}>
            <Text style={styles.beginBtnText}>Begin</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Phase: running */}
      {phase === 'running' && (
        <View style={styles.centerContent}>
          <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
          <MalaMantraCounter
            targetCount={-1}
            currentCount={breathCount}
            onIncrement={() => setBreathCount((c) => c + 1)}
            onExit={endEarly}
            useBackgroundImage={false}
            tapLabel="TAP"
            subTapLabel=""
            hintText=""
          />
          <Text style={styles.omText}>OM</Text>
          <Text style={styles.omDevanagari}>ॐ</Text>
          <Text style={styles.breathHint}>Tap with each breath</Text>
          <TouchableOpacity onPress={endEarly} activeOpacity={0.7} style={styles.endEarlyBtn}>
            <Text style={styles.endEarlyText}>End early</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Phase: done */}
      {phase === 'done' && (
        <View style={styles.centerContent}>
          <Text style={styles.sectionTitle}>How do you feel?</Text>
          <View style={styles.completionOptions}>
            <TouchableOpacity
              style={styles.completionOption}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.completionOptionText}>More steady</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.completionOption}
              onPress={() => navigation.navigate('TellMitra' as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.completionOptionText}>Still restless</Text>
            </TouchableOpacity>

            <View style={styles.completionOption}>
              <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8}>
                <Text style={styles.completionOptionText}>Lighter</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('RhythmHome' as any)}
                activeOpacity={0.7}
                style={styles.secondaryCta}
              >
                <Text style={styles.secondaryCtaText}>Open My Rhythm</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.completionOption}
              onPress={() => navigation.navigate('TellMitra' as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.completionOptionText}>I want to tell Mitra</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF8EF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DAC28E',
  },
  backBtnText: {
    fontSize: 16,
    color: '#C99317',
    fontFamily: Fonts.sans.medium,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    fontWeight: '700',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    fontWeight: '700',
    textAlign: 'center',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  durationOption: {
    borderWidth: 1.5,
    borderColor: '#DAC28E',
    borderRadius: 15,
    paddingHorizontal: 22,
    paddingVertical: 12,
    backgroundColor: '#FBF5F5',
  },
  durationOptionSelected: {
    backgroundColor: '#C99317',
    borderColor: '#C99317',
  },
  durationOptionText: {
    fontSize: 16,
    fontFamily: Fonts.sans.medium,
    color: '#7B6550',
  },
  durationOptionTextSelected: {
    color: '#fff',
  },
  beginBtn: {
    backgroundColor: '#C99317',
    borderRadius: 15,
    paddingHorizontal: 48,
    paddingVertical: 16,
  },
  beginBtnText: {
    fontSize: 18,
    fontFamily: Fonts.sans.semiBold,
    color: '#fff',
  },
  timerText: {
    fontSize: 56,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    fontWeight: '700',
  },
  breathCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#C99317',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  breathCircleLabel: {
    fontSize: 16,
    fontFamily: Fonts.sans.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  breathCircleCount: {
    fontSize: 40,
    fontFamily: Fonts.serif.bold,
    color: '#fff',
    fontWeight: '700',
  },
  omText: {
    fontSize: 28,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
  },
  omDevanagari: {
    fontSize: 20,
    color: '#8B6914',
    fontFamily: Fonts.sans.regular,
    textAlign: 'center',
  },
  breathHint: {
    fontSize: 14,
    fontFamily: Fonts.sans.regular,
    color: '#7B6550',
  },
  endEarlyBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  endEarlyText: {
    fontSize: 14,
    color: '#9b8b77',
    fontFamily: Fonts.sans.regular,
    textDecorationLine: 'underline',
  },
  completionOptions: {
    width: '100%',
    gap: 12,
  },
  completionOption: {
    backgroundColor: '#FBF5F5',
    borderRadius: 15,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#DAC28E',
    gap: 8,
  },
  completionOptionText: {
    fontSize: 17,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryCta: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  secondaryCtaText: {
    fontSize: 14,
    color: '#C99317',
    fontFamily: Fonts.sans.medium,
  },
});

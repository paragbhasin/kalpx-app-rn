/**
 * QuickCheckinScreen — 2×2 grid energy state check-in.
 *
 * Options: Energized / Balanced / Agitated / Drained.
 * Calls postQuickCheckin, then routes based on suggested_action.
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { QuickCheckinEnergyState, QuickCheckinResponse } from '@kalpx/types';
import { postQuickCheckin } from '../../engine/mitraApi';
import { Fonts } from '../../theme/fonts';

interface EnergyOption {
  value: QuickCheckinEnergyState;
  label: string;
  description: string;
}

const ENERGY_OPTIONS: EnergyOption[] = [
  { value: 'energized', label: 'Energized', description: 'Ready and moving' },
  { value: 'balanced', label: 'Balanced', description: 'Steady and clear' },
  { value: 'agitated', label: 'Agitated', description: 'Restless or tense' },
  { value: 'drained', label: 'Drained', description: 'Low or heavy' },
];

const ROOM_CTA_LABELS: Record<string, string> = {
  room_stillness: 'Go to Find Calm',
  room_release: 'Set It Down',
  room_joy: 'Notice What\'s Good',
  room_growth: 'Take the Next Step',
  room_clarity: 'Find Clarity',
  room_connection: 'Open Connection',
};

const DOOR_CTA_LABELS: Record<string, string> = {
  my_rhythm: 'Go to My Rhythm',
  inner_path: 'Continue Your Path',
  quick_reset: 'Start Quick Reset',
  tell_mitra: 'Share with Mitra',
};

export default function QuickCheckinScreen() {
  const navigation = useNavigation<any>();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuickCheckinResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [selected, setSelected] = useState<QuickCheckinEnergyState | null>(null);

  const handleProceed = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await postQuickCheckin(selected);
      setResult(res);
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getCTALabel = (): string => {
    if (!result) return 'Continue';
    if (result.suggested_action === 'navigate_to_room' && result.suggested_room_id) {
      return ROOM_CTA_LABELS[result.suggested_room_id] ?? 'Go to Practice';
    }
    if (result.suggested_action === 'navigate_to_door' && result.suggested_door) {
      return DOOR_CTA_LABELS[result.suggested_door] ?? 'Continue';
    }
    return 'Return Home';
  };

  const handleCta = () => {
    if (!result) return;
    if (result.suggested_action === 'navigate_to_room' && result.suggested_room_id) {
      navigation.navigate('DynamicEngine' as any, { room_id: result.suggested_room_id });
    } else if (result.suggested_action === 'navigate_to_door' && result.suggested_door) {
      const door = result.suggested_door;
      if (door === 'my_rhythm') {
        navigation.navigate('RhythmHome' as any);
      } else if (door === 'inner_path') {
        navigation.navigate('InnerPath' as any);
      } else if (door === 'quick_reset') {
        navigation.navigate('QuickReset' as any);
      } else {
        navigation.goBack();
      }
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quick Check-in</Text>
        <View style={{ width: 50 }} />
      </View>

      {!result ? (
        <View style={styles.content}>
          <Text style={styles.prompt}>How is your energy right now?</Text>
          <Text style={styles.subtitle}>Share how you're feeling. Mitra will find a practice that fits.</Text>
          {submitting ? (
            <ActivityIndicator size="large" color="#C99317" style={{ marginTop: 40 }} />
          ) : (
            <>
              <View style={styles.grid}>
                {ENERGY_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.gridOption,
                      selected === opt.value
                        ? styles.gridOptionSelected
                        : styles.gridOptionUnselected,
                    ]}
                    onPress={() => setSelected(opt.value)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.gridOptionLabel}>{opt.label}</Text>
                    <Text style={styles.gridOptionDesc}>{opt.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selected === null && (
                <Text style={styles.disabledHint}>Select your energy to continue.</Text>
              )}
              <TouchableOpacity
                style={[styles.ctaBtn, selected === null && { opacity: 0.4 }]}
                onPress={handleProceed}
                disabled={selected === null}
                activeOpacity={0.8}
              >
                <Text style={styles.ctaBtnText}>Proceed →</Text>
              </TouchableOpacity>
            </>
          )}
          {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
        </View>
      ) : (
        <View style={styles.resultContent}>
          <Text style={styles.resultHeading}>Mitra heard you.</Text>
          <View style={styles.resultCopyBlock}>
            <Text style={styles.resultCopy}>{result.copy}</Text>
          </View>
          <TouchableOpacity style={styles.ctaBtn} onPress={handleCta} activeOpacity={0.8}>
            <Text style={styles.ctaBtnText}>{getCTALabel()}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.skipBtn}>
            <Text style={styles.skipBtnText}>Return Home</Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  prompt: {
    fontSize: 24,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.sans.regular,
    color: '#7B6550',
    textAlign: 'center',
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    width: '100%',
  },
  gridOption: {
    width: '46%',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  gridOptionSelected: {
    borderWidth: 3,
    borderColor: '#C99317',
    backgroundColor: 'rgba(201,147,23,0.08)',
    shadowColor: '#C99317',
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 4,
  },
  gridOptionUnselected: {
    borderWidth: 0.5,
    borderColor: '#DAC28E',
    backgroundColor: '#FBF5F5',
  },
  gridOptionLabel: {
    fontSize: 18,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    fontWeight: '700',
  },
  gridOptionDesc: {
    fontSize: 13,
    fontFamily: Fonts.sans.regular,
    color: '#7B6550',
    textAlign: 'center',
  },
  disabledHint: {
    fontSize: 13,
    color: '#A08060',
    fontFamily: Fonts.sans.regular,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#c0392b',
    textAlign: 'center',
  },
  resultContent: {
    flex: 1,
    padding: 28,
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: 0,
  },
  resultHeading: {
    fontSize: 18,
    fontFamily: Fonts.serif.bold,
    color: '#C99317',
    fontWeight: '700',
    marginBottom: 16,
  },
  resultCopyBlock: {
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(201,147,23,0.5)',
    paddingLeft: 14,
    marginBottom: 28,
  },
  resultCopy: {
    fontSize: 17,
    fontFamily: Fonts.serif.regular,
    color: '#432104',
    lineHeight: 26,
    fontStyle: 'italic',
  },
  ctaBtn: {
    backgroundColor: '#C99317',
    borderRadius: 15,
    paddingHorizontal: 36,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  ctaBtnText: {
    fontSize: 17,
    fontFamily: Fonts.sans.semiBold,
    color: '#fff',
  },
  skipBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  skipBtnText: {
    fontSize: 15,
    color: '#9b8b77',
    fontFamily: Fonts.sans.regular,
    textDecorationLine: 'underline',
  },
});

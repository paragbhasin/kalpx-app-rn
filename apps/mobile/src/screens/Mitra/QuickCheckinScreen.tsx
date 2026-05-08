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
  { value: 'energized', label: 'Energized', description: 'Ready and alive' },
  { value: 'balanced', label: 'Balanced', description: 'Steady and clear' },
  { value: 'agitated', label: 'Agitated', description: 'Restless or tense' },
  { value: 'drained', label: 'Drained', description: 'Heavy or depleted' },
];

export default function QuickCheckinScreen() {
  const navigation = useNavigation<any>();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuickCheckinResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTap = async (value: QuickCheckinEnergyState) => {
    if (submitting) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await postQuickCheckin(value);
      setResult(res);
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCta = () => {
    if (!result) return;
    if (result.suggested_action === 'navigate_to_room') {
      navigation.navigate('DynamicEngine' as any);
    } else if (result.suggested_action === 'navigate_to_door') {
      navigation.navigate('DynamicEngine' as any);
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
        <Text style={styles.headerTitle}>Check In</Text>
        <View style={{ width: 50 }} />
      </View>

      {!result ? (
        <View style={styles.content}>
          <Text style={styles.prompt}>How are you right now?</Text>
          {submitting ? (
            <ActivityIndicator size="large" color="#C99317" style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.grid}>
              {ENERGY_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={styles.gridOption}
                  onPress={() => handleTap(opt.value)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.gridOptionLabel}>{opt.label}</Text>
                  <Text style={styles.gridOptionDesc}>{opt.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
        </View>
      ) : (
        <View style={styles.resultContent}>
          <Text style={styles.resultCopy}>{result.copy}</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={handleCta} activeOpacity={0.8}>
            <Text style={styles.ctaBtnText}>
              {result.suggested_action === 'return_home' ? 'Back to Home' : 'Continue'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.skipBtn}>
            <Text style={styles.skipBtnText}>Go back</Text>
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
    gap: 24,
  },
  prompt: {
    fontSize: 24,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    fontWeight: '700',
    textAlign: 'center',
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
    backgroundColor: '#FBF5F5',
    borderRadius: 15,
    padding: 20,
    borderWidth: 0.5,
    borderColor: '#DAC28E',
    alignItems: 'center',
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
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
  errorText: {
    fontSize: 14,
    color: '#c0392b',
    textAlign: 'center',
  },
  resultContent: {
    flex: 1,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  resultCopy: {
    fontSize: 18,
    fontFamily: Fonts.serif.regular,
    color: '#432104',
    textAlign: 'center',
    lineHeight: 28,
    fontStyle: 'italic',
  },
  ctaBtn: {
    backgroundColor: '#C99317',
    borderRadius: 15,
    paddingHorizontal: 36,
    paddingVertical: 14,
  },
  ctaBtnText: {
    fontSize: 17,
    fontFamily: Fonts.sans.semiBold,
    color: '#fff',
  },
  skipBtn: {
    paddingVertical: 8,
  },
  skipBtnText: {
    fontSize: 15,
    color: '#9b8b77',
    fontFamily: Fonts.sans.regular,
    textDecorationLine: 'underline',
  },
});

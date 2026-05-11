/**
 * QuickCheckinScreen — One-tap Jagruti / Guna-awareness moment.
 *
 * Chips: Agitated / Drained / Steady / Open (locked QC-A labels).
 * Calls prana-acknowledge, then navigates home so active_checkin_window
 * in the home response shows the state-aware acknowledgment.
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
import type { QuickCheckinEnergyState } from '@kalpx/types';
import { mitraPranaAcknowledge } from '../../engine/mitraApi';
import { Fonts } from '../../theme/fonts';

interface EnergyOption {
  value: QuickCheckinEnergyState;
  label: string;
}

const ENERGY_OPTIONS: EnergyOption[] = [
  { value: 'agitated', label: 'Agitated' },
  { value: 'drained',  label: 'Drained'  },
  { value: 'balanced', label: 'Steady'   },
  { value: 'energized',label: 'Open'     },
];

export default function QuickCheckinScreen() {
  const navigation = useNavigation<any>();
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<QuickCheckinEnergyState | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleProceed = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      await mitraPranaAcknowledge({ prana_type: selected });
      navigation.navigate('MitraHome' as any);
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check In</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.prompt}>How are you landing?</Text>

        {submitting ? (
          <ActivityIndicator size="large" color="#C99317" style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.chipRow}>
              {ENERGY_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.chip,
                    selected === opt.value ? styles.chipSelected : styles.chipUnselected,
                  ]}
                  onPress={() => setSelected(opt.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.chipLabel,
                    selected === opt.value && styles.chipLabelSelected,
                  ]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    width: '100%',
  },
  chip: {
    borderRadius: 40,
    paddingHorizontal: 24,
    paddingVertical: 14,
    alignItems: 'center',
    minWidth: '44%',
  },
  chipSelected: {
    backgroundColor: '#C99317',
    borderWidth: 0,
  },
  chipUnselected: {
    borderWidth: 1,
    borderColor: '#DAC28E',
    backgroundColor: '#FBF5F5',
  },
  chipLabel: {
    fontSize: 17,
    fontFamily: Fonts.sans.semiBold,
    color: '#432104',
  },
  chipLabelSelected: {
    color: '#fff',
  },
  errorText: {
    fontSize: 14,
    color: '#c0392b',
    textAlign: 'center',
  },
  ctaBtn: {
    backgroundColor: '#C99317',
    borderRadius: 15,
    paddingHorizontal: 36,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  ctaBtnText: {
    fontSize: 17,
    fontFamily: Fonts.sans.semiBold,
    color: '#fff',
  },
});

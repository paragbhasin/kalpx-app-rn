/**
 * VoiceConsentSheet — Week 4 Moment 38 first-time voice consent overlay.
 *
 * Spec: overlay_voice_consent.md §1, §2, §3. Binary choice — two chips only:
 *   - "I'm ready"       → accept_voice_consent  (voice_consent_given = true)
 *   - "Keep using text" → decline_voice_consent (voice_consent_given = false)
 *
 * The prior third chip ("Tell me more") contradicted spec §3
 * (`Tap-chip response options: 2 (accept / decline)`) — removed. The
 * transcription-clarity body copy is always visible (no reveal pattern).
 *
 * Only shown when screenData.voice_consent_given is null or undefined.
 * PATCHes companion-state on accept. 404/null tolerant for endpoint.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Fonts } from '../theme/fonts';
import { useScreenStore } from '../engine/useScreenBridge';
import { executeAction } from '../engine/actionExecutor';
import store from '../store';
import { screenActions } from '../store/screenSlice';

const VoiceConsentSheet: React.FC<{ block?: any }> = () => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();

  const dispatch = (actionType: string) => {
    executeAction(
      { type: actionType, currentScreen } as any,
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          store.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: { ...screenData },
      },
    ).catch(() => {});
  };

  return (
    <View style={styles.root}>
      <View style={styles.handle} />
      <Text style={styles.headline}>Your voice stays private.</Text>

      <View style={styles.card}>
        <Text style={styles.body}>
          I transcribe what you say to text, then the audio is discarded within
          24 hours. The text lives in your journal only. I never share voice data.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primary}
        onPress={() => dispatch('accept_voice_consent')}
        accessibilityRole="button"
        accessibilityLabel="I'm ready"
      >
        <Text style={styles.primaryText}>I&apos;m ready</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tertiary}
        onPress={() => dispatch('decline_voice_consent')}
        accessibilityRole="button"
        accessibilityLabel="Keep using text"
      >
        <Text style={styles.tertiaryText}>Keep using text</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fffdf9',
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
    backgroundColor: 'rgba(67,33,4,0.2)',
    marginBottom: 20,
  },
  headline: {
    fontFamily: Fonts.serif.regular,
    fontSize: 22,
    color: '#432104',
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    borderLeftWidth: 3,
    borderLeftColor: '#c9a84c',
    paddingLeft: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  body: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    lineHeight: 22,
    color: '#432104',
  },
  primary: {
    backgroundColor: '#eddeb4',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 999,
    minWidth: 240,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 15,
    color: '#432104',
  },
  tertiary: { marginTop: 12, padding: 10 },
  tertiaryText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: '#6b5a45',
  },
});

export default VoiceConsentSheet;

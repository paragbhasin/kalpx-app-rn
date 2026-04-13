/**
 * VoiceConsentSheet — Week 4 Moment 38 first-time voice consent overlay.
 *
 * Web parity: kalpx-frontend/src/components/VoiceConsentOverlay.vue (first-use
 * voice consent gate). Spec: overlay_voice_consent.md §1, §6 (API contract).
 *
 * Three reply chips:
 *   - "Sounds right"  → accept_voice_consent  (voice_consent_given = true)
 *   - "Tell me more"  → expands a second copy panel (does not grant yet)
 *   - "Not today"     → decline_voice_consent (voice_consent_given = false)
 *
 * Only shown when screenData.voice_consent_given is null or undefined.
 * PATCHes companion-state on accept. 404/null tolerant for endpoint.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Fonts } from '../theme/fonts';
import { useScreenStore } from '../engine/useScreenBridge';
import { executeAction } from '../engine/actionExecutor';
import store from '../store';
import { screenActions } from '../store/screenSlice';

const VoiceConsentSheet: React.FC<{ block?: any }> = () => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();
  const [expanded, setExpanded] = useState(false);

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
          Mitra can listen. Recordings are processed, then deleted within 24h.
          You can stop any time.
        </Text>
      </View>

      {expanded && (
        <View style={styles.moreCard}>
          <Text style={styles.moreText}>
            Audio is transcribed to text. Only the text is kept — in your
            journal. Mitra never shares voice data.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.primary}
        onPress={() => dispatch('accept_voice_consent')}
        accessibilityRole="button"
        accessibilityLabel="Accept voice consent"
      >
        <Text style={styles.primaryText}>Sounds right</Text>
      </TouchableOpacity>

      {!expanded && (
        <TouchableOpacity
          style={styles.secondary}
          onPress={() => setExpanded(true)}
        >
          <Text style={styles.secondaryText}>Tell me more</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.tertiary}
        onPress={() => dispatch('decline_voice_consent')}
      >
        <Text style={styles.tertiaryText}>Not today</Text>
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
  moreCard: {
    backgroundColor: '#FFF8EF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  moreText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    lineHeight: 20,
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
  secondary: { marginTop: 14, padding: 8 },
  secondaryText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: '#6b5a45',
  },
  tertiary: { marginTop: 8, padding: 8 },
  tertiaryText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: '#6b5a45',
  },
});

export default VoiceConsentSheet;

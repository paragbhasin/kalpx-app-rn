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
import { useContentSlots, readMomentSlot } from '../hooks/useContentSlots';
import { useScreenStore } from '../engine/useScreenBridge';
import { executeAction } from '../engine/actionExecutor';
import store from '../store';
import { screenActions } from '../store/screenSlice';

const VoiceConsentSheet: React.FC<{ block?: any }> = () => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();
  const ss = screenData as Record<string, any>;
  const [expanded, setExpanded] = useState(false);

  useContentSlots({
    momentId: 'M38_voice_consent_sheet',
    screenDataKey: 'voice_consent_sheet',
    buildCtx: (s) => ({
      path: s.journey_path === 'growth' ? 'growth' : 'support',
      guidance_mode: s.guidance_mode || 'hybrid',
      locale: s.locale || 'en',
      user_attention_state: 'reflective_exposed',
      emotional_weight: 'moderate',
      cycle_day: Number(s.day_number) || 0,
      entered_via: 'first_voice_tap',
      stage_signals: {},
      today_layer: {},
      life_layer: {
        cycle_id: s.journey_id || s.cycle_id || '',
        life_kosha: s.life_kosha || s.scan_focus || '',
        scan_focus: s.scan_focus || '',
      },
    }),
  });
  const slot = (name: string) => readMomentSlot(ss, 'voice_consent_sheet', name);

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
      <Text style={styles.headline}>{slot('voice_privacy_headline')}</Text>

      <View style={styles.card}>
        <Text style={styles.body}>{slot('voice_consent_body')}</Text>
      </View>

      {expanded && (
        <View style={styles.moreCard}>
          <Text style={styles.moreText}>{slot('consent_more_detail')}</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.primary}
        onPress={() => dispatch('accept_voice_consent')}
        accessibilityRole="button"
        accessibilityLabel={slot('sounds_right_cta')}
      >
        <Text style={styles.primaryText}>{slot('sounds_right_cta')}</Text>
      </TouchableOpacity>

      {!expanded && (
        <TouchableOpacity
          style={styles.secondary}
          onPress={() => setExpanded(true)}
        >
          <Text style={styles.secondaryText}>{slot('tell_me_more_cta')}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.tertiary}
        onPress={() => dispatch('decline_voice_consent')}
      >
        <Text style={styles.tertiaryText}>{slot('not_today_cta')}</Text>
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

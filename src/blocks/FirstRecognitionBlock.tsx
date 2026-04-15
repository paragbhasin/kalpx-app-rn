/**
 * FirstRecognitionBlock — Turn 6 message card.
 *
 * Web counterpart: kalpx-frontend/src/blocks/InsightBoxBlock.vue (gold-bordered insight card)
 * Spec: docs/specs/mitra-v3-experience/screens/route_welcome_onboarding.md §1 Turn 6, §14A
 * Regression cases: REG-015 (never auto-advances; requires user tap on reply chip below).
 *
 * Visual: cream bg #fffdf9, gold left border (3px), serif emphasized line.
 * Template vars resolved upstream in OnboardingContainer via generate-companion response.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';
import { useScreenStore } from '../engine/useScreenBridge';
import { interpolate } from '../engine/utils/interpolation';

const GOLD = '#eddeb4';
const DEEP_BROWN = '#432104';

interface Props {
  block: {
    emphasized_line?: string;
    body_paragraphs?: string[];
    label?: string; // e.g., "RECOGNITION"
  };
}

const FirstRecognitionBlock: React.FC<Props> = ({ block }) => {
  const { screenData } = useScreenStore();
  const paras = block.body_paragraphs || [];

  // Defensive fallback: if generate-companion upstream didn't populate the
  // turn_6 template vars (friction_label / state_label / recommended_posture /
  // primary_feeling / active_life_situation), inject graceful alternates so
  // the sentence never renders with empty slots producing malformed prose.
  const dataWithFallbacks = {
    friction_label: "what's alive for you",
    state_label: 'moment',
    recommended_posture: 'gentle steadiness — doing less, better',
    primary_feeling: "what's alive for you",
    active_life_situation: 'this moment',
    feeling: "what's alive for you",
    situation: 'this moment',
    ...(screenData || {}),
  };
  // Also overlay any explicitly-empty values so an empty string still yields
  // the fallback (screenData spread would keep "" and interpolation would
  // render the empty string).
  for (const k of [
    'friction_label',
    'state_label',
    'recommended_posture',
    'primary_feeling',
    'active_life_situation',
    'feeling',
    'situation',
  ]) {
    const v = (dataWithFallbacks as any)[k];
    if (v === '' || v === null || v === undefined) {
      (dataWithFallbacks as any)[k] = {
        friction_label: "what's alive for you",
        state_label: 'moment',
        recommended_posture: 'gentle steadiness — doing less, better',
        primary_feeling: "what's alive for you",
        active_life_situation: 'this moment',
        feeling: "what's alive for you",
        situation: 'this moment',
      }[k];
    }
  }

  return (
    <View style={styles.card}>
      {block.label && <Text style={styles.label}>{block.label}</Text>}
      {block.emphasized_line && (
        <Text style={styles.emphasized}>
          {interpolate(block.emphasized_line, dataWithFallbacks)}
        </Text>
      )}
      {paras.map((p, i) => (
        <Text key={i} style={styles.body}>
          {interpolate(p, dataWithFallbacks)}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fffdf9',
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
  },
  label: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 11,
    letterSpacing: 2,
    color: '#6b5a45',
    marginBottom: 14,
  },
  emphasized: {
    fontFamily: Fonts.serif.bold,
    fontSize: 22,
    lineHeight: 30,
    color: DEEP_BROWN,
    marginBottom: 14,
  },
  body: {
    fontFamily: Fonts.serif.regular,
    fontSize: 17,
    lineHeight: 26,
    color: DEEP_BROWN,
    marginBottom: 12,
  },
});

export default FirstRecognitionBlock;

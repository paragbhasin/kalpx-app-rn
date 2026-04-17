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
  // Prefer backend-delivered lines (sovereignty: no user-facing strings in TSX).
  // 2026-04-17 Option B: recognition closing paragraph now lives on the spine
  // per-lane × mode. Falls back to schema-provided body_paragraphs only if
  // backend returned empty (which itself falls back to a safety line in
  // resolve_recognition_body). Finally, renders empty if neither is present.
  const backendLines: string[] = Array.isArray((screenData as any)?.recognition_body_lines)
    ? ((screenData as any).recognition_body_lines as string[])
    : [];
  const paras = backendLines.length > 0 ? backendLines : (block.body_paragraphs || []);

  return (
    <View style={styles.card}>
      {block.label && <Text style={styles.label}>{block.label}</Text>}
      {block.emphasized_line && (
        <Text style={styles.emphasized}>
          {interpolate(block.emphasized_line, screenData)}
        </Text>
      )}
      {paras.map((p, i) => (
        <Text key={i} style={styles.body}>
          {interpolate(p, screenData)}
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

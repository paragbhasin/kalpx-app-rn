/**
 * PathEmergesBlock — Turn 7. Three cards: mantra / sankalp / practice.
 *
 * Web counterpart: kalpx-frontend/src/blocks/PracticeCardBlock.vue + MantraDisplay.vue (triad layout).
 * Spec: docs/specs/mitra-v3-experience/screens/route_welcome_onboarding.md §1 Turn 7, §2.
 * Regression cases: REG-015 (cards are display-only — no tap action; single "I'm ready" below).
 *
 * Each card shows title + 1-line "why this for you".
 * Data pulled from screenData (set by generate-companion response in Turn 5 handler).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';
import { useScreenStore } from '../engine/useScreenBridge';
import { interpolate } from '../engine/utils/interpolation';

const GOLD = '#eddeb4';
const DEEP_BROWN = '#432104';

interface Item {
  kind: 'mantra' | 'sankalp' | 'practice';
  title_key: string; // screenData key
  why_key: string;
  line_key?: string; // only for sankalp
}

const ITEMS: Item[] = [
  { kind: 'mantra', title_key: 'companion_mantra_title', why_key: 'companion_mantra_one_line' },
  {
    kind: 'sankalp',
    title_key: 'companion_sankalp_line',
    line_key: 'companion_sankalp_line',
    why_key: 'companion_sankalp_one_line',
  },
  { kind: 'practice', title_key: 'companion_practice_title', why_key: 'companion_practice_one_line' },
];

const LABELS: Record<string, string> = {
  mantra: 'Your mantra',
  sankalp: 'Your intention',
  practice: 'Your practice',
};

interface Props {
  block: any;
}

const PathEmergesBlock: React.FC<Props> = () => {
  const { screenData } = useScreenStore();

  return (
    <View style={styles.wrap}>
      {ITEMS.map((it) => {
        const title =
          it.kind === 'sankalp'
            ? `'${String(screenData[it.title_key] || '').trim()}'`
            : String(screenData[it.title_key] || '—');
        const why = String(screenData[it.why_key] || '');
        return (
          <View key={it.kind} style={styles.card}>
            <Text style={styles.label}>{LABELS[it.kind]}</Text>
            <Text style={styles.title}>{title}</Text>
            {!!why && <Text style={styles.why}>{why}</Text>}
          </View>
        );
      })}
      <Text style={styles.footer}>
        This isn't homework. It's sadhana — a daily practice that builds something real over
        time.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginVertical: 12 },
  card: {
    backgroundColor: '#fffdf9',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
    padding: 16,
    marginBottom: 12,
  },
  label: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 11,
    letterSpacing: 1.8,
    color: '#6b5a45',
    marginBottom: 6,
  },
  title: {
    fontFamily: Fonts.serif.bold,
    fontSize: 19,
    color: DEEP_BROWN,
    marginBottom: 6,
  },
  why: { fontFamily: Fonts.sans.regular, fontSize: 14, color: '#6b5a45', lineHeight: 20 },
  footer: {
    fontFamily: Fonts.serif.regular,
    fontStyle: 'italic',
    fontSize: 15,
    color: DEEP_BROWN,
    marginTop: 8,
    lineHeight: 22,
    textAlign: 'center',
  },
});

export default PathEmergesBlock;

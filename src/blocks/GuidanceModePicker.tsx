/**
 * GuidanceModePicker — Turn 5. Three cards: Universal / Hybrid (default) / Rooted.
 *
 * Web counterpart: kalpx-frontend/src/containers/ChoiceStackContainer.vue — card pick pattern.
 * Spec: docs/specs/mitra-v3-experience/screens/route_welcome_onboarding.md §1 Turn 5, §6
 * Regression cases: REG-015 (no API call until user taps; PATCH companion-state happens in
 *   onboarding_turn_response handler, not on tap of a "select" that only highlights).
 *
 * Tapping a card selects AND submits — onboarding is a conversation, not a form.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Fonts } from '../theme/fonts';
import { useScreenStore } from '../engine/useScreenBridge';
import { executeAction } from '../engine/actionExecutor';
import { interpolate } from '../engine/utils/interpolation';

const GOLD = '#eddeb4';
const DEEP_BROWN = '#432104';

const MODES = [
  {
    id: 'universal',
    title: 'Keep it simple and modern',
    desc: 'Clear, accessible language. No unfamiliar terms.',
    example: '"Today calls for slower pacing."',
  },
  {
    id: 'hybrid',
    title: 'A blend — modern clarity with spiritual depth',
    desc: 'Familiar terms, occasional Sanatan language where it fits.',
    example: '"Today is a Tamas-leaning day. Slow pacing helps."',
    default: true,
  },
  {
    id: 'rooted',
    title: 'I am drawn to the deeper roots',
    desc: 'Sanatan vocabulary visible. Gunas, doshas, panchang context.',
    example: '"Tamas rising. Your Kapha-pitta body is asking for sattvic rhythm."',
  },
];

interface Props {
  block: {
    on_response?: any;
  };
}

const GuidanceModePicker: React.FC<Props> = ({ block }) => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();

  const fire = async (modeId: string) => {
    if (!block.on_response) return;
    const base = interpolate(block.on_response, screenData);
    await executeAction(
      { ...base, payload: { ...(base.payload || {}), guidance_mode: modeId }, currentScreen },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) => {
          const { screenActions } = require('../store/screenSlice');
          const { store } = require('../store');
          store.dispatch(screenActions.setScreenValue({ key, value }));
        },
        screenState: { ...screenData },
      },
    );
  };

  const rawTurn = screenData.onboarding_turn;
  const turn =
    typeof rawTurn === "number"
      ? rawTurn
      : typeof rawTurn === "string"
        ? Number((rawTurn.match(/\d+/) || ["6"])[0])
        : 6;

  return (
    <View style={styles.wrap}>
      {MODES.map((m) => {
        const cardTestID = `onboarding_turn_${turn}_chip_${m.id}`;
        return (
          <TouchableOpacity
            key={m.id}
            style={[styles.card, m.default && styles.cardDefault]}
            onPress={() => fire(m.id)}
            activeOpacity={0.85}
            testID={cardTestID}
            accessibilityLabel={cardTestID}
          >
            <Text style={styles.title}>{m.title}</Text>
            <Text style={styles.desc}>{m.desc}</Text>
            <Text style={styles.example}>{m.example}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginVertical: 12 },
  card: {
    backgroundColor: '#fffdf9',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(237,222,180,0.5)',
  },
  cardDefault: { borderColor: GOLD, borderWidth: 1.5 },
  title: { fontFamily: Fonts.serif.bold, fontSize: 17, color: DEEP_BROWN, marginBottom: 6 },
  desc: { fontFamily: Fonts.sans.regular, fontSize: 14, color: '#6b5a45', lineHeight: 20 },
  example: {
    fontFamily: Fonts.serif.regular,
    fontStyle: 'italic',
    fontSize: 13,
    color: '#6b5a45',
    marginTop: 8,
  },
});

export default GuidanceModePicker;

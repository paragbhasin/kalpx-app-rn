/**
 * OnboardingContainer — Orchestrates the 7-turn welcome onboarding conversation.
 *
 * Web counterpart: kalpx-frontend/src/containers/PortalContainer.vue (form-shaped entry,
 *   replaced here with conversation thread). No direct 1:1 mapping — this is the RN
 *   realization of the Mitra v3 conversational onboarding.
 * Spec: docs/specs/mitra-v3-experience/screens/route_welcome_onboarding.md §4, §8, §10
 * Regression cases: REG-001 (clears onboarding_draft_state on exit/complete),
 *   REG-015 (Turn 1 disables back; no accidental completions), REG-016 (turns 4/5 have
 *   no open input).
 *
 * State machine: screenData.onboarding_turn (1-7) — advanced by onboarding_turn_response
 * action handler in actionExecutor. On mount, hydrates from screenData (AsyncStorage-backed
 * via screenSlice persistState/restoreState).
 */

import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View, BackHandler } from 'react-native';
import BlockRenderer from '../engine/BlockRenderer';
import { useScreenStore } from '../engine/useScreenBridge';

interface Props {
  schema: { blocks: any[]; tone?: any; state_id?: string };
}

const OnboardingContainer: React.FC<Props> = ({ schema }) => {
  const { screenData } = useScreenStore();
  const turn = Number(screenData.onboarding_turn || 1);

  // Disable Android back on Turn 1 (INV-equivalent: onboarding root cannot go back).
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (turn === 1) return true; // consume — abandonment confirm handled elsewhere
      return false;
    });
    return () => sub.remove();
  }, [turn]);

  const blocks = schema?.blocks || [];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {blocks.map((b: any, i: number) => (
        <BlockRenderer key={b.id || `${b.type}-${i}`} block={b} />
      ))}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#1a1a1a' },
  content: { padding: 24, paddingTop: 48 },
});

export default OnboardingContainer;

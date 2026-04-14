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

import React, { useEffect } from "react";
import { BackHandler, ScrollView, StyleSheet, View } from "react-native";
import BlockRenderer from "../engine/BlockRenderer";
import { useScreenStore } from "../engine/useScreenBridge";

interface Props {
  schema: { blocks: any[]; tone?: any; state_id?: string };
}

const OnboardingContainer: React.FC<Props> = ({ schema }) => {
  const updateBackground = useScreenStore(
    (state: any) => state.updateBackground,
  );
  const updateHeaderHidden = useScreenStore(
    (state: any) => state.updateHeaderHidden,
  );
  const screenData = useScreenStore((state: any) => state.screenData);
  const turn = Number(screenData.onboarding_turn || 1);

  useEffect(() => {
    updateBackground(require("../../assets/new_home.png"));
    updateHeaderHidden(false);
    return () => updateHeaderHidden(false);
  }, [updateBackground, updateHeaderHidden]);

  // Disable Android back on Turn 1 (INV-equivalent: onboarding root cannot go back).
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (turn === 1) return true; // consume — abandonment confirm handled elsewhere
      return false;
    });
    return () => sub.remove();
  }, [turn]);

  const blocks = schema?.blocks || [];
  const headlineBlock = blocks.find((block: any) => block.type === "headline");
  const conversationBlock = blocks.find(
    (block: any) => block.type === "onboarding_conversation_turn",
  );

  const renderTurnOne = () => {
    if (!conversationBlock) return null;

    return (
      <BlockRenderer
        block={{
          ...conversationBlock,
          headline: headlineBlock?.content,
          turnOneHero: true,
        }}
      />
    );
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {turn === 1
        ? renderTurnOne()
        : blocks.map((b: any, i: number) => (
            <BlockRenderer key={b.id || `${b.type}-${i}`} block={b} />
          ))}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Match legacy KalpX warm parchment aesthetic (Home.tsx / MitraPhilosophy).
  // Cream background, not dark immersive — onboarding is welcoming, not
  // practice-mode.
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },
});

export default OnboardingContainer;

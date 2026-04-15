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
 *
 * Block rendering strategy:
 *   - All blocks from schema are passed through to BlockRenderer.
 *   - headline + subtext blocks are injected into onboarding_conversation_turn blocks
 *     for layout (so the turn card owns its own header), then filtered from the top-level
 *     render list to avoid double-rendering.
 *   - All other block types (voice_text_fork, guidance_mode_picker, first_recognition,
 *     path_emerges) are passed through as-is so BlockRenderer can handle them.
 */

import React, { useEffect } from "react";
import { BackHandler, ScrollView, StyleSheet } from "react-native";
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
    const updatedBackground =
      turn === 1
        ? require("../../assets/new_home.png")
        : require("../../assets/beige_bg.png");
    updateBackground(updatedBackground);
    updateHeaderHidden(false);
    return () => updateHeaderHidden(false);
  }, [updateBackground, updateHeaderHidden, turn]);

  // Disable Android back on Turn 1 (INV-equivalent: onboarding root cannot go back).
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (turn === 1) return true; // consume — abandonment confirm handled elsewhere
      return false;
    });
    return () => sub.remove();
  }, [turn]);

  const blocks = schema?.blocks || [];

  // Find headline/subtext to inject into conversation turn blocks for layout.
  const headlineBlock = blocks.find((b: any) => b.type === "headline");
  const subtextBlock = blocks.find((b: any) => b.type === "subtext");

  const enrichedBlocks = blocks
    // Inject headline/subtext into conversation turn blocks; pass all others through as-is.
    .map((b: any) => {
      if (b.type === "onboarding_conversation_turn") {
        return {
          ...b,
          headline: headlineBlock?.content,
          subtext: subtextBlock?.content,
          turnOneHero: turn === 1,
        };
      }
      return b;
    })
    // Remove standalone headline/subtext — they're now owned by the turn card.
    .filter((b: any) => b.type !== "headline" && b.type !== "subtext");

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {enrichedBlocks.map((b: any, i: number) => (
        <BlockRenderer key={b.id || `conv-${i}`} block={b} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Match legacy KalpX warm parchment aesthetic (Home.tsx / MitraPhilosophy).
  // Cream background, not dark immersive — onboarding is welcoming, not practice-mode.
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },
});

export default OnboardingContainer;

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
  const _rawTurn = screenData.onboarding_turn;
  const turn =
    typeof _rawTurn === "number"
      ? _rawTurn
      : typeof _rawTurn === "string"
        ? Number((_rawTurn.match(/\d+/) || ["1"])[0])
        : 1;

  useEffect(() => {
    const isIntro = turn === 1 || turn === 2;
    const updatedBackground = isIntro
      ? require("../../assets/new_home.png")
      : require("../../assets/beige_bg.png");
    updateBackground(updatedBackground);
    updateHeaderHidden(false);
    return () => updateHeaderHidden(false);
  }, [updateBackground, updateHeaderHidden, turn]);

  // Disable Android back on Intro turns (INV-equivalent: onboarding root cannot go back).
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (turn === 1 || turn === 2) return true; // consume — abandonment confirm handled elsewhere
      return false;
    });
    return () => sub.remove();
  }, [turn]);

  const blocks = schema?.blocks || [];
  const hasGuidanceModePicker = blocks.some(
    (b: any) => b.type === "guidance_mode_picker",
  );

  // Find headline/subtext/recognition to inject into conversation turn blocks for layout.
  const headlineBlock = blocks.find((b: any) => b.type === "headline");
  const subtextBlock = blocks.find((b: any) => b.type === "subtext");
  const recognitionBlock = blocks.find((b: any) => b.type === "first_recognition");

  const enrichedBlocks = blocks
    // Inject headline/subtext into conversation turn blocks; pass all others through as-is.
    .map((b: any) => {
      if (b.type === "onboarding_conversation_turn") {
        const turnId = b.id || "";
        // Support dynamic stage data injection from screenData
        let dynamicData = null;
        if (turnId === "turn3_support" || turnId === "turn3_growth") {
          dynamicData = screenData.stage1_data;
        } else if (turnId === "turn4_support" || turnId === "turn4_growth") {
          dynamicData = screenData.stage2_data;
        } else if (turnId === "turn5_support" || turnId === "turn5_growth") {
          dynamicData = screenData.stage3_data;
        }

        return {
          ...b,
          mitra_message: dynamicData ? null : b.mitra_message,
          reply_chips: dynamicData?.chips || b.reply_chips,
          subtext: dynamicData?.sub_prompt || subtextBlock?.content || b.subtext,
          headline: dynamicData?.mitra_message || headlineBlock?.content || b.headline,
          recognition: recognitionBlock,
          guidanceModeTurn: turn === 5 && hasGuidanceModePicker,
          open_input: dynamicData?.open_input 
            ? { ...b.open_input, ...dynamicData.open_input, enabled: true } 
            : b.open_input,
          turnOneHero: turn === 1,
          isTurn7: turn === 7 || turnId === "turn7",
        };
      }
      return b;
    })
    // Remove standalone headline/subtext/recognition — they're now owned by the turn card.
    .filter((b: any) => b.type !== "headline" && b.type !== "subtext" && b.type !== "first_recognition");

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

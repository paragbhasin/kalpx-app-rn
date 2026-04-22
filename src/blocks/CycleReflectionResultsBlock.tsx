/**
 * CycleReflectionResultsBlock — post-checkpoint-submit results.
 *
 * Visual structure mirrors web (~/kalpx-frontend/src/blocks/CycleReflectionResultsBlock.vue):
 *   - Lotus header (200px width, centered)
 *   - Result title (Cormorant Garamond 26px)
 *   - Smaller lotus card embellishment
 *   - Content card with paragraphs separated by diamond dividers
 *   - Gold gradient pill CTA
 *
 * Decision tree from `finalActions` computed (web L30-110): the action set
 * varies by feeling + daysPracticed + cycle length + level. Each tap clears
 * checkpoint flow-local state (Rule 4) and navigates to the appropriate target.
 */
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { cleanupFlowState } from "../engine/cleanupFields";
import { useScreenStore } from "../engine/useScreenBridge";
import { readMomentSlot, useContentSlots } from "../hooks/useContentSlots";
import store from "../store";
import { loadScreenWithData, screenActions } from "../store/screenSlice";
import { Fonts } from "../theme/fonts";

import LotusDay14 from "../../assets/14_day_lotus.svg";
import LotusDay7 from "../../assets/7days_lotus.svg";

interface ResultAction {
  id: string;
  label: string;
  description: string;
  target: { container_id: string; state_id: string };
}

interface CycleReflectionResultsBlockProps {
  block?: { style?: any };
}

// Phase E — feeling-conditional TITLES + PARAGRAPHS now come from the
// content registry via applies_when.checkpoint_feeling. The 4-way TSX
// dict that previously held them is removed. stage_signals.checkpoint_
// feeling passes through buildCtx → orchestrator picks the keyed
// variant (strong / slight / same / worse) and serves result_title +
// paragraph_1 + paragraph_2. Default variant covers unknown feelings.

// Stable analytics ids (not content labels).
type ActionId = "change_focus" | "deepen" | "restart" | "refine";

const ACTION_LABEL_SLOT: Record<ActionId, string> = {
  change_focus: "action_new_focus_label",
  deepen: "action_deepen_label",
  restart: "action_restart_label",
  refine: "action_continue_label",
};
const ACTION_DESC_SLOT: Record<ActionId, string> = {
  change_focus: "action_new_focus_desc",
  deepen: "action_deepen_desc",
  restart: "action_restart_desc",
  refine: "action_continue_desc",
};

const CycleReflectionResultsBlock: React.FC<
  CycleReflectionResultsBlockProps
> = ({ block }) => {
  const screenData = useScreenStore((s) => s.screenData);
  const ss = screenData as Record<string, any>;

  // Phase E — M_cycle_reflection_results is multi-variant, keyed on
  // stage_signals.checkpoint_feeling. The orchestrator's specificity
  // sort prefers a feeling-specific variant over the default.
  const feeling: string =
    (screenData.checkpoint_feeling as any) ||
    (screenData.checkpoint_completed_decision as any) ||
    "same";
  const day = screenData.checkpoint_day || 7;
  const is14 = day === 14;
  const daysEngaged = screenData.checkpoint_days_engaged || 0;
  const totalDays = screenData.checkpoint_total_days || day;

  useContentSlots({
    momentId: "M_cycle_reflection_results",
    screenDataKey: "cycle_reflection_results",
    buildCtx: (s) => ({
      path: s.journey_path === "growth" ? "growth" : "support",
      guidance_mode: s.guidance_mode || "hybrid",
      locale: s.locale || "en",
      user_attention_state: "reflective_exposed",
      emotional_weight: "heavy",
      cycle_day: Number(s.checkpoint_day) || Number(s.day_number) || 14,
      entered_via: s._entered_via || "day_14_submit",
      // Pass feeling into stage_signals so the variant router can key on it.
      stage_signals: { checkpoint_feeling: feeling },
      today_layer: {},
      life_layer: {
        cycle_id: s.journey_id || s.cycle_id || "",
        life_kosha: s.life_kosha || s.scan_focus || "",
        scan_focus: s.scan_focus || "",
        life_klesha: s.life_klesha || null,
        life_vritti: s.life_vritti || null,
        life_goal: s.life_goal || null,
      },
    }),
  });
  const slot = (name: string) =>
    readMomentSlot(ss, "cycle_reflection_results", name);

  // Decision tree mirrors web finalActions (L30-110)
  const actions: ResultAction[] = [];
  const isStrong = feeling === "strong";

  // Action set is driven by the decision tree; labels/descriptions
  // come from registry slots (ACTION_LABEL_SLOT / ACTION_DESC_SLOT).
  // Fallback to empty string per the null-safe contract — no TSX
  // English fallback.
  const pushAction = (
    id: ActionId,
    targetContainer: string,
    targetState: string,
    altLabelSlot?: string,
    altDescSlot?: string,
  ) => {
    actions.push({
      id,
      label: slot(altLabelSlot || ACTION_LABEL_SLOT[id]),
      description: slot(altDescSlot || ACTION_DESC_SLOT[id]),
      target: { container_id: targetContainer, state_id: targetState },
    });
  };

  if (isStrong) {
    pushAction("change_focus", "choice_stack", "discipline_select");
    if (daysEngaged >= totalDays) {
      pushAction("deepen", "companion_dashboard", "day_active");
    }
  } else if (daysEngaged < 5) {
    pushAction("restart", "companion_dashboard", "day_active");
  } else if (daysEngaged >= totalDays && !isStrong) {
    pushAction("deepen", "companion_dashboard", "day_active");
  } else {
    pushAction("refine", "companion_dashboard", "day_active");
    // "Alter My Practices" uses the alter_ slot set (label differs from
    // the generic change_focus labeling above).
    pushAction(
      "change_focus",
      "choice_stack",
      "discipline_select",
      "action_alter_label",
      "action_alter_desc",
    );
  }

  // Feeling-keyed copy now served from registry via slot().
  const title = slot("result_title");
  const paragraphs = [slot("paragraph_1"), slot("paragraph_2")].filter(Boolean);

  const handleAction = (action: ResultAction) => {
    store.dispatch(
      screenActions.setScreenValue({
        key: "checkpoint_completed",
        value: true,
      }),
    );
    const writeState = (value: any, key: string) => {
      store.dispatch(screenActions.setScreenValue({ key, value }));
    };
    cleanupFlowState("checkpoint", writeState);
    store.dispatch(
      loadScreenWithData({
        containerId: action.target.container_id,
        stateId: action.target.state_id,
      }),
    );
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Big lotus header */}
      <View style={styles.lotusHeader}>
        {is14 ? (
          <LotusDay14 width={170} height={170} />
        ) : (
          <LotusDay7 width={170} height={170} />
        )}
      </View>

      <Text style={styles.resultTitle}>{title}</Text>

      {/* Smaller decorative lotus */}
      <View style={styles.lotusCardWrap}>
        {is14 ? (
          <LotusDay14 width={100} height={100} />
        ) : (
          <LotusDay7 width={84} height={84} />
        )}
      </View>

      {/* Content card */}
      <View style={styles.contentCard}>
        <View style={styles.resultText}>
          {paragraphs.map((para, idx) => (
            <View key={idx}>
              <Text style={styles.paragraph}>{para}</Text>
              {idx < paragraphs.length - 1 && <DiamondDivider />}
            </View>
          ))}
        </View>

        <DiamondDivider />

        {/* Action buttons */}
        <View style={styles.ctaArea}>
          {actions.map((action, idx) => (
            <View key={action.id} style={{ width: "100%" }}>
              {idx > 0 && (
                <Text style={styles.orDivider}>{slot("action_divider")}</Text>
              )}
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => handleAction(action)}
                activeOpacity={0.92}
              >
                <Text style={styles.ctaText}>Continue Same</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryctaButton, { marginTop: 12 }]}
                onPress={() => handleAction(action)}
                activeOpacity={0.92}
              >
                <Text style={styles.ctaText}>Change Focus</Text>
              </TouchableOpacity>
              <Text style={styles.optionDescription}>{action.description}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const DiamondDivider: React.FC = () => (
  <View style={dividerStyles.wrap}>
    <View style={dividerStyles.line} />
    <View style={dividerStyles.diamond} />
    <View style={dividerStyles.line} />
  </View>
);

const GOLD = "#d9a557";
const GOLD_DARK = "#c7a64b";
const DARK = "#432104";

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: 36,
    paddingBottom: 64,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  lotusHeader: {
    width: "100%",
    alignItems: "center",
    marginBottom: 8,
  },
  resultTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 26,
    color: DARK,
    textAlign: "center",
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  lotusCardWrap: {
    width: "70%",
    alignItems: "center",
    marginBottom: -35,
  },
  contentCard: {
    width: "100%",
    maxWidth: 400,
    borderWidth: 0.5,
    borderColor: GOLD_DARK,
    borderRadius: 24,
    padding: 18,
    backgroundColor: "#ffffff",
    marginBottom: 18,
  },
  resultText: {
    marginBottom: 16,
  },
  paragraph: {
    fontFamily: Fonts.serif.regular,
    fontSize: 17,
    lineHeight: 27,
    color: "#4d2b09",
    textAlign: "center",
    opacity: 0.92,
    paddingHorizontal: 4,
  },
  ctaArea: {
    width: "100%",
    gap: 8,
  },
  ctaButton: {
    backgroundColor: "#FBF5F5",
    borderColor: "#9f9f9f",
    borderWidth: 0.3,
    borderRadius: 20,
    padding: 10,
    elevation: 6,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  secondaryctaButton: {
    backgroundColor: "#FBF5F5",
    borderColor: "#c89a47",
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    elevation: 6,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  ctaInner: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  ctaText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 16,
    color: "#432104",
    alignSelf: "center",
  },
  optionDescription: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    lineHeight: 18,
    color: "#4d2b09",
    opacity: 0.7,
    textAlign: "center",
    paddingHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  orDivider: {
    fontFamily: Fonts.serif.bold,
    fontSize: 14,
    color: "#bfa58a",
    letterSpacing: 2,
    textAlign: "center",
    marginVertical: 14,
  },
  cycleSummary: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#8c7355",
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 24,
  },
});

const dividerStyles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginVertical: 16,
  },
  line: {
    flex: 1,
    maxWidth: 80,
    height: 1,
    backgroundColor: GOLD,
    opacity: 0.4,
  },
  diamond: {
    width: 8,
    height: 8,
    backgroundColor: GOLD,
    transform: [{ rotate: "45deg" }],
  },
});

export default CycleReflectionResultsBlock;

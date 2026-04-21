/**
 * LifeContextPickerSheet — 2-step UX interstitial between room tap and render.
 *
 * Sits between the RoomEntrySheet row tap (enter_room dispatch) and the
 * RoomContainer render fetch. The user picks one of 7 canonical life-context
 * slugs — or skips — and then the canonical v3.1 RoomRenderer mounts with
 * the life_context appended to the render URL.
 *
 * Spec: founder-locked 2026-04-20.
 *   - Single sheet, 7 options in fixed canonical order, skip link at the foot
 *   - No explanatory paragraph, no branching, no progress dots, no multi-select
 *   - Hardware/gesture back → dashboard (no mid-flow orphan)
 *
 * Styling: matches RoomEntrySheet — cream sheet, serif header, soft gold
 * hairline, muted brown body. No accent bar (simpler visual weight than
 * the room chooser; this is a narrower decision surface).
 */

import React, { useEffect } from "react";
import { BackHandler, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "../../theme/colors";
import { Fonts } from "../../theme/fonts";

export type LifeContext =
  | "work_career"
  | "relationships"
  | "self"
  | "health_energy"
  | "money_security"
  | "purpose_direction"
  | "daily_life";

interface LifeContextOption {
  slug: LifeContext;
  label: string;
  testID: string;
}

/**
 * Order-locked per founder spec (2026-04-20). Do not reorder.
 * Note: slug `self` renders as label "Myself".
 */
const LIFE_CONTEXT_OPTIONS: LifeContextOption[] = [
  { slug: "work_career", label: "Work & career", testID: "life_context_picker_work_career" },
  { slug: "relationships", label: "Relationships", testID: "life_context_picker_relationships" },
  { slug: "self", label: "Myself", testID: "life_context_picker_self" },
  { slug: "health_energy", label: "Health & energy", testID: "life_context_picker_health_energy" },
  { slug: "money_security", label: "Money & security", testID: "life_context_picker_money_security" },
  { slug: "purpose_direction", label: "Purpose & direction", testID: "life_context_picker_purpose_direction" },
  { slug: "daily_life", label: "Daily life", testID: "life_context_picker_daily_life" },
];

export interface LifeContextPickerSheetProps {
  visible: boolean;
  onPick: (slug: LifeContext) => void;
  onSkip: () => void;
  /**
   * Invoked on hardware/gesture back. Should return the user to the
   * dashboard (no mid-flow orphan). Caller owns the navigation.
   */
  onBack: () => void;
}

const LifeContextPickerSheet: React.FC<LifeContextPickerSheetProps> = ({
  visible,
  onPick,
  onSkip,
  onBack,
}) => {
  // Android hardware back → dashboard via onBack.
  useEffect(() => {
    if (!visible || Platform.OS !== "android") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [visible, onBack]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={Platform.OS !== "ios"}
      presentationStyle={Platform.OS === "ios" ? "pageSheet" : "overFullScreen"}
      onRequestClose={onBack}
    >
      <View
        style={styles.scrim}
        accessible={false}
        importantForAccessibility="no"
      >
        <View
          style={styles.sheet}
          accessible={false}
          importantForAccessibility="no"
          testID="life_context_picker_sheet"
        >
          <View style={styles.handle} />
          <Text style={styles.header} testID="life_context_picker_header">
            What part of life is this touching most right now?
          </Text>

          <View style={styles.optionsBlock}>
            {LIFE_CONTEXT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.slug}
                style={styles.row}
                activeOpacity={0.85}
                onPress={() => onPick(opt.slug)}
                testID={opt.testID}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={opt.label}
              >
                <Text
                  style={styles.rowLabel}
                  accessible={false}
                  importantForAccessibility="no"
                >
                  {opt.label}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.brownMuted}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.skipRow}
            activeOpacity={0.7}
            onPress={onSkip}
            testID="life_context_picker_skip"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Skip for now"
          >
            <Text style={styles.skipLabel}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: Platform.OS === "ios" ? Colors.cream : "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 28,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderCream,
    marginBottom: 18,
  },
  header: {
    fontFamily: Fonts.serif.bold,
    fontSize: 20,
    lineHeight: 28,
    color: Colors.brownDeep,
    marginBottom: 18,
    letterSpacing: 0.2,
  },
  optionsBlock: {
    // intentionally empty — rows handle own spacing
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: 14,
    marginBottom: 6,
    borderRadius: 12,
    backgroundColor: Colors.parchment,
  },
  rowLabel: {
    flex: 1,
    fontFamily: Fonts.serif.bold,
    fontSize: 16,
    color: Colors.brownDeep,
    letterSpacing: 0.15,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.goldHairline,
    marginTop: 14,
    marginBottom: 4,
  },
  skipRow: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  skipLabel: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#6E6E73",
    letterSpacing: 0.2,
  },
});

export default LifeContextPickerSheet;

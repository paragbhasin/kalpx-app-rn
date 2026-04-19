/**
 * MoreSupportSheet — bottom sheet opened from QuickSupportBlock with
 * Grief / Lonely shortcuts.
 *
 * Spec: docs/NEW_DASHBOARD_V1_SPEC.md §2 #10 + §7 acceptance checklist.
 *
 * Routing (via executeAction — canonical pattern):
 *   Grief   → dispatch `enter_grief_room`    → support_grief / room
 *   Lonely  → dispatch `enter_loneliness_room` → support_loneliness / room
 *
 * The handlers in actionExecutor.ts own the full transition: they clear
 * runner_* state, stamp session_* timestamps, fetch context, and call
 * loadScreen with the correct {container_id, state_id: "room"} shape that
 * allContainers.js actually registers. Previously this sheet called
 * loadScreen directly with state_id "grief_room" / "loneliness_room" —
 * which returned no schema (see SCREEN_SLICE "No schema found" warning)
 * and rendered as an empty Screen.
 *
 * Sovereignty: labels come from screenData.support_rooms_labels
 * (grief_label, loneliness_label, header_label). If labels are missing
 * the row is hidden rather than showing an English fallback.
 */

import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { executeAction } from "../../engine/actionExecutor";
import { useScreenStore } from "../../engine/useScreenBridge";
import store from "../../store";
import { screenActions } from "../../store/screenSlice";
import { Colors } from "../../theme/colors";
import { Fonts } from "../../theme/fonts";

type Props = {
  visible: boolean;
  onClose: () => void;
  screenData?: Record<string, any>;
};

type Row = {
  key: "grief" | "loneliness";
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  actionType: "enter_grief_room" | "enter_loneliness_room";
};

const MoreSupportSheet: React.FC<Props> = ({
  visible,
  onClose,
  screenData,
}) => {
  const sd = screenData ?? {};
  const labels = (sd.support_rooms_labels ?? {}) as Record<string, string>;
  // MDR-S1-11: sovereignty-strict. Labels are governed by the backend
  // envelope (`journey_envelope._build_new_dashboard_slots`). If a label is
  // missing, the row hides rather than falling back to English — matches
  // the standing Sovereignty rule (rule 3 in the delivery-restoration
  // baseline) and the sheet's long-standing docstring contract.
  const headerLabel: string = labels.header_label ?? "";

  const { loadScreen, goBack } = useScreenStore();

  const rows: Row[] = [
    ...(labels.grief_label
      ? [{
          key: "grief" as const,
          label: labels.grief_label,
          icon: "water-outline" as const,
          actionType: "enter_grief_room" as const,
        }]
      : []),
    ...(labels.loneliness_label
      ? [{
          key: "loneliness" as const,
          label: labels.loneliness_label,
          icon: "people-outline" as const,
          actionType: "enter_loneliness_room" as const,
        }]
      : []),
  ];

  // If header and all rows are empty, hide the sheet entirely — nothing to say.
  const hasContent = !!headerLabel || rows.length > 0;

  const go = (actionType: Row["actionType"]) => {
    onClose();
    // Defer slightly so the modal dismiss animation doesn't swallow
    // the navigation (matches the pattern used by VoiceConsentSheet).
    setTimeout(() => {
      executeAction(
        { type: actionType, payload: { source: "more_support_sheet" } },
        {
          loadScreen,
          goBack,
          setScreenValue: (value: any, key: string) =>
            store.dispatch(screenActions.setScreenValue({ key, value })),
          screenState: store.getState().screen.screenData,
        },
      ).catch(() => {});
    }, 120);
  };

  // MDR-S1-11: if the envelope has seeded nothing, do not render — avoid
  // an empty modal chrome with no content. Sovereignty-strict: no English
  // default survives this surface.
  if (!hasContent) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.scrim} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          {!!headerLabel && <Text style={styles.header}>{headerLabel}</Text>}
          {rows.map((row) =>
            row.label ? (
              <TouchableOpacity
                key={row.key}
                style={styles.row}
                activeOpacity={0.85}
                onPress={() => go(row.actionType)}
                testID={
                  row.key === "grief"
                    ? "more_support_grief_row"
                    : "more_support_loneliness_row"
                }
              >
                <View style={styles.iconWrap}>
                  <Ionicons name={row.icon} size={18} color={Colors.gold} />
                </View>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors.brownMuted}
                />
              </TouchableOpacity>
            ) : null,
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderCream,
    marginBottom: 12,
  },
  header: {
    fontFamily: Fonts.serif.bold,
    fontSize: 16,
    color: Colors.brownDeep,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.borderCream,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.goldPale,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowLabel: {
    flex: 1,
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: Colors.brownDeep,
  },
});

export default MoreSupportSheet;

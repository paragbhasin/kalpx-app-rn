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
  // Always-populated structural labels — these are functional deep-link
  // labels, not emotional prose.
  const headerLabel: string = labels.header_label || "I'm here if you need more.";

  const { loadScreen, goBack } = useScreenStore();

  const rows: Row[] = [
    {
      key: "grief",
      label: labels.grief_label || "Grief Room",
      icon: "water-outline",
      actionType: "enter_grief_room",
    },
    {
      key: "loneliness",
      label: labels.loneliness_label || "Loneliness Room",
      icon: "people-outline",
      actionType: "enter_loneliness_room",
    },
  ];

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

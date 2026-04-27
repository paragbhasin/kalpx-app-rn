/**
 * RoomEntrySheet — premium bottom sheet listing all 6 canonical rooms.
 *
 * Spec: docs/ROOM_SYSTEM_V3_1_ARCHITECTURE.md §14.3 (v3.1.1-wisdom — founder
 * approved 2026-04-20) + docs/room_system_v31/ROOM_CHIP_CONTRACT_V1_1.md.
 *
 * Replaces the legacy MoreSupportSheet (grief + loneliness only) as the
 * dashboard's "More ways to be supported →" surface. Renders all 6 rooms
 * in the order-locked sequence from §14.3, regardless of envelope state —
 * this list is FE-authored static copy per §14.6 (BE has no schema for
 * sheet entries).
 *
 * Row order (locked):
 *   1. room_stillness  — "I'm overwhelmed"
 *   2. room_connection — "I feel alone"
 *   3. room_release    — "Something is heavy"
 *   4. room_clarity    — "I'm not sure / I want clarity"
 *   5. room_growth     — "I want to grow as a person"
 *   6. room_joy        — "I'm in a good place"
 *
 * Styling intent (§14.7):
 *   - 72px row height with breathing room
 *   - Muted dharmic-palette backing per room (§6 Opening Experience family)
 *   - Serif label; subtle chevron affordance
 *   - No inline descriptions; no icons in v1
 *
 * Analytics (§14.6):
 *   - Sheet open → `room_entry_sheet_opened`
 *   - Row tap    → `room_entry_sheet_tap` with `{ room_id }`
 *
 * Accessibility: mirrors MoreSupportSheet a11y hardening (MDR-S1-15 / H-3).
 * Scrim + sheet containers are `accessible=false`; rows are the single
 * accessible leaves with `accessibilityRole=button` + authored labels.
 */

import React, { useEffect } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { mitraTrackEvent } from "../../engine/mitraApi";
import { Colors } from "../../theme/colors";
import { Fonts } from "../../theme/fonts";
import type { RoomId } from "./types";

export interface RoomEntrySheetProps {
  visible: boolean;
  onDismiss: () => void;
  onRoomEntry: (room_id: RoomId) => void;
}

interface SheetRow {
  room_id: RoomId;
  label: string;
  testID: string;
  /** Subtle accent derived from §6 Opening Experience palette family. */
  accent: string;
  /** Muted backing tint for the row card. */
  backing: string;
}

/**
 * Order-locked per §14.3 — do not reorder without founder sign-off.
 *
 * Color families are muted variants of §6 Opening Experience palettes:
 *   - stillness_dawn     → soft parchment dawn
 *   - connection_warmth  → peach lotus warmth
 *   - release_grey       → soft grey hold
 *   - clarity_silver     → pale silver discernment
 *   - growth_earth       → earthen path
 *   - joy_gold           → pale gold fullness
 */
const ROOM_ROWS: SheetRow[] = [
  {
    room_id: "room_stillness",
    label: "I'm overwhelmed",
    testID: "room_entry_sheet_stillness",
    accent: "#B9A98D",
    backing: "#F6F2EA",
  },
  {
    room_id: "room_connection",
    label: "I feel alone",
    testID: "room_entry_sheet_connection",
    accent: "#C8A698",
    backing: "#F7EFEB",
  },
  {
    room_id: "room_release",
    label: "Something is heavy",
    testID: "room_entry_sheet_release",
    accent: "#9A9A9A",
    backing: "#F1F0EE",
  },
  {
    room_id: "room_clarity",
    label: "I'm not sure / I want clarity",
    testID: "room_entry_sheet_clarity",
    accent: "#A9B2B6",
    backing: "#F0F2F3",
  },
  {
    room_id: "room_growth",
    label: "I want to grow as a person",
    testID: "room_entry_sheet_growth",
    accent: "#9C7F5A",
    backing: "#F4EDE2",
  },
  {
    room_id: "room_joy",
    label: "I'm in a good place",
    testID: "room_entry_sheet_joy",
    accent: "#C9A84C",
    backing: "#FBF4DC",
  },
];

const RoomEntrySheet: React.FC<RoomEntrySheetProps> = ({
  visible,
  onDismiss,
  onRoomEntry,
}) => {
  // Fire open analytics once per visibility transition to visible=true.
  useEffect(() => {
    if (!visible) return;
    try {
      mitraTrackEvent("room_entry_sheet_opened", {
        meta: { source: "quick_support_block" },
      });
    } catch {
      // Analytics best-effort — never block sheet from opening.
    }
  }, [visible]);

  const handleRowTap = (row: SheetRow) => {
    try {
      mitraTrackEvent("room_entry_sheet_tap", {
        meta: { room_id: row.room_id },
      });
    } catch {
      // best-effort
    }
    onDismiss();
    // Defer nav slightly so the modal dismiss animation plays smoothly
    // before the handler fires (matches MoreSupportSheet pattern).
    setTimeout(() => {
      onRoomEntry(row.room_id);
    }, 120);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={onDismiss}
    >
      <View
        style={styles.scrim}
        accessible={false}
        importantForAccessibility="no"
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onDismiss}
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          testID="room_entry_sheet_scrim"
        />
        <View
          style={styles.sheet}
          accessible={false}
          importantForAccessibility="no"
          testID="room_entry_sheet"
        >
          <View style={styles.handle} />
          <Text style={styles.header} testID="room_entry_sheet_header">
            More ways to be supported
          </Text>
          {ROOM_ROWS.map((row) => (
            <TouchableOpacity
              key={row.room_id}
              style={[styles.row, { backgroundColor: row.backing }]}
              activeOpacity={0.88}
              onPress={() => handleRowTap(row)}
              testID={row.testID}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={row.label}
            >
              <View
                style={[styles.accent, { backgroundColor: row.accent }]}
                accessible={false}
                importantForAccessibility="no"
              />
              <Text
                style={styles.rowLabel}
                accessible={false}
                importantForAccessibility="no"
              >
                {row.label}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.brownMuted}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 28,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderCream,
    marginBottom: 14,
  },
  header: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: Colors.brownDeep,
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 72,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
  },
  accent: {
    width: 4,
    height: 36,
    borderRadius: 2,
    marginRight: 14,
  },
  rowLabel: {
    flex: 1,
    fontFamily: Fonts.serif.bold,
    fontSize: 16,
    color: Colors.brownDeep,
    letterSpacing: 0.15,
  },
});

export default RoomEntrySheet;

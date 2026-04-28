/**
 * QuickSupportBlock — dashboard §14 quick-support surface.
 *
 * Spec: docs/ROOM_SYSTEM_V3_1_ARCHITECTURE.md §14 (v3.1.1-wisdom — founder
 * approved 2026-04-20) + docs/room_system_v31/ROOM_CHIP_CONTRACT_V1_1.md.
 *
 * Primary row (§14.1) — always visible, exactly 3 chips in this order:
 *   1. "I Feel Triggered"       → `initiate_trigger`        (existing trigger flow)
 *   2. "Quick Check-in"         → `start_checkin`           (cycle_transitions/quick_checkin)
 *   3. "I'm in a good place"    → `enter_room {room_id:"room_joy"}`
 *
 * Footer link (§14.2):
 *   "More ways to be supported →" → opens RoomEntrySheet (6 canonical rooms).
 *
 * Prior chip set (Track 1 joy_chip / growth_chip primary placements) is
 * retired per §14.5. Joy retains dual entry (primary chip + sheet row).
 * Growth moves exclusively to the sheet. The legacy MoreSupportSheet
 * (grief + loneliness only) is deprecated — RoomEntrySheet supersedes.
 *
 * Sovereignty: these chips are factual UI labels (not emotional prose).
 * Structural English is approved per §14 founder sign-off. Labels here are
 * load-bearing copy from the architecture, not backend-seeded text —
 * deviating from them breaks the Chip Contract v1.1.
 */

import React, { useState } from "react";
import {
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
import RoomEntrySheet from "../room/RoomEntrySheet";
import type { RoomId } from "@kalpx/types";

type Props = {
  screenData?: Record<string, any>;
};

const QuickSupportBlock: React.FC<Props> = ({ screenData }) => {
  const sd = screenData ?? {};

  const [sheetVisible, setSheetVisible] = useState(false);
  const { loadScreen, goBack } = useScreenStore();

  const dispatchAction = (type: string, payload?: Record<string, any>) => {
    executeAction(
      payload ? ({ type, payload } as any) : ({ type } as any),
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          store.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: store.getState().screen.screenData,
      },
    ).catch(() => {});
  };

  const handleRoomEntry = (room_id: RoomId) => {
    dispatchAction("enter_room", { room_id, source: "room_entry_sheet" });
  };

  return (
    <View style={styles.wrap} accessibilityLabel="quick_support_block">
      {/* §14.1 Chip 1 — I Feel Triggered */}
      <TouchableOpacity
        style={styles.primary}
        activeOpacity={0.88}
        onPress={() => dispatchAction("initiate_trigger")}
        testID="quick_support_triggered"
      >
        <Ionicons
          name="alert-circle-outline"
          size={16}
          color={Colors.brownDeep}
          style={styles.primaryIcon}
        />
        <Text style={styles.primaryText}>I Feel Triggered</Text>
      </TouchableOpacity>

      {/* §14.1 Chip 2 — Quick Check-in */}
      <TouchableOpacity
        style={[styles.primary, styles.primaryBordered]}
        activeOpacity={0.88}
        onPress={() => dispatchAction("start_checkin")}
        testID="quick_support_checkin"
      >
        <Ionicons
          name="checkmark-circle-outline"
          size={16}
          color={Colors.brownDeep}
          style={styles.primaryIcon}
        />
        <Text style={styles.primaryText}>Quick Check-in</Text>
      </TouchableOpacity>

      {/* §14.1 Chip 3 — I'm in a good place → enter_room room_joy */}
      <TouchableOpacity
        style={[styles.primary, styles.primaryBordered]}
        activeOpacity={0.88}
        onPress={() =>
          dispatchAction("enter_room", {
            room_id: "room_joy",
            source: "quick_support_good_place",
          })
        }
        accessibilityLabel="good_place_chip"
        testID="quick_support_good_place"
      >
        <Ionicons
          name="sunny-outline"
          size={16}
          color={Colors.brownDeep}
          style={styles.primaryIcon}
        />
        <Text style={styles.primaryText}>I'm in a good place</Text>
      </TouchableOpacity>

      {/* §14.2 Footer link — opens RoomEntrySheet */}
      <TouchableOpacity
        style={styles.more}
        activeOpacity={0.7}
        onPress={() => setSheetVisible(true)}
        testID="quick_support_more_ways"
      >
        <Text style={styles.moreText}>More ways to be supported</Text>
        <Ionicons
          name="arrow-forward"
          size={14}
          color={Colors.brownMuted}
          style={styles.moreArrow}
        />
      </TouchableOpacity>

      <RoomEntrySheet
        visible={sheetVisible}
        onDismiss={() => setSheetVisible(false)}
        onRoomEntry={handleRoomEntry}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginTop: 16,
  },
  primary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.lotusPeach,
    borderRadius: 28,
    paddingVertical: 14,
    marginBottom: 10,
  },
  primaryBordered: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  primaryIcon: {
    marginRight: 8,
  },
  primaryText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 15,
    color: Colors.brownDeep,
    letterSpacing: 0.3,
  },
  more: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginTop: 4,
  },
  moreText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 13,
    color: Colors.brownMuted,
    marginRight: 4,
  },
  moreArrow: {
    marginLeft: 2,
  },
});

export default QuickSupportBlock;

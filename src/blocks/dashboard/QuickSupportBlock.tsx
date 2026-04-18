/**
 * QuickSupportBlock — two primary support CTAs + "More support ›" link
 * that opens MoreSupportSheet.
 *
 * Spec: docs/NEW_DASHBOARD_V1_SPEC.md §2 #10.
 *
 * Primary actions:
 *   - `initiate_trigger` — (legacy alias: `open_trigger`)
 *   - `open_check_in`    — (legacy alias: `start_checkin`)
 * Both are handled in src/engine/actionExecutor.ts (T3B-4).
 *
 * Labels come from screenData.quick_support_labels:
 *   { triggered_label, checkin_label, more_label }
 *
 * If both primary labels are missing we still render the block header
 * skeleton (more_label sheet remains available); if all three are
 * missing we render null — pure sovereignty fallback.
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
import MoreSupportSheet from "./MoreSupportSheet";

type Props = {
  screenData?: Record<string, any>;
};

const QuickSupportBlock: React.FC<Props> = ({ screenData }) => {
  const sd = screenData ?? {};
  const labels = (sd.quick_support_labels ?? {}) as Record<string, string>;
  // Always-visible core block — support must always be reachable. CTAs
  // are factual UI labels (not emotional prose), so structural English
  // fallbacks are acceptable per the sovereignty contract.
  const triggeredLabel: string = labels.triggered_label || "I Feel Triggered";
  const checkinLabel: string = labels.checkin_label || "Quick Check-in";
  const moreLabel: string = labels.more_label || "More support";

  const [sheetVisible, setSheetVisible] = useState(false);
  const { loadScreen, goBack } = useScreenStore();

  const dispatchAction = (type: string) => {
    executeAction(
      { type },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          store.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: store.getState().screen.screenData,
      },
    ).catch(() => {});
  };

  return (
    <View style={styles.wrap} accessibilityLabel="quick_support_block">
      <TouchableOpacity
        style={styles.primary}
        activeOpacity={0.88}
        onPress={() => dispatchAction("initiate_trigger")}
      >
        <Ionicons
          name="alert-circle-outline"
          size={16}
          color={Colors.brownDeep}
          style={styles.primaryIcon}
        />
        <Text style={styles.primaryText}>{triggeredLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.primary, styles.primaryBordered]}
        activeOpacity={0.88}
        onPress={() => dispatchAction("open_check_in")}
      >
        <Ionicons
          name="checkmark-circle-outline"
          size={16}
          color={Colors.brownDeep}
          style={styles.primaryIcon}
        />
        <Text style={styles.primaryText}>{checkinLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.more}
        activeOpacity={0.7}
        onPress={() => setSheetVisible(true)}
      >
        <Text style={styles.moreText}>{moreLabel}</Text>
        <Ionicons
          name="chevron-forward"
          size={14}
          color={Colors.brownMuted}
        />
      </TouchableOpacity>

      <MoreSupportSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        screenData={sd}
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
});

export default QuickSupportBlock;

/**
 * CheckInCardCompact — "How are you landing?" inline dashboard check-in.
 *
 * Shows 3 state chips (Steady / Heavy / Activated). On tap, dispatches
 * acknowledge_check_in (fires prana-acknowledge + marks dismissed).
 * REG-015: check-in uses its own local dismiss flag; does NOT share runner
 * state with the core mantra/sankalp/practice flow.
 *
 * Web parity:
 *   - Spec: route_dashboard_day_active.md §1 (SupportEntryRow quick check-in), §7 (PrepCard adjacency)
 *   - Existing web flow: kalpx-frontend/src/mock/mock/allContainers.js — cycle_transitions/quick_checkin
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Fonts } from "../theme/fonts";
import { executeAction } from "../engine/actionExecutor";
import { useContentSlots, readMomentSlot } from "../hooks/useContentSlots";
import { useScreenStore } from "../engine/useScreenBridge";
import store from "../store";
import { screenActions } from "../store/screenSlice";

// Stable chip ids (analytics keys); labels now slot-resolved.
const CHIP_IDS = ["steady", "heavy", "activated"] as const;

const CheckInCardCompact: React.FC<{ block?: any }> = () => {
  const { screenData, loadScreen, goBack } = useScreenStore();
  const ss = screenData as Record<string, any>;

  useContentSlots({
    momentId: "M_checkin_compact",
    screenDataKey: "checkin_compact",
    buildCtx: (s) => ({
      path: s.journey_path === "growth" ? "growth" : "support",
      guidance_mode: s.guidance_mode || "hybrid",
      locale: s.locale || "en",
      user_attention_state: "scanning",
      emotional_weight: "light",
      cycle_day: Number(s.day_number) || 0,
      entered_via: "dashboard_embed",
      stage_signals: {},
      today_layer: {},
      life_layer: {
        cycle_id: s.journey_id || s.cycle_id || "",
        life_kosha: s.life_kosha || s.scan_focus || "",
        scan_focus: s.scan_focus || "",
      },
    }),
  });
  const slot = (name: string) => readMomentSlot(ss, "checkin_compact", name);

  if (ss.check_in_dismissed) return null;

  const onChip = (id: string) => {
    executeAction(
      { type: "acknowledge_check_in", payload: { prana_state: id } },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          store.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: store.getState().screen.screenData,
      },
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.prompt}>{slot("prompt")}</Text>
      <View style={styles.row}>
        {CHIP_IDS.map((id) => (
          <TouchableOpacity
            key={id}
            style={styles.chip}
            activeOpacity={0.8}
            onPress={() => onChip(id)}
          >
            <Text style={styles.chipText}>{slot(`chip_${id}`)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF8EF",
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(212, 160, 23, 0.2)",
  },
  prompt: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    color: "#432104",
    marginBottom: 10,
    textAlign: "center",
  },
  row: { flexDirection: "row", justifyContent: "center", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#c9a84c",
    backgroundColor: "#fffdf9",
  },
  chipText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#432104",
  },
});

export default CheckInCardCompact;

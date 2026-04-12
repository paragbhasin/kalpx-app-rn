/**
 * FocusPhraseBlock — single-line muted gold italic focus phrase for the dashboard.
 *
 * Web parity:
 *   - Spec: kalpx-frontend/docs/specs/mitra-v3-experience/screens/route_dashboard_day_active.md §10 (DayTypeHeader sub-header)
 *   - Phase 1.5 expansive_phrase wiring: morning_briefing_templates.yaml
 *
 * Reads from screenData: focus_phrase:string
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Fonts } from "../theme/fonts";
import { useScreenStore } from "../engine/useScreenBridge";

const FocusPhraseBlock: React.FC<{ block?: any }> = ({ block }) => {
  const { screenData } = useScreenStore();
  const phrase = (block?.content as string) || (screenData as any).focus_phrase || "";
  if (!phrase) return null;
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{phrase}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingHorizontal: 16, marginVertical: 6 },
  text: {
    fontFamily: Fonts.sans.regular,
    fontStyle: "italic",
    fontSize: 14,
    color: "#b89450",
    textAlign: "center",
  },
});

export default FocusPhraseBlock;

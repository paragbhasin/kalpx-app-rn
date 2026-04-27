/**
 * SankalpCarryBlock — "how to carry your vow today" section.
 *
 * Spec: docs/NEW_DASHBOARD_V1_SPEC.md §2 #9
 * Lifted from: src/containers/CompanionDashboardContainer.tsx:475 (sankalpHowToLive).
 *
 * Renders only when:
 *   - screenData.practice_embody is truthy (user committed a sankalp today), AND
 *   - screenData.sankalp_how_to_live[] is a non-empty list of strings.
 *
 * Sovereignty: header label comes from screenData.sankalp_how_to_live_label;
 * if missing we render only the list (no English fallback header).
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../theme/colors";
import { Fonts } from "../../theme/fonts";

type Props = {
  screenData?: Record<string, any>;
};

const SankalpCarryBlock: React.FC<Props> = ({ screenData }) => {
  const sd = screenData ?? {};
  if (!sd.practice_embody) return null;

  // v3 journey: read from today.triad[slot=sankalp].how_to_live (singleton
  // string). Legacy flat sankalp_how_to_live was a list; v3 is scalar.
  const triad = Array.isArray(sd.today?.triad) ? sd.today.triad : [];
  const sankalpRow = triad.find((t: any) => t?.slot === "sankalp");
  let items: string[] = [];
  if (sankalpRow?.how_to_live && typeof sankalpRow.how_to_live === "string") {
    items = [sankalpRow.how_to_live];
  } else if (Array.isArray(sd.sankalp_how_to_live)) {
    items = sd.sankalp_how_to_live.filter(
      (x: any) => typeof x === "string" && x.trim().length > 0,
    );
  } else if (typeof sd.sankalp_how_to_live === "string" && sd.sankalp_how_to_live) {
    items = [sd.sankalp_how_to_live];
  }
  if (items.length === 0) return null;

  const header: string = sd.sankalp_how_to_live_label ?? "";

  return (
    <View style={styles.wrap} accessibilityLabel="sankalp_carry_block">
      {!!header && <Text style={styles.header}>{header}</Text>}
      {items.map((item, i) => (
        <Text key={`sankalp-${i}`} style={styles.item}>
          {item}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.creamWarm,
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: Colors.gold,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginVertical: 10,
  },
  header: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    letterSpacing: 0.8,
    color: Colors.gold,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  item: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: Colors.brownDeep,
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default SankalpCarryBlock;

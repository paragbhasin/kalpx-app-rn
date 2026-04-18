/**
 * WhyThisL1Strip — horizontal scroll of "why this" L1 chip items below the
 * triad cards (M35).
 *
 * Spec: docs/NEW_DASHBOARD_V1_SPEC.md §2 #6
 *
 * Data: screenData.why_this_l1_items[] — each shaped as `{ id, label }`.
 *   Optional `target` per-item can be used by the caller via onPress to
 *   open an L2/L3 sheet; the bare strip just renders the labels.
 *
 * Sovereignty: renders only if the backend has seeded at least one item
 * with a non-empty `label`. No hardcoded strings.
 */

import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../theme/colors";
import { Fonts } from "../../theme/fonts";

export interface WhyThisL1Item {
  id?: string;
  label?: string;
  target?: string;
}

type Props = {
  screenData?: Record<string, any>;
  onItemPress?: (item: WhyThisL1Item) => void;
};

const WhyThisL1Strip: React.FC<Props> = ({ screenData, onItemPress }) => {
  const sd = screenData ?? {};
  const raw = sd.why_this_l1_items;
  const items: WhyThisL1Item[] = Array.isArray(raw)
    ? raw.filter(
        (w: any) => w && typeof w.label === "string" && w.label.length > 0,
      )
    : [];
  if (items.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityLabel="why_this_l1_strip"
    >
      {items.map((it, i) => {
        const key = it.id ?? `why-${i}`;
        const Chip = onItemPress ? TouchableOpacity : View;
        return (
          <Chip
            key={key}
            style={styles.chip}
            activeOpacity={0.85}
            onPress={onItemPress ? () => onItemPress(it) : undefined}
          >
            <Text style={styles.chipText}>{it.label}</Text>
          </Chip>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingVertical: 6,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.goldHairline,
    backgroundColor: Colors.creamWarm,
    marginRight: 8,
  },
  chipText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: Colors.textSoft,
  },
});

export default WhyThisL1Strip;

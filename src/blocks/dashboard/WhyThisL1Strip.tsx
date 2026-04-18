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

import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { Colors } from "../../theme/colors";
import { Fonts } from "../../theme/fonts";
import WhyThisSheet from "./WhyThisSheet";

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
  const rawArr = sd.why_this_l1_items;
  let items: WhyThisL1Item[] = Array.isArray(rawArr)
    ? rawArr.filter(
        (w: any) => w && typeof w.label === "string" && w.label.length > 0,
      )
    : [];
  // Fallback: derive from generate_companion's why_this.level1 object shape
  // (per-item one-liners keyed by item_type). Keeps the strip populated
  // without requiring every backend endpoint to re-shape its response.
  if (items.length === 0) {
    const lvl1 = (sd.why_this && sd.why_this.level1) || null;
    if (lvl1 && typeof lvl1 === "object") {
      for (const type of ["mantra", "sankalp", "practice"] as const) {
        const label = lvl1[type];
        if (typeof label === "string" && label.length > 0) {
          items.push({ id: type, label });
        }
      }
    }
  }

  // Sheet state for the L2 / L3 drill-down. Tapping a chip opens the
  // sheet; sheet internally resolves M36 then M37 when "Go deeper" is
  // tapped. Sovereignty-compliant — empty body if resolvers fail.
  const [sheet, setSheet] = useState<{
    visible: boolean;
    item: WhyThisL1Item | null;
  }>({ visible: false, item: null });

  if (items.length === 0) return null;

  const handleTap = (it: WhyThisL1Item) => {
    if (onItemPress) {
      onItemPress(it);
      return;
    }
    setSheet({ visible: true, item: it });
  };

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        accessibilityLabel="why_this_l1_strip"
      >
        {items.map((it, i) => {
          const key = it.id ?? `why-${i}`;
          return (
            <TouchableOpacity
              key={key}
              style={styles.chip}
              activeOpacity={0.85}
              onPress={() => handleTap(it)}
            >
              <Text style={styles.chipText}>{it.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <WhyThisSheet
        visible={sheet.visible}
        onClose={() => setSheet({ visible: false, item: null })}
        triggerLabel={sheet.item?.label ?? ""}
        itemType={sheet.item?.id ?? "practice"}
        screenData={sd}
      />
    </>
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

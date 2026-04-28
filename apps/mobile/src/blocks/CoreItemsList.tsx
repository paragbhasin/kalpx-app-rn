/**
 * CoreItemsList — mantra / sankalp / practice triad cards for the dashboard.
 *
 * Each card: gold micro-label, Cormorant serif title, Inter muted one-line
 * "why this" subtitle, and a subtle completion check if done today.
 * Tap → view_info action. Does NOT start the runner on tap (spec §10).
 *
 * Web parity:
 *   - Spec: kalpx-frontend/docs/specs/mitra-v3-experience/screens/route_dashboard_day_active.md §1 "Core triad cards", §10 "TriadCard"
 *   - Existing mock: kalpx-frontend/src/mock/mock/allContainers.js line 226-300 (practice_card blocks)
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { executeAction } from "../engine/actionExecutor";
import { useScreenStore } from "../engine/useScreenBridge";
import store from "../store";
import { screenActions } from "../store/screenSlice";
import { Fonts } from "../theme/fonts";

interface CoreItem {
  type: "mantra" | "sankalp" | "practice";
  label: string;
  title: string;
  why: string;
  done: boolean;
}

const CoreItemsList: React.FC<{ block?: any }> = () => {
  const { screenData, loadScreen, goBack } = useScreenStore();
  const ss = screenData as Record<string, any>;

  // SOV-2 (2026-04-20): sovereignty-strict. Prior Python fallbacks
  // ("Today's anchor" / "Anchor when the mind gets loud." / etc.) retired.
  // Titles read from backend companion `card_<type>_title` or the
  // per-item content fields (mantra_text / sankalp_text / practice_title).
  // Whys read from `card_<type>_description`. Missing = blank — card
  // surface still anchors via the eyebrow label ("MANTRA" / "SANKALP" /
  // "PRACTICE"), which is factual structural chrome.
  const items: CoreItem[] = [
    {
      type: "mantra",
      label: "MANTRA",
      title: ss.card_mantra_title || ss.mantra_text || "",
      why: ss.card_mantra_description || "",
      done: !!ss.practice_chant,
    },
    {
      type: "sankalp",
      label: "SANKALP",
      title: ss.card_sankalpa_title || ss.sankalp_text || "",
      why: ss.card_sankalpa_description || "",
      done: !!ss.practice_embody,
    },
    {
      type: "practice",
      label: "PRACTICE",
      title: ss.card_ritual_title || ss.practice_title || "",
      why: ss.card_ritual_description || "",
      done: !!ss.practice_act,
    },
  ];

  const handleTap = (type: string) => {
    executeAction(
      { type: "view_info", payload: { type } },
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
    <View style={styles.wrap}>
      {items.map((it) => (
        <TouchableOpacity
          key={it.type}
          style={styles.card}
          activeOpacity={0.85}
          onPress={() => handleTap(it.type)}
          testID={
            it.type === "sankalp"
              ? "core_item_sankalpa"
              : it.type === "practice"
                ? "core_item_ritual"
                : "core_item_mantra"
          }
        >
          <View style={styles.headerRow}>
            <Text style={styles.label}>{it.label}</Text>
            {/* {it.done ? (
              <Text style={styles.check}>✓</Text>
            ) : (
              <View style={styles.circle} />
            )} */}
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {it.title}
          </Text>
          <Text style={styles.why} numberOfLines={1}>
            {it.why}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: 10, marginVertical: 8 },
  card: {
    backgroundColor: "#fffdf9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 160, 23, 0.25)",
    padding: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    fontFamily: Fonts.sans.bold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: "#c9a84c",
  },
  title: {
    fontFamily: Fonts.serif.regular,
    fontSize: 17,
    color: "#432104",
    lineHeight: 23,
  },
  why: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#8a7a5a",
    marginTop: 4,
  },
  check: {
    color: "#10b981",
    fontSize: 16,
    fontFamily: Fonts.sans.bold,
  },
  circle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#eddeb4",
  },
});

export default CoreItemsList;

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
import { Fonts } from "../theme/fonts";
import { executeAction } from "../engine/actionExecutor";
import { useScreenStore } from "../engine/useScreenBridge";
import store from "../store";
import { screenActions } from "../store/screenSlice";

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

  const items: CoreItem[] = [
    {
      type: "mantra",
      label: "MANTRA",
      title: ss.card_mantra_title || ss.mantra_text || "Today's anchor",
      why: ss.card_mantra_description || "Anchor when the mind gets loud.",
      done: !!ss.practice_chant,
    },
    {
      type: "sankalp",
      label: "SANKALP",
      title: ss.card_sankalpa_title || ss.sankalp_text || "Today's vow",
      why: ss.card_sankalpa_description || "Today's quiet promise.",
      done: !!ss.practice_embody,
    },
    {
      type: "practice",
      label: "PRACTICE",
      title: ss.card_ritual_title || ss.practice_title || "Today's practice",
      why: ss.card_ritual_description || "A small act of steadiness.",
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
        >
          <View style={styles.headerRow}>
            <Text style={styles.label}>{it.label}</Text>
            {it.done ? (
              <Text style={styles.check}>✓</Text>
            ) : (
              <View style={styles.circle} />
            )}
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
    color: "#b89450",
  },
  title: {
    fontFamily: Fonts.serif.regular,
    fontSize: 17,
    color: "#3a2b12",
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
    borderColor: "#d4c8a8",
  },
});

export default CoreItemsList;

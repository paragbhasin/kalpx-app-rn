/**
 * PostConflictGentlenessCard — Moment 39.
 *
 * Dashboard-variant card shown on the morning after a qualifying conflict
 * event (trigger + elevated volatility + entity mention). Reads
 * screenData.post_conflict_pending. Flag-off / 204 → null → card hidden.
 *
 * Slot behavior: this card REPLACES the focus_phrase slot in the
 * `post_conflict_morning` dashboard variant — see allContainers.js. It is
 * never rendered adjacent to standard focus_phrase on that morning.
 *
 * Tone (spec §1): no analysis, no advice, no cheerfulness. Soft-hand,
 * quiet. Never "you failed yesterday."
 *
 * Web parity: docs/specs/mitra-v3-experience/screens/embedded_post_conflict_gentleness_card.md §1, §7
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Fonts } from "../theme/fonts";
import { executeAction } from "../engine/actionExecutor";
import { useScreenStore } from "../engine/useScreenBridge";
import store from "../store";
import { screenActions } from "../store/screenSlice";

const PostConflictGentlenessCard: React.FC<{ block?: any }> = () => {
  const { screenData, loadScreen, goBack } = useScreenStore();
  const ctx = (screenData as any).post_conflict_pending;

  if (!ctx) return null;

  const dispatch = (action: any) =>
    executeAction(action, {
      loadScreen,
      goBack,
      setScreenValue: (value: any, key: string) =>
        store.dispatch(screenActions.setScreenValue({ key, value })),
      screenState: store.getState().screen.screenData,
    });

  const onGentle = () =>
    // Start-gentle also routes via start_recommended_additional so the
    // softened practice is tracked as source="additional_recommended",
    // not core (REG-015).
    dispatch({
      type: "start_recommended_additional",
      payload: {
        variant: ctx.gentle_practice?.item_type || "practice",
        item: ctx.gentle_practice || {
          item_type: "practice",
          item_id: "practice.soften",
          title: "Gentle start",
        },
        intent: "post_conflict_soften",
        duration_sec: (ctx.gentle_practice?.duration_min || 6) * 60,
      },
    });

  const onVoice = () =>
    dispatch({
      type: "open_post_conflict_voice_note",
      payload: { thread_id: ctx.thread?.id },
    });

  const onOkay = () =>
    dispatch({
      type: "ack_post_conflict",
      payload: { thread_id: ctx.thread?.id },
    });

  const yesterday = ctx.yesterday_phrase || "Yesterday was heavy";

  return (
    <View style={styles.card}>
      <Text style={styles.lead}>{yesterday}.</Text>
      <Text style={styles.soften}>
        {ctx.softness_line ||
          "You don't need to fix anything today. Just start gentle. I'm with you."}
      </Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.primary} onPress={onGentle}>
          <Text style={styles.primaryText}>Start gentle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={onVoice}>
          <Text style={styles.secondaryText}>Something to say?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tertiary} onPress={onOkay}>
          <Text style={styles.tertiaryText}>I&apos;m okay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f6ede0",
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(138,106,42,0.18)",
  },
  lead: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    color: "#3a2b12",
    marginBottom: 6,
  },
  soften: {
    fontFamily: Fonts.serif.regular,
    fontStyle: "italic",
    fontSize: 15,
    lineHeight: 22,
    color: "#5a4a2a",
    marginBottom: 14,
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  primary: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: "#8a6a2a",
  },
  primaryText: {
    fontFamily: Fonts.sans.bold,
    fontSize: 13,
    color: "#fffdf5",
  },
  secondary: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#8a6a2a",
  },
  secondaryText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#3a2b12",
  },
  tertiary: { paddingHorizontal: 8, paddingVertical: 9 },
  tertiaryText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: "#6a5a3a",
  },
});

export default PostConflictGentlenessCard;

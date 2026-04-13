/**
 * GratitudeJoyCard — Moment 45 dashboard embedded card.
 *
 * Renders only when screenData.joy_signal is a non-null object (returned by
 * GET /api/mitra/joy-signal/). Quiet acknowledgement only — no exclamations,
 * no emojis, no celebratory copy.
 *
 * Web parity:
 *   - Spec: docs/specs/mitra-v3-experience/screens/embedded_gratitude_joy_card.md
 *   - Submit: POST /api/mitra/gratitude-ledger/ with signal_type=joy_signal
 *     (handled by action `submit_gratitude_joy`).
 */

import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Fonts } from "../theme/fonts";
import { executeAction } from "../engine/actionExecutor";
import { useScreenStore } from "../engine/useScreenBridge";
import store from "../store";
import { screenActions } from "../store/screenSlice";

const GratitudeJoyCard: React.FC<{ block?: any }> = () => {
  const { screenData, loadScreen, goBack } = useScreenStore();
  const signal = (screenData as any).joy_signal;
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!signal || typeof signal !== "object") return null;
  if (submitted) return null;

  const mirror =
    signal.mirror ||
    signal.one_line ||
    "Something good landed today.";
  const prompt = signal.prompt || "Name it with me";

  const onSubmit = async () => {
    if (!text.trim()) return;
    await executeAction(
      {
        type: "submit_gratitude_joy",
        payload: { text: text.trim(), signal_id: signal.id || null },
      },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          store.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: store.getState().screen.screenData,
      },
    );
    setSubmitted(true);
  };

  return (
    <View style={styles.card} testID="gratitude-joy-card">
      <Text style={styles.label}>NOTICED</Text>
      <Text style={styles.mirror}>{mirror}</Text>
      <Text style={styles.prompt}>{prompt}</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="A word, a moment, a name"
        placeholderTextColor="#c9a84c"
        style={styles.input}
        multiline
        maxLength={240}
      />
      <TouchableOpacity
        onPress={onSubmit}
        disabled={!text.trim()}
        style={[styles.btn, !text.trim() && styles.btnDisabled]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.btnText}>Hold this</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF8EF",
    borderRadius: 14,
    padding: 16,
    marginVertical: 10,
    borderLeftWidth: 2,
    borderLeftColor: "#c9a84c",
  },
  label: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: "#8b7a55",
    marginBottom: 6,
  },
  mirror: {
    fontFamily: Fonts.serif.regular,
    fontSize: 17,
    color: "#432104",
    lineHeight: 24,
    marginBottom: 8,
  },
  prompt: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#6a5830",
    marginBottom: 10,
  },
  input: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#432104",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: "#d9cfb8",
    padding: 10,
    minHeight: 64,
    textAlignVertical: "top",
    marginBottom: 10,
  },
  btn: {
    alignSelf: "flex-start",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#c9a84c",
    minHeight: 44,
    justifyContent: "center",
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 14,
    color: "#432104",
  },
});

export default GratitudeJoyCard;

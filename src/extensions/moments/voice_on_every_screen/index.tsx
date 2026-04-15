/**
 * Moment: Voice affordance on every screen — SCAFFOLD ONLY.
 *
 * Purpose: per Sadhana Yatra spec, the mic should be present on every
 * conversational turn so the user can reply by voice at any time. This
 * component is a floating mic button designed to be mounted adjacent to any
 * input area (chat composer, onboarding turn, reflection, etc.).
 *
 * STATUS — 2026-04-14: scaffold-only. Not wired into any container. See
 * README.md for the 3-step wire-up plan. Do NOT wire this in until voice
 * consent flow + recording pipeline are signed off.
 */

import React from "react";
import { Pressable, StyleSheet, View, Text } from "react-native";

type Props = {
  onPress?: () => void;
  disabled?: boolean;
  // Optional label override for accessibility
  accessibilityLabel?: string;
};

export default function VoiceOnEveryScreen({
  onPress,
  disabled,
  accessibilityLabel,
}: Props) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || "Tap to speak"}
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.fab,
          disabled && styles.fabDisabled,
          pressed && styles.fabPressed,
        ]}
      >
        <Text style={styles.icon}>🎙</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: 16,
    bottom: 96,
    zIndex: 20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#C2A56B",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  fabPressed: { opacity: 0.75 },
  fabDisabled: { opacity: 0.4 },
  icon: { fontSize: 22, color: "#1a1a1a" },
});

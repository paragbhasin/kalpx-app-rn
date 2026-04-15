// Transient: SoundBridgeTransient
// Spec: kalpx-frontend/docs/specs/mitra-v3-experience/screens/transient_sound_bridge.md
// ISOLATED SCAFFOLD — not registered. See ./README.md for wire-up.

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";

type Props = { onContinue?: () => void };

const SoundBridgeTransient: React.FC<Props> = ({ onContinue }) => {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container} accessibilityLabel="sound_bridge">
        <Text style={styles.om}>ॐ</Text>
        <Text style={styles.headline}>Hum with me</Text>
        <TouchableOpacity style={styles.cta} onPress={onContinue}>
          <Text style={styles.ctaText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f0f12" },
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  om: { color: "#D4A017", fontSize: 72, marginBottom: 24 },
  headline: { color: "#F5E9D2", fontSize: 22, marginBottom: 32, textAlign: "center" },
  cta: {
    borderWidth: 1,
    borderColor: "#D4A017",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 28,
  },
  ctaText: { color: "#F5E9D2", fontSize: 16 },
});

export default SoundBridgeTransient;

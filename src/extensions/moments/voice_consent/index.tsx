// Tier 1 — overlay: VoiceConsentOverlay
// Spec: kalpx-frontend/docs/specs/mitra-v3-experience/screens/overlay_voice_consent.md
// ISOLATED SCAFFOLD — not registered. See ./README.md for wire-up.

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";

type Props = {
  onCta1?: () => void;
  onCta2?: () => void;
};

const VoiceConsentOverlay: React.FC<Props> = ({ onCta1, onCta2 }) => {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container} accessibilityLabel="voice_consent">
        <Text style={styles.headline}>Your voice stays private</Text>
                <Text style={styles.subline}>Audio is discarded within 24 hours. We only keep the transcript if you save it.</Text>
        <View style={styles.ctaCol}>
          <TouchableOpacity style={styles.cta} onPress={onCta1}>
            <Text style={styles.ctaText}>I'm ready</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cta} onPress={onCta2}>
            <Text style={styles.ctaText}>Keep using text</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAF7F2" },
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  headline: { color: "#2d2a24", fontSize: 22, marginBottom: 16, textAlign: "center" },
  subline: { color: "#6b6155", fontSize: 16, marginBottom: 32, textAlign: "center" },
  ctaCol: { width: "100%", gap: 12 },
  cta: {
    borderWidth: 1,
    borderColor: "#D4A017",
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
  },
  ctaText: { color: "#2d2a24", fontSize: 16 },
});

export default VoiceConsentOverlay;

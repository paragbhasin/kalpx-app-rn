// Tier 1 — container: LonelinessRoomContainer
// Spec: kalpx-frontend/docs/specs/mitra-v3-experience/screens/route_support_loneliness.md
// ISOLATED SCAFFOLD — not registered. See ./README.md for wire-up.

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";

type Props = {
  onCta1?: () => void;
  onCta2?: () => void;
  onCta3?: () => void;
  onCta4?: () => void;
  onCta5?: () => void;
};

const LonelinessRoomContainer: React.FC<Props> = ({ onCta1, onCta2, onCta3, onCta4, onCta5 }) => {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container} accessibilityLabel="loneliness_room">
        <Text style={styles.headline}>Let's chant together for a minute. Not alone.</Text>
                <Text style={styles.subline}>ॐ सह नाववतु</Text>
        <View style={styles.ctaCol}>
          <TouchableOpacity style={styles.cta} onPress={onCta1}>
            <Text style={styles.ctaText}>Chant with me</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cta} onPress={onCta2}>
            <Text style={styles.ctaText}>Call a friend (reminder)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cta} onPress={onCta3}>
            <Text style={styles.ctaText}>Step outside</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cta} onPress={onCta4}>
            <Text style={styles.ctaText}>Read 1 line of Gita</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cta} onPress={onCta5}>
            <Text style={styles.ctaText}>Just sit</Text>
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

export default LonelinessRoomContainer;

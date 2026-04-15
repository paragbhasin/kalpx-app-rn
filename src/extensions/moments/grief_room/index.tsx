// Tier 1 — Support: Grief Room
// Spec: kalpx-frontend/docs/specs/mitra-v3-experience/screens/route_support_grief.md
// ISOLATED SCAFFOLD — not registered in allContainers.js / BlockRenderer / actionExecutor.
// Pavani: see src/extensions/moments/grief_room/README.md for wire-up.

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";

type Props = {
  onSitInSilence?: () => void;
  onLightSomething?: () => void;
  onOpenReflection?: () => void;
};

const GriefRoomContainer: React.FC<Props> = ({
  onSitInSilence,
  onLightSomething,
  onOpenReflection,
}) => {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container} accessibilityLabel="grief_room">
        {/* Reduced-motion circle per spec */}
        <View style={styles.circle} />
        <Text style={styles.headline}>I'm here. No rush.</Text>
        <View style={styles.ctaCol}>
          <TouchableOpacity style={styles.cta} onPress={onSitInSilence}>
            <Text style={styles.ctaText}>Sit in silence</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cta} onPress={onLightSomething}>
            <Text style={styles.ctaText}>Light something</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cta} onPress={onOpenReflection}>
            <Text style={styles.ctaText}>Open a soft reflection</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f0f12" },
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "#D4A017",
    marginBottom: 40,
  },
  headline: { color: "#F5E9D2", fontSize: 22, marginBottom: 32, textAlign: "center" },
  ctaCol: { width: "100%", gap: 12 },
  cta: {
    borderWidth: 1,
    borderColor: "#D4A017",
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
  },
  ctaText: { color: "#F5E9D2", fontSize: 16 },
});

export default GriefRoomContainer;

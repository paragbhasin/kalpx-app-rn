// Tier 1 — overlay: WhyThisL3Overlay
// Spec: kalpx-frontend/docs/specs/mitra-v3-experience/screens/overlay_why_this_level_3.md
// ISOLATED SCAFFOLD — not registered. See ./README.md for wire-up.

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";

type Props = {
  onCta1?: () => void;
  screenData?: any;
};

const WhyThisL3Overlay: React.FC<Props> = ({ onCta1, screenData }) => {
  const source = screenData?.why_this_source?.sources?.[0];
  const devanagari = source?.verse_devanagari || "";
  const iast = source?.verse_iast || "";
  const english = source?.verse_english || "";
  const citation = source?.citation || "";
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container} accessibilityLabel="why_this_l3">
        <Text style={styles.headline}>Source</Text>
        {devanagari ? <Text style={styles.subline}>{devanagari}</Text> : null}
        {iast ? <Text style={styles.subline}>{iast}</Text> : null}
        {english ? <Text style={styles.subline}>{english}</Text> : null}
        {citation ? <Text style={styles.subline}>{citation}</Text> : null}
        <View style={styles.ctaCol}>
          <TouchableOpacity style={styles.cta} onPress={onCta1}>
            <Text style={styles.ctaText}>Back</Text>
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

export default WhyThisL3Overlay;

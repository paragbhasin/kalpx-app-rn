// Tier 1 — overlay: WhyThisL2Overlay
// Phase F — registry-backed via M36_why_this_l2 ContentPack.
// Spec: kalpx-frontend/docs/specs/mitra-v3-experience/screens/overlay_why_this_level_2.md

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";

import { useContentSlots, readMomentSlot } from "../../../hooks/useContentSlots";
import { useScreenStore } from "../../../engine/useScreenBridge";

type Props = {
  onCta1?: () => void;
  onCta2?: () => void;
  screenData?: any;
};

const WhyThisL2Overlay: React.FC<Props> = ({ onCta1, onCta2, screenData: propScreenData }) => {
  const { screenData: storeScreenData } = useScreenStore();
  const ss = (propScreenData || storeScreenData || {}) as Record<string, any>;

  useContentSlots({
    momentId: "M36_why_this_l2",
    screenDataKey: "why_this_l2",
    buildCtx: (s) => ({
      path: s.journey_path === "growth" ? "growth" : "support",
      guidance_mode: s.guidance_mode || "hybrid",
      locale: s.locale || "en",
      user_attention_state: "focused_receiving",
      emotional_weight: "light",
      cycle_day: Number(s.day_number) || 0,
      entered_via: "triad_card_why_this_l1_tap",
      stage_signals: {},
      today_layer: {},
      life_layer: {
        cycle_id: s.journey_id || s.cycle_id || "",
        life_kosha: s.life_kosha || s.scan_focus || "",
        scan_focus: s.scan_focus || "",
      },
    }),
  });
  const slot = (name: string) => readMomentSlot(ss, "why_this_l2", name);

  // Backend-provided teaching overrides registry body if present.
  const teaching = ss?.why_this_principle?.core_teaching || slot("body");

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container} accessibilityLabel="why_this_l2">
        <Text style={styles.headline}>{slot("headline")}</Text>
        {teaching ? <Text style={styles.subline}>{teaching}</Text> : null}
        <View style={styles.ctaCol}>
          <TouchableOpacity style={styles.cta} onPress={onCta1}>
            <Text style={styles.ctaText}>{slot("go_deeper_cta")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cta} onPress={onCta2}>
            <Text style={styles.ctaText}>{slot("close_cta")}</Text>
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

export default WhyThisL2Overlay;

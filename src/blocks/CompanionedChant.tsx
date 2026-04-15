/**
 * CompanionedChant — Moment 47 sub-element, used inside LonelinessRoom.
 *
 * Mitra-voice chant plays alongside user. Two soft orbs pulse gently in sync
 * (user + Mitra). No counters, no reps, no completion pressure.
 *
 * Reduced-motion: when reduced_motion_preference is true, orbs render static.
 *
 * Web parity:
 *   - Spec: docs/specs/mitra-v3-experience/screens/route_support_loneliness.md §4.
 */

import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { Fonts } from "../theme/fonts";
import { useScreenStore } from "../engine/useScreenBridge";

interface Props {
  block?: any;
  mantra?: string;
  transliteration?: string;
}

const CompanionedChant: React.FC<Props> = ({ block, mantra, transliteration }) => {
  const { screenData } = useScreenStore();
  const reducedMotion = !!(screenData as any).reduced_motion_preference;
  const userPulse = useRef(new Animated.Value(0.9)).current;
  const mitraPulse = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (reducedMotion) return;
    const loopFor = (v: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, {
            toValue: 1.05,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0.9,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );
    const a = loopFor(userPulse, 3200);
    const b = loopFor(mitraPulse, 3400);
    a.start();
    b.start();
    return () => {
      a.stop();
      b.stop();
    };
  }, [reducedMotion, userPulse, mitraPulse]);

  const mantraText =
    mantra || block?.mantra || (screenData as any).loneliness_chant?.mantra ||
    "ॐ सह नाववतु";
  const translit =
    transliteration || block?.transliteration ||
    (screenData as any).loneliness_chant?.transliteration ||
    "Om saha nāvavatu";

  return (
    <View style={styles.wrap}>
      <View style={styles.orbs}>
        <Animated.View
          style={[
            styles.orb,
            styles.userOrb,
            !reducedMotion && { transform: [{ scale: userPulse }] },
          ]}
          testID="companioned-chant-user-orb"
        />
        <Animated.View
          style={[
            styles.orb,
            styles.mitraOrb,
            !reducedMotion && { transform: [{ scale: mitraPulse }] },
          ]}
          testID="companioned-chant-mitra-orb"
        />
      </View>
      <Text style={styles.mantra}>{mantraText}</Text>
      <Text style={styles.translit}>{translit}</Text>
      <Text style={styles.hint}>Chant along if you'd like. Or just listen.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: 18,
  },
  orbs: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 20,
  },
  orb: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  userOrb: {
    backgroundColor: "#e8d9b0",
  },
  mitraOrb: {
    backgroundColor: "#c9a84c",
    opacity: 0.85,
  },
  mantra: {
    fontFamily: Fonts.devanagari.regular,
    fontSize: 24,
    color: "#432104",
    marginBottom: 6,
    textAlign: "center",
  },
  translit: {
    fontFamily: Fonts.sans.regular,
    fontStyle: "italic",
    fontSize: 14,
    color: "#6a5830",
    marginBottom: 14,
  },
  hint: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#8b7a55",
    textAlign: "center",
  },
});

export default CompanionedChant;

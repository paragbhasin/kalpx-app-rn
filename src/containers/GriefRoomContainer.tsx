/**
 * GriefRoomContainer — Route /support/grief.
 *
 * Quiet, warm room. No timers. No completion. No cheerleading.
 * Tone rules (enforced): no "feel better", no "you got this", no emojis,
 * no exclamations.
 *
 * Reduced-motion CRITICAL: when
 * screenData.reduced_motion_preference === true, the breath guide renders
 * STATIC (no animation, no transform).
 *
 * REG-015: enter_grief_room clears runner_* flags, exit_grief_room clears
 * grief_session_* flags. No runner state ever touched from this room.
 * REG-016: "I'll come back to this" is always visible at the bottom, ≥44pt.
 *
 * Web parity:
 *   - Spec: docs/specs/mitra-v3-experience/screens/route_support_grief.md
 */

import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Fonts } from "../theme/fonts";
import { executeAction } from "../engine/actionExecutor";
import { useScreenStore } from "../engine/useScreenBridge";
import store from "../store";
import { screenActions } from "../store/screenSlice";

interface Props {
  schema?: any;
}

const GriefRoomContainer: React.FC<Props> = () => {
  const { screenData, loadScreen, goBack } = useScreenStore();
  const reducedMotion = !!(screenData as any).reduced_motion_preference;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (reducedMotion) return;
    // Slow 4-6-8 pattern — gentle, never bouncy.
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.08,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.92,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.delay(800),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reducedMotion, scale]);

  const ctx = (screenData as any).grief_context || {};

  const dispatch = (type: string, payload?: any) =>
    executeAction(
      { type, payload },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          store.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: store.getState().screen.screenData,
      },
    );

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.breathWrap} testID="grief-breath-guide">
        {reducedMotion ? (
          <View style={[styles.orb, styles.orbStatic]} />
        ) : (
          <Animated.View
            style={[styles.orb, { transform: [{ scale }] }]}
            testID="grief-breath-orb-animated"
          />
        )}
      </View>

      <Text style={styles.presence}>
        {ctx.presence_line || "I'm here. No rush."}
      </Text>

      <Text style={styles.body}>
        {ctx.message ||
          "You don't have to name it. You don't have to move through it. I'll sit with you for as long as you need."}
      </Text>

      <View style={styles.ctas}>
        <TouchableOpacity
          style={styles.ctaMuted}
          onPress={() => dispatch("grief_stay")}
          accessibilityLabel="Sit with me"
          testID="grief-sit-cta"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.ctaMutedText}>Sit with me</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ctaMuted}
          onPress={() => dispatch("grief_voice_note")}
          accessibilityLabel="Voice note"
          testID="grief-voice-cta"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.ctaMutedText}>Voice note</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.exit}
        onPress={() => dispatch("exit_grief_room")}
        accessibilityLabel="I'll come back to this"
        testID="grief-exit-link"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.exitText}>I'll come back to this</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fffdf9",
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 64,
    paddingBottom: 60,
    alignItems: "center",
  },
  breathWrap: {
    height: 180,
    width: 180,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
  },
  orb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eadfc4",
  },
  orbStatic: {
    opacity: 0.85,
  },
  presence: {
    fontFamily: Fonts.serif.regular,
    fontSize: 20,
    color: "#2b1d0a",
    textAlign: "center",
    marginBottom: 14,
    lineHeight: 28,
  },
  body: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    color: "#4a3a20",
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 40,
    maxWidth: 320,
  },
  ctas: {
    width: "100%",
    gap: 12,
    marginBottom: 40,
  },
  ctaMuted: {
    alignSelf: "center",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#d9cfb8",
    minWidth: 200,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaMutedText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: "#4a3a20",
  },
  exit: {
    marginTop: 8,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  exitText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#8b7a55",
    textDecorationLine: "underline",
    textAlign: "center",
  },
});

export default GriefRoomContainer;

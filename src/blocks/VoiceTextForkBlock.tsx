/**
 * VoiceTextForkBlock — Turn 4 binary choice: Speak vs Keep Written.
 *
 * Web counterpart: no direct web file (Turn 4 is RN-first in v3). Closest:
 *   kalpx-frontend/src/containers/PortalSplashContainer.vue — voice consent overlay pattern.
 * Spec: docs/specs/mitra-v3-experience/screens/route_welcome_onboarding.md §1 Turn 4, §6
 * Regression cases: REG-016 (no open input on binary turns).
 *
 * Behavior:
 *   - "Speak to me" fires action with choice=voice; container triggers voice consent overlay
 *     if voice_consent_given is false (mirrors PortalSplashContainer consent flow).
 *   - "Keep it written" fires action with choice=text.
 */

import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { executeAction } from "../engine/actionExecutor";
import { useScreenStore } from "../engine/useScreenBridge";
import { interpolate } from "../engine/utils/interpolation";

import { Fonts } from "../theme/fonts";

const GOLD_BORDER = "#eddeb4";
const AMBER_CTA = "#c89a47";
const DEEP_BROWN = "#432104";

interface Props {
  block: {
    on_response?: any;
    state_acknowledgment?: string; // "Activated.", "Heavy.", etc.
  };
}

const VoiceTextForkBlock: React.FC<Props> = ({ block }) => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();

  const fire = async (choice: "voice" | "text") => {
    if (!block.on_response) return;
    const base = interpolate(block.on_response, screenData);
    await executeAction(
      { ...base, payload: { ...(base.payload || {}), choice }, currentScreen },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) => {
          const { screenActions } = require("../store/screenSlice");
          const { store } = require("../store");
          store.dispatch(screenActions.setScreenValue({ key, value }));
        },
        screenState: { ...screenData },
      },
    );
  };

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        style={[styles.option, styles.optionSpeak]}
        onPress={() => fire("voice")}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#C08B31", "#D3A44D", "#B57C26"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.turnOneButton, styles.turnOnePrimaryButton]}
        >
          <Text style={styles.turnOnePrimaryButtonText}>Speak with me</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, styles.optionWritten]}
        onPress={() => fire("text")}
        activeOpacity={0.8}
      >
        <Text style={styles.icon}>✎</Text>
        <Text style={styles.label}>Keep it written</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginVertical: 12 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  turnOnePrimaryButton: {
    justifyContent: "center",
  },
  turnOnePrimaryButtonText: {
    fontFamily: Fonts.sans.bold,
    fontSize: 17,
    color: "#fff9ec",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  turnOneButton: {
    width: "100%",
    minHeight: 45,
    borderRadius: 31,
    marginBottom: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 24,
    shadowColor: "#d2b176",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 4,
  },
  optionWritten: {
    backgroundColor: "#fdf8f2",

    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 20,

    borderWidth: 1,
    borderColor: "#e6c88f",

    // OUTER SHADOW (depth)
    shadowColor: "#c89a47",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,

    // alignment
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    color: AMBER_CTA,
    fontSize: 22,
    marginRight: 12,
    fontFamily: Fonts.sans.regular,
  },
  label: { color: DEEP_BROWN, fontSize: 17, fontFamily: Fonts.sans.medium },
});

export default VoiceTextForkBlock;

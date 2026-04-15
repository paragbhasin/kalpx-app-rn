/**
 * LonelinessRoomContainer — Route /support/loneliness.
 *
 * Warm room with a CompanionedChant block. Mitra voices a short chant;
 * user may chant along (no tracking, no reps).
 *
 * REG-015: enter_loneliness_room clears runner_* flags; exit clears
 * loneliness_session_*. No runner state touched.
 * REG-016: "I feel less alone now" exit link is always visible ≥44pt.
 *
 * Web parity:
 *   - Spec: docs/specs/mitra-v3-experience/screens/route_support_loneliness.md
 */

import React from "react";
import {
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
import CompanionedChant from "../blocks/CompanionedChant";

interface Props { schema?: any }

const LonelinessRoomContainer: React.FC<Props> = () => {
  const { screenData, loadScreen, goBack } = useScreenStore();
  const ctx = (screenData as any).loneliness_context || {};

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
      <Text style={styles.presence}>
        {ctx.presence_line ||
          "Let's chant together for a minute. Not alone."}
      </Text>

      <View style={styles.chantWrap}>
        <CompanionedChant
          mantra={ctx.mantra}
          transliteration={ctx.transliteration}
        />
      </View>

      <TouchableOpacity
        style={styles.exit}
        onPress={() => dispatch("exit_loneliness_room")}
        accessibilityLabel="I feel less alone now"
        testID="loneliness-exit-link"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.exitText}>I feel less alone now</Text>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 60,
    alignItems: "center",
  },
  presence: {
    fontFamily: Fonts.serif.regular,
    fontSize: 19,
    color: "#2b1d0a",
    textAlign: "center",
    marginBottom: 18,
    lineHeight: 26,
    maxWidth: 320,
  },
  chantWrap: {
    width: "100%",
    marginBottom: 36,
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

export default LonelinessRoomContainer;

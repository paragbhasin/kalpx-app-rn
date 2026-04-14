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

  const chant = ctx.companioned_chant || {};
  const bhakti = ctx.bhakti_mantra;
  const walkMin = ctx.walk_duration_min || 5;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.presence}>
        {ctx.presence_line ||
          ctx.opening_line ||
          "Let's chant together for a minute. Not alone."}
      </Text>

      {ctx.second_beat_line ? (
        <Text style={styles.body}>{ctx.second_beat_line}</Text>
      ) : null}

      <View style={styles.chantWrap}>
        <CompanionedChant
          mantra={chant.title || ctx.mantra}
          transliteration={chant.variant || ctx.transliteration}
        />
      </View>

      <View style={styles.actions}>
        {bhakti?.id ? (
          <TouchableOpacity
            style={styles.ctaMuted}
            onPress={() =>
              dispatch("start_gentle", {
                variant: "mantra",
                item: {
                  item_type: "mantra",
                  item_id: bhakti.id,
                  title: bhakti.title,
                  runner_route: bhakti.runner_route,
                },
                intent: "bhakti_mantra",
                duration_sec: (bhakti.duration_min || 5) * 60,
              })
            }
            accessibilityLabel="A bhakti mantra"
            testID="loneliness-bhakti-cta"
          >
            <Text style={styles.ctaMutedText}>
              {bhakti.title ? `Bhakti — ${bhakti.title}` : "A bhakti mantra"}
            </Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.ctaMuted}
          onPress={() => dispatch("loneliness_name_it")}
          accessibilityLabel="Name it"
          testID="loneliness-name-cta"
        >
          <Text style={styles.ctaMutedText}>Name it</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ctaMuted}
          onPress={() => dispatch("loneliness_reach_out")}
          accessibilityLabel="Reach out"
          testID="loneliness-reach-cta"
        >
          <Text style={styles.ctaMutedText}>Reach out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ctaMuted}
          onPress={() => dispatch("loneliness_walk_outside", { duration_min: walkMin })}
          accessibilityLabel="Walk outside"
          testID="loneliness-walk-cta"
        >
          <Text style={styles.ctaMutedText}>{`Walk outside — ${walkMin} min`}</Text>
        </TouchableOpacity>
      </View>

      {ctx.principle_hint?.name ? (
        <Text style={styles.hint} testID="loneliness-principle-hint">
          {ctx.principle_hint.name}
        </Text>
      ) : null}

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
  body: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#4a3a20",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
    maxWidth: 320,
  },
  chantWrap: {
    width: "100%",
    marginBottom: 24,
  },
  actions: {
    width: "100%",
    gap: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  ctaMuted: {
    paddingHorizontal: 26,
    paddingVertical: 11,
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
  hint: {
    fontFamily: Fonts.serif.regular,
    fontStyle: "italic",
    fontSize: 13,
    color: "#8b7a55",
    textAlign: "center",
    marginBottom: 18,
    maxWidth: 280,
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

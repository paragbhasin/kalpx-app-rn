import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { VoiceTextInput } from "../components/VoiceTextInput";
import { executeAction } from "../engine/actionExecutor";
import { useScreenStore } from "../engine/useScreenBridge";
import { interpolate } from "../engine/utils/interpolation";
import { Fonts } from "../theme/fonts";

interface Props {
  block: {
    id?: string;
    headline?: string;
    subtext?: string;
    reply_chips?: {
      id: string;
      label: string;
      style?: "primary" | "secondary";
    }[];
    image?: {
      url: string;
      alt?: string;
    };
    on_response?: any;
  };
}

const OnboardingIntroHero: React.FC<Props> = ({ block }) => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const replyAnim = useRef(new Animated.Value(0)).current;
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);

  const updateBackground = useScreenStore(
    (state: any) => state.updateBackground,
  );
  const updateHeaderHidden = useScreenStore(
    (state: any) => state.updateHeaderHidden,
  );

  useEffect(() => {
    const updatedBackground = require("../../assets/new_home.png");

    updateBackground(updatedBackground);
    updateHeaderHidden(false);
    return () => updateHeaderHidden(false);
  }, [updateBackground, updateHeaderHidden]);
  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(replyAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, replyAnim]);

  const fire = async (payload: Record<string, any>) => {
    if (!block.on_response) return;
    const base = interpolate(block.on_response, screenData);
    try {
      await executeAction(
        {
          ...base,
          payload: { ...(base.payload || {}), ...payload },
          currentScreen,
        },
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
    } catch (err) {
      console.error("[OnboardingIntroHero] action failed", err);
    }
  };

  const headlineLines = (block.headline || "").split("\n").filter(Boolean);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.headline}>{headlineLines.join("\n")}</Text>

        {block.subtext && (
          <Text style={styles.subtext}>
            {interpolate(block.subtext, screenData)}
          </Text>
        )}

        <Animated.View style={[styles.responseWrap, { opacity: replyAnim }]}>
          {(block.reply_chips || []).map((chip) => {
            const isReturning = chip.label.toLowerCase().includes("returning");
            if (isReturning) return null;

            return (
              <TouchableOpacity
                key={chip.id}
                activeOpacity={0.85}
                onPress={() =>
                  fire({ chip_id: chip.id, response_type: "chip" })
                }
                style={styles.chipButton}
              >
                <View style={styles.premiumChip}>
                  <Text style={styles.premiumChipLabel}>{chip.label}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {(() => {
            const returningChip = (block.reply_chips || []).find((c) =>
              c.label.toLowerCase().includes("returning"),
            );
            if (!returningChip) return null;

            return (
              <TouchableOpacity
                key={returningChip.id}
                activeOpacity={0.85}
                onPress={() =>
                  fire({ chip_id: returningChip.id, response_type: "chip" })
                }
                style={styles.returningButton}
              >
                <Text style={styles.linkText}>{returningChip.label}</Text>
              </TouchableOpacity>
            );
          })()}
        </Animated.View>
      </Animated.View>

      {/* Lotus image at the bottom */}
      <View style={styles.lotusWrap}>
        <Image
          source={require("../../assets/new_home_lotus.png")}
          style={styles.lotus}
          resizeMode="contain"
        />
      </View>

      <View style={styles.fixedInputArea}>
        <VoiceTextInput
          voiceAvailable={true}
          placeholder="How can I help you?"
          onSend={(val, type) => {
            if (type === "text") {
              fire({ freeform_text: val, response_type: "text" });
            } else {
              fire({ response_type: "voice_requested" });
            }
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 500,
    justifyContent: "space-between",
    // paddingTop: 40,
  },
  content: {
    alignItems: "center",
  },
  headline: {
    fontFamily: Fonts.serif.bold,
    fontSize: 28,
    color: "#3f2810",
    textAlign: "center",
    lineHeight: 38,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  subtext: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#432104",
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 30,
    opacity: 0.9,
  },
  responseWrap: {
    width: "100%",
    paddingHorizontal: 20,
    gap: 16,
  },
  chipButton: {
    width: "100%",
  },
  premiumChip: {
    backgroundColor: "#FBF5F5",
    borderColor: "#9f9f9f",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 24,
    borderWidth: 0.3,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: "100%",
  },
  premiumChipLabel: {
    fontFamily: Fonts.sans.regular,
    fontSize: 16,
    color: "#432104",
    textAlign: "center",
  },
  returningButton: {
    marginTop: 20,
    alignSelf: "center",
  },
  linkText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: "#432104",
    textDecorationLine: "underline",
  },
  lotusWrap: {
    alignItems: "center",
    marginTop: -30,
    marginBottom: -40,
  },
  lotus: {
    width: 340,
    height: 340,
  },
  fixedInputArea: {
    position: "absolute",
    padding: 5,
    bottom: -60,
    left: 0,
    right: 0,
    // backgroundColor: "#fef8f5",
  },
});

export default OnboardingIntroHero;

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import {
  Image,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { sfs } from "../utils/responsive";
import { Fonts } from "../theme/fonts";
import { LiveActivityPreferenceBanner } from "./LiveActivityPreferenceBanner";
import { VoiceTextInput } from "./VoiceTextInput";

const MantraLotus3d = ({ width, height, opacity, style }: { width?: number; height?: number; opacity?: number; style?: any }) => (
  <Image source={require("../../assets/mantra-lotus-3d.webp")} style={[{ width, height, opacity, resizeMode: "contain" }, style]} />
);

const AnimatedPath = Animated.createAnimatedComponent(Path);
const { width: SCREEN_W } = Dimensions.get("window");
const IS_TABLET = SCREEN_W >= 768;

// Lotus size — much larger on tablet
const LOTUS_WIDTH = IS_TABLET
  ? Math.min(SCREEN_W * 0.65, 500)
  : Math.min(SCREEN_W * 0.92, 360);
const LOTUS_HEIGHT = IS_TABLET
  ? Math.min(SCREEN_W * 0.5, 390)
  : Math.min(SCREEN_W * 0.72, 280);

interface RunnerCompletionViewProps {
  title: string;
  subtitle?: string;
  badgeLabel?: string;
  ctaLabel: string;
  onCtaPress: () => void;
  onRepeat?: () => void;
  repeatLabel?: string;
  testID?: string;
  // When set, shows the "Make it your Live Activity?" banner — auto-hidden if
  // this experience is already the user's preferred Live Activity.
  liveActivity?: { type: "mantra" | "sankalp" | "practice"; name: string };
  // The "Today's …" card showing the mantra/sankalp/practice name.
  nameCard?: { label: string; text: string; guideLine?: string };
  // The "Anything to carry from this?" reflection input.
  reflection?: {
    prompt: string;
    onSubmit: (text: string, type: "text" | "voice") => void;
  };
}

const RunnerCompletionView: React.FC<RunnerCompletionViewProps> = ({
  title,
  subtitle,
  badgeLabel,
  ctaLabel,
  onCtaPress,
  onRepeat,
  repeatLabel = "Repeat",
  testID,
  liveActivity,
  nameCard,
  reflection,
}) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const contentFade = useRef(new Animated.Value(0)).current;
  const checkProgress = useRef(new Animated.Value(0)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    Animated.timing(contentFade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    Animated.timing(checkProgress, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start(() => {
      Animated.timing(messageOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const checkPathLength = 48;
  const checkDashOffset = checkProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [checkPathLength, 0],
  });

  const checkSize = isTablet ? 72 : 48;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.scroll}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          isTablet && { paddingHorizontal: 48, paddingTop: 32 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.content,
            { opacity: contentFade },
            isTablet && { maxWidth: 640, alignSelf: "center", width: "100%" },
          ]}
        >
          <View style={[styles.checkWrap, isTablet && { width: checkSize, height: checkSize, marginBottom: 12 }]}>
            <Svg width={checkSize} height={checkSize} viewBox="0 0 48 48">
              <AnimatedPath
                d="M10 24 L20 34 L38 14"
                fill="none"
                stroke="#A68246"
                strokeWidth={isTablet ? 3 : 2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={`${checkPathLength}`}
                strokeDashoffset={checkDashOffset as any}
              />
            </Svg>
          </View>

          <Animated.View style={{ opacity: messageOpacity, width: "100%", alignItems: "center" }}>
            <View style={[styles.messageCard, isTablet && { borderLeftWidth: 3, paddingLeft: 28, paddingVertical: 8, marginBottom: 40 }]}>
              <Text style={[styles.messageText, isTablet && { fontSize: 36, lineHeight: 52 }]}>{title}</Text>
              {!!subtitle && (
                <Text style={[styles.subtextText, isTablet && { fontSize: 20, lineHeight: 30, marginTop: 12 }]}>{subtitle}</Text>
              )}
            </View>

            {!!badgeLabel && (
              <View style={[styles.badgeWrap, isTablet && { paddingLeft: 28 }]}>
                <Text style={[styles.badgeText, isTablet && { fontSize: 18 }]}>{badgeLabel}</Text>
              </View>
            )}

            {!!liveActivity && (
              <LiveActivityPreferenceBanner
                variant="completion"
                experienceType={liveActivity.type}
                experienceName={liveActivity.name}
              />
            )}

            {!!nameCard && (
              <View style={styles.nameCard}>
                <View style={styles.nameCardHeader}>
                  <View style={styles.nameCardDivider} />
                  <Text style={styles.nameCardLabel}>{nameCard.label}</Text>
                  <View style={styles.nameCardDivider} />
                </View>
                <Text style={styles.nameCardText}>{`“${nameCard.text}”`}</Text>
                {!!nameCard.guideLine && (
                  <>
                    <Text style={styles.nameCardDots}>• • •</Text>
                    <Text style={styles.nameCardGuide}>{nameCard.guideLine}</Text>
                  </>
                )}
              </View>
            )}

            {!!reflection && (
              <View style={styles.reflectionWrap}>
                <View style={styles.reflectionHeader}>
                  <Ionicons name="create-outline" size={18} color="#B0863F" />
                  <Text style={styles.reflectionTitle}>Anything to carry from this?</Text>
                </View>
                <VoiceTextInput
                  placeholder={reflection.prompt}
                  onSend={reflection.onSubmit}
                />
              </View>
            )}
          </Animated.View>
        </Animated.View>

        <View style={[styles.bottomSection, isTablet && { maxWidth: 640, alignSelf: "center", width: "100%" }]}>
          <View style={[styles.lotusWrap, isTablet && { minHeight: 340, marginTop: 0, marginBottom: 0 }]}>
            <MantraLotus3d
              width={LOTUS_WIDTH}
              height={LOTUS_HEIGHT}
              opacity={0.76}
              style={styles.lotusImage}
            />
          </View>

          <View style={[styles.footer, isTablet && { paddingBottom: 60 }]}>
            <TouchableOpacity
              style={[styles.primaryCta, isTablet && { maxWidth: 560, paddingVertical: 22 }]}
              onPress={onCtaPress}
              activeOpacity={0.8}
              testID={testID}
            >
              <Text style={[styles.primaryCtaText, isTablet && { fontSize: 22, letterSpacing: 0.4 }]}>{ctaLabel}</Text>
            </TouchableOpacity>

            {!!onRepeat && (
              <TouchableOpacity style={styles.secondaryCta} onPress={onRepeat} activeOpacity={0.6}>
                <Text style={[styles.secondaryCtaText, isTablet && { fontSize: 22 }]}>{repeatLabel}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  content: {
    alignItems: "center",
    width: "100%",
  },
  checkWrap: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  messageCard: {
    borderLeftWidth: 2,
    borderLeftColor: "#DAC28E",
    paddingLeft: 20,
    paddingVertical: 4,
    marginBottom: 32,
    width: "100%",
    alignSelf: "flex-start",
  },
  messageText: {
    fontFamily: Fonts.serif.regular,
    fontSize: sfs(26),
    lineHeight: sfs(38),
    color: "#5C3A12",
  },
  subtextText: {
    fontFamily: Fonts.serif.regular,
    fontSize: sfs(15),
    lineHeight: sfs(22),
    color: "#8A6845",
    fontStyle: "italic",
    marginTop: 8,
  },
  badgeWrap: {
    marginBottom: 12,
    alignSelf: "flex-start",
    paddingLeft: 20,
  },
  badgeText: {
    fontFamily: Fonts.sans.medium,
    fontSize: sfs(13),
    color: "#A68246",
    letterSpacing: 0.3,
  },
  // --- "Today's …" name card ---
  nameCard: {
    width: "100%",
    backgroundColor: "rgba(255, 250, 240, 0.7)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EFE3C8",
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  nameCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  nameCardDivider: {
    width: 28,
    height: 1,
    backgroundColor: "#DCC79A",
  },
  nameCardLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: sfs(13),
    color: "#A07D3E",
    letterSpacing: 0.6,
    marginHorizontal: 12,
  },
  nameCardText: {
    fontFamily: Fonts.serif.regular,
    fontSize: sfs(22),
    lineHeight: sfs(32),
    color: "#3A2208",
    textAlign: "center",
  },
  nameCardDots: {
    fontFamily: Fonts.sans.regular,
    fontSize: sfs(12),
    color: "#C9A85F",
    letterSpacing: 3,
    marginTop: 16,
    marginBottom: 12,
  },
  nameCardGuide: {
    fontFamily: Fonts.serif.regular,
    fontSize: sfs(14),
    lineHeight: sfs(20),
    color: "#8A6845",
    textAlign: "center",
    fontStyle: "italic",
  },
  // --- Reflection input ---
  reflectionWrap: {
    width: "100%",
    marginBottom: 8,
  },
  reflectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  reflectionTitle: {
    fontFamily: Fonts.sans.medium,
    fontSize: sfs(14),
    color: "#5C3A12",
    marginLeft: 8,
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  lotusWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 8,
    marginBottom: 12,
    minHeight: 220,
  },
  lotusImage: {
    marginTop: -8,
    marginBottom: -28,
  },
  footer: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 92,
  },
  primaryCta: {
    backgroundColor: "#FBF5F5",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 32,
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.3,
    borderColor: "#9f9f9f",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 6,
  },
  primaryCtaText: {
    fontFamily: Fonts.sans.regular,
    fontSize: sfs(16),
    color: "#432104",
    letterSpacing: 0.2,
  },
  secondaryCta: {
    paddingVertical: 10,
  },
  secondaryCtaText: {
    fontFamily: Fonts.serif.regular,
    fontSize: sfs(18),
    color: "#432104",
    letterSpacing: 0.5,
    marginTop: 10,
    textDecorationLine: "underline",
  },
});

export default RunnerCompletionView;

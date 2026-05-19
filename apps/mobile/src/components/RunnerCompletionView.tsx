import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import MantraLotus3d from "../../assets/mantra-lotus-3d.svg";
import { Fonts } from "../theme/fonts";

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface RunnerCompletionViewProps {
  title: string;
  subtitle?: string;
  badgeLabel?: string;
  ctaLabel: string;
  onCtaPress: () => void;
  onRepeat?: () => void;
  testID?: string;
}

const RunnerCompletionView: React.FC<RunnerCompletionViewProps> = ({
  title,
  subtitle,
  badgeLabel,
  ctaLabel,
  onCtaPress,
  onRepeat,
  testID,
}) => {
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

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[styles.content, { opacity: contentFade }]}>
        <View style={styles.checkWrap}>
          <Svg width={48} height={48} viewBox="0 0 48 48">
            <AnimatedPath
              d="M10 24 L20 34 L38 14"
              fill="none"
              stroke="#A68246"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${checkPathLength}`}
              strokeDashoffset={checkDashOffset as any}
            />
          </Svg>
        </View>

        <Animated.View style={{ opacity: messageOpacity, width: "100%", alignItems: "center" }}>
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>{title}</Text>
            {!!subtitle && (
              <Text style={styles.subtextText}>{subtitle}</Text>
            )}
          </View>

          {!!badgeLabel && (
            <View style={styles.badgeWrap}>
              <Text style={styles.badgeText}>{badgeLabel}</Text>
            </View>
          )}
        </Animated.View>
      </Animated.View>

      <View style={styles.bottomSection}>
        <View style={styles.lotusWrap}>
          <MantraLotus3d width={180} height={140} opacity={0.65} />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryCta}
            onPress={onCtaPress}
            activeOpacity={0.8}
            testID={testID}
          >
            <Text style={styles.primaryCtaText}>{ctaLabel}</Text>
          </TouchableOpacity>

          {!!onRepeat && (
            <TouchableOpacity style={styles.secondaryCta} onPress={onRepeat} activeOpacity={0.6}>
              <Text style={styles.secondaryCtaText}>Repeat</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
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
    fontSize: 26,
    lineHeight: 38,
    color: "#5C3A12",
  },
  subtextText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    lineHeight: 22,
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
    fontSize: 13,
    color: "#A68246",
    letterSpacing: 0.3,
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    marginTop: -300,
    marginBottom: 96,
  },
  lotusWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
  },
  footer: {
    width: "100%",
    alignItems: "center",
  },
  primaryCta: {
    backgroundColor: "#FBF5F5",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 32,
    width: "100%",
    maxWidth: 280,
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
    fontSize: 16,
    color: "#432104",
    letterSpacing: 0.2,
  },
  secondaryCta: {
    paddingVertical: 10,
  },
  secondaryCtaText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#432104",
    letterSpacing: 0.5,
    marginTop: 10,
    textDecorationLine: "underline",
  },
});

export default RunnerCompletionView;

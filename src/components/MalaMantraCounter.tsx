import {
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";
import RudrakshSvg from "../../assets/rudraksh.svg";
import { Fonts } from "../theme/fonts";

const { width } = Dimensions.get("window");

interface MalaMantraCounterProps {
  mantraTitle?: string;
  mantraText?: string;
  hindiText?: string;
  targetCount?: number;
  currentCount?: number;
  tapLabel?: string;
  subTapLabel?: string;
  hintText?: string;
  triggerHeadline?: string;
  triggerSubtext?: string;
  schema?: any;
  showMuteToggle?: boolean;
  mediaMuted?: boolean;
  onToggleMute?: () => void;
  footerContent?: React.ReactNode;
  onIncrement: () => void;
  onExit: () => void;
}

const MAX_VISUAL_BEADS = 18;

const MalaMantraCounter: React.FC<MalaMantraCounterProps> = ({
  mantraTitle = "",
  mantraText = "",
  hindiText = "",
  targetCount = 9,
  currentCount = 0,
  tapLabel = "TAP",
  subTapLabel = "HERE",
  hintText = "TAP THE BEAD AFTER EACH MANTRA.",
  triggerHeadline,
  triggerSubtext,
  schema,
  showMuteToggle = false,
  mediaMuted = false,
  onToggleMute,
  footerContent,
  onIncrement,
  onExit,
}) => {
  const [isMantraExpanded, setIsMantraExpanded] = useState(false);
  const [isHindiExpanded, setIsHindiExpanded] = useState(false);

  // Reanimated values
  const rotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 80000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );

    pulseScale.value = withRepeat(
      withTiming(1.05, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, []);

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedCenterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const isUnlimited = targetCount === -1;
  const visualBeadsCount = isUnlimited
    ? MAX_VISUAL_BEADS
    : Math.min(targetCount, MAX_VISUAL_BEADS);

  const beads = useMemo(() => {
    const arr = [];
    const count = visualBeadsCount;
    const radius = 100;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      arr.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        index: i,
      });
    }
    return arr;
  }, [visualBeadsCount]);

  const isBeadTapped = (index: number) => {
    if (isUnlimited || targetCount > MAX_VISUAL_BEADS) {
      const progressInCycle = currentCount % visualBeadsCount;
      return index < progressInCycle;
    }
    return index < currentCount;
  };

  const isBeadActive = (index: number) => {
    if (isUnlimited || targetCount > MAX_VISUAL_BEADS) {
      return index === currentCount % visualBeadsCount;
    }
    return index === currentCount;
  };

  const handleTap = () => {
    if (isUnlimited || currentCount < targetCount) {
      onIncrement();
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/mantra3.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentWrapper}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.scrollingHeaderRow}>
          {/* <TouchableOpacity
            style={styles.exitBtn}
            onPress={() => {
              console.log("[MALA_COUNTER] Exit pressed");
              onExit();
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={24} color="#8b6914" />
          </TouchableOpacity> */}

          <View style={styles.headerTextCenter}>
            <Text style={styles.headerMantraTitle} numberOfLines={1}>
              {isUnlimited
                ? triggerHeadline || "Pause before this grows."
                : mantraTitle || ""}
            </Text>
          </View>

          {showMuteToggle ? (
            <TouchableOpacity
              style={styles.muteBtn}
              onPress={() => {
                console.log("[MALA_COUNTER] Mute toggle pressed");
                onToggleMute?.();
              }}
              activeOpacity={0.8}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {mediaMuted ? (
                <VolumeX size={22} color="#b89450" />
              ) : (
                <Volume2 size={22} color="#b89450" />
              )}
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {isUnlimited && !!triggerSubtext && (
          <View style={styles.triggerSubtextWrap}>
            <Text style={styles.triggerSubtext}>
              {triggerSubtext ||
                "You do not need to solve everything right now. Stay here for a few breaths and let the intensity soften first."}
            </Text>
          </View>
        )}

        <View style={styles.counterDisplay}>
          <View style={styles.counterRow}>
            <Text style={styles.currentCount}>{currentCount}</Text>
            {!isUnlimited && (
              <>
                <Text style={styles.slash}>/</Text>
                <Text style={styles.totalCount}>{targetCount}</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.interactionArea}>
          <Animated.View style={[styles.beadsRing, animatedRingStyle]}>
            <View style={styles.ringCircle} />

            {beads.map((bead) => {
              const tapped = isBeadTapped(bead.index);
              const active = isBeadActive(bead.index);
              return (
                <View
                  key={bead.index}
                  style={[
                    styles.beadWrapper,
                    {
                      transform: [
                        { translateX: bead.x },
                        { translateY: bead.y },
                        { scale: tapped ? 0.6 : 1 },
                      ],
                      opacity: tapped ? 0.2 : 1,
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={handleTap}
                    disabled={tapped}
                    style={styles.beadInner}
                  >
                    <RudrakshSvg width={36} height={36} />
                    {active && <View style={styles.beadPointer} />}
                  </TouchableOpacity>
                </View>
              );
            })}
          </Animated.View>

          <Animated.View style={[styles.centerTapTarget, animatedCenterStyle]}>
            <TouchableOpacity
              style={styles.tapTouchable}
              onPress={handleTap}
              activeOpacity={0.8}
            >
              <View style={styles.tapContent}>
                <Text style={styles.tapText}>{tapLabel}</Text>
                <Text style={styles.subTap}>{subTapLabel}</Text>
                <View style={styles.tapCheck}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#B89450"
                      strokeWidth="1"
                    />
                    <Path
                      d="M8 12L11 15L16 9"
                      stroke="#B89450"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Text style={styles.tapHintText}>{hintText}</Text>

        <View style={styles.mantraVerseSection}>
          {mantraText !== "" && (
            <TouchableOpacity
              style={[
                styles.verseTextGroup,
                isMantraExpanded && styles.expandedSection,
              ]}
              onPress={() => setIsMantraExpanded(!isMantraExpanded)}
              activeOpacity={0.9}
            >
              <Text
                style={styles.verseIast}
                numberOfLines={isMantraExpanded ? undefined : 2}
              >
                {mantraText}
              </Text>
              <View style={styles.expandArrowWrap}>
                {isMantraExpanded ? (
                  <ChevronUp size={18} color="#B89450" />
                ) : (
                  <ChevronDown size={18} color="#B89450" />
                )}
              </View>
            </TouchableOpacity>
          )}

          {hindiText !== "" && (
            <TouchableOpacity
              style={[
                styles.verseTextGroup,
                isHindiExpanded && styles.expandedSection,
              ]}
              onPress={() => setIsHindiExpanded(!isHindiExpanded)}
              activeOpacity={0.9}
            >
              <Text
                style={styles.verseDevanagari}
                numberOfLines={isHindiExpanded ? undefined : 2}
              >
                {hindiText}
              </Text>
              <View style={styles.expandArrowWrap}>
                {isHindiExpanded ? (
                  <ChevronUp size={18} color="#B89450" />
                ) : (
                  <ChevronDown size={18} color="#B89450" />
                )}
              </View>
            </TouchableOpacity>
          )}
        </View>

        {(isUnlimited || currentCount < targetCount) && (
          <View style={styles.footerHint}>
            <View style={styles.decorativeDivider}>
              <View style={styles.line} />
              <View style={styles.diamond} />
              <View style={styles.line} />
            </View>
          </View>
        )}

        {!!footerContent && (
          <View style={styles.footerActions}>{footerContent}</View>
        )}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
  },
  scroll: {
    flex: 1,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  exitBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    zIndex: 20,
  },
  muteBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    zIndex: 20,
  },
  contentWrapper: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 0,
    paddingBottom: 40,
  },
  scrollingHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingTop: Platform.OS === "ios" ? 10 : 10,
    marginBottom: 8,
    zIndex: 10,
    gap: 12,
  },
  headerTextCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerMantraTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: "#8b6914",
    textAlign: "center",
  },
  triggerSubtextWrap: {
    alignItems: "center",
    // marginBottom: 8,
    paddingHorizontal: 15,
  },
  triggerSubtext: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#615247",
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 20,
  },
  mantraTitleBar: {
    paddingVertical: 10,
  },
  mantraDisplayName: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: "#8b6914",
    letterSpacing: 0.5,
  },
  counterDisplay: {
    marginVertical: 0,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  currentCount: {
    fontSize: 72,
    color: "#b89450",
    fontFamily: Fonts.serif.regular,
  },
  slash: {
    fontSize: 32,
    color: "#d1d1d1",
    fontFamily: Fonts.sans.regular,
  },
  totalCount: {
    fontSize: 40,
    color: "#d1d1d1",
    fontFamily: Fonts.serif.regular,
  },
  interactionArea: {
    width: 300,
    height: 300,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  beadsRing: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  ringCircle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "rgba(255, 200, 100, 0.4)",
    shadowColor: "#FFB432",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  beadWrapper: {
    position: "absolute",
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  beadInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  beadPointer: {
    position: "absolute",
    top: -4,
    width: 6,
    height: 6,
    backgroundColor: "#b89450",
    borderRadius: 3,
    shadowColor: "#b89450",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  centerTapTarget: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e3b54c",
    elevation: 8,
    shadowColor: "#b89450",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    overflow: "hidden",
  },
  tapTouchable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tapContent: {
    alignItems: "center",
  },
  tapText: {
    fontSize: 22,
    letterSpacing: 4,
    fontFamily: Fonts.sans.medium,
    color: "#b89450",
  },
  subTap: {
    fontSize: 10,
    letterSpacing: 1,
    color: "#615247",
    opacity: 0.6,
    fontFamily: Fonts.sans.semiBold,
    marginTop: 2,
  },
  tapCheck: {
    marginTop: 5,
  },
  tapHintText: {
    fontSize: 11,
    letterSpacing: 1,
    fontFamily: Fonts.sans.bold,
    color: "#b89450",
    marginTop: 20,
    textAlign: "center",
  },
  mantraVerseSection: {
    width: "100%",
    marginTop: 20,
    gap: 12,
  },
  verseTextGroup: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(184, 148, 80, 0.1)",
    padding: 12,
  },
  expandedSection: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  verseIast: {
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#615247",
    fontFamily: Fonts.sans.regular,
    textAlign: "center",
    lineHeight: 18,
  },
  verseDevanagari: {
    fontFamily: "NotoSansDevanagari_500Medium",
    fontSize: 18,
    lineHeight: 26,
    color: "#615247",
    textAlign: "center",
  },
  footerHint: {
    marginTop: 20,
  },
  footerActions: {
    width: "100%",
    marginTop: 5,
    alignItems: "center",
    gap: 14,
    paddingBottom: 22,
  },
  decorativeDivider: {
    flexDirection: "row",
    alignItems: "center",
    width: 180,
    gap: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#b89450",
    opacity: 0.3,
  },
  diamond: {
    width: 6,
    height: 6,
    backgroundColor: "#b89450",
    transform: [{ rotate: "45deg" }],
  },
  expandArrowWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    opacity: 0.6,
  },
});

export default MalaMantraCounter;

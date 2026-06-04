import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  LayoutAnimation,
  Platform,
  Animated as RNAnimated,
  Easing as RNEasing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
  useWindowDimensions,
} from "react-native";
import { REMOTE_AUDIO_SOURCES } from "../../config/audioAssets";
import { stopRoomAmbientAudio } from "../../engine/roomAmbientAudio";
import { Fonts } from "../../theme/fonts";
import { sfs } from "../../utils/responsive";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const NamasteIcon = require("../../../assets/namaste.webp");
const BROWN = "#432104";

export interface SankalpItem {
  title?: string;
  line?: string;
  subtitle?: string;
  iast?: string;
  meaning?: string;
  summary?: string;
  insight?: string;
  benefits?: string[] | string;
  how_to_live?: string[] | string;
}

export interface SankalpRunnerViewProps {
  item: SankalpItem;
  isViewOnly?: boolean;
  runnerStartTimeKey?: number | string | null;
  onComplete: (durationSec: number) => void;
  onBack: () => void;
  isDevMode?: boolean;
  isCommunityRunner?: boolean;
  addLoading?: boolean;
  onAddToPractice?: () => void;
}

const hasContent = (val: any): boolean => {
  if (!val) return false;
  if (typeof val === "string") return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === "object") return Object.keys(val).length > 0;
  return true;
};

const normalizeComparableText = (val: any): string =>
  String(val || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

// --- Sub-components ---

const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.dividerLine} />
    <Text style={styles.sectionLabel}>{label}</Text>
    <View style={styles.dividerLine} />
  </View>
);

const CollapsibleCard: React.FC<{
  label: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ label, expanded, onToggle, children }) => (
  <TouchableOpacity
    style={[styles.card, expanded && styles.cardExpanded]}
    onPress={() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      onToggle();
    }}
    activeOpacity={0.8}
  >
    <View style={styles.cardHeader}>
      <View style={styles.dividerLine} />
      <View style={styles.headerLabelGroup}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.toggleIcon}>{expanded ? "▲" : "▼"}</Text>
      </View>
      <View style={styles.dividerLine} />
    </View>
    {expanded && <View style={styles.cardContent}>{children}</View>}
  </TouchableOpacity>
);

const CommunityActionBar: React.FC<{
  addLoading?: boolean;
  onAdd?: () => void;
}> = ({ addLoading, onAdd }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.communityActionBar}>
      <TouchableOpacity
        onPress={onAdd}
        disabled={addLoading}
        activeOpacity={0.85}
        style={[
          styles.communityAddButton,
          addLoading && styles.communityAddButtonDisabled,
        ]}
      >
        <Text style={styles.communityAddButtonText}>
          {addLoading ? t("sankalpRunner.adding") : t("sankalpRunner.addToMyPractice")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// --- Main Component ---

const SankalpRunnerView: React.FC<SankalpRunnerViewProps> = ({
  item,
  isViewOnly,
  runnerStartTimeKey,
  onComplete,
  onBack,
  isDevMode,
  isCommunityRunner,
  addLoading,
  onAddToPractice,
}) => {
  const { t } = useTranslation();
  const [isSankalpActivating, setIsSankalpActivating] = useState(false);
  const [essenceExpanded, setEssenceExpanded] = useState(true);
  const [benefitsExpanded, setBenefitsExpanded] = useState(false);
  const sankalpOmRef = useRef<Audio.Sound | null>(null);
  const sankalpSpin = useRef(new RNAnimated.Value(0)).current;
  const sankalpSpinLoopRef = useRef<RNAnimated.CompositeAnimation | null>(null);
  const sessionStartTimeRef = useRef(Date.now());
  const isCompletingRef = useRef(false);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  useEffect(() => {
    stopRoomAmbientAudio().catch(() => {});
  }, []);

  useEffect(() => {
    isCompletingRef.current = false;
    setIsSankalpActivating(false);
    sessionStartTimeRef.current = Date.now();
  }, [runnerStartTimeKey]);

  useEffect(() => {
    return () => {
      sankalpSpinLoopRef.current?.stop();
      sankalpSpin.setValue(0);
      if (sankalpOmRef.current) {
        sankalpOmRef.current.unloadAsync().catch(() => {});
        sankalpOmRef.current = null;
      }
    };
  }, [sankalpSpin]);

  const bodyText =
    item.line ||
    item.subtitle ||
    item.iast ||
    item.meaning ||
    item.summary ||
    "";
  const showBodyText =
    hasContent(bodyText) &&
    normalizeComparableText(bodyText) !==
      normalizeComparableText(item.title || "Intention");

  const runSankalpActivation = async () => {
    if (isSankalpActivating) return;
    setIsSankalpActivating(true);

    const startSmoothSpin = (durationMs: number) => {
      sankalpSpinLoopRef.current?.stop();
      sankalpSpin.setValue(0);
      sankalpSpinLoopRef.current = RNAnimated.loop(
        RNAnimated.timing(sankalpSpin, {
          toValue: 1,
          duration: Math.max(3000, Math.round(durationMs)),
          easing: RNEasing.linear,
          useNativeDriver: true,
        }),
      );
      sankalpSpinLoopRef.current.start();
    };

    startSmoothSpin(4200);

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      if (sankalpOmRef.current) {
        await sankalpOmRef.current.unloadAsync().catch(() => {});
        sankalpOmRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        REMOTE_AUDIO_SOURCES.SANKALP_OM,
        { shouldPlay: false, isLooping: false, volume: 1 },
      );

      sankalpOmRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.durationMillis && status.positionMillis === 0) {
          startSmoothSpin(status.durationMillis);
        }
        if (status.didJustFinish) {
          sound.setOnPlaybackStatusUpdate(null);
          sankalpSpinLoopRef.current?.stop();
          sankalpSpin.setValue(0);
          setIsSankalpActivating(false);
          if (!isCompletingRef.current) {
            isCompletingRef.current = true;
            const durationSec = Math.round(
              (Date.now() - sessionStartTimeRef.current) / 1000,
            );
            onComplete(durationSec);
          }
        }
      });
      await sound.playAsync();
    } catch (err) {
      console.warn("[SANKALP_ACTIVATE] OM audio failed:", err);
      setTimeout(() => {
        sankalpSpinLoopRef.current?.stop();
        sankalpSpin.setValue(0);
        setIsSankalpActivating(false);
        if (!isCompletingRef.current) {
          isCompletingRef.current = true;
          const durationSec = Math.round(
            (Date.now() - sessionStartTimeRef.current) / 1000,
          );
          onComplete(durationSec);
        }
      }, 4200);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.scrollContent, isTablet && { paddingHorizontal: 40 }]}
      showsVerticalScrollIndicator={false}
    >
      {isDevMode && (
        <TouchableOpacity
          testID="test_runner_force_complete"
          accessibilityLabel="test_runner_force_complete"
          accessible={true}
          accessibilityRole="button"
          onPress={() => {
            if (isCompletingRef.current) return;
            isCompletingRef.current = true;
            sankalpSpinLoopRef.current?.stop();
            sankalpSpin.setValue(0);
            if (sankalpOmRef.current) {
              sankalpOmRef.current.unloadAsync().catch(() => {});
              sankalpOmRef.current = null;
            }
            setIsSankalpActivating(false);
            const durationSec = Math.round(
              (Date.now() - sessionStartTimeRef.current) / 1000,
            );
            onComplete(durationSec);
          }}
          style={{
            position: "absolute",
            top: 60,
            right: 4,
            width: 24,
            height: 24,
            opacity: 0.01,
            zIndex: 9999,
          }}
        >
          <View style={{ width: 24, height: 24 }} />
        </TouchableOpacity>
      )}

      <View style={[styles.combinedSankalpFlow, isTablet && { maxWidth: 640, alignSelf: 'center' }]}>
        <View style={styles.mantraInfoCard}>
          <Text style={styles.sankalpTitle}>{item.title || "Intention"}</Text>
          {showBodyText && (
            <Text style={styles.sankalpMainTextInline}>{bodyText}</Text>
          )}
        </View>

        {hasContent(item.how_to_live) && (
          <View style={styles.mainCard}>
            <SectionHeader label={t("sankalpRunner.howToLive")} />
            <View style={{ marginTop: 12 }}>
              {Array.isArray(item.how_to_live) ? (
                <View style={styles.howToLiveList}>
                  {(item.how_to_live as string[]).map(
                    (line: string, index: number) => (
                      <Text
                        key={`${line}-${index}`}
                        style={styles.howToLiveText}
                      >
                        {line}
                      </Text>
                    ),
                  )}
                </View>
              ) : (
                <Text style={styles.howToLiveText}>{item.how_to_live}</Text>
              )}
            </View>
          </View>
        )}

        {!isViewOnly && (
          <View style={styles.embodySection}>
            <Text style={styles.embodyInstr}>
              {isSankalpActivating
                ? t("sankalpRunner.vibrationSettle")
                : t("sankalpRunner.tapToEmbody")}
            </Text>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={runSankalpActivation}
              disabled={isSankalpActivating}
              style={[styles.holdTarget, isTablet && { width: 300, height: 300 }]}
            >
              <RNAnimated.View
                style={{
                  transform: [
                    { perspective: 1000 },
                    {
                      rotateY: sankalpSpin.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                    {
                      scaleX: sankalpSpin.interpolate({
                        inputRange: [0, 0.25, 0.5, 0.75, 1],
                        outputRange: [1, 0.18, 1, 0.18, 1],
                      }),
                    },
                  ],
                }}
              >
                <Image source={NamasteIcon} style={[styles.embodyImg, isTablet && { width: 340, height: 340 }]} />
              </RNAnimated.View>
            </TouchableOpacity>
          </View>
        )}

        <View
          style={[
            styles.collapsibleSectionsCombined,
            !isViewOnly && { marginTop: -70 },
          ]}
        >
          {hasContent(item.insight) && (
            <CollapsibleCard
              label={t("sankalpRunner.essence")}
              expanded={essenceExpanded}
              onToggle={() => setEssenceExpanded(!essenceExpanded)}
            >
              <Text style={styles.cardText}>{item.insight}</Text>
            </CollapsibleCard>
          )}
          {hasContent(item.insight) && hasContent(item.benefits) && (
            <View style={{ height: 12 }} />
          )}
          {hasContent(item.benefits) && (
            <CollapsibleCard
              label={t("sankalpRunner.benefits")}
              expanded={benefitsExpanded}
              onToggle={() => setBenefitsExpanded(!benefitsExpanded)}
            >
              {Array.isArray(item.benefits) ? (
                <View style={styles.benefitList}>
                  {(item.benefits as string[]).map((b: string, idx: number) => (
                    <Text key={idx} style={styles.benefitItem}>
                      {"•"} {b}
                    </Text>
                  ))}
                </View>
              ) : (
                <Text style={styles.cardText}>{item.benefits}</Text>
              )}
            </CollapsibleCard>
          )}
        </View>

        {isCommunityRunner && (
          <CommunityActionBar addLoading={addLoading} onAdd={onAddToPractice} />
        )}

        <TouchableOpacity onPress={onBack} style={styles.backLink}>
          <Text style={styles.backLinkText}>{t("sankalpRunner.back")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    alignItems: "center",
  },
  combinedSankalpFlow: {
    width: "100%",
    alignItems: "center",
    paddingTop: 30,
  },
  mantraInfoCard: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  sankalpTitle: {
    fontSize: sfs(24),
    lineHeight: sfs(34),
    fontFamily: Fonts.serif.bold,
    color: BROWN,
    textAlign: "center",
    paddingHorizontal: 12,
    marginTop: -12,
    marginBottom: 10,
  },
  sankalpMainTextInline: {
    fontSize: sfs(16),
    lineHeight: sfs(24),
    fontFamily: Fonts.serif.regular,
    color: BROWN,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  mainCard: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E8C587",
    padding: 20,
    marginBottom: 10,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E8C587",
    opacity: 0.6,
  },
  sectionLabel: {
    fontFamily: Fonts.serif.regular,
    fontSize: sfs(14),
    color: "#B89450",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  howToLiveList: {
    alignItems: "center",
    gap: 4,
  },
  howToLiveText: {
    fontSize: sfs(18),
    fontFamily: Fonts.serif.regular,
    fontStyle: "italic",
    color: "#4A4A4A",
    lineHeight: sfs(28),
    textAlign: "center",
    paddingHorizontal: 10,
  },
  embodySection: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
  },
  embodyInstr: {
    fontSize: sfs(16),
    fontFamily: Fonts.serif.regular,
    color: "#8a7a5a",
    marginBottom: 24,
    fontStyle: "italic",
  },
  holdTarget: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  embodyImg: {
    marginTop: -40,
    width: 250,
    height: 250,
    resizeMode: "contain",
  },
  collapsibleSectionsCombined: {
    width: "100%",
    paddingHorizontal: 0,
    marginBottom: 40,
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(184, 148, 80, 0.1)",
    padding: 15,
  },
  cardExpanded: {},
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  headerLabelGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardLabel: {
    fontSize: sfs(18),
    fontFamily: Fonts.serif.bold,
    color: BROWN,
    marginHorizontal: 12,
  },
  toggleIcon: {
    fontSize: sfs(12),
    color: "#D4A017",
    display: "flex",
    alignItems: "center",
    alignSelf: "center",
  },
  cardContent: {
    marginTop: 12,
  },
  cardText: {
    fontSize: sfs(16),
    lineHeight: sfs(24),
    color: "#5a3c21",
    fontFamily: Fonts.serif.regular,
    textAlign: "center",
  },
  benefitList: {
    gap: 4,
  },
  benefitItem: {
    fontSize: sfs(16),
    lineHeight: sfs(24),
    color: "#5a3c21",
    fontFamily: Fonts.serif.regular,
  },
  communityActionBar: {
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  communityAddButton: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D9BC76",
    backgroundColor: "rgba(255,248,239,0.92)",
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  communityAddButtonDisabled: {
    opacity: 0.65,
  },
  communityAddButtonText: {
    color: "#B88413",
    fontFamily: Fonts.sans.bold,
    fontSize: sfs(14),
  },
  backLink: {
    paddingVertical: 1,
  },
  backLinkText: {
    fontSize: sfs(16),
    fontFamily: Fonts.serif.regular,
    color: BROWN,
    textDecorationLine: "underline",
  },
});

export default SankalpRunnerView;

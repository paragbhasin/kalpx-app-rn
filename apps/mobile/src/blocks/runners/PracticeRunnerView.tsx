import AsyncStorage from "@react-native-async-storage/async-storage";
import { LiveActivityPreferenceBanner } from "../../components/LiveActivityPreferenceBanner";
import { liveActivity } from "../../native/liveActivity";
import Slider from "@react-native-community/slider";
import { Audio } from "expo-av";
import { Minus, Plus, RefreshCw } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useKeepAwake } from "expo-keep-awake";
import {
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, { Circle , SvgUri } from "react-native-svg";
const MantraLotus3d = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/mantra-lotus-3d.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
import { REMOTE_AUDIO_SOURCES } from "../../config/audioAssets";
import { stopRoomAmbientAudio } from "../../engine/roomAmbientAudio";
import { Fonts } from "../../theme/fonts";
import { sfs } from "../../utils/responsive";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CALM_MUSIC_INDEX_KEY = "_kalpx_calm_music_idx";
const CALM_MUSIC_TRACKS = [
  REMOTE_AUDIO_SOURCES.CALM_MUSIC,
  REMOTE_AUDIO_SOURCES.CALM_MUSIC_1,
  REMOTE_AUDIO_SOURCES.CALM_MUSIC_9,
  REMOTE_AUDIO_SOURCES.CALM_MUSIC_6,
];
const PRACTICE_TIMER_SIZE = Platform.OS === "android" ? 216 : 232;
const PRACTICE_TIMER_CENTER = PRACTICE_TIMER_SIZE / 2;
const PRACTICE_TIMER_RADIUS = Platform.OS === "android" ? 88 : 96;
const PRACTICE_TIMER_STROKE = Platform.OS === "android" ? 10 : 11;
const BROWN = "#432104";

function formatTimer(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

async function getNextCalmTrack() {
  let lastIdx = -1;
  try {
    const stored = await AsyncStorage.getItem(CALM_MUSIC_INDEX_KEY);
    lastIdx = parseInt(stored || "-1", 10);
  } catch (_) {}
  const nextIdx =
    ((Number.isFinite(lastIdx) ? lastIdx : -1) + 1) % CALM_MUSIC_TRACKS.length;
  try {
    await AsyncStorage.setItem(CALM_MUSIC_INDEX_KEY, String(nextIdx));
  } catch (_) {}
  return CALM_MUSIC_TRACKS[nextIdx];
}

export interface PracticeItem {
  title?: string;
  summary?: string;
  subtitle?: string;
  line?: string;
  duration?: string;
  duration_min?: number;
  steps?: string[];
  benefits?: string[] | string;
  essence?: string;
  insight?: string;
}

export interface PracticeRunnerViewProps {
  item: PracticeItem;
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

const CommunityActionBar: React.FC<{ addLoading?: boolean; onAdd?: () => void }> = ({
  addLoading,
  onAdd,
}) => {
  const { t } = useTranslation();
  return (
    <View style={styles.communityActionBar}>
      <TouchableOpacity
        onPress={onAdd}
        disabled={addLoading}
        activeOpacity={0.85}
        style={[styles.communityAddButton, addLoading && styles.communityAddButtonDisabled]}
      >
        <Text style={styles.communityAddButtonText}>
          {addLoading ? t("practiceRunner.adding") : t("practiceRunner.addToMyPractice")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// --- Main Component ---

const PracticeRunnerView: React.FC<PracticeRunnerViewProps> = ({
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
  // Keep the screen awake for the whole practice session; auto-released on unmount.
  useKeepAwake();
  const clampMins = (v: number) => Math.max(1, Math.min(10, Math.round(v)));

  const resolveInitialMins = (): number => {
    const rawDuration = item.duration_min ?? item.duration;
    if (typeof rawDuration === "number" && rawDuration > 0) {
      return Math.max(1, Math.round(rawDuration));
    }
    if (typeof rawDuration === "string") {
      const m = rawDuration.match(/(\d+(?:\.\d+)?)/);
      if (m) return Math.max(1, Math.round(Number(m[1])));
    }
    return 3;
  };

  const [selectedPracticeMinutes, setSelectedPracticeMinutes] = useState(resolveInitialMins);
  const [practiceTimeLeft, setPracticeTimeLeft] = useState(() => resolveInitialMins() * 60);
  const [practiceInitialSeconds, setPracticeInitialSeconds] = useState(
    () => resolveInitialMins() * 60,
  );
  const [isPracticeTimerRunning, setIsPracticeTimerRunning] = useState(false);
  const [benefitsExpanded, setBenefitsExpanded] = useState(false);
  const [essenceExpanded, setEssenceExpanded] = useState(true);

  const calmMusicRef = useRef<Audio.Sound | null>(null);
  const practiceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerCompletionQueuedRef = useRef(false);
  const sessionStartTimeRef = useRef<number>(Date.now());
  const isCompletingRef = useRef(false);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const timerSize = isTablet ? 320 : PRACTICE_TIMER_SIZE;
  const timerCenter = timerSize / 2;
  const timerRadius = isTablet ? 132 : PRACTICE_TIMER_RADIUS;
  const timerStroke = isTablet ? 13 : PRACTICE_TIMER_STROKE;

  useEffect(() => {
    stopRoomAmbientAudio().catch(() => {});
  }, []);

  useEffect(() => {
    isCompletingRef.current = false;
    setIsPracticeTimerRunning(false);
    const mins = resolveInitialMins();
    setSelectedPracticeMinutes(mins);
    setPracticeTimeLeft(mins * 60);
    setPracticeInitialSeconds(mins * 60);
  }, [runnerStartTimeKey]);

  useEffect(() => {
    const mins = resolveInitialMins();
    setSelectedPracticeMinutes(mins);
    setPracticeTimeLeft(mins * 60);
    setPracticeInitialSeconds(mins * 60);
  }, [item.duration_min, item.duration]);

  useEffect(() => {
    return () => {
      if (practiceTimerRef.current) {
        clearInterval(practiceTimerRef.current);
        practiceTimerRef.current = null;
      }
      stopCalmMusic().catch(() => {});
    };
  }, []);

  const stopCalmMusic = async () => {
    if (calmMusicRef.current) {
      const sound = calmMusicRef.current;
      calmMusicRef.current = null;
      await sound.stopAsync().catch(() => {});
      await sound.unloadAsync().catch(() => {});
    }
  };

  const startCalmMusic = async () => {
    try {
      await stopCalmMusic();
      const trackSource = await getNextCalmTrack();
      const { sound } = await Audio.Sound.createAsync(trackSource, {
        shouldPlay: false,
        isLooping: true,
        volume: 0.15,
      });
      await sound.playAsync();
      calmMusicRef.current = sound;
    } catch (err) {
      console.warn("[PRACTICE_TIMER] calm music failed:", err);
    }
  };

  const stopPracticeTimer = async () => {
    if (practiceTimerRef.current) {
      clearInterval(practiceTimerRef.current);
      practiceTimerRef.current = null;
    }
    timerCompletionQueuedRef.current = false;
    setIsPracticeTimerRunning(false);
    await stopCalmMusic();
  };

  const completePracticeTimer = () => {
    if (practiceTimerRef.current) {
      clearInterval(practiceTimerRef.current);
      practiceTimerRef.current = null;
    }
    setIsPracticeTimerRunning(false);
    stopCalmMusic().catch(() => {});
    if (!isCompletingRef.current) {
      isCompletingRef.current = true;
      const durationSec = Math.round(
        (Date.now() - sessionStartTimeRef.current) / 1000,
      );
      onComplete(durationSec);
    }
  };

  const startPracticeTimer = async () => {
    if (isPracticeTimerRunning) return;
    const totalSeconds = Math.max(60, Math.round(selectedPracticeMinutes * 60));
    setPracticeInitialSeconds(totalSeconds);
    setPracticeTimeLeft(totalSeconds);
    sessionStartTimeRef.current = Date.now();
    timerCompletionQueuedRef.current = false;
    setIsPracticeTimerRunning(true);

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      playThroughEarpieceAndroid: false,
    }).catch(() => {});
    await startCalmMusic();

    practiceTimerRef.current = setInterval(() => {
      setPracticeTimeLeft((prev) => {
        if (prev <= 1) {
          if (!timerCompletionQueuedRef.current) {
            timerCompletionQueuedRef.current = true;
            setTimeout(completePracticeTimer, 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetPracticeTimer = async () => {
    await stopPracticeTimer();
    const totalSeconds = Math.max(60, Math.round(selectedPracticeMinutes * 60));
    timerCompletionQueuedRef.current = false;
    setPracticeInitialSeconds(totalSeconds);
    setPracticeTimeLeft(totalSeconds);
  };

  const updatePracticeMinutes = (value: number) => {
    const mins = clampMins(value);
    setSelectedPracticeMinutes(mins);
    setPracticeTimeLeft(mins * 60);
    setPracticeInitialSeconds(mins * 60);
  };

  const handleBack = () => {
    stopPracticeTimer().catch(() => {});
    onBack();
  };

  return (
    <View style={styles.container}>
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
              stopPracticeTimer().catch(() => {});
              isCompletingRef.current = true;
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

      <View style={[styles.visualContainer, isTablet && { maxWidth: 640, alignSelf: 'center', width: '100%' }]}>
        <View style={styles.mantraMainContainer}>
          <Text style={[styles.deityTitle, { textAlign: "center" }]}>{item.title}</Text>
          {(item.summary || item.subtitle || item.line) && (
            <Text
              style={[
                styles.sankalpMainText,
                { fontSize: 18, marginTop: 8, textAlign: "center" },
              ]}
            >
              {item.summary || item.subtitle || item.line}
            </Text>
          )}
          {!!item.duration && (
            <Text style={styles.practiceDurationLine}>{item.duration}</Text>
          )}
        </View>

        <View style={styles.mainCard}>
          {item.steps && item.steps.length > 0 && (
            <>
              <SectionHeader label={t("practiceRunner.whatThisAsks")} />
              <View style={styles.practiceStepsList}>
                {item.steps.map((step: string, i: number) => (
                  <View key={i} style={styles.practiceStep}>
                    <Text style={styles.stepNum}>{i + 1}.</Text>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        {!isViewOnly && (
          <View
            style={[
              styles.practiceTimerCard,
              item.steps && item.steps.length > 0 && { marginTop: 24 },
            ]}
          >
            {!isPracticeTimerRunning ? (
              <>
                <Text style={styles.practiceTimerHeading}>{t("practiceRunner.howLongPause")}</Text>
                <Text style={styles.practiceTimerValue}>{selectedPracticeMinutes} {t("practiceRunner.minLabel")}</Text>
                <View style={styles.practiceSliderRow}>
                  <TouchableOpacity
                    style={styles.practiceAdjustButton}
                    onPress={() => updatePracticeMinutes(selectedPracticeMinutes - 1)}
                    activeOpacity={0.8}
                  >
                    <Minus size={18} color="#8A5A12" />
                  </TouchableOpacity>
                  <View style={styles.practiceSliderWrap}>
                    <Slider
                      style={styles.practiceSlider}
                      minimumValue={1}
                      maximumValue={10}
                      step={1}
                      value={selectedPracticeMinutes}
                      onValueChange={updatePracticeMinutes}
                      minimumTrackTintColor="#D4A017"
                      maximumTrackTintColor="#E8D8B5"
                      thumbTintColor="#D4A017"
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.practiceAdjustButton}
                    onPress={() => updatePracticeMinutes(selectedPracticeMinutes + 1)}
                    activeOpacity={0.8}
                  >
                    <Plus size={18} color="#8A5A12" />
                  </TouchableOpacity>
                </View>
                <View style={styles.practiceTimerScale}>
                  <Text style={styles.practiceTimerScaleLabel}>{t("practiceRunner.minMin")}</Text>
                  <Text style={styles.practiceTimerScaleHint}>{t("practiceRunner.dragToAdjust")}</Text>
                  <Text style={styles.practiceTimerScaleLabel}>{t("practiceRunner.maxMin")}</Text>
                </View>
                <TouchableOpacity
                  style={styles.practicePrimaryButton}
                  onPress={startPracticeTimer}
                  activeOpacity={0.85}
                >
                  <Text style={styles.practicePrimaryButtonText}>{t("practiceRunner.begin")}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={[styles.practiceTimerVisual, isTablet && { width: timerSize + 40, height: timerSize + 40 }]}>
                  <Svg
                    width={timerSize}
                    height={timerSize}
                    viewBox={`0 0 ${timerSize} ${timerSize}`}
                  >
                    <Circle
                      cx={timerCenter}
                      cy={timerCenter}
                      r={timerRadius}
                      stroke="rgba(212,160,23,0.2)"
                      strokeWidth={timerStroke}
                      fill="none"
                    />
                    <Circle
                      cx={timerCenter}
                      cy={timerCenter}
                      r={timerRadius}
                      stroke="#D4A017"
                      strokeWidth={timerStroke}
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * timerRadius}`}
                      strokeDashoffset={
                        2 *
                        Math.PI *
                        timerRadius *
                        (1 - practiceTimeLeft / practiceInitialSeconds)
                      }
                      strokeLinecap="round"
                      transform={`rotate(-90 ${timerCenter} ${timerCenter})`}
                    />
                  </Svg>
                  <View style={styles.practiceTimerCenter}>
                    <Text style={styles.practiceTimerClock}>
                      {formatTimer(practiceTimeLeft)}
                    </Text>
                    <Text style={styles.practiceTimerSubtext}>{t("practiceRunner.returnToMoment")}</Text>
                    <TouchableOpacity
                      style={styles.practiceResetIconButton}
                      onPress={() => resetPracticeTimer().catch(() => {})}
                      activeOpacity={0.75}
                    >
                      <RefreshCw size={18} color="#8A7A5A" />
                    </TouchableOpacity>
                    {typeof MantraLotus3d === "number" ? (
                      <SvgUri
                        uri={Image.resolveAssetSource(MantraLotus3d)?.uri ?? null}
                        width={110}
                        height={80}
                      />
                    ) : (
                      <MantraLotus3d
                        width={250}
                        height={250}
                        style={{
                          marginBottom: Platform.OS === "android" ? -200 : -200,
                        }}
                      />
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.practicePrimaryButton}
                  onPress={handleBack}
                  activeOpacity={0.85}
                >
                  <Text style={styles.practicePrimaryButtonText}>{t("practiceRunner.endPractice")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.practiceResetButton}
                  onPress={() => resetPracticeTimer().catch(() => {})}
                  activeOpacity={0.75}
                />
              </>
            )}
          </View>
        )}

        {hasContent(item.benefits) && (
          <>
            {item.steps && item.steps.length > 0 && <View style={{ height: 18 }} />}
            <CollapsibleCard
              label={t("practiceRunner.benefits")}
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
          </>
        )}

        {hasContent(item.essence || item.insight) && (
          <>
            {(hasContent(item.steps) || hasContent(item.benefits)) && (
              <View style={{ height: 18 }} />
            )}
            <CollapsibleCard
              label={t("practiceRunner.essence")}
              expanded={essenceExpanded}
              onToggle={() => setEssenceExpanded(!essenceExpanded)}
            >
              <Text style={styles.cardText}>{item.essence || item.insight}</Text>
            </CollapsibleCard>
          </>
        )}

        <TouchableOpacity
          onPress={handleBack}
          style={[styles.backLink, { marginTop: 20 }]}
        >
          <Text style={styles.backLinkText}>{t("practiceRunner.back")}</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
      {!isViewOnly && (
        <LiveActivityPreferenceBanner
          experienceType="practice"
          experienceName={item.title ?? ''}
          onActivate={() => {
            liveActivity.startSankalp(
              item.title ?? '',
              item.subtitle ?? item.line ?? item.summary ?? '',
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    alignItems: "center",
  },
  visualContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  mantraMainContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 6,
    paddingHorizontal: 12,
  },
  deityTitle: {
    fontSize: sfs(26),
    fontFamily: Fonts.serif.bold,
    color: BROWN,
    textAlign: "center",
    marginTop: -40,
  },
  sankalpMainText: {
    fontSize: sfs(24),
    fontFamily: Fonts.serif.regular,
    color: BROWN,
    textAlign: "center",
    marginTop: -30,
    paddingHorizontal: 5,
  },
  practiceDurationLine: {
    fontSize: sfs(11),
    letterSpacing: 1.3,
    fontFamily: Fonts.sans.medium,
    color: "#B89450",
    textAlign: "center",
    marginTop: 10,
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
  practiceStepsList: {
    marginTop: 16,
    gap: 12,
  },
  practiceStep: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepNum: {
    fontSize: sfs(18),
    fontFamily: Fonts.serif.bold,
    color: BROWN,
    marginRight: 8,
    width: 24,
  },
  stepText: {
    flex: 1,
    fontSize: sfs(17),
    lineHeight: sfs(24),
    color: BROWN,
    fontFamily: Fonts.serif.regular,
  },
  practiceTimerCard: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(212,160,23,0.25)",
    paddingVertical: 22,
    paddingHorizontal: 40,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  practiceTimerHeading: {
    fontSize: sfs(20),
    lineHeight: sfs(30),
    color: BROWN,
    fontFamily: Fonts.serif.bold,
    textAlign: "center",
  },
  practiceTimerValue: {
    fontSize: sfs(18),
    color: BROWN,
    fontFamily: Fonts.sans.semiBold,
    marginTop: 18,
    marginBottom: 12,
  },
  practiceSliderRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  practiceSliderWrap: {
    flex: 1,
    paddingHorizontal: 6,
    marginTop: 4,
  },
  practiceSlider: {
    width: "100%",
    height: 40,
  },
  practiceAdjustButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(212,160,23,0.35)",
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  practiceTimerScale: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 20,
  },
  practiceTimerScaleLabel: {
    fontSize: sfs(13),
    color: "#6a4d28",
    fontFamily: Fonts.sans.medium,
  },
  practiceTimerScaleHint: {
    fontSize: sfs(12),
    color: "#8A7A5A",
    fontFamily: Fonts.sans.regular,
  },
  practicePrimaryButton: {
    width: "100%",
    borderColor: "#9f9f9f",
    borderRadius: 30,
    borderWidth: 0.5,
    backgroundColor: "#FBF5F5",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    paddingHorizontal: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  practicePrimaryButtonText: {
    fontSize: sfs(18),
    color: BROWN,
    fontFamily: Fonts.serif.bold,
  },
  practiceResetButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  practiceTimerVisual: {
    width: 260,
    height: 260,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  practiceTimerCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  practiceTimerClock: {
    fontSize: Platform.OS === "android" ? sfs(42) : sfs(46),
    lineHeight: Platform.OS === "android" ? sfs(48) : sfs(52),
    color: BROWN,
    fontFamily: Fonts.serif.bold,
  },
  practiceTimerSubtext: {
    fontSize: Platform.OS === "android" ? sfs(13) : sfs(14),
    color: "#7B6A55",
    fontFamily: Fonts.sans.regular,
    marginTop: 6,
    marginBottom: 10,
  },
  practiceResetIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
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

export default PracticeRunnerView;

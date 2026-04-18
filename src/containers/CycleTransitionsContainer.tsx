import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { Audio } from "expo-av";
import {
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  RefreshCw,
} from "lucide-react-native";
import React, { useMemo, useRef, useState } from "react";
import {
  Dimensions,
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
import AudioPlayerBlock from "../blocks/AudioPlayerBlock";
import { VoiceTextInput } from "../components/VoiceTextInput";
import BlockRenderer from "../engine/BlockRenderer";
import { executeAction } from "../engine/actionExecutor";
import { useScreenStore } from "../engine/useScreenBridge";
import { interpolate } from "../engine/utils/interpolation";
import { Fonts } from "../theme/fonts";

// SVGs / Assets
import { SvgUri } from "react-native-svg";
import MantraLotus3d from "../../assets/mantra-lotus-3d.svg";
const NamasteIcon = require("../../assets/namaste.png");

const { width } = Dimensions.get("window");

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CycleTransitionsContainerProps {
  schema: any;
}

type ActivityType = "mantra" | "sankalp" | "practice" | null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const hasContent = (val: any): boolean => {
  if (!val) return false;
  if (typeof val === "string") return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === "object") return Object.keys(val).length > 0;
  return true;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_VISUAL_BEADS = 18;
const CALM_MUSIC_INDEX_KEY = "_kalpx_calm_music_idx";
const CALM_MUSIC_TRACKS = [
  require("../../assets/sounds/Audio-calmmusic.mp3"),
  require("../../assets/sounds/Audio1.mpeg"),
  require("../../assets/sounds/Audio9.mpeg"),
  require("../../assets/sounds/Audio6.mpeg"),
];

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

// ---------------------------------------------------------------------------
// Collapsible Card sub-component
// ---------------------------------------------------------------------------

const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.dividerLine} />
    <Text style={styles.sectionLabel}>{label}</Text>
    <View style={styles.dividerLine} />
  </View>
);

interface CollapsibleCardProps {
  label: string;
  children: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
}

const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  label,
  children,
  expanded,
  onToggle,
}) => (
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
        <Text style={styles.toggleIcon}>{expanded ? "\u25B2" : "\u25BC"}</Text>
      </View>
      <View style={styles.dividerLine} />
    </View>
    {expanded && <View style={styles.cardContent}>{children}</View>}
  </TouchableOpacity>
);

// ---------------------------------------------------------------------------
// Mantra Text Card sub-component
// ---------------------------------------------------------------------------

interface MantraTextCardProps {
  text: string;
  isDevanagari?: boolean;
  expanded: boolean;
  onToggle: () => void;
}

const MantraTextCard: React.FC<MantraTextCardProps> = ({
  text,
  isDevanagari,
  expanded,
  onToggle,
}) => {
  const [isTruncated, setIsTruncated] = React.useState(false);
  const baseTextStyle: any[] = [
    isDevanagari ? styles.verseDevanagari : styles.verseIast,
  ];

  return (
    <View
      style={[
        styles.verseTextGroup,
        !isTruncated && styles.verseTextGroupNoArrow,
        expanded && styles.expandedSection,
      ]}
    >
      <Text
        style={[baseTextStyle, styles.verseMeasureText]}
        onTextLayout={(e) => {
          setIsTruncated(e.nativeEvent.lines.length > 2);
        }}
      >
        {text}
      </Text>

      <TouchableOpacity
        onPress={() => {
          if (!isTruncated) return;
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          onToggle();
        }}
        activeOpacity={isTruncated ? 0.9 : 1}
        disabled={!isTruncated}
      >
        <Text style={baseTextStyle} numberOfLines={expanded ? undefined : 2}>
          {text}
        </Text>
        {isTruncated && (
          <View style={styles.expandArrowWrap}>
            {expanded ? (
              <ChevronUp size={18} color="#B89450" />
            ) : (
              <ChevronDown size={18} color="#B89450" />
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const CycleTransitionsContainer: React.FC<CycleTransitionsContainerProps> = ({
  schema,
}) => {
  const {
    updateBackground,
    updateHeaderHidden,
    screenData,
    currentStateId,
    loadScreen,
    updateScreenData,
    goBack,
  } = useScreenStore();

  // Expand/collapse state
  const [meaningExpanded, setMeaningExpanded] = useState(false);
  const [benefitsExpanded, setBenefitsExpanded] = useState(false);
  const [essenceExpanded, setEssenceExpanded] = useState(false);
  const [iastExpanded, setIastExpanded] = useState(false);
  const [devanagariExpanded, setDevanagariExpanded] = useState(false);

  // Mantra Practice State
  const [chantCount, setChantCount] = useState(0);
  const [selectedTarget, setSelectedTarget] = useState(
    Number(screenData.reps_total) || 27,
  );
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());

  // Sankalp Embodiment State
  const [isSankalpActivating, setIsSankalpActivating] = useState(false);
  const [selectedPracticeMinutes, setSelectedPracticeMinutes] = useState(3);
  const [practiceTimeLeft, setPracticeTimeLeft] = useState(180);
  const [practiceInitialSeconds, setPracticeInitialSeconds] = useState(180);
  const [isPracticeTimerRunning, setIsPracticeTimerRunning] = useState(false);

  const sankalpOmRef = useRef<Audio.Sound | null>(null);
  const calmMusicRef = useRef<Audio.Sound | null>(null);
  const sankalpSpin = useRef(new RNAnimated.Value(0)).current;
  const sankalpSpinLoopRef = useRef<RNAnimated.CompositeAnimation | null>(null);
  const practiceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isCompletingRef = useRef(false);

  const clampPracticeMinutes = (value: number) =>
    Math.max(1, Math.min(10, Math.round(value)));

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

    // Start immediately, sync to audio once loaded
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
        require("../../assets/sounds/sankalp_om.mp3"),
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

          // Complete the runner
          triggerCompletion();
        }
      });
      await sound.playAsync();
    } catch (err) {
      console.warn("[SANKALP_ACTIVATE] OM audio failed:", err);
      setTimeout(() => {
        sankalpSpinLoopRef.current?.stop();
        sankalpSpin.setValue(0);
        setIsSankalpActivating(false);
        triggerCompletion();
      }, 4200);
    }
  };

  const triggerCompletion = () => {
    if (isCompletingRef.current) return;
    isCompletingRef.current = true;

    const durationSeconds = Math.round((Date.now() - sessionStartTime) / 1000);

    // Update session stats
    updateScreenData(
      "runner_reps_completed",
      currentType === "mantra" ? chantCount : 1,
    );
    updateScreenData("runner_duration_actual_sec", durationSeconds);
    updateScreenData("reps_done", currentType === "mantra" ? chantCount : 1);
    updateScreenData("chant_duration", durationSeconds);

    const completeAction = {
      type: "complete_runner",
      target: {
        container_id: "practice_runner",
        state_id: "completion_return",
      },
    };

    executeAction(completeAction, {
      loadScreen,
      goBack,
      setScreenValue: (val: any, k: string) => updateScreenData(k, val),
      screenState: { ...screenData },
    });
  };

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
      console.warn("[PRACTICE_TIMER] calm music failed, falling back:", err);
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../../assets/sounds/Audio-calmmusic.mp3"),
          {
            shouldPlay: false,
            isLooping: true,
            volume: 0.15,
          },
        );
        await sound.playAsync();
        calmMusicRef.current = sound;
      } catch (fallbackErr) {
        console.warn(
          "[PRACTICE_TIMER] calm music fallback failed:",
          fallbackErr,
        );
      }
    }
  };

  const stopPracticeTimer = async () => {
    if (practiceTimerRef.current) {
      clearInterval(practiceTimerRef.current);
      practiceTimerRef.current = null;
    }
    setIsPracticeTimerRunning(false);
    await stopCalmMusic();
  };

  const startPracticeTimer = async () => {
    if (isPracticeTimerRunning) return;

    const totalSeconds = Math.max(60, Math.round(selectedPracticeMinutes * 60));
    setPracticeInitialSeconds(totalSeconds);
    setPracticeTimeLeft(totalSeconds);
    setSessionStartTime(Date.now());
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
          if (practiceTimerRef.current) {
            clearInterval(practiceTimerRef.current);
            practiceTimerRef.current = null;
          }
          setIsPracticeTimerRunning(false);
          stopCalmMusic().catch(() => {});
          triggerCompletion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetPracticeTimer = async () => {
    await stopPracticeTimer();
    const totalSeconds = Math.max(60, Math.round(selectedPracticeMinutes * 60));
    setPracticeInitialSeconds(totalSeconds);
    setPracticeTimeLeft(totalSeconds);
  };

  const updatePracticeMinutes = (value: number) => {
    const mins = clampPracticeMinutes(value);
    setSelectedPracticeMinutes(mins);
    setPracticeTimeLeft(mins * 60);
    setPracticeInitialSeconds(mins * 60);
  };

  // Reanimated values for Mala
  const rotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  const info = useMemo(
    () => screenData?.info || screenData?.runner_active_item || {},
    [screenData],
  );
  const stateId = currentStateId || "";

  const currentType: ActivityType = useMemo(() => {
    const rawType = (info?.type || info?.item_type || "").toLowerCase();

    // 1. Check direct info type
    if (rawType === "mantra") return "mantra";
    if (rawType === "sankalp" || rawType === "sankalpa") return "sankalp";
    if (rawType === "practice") return "practice";

    // 2. Check screenData flags & variants
    if (
      screenData?.info_is_mantra ||
      screenData?.runner_variant === "mantra" ||
      screenData?.runner_active_item?.type === "mantra" ||
      screenData?.runner_active_item?.item_type === "mantra"
    )
      return "mantra";
    if (
      screenData?.info_is_sankalp ||
      screenData?.runner_variant === "sankalp" ||
      screenData?.runner_active_item?.type === "sankalp" ||
      screenData?.runner_active_item?.item_type === "sankalp"
    )
      return "sankalp";
    if (
      screenData?.info_is_practice ||
      screenData?.runner_variant === "practice" ||
      screenData?.runner_active_item?.type === "practice" ||
      screenData?.runner_active_item?.item_type === "practice"
    )
      return "practice";

    return null;
  }, [screenData, info]);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 40000,
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
  }, [rotation, pulseScale]);

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedCenterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const visualBeadsCount = Math.min(selectedTarget, MAX_VISUAL_BEADS);

  const beads = useMemo(() => {
    const arr = [];
    const count = visualBeadsCount;
    const radius = 72; // Reduced from 90 to make mala smaller
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      arr.push({
        x: Math.cos(angle) * (radius + 8),
        y: Math.sin(angle) * (radius + 8),
        index: i,
      });
    }
    return arr;
  }, [visualBeadsCount]);

  const isBeadTapped = (index: number) => {
    if (selectedTarget > MAX_VISUAL_BEADS) {
      const progressInCycle = chantCount % visualBeadsCount;
      return index < progressInCycle;
    }
    return index < chantCount;
  };

  const isBeadActive = (index: number) => {
    if (selectedTarget > MAX_VISUAL_BEADS) {
      return index === chantCount % visualBeadsCount;
    }
    return index === chantCount;
  };

  const handleIncrement = () => {
    if (chantCount >= selectedTarget || isCompletingRef.current) return;

    setChantCount((prev) => {
      const nextCount = prev + 1;

      if (nextCount >= selectedTarget && !isCompletingRef.current) {
        isCompletingRef.current = true;
        // Handle completion
        const durationSeconds = Math.round(
          (Date.now() - sessionStartTime) / 1000,
        );

        // 1. Update engagement fields for completion tracking
        updateScreenData("runner_reps_completed", nextCount);
        updateScreenData("runner_duration_actual_sec", durationSeconds);
        updateScreenData("reps_done", nextCount);
        updateScreenData("chant_duration", durationSeconds);

        // 2. Use the standard complete_runner action
        const completeAction = {
          type: "complete_runner",
          target: {
            container_id: "practice_runner",
            state_id: "completion_return",
          },
        };

        setTimeout(() => {
          executeAction(completeAction, {
            loadScreen,
            goBack,
            setScreenValue: (val: any, k: string) => updateScreenData(k, val),
            screenState: { ...screenData },
          });
        }, 800);
      }
      return nextCount;
    });
  };

  React.useEffect(() => {
    updateBackground(require("../../assets/beige_bg.png"));
    updateHeaderHidden(false);

    // Initialize runner fields for merged info flows so complete_runner can
    // attribute completions correctly even when we stay inside this container.
    if (!screenData?.runner_source) {
      updateScreenData(
        "runner_source",
        screenData?.runner_active_item?.source || "core",
      );
    }
    if (!screenData?.runner_variant) {
      if (currentType === "mantra") {
        updateScreenData("runner_variant", "mantra");
      } else if (currentType === "sankalp") {
        updateScreenData("runner_variant", "sankalp");
      } else if (currentType === "practice") {
        updateScreenData("runner_variant", "practice");
      }
    }

    return () => {
      updateBackground(null);
    };
  }, [updateBackground, updateHeaderHidden, currentType, screenData]);

  React.useEffect(() => {
    return () => {
      if (practiceTimerRef.current) {
        clearInterval(practiceTimerRef.current);
        practiceTimerRef.current = null;
      }
      stopCalmMusic().catch(() => {});
      sankalpSpinLoopRef.current?.stop();
      sankalpSpin.setValue(0);
      if (sankalpOmRef.current) {
        sankalpOmRef.current.unloadAsync().catch(() => {});
        sankalpOmRef.current = null;
      }
    };
  }, [sankalpSpin]);

  React.useEffect(() => {
    const seconds = Number(screenData.practice_duration_seconds);
    if (seconds > 0) {
      const mins = Math.max(1, Math.round(seconds / 60));
      setSelectedPracticeMinutes(mins);
      setPracticeTimeLeft(seconds);
      setPracticeInitialSeconds(seconds);
      return;
    }

    const rawDuration =
      info.duration_min ??
      info.duration ??
      screenData.runner_active_item?.duration_min ??
      screenData.runner_active_item?.duration;
    let mins = 3;

    if (typeof rawDuration === "number" && rawDuration > 0) {
      mins = Math.max(1, Math.round(rawDuration));
    } else if (typeof rawDuration === "string") {
      const matched = rawDuration.match(/(\d+(?:\.\d+)?)/);
      if (matched) mins = Math.max(1, Math.round(Number(matched[1])));
    }

    setSelectedPracticeMinutes(mins);
    setPracticeTimeLeft(mins * 60);
    setPracticeInitialSeconds(mins * 60);
  }, [
    info,
    screenData.practice_duration_seconds,
    screenData.runner_active_item,
  ]);

  const isInfoScreen = useMemo(
    () =>
      (stateId === "info_reveal" ||
        stateId === "offering_reveal" ||
        stateId === "view_info" ||
        stateId === "daily_insight") &&
      currentType !== null,
    [stateId, currentType],
  );

  // Core mantra audio auto-play is handled by MantraRunnerDisplay's
  // embedded AudioPlayerBlock (unhidden 2026-04-18). The block provides
  // auto-play after 2s + visible play/pause + mute + progress slider —
  // the full legacy mantra-runner control set. No container-level
  // audio load needed here.

  const isAckScreen = stateId === "quick_checkin_ack";
  const showVoiceInput =
    stateId === "quick_checkin" || stateId === "quick_checkin_ack";

  const blocks = schema?.blocks || [];
  const footerBlocks = useMemo(
    () =>
      blocks.filter(
        (b: any) => b.position === "footer" || b.position === "footer_actions",
      ),
    [blocks],
  );
  const visibleFooterBlocks = useMemo(
    () =>
      footerBlocks.filter((block: any) => {
        if (block.hide_condition) {
          const hideVal = screenData?.[block.hide_condition];
          if (hideVal === true || (hideVal && hideVal !== false)) return false;
        }

        if (block.visibility_condition) {
          const value = screenData?.[block.visibility_condition];
          const isVisible = Array.isArray(value)
            ? value.length > 0
            : typeof value === "boolean"
              ? value
              : !!value;
          if (!isVisible) return false;
        }

        const resolvedBlock = interpolate(block, screenData);
        const hasRenderableContent =
          hasContent(resolvedBlock.content) ||
          hasContent(resolvedBlock.label) ||
          hasContent(resolvedBlock.subtext) ||
          !!resolvedBlock.action;

        if (
          (resolvedBlock.type === "subtext" ||
            resolvedBlock.type === "primary_button") &&
          !hasRenderableContent
        ) {
          return false;
        }

        // Duplicate-prevention: the info_reveal template already renders
        // the "Chant slowly..." / "Carry this intention..." / practice
        // start help hint as a dedicated practicePrompt Text below the
        // lotus. Filter out those subtexts from the footer list so we
        // don't render them twice.
        if (resolvedBlock.type === "subtext") {
          const content = String(resolvedBlock.content || "").toLowerCase();
          if (
            content.includes("chant slowly and let the meaning settle") ||
            content.includes("carry this intention gently") ||
            content.includes("begin when you feel ready")
          ) {
            return false;
          }
        }

        return true;
      }),
    [footerBlocks, screenData],
  );

  const handleBack = () => {
    const target = screenData.info_back_target;
    if (target) {
      loadScreen({
        container_id: target.container_id || target.id,
        state_id: target.state_id || target.id,
      });
    } else {
      loadScreen({
        container_id: "companion_dashboard",
        state_id: "day_active",
      });
    }
  };
  if (isInfoScreen) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.infoScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Package for Mantra combined flow */}
          {currentType === "mantra" && (
            <View style={styles.combinedMantraFlow}>
              {/* Top Mantra Cards */}
              <Text style={[styles.mantraTitle, { marginBottom: 12 }]}>
                {info.title}
              </Text>

              {/* Progress Count */}
              <View style={styles.progressCounter}>
                <Text style={styles.currentCountText}>{chantCount}</Text>
                <Text style={styles.totalCountText}> / {selectedTarget}</Text>
              </View>

              {/* Mala beads interaction area */}
              <View style={styles.interactionArea}>
                {/* Glow Background Layer */}
                <View style={styles.glowOuter}>
                  <View style={styles.glowMiddle}>
                    <View style={styles.glowInner} />
                  </View>
                </View>

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
                          onPress={handleIncrement}
                          disabled={tapped}
                          style={styles.beadInner}
                          activeOpacity={1}
                        >
                          <RudrakshSvg width={30} height={30} />
                          {active && <View style={styles.beadPointer} />}
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </Animated.View>

                <Animated.View
                  style={[styles.centerTapTarget, animatedCenterStyle]}
                >
                  <TouchableOpacity
                    style={styles.tapTouchable}
                    onPress={handleIncrement}
                    activeOpacity={0.8}
                  >
                    <View style={styles.tapContent}>
                      <Text style={styles.tapText}>TAP</Text>
                      <Text style={styles.subTap}>HERE</Text>
                      <View style={styles.tapCheck}>
                        <Svg
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill="none"
                        >
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
              <View style={styles.topCardsRow}>
                {info.iast && (
                  <MantraTextCard
                    text={info.iast}
                    expanded={iastExpanded}
                    onToggle={() => setIastExpanded(!iastExpanded)}
                  />
                )}
                {info.devanagari && (
                  <MantraTextCard
                    text={info.devanagari}
                    isDevanagari
                    expanded={devanagariExpanded}
                    onToggle={() => setDevanagariExpanded(!devanagariExpanded)}
                  />
                )}
              </View>
              {/* <Text style={styles.combinedHelpText}>
                Choose your chant count and tap the bead after each mantra.
              </Text> */}
              {/* Rep Selection Pills */}
              <View style={styles.repPillsContainer}>
                {[1, 9, 27, 54, 108].map((option) => {
                  const isSelected = option === selectedTarget;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.repPill,
                        isSelected && styles.repPillSelected,
                      ]}
                      onPress={() => {
                        setSelectedTarget(option);
                        setChantCount(0); // Reset count when target changes
                      }}
                    >
                      <Text
                        style={[
                          styles.repPillText,
                          isSelected && styles.repPillTextSelected,
                        ]}
                      >
                        {option} {isSelected && " \u2713"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Audio Player — show whenever an audio URL is present
                  regardless of source. Earlier gate required source ∈
                  {"core","additional"} but view_info doesn't always set
                  a source tag (e.g. when masterData path runs without
                  the manualData branch). Falling back to master_mantra
                  URL keeps the player visible on the core mantra
                  runner even if runner_active_item.audio_url is empty. */}
              {(() => {
                const audioUrl =
                  info?.audio_url ||
                  screenData?.mantra_audio_url ||
                  screenData?.master_mantra?.audio_url ||
                  "";
                console.log(
                  "[CORE_MANTRA_AUDIO] cycle_transitions gate —",
                  "audioUrl:", audioUrl,
                  "info.audio_url:", info?.audio_url,
                  "info.source:", info?.source,
                  "info.item_type:", info?.item_type,
                  "master_mantra.audio_url:", screenData?.master_mantra?.audio_url,
                );
                if (!audioUrl) return null;
                return (
                  <View
                    style={{
                      width: "100%",
                      marginBottom: 30,
                      paddingHorizontal: 10,
                    }}
                  >
                    <AudioPlayerBlock
                      block={{
                        audio_url: audioUrl,
                        label: info?.title || "Mantra Audio",
                      }}
                    />
                  </View>
                );
              })()}

              {/* Consolidated Meaning/Essence Section */}
              <View style={styles.collapsibleSectionsCombined}>
                {hasContent(info.meaning) || hasContent(info.summary) ? (
                  <CollapsibleCard
                    label="Meaning"
                    expanded={meaningExpanded}
                    onToggle={() => setMeaningExpanded(!meaningExpanded)}
                  >
                    <Text style={styles.cardText}>
                      {info.meaning || info.summary}
                    </Text>
                  </CollapsibleCard>
                ) : null}

                <View style={{ height: 12 }} />

                {hasContent(info.essence) || hasContent(info.insight) ? (
                  <CollapsibleCard
                    label="Essence"
                    expanded={essenceExpanded}
                    onToggle={() => setEssenceExpanded(!essenceExpanded)}
                  >
                    <Text style={styles.cardText}>{info.essence}</Text>
                  </CollapsibleCard>
                ) : null}
              </View>

              <TouchableOpacity onPress={handleBack} style={styles.backLink}>
                <Text style={styles.backLinkText}>Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Sankalp Integrated Flow */}
          {currentType === "sankalp" && (
            <View style={styles.combinedSankalpFlow}>
              <View style={styles.mantraInfoCard}>
                <Text style={styles.deityTitle}>
                  {info.title || "Intention"}
                </Text>
                <Text style={styles.sankalpMainTextInline}>
                  {interpolate(
                    info.line ||
                      info.subtitle ||
                      info.iast ||
                      info.meaning ||
                      info.summary,
                    { ...screenData, ...info },
                  )}
                </Text>
              </View>

              <View style={[styles.mainCard]}>
                <SectionHeader label="How To Live" />
                <View style={{ marginTop: 12 }}>
                  {Array.isArray(info.how_to_live) ? (
                    <View style={styles.howToLiveList}>
                      {info.how_to_live.map((line: string, index: number) => (
                        <Text
                          key={`${line}-${index}`}
                          style={styles.howToLiveText}
                        >
                          {line}
                        </Text>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.howToLiveText}>
                      {info.how_to_live ||
                        "Stay mindful and carry this intention with every breath."}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.embodySection}>
                <Text style={styles.embodyInstr}>
                  {isSankalpActivating
                    ? "Let the vibration settle within..."
                    : "Tap to embody your intention"}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={runSankalpActivation}
                  disabled={isSankalpActivating}
                  style={styles.holdTarget}
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
                    <Image source={NamasteIcon} style={styles.embodyImg} />
                  </RNAnimated.View>
                </TouchableOpacity>

                {/* 
                <TouchableOpacity
                  onPress={handleBack}
                  style={{ marginTop: 24 }}
                >
                  <Text style={styles.returnLink}>Return to Mitra Home</Text>
                </TouchableOpacity> */}
              </View>

              {/* Collapsible Sections for Sankalp */}
              <View
                style={[styles.collapsibleSectionsCombined, { marginTop: -70 }]}
              >
                {hasContent(info.meaning) || hasContent(info.summary) ? (
                  <CollapsibleCard
                    label="Meaning"
                    expanded={meaningExpanded}
                    onToggle={() => setMeaningExpanded(!meaningExpanded)}
                  >
                    <Text style={styles.cardText}>{info.insight}</Text>
                  </CollapsibleCard>
                ) : null}
                <View style={{ height: 12 }} />
                <CollapsibleCard
                  label="Benefits"
                  expanded={benefitsExpanded}
                  onToggle={() => setBenefitsExpanded(!benefitsExpanded)}
                >
                  {Array.isArray(info.benefits) ? (
                    <View style={styles.benefitList}>
                      {info.benefits.map((b: string, idx: number) => (
                        <Text key={idx} style={styles.benefitItem}>
                          {"\u2022"} {b}
                        </Text>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.cardText}>{info.benefits}</Text>
                  )}
                </CollapsibleCard>
              </View>
            </View>
          )}

          {/* Practice Flow (Legacy for non-sankalp/non-mantra) */}
          {currentType === "practice" && (
            <View style={styles.visualContainer}>
              {/* {typeof MantraLotus3d === "number" ? (
                <SvgUri
                  uri={Image.resolveAssetSource(MantraLotus3d)?.uri ?? null}
                  width={180}
                  height={180}
                />
              ) : (
                <MantraLotus3d width={180} height={180} /> */}
              {/* )
              } */}
              <View style={styles.mantraMainContainer}>
                <Text style={[styles.deityTitle, { textAlign: "center" }]}>
                  {info.title}
                </Text>
                {(info.subtitle || info.line) && (
                  <Text
                    style={[
                      styles.sankalpMainText,
                      { fontSize: 18, marginTop: 8, textAlign: "center" },
                    ]}
                  >
                    {interpolate(info.subtitle || info.line, {
                      ...screenData,
                      ...info,
                    })}
                  </Text>
                )}
              </View>

              <View style={styles.mainCard}>
                {info.steps && info.steps.length > 0 && (
                  <>
                    <SectionHeader label="What this practice asks of you" />
                    <View style={styles.practiceStepsList}>
                      {info.steps.map((step: string, i: number) => (
                        <View key={i} style={styles.practiceStep}>
                          <Text style={styles.stepNum}>{i + 1}.</Text>
                          <Text style={styles.stepText}>{step}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </View>
              <View
                style={[
                  styles.practiceTimerCard,
                  info.steps && info.steps.length > 0 && { marginTop: 24 },
                ]}
              >
                {!isPracticeTimerRunning ? (
                  <>
                    <Text style={styles.practiceTimerHeading}>
                      How long will you pause?
                    </Text>
                    <Text style={styles.practiceTimerValue}>
                      {selectedPracticeMinutes} min
                    </Text>
                    <View style={styles.practiceSliderRow}>
                      <TouchableOpacity
                        style={styles.practiceAdjustButton}
                        onPress={() =>
                          updatePracticeMinutes(selectedPracticeMinutes - 1)
                        }
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
                        onPress={() =>
                          updatePracticeMinutes(selectedPracticeMinutes + 1)
                        }
                        activeOpacity={0.8}
                      >
                        <Plus size={18} color="#8A5A12" />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.practiceTimerScale}>
                      <Text style={styles.practiceTimerScaleLabel}>1 min</Text>
                      <Text style={styles.practiceTimerScaleHint}>
                        Drag to adjust
                      </Text>
                      <Text style={styles.practiceTimerScaleLabel}>10 min</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.practicePrimaryButton}
                      onPress={startPracticeTimer}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.practicePrimaryButtonText}>
                        Begin
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={styles.practiceTimerVisual}>
                      <Svg width={260} height={260} viewBox="0 0 260 260">
                        <Circle
                          cx="130"
                          cy="130"
                          r="108"
                          stroke="rgba(212,160,23,0.2)"
                          strokeWidth="12"
                          fill="none"
                        />
                        <Circle
                          cx="130"
                          cy="130"
                          r="108"
                          stroke="#D4A017"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 108}`}
                          strokeDashoffset={
                            2 *
                            Math.PI *
                            108 *
                            (1 - practiceTimeLeft / practiceInitialSeconds)
                          }
                          strokeLinecap="round"
                          transform="rotate(-90 130 130)"
                        />
                      </Svg>
                      <View style={styles.practiceTimerCenter}>
                        <Text style={styles.practiceTimerClock}>
                          {formatTimer(practiceTimeLeft)}
                        </Text>
                        <Text style={styles.practiceTimerSubtext}>
                          Return to the moment
                        </Text>
                        <TouchableOpacity
                          style={styles.practiceResetIconButton}
                          onPress={() => resetPracticeTimer().catch(() => {})}
                          activeOpacity={0.75}
                        >
                          <RefreshCw size={18} color="#8A7A5A" />
                        </TouchableOpacity>
                        {typeof MantraLotus3d === "number" ? (
                          <SvgUri
                            uri={
                              Image.resolveAssetSource(MantraLotus3d)?.uri ??
                              null
                            }
                            width={110}
                            height={80}
                          />
                        ) : (
                          <MantraLotus3d
                            width={110}
                            height={80}
                            style={{ marginBottom: -60 }}
                          />
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.practicePrimaryButton}
                      onPress={() => {
                        stopPracticeTimer().catch(() => {});
                        handleBack();
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.practicePrimaryButtonText}>
                        End Practice
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.practiceResetButton}
                      onPress={() => resetPracticeTimer().catch(() => {})}
                      activeOpacity={0.75}
                    >
                      {/* <Text style={styles.practiceResetButtonText}>
                          Reset Timer
                        </Text> */}
                    </TouchableOpacity>
                  </>
                )}
              </View>
              {hasContent(info.summary) && (
                <>
                  {hasContent(info.summary) && <View style={{ height: 18 }} />}
                  <CollapsibleCard
                    label="Meaning"
                    expanded={meaningExpanded}
                    onToggle={() => setMeaningExpanded(!meaningExpanded)}
                  >
                    <Text style={styles.cardText}>{info.summary}</Text>
                  </CollapsibleCard>
                </>
              )}

              {hasContent(info.benefits) && (
                <>
                  {info.steps && info.steps.length > 0 && (
                    <View style={{ height: 18 }} />
                  )}
                  <CollapsibleCard
                    label="Benefits"
                    expanded={benefitsExpanded}
                    onToggle={() => setBenefitsExpanded(!benefitsExpanded)}
                  >
                    {Array.isArray(info.benefits) ? (
                      <View style={styles.benefitList}>
                        {info.benefits.map((b: string, idx: number) => (
                          <Text key={idx} style={styles.benefitItem}>
                            {"\u2022"} {b}
                          </Text>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.cardText}>{info.benefits}</Text>
                    )}
                  </CollapsibleCard>
                </>
              )}

              {hasContent(info.essence || info.insight) && (
                <>
                  {(hasContent(info.steps) || hasContent(info.benefits)) && (
                    <View style={{ height: 18 }} />
                  )}
                  <CollapsibleCard
                    label="Why this works"
                    expanded={essenceExpanded}
                    onToggle={() => setEssenceExpanded(!essenceExpanded)}
                  >
                    <Text style={styles.cardText}>
                      {info.essence || info.insight}
                    </Text>
                  </CollapsibleCard>
                </>
              )}

              <TouchableOpacity
                onPress={handleBack}
                style={[styles.backLink, { marginTop: 20 }]}
              >
                <Text style={styles.backLinkText}>Return to Mitra Home</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentType !== "mantra" && currentType !== "practice" && (
            <TouchableOpacity onPress={handleBack} style={styles.backLink}>
              <Text style={styles.backLinkText}>Return to Mitra Home</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  }

  if (isAckScreen) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.ackScrollContent,
            showVoiceInput && styles.scrollContentWithVoiceInput,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.visualContainer}>
            {typeof MantraLotus3d === "number" ? (
              <SvgUri
                uri={Image.resolveAssetSource(MantraLotus3d)?.uri ?? null}
                width={200}
                height={200}
              />
            ) : (
              <MantraLotus3d width={200} height={200} />
            )}
          </View>

          <View style={styles.ackContent}>
            <Text style={styles.ackHeadline}>
              {screenData.checkin_ack_headline}
            </Text>

            <Text style={styles.ackBody}>{screenData.checkin_ack_body}</Text>

            {screenData.checkin_ack_accent ? (
              <Text style={styles.ackAccent}>
                {screenData.checkin_ack_accent}
              </Text>
            ) : null}
          </View>

          {visibleFooterBlocks.length > 0 && (
            <View style={styles.ackActions}>
              {visibleFooterBlocks.map((block: any, i: number) => (
                <BlockRenderer key={`ack-f-${i}`} block={block} />
              ))}
            </View>
          )}
        </ScrollView>

        {showVoiceInput && (
          <View style={styles.fixedInputArea}>
            <VoiceTextInput
              onSend={(text, type) => {
                executeAction(
                  {
                    type: "dashboard_query",
                    payload: { text, response_type: type },
                  },
                  { screenState: screenData },
                );
              }}
            />
          </View>
        )}
      </View>
    );
  }

  // Generic Transition Mode
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          showVoiceInput && styles.scrollContentWithVoiceInput,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {blocks.map((block: any, i: number) => (
            <BlockRenderer key={`c-${i}`} block={block} />
          ))}
        </View>
      </ScrollView>

      {showVoiceInput && (
        <View style={styles.fixedInputArea}>
          <VoiceTextInput
            onSend={(text, type) => {
              executeAction(
                {
                  type: "dashboard_query",
                  payload: { text, response_type: type },
                },
                { screenState: screenData },
              );
            }}
          />
        </View>
      )}
    </View>
  );
};

const GOLD = "#D4A017";
const BROWN = "#432104";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scroll: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  infoScrollContent: {
    paddingHorizontal: 20,
    // paddingTop: 200,
    paddingBottom: 60,
    alignItems: "center",
  },
  ackScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    // paddingTop: 80,
    // paddingBottom: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContentWithVoiceInput: {
    paddingBottom: 140,
  },
  visualContainer: {
    alignItems: "center",
    // marginBottom: 20,
    marginTop: 50,
  },
  deityTitle: {
    fontSize: 26,
    fontFamily: Fonts.serif.bold,
    color: BROWN,
    textAlign: "center",
    marginTop: -40,
  },
  mantraTitle: {
    fontSize: 23,
    fontFamily: Fonts.serif.bold,
    color: BROWN,
    textAlign: "center",
    marginTop: -20,
  },
  mainCard: {
    width: "100%",
    // backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E8C587",
    padding: 20,
    marginBottom: 10,
    marginTop: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E8C587",
    opacity: 0.6,
  },
  dividerLineThin: {
    width: 20,
    height: 1,
    backgroundColor: "#E8C587",
    opacity: 0.6,
  },
  cardLabel: {
    fontSize: 18,
    fontFamily: Fonts.serif.bold,
    color: BROWN,
    marginHorizontal: 12,
  },
  cardLabelSmall: {
    fontSize: 18,
    fontFamily: Fonts.serif.bold,
    color: BROWN,
    marginHorizontal: 10,
  },
  headerLabelGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleIcon: {
    fontSize: 12,
    color: GOLD,
    display: "flex",
    alignItems: "center",
    alignSelf: "center",

    // marginLeft: 4,
  },
  collapsibleSections: {
    width: "100%",
    gap: 12,
    marginBottom: 30,
  },
  card: {
    width: "100%",

    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(184, 148, 80, 0.1)",
    padding: 15,
  },
  verseTextGroup: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(184, 148, 80, 0.1)",
    padding: 5,
  },
  verseTextGroupNoArrow: {
    padding: 15,
  },
  verseMeasureText: {
    position: "absolute",
    opacity: 0,
    zIndex: -1,
    left: 5,
    right: 5,
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
    fontSize: 15,
    // lineHeight: 26,
    color: "#615247",
    textAlign: "center",
  },
  expandArrowWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    opacity: 0.6,
  },
  cardExpanded: {
    // backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  cardContent: {
    marginTop: 12,
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#5a3c21",
    fontFamily: Fonts.serif.regular,
    textAlign: "center",
  },
  practiceStepsList: {
    marginTop: 16,
    gap: 12,
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
    fontSize: 20,
    lineHeight: 30,
    color: BROWN,
    fontFamily: Fonts.serif.bold,
    textAlign: "center",
  },
  practiceTimerValue: {
    fontSize: 18,
    color: BROWN,
    fontFamily: Fonts.sans.semiBold,
    marginTop: 18,
    marginBottom: 12,
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
  practiceSliderRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    fontSize: 13,
    color: "#6a4d28",
    fontFamily: Fonts.sans.medium,
  },
  practiceTimerScaleHint: {
    fontSize: 12,
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
    fontSize: 18,
    color: "#432104",
    fontFamily: Fonts.serif.bold,
  },
  practiceResetButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  practiceResetButtonText: {
    fontSize: 15,
    color: "#7B6A55",
    fontFamily: Fonts.sans.medium,
    textDecorationLine: "underline",
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
    fontSize: 54,
    lineHeight: 60,
    color: BROWN,
    fontFamily: Fonts.serif.bold,
  },
  practiceTimerSubtext: {
    fontSize: 14,
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
  practiceStep: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepNum: {
    fontSize: 18,
    fontFamily: Fonts.serif.bold,
    color: BROWN,
    marginRight: 8,
    width: 24,
  },
  stepText: {
    flex: 1,
    fontSize: 17,
    lineHeight: 24,
    color: BROWN,
    fontFamily: Fonts.serif.regular,
  },
  howToLiveText: {
    fontSize: 18,
    fontFamily: Fonts.serif.regular,
    fontStyle: "italic",
    color: "#4A4A4A",
    lineHeight: 28,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  howToLiveList: {
    alignItems: "center",
    gap: 4,
  },
  sankalpMainText: {
    fontSize: 24,
    fontFamily: Fonts.serif.bold,
    color: "#432104",
    textAlign: "center",
    lineHeight: 34,
    marginTop: -30,
    paddingHorizontal: 5,
  },
  mantraMainContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 6,
    paddingHorizontal: 12,
  },
  mantraDevanagariLarge: {
    fontSize: 18,
    fontFamily: Fonts.serif.bold,
    color: "#432104",
    textAlign: "center",
    marginTop: 15,
    marginBottom: 4,
  },
  mantraIAST: {
    fontSize: 16,
    fontFamily: Fonts.serif.regular,
    fontStyle: "italic",
    color: "#6a4d28",
    textAlign: "center",
    marginTop: 2,
    marginBottom: 10,
  },
  mantraBrief: {
    fontSize: 16,
    fontFamily: Fonts.serif.regular,
    color: "#432104",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 10,
  },
  viewFullMantraBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "#E8C587",
    // backgroundColor: "rgba(255, 255, 255, 0.5)",
    shadowColor: "#d7a64a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  viewFullMantraText: {
    fontSize: 15,
    fontFamily: Fonts.serif.bold,
    color: "#432104",
  },
  deityMetadata: {
    fontSize: 18,
    fontFamily: Fonts.serif.regular,
    color: "#432104",
    textAlign: "center",
    // marginTop: 24,
    marginBottom: 10,
  },
  practicePrompt: {
    fontSize: 16,
    fontFamily: Fonts.serif.regular,
    fontStyle: "italic",
    color: "#432104",
    textAlign: "center",
    marginTop: -20,
    marginBottom: 10,
    lineHeight: 24,
    paddingHorizontal: 30,
  },
  infoActions: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  benefitList: {
    gap: 4,
  },
  benefitItem: {
    fontSize: 16,
    lineHeight: 24,
    color: "#5a3c21",
    fontFamily: Fonts.serif.regular,
  },
  backLink: {
    // marginTop: 2,
    paddingVertical: 1,
  },
  backLinkText: {
    fontSize: 16,
    fontFamily: Fonts.serif.regular,
    color: BROWN,
    textDecorationLine: "underline",
  },
  ackContent: {
    alignItems: "center",
    // marginBottom: 40,
  },
  ackHeadline: {
    fontSize: 28,
    fontFamily: Fonts.serif.bold,
    color: BROWN,
    textAlign: "center",
    lineHeight: 38,
    marginBottom: 24,
  },
  ackBody: {
    fontSize: 18,
    lineHeight: 28,
    color: "#5C5648",
    fontFamily: Fonts.serif.regular,
    textAlign: "center",
    marginBottom: 24,
  },
  ackAccent: {
    fontSize: 17,
    fontFamily: Fonts.serif.bold,
    fontStyle: "italic",
    color: GOLD,
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  ackActions: {
    width: "100%",
    alignItems: "center",
    // marginTop: "auto",
  },
  fixedInputArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -20,
    padding: 5,
    backgroundColor: "#fef8f5",
  },
  content: {
    gap: 20,
  },
  combinedMantraFlow: {
    width: "100%",
    alignItems: "center",
    paddingTop: 40,
  },
  topCardsRow: {
    width: "100%",
    marginTop: 20,
    marginBottom: 0,
    gap: 12,
  },
  combinedHelpText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#5a4a2a",
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
    lineHeight: 26,
    opacity: 0.8,
  },
  progressCounter: {
    flexDirection: "row",
    alignItems: "baseline",
    // marginBottom: 0,
    marginTop: -20,
  },
  currentCountText: {
    fontSize: 64,
    fontFamily: Fonts.serif.regular,
    color: "#b89450",
  },
  totalCountText: {
    fontSize: 32,
    fontFamily: Fonts.serif.regular,
    color: "#d1c1a1",
  },
  interactionArea: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  glowOuter: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    alignItems: "center",
    justifyContent: "center",
  },
  glowMiddle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    shadowColor: "#E8C587",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  glowInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#E8C587",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 8,
  },
  beadsRing: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  ringCircle: {
    position: "absolute",
    width: 144,
    height: 144,
  },
  beadWrapper: {
    position: "absolute",
    width: 30,
    height: 30,
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
    top: -2,
    width: 6,
    height: 6,
    backgroundColor: "#b89450",
    borderRadius: 3,
  },
  centerTapTarget: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fffdf9",
    borderWidth: 1,
    borderColor: "#e8c587",
    elevation: 4,
    shadowColor: "#b89450",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
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
    fontSize: 20,
    letterSpacing: 4,
    fontFamily: Fonts.sans.bold,
    color: "#b89450",
  },
  subTap: {
    fontSize: 10,
    letterSpacing: 1,
    color: "#8a7a5a",
    fontFamily: Fonts.sans.medium,
    marginTop: 2,
  },
  tapCheck: {
    marginTop: 5,
  },
  repPillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginTop: 20,
    paddingHorizontal: 5,
    marginBottom: 25,
  },
  repPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e8c587",
    backgroundColor: "transparent",
  },
  repPillSelected: {
    backgroundColor: "#b89450",
    borderColor: "#b89450",
  },
  repPillText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: "#8a7a5a",
  },
  repPillTextSelected: {
    color: "#fff",
  },
  repPillsLabel: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: "#8a7a5a",
    marginTop: 8,
    marginBottom: 30,
  },
  collapsibleSectionsCombined: {
    width: "100%",
    paddingHorizontal: 0,
    marginBottom: 40,
  },
  combinedSankalpFlow: {
    width: "100%",
    alignItems: "center",
    paddingTop: 50,
  },
  mantraInfoCard: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  sankalpMainTextInline: {
    fontSize: 16,
    fontFamily: Fonts.serif.regular,
    color: "#432104",
    textAlign: "center",
    // lineHeight: 38,
    // marginTop: 10,
    // paddingHorizontal: 12,
  },
  embodySection: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
  },
  embodyInstr: {
    fontSize: 16,
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
  namasteContainer: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  progressSvg: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  embodyImg: {
    marginTop: -40,
    width: 250,
    height: 250,
    resizeMode: "contain",
  },
  cardToggleContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 4,
  },
  sankalpActivatingText: {
    fontSize: 17,
    fontFamily: Fonts.serif.bold,
    fontStyle: "italic",
    color: "#B89450",
    marginTop: -20,
    textAlign: "center",
    marginBottom: 30,
  },
  returnLink: {
    fontSize: 15,
    fontFamily: Fonts.serif.regular,
    color: "#8a7a5a",
    textDecorationLine: "underline",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 12,
  },
  sectionLabel: {
    fontFamily: Fonts.serif.regular,
    fontSize: 14,
    color: "#B89450",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
});

export default CycleTransitionsContainer;

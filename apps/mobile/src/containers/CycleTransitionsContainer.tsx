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
import React, { useEffect, useMemo, useRef, useState } from "react";
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
const RudrakshSvg = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../assets/rudraksh.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
import AudioPlayerBlock from "../blocks/AudioPlayerBlock";
import CycleReflectionBlock from "../blocks/CycleReflectionBlock";
import { VoiceTextInput } from "../components/VoiceTextInput";
import { REMOTE_AUDIO_SOURCES } from "../config/audioAssets";
import BlockRenderer from "../engine/BlockRenderer";
import { executeAction } from "../engine/actionExecutor";
import { mitraAddAdditionalItem } from "../engine/mitraApi";
import { useScreenStore } from "../engine/useScreenBridge";
import { interpolate } from "../engine/utils/interpolation";
import { navigationRef } from "../Shared/Routes/NavigationService";
import { store } from "../store";
import { showSnackBar } from "../store/snackBarSlice";
import { Fonts } from "../theme/fonts";
import { stopRoomAmbientAudio } from "../engine/roomAmbientAudio";
import MantraRunnerView from "../blocks/runners/MantraRunnerView";
import SankalpRunnerView from "../blocks/runners/SankalpRunnerView";
import PracticeRunnerView from "../blocks/runners/PracticeRunnerView";
// Community runs use forked copies so community-specific tweaks never touch the
// shared core/rhythm/support runners (and vice-versa).
import CommunityMantraRunnerView from "../blocks/runners/CommunityMantraRunnerView";
import CommunitySankalpRunnerView from "../blocks/runners/CommunitySankalpRunnerView";
import CommunityPracticeRunnerView from "../blocks/runners/CommunityPracticeRunnerView";

// SVGs / Assets
import { SvgUri } from "react-native-svg";
const MantraLotus3d = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../assets/mantra-lotus-3d.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const NamasteIcon = require("../../assets/namaste.webp");

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

const normalizeComparableText = (val: any): string => {
  return String(val || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_VISUAL_BEADS = 18;
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

const CommunityRunnerActionBar: React.FC<{
  addLoading: boolean;
  onAdd: () => void;
}> = ({ addLoading, onAdd }) => (
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
        {addLoading ? "Adding..." : "Add to My Practice"}
      </Text>
    </TouchableOpacity>
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

export interface MantraTextCardProps {
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
  const dispatch = store.dispatch as any;
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
  // Runner beautification (PR5, 2026-04-19): Essence opens expanded on
  // first render so the info/runner surface feels authored rather than
  // cold. Applies to all three variants — on mantra, Essence is the
  // anchoring interpretation (info.essence); on sankalp, it's info.insight
  // (relabeled from Meaning in PR4); on practice, info.insight. User can
  // still collapse manually — no runtime data dependency on initial state.
  const [essenceExpanded, setEssenceExpanded] = useState(true);
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
  const [communityAddLoading, setCommunityAddLoading] = useState(false);

  const sankalpOmRef = useRef<Audio.Sound | null>(null);
  const calmMusicRef = useRef<Audio.Sound | null>(null);
  const sankalpSpin = useRef(new RNAnimated.Value(0)).current;
  const sankalpSpinLoopRef = useRef<RNAnimated.CompositeAnimation | null>(null);
  const practiceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isCompletingRef = useRef(false);

  // Reset the completion guard whenever start_runner fires a new session
  // (runner_start_time is set to Date.now() on each start_runner dispatch).
  // Without this, isCompletingRef stays true from a prior completion and
  // triggerCompletion() silently no-ops on sankalp/practice after mantra.
  const runnerStartTime = screenData?.runner_start_time;
  React.useEffect(() => {
    isCompletingRef.current = false;
  }, [runnerStartTime]);

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

    executeAction(
      { type: "complete_runner" },
      {
        loadScreen,
        goBack,
        setScreenValue: (val: any, k: string) => updateScreenData(k, val),
        screenState: { ...screenData },
      },
    );
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
      console.warn("[PRACTICE_TIMER] calm music failed:", err);
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
  const sankalpBodyText = useMemo(
    () =>
      interpolate(
        info.line || info.subtitle || info.iast || info.meaning || info.summary,
        { ...screenData, ...info },
      ),
    [info, screenData],
  );
  const shouldShowSankalpBody = useMemo(() => {
    if (!hasContent(sankalpBodyText)) return false;
    return (
      normalizeComparableText(sankalpBodyText) !==
      normalizeComparableText(info.title || "Intention")
    );
  }, [sankalpBodyText, info.title]);
  const stateId = currentStateId || "";
  const isCommunityRunner = screenData?.runner_source === "community";
  const activeRunnerItem = screenData?.runner_active_item || {};
  const activeRunnerItemId = String(
    activeRunnerItem.item_id ||
      activeRunnerItem.itemId ||
      activeRunnerItem.id ||
      "",
  );
  const activeRunnerType = String(
    screenData?.runner_variant ||
      activeRunnerItem.item_type ||
      activeRunnerItem.itemType ||
      activeRunnerItem.type ||
      "",
  );
  const activeAdditionalItemId = screenData?.runner_additional_item_id ?? null;

  const ensureCommunityAdditionalItem = async () => {
    if (!activeRunnerItemId || !activeRunnerType) return null;
    if (activeAdditionalItemId) {
      return { additionalItem: { id: activeAdditionalItemId }, created: false };
    }

    const res = await mitraAddAdditionalItem(
      activeRunnerItemId,
      activeRunnerType,
      "community",
    );
    const nextId = res?.additionalItem?.id ?? res?.additional_item?.id ?? null;
    if (nextId != null) {
      updateScreenData("runner_additional_item_id", nextId);
    }
    dispatch(
      showSnackBar(
        res?.created
          ? "Added to your Mitra practice."
          : "Already in your Mitra practice.",
      ),
    );
    return res;
  };

  const handleCommunityAdd = async () => {
    if (communityAddLoading) return;
    if (!activeRunnerItemId || !activeRunnerType) {
      dispatch(showSnackBar("Could not add this item right now."));
      return;
    }
    setCommunityAddLoading(true);
    try {
      await ensureCommunityAdditionalItem();
    } catch (_) {
      dispatch(showSnackBar("Could not add this item right now."));
    } finally {
      setCommunityAddLoading(false);
    }
  };

  // Stop room ambient calm music the moment a mantra audio screen appears.
  useEffect(() => {
    const hasMantraAudio =
      stateId === "offering_reveal" &&
      !!(
        screenData?.mantra_audio_url ||
        screenData?.master_mantra?.audio_url ||
        screenData?.runner_active_item?.audio_url
      );
    if (hasMantraAudio) {
      stopRoomAmbientAudio().catch(() => {});
    }
  }, [stateId, screenData]);

  const currentType: ActivityType = useMemo(() => {
    const rawType = (
      info?.type ||
      info?.item_type ||
      info?.itemType ||
      ""
    ).toLowerCase();

    // 1. Check direct info type
    if (rawType === "mantra") return "mantra";
    if (rawType === "sankalp" || rawType === "sankalpa") return "sankalp";
    if (rawType === "practice") return "practice";

    // 2. Check screenData flags & variants
    if (
      screenData?.info_is_mantra ||
      screenData?.runner_variant === "mantra" ||
      screenData?.runner_active_item?.type === "mantra" ||
      screenData?.runner_active_item?.item_type === "mantra" ||
      screenData?.runner_active_item?.itemType === "mantra"
    )
      return "mantra";
    if (
      screenData?.info_is_sankalp ||
      screenData?.runner_variant === "sankalp" ||
      screenData?.runner_active_item?.type === "sankalp" ||
      screenData?.runner_active_item?.item_type === "sankalp" ||
      screenData?.runner_active_item?.itemType === "sankalp"
    )
      return "sankalp";
    if (
      screenData?.info_is_practice ||
      screenData?.runner_variant === "practice" ||
      screenData?.runner_active_item?.type === "practice" ||
      screenData?.runner_active_item?.item_type === "practice" ||
      screenData?.runner_active_item?.itemType === "practice"
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
        setTimeout(() => {
          executeAction(
            { type: "complete_runner" },
            {
              loadScreen,
              goBack,
              setScreenValue: (val: any, k: string) => updateScreenData(k, val),
              screenState: { ...screenData },
            },
          );
        }, 800);
      }
      return nextCount;
    });
  };

  React.useEffect(() => {
    const isCheckpointReflectionState =
      stateId === "checkpoint_day_7" || stateId === "checkpoint_day_14";

    if (isCheckpointReflectionState) {
      // CycleReflectionBlock fully owns the background for checkpoint screens.
      // Do NOT call updateBackground here — the cleanup below also skips null-
      // clearing so that when screenData changes (e.g. handleDecision dispatches
      // checkpoint_decision / checkpoint_feeling), this effect re-runs but does
      // NOT wipe the BeigeBg that CycleReflectionBlock correctly set.
    } else {
      updateBackground(require("../../assets/beige_bg.webp"));
    }
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
      // Only clear the background if we set it. For checkpoint states we never
      // set it — CycleReflectionBlock owns it. Calling updateBackground(null)
      // here on every screenData re-run would wipe the child's BeigeBg and
      // expose the stale Day7Bg that was last set on the previous mount.
      if (!isCheckpointReflectionState) {
        updateBackground(null);
      }
      updateHeaderHidden(false);
    };
  }, [
    updateBackground,
    updateHeaderHidden,
    currentType,
    screenData,
    stateId,
    isCommunityRunner,
  ]);

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
  const isViewOnlyInfo = isInfoScreen && !!screenData?.info_view_only;

  // Core mantra audio auto-play is handled by MantraRunnerDisplay's
  // embedded AudioPlayerBlock (unhidden 2026-04-18). The block provides
  // auto-play after 2s + visible play/pause + mute + progress slider —
  // the full legacy mantra-runner control set. No container-level
  // audio load needed here.

  const isAckScreen = stateId === "quick_checkin_ack";
  const conversationalTierEnabled = false; // launch-gate: set true when chat/voice tier ships
  const showVoiceInput =
    conversationalTierEnabled &&
    (stateId === "quick_checkin" || stateId === "quick_checkin_ack");
  const isCheckpointReflectionState =
    stateId === "checkpoint_day_7" || stateId === "checkpoint_day_14";
  const blocks = useMemo(() => schema?.blocks || [], [schema?.blocks]);
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

  if (isCheckpointReflectionState) {
    return (
      <View style={styles.container}>
        <CycleReflectionBlock />
      </View>
    );
  }

  const handleRunnerComplete = (repsCompleted: number, durationSec: number) => {
    updateScreenData("runner_reps_completed", repsCompleted);
    updateScreenData("runner_duration_actual_sec", durationSec);
    updateScreenData("reps_done", repsCompleted);
    updateScreenData("chant_duration", durationSec);
    executeAction(
      { type: "complete_runner" },
      {
        loadScreen,
        goBack,
        setScreenValue: (val: any, k: string) => updateScreenData(k, val),
        screenState: { ...screenData },
      },
    );
  };

  const handleBack = () => {
    // Community runs return to the community feed they were launched from.
    if (isCommunityRunner) {
      if ((navigationRef as any).canGoBack?.()) {
        (navigationRef as any).goBack();
      } else {
        (navigationRef as any).navigate("CommunityLanding");
      }
      return;
    }
    const target = screenData.info_back_target;
    if (target) {
      loadScreen({
        container_id: target.container_id || target.id,
        state_id: target.state_id || target.id,
      });
    } else {
      const state = store.getState() as any;
      const hasActiveInnerPath =
        state?.door?.homeData?.inner_path_summary?.has_active_path === true;
      const isRhythmSurface =
        screenData.runner_source === "rhythm_daily" ||
        screenData.practice_launch_surface === "rhythm";

      if (isRhythmSurface && !hasActiveInnerPath) {
        (navigationRef as any).navigate("Home");
        return;
      }

      loadScreen({
        container_id: "companion_dashboard",
        state_id: "day_active",
      });
    }
  };
  // handleTestForceComplete removed — Phase 2/3 moved IP+Rhythm to dedicated runner
  // screens (each block carries its own dev hook). Support/community flows (19–22)
  // still use the test_runner_force_complete testID inside MantraRunnerView /
  // SankalpRunnerView / PracticeRunnerView blocks, which call onComplete → handleRunnerComplete.

  // Pick forked community runner views when this run came from community, so
  // community changes stay isolated from the shared runners.
  const MantraViewComp = isCommunityRunner
    ? CommunityMantraRunnerView
    : MantraRunnerView;
  const SankalpViewComp = isCommunityRunner
    ? CommunitySankalpRunnerView
    : SankalpRunnerView;
  const PracticeViewComp = isCommunityRunner
    ? CommunityPracticeRunnerView
    : PracticeRunnerView;

  if (isInfoScreen) {
    return (
      <View style={styles.container}>
        {currentType === "mantra" && (
          <MantraViewComp
            item={info}
            isViewOnly={isViewOnlyInfo}
            initialReps={Number(screenData.reps_total) || 27}
            runnerStartTimeKey={screenData.runner_start_time}
            onComplete={handleRunnerComplete}
            onBack={handleBack}
            isDevMode={__DEV__}
            isCommunityRunner={isCommunityRunner}
            addLoading={communityAddLoading}
            onAddToPractice={() => void handleCommunityAdd()}
            mantraRef={activeRunnerItemId || null}
            sourceSurface={
              screenData.runner_source === "rhythm_daily" ? "daily_rhythm" : "inner_path"
            }
          />
        )}
        {currentType === "sankalp" && (
          <SankalpViewComp
            item={info}
            isViewOnly={isViewOnlyInfo}
            runnerStartTimeKey={screenData.runner_start_time}
            onComplete={(dur) => handleRunnerComplete(1, dur)}
            onBack={handleBack}
            isDevMode={__DEV__}
            isCommunityRunner={isCommunityRunner}
            addLoading={communityAddLoading}
            onAddToPractice={() => void handleCommunityAdd()}
          />
        )}
        {currentType === "practice" && (
          <PracticeViewComp
            item={info}
            isViewOnly={isViewOnlyInfo}
            runnerStartTimeKey={screenData.runner_start_time}
            onComplete={(dur) => handleRunnerComplete(1, dur)}
            onBack={handleBack}
            isDevMode={__DEV__}
            isCommunityRunner={isCommunityRunner}
            addLoading={communityAddLoading}
            onAddToPractice={() => void handleCommunityAdd()}
          />
        )}
      </View>
    );
  }

  // Phase 1 dead code (original inlined JSX) removed in Phase 2/3. The MantraRunnerView /
  // SankalpRunnerView / PracticeRunnerView blocks now own all runner UI. IP+Rhythm entry
  // points navigate directly to named runner screens; CTC handles community/support only.

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
                  {
                    screenState: screenData,
                    loadScreen,
                    goBack,
                    setScreenValue: (val: any, k: string) =>
                      updateScreenData(k, val),
                  },
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
                {
                  screenState: screenData,
                  loadScreen,
                  goBack,
                  setScreenValue: (val: any, k: string) =>
                    updateScreenData(k, val),
                },
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
  // Mantra tradition eyebrow (deity/source) — small gold caps line below
  // the title. PR4 (2026-04-19).
  mantraTraditionLine: {
    fontSize: 11,
    letterSpacing: 1.3,
    fontFamily: Fonts.sans.medium,
    color: "#B89450",
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: -6,
  },
  // Practice duration eyebrow — small gold caps line below the practice
  // subtitle (info.duration). PR4 (2026-04-19).
  practiceDurationLine: {
    fontSize: 11,
    letterSpacing: 1.3,
    fontFamily: Fonts.sans.medium,
    color: "#B89450",
    textAlign: "center",
    marginTop: 10,
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
    fontSize: Platform.OS === "android" ? 42 : 46,
    lineHeight: Platform.OS === "android" ? 48 : 52,
    color: BROWN,
    fontFamily: Fonts.serif.bold,
  },
  practiceTimerSubtext: {
    fontSize: Platform.OS === "android" ? 13 : 14,
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
    fontFamily: Fonts.serif.regular,
    color: "#432104",
    textAlign: "center",
    // lineHeight: 34,
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
  communityActionBar: {
    width: "100%",
    // marginTop: 18,
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
    fontSize: 14,
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
    shadowColor: Platform.OS === "ios" ? "#E8C587" : "transparent",
    shadowOffset:
      Platform.OS === "ios" ? { width: 0, height: 0 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === "ios" ? 0.8 : 0,
    shadowRadius: Platform.OS === "ios" ? 20 : 0,
    elevation: Platform.OS === "android" ? 0 : 8,
    alignItems: "center",
    justifyContent: "center",
  },
  glowInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: Platform.OS === "ios" ? "#E8C587" : "transparent",
    shadowOffset:
      Platform.OS === "ios" ? { width: 0, height: 0 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === "ios" ? 0.8 : 0,
    shadowRadius: Platform.OS === "ios" ? 20 : 0,
    elevation: Platform.OS === "android" ? 0 : 8,
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
    elevation: Platform.OS === "android" ? 0 : 4,
    shadowColor: Platform.OS === "ios" ? "#b89450" : "transparent",
    shadowOffset:
      Platform.OS === "ios" ? { width: 0, height: 2 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === "ios" ? 0.1 : 0,
    shadowRadius: Platform.OS === "ios" ? 6 : 0,
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
    flexWrap: "nowrap",
    justifyContent: "space-between",
    gap: Platform.OS === "android" ? 6 : 10,
    marginTop: 20,
    width: "100%",
    paddingHorizontal: Platform.OS === "android" ? 2 : 5,
    marginBottom: 25,
  },
  repPill: {
    minWidth: Platform.OS === "android" ? 48 : 56,
    paddingHorizontal: Platform.OS === "android" ? 10 : 16,
    paddingVertical: Platform.OS === "android" ? 7 : 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e8c587",
    backgroundColor: "transparent",
    alignItems: "center",
  },
  repPillSelected: {
    backgroundColor: "#b89450",
    borderColor: "#b89450",
  },
  repPillText: {
    fontFamily: Fonts.sans.medium,
    fontSize: Platform.OS === "android" ? 13 : 14,
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
    fontSize: 24,
    lineHeight: 34,
    fontFamily: Fonts.serif.bold,
    color: BROWN,
    textAlign: "center",
    paddingHorizontal: 12,
    marginTop: -12,
    marginBottom: 10,
  },
  sankalpMainTextInline: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.serif.regular,
    color: "#432104",
    textAlign: "center",
    paddingHorizontal: 8,
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

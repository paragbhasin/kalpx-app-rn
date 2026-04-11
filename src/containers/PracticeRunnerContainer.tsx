import Slider from "@react-native-community/slider";
import { Audio } from "expo-av";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  LayoutAnimation,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import MantraLotus3d from "../../assets/mantra-lotus-3d.svg";
import SankalpCenteredIcon from "../../assets/sankalp_centered.svg";
import SankalpInnerPeaceIcon from "../../assets/sankalp_inner_peace.svg";
import MicroCompletion from "../components/HabitLoop/MicroCompletion";
import MalaMantraCounter from "../components/MalaMantraCounter";
import { executeAction } from "../engine/actionExecutor";
import BlockRenderer from "../engine/BlockRenderer";
import { mitraTrackEvent } from "../engine/mitraApi";
import { useScreenStore } from "../engine/useScreenBridge";
import { Fonts } from "../theme/fonts";

const { width } = Dimensions.get("window");

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ---------------------------------------------------------------------------
// Collapsible Card for Runner Footer
// ---------------------------------------------------------------------------

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
    onPress={onToggle}
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

function _omTextForTrack(url: string) {
  if (url.includes("Hari Om")) return { label: "Hari Om", devanagari: "हरि ॐ" };
  if (url.includes("Om Shanti"))
    return {
      label: "Om Shanti Shanti Shanti",
      devanagari: "ॐ शान्तिः शान्तिः शान्तिः",
    };
  return { label: "OM", devanagari: "ॐ" };
}

function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(seconds || 0));
  if (safeSeconds < 60) {
    return `${safeSeconds} second${safeSeconds === 1 ? "" : "s"}`;
  }
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  if (secs === 0) {
    return `${mins} minute${mins === 1 ? "" : "s"}`;
  }
  return `${mins}m ${secs}s`;
}

interface PracticeRunnerContainerProps {
  schema: {
    id?: string;
    variant?: string;
    headline?: string;
    subtext?: string;
    body?: string;
    target_count?: number;
    mantra_text?: string;
    mantra_hindi_text?: string;
    mantra_config?: any;
    pause_config?: any;
    prep_config?: any;
    embody_config?: any;
    completion_config?: any;
    feedback_config?: any;
    audio_url?: string;
    is_trigger?: boolean;
    blocks?: any[];
    on_complete?: any;
    complete_action?: any;
  };
}

const PracticeRunnerContainer: React.FC<PracticeRunnerContainerProps> = ({
  schema,
}) => {
  const {
    screenData: screenState,
    loadScreen,
    goBack,
    currentStateId,
    updateScreenData,
    updateBackground,
  } = useScreenStore();

  const [count, setCount] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());
  // Bead count carryover fix: reset the local rep counter (and the Redux
  // mirror) whenever the active mantra item_id or the screen state id
  // changes. Without this, the component stays mounted across trigger step
  // transitions (free_mantra_chanting -> post_trigger_mantra, etc.) and the
  // count from the previous mantra leaks into the next.
  const activeItemKey =
    screenState?.runner_active_item?.item_id ||
    screenState?.runner_active_item?.id ||
    screenState?._selected_om_audio ||
    currentStateId ||
    "";
  useEffect(() => {
    setCount(0);
    setSessionStartTime(Date.now());
    // Clear the Redux mirror too so downstream consumers don't see stale values.
    if (screenState?.mantra_progress_reps) {
      updateScreenData("mantra_progress_reps", 0);
    }
    if (screenState?.reps_done) {
      updateScreenData("reps_done", 0);
    }

    // Web parity (PracticeRunnerContainer.vue:1065-1081): fire session_started
    // analytics event when a runner session begins. Only for actual running
    // screens (not rep selection, prep, or completion).
    const sessionRunners = new Set([
      "mantra_runner",
      "sankalp_embody",
      "practice_step_runner",
      "free_mantra_chanting",
      "post_trigger_mantra",
      "trigger_practice_runner",
      "checkin_breath_reset",
      "checkin_support_mantra",
      "anchor_timer",
      "sacred_pause",
    ]);
    if (
      (currentStateId && sessionRunners.has(currentStateId)) ||
      (currentVariant && sessionRunners.has(currentVariant))
    ) {
      const runnerItem = screenState?.runner_active_item;
      const sessionItemId =
        runnerItem?.item_id ||
        runnerItem?.id ||
        screenState?.master_mantra?.id ||
        screenState?.master_practice?.id ||
        screenState?.master_sankalp?.id ||
        currentStateId ||
        "";
      if (sessionItemId) {
        const sessionItemType =
          runnerItem?.item_type ||
          (currentVariant?.includes("mantra")
            ? "mantra"
            : currentVariant?.includes("sankalp")
              ? "sankalp"
              : "practice");
        mitraTrackEvent("session_started", {
          journeyId: screenState?.journey_id,
          dayNumber: screenState?.day_number || 1,
          meta: {
            itemType: sessionItemType,
            itemId: sessionItemId,
            source: runnerItem?.source || "core",
            runnerType: currentVariant || currentStateId,
          },
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeItemKey, currentStateId]);
  const [showMicroWin, setShowMicroWin] = useState(false);
  const [microWinMessage, setMicroWinMessage] = useState("");
  const [mediaMuted, setMediaMuted] = useState(false);
  const [meaningExpanded, setMeaningExpanded] = useState(false);
  const [essenceExpanded, setEssenceExpanded] = useState(false);

  // Prep Flow State
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const prepAudioRef = useRef<Audio.Sound | null>(null);
  const introLoopAudioRef = useRef<Audio.Sound | null>(null);
  const mantraLoopAudioRef = useRef<Audio.Sound | null>(null);
  const prepTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const prepCompletedRef = useRef(false);

  // Sacred Pause State
  const [timeLeft, setTimeLeft] = useState(60);
  const [initialSeconds, setInitialSeconds] = useState(60);
  const [isTimerStarted, setIsTimerStarted] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(1);
  const pauseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const calmMusicRef = useRef<Audio.Sound | null>(null);

  // Sankalp Embody State
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isSankalpActivating, setIsSankalpActivating] = useState(false);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const embodyAudioRef = useRef<Audio.Sound | null>(null);
  const sankalpOmRef = useRef<Audio.Sound | null>(null);
  const sankalpSpin = useRef(new Animated.Value(0)).current;
  const sankalpSpinLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  const currentVariant = schema?.variant || currentStateId;

  // ── Variant Detection ──
  const isMantraRunner =
    currentVariant === "mantra_runner" ||
    currentStateId === "checkin_breath_reset";
  const isSankalpEmbody = currentVariant === "sankalp_embody";
  const isSankalpConfirm = currentVariant === "sankalp_confirm";
  const isRepSelection = currentVariant === "mantra_rep_selection";
  const isMantraPrep = currentVariant === "mantra_prep";
  const isSacredPause = currentVariant === "sacred_pause";
  const isSupportPractice =
    currentVariant === "support_practice" ||
    currentStateId === "trigger_practice_runner";
  const isMantraComplete = currentVariant === "mantra_complete";
  const isTriggerOmChantScreen =
    currentStateId === "free_mantra_chanting" ||
    currentStateId === "checkin_breath_reset" ||
    currentStateId === "post_trigger_mantra";
  const repCounterBlock = schema.blocks?.find(
    (block: any) => block.type === "rep_counter",
  );
  const isUnlimitedRepCounter =
    !!repCounterBlock?.unlimited || Number(repCounterBlock?.total) === -1;
  const selectedRepCount = Number(screenState.reps_total) || 27;
  const buildActionContext = () => ({
    loadScreen,
    goBack,
    setScreenValue: (value: any, key: string) => updateScreenData(key, value),
    screenState: { ...screenState },
  });

  // Strict trigger detection — only rely on authoritative screen state.
  // Legacy checks on `_active_support_item`, `_last_viewed_item`, and a
  // top-level `source` field were causing REG-015 style cross-flow
  // contamination: a stale support item from a prior trigger flow would
  // make a subsequent CORE mantra screen render the "I feel calmer now"
  // button. Per STATE_OWNERSHIP_MATRIX.md + INV-12, trigger detection
  // must be scoped strictly to the current screen id.
  const isTriggerSession = useMemo(() => {
    const triggerStateIds = new Set([
      "free_mantra_chanting",
      "post_trigger_mantra",
      "trigger_practice_runner",
    ]);
    return (
      schema?.is_trigger === true || triggerStateIds.has(currentStateId || "")
    );
  }, [schema, currentStateId]);

  // ── Session Metrics & Exit Logic ──
  const getRunnerType = () => {
    const v = schema?.variant || "";
    if (v.includes("mantra_runner")) return "mantra_runner";
    if (v.includes("mantra_prep")) return "mantra_prep";
    if (v.includes("sacred_pause") || v.includes("anchor"))
      return "anchor_timer";
    if (v.includes("practice_step")) return "practice_step_runner";
    return v;
  };

  const getSessionMeta = () => {
    const activeItem = screenState.runner_active_item || {};
    return {
      itemType:
        activeItem.item_type ||
        schema?.variant?.replace("_runner", "") ||
        "unknown",
      itemId: activeItem.item_id || screenState.mantra_id || "",
      source: activeItem.source || "core",
      runnerType: getRunnerType(),
    };
  };

  const handleSessionExit = async () => {
    const meta = getSessionMeta();
    const durationSeconds = Math.round((Date.now() - sessionStartTime) / 1000);

    // Submit Session Abandoned
    executeAction(
      {
        type: "submit",
        payload: {
          type:
            currentStateId === "free_mantra_chanting"
              ? "trigger_session_abandoned"
              : "session_abandoned",
          source: "support",
          ...meta,
          repsCompleted: count,
          durationSeconds,
        },
      },
      buildActionContext(),
    );

    // Navigate to Target
    const exitTargets: Record<string, any> = {
      mantra_runner: {
        container_id: "practice_runner",
        state_id: "mantra_rep_selection",
      },
      mantra_prep: {
        container_id: "practice_runner",
        state_id: "mantra_rep_selection",
      },
      anchor_timer: {
        container_id: "practice_runner",
        state_id: "anchor_duration_picker",
      },
    };

    let target = exitTargets[meta.runnerType];
    if (currentStateId === "checkin_breath_reset") {
      target = { container_id: "companion_dashboard", state_id: "day_active" };
    }
    if (isTriggerSession) {
      target =
        currentStateId === "free_mantra_chanting"
          ? { container_id: "companion_dashboard", state_id: "day_active" }
          : {
              container_id: "awareness_trigger",
              state_id: "trigger_advice_reveal",
            };
    }

    executeAction(
      {
        type: "navigate",
        target: target || {
          container_id: "companion_dashboard",
          state_id: "day_active",
        },
      },
      buildActionContext(),
    );
  };

  // ── Screen-Aware Mantra Content ──
  const _isTriggerScreen =
    currentStateId === "free_mantra_chanting" ||
    currentStateId === "post_trigger_mantra";
  const _isCheckinSupportScreen =
    currentStateId === "checkin_support_mantra" ||
    currentStateId === "checkin_breath_reset";

  // Web parity (actionExecutor.js yesterday fix 53721c3 "Fixed text/audio
  // sync: display derives text from _selected_om_audio URL"):
  // On OM-rotation screens (free_mantra_chanting, post_trigger_mantra,
  // checkin_breath_reset), derive the displayed mantra text DIRECTLY from
  // the selected audio URL via _omTextForTrack — never read from stored
  // trigger_mantra_text / checkin_mantra_text, because those fields can
  // become stale across rotations and drift from the audio.
  // Only on step >= 3 (user picked a specific mantra suggestion) do we
  // read runner_active_item — at that point the rotated OM is no longer
  // active and the item's title/iast are authoritative.
  const mantraDisplayTitle = useMemo(() => {
    if (_isTriggerScreen) {
      if (
        screenState.trigger_step >= 3 &&
        screenState.runner_active_item?.title
      ) {
        return screenState.runner_active_item.title;
      }
      if (screenState._selected_om_audio) {
        return _omTextForTrack(screenState._selected_om_audio).label;
      }
      return screenState.trigger_mantra_text || "OM";
    }
    if (_isCheckinSupportScreen) {
      if (
        currentStateId === "checkin_support_mantra" &&
        screenState.runner_active_item?.title
      ) {
        return screenState.runner_active_item.title;
      }
      if (screenState._selected_om_audio) {
        return _omTextForTrack(screenState._selected_om_audio).label;
      }
      return (
        screenState.checkin_mantra_text ||
        screenState.runner_active_item?.title ||
        "OM"
      );
    }
    return (
      screenState.runner_active_item?.title || screenState.mantra_title || ""
    );
  }, [screenState, _isTriggerScreen, _isCheckinSupportScreen, currentStateId]);

  const mantraText = useMemo(() => {
    if (_isTriggerScreen) {
      // Trigger step 3 = user picked a specific mantra suggestion, not OM rotation
      if (
        screenState.trigger_step >= 3 &&
        screenState.runner_active_item?.iast
      ) {
        return screenState.runner_active_item.iast;
      }
      if (screenState._selected_om_audio) {
        return _omTextForTrack(screenState._selected_om_audio).label;
      }
      return screenState.trigger_mantra_text || "";
    }
    if (_isCheckinSupportScreen) {
      // checkin_support_mantra = user past breath reset onto a specific
      // mantra — authoritative source is runner_active_item, not OM rotation
      if (
        currentStateId === "checkin_support_mantra" &&
        screenState.runner_active_item?.iast
      ) {
        return screenState.runner_active_item.iast;
      }
      // checkin_breath_reset = OM rotation only
      if (screenState._selected_om_audio) {
        return _omTextForTrack(screenState._selected_om_audio).label;
      }
      return (
        screenState.checkin_mantra_text ||
        screenState.runner_active_item?.iast ||
        ""
      );
    }
    return (
      screenState.runner_active_item?.iast ||
      screenState.mantra_text ||
      schema.mantra_text ||
      ""
    );
  }, [
    screenState,
    _isTriggerScreen,
    _isCheckinSupportScreen,
    schema,
    currentStateId,
  ]);

  const mantraHindi = useMemo(() => {
    if (_isTriggerScreen) {
      if (
        screenState.trigger_step >= 3 &&
        screenState.runner_active_item?.devanagari
      ) {
        return screenState.runner_active_item.devanagari;
      }
      if (screenState._selected_om_audio) {
        return _omTextForTrack(screenState._selected_om_audio).devanagari;
      }
      return screenState.trigger_mantra_devanagari || "ॐ";
    }
    if (_isCheckinSupportScreen) {
      if (
        currentStateId === "checkin_support_mantra" &&
        screenState.runner_active_item?.devanagari
      ) {
        return screenState.runner_active_item.devanagari;
      }
      if (screenState._selected_om_audio) {
        return _omTextForTrack(screenState._selected_om_audio).devanagari;
      }
      return (
        screenState.checkin_mantra_devanagari ||
        screenState.runner_active_item?.devanagari ||
        ""
      );
    }
    return (
      screenState.runner_active_item?.devanagari ||
      screenState.mantra_devanagari ||
      schema.mantra_hindi_text ||
      ""
    );
  }, [
    screenState,
    _isTriggerScreen,
    _isCheckinSupportScreen,
    schema,
    currentStateId,
  ]);

  const mantraAudioUrl = useMemo(() => {
    if (
      currentStateId === "free_mantra_chanting" ||
      currentStateId === "checkin_breath_reset"
    )
      return screenState._selected_om_audio || "";
    if (_isTriggerScreen || _isCheckinSupportScreen)
      return (
        screenState.runner_active_item?.audio_url ||
        screenState._selected_om_audio ||
        ""
      );
    const item = screenState.runner_active_item;
    if (item?.source === "additional" || item?.source === "support") {
      return item?.audio_url || "";
    }
    return item?.audio_url || screenState.master_mantra?.audio_url || "";
  }, [screenState, currentStateId, _isTriggerScreen, _isCheckinSupportScreen]);
  const mantraRunnerFooterBlocks = useMemo(
    () =>
      (schema.blocks || []).filter(
        (block: any) =>
          block.position === "footer" || block.position === "footer_actions",
      ),
    [schema.blocks],
  );

  const runnerHeadline = useMemo(() => {
    if (currentStateId === "checkin_breath_reset") {
      return "Pause and breathe.";
    }
    if (currentStateId === "checkin_support_mantra") {
      return "Recite with focus.";
    }
    if (isTriggerSession) {
      if (currentStateId === "free_mantra_chanting") {
        return "Pause before this grows.";
      }
      const isMantraFlow =
        currentVariant === "mantra_runner" ||
        currentStateId === "post_trigger_mantra" ||
        currentStateId === "checkin_support_mantra";
      return isMantraFlow
        ? "Stay with this for a few moments."
        : "Take one steadying action.";
    }
    return schema.headline || "";
  }, [currentStateId, currentVariant, isTriggerSession, schema.headline]);

  const runnerSubtext = useMemo(() => {
    if (currentStateId === "checkin_breath_reset") {
      const pranaType = screenState.current_prana_type || "";
      if (pranaType === "agitated") {
        return "Your energy may need settling before you move forward.";
      }
      if (pranaType === "drained") {
        return "Your system may need a gentler moment before the next step.";
      }
      return "Take a moment here before the next step.";
    }
    if (currentStateId === "checkin_support_mantra") {
      return "Let the repetition bring steadiness and clarity to your journey.";
    }
    if (isTriggerSession) {
      if (currentStateId === "free_mantra_chanting") {
        return "You do not need to solve everything right now. Stay here for a few breaths and let the intensity soften first.";
      }
      const isMantraFlow =
        currentVariant === "mantra_runner" ||
        currentStateId === "post_trigger_mantra" ||
        currentStateId === "checkin_support_mantra";
      return isMantraFlow
        ? "Let the repetition settle the mind before you decide what comes next."
        : "Move through the steps gently. You do not need to force a shift.";
    }
    return schema.subtext || schema.body || "";
  }, [
    currentStateId,
    currentVariant,
    isTriggerSession,
    screenState.current_prana_type,
    schema.subtext,
    schema.body,
  ]);

  const activeSankalpText = useMemo(() => {
    const item = screenState.runner_active_item;
    if (item?.item_type === "sankalp") {
      return item.line || item.title || screenState.sankalp_text || "";
    }
    return screenState.sankalp_text || "";
  }, [screenState]);

  const supportPracticeSteps = useMemo(() => {
    const item = screenState.runner_active_item;
    if (!item) return [];
    if (Array.isArray(item.steps)) return item.steps;
    if (item.steps_text) {
      return String(item.steps_text)
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.replace(/^\d+\.\s*/, ""));
    }
    return [];
  }, [screenState.runner_active_item]);

  const supportPracticeBenefits = useMemo(() => {
    const item = screenState.runner_active_item;
    if (!item) return [];
    return Array.isArray(item.benefits) ? item.benefits : [];
  }, [screenState.runner_active_item]);

  const supportPracticeInsight = useMemo(
    () => screenState.runner_active_item?.insight || "",
    [screenState.runner_active_item],
  );

  const supportPracticeSummary = useMemo(
    () => screenState.runner_active_item?.summary || "",
    [screenState.runner_active_item],
  );

  const resolveAudioSource = (url?: string) => {
    if (!url) return require("../../assets/sounds/Om.mp4");
    if (url.includes("Audio_Be_still.mp4")) {
      return require("../../assets/sounds/Audio_Be_still.mp4");
    }
    if (url.includes("Hari Om")) {
      return require("../../assets/sounds/Hari Om -Female.mp4");
    }
    if (url.includes("Om Shanti")) {
      return require("../../assets/sounds/Om Shanti.mp4");
    }
    if (url.includes("Om.mp4")) {
      return require("../../assets/sounds/Om.mp4");
    }
    return { uri: url };
  };

  // Atomic ref-clearing prevents races where an old fire-and-forget cleanup
  // stops or orphans a newly-created sound from a concurrent effect run.
  const stopTriggerAudio = async () => {
    const intro = introLoopAudioRef.current;
    const mantra = mantraLoopAudioRef.current;
    introLoopAudioRef.current = null;
    mantraLoopAudioRef.current = null;
    if (intro) {
      await intro.stopAsync().catch(() => {});
      await intro.unloadAsync().catch(() => {});
    }
    if (mantra) {
      await mantra.stopAsync().catch(() => {});
      await mantra.unloadAsync().catch(() => {});
    }
  };

  const applyMuteState = async (muted: boolean) => {
    const volume = muted ? 0 : 1;
    const sounds = [
      introLoopAudioRef.current,
      mantraLoopAudioRef.current,
      prepAudioRef.current,
      embodyAudioRef.current,
      sankalpOmRef.current,
      calmMusicRef.current,
    ];

    for (const sound of sounds) {
      if (sound) {
        try {
          await sound.setVolumeAsync(volume);
          await sound.setIsMutedAsync(muted);
        } catch (err) {
          // Ignore errors for unloaded sounds
        }
      }
    }
  };

  const startCalmMusic = async () => {
    try {
      if (calmMusicRef.current) {
        await calmMusicRef.current.unloadAsync().catch(() => {});
        calmMusicRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/Audio-calmmusic.mp3"),
        {
          shouldPlay: true,
          isLooping: true,
          isMuted: mediaMuted,
          volume: mediaMuted ? 0 : 0.6,
        },
      );
      calmMusicRef.current = sound;
    } catch (err) {
      console.warn("[CALM_MUSIC] play failed:", err);
    }
  };

  const stopCalmMusic = async () => {
    if (calmMusicRef.current) {
      const sound = calmMusicRef.current;
      calmMusicRef.current = null;
      await sound.stopAsync().catch(() => {});
      await sound.unloadAsync().catch(() => {});
    }
  };

  const toggleTriggerMute = () => {
    const nextMuted = !mediaMuted;
    console.log("[TRIGGER_AUDIO] Toggling mute to:", nextMuted);
    setMediaMuted(nextMuted);
    // Explicitly apply to current sounds in addition to the effect
    applyMuteState(nextMuted);
  };

  // Synchronize audio state whenever mediaMuted changed or sounds are loaded
  useEffect(() => {
    applyMuteState(mediaMuted);
  }, [mediaMuted]);

  // Handle Calm Music for Support Practices
  useEffect(() => {
    if (isSupportPractice) {
      startCalmMusic();
    } else {
      stopCalmMusic();
    }
    return () => {
      stopCalmMusic();
    };
  }, [isSupportPractice]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      playThroughEarpieceAndroid: false,
    }).catch((e) =>
      console.warn("[TRIGGER_AUDIO] Global setAudioModeAsync error:", e),
    );
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const startTriggerAudioSequence = async () => {
      console.log(
        "[TRIGGER_AUDIO] startTriggerAudioSequence triggered. Mode:",
        currentStateId,
      );

      if (!isTriggerOmChantScreen) {
        console.log("[TRIGGER_AUDIO] Not a trigger chanting screen. Stopping.");
        await stopTriggerAudio();
        return;
      }

      await stopTriggerAudio();

      // Delay slightly to ensure component is settled
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (isCancelled) return;

      // Try to load the intro bell (Audio_Be_still) — but it's optional.
      // The file is actually an .m4a container with a .mp4 extension, which
      // occasionally trips expo-asset's downloadAsync pipeline on fresh
      // launches. If it fails, we skip it and play the mantra directly.
      try {
        console.log("[TRIGGER_AUDIO] Loading Intro: Audio_Be_still.mp4");
        const introSource = require("../../assets/sounds/Audio_Be_still.mp4");
        const { sound: intro } = await Audio.Sound.createAsync(introSource, {
          shouldPlay: false,
          isMuted: mediaMuted,
          volume: mediaMuted ? 0 : 1,
        });
        if (!isCancelled) {
          introLoopAudioRef.current = intro;
        } else {
          await intro.unloadAsync();
        }
      } catch (introErr) {
        console.warn(
          "[TRIGGER_AUDIO] Intro load failed — skipping:",
          (introErr as any)?.message,
        );
        introLoopAudioRef.current = null;
      }

      if (isCancelled) return;

      // Load the mantra loop (REQUIRED — this is the primary audio)
      let mantra: Audio.Sound | null = null;
      try {
        console.log("[TRIGGER_AUDIO] Loading Mantra Source:", mantraAudioUrl);
        const mantraSource = resolveAudioSource(mantraAudioUrl);
        const result = await Audio.Sound.createAsync(mantraSource, {
          shouldPlay: false,
          isLooping: true,
          isMuted: mediaMuted,
          volume: mediaMuted ? 0 : 1,
        });
        mantra = result.sound;
      } catch (mantraErr) {
        console.warn(
          "[TRIGGER_AUDIO] Mantra load failed:",
          (mantraErr as any)?.message,
        );
        // Fallback: try the local bundled Om.mp4
        try {
          const fallbackSource = require("../../assets/sounds/Om.mp4");
          const result = await Audio.Sound.createAsync(fallbackSource, {
            shouldPlay: false,
            isLooping: true,
            isMuted: mediaMuted,
            volume: mediaMuted ? 0 : 1,
          });
          mantra = result.sound;
        } catch (fallbackErr) {
          console.error(
            "[TRIGGER_AUDIO] Fallback also failed:",
            (fallbackErr as any)?.message,
          );
          return; // Give up gracefully — the screen still renders without audio
        }
      }

      if (isCancelled || !mantra) {
        if (mantra) await mantra.unloadAsync().catch(() => {});
        return;
      }
      mantraLoopAudioRef.current = mantra;

      const intro = introLoopAudioRef.current;
      try {
        if (intro) {
          // Transition: intro → mantra
          intro.setOnPlaybackStatusUpdate((status) => {
            if (
              status.isLoaded &&
              status.didJustFinish &&
              !isCancelled &&
              mantra
            ) {
              console.log("[TRIGGER_AUDIO] Intro finished -> Playing Mantra");
              mantra
                .playAsync()
                .catch((e) =>
                  console.warn(
                    "[TRIGGER_AUDIO] Mantra play failed:",
                    e?.message,
                  ),
                );
            }
          });
          console.log("[TRIGGER_AUDIO] Playing intro");
          await intro.playAsync();
        } else {
          // No intro — play mantra directly
          console.log("[TRIGGER_AUDIO] No intro — playing mantra directly");
          await mantra.playAsync();
        }
      } catch (err) {
        console.warn("[TRIGGER_AUDIO] play failed:", (err as any)?.message);
      }
    };

    startTriggerAudioSequence();

    return () => {
      isCancelled = true;
      stopTriggerAudio().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTriggerOmChantScreen, mantraAudioUrl]); // Removed mediaMuted to avoid restart on mute toggle

  const mantraCompletionState = useMemo(() => {
    const durationSeconds =
      Math.round(Number(screenState.chant_duration)) ||
      Math.round((Date.now() - sessionStartTime) / 1000);
    const repCount =
      Number(screenState.mantra_progress_reps) ||
      Number(screenState.reps_total) ||
      count ||
      0;
    const threshold = Number(schema.feedback_config?.slow_threshold) || 3;
    const secondsPerRep =
      repCount > 0 ? durationSeconds / repCount : durationSeconds;
    const isFastSession = secondsPerRep < threshold;
    const feedback = isFastSession
      ? schema.feedback_config?.fast_feedback
      : schema.feedback_config?.slow_feedback;

    return {
      durationSeconds,
      repCount,
      isFastSession,
      feedback,
      durationLabel: formatDuration(durationSeconds),
    };
  }, [screenState, sessionStartTime, count, schema.feedback_config]);

  // ── Background Handling ──
  useEffect(() => {
    let bg = require("../../assets/mantra3.png");
    if (currentVariant === "mantra_prep")
      bg = require("../../assets/mantra_relaxing.png");
    if (currentVariant === "mantra_rep_selection")
      bg = require("../../assets/beige_bg.png");
    // Fallback logic from Vue
    updateBackground(bg);
  }, [currentVariant]);

  useEffect(() => {
    if (isRepSelection && !screenState.reps_total) {
      updateScreenData("reps_total", 27);
    }
  }, [isRepSelection, screenState.reps_total, updateScreenData]);

  // ── Prep Flow Logic ──
  const startPrepFlow = async () => {
    const sentences = schema.prep_config?.sentences || [];
    const timings = schema.prep_config?.timings || [];

    prepCompletedRef.current = false;
    setCurrentSentenceIndex(0);

    prepTimeoutsRef.current.forEach(clearTimeout);
    prepTimeoutsRef.current = [];

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      if (prepAudioRef.current) {
        await prepAudioRef.current.unloadAsync();
        prepAudioRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/Audio_Be_still.mp4"),
        { shouldPlay: true, isLooping: false, volume: 1 },
      );

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (timings.length > 0) {
          const positionSeconds = (status.positionMillis || 0) / 1000;
          let nextSentenceIndex = 0;
          for (let i = 0; i < sentences.length; i += 1) {
            const startAt = timings[i];
            if (typeof startAt === "number" && positionSeconds >= startAt) {
              nextSentenceIndex = i;
            }
          }

          setCurrentSentenceIndex((prev) =>
            prev === nextSentenceIndex ? prev : nextSentenceIndex,
          );
        }

        if (status.didJustFinish) {
          if (prepCompletedRef.current) return;
          prepCompletedRef.current = true;
          const action = schema.on_complete || schema.complete_action;
          if (action) executeAction(action, buildActionContext());
        }
      });

      prepAudioRef.current = sound;
    } catch (err) {
      console.warn("[MANTRA_PREP] Audio failed to play:", err);
      if (timings.length > 1) {
        sentences.forEach((_: string, idx: number) => {
          const startAt = timings[idx];
          if (typeof startAt === "number" && idx > 0) {
            const timeoutId = setTimeout(() => {
              setCurrentSentenceIndex(idx);
            }, startAt * 1000);
            prepTimeoutsRef.current.push(timeoutId);
          }
        });

        const flowEnd =
          timings[sentences.length] ?? timings[timings.length - 1];
        if (typeof flowEnd === "number") {
          const completeTimeoutId = setTimeout(() => {
            if (prepCompletedRef.current) return;
            prepCompletedRef.current = true;
            const action = schema.on_complete || schema.complete_action;
            if (action) executeAction(action, buildActionContext());
          }, flowEnd * 1000);
          prepTimeoutsRef.current.push(completeTimeoutId);
        }
      }
    }
  };

  useEffect(() => {
    if (isMantraPrep) {
      startPrepFlow();
    }
    return () => {
      prepTimeoutsRef.current.forEach(clearTimeout);
      prepTimeoutsRef.current = [];
      if (prepAudioRef.current) {
        prepAudioRef.current.unloadAsync().catch(() => {});
        prepAudioRef.current = null;
      }
    };
  }, [isMantraPrep]);

  // ── Sacred Pause Logic ──
  const startPauseTimer = (seconds: number) => {
    setTimeLeft(seconds);
    setInitialSeconds(seconds);
    setIsTimerStarted(true);

    pauseTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(pauseTimerRef.current!);
          const action = schema.on_complete || schema.complete_action;
          if (action) executeAction(action, buildActionContext());
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetPauseTimer = () => {
    if (pauseTimerRef.current) clearInterval(pauseTimerRef.current);
    startPauseTimer(initialSeconds);
  };

  // ── Sankalp Embody Logic ──
  const startEmbody = () => {
    if (isHolding || isSankalpActivating) return;
    setIsHolding(true);
    let progress = 0;
    holdTimerRef.current = setInterval(() => {
      progress += 2.5;
      setHoldProgress(progress);
      if (progress >= 100) {
        clearInterval(holdTimerRef.current!);
        setIsHolding(false);
        const action = schema.on_complete || schema.complete_action;
        if (action) {
          if (isSankalpEmbody) {
            runSankalpActivation(action);
          } else {
            executeAction(action, buildActionContext());
          }
        }
      }
    }, 30);
  };

  const runSankalpActivation = async (action: any) => {
    if (isSankalpActivating) return;
    setIsSankalpActivating(true);
    setHoldProgress(100);

    const startSmoothSpin = (durationMs: number) => {
      sankalpSpinLoopRef.current?.stop();
      sankalpSpin.setValue(0);
      sankalpSpinLoopRef.current = Animated.loop(
        Animated.timing(sankalpSpin, {
          toValue: 1,
          duration: Math.max(3000, Math.round(durationMs)),
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      sankalpSpinLoopRef.current.start();
    };

    // Start immediately on first activation, then sync to audio duration once loaded.
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
          executeAction(action, buildActionContext());
        }
      });
      await sound.playAsync();
    } catch (err) {
      console.warn("[SANKALP_CONFIRM] OM audio failed:", err);
      setTimeout(() => {
        sankalpSpinLoopRef.current?.stop();
        sankalpSpin.setValue(0);
        executeAction(action, buildActionContext());
      }, 4200);
    }
  };

  const returnToDashboard = (completed = true) => {
    const messages = [
      "You showed up today.",
      "Stillness stays with you.",
      "Something shifts.",
      "Body remembers.",
    ];
    setMicroWinMessage(messages[Math.floor(Math.random() * messages.length)]);
    setShowMicroWin(true);
    setTimeout(() => {
      executeAction(
        {
          type: "submit",
          payload: { practiceId: schema.id || "practice", completed },
          target: {
            container_id: "companion_dashboard",
            state_id: "day_active",
          },
        },
        buildActionContext(),
      );
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
      sankalpSpinLoopRef.current?.stop();
      if (sankalpOmRef.current) {
        sankalpOmRef.current.unloadAsync().catch(() => {});
        sankalpOmRef.current = null;
      }
    };
  }, []);

  // ── Render Components ──
  if (isRepSelection) {
    const headlineBlock = schema.blocks?.find(
      (block: any) => block.type === "headline",
    );
    const subtextBlock = schema.blocks?.find(
      (block: any) => block.type === "subtext" && block.variant !== "link",
    );
    const repOptions = schema.blocks?.find(
      (block: any) => block.type === "option_picker",
    )?.options || [9, 18, 27, 54, 108];
    const beginAction = schema.blocks?.find(
      (block: any) => block.id === "begin_mantra_practice",
    )?.action || {
      type: "navigate",
      target: { container_id: "practice_runner", state_id: "mantra_prep" },
    };

    return (
      <ImageBackground
        source={require("../../assets/beige_bg.png")}
        style={styles.fullscreenBg}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={styles.repSelectionScroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.repHeadline}>
            {headlineBlock?.content || "Choose Your Chant Count"}
          </Text>
          <Text style={styles.repSubtext}>
            {subtextBlock?.content ||
              "Set the number of chants for this session."}
          </Text>

          <View style={styles.repMandalaWrap}>
            <View style={styles.repMandalaOuter}>
              <Image
                source={require("../../assets/lotus_glow.png")}
                style={styles.repMandalaGlow}
                resizeMode="contain"
              />
              <View style={styles.repMandalaInner}>
                <Text style={styles.repMandalaCount}>{selectedRepCount}</Text>
                <Text style={styles.repMandalaLabel}>Chants</Text>
              </View>
            </View>
          </View>

          <View style={styles.repOptionsRow}>
            {repOptions.map((option: number) => {
              const selected = option === selectedRepCount;
              return (
                <Pressable
                  key={option}
                  style={[
                    styles.repOptionPill,
                    selected && styles.repOptionPillSelected,
                  ]}
                  onPress={() => updateScreenData("reps_total", option)}
                >
                  {selected && (
                    <View style={styles.repOptionCheck}>
                      <Check size={12} color="#D9A012" strokeWidth={3} />
                    </View>
                  )}
                  <Text
                    style={[
                      styles.repOptionText,
                      selected && styles.repOptionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.repBeginBtn}
            onPress={() => executeAction(beginAction, buildActionContext())}
            activeOpacity={0.85}
          >
            <View style={styles.repBeginBtnInner}>
              <Text style={styles.repBeginBtnText}>Begin Chanting →</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.repFooterCopy}>
            You can always begin with a smaller count and build gradually.
          </Text>

          <TouchableOpacity
            onPress={() =>
              loadScreen({
                container_id: "companion_dashboard",
                state_id: "day_active",
              })
            }
            activeOpacity={0.7}
          >
            <Text style={styles.returnLink}>Return to Mitra Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </ImageBackground>
    );
  }

  if (isMantraRunner) {
    const target = isUnlimitedRepCounter
      ? -1
      : Number(screenState.reps_total) ||
        Number(repCounterBlock?.total) ||
        schema.target_count ||
        9;

    const activeItem = screenState.runner_active_item;

    return (
      <View style={{ flex: 1 }}>
        <MalaMantraCounter
          mantraTitle={mantraDisplayTitle}
          mantraText={mantraText}
          hindiText={mantraHindi}
          targetCount={target}
          currentCount={count}
          onIncrement={() => {
            const next = count + 1;
            setCount(next);
            if (next >= target) {
              const action = schema.on_complete || schema.complete_action;
              if (action) {
                const durationSeconds = Math.round(
                  (Date.now() - sessionStartTime) / 1000,
                );
                updateScreenData("chant_duration", durationSeconds);
                updateScreenData("mantra_progress_reps", next);
                setTimeout(
                  () => executeAction(action, buildActionContext()),
                  1000,
                );
              }
            }
          }}
          onExit={handleSessionExit}
          triggerHeadline={isTriggerSession ? runnerHeadline : ""}
          triggerSubtext={isTriggerSession ? runnerSubtext : ""}
          showMuteToggle={isTriggerOmChantScreen}
          mediaMuted={mediaMuted}
          onToggleMute={toggleTriggerMute}
          footerContent={
            <View style={styles.runnerFooterExtra}>
              {/* Trigger buttons are rendered via mantraRunnerFooterBlocks
                  below, driven by the schema in allContainers.js
                  (free_mantra_chanting / post_trigger_mantra footer_actions).
                  Previously we rendered them twice — once inline here and
                  once via BlockRenderer — causing the duplicate button
                  problem. Web parity: web only has the schema-driven set. */}

              {/* Mantra Meaning/Essence Accordions */}
              {isTriggerSession && activeItem?.item_type === "mantra" && (
                <View style={styles.mantraCollapsibleGroup}>
                  {activeItem.meaning && (
                    <CollapsibleCard
                      label="Meaning"
                      expanded={meaningExpanded}
                      onToggle={() => {
                        LayoutAnimation.configureNext(
                          LayoutAnimation.Presets.easeInEaseOut,
                        );
                        setMeaningExpanded(!meaningExpanded);
                      }}
                    >
                      <Text style={styles.cardText}>{activeItem.meaning}</Text>
                    </CollapsibleCard>
                  )}
                  {activeItem.essence && (
                    <CollapsibleCard
                      label="Essence"
                      expanded={essenceExpanded}
                      onToggle={() => {
                        LayoutAnimation.configureNext(
                          LayoutAnimation.Presets.easeInEaseOut,
                        );
                        setEssenceExpanded(!essenceExpanded);
                      }}
                    >
                      <Text style={styles.cardText}>{activeItem.essence}</Text>
                    </CollapsibleCard>
                  )}
                </View>
              )}

              {/* Existing Footer Blocks */}
              {mantraRunnerFooterBlocks.length > 0 && (
                <View style={{ marginTop: 20 }}>
                  {mantraRunnerFooterBlocks.map((block: any, i: number) => (
                    <BlockRenderer
                      key={block.id || `runner-footer-${i}`}
                      block={block}
                    />
                  ))}
                </View>
              )}
            </View>
          }
        />
        {showMicroWin && (
          <MicroCompletion
            message={microWinMessage}
            onDismiss={() => setShowMicroWin(false)}
          />
        )}
      </View>
    );
  }

  if (isSupportPractice) {
    return (
      <ImageBackground
        source={require("../../assets/mantra3.png")}
        style={styles.fullscreenBg}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={styles.supportPracticeScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.supportPracticeHeader}>
            <Text style={styles.supportPracticeTitle}>
              {screenState.runner_active_item?.title || runnerHeadline}
            </Text>
            <Text style={styles.supportPracticeSubtitle}>
              {runnerSubtext || "Move through this gently. There is no rush."}
            </Text>
          </View>

          <View style={styles.instructionsCard}>
            {supportPracticeSteps.map((step: string, i: number) => (
              <View key={`${step}-${i}`} style={styles.stepItem}>
                <Text style={styles.stepNum}>{i + 1}.</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={styles.supportActions}>
            <TouchableOpacity
              style={styles.goldActionBtn}
              onPress={() =>
                executeAction(
                  { type: "trigger_calmer_now" },
                  buildActionContext(),
                )
              }
            >
              <Text style={styles.goldActionBtnText}>I feel calmer now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.supportOutlineBtn}
              onPress={() =>
                executeAction(
                  { type: "trigger_still_feeling" },
                  buildActionContext(),
                )
              }
            >
              <Text style={styles.supportOutlineBtnText}>Try another way</Text>
            </TouchableOpacity>
          </View>

          {!!supportPracticeSummary && (
            <View style={styles.supportInfoCard}>
              <Text style={styles.supportInfoTitle}>Meaning</Text>
              <Text style={styles.supportInfoText}>
                {supportPracticeSummary}
              </Text>
            </View>
          )}

          {supportPracticeBenefits.length > 0 && (
            <View style={styles.supportInfoCard}>
              <Text style={styles.supportInfoTitle}>Benefits</Text>
              {supportPracticeBenefits.map((benefit: string, i: number) => (
                <Text key={`${benefit}-${i}`} style={styles.supportBenefitItem}>
                  {"\u2022"} {benefit}
                </Text>
              ))}
            </View>
          )}

          {!!supportPracticeInsight && (
            <View style={styles.supportInfoCard}>
              <Text style={styles.supportInfoTitle}>Why this works</Text>
              <Text style={styles.supportInfoText}>
                {supportPracticeInsight}
              </Text>
            </View>
          )}
        </ScrollView>
      </ImageBackground>
    );
  }

  if (isMantraPrep) {
    const sentences = schema.prep_config?.sentences || [];
    const finishPrep = async () => {
      if (prepCompletedRef.current) return;
      prepCompletedRef.current = true;
      prepTimeoutsRef.current.forEach(clearTimeout);
      prepTimeoutsRef.current = [];
      if (prepAudioRef.current) {
        await prepAudioRef.current.stopAsync().catch(() => {});
        await prepAudioRef.current.unloadAsync().catch(() => {});
        prepAudioRef.current = null;
      }
      const action = schema.on_complete || schema.complete_action;
      if (action) executeAction(action, buildActionContext());
    };

    return (
      <ImageBackground
        source={require("../../assets/mantra_relaxing.png")}
        style={styles.fullscreenBg}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.prepTopBar}>
            <TouchableOpacity
              style={styles.prepBackBtn}
              onPress={handleSessionExit}
              activeOpacity={0.8}
            >
              <ChevronLeft size={22} color="#5C3A12" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={finishPrep}
              activeOpacity={0.85}
            >
              <Text style={styles.skipText}>Skip</Text>
              <ChevronRight size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.prepContent}>
            <Text style={styles.prepSentence}>
              {sentences[currentSentenceIndex]}
            </Text>
          </View>

          <View style={styles.prepBottomPanel}>
            <Text style={styles.prepAudioLabel}>
              || Audio Guidance Playing ||
            </Text>
            <Text style={styles.prepHeadphoneText}>
              {schema.prep_config?.headphone_text ||
                "Use headphone for the best experience"}
            </Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (isSacredPause) {
    const activeItem = screenState.runner_active_item;
    const steps = (activeItem?.steps_text || screenState.info?.steps_text || "")
      .split("\n")
      .filter(Boolean);
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.pauseHeader}>
          <Text style={styles.pauseTitle}>
            {activeItem?.title || schema.pause_config?.title || "Sacred Pause"}
          </Text>
          <Text style={styles.pauseSub}>
            {activeItem?.subtitle ||
              schema.pause_config?.subtitle ||
              "Take a moment"}
          </Text>
        </View>

        <View style={styles.instructionsCard}>
          {(steps.length > 0
            ? steps
            : schema.pause_config?.default_steps || []
          ).map((step: string, i: number) => (
            <View key={i} style={styles.stepItem}>
              <Text style={styles.stepNum}>{i + 1}.</Text>
              <Text style={styles.stepText}>
                {step.replace(/^\d+\.\s*/, "")}
              </Text>
            </View>
          ))}
        </View>

        {!isTimerStarted ? (
          <View style={styles.selectionCard}>
            <Text style={styles.currentDurVal}>{selectedDuration} min</Text>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={0.5}
              maximumValue={5}
              step={0.5}
              value={selectedDuration}
              onValueChange={setSelectedDuration}
              minimumTrackTintColor="#CA8A04"
              maximumTrackTintColor="#D1D1D1"
            />
            <TouchableOpacity
              style={styles.beginBtn}
              onPress={() => startPauseTimer(selectedDuration * 60)}
            >
              <Text style={styles.beginBtnText}>Begin Practice</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.timerOrbArea}>
            <View style={styles.orbInner}>
              <Text
                style={styles.timeStr}
              >{`${m}:${s.toString().padStart(2, "0")}`}</Text>
              <Text style={styles.orbLabel}>REMAINING</Text>
              <TouchableOpacity onPress={resetPauseTimer}>
                <RefreshCw size={24} color="#615247" />
              </TouchableOpacity>
            </View>
            <Image
              source={require("../../assets/mantra-lotus-3d.svg")}
              style={styles.lotusTimer}
            />
          </View>
        )}

        <View style={styles.pauseActions}>
          <TouchableOpacity
            style={styles.goldActionBtn}
            onPress={() => goBack()}
          >
            <Text style={styles.goldActionBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => returnToDashboard(false)}>
            <Text style={styles.returnLink}>Return to Mitra Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (isSankalpEmbody) {
    const text = activeSankalpText;
    const coinRotateY = sankalpSpin.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
    });
    const coinScale = sankalpSpin.interpolate({
      inputRange: [0, 0.2, 0.5, 1],
      outputRange: [1, 0.96, 1.01, 1],
    });

    return (
      <View style={styles.embodyContainer}>
        <View style={styles.quoteWrap}>
          <Text style={styles.sankalpText}>{text}</Text>
        </View>
        <View style={styles.divider}>
          <View style={styles.line} />
          <View style={styles.diamond} />
          <View style={styles.line} />
        </View>
        <Text style={styles.embodyInstr}>
          {schema.embody_config?.instruction ||
            "Hold the icon below to embody."}
        </Text>

        <TouchableOpacity
          style={styles.holdTarget}
          onLongPress={startEmbody}
          delayLongPress={100}
          activeOpacity={0.8}
          disabled={isSankalpActivating}
        >
          <Animated.View
            style={{
              transform: [
                { perspective: 1000 },
                { rotateY: coinRotateY },
                { scale: coinScale },
              ],
            }}
          >
            <Image
              source={require("../../assets/namaste.png")}
              style={[
                styles.embodyImg,
                isHolding &&
                  !isSankalpActivating && {
                    transform: [{ rotateY: "180deg" }],
                  },
              ]}
            />
          </Animated.View>
        </TouchableOpacity>

        {isSankalpActivating && (
          <Text style={styles.sankalpActivatingText}>
            Let the vibration settle within...
          </Text>
        )}

        <TouchableOpacity
          style={{ marginTop: 40 }}
          onPress={() => returnToDashboard(false)}
        >
          <Text style={styles.returnLink}>Return to Mitra Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isMantraComplete) {
    const completionConfig = schema.completion_config || {};
    const feedback = mantraCompletionState.feedback || {};
    const points = completionConfig.points || [];

    return (
      <ImageBackground
        source={require("../../assets/beige_bg.png")}
        style={styles.fullscreenBg}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={styles.mantraCompleteScroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.mantraCompleteHeadline}>
            {completionConfig.headline || "Mantra Completed."}
          </Text>
          <Text style={styles.mantraCompleteSubtext}>
            {completionConfig.subtext ||
              "A moment of inner calm strengthens your foundation."}
          </Text>

          <View style={styles.mantraCompleteLotusWrap}>
            <View style={styles.mantraCompleteLine} />
            <MantraLotus3d width={110} height={82} />
            <View style={styles.mantraCompleteLine} />
          </View>

          <View style={styles.mantraReflectionCard}>
            <View style={styles.mantraReflectionHeader}>
              <View style={styles.mantraReflectionHeaderLine} />
              <Text style={styles.mantraReflectionLabel}>
                {completionConfig.reflection_label || "Session Reflection"}
              </Text>
              <View style={styles.mantraReflectionHeaderLine} />
            </View>

            <View style={styles.mantraDurationCard}>
              <Text style={styles.mantraDurationLabel}>Session Duration</Text>
              <Text style={styles.mantraDurationValue}>
                {mantraCompletionState.durationLabel}
              </Text>
            </View>

            <Text style={styles.mantraFeedbackTitle}>
              {feedback.title || "A Gentle Reflection"}
            </Text>
            <Text style={styles.mantraFeedbackMessage}>
              {feedback.message || "Did each mantra truly resonate within you?"}
            </Text>
            {!!feedback.sub && (
              <Text style={styles.mantraFeedbackSub}>{feedback.sub}</Text>
            )}

            {!!feedback.retry_cta && (
              <View style={styles.mantraRetryCtaBox}>
                <Text style={styles.mantraRetryCtaText}>
                  {feedback.retry_cta}
                </Text>
              </View>
            )}

            {!mantraCompletionState.isFastSession && points.length > 0 && (
              <View style={styles.mantraPointsList}>
                {points.map((point: string, index: number) => (
                  <View key={`${point}-${index}`} style={styles.mantraPointRow}>
                    <View style={styles.mantraPointDot} />
                    <Text style={styles.mantraPointText}>{point}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {feedback.recommendRepeat && (
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedBadgeText}>RECOMMENDED</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.mantraRepeatBtn}
            onPress={() =>
              loadScreen({
                container_id: "practice_runner",
                state_id: "mantra_rep_selection",
              })
            }
            activeOpacity={0.85}
          >
            <Text style={styles.mantraRepeatBtnText}>
              {completionConfig.repeat_label || "Repeat it again"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.goldActionBtn}
            onPress={() => returnToDashboard(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.goldActionBtnText}>
              {completionConfig.dashboard_label || "Return to Mitra Home"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </ImageBackground>
    );
  }

  if (isSankalpConfirm) {
    const completionConfig = schema.completion_config || {};
    const points = completionConfig.points || [];
    const pointIconMap: Record<string, any> = {
      "/assets/sankalp_centered.svg": SankalpCenteredIcon,
      "/assets/sankalp_inner_peace.svg": SankalpInnerPeaceIcon,
    };

    return (
      <ImageBackground
        source={require("../../assets/beige_bg.png")}
        style={styles.fullscreenBg}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={styles.sankalpConfirmScroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sankalpConfirmHeadline}>
            {completionConfig.headline || "Your Sankalp is Alive."}
          </Text>

          <Text style={styles.sankalpConfirmSubtext}>
            {completionConfig.subtext ||
              "Your sankalp is now alive in you. Carry it gently through your day.\nLet it guide your choices, words, and pauses."}
          </Text>

          <View style={styles.sankalpLotusDivider}>
            <View style={styles.sankalpLotusLine} />
            <MantraLotus3d width={124} height={88} />
            <View style={styles.sankalpLotusLine} />
          </View>

          <View style={styles.sankalpPointsCard}>
            {points.map((point: any, index: number) => {
              const IconComponent = pointIconMap[point.icon];
              return (
                <React.Fragment key={`${point.label}-${index}`}>
                  {index > 0 && <View style={styles.sankalpPointsDivider} />}
                  <View style={styles.sankalpPointCol}>
                    {IconComponent ? (
                      <IconComponent width={48} height={48} />
                    ) : (
                      <View style={styles.sankalpPointFallbackIcon} />
                    )}
                    <Text style={styles.sankalpPointLabel}>
                      {String(point.label || "").replace(/\n/g, " ")}
                    </Text>
                  </View>
                </React.Fragment>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.sankalpRepeatBtn}
            onPress={() =>
              loadScreen({
                container_id: "practice_runner",
                state_id: "sankalp_embody",
              })
            }
            activeOpacity={0.85}
          >
            <Text style={styles.sankalpRepeatBtnText}>
              {completionConfig.repeat_label || "Repeat it again"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sankalpHomeBtn}
            onPress={() => returnToDashboard(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.sankalpHomeBtnText}>
              {completionConfig.dashboard_label || "Return to Mitra Home"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </ImageBackground>
    );
  }

  // Fallback / Summary Layouts
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {isTriggerSession && (
        <View style={styles.supportHeader}>
          <Text style={styles.supportHeadline}>{schema.headline}</Text>
          <Text style={styles.supportSub}>{schema.subtext}</Text>
        </View>
      )}
      {schema.blocks?.map((block: any, i: number) => (
        <BlockRenderer
          key={i}
          block={
            block.type === "audio_player"
              ? { ...block, audio_url: mantraAudioUrl }
              : block
          }
        />
      ))}
      {isMantraComplete && (
        <View style={styles.completionFooter}>
          <TouchableOpacity
            style={styles.goldActionBtn}
            onPress={() => returnToDashboard(true)}
          >
            <Text style={styles.goldActionBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  fullscreenBg: { flex: 1 },
  safeArea: { flex: 1 },
  repSelectionScroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 48,
  },
  repHeadline: {
    fontFamily: Fonts.serif.bold,
    fontSize: 30,
    lineHeight: 38,
    color: "#432104",
    textAlign: "center",
    marginBottom: 12,
  },
  repSubtext: {
    fontFamily: Fonts.serif.regular,
    fontSize: 17,
    lineHeight: 28,
    color: "#6B4E31",
    textAlign: "center",
    marginBottom: 28,
    maxWidth: 320,
  },
  repMandalaWrap: {
    width: "100%",
    alignItems: "center",
    marginBottom: 26,
  },
  repMandalaOuter: {
    width: 280,
    height: 280,
    alignItems: "center",
    justifyContent: "center",
  },
  repMandalaGlow: {
    position: "absolute",
    width: 280,
    height: 280,
    opacity: 0.95,
  },
  repMandalaInner: {
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 2,
    borderColor: "rgba(233, 190, 111, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#D9A557",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 6,
  },
  repMandalaCount: {
    fontFamily: Fonts.serif.bold,
    fontSize: 52,
    lineHeight: 58,
    color: "#6B4318",
    marginBottom: 8,
  },
  repMandalaLabel: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#6B4E31",
  },
  repOptionsRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 28,
  },
  repOptionPill: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "rgba(232, 197, 135, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#CFA65C",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  repOptionPillSelected: {
    backgroundColor: "#D9A012",
    borderColor: "#D9A012",
  },
  repOptionCheck: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  repOptionText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: "#6B4E31",
  },
  repOptionTextSelected: {
    color: "#FFFFFF",
  },
  repBeginBtn: {
    width: "100%",
    maxWidth: 310,
    borderRadius: 34,
    backgroundColor: "#E0B13A",
    padding: 4,
    marginBottom: 16,
    shadowColor: "#C8921F",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 6,
  },
  repBeginBtnInner: {
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E0B13A",
    alignItems: "center",
    justifyContent: "center",
  },
  repBeginBtnText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: "#FFFFFF",
  },
  repFooterCopy: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    lineHeight: 28,
    color: "#6B4E31",
    textAlign: "center",
    maxWidth: 320,
    marginBottom: 18,
  },
  mantraCompleteScroll: {
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 42,
    alignItems: "center",
  },
  mantraCompleteHeadline: {
    fontFamily: Fonts.serif.bold,
    fontSize: 28,
    lineHeight: 36,
    color: "#432104",
    textAlign: "center",
    marginBottom: 8,
  },
  mantraCompleteSubtext: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    lineHeight: 28,
    color: "#432104",
    textAlign: "center",
    maxWidth: 320,
    marginBottom: 20,
  },
  mantraCompleteLotusWrap: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  mantraCompleteLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(232, 197, 135, 0.7)",
  },
  mantraReflectionCard: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#E2B24A",
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.28)",
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 28,
    alignItems: "center",
    marginBottom: 20,
  },
  mantraReflectionHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  mantraReflectionHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(232, 197, 135, 0.55)",
  },
  mantraReflectionLabel: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: "#432104",
    marginHorizontal: 12,
  },
  mantraDurationCard: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(232, 197, 135, 0.6)",
    backgroundColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginBottom: 22,
  },
  mantraDurationLabel: {
    fontFamily: Fonts.sans.bold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.8,
    color: "#C89C44",
    marginBottom: 10,
  },
  mantraDurationValue: {
    fontFamily: Fonts.sans.bold,
    fontSize: 28,
    color: "#432104",
  },
  mantraFeedbackTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 20,
    color: "#C89C44",
    textAlign: "center",
    marginBottom: 10,
  },
  mantraFeedbackMessage: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    lineHeight: 28,
    color: "#432104",
    textAlign: "center",
    marginBottom: 14,
  },
  mantraFeedbackSub: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    lineHeight: 26,
    color: "#8C8881",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 18,
  },
  mantraRetryCtaBox: {
    width: "100%",
    borderRadius: 22,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#D9A012",
    backgroundColor: "rgba(255,248,235,0.7)",
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  mantraRetryCtaText: {
    fontFamily: Fonts.sans.bold,
    fontSize: 15,
    lineHeight: 24,
    color: "#432104",
    textAlign: "center",
  },
  mantraPointsList: {
    width: "100%",
    gap: 10,
  },
  mantraPointRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  mantraPointDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#D9A012",
    marginRight: 10,
  },
  mantraPointText: {
    flex: 1,
    fontFamily: Fonts.sans.medium,
    fontSize: 16,
    color: "#615247",
  },
  recommendedBadge: {
    alignSelf: "flex-end",
    marginRight: 14,
    marginTop: -12,
    marginBottom: 8,
    backgroundColor: "#D6B05B",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  recommendedBadgeText: {
    fontFamily: Fonts.sans.bold,
    fontSize: 12,
    letterSpacing: 1.4,
    color: "#FFFFFF",
  },
  mantraRepeatBtn: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "#D6A43A",
    backgroundColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  mantraRepeatBtnText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: "#432104",
  },
  sankalpConfirmScroll: {
    paddingHorizontal: 22,
    paddingTop: 44,
    paddingBottom: 42,
    alignItems: "center",
  },
  sankalpConfirmHeadline: {
    fontFamily: Fonts.serif.bold,
    fontSize: 34,
    lineHeight: 50,
    color: "#432104",
    textAlign: "center",
    maxWidth: 320,
    marginBottom: 18,
  },
  sankalpConfirmSubtext: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    lineHeight: 40,
    color: "#615247",
    textAlign: "center",
    maxWidth: 330,
    marginBottom: 18,
  },
  sankalpLotusDivider: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  sankalpLotusLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(232, 197, 135, 0.72)",
  },
  sankalpPointsCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "#D9A012",
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  sankalpPointCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  sankalpPointsDivider: {
    width: 1,
    marginHorizontal: 8,
    backgroundColor: "rgba(232, 197, 135, 0.7)",
  },
  sankalpPointFallbackIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(217, 160, 18, 0.18)",
  },
  sankalpPointLabel: {
    fontFamily: Fonts.sans.bold,
    fontSize: 17,
    lineHeight: 24,
    color: "#432104",
    textAlign: "center",
  },
  sankalpRepeatBtn: {
    width: "100%",
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    borderColor: "#D6A43A",
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  sankalpRepeatBtnText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 19,
    color: "#432104",
  },
  sankalpHomeBtn: {
    width: "100%",
    height: 62,
    borderRadius: 31,
    backgroundColor: "#E0B13A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#C8921F",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 6,
  },
  sankalpHomeBtnText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 19,
    color: "#432104",
  },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(117, 86, 51, 0.45)",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  skipText: {
    color: "#FFF",
    fontFamily: Fonts.serif.bold,
    fontSize: 16,
    marginRight: 2,
  },
  prepTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "ios" ? 56 : 28,
  },
  prepBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  prepContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 84,
  },
  prepSentence: {
    fontFamily: Fonts.serif.bold,
    fontSize: 34,
    lineHeight: 44,
    color: "#FFF",
    textAlign: "center",
    maxWidth: 320,
    textShadowColor: "rgba(55,30,0,0.45)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  prepBottomPanel: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 54,
  },
  prepAudioLabel: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 0.2,
    textShadowColor: "rgba(55,30,0,0.35)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  prepHeadphoneText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.92)",
    textAlign: "center",
  },
  scrollContent: { padding: 24, alignItems: "center" },
  pauseHeader: { alignItems: "center", marginBottom: 30 },
  pauseTitle: {
    fontFamily: Fonts.serif.regular,
    fontSize: 38,
    color: "#432104",
  },
  pauseSub: { fontFamily: Fonts.sans.regular, fontSize: 18, color: "#615247" },
  instructionsCard: {
    width: "100%",
    padding: 24,
    borderWidth: 1.5,
    borderColor: "rgba(196,164,92,0.3)",
    borderRadius: 24,
    // backgroundColor: "#FFF",
    gap: 12,
  },
  stepItem: { flexDirection: "row", gap: 12 },
  stepNum: { fontFamily: Fonts.sans.bold, color: "#CA8A04" },
  stepText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 16,
    color: "#615247",
    flex: 1,
  },
  selectionCard: { width: "100%", alignItems: "center", marginTop: 30 },
  currentDurVal: { fontSize: 20, color: "#432104", marginBottom: 10 },
  beginBtn: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    backgroundColor: "#CA8A04",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  beginBtnText: { color: "#FFF", fontSize: 18, fontWeight: "600" },
  timerOrbArea: {
    width: 260,
    height: 260,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  orbInner: { alignItems: "center", zIndex: 2 },
  timeStr: { fontSize: 56, color: "#432104" },
  orbLabel: { fontSize: 13, color: "#615247", opacity: 0.6 },
  lotusTimer: {
    position: "absolute",
    bottom: -20,
    width: 180,
    height: 100,
    opacity: 0.3,
  },
  pauseActions: { width: "100%", marginTop: 40, gap: 16, alignItems: "center" },
  goldActionBtn: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    backgroundColor: "#CA8A04",
    alignItems: "center",
    justifyContent: "center",
  },
  goldActionBtnText: { color: "#FFF", fontSize: 18, fontWeight: "600" },
  returnLink: {
    color: "#8c8881",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  embodyContainer: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  quoteWrap: { marginVertical: 20 },
  sankalpText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 28,
    color: "#432104",
    textAlign: "center",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 20,
  },
  line: { flex: 1, height: 1, backgroundColor: "#d9a557", width: 80 },
  diamond: {
    width: 6,
    height: 6,
    backgroundColor: "#d9a557",
    transform: [{ rotate: "45deg" }],
  },
  embodyInstr: {
    fontSize: 18,
    color: "#615247",
    textAlign: "center",
    marginBottom: 30,
  },
  holdTarget: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  embodyCoinWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  embodyImg: { width: 150, height: 150, opacity: 0.8 },
  sankalpActivatingText: {
    marginTop: 18,
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#615247",
    textAlign: "center",
  },
  supportHeader: { width: "100%", alignItems: "center", marginBottom: 24 },
  supportHeadline: {
    fontFamily: Fonts.serif.bold,
    fontSize: 28,
    color: "#432104",
  },
  supportSub: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#615247",
    textAlign: "center",
  },
  supportPracticeScroll: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
    alignItems: "center",
  },
  supportPracticeHeader: {
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
  },
  supportPracticeTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 28,
    lineHeight: 36,
    color: "#432104",
    textAlign: "center",
    marginBottom: 8,
  },
  supportPracticeSubtitle: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    lineHeight: 26,
    color: "#615247",
    textAlign: "center",
    maxWidth: 330,
  },
  supportActions: {
    width: "100%",
    gap: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  supportOutlineBtn: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "#D6A43A",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  supportOutlineBtnText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: "#432104",
  },
  supportInfoCard: {
    width: "100%",
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: "rgba(196, 164, 92, 0.35)",
    borderRadius: 20,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  supportInfoTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: "#432104",
    textAlign: "center",
    marginBottom: 10,
  },
  supportInfoText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    lineHeight: 26,
    color: "#432104",
    textAlign: "center",
  },
  supportBenefitItem: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    lineHeight: 26,
    color: "#432104",
    marginBottom: 6,
  },
  completionFooter: { width: "100%", padding: 20 },
  runnerFooterExtra: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 40,
  },
  triggerRunnerActions: {
    width: "100%",
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  mantraCollapsibleGroup: {
    width: "100%",
    gap: 12,
  },
  card: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E8C587",
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  cardExpanded: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
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
  headerLabelGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardLabel: {
    fontSize: 18,
    fontFamily: Fonts.serif.bold,
    color: "#432104",
    marginHorizontal: 12,
  },
  toggleIcon: {
    fontSize: 12,
    color: "#D4A017",
    marginLeft: 4,
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
});

export default PracticeRunnerContainer;

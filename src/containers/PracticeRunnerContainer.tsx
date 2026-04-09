import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Platform,
  SafeAreaView,
  Image,
  ScrollView,
} from "react-native";
import { Audio } from "expo-av";
import { useScreenStore } from "../engine/useScreenBridge";
import { executeAction } from "../engine/actionExecutor";
import BlockRenderer from "../engine/BlockRenderer";
import MicroCompletion from "../components/HabitLoop/MicroCompletion";
import MalaMantraCounter from "../components/MalaMantraCounter";
import { Fonts } from "../theme/fonts";
import { RefreshCw, ChevronRight, Check, ChevronLeft } from "lucide-react-native";
import Slider from "@react-native-community/slider";

const { width } = Dimensions.get("window");

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

const PracticeRunnerContainer: React.FC<PracticeRunnerContainerProps> = ({ schema }) => {
  const {
    screenData: screenState,
    loadScreen,
    goBack,
    currentStateId,
    updateScreenData,
    updateBackground,
  } = useScreenStore();

  const [count, setCount] = useState(0);
  const [sessionStartTime] = useState(Date.now());
  const [showMicroWin, setShowMicroWin] = useState(false);
  const [microWinMessage, setMicroWinMessage] = useState("");
  const [mediaMuted, setMediaMuted] = useState(false);
  
  // Prep Flow State
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const prepAudioRef = useRef<Audio.Sound | null>(null);
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
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const embodyAudioRef = useRef<Audio.Sound | null>(null);

  const currentVariant = schema?.variant || currentStateId;
  
  // ── Variant Detection ──
  const isMantraRunner = currentVariant === "mantra_runner";
  const isSankalpEmbody = currentVariant === "sankalp_embody";
  const isSankalpConfirm = currentVariant === "sankalp_confirm";
  const isRepSelection = currentVariant === "mantra_rep_selection";
  const isMantraPrep = currentVariant === "mantra_prep";
  const isSacredPause = currentVariant === "sacred_pause";
  const isMantraComplete = currentVariant === "mantra_complete";
  const selectedRepCount = Number(screenState.reps_total) || 27;
  const buildActionContext = () => ({
    loadScreen,
    goBack,
    setScreenValue: (value: any, key: string) => updateScreenData(key, value),
    screenState: { ...screenState },
  });

  const isTriggerSession = useMemo(() => {
    return (
      schema?.is_trigger ||
      currentStateId === "free_mantra_chanting" ||
      currentStateId === "post_trigger_mantra" ||
      currentStateId === "trigger_practice_runner" ||
      screenState.source === "support" ||
      screenState._active_support_item?.source === "support"
    );
  }, [schema, currentStateId, screenState]);

  // ── Session Metrics & Exit Logic ──
  const getRunnerType = () => {
    const v = schema?.variant || "";
    if (v.includes("mantra_runner")) return "mantra_runner";
    if (v.includes("mantra_prep")) return "mantra_prep";
    if (v.includes("sacred_pause") || v.includes("anchor")) return "anchor_timer";
    if (v.includes("practice_step")) return "practice_step_runner";
    return v;
  };

  const getSessionMeta = () => {
    const activeItem = screenState.runner_active_item || {};
    return {
      itemType: activeItem.item_type || schema?.variant?.replace("_runner", "") || "unknown",
      itemId: activeItem.item_id || screenState.mantra_id || "",
      source: activeItem.source || "core",
      runnerType: getRunnerType(),
    };
  };

  const handleSessionExit = async () => {
    const meta = getSessionMeta();
    const durationSeconds = Math.round((Date.now() - sessionStartTime) / 1000);
    
    // Submit Session Abandoned
    executeAction({
      type: "submit",
      payload: {
        type: currentStateId === "free_mantra_chanting" ? "trigger_session_abandoned" : "session_abandoned",
        source: "support",
        ...meta,
        repsCompleted: count,
        durationSeconds,
      }
    }, buildActionContext());

    // Navigate to Target
    const exitTargets: Record<string, any> = {
      mantra_runner: { container_id: "practice_runner", state_id: "mantra_rep_selection" },
      mantra_prep: { container_id: "practice_runner", state_id: "mantra_rep_selection" },
      anchor_timer: { container_id: "practice_runner", state_id: "anchor_duration_picker" },
    };
    
    let target = exitTargets[meta.runnerType];
    if (isTriggerSession) {
      target = currentStateId === "free_mantra_chanting" 
        ? { container_id: "companion_dashboard", state_id: "day_active" }
        : { container_id: "awareness_trigger", state_id: "trigger_advice_reveal" };
    }

    executeAction({ type: "navigate", target: target || { container_id: "companion_dashboard", state_id: "day_active" } }, buildActionContext());
  };

  // ── Screen-Aware Mantra Content ──
  const _isTriggerScreen = currentStateId === "free_mantra_chanting" || currentStateId === "post_trigger_mantra";
  const _isCheckinSupportScreen = currentStateId === "checkin_support_mantra" || currentStateId === "checkin_breath_reset";

  const mantraDisplayTitle = useMemo(() => {
    if (_isTriggerScreen) return screenState.trigger_mantra_text || "OM";
    if (_isCheckinSupportScreen) return screenState.checkin_mantra_text || screenState.runner_active_item?.title || "";
    return screenState.runner_active_item?.title || screenState.mantra_title || "";
  }, [screenState, _isTriggerScreen, _isCheckinSupportScreen]);

  const mantraText = useMemo(() => {
    if (_isTriggerScreen) return screenState.trigger_mantra_text || "";
    if (_isCheckinSupportScreen) return screenState.checkin_mantra_text || screenState.runner_active_item?.iast || "";
    return screenState.runner_active_item?.iast || screenState.mantra_text || schema.mantra_text || "";
  }, [screenState, _isTriggerScreen, _isCheckinSupportScreen, schema]);

  const mantraHindi = useMemo(() => {
    if (_isTriggerScreen) return screenState.trigger_mantra_devanagari || "ॐ";
    if (_isCheckinSupportScreen) return screenState.checkin_mantra_devanagari || screenState.runner_active_item?.devanagari || "";
    return screenState.runner_active_item?.devanagari || screenState.mantra_devanagari || schema.mantra_hindi_text || "";
  }, [screenState, _isTriggerScreen, _isCheckinSupportScreen, schema]);

  const mantraAudioUrl = useMemo(() => {
    if (currentStateId === "free_mantra_chanting" || currentStateId === "checkin_breath_reset") return screenState._selected_om_audio || "";
    if (_isTriggerScreen || _isCheckinSupportScreen) return screenState.runner_active_item?.audio_url || screenState._selected_om_audio || "";
    return screenState.runner_active_item?.audio_url || screenState.master_mantra?.audio_url || "";
  }, [screenState, currentStateId, _isTriggerScreen, _isCheckinSupportScreen]);

  // ── Background Handling ──
  useEffect(() => {
    let bg = require("../../assets/mantra3.png");
    if (currentVariant === "mantra_prep") bg = require("../../assets/mantra_relaxing.png");
    if (currentVariant === "mantra_rep_selection") bg = require("../../assets/beige_bg.png");
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
        { shouldPlay: true, isLooping: false, volume: 1 }
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
            prev === nextSentenceIndex ? prev : nextSentenceIndex
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

        const flowEnd = timings[sentences.length] ?? timings[timings.length - 1];
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
      setTimeLeft(prev => {
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
    if (isHolding) return;
    setIsHolding(true);
    let progress = 0;
    holdTimerRef.current = setInterval(() => {
      progress += 2.5;
      setHoldProgress(progress);
      if (progress >= 100) {
        clearInterval(holdTimerRef.current!);
        setIsHolding(false);
        const action = schema.on_complete || schema.complete_action;
        if (action) executeAction(action, buildActionContext());
      }
    }, 30);
  };

  const returnToDashboard = (completed = true) => {
    const messages = ["You showed up today.", "Stillness stays with you.", "Something shifts.", "Body remembers."];
    setMicroWinMessage(messages[Math.floor(Math.random() * messages.length)]);
    setShowMicroWin(true);
    setTimeout(() => {
      executeAction({
        type: "submit",
        payload: { practiceId: schema.id || "practice", completed },
        target: { container_id: "companion_dashboard", state_id: "day_active" }
      }, buildActionContext());
    }, 2500);
  };

  // ── Render Components ──
  if (isRepSelection) {
    const headlineBlock = schema.blocks?.find((block: any) => block.type === "headline");
    const subtextBlock = schema.blocks?.find((block: any) => block.type === "subtext" && block.variant !== "link");
    const repOptions = schema.blocks?.find((block: any) => block.type === "option_picker")?.options || [9, 18, 27, 54, 108];
    const beginAction = schema.blocks?.find((block: any) => block.id === "begin_mantra_practice")?.action || {
      type: "navigate",
      target: { container_id: "practice_runner", state_id: "mantra_prep" },
    };

    return (
      <ImageBackground source={require("../../assets/beige_bg.png")} style={styles.fullscreenBg} resizeMode="cover">
        <ScrollView contentContainerStyle={styles.repSelectionScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.repHeadline}>{headlineBlock?.content || "Choose Your Chant Count"}</Text>
          <Text style={styles.repSubtext}>{subtextBlock?.content || "Set the number of chants for this session."}</Text>

          <View style={styles.repMandalaWrap}>
            <View style={styles.repMandalaOuter}>
              <Image source={require("../../assets/lotus_glow.png")} style={styles.repMandalaGlow} resizeMode="contain" />
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
                  style={[styles.repOptionPill, selected && styles.repOptionPillSelected]}
                  onPress={() => updateScreenData("reps_total", option)}
                >
                  {selected && (
                    <View style={styles.repOptionCheck}>
                      <Check size={12} color="#D9A012" strokeWidth={3} />
                    </View>
                  )}
                  <Text style={[styles.repOptionText, selected && styles.repOptionTextSelected]}>{option}</Text>
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
            onPress={() => loadScreen({ container_id: "companion_dashboard", state_id: "day_active" })}
            activeOpacity={0.7}
          >
            <Text style={styles.returnLink}>Return to Mitra Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </ImageBackground>
    );
  }

  if (isMantraRunner) {
    const target = Number(screenState.reps_total) || schema.target_count || 9;
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
              if (action) setTimeout(() => executeAction(action, buildActionContext()), 1000);
            }
          }}
          onExit={handleSessionExit}
          triggerHeadline={isTriggerSession ? (currentStateId === "free_mantra_chanting" ? "Pause before this grows." : "Stay with this.") : ""}
          triggerSubtext={isTriggerSession ? (currentStateId === "free_mantra_chanting" ? "Intensity will soften." : "") : ""}
        />
        {showMicroWin && <MicroCompletion message={microWinMessage} onDismiss={() => setShowMicroWin(false)} />}
      </View>
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
      <ImageBackground source={require("../../assets/mantra_relaxing.png")} style={styles.fullscreenBg} resizeMode="cover">
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.prepTopBar}>
            <TouchableOpacity style={styles.prepBackBtn} onPress={handleSessionExit} activeOpacity={0.8}>
              <ChevronLeft size={22} color="#5C3A12" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipBtn} onPress={finishPrep} activeOpacity={0.85}>
              <Text style={styles.skipText}>Skip</Text>
              <ChevronRight size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.prepContent}>
            <Text style={styles.prepSentence}>{sentences[currentSentenceIndex]}</Text>
          </View>

          <View style={styles.prepBottomPanel}>
            <Text style={styles.prepAudioLabel}>|| Audio Guidance Playing ||</Text>
            <Text style={styles.prepHeadphoneText}>
              {schema.prep_config?.headphone_text || "Use headphone for the best experience"}
            </Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (isSacredPause) {
    const steps = (screenState.info?.steps_text || "").split("\n").filter(Boolean);
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.pauseHeader}>
          <Text style={styles.pauseTitle}>{schema.pause_config?.title || "Sacred Pause"}</Text>
          <Text style={styles.pauseSub}>{schema.pause_config?.subtitle || "Take a moment"}</Text>
        </View>

        <View style={styles.instructionsCard}>
          {(steps.length > 0 ? steps : (schema.pause_config?.default_steps || [])).map((step: string, i: number) => (
            <View key={i} style={styles.stepItem}>
              <Text style={styles.stepNum}>{i + 1}.</Text>
              <Text style={styles.stepText}>{step.replace(/^\d+\.\s*/, "")}</Text>
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
            <TouchableOpacity style={styles.beginBtn} onPress={() => startPauseTimer(selectedDuration * 60)}>
              <Text style={styles.beginBtnText}>Begin Practice</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.timerOrbArea}>
            <View style={styles.orbInner}>
              <Text style={styles.timeStr}>{`${m}:${s.toString().padStart(2, "0")}`}</Text>
              <Text style={styles.orbLabel}>REMAINING</Text>
              <TouchableOpacity onPress={resetPauseTimer}>
                <RefreshCw size={24} color="#615247" />
              </TouchableOpacity>
            </View>
            <Image source={require("../../assets/mantra-lotus-3d.svg")} style={styles.lotusTimer} />
          </View>
        )}

        <View style={styles.pauseActions}>
          <TouchableOpacity style={styles.goldActionBtn} onPress={() => goBack()}>
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
    const text = screenState.runner_active_item?.line || screenState.sankalp_text || "";
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
        <Text style={styles.embodyInstr}>{schema.embody_config?.instruction || "Hold the icon below to embody."}</Text>
        
        <TouchableOpacity 
          style={styles.holdTarget} 
          onLongPress={startEmbody} 
          delayLongPress={100}
          activeOpacity={0.8}
        >
          <Image source={require("../../assets/namaste.png")} style={[styles.embodyImg, isHolding && { transform: [{ rotateY: "180deg" }] }]} />
        </TouchableOpacity>
        
        <TouchableOpacity style={{ marginTop: 40 }} onPress={() => returnToDashboard(false)}>
          <Text style={styles.returnLink}>Return to Mitra Home</Text>
        </TouchableOpacity>
      </View>
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
          block={block.type === 'audio_player' ? { ...block, audio_url: mantraAudioUrl } : block} 
        />
      ))}
      {isMantraComplete && (
        <View style={styles.completionFooter}>
          <TouchableOpacity style={styles.goldActionBtn} onPress={() => returnToDashboard(true)}>
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
  skipText: { color: "#FFF", fontFamily: Fonts.serif.bold, fontSize: 16, marginRight: 2 },
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
  pauseTitle: { fontFamily: Fonts.serif.regular, fontSize: 38, color: "#432104" },
  pauseSub: { fontFamily: Fonts.sans.regular, fontSize: 18, color: "#615247" },
  instructionsCard: {
    width: "100%",
    padding: 24,
    borderWidth: 1.5,
    borderColor: "rgba(196,164,92,0.3)",
    borderRadius: 24,
    backgroundColor: "#FFF",
    gap: 12,
  },
  stepItem: { flexDirection: "row", gap: 12 },
  stepNum: { fontFamily: Fonts.sans.bold, color: "#CA8A04" },
  stepText: { fontFamily: Fonts.sans.regular, fontSize: 16, color: "#615247", flex: 1 },
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
  timerOrbArea: { width: 260, height: 260, alignItems: "center", justifyContent: "center", marginTop: 20 },
  orbInner: { alignItems: "center", zIndex: 2 },
  timeStr: { fontSize: 56, color: "#432104" },
  orbLabel: { fontSize: 13, color: "#615247", opacity: 0.6 },
  lotusTimer: { position: "absolute", bottom: -20, width: 180, height: 100, opacity: 0.3 },
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
  returnLink: { color: "#8c8881", fontSize: 14, textDecorationLine: "underline" },
  embodyContainer: { flex: 1, padding: 20, alignItems: "center", justifyContent: "center" },
  quoteWrap: { marginVertical: 20 },
  sankalpText: { fontFamily: Fonts.serif.bold, fontSize: 28, color: "#432104", textAlign: "center" },
  divider: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: "#d9a557", width: 80 },
  diamond: { width: 6, height: 6, backgroundColor: "#d9a557", transform: [{ rotate: "45deg" }] },
  embodyInstr: { fontSize: 18, color: "#615247", textAlign: "center", marginBottom: 30 },
  holdTarget: { width: 200, height: 200, borderRadius: 100, alignItems: "center", justifyContent: "center" },
  embodyImg: { width: 150, height: 150, opacity: 0.8 },
  supportHeader: { width: "100%", alignItems: "center", marginBottom: 24 },
  supportHeadline: { fontFamily: Fonts.serif.bold, fontSize: 28, color: "#432104" },
  supportSub: { fontFamily: Fonts.sans.regular, fontSize: 14, color: "#615247", textAlign: "center" },
  completionFooter: { width: "100%", padding: 20 },
});

export default PracticeRunnerContainer;

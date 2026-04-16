import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { Volume2, VolumeX } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { executeAction } from "../../../engine/actionExecutor";
import { useScreenStore } from "../../../engine/useScreenBridge";
import store from "../../../store";
import { screenActions } from "../../../store/screenSlice";
import { Fonts } from "../../../theme/fonts";

interface Props {
  block?: any;
}

const GriefRoomContainer: React.FC<Props> = () => {
  const { screenData, loadScreen, goBack } = useScreenStore();
  const updateBackground = useScreenStore(
    (state: any) => state.updateBackground,
  );
  const updateHeaderHidden = useScreenStore(
    (state: any) => state.updateHeaderHidden,
  );
  useEffect(() => {
    const updatedBackground = require("../../../../assets/beige_bg.png");

    updateBackground(updatedBackground);
    updateHeaderHidden(false);
    return () => updateHeaderHidden(false);
  }, [updateBackground, updateHeaderHidden]);
  const [step, setStep] = useState<
    "opening" | "options" | "input" | "breath" | "stay"
  >("opening");
  const [breathText, setBreathText] = useState("Inhale");
  const [timerSeconds, setTimerSeconds] = useState(540); // 9 minutes
  const [inputValue, setInputValue] = useState("");
  const [actionsUsed, setActionsUsed] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const fade1 = useRef(new Animated.Value(0)).current;
  const fade2 = useRef(new Animated.Value(0)).current;
  const dotScale = useRef(new Animated.Value(1)).current;

  const ctx = (screenData as any).grief_context || {
    opening_line:
      "You don't have to say anything yet. Sit with me for a moment.",
    second_beat_line:
      "Would a slow breath help right now? Or would you rather just stay quiet together?",
  };

  useEffect(() => {
    // Stage 1: Opening line
    Animated.timing(fade1, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    // Stage 2: Reveal options after 2s (or on user tap)
    const timer = setTimeout(() => {
      revealOptions();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Breathing orchestration
  useEffect(() => {
    if (step !== "breath") return;

    let timerInterval: any;

    // Timer countdown
    timerInterval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const runBreathCycle = () => {
      setBreathText("Inhale");
      Animated.timing(dotScale, {
        toValue: 2.2,
        duration: 4000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }).start(() => {
        setBreathText("Exhale");
        Animated.timing(dotScale, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }).start(() => {
          // Check if we are still in breath mode before looping
          runBreathCycle();
        });
      });
    };

    runBreathCycle();

    return () => {
      clearInterval(timerInterval);
    };
  }, [step]);

  // Audio for "Just Sit"
  useEffect(() => {
    if (step === "stay") {
      const playSound = async () => {
        try {
          const { sound } = await Audio.Sound.createAsync(
            require("../../../../assets/sounds/Om.mp4"),
            { isLooping: true, shouldPlay: true, isMuted: isMuted },
          );
          soundRef.current = sound;
        } catch (err) {
          console.warn("[GriefRoom] Failed to load Om audio:", err);
        }
      };
      playSound();
    } else {
      if (soundRef.current) {
        soundRef.current.stopAsync();
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.stopAsync();
        soundRef.current.unloadAsync();
      }
    };
  }, [step]);

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.setIsMutedAsync(isMuted);
    }
  }, [isMuted]);

  const revealOptions = () => {
    if (step === "options" || step === "input") return;
    setStep("options");
    Animated.timing(fade2, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const dispatch = (
    actionType: string,
    actionTarget?: any,
    actionPayload?: any,
  ) => {
    if (actionType !== "exit_grief_room") {
      setActionsUsed((prev) => [...new Set([...prev, actionType])]);
    }
    executeAction(
      { type: actionType, target: actionTarget, payload: actionPayload },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          store.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: store.getState().screen.screenData,
      },
    );
  };

  const handleInputSubmit = () => {
    dispatch("grief_voice_note_submitted", {
      text: inputValue,
      length_chars: inputValue.length,
      duration_sec: 0, // Local text fallback for now
    });
    setInputValue("");
    setStep("options");
  };

  const renderOptions = () => (
    <Animated.View style={[styles.optionsStack, { opacity: fade2 }]}>
      <Text style={styles.secondBeat}>{ctx.second_beat_line}</Text>

      <TouchableOpacity style={styles.pill} onPress={() => setStep("breath")}>
        <Text style={styles.pillText}>Breathe slow with me</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.pill} onPress={() => setStep("input")}>
        <Text style={styles.pillText}>I want to speak</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.pill}
        onPress={() =>
          dispatch(
            "start_runner",
            { container_id: "cycle_transitions", state_id: "view_info" },
            {
              source: "support_grief",
              variant: "mantra",
              target_reps: 27,
              item: ctx.grief_mantra,
            },
          )
        }
      >
        <Text style={styles.pillText}>A mantra for holding this</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.pill} onPress={() => setStep("stay")}>
        <Text style={styles.pillText}>Just sit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.exitBtn}
        onPress={() =>
          dispatch("exit_grief_room", null, { actions_used: actionsUsed })
        }
      >
        <Text style={styles.exitText}>I'll go now</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderBreath = () => {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    const timeStr = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

    return (
      <View style={styles.breathContainer}>
        <Text style={styles.mudraLabel}>
          {ctx.slow_breath?.title ||
            ctx.slow_breath?.label ||
            "Guided Breathing"}
        </Text>

        <View style={styles.orbOuter}>
          <Animated.View
            style={[styles.orbWrapper, { transform: [{ scale: dotScale }] }]}
          >
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.45)", "rgba(235, 215, 190, 0.2)"]}
              style={styles.orbGradient}
            >
              <Text style={styles.breathActionText}>{breathText}</Text>
            </LinearGradient>
          </Animated.View>
          {/* Subtle water-drop highlight */}
          <View style={styles.orbHighlight} />
        </View>

        <Text style={styles.timerText}>{timeStr}</Text>

        <TouchableOpacity
          style={styles.endPracticeBtn}
          onPress={() => setStep("options")}
        >
          <Text style={styles.endPracticeText}>
            I want to end this practice
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exitBtn}
          onPress={() =>
            dispatch("exit_grief_room", null, { actions_used: actionsUsed })
          }
        >
          <Text style={styles.exitText}>I'll go now</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderStay = () => (
    <View style={styles.stayContainer}>
      <View style={styles.stayTopRow}>
        <TouchableOpacity
          style={styles.floatingMuteBtn}
          onPress={() => setIsMuted(!isMuted)}
        >
          {isMuted ? (
            <VolumeX size={24} color="#564B42" />
          ) : (
            <Volume2 size={24} color="#564B42" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.stayContent}>
        <Image
          source={require("../../../../assets/DailyOm.png")}
          style={styles.stayOmIcon}
          resizeMode="contain"
        />

        <Text style={styles.stayQuote}>
          Come, let's sit together in this quiet.{"\n"}
          There's nothing for you to do.{"\n"}
          You're exactly where you need to be{"\n"}
          right now.
        </Text>
      </View>

      <View style={styles.stayFooter}>
        <TouchableOpacity
          style={styles.stayBackBtn}
          onPress={() => setStep("options")}
        >
          <Text style={styles.stayBackText}>I'll go now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderInput = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.inputWrap}
    >
      <Text style={styles.inputPrompt}>Say whatever needs saying</Text>
      <TextInput
        autoFocus
        style={styles.input}
        placeholder="Share your thoughts..."
        placeholderTextColor="#8a7d6b"
        value={inputValue}
        onChangeText={setInputValue}
        multiline
        maxLength={1500}
      />
      <View style={styles.inputActions}>
        <TouchableOpacity style={styles.pill} onPress={handleInputSubmit}>
          <Text style={styles.pillText}>Submit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setStep("options")}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={styles.root}
      onPress={revealOptions}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fade1, alignItems: "center" }}>
          <Text style={styles.openingLine}>{ctx.opening_line}</Text>

          {step === "opening" && (
            <Animated.View
              style={[styles.dot, { transform: [{ scale: dotScale }] }]}
            />
          )}
        </Animated.View>

        {step === "options" && renderOptions()}
        {step === "input" && renderInput()}
        {step === "breath" && renderBreath()}
        {step === "stay" && renderStay()}
      </ScrollView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 60,
    alignItems: "center",
  },
  openingLine: {
    fontFamily: Fonts.sans.medium,
    fontSize: 24,
    color: "#432104",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D4A017",
    opacity: 0.6,
  },
  // Breath Interaction Styles
  breathContainer: {
    width: "100%",
    alignItems: "center",
    paddingTop: 10,
  },
  breathHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 60,
  },
  backArrow: {
    fontSize: 28,
    color: "#c89a47",
    fontFamily: Fonts.serif.regular,
  },
  mudraLabel: {
    fontFamily: Fonts.serif.regular,
    fontSize: 24,
    color: "#432104",
    marginBottom: 60,
    textAlign: "center",
  },
  orbOuter: {
    width: 220,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 60,
  },
  orbWrapper: {
    width: 140,
    height: 140,
    borderRadius: 110,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(191, 138, 74, 0.25)",
    elevation: 4,
    shadowColor: "#BF8A4A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  orbGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 253, 249, 0.2)",
  },
  orbHighlight: {
    position: "absolute",
    top: "15%",
    left: "25%",
    width: 40,
    height: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    transform: [{ rotate: "-15deg" }],
    pointerEvents: "none",
  },
  breathActionText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 22,
    color: "#564B42",
  },
  timerText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 28,
    color: "#432104",
    letterSpacing: 2,
    marginBottom: 100,
  },
  endPracticeBtn: {
    paddingVertical: 12,
  },
  endPracticeText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: "#8a7d6b",
    textDecorationLine: "underline",
  },
  // Stay Interaction Styles
  stayContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingBottom: 60,
  },
  stayTopRow: {
    width: "100%",
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  floatingMuteBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  stayContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  stayOmIcon: {
    width: 80,
    height: 80,
    marginBottom: 60,
    opacity: 0.8,
    tintColor: "#BF8A4A",
  },
  stayQuote: {
    fontFamily: Fonts.serif.regular,
    fontSize: 22,
    color: "#564B42",
    textAlign: "center",
    lineHeight: 36,
  },
  stayFooter: {
    alignItems: "center",
    width: "100%",
  },
  stayFooterText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#432104",
    opacity: 0.7,
    marginBottom: 40,
  },
  stayBackBtn: {
    paddingVertical: 10,
  },
  stayBackText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: "#432104",
    textDecorationLine: "underline",
    marginTop: 20,
  },
  secondBeat: {
    fontFamily: Fonts.serif.regular,
    fontSize: 20,
    color: "#564B42",
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 20,
  },
  optionsStack: {
    width: "100%",
    gap: 12,
    marginTop: 10,
  },
  pill: {
    backgroundColor: "#FBF5F5",
    borderColor: "#c89a47",
    borderWidth: 1,
    elevation: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  pillText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 17,
    color: "#432104",
  },
  exitBtn: {
    // marginTop: 40,
    alignItems: "center",
    paddingVertical: 12,
  },
  exitText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: "#432104",
    textDecorationLine: "underline",
  },
  inputWrap: {
    width: "100%",
    alignItems: "center",
  },
  inputPrompt: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#8a7d6b",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    minHeight: 200,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(43, 29, 10, 0.1)",
    padding: 20,
    fontFamily: Fonts.sans.regular,
    fontSize: 16,
    color: "#2b1d0a",
    marginBottom: 24,
    textAlignVertical: "top",
  },
  inputActions: {
    width: "100%",
    gap: 16,
    alignItems: "center",
  },
  cancelText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#8a7d6b",
  },
});

export default GriefRoomContainer;

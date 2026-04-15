import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Fonts } from "../../../theme/fonts";
import { executeAction } from "../../../engine/actionExecutor";
import { useScreenStore } from "../../../engine/useScreenBridge";
import store from "../../../store";
import { screenActions } from "../../../store/screenSlice";

interface Props {
  block?: any;
}

const GriefRoomContainer: React.FC<Props> = () => {
  const { screenData, loadScreen, goBack } = useScreenStore();
  const [step, setStep] = useState<"opening" | "options" | "input">("opening");
  const [inputValue, setInputValue] = useState("");
  const [actionsUsed, setActionsUsed] = useState<string[]>([]);
  
  const fade1 = useRef(new Animated.Value(0)).current;
  const fade2 = useRef(new Animated.Value(0)).current;
  const dotScale = useRef(new Animated.Value(1)).current;

  const ctx = (screenData as any).grief_context || {
    opening_line: "You don't have to say anything yet. I'm here. We can sit.",
    second_beat_line: "Would a slow breath help right now? Or would you rather just stay quiet together?",
  };

  useEffect(() => {
    // Stage 1: Opening line
    Animated.timing(fade1, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    // Subtle breathing dot animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotScale, {
          toValue: 1.3,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(dotScale, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Stage 2: Reveal options after 30s (or on user tap)
    const timer = setTimeout(() => {
      revealOptions();
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const revealOptions = () => {
    if (step === "options" || step === "input") return;
    setStep("options");
    Animated.timing(fade2, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const dispatch = (actionType: string, actionTarget?: any, actionPayload?: any) => {
    if (actionType !== "exit_grief_room") {
      setActionsUsed(prev => [...new Set([...prev, actionType])]);
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
      duration_sec: 0 // Local text fallback for now
    });
    setInputValue("");
    setStep("options");
  };

  const renderOptions = () => (
    <Animated.View style={[styles.optionsStack, { opacity: fade2 }]}>
      <Text style={styles.secondBeat}>{ctx.second_beat_line}</Text>
      
      <TouchableOpacity
        style={styles.pill}
        onPress={() => dispatch("start_runner", 
          { container_id: "practice_runner", state_id: "practice_step_runner" },
          { 
            source: "support_grief", 
            variant: "practice_timer", 
            duration_sec: (ctx.slow_breath?.duration_min || 9) * 60,
            item: ctx.slow_breath 
          }
        )}
      >
        <Text style={styles.pillText}>Breathe slow with me</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.pill}
        onPress={() => setStep("input")}
      >
        <Text style={styles.pillText}>I want to speak</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.pill}
        onPress={() => dispatch("start_runner", 
          { container_id: "practice_runner", state_id: "mantra_runner" },
          { source: "support_grief", variant: "mantra", target_reps: 27, item: ctx.grief_mantra }
        )}
      >
        <Text style={styles.pillText}>A mantra for holding this</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.pill}
        onPress={() => dispatch("grief_stay")}
      >
        <Text style={styles.pillText}>Just sit</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.exitBtn}
        onPress={() => dispatch("exit_grief_room", null, { actions_used: actionsUsed })}
      >
        <Text style={styles.exitText}>I'll go now</Text>
      </TouchableOpacity>
    </Animated.View>
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
      </ScrollView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F4EAD4", // Spec: deep cream, dim ambient
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 100,
    paddingBottom: 60,
    alignItems: "center",
  },
  openingLine: {
    fontFamily: Fonts.serif.regular,
    fontSize: 24,
    color: "#2b1d0a",
    textAlign: "center",
    lineHeight: 34,
    marginBottom: 60,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D4A017",
    opacity: 0.6,
  },
  secondBeat: {
    fontFamily: Fonts.sans.regular,
    fontSize: 16,
    color: "#8a7d6b",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 36,
  },
  optionsStack: {
    width: "100%",
    gap: 12,
  },
  pill: {
    borderWidth: 1,
    borderColor: "rgba(43, 29, 10, 0.15)",
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    backgroundColor: "transparent",
  },
  pillText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 15,
    color: "#2b1d0a",
  },
  exitBtn: {
    marginTop: 40,
    alignItems: "center",
    paddingVertical: 12,
  },
  exitText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#8a7d6b",
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

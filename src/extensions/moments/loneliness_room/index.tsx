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

const LonelinessRoomContainer: React.FC<Props> = () => {
  const { screenData, loadScreen, goBack } = useScreenStore();
  const [step, setStep] = useState<"opening" | "options" | "input">("opening");
  const [inputType, setInputType] = useState<"naming" | "person">("naming");
  const [inputValue, setInputValue] = useState("");
  
  const fade1 = useRef(new Animated.Value(0)).current;
  const fade2 = useRef(new Animated.Value(0)).current;

  const ctx = (screenData as any).loneliness_context || {
    opening_line: "Loneliness is heavy. I'm here with you.",
    second_beat_line: "Not to fix it — just to share the minute.",
  };

  useEffect(() => {
    // Stage 1: Opening line
    Animated.timing(fade1, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      // Stage 2: Second beat after 2 seconds
      setTimeout(() => {
        setStep("options");
        Animated.timing(fade2, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      }, 2000);
    });
  }, [fade1, fade2]);

  const dispatch = (actionType: string, actionTarget?: any, actionPayload?: any) =>
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

  const handleInputSubmit = () => {
    if (inputType === "naming") {
      dispatch("loneliness_named", { text: inputValue });
    } else {
      dispatch("loneliness_person_named", { text: inputValue });
    }
    setInputValue("");
    setStep("options");
  };

  const renderOptions = () => (
    <Animated.View style={[styles.optionsStack, { opacity: fade2 }]}>
      <Text style={styles.offerText}>A few things I can offer, if any land:</Text>
      
      <TouchableOpacity
        style={styles.pill}
        onPress={() => {
          setInputType("naming");
          setStep("input");
        }}
      >
        <Text style={styles.pillText}>Name it with me</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.pill}
        onPress={() => dispatch("start_runner", 
          { container_id: "practice_runner", state_id: "mantra_runner" },
          { source: "support_loneliness", variant: "mantra", target_reps: 27, item: ctx.bhakti_mantra }
        )}
      >
        <Text style={styles.pillText}>Bhakti mantra</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.pill}
        onPress={() => dispatch("start_runner", 
          { container_id: "practice_runner", state_id: "mantra_runner" },
          { source: "support_loneliness", variant: "mantra", target_reps: 11, item: ctx.companioned_chant }
        )}
      >
        <Text style={styles.pillText}>A short chant together</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.pill}
        onPress={() => {
          setInputType("person");
          setStep("input");
        }}
      >
        <Text style={styles.pillText}>Reach out to one person</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.pill}
        onPress={() => dispatch("loneliness_walk_started", null, { duration_min: ctx.walk_duration_min || 10 })}
      >
        <Text style={styles.pillText}>Walk outside for {ctx.walk_duration_min || 10} minutes</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.exitBtn}
        onPress={() => dispatch("exit_loneliness_room")}
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
      <Text style={styles.openingLine}>
        {inputType === "naming" ? "Where does it sit in the body?" : "Who comes to mind?"}
      </Text>
      <TextInput
        autoFocus
        style={styles.input}
        placeholder="Type here..."
        placeholderTextColor="#8a7d6b"
        value={inputValue}
        onChangeText={setInputValue}
        multiline
        maxLength={300}
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
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fade1, marginBottom: 40 }}>
          <Text style={styles.openingLine}>{ctx.opening_line}</Text>
          <Text style={styles.secondBeat}>{ctx.second_beat_line}</Text>
        </Animated.View>

        {step === "options" && renderOptions()}
        {step === "input" && renderInput()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fffdf9", // Spec: warm cream
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 60,
  },
  openingLine: {
    fontFamily: Fonts.serif.regular,
    fontSize: 24,
    color: "#2b1d0a",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 32,
  },
  secondBeat: {
    fontFamily: Fonts.serif.regular,
    fontSize: 24,
    color: "#2b1d0a",
    textAlign: "center",
    lineHeight: 32,
  },
  offerText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    color: "#8a7d6b",
    textAlign: "center",
    marginBottom: 32,
    marginTop: 20,
  },
  optionsStack: {
    width: "100%",
    gap: 12,
  },
  pill: {
    borderWidth: 1,
    borderColor: "#EDE1D3",
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    backgroundColor: "#FFFDF7",
  },
  pillText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 15,
    color: "#432104",
  },
  exitBtn: {
    marginTop: 32,
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
  input: {
    width: "100%",
    minHeight: 120,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EDE1D3",
    padding: 16,
    fontFamily: Fonts.sans.regular,
    fontSize: 16,
    color: "#432104",
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

export default LonelinessRoomContainer;

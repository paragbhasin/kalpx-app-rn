import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
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

const LonelinessRoomContainer: React.FC<Props> = () => {
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
  const [step, setStep] = useState<"opening" | "options" | "input" | "walk">(
    "opening",
  );
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 minutes
  const [inputType, setInputType] = useState<"naming" | "person">("naming");
  const [inputValue, setInputValue] = useState("");

  const fade1 = useRef(new Animated.Value(0)).current;
  const fade2 = useRef(new Animated.Value(0)).current;

  const ctx = (screenData as any).loneliness_context || {
    opening_line: "Loneliness is heavy. Let's chant one together.",
    second_beat_line: "Nothing more is needed. Just this minute.",
  };

  const revealOptions = () => {
    setStep("options");
    Animated.timing(fade2, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    // Stage 1: Opening line
    Animated.timing(fade1, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      const timer = setTimeout(() => {
        revealOptions();
      }, 2000);
      return () => clearTimeout(timer);
    });
  }, [fade1]);

  // Timer orchestration for Walk
  useEffect(() => {
    if (step !== "walk") return;

    setTimerSeconds(600); // RE-APPLYING: Reset to 10 mins on entry

    const timerInterval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [step]);

  const dispatch = (
    actionType: string,
    actionTarget?: any,
    actionPayload?: any,
  ) =>
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
      <Text style={styles.offerText}>
        A few things I can offer, if any land:
      </Text>

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
        onPress={() =>
          dispatch(
            "start_runner",
            { container_id: "cycle_transitions", state_id: "view_info" },
            {
              source: "support_loneliness",
              variant: "mantra",
              target_reps: 27,
              item: ctx.bhakti_mantra,
            },
          )
        }
      >
        <Text style={styles.pillText}>Bhakti mantra</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.pill}
        onPress={() =>
          dispatch(
            "start_runner",
            {
              container_id: "practice_runner",
              state_id: "free_mantra_chanting",
            },
            {
              source: "support_loneliness",
              variant: "mantra",
              target_reps: 11,
            },
          )
        }
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

      <TouchableOpacity style={styles.pill} onPress={() => setStep("walk")}>
        <Text style={styles.pillText}>Walk outside for 10 minutes</Text>
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
        {inputType === "naming"
          ? "Where does it sit in the body?"
          : "Who comes to mind?"}
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

  const renderWalk = () => {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    const timeStr = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

    return (
      <View style={styles.walkContainer}>
        <View style={styles.walkHeader}>
          <TouchableOpacity
            style={styles.endReturnBtn}
            onPress={() => setStep("options")}
          >
            <Text style={styles.endReturnText}>End & Return</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.walkContent}>
          <Text style={styles.walkQuote}>
            Step outside into the fresh air.{"\n"}
            Walk for 10 minutes, no need to rush.{"\n"}
            Take any path that feels right,{"\n"}
            and let your body move naturally.
          </Text>
          <Text style={[styles.secondQuote, { marginTop: 40, opacity: 0.8 }]}>
            I'll be here, holding this quiet space for you.
          </Text>
        </View>

        <View style={styles.walkBottomBar}>
          <View style={styles.walkIconBox}>
            <Image
              source={require("../../../../assets/walk.png")}
              style={{ width: 24, height: 24 }}
            />
          </View>
          <Text style={styles.walkActionLabel}>Time to walk</Text>
          <Text style={styles.walkTimerText}>{timeStr}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step !== "walk" && (
          <Animated.View style={{ opacity: fade1, marginBottom: 40 }}>
            <Text style={styles.openingLine}>{ctx.opening_line}</Text>
            <Text style={styles.secondBeat}>{ctx.second_beat_line}</Text>
          </Animated.View>
        )}

        {step === "options" && renderOptions()}
        {step === "input" && renderInput()}
        {step === "walk" && renderWalk()}
      </ScrollView>
    </View>
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
  },
  openingLine: {
    fontFamily: Fonts.sans.medium,
    fontSize: 24,
    color: "#432104",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 32,
  },
  secondBeat: {
    fontFamily: Fonts.serif.regular,
    fontSize: 20,
    color: "#564B42",
    textAlign: "center",
    lineHeight: 28,
  },
  offerText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    color: "#946A47",
    textAlign: "center",
    marginBottom: 12,
  },
  optionsStack: {
    width: "100%",
    gap: 12,
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
    fontSize: 18,
    color: "#432104",
  },
  // Walk Interaction Styles
  walkContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    // paddingBottom: 40,
  },
  walkHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  walkBackCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  endReturnBtn: {
    backgroundColor: "#FBF5F5",
    borderColor: "#c89a47",
    borderWidth: 1,
    elevation: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    position: "absolute",
    right: 20,
  },
  endReturnText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: "#6B4F31",
  },
  walkContent: {
    flex: 1, // 🔥 MUST — takes full screen height
    justifyContent: "center", // vertical center
    alignItems: "center", // horizontal center
    marginTop: 100,
  },
  walkQuote: {
    fontFamily: Fonts.serif.bold,
    fontSize: 22,
    color: "#432104",
    textAlign: "center",
    lineHeight: 36,
  },
  secondQuote: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#432104",
    textAlign: "center",
    lineHeight: 36,
  },
  walkBottomBar: {
    backgroundColor: "#FBF5F5",
    borderColor: "#c89a47",
    borderWidth: 1,
    elevation: 6,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 24,
    justifyContent: "center",
    marginTop: 100,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: "90%",
    // height: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  walkIconBox: {
    marginRight: 15,
  },
  walkActionLabel: {
    flex: 1,
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#564B42",
  },
  walkTimerText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 20,
    color: "#564B42",
    letterSpacing: 1,
  },
  exitBtn: {
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

import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Fonts } from "../theme/fonts";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// REUSABLE VOICE MODAL COMPONENT
export interface VoiceModalProps {
  visible: boolean;
  onClose: () => void;
  onSend: (text: string, type: "voice") => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  visible,
  onClose,
  onSend,
}) => {
  const [voiceState, setVoiceState] = useState<
    "idle" | "listening" | "processing" | "feedback"
  >("idle");
  const [timer, setTimer] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      setVoiceState("idle");
      setTimer(0);
    }
  }, [visible]);

  useEffect(() => {
    if (voiceState === "listening") {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);

      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      scaleAnim.setValue(1);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [voiceState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} : ${secs < 10 ? "0" : ""}${secs}`;
  };

  const startVoice = () => {
    setVoiceState("listening");
    setTimer(0);
  };

  const stopVoice = () => {
    setVoiceState("processing");
    setTimeout(() => {
      setVoiceState("feedback");
    }, 1500);
  };

  const handleFinalConfirm = () => {
    onSend("Voice summary confirmed.", "voice");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={50} tint="light" style={styles.modalOverlay}>
        <View style={styles.modalWrapper}>
          <ImageBackground
            source={require("../../assets/beige_bg.png")}
            style={styles.modalContent}
            imageStyle={{ borderRadius: 32 }}
            resizeMode="cover"
          >
            <View style={styles.innerContent}>
              <TouchableOpacity style={styles.closeModal} onPress={onClose}>
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>

              <View style={styles.modalHeader}>
                <View style={styles.dotRow}>
                  <View style={styles.dot} />
                  <View style={[styles.dot, { opacity: 0.5 }]} />
                  <View style={[styles.dot, { opacity: 0.2 }]} />
                </View>
                <Text style={styles.modalTitle}>
                  {voiceState === "processing"
                    ? "I heard that."
                    : voiceState === "feedback"
                      ? "Here's what I'm noticing in what you said:"
                      : "I'm Listening.."}
                </Text>
                {voiceState === "processing" && (
                  <Text style={styles.modalSubtitle}>
                    Give me a moment to sit with it.
                  </Text>
                )}
              </View>

              {voiceState === "feedback" ? (
                <View style={styles.feedbackContent}>
                  <Text style={styles.feedbackQuote}>
                    You've been carrying a lot around{" "}
                    <Text style={{ fontStyle: "italic" }}>your health.</Text>
                    {"\n"}
                    I'll keep that alive in my awareness of you.
                  </Text>

                  <TouchableOpacity
                    style={styles.thankYouBtn}
                    onPress={handleFinalConfirm}
                  >
                    <Text style={styles.thankYouText}>Thank You</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={onClose}>
                    <Text style={styles.notRightText}>
                      That's not quite right
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={styles.voiceVisualizer}>
                    {voiceState === "idle" && (
                      <View style={styles.waveformPlaceholder} />
                    )}
                    {voiceState === "listening" && (
                      <View style={styles.waveformContainer}>
                        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                          <Animated.View
                            key={i}
                            style={[
                              styles.waveformBar,
                              { transform: [{ scaleY: scaleAnim }] },
                            ]}
                          />
                        ))}
                      </View>
                    )}
                    {voiceState === "processing" && (
                      <View style={styles.processingDots}>
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                      </View>
                    )}
                  </View>

                  <Text style={styles.timer}>{formatTime(timer)}</Text>

                  <View style={styles.voiceActions}>
                    {voiceState === "idle" && (
                      <TouchableOpacity
                        style={styles.voiceMainBtn}
                        onPress={startVoice}
                      >
                        <Ionicons name="mic" size={40} color="#c89a47" />
                      </TouchableOpacity>
                    )}
                    {voiceState === "listening" && (
                      <TouchableOpacity
                        style={styles.voiceStopBtn}
                        onPress={stopVoice}
                      >
                        <View style={styles.stopIcon} />
                      </TouchableOpacity>
                    )}
                    <Text style={styles.tapToText}>
                      {voiceState === "idle"
                        ? "(Tap to start)"
                        : voiceState === "listening"
                          ? "(Tap to Stop)"
                          : ""}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </ImageBackground>
        </View>
      </BlurView>
    </Modal>
  );
};

// COMPOSITE TEXT + VOICE INPUT COMPONENT
interface VoiceTextInputProps {
  placeholder?: string;
  initialValue?: string;
  onSend: (text: string, type: "text" | "voice") => void;
  voiceAvailable?: boolean;
}

export const VoiceTextInput: React.FC<VoiceTextInputProps> = ({
  placeholder = "Type or say it in your words...",
  initialValue = "",
  onSend,
  voiceAvailable = true,
}) => {
  const [text, setText] = useState(initialValue);
  const [isExpanded, setIsExpanded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim(), "text");
      setText("");
      setIsExpanded(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inputShell, isExpanded && styles.expandedShell]}>
        <TouchableOpacity
          style={styles.leadIcon}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <Ionicons name="create-outline" size={22} color="#5e4721" />
        </TouchableOpacity>

        <TextInput
          style={[styles.input, isExpanded && styles.expandedInput]}
          placeholder={placeholder}
          placeholderTextColor="rgba(67, 33, 4, 0.45)"
          value={text}
          onChangeText={setText}
          multiline={isExpanded}
          onFocus={() => setIsExpanded(true)}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />

        {voiceAvailable && !isExpanded && (
          <TouchableOpacity
            style={styles.micButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="mic-outline" size={24} color="#b9892f" />
          </TouchableOpacity>
        )}

        {isExpanded && text.length > 0 && (
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={20} color="#c89a47" />
          </TouchableOpacity>
        )}
      </View>

      <VoiceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSend={(val) => onSend(val, "voice")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 10,
  },
  inputShell: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8e0d5",
    paddingHorizontal: 12,
    minHeight: 56,
  },
  expandedShell: {
    alignItems: "flex-end",
    paddingVertical: 12,
  },
  leadIcon: {
    marginRight: 8,
    paddingBottom: 2,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: "#432104",
    paddingVertical: 8,
  },
  expandedInput: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  micButton: {
    padding: 8,
  },
  sendButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalWrapper: {
    width: "92%",
    height: SCREEN_HEIGHT * 0.5,
    backgroundColor: "#fff",
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "rgba(255, 204, 0, 0.6)",
    shadowColor: "#d6fb00",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.3,
    shadowRadius: 35,
    elevation: 25,
    overflow: "hidden",
  },
  modalContent: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  innerContent: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  closeModal: {
    position: "absolute",
    right: 20,
    top: 20,
  },
  modalHeader: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  dotRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#c89a47",
    marginHorizontal: 3,
  },
  modalTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 22,
    color: "#432104",
    textAlign: "center",
  },
  modalSubtitle: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: "#6b5a45",
    marginTop: 8,
  },
  voiceVisualizer: {
    height: 100,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  waveformPlaceholder: {
    width: "80%",
    height: 1,
    backgroundColor: "#e8e0d5",
    borderStyle: "dashed",
    borderRadius: 1,
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
  },
  waveformBar: {
    width: 3,
    height: 40,
    backgroundColor: "#c89a47",
    marginHorizontal: 2,
    borderRadius: 2,
  },
  processingDots: {
    flexDirection: "row",
  },
  timer: {
    fontFamily: Fonts.sans.medium,
    fontSize: 18,
    color: "#432104",
    marginBottom: 30,
  },
  voiceActions: {
    alignItems: "center",
  },
  voiceMainBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#e8e0d5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  voiceStopBtn: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "rgba(200, 154, 71, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  stopIcon: {
    width: 30,
    height: 30,
    backgroundColor: "#c89a47",
    borderRadius: 6,
  },
  tapToText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 14,
    color: "#6b5a45",
  },
  feedbackContent: {
    alignItems: "center",
    width: "100%",
  },
  feedbackQuote: {
    fontFamily: Fonts.serif.regular,
    fontSize: 20,
    color: "#432104",
    textAlign: "center",
    lineHeight: 30,
    marginBottom: 40,
  },
  thankYouBtn: {
    width: "60%",
    backgroundColor: "#FBF5F5",
    borderColor: "#9f9f9f",
    paddingHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 0.3,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  thankYouText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#432104",
  },
  notRightText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 14,
    color: "#6b5a45",
    textDecorationLine: "underline",
  },
});

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import TextComponent from "./TextComponent";

type Props = {
  visible: boolean;
  biometricLabel: string;
  onEnable: () => void;
  onDismiss: () => void;
};

function iconForLabel(label: string): string {
  if (label === "Face ID" || label === "Face Unlock") return "scan-outline";
  if (label === "Touch ID" || label === "Fingerprint")
    return "finger-print-outline";
  return "shield-checkmark-outline";
}

export default function BiometricPromptModal({
  visible,
  biometricLabel,
  onEnable,
  onDismiss,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.iconWrap}>
            <Ionicons
              name={iconForLabel(biometricLabel) as any}
              size={44}
              color="#c9a84c"
            />
          </View>

          <TextComponent type="headerBoldText" style={styles.title}>
            Enable {biometricLabel}?
          </TextComponent>

          <TextComponent type="cardText" style={styles.subtitle}>
            Use {biometricLabel} to open KalpX quickly.
          </TextComponent>

          <TouchableOpacity
            style={styles.enableBtn}
            onPress={onEnable}
            activeOpacity={0.85}
          >
            <Ionicons
              name={iconForLabel(biometricLabel) as any}
              size={18}
              color="#fff"
            />
            <TextComponent type="headerText" style={styles.enableText}>
              Enable {biometricLabel}
            </TextComponent>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipBtn}
            onPress={onDismiss}
            activeOpacity={0.7}
          >
            <TextComponent type="cardText" style={styles.skipText}>
              Not now
            </TextComponent>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fffaf5",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 32,
    paddingBottom: 44,
    paddingHorizontal: 28,
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#f5ead8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    color: "#2d1a0e",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#7a5c3e",
    textAlign: "center",
    lineHeight: 21,
    paddingHorizontal: 8,
  },
  enableBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#432104",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 50,
    marginTop: 8,
    width: "100%",
    justifyContent: "center",
  },
  enableText: {
    color: "#fff",
    fontSize: 16,
  },
  skipBtn: {
    paddingVertical: 10,
  },
  skipText: {
    color: "#a07850",
    fontSize: 14,
  },
});

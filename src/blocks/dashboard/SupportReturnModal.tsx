import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../theme/colors";
import { Fonts } from "../../theme/fonts";

type ModalPayload = {
  title?: string;
  body?: string[];
  cta_label?: string;
};

type Props = {
  visible: boolean;
  payload?: ModalPayload | null;
  onClose: () => void;
};

const lotusIcon = require("../../../assets/lotus_glow.png");
const beigeBg = require("../../../assets/beige_bg.png");

const SupportReturnModal: React.FC<Props> = ({ visible, payload, onClose }) => {
  const lines = Array.isArray(payload?.body)
    ? payload?.body
    : String(payload?.body || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.scrim}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card}>
          <Image
            source={beigeBg}
            style={[StyleSheet.absoluteFill, styles.cardBackground]}
            resizeMode="cover"
          />
          <View style={styles.cardInner}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Close support message"
            >
              <Ionicons name="close" size={24} color={Colors.brownDeep} />
            </TouchableOpacity>

            <Image
              source={lotusIcon}
              style={styles.lotus}
              resizeMode="contain"
            />

            <Text style={styles.title}>
              {payload?.title || "Stay with your path"}
            </Text>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerMark}>✦</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.bodyWrap}>
              {lines.map((line, index) => (
                <Text key={`${line}-${index}`} style={styles.bodyText}>
                  {line}
                </Text>
              ))}
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onClose}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel={payload?.cta_label || "Close"}
            >
              <Text style={styles.primaryButtonText}>
                {payload?.cta_label || "Close"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: "rgba(27, 18, 10, 0.56)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFEF9",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(212, 160, 23, 0.28)",
    shadowColor: "#6b4a12",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 10,
    overflow: "hidden",
  },
  cardInner: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
    alignItems: "center",
  },
  cardBackground: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.25,
    borderColor: "rgba(201, 168, 76, 0.75)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 253, 247, 0.9)",
  },
  lotus: {
    width: 300,
    // height: 100,
    marginTop: 10,
    marginBottom: 8,
  },
  title: {
    fontFamily: Fonts.serif.bold,
    fontSize: 22,
    lineHeight: 29,
    color: Colors.brownDeep,
    textAlign: "center",
    paddingHorizontal: 28,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 14,
    gap: 10,
  },
  dividerLine: {
    width: 42,
    height: 1,
    backgroundColor: "rgba(201, 168, 76, 0.55)",
  },
  dividerMark: {
    color: Colors.gold,
    fontSize: 15,
  },
  bodyWrap: {
    width: "100%",
    // maxWidth: 250,
    gap: 6,
    marginBottom: 20,
  },
  bodyText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    lineHeight: 23,
    color: Colors.brownDeep,
    textAlign: "center",
  },
  primaryButton: {
    width: "100%",
    minHeight: 50,
    borderRadius: 25,
    backgroundColor: Colors.gold,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 16,
    color: "#fffdf9",
  },
});

export default SupportReturnModal;

import React from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Fonts } from "../theme/fonts";

interface Props {
  visible: boolean;
  onUpdateNow: () => void;
  onLater: () => void;
}

const UpdateModal: React.FC<Props> = ({ visible, onUpdateNow, onLater }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.dot} />

          <Text style={styles.title}>New version available</Text>

          <Text style={styles.body}>
            Update KalpX for improvements, fixes, and a smoother experience.
          </Text>

          <TouchableOpacity
            style={styles.updateButton}
            onPress={onUpdateNow}
            activeOpacity={0.85}
          >
            <Text style={styles.updateText}>Update</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.laterButton}
            onPress={onLater}
            activeOpacity={0.7}
          >
            <Text style={styles.laterText}>Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default UpdateModal;

const CREAM = "#F6F0DD";
const GOLD = "#C9961A";
const DARK = "#1A1208";
const MUTED = "#6B5E3E";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(10, 8, 3, 0.55)",
  },
  card: {
    backgroundColor: CREAM,
    width: "84%",
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: "center",
    // Soft shadow
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: { elevation: 10 },
    }),
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GOLD,
    marginBottom: 20,
  },
  title: {
    fontFamily: Fonts.serif.bold,
    fontSize: 22,
    color: DARK,
    textAlign: "center",
    letterSpacing: 0.2,
    marginBottom: 12,
  },
  body: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: MUTED,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 32,
  },
  updateButton: {
    backgroundColor: GOLD,
    borderRadius: 100,
    paddingVertical: 14,
    paddingHorizontal: 48,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  updateText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 15,
    color: "#FFF",
    letterSpacing: 0.3,
  },
  laterButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  laterText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: MUTED,
    letterSpacing: 0.2,
  },
});

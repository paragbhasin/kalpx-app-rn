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
import type { UpdateType } from "../hooks/useUpdateCheck";

interface Props {
  visible: boolean;
  updateType?: UpdateType;
  onUpdateNow: () => void;
  onLater: () => void;
}

const COPY = {
  soft: {
    title: "New version available",
    body: "Update KalpX for improvements, fixes, and a smoother experience.",
  },
  force: {
    title: "Update required",
    body: "This version is no longer supported. Please update KalpX to continue.",
  },
};

const UpdateModal: React.FC<Props> = ({
  visible,
  updateType = "soft",
  onUpdateNow,
  onLater,
}) => {
  const copy = COPY[updateType];
  const isForce = updateType === "force";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      // Prevent hardware back button from dismissing a force-update modal
      onRequestClose={isForce ? () => {} : onLater}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={[styles.dot, isForce && styles.dotForce]} />

          <Text style={styles.title}>{copy.title}</Text>

          <Text style={styles.body}>{copy.body}</Text>

          <TouchableOpacity
            style={styles.updateButton}
            onPress={onUpdateNow}
            activeOpacity={0.85}
          >
            <Text style={styles.updateText}>Update</Text>
          </TouchableOpacity>

          {!isForce && (
            <TouchableOpacity
              style={styles.laterButton}
              onPress={onLater}
              activeOpacity={0.7}
            >
              <Text style={styles.laterText}>Later</Text>
            </TouchableOpacity>
          )}
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
const URGENT = "#B94040";

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
  dotForce: {
    backgroundColor: URGENT,
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

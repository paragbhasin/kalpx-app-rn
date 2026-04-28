import React from "react";
import {
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "./Colors";
import FontSize from "./FontSize";
import TextComponent from "./TextComponent";

const UpdateModal = ({ visible, onUpdateNow, onLater }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Image
            source={require("../../assets/UpgradeApp.png")}
            style={styles.image}
            resizeMode="cover"
          />

          <TextComponent type="streakText" style={styles.title}>
            Hi! There
          </TextComponent>

          <TextComponent type="streakText" style={styles.message}>
            Your current version is out of date. Update KalpX to unlock new
            features and improvements.
          </TextComponent>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.laterButton}
              onPress={onLater}
              activeOpacity={0.8}
            >
              <TextComponent type="cardText" style={styles.laterText}>
                Later
              </TextComponent>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.updateButton}
              onPress={onUpdateNow}
              activeOpacity={0.8}
            >
              <TextComponent type="cardText" style={styles.buttonText}>
                Update Now
              </TextComponent>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default UpdateModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
    backgroundColor: Colors.Colors.white,
    width: "90%",
    borderRadius: 12, // ✅ Rounded corners
    overflow: "hidden",
    paddingBottom: 16,
  },
  image: {
    height: 180,
    width: "100%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  title: {
    marginTop: 10,
    color: Colors.Colors.BLACK,
    fontSize: FontSize.CONSTS.FS_24,
    alignSelf: "center",
  },
  message: {
    color: Colors.Colors.Light_black,
    fontSize: FontSize.CONSTS.FS_14,
    textAlign: "center",
    marginHorizontal: 20,
    marginTop: 8,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 20,
  },
  updateButton: {
    backgroundColor: "#D4A017",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  laterButton: {
    borderWidth: 1,
    borderColor: "#D4A017",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: Colors.Colors.white,
    textAlign: "center",
    fontSize: FontSize.CONSTS.FS_16,
  },
  laterText: {
    color: "#D4A017",
    textAlign: "center",
    fontSize: FontSize.CONSTS.FS_16,
  },
});

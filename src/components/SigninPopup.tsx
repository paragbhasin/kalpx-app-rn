import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import Colors from "./Colors";
import FontSize from "./FontSize";
import TextComponent from "./TextComponent";

interface SigninPopupProps {
  visible: boolean;
  onClose: () => void;
  onConfirmCancel: (practice: any) => void;
  /** 🔹 Text values (to customize for each use case) */
  title: string;
  subText: string;
  infoTexts: string[]; // e.g. ["Get daily reminders", "Track your streak", ...]
  bottomText: string; // last line like "Want a gentle reminder..."
}

const SigninPopup: React.FC<SigninPopupProps> = ({
  visible,
  onConfirmCancel,
  onClose,
  title,
  subText,
  infoTexts,
  bottomText,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        setIsLoggedIn(!!token);
      } catch (error) {
        console.log("Error checking login:", error);
      }
    };
    checkLogin();
  }, [visible]);

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      backdropOpacity={0.6}
      animationIn="zoomIn"
      animationOut="zoomOut"
      useNativeDriver
    >
      <View style={styles.modalContent}>
        {/* 🔹 Close Button */}
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Image
            source={require("../../assets/Cross.png")}
            style={styles.closeIcon}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* 🔹 Header Section */}
        <View style={styles.headerBox}>
          <TextComponent type="boldText" style={styles.title}>
            {title}
          </TextComponent>
          <TextComponent type="boldText" style={styles.subText}>
            {subText}
          </TextComponent>
        </View>

        {/* 🔹 Info Texts */}
        {infoTexts.map((text, index) => (
          <TextComponent key={index} type="boldText" style={styles.layerText}>
            {text}
          </TextComponent>
        ))}

        {/* 🔹 Bottom Info */}
        {bottomText &&
        <TextComponent
          type="boldText"
          style={{
            ...styles.layerText,
            marginTop: 8,
            color: Colors.Colors.Light_black,
          }}
        >
          {bottomText}
        </TextComponent>
}
        {/* 🔹 Buttons — only if not logged in */}
        {!isLoggedIn && (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.loginButton}>
              <TextComponent type="boldText" style={styles.buttonTitle}>
                Log In
              </TextComponent>
            </TouchableOpacity>

            <TouchableOpacity style={styles.signupButton}>
              <TextComponent type="boldText" style={styles.buttonTitle}>
                Sign Up
              </TextComponent>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default SigninPopup;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    alignSelf: "center",
  },
  closeButton: {
    backgroundColor: Colors.Colors.App_theme,
    alignSelf: "flex-end",
    padding: 10,
    borderRadius: 18,
  },
  closeIcon: {},
  headerBox: {
    borderColor: Colors.Colors.App_theme,
    borderWidth: 1,
    backgroundColor:"#FFF7E8",
    padding: 14,
    alignItems: "center",
    marginVertical: 15,
    borderRadius: 10,
  },
  title: {
    color: Colors.Colors.Light_black,
    fontSize: FontSize.CONSTS.FS_18,
    textAlign: "center",
  },
  subText: {
    marginTop: 6,
    fontSize: FontSize.CONSTS.FS_14,
    textAlign: "center",
  },
  layerText: {
    color: Colors.Colors.Light_grey,
    fontSize: FontSize.CONSTS.FS_14,
    textAlign: "center",
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  loginButton: {
    backgroundColor: Colors.Colors.App_theme,
    borderRadius: 10,
    width: "46%",
    paddingVertical: 12,
  },
  signupButton: {
    backgroundColor: Colors.Colors.button_bg,
    borderRadius: 10,
    width: "46%",
    paddingVertical: 12,
  },
  buttonTitle: {
    color: Colors.Colors.BLACK,
    fontSize: FontSize.CONSTS.FS_20,
    textAlign: "center",
  },
});

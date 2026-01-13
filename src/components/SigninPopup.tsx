import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
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
  onSadhanPress?: () => void;
  /** 🔹 Text values (to customize for each use case) */
  title: string;
  subText: string;
  subTitle?: string;
  MantraButtonTitle?: string;
  infoTexts: string[]; // e.g. ["Get daily reminders", "Track your streak", ...]
  bottomText?: string; // last line like "Want a gentle reminder..."
}

const SigninPopup: React.FC<SigninPopupProps> = ({
  visible,
  onConfirmCancel,
  onClose,
  title,
  subText,
  infoTexts,
  bottomText,
  subTitle,
  MantraButtonTitle,
  onSadhanPress
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigation: any = useNavigation();

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
        <LinearGradient
     colors={["#ffffffff", "#ffffffff"]}  // 🟡 Your gradient
  locations={[0, 0.5]}   // 50% top, 50% bottom
  start={{ x: 0, y: 0 }}
  end={{ x: 0, y: 1 }} 
    style={styles.gradientBox}
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
 <Image
            source={require("../../assets/lotus_icon.png")}
            style={{
    height: 50,
    width: 50,
    alignSelf: "center",
    // backgroundColor:"red",
    marginTop:-30
  }}
  resizeMode="contain"
          />
            <TextComponent type="headerSubBoldText" style={styles.title}>
            {title}
          </TextComponent>
          {subTitle &&
           <TextComponent type="headerSubBoldText" style={{...styles.title,marginVertical:4}}>
            {subTitle}
          </TextComponent>
}
        {/* 🔹 Header Section */}
        <View style={styles.headerBox}> 
          <TextComponent type="semiBoldText" style={styles.subText}>
            {subText}
          </TextComponent>
        </View>

        {/* 🔹 Info Texts */}
        {infoTexts.map((text, index) => (
          <TextComponent key={index} type="mediumText" style={styles.layerText}>
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
            <TouchableOpacity style={styles.loginButton} onPress={() => {
              onClose();
              navigation.navigate("Login");
              }}>
              <TextComponent type="headerSubBoldText" style={styles.buttonTitle}>
                Log In
              </TextComponent>
            </TouchableOpacity>

            <TouchableOpacity style={styles.signupButton} onPress={() => {
              onClose();
              navigation.navigate("Signup");
              }}>
              <TextComponent type="headerSubBoldText" style={styles.buttonLeftTitle}>
                Sign Up
              </TextComponent>
            </TouchableOpacity>
          </View>
        )}
         {isLoggedIn && (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={{
                  backgroundColor: "#D4A017",
    borderRadius: 10,
    width: "100%",
    paddingVertical: 12,
            }} onPress={() => {
              onClose();
              onSadhanPress();
              }}>
              <TextComponent type="headerSubBoldText" style={styles.buttonTitle}>
              {MantraButtonTitle}
              </TextComponent>
            </TouchableOpacity>
          </View>
        )}
      </View>
      </LinearGradient>
    </Modal>
  );
};

export default SigninPopup;

const styles = StyleSheet.create({
  modalContent: {
    // backgroundColor: "white",
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
  // headerBox: {
  //   borderColor: Colors.Colors.App_theme,
  //   borderWidth: 1,
  //   backgroundColor:"#FFF7E8",
  //   padding: 14,
  //   alignItems: "center",
  //   marginVertical: 15,
  //   borderRadius: 10,
  // },
  headerBox: {
  backgroundColor: "#FFF7E8",
  padding: 14,
  alignItems: "center",
  marginVertical: 10,
  borderRadius: 10,

  // 🌟 Android elevation
  elevation: 6,

  // 🌟 iOS shadow
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
},
  title: {
    // color: Colors.Colors.Light_black,
    // fontSize: FontSize.CONSTS.FS_18,
    textAlign: "center",
  },
  subText: {
    marginTop: 2,
    color:Colors.Colors.blue_text,
    // fontSize: FontSize.CONSTS.FS_14,
    textAlign: "center",
  },
  layerText: {
    color: "#282828",
    // fontSize: FontSize.CONSTS.FS_14,
    textAlign: "center",
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  loginButton: {
    backgroundColor: "#D4A017",
    borderRadius: 10,
    width: "42%",
    paddingVertical: 12,
  },
  signupButton: {
    backgroundColor: "#FFFCF6",
    borderWidth:1,
    borderColor:Colors.Colors.App_theme,
    borderRadius: 10,
    width: "42%",
    paddingVertical: 12,
  },
  buttonTitle: {
    color: Colors.Colors.white,
    fontSize: FontSize.CONSTS.FS_20,
    textAlign: "center",
  },
    buttonLeftTitle: {
    color: Colors.Colors.App_theme,
    fontSize: FontSize.CONSTS.FS_20,
    textAlign: "center",
  },
  gradientBox: {
  borderRadius: 16,
  padding: 2, // outer padding for smoother gradient
},
innerBox: {
  backgroundColor: "white",
  borderRadius: 16,
  padding: 20,
},

});

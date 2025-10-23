// components/Privacy.js (or screens/Privacy.js)
import React, { useCallback, useEffect, useState } from "react";
import { BackHandler, Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { WebView } from "react-native-webview";

const Privacy = ({ onClose }) => {
  const [visible, setVisible] = useState(true);

  const closeModal = useCallback(() => {
    setVisible(false);
    setTimeout(() => onClose?.(), 200);
  }, [onClose]);

  useEffect(() => {
    const backAction = () => {
      if (visible) {
        closeModal();
        return true; // prevent default back behavior
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [visible, closeModal]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={closeModal}
      transparent={false}
    >
    <SafeAreaView style={{flex:1}}>

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#eee",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Privacy Policy</Text>
        <TouchableOpacity onPress={closeModal}>
          <Ionicons name="close" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      {/* WebView for Privacy Policy */}
      <WebView source={{ uri: "https://kalpx.com/en/privacy" }} style={{ flex: 1 }} />
    </SafeAreaView>
    </Modal>
  );
};

export default Privacy;

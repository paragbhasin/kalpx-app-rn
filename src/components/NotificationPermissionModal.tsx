import React from "react";
import { Linking, Modal, Platform, TouchableOpacity, View } from "react-native";
import Colors from "./Colors";
import TextComponent from "./TextComponent";

const openAppSettings = () => {
  if (Platform.OS === "ios") {
    Linking.openSettings();
  } else {
    Linking.sendIntent("android.settings.APP_NOTIFICATION_SETTINGS", [
      {
        key: "android.provider.extra.APP_PACKAGE",
        value: "com.kalpx.app",
      },
    ]).catch(() => {
      // fallback: open general settings if intent fails
      Linking.openSettings();
    });
  }
};

const NotificationPermissionModal = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            width: "100%",
            backgroundColor: Colors.Colors.white,
            borderRadius: 12,
            padding: 24,
            alignItems: "center",
          }}
        >
          <TextComponent
            type="headerSubBoldText"
            style={{  color: Colors.Colors.BLACK, marginBottom: 6 }}
          >
            Allow Notifications
          </TextComponent>

          <TextComponent
            type="subText"
            style={{
              textAlign: "center",
              marginBottom: 20,
            }}
          >
           Stay connected with Mantras, Sankalps, and Daily Routine reminders.
          </TextComponent>

          {/* Open Settings Button */}
          <TouchableOpacity
            onPress={() => {
              onClose();
              openAppSettings(); // 🔥 correct cross-platform behavior
            }}
            style={{
              backgroundColor: Colors.Colors.App_theme,
              paddingVertical: 10,
              paddingHorizontal: 40,
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <TextComponent type="boldText" style={{ color: "white" }}>
              Open Settings
            </TextComponent>
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity onPress={onClose}>
            <TextComponent
              type="mediumText"
              style={{ color: Colors.Colors.Light_black }}
            >
              Maybe Later
            </TextComponent>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default NotificationPermissionModal;

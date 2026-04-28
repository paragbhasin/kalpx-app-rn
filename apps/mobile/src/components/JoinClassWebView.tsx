import React from "react";
import { Modal, SafeAreaView, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import Colors from "./Colors";
import TextComponent from "./TextComponent";

interface Props {
  visible: boolean;
  url: string;
  onClose: () => void;
}

const JoinClassWebView: React.FC<Props> = ({ visible, url, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        
        {/* Close Button */}
        <TouchableOpacity
          onPress={onClose}
          style={{ padding: 12, backgroundColor: Colors.Colors.App_theme,alignSelf:"flex-end",margin:20,borderRadius:8 }}
        >
          <TextComponent type="semiBoldText" style={{ color: "#fff" }}>
            Close
          </TextComponent>
        </TouchableOpacity>

        {/* WebView */}
       <WebView
  source={{ uri: url }}
  setSupportMultipleWindows={false}  // ⬅ reduces browser process warnings
  style={{ flex: 1 }}
/>
      </SafeAreaView>
    </Modal>
  );
};

export default JoinClassWebView;

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Modal from "react-native-modal";

interface SuccessModalProps {
  visible: boolean;
  title: string;
  subTitle?: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ visible, title, subTitle, onClose }) => {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={() => {}} // ❌ disable closing on backdrop
      onBackButtonPress={() => {}} // ❌ disable Android back button
      backdropOpacity={0.6}
      animationIn="zoomIn"
      animationOut="zoomOut"
      useNativeDriver
    >
      <View style={styles.modalContent}>
        <Text  allowFontScaling={false} style={styles.title}>{title}</Text>
        {subTitle ? <Text  allowFontScaling={false} style={styles.subTitle}>{subTitle}</Text> : null}

        <Pressable style={styles.closeBtn} onPress={onClose}>
          <Text  allowFontScaling={false} style={styles.closeBtnText}>Close</Text>
        </Pressable>
      </View>
    </Modal>
  );
};

export default SuccessModal;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 6,
    color: "#9A7548",
  },
  subTitle: {
    marginTop:4,
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    // textAlign: "center",
    marginBottom: 20,
  },
  closeBtn: {
    width: "100%",
    backgroundColor: "#FFF7E8",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderColor:"#FAD38C",
    borderWidth:1,
    alignItems:"center"
  },
  closeBtnText: {
    color: "#000000",
    fontWeight: "600",
    fontSize: 14,
  },
});

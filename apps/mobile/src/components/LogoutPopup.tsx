import React from "react";
import {
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import Modal from "react-native-modal";
import Colors from "./Colors";
import TextComponent from "./TextComponent";

interface LogoutPopupProps {
  visible: boolean;
  headerText: string;
  subText: string;
  cancelText?: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
  onClose?: () => void;
}

const LogoutPopup: React.FC<LogoutPopupProps> = ({
  visible,
  headerText,
  subText,
  cancelText = "Cancel",
  confirmText = "Confirm",
  onCancel,
  onConfirm,
  onClose,
}) => {
  const handleClose = () => {
    onClose?.();
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
        {/* Close Button */}
        {/* <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Image
            source={require("../../assets/Cross.png")}
            style={styles.closeIcon}
            resizeMode="cover"
          />
        </TouchableOpacity> */}

        {/* Header */}
        <TextComponent
          type="headerBoldText"
          style={styles.headerText}
        >
          {headerText}
        </TextComponent>

        {/* Subtext */}
        <TextComponent
          type="cardText"
          style={styles.subText}
        >
          {subText}
        </TextComponent>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.cancelBtn]}
            onPress={onCancel}
          >
            <TextComponent
              type="headerSubBoldText"
              style={{ color: Colors.Colors.App_theme }}
            >
              {cancelText}
            </TextComponent>
          </TouchableOpacity>

          <View style={{ width: 12 }} />

          <TouchableOpacity
            style={[styles.actionBtn, styles.confirmBtn]}
            onPress={onConfirm}
          >
            <TextComponent
              type="headerSubBoldText"
              style={{ color: Colors.Colors.white }}
            >
              {confirmText}
            </TextComponent>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default LogoutPopup;

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
    padding: 8,
    borderRadius: 18,
  },
  closeIcon: {
    width: 14,
    height: 14,
    tintColor: Colors.Colors.white,
  },
  headerText: {
    textAlign: "center",
    // color: Colors.Colors.BLACK,
    // fontSize: FontSize.CONSTS.FS_18,
    marginTop: 8,
  },
  subText: {
    textAlign: "center",
    // color: Colors.Colors.Light_black,
    marginVertical: 15,
    // fontSize: FontSize.CONSTS.FS_14,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  actionBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelBtn: {
       backgroundColor: Colors.Colors.white,
    borderColor:Colors.Colors.App_theme,
    borderWidth:1,
    borderRadius:8
  },
  confirmBtn: {
    backgroundColor: Colors.Colors.App_theme,
  },
});

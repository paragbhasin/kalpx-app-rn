import React from "react";
import {
    Image,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import Modal from "react-native-modal";
import Colors from "./Colors";
import TextComponent from "./TextComponent";

interface SigninPopupProps {
  visible: boolean;
  onClose: () => void;
  onConfirmCancel: (practice: any) => void;
}

const SigninPopup: React.FC<SigninPopupProps> = ({
  visible,
  onConfirmCancel,
  onClose,
}) => {

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
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
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Image
            source={require("../../assets/Cross.png")}
            style={styles.closeIcon}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <TextComponent type="boldText" style={styles.title}>
          Create Your Own Practice
        </TextComponent>
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
  title: {
    fontSize: 14,
    alignSelf: "center",
    marginTop: -18,
    color: Colors.Colors.BLACK,
  },
  label: {
    color: Colors.Colors.Light_black,
  },
  input: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#BDC4CD",
    borderRadius: 6,
    padding: 10,
    marginBottom: 5,
  },
  buttonRow: {
    marginTop: 10,
    flexDirection: "row",
    alignSelf: "center",
  },
  confirmBtn: {
    backgroundColor: Colors.Colors.App_theme,
    padding: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
  },
});

import React from "react";
import {
    Image,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Modal from "react-native-modal";
import Colors from "./Colors";
import TextComponent from "./TextComponent";

interface ClassDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmCancel: () => void;
}

const ClassCancelModal: React.FC<ClassDetailsModalProps> = ({
  visible,
  onConfirmCancel,
  onClose,
}) => {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose} // ❌ disable closing on backdrop
      onBackButtonPress={onClose} // ❌ disable Android back button
      backdropOpacity={0.6}
      animationIn="zoomIn"
      animationOut="zoomOut"
      useNativeDriver
    >
      <View style={styles.modalContent}>
        {/* Close Button */}
        <TouchableOpacity
          onPress={onClose}
          style={{
            backgroundColor: Colors.Colors.App_theme,
            alignSelf: "flex-end",
            padding: 10,
            borderRadius: 18,
          }}
        >
          <Image
            source={require("../../assets/Cross.png")}
            style={styles.closeIcon}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <TextComponent
          type="boldText"
          style={{
            ...styles.label,
            fontSize: 14,
            alignSelf: "center",
            marginTop: -18,
          }}
        >
          Cancel Booking
        </TextComponent>
        <TextComponent
          type="semiBoldText"
          style={{ ...styles.label, marginTop: 20 }}
        >
          Reason for Cancellation
        </TextComponent>
        <TextInput
          style={styles.input}
          placeholder="Select a reason..."
          //   value={city}
          //   onChangeText={setCity}
        />
        <View style={{ flexDirection: "row", alignSelf: "flex-end" }}>
          <TouchableOpacity
            style={{
              borderColor: Colors.Colors.Light_grey,
              borderWidth: 1,
              borderRadius: 6,
              padding: 10,
            }}
          >
            <TextComponent type="semiBoldText" style={{ ...styles.label }}>
              Close
            </TextComponent>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: Colors.Colors.App_theme,
              padding: 10,
              borderRadius: 6,
              marginLeft: 12,
            }}
          >
            <TextComponent
              type="semiBoldText"
              style={{ color: Colors.Colors.white }}
            >
              Confirm Cancellation
            </TextComponent>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ClassCancelModal;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    alignSelf: "center",
  },
  closeIcon: {
    // width: 30,
    // height: 30,
    // alignSelf: "flex-end",
    // marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    marginVertical: 6,
  },
  label: {
    color: Colors.Colors.Light_black,
  },
  value: {
    color: Colors.Colors.Light_black,
    flex: 1,
  },
  input: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.Colors.Light_grey,
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
});

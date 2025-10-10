import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Modal from "react-native-modal";
import Colors from "./Colors";
import TextComponent from "./TextComponent";

interface ClassCancelModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmCancel: (data: { reason: string; details: string }) => void;
}

const data = [
  { label: "Schedule conflict", value: "schedule_conflict" },
  { label: "No longer interested", value: "no_longer_interested" },
  { label: "Technical issue", value: "technical_issue" },
  { label: "Other", value: "other" },
];

const ClassCancelModal: React.FC<ClassCancelModalProps> = ({
  visible,
  onConfirmCancel,
  onClose,
}) => {
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState<string>("");

    const resetState = () => {
    setReason(null);
    setDetails("");
  };

    const handleClose = () => {
    resetState();
    onClose();
  };

  const handleConfirm = () => {
    const payload = {
      reason: reason || "",
      details: reason === "other" ? details.trim() : "",
    };
    onConfirmCancel(payload);
    resetState();
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
        {/* Close Button */}
        <TouchableOpacity
          onPress={handleClose}
          style={styles.closeButton}
        >
          <Image
            source={require("../../assets/Cross.png")}
            style={styles.closeIcon}
            resizeMode="cover"
          />
        </TouchableOpacity>

        <TextComponent
          type="boldText"
          style={styles.title}
        >
          Cancel Booking
        </TextComponent>

        <TextComponent
          type="semiBoldText"
          style={styles.label}
        >
          Reason for Cancellation
        </TextComponent>

        <View style={styles.container}>
          <Dropdown
            data={data}
            labelField="label"
            valueField="value"
            placeholder="Select reason"
            value={reason}
            onChange={(item) => setReason(item.value)}
            style={styles.dropdown}
            selectedTextStyle={styles.selectedText}
            placeholderStyle={styles.placeholder}
          />
        </View>

        {/* Show text input only if "Other" is selected */}
        {reason === "other" && (
          <>
            <TextComponent
              type="semiBoldText"
              style={{ ...styles.label, marginTop: 10 }}
            >
              Provide your reason
            </TextComponent>
            <TextInput
              style={styles.input}
              placeholder="Enter your reason"
              placeholderTextColor="#96A0AD"
              value={details}
              onChangeText={setDetails}
            />
          </>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeBtn}
          >
            <TextComponent type="semiBoldText" style={styles.closeText}>
              Close
            </TextComponent>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!reason || (reason === "other" && !details.trim())}
            style={[
              styles.confirmBtn,
              (!reason || (reason === "other" && !details.trim())) && { opacity: 0.6 },
            ]}
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
  },
  label: {
    color: Colors.Colors.Light_black,
    marginTop: 20,
  },
  container: { width: "100%", marginBottom: 10 },
  dropdown: {
    height: 50,
    borderColor: "#BDC4CD",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  selectedText: { color: "#000000" },
    placeholder: { color: "#96A0AD" },
  input: {
    marginTop: 4,
    borderWidth: 1,
  borderColor: "#BDC4CD",
  height:80,
    borderRadius: 6,
    padding: 10,
    marginBottom: 25,
  },
  buttonRow: {
    flexDirection: "row",
    alignSelf: "flex-end",
  },
  closeBtn: {
    borderColor: Colors.Colors.Light_grey,
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
  },
  confirmBtn: {
    backgroundColor: Colors.Colors.App_theme,
    padding: 10,
    borderRadius: 6,
    marginLeft: 12,
  },
  closeText: {
    color: Colors.Colors.Light_black,
  },
});

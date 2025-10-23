import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import uuid from "react-native-uuid"; // ✅ Correct import
import Colors from "./Colors";
import TextComponent from "./TextComponent";

interface AddPracticesModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmCancel: (practice: any) => void;
}

const AddPracticesModal: React.FC<AddPracticesModalProps> = ({
  visible,
  onConfirmCancel,
  onClose,
}) => {
  const [practiceName, setPracticeName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const resetState = () => {
    setPracticeName("");
    setDescription("");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleConfirm = () => {
    if (!practiceName.trim() || !description.trim()) {
      return;
    }

    const customPractice = {
      practice_id: `custom_${uuid.v4()}`, // ✅ Unique ID
      name: practiceName.trim(),
      description: description.trim(),
      meaning: "A personal practice crafted with your intention.",
      icon: "🕉️",
      mantra: "",
      sankalpa: "Personal growth",
      source: "custom",
      category: "Custom",
      trigger: "morning",
    };

    console.log("Created Custom Practice:", customPractice);

    onConfirmCancel(customPractice);
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

        {/* Practice Name */}
        <TextComponent
          type="semiBoldText"
          style={{ ...styles.label, marginTop: 10 }}
        >
          Practice Name
        </TextComponent>
        <TextInput
          style={styles.input}
          placeholder="Enter here"
          placeholderTextColor="#96A0AD"
          value={practiceName}
          onChangeText={setPracticeName}
        />

        {/* Description */}
        <TextComponent
          type="semiBoldText"
          style={{ ...styles.label, marginTop: 10 }}
        >
          What does this practice involve?
        </TextComponent>
        <TextInput
          style={{ ...styles.input, height: 80 }}
          placeholder="Enter here"
          placeholderTextColor="#96A0AD"
          multiline
          value={description}
          onChangeText={setDescription}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={handleConfirm}
            style={[
              styles.confirmBtn,
              {
                opacity:
                  !practiceName.trim() || !description.trim() ? 0.6 : 1,
              },
            ]}
            disabled={!practiceName.trim() || !description.trim()}
          >
            <TextComponent
              type="semiBoldText"
              style={{ color: Colors.Colors.BLACK }}
            >
              Add My Practice
            </TextComponent>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AddPracticesModal;

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

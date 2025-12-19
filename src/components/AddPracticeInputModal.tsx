import React from "react";
import {
    Dimensions,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import TextComponent from "./TextComponent";

const { width } = Dimensions.get("window");

const dayOptions = [
  { label: "Daily", value: "Daily" },
  { label: "Monday", value: "Mon" },
  { label: "Tuesday", value: "Tue" },
  { label: "Wednesday", value: "Wed" },
  { label: "Thursday", value: "Thu" },
  { label: "Friday", value: "Fri" },
  { label: "Saturday", value: "Sat" },
  { label: "Sunday", value: "Sun" },
];

const AddPracticeInputModal = ({
  visible,
  onClose,
  onSave,
  practice,
  isSankalp = false,
}) => {
const [reps, setReps] = React.useState("");
const [day, setDay] = React.useState("Daily");

React.useEffect(() => {
  // Reset every time a NEW practice is opened
  setReps("");
  setDay("Daily");
}, [practice, visible]);


  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* TITLE */}
          <TextComponent type="headerBoldText" style={styles.title}>
            {practice?.title || practice?.name}
          </TextComponent>

          {/* REPS FIELD (NOT FOR SANKALP) */}
          {!isSankalp && (
            <>
              <TextComponent type="semiBoldText" style={styles.label}>
                Reps
              </TextComponent>
              <TextInput
                style={styles.input}
                placeholder="e.g. 9"
                value={reps}
                onChangeText={setReps}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </>
          )}

          {/* DAY FIELD */}
          <TextComponent type="semiBoldText" style={styles.label}>
            Day
          </TextComponent>

          <Dropdown
            data={dayOptions}
            labelField="label"
            valueField="value"
            placeholder="Select Day"
            value={day}
            onChange={(item) => setDay(item.value)}
            style={styles.dropdown}
            placeholderStyle={{ color: "#777" }}
            selectedTextStyle={{ color: "#000" }}
          />

          {/* BUTTON ROW */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={onClose}>
              <TextComponent type="buttonText" style={styles.btnText}>
                Cancel
              </TextComponent>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.save]}
              onPress={() => {
                onSave({ reps, day });
                onClose();
              }}
            >
              <TextComponent type="buttonText" style={styles.btnText}>
                Save
              </TextComponent>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddPracticeInputModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  modalBox: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    elevation: 8,
  },

  title: {
    textAlign: "center",
    marginBottom: 20,
    color: "#000",
  },

  label: {
    marginTop: 10,
    marginBottom: 6,
    color: "#333",
  },

  input: {
    borderWidth: 1,
    borderColor: "#D4D4D4",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#000",
    marginBottom: 10,
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#D4D4D4",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 48,
    justifyContent: "center",
  },

  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
  },

  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 6,
  },

  cancel: {
    backgroundColor: "#999",
  },

  save: {
    backgroundColor: "#D4A017",
  },

  btnText: {
    color: "#FFF",
  },
});

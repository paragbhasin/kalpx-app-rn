import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Modal from "react-native-modal";
import Colors from "./Colors";
import TextComponent from "./TextComponent";

// Dropdown data
const statusData = [
  { label: "All Status", value: "" },
  { label: "Requested", value: "requested" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "Cancelled" },
  { label: "Pending", value: "pending" },
];

const whenData = [
  { label: "All", value: "all" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Past", value: "past" },
];

const sortData = [
  { label: "Most Recent", value: "updated_at" },
  { label: "Start Time ↑", value: "start_asc" },
  { label: "Start Time ↓", value: "start_desc" },
];

interface BookingFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  onClear : () => void;
}

const BookingFilterModal: React.FC<BookingFilterModalProps> = ({
  visible,
  onClose,
  onApply,
   onClear,
}) => {
  const [status, setStatus] = useState<string | null>(null);
  const [when, setWhen] = useState<string | null>(null);
  const [sort, setSort] = useState<string | null>(null);
  const handleClearAll = () => {
    setStatus("All Status");
    setWhen("All");
    setSort("Most Recent");
     // trigger parent callback
    if (onClear) {
      onClear();
    }

    // optionally close modal after clear
    onClose();
  };

  const handleApply = () => {
    onApply({
      status: status || "",
      when: when || "",
      sort: sort || "",
    });
    onClose();
  };

  const renderDropdown = (
    label: string,
    data: { label: string; value: string }[],
    value: string | null,
    setValue: React.Dispatch<React.SetStateAction<string | null>>
  ) => (
    <>
      <TextComponent type="mediumText" style={styles.label}>
        {label}
      </TextComponent>
      <View style={styles.container}>
        <Dropdown
          data={data}
          labelField="label"
          valueField="value"
          placeholder="Select item"
          value={value}
          onChange={(item) => setValue(item.value)}
          style={styles.dropdown}
          selectedTextStyle={styles.selectedText}
          placeholderStyle={styles.placeholder}
        />
      </View>
    </>
  );

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      backdropOpacity={0.6}
      animationIn="zoomIn"
      animationOut="zoomOut"
      useNativeDriver
    >
      <View style={styles.modalContent}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Image source={require("../../assets/Cross.png")} resizeMode="cover" />
        </TouchableOpacity>

        {renderDropdown("Status", statusData, status, setStatus)}
        {renderDropdown("When", whenData, when, setWhen)}
        {renderDropdown("Sort", sortData, sort, setSort)}

        <View style={styles.actionContainer}>
          <TouchableOpacity onPress={handleClearAll}>
            <TextComponent type="cardText" style={{ color: Colors.Colors.App_theme }}>
              Clear All
            </TextComponent>
          </TouchableOpacity>

          <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
            <TextComponent type="cardText" style={{ color: Colors.Colors.BLACK }}>
              Apply
            </TextComponent>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default BookingFilterModal;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
  },
  label: { color: Colors.Colors.Light_black, marginTop: 10, marginBottom: 5 },
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
  closeBtn: {
    backgroundColor: Colors.Colors.App_theme,
    alignSelf: "flex-end",
    padding: 10,
    borderRadius: 18,
    marginBottom: 10,
  },
  actionContainer: {
    flexDirection: "row",
    alignSelf: "flex-end",
    alignItems: "center",
    marginTop: 20,
  },
  applyBtn: {
    backgroundColor: Colors.Colors.App_theme,
    padding: 10,
    borderRadius: 4,
    marginLeft: 20,
  },
});

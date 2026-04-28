import React, { useState } from "react";
import {
  Alert,
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

const skillLevelData = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const classTypeData = [
  { value: "per_person", label: "Per person" },
  { value: "per_group", label: "Per group" },
  { value: "course", label: "Course" },
  { value: "package", label: "Package" },
];

const scheduleData = [
  { value: "rolling", label: "Rolling" },
  { value: "fixed", label: "Fixed" },
];

const languageData = [
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "tamil", label: "Tamil" },
  { value: "telugu", label: "Telugu" },
  { value: "kannada", label: "Kannada" },
  { value: "bengali", label: "Bengali" },
  { value: "marathi", label: "Marathi" },
  { value: "gujarati", label: "Gujarati" },
  { value: "malayalam", label: "Malayalam" },
  { value: "punjabi", label: "Punjabi" },
];

const sortData = [
  { value: "-updated_at", label: "Recently Added" },
  { value: "price_asc", label: "Low to High" },
  { value: "price_desc", label: "High to Low" },
];

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  onClear : () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  onClear
}) => {
  const [skillLevel, setSkillLevel] = useState<string | null>(null);
  const [classType, setClassType] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<string | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  // const [sort, setSort] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sort, setSort] = useState<string>("-updated_at");  // default sort


  const handleClearAll = () => {
    setSkillLevel(null);
    setClassType(null);
    setSchedule(null);
    setLanguage(null);
    setSort(null);
    setMinPrice("");
    setMaxPrice("");
     if (onClear) {
      onClear();
    }

    // optionally close modal after clear
    onClose();
  };

  const handleApply = () => {
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);

    if (minPrice !== "" && (isNaN(min) || min < 0)) {
      Alert.alert("Invalid Input", "Min price must be >= 0");
      return;
    }
    if (maxPrice !== "" && (isNaN(max) || max < min)) {
      Alert.alert("Invalid Input", "Max price must be >= Min price");
      return;
    }

    onApply({
      skillLevel: skillLevel || "",
      classType: classType || "",
      schedule: schedule || "",
      language: language || "",
      sort: sort || "",
      minPrice: minPrice || "",
      maxPrice: maxPrice || "",
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
          selectedTextProps={{ allowFontScaling: false }}
          data={data}
          labelField="label"
          valueField="value"
          placeholder="Select item"
          value={value}
          onChange={(item) => setValue(item.value)}
          style={styles.dropdown}
          selectedTextStyle={styles.selectedText}
          placeholderStyle={styles.placeholder}
  itemTextStyle={styles.dropdownItemText}
  containerStyle={styles.dropdownContainer}
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
            {renderDropdown("Language", languageData, language, setLanguage)}
        {renderDropdown("Skill Level", skillLevelData, skillLevel, setSkillLevel)}
        {renderDropdown("Class Type", classTypeData, classType, setClassType)}
        {renderDropdown("Schedule", scheduleData, schedule, setSchedule)}
    

        <TextComponent type="mediumText" style={styles.label}>
          Price
        </TextComponent>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TextInput
          allowFontScaling={false}
            style={styles.textInput}
            placeholder="Min"
            placeholderTextColor="#96A0AD"
            keyboardType="numeric"
            value={minPrice}
            onChangeText={setMinPrice}
          />
          <TextInput
          allowFontScaling={false}
            style={styles.textInput}
            placeholder="Max"
            placeholderTextColor="#96A0AD"
            keyboardType="numeric"
            value={maxPrice}
            onChangeText={setMaxPrice}
          />
        </View>

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

export default FilterModal;

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
  textInput: {
    fontSize: 16,
    color: Colors.Colors.BLACK,
    borderWidth: 1,
    borderColor: "#BDC4CD",
    borderRadius: 4,
    height: 46,
    backgroundColor: "#fff",
    width: "48%",
    paddingHorizontal: 12,
  },
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
  dropdownItemText: {
  color: "#000000", // color of list items
  fontSize: 16,
},

dropdownContainer: {
  backgroundColor: "#FFFFFF", // optional: makes list pop with contrast
  // borderRadius: 8,
},
});

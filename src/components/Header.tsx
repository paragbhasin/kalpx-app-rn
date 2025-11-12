import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Colors from "./Colors";

const Header = () => {
  const { i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(i18n.language);

const languages = [
  { label: "English", value: "en" },
  { label: "हिन्दी", value: "hi" },
  { label: "ગુજરાતી", value: "gu" },
  { label: "मराठी", value: "mr" },
  { label: "বাংলা", value: "bn" },
  { label: "ಕನ್ನಡ", value: "kn" },
  { label: "മലയാളം", value: "ml" },
  { label: "தமிழ்", value: "ta" },
  { label: "ଓଡିଆ", value: "or" },
  { label: "తెలుగు", value: "te" }
];


  const changeLanguage = (code: string) => {
    setSelectedLang(code);
    i18n.changeLanguage(code);
  };

  useEffect(() => {
    setSelectedLang(i18n.language);
  }, [i18n.language]);

  return (
    <View style={styles.sectionWrap}>
      {/* Left logo */}
      <Image
        source={require("../../assets/KalpXlogo.png")}
        resizeMode="contain"
        style={styles.logo}
      />

      {/* Language Dropdown */}
      <View style={styles.dropdownContainer}>
        <Dropdown
          selectedTextProps={{ allowFontScaling: false }}
          data={languages}
          labelField="label"
          valueField="value"
          placeholder="Language"
          value={selectedLang}
          onChange={(val) => changeLanguage(val.value)}
          style={styles.dropdown}
          selectedTextStyle={styles.selectedText}
          placeholderStyle={styles.placeholder}
          itemTextStyle={styles.itemText}
          maxHeight={130}
  // itemTextStyle={styles.dropdownItemText}
  containerStyle={styles.dropdownContainer}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionWrap: {
    backgroundColor: Colors.Colors.header_bg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  logo: {
    width: 100,
    height: 36,
  },
  dropdownContainer: {
    width: 120,
    justifyContent: "center",
  },
  dropdown: {
    height: 30, // reduced from 32 ➜ smaller height
    borderColor: "#BDC4CD",
    borderWidth: 0.6,
    borderRadius: 6,
    paddingHorizontal: 6,
    backgroundColor: "#FFF",
  },
  selectedText: {
    color: "#000000",
    fontSize: 12, // smaller text for compact fit
  },
  placeholder: {
    color: "#96A0AD",
    fontSize: 12,
  },
  itemText: {
    fontSize: 13,
    color: "#000",
  },
  dropdownItemText: {
  color: "#000000", // color of list items
  fontSize: 16,
},
});

export default Header;

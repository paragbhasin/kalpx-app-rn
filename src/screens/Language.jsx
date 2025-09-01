import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

export default function Language() {
  const navigation = useNavigation();
  const { i18n } = useTranslation();

  // Available languages
  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "te", label: "తెలుగు" },
  ];

  const [selectedLang, setSelectedLang] = useState(i18n.language);

  // Change language when selected
  const changeLanguage = (code) => {
    setSelectedLang(code);
    i18n.changeLanguage(code);
  };

  useEffect(() => {
    setSelectedLang(i18n.language);
  }, [i18n.language]);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Language</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Language Options */}
      <View style={styles.menu}>
        {languages.map((lang, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => changeLanguage(lang.code)}
          >
            <Text style={styles.menuText}>{lang.label}</Text>
            {selectedLang === lang.code ? (
              <Ionicons name="radio-button-on" size={20} color="#007bff" />
            ) : (
              <Ionicons name="radio-button-off" size={20} color="#888" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffaf5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  headerText: {
    fontSize: 16,
    fontFamily: "GelicaMedium",
    color: "#000",
    lineHeight: 20,
  },
  menu: {
    marginTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  menuText: {
    fontSize: 16,
    fontFamily: "GelicaRegular",
    color: "#333",
    lineHeight: 20,
  },
});

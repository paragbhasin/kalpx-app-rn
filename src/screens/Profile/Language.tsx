import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import styles from "./languageStyle";


 const Language = () =>  {
  const navigation : any= useNavigation();
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

export default Language;


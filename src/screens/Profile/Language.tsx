import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, TouchableOpacity, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../../components/Colors";
import TextComponent from "../../components/TextComponent";
import styles from "./languageStyle";

const Language = () => {
  const navigation: any = useNavigation();
  const { i18n } = useTranslation();

  // Available languages
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

  const [selectedLang, setSelectedLang] = useState(i18n.language);

  // Change language when selected
  const changeLanguage = (langCode: string) => {
    setSelectedLang(langCode);
    i18n.changeLanguage(langCode);
  };

  // Keep UI updated if language changes externally
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
        <TextComponent type="headerText" style={styles.headerText}>Language</TextComponent>
        <View style={{ width: 24 }} />
      </View>

      {/* Language Options */}
      <View style={styles.menu}>
        {languages.map((lang, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => changeLanguage(lang.value)}
          >
            <TextComponent type="headerText"
              style={[
                styles.menuText,
                selectedLang === lang.value && { color: Colors.Colors.App_theme,  fontFamily: "Inter_700Bold", }
              ]}
            >
              {lang.label}
            </TextComponent>
            {selectedLang === lang.value ? (
              <Ionicons name="radio-button-on" size={22} color={Colors.Colors.App_theme} />
            ) : (
              <Ionicons name="radio-button-off" size={22} color="#888" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default Language;

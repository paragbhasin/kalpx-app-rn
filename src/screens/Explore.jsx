<<<<<<< HEAD
import React, { useState } from "react";
import {
  View, Text, StyleSheet, ImageBackground, SafeAreaView,
  StatusBar, TextInput, Switch, TouchableOpacity, ScrollView,
  Modal, Pressable
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import ExploreVideos from "../components/ExploreVideos";
import Accordion from "../components/Accordion";
=======
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ImageBackground,
  Modal, Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Accordion from "../components/Accordion";
import ExploreVideos from "../components/ExploreVideos";
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08

export default function Explore() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [kidsHub, setKidsHub] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");

  const categories = ["All", "Religious Tales", "Meditation", "History", "Festivals", "Dance", "Prayers", "Popular Shows", "Yoga"];
  const languages = ["All", "Hindi", "Marathi", "Tamil", "Telugu", "English", "Gujarati"];

  const faqData = t("explore.faq", { returnObjects: true });

  const handleSelectOption = (option, type) => {
    if (type === "category") {
      setSelectedCategory(option);
      setCategoryModalVisible(false);
    } else {
      setSelectedLanguage(option);
      setLanguageModalVisible(false);
    }
  };

  const renderRadioOptions = (options, selected, type) => (
    <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
      {options.map((item, idx) => (
        <Pressable key={idx} style={styles.radioRow} onPress={() => handleSelectOption(item, type)}>
          <Ionicons
            name={selected === item ? "radio-button-on" : "radio-button-off"}
            size={20}
            color={selected === item ? "#b97f28" : "#999"}
          />
<<<<<<< HEAD
          <Text style={styles.radioText}>{item}</Text>
=======
          <Text  allowFontScaling={false} style={styles.radioText}>{item}</Text>
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
        </Pressable>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff4dd" />

      {/* Header */}
      <ImageBackground source={require("../../assets/explorebg.png")} style={styles.headerImage} imageStyle={styles.imageStyle}>
        <View style={styles.topButtons}>
          <View style={styles.iconButton}>
            <Ionicons name="arrow-back" size={22} color="#fff" onPress={() => navigation.goBack()} />
          </View>
        </View>
      </ImageBackground>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.rowBetween}>
<<<<<<< HEAD
          <Text style={styles.title}>{t("explore.title")}</Text>
          <View style={styles.row}>
            <Text style={styles.kidsText}>{t("explore.kids")}</Text>
=======
          <Text  allowFontScaling={false} style={styles.title}>{t("explore.title")}</Text>
          <View style={styles.row}>
            <Text  allowFontScaling={false} style={styles.kidsText}>{t("explore.kids")}</Text>
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
            <Switch value={kidsHub} onValueChange={setKidsHub} thumbColor="#fff" trackColor={{ false: "#ccc", true: "#b97f28" }} />
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
<<<<<<< HEAD
          <TextInput placeholder={t("explore.search")} placeholderTextColor="#999" style={styles.searchInput} />
=======
          <TextInput 
          allowFontScaling={false}
          placeholder={t("explore.search")} placeholderTextColor="#999" style={styles.searchInput} />
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
          <Ionicons name="mic" size={20} color="#999" />
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterButton} onPress={() => setCategoryModalVisible(true)}>
<<<<<<< HEAD
            <Text style={styles.filterText}>{selectedCategory || t("explore.filters.category")}</Text>
            <Ionicons name="chevron-down" size={16} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} onPress={() => setLanguageModalVisible(true)}>
            <Text style={styles.filterText}>{selectedLanguage || t("explore.filters.language")}</Text>
=======
            <Text  allowFontScaling={false} style={styles.filterText}>{selectedCategory || t("explore.filters.category")}</Text>
            <Ionicons name="chevron-down" size={16} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} onPress={() => setLanguageModalVisible(true)}>
            <Text  allowFontScaling={false} style={styles.filterText}>{selectedLanguage || t("explore.filters.language")}</Text>
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
            <Ionicons name="chevron-down" size={16} color="#000" />
          </TouchableOpacity>
        </View>

<<<<<<< HEAD
        <Text style={styles.subtitle}>{t("explore.subtitle")}</Text>

        <ScrollView style={{ marginTop: 16 }} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
          <ExploreVideos />
          <Text style={styles.subtitleTwo}>{t("explore.subtitleTwo")}</Text>
=======
        <Text  allowFontScaling={false} style={styles.subtitle}>{t("explore.subtitle")}</Text>

        <ScrollView style={{ marginTop: 16 }} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
          <ExploreVideos />
          <Text  allowFontScaling={false} style={styles.subtitleTwo}>{t("explore.subtitleTwo")}</Text>
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
          <Accordion data={faqData} />
        </ScrollView>
      </View>

      {/* Category Modal */}
      <Modal visible={categoryModalVisible} animationType="slide" transparent onRequestClose={() => setCategoryModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
<<<<<<< HEAD
              <Text style={styles.modalTitle}>{t("explore.modal.category")}</Text>
=======
              <Text  allowFontScaling={false} style={styles.modalTitle}>{t("explore.modal.category")}</Text>
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
              <Pressable onPress={() => setCategoryModalVisible(false)}><Ionicons name="close" size={24} color="#000" /></Pressable>
            </View>
            {renderRadioOptions(categories, selectedCategory, "category")}
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal visible={languageModalVisible} animationType="slide" transparent onRequestClose={() => setLanguageModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
<<<<<<< HEAD
              <Text style={styles.modalTitle}>{t("explore.modal.language")}</Text>
=======
              <Text  allowFontScaling={false} style={styles.modalTitle}>{t("explore.modal.language")}</Text>
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
              <Pressable onPress={() => setLanguageModalVisible(false)}><Ionicons name="close" size={24} color="#000" /></Pressable>
            </View>
            {renderRadioOptions(languages, selectedLanguage, "language")}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fffaf5" },
  headerImage: { height: 220, justifyContent: "space-between" },
  imageStyle: {
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  topButtons: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  iconButton: {
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 8,
    borderRadius: 20,
  },
  content: { flex: 1, padding: 16 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  row: { flexDirection: "row", alignItems: "center" },
  title: {
    fontSize: 18,
    fontFamily: "GelicaMedium",
    color: "#000",
<<<<<<< HEAD
    lineHeight: 22,
=======
    // lineHeight: 22,
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
  },
  kidsText: {
    marginRight: 8,
    fontSize: 14,
    fontFamily: "GelicaRegular",
    color: "#000",
<<<<<<< HEAD
    lineHeight: 18,
=======
    // lineHeight: 18,
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    color: "#000",
    fontFamily: "GelicaRegular",
    fontSize: 14,
<<<<<<< HEAD
    lineHeight: 18,
=======
    // lineHeight: 18,
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fbeedc",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 12,
  },
  filterText: {
    fontFamily: "GelicaMedium",
    fontSize: 14,
    color: "#000",
    marginRight: 4,
<<<<<<< HEAD
    lineHeight: 18,
=======
    // lineHeight: 18,
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "GelicaRegular",
    color: "#666",
<<<<<<< HEAD
    lineHeight: 18,
=======
    // lineHeight: 18,
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
    marginTop: 8,
    textAlign: "center",
  },
  subtitleTwo: {
    fontSize: 18,
    fontFamily: "GelicaRegular",
    color: "#000",
<<<<<<< HEAD
    lineHeight: 20,
=======
    // lineHeight: 20,
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
    marginTop: 26,
    textAlign: "left",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
<<<<<<< HEAD
  modalTitle: { fontSize: 18, fontFamily: "GelicaMedium", lineHeight: 22 },
=======
  modalTitle: { fontSize: 18, fontFamily: "GelicaMedium", 
    // lineHeight: 22 
  },
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  radioText: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: "GelicaRegular",
    color: "#000",
<<<<<<< HEAD
    lineHeight: 18,
=======
    // lineHeight: 18,
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
  },
});

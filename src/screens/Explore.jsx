import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  TextInput,
  Switch,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ExploreVideos from "../components/ExploreVideos";
import Accordion from "../components/Accordion";

export default function Explore() {
  const navigation = useNavigation();
  const [kidsHub, setKidsHub] = useState(false);

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");

  const categories = [
    "All",
    "Religious Tales",
    "Meditation",
    "History",
    "Festivals",
    "Dance",
    "Prayers",
    "Popular Shows",
    "Yoga",
  ];

  const languages = [
    "All",
    "Hindi",
    "Marathi",
    "Tamil",
    "Telugu",
    "English",
    "Gujarati",
  ];

  const faqData = [
    {
      title: "Why learn through Sanatan rooted classes?",
      description:
        "In Sanatan Dharma, learning is more than acquiring knowledge — it’s a sacred journey of inner refinement. KalpX Learn & Grow classes connect you with authentic teachers and timeless traditions, whether you’re exploring classical dance, mantra chanting, yoga, music, Ayurveda, or spiritual philosophy.",
    },
    {
      title: "How to use Kids Hub?",
      description:
        "Kids Hub provides child-friendly content filtered for safety and learning.",
    },
    {
      title: "Can I change the language?",
      description:
        "Yes, you can switch between multiple languages from the Explore page.",
    },
  ];

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
        <Pressable
          key={idx}
          style={styles.radioRow}
          onPress={() => handleSelectOption(item, type)}
        >
          <Ionicons
            name={selected === item ? "radio-button-on" : "radio-button-off"}
            size={20}
            color={selected === item ? "#b97f28" : "#999"}
          />
          <Text style={styles.radioText}>{item}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff4dd"
        translucent={false}
      />

      {/* Top Image with curved bottom */}
      <ImageBackground
        source={require("../../assets/explorebg.png")}
        style={styles.headerImage}
        imageStyle={styles.imageStyle}
      >
        {/* Back button */}
        <View style={styles.topButtons}>
          <View style={styles.iconButton}>
            <Ionicons
              name="arrow-back"
              size={22}
              color="#fff"
              onPress={() => navigation.goBack()}
            />
          </View>
        </View>
      </ImageBackground>

      {/* Static Content */}
      <View style={styles.content}>
        {/* Title and Switch */}
        <View style={styles.rowBetween}>
          <Text style={styles.title}>Explore Videos</Text>
          <View style={styles.row}>
            <Text style={styles.kidsText}>Kids Hubs</Text>
            <Switch
              value={kidsHub}
              onValueChange={setKidsHub}
              thumbColor="#fff"
              trackColor={{ false: "#ccc", true: "#b97f28" }}
            />
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#999"
            style={styles.searchInput}
          />
          <Ionicons name="mic" size={20} color="#999" />
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setCategoryModalVisible(true)}
          >
            <Text style={styles.filterText}>
              {selectedCategory || "Select Category"}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setLanguageModalVisible(true)}
          >
            <Text style={styles.filterText}>
              {selectedLanguage || "Language"}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Reconnect with Your Roots — Start Watching
        </Text>

        {/* Scroll only for Accordion + ExploreVideos */}
        <ScrollView
          style={{ marginTop: 16 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <ExploreVideos />
          <Text style={styles.subtitleTwo}>Why Explore Spiritual Videos?</Text>
          <Accordion data={faqData} />
        </ScrollView>
      </View>

      {/* Category Modal */}
      <Modal
        visible={categoryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <Pressable onPress={() => setCategoryModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </Pressable>
            </View>
            {renderRadioOptions(categories, selectedCategory, "category")}
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal
        visible={languageModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <Pressable onPress={() => setLanguageModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </Pressable>
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
    lineHeight: 22,
  },
  kidsText: {
    marginRight: 8,
    fontSize: 14,
    fontFamily: "GelicaRegular",
    color: "#000",
    lineHeight: 18,
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
    lineHeight: 18,
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
    lineHeight: 18,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "GelicaRegular",
    color: "#666",
    lineHeight: 18,
    marginTop: 8,
    textAlign: "center",
  },
  subtitleTwo: {
    fontSize: 18,
    fontFamily: "GelicaRegular",
    color: "#000",
    lineHeight: 20,
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
  modalTitle: { fontSize: 18, fontFamily: "GelicaMedium", lineHeight: 22 },
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
    lineHeight: 18,
  },
});

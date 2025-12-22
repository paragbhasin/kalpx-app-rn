<<<<<<< HEAD
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next"; // ✅ import hook
=======
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next"; // ✅ import hook
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08

export default function OnlineclassesScreen({ navigation }) {
  const { t } = useTranslation(); // ✅ initialize translation
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [experienceLevel, setExperienceLevel] = useState(null);
  const [city, setCity] = useState("");
  const [ageGroup, setAgeGroup] = useState(null);
  const [preferredTime, setPreferredTime] = useState(null);
  const [spiritualSeeking, setSpiritualSeeking] = useState("");

  const toggleSelection = (list, setList, value) => {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  const SectionTitle = ({ children }) => (
<<<<<<< HEAD
    <Text style={styles.sectionTitle}>{children}</Text>
=======
    <Text  allowFontScaling={false} style={styles.sectionTitle}>{children}</Text>
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <ImageBackground
        source={require("../../assets/onlineclass.png")}
        style={styles.headerImage}
        imageStyle={styles.imageStyle}
      >
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
<<<<<<< HEAD
        <Text style={styles.headerTitle}>{t("onlineClasses.title")}</Text>
=======
        <Text  allowFontScaling={false} style={styles.headerTitle}>{t("onlineClasses.title")}</Text>
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
      </ImageBackground>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Activities - Checkboxes */}
        <SectionTitle>{t("onlineClasses.selectActivities")}</SectionTitle>
        {["yoga", "dance", "music"].map((activity) => (
          <TouchableOpacity
            key={activity}
            style={styles.checkboxRow}
            onPress={() =>
              toggleSelection(selectedActivities, setSelectedActivities, activity)
            }
          >
            <View
              style={[
                styles.checkbox,
                selectedActivities.includes(activity) && styles.checkboxSelected,
              ]}
            >
              {selectedActivities.includes(activity) && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
<<<<<<< HEAD
            <Text style={styles.checkboxLabel}>
=======
            <Text  allowFontScaling={false} style={styles.checkboxLabel}>
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
              {t(`onlineClasses.activities.${activity}`)}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Format */}
        <SectionTitle>{t("onlineClasses.classFormat")}</SectionTitle>
        <View style={styles.optionsRow}>
          {["oneOnOne", "smallGroup", "preRecorded", "liveQA"].map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.chip,
                selectedFormats.includes(opt) && styles.chipSelected,
              ]}
              onPress={() => toggleSelection(selectedFormats, setSelectedFormats, opt)}
            >
<<<<<<< HEAD
              <Text
=======
              <Text  allowFontScaling={false}
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
                style={[
                  styles.chipText,
                  selectedFormats.includes(opt) && styles.chipTextSelected,
                ]}
              >
                {t(`onlineClasses.formats.${opt}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Experience */}
        <SectionTitle>{t("onlineClasses.experienceLevel")}</SectionTitle>
        <View style={styles.optionsRow}>
          {["beginner", "intermediate", "advanced"].map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, experienceLevel === opt && styles.chipSelected]}
              onPress={() => setExperienceLevel(opt)}
            >
<<<<<<< HEAD
              <Text
=======
              <Text  allowFontScaling={false}
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
                style={[
                  styles.chipText,
                  experienceLevel === opt && styles.chipTextSelected,
                ]}
              >
                {t(`onlineClasses.levels.${opt}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* City */}
        <SectionTitle>{t("onlineClasses.city")}</SectionTitle>
        <TextInput
<<<<<<< HEAD
=======
        allowFontScaling={false}
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
          style={styles.input}
          placeholder={t("onlineClasses.city")}
          value={city}
          onChangeText={setCity}
        />

        {/* Age Group */}
        <SectionTitle>{t("onlineClasses.ageGroup")}</SectionTitle>
        <View style={styles.optionsRow}>
          {["child", "teen", "adult", "above55"].map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, ageGroup === opt && styles.chipSelected]}
              onPress={() => setAgeGroup(opt)}
            >
<<<<<<< HEAD
              <Text
=======
              <Text  allowFontScaling={false}
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
                style={[
                  styles.chipText,
                  ageGroup === opt && styles.chipTextSelected,
                ]}
              >
                {t(`onlineClasses.ages.${opt}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Preferred Time */}
        <SectionTitle>{t("onlineClasses.preferredTime")}</SectionTitle>
        <View style={styles.optionsRow}>
          {["morning", "afternoon", "evening"].map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, preferredTime === opt && styles.chipSelected]}
              onPress={() => setPreferredTime(opt)}
            >
<<<<<<< HEAD
              <Text
=======
              <Text  allowFontScaling={false}
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
                style={[
                  styles.chipText,
                  preferredTime === opt && styles.chipTextSelected,
                ]}
              >
                {t(`onlineClasses.times.${opt}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Spiritual Seeking */}
        <SectionTitle>{t("onlineClasses.spiritualSeeking")}</SectionTitle>
        <TextInput
<<<<<<< HEAD
=======
        allowFontScaling={false}
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
          style={styles.textarea}
          placeholder={t("onlineClasses.spiritualSeeking")}
          multiline
          numberOfLines={4}
          value={spiritualSeeking}
          onChangeText={setSpiritualSeeking}
        />
      </ScrollView>

      {/* Sticky Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton}>
<<<<<<< HEAD
          <Text style={styles.submitText}>{t("onlineClasses.nextStep")}</Text>
=======
          <Text  allowFontScaling={false} style={styles.submitText}>{t("onlineClasses.nextStep")}</Text>
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fffaf5" },
  headerImage: { height: 200, justifyContent: "flex-end" },
  imageStyle: {
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  iconButton: {
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 8,
    borderRadius: 20,
    position: "absolute",
    top: 16,
    left: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "GelicaBold",
    color: "#fff",
    marginBottom: 16,
    marginLeft: 16,
<<<<<<< HEAD
    lineHeight: 28,
=======
    // lineHeight: 28,
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
  },
  scroll: { flex: 1 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "GelicaMedium",
    color: "#000",
    marginVertical: 12,
<<<<<<< HEAD
    lineHeight: 22,
=======
    // lineHeight: 22,
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#aaa",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: "#b97f28",
    borderColor: "#b97f28",
  },
  checkboxLabel: {
    fontSize: 15,
    fontFamily: "GelicaRegular",
    color: "#333",
<<<<<<< HEAD
    lineHeight: 22,
=======
    // lineHeight: 22,
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    backgroundColor: "#fbeedc",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  chipSelected: { backgroundColor: "#b97f28" },
  chipText: {
    fontFamily: "GelicaRegular",
    fontSize: 14,
<<<<<<< HEAD
    lineHeight: 20,
=======
    // lineHeight: 20,
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
    color: "#333",
  },
  chipTextSelected: { color: "#fff", fontFamily: "GelicaMedium" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    fontFamily: "GelicaRegular",
    fontSize: 14,
<<<<<<< HEAD
    lineHeight: 20,
=======
    // lineHeight: 20,
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    fontFamily: "GelicaRegular",
    fontSize: 14,
<<<<<<< HEAD
    lineHeight: 20,
=======
    // lineHeight: 20,
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
    backgroundColor: "#fff",
    textAlignVertical: "top",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fffaf5",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  submitButton: {
    backgroundColor: "#a67c52",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "GelicaMedium",
<<<<<<< HEAD
    lineHeight: 22,
=======
    // lineHeight: 22,
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
  },
});

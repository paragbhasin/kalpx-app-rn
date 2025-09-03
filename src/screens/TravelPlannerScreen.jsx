import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { MapPin } from "lucide-react-native";
import { useState } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import CategoryCard from "../components/CategoryCard";
import ExperienceCard from "../components/ExperienceCard";
import PillOption from "../components/PillOption";
import Section from "../components/Section";

const ALL_CATEGORIES = [
  { id: "char_dham", title: "charDham", subtitle: "yatra", image: "https://picsum.photos/seed/chardham/300/200" },
  { id: "riverine", title: "riverine", subtitle: "pilgrimage", image: "https://picsum.photos/seed/river/300/200" },
  { id: "shaktipeeth", title: "shaktipeeth", subtitle: "yatra", image: "https://picsum.photos/seed/shakti/300/200" },
  { id: "jyotirlinga", title: "jyotirlinga", subtitle: "darshan", image: "https://picsum.photos/seed/jyoti/300/200" },
  { id: "temple_towns", title: "temple", subtitle: "towns", image: "https://picsum.photos/seed/temple/300/200" },
  { id: "ashrams", title: "ashrams", subtitle: "stay", image: "https://picsum.photos/seed/ashram/300/200" },
];

const DURATION = ["duration1", "duration2", "duration3"];

export default function TravelPlannerScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [selectedCats, setSelectedCats] = useState(["char_dham"]);
  const [duration, setDuration] = useState(null);
  const [experience, setExperience] = useState("Comfort");
  const [companions, setCompanions] = useState(["Solo"]);
  const [notes, setNotes] = useState("");

  const toggleCat = (id) =>
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleCompanion = (label) =>
    setCompanions((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <ImageBackground
        source={require("../../assets/travelbg.png")}
        style={styles.headerImage}
        imageStyle={styles.imageStyle}
      >
        <Pressable
          style={styles.iconButton}
          onPress={() => navigation.navigate("HomePage")}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <View style={styles.headerBottom}>
          <Text style={styles.headerTitle}>{t("travelPlanner.title")}</Text>
          <View style={styles.locationBadge}>
            <MapPin size={14} color="#444" />
            <Text style={styles.locationText}>{t("travelPlanner.city")}</Text>
          </View>
        </View>
      </ImageBackground>

      {/* Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Categories */}
          <Section title={t("travelPlanner.journeyCategories")}>
            <View style={styles.grid}>
              {ALL_CATEGORIES.map((c) => (
                <CategoryCard
                  key={c.id}
                  item={{ ...c, title: t(`travelPlanner.categories.${c.title}`), subtitle: t(`travelPlanner.categories.${c.subtitle}`) }}
                  selected={selectedCats.includes(c.id)}
                  onToggle={toggleCat}
                />
              ))}
            </View>
          </Section>

          {/* Duration */}
          <Section title={t("travelPlanner.idealDuration")}>
            <View style={styles.durationBox}>
              {DURATION.map((opt) => {
                const on = duration === opt;
                return (
                  <Pressable
                    key={opt}
                    onPress={() => setDuration(opt)}
                    style={styles.durationRow}
                  >
                    <View style={[styles.checkbox, on && styles.checkboxOn]}>
                      {on && <Ionicons name="checkmark" size={12} color="#fff" />}
                    </View>
                    <Text style={styles.durationText}>{t(`travelPlanner.${opt}`)}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Section>

          {/* Experience */}
          <Section title={t("travelPlanner.experienceType")}>
            <View style={styles.experienceRow}>
              <ExperienceCard
                label={t("travelPlanner.experiences.essential")}
                blurb={t("travelPlanner.experiences.essentialBlurb")}
                active={experience === "Essential"}
                onPress={() => setExperience("Essential")}
              />
              <ExperienceCard
                label={t("travelPlanner.experiences.comfort")}
                blurb={t("travelPlanner.experiences.comfortBlurb")}
                active={experience === "Comfort"}
                onPress={() => setExperience("Comfort")}
              />
              <ExperienceCard
                label={t("travelPlanner.experiences.premium")}
                blurb={t("travelPlanner.experiences.premiumBlurb")}
                active={experience === "Premium"}
                onPress={() => setExperience("Premium")}
              />
            </View>
          </Section>

          {/* Companions */}
          <Section title={t("travelPlanner.companionsTitle")}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
              {["solo", "friendsGroup", "family", "spiritualGuide"].map((lbl) => (
                <PillOption
                  key={lbl}
                  label={t(`travelPlanner.companions.${lbl}`)}
                  selected={companions.includes(lbl)}
                  onToggle={toggleCompanion}
                />
              ))}
            </View>
          </Section>

          {/* Notes */}
          <Section title={t("travelPlanner.travelIntent")}>
            <TextInput
              multiline
              placeholder={t("travelPlanner.intentPlaceholder")}
              value={notes}
              onChangeText={setNotes}
              style={styles.textArea}
              placeholderTextColor="#888"
            />
          </Section>
        </ScrollView>

        {/* Sticky Button */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              pressed && { opacity: 0.9 },
            ]}
            onPress={() =>
              console.log({ selectedCats, duration, experience, companions, notes })
            }
          >
            <Text style={styles.submitText}>{t("travelPlanner.nextStep")}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fffaf5" },
  scroll: { flex: 1 },
  headerImage: { height: 220, justifyContent: "flex-end" },
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
  headerBottom: {
    padding: 16,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "GelicaBold",
    color: "#fff",
    marginBottom: 6,
    lineHeight: 28,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  locationText: {
    fontSize: 13,
    color: "#444",
    marginLeft: 4,
    lineHeight: 18,
    fontFamily: "GelicaRegular",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  durationBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#aaa",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxOn: { backgroundColor: "#b97f28", borderColor: "#b97f28" },
  durationText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
    fontFamily: "GelicaRegular",
  },
  experienceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 12,
    minHeight: 120,
    padding: 12,
    textAlignVertical: "top",
    fontSize: 14,
    color: "#333",
    fontFamily: "GelicaRegular",
    lineHeight: 20,
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
    lineHeight: 22,
  },
});

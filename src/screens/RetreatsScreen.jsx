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

import CategoryCard from "../components/CategoryCard";
import ExperienceCard from "../components/ExperienceCard";
import Section from "../components/Section";
import colors from "../theme/colors";
import { useTranslation } from "react-i18next";

const HEALING = [
  {
    id: "silence",
    titleKey: "retreats.healing.silence.title",
    subtitleKey: "retreats.healing.silence.subtitle",
    image: "https://picsum.photos/seed/silence/300/200",
  },
  {
    id: "ayurveda",
    titleKey: "retreats.healing.ayurveda.title",
    subtitleKey: "retreats.healing.ayurveda.subtitle",
    image: "https://picsum.photos/seed/ayurveda/300/200",
  },
  {
    id: "yoga",
    titleKey: "retreats.healing.yoga.title",
    subtitleKey: "retreats.healing.yoga.subtitle",
    image: "https://picsum.photos/seed/yoga/300/200",
  },
];

const LOCATIONS = [
  {
    id: "himalayas",
    titleKey: "retreats.locations.himalayas.title",
    subtitleKey: "retreats.locations.himalayas.subtitle",
    image: "https://picsum.photos/seed/himalaya/300/200",
  },
  {
    id: "kerala",
    titleKey: "retreats.locations.kerala.title",
    subtitleKey: "retreats.locations.kerala.subtitle",
    image: "https://picsum.photos/seed/kerala/300/200",
  },
  {
    id: "desert",
    titleKey: "retreats.locations.desert.title",
    subtitleKey: "retreats.locations.desert.subtitle",
    image: "https://picsum.photos/seed/desert/300/200",
  },
];

import { useTranslation } from "react-i18next";
import { useScrollContext } from "../context/ScrollContext";

export default function RetreatsScreen() {
  const { handleScroll } = useScrollContext();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const DURATION = [
    { key: "duration1", text: t("retreats.duration1") },
    { key: "duration2", text: t("retreats.duration2") },
    { key: "duration3", text: t("retreats.duration3") },
  ];

  const [healingCats, setHealingCats] = useState(["silence"]);
  const [locations, setLocations] = useState(["himalayas"]);
  const [duration, setDuration] = useState(null);
  const [experience, setExperience] = useState("Comfort");
  const [notes, setNotes] = useState("");

  const toggleHealing = (id) =>
    setHealingCats((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleLocation = (id) =>
    setLocations((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <ImageBackground
        source={require("../../assets/retreats.png")}
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
          <Text style={styles.headerTitle}>{t("retreats.title")}</Text>
          <View style={styles.locationBadge}>
            <MapPin size={14} color="#444" />
            <Text style={styles.locationText}>{t("retreats.city")}</Text>
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
          contentContainerStyle={{ padding: 16, paddingBottom: 120, paddingTop: 50 }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Healing */}
          <Section title={t("retreats.healingCategories")}>
            <View style={styles.grid}>
              {HEALING.map((c) => (
                <CategoryCard
                  key={c.id}
                  item={{
                    ...c,
                    title: t(c.titleKey),
                    subtitle: t(c.subtitleKey),
                  }}
                  selected={healingCats.includes(c.id)}
                  onToggle={toggleHealing}
                />
              ))}
            </View>
          </Section>

          {/* Location */}
          <Section title={t("retreats.preferredLocations")}>
            <View style={styles.grid}>
              {LOCATIONS.map((c) => (
                <CategoryCard
                  key={c.id}
                  item={{
                    ...c,
                    title: t(c.titleKey),
                    subtitle: t(c.subtitleKey),
                  }}
                  selected={locations.includes(c.id)}
                  onToggle={toggleLocation}
                />
              ))}
            </View>
          </Section>

          {/* Duration */}
          <Section title={t("retreats.idealDuration")}>
            <View style={styles.durationBox}>
              {DURATION.map((opt) => {
                const on = duration === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => setDuration(opt.key)}
                    style={styles.durationRow}
                  >
                    <View style={[styles.checkbox, on && styles.checkboxOn]}>
                      {on && <Ionicons name="checkmark" size={12} color="#fff" />}
                    </View>
                    <Text style={styles.durationText}>{opt.text}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Section>

          {/* Experience */}
          <Section title={t("retreats.experienceType")}>
            <View style={styles.experienceRow}>
              <ExperienceCard
                label={t("retreats.experiences.essential")}
                blurb={t("retreats.experiences.essentialBlurb")}
                active={experience === "Essential"}
                onPress={() => setExperience("Essential")}
              />
              <ExperienceCard
                label={t("retreats.experiences.comfort")}
                blurb={t("retreats.experiences.comfortBlurb")}
                active={experience === "Comfort"}
                onPress={() => setExperience("Comfort")}
              />
              <ExperienceCard
                label={t("retreats.experiences.premium")}
                blurb={t("retreats.experiences.premiumBlurb")}
                active={experience === "Premium"}
                onPress={() => setExperience("Premium")}
              />
            </View>
          </Section>

          {/* Notes */}
          <Section title={t("retreats.spiritualIntent")}>
            <TextInput
              multiline
              placeholder={t("retreats.intentPlaceholder")}
              value={notes}
              onChangeText={setNotes}
              style={styles.textArea}
              placeholderTextColor={colors.subtext}
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
              console.log({ healingCats, locations, duration, experience, notes })
            }
          >
            <Text style={styles.submitText}>{t("retreats.nextStep")}</Text>
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

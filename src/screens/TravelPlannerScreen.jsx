import { useNavigation } from "@react-navigation/native";
import { Check, ChevronLeft, MapPin } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import CategoryCard from "../components/CategoryCard";
import ExperienceCard from "../components/ExperienceCard";
import PillOption from "../components/PillOption";
import Section from "../components/Section";
import colors from "../theme/colors";

const ALL_CATEGORIES = [
  { id: "char_dham", title: "Char Dham", subtitle: "Yatra", image: "https://picsum.photos/seed/chardham/300/200" },
  { id: "riverine", title: "Riverine", subtitle: "Pilgrimage", image: "https://picsum.photos/seed/river/300/200" },
  { id: "shaktipeeth", title: "Shaktipeeth", subtitle: "Yatra", image: "https://picsum.photos/seed/shakti/300/200" },
  { id: "jyotirlinga", title: "Jyotirlinga", subtitle: "Darshan", image: "https://picsum.photos/seed/jyoti/300/200" },
  { id: "temple_towns", title: "Temple", subtitle: "Towns", image: "https://picsum.photos/seed/temple/300/200" },
  { id: "ashrams", title: "Ashrams", subtitle: "Stay", image: "https://picsum.photos/seed/ashram/300/200" },
];

const DURATION = [
  "3 Days – Weekend Devotion",
  "7 Days – Full Experience",
  "10+ Days – Soulful Immersion",
];

export default function TravelPlannerScreen() {
  const [selectedCats, setSelectedCats] = useState(["char_dham", "riverine", "shaktipeeth"]);
  const [duration, setDuration] = useState(null);
  const [experience, setExperience] = useState("Comfort");
  const [companions, setCompanions] = useState(["Solo"]);
  const [notes, setNotes] = useState("");

  const selectedChips = useMemo(
    () =>
      ALL_CATEGORIES.filter((c) => selectedCats.includes(c.id)).map(
        (c) => `${c.title}${c.subtitle ? " " + c.subtitle : ""}`
      ),
    [selectedCats]
  );

  const toggleCat = (id) =>
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleCompanion = (label) =>
    setCompanions((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  const navigation = useNavigation();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={{ position: "relative", width: "100%", height: 300 }}>
        <Image
          source={require("../../assets/travelbg.png")}
          style={{ position: "absolute", width: "100%", height: "100%" }}
          resizeMode="cover"
        />
        <View style={{ position: "absolute", top: 16, left: 16 }}>
          <Pressable style={styles.iconBtn} onPress={() => navigation.navigate("HomePage")}>
            <ChevronLeft size={20} color={colors.primaryDark} />
          </Pressable>
        </View>
        <View style={{ position: "absolute", bottom: 16, left: 16 }}>
          <Text style={styles.headerTitle}>Travel</Text>
          <View style={styles.locationBadge}>
            <MapPin size={14} color={colors.subtext} />
            <Text style={styles.locationText}>Hyderabad</Text>
          </View>
        </View>
      </View>

      {/* Body */}
      <View style={{ padding: 16 }}>
        <Text style={styles.sectionHeader}>Plan Your Sacred Journey</Text>
        <Text style={styles.sectionSubtext}>
          What Type of Journey Are You Seeking? (Select all that apply)
        </Text>

        {/* Categories */}
        <View style={styles.grid}>
          {ALL_CATEGORIES.map((c) => (
            <CategoryCard
              key={c.id}
              item={c}
              selected={selectedCats.includes(c.id)}
              onToggle={toggleCat}
            />
          ))}
        </View>

        {/* Chips */}
        {selectedChips.length > 0 && (
          <View style={styles.chipWrap}>
            {selectedChips.map((label) => (
              <View key={label} style={styles.chip}>
                <Check size={14} color={colors.text} />
                <Text style={styles.chipText}>{label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Duration */}
        <Section title="Ideal Duration">
          <View style={styles.durationBox}>
            {DURATION.map((opt) => {
              const on = duration === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => setDuration(opt)}
                  style={styles.durationBtn}
                >
                  <View style={[styles.radio, on && styles.radioOn]}>
                    {on && <Check size={12} color="white" />}
                  </View>
                  <Text style={styles.durationText}>{opt}</Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        {/* Experience */}
        <Section title="What Type of Experience Are You Looking For?">
          <View style={{ flexDirection: "row" }}>
            <ExperienceCard
              label="Essential"
              blurb="Simplicity, affordability, dharmic focus"
              active={experience === "Essential"}
              onPress={setExperience}
            />
            <ExperienceCard
              label="Comfort"
              blurb="Balanced convenience with spiritual integrity"
              active={experience === "Comfort"}
              onPress={setExperience}
            />
            <ExperienceCard
              label="Premium"
              blurb="Boutique stays, curated guides, enhanced care"
              active={experience === "Premium"}
              onPress={setExperience}
            />
          </View>
        </Section>

        {/* Companions */}
        <Section title="Who Will You Be Traveling With?">
          <Text style={styles.note}>Select all that apply.</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 12 }}>
            {["Solo", "Friends • Group", "Family", "Spiritual Guide"].map((lbl) => (
              <PillOption
                key={lbl}
                label={lbl}
                selected={companions.includes(lbl)}
                onToggle={toggleCompanion}
              />
            ))}
          </View>
        </Section>

        {/* Notes */}
        <Section title="What Are You Spiritually Seeking Through These Classes?">
          <TextInput
            placeholder="Share your intent…"
            value={notes}
            onChangeText={setNotes}
            multiline
            style={styles.textarea}
            placeholderTextColor={colors.subtext}
          />
        </Section>

        {/* CTA */}
        <Pressable
          onPress={() => {
            console.log({ selectedCats, duration, experience, companions, notes });
          }}
          style={styles.cta}
        >
          <Text style={styles.ctaText}>Update</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
  
    color: colors.bg,
    textShadowColor: "#000",
    textShadowRadius: 6,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    elevation: 2,
  },
  locationText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 4,
  },
  sectionSubtext: { color: colors.subtext, marginBottom: 16 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.chipBg,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
    marginLeft: 4,
  },
  durationBox: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 8,
  },
  durationBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  durationText: { fontSize: 14, color: colors.text },
  note: { fontSize: 12, color: colors.subtext },
  textarea: {
    width: "100%",
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    textAlignVertical: "top",
    backgroundColor: colors.card,
    color: colors.text,
  },
  cta: {
    width: "100%",
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  ctaText: { color: colors.bg, fontWeight: "700", fontSize: 16 },
});

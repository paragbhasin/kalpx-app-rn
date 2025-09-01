import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, MapPin } from "lucide-react-native";
import { useState } from "react";
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
import Section from "../components/Section";
import colors from "../theme/colors";
;
// @ts-ignore (removed typing)
//const headerImage = require('../../assets/images/retreats.png'); // Varanasi vibe

const HEALING = [
  {
    id: 'silence',
    title: 'Spiritual Silence',
    subtitle: 'Meditation, Detox, Ashram',
    image: 'https://picsum.photos/seed/silence/300/200',
  },
  {
    id: 'ayurveda',
    title: 'Ayurveda Healing',
    subtitle: 'Massage, Herbal, Detox',
    image: 'https://picsum.photos/seed/ayurveda/300/200',
  },
  {
    id: 'yoga',
    title: 'Yoga & Wellness',
    subtitle: 'Asanas, Breathwork, Balance',
    image: 'https://picsum.photos/seed/yoga/300/200',
  },
];

const LOCATIONS = [
  {
    id: 'himalayas',
    title: 'Himalayas',
    subtitle: 'Mountains & Rivers',
    image: 'https://picsum.photos/seed/himalaya/300/200',
  },
  {
    id: 'kerala',
    title: 'Kerala',
    subtitle: 'Ayurveda, Backwaters',
    image: 'https://picsum.photos/seed/kerala/300/200',
  },
  {
    id: 'desert',
    title: 'Desert Ashrams',
    subtitle: 'Silence & Meditation',
    image: 'https://picsum.photos/seed/desert/300/200',
  },
];

export default function RetreatsScreen() {
   const navigation = useNavigation();  
  const DURATION = [
    '3 Days – Weekend Devotion',
    '7 Days – Full Experience',
    '10+ Days – Soulful Immersion',
  ];

  const [healingCats, setHealingCats] = useState(['silence']);
  const [locations, setLocations] = useState(['himalayas']);
  const [duration, setDuration] = useState(null);
  const [experience, setExperience] = useState('Comfort');
  const [notes, setNotes] = useState('');

  const toggleHealing = (id) =>
    setHealingCats((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleLocation = (id) =>
    setLocations((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  return (
    
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        {/* Header */}
     <View style={{ position: "relative", width: "100%", height: 300 }}>
        <Image
          source={require("../../assets/retreats.png")}
          style={{ position: "absolute", width: "100%", height: "100%" }}
          resizeMode="cover"
        />
        <View style={{ position: "absolute", top: 16, left: 16 }}>
          <Pressable style={styles.iconBtn} onPress={() => navigation.navigate("HomePage")}>
            <ChevronLeft size={20} color={colors.primaryDark} />
          </Pressable>
        </View>
        <View style={{ position: "absolute", bottom: 16, left: 16 }}>
          <Text style={styles.headerTitle}>Retreats</Text>
          <View style={styles.locationBadge}>
            <MapPin size={14} color={colors.subtext} />
            <Text style={styles.locationText}>Hyderabad</Text>
          </View>
        </View>
      </View>

        <View style={styles.body}>
          {/* Healing */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            <Section title="Healing Categories">
              <View style={styles.grid}>
                {HEALING.map((c) => (
                  <CategoryCard
                    key={c.id}
                    item={c}
                    selected={healingCats.includes(c.id)}
                    onToggle={toggleHealing}
                  />
                ))}
              </View>
            </Section>
          </ScrollView>

          {/* Location */}
          <Section title="Preferred Locations">
            <View style={styles.grid}>
              {LOCATIONS.map((c) => (
                <CategoryCard
                  key={c.id}
                  item={c}
                  selected={locations.includes(c.id)}
                  onToggle={toggleLocation}
                />
              ))}
            </View>
          </Section>

          {/* Duration */}
          <Section title="Ideal Duration">
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
                      {on ? (
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      ) : null}
                    </View>
                    <Text style={styles.durationText}>{opt}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Section>

          {/* Experience */}
          <Section title="Experience Type">
            <View style={{ flexDirection: 'row' }}>
              <ExperienceCard
                label="Essential"
                blurb="Simplicity, affordability, dharmic focus"
                active={experience === 'Essential'}
                onPress={setExperience}
              />
              <ExperienceCard
                label="Comfort"
                blurb="Balanced convenience with spiritual integrity"
                active={experience === 'Comfort'}
                onPress={setExperience}
              />
              <ExperienceCard
                label="Premium"
                blurb="Boutique stays, curated guides, enhanced care"
                active={experience === 'Premium'}
                onPress={setExperience}
              />
            </View>
          </Section>

          {/* Notes */}
          <Section title="Your Spiritual Intent">
            <TextInput
              multiline
              placeholder="Share your intent…"
              value={notes}
              onChangeText={setNotes}
              style={styles.textArea}
              placeholderTextColor={colors.subtext}
            />
          </Section>

          {/* CTA */}
          <Pressable
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
            onPress={() =>
              console.log({
                healingCats,
                locations,
                duration,
                experience,
                notes,
              })
            }
          >
            <Text style={styles.ctaText}>Take the Next Step</Text>
          </Pressable>
        </View>
      </ScrollView>
  
  );
}

const styles = StyleSheet.create({
  horizontalScroll: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  headerWrap: { aspectRatio: 9 / 5 },
  headerImage: { flex: 1, width: '100%', height: 200 },
  headerTop: { padding: 12, alignItems: 'flex-start' },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBottom: { position: 'absolute', bottom: 12, left: 16 },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  body: { paddingHorizontal: 16, paddingTop: 16 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  durationBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFF',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  durationText: { color: colors.text, fontSize: 14 },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFF',
    borderRadius: 16,
    minHeight: 120,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 14,
    color: colors.text,
  },
  cta: {
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  ctaText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
});

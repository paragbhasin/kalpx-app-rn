import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { MapPin } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { useDispatch } from "react-redux";

import CategoryCard from "../../components/CategoryCard";
import ExperienceCard from "../../components/ExperienceCard";
import LoadingButton from "../../components/LoadingButton";
import Section from "../../components/Section";
import SuccessModal from "../../components/SuccessModal";
import { travelIntresetUser } from "./actions";
import styles from "./travelstyles";

const ALL_CATEGORIES = [
  {
    id: "charDham",
    title: "Char Dham Yatra",
    subtitle:
      "Connect with the ultimate spiritual circuit across India’s divine corners.",
    image: "https://dev.kalpx.com/img/char-dham.137cfaf5.jpg",
  },
  {
    id: "riverine",
    title: "Riverine Pilgrimage",
    subtitle:
      "Immerse yourself in the purifying embrace of India’s sacred rivers and their holy confluence points.",
    image: "https://dev.kalpx.com/img/riverine.9c0993b7.jpg",
  },
  {
    id: "shaktipeeth",
    title: "Shaktipeeth Yatra",
    subtitle:
      "Awaken the divine feminine power by honoring the sacred abodes of the Mother Goddess.",
    image: "https://dev.kalpx.com/img/shaktipeeth.d335333c.jpg",
  },
  {
    id: "ramayana",
    title: "Ramayana Circuit",
    subtitle:
      "Walk the footsteps of Shri Ram, retracing his epic journey of dharma and devotion.",
    image: "https://dev.kalpx.com/img/ramayana.68fbbb93.jpg",
  },
  {
    id: "krishna",
    title: "Krishna Bhumi Trail",
    subtitle:
      "Where every step echoes 'Radhe Radhe' – a joyous immersion into the land of divine play and love.",
    image: "https://dev.kalpx.com/img/krishna.a507ab5b.jpg",
  },
  {
    id: "himalayanTemples",
    title: "Himalayan Temples",
    subtitle:
      "Seek profound silence and spiritual elevation amidst the majestic and mystical heights of the Himalayas.",
    image: "https://dev.kalpx.com/img/himalayan-temples.7c855222.jpg",
  },
  {
    id: "southIndian",
    title: "South Indian Mandirs",
    subtitle:
      "Uncover the mystic traditions and ancient glory of South India’s timeless Dravidian temples.",
    image: "https://dev.kalpx.com/img/south-indian.56a0c53f.jpg",
  },
  {
    id: "sunriseDarshan",
    title: "Sunrise Darshan Sites",
    subtitle:
      "Begin your day with devotion – witness awe-inspiring darshans as the sun rises over sacred shores.",
    image: "https://dev.kalpx.com/img/sunrise-darshan.7201189c.jpg",
  },
  {
    id: "jyotirlinga",
    title: "Jyotirlinga Darshan",
    subtitle:
      "Connect with the 12 luminous forms of Lord Shiva, radiating divine light across the subcontinent.",
    image: "https://dev.kalpx.com/img/jyotirlinga.da3a8f7c.jpg",
  },
  {
    id: "saintGuru",
    title: "Saint & Guru Dhams",
    subtitle:
      "Follow the spiritual footsteps of revered saints and enlightened masters who guided humanity.",
    image: "https://dev.kalpx.com/img/saint-guru.0cea2711.jpg",
  },
  {
    id: "ganesha",
    title: "Ganesha Pilgrimage",
    subtitle:
      "Seek blessings and remove obstacles by visiting the potent abodes of the benevolent Ganesha.",
    image: "https://dev.kalpx.com/img/ganesha.0a059365.jpg",
  },
  {
    id: "natureDevotion",
    title: "Nature & Devotion",
    subtitle:
      "Experience spiritual awakening amidst the pristine beauty of nature’s sacred sanctuaries.",
    image: "https://dev.kalpx.com/img/nature-devotion.fa40d80e.jpg",
  },
  {
    id: "murugan",
    title: "Murugan Kshetras",
    subtitle:
      "Embark on a divine quest to the powerful abodes of Lord Murugan, the valiant Kartikeya.",
    image: "https://dev.kalpx.com/img/murugan.3ed31501.jpg",
  },
  {
    id: "heritage",
    title: "Ancient Heritage Sites",
    subtitle:
      "Explore timeless temples that stand as testaments to India’s rich history and architectural genius.",
    image: "https://dev.kalpx.com/img/heritage.776cd106.jpg",
  },
];

const DURATION = ["3_days", "7_days", "10_plus_days"];

export default function TravelPlannerScreen() {
  const navigation: any = useNavigation();
  const { t } = useTranslation();
  const dispatch = useDispatch();
    const [show, setShow] = useState(false);

  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [duration, setDuration] = useState<string | null>(null);
  const [experience, setExperience] = useState("comfort");
  const [companions, setCompanions] = useState<string[]>(["solo"]); // default single select
  const [notes, setNotes] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationData, setLocationData] = useState({
    city: "",
    country: "",
    timezone: "",
    latitude: null,
    longitude: null,
  });
  const [userCity, setUserCity] = useState("");
    const [errors, setErrors] = useState<string[]>([]); // track missing fields

  // check if all required fields are filled
  const allValid =
    selectedCats.length > 0 &&
    companions.length > 0 &&
    duration &&
    notes.trim() !== "";

  // toggle category (multi-select)
  const toggleCat = (id: string) =>
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // toggle companions (single-select version)
  const toggleCompanion = (label: string) => {
    setCompanions([label]); // always one selected
  };

  // fetch location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      let loc = await Location.getCurrentPositionAsync({});
      let geo = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      const city = geo[0]?.city || "";
      const country = geo[0]?.country || "";
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

      setLocationData({
        city,
        country,
        timezone,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      setUserCity(city);
    })();
  }, []);

  // handle submit
  const handleSubmit = async () => {
        const newErrors: string[] = [];
    if (selectedCats.length === 0) newErrors.push("Please select a temple.");
    if (!companions[0]) newErrors.push("Please select a participation mode.");
    if (!duration) newErrors.push("Please select a timing preference.");
    if (!notes.trim()) newErrors.push("Please provide additional instructions.");

    setErrors(newErrors);

    if (newErrors.length > 0) return;
    setLoading(true);
    setLoginError(null);

    try {
      const selectedJourneys = ALL_CATEGORIES.filter((c) =>
        selectedCats.includes(c.id)
      ).map((cat) => cat.title);

      const selectedCompanion = companions[0] || "";

      const companionMap = {
        solo: "solo",
        family: "family",
        friends_group: "friends_group",
        spiritual_guide: "spiritual_guide",
      };

      const experienceMap = {
        essencial: "essencial",
        comfort: "comfort",
        premium: "premium",
      };

      const durationMap = {
        "3_days": "3_days",
        "7_days": "7_days",
        "10_plus_days": "10_plus_days",
      };

      const createdAt = new Date().toISOString();
      const userId = await AsyncStorage.getItem("user_id");

      const credentials = {
        user: userId,
        type: "travel",
        created_at: createdAt,
        data: {
          selectedJourneys,
          userCity,
          geolocationCity: locationData.city,
          country: locationData.country,
          timezone: locationData.timezone,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          selectedDuration: durationMap[duration || ""] || "",
          selectedExperience: experienceMap[experience] || "",
          selectedCompanion: companionMap[selectedCompanion] || "",
          spiritualIntent: notes,
        },
      };

      dispatch(
        travelIntresetUser(credentials, async (result: any) => {
          if (result && result.success) {
            console.log("Travel interest saved>>>>>>>>>>>>>>>>>>>>>", result);
            setShow(true);
            // navigation.navigate("HomePage");
          } else {
            setLoginError(result?.error || "Failed to save travel interest");
          }
        }) as any
      );
    } catch (err) {
      console.log("Submit error:", err);
      setLoginError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <ImageBackground
        source={require("../../../assets/travelbg.png")}
        style={styles.headerImage}
        imageStyle={styles.imageStyle}
      >
        <Pressable
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
      </ImageBackground>
      <View style={styles.headerBottom}>
        <Text style={styles.headerTitle}>{t("travelPlanner.title")}</Text>
        <View style={styles.locationBadge}>
          <MapPin size={14} color="#444" />
          <Text style={styles.locationText}>
            {locationData.city || t("travelPlanner.city")}
          </Text>
        </View>
      </View>
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
          <Text style={styles.planText}>Plan Your Sacred Journey</Text>
          <Text style={styles.subText}>
            What Type of Journey Are You Seeking?
          </Text>
          <Text style={styles.subText}>Select all that apply</Text>
          {/* Categories */}
          <Section title="">
            <FlatList
              data={ALL_CATEGORIES}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <CategoryCard
                  item={{ ...item }}
                  selected={selectedCats.includes(item.id)}
                  onToggle={toggleCat}
                />
              )}
              horizontal
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={{ paddingHorizontal: 4 }}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            />
          </Section>
             {/* Selected Journeys */}
          {selectedCats.length > 0 && (
            <View style={{ marginHorizontal:20}}>
              {/* <Text
                style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}
              >
                Selected Journeys:
              </Text> */}
              {ALL_CATEGORIES.filter((c) => selectedCats.includes(c.id)).map(
                (cat) => (
                  <View style={{flexDirection:"row",alignItems:"center",gap:8}} key={cat.id}>
                  <Image  source={require("../../../assets/Check.png")} style={{width:20,height:20,resizeMode:"contain"}}/>
                  <Text
                    key={cat.id}
                    style={{ fontSize: 14, fontWeight: "300" ,color:"#000000",marginVertical:4}}
                  >
                    {cat.title}
                  </Text>
                  </View>
                )
              )}
            </View>
          )}

          {/* City */}
          <View style={{ marginTop: 16, marginBottom: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: "500", color:"#000000",marginBottom: 4 }}>
              Your City
            </Text>
            <TextInput
              style={{
                fontSize: 16,
                color: "#333333",
                borderWidth: 1,
                borderColor: "#FAD38C",
                borderRadius: 8,
                padding: 8,
                backgroundColor: "#fff",
                marginTop: 2,
                marginBottom:4,
              }}
              value={userCity}
              onChangeText={setUserCity}
              placeholder="Enter your city"
            />
          </View>
          {/* Duration */}
          <Section title={t("travelPlanner.idealDuration")}>
            <View style={styles.durationBox}>
              {DURATION.map((opt) => {
                const on = duration === opt;
                let label =
                  opt === "3_days"
                    ? "3 Days – Weekend Devotion"
                    : opt === "7_days"
                    ? "7 Days – Full Experience"
                    : "10+ Days – Soulful Immersion";
                return (
                  <Pressable
                    key={opt}
                    onPress={() => setDuration(opt)}
                    style={styles.durationRow}
                  >
                    <View style={[styles.checkbox, on && styles.checkboxOn]}>
                      {on && (
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.durationText}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Section>

          {/* Experience */}
          <Section title={t("travelPlanner.experienceType")}>
            <View style={styles.experienceRow}>
              <ExperienceCard
              icon="🔹"
                label={t("travelPlanner.experiences.essential")}
                blurb={t("travelPlanner.experiences.essentialBlurb")}
                active={experience === "essencial"}
                onPress={() => setExperience("essencial")}
              />
              <ExperienceCard
                  icon="🔸"
                label={t("travelPlanner.experiences.comfort")}
                blurb={t("travelPlanner.experiences.comfortBlurb")}
                active={experience === "comfort"}
                onPress={() => setExperience("comfort")}
              />
              <ExperienceCard
                  icon="💎"
                label={t("travelPlanner.experiences.premium")}
                blurb={t("travelPlanner.experiences.premiumBlurb")}
                active={experience === "premium"}
                onPress={() => setExperience("premium")}
              />
            </View>
          </Section>
{/* Companions (single-select like Duration) */}
<Section title={t("travelPlanner.companionsTitle")}>
  <View style={styles.durationBox}>
    {["solo", "family", "friends_group", "spiritual_guide"].map((opt) => {
      const on = companions[0] === opt; // single select
      let label =
        opt === "solo"
          ? "Solo"
          : opt === "family"
          ? "Family"
          : opt === "friends_group"
          ? "Friends Group"
          : "Spiritual Guide";

      return (
        <Pressable
          key={opt}
          onPress={() => setCompanions([opt])}
          style={styles.durationRow}
        >
          <View style={[styles.checkbox, on && styles.checkboxOn]}>
            {on && <Ionicons name="checkmark" size={12} color="#fff" />}
          </View>
          <Text style={styles.durationText}>{label}</Text>
        </Pressable>
      );
    })}
  </View>
</Section>

          {/* Companions */}
          {/* <Section title={t("travelPlanner.companionsTitle")}>
            <View
              style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}
            >
              {["solo", "family", "friends_group", "spiritual_guide"].map(
                (lbl) => (
                  <PillOption
                    key={lbl}
                    label={lbl
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                    selected={companions.includes(lbl)}
                    onToggle={toggleCompanion}
                  />
                )
              )}
            </View>
          </Section> */}

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
             <SuccessModal
        visible={show}
        title="Thank you! You’ll be among the first to know when a journey matching your preferences goes live."
        subTitle="You’ll be notified when your journey is ready."
         onClose={() => {
          setShow(false);
            navigation.navigate("HomePage");
        }}
      />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
           {errors.length > 0 && (
          <View style={{ marginBottom: 8 }}>
            {errors.map((err, idx) => (
              <Text key={idx} style={{ color: "red", fontSize: 14, marginBottom: 2 }}>
                {err}
              </Text>
            ))}
          </View>
        )}
          <LoadingButton
            loading={loading}
            text={t("travelPlanner.nextStep")}
              disabled={!allValid || loading} // disabled until valid
          style={[
            styles.submitButton,
            { backgroundColor: allValid ? "#a67c52" : "#ccc" }, // grey if not valid
          ]}
            // disabled={loading}
            // style={styles.submitButton}
            textStyle={styles.submitText}
            onPress={handleSubmit}
          />
        </View>

      </KeyboardAvoidingView>
    </View>
  );
}

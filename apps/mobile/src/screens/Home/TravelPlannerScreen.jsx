import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { MapPin } from "lucide-react-native";
import { useEffect, useState } from "react";
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
import { BASE_IMAGE_URL } from "../../Networks/baseURL";
import { ensureLoggedIn } from "../../utils/authHelpers";
import { travelIntresetUser } from "./actions";
import styles from "./travelstyles";


const DURATION = ["3_days", "7_days", "10_plus_days"];
                

export default function TravelPlannerScreen({route}) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const dispatch = useDispatch();
    const [show, setShow] = useState(false);

  const [selectedCats, setSelectedCats] = useState([]);
  const [duration, setDuration] = useState(null);
  const [experience, setExperience] = useState("comfort");
  const [companions, setCompanions] = useState(["solo"]); // default single select
  const [notes, setNotes] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRestored, setIsRestored] = useState(false);
  const [locationData, setLocationData] = useState({
    city: "",
    country: "",
    timezone: "",
    latitude: null,
    longitude: null,
  });
  const [userCity, setUserCity] = useState("");
    const [errors, setErrors] = useState([]); // track missing fields

    
const ALL_CATEGORIES = [
  {
    id: "charDham",
    title: t("travelPlanner.travelCard.charDham.title"),
    subtitle: t("travelPlanner.travelCard.charDham.subtitle"),
    image: `${BASE_IMAGE_URL}/img/char-dham.137cfaf5.jpg`,
  },
  {
    id: "riverine",
    title: t("travelPlanner.travelCard.riverine.title"),
    subtitle: t("travelPlanner.travelCard.riverine.subtitle"),
    image: `${BASE_IMAGE_URL}/img/riverine.9c0993b7.jpg`,
  },
  {
    id: "shaktipeeth",
    title: t("travelPlanner.travelCard.shaktipeeth.title"),
    subtitle: t("travelPlanner.travelCard.shaktipeeth.subtitle"),
    image: `${BASE_IMAGE_URL}/img/shaktipeeth.d335333c.jpg`,
  },
  {
    id: "ramayana",
    title: t("travelPlanner.travelCard.ramayana.title"),
    subtitle: t("travelPlanner.travelCard.ramayana.subtitle"),
    image: `${BASE_IMAGE_URL}/img/ramayana.68fbbb93.jpg`,
  },
  {
    id: "krishna",
    title: t("travelPlanner.travelCard.krishna.title"),
    subtitle: t("travelPlanner.travelCard.krishna.subtitle"),
    image: `${BASE_IMAGE_URL}/img/krishna.a507ab5b.jpg`,
  },
  {
    id: "himalayanTemples",
    title: t("travelPlanner.travelCard.himalayanTemples.title"),
    subtitle: t("travelPlanner.travelCard.himalayanTemples.subtitle"),
    image: `${BASE_IMAGE_URL}/img/himalayan-temples.7c855222.jpg`,
  },
  {
    id: "southIndian",
    title: t("travelPlanner.travelCard.southIndian.title"),
    subtitle: t("travelPlanner.travelCard.southIndian.subtitle"),
    image: `${BASE_IMAGE_URL}/img/south-indian.56a0c53f.jpg`,
  },
  {
    id: "sunriseDarshan",
    title: t("travelPlanner.travelCard.sunriseDarshan.title"),
    subtitle: t("travelPlanner.travelCard.sunriseDarshan.subtitle"),
    image: `${BASE_IMAGE_URL}/img/sunrise-darshan.7201189c.jpg`,
  },
  {
    id: "jyotirlinga",
    title: t("travelPlanner.travelCard.jyotirlinga.title"),
    subtitle: t("travelPlanner.travelCard.jyotirlinga.subtitle"),
    image: `${BASE_IMAGE_URL}/img/jyotirlinga.da3a8f7c.jpg`,
  },
  {
    id: "saintGuru",
    title: t("travelPlanner.travelCard.saintGuru.title"),
    subtitle: t("travelPlanner.travelCard.saintGuru.subtitle"),
    image: `${BASE_IMAGE_URL}/img/saint-guru.0cea2711.jpg`,
  },
  {
    id: "ganesha",
    title: t("travelPlanner.travelCard.ganesha.title"),
    subtitle: t("travelPlanner.travelCard.ganesha.subtitle"),
    image: `${BASE_IMAGE_URL}/img/ganesha.0a059365.jpg`,
  },
  {
    id: "natureDevotion",
    title: t("travelPlanner.travelCard.natureDevotion.title"),
    subtitle: t("travelPlanner.travelCard.natureDevotion.subtitle"),
    image: `${BASE_IMAGE_URL}/img/nature-devotion.fa40d80e.jpg`,
  },
  {
    id: "murugan",
    title: t("travelPlanner.travelCard.murugan.title"),
    subtitle: t("travelPlanner.travelCard.murugan.subtitle"),
    image: `${BASE_IMAGE_URL}/img/murugan.3ed31501.jpg`,
  },
  {
    id: "heritage",
    title: t("travelPlanner.travelCard.heritage.title"),
    subtitle: t("travelPlanner.travelCard.heritage.subtitle"),
    image: `${BASE_IMAGE_URL}/img/heritage.776cd106.jpg`,
  },
];

    

  // check if all required fields are filled
  const allValid =
    selectedCats.length > 0 &&
    companions.length > 0 &&
    duration &&
    notes.trim() !== "";

  // toggle category (multi-select)
  const toggleCat = (id) =>
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // toggle companions (single-select version)
  const toggleCompanion = (label) => {
    setCompanions([label]); // always one selected
  };

  // ✅ Restore pending travel data if coming from login
useEffect(() => {
  if (!route.params?.resumeData) return;

  const data = route.params.resumeData;
  console.log("📩 Received travel resumeData:", data);

  setSelectedCats(data.selectedCats || []);
  setDuration(data.duration || null);
  setExperience(data.experience || "comfort");
  setCompanions(data.companions || ["solo"]);
  setNotes(data.notes || "");
  setUserCity(data.userCity || "");

  setLocationData({
    city: data.geolocationCity || "",
    country: data.country || "",
    timezone: data.timezone || "",
    latitude: data.latitude || null,
    longitude: data.longitude || null,
  });

  // ✅ delay marking ready until states update
  setTimeout(() => setIsRestored(true), 300);
}, [route.params?.resumeData]);

// ✅ Auto-submit once all restored data is ready
useEffect(() => {
  if (
    isRestored &&
    selectedCats.length > 0 &&
    companions.length > 0 &&
    duration &&
    notes.trim() !== ""
  ) {
    console.log("🚀 Auto-submitting travel after restore");
    handleSubmit();
  }
}, [isRestored]);



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
        const newErrors = [];
    if (selectedCats.length === 0) newErrors.push("Please select a temple.");
    if (!companions[0]) newErrors.push("Please select a participation mode.");
    if (!duration) newErrors.push("Please select a timing preference.");
    if (!notes.trim()) newErrors.push("Please provide additional instructions.");

    setErrors(newErrors);

    if (newErrors.length > 0) return;

    // ✅ Store pending data if user not logged in
const pendingData = {
  selectedCats,
  duration,
  experience,
  companions,
  notes,
  userCity,
  geolocationCity: locationData.city,
  country: locationData.country,
  timezone: locationData.timezone,
  latitude: locationData.latitude,
  longitude: locationData.longitude,
};

const canProceed = await ensureLoggedIn(
  navigation,
  "pending_travel_data",
  pendingData
);
if (!canProceed) return;


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
        travelIntresetUser(credentials, async (result) => {
          if (result && result.success) {
            // console.log("Travel interest saved>>>>>>>>>>>>>>>>>>>>>", result);
            setShow(true);
              await AsyncStorage.removeItem("pending_travel_data");
            // navigation.navigate('HomePage', { screen: 'Home'});
          } else {
            setLoginError(result?.error || "Failed to save travel interest");
          }
        }) 
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
          onPress={() => {
            // navigation.goBack()
            navigation.navigate('HomePage', { screen: 'Home'});
          }}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
      </ImageBackground>
      <View style={styles.headerBottom}>
        <Text  allowFontScaling={false} style={styles.headerTitle}>{t("travelPlanner.title")}</Text>
        <View style={styles.locationBadge}>
          <MapPin size={14} color="#444" />
          <Text  allowFontScaling={false} style={styles.locationText}>
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
          <Text  allowFontScaling={false} style={styles.planText}>{t("travelPlanner.travelText")}</Text>
          <Text  allowFontScaling={false} style={styles.subText}>
           {t("travelPlanner.travelSubText")}
          </Text>
          <Text  allowFontScaling={false} style={styles.subText}>{t("travelPlanner.selectText")}</Text>
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
              {/* <Text  allowFontScaling={false}
                style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}
              >
                Selected Journeys:
              </Text> */}
              {ALL_CATEGORIES.filter((c) => selectedCats.includes(c.id)).map(
                (cat) => (
                  <View style={{flexDirection:"row",alignItems:"center",gap:8}} key={cat.id}>
                  <Image  source={require("../../../assets/Check.png")} style={{width:20,height:20,resizeMode:"contain"}}/>
                  <Text  allowFontScaling={false}
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
            <Text  allowFontScaling={false} style={{ fontSize: 16, fontWeight: "500", color:"#000000",marginBottom: 4 }}>
            {t("travelPlanner.yourCity")}
            </Text>
            <TextInput
                    allowFontScaling={false}
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
              placeholder={t("travelPlanner.enterCity")}
            />
          </View>
          {/* Duration */}
          <Section title={t("travelPlanner.idealDuration")}>
            <View style={styles.durationBox}>
              {DURATION.map((opt) => {
                const on = duration === opt;
                let label =
                  opt === "3_days"
                    ? t("travelPlanner.duration1")
                    : opt === "7_days"
                    ? t("travelPlanner.duration2")
                    : t("travelPlanner.duration3");
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
                    <Text  allowFontScaling={false} style={styles.durationText}>{label}</Text>
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
          ? t("travelPlanner.companions.solo")
          : opt === "family"
          ? t("travelPlanner.companions.family")
          : opt === "friends_group"
          ? t("travelPlanner.companions.friendsGroup")
          : t("travelPlanner.companions.spiritualGuide");

      return (
        <Pressable
          key={opt}
          onPress={() => setCompanions([opt])}
          style={styles.durationRow}
        >
          <View style={[styles.checkbox, on && styles.checkboxOn]}>
            {on && <Ionicons name="checkmark" size={12} color="#fff" />}
          </View>
          <Text  allowFontScaling={false} style={styles.durationText}>{label}</Text>
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
                    allowFontScaling={false}
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
          // navigation.navigate('HomePage', { screen: 'Home'});
            navigation.navigate('HomePage', { screen: 'Home'});
        }}
      />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
           {errors.length > 0 && (
          <View style={{ marginBottom: 8 }}>
            {errors.map((err, idx) => (
              <Text  allowFontScaling={false} key={idx} style={{ color: "red", fontSize: 14, marginBottom: 2 }}>
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

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import CategoryCard from "../../components/CategoryCard";
import ExperienceCard from "../../components/ExperienceCard";
import LoadingButton from "../../components/LoadingButton";
import Section from "../../components/Section";
import SuccessModal from "../../components/SuccessModal";
import TextComponent from "../../components/TextComponent";
import colors from "../../theme/colors";
import { ensureLoggedIn } from "../../utils/authHelpers";
import { retreatIntresetUser } from "./actions";
import styles from "./retreatstyles";

const HEALING = [
  {
    id: "spiritualSilence",
    titleKey: "retreats.healing.silence.title",
    subtitleKey: "retreats.healing.silence.subtitle",
    image: require("../../../assets/silence.jpg"),
  },
  {
    id: "ayurvedaHealing",
    titleKey: "retreats.healing.ayurveda.title",
    subtitleKey: "retreats.healing.ayurveda.subtitle",
    image: require("../../../assets/ayurveda.jpg"),
  },
  {
    id: "yogaImmersion",
    titleKey: "retreats.healing.yoga.title",
    subtitleKey: "retreats.healing.yoga.subtitle",
    image: require("../../../assets/meditate.jpg"),
  },
  {
    id: "bhaktiSatsang",
    titleKey: "retreats.healing.bhakti.title",
    subtitleKey: "retreats.healing.bhakti.subtitle",
    image: require("../../../assets/bhakti.jpg"),
  },
];

const LOCATIONS = [
  {
    id: "himalayas",
    titleKey: "retreats.locations.himalayas.title",
    subtitleKey: "retreats.locations.himalayas.subtitle",
    image: require("../../../assets/himalayas.jpg"),
  },
  {
    id: "kerala",
    titleKey: "retreats.locations.kerala.title",
    subtitleKey: "retreats.locations.kerala.subtitle",
    image: require("../../../assets/kerala.jpg"),
  },
  {
    id: "forestAshram",
    titleKey: "retreats.locations.forestAshram.title",
    subtitleKey: "retreats.locations.forestAshram.subtitle",
    image: require("../../../assets/forest-ashram.jpg"),
  },
  {
    id: "templeTown",
    titleKey: "retreats.locations.templeTown.title",
    subtitleKey: "retreats.locations.templeTown.subtitle",
    image: require("../../../assets/temple-town.jpg"),
  },
  {
    id: "riverRetreats",
    titleKey: "retreats.locations.riverRetreats.title",
    subtitleKey: "retreats.locations.riverRetreats.subtitle",
    image: require("../../../assets/river-retreat.jpg"),
  },
];

export default function RetreatsScreen({route}) {
  const navigation: any = useNavigation();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const DURATION = ["3_days", "7_days", "10_plus_days"];

  const [healingCats, setHealingCats] = useState(["silence"]);
  const [locations, setLocations] = useState(["himalayas"]);
  const [duration, setDuration] = useState(null);
  const [experience, setExperience] = useState("Comfort");
  const [notes, setNotes] = useState("");
  const [userCity, setUserCity] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [isRestored, setIsRestored] = useState(false);

  const [locationData, setLocationData] = useState({
    city: "",
    country: "",
    timezone: "",
    latitude: null,
    longitude: null,
  });
  const [errors, setErrors] = useState<string[]>([]);


    const allValid =
    healingCats.length > 0 &&
    locations.length > 0 &&
    duration &&
    experience &&
    notes.trim() !== "";


    // ✅ Populate values if coming from login (resumeData)
useEffect(() => {
  if (!route.params?.resumeData) return;

  const data = route.params.resumeData;
  console.log("📩 Received retreat resumeData:", data);

  setHealingCats(data.healingCats || []);
  setLocations(data.locations || []);
  setDuration(data.duration || null);
  setExperience(data.experience || "comfort");
  setNotes(data.notes || "");
  setUserCity(data.userCity || "");
  setLocationData({
    city: data.geolocationCity || "",
    country: data.country || "",
    timezone: data.timezone || "",
    latitude: data.latitude || null,
    longitude: data.longitude || null,
  });

  // wait until React finishes updating states
  setTimeout(() => setIsRestored(true), 300);
}, [route.params?.resumeData]);

// ✅ Auto-submit after restore
useEffect(() => {
  if (
    isRestored &&
    healingCats.length > 0 &&
    locations.length > 0 &&
    duration &&
    experience &&
    notes.trim() !== ""
  ) {
    console.log("🚀 Auto-submitting retreat after restore");
    handleSubmit();
  }
}, [isRestored]);



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

  const toggleHealing = (id) =>
    setHealingCats((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleLocation = (id) =>
    setLocations((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleSubmit = async () => {
        const newErrors: string[] = [];
    if (healingCats.length === 0) newErrors.push("Please select at least one seeking option.");
    if (locations.length === 0) newErrors.push("Please select at least one location.");
    if (!duration) newErrors.push("Please select ideal duration.");
    if (!experience) newErrors.push("Please select an experience type.");
    if (!notes.trim()) newErrors.push("Please enter your spiritual intent.");
    setErrors(newErrors);

    if (newErrors.length > 0) return;

    // Store data if user not logged in
const pendingData = {
  healingCats,
  locations,
  duration,
  experience,
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
  "pending_retreat_data",
  pendingData
);
if (!canProceed) return;


    setLoading(true);
    setLoginError(null);
    try {
      const userId = await AsyncStorage.getItem("user_id");
      const credentials = {
        user: userId,
        type: "retreats",
        data: {
          interests: HEALING.filter((h) => healingCats.includes(h.id)).map(
            (h) => t(h.titleKey)
          ),
          locations: LOCATIONS.filter((l) => locations.includes(l.id)).map(
            (l) => t(l.titleKey)
          ),
          userCity: userCity,
          geolocationCity: locationData.city,
          country: locationData.country,
          timezone: locationData.timezone,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          duration: duration,
          experience: experience.toLowerCase(),
          spiritualIntent: notes,
        },
      };
      // console.log("Credentials to be sent::::::::::", credentials);
      dispatch(
        retreatIntresetUser(credentials, async (result: any) => {
          if (result && result.success) {
            // console.log("Travel interest saved>>>>>>>>>>>>>>>>>>>>>", result);
             setShow(true);
               await AsyncStorage.removeItem("pending_retreat_data");
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
      {/* Header Banner */}
      <ImageBackground
        source={require("../../../assets/retreats.png")}
        style={styles.headerImage}
        imageStyle={styles.imageStyle}
      >
        <Pressable
          style={styles.iconButton}
          onPress={() => {
            // navigation.navigate("HomePage")
            navigation.navigate('HomePage', { screen: 'Home'});
          }}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
      </ImageBackground>
      <TextComponent type="loginHeaderText" style={styles.title}>{t("retreats.title")}</TextComponent>
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
          <TextComponent type="subText" style={styles.titlesubText}>
        {t("retreats.healing.header")}
          </TextComponent>
          <FlatList
            data={HEALING}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CategoryCard
                item={{
                  ...item,
                  title: t(item.titleKey),
                  subtitle: t(item.subtitleKey),
                }}
                selected={healingCats.includes(item.id)}
                onToggle={toggleHealing}
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={{ paddingHorizontal: 4 }}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          />
          {healingCats.length > 0 && (
            <View style={{ margin: 20, marginTop: 12 }}>
              {HEALING.filter((c) => healingCats.includes(c.id)).map((cat) => (
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                  key={cat.id}
                >
                  <Image
                    source={require("../../../assets/Check.png")}
                    style={{ width: 20, height: 20, resizeMode: "contain" }}
                  />
                  <TextComponent type="cardText"
                    style={{
                      // fontSize: 14,
                      // fontWeight: "300",
                      // color: "#000000",
                      marginVertical: 4,
                    }}
                  >
                    {t(cat.titleKey)}
                  </TextComponent>
                </View>
              ))}
            </View>
          )}

          {/* Healing */}
          {/* <Section title={t("retreats.healingCategories")}>
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
          </Section> */}

          {/* Location */}
          <TextComponent type="subText"  style={styles.titlesubText}>
            {t("retreats.locations.header")}
          </TextComponent>

          <FlatList
            data={LOCATIONS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CategoryCard
                item={{
                  ...item,
                  title: t(item.titleKey),
                  subtitle: t(item.subtitleKey),
                }}
                selected={locations.includes(item.id)}
                onToggle={toggleLocation}
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={{ paddingHorizontal: 4 }}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          />
          {locations.length > 0 && (
            <View style={{ marginHorizontal: 20, marginTop: 12 }}>
              {LOCATIONS.filter((c) => locations.includes(c.id)).map((cat) => (
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                  key={cat.id}
                >
                  <Image
                    source={require("../../../assets/Check.png")}
                    style={{ width: 20, height: 20, resizeMode: "contain" }}
                  />
                  <TextComponent type="cardText"
                    style={{
                      // fontSize: 14,
                      // fontWeight: "300",
                      // color: "#000000",
                      marginVertical: 4,
                    }}
                  >
                    {t(cat.titleKey)}
                  </TextComponent>
                </View>
              ))}
            </View>
          )}
          {/* <Section title={t("retreats.preferredLocations")}>
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
          </Section> */}
          {/* City Field */}
          <View style={{ marginTop: 16, marginBottom: 8 }}>
            <TextComponent type="headerText"
              style={{
                // fontSize: 16,
                // fontWeight: "500",
                // color: "#000000",
                marginBottom: 4,
              }}
            >
              Your City
            </TextComponent>
            <TextInput
                    allowFontScaling={false}
              style={{
                fontSize: 18,
                color: "#333333",
                borderWidth: 1,
                borderColor: "#FAD38C",
                borderRadius: 8,
                padding: 8,
                backgroundColor: "#fff",
                marginTop: 2,
                marginBottom: 4,
              }}
              value={userCity}
              onChangeText={setUserCity}
              placeholder="Enter your city"
            />
          </View>
          <Section title={t("retreats.idealDuration")}>
            <View style={styles.durationBox}>
              {DURATION.map((opt) => {
                const on = duration === opt;
                let label =
                  opt === "3_days"
                    ? t("retreats.duration1")
                    : opt === "7_days"
                    ? t("retreats.duration2")
                    : t("retreats.duration3");
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
                    <TextComponent type="subText" style={styles.durationText}>{label}</TextComponent>
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

          {/* Notes */}
          <Section title={t("retreats.spiritualIntent")}>
            <TextInput
                    allowFontScaling={false}
              multiline
              placeholder={t("retreats.intentPlaceholder")}
              value={notes}
              onChangeText={setNotes}
              style={styles.textArea}
              placeholderTextColor={colors.subtext}
            />
          </Section>
        </ScrollView>

        <View style={styles.footer}>
          {errors.length > 0 && (
          <View style={{ marginBottom: 8 }}>
            {errors.map((err, idx) => (
              <TextComponent type="mediumText" key={idx} style={{ color: "red", marginBottom: 2 }}>
                {err}
              </TextComponent>
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
            textStyle={styles.submitText}
            onPress={handleSubmit}
          />
        </View>
   <SuccessModal
        visible={show}
        title="Success!"
        subTitle="Your action was completed successfully 🎉"
        onClose={() => {
          setShow(false);
            navigation.navigate('HomePage', { screen: 'Home'});
        }}
      />
      </KeyboardAvoidingView>
    </View>
  );
}

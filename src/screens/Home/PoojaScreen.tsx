import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import LoadingButton from "../../components/LoadingButton";
import SuccessModal from "../../components/SuccessModal";
import { RITUALS, TEMPLE_LIST } from "../../components/temples";
import { poojaIntresetUser } from "./actions";
import styles from "./poojastyles";

export default function PoojaScreen() {
  const navigation: any = useNavigation();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [selectedTemple, setSelectedTemple] = useState(null);
  const [selectedPooja, setSelectedPooja] = useState(null);

  const [templeModalVisible, setTempleModalVisible] = useState(false);
  const [poojaModalVisible, setPoojaModalVisible] = useState(false);
    const [show, setShow] = useState(false);

  const [templeSearch, setTempleSearch] = useState("");
  const [poojaSearch, setPoojaSearch] = useState("");

  const [city, setCity] = useState("");
  const [instructions, setInstructions] = useState("");
  const [poojaNotListed, setPoojaNotListed] = useState(false);
  const [mode, setMode] = useState("Online");
  const [timing, setTiming] = useState("Urgent");

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [userCity, setUserCity] = useState("");
  const [geolocationCity, setGeolocationCity] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");

  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // ✅ check if all required are filled
  const allValid =
    selectedTemple &&
    selectedPooja &&
    mode &&
    timing &&
    instructions.trim() !== "";

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      let loc = await Location.getCurrentPositionAsync({});
      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);

      let reverse = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (reverse.length > 0) {
        const city = reverse[0]?.city || "";
        const countryName = reverse[0]?.country || "";
        setUserCity(city);
        setGeolocationCity(city);
        setCountry(countryName);
        setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
        setCity(city);
      }
    })();
  }, []);

  // Filtered temples based on search
  const filteredTemples = useMemo(() => {
    return TEMPLE_LIST.filter(
      (t) =>
        t.key.toLowerCase().includes(templeSearch.toLowerCase()) ||
        t.location.toLowerCase().includes(templeSearch.toLowerCase()) ||
        t.category.toLowerCase().includes(templeSearch.toLowerCase())
    ).map((temple) => ({
      ...temple,
      translatedKey: t(`temples.${temple.key}`),
      translatedLocation: t(`locations.${temple.key}`),
    }));
  }, [templeSearch, t]);

  // Pooja list based on selected temple category
  const poojaList = useMemo(() => {
    if (!selectedTemple) return [];
    const temple = TEMPLE_LIST.find((t) => t.key === selectedTemple);
    if (!temple) return [];
    const categories = temple.category.split(",").map((c) => c.trim());
    let rituals: string[] = [];
    categories.forEach((c) => {
      if (RITUALS[c]) {
        rituals = [...rituals, ...RITUALS[c]];
      }
    });
    return rituals;
  }, [selectedTemple]);

  // Filtered poojas based on search
  const filteredPoojas = useMemo(() => {
    return poojaList
      .map((p) => ({
        key: p,
        translated: t(`rituals.${p}`),
      }))
      .filter((p) =>
        p.translated.toLowerCase().includes(poojaSearch.toLowerCase())
      );
  }, [poojaSearch, poojaList, t]);

  const handleSubmit = async () => {
     const newErrors: string[] = [];
    if (!selectedTemple) newErrors.push("Please select a temple.");
    if (!selectedPooja) newErrors.push("Please select a pooja.");
    if (!mode) newErrors.push("Please select a participation mode.");
    if (!timing) newErrors.push("Please select a timing preference.");
    if (!instructions.trim()) newErrors.push("Please enter additional instructions.");
    setErrors(newErrors);

    if (newErrors.length > 0) return;
    setLoading(true);
    setLoginError(null);
    try {
      const userId = await AsyncStorage.getItem("user_id");
      const createdAt = new Date().toISOString();
      const selectedTempleObj = TEMPLE_LIST.find(
        (t) => t.key === selectedTemple
      );

      const category = selectedTempleObj?.category || "";
      const poojaTranslated = selectedPooja || "";

      const credentials = {
        user: userId,
        type: "pooja",
        data: {
          temple: selectedTemple,
          templeTranslated: selectedTemple
            ? t(`temples.${selectedTemple}`)
            : "",
          location: geolocationCity,
          locationTranslated: selectedTemple
            ? t(`locations.${selectedTemple}`)
            : "",
          category: category,
          categoryTranslated: category
            .replace(/\(.*?\)/g, "")
            .replace(/,/g, ", "),
          pooja: selectedPooja,
          poojaTranslated: selectedPooja ? t(`rituals.${selectedPooja}`) : "",
          participationMode: mode,
          timingPreference: timing.toLowerCase(),
          comments: instructions,
          userCity,
          geolocationCity,
          country,
          timezone,
          latitude,
          longitude,
          otherPoojaChecked: poojaNotListed,
        },
      };

      console.log("Credentials to be sent::::::::::", credentials);
      dispatch(
        poojaIntresetUser(credentials, async (result: any) => {
          if (result && result.success) {
            console.log("Travel interest saved>>>>>>>>>>>>>>>>>>>>>", result);
            setShow(true)
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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <ImageBackground
        source={require("../../../assets/poojafl.png")}
        style={styles.headerImage}
        imageStyle={styles.imageStyle}
      >
        <Pressable
          style={styles.iconButton}
          onPress={() => navigation.navigate("HomePage")}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        {/* <View style={styles.headerBottom}>
          <Text style={styles.headerTitle}>{t("pooja.header")}</Text>
          <View style={styles.locationBadge}>
            <MapPin size={14} color="#444" />
            <Text style={styles.locationText}>{t("pooja.location")}</Text>
          </View>
        </View> */}
      </ImageBackground>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t("pooja.bookPooja")}</Text>

        {/* Temple Picker */}
        <Text style={styles.label}>{t("pooja.selectTemple")}</Text>
        <Pressable
          style={styles.selector}
          onPress={() => setTempleModalVisible(true)}
        >
          <Text style={styles.selectorText}>
            {selectedTemple
              ? t(`temples.${selectedTemple}`)
              : t("pooja.chooseTemple")}
          </Text>
        </Pressable>

        {/* Pooja Picker */}
        <Text style={styles.label}>{t("pooja.selectPooja")}</Text>
        <Pressable
          style={styles.selector}
          onPress={() => setPoojaModalVisible(true)}
          disabled={!selectedTemple}
        >
          <Text style={styles.selectorText}>
            {selectedPooja
              ? t(`rituals.${selectedPooja}`)
              : t("pooja.choosePooja")}
          </Text>
        </Pressable>

        {/* Pooja Not Listed */}
        <Pressable
          style={styles.checkboxRow}
          onPress={() => setPoojaNotListed(!poojaNotListed)}
        >
          {poojaNotListed ? (
            <Image
              source={require("../../../assets/Check.png")}
              style={{
                width: 20,
                height: 20,
                resizeMode: "contain",
                marginRight: 8,
                borderRadius: 4,
              }}
            />
          ) : (
            <View
              style={[styles.checkbox, poojaNotListed && styles.checkedBox]}
            />
          )}
          <Text style={styles.checkboxText}>{t("pooja.poojaNotListed")}</Text>
        </Pressable>

        {/* City */}
        <Text style={styles.label}>{t("pooja.city")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("pooja.enterCity")}
          value={city}
          onChangeText={setCity}
        />

        {/* Mode */}
        <Text style={styles.label}>{t("pooja.participationMode")}</Text>
        <View style={styles.row}>
          {[t("pooja.online", "Online"), t("pooja.inperson", "In-Person")].map(
            (item) => (
              <Pressable
                key={item}
                style={[styles.option, mode === item && styles.optionSelected]}
                onPress={() => setMode(item)}
              >
                <Text
                  style={[
                    styles.optionText,
                    mode === item && styles.optionTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            )
          )}
        </View>

        {/* Timing */}
        <Text style={styles.label}>{t("pooja.timingPreference")}</Text>
        <View style={styles.row}>
          {[t("pooja.urgent"), t("pooja.flexible")].map((item) => (
            <Pressable
              key={item}
              style={[styles.option, timing === item && styles.optionSelected]}
              onPress={() => setTiming(item)}
            >
              <Text
                style={[
                  styles.optionText,
                  timing === item && styles.optionTextSelected,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Instructions */}
        <Text style={styles.label}>{t("pooja.instructions")}</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder={t("pooja.instructionsPlaceholder")}
          multiline
          numberOfLines={4}
          value={instructions}
          onChangeText={setInstructions}
        />
      </ScrollView>

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
          textStyle={styles.submitText}
          onPress={handleSubmit}
        />
      </View>

      {/* Submit */}
      {/* <View style={styles.footer}>
        <Pressable
          style={styles.submitButton}
          onPress={async () => {
  const createdAt = new Date().toISOString();
  const selectedTempleObj = TEMPLE_LIST.find(t => t.key === selectedTemple);

  const category = selectedTempleObj?.category || "";
  const poojaTranslated = selectedPooja || "";

  const dataToSend = {
    id: 52,
    user: 4070,
    guest_uuid: null,
    type: "pooja",
    data: {
      temple: selectedTemple,
      templeTranslated: selectedTemple ? t(`temples.${selectedTemple}`) : "",
      location: geolocationCity,
      locationTranslated: selectedTemple ? t(`locations.${selectedTemple}`) : "",
      category: category,
      categoryTranslated: category.replace(/\(.*?\)/g, "").replace(/,/g, ", "),
      pooja: selectedPooja,
      poojaTranslated: selectedPooja ? t(`rituals.${selectedPooja}`) : "",
      participationMode: mode,
      timingPreference: timing.toLowerCase(),
      comments: instructions,
      userCity,
      geolocationCity,
      country,
      timezone,
      latitude,
      longitude,
      otherPoojaChecked: poojaNotListed,
    },
    created_at: createdAt,
  };

  console.log(dataToSend);
}}
        >
          <Text style={styles.submitButtonText}>{t("pooja.submit")}</Text>
        </Pressable>
      </View> */}

      {/* Temple Modal */}
      <Modal
        visible={templeModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setTempleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t("pooja.templeModalTitle")}
              </Text>
              <Pressable onPress={() => setTempleModalVisible(false)}>
                <X size={20} color="#333" />
              </Pressable>
            </View>

            {/* Temple Search */}
            <TextInput
              style={[styles.input, { margin: 10 }]}
              placeholder={t("pooja.searchTemple")}
              value={templeSearch}
              onChangeText={setTempleSearch}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredTemples.map((temple) => (
                <Pressable
                  key={temple.key}
                  style={styles.radioRow}
                  onPress={() => {
                    setSelectedTemple(temple.key);
                    setSelectedPooja(null); // reset pooja when temple changes
                    setTempleModalVisible(false);
                  }}
                >
                  <View
                    style={[
                      styles.radio,
                      selectedTemple === temple.key && styles.radioSelected,
                    ]}
                  />
                  <Text style={styles.radioText}>
                    {temple.translatedKey} • {temple.category} •{" "}
                    {temple.translatedLocation}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
   <SuccessModal
        visible={show}
        title="Pooja request submitted successfully!"
        subTitle="Your pooja request has been submitted. We will contact you soon with further details."
         onClose={() => {
          setShow(false);
            navigation.navigate("HomePage");
        }}
      />
      {/* Pooja Modal */}
      <Modal
        visible={poojaModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPoojaModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t("pooja.poojaModalTitle")}
              </Text>
              <Pressable onPress={() => setPoojaModalVisible(false)}>
                <X size={20} color="#333" />
              </Pressable>
            </View>

            {/* Pooja Search */}
            <TextInput
              style={[styles.input, { margin: 10 }]}
              placeholder={t("pooja.searchPooja")}
              value={poojaSearch}
              onChangeText={setPoojaSearch}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredPoojas.map((pooja) => (
                <Pressable
                  key={pooja.key}
                  style={styles.radioRow}
                  onPress={() => {
                    setSelectedPooja(pooja.key);
                    setPoojaModalVisible(false);
                  }}
                >
                  <View
                    style={[
                      styles.radio,
                      selectedPooja === pooja.key && styles.radioSelected,
                    ]}
                  />
                  <Text style={styles.radioText}>{pooja.translated}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

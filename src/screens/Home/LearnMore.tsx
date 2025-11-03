import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import CategoryCard from "../../components/CategoryCard";
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";
import LoadingButton from "../../components/LoadingButton";
import Section from "../../components/Section";
import SuccessModal from "../../components/SuccessModal";
import TextComponent from "../../components/TextComponent";
import { useUserLocation } from "../../components/useUserLocation";
import colors from "../../theme/colors";
import { ensureLoggedIn } from "../../utils/authHelpers";
import { retreatIntresetUser } from "./actions";
import styles from "./LearMoreStyles";

const LearnMore = ({ route }) => {
  const navigation: any = useNavigation();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { locationData } = useUserLocation();

  // Translate all text dynamically
  const subjects = [
    {
      name: t("learnMore.subjects.yoga.name"),
      caption: t("learnMore.subjects.yoga.caption"),
      key: "yoga",
      image: require("../../../assets/yoga1.jpg"),
    },
    {
      name: t("learnMore.subjects.music.name"),
      caption: t("learnMore.subjects.music.caption"),
      key: "music",
      image: require("../../../assets/music.jpg"),
    },
    {
      name: t("learnMore.subjects.dance.name"),
      caption: t("learnMore.subjects.dance.caption"),
      key: "dance",
      image: require("../../../assets/dance.jpg"),
    },
    {
      name: t("learnMore.subjects.chanting.name"),
      caption: t("learnMore.subjects.chanting.caption"),
      key: "chanting",
      image: require("../../../assets/chanting.jpg"),
    },
    {
      name: t("learnMore.subjects.vedas.name"),
      caption: t("learnMore.subjects.vedas.caption"),
      key: "vedas",
      image: require("../../../assets/vedas.jpg"),
    },
    {
      name: t("learnMore.subjects.sanatan.name"),
      caption: t("learnMore.subjects.sanatan.caption"),
      key: "sanatan",
      image: require("../../../assets/sanatan.jpg"),
    },
    {
      name: t("learnMore.subjects.vedanta.name"),
      caption: t("learnMore.subjects.vedanta.caption"),
      key: "vedanta",
      image: require("../../../assets/vedanta.jpg"),
    },
  ];

  const classFormats = [
    { value: "one_on_one", label: t("learnMore.formats.one_on_one") },
    { value: "small_group", label: t("learnMore.formats.small_group") },
    { value: "large_group", label: t("learnMore.formats.large_group") },
    { value: "pre_recorded", label: t("learnMore.formats.pre_recorded") },
  ];

  const experienceLevels = [
    { value: "beginner", label: t("learnMore.levels.beginner") },
    { value: "intermediate", label: t("learnMore.levels.intermediate") },
    { value: "advanced", label: t("learnMore.levels.advanced") },
  ];

  const ageGroups = [
    { value: "child", label: t("learnMore.ages.child") },
    { value: "teen", label: t("learnMore.ages.teen") },
    { value: "adult", label: t("learnMore.ages.adult") },
    { value: "senior", label: t("learnMore.ages.senior") },
  ];

  const timeSlots = [
    { value: "early_morning", label: t("learnMore.times.early_morning") },
    { value: "morning", label: t("learnMore.times.morning") },
    { value: "afternoon", label: t("learnMore.times.afternoon") },
    { value: "evening", label: t("learnMore.times.evening") },
    { value: "night", label: t("learnMore.times.night") },
  ];

  // ---------- State ----------
  const [healingCats, setHealingCats] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState<string | null>(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string | null>(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [userCity, setUserCity] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (locationData?.city && !userCity) setUserCity(locationData.city);
  }, [locationData]);

const toggleHealing = (key: string) => {
  setHealingCats((prev) =>
    prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
  );
};


  const toggleMultiSelect = (value: string, setter: Function, current: string[]) => {
    setter(current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  };

  const handleSubmit = async () => {
    const newErrors: string[] = [];
    if (healingCats.length === 0) newErrors.push(t("learnMore.errors.selectSubject"));
    if (selectedFormats.length === 0) newErrors.push(t("learnMore.errors.selectFormat"));
    if (!selectedExperienceLevel) newErrors.push(t("learnMore.errors.selectLevel"));
    if (notes.trim() === "") newErrors.push(t("learnMore.errors.enterIntent"));
    if (selectedTimeSlots.length === 0) newErrors.push(t("learnMore.errors.selectTime"));

    setErrors(newErrors);
    if (newErrors.length > 0) return;

    const pendingData = {
      selectedSubjects: healingCats,
      selectedFormats,
      selectedExperienceLevel,
      selectedAgeGroup,
      userCity,
      geolocationCity: locationData.city,
      country: locationData.country,
      timezone: locationData.timezone,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      selectedTimeSlots,
      spiritualIntent: notes,
    };

    const canProceed = await ensureLoggedIn(navigation, "pending_class_data", pendingData);
    if (!canProceed) return;

    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem("user_id");
      const payload = { type: "classes", data: pendingData, user: userId };

      dispatch(
        retreatIntresetUser(payload, async (result: any) => {
          if (result && result.success) {
            setShow(true);
            await AsyncStorage.removeItem("pending_class_data");
          } else {
            setErrors([result?.error || t("learnMore.errors.failed")]);
          }
        }) as any
      );
    } catch (err) {
      console.log("Submit error:", err);
      setErrors([t("learnMore.errors.tryAgain")]);
    } finally {
      setLoading(false);
    }
  };

  const renderChip = (item, selected, onPress) => (
    <Pressable
      key={item.value}
      onPress={() => onPress(item.value)}
      style={{
        backgroundColor: selected ? "#FAD38C" : "#F7E8D6",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        margin: 4,
      }}
    >
      <TextComponent
        type="mediumText"
        style={{
          color: Colors.Colors.BLACK,
          fontSize: FontSize.CONSTS.FS_14,
        }}
      >
        {item.label}
      </TextComponent>
    </Pressable>
  );

  const allValid =
    healingCats.length > 0 &&
    selectedFormats.length > 0 &&
    selectedExperienceLevel &&
    notes.trim() !== "" &&
    selectedTimeSlots.length > 0;

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../../assets/learnMoreTopBg.png")}
        style={styles.headerImage}
        imageStyle={styles.imageStyle}
      >
        <Pressable
          style={styles.iconButton}
          onPress={() => navigation.navigate("HomePage", { screen: "Home" })}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
      </ImageBackground>

      <Text style={styles.title}>{t("learnMore.title")}</Text>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
          <Text style={styles.titlesubText}>{t("learnMore.whatLearn")}</Text>

          <FlatList
            data={subjects}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
           <CategoryCard
  item={{
    ...item,
    title: item.name,
    subtitle: item.caption,
  }}
  selected={healingCats.includes(item.key)}
  onToggle={toggleHealing}
/>
            )}
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={{ paddingHorizontal: 4 }}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          />

          <TextComponent type="mediumText" style={{ marginTop: 16, color: Colors.Colors.BLACK, fontSize: FontSize.CONSTS.FS_16 }}>
            {t("learnMore.classFormat")}
          </TextComponent>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {classFormats.map((item) =>
              renderChip(item, selectedFormats.includes(item.value), (val) =>
                toggleMultiSelect(val, setSelectedFormats, selectedFormats)
              )
            )}
          </View>

          <TextComponent type="mediumText" style={{ marginTop: 16, color: Colors.Colors.BLACK, fontSize: FontSize.CONSTS.FS_16 }}>
            {t("learnMore.experienceLevel")}
          </TextComponent>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {experienceLevels.map((item) =>
              renderChip(item, selectedExperienceLevel === item.value, () =>
                setSelectedExperienceLevel(item.value)
              )
            )}
          </View>

          <TextComponent type="mediumText" style={{ marginTop: 16, color: Colors.Colors.BLACK, fontSize: FontSize.CONSTS.FS_16 }}>
            {t("learnMore.ageGroup")}
          </TextComponent>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {ageGroups.map((item) =>
              renderChip(item, selectedAgeGroup === item.value, () => setSelectedAgeGroup(item.value))
            )}
          </View>

          <TextComponent type="mediumText" style={{ marginTop: 16, color: Colors.Colors.BLACK, fontSize: FontSize.CONSTS.FS_16 }}>
            {t("learnMore.timeAndCity")}
          </TextComponent>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {timeSlots.map((item) =>
              renderChip(item, selectedTimeSlots.includes(item.value), (val) =>
                toggleMultiSelect(val, setSelectedTimeSlots, selectedTimeSlots)
              )
            )}
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "500", color: "#000", marginBottom: 4 }}>
              {t("learnMore.yourCity")}
            </Text>
            <TextInput
              value={userCity}
              onChangeText={setUserCity}
              placeholder={t("learnMore.enterCity")}
              style={{
                fontSize: 16,
                color: "#333",
                borderWidth: 1,
                borderColor: "#FAD38C",
                borderRadius: 8,
                padding: 8,
                backgroundColor: "#fff",
              }}
            />
          </View>

          <Section title={t("learnMore.spiritualIntent")}>
            <TextInput
              multiline
              placeholder={t("learnMore.intentPlaceholder")}
              value={notes}
              onChangeText={setNotes}
              style={styles.textArea}
              placeholderTextColor={colors.subtext}
            />
          </Section>

          {errors.length > 0 && (
            <View style={{ marginBottom: 8 }}>
              {errors.map((err, idx) => (
                <Text key={idx} style={{ color: "red", fontSize: 14, marginBottom: 2 }}>
                  {err}
                </Text>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <LoadingButton
            loading={loading}
            text={t("learnMore.submit")}
            disabled={!allValid || loading}
            style={[styles.submitButton, { backgroundColor: allValid ? "#a67c52" : "#ccc" }]}
            textStyle={styles.submitText}
            onPress={handleSubmit}
          />
        </View>

        <SuccessModal
          visible={show}
          title={t("learnMore.successTitle")}
          subTitle={t("learnMore.successSubTitle")}
          onClose={() => {
            setShow(false);
            navigation.navigate("HomePage", { screen: "Home" });
          }}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

export default LearnMore;





// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import { useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
// import {
//     FlatList,
//     ImageBackground,
//     KeyboardAvoidingView,
//     Platform,
//     Pressable,
//     ScrollView,
//     Text,
//     TextInput,
//     View,
// } from "react-native";
// import { useDispatch } from "react-redux";
// import CategoryCard from "../../components/CategoryCard";
// import Colors from "../../components/Colors";
// import FontSize from "../../components/FontSize";
// import LoadingButton from "../../components/LoadingButton";
// import Section from "../../components/Section";
// import SuccessModal from "../../components/SuccessModal";
// import TextComponent from "../../components/TextComponent";
// import { useUserLocation } from "../../components/useUserLocation";
// import colors from "../../theme/colors";
// import { ensureLoggedIn } from "../../utils/authHelpers";
// import { retreatIntresetUser } from "./actions";
// import styles from "./LearMoreStyles";

// // ---------- Constants ----------
// const subjects = [
//   {
//     name: "Yoga",
//     caption: "Strengthen your body. Calm your mind.",
//     image: require("../../../assets/yoga1.jpg"),
//   },
//   {
//     name: "Indian Classical Music",
//     caption: "Connect through sound and devotion.",
//     image: require("../../../assets/music.jpg"),
//   },
//   {
//     name: "Indian Classical Dance",
//     caption: "Let every step express the sacred.",
//     image: require("../../../assets/dance.jpg"),
//   },
//   {
//     name: "Mantra Chanting",
//     caption: "Chant. Center. Awaken.",
//     image: require("../../../assets/chanting.jpg"),
//   },
//   {
//     name: "Vedas & Upanishads",
//     caption: "Decode ancient wisdom for modern life.",
//     image: require("../../../assets/vedas.jpg"),
//   },
//   {
//     name: "Sanatan Teachings",
//     caption: "Timeless truths made accessible.",
//     image: require("../../../assets/sanatan.jpg"),
//   },
//   {
//     name: "Everyday Vedanta",
//     caption: "Live dharma in daily life.",
//     image: require("../../../assets/vedanta.jpg"),
//   },
// ];


// const classFormats = [
//   { value: "one_on_one", label: "One-on-One" },
//   { value: "small_group", label: "Small Group (2–6 people)" },
//   { value: "large_group", label: "Larger Interactive Session" },
//   { value: "pre_recorded", label: "Pre-recorded + Live Q&A" },
// ];

// const experienceLevels = [
//   { value: "beginner", label: "Beginner – I’m curious and just starting" },
//   { value: "intermediate", label: "Intermediate – I have some practice" },
//   { value: "advanced", label: "Advanced – I’ve been learning for years" },
// ];

// const ageGroups = [
//   { value: "child", label: "Child (under 12)" },
//   { value: "teen", label: "Teen (13–17)" },
//   { value: "adult", label: "Adult (18–59)" },
//   { value: "senior", label: "Senior (60+)" },
// ];

// const timeSlots = [
//   { value: "early_morning", label: "Early Morning (5am–8am)" },
//   { value: "morning", label: "Morning (8am–12pm)" },
//   { value: "afternoon", label: "Afternoon (12pm–4pm)" },
//   { value: "evening", label: "Evening (4pm–8pm)" },
//   { value: "night", label: "Night (8pm–10pm)" },
// ];

// // ---------- Component ----------
// const LearnMore = ({ route }) => {
//   const navigation: any = useNavigation();
//   const { t } = useTranslation();
//   const dispatch = useDispatch();
//   const { locationData } = useUserLocation();

//   const [healingCats, setHealingCats] = useState<string[]>([]);
//   const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
//   const [selectedExperienceLevel, setSelectedExperienceLevel] = useState<string | null>(null);
//   const [selectedAgeGroup, setSelectedAgeGroup] = useState<string | null>(null);
//   const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
//   const [notes, setNotes] = useState("");
//   const [userCity, setUserCity] = useState("");
//   const [errors, setErrors] = useState<string[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [show, setShow] = useState(false);

//   useEffect(() => {
//     if (locationData?.city && !userCity) setUserCity(locationData.city);
//   }, [locationData]);

//   const toggleHealing = (id: string) =>
//     setHealingCats((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

//   const toggleMultiSelect = (value: string, setter: Function, current: string[]) => {
//     setter(current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
//   };

//   const handleSubmit = async () => {
//     const newErrors: string[] = [];
//     if (healingCats.length === 0) newErrors.push("Please select at least one subject.");
//     if (selectedFormats.length === 0) newErrors.push("Please select at least one class format.");
//     if (!selectedExperienceLevel) newErrors.push("Please select your experience level.");
//     if (notes.trim() === "") newErrors.push("Please enter your spiritual intent.");
//     if (selectedTimeSlots.length === 0) newErrors.push("Please select at least one preferred time slot.");

//     setErrors(newErrors);
//     if (newErrors.length > 0) return;

//     const pendingData = {
//       selectedSubjects: healingCats,
//       selectedFormats,
//       selectedExperienceLevel,
//       selectedAgeGroup,
//       userCity,
//       geolocationCity: locationData.city,
//       country: locationData.country,
//       timezone: locationData.timezone,
//       latitude: locationData.latitude,
//       longitude: locationData.longitude,
//       selectedTimeSlots,
//       spiritualIntent: notes,
//     };

//     const canProceed = await ensureLoggedIn(navigation, "pending_class_data", pendingData);
//     if (!canProceed) return;

//     setLoading(true);
//     try {
//       const userId = await AsyncStorage.getItem("user_id");
//       const payload = {
//         type: "classes",
//         data: pendingData,
//         user: userId,
//       };
// console.log("learn More data >>>>>>",JSON.stringify(payload));
//       dispatch(
//         retreatIntresetUser(payload, async (result: any) => {
//           if (result && result.success) {
//             setShow(true);
//             await AsyncStorage.removeItem("pending_class_data");
//           } else {
//             setErrors([result?.error || "Failed to save interest"]);
//           }
//         }) as any
//       );
//     } catch (err) {
//       console.log("Submit error:", err);
//       setErrors(["Something went wrong. Please try again."]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderChip = (item, selected, onPress) => (
//     <Pressable
//       key={item.value}
//       onPress={() => onPress(item.value)}
//       style={{
//         backgroundColor: selected ? "#FAD38C" : "#F7E8D6",
//         paddingVertical: 8,
//         paddingHorizontal: 12,
//         borderRadius: 12,
//         margin: 4,
//       }}
//     >
//       <TextComponent
//         type="mediumText"
//         style={{
//           color: Colors.Colors.BLACK,
//           fontSize: FontSize.CONSTS.FS_14,
//         }}
//       >
//         {item.label}
//       </TextComponent>
//     </Pressable>
//   );

//   const allValid =
//     healingCats.length > 0 &&
//     selectedFormats.length > 0 &&
//     selectedExperienceLevel &&
//     notes.trim() !== "" &&
//     selectedTimeSlots.length > 0;

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <ImageBackground
//         source={require("../../../assets/learnMoreTopBg.png")}
//         style={styles.headerImage}
//         imageStyle={styles.imageStyle}
//       >
//         <Pressable
//           style={styles.iconButton}
//           onPress={() => navigation.navigate("HomePage", { screen: "Home" })}
//         >
//           <Ionicons name="arrow-back" size={22} color="#fff" />
//         </Pressable>
//       </ImageBackground>

//       <Text style={styles.title}>Plan Your Learning Journey</Text>

//       <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
//         <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
          
//           {/* ✅ KEEP THIS EXACTLY AS IS */}
//           <Text style={styles.titlesubText}>
//             What Would You Love to Learn? (Select all that apply)
//           </Text>
//           <FlatList
//             data={subjects}
//             keyExtractor={(item) => item.name}
//             renderItem={({ item }) => (
//               <CategoryCard
//                 item={{
//                   ...item,
//                   title: t(item.name),
//                   subtitle: t(item.caption),
//                 }}
//                 selected={healingCats.includes(item.name)}
//                 onToggle={toggleHealing}
//               />
//             )}
//             horizontal
//             showsHorizontalScrollIndicator={true}
//             contentContainerStyle={{ paddingHorizontal: 4 }}
//             ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
//           />

//           {/* ✅ New sections */}
//           {/* Class Formats */}
//           <TextComponent type="mediumText" style={{ marginTop: 16, color: Colors.Colors.BLACK, fontSize: FontSize.CONSTS.FS_16 }}>
//             What Kind of Class Format Do You Prefer? (Select all that apply)
//           </TextComponent>
//           <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
//             {classFormats.map((item) =>
//               renderChip(item, selectedFormats.includes(item.value), (val) =>
//                 toggleMultiSelect(val, setSelectedFormats, selectedFormats)
//               )
//             )}
//           </View>

//           {/* Experience Level */}
//           <TextComponent type="mediumText" style={{ marginTop: 16, color: Colors.Colors.BLACK, fontSize: FontSize.CONSTS.FS_16 }}>
//             What Is Your Experience Level?
//           </TextComponent>
//           <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
//             {experienceLevels.map((item) =>
//               renderChip(item, selectedExperienceLevel === item.value, () =>
//                 setSelectedExperienceLevel(item.value)
//               )
//             )}
//           </View>

//           {/* Age Group */}
//           <TextComponent type="mediumText" style={{ marginTop: 16, color: Colors.Colors.BLACK, fontSize: FontSize.CONSTS.FS_16 }}>
//             What Is Your Age Group? (Optional)
//           </TextComponent>
//           <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
//             {ageGroups.map((item) =>
//               renderChip(item, selectedAgeGroup === item.value, () => setSelectedAgeGroup(item.value))
//             )}
//           </View>

//           {/* Time Slots */}
//           <TextComponent type="mediumText" style={{ marginTop: 16, color: Colors.Colors.BLACK, fontSize: FontSize.CONSTS.FS_16 }}>
//             Pick your city and time you will prefer as per your location. (Select all that apply)
//           </TextComponent>
//           <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
//             {timeSlots.map((item) =>
//               renderChip(item, selectedTimeSlots.includes(item.value), (val) =>
//                 toggleMultiSelect(val, setSelectedTimeSlots, selectedTimeSlots)
//               )
//             )}
//           </View>

//           {/* City Input */}
//           <View style={{ marginTop: 16 }}>
//             <Text style={{ fontSize: 16, fontWeight: "500", color: "#000", marginBottom: 4 }}>Your City</Text>
//             <TextInput
//               value={userCity}
//               onChangeText={setUserCity}
//               placeholder="Enter your city"
//               style={{
//                 fontSize: 16,
//                 color: "#333",
//                 borderWidth: 1,
//                 borderColor: "#FAD38C",
//                 borderRadius: 8,
//                 padding: 8,
//                 backgroundColor: "#fff",
//               }}
//             />
//           </View>

//           {/* Spiritual Intent */}
//           <Section title="Your Spiritual Intent">
//             <TextInput
//               multiline
//               placeholder="What motivates your spiritual journey?"
//               value={notes}
//               onChangeText={setNotes}
//               style={styles.textArea}
//               placeholderTextColor={colors.subtext}
//             />
//           </Section>

//           {errors.length > 0 && (
//             <View style={{ marginBottom: 8 }}>
//               {errors.map((err, idx) => (
//                 <Text key={idx} style={{ color: "red", fontSize: 14, marginBottom: 2 }}>
//                   {err}
//                 </Text>
//               ))}
//             </View>
//           )}
//         </ScrollView>

//         <View style={styles.footer}>
//           <LoadingButton
//             loading={loading}
//             text="Submit"
//             disabled={!allValid || loading}
//             style={[styles.submitButton, { backgroundColor: allValid ? "#a67c52" : "#ccc" }]}
//             textStyle={styles.submitText}
//             onPress={handleSubmit}
//           />
//         </View>

//         <SuccessModal
//           visible={show}
//           title="Thank you! You'll be among the first to know when classes matching your preferences go live."
//           subTitle="Thank you for your interest! We will get back to you soon."
//           onClose={() => {
//             setShow(false);
//             navigation.navigate("HomePage", { screen: "Home" });
//           }}
//         />
//       </KeyboardAvoidingView>
//     </View>
//   );
// };

// export default LearnMore;

import { useNavigation } from "@react-navigation/native";
import { debounce } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Card } from "react-native-paper";
import Animated from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";

import AddPracticesModal from "../../components/AddPracticesModal";
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";
import Header from "../../components/Header";
import TextComponent from "../../components/TextComponent";
import styles from "./homestyles";

import { AnyAction } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import i18n from "../../config/i18n";
import { CATALOGS } from "../../data/mantras";
import { SANATAN_PRACTICES_FINAL } from "../../data/sanatanPractices";
import { DAILY_SANKALPS } from "../../data/sankalps";
import { RootState } from "../../store";
import { getDailyDharmaTracker } from "./actions";

const { width } = Dimensions.get("window");

const PAGE_SIZE = 5;

const MySadana = ({route}) => {
  const navigation: any = useNavigation();
  const { t } = useTranslation();
const [chosenLevel, setChosenLevel] = useState("beginner");
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedPractices, setSelectedPractices] = useState<any[]>([]);
  const [practiceModal, showPracticeModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState("");

    const userLang = i18n.language.split("-")[0];

  const preselectedMantra = route?.params?.selectedmantra || null;

  console.log("selectedmantra TTTTTT>>>>>>",preselectedMantra);
     const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

const sadanaLevels = [
  {
       id: 1,
    key: "beginner",
    title: t("mySadhana.levels.beginner.title"),
    subtitle: t("mySadhana.levels.beginner.subtitle"),
    options: [
      t("mySadhana.levels.beginner.option1"),
      t("mySadhana.levels.beginner.option2"),
      t("mySadhana.levels.beginner.option3"),
      t("mySadhana.levels.beginner.option4"),
    ],
  },
  {
       id: 2,
    key: "intermediate",
    title: t("mySadhana.levels.intermediate.title"),
    subtitle: t("mySadhana.levels.intermediate.subtitle"),
    options: [
      t("mySadhana.levels.intermediate.option1"),
      t("mySadhana.levels.intermediate.option2"),
      t("mySadhana.levels.intermediate.option3"),
      t("mySadhana.levels.intermediate.option4"),
    ],
  },
  {
    id: 3,
    key: "advanced",
    title: t("mySadhana.levels.advanced.title"),
    subtitle: t("mySadhana.levels.advanced.subtitle"),
    options: [
      t("mySadhana.levels.advanced.option1"),
      t("mySadhana.levels.advanced.option2"),
      t("mySadhana.levels.advanced.option3"),
      t("mySadhana.levels.advanced.option4"),
    ],
  },
];

useEffect(() => {
  dispatch(
    getDailyDharmaTracker((res) => {
      if (res?.success && res.data) {
        console.log("✅ Daily Dharma Tracker Data::::::::::", res.data);

        const apiPractices = res.data.active_practices || [];
        const paramPractices: any[] = [];
        if (preselectedMantra) paramPractices.push(preselectedMantra);

        if (apiPractices.length > 0) {
          const matchedPractices = apiPractices.map((apiItem) => {
            const details = apiItem.details || {};
            const nested = details.details || {};

            // 🪔 1️⃣ Sankalp Type (from Yoga Sutra, etc.)
            if (nested?.type === "sankalp") {
              const sankalpMatch: any =
                DAILY_SANKALPS.find(
                  (s) =>
                    s.id === nested.id ||
                    s.i18n?.short === nested.i18n?.short
                ) || {};

              return {
                ...apiItem,
                ...nested,
                ...sankalpMatch,
                type: "sankalp",
                level: "custom",
                source: apiItem.source || sankalpMatch.source,
                icon: apiItem.icon || sankalpMatch.icon || "🪔",
              };
            }

            // 🕉️ 2️⃣ Mantra Type (from Smārta or similar sources)
            if (details?.id?.startsWith("mantra.")) {
              return {
                ...apiItem,
                ...details, // flatten the mantra block
                type: "mantra",
                level: "custom",
                icon: apiItem.icon || "🕉️",
                source: apiItem.source || details.deity || "mantra_library",
              };
            }

            // 🪷 3️⃣ Sanatan Practice (from SANATAN_PRACTICES_FINAL)
            const localMatch = SANATAN_PRACTICES_FINAL.find(
              (local) =>
                local.name?.trim().toLowerCase() ===
                  apiItem.name?.trim().toLowerCase() ||
                local.mantra?.trim() === apiItem.mantra?.trim() ||
                local.description?.trim() === apiItem.description?.trim()
            );

            return {
              ...(localMatch || {}),
              ...apiItem,
              level: localMatch?.level || "custom",
            };
          });

          // 🧘 Merge route.param + API + dedupe
          const merged = [...matchedPractices, ...paramPractices];
          const unique = merged.filter(
            (item, index, self) =>
              index ===
              self.findIndex(
                (p) =>
                  (p.id || p.practice_id)?.trim()?.toLowerCase() ===
                  (item.id || item.practice_id)?.trim()?.toLowerCase()
              )
          );

          setSelectedPractices(unique);
          return;
        }
      }

      // 🔁 Fallback: no API data → show default level practices
      console.warn("⚠️ No tracker data or API failed — using fallback auto-selection");
      const currentLevel = sadanaLevels[activeIndex].title.toLowerCase();
      const fallbackPractices = SANATAN_PRACTICES_FINAL.filter(
        (p) => p.level.toLowerCase() === currentLevel
      ).slice(0, 3);

      const merged = preselectedMantra
        ? [preselectedMantra, ...fallbackPractices]
        : fallbackPractices;

      const unique = merged.filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            (p) =>
              (p.id || p.practice_id)?.trim()?.toLowerCase() ===
              (item.id || item.practice_id)?.trim()?.toLowerCase()
          )
      );

      setSelectedPractices(unique);
    })
  );
}, [dispatch, preselectedMantra, activeIndex]);



// useEffect(() => {
//   dispatch(
//     getDailyDharmaTracker((res) => {
//       if (res?.success && res.data) {
//         console.log("✅ Daily Dharma Tracker Data::::::::::", res.data);
//         const apiPractices = res.data.active_practices || [];
//         const paramPractices: any[] = [];
//         if (preselectedMantra) paramPractices.push(preselectedMantra);

//         if (apiPractices.length > 0) {
//           const matchedPractices = apiPractices.map((apiItem) => {
//             const nested = apiItem.details?.details;
//             const isSankalp = nested?.type === "sankalp";

//             // 🪔 If Sankalp → merge with DAILY_SANKALPS data
//             if (isSankalp) {
//               const sankalpMatch =
//                 DAILY_SANKALPS.find(
//                   (s) =>
//                     s.id === nested.id ||
//                     s.i18n?.short === nested.i18n?.short
//                 ) || {};

//               return {
//                 ...apiItem,
//                 ...nested, // flatten backend sankalp
//                 ...sankalpMatch, // enrich with static sankalp data
//                 type: "sankalp",
//                 level: "custom",
//               };
//             }

//             // 🪷 Otherwise → match from SANATAN_PRACTICES_FINAL
//             const localMatch = SANATAN_PRACTICES_FINAL.find(
//               (local) =>
//                 local.name?.trim().toLowerCase() ===
//                   apiItem.name?.trim().toLowerCase() ||
//                 local.mantra?.trim() === apiItem.mantra?.trim() ||
//                 local.description?.trim() === apiItem.description?.trim()
//             );

//             return {
//               ...(localMatch || {}),
//               ...apiItem,
//               level: localMatch?.level || "custom",
//             };
//           });

//           // 🧘 Merge and dedupe with preselectedMantra
//           const merged = [...matchedPractices, ...paramPractices];
//           const unique = merged.filter(
//             (item, index, self) =>
//               index ===
//               self.findIndex(
//                 (p) =>
//                   (p.id || p.practice_id)?.trim()?.toLowerCase() ===
//                   (item.id || item.practice_id)?.trim()?.toLowerCase()
//               )
//           );

//           setSelectedPractices(unique);
//           return;
//         }
//       }

//       // 🔁 Fallback if no tracker data
//       console.warn("⚠️ No tracker data or API failed — using fallback auto-selection");
//       const currentLevel = sadanaLevels[activeIndex].title.toLowerCase();
//       const fallbackPractices = SANATAN_PRACTICES_FINAL.filter(
//         (p) => p.level.toLowerCase() === currentLevel
//       ).slice(0, 3);

//       const merged = preselectedMantra
//         ? [preselectedMantra, ...fallbackPractices]
//         : fallbackPractices;

//       const unique = merged.filter(
//         (item, index, self) =>
//           index ===
//           self.findIndex(
//             (p) =>
//               (p.id || p.practice_id)?.trim()?.toLowerCase() ===
//               (item.id || item.practice_id)?.trim()?.toLowerCase()
//           )
//       );

//       setSelectedPractices(unique);
//     })
//   );
// }, [dispatch, preselectedMantra, activeIndex]);



// useEffect(() => {
//   dispatch(
//     getDailyDharmaTracker((res) => {
//       if (res?.success && res.data) {
//         console.log("✅ Daily Dharma Tracker Data::::::::::", res.data);
//         const apiPractices = res.data.active_practices || [];
//         const paramPractices: any[] = [];
//         if (preselectedMantra) paramPractices.push(preselectedMantra);
//         if (apiPractices.length > 0) {
//           const matchedPractices = apiPractices.map((apiItem) => {
//             const localMatch = SANATAN_PRACTICES_FINAL.find(
//               (local) =>
//                 local.name?.trim().toLowerCase() ===
//                   apiItem.name?.trim().toLowerCase() ||
//                 local.mantra?.trim() === apiItem.mantra?.trim() ||
//                 local.description?.trim() === apiItem.description?.trim()
//             );
//             if (localMatch) return { ...localMatch, ...apiItem };
//             return { ...apiItem, level: "custom" };
//           });
//           const merged = [...matchedPractices, ...paramPractices];
//           const unique = merged.filter(
//             (item, index, self) =>
//               index ===
//               self.findIndex(
//                 (p) =>
//                   p.name?.trim().toLowerCase() ===
//                   item.name?.trim().toLowerCase()
//               )
//           );
//           setSelectedPractices(unique);
//           return;
//         }
//       }
//       console.warn("⚠️ No tracker data or API failed — using fallback auto-selection");
//       const currentLevel = sadanaLevels[activeIndex].title.toLowerCase();
//       const fallbackPractices = SANATAN_PRACTICES_FINAL.filter(
//         (p) => p.level.toLowerCase() === currentLevel
//       ).slice(0, 3); // First 3

//       const merged = preselectedMantra
//         ? [preselectedMantra, ...fallbackPractices]
//         : fallbackPractices;

//       const unique = merged.filter(
//         (item, index, self) =>
//           index ===
//           self.findIndex(
//             (p) =>
//               p.name?.trim().toLowerCase() === item.name?.trim().toLowerCase()
//           )
//       );

//       setSelectedPractices(unique);
//     })
//   );
// }, [dispatch, preselectedMantra, activeIndex]);


  useEffect(() => {
    if (preselectedMantra) {
      setSelectedPractices([preselectedMantra]);
    }
  }, [preselectedMantra]);

  const debouncedSearch = debounce((text) => handleSearch(text), 500);

  const handleSearch = (text: string) => {
    setSearchText(text.toLowerCase());
    setCurrentPage(0);
  };

 

  const togglePractice = (practice: any) => {
  setSelectedPractices((prev) => {
    const isSelected = prev.some(
      (p) => (p.id || p.practice_id) === (practice.id || practice.practice_id)
    );

    if (isSelected) {
      // ✅ Remove it if already selected
      return prev.filter(
        (p) => (p.id || p.practice_id) !== (practice.id || practice.practice_id)
      );
    } else {
      // ✅ Add it otherwise
      return [...prev, practice];
    }
  });
};



const LEVEL_KEYS = ["beginner", "intermediate", "advanced"];
const selectedLevel = LEVEL_KEYS[activeIndex];

  const filteredPractices = useMemo(() => {
  let practices = SANATAN_PRACTICES_FINAL;

 const levelOrderMap: Record<string, string[]> = {
    beginner: ["beginner", "intermediate", "advanced"],
    intermediate: ["intermediate", "beginner", "advanced"],
    advanced: ["advanced", "beginner", "intermediate"],
  };

  const levelPriority = levelOrderMap[selectedLevel] || ["beginner", "intermediate", "advanced"];

  // ✅ Sort practices according to the chosen level priority
  practices = practices
    .filter((p: any) => levelPriority.includes(p.level?.toLowerCase()))
    .sort(
      (a, b) =>
        levelPriority.indexOf(a.level?.toLowerCase()) -
        levelPriority.indexOf(b.level?.toLowerCase())
    );

  // ✅ Apply translated search
  if (searchText) {
    practices = practices.filter((p: any) => {
      const translatedName = t(`practices.${p.id}.name`)?.toLowerCase() || "";
      const translatedDesc = t(`practices.${p.id}.description`)?.toLowerCase() || "";

      return (
        translatedName.includes(searchText) || translatedDesc.includes(searchText)
      );
    });
  }

  // ✅ Ensure preselected mantra appears first
  if (preselectedMantra) {
    const existing = practices.find((p) => p.id === preselectedMantra.id);
    if (!existing) {
      practices = [preselectedMantra, ...practices];
    } else {
      practices = [
        existing,
        ...practices.filter((p) => p.id !== preselectedMantra.id),
      ];
    }
  }

  return practices;
}, [selectedLevel, searchText, preselectedMantra, t, i18n.language, i18n.resolvedLanguage]);



  const totalPages = Math.ceil(filteredPractices.length / PAGE_SIZE);

  const paginatedPractices = useMemo(
    () =>
      filteredPractices.slice(
        currentPage * PAGE_SIZE,
        (currentPage + 1) * PAGE_SIZE
      ),
    [filteredPractices, currentPage]
  );

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Colors.white }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.Colors.header_bg}
        translucent={false}
      />
      <Header />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        <TextComponent
          type="cardText"
          style={{ textAlign: "center", marginTop: 15 }}
        >
         {t("mySadhana.findPeace")}
        </TextComponent>

        <TextComponent
          type="streakSubText"
          style={{
            textAlign: "center",
            marginTop: 7,
            marginHorizontal: 30,
          }}
        >
           {t("mySadhana.simpleRoutines")}
        </TextComponent>

        {/* Carousel for Sadana Levels */}
        <View style={{ marginTop: 10 }}>
          <Carousel
            loop={false}
            width={width}
            height={userLang === "hi" || userLang === "mr" ? 365 : userLang === "en"  ? 345: 345}
            data={sadanaLevels}
            mode="parallax"
            modeConfig={{
              parallaxScrollingScale: 0.95,
              parallaxScrollingOffset: 70,
            }}
            panGestureHandlerProps={{
              activeOffsetX: [-10, 10],
            }}
            scrollAnimationDuration={800}
            onSnapToItem={(index) => {
              setActiveIndex(index);
              setCurrentPage(0); // Reset pagination
            }}
            renderItem={({ item, index }) => {
  const isActive = activeIndex === index;
const isChosen = chosenLevel === item.key;


  const cardBg = isChosen ? Colors.Colors.Yellow : "#F8F8F8";
  const textColor = isChosen ? Colors.Colors.white : "#848199";

  return (
    <Animated.View
      style={{
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible", 
      }}
    >
      <Card
        style={{
          backgroundColor: cardBg,
          borderRadius: 20,
          width: width * 0.8,
          paddingVertical: 10,
          paddingHorizontal: 20,
          alignItems: "center",
          position: "relative",
          minHeight: 280, 
          overflow: "visible",
          marginVertical: 10, 
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        {isChosen && (
          <Image
            source={require("../../../assets/check_box_card.png")}
            style={{
              position: "absolute",
              top: -30, 
              alignSelf: "center",
              height: 65,
              width: 65,
              zIndex: 5,
            }}
          />
        )}

        {/* Title & Subtitle */}
        <TextComponent
          type="cardSadanaText"
          style={{
            color: textColor,
            // fontSize: FontSize.CONSTS.FS_22,
            marginTop: 15, // ✅ fixed spacing
          }}
        >
          {item.title}
        </TextComponent>

        <TextComponent
          type="streakSadanaText"
          style={{
            color: textColor,
            // fontSize: FontSize.CONSTS.FS_14,
            marginBottom: 12,
          }}
        >
          {item.subtitle}
        </TextComponent>

        {/* Options */}
        {item.options.map((opt, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical:   userLang === "hi" || userLang === "mr" ? 0 : userLang === "en"  ? 4: 4,
            }}
          >
            <Image
              source={require("../../../assets/check-circle.png")}
              style={{
                height: 20,
                width: 20,
                marginRight: 10,
                tintColor: textColor,
              }}
            />
            <TextComponent
              type="headerText"
              style={{
                color: textColor,
                fontSize: FontSize.CONSTS.FS_14,
              }}
            >
              {opt}
            </TextComponent>
          </View>
        ))}

        {/* ✅ Reserve consistent Choose area */}
        <View
          style={{
            height: 50,
            marginTop: 15,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {!isChosen && (
            <TouchableOpacity
              onPress={() => {
             setChosenLevel(item.key);
  setActiveIndex(index);
              }}
            >
              <View
                style={{
                  backgroundColor: isActive
                    ? Colors.Colors.white
                    : "#F3EBD6",
                  paddingHorizontal: 25,
                  paddingVertical: 12,
                  borderRadius: 20,
                  width: 180,
                  alignItems: "center",
                }}
              >
                <TextComponent
                  type="boldText"
                  style={{
                    color: isActive
                      ? Colors.Colors.Yellow
                      : Colors.Colors.Light_black,
                    fontSize: FontSize.CONSTS.FS_14,
                  }}
                >
               {t("mySadhana.choose")}
                </TextComponent>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    </Animated.View>
  );
}}
          />
        </View>

        {/* Carousel dots */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 15,
          }}
        >
          {sadanaLevels.map((_, index) => (
            <View
              key={index}
              style={{
                height: 8,
                width: activeIndex === index ? 20 : 8,
                borderRadius: 4,
                backgroundColor:
                  activeIndex === index ? Colors.Colors.App_theme : "#ccc",
                marginHorizontal: 4,
              }}
            />
          ))}
        </View>
<View
  style={{
    margin: 20,
    borderColor: Colors.Colors.Light_grey,
    borderWidth: 1,
    padding: 12,
    borderRadius: 4,
  }}
>
  <TextComponent type="cardText" style={{ color: Colors.Colors.BLACK }}>
    {t("mySadhana.selectedPractices")}
  </TextComponent>
{/* {selectedPractices.map((p) => {
  let displayName = "";
  let displayDescription = "";

  // 🪔 Sankalp Type (has p.i18n.short)
  if (p.i18n?.short) {
    displayName = t(p.i18n.short) || p.short_text || p.name;
    displayDescription = t(p.i18n?.tooltip) || p.tooltip || "";
  }
  // 🕉️ Mantra Type (has p.id like "mantra.shiva_maha_mrityunjaya")
  else if (p.id?.startsWith("mantra.")) {
    displayName = p.devanagari || p.text || p.name;
    displayDescription =
      Array.isArray(p.explanation) ? p.explanation[0] : p.explanation || "";
  }
  // 🪷 Sanatan Practice Type (has id like "japa_ram")
  else {
    displayName = t(`practices.${p.id}.name`, { defaultValue: p.name });
    displayDescription = t(`practices.${p.id}.description`, {
      defaultValue: p.description,
    });
  }
  return (
    <TouchableOpacity
      key={p.id || p.practice_id}
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 6,
      }}
      onPress={() => togglePractice(p)}
    >
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
      <View style={{ flex: 1 }}>
        <TextComponent
          type="streakSadanaText"
          style={{ color: "#333", marginBottom: 2 }}
        >
          {displayName}
        </TextComponent>
        {!!displayDescription && (
          <TextComponent
            type="streakSubText"
            style={{ color: "#777", fontSize: 12 }}
          >
            {displayDescription}
          </TextComponent>
        )}
      </View>
    </TouchableOpacity>
  );
})} */}
{selectedPractices.map((p) => {
  let displayName = "";
  let displayDescription = "";

  // 🪔 1️⃣ Sankalp
  const isSankalp =
    p.details?.type === "sankalp" ||
    p.i18n?.short ||
    p.details?.i18n?.short;

  if (isSankalp) {
    const shortKey = p.details?.i18n?.short || p.i18n?.short;
    const suggestedKey = p.details?.i18n?.suggested || p.i18n?.suggested;

    displayName =
      (shortKey && t(shortKey)) ||
      p.details?.short_text ||
      p.short_text ||
      p.name;

    displayDescription =
      (suggestedKey && t(suggestedKey)) ||
      p.details?.suggested_practice ||
      p.suggested_practice ||
      p.tooltip ||
      "";
  }

  // 🕉️ 2️⃣ Mantra
  else if (p.id?.startsWith("mantra.")) {
    const langKey = i18n.language.split("-")[0]?.toLowerCase() || "en";

    const localizedCatalog = CATALOGS[langKey] || CATALOGS.en;
    const localizedMantra = localizedCatalog.find((m) => m.id === p.id);
    const fallbackMantra = CATALOGS.en.find((m) => m.id === p.id);

    const activeMantra = localizedMantra || fallbackMantra || p;

    const text =
      activeMantra.text ||
      activeMantra.devanagari ||
      fallbackMantra?.text ||
      p.text ||
      p.name ||
      "";

    const explanation =
      Array.isArray(activeMantra.explanation) && activeMantra.explanation.length
        ? activeMantra.explanation.join(" ")
        : Array.isArray(p.explanation)
        ? p.explanation.join(" ")
        : activeMantra.explanation ||
          p.explanation ||
          p.description ||
          "";

    displayName = text;
    displayDescription = explanation;
  }

  // 🧘 3️⃣ Custom or API-only (non-translatable)
  else if (p.source === "custom" || p.source === "api" || p.source === "manual") {
    displayName = p.name?.trim() || "Custom Practice";
    displayDescription = p.description?.trim() || "";
  }

  // 🪷 4️⃣ Sanatan Practice (translatable)
  else {
    displayName =
      t(`practices.${p.id}.name`, { defaultValue: p.name }) || p.name;
    displayDescription =
      t(`practices.${p.id}.description`, {
        defaultValue: p.description,
      }) || p.description;
  }

  // 🔸 Render two-line layout for every item
  return (
    <TouchableOpacity
      key={p.id || p.practice_id}
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 6,
      }}
      onPress={() => togglePractice(p)}
    >
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
      <View style={{ flex: 1 }}>
        {/* Title */}
        <TextComponent
          type="streakSadanaText"
          style={{ color: "#333", marginBottom: 2 }}
        >
          {displayName}
        </TextComponent>

        {/* Description / Suggested Practice */}
        {!!displayDescription && (
          <TextComponent
            type="streakSubText"
            style={{ color: "#777", fontSize: 12 }}
          >
            {displayDescription}
          </TextComponent>
        )}
      </View>
    </TouchableOpacity>
  );
})}

</View>
   <View
  style={{
    margin: 20,
  }}
>
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap", 
    }}
  >
    <View style={{ flexShrink: 1, flexBasis: "60%" }}>
      <TextComponent
        type="headerText"
        style={{
          color: Colors.Colors.BLACK,
          marginBottom: 2,
        }}
      >
        {t("mySadhana.selectFromList")}
      </TextComponent>

      <TextComponent
        type="streakSubText"
        style={{
          color: Colors.Colors.Light_black,
        }}
      >
        {t("mySadhana.selectSubtitle")}
      </TextComponent>
    </View>
    <TouchableOpacity
      onPress={() => showPracticeModal(true)}
      style={{
        backgroundColor: Colors.Colors.App_theme,
        borderRadius: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginTop: 6,
      }}
    >
      <TextComponent
        type="cardText"
        style={{
          color: Colors.Colors.white,
          textAlign: "center",
        }}
      >
        {t("mySadhana.createPractice")}
      </TextComponent>
    </TouchableOpacity>
  </View>
</View>
        <View
          style={{
            backgroundColor: Colors.Colors.grey,
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 8,
            marginRight: 16,
            height: 50,
            marginLeft: 20,
          }}
        >
          <Image
            source={require("../../../assets/C_Vector.png")}
            style={{ width: 20, height: 20, marginHorizontal: 10 }}
            resizeMode="contain"
          />
          <TextInput
                    allowFontScaling={false}
            style={{ flex: 1, fontSize: 14 ,color:"#000000"}}
          placeholder={t("mySadhana.searchPlaceholder")}
            onChangeText={debouncedSearch}
            placeholderTextColor={Colors.Colors.BLACK}
          />
        </View>
{/* {paginatedPractices.map((practice: any) => {
  console.log("practice >>>>>>>>",practice);
  const isSelected = selectedPractices.some(
    (p) => (p.id || p.practice_id) === (practice.id || practice.practice_id)
  );
const displayName = t(`practices.${practice.id}.name`, { defaultValue: practice.name });
const displayDescription = t(`practices.${practice.id}.description`, { defaultValue: practice.description });


  // const displayName = practice.i18n?.short
  //   ? t(practice.i18n.short)
  //   : practice.name || practice.text || practice.short_text;

  // const displayDescription = practice.i18n?.suggested
  //   ? t(practice.i18n.suggested)
  //   : practice.description || practice.explanation || practice.tooltip || "";
console.log("displayName,displayDescription >>>>",displayName,displayDescription)
  return (
    <Card
      key={practice.id || practice.practice_id}
      style={[
        styles.itemCard,
        { backgroundColor: isSelected ? "#F7F0DD" : "#FFFFFF" },
      ]}
    >
      <TouchableOpacity onPress={() => togglePractice(practice)}>
        <View style={{ flexDirection: "row" }}>
          {isSelected ? (
            <Image
              source={require("../../../assets/Check.png")}
              style={{
                width: 20,
                height: 20,
                resizeMode: "contain",
                marginRight: 8,
                borderRadius: 4,
                marginTop: 8,
              }}
            />
          ) : (
            <View
              style={[
                styles.checkbox,
                {
                  marginTop: 8,
                  borderWidth: 1.5,
                  borderColor: Colors.Colors.Light_black,
                },
              ]}
            />
          )}

          <View style={{ marginLeft: 12, flex: 1 }}>
            <TextComponent
              type="cardText"
              style={{ color: Colors.Colors.BLACK }}
            >
              {displayName}
            </TextComponent>

            {!!displayDescription && (
              <TextComponent
                type="streakSadanaText"
                style={{
                  color: Colors.Colors.Light_black,
                  // fontSize: FontSize.CONSTS.FS_14,
                }}
              >
                {displayDescription}
              </TextComponent>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
})} */}
{paginatedPractices.map((practice: any) => {
  const isSelected = selectedPractices.some(
    (p) => (p.id || p.practice_id) === (practice.id || practice.practice_id)
  );

  let displayName = "";
  let displayDescription = "";

  // 🪔 Sankalp type
  if (practice.i18n?.short) {
    displayName = t(practice.i18n.short) || practice.short_text || practice.name;
    displayDescription =
      t(practice.i18n.suggested) ||
      practice.suggested_practice ||
      t(practice.i18n.tooltip) ||
      practice.tooltip ||
      "";
  }
  // 🕉️ Mantra type
  // else if (practice.id?.startsWith("mantra.")) {
  //   displayName = practice.devanagari || practice.text || practice.name;
  //   displayDescription =
  //     Array.isArray(practice.explanation)
  //       ? practice.explanation[0]
  //       : practice.explanation || "";
  // }
  else if (practice.id?.startsWith("mantra.")) {
  const langKey = i18n.language.split("-")[0]?.toLowerCase() || "en";

  // Find localized + fallback mantra
  const localizedCatalog = CATALOGS[langKey] || CATALOGS.en;
  const localizedMantra = localizedCatalog.find((m) => m.id === practice.id);
  const fallbackMantra = CATALOGS.en.find((m) => m.id === practice.id);

  // 🧠 Pick the most relevant version
  const activeMantra = localizedMantra || fallbackMantra || practice;

  // 🕉️ Text priority: devanagari > text > fallback
  const text =
    activeMantra.devanagari ||
    activeMantra.text ||
    fallbackMantra?.text ||
    practice.text ||
    "";

  // 📜 Explanation priority: translated array > API array > string fallback
  const explanation =
    Array.isArray(activeMantra.explanation) && activeMantra.explanation.length
      ? activeMantra.explanation.join(" ")
      : Array.isArray(practice.explanation)
      ? practice.explanation.join(" ")
      : activeMantra.explanation || practice.explanation || "";

  displayName = text;
  displayDescription = explanation;
}

  // 🪷 Sanatan Practice
  else {
    displayName = t(`practices.${practice.id}.name`, { defaultValue: practice.name });
    displayDescription = t(`practices.${practice.id}.description`, {
      defaultValue: practice.description,
    });
  }

  return (
    <Card
      key={practice.id || practice.practice_id}
      style={[
        styles.itemCard,
        { backgroundColor: isSelected ? "#F7F0DD" : "#FFFFFF" },
      ]}
    >
      <TouchableOpacity onPress={() => togglePractice(practice)}>
        <View style={{ flexDirection: "row" }}>
          {isSelected ? (
            <Image
              source={require("../../../assets/Check.png")}
              style={{
                width: 20,
                height: 20,
                resizeMode: "contain",
                marginRight: 8,
                borderRadius: 4,
                marginTop: 8,
              }}
            />
          ) : (
            <View
              style={[
                styles.checkbox,
                {
                  marginTop: 8,
                  borderWidth: 1.5,
                  borderColor: Colors.Colors.Light_black,
                },
              ]}
            />
          )}

          <View style={{ marginLeft: 12, flex: 1 }}>
            <TextComponent
              type="cardText"
              style={{ color: Colors.Colors.BLACK }}
            >
              {displayName}
            </TextComponent>

            {!!displayDescription && (
              <TextComponent
                type="streakSadanaText"
                style={{
                  color: Colors.Colors.Light_black,
                  marginTop: 2,
                }}
              >
                {displayDescription}
              </TextComponent>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
})}

        {/* Pagination Controls */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            margin: 20,
          }}
        >
          {currentPage > 0 ? (
          <TouchableOpacity onPress={handlePrev} style={{borderColor:Colors.Colors.Light_grey,borderRadius:4,borderWidth:1,padding:8}}>
            <TextComponent type="mediumText" style={{marginHorizontal:6}}>{t("mySadhana.prev")}</TextComponent>
          </TouchableOpacity>
          ): (
    <View style={{ width: 70 }} /> // keeps layout balanced
  )}
          <TextComponent type="mediumText">
         {t("mySadhana.page", { current: currentPage + 1, total: totalPages || 1 })}
          </TextComponent>
          {currentPage < totalPages - 1 ? (
          <TouchableOpacity onPress={handleNext} style={{borderColor:Colors.Colors.Light_grey,borderRadius:4,borderWidth:1,padding:8}}>
            <TextComponent type="mediumText" style={{marginHorizontal:6}} >{t("mySadhana.next")}</TextComponent>
          </TouchableOpacity>
          ) : (
    <View style={{ width: 70 }} /> // keeps layout balanced
  )}
        </View>

        {/* Confirm Button */}
        <View style={{ alignItems: "center", justifyContent: "center" ,marginBottom:15}}>
          <TouchableOpacity
            disabled={selectedPractices.length === 0} 
            onPress={() =>{
              console.log("Selected Practices:::::::::::::", selectedPractices)
              navigation.navigate("SubmitMantraScreen",{mantraData: selectedPractices,selectedIndex:activeIndex,chosenLevel: chosenLevel,})
            }}
            style={{
              backgroundColor: selectedPractices.length === 0 ? "#C4C4C4": Colors.Colors.App_theme,
              borderRadius: 4,
              paddingVertical: 12,
              paddingHorizontal: 20,
            }}
          >
            <TextComponent
              type="cardText"
              style={{ color: Colors.Colors.white }}
            >
           {t("mySadhana.confirmPractices")}
            </TextComponent>
          </TouchableOpacity>
        </View>

        <AddPracticesModal
          visible={practiceModal}
          onClose={() => showPracticeModal(false)}
  onConfirmCancel={(newPractice) => {
    console.log("✅ Custom practice added:", newPractice);
    setSelectedPractices((prev) => [...prev, newPractice]);
  }}

        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default MySadana;

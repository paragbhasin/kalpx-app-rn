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
import { SANATAN_PRACTICES_FINAL } from "../../data/sanatanPractices";
import { RootState } from "../../store";
import { getDailyDharmaTracker } from "./actions";

const { width } = Dimensions.get("window");

// const sadanaLevels = [
//   {
//     id: 1,
//     title: "Beginner",
//     subtitle: "New to spiritual practices",
//     options: [
//       "5-10 minute sessions",
//       "Simple mantras",
//       "Basic breathing",
//       "Gentle guidance",
//     ],
//   },
//   {
//     id: 2,
//     title: "Intermediate",
//     subtitle: "Some experience with practices",
//     options: [
//       "10-20 minute sessions",
//       "Traditional mantras",
//       "Meditation techniques",
//       "Structured guidance",
//     ],
//   },
//   {
//     id: 3,
//     title: "Advanced",
//     subtitle: "Deeply engaged in spiritual practices",
//     options: [
//       "20+ minute sessions",
//       "Complex mantras",
//       "Advanced techniques",
//       "Self-directed practice",
//     ],
//   },
// ];



const PAGE_SIZE = 5;

const MySadana = ({route}) => {
  const navigation: any = useNavigation();
  const { t } = useTranslation();
const [chosenLevel, setChosenLevel] = useState("Beginner");
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedPractices, setSelectedPractices] = useState<any[]>([]);
  const [practiceModal, showPracticeModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState("");

  const preselectedMantra = route?.params?.selectedmantra || null;

  console.log("selectedmantra >>>>>>",preselectedMantra);
     const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

const sadanaLevels = [
  {
    id: 1,
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

// useEffect(() => {
//   dispatch(
//     getDailyDharmaTracker((res) => {
//       if (res.success) {
//         console.log("✅ Daily Dharma Tracker Data::::::::::", res.data);

//         const apiPractices = res.data.active_practices || [];
//         const paramPractices: any[] = [];

//         if (preselectedMantra) paramPractices.push(preselectedMantra);

//         // ✅ Match API practices with SANATAN_PRACTICES_FINAL by name (or mantra)
//         const matchedPractices = apiPractices.map((apiItem) => {
//           const localMatch = SANATAN_PRACTICES_FINAL.find(
//             (local) =>
//               local.name?.trim().toLowerCase() === apiItem.name?.trim().toLowerCase() ||
//               local.mantra?.trim() === apiItem.mantra?.trim() ||
//               local.description?.trim() === apiItem.description?.trim()
//           );

//           // If found, merge API metadata into local object
//           if (localMatch) {
//             return {
//               ...localMatch,
//               ...apiItem, // API fields override local ones (like practice_id, assigned_at, etc.)
//             };
//           }

//           // If no match found in local list, add as standalone "custom" level item
//           return {
//             ...apiItem,
//             level: "custom",
//           };
//         });

//         // ✅ Merge API + preselected mantra
//         const merged = [...matchedPractices, ...paramPractices];

//         // ✅ Remove duplicates by name (since IDs differ)
//         const unique = merged.filter(
//           (item, index, self) =>
//             index ===
//             self.findIndex(
//               (p) =>
//                 p.name?.trim().toLowerCase() ===
//                 item.name?.trim().toLowerCase()
//             )
//         );

//         // ✅ Set selected practices
//         setSelectedPractices(unique);

//         // ✅ Inject API items into local list if they’re missing (for display in pagination)
//         matchedPractices.forEach((apiItem) => {
//           const exists = SANATAN_PRACTICES_FINAL.some(
//             (local) =>
//               local.name?.trim().toLowerCase() ===
//               apiItem.name?.trim().toLowerCase()
//           );
//           if (!exists) {
//             SANATAN_PRACTICES_FINAL.push(apiItem);
//           }
//         });
//       } else {
//         console.error("❌ Failed to fetch tracker:", res.error);
//       }
//     })
//   );
// }, [dispatch, preselectedMantra]);


useEffect(() => {
  dispatch(
    getDailyDharmaTracker((res) => {
      if (res?.success && res.data) {
        console.log("✅ Daily Dharma Tracker Data::::::::::", res.data);

        const apiPractices = res.data.active_practices || [];
        const paramPractices: any[] = [];
        if (preselectedMantra) paramPractices.push(preselectedMantra);

        // 🔹 CASE 1: Active practices exist
        if (apiPractices.length > 0) {
          const matchedPractices = apiPractices.map((apiItem) => {
            const localMatch = SANATAN_PRACTICES_FINAL.find(
              (local) =>
                local.name?.trim().toLowerCase() ===
                  apiItem.name?.trim().toLowerCase() ||
                local.mantra?.trim() === apiItem.mantra?.trim() ||
                local.description?.trim() === apiItem.description?.trim()
            );

            if (localMatch) return { ...localMatch, ...apiItem };
            return { ...apiItem, level: "custom" };
          });

          const merged = [...matchedPractices, ...paramPractices];
          const unique = merged.filter(
            (item, index, self) =>
              index ===
              self.findIndex(
                (p) =>
                  p.name?.trim().toLowerCase() ===
                  item.name?.trim().toLowerCase()
              )
          );

          setSelectedPractices(unique);
          return;
        }
      }

      // 🔹 CASE 2: API failed or no active practices — fallback
      console.warn("⚠️ No tracker data or API failed — using fallback auto-selection");

      const currentLevel = sadanaLevels[activeIndex].title.toLowerCase();
      const fallbackPractices = SANATAN_PRACTICES_FINAL.filter(
        (p) => p.level.toLowerCase() === currentLevel
      ).slice(0, 3); // First 3

      const merged = preselectedMantra
        ? [preselectedMantra, ...fallbackPractices]
        : fallbackPractices;

      const unique = merged.filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            (p) =>
              p.name?.trim().toLowerCase() === item.name?.trim().toLowerCase()
          )
      );

      setSelectedPractices(unique);
    })
  );
}, [dispatch, preselectedMantra, activeIndex]);




  

  // ✅ Preselect mantra from route params
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

  // const togglePractice = (practice: any) => {
  //   setSelectedPractices((prev) => {
  //     const isSelected = prev.some((p) => p.id === practice.id);
  //     if (isSelected) {
  //       // Remove
  //       return prev.filter((p) => p.id !== practice.id);
  //     } else {
  //       // Add
  //       return [...prev, practice];
  //     }
  //   });
  // };

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


  // const selectedLevel = sadanaLevels[activeIndex].title.toLowerCase();

const LEVEL_KEYS = ["beginner", "intermediate", "advanced"];
const selectedLevel = LEVEL_KEYS[activeIndex];

  const filteredPractices = useMemo(() => {
  let practices = SANATAN_PRACTICES_FINAL;

  // ✅ Filter by level
  practices = practices.filter(
    (p: any) => p.level?.toLowerCase() === selectedLevel
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
}, [selectedLevel, searchText, preselectedMantra, t, i18n.language]);


  // const filteredPractices = useMemo(() => {
  //   let practices = SANATAN_PRACTICES_FINAL;

  //   // Filter by level
  //   practices = practices.filter(
  //     (p: any) => p.level.toLowerCase() === selectedLevel
  //   );

  //   // Apply search filter
  //   if (searchText) {
  //     practices = practices.filter(
  //       (p: any) =>
  //         p.name.toLowerCase().includes(searchText) ||
  //         p.description.toLowerCase().includes(searchText) ||
  //         (p.deity && p.deity.toLowerCase().includes(searchText))
  //     );
  //   }

  //   // ✅ Ensure preselected mantra appears first in list
  //   if (preselectedMantra) {
  //     const existing = practices.find((p) => p.id === preselectedMantra.id);
  //     if (!existing) {
  //       practices = [preselectedMantra, ...practices];
  //     } else {
  //       // Move it to the top if already present
  //       practices = [
  //         existing,
  //         ...practices.filter((p) => p.id !== preselectedMantra.id),
  //       ];
  //     }
  //   }

  //   return practices;
  // }, [selectedLevel, searchText, preselectedMantra]);

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
          type="mediumText"
          style={{
            fontSize: FontSize.CONSTS.FS_14,
            textAlign: "center",
            marginTop: 7,
            marginHorizontal: 30,
          }}
        >
           {t("mySadhana.simpleRoutines")}
        </TextComponent>

        {/* Carousel for Sadana Levels */}
        <View style={{ marginTop: 30 }}>
          <Carousel
            loop={false}
            width={width}
            height={280}
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
  const isChosen = chosenLevel === item.title;

  const cardBg = isChosen ? Colors.Colors.Yellow : "#F8F8F8";
  const textColor = isChosen ? Colors.Colors.white : "#848199";

  return (
    <Animated.View
      style={{
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible", // ✅ allows top icon to overflow without pushing layout
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
          minHeight: 280, // consistent height
          overflow: "visible", // ✅ makes sure top icon shows without extra height
          marginVertical: 10, // consistent spacing between cards
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        {/* ✅ Check Image — Floating Top Center */}
        {isChosen && (
          <Image
            source={require("../../../assets/check_box_card.png")}
            style={{
              position: "absolute",
              top: -30, // floats above card visually, no extra height
              alignSelf: "center",
              height: 65,
              width: 65,
              zIndex: 5,
            }}
          />
        )}

        {/* Title & Subtitle */}
        <TextComponent
          type="cardText"
          style={{
            color: textColor,
            fontSize: FontSize.CONSTS.FS_22,
            marginTop: 15, // ✅ fixed spacing
          }}
        >
          {item.title}
        </TextComponent>

        <TextComponent
          type="streakText"
          style={{
            color: textColor,
            fontSize: FontSize.CONSTS.FS_14,
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
              marginVertical: 4,
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
              type="streakText"
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
                setChosenLevel(item.title);
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

//             renderItem={({ item, index }) => {
//   const isActive = activeIndex === index;
//   const isChosen = chosenLevel === item.title;

//   const cardBg = isChosen ? Colors.Colors.Yellow : "#F8F8F8";
//   const textColor = isChosen ? Colors.Colors.white : "#848199";

//   return (
//     <Animated.View
//       style={{
//         alignItems: "center",
//         justifyContent: "center",
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.25,
//         shadowRadius: 4,
//         elevation: 6,
//       }}
//     >
//       <Card
//         style={{
//           backgroundColor: cardBg,
//           borderRadius: 20,
//           width: width * 0.8,
//           paddingVertical: 20,
//           paddingHorizontal: 20,
//           alignItems: "center",
//           position: "relative",
//           marginTop:10,
//           marginBottom:20,
//           minHeight: 280, // ✅ Keeps consistent height even when Choose button hides
//         }}
//       >
//         {/* ✅ Check Image — Top Center */}
//         {isChosen && (
//           <Image
//             source={require("../../../assets/check_box_card.png")}
//             style={{
//               position: "absolute",
//               top: -42 ,
//               alignSelf: "center",
//               height: 70,
//               width: 70,
//             }}
//           />
//         )}

//         {/* Title & Subtitle */}
//         <TextComponent
//           type="cardText"
//           style={{
//             color: textColor,
//             fontSize: FontSize.CONSTS.FS_22,
//             marginTop: isChosen ? 40 : 0, // push down a bit when icon visible
//           }}
//         >
//           {item.title}
//         </TextComponent>

//         <TextComponent
//           type="streakText"
//           style={{
//             color: textColor,
//             fontSize: FontSize.CONSTS.FS_14,
//             marginBottom: 12,
//           }}
//         >
//           {item.subtitle}
//         </TextComponent>

//         {/* Options */}
//         {item.options.map((opt, i) => (
//           <View
//             key={i}
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               marginVertical: 4,
//             }}
//           >
//             <Image
//               source={require("../../../assets/check-circle.png")}
//               style={{
//                 height: 20,
//                 width: 20,
//                 marginRight: 10,
//                 tintColor: textColor,
//               }}
//             />
//             <TextComponent
//               type="streakText"
//               style={{
//                 color: textColor,
//                 fontSize: FontSize.CONSTS.FS_14,
//               }}
//             >
//               {opt}
//             </TextComponent>
//           </View>
//         ))}

//         {/* ✅ Reserve button space even if hidden */}
//         <View
//           style={{
//             height: 50, // fixed space for button area
//             marginTop: 15,
//             justifyContent: "center",
//           }}
//         >
//           {!isChosen && (
//             <TouchableOpacity
//               onPress={() => {
//                 setChosenLevel(item.title);
//                 setActiveIndex(index);
//               }}
//             >
//               <View
//                 style={{
//                   backgroundColor: isActive
//                     ? Colors.Colors.white
//                     : "#F3EBD6",
//                   alignSelf: "center",
//                   paddingHorizontal: 25,
//                   paddingVertical: 12,
//                   borderRadius: 20,
//                   width: 180,
//                   alignItems: "center",
//                 }}
//               >
//                 <TextComponent
//                   type="boldText"
//                   style={{
//                     color: isActive
//                       ? Colors.Colors.Yellow
//                       : Colors.Colors.Light_black,
//                     fontSize: FontSize.CONSTS.FS_14,
//                   }}
//                 >
//                   Choose
//                 </TextComponent>
//               </View>
//             </TouchableOpacity>
//           )}
//         </View>
//       </Card>
//     </Animated.View>
//   );
// }}

            // renderItem={({ item, index }) => {
            //   const isActive = activeIndex === index;
            //   const cardBg = isActive ? Colors.Colors.Yellow : "#F8F8F8";
            //   const textColor = isActive ? Colors.Colors.white : "#848199";

            //   return (
            //     <Animated.View
            //       style={{
            //         alignItems: "center",
            //         justifyContent: "center",
            //         shadowColor: "#000",
            //         shadowOffset: { width: 0, height: 4 },
            //         shadowOpacity: 0.25,
            //         shadowRadius: 4,
            //         elevation: 6,
            //       }}
            //     >
            //       <Card
            //         style={{
            //           backgroundColor: cardBg,
            //           borderRadius: 20,
            //           width: width * 0.8,
            //           padding: 20,
            //           alignItems: "center",
            //         }}
            //       >
                    
            //         <TextComponent
            //           type="cardText"
            //           style={{
            //             color: textColor,
            //             fontSize: FontSize.CONSTS.FS_22,
            //           }}
            //         >
            //           {item.title}
            //         </TextComponent>

            //         <TextComponent
            //           type="streakText"
            //           style={{
            //             color: textColor,
            //             fontSize: FontSize.CONSTS.FS_14,
            //             marginBottom: 12,
            //           }}
            //         >
            //           {item.subtitle}
            //         </TextComponent>

            //         {item.options.map((opt, i) => (
            //           <View
            //             key={i}
            //             style={{
            //               flexDirection: "row",
            //               alignItems: "center",
            //               marginVertical: 4,
            //             }}
            //           >
            //             <Image
            //               source={require("../../../assets/check-circle.png")}
            //               style={{
            //                 height: 20,
            //                 width: 20,
            //                 marginRight: 10,
            //                 tintColor: textColor,
            //               }}
            //             />
            //             <TextComponent
            //               type="streakText"
            //               style={{
            //                 color: textColor,
            //                 fontSize: FontSize.CONSTS.FS_14,
            //               }}
            //             >
            //               {opt}
            //             </TextComponent>
            //           </View>
            //         ))}

            //         <View
            //           style={{
            //             backgroundColor: isActive
            //               ? Colors.Colors.white
            //               : "#F3EBD6",
            //             alignSelf: "center",
            //             paddingHorizontal: 25,
            //             paddingVertical: 12,
            //             borderRadius: 20,
            //             width: 180,
            //             marginTop: 20,
            //             alignItems: "center",
            //           }}
            //         >
            //           <TextComponent
            //             type="boldText"
            //             style={{
            //               color: isActive
            //                 ? Colors.Colors.Yellow
            //                 : Colors.Colors.Light_black,
            //               fontSize: FontSize.CONSTS.FS_14,
            //             }}
            //           >
            //             Choose
            //           </TextComponent>
            //         </View>
            //       </Card>
            //     </Animated.View>
            //   );
            // }}
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

<View style={{ margin: 20,borderColor:Colors.Colors.Light_grey,borderWidth:1,padding:12,borderRadius:4 }}>
    <TextComponent
                type="cardText"
                style={{ color: Colors.Colors.BLACK }}
              >
             {t("mySadhana.selectedPractices")}
              </TextComponent>
              {selectedPractices.length > 0 ? (
    selectedPractices.map((p) => (
      <TouchableOpacity
        key={p.id || p.practice_id}
        style={{ flexDirection: "row", alignItems: "center" }}
        onPress={() => togglePractice(p)}
      >
                <View style={{
                  // backgroundColor: "#FFF8E1",
                  borderRadius: 6,
                  padding: 8,
                  marginVertical: 4,
                }}>
                  <Image
                      source={require("../../../assets/Check.png")}
                      style={{
                        width: 20,
                        height: 20,
                        resizeMode: "contain",
                        marginRight: 8,
                        borderRadius: 4,
                        // marginTop: 8,
                      }}
                    />
              </View>
                <TextComponent type="mediumText" style={{ color: "#333" }}>
                  {t(`practices.${p.id}.name`, { defaultValue: p.name || p.text || p.short_text })}{" "}
          ({p.level || "custom"})
                </TextComponent>
              </TouchableOpacity>
            ))
          ) : (
            <TextComponent type="streakText" style={{ color: "#777" }}>
             {t("mySadhana.noPractices")}
            </TextComponent>
          )}
</View>
        {/* Search & Create Practice */}
        <View style={{ margin: 20 }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View>
              <TextComponent
                type="cardText"
                style={{ color: Colors.Colors.BLACK }}
              >
               {t("mySadhana.selectFromList")}
              </TextComponent>
              <TextComponent
                type="streakText"
                style={{ color: Colors.Colors.Light_black, width: "60%" }}
              >
                {t("mySadhana.selectSubtitle")}
              </TextComponent>
            </View>
            <View style={{ marginLeft: -20 }}>
              <TouchableOpacity
                onPress={() => showPracticeModal(true)}
                style={{
                  backgroundColor: Colors.Colors.App_theme,
                  borderRadius: 4,
                  paddingHorizontal: 6,
                  paddingVertical: 12,
                  marginRight: 40,
                }}
              >
                <TextComponent
                  type="cardText"
                  style={{ color: Colors.Colors.BLACK }}
                >
                 {t("mySadhana.createPractice")}
                </TextComponent>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Search Input */}
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
            style={{ flex: 1, fontSize: 14 }}
          placeholder={t("mySadhana.searchPlaceholder")}
            onChangeText={debouncedSearch}
          />
        </View>

        {/* Practices List */}
        {paginatedPractices.map((practice: any) => {
          // const isSelected = selectedPractices.includes(practice);
            const isSelected = selectedPractices.some(
    (p) => (p.id || p.practice_id) === (practice.id || practice.practice_id)
  );
          console.log("paginatedPractices >>>>>>>>",paginatedPractices);
          return (
            <Card
              // key={practice.id}
              key={practice.id || practice.practice_id}
              style={[
                styles.itemCard,
                { backgroundColor: isSelected ? "#FFF8E1" : "#FFFFFF" },
              ]}
            >
              <TouchableOpacity onPress={() => togglePractice(practice)}>
              <View style={{ flexDirection: "row" }}>
                {/* <Pressable onPress={() => togglePractice(practice)}> */}
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
                {/* </Pressable> */}

                <View style={{ marginLeft: 12, flex: 1 }}>
                  <TextComponent
                    type="cardText"
                    style={{ color: Colors.Colors.BLACK }}
                  >
                      {t(`practices.${practice.id}.name`)}
                    {/* {practice.name ? practice.name : practice.text ? practice.text : practice.short_text} */}
                  </TextComponent>
                  <TextComponent
                    type="mediumText"
                    style={{
                      color: Colors.Colors.Light_black,
                      fontSize: FontSize.CONSTS.FS_14,
                    }}
                  >
                      {t(`practices.${practice.id}.description`)}
                    {/* {practice.description ? practice.description : practice.explanation ? practice.explanation : practice.tooltip}{"\n"}
                    {practice.suggested_practice &&  practice.suggested_practice} */}
                  </TextComponent>
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
          <TouchableOpacity onPress={handlePrev}>
            <TextComponent type="mediumText">{t("mySadhana.prev")}</TextComponent>
          </TouchableOpacity>
          <TextComponent type="mediumText">
         {t("mySadhana.page", { current: currentPage + 1, total: totalPages || 1 })}
          </TextComponent>
          <TouchableOpacity onPress={handleNext}>
            <TextComponent type="mediumText">{t("mySadhana.next")}</TextComponent>
          </TouchableOpacity>
        </View>

        {/* Confirm Button */}
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <TouchableOpacity
            onPress={() =>{
              console.log("Selected Practices:", selectedPractices)
              navigation.navigate("SubmitMantraScreen",{mantraData: selectedPractices,selectedIndex:activeIndex})
            }}
            style={{
              backgroundColor: Colors.Colors.App_theme,
              borderRadius: 4,
              paddingVertical: 12,
              paddingHorizontal: 20,
            }}
          >
            <TextComponent
              type="cardText"
              style={{ color: Colors.Colors.BLACK }}
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

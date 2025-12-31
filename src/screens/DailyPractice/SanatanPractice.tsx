import { useNavigation } from "@react-navigation/native";
import { debounce } from "lodash";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import AddPracticesModal from "../../components/AddPracticesModal";
import Colors from "../../components/Colors";
import Header from "../../components/Header";
import TextComponent from "../../components/TextComponent";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { AnyAction } from "@reduxjs/toolkit";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import CartModal from "../../components/CartModal";
import FontSize from "../../components/FontSize";
import LoadingOverlay from "../../components/LoadingOverlay";
import i18n from "../../config/i18n";
import { useCart } from "../../context/CartContext";
import { CATALOGS } from "../../data/mantras";
import { SANATAN_PRACTICES_FINAL } from "../../data/sanatanPractices";
import { RootState } from "../../store";
import { submitDailyDharmaSetup } from "../Home/actions";
import styles from "../Home/homestyles";

const { width } = Dimensions.get("window");

const PAGE_SIZE = 10;

const SanatanPractice = ({route}) => {
  const navigation: any = useNavigation();
  const { t } = useTranslation();
const [chosenLevel, setChosenLevel] = useState("beginner");
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedPractices, setSelectedPractices] = useState<any[]>([]);
  const [practiceModal, showPracticeModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState("");
const [loading, setLoading] = useState(false);

     const {
      localPractices,
      addPractice,
      removePractice,
      cartModalVisible,
      setCartModalVisible
    } = useCart();

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
          <ImageBackground

      style={{
        flex: 1,
        width: FontSize.CONSTS.DEVICE_WIDTH,
        alignSelf: "center",
        justifyContent: "flex-start",
        paddingBottom: 80, 
      }}
      imageStyle={{
        borderTopRightRadius: 16,
        borderTopLeftRadius: 16,
      }}
    >
      <Header />
    <CartModal
  onConfirm={async (list) => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("refresh_token");

      const payload = {
        practices: list, // ⭐ send EXACT list (API practices untouched)
        dharma_level:
          activeIndex === 0 ? "beginner" :
          activeIndex === 1 ? "intermediate" : "advanced",
        is_authenticated: true,
        recaptcha_token: token,
      };

      console.log("SANATAN PRACTICE SUBMIT PAYLOAD:", JSON.stringify(payload));

      return new Promise<void>((resolve) => {
        dispatch(
          submitDailyDharmaSetup(payload, (res) => {
            setLoading(false);
            if (res.success) {
              // cartModal will already clear the cart
              navigation.navigate("TrackerTabs", { screen: "Tracker" });
            }
            resolve();
          })
        );
      });
    } catch (e) {
      setLoading(false);
      console.log("Submit Error:", e);
    }
  }}
/>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 70 }}
        showsVerticalScrollIndicator={false}
      >
         <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            marginTop: 10,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#000" />
          </TouchableOpacity>

          <TextComponent type="DailyHeaderText" style={styles.pageTitle}>
          Select Sanatan Practices
          </TextComponent>

          <TouchableOpacity
            onPress={() => setCartModalVisible(true)}
            style={{ position: "relative", width: 30, height: 30 }}
          >
            <View
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                backgroundColor: "#1877F2",
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
              }}
            >
              <TextComponent type="semiBoldText" style={{ color: "#fff", fontSize: 11 }}>
                {localPractices.length}
              </TextComponent>
            </View>

            <Image
              source={require("../../../assets/cart.png")}
              style={{ width: 30, height: 30 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <TextComponent type="streakSadanaText" style={{textAlign:"center",marginHorizontal:12}}>Select mantra or practices to add to your routine</TextComponent>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 8,
            marginRight: 16,
            height: 45,
            marginLeft: 20,
            backgroundColor:"#FFFFFF",borderColor:Colors.Colors.Yellow,borderWidth:1
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
          placeholder="e.g., Shiva Ashtakam, Vishnu, Tulsi Pooja "
            onChangeText={debouncedSearch}
            placeholderTextColor={Colors.Colors.BLACK}
          />
        </View>
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
    <View
      key={practice.id || practice.practice_id}
      style={[
        styles.itemCard,
        { backgroundColor: "#FFFFFF" },
      ]}
    >
      <View >
        <View style={{ flexDirection: "row",alignItems:"center" }}>
          {isSelected ? (
            <TouchableOpacity onPress={() => togglePractice(practice)}>
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
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => togglePractice(practice)}>
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
            </TouchableOpacity>
          )}

          <View style={{ marginLeft: 12, flex: 1 }}>
            <TextComponent
              type="boldText"
              style={{ color: Colors.Colors.BLACK }}
            >
              {practice?.icon} {displayName}
            </TextComponent>

            {!!displayDescription && (
              <TextComponent
                type="subDailyText"
                style={{
                  color: Colors.Colors.Light_black,
                  marginTop: 2,
                }}
              >
                {displayDescription}
              </TextComponent>
            )}
              {/* {Array.isArray(practice.tags) && practice.tags.length > 0 && (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginTop: 8 }}
    >
      {practice.tags.map((tag, index) => (
        <View
          key={index}
          style={{
            paddingVertical: 6,
            paddingHorizontal: 12,
            backgroundColor: Colors.Colors.Time_bg,
            borderRadius: 20,
            marginRight: 8,
            borderWidth: 1,
            borderColor: "#E0D7C3",
          }}
        >
          <TextComponent
            type="streakSadanaText"
            style={{ color: "#6E5C2E", fontSize: 13 }}
          >
            {tag}
          </TextComponent>
        </View>
      ))}
    </ScrollView>
  )} */}
          </View>
        </View>
      </View>
    </View>
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
        {/* <View style={{ alignItems: "center", justifyContent: "center" ,marginBottom:15}}>
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
        </View> */}

        <AddPracticesModal
          visible={practiceModal}
          onClose={() => showPracticeModal(false)}
  onConfirmCancel={(newPractice) => {
    console.log("✅ Custom practice added:", newPractice);
    setSelectedPractices((prev) => [...prev, newPractice]);
  }}

        />
      </ScrollView>
      {/* FIXED BOTTOM NEXT BUTTON */}
<View
  style={{
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0D8C8",
  }}
>
  <TouchableOpacity
    disabled={selectedPractices.length === 0}
    onPress={() => {
      console.log("Selected Practices:", selectedPractices);
      navigation.navigate("ConfirmSanatanPractices", {
        mantraData: selectedPractices,
        selectedIndex: activeIndex,
        chosenLevel: chosenLevel,
      });
    }}
    style={{
      backgroundColor:
        selectedPractices.length === 0 ? "#C4C4C4" : Colors.Colors.App_theme,
      borderRadius: 4,
      paddingVertical: 12,
      alignItems: "center",
    }}
  >
    <TextComponent
      type="cardText"
      style={{ color: "#FFFFFF", fontSize: 16 }}
    >
      Add Selected Practices to My Routine
       {/* ({selectedPractices.length}) */}
    </TextComponent>
  </TouchableOpacity>
  <TextComponent type="streakText" style={{color:Colors.Colors.BLACK,textAlign:"center",marginTop:4}}>You can adjust repetition and frequency in the next step</TextComponent>
</View>
<LoadingOverlay visible={loading} text="Saving..." />
</ImageBackground>
    </SafeAreaView>
  );
};

export default SanatanPractice;


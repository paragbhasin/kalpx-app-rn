import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";

import CartModal from "../../components/CartModal";
import Colors from "../../components/Colors";
import CommunityAuthModal from "../../components/CommunityAuthModal";
import DailyPracticeMantraCard from "../../components/DailyPracticeMantraCard";
import Header from "../../components/Header";
import LoadingButton from "../../components/LoadingButton";
import LoadingOverlay from "../../components/LoadingOverlay";
import TextComponent from "../../components/TextComponent";
import { useCart } from "../../context/CartContext";

import moment from "moment";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useUserLocation } from "../../components/useUserLocation";
import i18n from "../../config/i18n";
import { RootState } from "../../store";
import { submitDailyDharmaSetup, getDailyDharmaTracker } from "../Home/actions";
import { fetchDailyPractice } from "../Streak/actions";
import styles from "./DailyPracticeSelectListStyles";

// assets
const backIcon = require("../../../assets/C_Arrow_back.png");
const cartIcon = require("../../../assets/cart.png");


const DailyPracticeSelectList = ({ route }) => {
  const navigation: any = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [mantraReps, setMantraReps] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingSubmitPayload, setPendingSubmitPayload] = useState<any>(null);
  
  const user = useSelector((state: RootState) => state.login?.user || state.socialLoginReducer?.user);
  const isUserLoggedIn = !!user;

  const resumedSelections = route?.params?.resumedSelections ?? null;
  const scrollToId = route?.params?.scrollToId;

  console.log("resumedSelections >>>>>",resumedSelections);
  console.log("🎯 scrollToId param:", scrollToId);

  const selectedMap = useMemo(() => {
  const map = new Map<string, any>();

  (resumedSelections || []).forEach((item) => {
    map.set(item.practice_id, item);
  });

  return map;
}, [resumedSelections]);



  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const dailyPractice = useSelector(
  (state: RootState) => state.dailyPracticeReducer
);

  // ⭐ CART CONTEXT
  const {
    localPractices,
    setCartModalVisible
  } = useCart();


  // ------------------------------------------------------
  // RESTORE DATA FROM LOGIN REDIRECT
  // ------------------------------------------------------
  useEffect(() => {
    const restoreAndSubmit = async () => {
      let pending = await AsyncStorage.getItem("pending_daily_practice_data");

      if (!pending && route?.params?.resumeData) {
        pending = JSON.stringify(route?.params?.resumeData);
      }

      if (!pending) return;

      const { payload } = JSON.parse(pending);

      await AsyncStorage.removeItem("pending_daily_practice_data");
      setLoading(true);

      dispatch(
        submitDailyDharmaSetup(payload, (res) => {
          setLoading(false);
          if (res.success) {
            navigation.navigate("TrackerTabs", { screen: "Tracker" });
          }
        })
      );
    };

    restoreAndSubmit();
  }, []);

  const { locationData, loading: locationLoading } = useUserLocation();

useEffect(() => {
  if (!locationLoading && locationData?.timezone) {
    const today = moment().format("YYYY-MM-DD");
    dispatch(fetchDailyPractice(today, locationData.timezone));
  }
}, [locationLoading, locationData?.timezone]);

// Debug: Track login state changes
useEffect(() => {
  console.log("👤 User login state changed:", { isUserLoggedIn, user: !!user });
}, [isUserLoggedIn]);

// ✅ Auto-submit practices after authentication
// This useEffect watches for user login state changes. When a user authenticates
// through the CommunityAuthModal, isUserLoggedIn becomes true and this effect:
// 1. Fetches the daily practice tracker data (to get active practices)
// 2. Combines active practices with new practices from pendingSubmitPayload
// 3. Submits the combined list to the setup API
// 4. Navigates to Tracker on success
useEffect(() => {
  if (isUserLoggedIn && pendingSubmitPayload && !loading) {
    console.log("🚀 Auto-submit triggered!", { isUserLoggedIn, hasPendingPayload: !!pendingSubmitPayload });
    
    const fetchAndSubmit = async () => {
      setLoading(true);
      setShowAuthModal(false); // Close modal before submitting
      
      console.log("📥 Fetching existing practices from tracker API...");
      
      // Step 1: Fetch current tracker data with callback
      dispatch(getDailyDharmaTracker(async (trackerRes) => {
        console.log("📊 Tracker API response:", trackerRes);
        
        const token = await AsyncStorage.getItem("access_token");
        
        if (trackerRes.success) {
          // Step 2: Get active practices from API response
          const currentActivePractices = trackerRes.data?.active_practices || [];
          console.log("📊 Current active practices:", currentActivePractices.length);
          
          // Step 3: Normalize active practices
          const normalizedActive = currentActivePractices.map(normalizeApiPractice);
          
          // Step 4: Get new practices from pending payload
          const newPractices = pendingSubmitPayload.practices || [];
          console.log("✨ New practices to add:", newPractices.length);
          
          // Step 5: Filter out duplicates (don't add if already active)
          const filteredNew = newPractices.filter(
            (newP) => !normalizedActive.some(
              (activeP) => activeP.practice_id === newP.practice_id
            )
          );
          
          // Step 6: Combine active + new practices
          const combinedPractices = [...normalizedActive, ...filteredNew];
          console.log("🔗 Combined practices:", combinedPractices.length, "(active:", normalizedActive.length, "+ new:", filteredNew.length, ")");
          
          const finalPayload = {
            practices: combinedPractices,
            is_authenticated: true,
            recaptcha_token: token || "not_available",
          };
          
          console.log("📤 Submitting combined practices:", JSON.stringify(finalPayload));
          
          dispatch(submitDailyDharmaSetup(finalPayload, (res) => {
            console.log("✅ Submit response:", res);
            setLoading(false);
            setPendingSubmitPayload(null);
            if (res.success) {
              console.log("🎯 Navigating to Tracker...");
              navigation.navigate("TrackerTabs", { screen: "Tracker", fromSetup: true });
            }
          }));
        } else {
          // If tracker fetch fails, just submit new practices
          console.log("⚠️ Tracker fetch failed, submitting only new practices");
          const finalPayload = {
            ...pendingSubmitPayload,
            recaptcha_token: token || "not_available",
          };
          
          dispatch(submitDailyDharmaSetup(finalPayload, (res) => {
            setLoading(false);
            setPendingSubmitPayload(null);
            if (res.success) {
              navigation.navigate("TrackerTabs", { screen: "Tracker", fromSetup: true });
            }
          }));
        }
      }));
    };
    
    fetchAndSubmit();
  }
}, [isUserLoggedIn, pendingSubmitPayload]);

const activeApiPractices =
  dailyPractice?.data?.active_practices || [];



  // ------------------------------------------------------
  // PARAMS
  // ------------------------------------------------------
  const resumeData = route?.params?.resumeData ?? null;

  const normalizeApiPractice = (ap: any) => ({
  practice_id: ap.practice_id ?? ap.id,
  source: ap.source,
  category: ap.category,
  name: ap.name,
  description: ap.description ?? "",
  benefits: ap.details?.benefits ?? [],
  reps: ap.details?.reps,
  day: ap.details?.day,
});


  const categoryItem =
    route?.params?.item ??
    resumeData?.categoryItem ??
    null;

  const isLocked =
    route?.params?.isLocked ??
    resumeData?.isLocked ??
    false;

  const selectedCategory = categoryItem?.key;
  const allData = i18n.getResourceBundle(i18n.language, "translation");

  // ------------------------------------------------------
  // FILTER LISTS
  // ------------------------------------------------------
  const mantraList: any[] = useMemo(() => {
    if (!selectedCategory) return [];
    return Object.values(allData).filter(
      (item: any) =>
        item?.category === selectedCategory &&
        item?.id?.startsWith("mantra.")
    );
  }, [selectedCategory]);

  const sankalpList: any[] = useMemo(() => {
    if (!selectedCategory) return [];
    return Object.values(allData).filter(
      (item: any) =>
        item?.category === selectedCategory &&
        item?.id?.startsWith("sankalp.")
    );
  }, [selectedCategory]);

  const practiceList: any[] = useMemo(() => {
    if (!selectedCategory) return [];
    return Object.values(allData).filter(
      (item: any) =>
        item?.category === selectedCategory &&
        item?.id?.startsWith("practice.")
    );
  }, [selectedCategory]);

  const [locked, setLocked] = useState(isLocked);

useEffect(() => {
  if (route?.params?.isLocked) setLocked(true);
}, [route?.params?.isLocked]);


useEffect(() => {
  // 🚫 SKIP if scrollToId is present (let scrollToId effect handle it)
  if (scrollToId) return;
  
  if (!resumedSelections) return;

  // Wait until lists are fully populated
  if (mantraList.length === 0 && sankalpList.length === 0 && practiceList.length === 0) {
    return;
  }

  resumedSelections.forEach((item) => {
    const pid = item.practice_id;

    if (item.source === "mantra") {
      const i = mantraList.findIndex((x) => x.id === pid);
      if (i >= 0) {
        setSelectedMantra(true);
        setMantraIndex(i);
        setMantraReps(item.reps);
      }
    }

    if (item.source === "sankalp") {
      const i = sankalpList.findIndex((x) => x.id === pid);
      if (i >= 0) {
        setSelectedSankalp(true);
        setSankalpIndex(i);
      }
    }

    if (item.source === "practice") {
      const i = practiceList.findIndex((x) => x.id === pid);
      if (i >= 0) {
        setSelectedPractice(true);
        setPracticeIndex(i);
      }
    }
  });

}, [
  resumedSelections,
  allData,            // <-- ensures translation bundle loaded
  mantraList.length,
  sankalpList.length,
  practiceList.length,
  scrollToId,
]);


  // ------------------------------------------------------
  // CHECKBOX STATES
  // ------------------------------------------------------
  const [selectedMantra, setSelectedMantra] = useState(false);
  const [selectedSankalp, setSelectedSankalp] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState(false);

  // ------------------------------------------------------
  // ROTATION INDEXES
  // ------------------------------------------------------
  const [mantraIndex, setMantraIndex] = useState(0);
  const [sankalpIndex, setSankalpIndex] = useState(0);
  const [practiceIndex, setPracticeIndex] = useState(0);

  const nextMantra = () =>
    setMantraIndex((prev) => (prev + 1) % mantraList.length);
  const nextSankalp = () =>
    setSankalpIndex((prev) => (prev + 1) % sankalpList.length);
  const nextPractice = () =>
    setPracticeIndex((prev) => (prev + 1) % practiceList.length);

  // ------------------------------------------------------
  // BUILD PAYLOAD (1–3 items)
  // ------------------------------------------------------
  const buildPayload = () => {
    const selectedItems = [
      selectedMantra && mantraList[mantraIndex]
        ? { ...mantraList[mantraIndex], reps: mantraReps }
        : null,

      selectedSankalp && sankalpList[sankalpIndex]
        ? sankalpList[sankalpIndex]
        : null,

      selectedPractice && practiceList[practiceIndex]
        ? practiceList[practiceIndex]
        : null,
    ].filter(Boolean);

  

// const practices = selectedItems.map((p: any) => {
//   const source = p.id.startsWith("mantra.")
//     ? "mantra"
//     : p.id.startsWith("sankalp.")
//     ? "sankalp"
//     : "practice";

//   // 🔑 Extract from details OR direct
//   const day = p.day ?? p.details?.day ?? "Daily";

//   // 🔑 Reps rules
//   let reps = p.reps ?? p.details?.reps;

//   if (source === "sankalp") {
//     reps = 1; // ✅ forced
//   }

//   return {
//     practice_id: p.id,
//     source,
//     category: categoryItem?.name ?? "",
//     name: p.title,
//     description: p.description || p.summary || p.meaning || "",
//     benefits: p.benefits || [],

//     // ✅ for ALL
//     day,

//     // ✅ for ALL (sankalp = 1)
//     reps,
//   };
// });

const practices = selectedItems.map((p: any) => {
  const source = p.id.startsWith("mantra.")
    ? "mantra"
    : p.id.startsWith("sankalp.")
    ? "sankalp"
    : "practice";

  // 🔥 TAKE USER DATA, NOT STATIC LIST
  const userData = selectedMap.get(p.id);

  return {
    practice_id: p.id,
    source,
    category: categoryItem?.name ?? "",
    name: p.title,
    description: p.description || p.summary || p.meaning || "",
    benefits: p.benefits || [],

    // ✅ ALWAYS FROM USER SELECTION
    day: userData?.day ?? "Daily",

    // ✅ reps rules
    reps:
      source === "sankalp"
        ? 1
        : Number(userData?.reps ?? 1),
  };
});


    return {
      practices,
      is_authenticated: true,
      recaptcha_token: "not_available",
    };
  };

  const resumedMantra = resumedSelections?.find(
  (x) => x.practice_id === mantraList[mantraIndex]?.id
);

const resumedSankalp = resumedSelections?.find(
  (x) => x.practice_id === sankalpList[sankalpIndex]?.id
);

const resumedPractice = resumedSelections?.find(
  (x) => x.practice_id === practiceList[practiceIndex]?.id
);

// RESET all selections when coming from ConfirmDailyPractices
// useEffect(() => {
//   // 1️⃣ First time coming (no resumedSelections) → select ALL
//   if (!resumedSelections) {
//     setSelectedMantra(true);
//     setSelectedSankalp(true);
//     setSelectedPractice(true);
//     return;
//   }

//   // 2️⃣ When coming back from ConfirmDailyPractices → reset all first
//   setSelectedMantra(false);
//   setSelectedSankalp(false);
//   setSelectedPractice(false);

//   // 3️⃣ Wait for lists to be loaded
//   if (mantraList.length === 0 && sankalpList.length === 0 && practiceList.length === 0) {
//     return;
//   }

//   // 4️⃣ Restore selections based on resumedSelections
//   resumedSelections.forEach((item) => {
//     const pid = item.practice_id;

//     if (item.source === "mantra") {
//       const i = mantraList.findIndex((x) => x.id === pid);
//       if (i >= 0) {
//         setMantraIndex(i);
//         setMantraReps(item.reps);
//         setSelectedMantra(true);
//       }
//     }

//     if (item.source === "sankalp") {
//       const i = sankalpList.findIndex((x) => x.id === pid);
//       if (i >= 0) {
//         setSankalpIndex(i);
//         setSelectedSankalp(true);
//       }
//     }

//     if (item.source === "practice") {
//       const i = practiceList.findIndex((x) => x.id === pid);
//       if (i >= 0) {
//         setPracticeIndex(i);
//         setSelectedPractice(true);
//       }
//     }
//   });
// }, [
//   resumedSelections,
//   mantraList.length,
//   sankalpList.length,
//   practiceList.length
// ]);

useEffect(() => {
  // � SKIP if scrollToId is present (let scrollToId effect handle it)
  if (scrollToId) {
    return;
  }

  // �🟢 NORMAL FLOW → select all
  if (!resumedSelections) {
    setSelectedMantra(true);
    setSelectedSankalp(true);
    setSelectedPractice(true);
    return;
  }

  // 🔵 FROM ConfirmDailyPractices → reset first
  setSelectedMantra(false);
  setSelectedSankalp(false);
  setSelectedPractice(false);

  // Wait until lists are ready
  if (
    mantraList.length === 0 &&
    sankalpList.length === 0 &&
    practiceList.length === 0
  ) {
    return;
  }

  // Restore only confirmed items
  resumedSelections.forEach((item) => {
    const pid = item.practice_id;

    if (item.source === "mantra") {
      const i = mantraList.findIndex((x) => x.id === pid);
      if (i >= 0) {
        setMantraIndex(i);
        setMantraReps(item.reps);
        setSelectedMantra(true);
      }
    }

    if (item.source === "sankalp") {
      const i = sankalpList.findIndex((x) => x.id === pid);
      if (i >= 0) {
        setSankalpIndex(i);
        setSelectedSankalp(true);
      }
    }

    if (item.source === "practice") {
      const i = practiceList.findIndex((x) => x.id === pid);
      if (i >= 0) {
        setPracticeIndex(i);
        setSelectedPractice(true);
      }
    }
  });
}, [
  resumedSelections,
  mantraList.length,
  sankalpList.length,
  practiceList.length,
  scrollToId,
]);


  useEffect(() => {
    console.log("🔍 scrollToId effect running:", { scrollToId, mantraListLength: mantraList.length, sankalpListLength: sankalpList.length });
    
    if (!scrollToId) {
      console.log("⏭️ No scrollToId, skipping effect");
      return;
    }

    // Wait for lists to load
    if (
      mantraList.length === 0 &&
      sankalpList.length === 0 &&
      practiceList.length === 0
    ) {
      console.log("⏳ Lists not loaded yet, waiting...");
      return;
    }

    console.log("📜 Scrolling to ID:", scrollToId);

    // 1. Check Mantra List
    const mIndex = mantraList.findIndex((x) => x.id === scrollToId);
    if (mIndex >= 0) {
      console.log("✅ Found in Mantra List at index:", mIndex);
      setMantraIndex(mIndex);
      setSelectedMantra(true);
      console.log("✅ Set selectedMantra to TRUE");
      // Uncheck others to focus on this item
      setSelectedSankalp(false);
      setSelectedPractice(false);
      console.log("✅ Unchecked other items (Sankalp, Practice)");
      return;
    }

    // 2. Check Sankalp List
    const sIndex = sankalpList.findIndex((x) => x.id === scrollToId);
    if (sIndex >= 0) {
      console.log("✅ Found in Sankalp List at index:", sIndex);
      console.log("📋 Sankalp details:", sankalpList[sIndex]);
      setSankalpIndex(sIndex);
      setSelectedSankalp(true);
      console.log("✅ Called setSelectedSankalp(true)");
      // Uncheck others
      setSelectedMantra(false);
      setSelectedPractice(false);
      console.log("✅ Unchecked other items (Mantra, Practice)");
      return;
    }

    // 3. Check Practice List
    const pIndex = practiceList.findIndex((x) => x.id === scrollToId);
    if (pIndex >= 0) {
      console.log("✅ Found in Practice List at index:", pIndex);
      setPracticeIndex(pIndex);
      setSelectedPractice(true);
      console.log("✅ Set selectedPractice to TRUE");
      // Uncheck others
      setSelectedMantra(false);
      setSelectedSankalp(false);
      console.log("✅ Unchecked other items (Mantra, Sankalp)");
      return;
    }

    console.log("❌ scrollToId not found in any list:", scrollToId);
  }, [scrollToId, mantraList.length, sankalpList.length, practiceList.length]);

  // Debug: Log when selection states change
  useEffect(() => {
    console.log("🎯 Selection states changed:", { 
      selectedMantra, 
      selectedSankalp, 
      selectedPractice 
    });
  }, [selectedMantra, selectedSankalp, selectedPractice]);

  console.log(
    "ACTIVE API PRACTICES >>>>",
    JSON.stringify(dailyPractice?.data?.active_practices)
  );

  const buildFinalPractices = () => {
  const selectedPractices = buildPayload().practices || [];

  const normalizedActive = activeApiPractices.map(normalizeApiPractice);

  const filteredSelected = selectedPractices.filter(
    (sp) => !normalizedActive.some(
      (ap) => ap.practice_id === sp.practice_id
    )
  );

  return [...normalizedActive, ...filteredSelected];
};





  return (
    <View style={styles.container}>
      {/* <ImageBackground
                        source={require("../../../assets/Tracker_BG.png")}
                        style={{
                          flex: 1,
                          width: FontSize.CONSTS.DEVICE_WIDTH,
                          alignSelf: "center",
                          justifyContent: "flex-start",
                        }}
                        imageStyle={{
                          borderTopLeftRadius: 16,
                          borderTopRightRadius: 16,
                        }}
                      > */}
      <Header />

      {/* HEADER + CART ICON - FIXED AT TOP */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginHorizontal: 16,
          marginTop: 4,
          paddingVertical: 8,
          backgroundColor: "#FFFFFF",
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            padding: 6,
            marginTop: 6,
            zIndex: 100,
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>

        {/* TITLE */}
        <TextComponent
          type="loginHeaderText"
          style={{
            color: Colors.Colors.Daily_black,
            flex: 1,
            textAlign: "center",
            marginLeft: -32, // keeps centered
          }}
        >
          {categoryItem ? t(`dailyPracticeList.categories.${categoryItem.key}.name`) : t("dailyPracticeSelectList.dailyRoutine")}
        </TextComponent>
      </View>

      <ScrollView
        nestedScrollEnabled={true}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
      {/* ⭐ GLOBAL CART MODAL */}
      <CartModal
        onConfirm={async (list) => {
          try {
            setLoading(true);

            const token = await AsyncStorage.getItem("refresh_token");

            const payload = {
              practices: list,
              dharma_level: "beginner",
              is_authenticated: true,
              recaptcha_token: token,
            };

            console.log("DAILY PRACTICE LIST CART SUBMIT:", JSON.stringify(payload));

            return new Promise<void>((resolve) => {
              dispatch(
                submitDailyDharmaSetup(payload, (res) => {
                  setLoading(false);

                  if (res.success) {
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

      {/* DESCRIPTION */}
      <TextComponent
        type="streakSadanaText"
        style={{ marginVertical: 2, alignSelf: "center" }}
      >
        {categoryItem ? t(`dailyPracticeList.categories.${categoryItem.key}.description`) : ""}
      </TextComponent>
<TextComponent type="subDailyText" style={{marginHorizontal:16,marginVertical:6}}>{t('dailyPracticeSelectList.tapCard')}</TextComponent>
      {/* CARD WITH ALL PRACTICES */}
      {/* <Card style={styles.card2}> */}
        <View style={{ marginHorizontal:16 }}>
          {/* MANTRA CARD */}
         {mantraList.length > 0 &&
  (!resumedSelections || selectedMantra) && (
            <DailyPracticeMantraCard
              data={{
    ...mantraList[mantraIndex],
    reps: resumedMantra?.reps ?? mantraReps,
    day: resumedMantra?.day,
  }}
              // data={mantraList[mantraIndex]}
              onChange={isLocked ? undefined : nextMantra}
              tag="Mantra"
              showIcons={!isLocked}
              isSelected={selectedMantra}
              onToggleSelect={() => setSelectedMantra(!selectedMantra)}
              onPress={() =>
                navigation.navigate("DailyPracticeDetailSelectedPractice", {
                  item: categoryItem,
                  selectedType: "mantra",
                  fullList: mantraList,
                  startingIndex: mantraIndex,
                  onUpdateSelection: (i, reps) => {
                    setMantraIndex(i);
                    setMantraReps(reps);
                  },
                  isLocked,
                })
              }
            />
          )}

          {/* SANKALP CARD */}
        {sankalpList.length > 0 &&
  (!resumedSelections || selectedSankalp) && (
            <DailyPracticeMantraCard
              data={{
    ...sankalpList[sankalpIndex],
    day: resumedSankalp?.day ,
  }}
              // data={sankalpList[sankalpIndex]}
              onChange={isLocked ? undefined : nextSankalp}
              tag="Sankalp"
              showIcons={!isLocked}
              isSelected={selectedSankalp}
              onToggleSelect={() => setSelectedSankalp(!selectedSankalp)}
              onPress={() =>
                navigation.navigate("DailyPracticeDetailSelectedPractice", {
                  item: categoryItem,
                  selectedType: "sankalp",
                  fullList: sankalpList,
                  startingIndex: sankalpIndex,
                  onUpdateSelection: (i) => setSankalpIndex(i),
                  isLocked,
                })
              }
            />
          )}

          {/* PRACTICE CARD */}
       {practiceList.length > 0 &&
  (!resumedSelections || selectedPractice) && (
            <DailyPracticeMantraCard
             data={{
    ...practiceList[practiceIndex],
    reps: resumedPractice?.reps,
    day: resumedPractice?.day,
  }}
              // data={practiceList[practiceIndex]}
              onChange={isLocked ? undefined : nextPractice}
              tag="Practice"
              showIcons={!isLocked}
              isSelected={selectedPractice}
              onToggleSelect={() => setSelectedPractice(!selectedPractice)}
              onPress={() =>
                navigation.navigate("DailyPracticeDetailSelectedPractice", {
                  item: categoryItem,
                  selectedType: "practice",
                  fullList: practiceList,
                  startingIndex: practiceIndex,
                  onUpdateSelection: (i) => setPracticeIndex(i),
                  isLocked,
                })
              }
            />
          )}
        </View>
      {/* </Card> */}

      {/* SUBMIT BUTTON — ORIGINAL FLOW */}
      <LoadingButton
        loading={false}
        text={isLocked ? t("common.confirm") : t("dailyPracticeSelectList.setMyPlan")}
        onPress={async () => {
  // 1️⃣ First click → Go directly to ConfirmDailyPractices
  if (!isLocked) {
    const payload = buildPayload();

    navigation.navigate("ConfirmDailyPractices", {
      practices: payload.practices,
      categoryItem,
      title: categoryItem ? t(`dailyPracticeList.categories.${categoryItem.key}.name`) : t('dailyPracticeSelectList.dailyRoutine'),
      description: categoryItem ? t(`dailyPracticeList.categories.${categoryItem.key}.description`) : "",
      growth: true,
    });

    return;
  }

  // 2️⃣ If locked → Submit API
  const finalPractices = buildFinalPractices(); // ✅ array (active + selected)

  const token = await AsyncStorage.getItem("access_token");

  // 🔐 Not logged in → store FULL payload
  if (!isUserLoggedIn) {
    const payload = {
      practices: finalPractices,
      is_authenticated: true,
      recaptcha_token: "not_available",
    };
    console.log("📦 Storing pending payload:", JSON.stringify(payload));
    setPendingSubmitPayload(payload);
    setShowAuthModal(true);
    return;
  }

  // ✅ Logged in → FINAL API PAYLOAD
  const payload = {
    practices: finalPractices, // ✅ active API + selected
    is_authenticated: true,
    recaptcha_token: token,
  };
console.log("payload >>>>>>",JSON.stringify(payload));
  dispatch(
    submitDailyDharmaSetup(payload, (res) => {
      if (res.success) {
        navigation.navigate("TrackerTabs", { screen: "Tracker", fromSetup: true });
      }
    })
  );
}}

        // text={route?.params?.resumedSelections ? "Submit" : isLocked ? "Confirm" : "Set my plan"}
//         onPress={async () => {

//   // 1️⃣ First click → Go directly to ConfirmDailyPractices
//   if (!isLocked) {
//     const payload = buildPayload();

//     navigation.navigate("ConfirmDailyPractices", {
//       practices: payload.practices,
//       categoryItem,
//       title: categoryItem?.name,
//       description: categoryItem?.description,
//       growth: true,
//     });

//     return;
//   }

//   // 2️⃣ If locked → Submit API
//   const payload = buildFinalPractices();

//   const token = await AsyncStorage.getItem("access_token");
//   if (!token) {
//     await AsyncStorage.setItem(
//       "pending_daily_practice_data",
//       JSON.stringify({
//         payload,
//         categoryItem,
//         isLocked: true,
//       })
//     );

//     navigation.navigate("Login", {
//       redirect_to: "DailyPracticeSelectList",
//       categoryItem,
//       isLocked: true,
//     });

//     return;
//   }

//   dispatch(
//     submitDailyDharmaSetup(payload, (res) => {
//       if (res.success) {
//         navigation.navigate("TrackerTabs", { screen: "Tracker" });
//       }
//     })
//   );

// }}

        // text={isLocked ? "Confirm" : "Set my plan"}
  //       onPress={async () => {
  //         // First click → lock selection
  //         if (!isLocked) {
  //           navigation.setParams({ isLocked: true });
  //           return;
  //         }

  //         // Build selected items
  //         const payload = buildPayload();

  //         // Check if logged in
  //         const token = await AsyncStorage.getItem("access_token");
  //         if (!token) {
  //           await AsyncStorage.setItem(
  //             "pending_daily_practice_data",
  //             JSON.stringify({
  //               payload,
  //               categoryItem,
  //               isLocked: true,
  //             })
  //           );

  //           navigation.navigate("Login", {
  //             redirect_to: "DailyPracticeSelectList",
  //             categoryItem,
  //             isLocked: true,
  //           });

  //           return;
  //         }

  //         // Proceed to confirm screen
  //         navigation.navigate("ConfirmDailyPractices", {
  //           practices: payload.practices,
  //           categoryItem,
  //             title: categoryItem?.name,
  // description: categoryItem?.description,
  // growth: true,
  //         });
  //       }}
        style={styles.button}
        textStyle={styles.buttonText}
        showGlobalLoader={true}
      />
<TextComponent type="subDailyText" style={{textAlign:"center",marginTop:10}}>{t('dailyPracticeSelectList.routineFor')}<TextComponent type="boldText" style={{color:"#000000"}}>{categoryItem ? t(`dailyPracticeList.categories.${categoryItem.key}.name`) : t('dailyPracticeSelectList.dailyRoutine')}</TextComponent></TextComponent>
      <LoadingOverlay visible={loading} text={t('common.submitting')} />
      </ScrollView>
      
      <CommunityAuthModal
        visible={showAuthModal}
        onClose={() => {
          // Just close the modal - useEffect will handle submission and cleanup
          setShowAuthModal(false);
        }}
        title={t("dailyPracticeSelectList.authTitle", { defaultValue: "Save Your Daily Practice" })}
        description={t("dailyPracticeSelectList.authDescription", { defaultValue: "Create an account" })}
        benefits={[
          t("dailyPracticeSelectList.authBenefit1", { defaultValue: "Save your practice routine" }),
          t("dailyPracticeSelectList.authBenefit2", { defaultValue: "Track your progress" }),

        ]}
      />
      
      {/* </ImageBackground> */}
    </View>
  );
};

export default DailyPracticeSelectList;





// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import { AnyAction } from "@reduxjs/toolkit";
// import { useEffect, useMemo, useState } from "react";
// import { useTranslation } from "react-i18next";
// import { Image, TouchableOpacity, View } from "react-native";
// import { Card } from "react-native-paper";
// import { useDispatch } from "react-redux";
// import { ThunkDispatch } from "redux-thunk";

// import Colors from "../../components/Colors";
// import DailyPracticeMantraCard from "../../components/DailyPracticeMantraCard";
// import FontSize from "../../components/FontSize";
// import Header from "../../components/Header";
// import LoadingButton from "../../components/LoadingButton";
// import LoadingOverlay from "../../components/LoadingOverlay";
// import TextComponent from "../../components/TextComponent";
// import i18n from "../../config/i18n";
// import { RootState } from "../../store";
// import { submitDailyDharmaSetup } from "../Home/actions";
// import styles from "./DailyPracticeSelectListStyles";

// const backIcon = require("../../../assets/C_Arrow_back.png");

// const DailyPracticeSelectList = ({ route }) => {
//   const navigation: any = useNavigation();
//   const { t } = useTranslation();
//   const [loading, setLoading] = useState(false);
//   const [mantraReps, setMantraReps] = useState(null);

//   const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

//   // ⚡ Restore resume data (only metadata)
//   const resumeData = route?.params?.resumeData ?? null;

//   const categoryItem =
//     route?.params?.item ??
//     resumeData?.categoryItem ??
//     null;

//   const isLocked =
//     route?.params?.isLocked ??
//     resumeData?.isLocked ??
//     false;

//   const selectedCategory = categoryItem?.key;
//   const allData = i18n.getResourceBundle(i18n.language, "translation");

//   // ------------------------------------------------------
//   // AUTO SUBMIT (when returning from Login)
//   // ------------------------------------------------------
//   useEffect(() => {
//     const restoreAndSubmit = async () => {
//       let pending = await AsyncStorage.getItem("pending_daily_practice_data");

//       if (!pending && route?.params?.resumeData) {
//         pending = JSON.stringify(route.params.resumeData);
//       }

//       if (!pending) return;

//       const { payload } = JSON.parse(pending);

//       await AsyncStorage.removeItem("pending_daily_practice_data");
//       setLoading(true);

//       dispatch(
//         submitDailyDharmaSetup(payload, (res) => {
//           setLoading(false);
//           if (res.success) {
//             navigation.navigate("TrackerTabs", { screen: "Tracker" });
//           }
//         })
//       );
//     };

//     restoreAndSubmit();
//   }, []);

//   // ------------------------------------------------------
//   // LOAD LISTS
//   // ------------------------------------------------------
//   const mantraList: any[] = useMemo(() => {
//     if (!selectedCategory) return [];
//     return Object.values(allData).filter(
//       (item: any) =>
//         item?.category === selectedCategory &&
//         item?.id?.startsWith("mantra.")
//     );
//   }, [selectedCategory]);

//   const sankalpList: any[] = useMemo(() => {
//     if (!selectedCategory) return [];
//     return Object.values(allData).filter(
//       (item: any) =>
//         item?.category === selectedCategory &&
//         item?.id?.startsWith("sankalp.")
//     );
//   }, [selectedCategory]);

//   const practiceList: any[] = useMemo(() => {
//     if (!selectedCategory) return [];
//     return Object.values(allData).filter(
//       (item: any) =>
//         item?.category === selectedCategory &&
//         item?.id?.startsWith("practice.")
//     );
//   }, [selectedCategory]);

//   // ------------------------------------------------------
//   // CHECKBOX STATE (NEW)
//   // ------------------------------------------------------
//   const [selectedMantra, setSelectedMantra] = useState(true);
//   const [selectedSankalp, setSelectedSankalp] = useState(true);
//   const [selectedPractice, setSelectedPractice] = useState(true);

//   // ------------------------------------------------------
//   // ROTATING INDEXES
//   // ------------------------------------------------------
//   const [mantraIndex, setMantraIndex] = useState(0);
//   const [sankalpIndex, setSankalpIndex] = useState(0);
//   const [practiceIndex, setPracticeIndex] = useState(0);

//   const nextMantra = () =>
//     setMantraIndex((prev) => (prev + 1) % mantraList.length);
//   const nextSankalp = () =>
//     setSankalpIndex((prev) => (prev + 1) % sankalpList.length);
//   const nextPractice = () =>
//     setPracticeIndex((prev) => (prev + 1) % practiceList.length);

//   // ------------------------------------------------------
//   // BUILD PAYLOAD (WITH CHECKBOX LOGIC)
//   // ------------------------------------------------------
//   const buildPayload = () => {
//     const selectedItems = [
//       selectedMantra && mantraList[mantraIndex]
//         ? { ...mantraList[mantraIndex], reps: mantraReps }
//         : null,

//       selectedSankalp && sankalpList[sankalpIndex]
//         ? sankalpList[sankalpIndex]
//         : null,

//       selectedPractice && practiceList[practiceIndex]
//         ? practiceList[practiceIndex]
//         : null,
//     ].filter(Boolean);

//     const practices = selectedItems.map((p: any) => {
//       const source = p.id.startsWith("mantra.")
//         ? "mantra"
//         : p.id.startsWith("sankalp.")
//         ? "sankalp"
//         : "practice";

//       return {
//         practice_id: p.id,
//         source,
//         category: categoryItem?.name ?? "",
//         name: p.title,
//         description: p.description || p.summary || p.meaning || "",
//         benefits: p.benefits || [],
//         ...(source === "mantra" && p.reps ? { reps: p.reps } : {}),
//       };
//     });

//     return {
//       practices,
//       is_authenticated: true,
//       recaptcha_token: "not_available",
//     };
//   };

//   // ------------------------------------------------------
//   // UI
//   // ------------------------------------------------------
//   return (
//     <View style={styles.container}>
//       <Header />

//       <View style={{ marginHorizontal: 16 }}>
//         <TouchableOpacity
//           onPress={() => navigation.navigate("DailyPracticeList")}
//         >
//           <Image source={backIcon} style={styles.backIcon} resizeMode="contain" />
//         </TouchableOpacity>

//         <TextComponent
//           type="loginHeaderText"
//           style={{
//             marginTop: -15,
//             color: Colors.Colors.Daily_black,
//             alignSelf: "center",
//           }}
//         >
//           {categoryItem?.name ?? "Daily Routine"}
//         </TextComponent>

//         <TextComponent
//           type="streakSadanaText"
//           style={{ marginVertical: 6, alignSelf: "center" }}
//         >
//           {categoryItem?.description ?? ""}
//         </TextComponent>
//       </View>

//       <Card style={styles.card2}>
//         <View style={{ width: FontSize.CONSTS.DEVICE_WIDTH * 0.82 }}>

//           {/* ---------------------- */}
//           {/* MANTRA CARD */}
//           {/* ---------------------- */}
//           {mantraList.length > 0 && (
//             <DailyPracticeMantraCard
//               data={mantraList[mantraIndex]}
//               onChange={isLocked ? undefined : nextMantra}
//               tag="Mantra"
//               showIcons={!isLocked}

//               // ✔ Checkbox
//               isSelected={selectedMantra}
//               onToggleSelect={() => setSelectedMantra(!selectedMantra)}

//               onPress={() =>
//                 navigation.navigate("DailyPracticeDetailSelectedPractice", {
//                   item: categoryItem,
//                   selectedType: "mantra",
//                   fullList: mantraList,
//                   startingIndex: mantraIndex,
//                   onUpdateSelection: (i, reps) => {
//                     setMantraIndex(i);
//                     setMantraReps(reps);
//                   },
//                   isLocked,
//                 })
//               }
//             />
//           )}

//           {/* ---------------------- */}
//           {/* SANKALP CARD */}
//           {/* ---------------------- */}
//           {sankalpList.length > 0 && (
//             <DailyPracticeMantraCard
//               data={sankalpList[sankalpIndex]}
//               onChange={isLocked ? undefined : nextSankalp}
//               tag="Sankalp"
//               showIcons={!isLocked}

//               // ✔ Checkbox
//               isSelected={selectedSankalp}
//               onToggleSelect={() => setSelectedSankalp(!selectedSankalp)}

//               onPress={() =>
//                 navigation.navigate("DailyPracticeDetailSelectedPractice", {
//                   item: categoryItem,
//                   selectedType: "sankalp",
//                   fullList: sankalpList,
//                   startingIndex: sankalpIndex,
//                   onUpdateSelection: (i) => setSankalpIndex(i),
//                   isLocked,
//                 })
//               }
//             />
//           )}

//           {/* ---------------------- */}
//           {/* PRACTICE CARD */}
//           {/* ---------------------- */}
//           {practiceList.length > 0 && (
//             <DailyPracticeMantraCard
//               data={practiceList[practiceIndex]}
//               onChange={isLocked ? undefined : nextPractice}
//               tag="Practice"
//               showIcons={!isLocked}

//               // ✔ Checkbox
//               isSelected={selectedPractice}
//               onToggleSelect={() => setSelectedPractice(!selectedPractice)}

//               onPress={() =>
//                 navigation.navigate("DailyPracticeDetailSelectedPractice", {
//                   item: categoryItem,
//                   selectedType: "practice",
//                   fullList: practiceList,
//                   startingIndex: practiceIndex,
//                   onUpdateSelection: (i) => setPracticeIndex(i),
//                   isLocked,
//                 })
//               }
//             />
//           )}
//         </View>
//       </Card>

//       {/* ---------------------- */}
//       {/* SUBMIT → LOCK → CONFIRM */}
//       {/* ---------------------- */}
//       {/* <LoadingButton
//         loading={false}
//         text={isLocked ? "Confirm" : "Submit"}
//         onPress={async () => {
//           if (!isLocked) {
//             navigation.setParams({ isLocked: true });
//             return;
//           }

//           const payload = buildPayload();
//           const token = await AsyncStorage.getItem("access_token");

//           if (!token) {
//             await AsyncStorage.setItem(
//               "pending_daily_practice_data",
//               JSON.stringify({
//                 payload,
//                 categoryItem,
//                 isLocked: true,
//               })
//             );

//             navigation.navigate("Login", {
//               redirect_to: "DailyPracticeSelectList",
//               categoryItem,
//               isLocked: true,
//             });

//             return;
//           }

//           setLoading(true);
//           dispatch(
//             submitDailyDharmaSetup(payload, (res) => {
//               setLoading(false);
//               if (res.success) {
//                 navigation.navigate("TrackerTabs", { screen: "Tracker" });
//               }
//             })
//           );
//         }}
//         style={styles.button}
//         textStyle={styles.buttonText}
//         showGlobalLoader={true}
//       /> */}
// <LoadingButton
//   loading={false}
//   text={isLocked ? "Confirm" : "Submit"}
//   onPress={async () => {

//     // 1️⃣ First click → lock selection
//     if (!isLocked) {
//       navigation.setParams({ isLocked: true });
//       return;
//     }

//     // 2️⃣ Build list of selected practices
//     const payload = buildPayload();

//     // 3️⃣ Check login, if not logged in → store & go to Login
//     const token = await AsyncStorage.getItem("access_token");
//     if (!token) {
//       await AsyncStorage.setItem(
//         "pending_daily_practice_data",
//         JSON.stringify({
//           payload,
//           categoryItem,
//           isLocked: true,
//         })
//       );

//       navigation.navigate("Login", {
//         redirect_to: "DailyPracticeSelectList",
//         categoryItem,
//         isLocked: true,
//       });

//       return;
//     }

//     // 4️⃣ Now navigate to ConfirmDailyPractices (NO API call here)
//     navigation.navigate("ConfirmDailyPractices", {
//       practices: payload.practices,   // pass final 1–3 items
//       categoryItem,
//     });
//   }}
//   style={styles.button}
//   textStyle={styles.buttonText}
//   showGlobalLoader={true}
// />

//       <LoadingOverlay visible={loading} text="Submitting..." />
//     </View>
//   );
// };

// export default DailyPracticeSelectList;











// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import { AnyAction } from "@reduxjs/toolkit";
// import { useEffect, useMemo, useState } from "react";
// import { useTranslation } from "react-i18next";
// import { Image, TouchableOpacity, View } from "react-native";
// import { Card } from "react-native-paper";
// import { useDispatch } from "react-redux";
// import { ThunkDispatch } from "redux-thunk";
// import Colors from "../../components/Colors";
// import DailyPracticeMantraCard from "../../components/DailyPracticeMantraCard";
// import FontSize from "../../components/FontSize";
// import Header from "../../components/Header";
// import LoadingButton from "../../components/LoadingButton";
// import LoadingOverlay from "../../components/LoadingOverlay";
// import TextComponent from "../../components/TextComponent";
// import i18n from "../../config/i18n";
// import { RootState } from "../../store";
// import { submitDailyDharmaSetup } from "../Home/actions";
// import styles from "./DailyPracticeSelectListStyles";

// const backIcon = require("../../../assets/C_Arrow_back.png");

// const DailyPracticeSelectList = ({ route }) => {
//   const navigation: any = useNavigation();
//   const { t } = useTranslation();
//   const [loading, setLoading] = useState(false);
//   const [mantraReps, setMantraReps] = useState(null);

//   const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

//   const resumeData = route?.params?.resumeData ?? null;


//   const categoryItem =
//     route?.params?.item ??
//     resumeData?.categoryItem ??
//     null;

//   const isLocked =
//     route?.params?.isLocked ??
//     resumeData?.isLocked ??
//     false;

//   if (!categoryItem) {
//     console.log("⚠️ categoryItem missing → fallback");
//   }

//   const selectedCategory = categoryItem?.key;
//   const allData = i18n.getResourceBundle(i18n.language, "translation");

 

//   useEffect(() => {
//   const restoreAndSubmit = async () => {
//     let pending = await AsyncStorage.getItem("pending_daily_practice_data");

//     if (!pending && route?.params?.resumeData) {
//       pending = JSON.stringify(route.params.resumeData);
//     }

//     if (!pending) return;
//     const { payload } = JSON.parse(pending);
//     await AsyncStorage.removeItem("pending_daily_practice_data");
//     console.log("🚀 Auto-submitting Daily Practice:", payload);
//     setLoading(true);

//     dispatch(
//       submitDailyDharmaSetup(payload, (res) => {
//         setLoading(false);
//         if (res.success) {
//           navigation.navigate("TrackerTabs", { screen: "Tracker" });
//         } else {
//           console.log("❌ Auto-submit failed:", res.error);
//         }
//       })
//     );
//   };

//   restoreAndSubmit();
// }, []);


//   const mantraList : any= useMemo(() => {
//     if (!selectedCategory) return [];
//     return Object.values(allData).filter(
//       (item: any) =>
//         item?.category === selectedCategory &&
//         item?.id?.startsWith("mantra.")
//     );
//   }, [selectedCategory]);

//   const sankalpList = useMemo(() => {
//     if (!selectedCategory) return [];
//     return Object.values(allData).filter(
//       (item: any) =>
//         item?.category === selectedCategory &&
//         item?.id?.startsWith("sankalp.")
//     );
//   }, [selectedCategory]);

//   const practiceList = useMemo(() => {
//     if (!selectedCategory) return [];
//     return Object.values(allData).filter(
//       (item: any) =>
//         item?.category === selectedCategory &&
//         item?.id?.startsWith("practice.")
//     );
//   }, [selectedCategory]);

//   const [mantraIndex, setMantraIndex] = useState(0);
//   const [sankalpIndex, setSankalpIndex] = useState(0);
//   const [practiceIndex, setPracticeIndex] = useState(0);

//   const nextMantra = () => setMantraIndex((prev) => (prev + 1) % mantraList.length);
//   const nextSankalp = () => setSankalpIndex((prev) => (prev + 1) % sankalpList.length);
//   const nextPractice = () => setPracticeIndex((prev) => (prev + 1) % practiceList.length);

  

//   const buildPayload = () => {
//   const selectedItems = [
//     mantraList[mantraIndex]
//       ? { ...mantraList[mantraIndex], reps: mantraReps }
//       : null,

//     sankalpList[sankalpIndex] || null,
//     practiceList[practiceIndex] || null,
//   ].filter(Boolean);

//   const practices = selectedItems.map((p: any) => {
//     const source = p.id.startsWith("mantra.")
//       ? "mantra"
//       : p.id.startsWith("sankalp.")
//       ? "sankalp"
//       : "practice";

//     return {
//       practice_id: p.id,
//       source,
//       category: categoryItem?.name ?? "",
//       name: p.title,
//       description: p.description || p.summary || p.meaning || "",
//       benefits: p.benefits || [],

//       // ✔ add reps only if mantra
//       ...(source === "mantra" && p.reps ? { reps: p.reps } : {}),
//     };
//   });

//   return {
//     practices,
//     is_authenticated: true,
//     recaptcha_token: "not_available",
//   };
// };


//   return (
//     <View style={styles.container}>
//       <Header />

//       <View style={{ marginHorizontal: 16 }}>
//         <TouchableOpacity onPress={() => navigation.navigate("DailyPracticeList")}>
//           <Image source={backIcon} style={styles.backIcon} resizeMode="contain" />
//         </TouchableOpacity>

//         <TextComponent
//           type="loginHeaderText"
//           style={{
//             marginTop: -15,
//             color: Colors.Colors.Daily_black,
//             alignSelf: "center",
//           }}
//         >
//           {categoryItem?.name ?? "Daily Routine"}
//         </TextComponent>

//         <TextComponent
//           type="streakSadanaText"
//           style={{ marginVertical: 6, alignSelf: "center" }}
//         >
//           {categoryItem?.description ?? ""}
//         </TextComponent>
//       </View>

//       <Card style={styles.card2}>
//         <View style={{ width: FontSize.CONSTS.DEVICE_WIDTH * 0.82 }}>

//           {/* Mantra */}
//           {mantraList.length > 0 && (
//             <DailyPracticeMantraCard
//               data={mantraList[mantraIndex]}
//               onChange={isLocked ? undefined : nextMantra}
//               tag="Mantra"
//               showIcons={!isLocked}
//               onPress={() =>
//                 navigation.navigate("DailyPracticeDetailSelectedPractice", {
//                   item: categoryItem,
//                   selectedType: "mantra",
//                   fullList: mantraList,
//                   startingIndex: mantraIndex,
//                onUpdateSelection: (i, reps) => {
//   setMantraIndex(i);
//   setMantraReps(reps);   // ⬅️ NEW
// },
//                   isLocked,
//                 })
//               }
//             />
//           )}

//           {/* Sankalp */}
//           {sankalpList.length > 0 && (
//             <DailyPracticeMantraCard
//               data={sankalpList[sankalpIndex]}
//               onChange={isLocked ? undefined : nextSankalp}
//               tag="Sankalp"
//               showIcons={!isLocked}
//               onPress={() =>
//                 navigation.navigate("DailyPracticeDetailSelectedPractice", {
//                   item: categoryItem,
//                   selectedType: "sankalp",
//                   fullList: sankalpList,
//                   startingIndex: sankalpIndex,
//                   onUpdateSelection: (i) => setSankalpIndex(i),
//                   isLocked,
//                 })
//               }
//             />
//           )}

//           {/* Practice */}
//           {practiceList.length > 0 && (
//             <DailyPracticeMantraCard
//               data={practiceList[practiceIndex]}
//               onChange={isLocked ? undefined : nextPractice}
//               tag="Practice"
//               showIcons={!isLocked}
//               onPress={() =>
//                 navigation.navigate("DailyPracticeDetailSelectedPractice", {
//                   item: categoryItem,
//                   selectedType: "practice",
//                   fullList: practiceList,
//                   startingIndex: practiceIndex,
//                   onUpdateSelection: (i) => setPracticeIndex(i),
//                   isLocked,
//                 })
//               }
//             />
//           )}
//         </View>
//       </Card>

//       {/* SUBMIT BUTTON */}
//       <LoadingButton
//         loading={false}
//         text={isLocked ? "Confirm" : "Submit"}
//         onPress={async () => {
//           if (!isLocked) {
//             navigation.setParams({ isLocked: true });
//             return;
//           }

//           const payload = buildPayload();
//           const token = await AsyncStorage.getItem("access_token");
// console.log("🚀 FINAL PAYLOAD:", payload);
//           if (!token) {
//             await AsyncStorage.setItem(
//               "pending_daily_practice_data",
//               JSON.stringify({
//                 payload,
//                 categoryItem,
//                 isLocked: true,
//               })
//             );

//             navigation.navigate("Login", {
//               redirect_to: "DailyPracticeSelectList",
//               categoryItem,
//               isLocked: true,
//             });

//             return;
//           }

//           setLoading(true);
//           dispatch(
//             submitDailyDharmaSetup(payload, (res) => {
//               setLoading(false);
//               if (res.success) {
//                 navigation.navigate("TrackerTabs", { screen: "Tracker" });
//               } else {
//                 console.log("❌ Error:", res.error);
//               }
//             })
//           );
//         }}
//         style={styles.button}
//         textStyle={styles.buttonText}
//         showGlobalLoader={true}
//       />

//       <LoadingOverlay visible={loading} text="Submitting..." />
//     </View>
//   );
// };

// export default DailyPracticeSelectList;
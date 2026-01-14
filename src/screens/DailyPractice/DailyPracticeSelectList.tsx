import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";

import CartModal from "../../components/CartModal"; // ⭐ ADDED
import Colors from "../../components/Colors";
import DailyPracticeMantraCard from "../../components/DailyPracticeMantraCard";
import Header from "../../components/Header";
import LoadingButton from "../../components/LoadingButton";
import LoadingOverlay from "../../components/LoadingOverlay";
import TextComponent from "../../components/TextComponent";
import { useCart } from "../../context/CartContext"; // ⭐ ADDED

import moment from "moment";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useUserLocation } from "../../components/useUserLocation";
import i18n from "../../config/i18n";
import { RootState } from "../../store";
import { submitDailyDharmaSetup } from "../Home/actions";
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

  const resumedSelections = route?.params?.resumedSelections ?? null;

  console.log("resumedSelections >>>>>",resumedSelections);

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
  practiceList.length
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
  // 🟢 NORMAL FLOW → select all
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
]);

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
  if (!token) {
    await AsyncStorage.setItem(
      "pending_daily_practice_data",
      JSON.stringify({
        payload: {
          practices: finalPractices,
          is_authenticated: true,
          recaptcha_token: "not_available",
        },
        categoryItem,
        isLocked: true,
      })
    );

    navigation.navigate("Login", {
      redirect_to: "DailyPracticeSelectList",
      categoryItem,
      isLocked: true,
    });

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
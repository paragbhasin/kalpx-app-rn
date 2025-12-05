import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, TouchableOpacity, View } from "react-native";
import { Card } from "react-native-paper";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import Colors from "../../components/Colors";
import DailyPracticeMantraCard from "../../components/DailyPracticeMantraCard";
import FontSize from "../../components/FontSize";
import Header from "../../components/Header";
import LoadingButton from "../../components/LoadingButton";
import LoadingOverlay from "../../components/LoadingOverlay";
import TextComponent from "../../components/TextComponent";
import i18n from "../../config/i18n";
import { RootState } from "../../store";
import { submitDailyDharmaSetup } from "../Home/actions";
import styles from "./DailyPracticeSelectListStyles";

const backIcon = require("../../../assets/C_Arrow_back.png");

const DailyPracticeSelectList = ({ route }) => {
  const navigation: any = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [mantraReps, setMantraReps] = useState(null);

  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  // ---------------------------------------------------
  // 🔥 STEP 1: SAFELY READ ALL POSSIBLE PARAM SOURCES
  // ---------------------------------------------------

  const resumeData = route?.params?.resumeData ?? null;

  // Primary → from normal navigation
  // Secondary → from resumeData
  const categoryItem =
    route?.params?.item ??
    resumeData?.categoryItem ??
    null;

  const isLocked =
    route?.params?.isLocked ??
    resumeData?.isLocked ??
    false;

  // If still no categoryItem → avoid blank → force fallback
  if (!categoryItem) {
    console.log("⚠️ categoryItem missing → fallback");
  }

  const selectedCategory = categoryItem?.key;
  const allData = i18n.getResourceBundle(i18n.language, "translation");

  // ---------------------------------------------------
  // 🔥 STEP 2: AUTO SUBMIT IF RETURNING FROM LOGIN
  // ---------------------------------------------------

  // useEffect(() => {
  //   const checkPendingDailyPractice = async () => {
  //     const pending = await AsyncStorage.getItem("pending_daily_practice_data");
  //     if (pending) {
  //       console.log("📥 Found pending daily practice data");
  //       await AsyncStorage.removeItem("pending_daily_practice_data");

  //       const { payload } = JSON.parse(pending);

  //       console.log("🚀 Auto API call:", payload);

  //       setLoading(true);
  //       dispatch(
  //         submitDailyDharmaSetup(payload, (res) => {
  //           setLoading(false);

  //           if (res.success) {
  //             navigation.navigate("TrackerTabs", { screen: "Tracker" });
  //           } else {
  //             console.log("❌ Auto-submit failed:", res.error);
  //           }
  //         })
  //       );
  //     }
  //   };

  //   checkPendingDailyPractice();
  // }, []);

  useEffect(() => {
  const restoreAndSubmit = async () => {
    let pending = await AsyncStorage.getItem("pending_daily_practice_data");

    // 1️⃣ If no pending in storage, check route resumeData
    if (!pending && route?.params?.resumeData) {
      pending = JSON.stringify(route.params.resumeData);
    }

    if (!pending) return;

    const { payload } = JSON.parse(pending);

    // 2️⃣ Remove after using
    await AsyncStorage.removeItem("pending_daily_practice_data");

    // 3️⃣ Submit automatically
    console.log("🚀 Auto-submitting Daily Practice:", payload);
    setLoading(true);

    dispatch(
      submitDailyDharmaSetup(payload, (res) => {
        setLoading(false);
        if (res.success) {
          navigation.navigate("TrackerTabs", { screen: "Tracker" });
        } else {
          console.log("❌ Auto-submit failed:", res.error);
        }
      })
    );
  };

  restoreAndSubmit();
}, []);


  // ---------------------------------------------------
  // 🔥 STEP 3: FILTER LISTS ONLY IF CATEGORY EXISTS
  // ---------------------------------------------------

  const mantraList : any= useMemo(() => {
    if (!selectedCategory) return [];
    return Object.values(allData).filter(
      (item: any) =>
        item?.category === selectedCategory &&
        item?.id?.startsWith("mantra.")
    );
  }, [selectedCategory]);

  const sankalpList = useMemo(() => {
    if (!selectedCategory) return [];
    return Object.values(allData).filter(
      (item: any) =>
        item?.category === selectedCategory &&
        item?.id?.startsWith("sankalp.")
    );
  }, [selectedCategory]);

  const practiceList = useMemo(() => {
    if (!selectedCategory) return [];
    return Object.values(allData).filter(
      (item: any) =>
        item?.category === selectedCategory &&
        item?.id?.startsWith("practice.")
    );
  }, [selectedCategory]);

  // Rotating indexes
  const [mantraIndex, setMantraIndex] = useState(0);
  const [sankalpIndex, setSankalpIndex] = useState(0);
  const [practiceIndex, setPracticeIndex] = useState(0);

  const nextMantra = () => setMantraIndex((prev) => (prev + 1) % mantraList.length);
  const nextSankalp = () => setSankalpIndex((prev) => (prev + 1) % sankalpList.length);
  const nextPractice = () => setPracticeIndex((prev) => (prev + 1) % practiceList.length);

  // ---------------------------------------------------
  // 🔥 STEP 4: BUILD PAYLOAD
  // ---------------------------------------------------

  // const buildPayload = () => {
  //   const selectedItems = [
  //     mantraList[mantraIndex],
  //     sankalpList[sankalpIndex],
  //     practiceList[practiceIndex],
  //   ].filter(Boolean);

  //   const practices = selectedItems.map((p: any) => ({
  //     practice_id: p.id,
  //     source: p.id.startsWith("mantra.")
  //       ? "mantra"
  //       : p.id.startsWith("sankalp.")
  //       ? "sankalp"
  //       : "practice",
  //     category: categoryItem?.name ?? "",
  //     name: p.title,
  //     description: p.description || p.summary || p.meaning || "",
  //     benefits: p.benefits || [],
  //     ...(p.id.startsWith("mantra.") && p.reps
  // ? { reps: p.reps }
  // : {}),
  //   }));

  //   return {
  //     practices,
  //     is_authenticated: true,
  //     recaptcha_token: "not_available",
  //   };
  // };

  const buildPayload = () => {
  const selectedItems = [
    mantraList[mantraIndex]
      ? { ...mantraList[mantraIndex], reps: mantraReps }
      : null,

    sankalpList[sankalpIndex] || null,
    practiceList[practiceIndex] || null,
  ].filter(Boolean);

  const practices = selectedItems.map((p: any) => {
    const source = p.id.startsWith("mantra.")
      ? "mantra"
      : p.id.startsWith("sankalp.")
      ? "sankalp"
      : "practice";

    return {
      practice_id: p.id,
      source,
      category: categoryItem?.name ?? "",
      name: p.title,
      description: p.description || p.summary || p.meaning || "",
      benefits: p.benefits || [],

      // ✔ add reps only if mantra
      ...(source === "mantra" && p.reps ? { reps: p.reps } : {}),
    };
  });

  return {
    practices,
    is_authenticated: true,
    recaptcha_token: "not_available",
  };
};


  // ---------------------------------------------------
  // 🔥 STEP 5: RENDER UI
  // ---------------------------------------------------

  return (
    <View style={styles.container}>
      <Header />

      <View style={{ marginHorizontal: 16 }}>
        <TouchableOpacity onPress={() => navigation.navigate("DailyPracticeList")}>
          <Image source={backIcon} style={styles.backIcon} resizeMode="contain" />
        </TouchableOpacity>

        <TextComponent
          type="loginHeaderText"
          style={{
            marginTop: -15,
            color: Colors.Colors.Daily_black,
            alignSelf: "center",
          }}
        >
          {categoryItem?.name ?? "Daily Routine"}
        </TextComponent>

        <TextComponent
          type="streakSadanaText"
          style={{ marginVertical: 6, alignSelf: "center" }}
        >
          {categoryItem?.description ?? ""}
        </TextComponent>
      </View>

      <Card style={styles.card2}>
        <View style={{ width: FontSize.CONSTS.DEVICE_WIDTH * 0.82 }}>

          {/* Mantra */}
          {mantraList.length > 0 && (
            <DailyPracticeMantraCard
              data={mantraList[mantraIndex]}
              onChange={isLocked ? undefined : nextMantra}
              tag="Mantra"
              showIcons={!isLocked}
              onPress={() =>
                navigation.navigate("DailyPracticeDetailSelectedPractice", {
                  item: categoryItem,
                  selectedType: "mantra",
                  fullList: mantraList,
                  startingIndex: mantraIndex,
               onUpdateSelection: (i, reps) => {
  setMantraIndex(i);
  setMantraReps(reps);   // ⬅️ NEW
},
                  isLocked,
                })
              }
            />
          )}

          {/* Sankalp */}
          {sankalpList.length > 0 && (
            <DailyPracticeMantraCard
              data={sankalpList[sankalpIndex]}
              onChange={isLocked ? undefined : nextSankalp}
              tag="Sankalp"
              showIcons={!isLocked}
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

          {/* Practice */}
          {practiceList.length > 0 && (
            <DailyPracticeMantraCard
              data={practiceList[practiceIndex]}
              onChange={isLocked ? undefined : nextPractice}
              tag="Practice"
              showIcons={!isLocked}
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
      </Card>

      {/* SUBMIT BUTTON */}
      <LoadingButton
        loading={false}
        text={isLocked ? "Confirm" : "Submit"}
        onPress={async () => {
          if (!isLocked) {
            navigation.setParams({ isLocked: true });
            return;
          }

          const payload = buildPayload();
          const token = await AsyncStorage.getItem("access_token");
console.log("🚀 FINAL PAYLOAD:", payload);
          if (!token) {
            await AsyncStorage.setItem(
              "pending_daily_practice_data",
              JSON.stringify({
                payload,
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

          setLoading(true);
          dispatch(
            submitDailyDharmaSetup(payload, (res) => {
              setLoading(false);
              if (res.success) {
                navigation.navigate("TrackerTabs", { screen: "Tracker" });
              } else {
                console.log("❌ Error:", res.error);
              }
            })
          );
        }}
        style={styles.button}
        textStyle={styles.buttonText}
        showGlobalLoader={true}
      />

      <LoadingOverlay visible={loading} text="Submitting..." />
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
//   const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

//   const isLocked = route?.params?.isLocked ?? false;

//   const categoryItem = route?.params?.item;
//   const selectedCategory = categoryItem?.key;

//   const allData = i18n.getResourceBundle(i18n.language, "translation");

//   useEffect(() => {
//   const checkPendingDailyPractice = async () => {
//     const pending = await AsyncStorage.getItem("pending_daily_practice_data");

//     if (pending) {
//       console.log("📥 Found pending daily practice data");
//       await AsyncStorage.removeItem("pending_daily_practice_data");

//      const { payload, categoryItem, isLocked } = JSON.parse(pending);

//       console.log("🚀 Auto-calling API with pending data:", payload);

//       setLoading(true);
//       dispatch(
//         submitDailyDharmaSetup(payload, (res) => {
//           setLoading(false);

//           if (res.success) {
//             console.log("✅ Auto-submit success");
//             navigation.navigate("TrackerTabs", { screen: "Tracker" });
//           } else {
//             console.log("❌ Auto-submit failed:", res.error);
//           }
//         })
//       );
//     }
//   };

//   checkPendingDailyPractice();
// }, []);


//   // Filter with category + type
//   const mantraList = useMemo(() => {
//     return Object.values(allData).filter(
//       (item: any) =>
//         item?.category === selectedCategory && item?.id?.startsWith("mantra.")
//     );
//   }, [selectedCategory]);

//   const sankalpList = useMemo(() => {
//     return Object.values(allData).filter(
//       (item: any) =>
//         item?.category === selectedCategory && item?.id?.startsWith("sankalp.")
//     );
//   }, [selectedCategory]);

//   const practiceList = useMemo(() => {
//     return Object.values(allData).filter(
//       (item: any) =>
//         item?.category === selectedCategory && item?.id?.startsWith("practice.")
//     );
//   }, [selectedCategory]);

//   // Rotating indexes
//   const [mantraIndex, setMantraIndex] = useState(0);
//   const [sankalpIndex, setSankalpIndex] = useState(0);
//   const [practiceIndex, setPracticeIndex] = useState(0);

//   const nextMantra = () =>
//     setMantraIndex((prev) => (prev + 1) % mantraList.length);

//   const nextSankalp = () =>
//     setSankalpIndex((prev) => (prev + 1) % sankalpList.length);

//   const nextPractice = () =>
//     setPracticeIndex((prev) => (prev + 1) % practiceList.length);

//   const buildPayload = () => {
//   const selectedItems = [
//     mantraList[mantraIndex],
//     sankalpList[sankalpIndex],
//     practiceList[practiceIndex],
//   ].filter(Boolean); // remove undefined

//   const practices = selectedItems.map((p: any) => ({
//     practice_id: p.id,
//     source: p.id.startsWith("mantra.")
//       ? "mantra"
//       : p.id.startsWith("sankalp.")
//       ? "sankalp"
//       : "practice",
//     category: categoryItem?.name ?? "",
//     name: p.title,
//     description: p.description || p.summary || p.meaning || "",
//     benefits: p.benefits || [],
//   }));

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
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Image
//             source={backIcon}
//             style={styles.backIcon}
//             resizeMode="contain"
//           />
//         </TouchableOpacity>

//         <TextComponent
//           type="loginHeaderText"
//           style={{
//             marginTop: -15,
//             color: Colors.Colors.Daily_black,
//             alignSelf: "center",
//           }}
//         >
//           {categoryItem?.name}
//         </TextComponent>

//         <TextComponent
//           type="streakSadanaText"
//           style={{ marginVertical: 6, alignSelf: "center" }}
//         >
//           {categoryItem?.description}
//         </TextComponent>
//       </View>

//       <Card style={styles.card2}>
//         <View style={{ width: FontSize.CONSTS.DEVICE_WIDTH * 0.82 }}>
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
//                   onUpdateSelection: (newIndex) => setMantraIndex(newIndex),
//                   isLocked: isLocked, // ⭐ ADD THIS
//                 })
//               }
//             />
//           )}
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
//                   onUpdateSelection: (newIndex) => setSankalpIndex(newIndex),
//                   isLocked: isLocked, // ⭐ ADD THIS
//                 })
//               }
//             />
//           )}
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
//                   onUpdateSelection: (newIndex) => setPracticeIndex(newIndex),
//                   isLocked: isLocked, // ⭐ ADD THIS
//                 })
//               }
//             />
//           )}
//         </View>
//       </Card>
//       <LoadingButton
//   loading={false}
//   text={isLocked ? "Confirm" : "Submit"}
//   // onPress={() => {
//   //   if (!isLocked) {
//   //     // First press → lock screen
//   //     navigation.setParams({ isLocked: true });
//   //   } else {
//   //     // Second press → call API
//   //     const payload = buildPayload();
//   //     console.log("📦 FINAL PAYLOAD:", JSON.stringify(payload, null, 2));

//   //     setLoading(true);

//   //     dispatch(
//   //       submitDailyDharmaSetup(payload, (res) => {
//   //         setLoading(false);
//   //         if (res.success) {
//   //           console.log("✅ Dharma setup success:", res.data);
//   //           navigation.navigate("TrackerTabs");
//   //         } else {
//   //           console.log("❌ Dharma setup error:", res.error);
//   //         }
//   //       })
//   //     );
//   //   }
//   // }}
//   onPress={async () => {
//   if (!isLocked) {
//     navigation.setParams({ isLocked: true });
//     return;
//   }

//   // 🔥 Build payload
//   const payload = buildPayload();
//   console.log("🚀 FINAL PAYLOAD:", payload);

//   // 🔥 Check login
//   const token = await AsyncStorage.getItem("access_token");

//   if (!token) {
//     console.log("🔐 User not logged in → storing pending data");

//   await AsyncStorage.setItem(
//   "pending_daily_practice_data",
//   JSON.stringify({
//     payload,
//     categoryItem,
//     isLocked: true
//   })
// );


//     navigation.navigate("Login", {
//       redirect_to: "DailyPracticeSelectList",
//       categoryItem,
//       isLocked: true,
//     });

//     return;
//   }

//   // 🔥 User already logged in → Call API directly
//   setLoading(true);
//   dispatch(
//     submitDailyDharmaSetup(payload, (res) => {
//       setLoading(false);
//       if (res.success) {
//         navigation.navigate("TrackerTabs", { screen: "Tracker" });
//       } else {
//         console.log("❌ Error:", res.error);
//       }
//     })
//   );
// }}
//   disabled={false}
//   style={styles.button}
//   textStyle={styles.buttonText}
//   showGlobalLoader={true}
// />
// <LoadingOverlay visible={loading} text="Submitting..." />
//       {/* <LoadingButton
//         loading={false}
//          text={isLocked ? "Confirm" : "Submit"}
//         onPress={() => {
//           if (!isLocked) {
//       navigation.setParams({ isLocked: true }); 
//     } else {
//       console.log("CONFIRM API CALL");
//     }
//         }}
//         disabled={false}
//         style={styles.button}
//         textStyle={styles.buttonText}
//         showGlobalLoader={true}
//       /> */}
//     </View>
//   );
// };

// export default DailyPracticeSelectList;

// screens/Tracker/SubmitDailyPracticesScreen.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import { Card } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";

import moment from "moment";
import CartIcon from "../../components/CartIcon";
import Colors from "../../components/Colors";
import DailyPracticeDetailsCard from "../../components/DailyPracticeDetailsCard";
import FontSize from "../../components/FontSize";
import Header from "../../components/Header";
import LoadingOverlay from "../../components/LoadingOverlay";
import TextComponent from "../../components/TextComponent";
import { useUserLocation } from "../../components/useUserLocation";
import { RootState } from "../../store";
import { getRawPracticeObject } from "../../utils/getPracticeObjectById";
import { submitDailyDharmaSetup } from "../Home/actions";
import { fetchDailyPractice } from "../Streak/actions";

const initialCategories = [
  { name: "Peace & Calm", key: "peace-calm" },
  { name: "Focus & Motivation", key: "focus" },
  { name: "Emotional Healing", key: "healing" },
  { name: "Gratitude & Positivity", key: "gratitude" },
  { name: "Spiritual Growth", key: "spiritual-growth" },
  { name: "Health & Well-Being", key: "health" },
  { name: "Career & Prosperity", key: "career" },
  { name: "Sanatan", key: "sanatan" },
];

const SubmitDailyPracticesScreen = ({ route }) => {
  const navigation: any = useNavigation();
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const [loading, setLoading] = useState(false);

  // ✅ ONLY ROUTE PRACTICES
  const [routePractices, setRoutePractices] = useState<any[]>([]);

  // Details modal state
  const [showDetails, setShowDetails] = useState(false);
  const [detailsItem, setDetailsItem] = useState<any>(null);
  const [detailsCategoryItem, setDetailsCategoryItem] = useState<any>(null);

const { locationData, loading: locationLoading } = useUserLocation();



useEffect(() => {
  if (!locationLoading && locationData?.timezone) {
    const today = moment().format("YYYY-MM-DD");
    dispatch(fetchDailyPractice(today, locationData.timezone));
  }
}, [locationLoading, locationData?.timezone]);

const dailyPractice = useSelector(
  (state: RootState) => state.dailyPracticeReducer
);

// ✅ ADD THIS
const activeApiPractices =
  dailyPractice?.data?.active_practices || [];

useEffect(() => {
  console.log(
    "🔥 ACTIVE API PRACTICES IN SUBMIT SCREEN >>>",
    dailyPractice?.data?.active_practices
  );
}, [dailyPractice?.data?.active_practices]);

  const normalizeApiPractice = (ap: any) => ({
  practice_id: ap.practice_id ?? ap.id,
  source: ap.source,
  category: ap.category,
  name: ap.name,
  description: ap.description ?? "",
  benefits: ap.details?.benefits ?? [],
  day: ap.details?.day ?? "Daily",
  reps:
    ap.source === "sankalp"
      ? 1
      : Number(ap.details?.reps ?? 1),
});


  // ----------------------------
  // LOAD ROUTE PRACTICES ONLY
  // ----------------------------
  useEffect(() => {
    if (route?.params?.practices?.length) {
      setRoutePractices(route.params.practices);
    }
  }, [route?.params?.practices]);

  // ----------------------------
  // DETAILS OVERLAY
  // ----------------------------
  const renderDetailsCard = () => {
    if (!showDetails || !detailsItem) return null;

    const item = getRawPracticeObject(
      detailsItem.practice_id,
      detailsItem
    );

    return (
      <View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#FFFFFF",
          zIndex: 999,
        }}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <Ionicons
            name="arrow-back"
            size={26}
            color="#000"
            onPress={() => setShowDetails(false)}
          />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
            <DailyPracticeDetailsCard
            mode={"edit"}
            data={item}
            item={detailsCategoryItem}
            onChange={() => {}}
            onBackPress={() => setShowDetails(false)}
            isLocked={true}
            selectedCount={item.reps}
            onSelectCount={() => {}}
          />
        </ScrollView>
      </View>
    );
  };

  // ----------------------------
  // SUBMIT — SEND ROUTE ITEMS AS-IS
  // ----------------------------
  // const handleSubmit = async () => {
  //   setLoading(true);

  //   const token = await AsyncStorage.getItem("refresh_token");

  //   const payload = {
  //     practices: routePractices, // ✅ AS-IS
  //     dharma_level: "beginner",
  //     is_authenticated: true,
  //     recaptcha_token: token,
  //   };

  //   dispatch(
  //     submitDailyDharmaSetup(payload, (res) => {
  //       setLoading(false);
  //       if (res.success) {
  //         navigation.navigate("TrackerTabs", { screen: "Tracker" });
  //       }
  //     })
  //   );
  // };

  const handleSubmit = async () => {
  setLoading(true);

  const token = await AsyncStorage.getItem("refresh_token");

  // 1️⃣ Normalize active API practices
  const normalizedActive = activeApiPractices.map(normalizeApiPractice);

  // 2️⃣ Remove duplicates (route overrides API)
  const filteredRoute = routePractices.filter(
    (rp) =>
      !normalizedActive.some(
        (ap) => ap.practice_id === rp.practice_id
      )
  );

  // 3️⃣ Final merged list
  const finalPractices = [
    ...normalizedActive,
    ...filteredRoute,
  ];

  console.log("✅ FINAL SUBMIT PRACTICES >>>", finalPractices);

  const payload = {
    practices: finalPractices,
    dharma_level: "beginner",
    is_authenticated: true,
    recaptcha_token: token,
  };

  dispatch(
    submitDailyDharmaSetup(payload, (res) => {
      setLoading(false);
      if (res.success) {
        navigation.navigate("TrackerTabs", { screen: "Tracker" });
      }
    })
  );
};


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar barStyle="dark-content" />

      <ImageBackground
        source={require("../../../assets/Tracker_BG.png")}
        style={{
          flex: 1,
          width: FontSize.CONSTS.DEVICE_WIDTH,
          alignSelf: "center",
        }}
      >
        <Header />

        {renderDetailsCard()}

        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {/* HEADER */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              marginTop: 10,
            }}
          >
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={26} color="#000" />
            </TouchableOpacity>

            <TextComponent
              type="cardHeaderText"
              style={{ flex: 1, textAlign: "center" }}
            >
              {route?.params?.custom
                ? "Create Your Own Practice"
                : "Save my Practices"}
            </TextComponent>

            <CartIcon />
          </View>

          <TextComponent
            type="DailyHeaderText"
            style={{ marginHorizontal: 16, marginTop: 20 }}
          >
            Selected Practices ({routePractices.length})
          </TextComponent>

          {/* PRACTICE CARDS — ROUTE ONLY */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              marginTop: 20,
            }}
          >
            {routePractices.map((item, index) => (
              <Card
                key={item.practice_id || index}
                style={{
                  width: "48%",
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 15,
                  borderWidth: 1,
                  borderColor: "#D4A017",
                }}
              >
                {/* REMOVE */}
                <TouchableOpacity
                  onPress={() =>
                    setRoutePractices((prev) =>
                      prev.filter(
                        (p) => p.practice_id !== item.practice_id
                      )
                    )
                  }
                  style={{
                    position: "absolute",
                    top: -16,
                    right: -10,
                    backgroundColor: "#D4A017",
                    borderRadius: 4,
                    padding: 2,
                  }}
                >
                  <Ionicons name="close" size={14} color="#FFF" />
                </TouchableOpacity>

                {/* DAY + REPS */}
                <View
                  style={{
                    backgroundColor: "#CC9B2F",
                    borderRadius: 4,
                    padding: 4,
                    alignSelf: "center",
                  }}
                >
                  <TextComponent type="boldText" style={{ color: "#FFF" }}>
                    {item.day} • {item.reps}x
                  </TextComponent>
                </View>

                {/* TITLE */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 6,
                  }}
                >
                  <TextComponent
                    numberOfLines={1}
                    type="mediumText"
                    style={{ flex: 1 }}
                  >
                    {item.name}
                  </TextComponent>

                  <TouchableOpacity
                    onPress={() => {
                      const category =
                        initialCategories.find(
                          (c) => c.key === item.category
                        ) || initialCategories[0];

                      setDetailsItem(item);
                      setDetailsCategoryItem(category);
                      setShowDetails(true);
                    }}
                  >
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color="#D4A017"
                    />
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        </ScrollView>

        {/* SUBMIT */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            padding: 10,
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              backgroundColor: Colors.Colors.App_theme,
              paddingVertical: 12,
              borderRadius: 10,
              width: "80%",
              alignItems: "center",
            }}
          >
            <TextComponent type="cardText" style={{ color: "#FFF" }}>
              {route?.params?.custom ? "Save my Practices" : "Next"}
            </TextComponent>
          </TouchableOpacity>
        </View>

        <LoadingOverlay visible={loading} text="Saving..." />
      </ImageBackground>
    </SafeAreaView>
  );
};

export default SubmitDailyPracticesScreen;



// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import { AnyAction } from "@reduxjs/toolkit";
// import React, { useRef, useState } from "react";
// import {
//   ImageBackground,
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { Card } from "react-native-paper";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import { useDispatch } from "react-redux";
// import { ThunkDispatch } from "redux-thunk";

// import CartIcon from "../../components/CartIcon";
// import Colors from "../../components/Colors";
// import FontSize from "../../components/FontSize";
// import Header from "../../components/Header";
// import LoadingOverlay from "../../components/LoadingOverlay";
// import TextComponent from "../../components/TextComponent";
// import { RootState } from "../../store";
// import { getRawPracticeObject } from "../../utils/getPracticeObjectById";
// import { submitDailyDharmaSetup } from "../Home/actions";

// // IMPORTANT: Update this import path if wrong
// import CartModal from "../../components/CartModal";
// import DailyPracticeDetailsCard from "../../components/DailyPracticeDetailsCard";

// const initialCategories = [
//   { name: "Peace & Calm", key: "peace-calm" },
//   { name: "Focus & Motivation", key: "focus" },
//   { name: "Emotional Healing", key: "healing" },
//   { name: "Gratitude & Positivity", key: "gratitude" },
//   { name: "Spiritual Growth", key: "spiritual-growth" },
//   { name: "Health & Well-Being", key: "health" },
//   { name: "Career & Prosperity", key: "career" },
//   { name: "Sanatan", key: "sanatan" },
// ];

// const SubmitDailyPracticesScreen = ({ route }) => {
//   const navigation: any = useNavigation();
//   const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

//   const [loading, setLoading] = useState(false);

//   const [showDetails, setShowDetails] = useState(false);
//   const [detailsList, setDetailsList] = useState<any[]>([]);
//   const [detailsIndex, setDetailsIndex] = useState(0);
//   const [detailsCategoryItem, setDetailsCategoryItem] = useState<any>(null);

//   const [practicesList, setPracticesList] = useState(route.params?.practices ?? []);

//   const finalSubmitRef = useRef([]);

//   // --- DETAILS VIEW ---
//   const renderDetailsCard = () => {
//     if (!showDetails) return null;

//     const raw = detailsList[detailsIndex];
//     const item = getRawPracticeObject(raw?.practice_id, raw);

//     const isEditMode = true;

//     return (
//       <View
//         style={{
//           position: "absolute",
//           top: 0,
//           bottom: 0,
//           left: 0,
//           right: 0,
//           backgroundColor: "#FFFFFF",
//           zIndex: 999,
//         }}
//       >
//         <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
//           <Ionicons
//             name="arrow-back"
//             size={26}
//             color="#000"
//             onPress={() => setShowDetails(false)}
//           />
//         </View>

//         <ScrollView
//           style={{ flex: 1 }}
//           contentContainerStyle={{ paddingHorizontal: 16 }}
//           showsVerticalScrollIndicator={false}
//         >
//           <DailyPracticeDetailsCard
//             mode={isEditMode ? "edit" : "new"}
//             data={item}
//             item={detailsCategoryItem}
//             onChange={() => {}}
//             onBackPress={() => setShowDetails(false)}
//             isLocked={true}
//             selectedCount={item.reps}
//             onSelectCount={() => {}}
//           />
//         </ScrollView>
//       </View>
//     );
//   };

//   // --- SUBMIT ---
//   const handleSubmit = async () => {
//     setLoading(true);

//     const token = await AsyncStorage.getItem("refresh_token");

//     const payload = {
//       practices: practicesList.map((p) => ({
//         practice_id: p.practice_id,
//         source: p.practice_id?.startsWith("mantra.")
//           ? "mantra"
//           : p.practice_id?.startsWith("sankalp.")
//           ? "sankalp"
//           : "practice",
//         category: p.category,
//         name: p.name,
//         description: p.description,
//         reps: p.reps,
//         day: p.day,
//         benefits: p.benefits || [],
//       })),
//       dharma_level: "beginner",
//       is_authenticated: true,
//       recaptcha_token: token,
//     };

//     dispatch(
//       submitDailyDharmaSetup(payload, (res) => {
//         setLoading(false);
//         if (res.success) {
//           navigation.navigate("TrackerTabs", { screen: "Tracker" });
//         }
//       })
//     );
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
//       <StatusBar barStyle="dark-content" />

//       <ImageBackground
//         source={require("../../../assets/Tracker_BG.png")}
//         style={{
//           flex: 1,
//           width: FontSize.CONSTS.DEVICE_WIDTH,
//           alignSelf: "center",
//         }}
//         imageStyle={{
//           borderTopLeftRadius: 16,
//           borderTopRightRadius: 16,
//         }}
//       >
//         <Header />
//       <CartModal
//         onConfirm={async (list) => {
//           return new Promise<void>((resolve) => {
//             // finalSubmitRef.current = list;
//             // formik.submitForm().then(() => resolve());
//           });
//         }}
//       />
//         {/* DETAILS OVERLAY */}
//         {renderDetailsCard()}

//         <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
//           {/* HEADER */}
//           <View
//             style={{
//               flexDirection: "row",
//               justifyContent: "space-between",
//               paddingHorizontal: 20,
//               marginTop: 10,
//             }}
//           >
//             <TouchableOpacity onPress={() => navigation.goBack()}>
//               <Ionicons name="arrow-back" size={26} color="#000" />
//             </TouchableOpacity>

//             <TextComponent type="cardHeaderText" style={{ flex: 1, textAlign: "center" }}>
//               {route?.params?.custom ? "Create Your Own Practice" : "Save my Practices"}
//             </TextComponent>

//             <CartIcon />
//           </View>

//           <TextComponent type="subText" style={{ marginHorizontal: 16, textAlign: "center" }}>
//             Review your practices before adding them to your routine
//           </TextComponent>

//           <TextComponent type="DailyHeaderText" style={{ marginHorizontal: 16 }}>
//             Active Practices ({practicesList.length})
//           </TextComponent>

//           <TextComponent type="subDailyText" style={{ marginHorizontal: 16 }}>
//             These will become part of your routine
//           </TextComponent>

//           {/* PRACTICE CARDS (2 per row) */}
//           <View
//             style={{
//               flexDirection: "row",
//               flexWrap: "wrap",
//               justifyContent: "space-between",
//               paddingHorizontal: 20,
//               marginTop: 20,
//             }}
//           >
//             {practicesList.map((item: any, index) => (
//               <Card
//                 key={item.practice_id || index}
//                 style={{
//                   width: "48%",
//                   backgroundColor: "#FFFFFF",
//                   borderRadius: 10,
//                   padding: 10,
//                   marginBottom: 15,
//                   borderWidth: 1,
//                   borderColor: "#D4A017",
//                   position: "relative",
//                 }}
//               >
//                 {/* REMOVE */}
//                 <TouchableOpacity
//                   onPress={() => {
//                     setPracticesList(practicesList.filter((_, i) => i !== index));
//                   }}
//                   style={{
//                     position: "absolute",
//                     top: -18,
//                     right: -10,
//                     backgroundColor: "#D4A017",
//                     borderRadius: 4,
//                     padding: 2,
//                     zIndex: 10,
//                   }}
//                 >
//                   <Ionicons name="close" size={14} color="#FFFFFF" />
//                 </TouchableOpacity>

//                 {/* DAY + REPS TAG */}
//                 <View
//                   style={{
//                     marginTop: -12,
//                     backgroundColor: "#CC9B2F",
//                     borderRadius: 4,
//                     paddingVertical: 2,
//                     paddingHorizontal: 12,
//                     alignSelf: "center",
//                   }}
//                 >
//                   <TextComponent type="boldText" style={{ color: "#FFFFFF" }}>
//                     {item.day}   {item.reps} X
//                   </TextComponent>
//                 </View>

//                 {/* TITLE + INFO ICON */}
//                 <View
//                   style={{
//                     flexDirection: "row",
//                     justifyContent: "space-between",
//                     marginTop: 6,
//                   }}
//                 >
//                   <TextComponent
//                     type="mediumText"
//                     numberOfLines={1}
//                     style={{ fontSize: 13, flex: 1 }}
//                   >
//                     {item.name}
//                   </TextComponent>

//                   <TouchableOpacity
//                     onPress={() => {
//                       const fullData = getRawPracticeObject(item.practice_id, item);
//                       const detailsData = fullData
//                         ? { ...fullData, practice_id: item.practice_id }
//                         : item;

//                       const categoryItem =
//                         initialCategories.find((c) => c.key === detailsData.category) ||
//                         initialCategories[0];

//                       setDetailsCategoryItem(categoryItem);
//                       setDetailsList([detailsData]);
//                       setDetailsIndex(0);
//                       setShowDetails(true);
//                     }}
//                   >
//                     <Ionicons
//                       name="information-circle-outline"
//                       size={18}
//                       color="#D4A017"
//                       style={{ marginLeft: 6 }}
//                     />
//                   </TouchableOpacity>
//                 </View>
//               </Card>
//             ))}
//           </View>
//         </ScrollView>

//         {/* BUTTON */}
//         <View
//           style={{
//             position: "absolute",
//             bottom: 0,
//             width: "100%",
//             padding: 10,
//             alignItems: "center",
//           }}
//         >
//           <TouchableOpacity
//             onPress={handleSubmit}
//             style={{
//               backgroundColor: Colors.Colors.App_theme,
//               paddingVertical: 10,
//               borderRadius: 10,
//               width: "80%",
//               alignItems: "center",
//             }}
//           >
//             <TextComponent type="cardText" style={{ color: "#FFF" }}>
//                {route?.params?.custom ? "Save my Practices" : "Next"}
//             </TextComponent>
//           </TouchableOpacity>

//           <TextComponent
//             type="subDailyText"
//             style={{ marginVertical: 6, textAlign: "center" }}
//           >
//                {route?.params?.custom ? "You can edit them any time" : " These settings will shape your routine."}
//           </TextComponent>
//         </View>

//         <LoadingOverlay visible={loading} text="Saving..." />
//       </ImageBackground>
//     </SafeAreaView>
//   );
// };

// export default SubmitDailyPracticesScreen;



// // screens/Tracker/ConfirmDailyPractices.tsx

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import { AnyAction } from "@reduxjs/toolkit";
// import { useFormik } from "formik";
// import React, { useRef, useState } from "react";
// import {
//     ImageBackground,
//     SafeAreaView,
//     ScrollView,
//     StatusBar,
//     TextInput,
//     TouchableOpacity,
//     View
// } from "react-native";
// import { Dropdown } from "react-native-element-dropdown";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import { useDispatch } from "react-redux";
// import { ThunkDispatch } from "redux-thunk";
// import * as Yup from "yup";

// import { Card } from "react-native-paper";
// import CartIcon from "../../components/CartIcon";
// import CartModal from "../../components/CartModal";
// import Colors from "../../components/Colors";
// import FontSize from "../../components/FontSize";
// import Header from "../../components/Header";
// import LoadingOverlay from "../../components/LoadingOverlay";
// import TextComponent from "../../components/TextComponent";
// import { useCart } from "../../context/CartContext";
// import { RootState } from "../../store";
// import { getRawPracticeObject } from "../../utils/getPracticeObjectById";
// import { submitDailyDharmaSetup } from "../Home/actions";

// const SubmitDailyPracticesScreen = ({ route }) => {
//   const navigation: any = useNavigation();
//   const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
//   const [loading, setLoading] = useState(false);
//   const [detailsCategoryItem, setDetailsCategoryItem] = useState<any>(null);
//   const [detailsList, setDetailsList] = useState<any[]>([]);
//   const [detailsIndex, setDetailsIndex] = useState(0);
//     const [showDetails, setShowDetails] = useState(false);
//   const { practices = [] } = route.params ?? {};

//   console.log("Route data >>>>>",JSON.stringify(route.params))

//   const { addPractice, setCartModalVisible } = useCart();

// const initialValues = {
//   list: practices.map((item) => ({
//     ...item,
//     reps: item.reps || "",
//     day: item.day || "Daily",
//     source: item.source,   // ✅ REQUIRED
//   })),
// };

// const initialCategories = [
//   {
//     name: "Peace & Calm",
//     key: "peace-calm",
//     description: "Find calm in the breath.",
//   },
//   {
//     name: "Focus & Motivation",
//     key: "focus",
//     description: "Align. Focus. Rise.",
//   },
//   {
//     name: "Emotional Healing",
//     key: "healing",
//     description: "Let go. Begin again.",
//   },
//   {
//     name: "Gratitude & Positivity",
//     key: "gratitude",
//     description: "Gratitude transforms everything.",
//   },
//   {
//     name: "Spiritual Growth",
//     key: "spiritual-growth",
//     description: "Grow through awareness.",
//   },
//   {
//     name: "Health & Well-Being",
//     key: "health",
//     description: "Balance builds strength.",
//   },
//   {
//     name: "Career & Prosperity",
//     key: "career",
//     description: "Opportunity follows action.",
//   },
//   {
//     name: "Sanatan",
//     key: "sanatan",
//     description: "Ancient traditions & timeless wisdom.",
//   },
// ];


// const validationSchema = Yup.object().shape({
//   list: Yup.array().of(
//     Yup.object().shape({
//       reps: Yup.string().when("source", {
//         is: (src: string) => src === "mantra" || src === "practice",
//         then: (schema) =>
//           schema
//             .required("Reps are required")
//             .matches(/^[0-9]+$/, "Digits only"),
//         otherwise: (schema) => schema.notRequired(),
//       }),
//       day: Yup.string().required("Day required"),
//     })
//   ),
// });


//   const finalSubmitRef = useRef([]);

//   const formik = useFormik({
//     initialValues,
//     validationSchema,
//     validateOnChange: true,
//     validateOnBlur: true,
//     onSubmit: async () => {
//   setLoading(true);

//   const token = await AsyncStorage.getItem("refresh_token");

//   // 1) Take what CartModal returned
//   const rawList: any[] = finalSubmitRef.current || [];

//   // 2) Ensure uniqueness by id / practice_id
//   const uniqueList = Array.from(
//     new Map(
//       rawList.map((p) => [p.id || p.practice_id, p])
//     ).values()
//   );

//   // 3) Build SAME payload shape as TrackerEdit.submitCartToServer
//   const practicesPayload = uniqueList.map((p: any) => {
//     const pid = p.id || p.practice_id;

//     return {
//       practice_id: pid,
//       source: pid?.startsWith("mantra.")
//         ? "mantra"
//         : pid?.startsWith("sankalp.")
//         ? "sankalp"
//         : "library",
//       category: p.category || p.full_item?.category || "",
//       name: p.title || p.name || p.text || p.full_item?.name || "",
//       description:
//         p.description ||
//         p.summary ||
//         p.meaning ||
//         p.full_item?.description ||
//         "",
//       benefits: p.benefits || [],
//       reps: p.reps || p.full_item?.reps || null,
//       // if your backend stores day as well, keep this;
//       // if not, remove it
//       day: p.day || p.details?.day || p.full_item?.day || "Daily",
//     };
//   });

//   const payload = {
//     practices: practicesPayload,
//     dharma_level: "beginner",
//     is_authenticated: true,
//     recaptcha_token: token,
//   };

//   console.log("📤 FINAL SUBMIT (normalized):", JSON.stringify(payload));

//   dispatch(
//     submitDailyDharmaSetup(payload, (res) => {
//       setLoading(false);
//       if (res.success) {
//         navigation.navigate("TrackerTabs", { screen: "Tracker" });
//       }
//     })
//   );
// },

//     // onSubmit: async () => {
//     //   setLoading(true);

//     //   const token = await AsyncStorage.getItem("refresh_token");

//     //   const payload = {
//     //     practices: finalSubmitRef.current,
//     //     dharma_level: "beginner",
//     //     is_authenticated: true,
//     //     recaptcha_token: token,
//     //   };

//     //   console.log("📤 FINAL SUBMIT:", JSON.stringify(payload));

//     //   dispatch(
//     //     submitDailyDharmaSetup(payload, (res) => {
//     //       setLoading(false);
//     //       if (res.success)
//     //         navigation.navigate("TrackerTabs", { screen: "Tracker" });
//     //     })
//     //   );
//     // },
//   });

// const openCartForSubmit = async () => {
//   const errors = await formik.validateForm();

//   if (Object.keys(errors).length > 0) {
//     const touchedList = formik.values.list.map(() => ({
//       reps: true,
//       day: true,
//       source: true,
//     }));

//     formik.setTouched({ list: touchedList });

//     console.log("❌ Fix validation errors first");
//     return;
//   }

//   // VALID → ADD TO CART
//   formik.values.list.forEach((item) => {
//     addPractice({
//       id: item.practice_id,
//       name: item.name,
//       reps: item.reps,
//       day: item.day,
//       description: item.description,
//       source: "daily-practice",
//       full_item: item,
//     });
//   });
//    const finalList = formik.values.list.map((item) => ({
//     practice_id: item.practice_id || item.id,
//     name: item.name,
//     source: item.source,

//     reps:
//       item.source === "mantra" || item.source === "practice"
//         ? item.reps
//         : "",

//     day: item.day || "Daily",

//     description: item.description,
//     category: item.category,
//   }));
//  navigation.navigate("SubmitDailyPracticesScreen", {
//     practices: finalList,
//   });
//   // setCartModalVisible(true);
// };



//   const renderPracticeItem = ({ item, index }) => {
//     const error = formik.errors?.list?.[index] ?? {};

//     return (
//       <View
//         pointerEvents="box-none"
//         style={{
//           backgroundColor: "#FFFFFF",
//           borderWidth: 1,
//           borderRadius: 6,
//           borderColor: "#D4A017",
//           padding: 16,
//           marginHorizontal: 20,
//           marginTop: 16,
//         }}
//       >
// <TouchableOpacity
//   onPress={() => {
//     const updatedList = formik.values.list.filter((_, i) => i !== index);
//     formik.setValues({ ...formik.values, list: updatedList });
//   }}
//   style={{
//     position: "absolute",
//     right: 10,
//     top: 10,
//     padding: 6,
//     backgroundColor: "#CC9B2F",
//     borderRadius: 6,
//     zIndex: 999,
//     elevation: 5,
//   }}
// >
//   <Ionicons name="close" size={16} color="#FFFFFF" />
// </TouchableOpacity>
//         <TextComponent type="headerIncreaseText" style={{ textAlign: "center"}}>
//           {item.name}
//         </TextComponent>
//         {(item.source === "mantra" || item.source === "practice") && (
//           <>
//             <TextComponent type="streakSadanaText" style={{ marginTop: 8, color: "#000" }}>
//               Reps
//             </TextComponent>
// <TextComponent type="mediumText" style={{color:"#979797"}}>How many times would you repeat this?</TextComponent>
//             <TextInput
//               keyboardType="number-pad"
//               placeholder="e.g., 9×, 27×, 108×"
//               value={formik.values.list[index].reps}
//               onChangeText={(v) => formik.setFieldValue(`list[${index}].reps`, v)}
//               style={{
//                 marginTop: 6,
//                 borderWidth: 1,
//                 borderColor: "#CC9B2F",
//                 borderRadius: 5,
//                 padding: 12,
//                 backgroundColor: "#FFFFFF",
//               }}
//             />
//             {error?.reps && (
//               <TextComponent style={{ color: "red", marginTop: 4,alignSelf:"flex-end" }}>{error.reps}</TextComponent>
//             )}
//           </>
//         )}
//         <TextComponent type="streakSadanaText" style={{ marginTop: 10}}>
//           Frequency
//         </TextComponent>
// <TextComponent type="mediumText" style={{color:"#979797"}}>How often will you do this?</TextComponent>
//         <Dropdown
//           data={[
//             { label: "Daily", value: "Daily" },
//             { label: "Monday", value: "Mon" },
//             { label: "Tuesday", value: "Tue" },
//             { label: "Wednesday", value: "Wed" },
//             { label: "Thursday", value: "Thu" },
//             { label: "Friday", value: "Fri" },
//             { label: "Saturday", value: "Sat" },
//             { label: "Sunday", value: "Sun" },
//           ]}
//           labelField="label"
//           valueField="value"
//           value={formik.values.list[index].day}
//           onChange={(opt) => formik.setFieldValue(`list[${index}].day`, opt.value)}
//           style={{
//             marginTop: 6,
//             borderWidth: 1,
//             borderColor: "#CC9B2F",
//             borderRadius: 5,
//             paddingHorizontal: 12,
//             paddingVertical: 10,
//             backgroundColor: "#FFFFFF",
//           }}
//         />

//         {error?.day && <TextComponent style={{ color: "red", marginTop: 4 }}>{error.day}</TextComponent>}
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
//       <StatusBar barStyle="dark-content" />
//       <ImageBackground
//       source={require("../../../assets/Tracker_BG.png")}
//       style={{
//         flex: 1,
//         width: FontSize.CONSTS.DEVICE_WIDTH,
//         alignSelf: "center",
//         justifyContent: "flex-start",
//       }}
//       imageStyle={{
//         borderTopLeftRadius: 16,
//         borderTopRightRadius: 16,
//       }}
//     >
//       <Header />
//       {/* CART MODAL */}
//       <CartModal
//         onConfirm={async (list) => {
//           return new Promise<void>((resolve) => {
//             finalSubmitRef.current = list;
//             formik.submitForm().then(() => resolve());
//           });
//         }}
//       />

//       <ScrollView  keyboardShouldPersistTaps="handled"
//   nestedScrollEnabled={true} contentContainerStyle={{ paddingBottom: 120 }}>
//         {/* HEADER BAR */}
//         <View
//           style={{
//             flexDirection: "row",
//             justifyContent: "space-between",
//             paddingHorizontal: 20,
//             marginTop: 10,
//           }}
//         >
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Ionicons name="arrow-back" size={26} color="#000" />
//           </TouchableOpacity>

//           <TextComponent type="cardHeaderText" style={{ textAlign: "center", flex: 1 }}>
//        Save my Practices
//           </TextComponent>
//           <CartIcon />
//         </View>
// <TextComponent type="subText" style={{marginHorizontal:16,textAlign:"center"}}>Review your practices before adding them to your routine</TextComponent>
//             <TextComponent type="DailyHeaderText" style={{marginHorizontal:16}}>Active Practices (4)</TextComponent>
//             <TextComponent type="subDailyText" style={{marginHorizontal:16}}>These will become part of your routine</TextComponent>
//        <View
//   style={{
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//     paddingHorizontal: 20,
//     marginTop: 20,
//   }}
// >
//   {practices.map((item: any, index) => (
//     <Card
//       key={item.practice_id || index}
//       style={{
//         width: "48%",
//         backgroundColor: "#FFFFFF",
//         borderRadius: 10,
//         padding: 10,
//         marginBottom: 15,
//         borderWidth: 1,
//         borderColor: "#D4A017",
//         elevation: 3,
//         position: "relative",
//       }}
//     >

//       {/* REMOVE BUTTON */}
//       <TouchableOpacity
//         onPress={() => {
//           const updated = practices.filter((_, i) => i !== index);
//           navigation.setParams({ practices: updated }); // update route params
//         }}
//         style={{
//           position: "absolute",
//           top: -18,
//           right: -10,
//           backgroundColor: "#D4A017",
//           borderRadius: 4,
//           padding: 2,
//           zIndex: 999,
//         }}
//       >
//         <Ionicons name="close" size={14} color="#FFFFFF" />
//       </TouchableOpacity>

//       {/* REPS + DAY TAG */}
//       <View
//         style={{
//           marginTop: -12,
//           backgroundColor: "#CC9B2F",
//           borderRadius: 4,
//           paddingVertical: 2,
//           paddingHorizontal: 12,
//           alignSelf: "center",
//           flexDirection: "row",
//           alignItems: "center",
//         }}
//       >
//         <TextComponent type="boldText" style={{ color: "#FFFFFF" }}>
//           {(item.day || "Daily") + "   " + (item.reps || "") + " X"}
//         </TextComponent>
//       </View>

//       {/* TITLE + INFO ICON */}
//       <View
//         style={{
//           flexDirection: "row",
//           alignItems: "center",
//           justifyContent: "space-between",
//           marginTop: 4,
//         }}
//       >
//         <TextComponent
//           type="mediumText"
//           numberOfLines={1}
//           ellipsizeMode="tail"
//           style={{
//             fontSize: FontSize.CONSTS.FS_13,
//             color: Colors.Colors.BLACK,
//             flex: 1,
//           }}
//         >
//           {item.name || item.title || "Practice"}
//         </TextComponent>

//         <TouchableOpacity
//           onPress={() => {
//             const fullData = getRawPracticeObject(item.practice_id, item);
//             const detailsData = fullData
//               ? { ...fullData, practice_id: item.practice_id }
//               : item;

//             const categoryItem =
//               initialCategories.find(
//                 (c) =>
//                   c.key === detailsData.category || c.key === item.category
//               ) || initialCategories[0];

//             setDetailsCategoryItem(categoryItem);
//             setDetailsList([detailsData]);
//             setDetailsIndex(0);
//             setShowDetails(true);
//           }}
//         >
//           <Ionicons
//             name="information-circle-outline"
//             size={18}
//             color="#D4A017"
//             style={{ marginLeft: 6 }}
//           />
//         </TouchableOpacity>
//       </View>
//     </Card>
//   ))}
// </View>


//       </ScrollView>

//       {/* CONFIRM BUTTON */}
//       <View
//         style={{
//           position: "absolute",
//           bottom: 0,
//           width: "100%",
//           padding: 6,
//           // backgroundColor: "#FFFFFF",
//           // borderTopWidth: 1,
//           // borderTopColor: "#DDD",
//           alignItems:"center"
//         }}
//       >
//         <TouchableOpacity
//           onPress={openCartForSubmit}
//           style={{
//             backgroundColor: Colors.Colors.App_theme,
//             paddingVertical: 8,
//             borderRadius: 10,
//             alignItems: "center",
//             width:"80%"
//           }}
//         >
//           <TextComponent type="cardText" style={{ color: "#FFF" }}>
//             Next
//           </TextComponent>
//         </TouchableOpacity>
//         <TextComponent type="subDailyText" style={{alignSelf:"center",textAlign:"center",marginVertical:6}}>These settings will shape your routine.</TextComponent>
//       </View>

//       <LoadingOverlay visible={loading} text="Saving..." />
//       </ImageBackground>
//     </SafeAreaView>
//   );
// };

// export default SubmitDailyPracticesScreen;

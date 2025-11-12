import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import { useFormik } from "formik";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import * as Yup from "yup";
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";
import Header from "../../components/Header";
import LoadingOverlay from "../../components/LoadingOverlay";
import TextComponent from "../../components/TextComponent";
import { CATALOGS } from "../../data/mantras"; // ✅ make sure this import exists
import { RootState } from "../../store";
import { submitDailyDharmaSetup } from "./actions";
import styles from "./homestyles";

const { width } = Dimensions.get("window");

/* ✅ Centralized display helper */
const getDisplayContent = (p: any, t: any, i18n: any) => {
  const langKey = i18n.language?.split("-")[0]?.toLowerCase() || "en";

  // 🪔 1️⃣ Sankalp Type
  const isSankalp =
    p.details?.type === "sankalp" ||
    !!p.i18n?.short ||
    !!p.details?.i18n?.short;

  if (isSankalp) {
    const shortKey = p.details?.i18n?.short || p.i18n?.short;
    const suggestedKey = p.details?.i18n?.suggested || p.i18n?.suggested;

    const title =
      (shortKey && t(shortKey)) ||
      p.details?.short_text ||
      p.short_text ||
      p.name ||
      "";

    const desc =
      (suggestedKey && t(suggestedKey)) ||
      p.details?.suggested_practice ||
      p.suggested_practice ||
      p.tooltip ||
      p.description ||
      "";

    return { title, description: desc };
  }

  // 🕉️ 2️⃣ Mantra Type
  if ((p.id && String(p.id).startsWith("mantra.")) || p.text || p.devanagari) {
    const localizedCatalog = CATALOGS[langKey] || CATALOGS.en;
    const localizedMantra = localizedCatalog.find((m) => m.id === p.id);
    const fallbackMantra = CATALOGS.en.find((m) => m.id === p.id);
    const active = localizedMantra || fallbackMantra || p;

    const title =
      active.text ||
      p.text ||
      p.name ||
      active.devanagari ||
      p.devanagari ||
      "";

    const explanation =
      Array.isArray(active.explanation) && active.explanation.length
        ? active.explanation.join(" ")
        : Array.isArray(p.explanation)
        ? p.explanation.join(" ")
        : active.explanation || p.explanation || p.description || "";

    return { title, description: explanation };
  }

  // 🧘 3️⃣ Custom or API-only (no translation)
  if (p.source === "custom" || p.source === "api" || String(p.practice_id || "").startsWith("custom_")) {
    return {
      title: p.name?.trim() || "Custom Practice",
      description: p.description?.trim() || "",
    };
  }

  // 🪷 4️⃣ Sanatan / Library practice (with translations)
  const title = t(`practices.${p.id}.name`, { defaultValue: p.name || "" }) || p.name || "";
  const description =
    t(`practices.${p.id}.description`, { defaultValue: p.description || "" }) ||
    p.description ||
    "";

  return { title, description };
};

const SubmitMantraScreen = ({ route }) => {
  const navigation: any = useNavigation();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const mantraData = route?.params?.mantraData || [];
  console.log("route >>>>>>>>>", route?.params);

  const initialValues = {
    mantras: mantraData.map((item) => ({
      ...item,
       trigger: item.trigger ? item.trigger : "",
    })),
  };

  const validationSchema = Yup.object().shape({
    mantras: Yup.array().of(
      Yup.object().shape({
        trigger: Yup.string().required("Please select a time."),
      })
    ),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
    setLoading(true);
      const token = await AsyncStorage.getItem("refresh_token");
      const payload = {
        practices: values.mantras,
        dharma_level:
          route?.params?.selectedIndex === 0
            ? "beginner"
            : route?.params?.selectedIndex === 1
            ? "intermediate"
            : route?.params?.selectedIndex === 2
            ? "advanced"
            : "beginner",
        is_authenticated: true,
        recaptcha_token: token,
      };

      console.log("payload of submitted mantra >>>>>>>>>>>>", JSON.stringify(payload));

      dispatch(
        submitDailyDharmaSetup(payload, (res) => {
    setLoading(false);
          if (res.success) {
            console.log("✅ Dharma setup success:", res.data);
            navigation.navigate("SadanaTrackerScreen");
          } else {
            console.log("❌ Dharma setup error:", res.error);
          }
        })
      );
    },
  });

  /* ✅ Render each mantra item */
  const renderMantraItem = ({ item, index }) => {
    const error =
      formik.touched?.mantras?.[index]?.trigger &&
      formik.errors?.mantras?.[index]?.trigger;

    const { title: displayName, description: displayDescription } = getDisplayContent(
      item,
      t,
      i18n
    );
  const hasTrigger = !!item?.trigger;
    return (
      <View
        style={{
          borderRadius: 6,
          elevation: 3,
          backgroundColor: Colors.Colors.white,
          padding: 16,
          borderColor: Colors.Colors.Light_grey,
          borderWidth: 1,
          marginVertical: 10,
          marginHorizontal: 15,
        }}
      >
        {/* ✅ Title */}
        <TextComponent
          type="boldText"
          style={{
            color: Colors.Colors.BLACK,
            fontSize: FontSize.CONSTS.FS_14,
          }}
        >
          {item.icon} {displayName}
        </TextComponent>

        {!!displayDescription && (
          <TextComponent
            type="semiBoldText"
            style={{
              color: Colors.Colors.Light_black,
              marginVertical: 6,
            }}
          >
            {displayDescription}
          </TextComponent>
        )}

        <TextComponent
          type="boldText"
          style={{
            color: Colors.Colors.BLACK,
            fontSize: FontSize.CONSTS.FS_14,
            marginBottom: 6,
          }}
        >
          {t("submitPractice.timeLabel")}
        </TextComponent>

        <View style={styles.setupcontainer}>
         <Dropdown
              selectedTextProps={{ allowFontScaling: false }}
              data={[
                { label: t("submitPractice.reminder.sunrise"), value: "sunrise" },
                { label: t("submitPractice.reminder.wakingUp"), value: "wakingUp" },
                { label: t("submitPractice.reminder.morning"), value: "morning" },
                { label: t("submitPractice.reminder.commute"), value: "commute" },
                { label: t("submitPractice.reminder.workStart"), value: "workStart" },
                { label: t("submitPractice.reminder.midDay"), value: "midDay" },
                { label: t("submitPractice.reminder.lunch"), value: "lunch" },
                { label: t("submitPractice.reminder.returnHome"), value: "returnHome" },
                { label: t("submitPractice.reminder.sunset"), value: "sunset" },
                { label: t("submitPractice.reminder.dinner"), value: "dinner" },
                { label: t("submitPractice.reminder.bedtime"), value: "bedtime" },
                { label: t("submitPractice.reminder.brahmaMuhurta"), value: "brahmaMuhurta" },
              ]}
              labelField="label"
              valueField="value"
              placeholder={t("submitPractice.selectTime")}
           value={formik.values.mantras[index].trigger} 
              onChange={(val) =>
                formik.setFieldValue(`mantras[${index}].trigger`, val.value)
              }
              style={styles.setupdropdown}
              selectedTextStyle={styles.selectedText}
              placeholderStyle={styles.placeholder}
              itemTextStyle={styles.dropdownItemText}
              containerStyle={styles.dropdownContainer}
            />
        </View>

        {error && (
          <TextComponent
            style={{
              color: "red",
              marginTop: 4,
              fontSize: 12,
            }}
          >
            {error}
          </TextComponent>
        )}
      </View>
    );
  };

  const levelTranslations = {
    Beginner: {
      title: t("mySadhana.levels.beginner.title"),
      subtitle: t("mySadhana.levels.beginner.subtitle"),
    },
    Intermediate: {
      title: t("mySadhana.levels.intermediate.title"),
      subtitle: t("mySadhana.levels.intermediate.subtitle"),
    },
    Advanced: {
      title: t("mySadhana.levels.advanced.title"),
      subtitle: t("mySadhana.levels.advanced.subtitle"),
    },
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Colors.white }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.Colors.header_bg} />
      <Header />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        <TextComponent
          type="cardText"
          style={{
            textAlign: "center",
            marginTop: 15,
            fontSize: FontSize.CONSTS.FS_16,
            color: Colors.Colors.BLACK,
          }}
        >
          Level{" "}
          {levelTranslations[route?.params?.chosenLevel]?.title ||
            route?.params?.chosenLevel}
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
          {t("submitPractice.yourDailyPractice")}
        </TextComponent>
        <FlatList
          data={formik.values.mantras}
          renderItem={renderMantraItem}
          keyExtractor={(item) =>
            item.id || item.practice_id || String(Math.random())
          }
          scrollEnabled={false}
        />
         <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginVertical: 20,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              formik.handleSubmit();
            }}
            style={{
              backgroundColor: Colors.Colors.App_theme,
              borderRadius: 4,
              padding: 12,
            }}
          >
            <TextComponent
              type="cardText"
              style={{ color: Colors.Colors.BLACK }}
            >
              {t("submitPractice.submitMyPractice")}
            </TextComponent>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
            style={{
              backgroundColor: Colors.Colors.white,
              borderColor: Colors.Colors.App_theme,
              borderWidth: 1,
              borderRadius: 4,
              padding: 12,
              marginLeft: 20,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <TextComponent
              type="cardText"
              style={{ color: Colors.Colors.App_theme }}
            >
              {t("submitPractice.editDetails")}
            </TextComponent>
            <Image
              source={require("../../../assets/edit_icon.png")}
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>
        </View>
<LoadingOverlay visible={loading} text="Signing in..." />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SubmitMantraScreen;














// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import { AnyAction } from "@reduxjs/toolkit";
// import { useFormik } from "formik";
// import React from "react";
// import { useTranslation } from "react-i18next";
// import {
//   Dimensions,
//   FlatList,
//   Image,
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { Dropdown } from "react-native-element-dropdown";
// import { useDispatch } from "react-redux";
// import { ThunkDispatch } from "redux-thunk";
// import * as Yup from "yup";
// import Colors from "../../components/Colors";
// import FontSize from "../../components/FontSize";
// import Header from "../../components/Header";
// import TextComponent from "../../components/TextComponent";
// import { RootState } from "../../store";
// import { submitDailyDharmaSetup } from "./actions";
// import styles from "./homestyles";

// const { width } = Dimensions.get("window");


// const SubmitMantraScreen = ({ route }) => {
//   const navigation: any = useNavigation();
//   const { t } = useTranslation();


//   // Translation keys are same as used in MySadana
// const levelTranslations = {
//   Beginner: {
//     title: t("mySadhana.levels.beginner.title"),
//     subtitle: t("mySadhana.levels.beginner.subtitle"),
//   },
//   Intermediate: {
//     title: t("mySadhana.levels.intermediate.title"),
//     subtitle: t("mySadhana.levels.intermediate.subtitle"),
//   },
//   Advanced: {
//     title: t("mySadhana.levels.advanced.title"),
//     subtitle: t("mySadhana.levels.advanced.subtitle"),
//   },
// };

// // Dropdown options
// const rememberdata = [
//   { label: t("reminder.sunrise"), value: "sunrise" },
//   { label: t("reminder.wakingUp"), value: "wakingUp" },
//   { label: t("reminder.morning"), value: "morning" },
//   { label: t("reminder.commute"), value: "commute" },
//   { label: t("reminder.workStart"), value: "workStart" },
//   { label: t("reminder.midDay"), value: "midDay" },
//   { label: t("reminder.lunch"), value: "lunch" },
//   { label: t("reminder.returnHome"), value: "returnHome" },
//   { label: t("reminder.sunset"), value: "sunset" },
//   { label: t("reminder.dinner"), value: "dinner" },
//   { label: t("reminder.bedtime"), value: "bedtime" },
//   { label: t("reminder.brahmaMuhurta"), value: "brahmaMuhurta" },
// ];

//    const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

//   const mantraData = route?.params?.mantraData || [];

//   console.log("route >>>>>>>>>",route?.params);

//   // Create Formik initial values dynamically
//   const initialValues = {
//     mantras: mantraData.map((item) => ({
//       ...item,
//       trigger: "", // default empty selection for each mantra
//     })),
//   };

//   // Yup validation
//   const validationSchema = Yup.object().shape({
//     mantras: Yup.array().of(
//       Yup.object().shape({
//         trigger: Yup.string().required("Please select a time."),
//       })
//     ),
//   });

//   // Formik setup
//   const formik = useFormik({
//     initialValues,
//     validationSchema,
//     onSubmit: async (values) => {
//          const token = await AsyncStorage.getItem("refresh_token");
//       console.log("selectedIndex >>>>>", route?.params?.selectedIndex,token);
//       console.log("Final submitted values >>>>>", values.mantras);
//       const payload = {
//         practices : values.mantras,
//         dharma_level:route?.params?.selectedIndex === 0 ? "beginner" : route?.params?.selectedIndex === 1 ? "intermediate" : route?.params?.selectedIndex === 2 ? "advanced" : "beginner",
//    is_authenticated:true,
//    recaptcha_token:token
//       }
//       console.log("payload of submitted mantra >>>>>>>>>>>>",JSON.stringify(payload))
//          dispatch(
//         submitDailyDharmaSetup(payload, (res) => {
//           if (res.success) {
//             console.log("✅ Dharma setup success:", res.data);
//             navigation.navigate("SadanaTrackerScreen");
//           } else {
//             console.log("❌ Dharma setup error:", res.error);
//           }
//         })
//       );
//     },
//   });

//   const renderMantraItem = ({ item, index }) => {
//   const error =
//     formik.touched?.mantras?.[index]?.trigger &&
//     formik.errors?.mantras?.[index]?.trigger;

//   let displayName = "";
//   let displayDescription = "";

//   // 🪔 Sankalp Type (from Yoga Sutra, Gita, etc.)
//   const isSankalp =
//     item.details?.type === "sankalp" ||
//     item.i18n?.short ||
//     item.details?.i18n?.short;

//   if (isSankalp) {
//     const shortKey = item.details?.i18n?.short || item.i18n?.short;
//     const suggestedKey = item.details?.i18n?.suggested || item.i18n?.suggested;

//     displayName =
//       (shortKey && t(shortKey)) ||
//       item.details?.short_text ||
//       item.short_text ||
//       item.name;

//     displayDescription =
//       (suggestedKey && t(suggestedKey)) ||
//       item.details?.suggested_practice ||
//       item.suggested_practice ||
//       item.tooltip ||
//       "";
//   }

//   // 🕉️ Mantra Type (mantra.ganesha_vakratunda, etc.)
//   else if (item.id?.startsWith("mantra.") || item.mantra) {
//     displayName = item.devanagari || item.text || item.name;
//     displayDescription = Array.isArray(item.explanation)
//       ? item.explanation.join(" ")
//       : item.explanation || item.description || "";
//   }

//   // 🪷 Sanatan / Library Practice
//   else {
//     displayName = t(`practices.${item.id}.name`, { defaultValue: item.name });
//     displayDescription = t(`practices.${item.id}.description`, {
//       defaultValue: item.description,
//     });
//   }

//   return (
//     <View
//       style={{
//         borderRadius: 6,
//         elevation: 3,
//         backgroundColor: Colors.Colors.white,
//         padding: 16,
//         borderColor: Colors.Colors.Light_grey,
//         borderWidth: 1,
//         marginVertical: 10,
//         marginHorizontal: 15,
//       }}
//     >
//       {/* ✅ Title (icon + main text) */}
//       <TextComponent
//         type="boldText"
//         style={{
//           color: Colors.Colors.BLACK,
//           fontSize: FontSize.CONSTS.FS_14,
//         }}
//       >
//         {item.icon} {displayName}
//       </TextComponent>

//       {/* ✅ Description / Suggested Practice */}
//       {!!displayDescription && (
//         <TextComponent
//           type="semiBoldText"
//           style={{
//             color: Colors.Colors.Light_black,
//             marginVertical: 6,
//           }}
//         >
//           {displayDescription}
//         </TextComponent>
//       )}

//       {/* ✅ Time Label */}
//       <TextComponent
//         type="boldText"
//         style={{
//           color: Colors.Colors.BLACK,
//           fontSize: FontSize.CONSTS.FS_14,
//           marginBottom: 6,
//         }}
//       >
//         {t("submitPractice.timeLabel")}
//       </TextComponent>

//       {/* ✅ Reminder Dropdown */}
//       <View style={styles.setupcontainer}>
//         <Dropdown
//           selectedTextProps={{ allowFontScaling: false }}
//           data={[
//             { label: t("submitPractice.reminder.sunrise"), value: "sunrise" },
//             { label: t("submitPractice.reminder.wakingUp"), value: "wakingUp" },
//             { label: t("submitPractice.reminder.morning"), value: "morning" },
//             { label: t("submitPractice.reminder.commute"), value: "commute" },
//             { label: t("submitPractice.reminder.workStart"), value: "workStart" },
//             { label: t("submitPractice.reminder.midDay"), value: "midDay" },
//             { label: t("submitPractice.reminder.lunch"), value: "lunch" },
//             { label: t("submitPractice.reminder.returnHome"), value: "returnHome" },
//             { label: t("submitPractice.reminder.sunset"), value: "sunset" },
//             { label: t("submitPractice.reminder.dinner"), value: "dinner" },
//             { label: t("submitPractice.reminder.bedtime"), value: "bedtime" },
//             { label: t("submitPractice.reminder.brahmaMuhurta"), value: "brahmaMuhurta" },
//           ]}
//           labelField="label"
//           valueField="value"
//           placeholder={t("submitPractice.selectTime")}
//           value={formik.values.mantras[index].trigger}
//           onChange={(val) =>
//             formik.setFieldValue(`mantras[${index}].trigger`, val.value)
//           }
//           style={styles.setupdropdown}
//           selectedTextStyle={styles.selectedText}
//           placeholderStyle={styles.placeholder}
//           itemTextStyle={styles.dropdownItemText}
//           containerStyle={styles.dropdownContainer}
//         />
//       </View>

//       {/* ✅ Validation Error */}
//       {error && (
//         <TextComponent
//           style={{
//             color: "red",
//             marginTop: 4,
//             fontSize: 12,
//           }}
//         >
//           {error}
//         </TextComponent>
//       )}
//     </View>
//   );
// };


//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Colors.white }}>
//       <StatusBar
//         barStyle="dark-content"
//         backgroundColor={Colors.Colors.header_bg}
//         translucent={false}
//       />
//       <Header />

//       <ScrollView
//         contentContainerStyle={{ paddingBottom: 30 }}
//         showsVerticalScrollIndicator={false}
//       >
//         <TextComponent
//           type="cardText"
//           style={{
//             textAlign: "center",
//             marginTop: 15,
//             fontSize: FontSize.CONSTS.FS_16,
//             color: Colors.Colors.BLACK,
//           }}
//         >
//            Level {levelTranslations[route?.params?.chosenLevel]?.title || route?.params?.chosenLevel}
//           {/* {t("submitPractice.levelBeginner")} */}
//         </TextComponent>

//         <TextComponent
//           type="mediumText"
//           style={{
//             fontSize: FontSize.CONSTS.FS_14,
//             textAlign: "center",
//             marginTop: 7,
//             marginHorizontal: 30,
//           }}
//         >
//              {t("submitPractice.yourDailyPractice")}
//         </TextComponent>

//         {/* Buttons */}
//         <View
//           style={{
//             flexDirection: "row",
//             alignItems: "center",
//             justifyContent: "center",
//             marginVertical: 20,
//           }}
//         >
//           <TouchableOpacity
//             onPress={() => {formik.handleSubmit()}}
//             style={{
//               backgroundColor: Colors.Colors.App_theme,
//               borderRadius: 4,
//               padding: 12,
//             }}
//           >
//             <TextComponent
//               type="cardText"
//               style={{ color: Colors.Colors.BLACK }}
//             >
//                {t("submitPractice.submitMyPractice")}
//             </TextComponent>
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={() => {navigation.goBack()}}
//             style={{
//               backgroundColor: Colors.Colors.white,
//               borderColor: Colors.Colors.App_theme,
//               borderWidth: 1,
//               borderRadius: 4,
//               padding: 12,
//               marginLeft: 20,
//               flexDirection: "row",
//               alignItems: "center",
//             }}
//           >
//             <TextComponent
//               type="cardText"
//               style={{ color: Colors.Colors.App_theme }}
//             >
//                {t("submitPractice.editDetails")}
//             </TextComponent>
//             <Image
//               source={require("../../../assets/edit_icon.png")}
//               style={{ marginLeft: 10 }}
//             />
//           </TouchableOpacity>
//         </View>

//         <FlatList
//           data={formik.values.mantras}
//           renderItem={renderMantraItem}
//           keyExtractor={(item) => item.id}
//           scrollEnabled={false}
//         />
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default SubmitMantraScreen;

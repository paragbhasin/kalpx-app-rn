import { useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import * as Yup from "yup";
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";
import LoadingButton from "../../components/LoadingButton";
import TextComponent from "../../components/TextComponent";
import { RootState } from "../../store";
import {
  fetchProfileDetails,
  fetchProfileOptions,
  updateProfile,
} from "./actions";
import styles from "./languageStyle";

const ProfileDetails = () => {
  const navigation = useNavigation();
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const optionsState = useSelector(
    (state: RootState) => state.profileOptionsReducer
  );
  const detailsState = useSelector(
    (state: RootState) => state.profileDetailsReducer
  );

  const profileOptions = optionsState?.data;
  const profileDetails = detailsState?.data;
  const userProfile = profileDetails?.profile;

  useEffect(() => {
    dispatch(fetchProfileOptions(() => {}));
    dispatch(fetchProfileDetails(() => {}));
  }, [dispatch]);

  const ageGroups = profileOptions?.age_groups || [];
  const categories = profileOptions?.categories || [];
  const languages = profileOptions?.languages || [];

  // ✅ Timezone list
  const timezones = [
    { label: "India Standard Time (IST)", value: "Asia/Kolkata" },
    { label: "Gulf Standard Time (GST)", value: "Asia/Dubai" },
    { label: "Sri Lanka Standard Time (SLST)", value: "Asia/Colombo" },
    { label: "British Time (GMT/BST)", value: "Europe/London" },
    { label: "Central European Time (CET/CEST)", value: "Europe/Berlin" },
    { label: "Eastern Time (US & Canada)", value: "America/New_York" },
    { label: "Central Time (US & Canada)", value: "America/Chicago" },
    { label: "Mountain Time (US & Canada)", value: "America/Denver" },
    { label: "Pacific Time (US & Canada)", value: "America/Los_Angeles" },
    { label: "Australian Eastern Time (AEST/AEDT)", value: "Australia/Sydney" },
    { label: "Australian Western Time (AWST)", value: "Australia/Perth" },
    { label: "Singapore Time (SGT)", value: "Asia/Singapore" },
    { label: "Hong Kong Time (HKT)", value: "Asia/Hong_Kong" },
    { label: "South Africa Standard Time (SAST)", value: "Africa/Johannesburg" },
  ];

  const formik: any = useFormik({
    enableReinitialize: true,
    initialValues: {
      profileName: userProfile?.profile_name ?? "",
      ageGroup: userProfile?.age_group?.id?.toString() ?? "",
      // categories: userProfile?.categories?.map((c) => c.name) ?? [], // commented
      language: userProfile?.languages?.[0]?.id?.toString() ?? "",
      timezone: userProfile?.timezone ?? "Asia/Kolkata",
      emails: userProfile?.emails ?? true,
      push_notification: userProfile?.push_notification ?? true,
    },
    validationSchema: Yup.object({
      profileName: Yup.string().trim().required("Profile name is required"),
      ageGroup: Yup.string().required("Please select an age group"),
      language: Yup.string().required("Select at least one language"),
      timezone: Yup.string().required("Select your timezone"),
    }),
    onSubmit: async (values) => {
      const payload = {
        profile_name: values.profileName,
        age_group_id: Number(values.ageGroup),
        // category_ids: categories
        //   .filter((cat) => values.categories.includes(cat.name))
        //   .map((cat) => cat.id),
        language_ids: [Number(values.language)],
        timezone: values.timezone,
        emails: values.emails,
        push_notification: values.push_notification,
      };

      console.log("📤 Payload:", payload);

      setLoading(true);
      dispatch(
        updateProfile(payload, (res) => {
          setLoading(false);
          if (res.success) {
            console.log("🎉 Profile updated successfully!");
            navigation.goBack();
          } else {
            console.error("❌ Error updating profile:", res.error);
          }
        })
      );
    },
  });

  const allValid =
    formik.values.profileName &&
    formik.values.ageGroup &&
    formik.values.language &&
    formik.values.timezone;

  if (optionsState.loading || detailsState.loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#a67c52" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </Pressable>
          <TextComponent type="headerText" style={styles.headerText}>{t("profileScreen.myProfile")}</TextComponent>
          <View style={{ width: 24 }} />
        </View>

        <View style={{ marginHorizontal: 20 }}>
          {/* Profile Name */}
          <TextComponent type="semiBoldText" style={styles.label}>{t("profileScreen.profileName")}</TextComponent>
          <TextInput
                    allowFontScaling={false}
            style={styles.input}
            placeholder="Enter your profile name"
            value={formik.values.profileName}
            onChangeText={(text) => formik.setFieldValue("profileName", text)}
          />
          {formik.touched.profileName && formik.errors.profileName && (
            <TextComponent type="mediumText" style={styles.errorText}>{formik.errors.profileName}</TextComponent>
          )}

          {/* Age Group */}
          <TextComponent  type="semiBoldText" style={styles.label}>{t("profileScreen.ageGroup")}</TextComponent>
          <Dropdown
          selectedTextProps={{ allowFontScaling: false }}
            data={ageGroups.map((g) => ({ label: g.name, value: g.id.toString() }))}
            labelField="label"
            valueField="value"
            placeholder="Select Your Age Group"
            value={formik.values.ageGroup}
            onChange={(item) => formik.setFieldValue("ageGroup", item.value)}
            style={styles.setupdropdown}
                   placeholderStyle={styles.dropdownText}
  selectedTextStyle={styles.dropdownText}
  itemTextStyle={styles.dropdownItemText}
  containerStyle={styles.dropdownContainer}
          />
          {formik.touched.ageGroup && formik.errors.ageGroup && (
            <TextComponent type="mediumText" style={styles.errorText}>{formik.errors.ageGroup}</TextComponent>
          )}

          {/* 🗂 Categories (Commented Out)
          <Text  allowFontScaling={false} style={styles.label}>{t("profileScreen.categories")}</Text>
          <View style={styles.row}>
            {categories.map((cat) => {
              const isSelected = formik.values.categories.includes(cat.name);
              return (
                <Pressable
                  key={cat.id}
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() =>
                    toggleMultiSelect(formik.values.categories, cat.name, "categories")
                  }
                >
                  <Text  allowFontScaling={false}
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          */}

          {/* 🌐 Language Dropdown */}
          <TextComponent  type="semiBoldText" style={styles.label}>{t("profileScreen.languages")}</TextComponent>
          <Dropdown
          selectedTextProps={{ allowFontScaling: false }}
            data={languages.map((l) => ({ label: l.name, value: l.id.toString() }))}
            labelField="label"
            valueField="value"
            placeholder="Select Language"
            value={formik.values.language}
            onChange={(item) => formik.setFieldValue("language", item.value)}
            style={styles.setupdropdown}
              placeholderStyle={styles.dropdownText}
  selectedTextStyle={styles.dropdownText}
  itemTextStyle={styles.dropdownItemText}
  containerStyle={styles.dropdownContainer}
          />
          {formik.touched.language && formik.errors.language && (
            <TextComponent type="mediumText" style={styles.errorText}>{formik.errors.language}</TextComponent>
          )}
            <TextComponent  type="semiBoldText"  style={{ marginTop: 10,  color: "#000000", }}>{t("profileScreen.languageInstruction")}</TextComponent>

          {/* 🕒 Timezone */}
         <TextComponent  type="semiBoldText" style={styles.label}>{t("profileScreen.chooseTZ")}</TextComponent>
          <Dropdown
          selectedTextProps={{ allowFontScaling: false }}
            data={timezones}
            labelField="label"
            valueField="value"
            placeholder={t("timezone.selectTimezone")}
            value={formik.values.timezone}
            onChange={(item) => formik.setFieldValue("timezone", item.value)}
            style={styles.setupdropdown}
              placeholderStyle={styles.dropdownText}
  selectedTextStyle={styles.dropdownText}
  itemTextStyle={styles.dropdownItemText}
  containerStyle={styles.dropdownContainer}
          />
          {formik.touched.timezone && formik.errors.timezone && (
             <TextComponent type="mediumText" style={styles.errorText}>{formik.errors.timezoneaaa}</TextComponent>
          )}

          {/* 🔔 Reminders */}
            <TextComponent  type="semiBoldText" style={[styles.label, { marginTop: 20 }]}>{t("profileScreen.Reminders")}</TextComponent>
          <View style={{ flexDirection: "column", gap: 10 }}>
            <Pressable
              style={{ flexDirection: "row", alignItems: "center" }}
              onPress={() =>
                formik.setFieldValue("emails", !formik.values.emails)
              }
            >
              <Ionicons
                name={
                  formik.values.emails
                    ? "checkbox-outline"
                    : "square-outline"
                }
                size={22}
                color="#a67c52"
              />
              <TextComponent type="mediumText" style={{ marginLeft: 10 ,color: Colors.Colors.Light_black,fontSize: FontSize.CONSTS.FS_16,}}>{t("profileScreen.emailNotifications")}</TextComponent>
            </Pressable>

            <Pressable
              style={{ flexDirection: "row", alignItems: "center" }}
              onPress={() =>
                formik.setFieldValue(
                  "push_notification",
                  !formik.values.push_notification
                )
              }
            >
              <Ionicons
                name={
                  formik.values.push_notification
                    ? "checkbox-outline"
                    : "square-outline"
                }
                size={22}
                color="#a67c52"
              />
               <TextComponent type="mediumText" style={{ marginLeft: 10 ,color: Colors.Colors.Light_black,fontSize: FontSize.CONSTS.FS_16,}}>{t("profileScreen.pushNotifications")}</TextComponent>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <LoadingButton
          loading={loading}
          text={t("profileScreen.updateProfile")}
          disabled={!allValid || loading}
          style={[
            styles.submitButton,
            { backgroundColor: allValid ? "#a67c52" : "#ccc" },
          ]}
          textStyle={styles.submitText}
          onPress={formik.handleSubmit}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default ProfileDetails;









// import { useNavigation } from "@react-navigation/native";
// import { AnyAction } from "@reduxjs/toolkit";
// import { useFormik } from "formik";
// import React, { useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
//   Pressable,
//   ScrollView,
//   Text,
//   TextInput,
//   View,
// } from "react-native";
// import { Dropdown } from "react-native-element-dropdown";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import { useDispatch, useSelector } from "react-redux";
// import { ThunkDispatch } from "redux-thunk";
// import * as Yup from "yup";
// import LoadingButton from "../../components/LoadingButton";
// import { RootState } from "../../store";
// import {
//   fetchProfileDetails,
//   fetchProfileOptions,
//   updateProfile,
// } from "./actions";
// import styles from "./languageStyle";

// const ProfileDetails = () => {
//   const navigation = useNavigation();
//   const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
//     const { t } = useTranslation();
//   const [loading, setLoading] = useState(false);

//   // ✅ Redux states
//   const optionsState = useSelector(
//     (state: RootState) => state.profileOptionsReducer
//   );
//   const detailsState = useSelector(
//     (state: RootState) => state.profileDetailsReducer
//   );
//   const updateState = useSelector(
//     (state: RootState) => state.updateProfileReducer
//   );

//   const profileOptions = optionsState?.data;
//   const profileDetails = detailsState?.data;
//   const userProfile = profileDetails?.profile;

//   // ✅ Fetch data on mount
//   useEffect(() => {
//     dispatch(
//       fetchProfileOptions((res) => {
//         if (!res.success) console.error("❌ Failed to fetch options:", res.error);
//       })
//     );
//     dispatch(
//       fetchProfileDetails((res) => {
//         if (!res.success) console.error("❌ Failed to fetch details:", res.error);
//       })
//     );
//   }, [dispatch]);

//   // ✅ Extract data safely
//   const ageGroups = profileOptions?.age_groups || [];
//   const categories = profileOptions?.categories || [];
//   const languages = profileOptions?.languages || [];

//   // ✅ Formik setup
//   const formik: any = useFormik({
//     enableReinitialize: true,
//     initialValues: {
//       profileName: userProfile?.profile_name ?? "",
//       ageGroup: userProfile?.age_group?.id?.toString() ?? "",
//       categories: userProfile?.categories?.map((c) => c.name) ?? [],
//       languages: userProfile?.languages?.map((l) => l.name) ?? [],
//     },
//     validationSchema: Yup.object({
//       profileName: Yup.string().trim().required("Profile name is required"),
//       ageGroup: Yup.string().required("Please select an age group"),
//       categories: Yup.array().min(1, "Select at least one category"),
//       languages: Yup.array().min(1, "Select at least one language"),
//     }),
//     onSubmit: async (values) => {
//       const payload = {
//         profile_name: values.profileName,
//         age_group_id: Number(values.ageGroup),
//         category_ids: categories
//           .filter((cat) => values.categories.includes(cat.name))
//           .map((cat) => cat.id),
//         language_ids: languages
//           .filter((lang) => values.languages.includes(lang.name))
//           .map((lang) => lang.id),
//       };

//       console.log("📤 Payload:", payload);

//       setLoading(true);
//       dispatch(
//         updateProfile(payload, (res) => {
//           setLoading(false);
//           if (res.success) {
//             console.log("🎉 Profile updated successfully!");
//             navigation.goBack();
//           } else {
//             console.error("❌ Error updating profile:", res.error);
//           }
//         })
//       );
//     },
//   });

//   // ✅ Toggle multi-select values
//   const toggleMultiSelect = (list: string[], value: string, field: string) => {
//     const updated = list.includes(value)
//       ? list.filter((v) => v !== value)
//       : [...list, value];
//     formik.setFieldValue(field, updated);
//   };

//   // ✅ Validation for enabling the button
//   const allValid =
//     formik.values.profileName &&
//     formik.values.ageGroup &&
//     formik.values.categories.length > 0 &&
//     formik.values.languages.length > 0;

//   // ✅ Show loader while fetching
//   if (optionsState.loading || detailsState.loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" color="#a67c52" />
//       </View>
//     );
//   }

//   // ✅ UI Rendering
//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//     >
//       <ScrollView
//         contentContainerStyle={{ paddingBottom: 120 }}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Header */}
//         <View style={styles.header}>
//           <Pressable onPress={() => navigation.goBack()}>
//             <Ionicons name="arrow-back" size={24} color="#000" />
//           </Pressable>
//           <Text style={styles.headerText}>{t("profileScreen.myProfile")}</Text>
//           <View style={{ width: 24 }} />
//         </View>

//         {/* Profile Form */}
//         <View style={{ marginHorizontal: 20 }}>
//           {/* Profile Name */}
//           <Text style={styles.label}>{t("profileScreen.profileName")}</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter your profile name"
//             value={formik.values.profileName}
//             onChangeText={(text) => formik.setFieldValue("profileName", text)}
//             onBlur={() => formik.setFieldTouched("profileName")}
//           />
//           {formik.touched.profileName && formik.errors.profileName && (
//             <Text style={styles.errorText}>{formik.errors.profileName}</Text>
//           )}

//           {/* Age Group */}
//           <View style={styles.setupcontainer}>
//             <Text style={styles.label}>{t("profileScreen.ageGroup")}</Text>
//             <Dropdown
//               data={ageGroups.map((g) => ({
//                 label: g.name,
//                 value: g.id.toString(),
//               }))}
//               labelField="label"
//               valueField="value"
//               placeholder="Select Your Age Group"
//               value={formik.values.ageGroup}
//               onChange={(item) =>
//                 formik.setFieldValue("ageGroup", item.value)
//               }
//               style={styles.setupdropdown}
//               selectedTextStyle={styles.selectedText}
//               placeholderStyle={styles.placeholder}
//             />
//             {formik.touched.ageGroup && formik.errors.ageGroup && (
//               <Text style={styles.errorText}>{formik.errors.ageGroup}</Text>
//             )}
//           </View>

//           {/* Categories */}
//           <Text style={styles.label}>{t("profileScreen.categories")}</Text>
//           <View style={styles.row}>
//             {categories.map((cat) => {
//               const isSelected = formik.values.categories.includes(cat.name);
//               return (
//                 <Pressable
//                   key={cat.id}
//                   style={[styles.option, isSelected && styles.optionSelected]}
//                   onPress={() =>
//                     toggleMultiSelect(formik.values.categories, cat.name, "categories")
//                   }
//                 >
//                   <Text
//                     style={[
//                       styles.optionText,
//                       isSelected && styles.optionTextSelected,
//                     ]}
//                   >
//                     {cat.name}
//                   </Text>
//                 </Pressable>
//               );
//             })}
//           </View>
//           {formik.touched.categories && formik.errors.categories && (
//             <Text style={styles.errorText}>{formik.errors.categories}</Text>
//           )}

//           {/* Languages */}
//           <Text style={styles.label}>{t("profileScreen.languages")}</Text>
//           <View style={styles.row}>
//             {languages.map((lang) => {
//               const isSelected = formik.values.languages.includes(lang.name);
//               return (
//                 <Pressable
//                   key={lang.id}
//                   style={[styles.option, isSelected && styles.optionSelected]}
//                   onPress={() =>
//                     toggleMultiSelect(formik.values.languages, lang.name, "languages")
//                   }
//                 >
//                   <Text
//                     style={[
//                       styles.optionText,
//                       isSelected && styles.optionTextSelected,
//                     ]}
//                   >
//                     {lang.name}
//                   </Text>
//                 </Pressable>
//               );
//             })}
//           </View>
//           {formik.touched.languages && formik.errors.languages && (
//             <Text style={styles.errorText}>{formik.errors.languages}</Text>
//           )}
//         </View>
//       </ScrollView>

//       {/* Footer Button */}
//       <View style={styles.footer}>
//         <LoadingButton
//           loading={loading}
//           text={t("profileScreen.updateProfile")}
//           disabled={!allValid || loading}
//           style={[
//             styles.submitButton,
//             { backgroundColor: allValid ? "#a67c52" : "#ccc" },
//           ]}
//           textStyle={styles.submitText}
//           onPress={formik.handleSubmit}
//         />
//       </View>
//     </KeyboardAvoidingView>
//   );
// };

// export default ProfileDetails;

import { useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import * as Yup from "yup";
import LoadingButton from "../../components/LoadingButton";
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

  const [loading, setLoading] = useState(false);

  // ✅ Redux states
  const optionsState = useSelector(
    (state: RootState) => state.profileOptionsReducer
  );
  const detailsState = useSelector(
    (state: RootState) => state.profileDetailsReducer
  );
  const updateState = useSelector(
    (state: RootState) => state.updateProfileReducer
  );

  const profileOptions = optionsState?.data;
  const profileDetails = detailsState?.data;
  const userProfile = profileDetails?.profile;

  // ✅ Fetch data on mount
  useEffect(() => {
    dispatch(
      fetchProfileOptions((res) => {
        if (!res.success) console.error("❌ Failed to fetch options:", res.error);
      })
    );
    dispatch(
      fetchProfileDetails((res) => {
        if (!res.success) console.error("❌ Failed to fetch details:", res.error);
      })
    );
  }, [dispatch]);

  // ✅ Extract data safely
  const ageGroups = profileOptions?.age_groups || [];
  const categories = profileOptions?.categories || [];
  const languages = profileOptions?.languages || [];

  // ✅ Formik setup
  const formik: any = useFormik({
    enableReinitialize: true,
    initialValues: {
      profileName: userProfile?.profile_name ?? "",
      ageGroup: userProfile?.age_group?.id?.toString() ?? "",
      categories: userProfile?.categories?.map((c) => c.name) ?? [],
      languages: userProfile?.languages?.map((l) => l.name) ?? [],
    },
    validationSchema: Yup.object({
      profileName: Yup.string().trim().required("Profile name is required"),
      ageGroup: Yup.string().required("Please select an age group"),
      categories: Yup.array().min(1, "Select at least one category"),
      languages: Yup.array().min(1, "Select at least one language"),
    }),
    onSubmit: async (values) => {
      const payload = {
        profile_name: values.profileName,
        age_group_id: Number(values.ageGroup),
        category_ids: categories
          .filter((cat) => values.categories.includes(cat.name))
          .map((cat) => cat.id),
        language_ids: languages
          .filter((lang) => values.languages.includes(lang.name))
          .map((lang) => lang.id),
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

  // ✅ Toggle multi-select values
  const toggleMultiSelect = (list: string[], value: string, field: string) => {
    const updated = list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
    formik.setFieldValue(field, updated);
  };

  // ✅ Validation for enabling the button
  const allValid =
    formik.values.profileName &&
    formik.values.ageGroup &&
    formik.values.categories.length > 0 &&
    formik.values.languages.length > 0;

  // ✅ Show loader while fetching
  if (optionsState.loading || detailsState.loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#a67c52" />
      </View>
    );
  }

  // ✅ UI Rendering
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
          <Text style={styles.headerText}>My Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Profile Form */}
        <View style={{ marginHorizontal: 20 }}>
          {/* Profile Name */}
          <Text style={styles.label}>Profile Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your profile name"
            value={formik.values.profileName}
            onChangeText={(text) => formik.setFieldValue("profileName", text)}
            onBlur={() => formik.setFieldTouched("profileName")}
          />
          {formik.touched.profileName && formik.errors.profileName && (
            <Text style={styles.errorText}>{formik.errors.profileName}</Text>
          )}

          {/* Age Group */}
          <View style={styles.setupcontainer}>
            <Text style={styles.label}>Age Group</Text>
            <Dropdown
              data={ageGroups.map((g) => ({
                label: g.name,
                value: g.id.toString(),
              }))}
              labelField="label"
              valueField="value"
              placeholder="Select Your Age Group"
              value={formik.values.ageGroup}
              onChange={(item) =>
                formik.setFieldValue("ageGroup", item.value)
              }
              style={styles.setupdropdown}
              selectedTextStyle={styles.selectedText}
              placeholderStyle={styles.placeholder}
            />
            {formik.touched.ageGroup && formik.errors.ageGroup && (
              <Text style={styles.errorText}>{formik.errors.ageGroup}</Text>
            )}
          </View>

          {/* Categories */}
          <Text style={styles.label}>Categories</Text>
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
                  <Text
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
          {formik.touched.categories && formik.errors.categories && (
            <Text style={styles.errorText}>{formik.errors.categories}</Text>
          )}

          {/* Languages */}
          <Text style={styles.label}>Languages</Text>
          <View style={styles.row}>
            {languages.map((lang) => {
              const isSelected = formik.values.languages.includes(lang.name);
              return (
                <Pressable
                  key={lang.id}
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() =>
                    toggleMultiSelect(formik.values.languages, lang.name, "languages")
                  }
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {lang.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {formik.touched.languages && formik.errors.languages && (
            <Text style={styles.errorText}>{formik.errors.languages}</Text>
          )}
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <LoadingButton
          loading={loading}
          text="Update Profile"
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

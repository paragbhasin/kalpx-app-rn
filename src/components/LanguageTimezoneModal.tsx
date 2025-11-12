import { AnyAction } from "@reduxjs/toolkit";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import * as Yup from "yup";
import { fetchProfileDetails, fetchProfileOptions, updateProfile } from "../screens/Profile/actions";
import { RootState } from "../store";
import Colors from "./Colors";
import FontSize from "./FontSize";
import LoadingButton from "./LoadingButton";
import TextComponent from "./TextComponent";

const LanguageTimezoneModal = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const [loading, setLoading] = useState(false);

  const optionsState = useSelector((state: RootState) => state.profileOptionsReducer);
  const detailsState = useSelector((state: RootState) => state.profileDetailsReducer);
  const profileOptions = optionsState?.data;
  const profileDetails = detailsState?.data;
  const userProfile = profileDetails?.profile;

  useEffect(() => {
    dispatch(fetchProfileOptions(() => {}));
    dispatch(fetchProfileDetails(() => {}));
  }, [dispatch]);

  const languages = profileOptions?.languages || [];
  const timezones = [
    { label: "India Standard Time (IST)", value: "Asia/Kolkata" },
    { label: "Gulf Standard Time (GST)", value: "Asia/Dubai" },
    { label: "Sri Lanka Standard Time (SLST)", value: "Asia/Colombo" },
    { label: "British Time (GMT/BST)", value: "Europe/London" },
    { label: "Central European Time (CET/CEST)", value: "Europe/Berlin" },
    { label: "Eastern Time (US & Canada)", value: "America/New_York" },
    { label: "Pacific Time (US & Canada)", value: "America/Los_Angeles" },
    { label: "Singapore Time (SGT)", value: "Asia/Singapore" },
  ];

  const formik: any = useFormik({
    enableReinitialize: true,
    initialValues: {
      language: userProfile?.languages?.[0]?.id?.toString() ?? "",
      timezone: userProfile?.timezone ?? "Asia/Kolkata",
    },
    validationSchema: Yup.object({
      language: Yup.string().required("Select language"),
      timezone: Yup.string().required("Select timezone"),
    }),
    onSubmit: async (values) => {
      if (!userProfile) return;
      const payload = {
        profile_name: userProfile?.profile_name ?? "",
        age_group_id: userProfile?.age_group?.id ?? null,
        category_ids: userProfile?.categories?.map((c) => c.id) ?? [],
        language_ids: [Number(values.language)],
        timezone: values.timezone,
        emails: userProfile?.emails ?? true,
        push_notification: userProfile?.push_notification ?? true,
      };
      console.log("📤 Updating:", payload);
      setLoading(true);
      dispatch(
        updateProfile(payload, (res) => {
          setLoading(false);
          if (res.success) onClose?.();
        })
      );
    },
  });

  const allValid = formik.values.language && formik.values.timezone;

  if (optionsState.loading || detailsState.loading) {
    return (
      <Modal visible={visible} transparent>
        <View style={styles.modalBackdrop}>
          <ActivityIndicator size="large" color="#a67c52" />
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          {/* Close button */}
            <TouchableOpacity onPress={() => {onClose()}} style={styles.closeButton}>
                    <Image
                      source={require("../../assets/Cross.png")}
                      style={styles.closeIcon}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
 <TextComponent type="cardText" style={{
      color: Colors.Colors.BLACK,
        fontSize: FontSize.CONSTS.FS_16,
        marginTop:-20
 }}>{t("profileScreen.chooseHeader")}</TextComponent>
          {/* Fields */}
          <TextComponent type="mediumText" style={styles.label}>{t("profileScreen.languages")}</TextComponent>
          <Dropdown
            data={languages.map((l) => ({ label: l.name, value: l.id.toString() }))}
            labelField="label"
            valueField="value"
            placeholder="Select Language"
            value={formik.values.language}
            onChange={(item) => formik.setFieldValue("language", item.value)}
            style={styles.dropdown}
               placeholderStyle={styles.dropdownText}
  selectedTextStyle={styles.dropdownText}
  itemTextStyle={styles.dropdownItemText}
  containerStyle={styles.dropdownContainer}
          />
          {formik.touched.language && formik.errors.language && (
            <TextComponent type="mediumText"  style={styles.errorText}>{formik.errors.language}</TextComponent>
          )}

        <TextComponent type="headerText" style={{ marginTop: 10 ,fontSize:14}}>{t("profileScreen.languageInstruction")}</TextComponent>
          

          <TextComponent type="mediumText" style={styles.label}>{t("profileScreen.chooseTZ")}</TextComponent>
          <Dropdown
            data={timezones}
            labelField="label"
            valueField="value"
            placeholder="Select Timezone"
            value={formik.values.timezone}
            onChange={(item) => formik.setFieldValue("timezone", item.value)}
            style={styles.dropdown}
              placeholderStyle={styles.dropdownText}
  selectedTextStyle={styles.dropdownText}
  itemTextStyle={styles.dropdownItemText}
  containerStyle={styles.dropdownContainer}
          />
          {formik.touched.timezone && formik.errors.timezone && (
            <TextComponent type="mediumText"  style={styles.errorText}>{formik.errors.timezone}</TextComponent>
          )}

          {/* Continue button */}
          <LoadingButton
            loading={loading}
            text={t("profileScreen.continue")}
            disabled={!allValid || loading}
            style={[
              styles.continueBtn,
              { backgroundColor: allValid ? Colors.Colors.App_theme : "#ccc" },
            ]}
            textStyle={styles.continueText}
            onPress={formik.handleSubmit}
          />
        </View>
      </View>
    </Modal>
  );
};

export default LanguageTimezoneModal;

const styles = StyleSheet.create({
      closeButton: {
        backgroundColor: Colors.Colors.App_theme,
        alignSelf: "flex-end",
        padding: 10,
        borderRadius: 18,
      },
      closeIcon: {},
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 5,
  },
  label: {
    fontSize: 16,
    // fontWeight: "500",
    color: "#000000",
    marginTop: 25,
    marginBottom: 6,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  errorText: {
        alignSelf:"flex-end",
    fontSize: 12,
    color: "red",
    marginTop: 4,
  },
  continueBtn: {
    marginTop: 30,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  continueText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dropdownText: {
  color: "#000000", // text color inside dropdown input
  fontSize: 16,
},

dropdownItemText: {
  color: "#000000", // color of list items
  fontSize: 16,
},

dropdownContainer: {
  backgroundColor: "#FFFFFF", // optional: makes list pop with contrast
  // borderRadius: 8,
},

});

// screens/Tracker/ConfirmDailyPractices.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import { useFormik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import * as Yup from "yup";

import moment from "moment";
import CartIcon from "../../components/CartIcon";
import CartModal from "../../components/CartModal";
import Colors from "../../components/Colors";
import Header from "../../components/Header";
import LoadingOverlay from "../../components/LoadingOverlay";
import TextComponent from "../../components/TextComponent";
import { useUserLocation } from "../../components/useUserLocation";
import { useCart } from "../../context/CartContext";
import { RootState } from "../../store";
import { submitDailyDharmaSetup } from "../Home/actions";
import { fetchDailyPractice } from "../Streak/actions";

const ConfirmDailyPractices = ({ route }) => {
  const navigation: any = useNavigation();
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const [loading, setLoading] = useState(false);

  const { practices = [] } = route.params ?? {};

  const MANTRA_REPS_OPTIONS = ["9", "27", "54", "108"];


  console.log("Route data >>>>>", JSON.stringify(route.params))

  const { addPractice, setCartModalVisible } = useCart();

  const { locationData, loading: locationLoading } = useUserLocation();
  const didFetchRef = useRef(false);


  useEffect(() => {
    if (didFetchRef.current) return;

    if (!locationLoading && locationData?.timezone) {
      didFetchRef.current = true;
      const today = moment().format("YYYY-MM-DD");
      dispatch(fetchDailyPractice(today, locationData.timezone));
    }
  }, [locationLoading, locationData?.timezone]);


  const dailyPractice = useSelector(
    (state: RootState) => state.dailyPracticeReducer
  );

  const activeApiPractices =
    dailyPractice?.data?.active_practices || [];

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

  const normalizeSource = (source?: string) => {
    if (!source || typeof source !== "string") return "practice";
    if (source.includes("mantra")) return "mantra";
    if (source.includes("sankalp")) return "sankalp";
    return "practice";
  };

  const initialValues = {
    list: practices.map((item) => {
      const source = normalizeSource(item.source);

      return {
        ...item,
        source, // 🔥 normalized source
        reps: source === "mantra" ? "9" : "",
        day: item.day || "Daily",
      };
    }),
  };

  const validationSchema = Yup.object().shape({
    list: Yup.array().of(
      Yup.object().shape({
        reps: Yup.string().when("source", {
          is: (src: string) => src === "mantra" || src === "practice",
          then: (schema) =>
            schema
              .required("Reps are required")
              .matches(/^[0-9]+$/, "Digits only"),
          otherwise: (schema) => schema.notRequired(),
        }),
        day: Yup.string().required("Day required"),
      })
    ),
  });


  const finalSubmitRef = useRef([]);

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: false,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async () => {
      setLoading(true);

      const token = await AsyncStorage.getItem("refresh_token");

      const rawList: any[] = finalSubmitRef.current || [];

      const normalizedActive = activeApiPractices.map(normalizeApiPractice);

      const filteredUser = rawList.filter((rp) => {
        const rpid = rp.practice_id || rp.id;
        return !normalizedActive.some(
          (ap) => ap.practice_id === rpid
        );
      });

      const mergedList = [
        ...normalizedActive,
        ...filteredUser,
      ];


      const uniqueList = Array.from(
        new Map(
          mergedList.map((p) => [p.practice_id || p.id, p])
        ).values()
      );


      const practicesPayload = uniqueList.map((p: any) => {
        const pid = p.id || p.practice_id;

        return {
          practice_id: pid,
          source: pid?.startsWith("mantra.")
            ? "mantra"
            : pid?.startsWith("sankalp.")
              ? "sankalp"
              : "library",
          category: p.category || p.full_item?.category || "",
          name: p.title || p.name || p.text || p.full_item?.name || "",
          description:
            p.description ||
            p.summary ||
            p.meaning ||
            p.full_item?.description ||
            "",
          benefits: p.benefits || [],
          reps: p.reps || p.full_item?.reps || null,
          day: p.day || p.details?.day || p.full_item?.day || "Daily",
        };
      });

      const payload = {
        practices: practicesPayload,
        dharma_level: "beginner",
        is_authenticated: true,
        recaptcha_token: token,
      };

      console.log("📤 FINAL SUBMIT (normalized):", JSON.stringify(payload));

      dispatch(
        submitDailyDharmaSetup(payload, (res) => {
          setLoading(false);
          if (res.success) {
            navigation.navigate("TrackerTabs", { screen: "Tracker", fromSetup: true });
          }
        })
      );
    },
  });

  const openCartForSubmit = async () => {
    const errors = await formik.validateForm();

    if (Object.keys(errors).length > 0) {
      const touchedList = formik.values.list.map(() => ({
        reps: true,
        day: true,
        source: true,
      }));

      formik.setTouched({ list: touchedList });

      console.log("❌ Fix validation errors first");
      return;
    }

    formik.values.list.forEach((item) => {
      addPractice({
        id: item.practice_id,
        name: item.name,
        reps: item.reps,
        day: item.day,
        description: item.description,
        source: "daily-practice",
        full_item: item,
      });
    });
    const finalList = formik.values.list.map((item) => ({
      practice_id: item.practice_id || item.id,
      name: item.name,
      source: item.source,

      reps:
        item.source === "mantra" || item.source === "practice"
          ? item.reps
          : "",

      day: item.day || "Daily",

      description: item?.description,
      category: item?.category,
    }));
    if (route?.params?.trackerEdit) {
      navigation.navigate("SubmitDailyPracticesScreen", {
        practices: finalList,
        trackerEdit: true
      });
    } else {
      navigation.navigate("DailyPracticeSelectList", {
        resumedSelections: finalList,   // send back filled values
        isLocked: true,
        item: route?.params?.categoryItem,                   // force showing “Submit” button
      });
    }
  };



  const renderPracticeItem = ({ item, index }) => {
    const error = formik.errors?.list?.[index] ?? {};

    return (
      <View
        pointerEvents="box-none"
        style={{
          backgroundColor: route?.params?.growth ? "#F7F0DD" : "#FFFFFF",
          borderWidth: 1,
          borderRadius: 6,
          borderColor: "#D4A017",
          padding: 16,
          marginHorizontal: 20,
          marginTop: 36,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            const updatedList = formik.values.list.filter((_, i) => i !== index);
            formik.setValues({ ...formik.values, list: updatedList });
          }}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            padding: 6,
            backgroundColor: "#CC9B2F",
            borderRadius: 6,
            zIndex: 999,
            elevation: 5,
          }}
        >
          <Ionicons name="close" size={16} color="#FFFFFF" />
        </TouchableOpacity>



        {/* TAG HEADER */}
        <View
          style={{
            position: "absolute",
            top: -18,
            left: 20,
            backgroundColor: "#FFFFFF",
            paddingVertical: 6,
            paddingHorizontal: 16,
            borderRadius: 22,
            borderWidth: 1.5,
            borderColor: "#D4A017",
          }}
        >
          <TextComponent type="boldText" style={{ color: "#000" }}>
            ● {item.source === "mantra" ? "Mantra" : item.source === "sankalp" ? "Sankalp" : "Practice"}
          </TextComponent>
        </View>

        {/* TITLE */}
        <TextComponent type="headerIncreaseText" style={{ textAlign: "center" }}>
          {item.name}
        </TextComponent>

        {/* DESCRIPTION */}
        {/* {!!item.description && (
          <TextComponent
            type="semiBoldText"
            style={{ marginTop: 10, textAlign: "center", color: Colors.Colors.Light_black }}
          >
            {item.description}
          </TextComponent>
        )} */}
        {/* REPS */}
        {(item.source === "mantra" ||
          item.source === "practice") && (
            <>
              <TextComponent type="streakSadanaText" style={{ marginTop: 8, color: "#000" }}>
                Reps
              </TextComponent>

              <TextComponent type="mediumText" style={{ color: "#979797", marginBottom: 6 }}>
                How many times would you repeat this?
              </TextComponent>

              {/* 🔹 MANTRA → HORIZONTAL SELECT */}
              {item.source === "mantra" && (
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  {MANTRA_REPS_OPTIONS.map((opt) => {
                    const selected = String(formik.values.list[index].reps) === opt;

                    return (
                      <TouchableOpacity
                        key={opt}
                        onPress={() =>
                          formik.setFieldValue(`list[${index}].reps`, opt)
                        }
                        style={{
                          flex: 1,
                          marginHorizontal: 4,
                          paddingVertical: 10,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: selected ? "#CC9B2F" : "#DDD",
                          backgroundColor: selected ? "#F7E7B4" : "#FFF",
                          alignItems: "center",
                        }}
                      >
                        <TextComponent
                          type="mediumText"
                          style={{
                            color: selected ? "#000" : "#777",
                            fontWeight: selected ? "700" : "500",
                          }}
                        >
                          {opt}X
                        </TextComponent>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* 🔹 PRACTICE + SANKALP → TEXT INPUT */}
              {(item.source === "practice" || item.source === "sankalp") && (
                <TextInput
                  keyboardType="number-pad"
                  placeholder="e.g., 9, 27, 108"
                  value={formik.values.list[index].reps}
                  onChangeText={(v) =>
                    formik.setFieldValue(`list[${index}].reps`, v)
                  }
                  style={{
                    marginTop: 6,
                    borderWidth: 1,
                    borderColor: "#CC9B2F",
                    borderRadius: 5,
                    padding: 12,
                    backgroundColor: "#FFFFFF",
                  }}
                />
              )}

              {error?.reps && (
                <TextComponent
                  style={{ color: "red", marginTop: 4, alignSelf: "flex-end" }}
                >
                  {error.reps}
                </TextComponent>
              )}
            </>
          )}

        {/* REPS (MANTRA + PRACTICE ONLY) */}
        {/* {(item.source === "mantra" || item.source === "practice") && (
          <>
            <TextComponent type="streakSadanaText" style={{ marginTop: 8, color: "#000" }}>
              Reps
            </TextComponent>
<TextComponent type="mediumText" style={{color:"#979797"}}>How many times would you repeat this?</TextComponent>
            <TextInput
              keyboardType="number-pad"
              placeholder="e.g., 9×, 27×, 108×"
              value={formik.values.list[index].reps}
              onChangeText={(v) => formik.setFieldValue(`list[${index}].reps`, v)}
              style={{
                marginTop: 6,
                borderWidth: 1,
                borderColor: "#CC9B2F",
                borderRadius: 5,
                padding: 12,
                backgroundColor: "#FFFFFF",
              }}
            />

            {error?.reps && (
              <TextComponent style={{ color: "red", marginTop: 4,alignSelf:"flex-end" }}>{error.reps}</TextComponent>
            )}
          </>
        )} */}

        {/* DAY SELECT */}
        <TextComponent type="streakSadanaText" style={{ marginTop: 10 }}>
          Frequency
        </TextComponent>
        <TextComponent type="mediumText" style={{ color: "#979797" }}>How often will you do this?</TextComponent>
        <Dropdown
          data={[
            { label: "Daily", value: "Daily" },
            { label: "Monday", value: "Mon" },
            { label: "Tuesday", value: "Tue" },
            { label: "Wednesday", value: "Wed" },
            { label: "Thursday", value: "Thu" },
            { label: "Friday", value: "Fri" },
            { label: "Saturday", value: "Sat" },
            { label: "Sunday", value: "Sun" },
          ]}
          labelField="label"
          valueField="value"
          value={formik.values.list[index].day}
          onChange={(opt) => formik.setFieldValue(`list[${index}].day`, opt.value)}
          style={{
            marginTop: 6,
            borderWidth: 1,
            borderColor: "#CC9B2F",
            borderRadius: 5,
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: "#FFFFFF",
          }}
        />

        {error?.day && <TextComponent style={{ color: "red", marginTop: 4 }}>{error.day}</TextComponent>}
      </View>
    );
  };


  const getSourceLabel = (source?: string) => {
    if (source === "mantra") return "Mantra";
    if (source === "sankalp") return "Sankalp";
    return "Practice";
  };


  // -------------------------------------------------
  // UI
  // -------------------------------------------------
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar barStyle="dark-content" />
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
      {/* CART MODAL */}
      <CartModal
        onConfirm={async (list) => {
          return new Promise<void>((resolve) => {
            finalSubmitRef.current = list;
            formik.submitForm().then(() => resolve());
          });
        }}
      />

      <ScrollView keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* HEADER BAR */}
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

          <TextComponent type="cardHeaderText" style={{ textAlign: "center", flex: 1 }}>
            {route?.params?.growth ? route?.params?.title : "Set My Practices"}
          </TextComponent>
          {!route?.params?.growth && <CartIcon />}
        </View>
        <TextComponent type="subText" style={{ marginHorizontal: 16, textAlign: "center" }}>Set how often you want to do each part of your routine.</TextComponent>
        <TextComponent type="streakText" style={{ marginHorizontal: 16, textAlign: "center", color: "#282828", marginTop: 10 }}>{route?.params?.growth ? route?.params?.description : "Choose your frequency and repetition count for each step"}</TextComponent>
        {/* LIST */}
        <FlatList
          data={formik.values.list}
          extraData={formik.values.list}   // <-- REQUIRED FOR RERENDER
          renderItem={renderPracticeItem}
          keyExtractor={(item, i) => item.practice_id || item.id || i.toString()}
          scrollEnabled={false}
        />
        <View
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            padding: 6,
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#DDD",
            alignItems: "center"
          }}
        >
          <TouchableOpacity
            onPress={openCartForSubmit}
            style={{
              backgroundColor: Colors.Colors.App_theme,
              paddingVertical: 8,
              borderRadius: 10,
              alignItems: "center",
              width: "80%"
            }}
          >
            <TextComponent type="cardText" style={{ color: "#FFF" }}>
              Next
            </TextComponent>
          </TouchableOpacity>
          <TextComponent type="subDailyText" style={{ alignSelf: "center", textAlign: "center", marginVertical: 6 }}>These settings will shape your routine.</TextComponent>
        </View>
      </ScrollView>

      {/* CONFIRM BUTTON */}


      <LoadingOverlay visible={loading} text="Saving..." />
      {/* </ImageBackground> */}
    </SafeAreaView>
  );
};

export default ConfirmDailyPractices;
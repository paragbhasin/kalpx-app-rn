import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import { useFormik } from "formik";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import * as Yup from "yup";
import CartIcon from "../../components/CartIcon";
import CartModal from "../../components/CartModal";
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";
import Header from "../../components/Header";
import LoadingOverlay from "../../components/LoadingOverlay";
import TextComponent from "../../components/TextComponent";
import { useCart } from "../../context/CartContext";
import { CATALOGS } from "../../data/mantras";
import { RootState } from "../../store";
import { submitDailyDharmaSetup } from "../Home/actions";
import styles from "../Home/homestyles";

const { width } = Dimensions.get("window");



const getDisplayContent = (p: any, t: any, i18n: any) => {
  const langKey = i18n.language?.split("-")[0]?.toLowerCase() || "en";

  const isSankalp =
    p.details?.type === "sankalp" ||
    !!p.i18n?.short ||
    !!p.details?.i18n?.short;

  if (isSankalp) {
    const shortKey = p.details?.i18n?.short || p.i18n?.short;
    const suggestedKey = p.details?.i18n?.suggested || p.i18n?.suggested;
    return {
      title:
        (shortKey && t(shortKey)) ||
        p.details?.short_text ||
        p.short_text ||
        p.name ||
        "",
      description:
        (suggestedKey && t(suggestedKey)) ||
        p.details?.suggested_practice ||
        p.suggested_practice ||
        p.tooltip ||
        p.description ||
        "",
    };
  }

  if ((p.id && String(p.id).startsWith("mantra.")) || p.text || p.devanagari) {
    const localized = CATALOGS[langKey]?.find((m) => m.id === p.id);
    const fallback = CATALOGS.en.find((m) => m.id === p.id);
    const active = localized || fallback || p;

    return {
      title:
        active.text ||
        p.text ||
        p.name ||
        active.devanagari ||
        p.devanagari ||
        "",
      description:
        Array.isArray(active.explanation)
          ? active.explanation.join(" ")
          : p.explanation || p.description || "",
    };
  }

  if (p.source === "custom" || p.source === "api") {
    return {
      title: p.name || "Custom Practice",
      description: p.description || "",
    };
  }

  return {
    title: t(`practices.${p.id}.name`, { defaultValue: p.name }),
    description: t(`practices.${p.id}.description`, {
      defaultValue: p.description,
    }),
  };
};

/* ----------------------------------------------- */
/* 🚀 MAIN SCREEN STARTS HERE */
/* ----------------------------------------------- */

const ConfirmSanatanPractices = ({ route }) => {
  const navigation: any = useNavigation();
  const { t, i18n } = useTranslation();
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const [loading, setLoading] = useState(false);

  const {
    localPractices,
    addPractice,
    removePractice,
    cartModalVisible,
    setCartModalVisible,
  } = useCart();

  const mantraData = route?.params?.mantraData || [];



  const initialValues = {
    mantras: mantraData.map((item) => ({
      ...item,
      trigger: item.trigger || "",
      reps: item.reps || "",
      day: item.day || "Daily",
    })),
  };

  const validationSchema = Yup.object().shape({
    mantras: Yup.array().of(
      Yup.object().shape({
        reps: Yup.string()
          .required("Reps are required")
          .matches(/^[0-9]+$/, "Only digits allowed"),
        day: Yup.string().required("Day is required"),
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
        // practices: values.mantras,
        practices: finalSubmitRef.current,// coming from cart
        dharma_level:
          route?.params?.selectedIndex === 0
            ? "beginner"
            : route?.params?.selectedIndex === 1
              ? "intermediate"
              : "advanced",
        is_authenticated: true,
        recaptcha_token: token,
      };
      console.log("FINAL SUBMIT PAYLOAD:", JSON.stringify(payload));
      dispatch(
        submitDailyDharmaSetup(payload, (res) => {
          setLoading(false);
          if (res.success) navigation.navigate("TrackerTabs", { screen: "Tracker" });
        })
      );
    },
  });

  /* ----------------------------------------------- */
  /* 🛒 CART MODAL */
  /* ----------------------------------------------- */

  //   const CartModal = () => (
  //     <Modal
  //       isVisible={cartModalVisible}
  //       backdropOpacity={0.5}
  //       onBackdropPress={() => setCartModalVisible(false)}
  //     >
  //       <View
  //         style={{
  //           backgroundColor: "#fff",
  //           padding: 16,
  //           borderRadius: 14,
  //           maxHeight: 450,
  //         }}
  //       >
  //         <View
  //           style={{
  //             flexDirection: "row",
  //             justifyContent: "space-between",
  //             marginBottom: 12,
  //           }}
  //         >
  //           <TextComponent type="headerBoldText">
  //             Added Practices ({localPractices.length})
  //           </TextComponent>

  //           <Ionicons
  //             name="close"
  //             size={28}
  //             onPress={() => setCartModalVisible(false)}
  //           />
  //         </View>

  //         <ScrollView>
  //           {localPractices.map((p) => (
  //             <View
  //               key={p.id}
  //               style={{
  //                 flexDirection: "row",
  //                 justifyContent: "space-between",
  //                 marginBottom: 10,
  //               }}
  //             >
  //               <TextComponent>{p.title}</TextComponent>

  //               <TouchableOpacity onPress={() => removePractice(p.id)}>
  //                 <Ionicons name="close-circle" size={24} color="red" />
  //               </TouchableOpacity>
  //             </View>
  //           ))}
  //         </ScrollView>
  //       </View>
  //     </Modal>
  //   );

  const finalSubmitRef = useRef([]);

  const renderMantraItem = ({ item, index }) => {
    const error = formik.errors?.mantras?.[index];
    const { title: displayName, description: displayDescription } =
      getDisplayContent(item, t, i18n);

    return (
      <View
        style={{
          backgroundColor: Colors.Colors.header_bg,
          padding: 16,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: Colors.Colors.Yellow,
          marginHorizontal: 15,
          marginVertical: 10,
        }}
      >
        <TextComponent
          type="headerText"
          style={{}}
        >
          {item.icon} {displayName}
        </TextComponent>
        {/* {!!displayDescription && (
          <TextComponent
            type="semiBoldText"
            style={{ color: Colors.Colors.Light_black ,marginTop:4}}
          >
            {displayDescription}
          </TextComponent>
        )} */}
        {error?.trigger && (
          <TextComponent style={{ color: "red" }}>
            {error.trigger}
          </TextComponent>
        )}
        <TextComponent
          type="cardText"
          style={{ marginVertical: 4 }}
        >
          Reps (1 - 1000)
        </TextComponent>

        <TextInput
          style={{
            marginTop: 4,
            borderWidth: 1,
            borderColor: "#BDC4CD",
            borderRadius: 6,
            padding: 10,
            backgroundColor: "#FFFFFF"
          }}
          placeholder="Enter reps"
          keyboardType="number-pad"
          value={formik.values.mantras[index].reps}
          onChangeText={(val) =>
            formik.setFieldValue(`mantras[${index}].reps`, val)
          }
        />
        {error?.reps && (
          <TextComponent style={{ color: "red", marginTop: 4, alignSelf: "flex-end" }}>
            {error.reps}
          </TextComponent>
        )}
        <TextComponent
          type="cardText"
          style={{ marginVertical: 4 }}
        >
          Days
        </TextComponent>
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
          style={{ ...styles.setupdropdown, backgroundColor: "#FFFFFF" }}
          value={formik.values.mantras[index].day}
          onChange={(item) =>
            formik.setFieldValue(`mantras[${index}].day`, item.value)
          }
        />

        {error?.day && (
          <TextComponent style={{ color: "red", marginTop: 4 }}>
            {error.day}
          </TextComponent>
        )}
      </View>
    );
  };



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Colors.white }}>
      <StatusBar barStyle="dark-content" />
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
            return new Promise<void>((resolve) => {
              finalSubmitRef.current = list;

              formik.submitForm().then(() => {
                resolve();
              });
            });
          }}
        />


        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar */}
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
            <TextComponent type="DailyDetailheaderText" style={styles.pageTitle}>
            Set Sanatan Practices
            </TextComponent>
            <CartIcon />
            {/* <TouchableOpacity
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
              <TextComponent
                type="semiBoldText"
                style={{ color: "#fff", fontSize: 11 }}
              >
                {localPractices.length}
              </TextComponent>
            </View>

            <Image
              source={require("../../../assets/cart.png")}
              style={{ width: 30, height: 30 }}
              resizeMode="contain"
            />
          </TouchableOpacity> */}
          </View>
          <TextComponent type="subText" style={{ color: Colors.Colors.BLACK, textAlign: "center", marginHorizontal: 10 }}>Set how often you want to do each part of your routine.</TextComponent>
          <TextComponent type="subDailyText" style={{ color: Colors.Colors.BLACK, textAlign: "center", marginHorizontal: 10, marginTop: 12 }}>Review your practices before adding them to your routine</TextComponent>

          <TextComponent type="DailyHeaderText" style={{ marginHorizontal: 16, marginTop: 20 }}>
            Added Practices ({formik.values.mantras.length})
          </TextComponent>
          <TextComponent type="subDailyText" style={{ color: Colors.Colors.BLACK, marginHorizontal: 16, marginTop: 4 }}>
            These will become part of your routine
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
              // position: "absolute",
              // bottom: 0,
              // left: 0,
              // right: 0,
              padding: 16,
              // backgroundColor: "#fff",
              // borderTopWidth: 1,
              // borderTopColor: "#ddd",
            }}
          >
            <TouchableOpacity
              // onPress={() => {formik.handleSubmit()}}
              onPress={() => {
                // 1️⃣ Add all configured practices to GLOBAL CART
                formik.values.mantras.forEach((item) => {
                  addPractice({
                    id: item.id || item.practice_id || Date.now() + Math.random(),
                    name: item.name || item.text || item.title,
                    reps: item.reps,
                    day: item.day,
                    icon: item.icon,
                    description: item.description,
                    source: "confirm-screen",
                    full_item: item,
                  });
                });
                navigation.navigate("SubmitDailyPracticesScreen", {
                  practices: formik.values.mantras,
                  custom: true,
                  sanatan: true,
                });

                // 2️⃣ Open cart
                // setCartModalVisible(true);
              }}
              style={{
                backgroundColor: Colors.Colors.App_theme,
                paddingVertical: 8,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <TextComponent type="cardText" style={{ color: "#fff" }}>
                Confirm
              </TextComponent>
            </TouchableOpacity>
          </View>
        </ScrollView>


        <LoadingOverlay visible={loading} text="Saving..." />
      </ImageBackground>
    </SafeAreaView>
  );
};

export default ConfirmSanatanPractices;

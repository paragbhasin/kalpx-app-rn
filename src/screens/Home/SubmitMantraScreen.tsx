import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import { useFormik } from "formik";
import React from "react";
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
import TextComponent from "../../components/TextComponent";
import { RootState } from "../../store";
import { submitDailyDharmaSetup } from "./actions";
import styles from "./homestyles";

const { width } = Dimensions.get("window");

// Dropdown options
const rememberdata = [
  { label: "At Sunrise", value: "sunrise" },
  { label: "After Waking Up", value: "wakingUp" },
  { label: "Morning", value: "morning" },
  { label: "During Commute", value: "commute" },
  { label: "Before Starting Work or Study", value: "workStart" },
  { label: "Mid-Day Break", value: "midDay" },
  { label: "At Lunch", value: "lunch" },
  { label: "After Returning Home", value: "returnHome" },
  { label: "At Sunset", value: "sunset" },
  { label: "At Dinner", value: "dinner" },
  { label: "Before Bed", value: "bedtime" },
  { label: "Brahma Muhurta (Pre-Dawn Sacred Time)", value: "brahmaMuhurta" },
];

const SubmitMantraScreen = ({ route }) => {
  const navigation: any = useNavigation();
  const { t } = useTranslation();

   const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const mantraData = route?.params?.mantraData || [];

  console.log("route >>>>>>>>>",route?.params);

  // Create Formik initial values dynamically
  const initialValues = {
    mantras: mantraData.map((item) => ({
      ...item,
      trigger: "", // default empty selection for each mantra
    })),
  };

  // Yup validation
  const validationSchema = Yup.object().shape({
    mantras: Yup.array().of(
      Yup.object().shape({
        trigger: Yup.string().required("Please select a time."),
      })
    ),
  });

  // Formik setup
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
         const token = await AsyncStorage.getItem("refresh_token");
      console.log("selectedIndex >>>>>", route?.params?.selectedIndex,token);
      console.log("Final submitted values >>>>>", values.mantras);
      const payload = {
        practices : values.mantras,
        dharma_level:route?.params?.selectedIndex === 0 ? "beginner" : route?.params?.selectedIndex === 1 ? "intermediate" : route?.params?.selectedIndex === 2 ? "advanced" : "beginner",
   is_authenticated:true,
   recaptcha_token:token
      }
         dispatch(
        submitDailyDharmaSetup(payload, (res) => {
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

  // Renders each mantra block
  const renderMantraItem = ({ item, index }) => {
    const error =
      formik.touched?.mantras?.[index]?.trigger &&
      formik.errors?.mantras?.[index]?.trigger;

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
        <TextComponent
          type="boldText"
          style={{
            color: Colors.Colors.BLACK,
            fontSize: FontSize.CONSTS.FS_14,
          }}
        >
          {item.icon} {item.name ? item.name  :item.text}
        </TextComponent>

        <TextComponent
          type="semiBoldText"
          style={{ color: Colors.Colors.Light_black, marginVertical: 6 }}
        >
          <TextComponent
            type="boldText"
            style={{
              color: Colors.Colors.BLACK,
              fontSize: FontSize.CONSTS.FS_14,
            }}
          >
            Description:
          </TextComponent>{" "}
          {item.description ? item.description: item.explanation}
        </TextComponent>

        <TextComponent
          type="boldText"
          style={{
            color: Colors.Colors.BLACK,
            fontSize: FontSize.CONSTS.FS_14,
            marginBottom: 6,
          }}
        >
          Time
        </TextComponent>

        <View style={styles.setupcontainer}>
          <Dropdown
            data={rememberdata}
            labelField="label"
            valueField="value"
            placeholder="Select Time"
            value={formik.values.mantras[index].trigger}
            onChange={(val) =>
              formik.setFieldValue(`mantras[${index}].trigger`, val.value)
            }
            style={styles.setupdropdown}
            selectedTextStyle={styles.selectedText}
            placeholderStyle={styles.placeholder}
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Colors.white }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.Colors.header_bg}
        translucent={false}
      />
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
          Level Beginner
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
          Your Daily Practice Tracker
        </TextComponent>

        {/* Buttons */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginVertical: 20,
          }}
        >
          <TouchableOpacity
            onPress={() => {formik.handleSubmit()}}
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
              Submit My Practice
            </TextComponent>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {}}
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
              Edit Details
            </TextComponent>
            <Image
              source={require("../../../assets/edit_icon.png")}
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>
        </View>

        <FlatList
          data={formik.values.mantras}
          renderItem={renderMantraItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SubmitMantraScreen;

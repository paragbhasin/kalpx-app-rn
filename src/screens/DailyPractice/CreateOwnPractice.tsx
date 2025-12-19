import { useNavigation } from "@react-navigation/native";
import { Formik } from "formik";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as Yup from "yup";

import Header from "../../components/Header";
import TextComponent from "../../components/TextComponent";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { AnyAction } from "@reduxjs/toolkit";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import CartModal from "../../components/CartModal"; // ✅ GLOBAL CART MODAL
import FontSize from "../../components/FontSize";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useCart } from "../../context/CartContext";
import { RootState } from "../../store";
import { submitDailyDharmaSetup } from "../Home/actions";
import styles from "./CreateOwnStyle";

const addDayOptions = [
  { label: "Daily", value: "Daily" },
  { label: "Monday", value: "Mon" },
  { label: "Tuesday", value: "Tue" },
  { label: "Wednesday", value: "Wed" },
  { label: "Thursday", value: "Thu" },
  { label: "Friday", value: "Fri" },
  { label: "Saturday", value: "Sat" },
  { label: "Sunday", value: "Sun" },
];

const validationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  reps: Yup.string().required("Reps are required"),
  day: Yup.string().required("Please select a day"),
});

const generateCustomPractice = (values) => {
  const uuid =
    "custom_" +
    Date.now().toString() +
    "_" +
    Math.random().toString(36).substring(2, 10);

  return {
    practice_id: uuid,
    name: values.title,
    description: values.description,
    meaning: null,
    icon: "🕉️",
    mantra: null,
    source: "custom",
    sankalpa: null,
    category: "Custom",
    trigger: null,
    status: "active",
    assigned_at: new Date().toISOString(),
    deactivated_at: null,

    /** 🔥 ADD THESE TWO AT ROOT FOR UI (Fix AddedPracticeCard) */
    day: values.day,
    reps: values.reps,
  isSubmitted: false,
    details: {
      days: [values.day],
      reps: values.reps,
      details: {
        id: uuid,
        day: values.day,
        reps: values.reps,
        title: values.title,
        summary: values.description,
        isCustom: true,
        description: values.description,
      },
      benefits: [],
    },
  };
};




const CreateOwnPractice = () => {
  const navigation: any = useNavigation();
  const { t } = useTranslation();
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
const [loading, setLoading] = useState(false);


  const {
    localPractices,
    addPractice,
    removePractice,
    cartModalVisible,
    setCartModalVisible
  } = useCart();

  // Show only custom practices created here and not submitted yet
const customPractices = localPractices.filter(
  (item) =>
    item.source === "custom" &&       // must be custom practice
    item.details?.details?.isCustom && // created in this screen
    item.isSubmitted !== true          // not submitted yet
);


  // const handleSave = (practice) => {
  //   addPractice({ ...practice, id: Date.now() });
  // };

  const handleSave = (values) => {
  const formatted = generateCustomPractice(values);
  addPractice(formatted);
};


  const handleRemove = (id) => removePractice(id);

  return (
    <View style={styles.container}>
      <Header />

     <CartModal
  onConfirm={async (list) => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("refresh_token");

      const payload = {
        practices: list,
        dharma_level: "beginner", // or dynamic if needed
        is_authenticated: true,
        recaptcha_token: token,
      };

      console.log("CUSTOM PRACTICE SUBMIT PAYLOAD:", JSON.stringify(payload));

      return new Promise<void>((resolve) => {
        dispatch(
          submitDailyDharmaSetup(payload, (res) => {
            setLoading(false);

            if (res.success) {
              // CartModal will already clearCart()
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
  <ImageBackground
                    source={require("../../../assets/Tracker_BG.png")}
                    style={{
                      alignSelf: "center",
                          justifyContent: "center",
                          alignItems: "center",
                          width: FontSize.CONSTS.DEVICE_WIDTH,
                    }}
                    imageStyle={{
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
                    }}
                  >

      <ScrollView style={styles.innerScroll} showsVerticalScrollIndicator={false}>
        {/* HEADER ROW */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 6,
            marginTop: 8,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#000" />
          </TouchableOpacity>

          <TextComponent type="DailyHeaderText" style={styles.pageTitle}>
       Create Your Own Practice
          </TextComponent>

          {/* CART ICON */}
          <TouchableOpacity
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
              <TextComponent type="semiBoldText" style={{ color: "#fff", fontSize: 11 }}>
                {localPractices.length}
              </TextComponent>
            </View>

            <Image
              source={require("../../../assets/cart.png")}
              style={{ width: 30, height: 30 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
<TextComponent type="subDailyText" style={{marginHorizontal:2,marginTop:4,textAlign:"center"}}>Add a personal mantra or practice to your routine</TextComponent>

        {/* ADDED PRACTICES GRID */}
      {customPractices.length > 0 && (
  <View style={{ marginHorizontal: 2}}>
    <TextComponent type="DailyHeaderText" style={styles.sectionTitle}>
      Added Practices ({customPractices.length})
    </TextComponent>

    <FlatList
      data={customPractices}   // ✅ Only custom unsent practices
      numColumns={2}
      keyExtractor={(item) => item.practice_id}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      renderItem={({ item }) => (
       <View
  style={{
    marginTop:10,
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingTop: 18,
    paddingBottom: 12,
    paddingHorizontal: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#D4A017",
    overflow: "visible",      // 🔥 required for tag + close button
  }}
>
  {/* REMOVE BUTTON (top-right outside) */}
  <TouchableOpacity
    onPress={() => removePractice(item.practice_id)}
    style={{
      position: "absolute",
      top: -8,
      right: 0,
      backgroundColor: "#D4A017",
      borderRadius: 6,
      width: 20,
      height: 20,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 999,
    }}
  >
    <Ionicons name="close" size={14} color="#FFFFFF" />
  </TouchableOpacity>

  {/* TAG (PROPER ALIGNMENT) */}
  <View
    style={{
      position: "absolute",
      top: 0,
      alignSelf: "center",
      backgroundColor: "#D4A017",
      paddingVertical: 2,
      paddingHorizontal: 14,
      borderRadius: 4,
    }}
  >
    <TextComponent type="boldText" style={{ color: "#FFFFFF" }}>
      {(item.day || "Daily") + "   " + (item.reps || "") + " X"}
    </TextComponent>
  </View>

  {/* TITLE */}
  <TextComponent
    type="mediumText"
    numberOfLines={2}
    ellipsizeMode="tail"
    style={{
      fontSize: FontSize.CONSTS.FS_13,
      color: "#000000",
      textAlign: "center",
      marginTop: 10,
    }}
  >
    {item.name}
  </TextComponent>
</View>


      )}
    />
  </View>
)}


        {/* FORM */}
        <Formik
          initialValues={{ title: "", description: "", reps: "", day: "Daily" }}
          validationSchema={validationSchema}
          onSubmit={(values, { resetForm }) => {
            handleSave(values);
            resetForm();
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            setFieldValue,
          }) => (
            <View style={{ paddingHorizontal:2 }}>
              <TextComponent type="headerSubBoldText" style={{marginTop:4}}>Create a New Practice</TextComponent>
              {/* TITLE */}
              <TextComponent type="semiBoldText" style={styles.label}>
                Title
              </TextComponent>

              <TextInput
                style={styles.input}
                placeholder="e.g., Om Namo Bhagavate, Evening Gratitude, Breath Awareness"
                onChangeText={handleChange("title")}
                onBlur={handleBlur("title")}
                value={values.title}
              />

              {touched.title && errors.title && (
                <TextComponent type="errorText" style={styles.error}>
                  {errors.title}
                </TextComponent>
              )}

              {/* DESCRIPTION */}
              <TextComponent type="semiBoldText" style={styles.label}>
                Description
              </TextComponent>

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g., A mantra for surrender and divine protection."
                multiline
                onChangeText={handleChange("description")}
                onBlur={handleBlur("description")}
                value={values.description}
              />

              {touched.description && errors.description && (
                <TextComponent type="errorText" style={styles.error}>
                  {errors.description}
                </TextComponent>
              )}

              {/* REPS */}
              <TextComponent type="semiBoldText" style={styles.label}>
                Reps
              </TextComponent>
<TextComponent type="mediumText" style={{color:"#979797",marginBottom:4}}>How many times would you repeat this?</TextComponent>
              <TextInput
                style={styles.input}
                placeholder="e.g., 9×, 27×, 108×"
                onChangeText={handleChange("reps")}
                onBlur={handleBlur("reps")}
                value={values.reps}
              />

              {touched.reps && errors.reps && (
                <TextComponent type="errorText" style={styles.error}>
                  {errors.reps}
                </TextComponent>
              )}

              {/* DAY */}
              <TextComponent type="semiBoldText" style={styles.label}>
                Day
              </TextComponent>
<TextComponent type="mediumText" style={{color:"#979797",marginBottom:4}}>How often will you do this?</TextComponent>
              <Dropdown
                data={addDayOptions}
                labelField="label"
                valueField="value"
                placeholder="Select Day"
                value={values.day}
                onChange={(item) => setFieldValue("day", item.value)}
                style={styles.setupdropdown}
              />

              {/* SAVE BUTTON */}
              <TouchableOpacity style={styles.saveBtn} onPress={() => {handleSubmit()}}>
                <TextComponent type="headerSubBoldText" style={{ color: "#fff" }}>
                  Add to my routine 
                </TextComponent>
              </TouchableOpacity>
              <TextComponent type="mediumText" style={{color:"#000000",marginVertical:8,textAlign:"center"}}>This will be added to your Practice list</TextComponent>
              <TouchableOpacity style={{backgroundColor:"#FDF5E9",borderColor:"#D4A017",borderWidth:1,alignItems:"center",alignSelf:"center",padding:10,borderRadius:5,marginTop:12}}   onPress={() => {
    if (customPractices.length === 0) {
      alert("Please add at least one practice");
      return;
    }

    navigation.navigate("SubmitDailyPracticesScreen", {
      practices: customPractices,
      custom:true
    });
  }}
>
                <TextComponent type="streakSadanaText">Review added practices</TextComponent>
              </TouchableOpacity>
            </View>
          )}
        </Formik>

        {/* BROWSE SECTION */}
        {/* <View
          style={{
            marginTop: 20,
            borderColor: "#CC9B2F",
            borderWidth: 1,
            borderRadius: 8,
            alignItems: "center",
            marginHorizontal: 16,
            padding: 18,
          }}
        >
          <TextComponent type="headerSubBoldText" style={{ color: "#282828" }}>
            Want to add more practices?
          </TextComponent>

          <TextComponent type="subDailyText" style={{ marginTop: 8 }}>
            Explore our curated collection of mantras & sankalps
          </TextComponent>

          <TouchableOpacity 
          onPress={() => {navigation.navigate("TrackerTabs", { screen: "History" })}}
            style={{
              backgroundColor: "#D4A017",
              alignSelf: "center",
              padding: 10,
              borderRadius: 8,
              marginTop: 14,
            }}
          >
            <TextComponent type="headerSubBoldText" style={{ color: "#FFFFFF" }}>
              Browse Practices
            </TextComponent>
          </TouchableOpacity>
        </View> */}
        <LoadingOverlay visible={loading} text="Saving..." />
      </ScrollView>
      </ImageBackground>
    </View>
  );
};

export default CreateOwnPractice;
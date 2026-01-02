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
            onChange={() => { }}
            onBackPress={() => setShowDetails(false)}
            isLocked={true}
            selectedCount={item.reps}
            onSelectCount={() => { }}
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
          navigation.navigate("TrackerTabs", { screen: "Tracker", fromSetup: true });
        }
      })
    );
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar barStyle="dark-content" />

      <ImageBackground

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
              {route?.params?.sanatan
                ? "Save Sanatan Practices"
                : route?.params?.custom
                  ? "Create Your Own Practice"
                  : "Save my Practices"}
            </TextComponent>

      
            <CartIcon />
          </View>
                <TextComponent
            type="subDailyText"
                      style={{
                        color: Colors.Colors.BLACK,
                        textAlign: "center",
                        marginHorizontal: 10,
                        marginTop: 12,
                      }}
            >
                         Review your practices before adding them to your routine

            </TextComponent>

          <TextComponent
            type="DailyHeaderText"
            style={{ marginHorizontal: 16, marginTop: 20 }}
          >
            Added Practices ({routePractices.length})
          </TextComponent>
                    <TextComponent type="subDailyText" style={{ color: Colors.Colors.BLACK, marginHorizontal: 16, marginTop: 4 }}>
            These will become part of your routine
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
            <TextComponent type="subDailyText" style={{ color: Colors.Colors.BLACK, marginHorizontal: 16, marginTop: 4 }}>
   You can edit them anytime
          </TextComponent>
        </View>

        <LoadingOverlay visible={loading} text="Saving..." />
      </ImageBackground>
    </SafeAreaView>
  );
};

export default SubmitDailyPracticesScreen;
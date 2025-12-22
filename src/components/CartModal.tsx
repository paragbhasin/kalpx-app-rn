import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import { Card } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";

import { useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import { useCart } from "../context/CartContext";
import { fetchDailyPractice } from "../screens/Streak/actions";
import styles from "../screens/Tracker/TrackerEditStyles";
import { RootState } from "../store";
import LoadingButton from "./LoadingButton";
import TextComponent from "./TextComponent";
import { useUserLocation } from "./useUserLocation";

export default function CartModal({ onConfirm }) {
  const navigation: any = useNavigation();

  const {
    cartModalVisible,
    setCartModalVisible,
    localPractices,
    removePractice,
    clearCart,
    removedApiIds,
  } = useCart();

  const [loading, setLoading] = useState(false);
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const { locationData, loading: locationLoading } = useUserLocation();

  useEffect(() => {
    if (!cartModalVisible) return;

    if (!locationLoading && locationData?.timezone) {
      const today = moment().format("YYYY-MM-DD");
      dispatch(fetchDailyPractice(today, locationData.timezone));
    }
  }, [cartModalVisible, locationLoading, locationData?.timezone]);

  const dailyPractice = useSelector(
    (state: RootState) => state.dailyPracticeReducer
  );

  const rawApiPractices = dailyPractice?.data?.active_practices || [];

  const apiPractices = rawApiPractices.filter(
    (p: any) => !removedApiIds.has(p.practice_id ?? p.id)
  );



  const recentlyAdded = localPractices.filter(
  (item) =>
    !rawApiPractices.some(
      (x: any) => x.practice_id === item.practice_id
    )
);

function getPracticeType(practiceId: string) {
  if (!practiceId) return "";

  if (practiceId.startsWith("mantra.")) return "mantra";
  if (practiceId.startsWith("sankalp.")) return "sankalp";
  if (practiceId.startsWith("practice.")) return "practice";

  return "sanatan";
}

function extractRepsAndDay(pr) {
  const d = pr.details ?? pr;
  return {
    reps: d.reps ?? "",
    day: d.day ?? "Daily",
  };
}



  return (
    <Modal
      isVisible={cartModalVisible}
      onBackdropPress={() => setCartModalVisible(false)}
      backdropOpacity={0.4}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={{ margin: 0, justifyContent: "flex-end" }}
    >
      <ImageBackground
        source={require("../../assets/CardBG.png")}
        style={styles.bottomSheet}
        imageStyle={styles.modalBGImage}
      >
        <View style={styles.dragIndicator} />
        <View style={styles.modalHeader}>
          <TextComponent type="headerBoldText" style={{ color: "#282828" }}>
            Your Practices ({localPractices.length})
          </TextComponent>

          <Ionicons
            name="close"
            size={26}
            color="#000"
            onPress={() => setCartModalVisible(false)}
          />
        </View>

        <ScrollView style={{ maxHeight: 450 }}>
          {apiPractices.length > 0 && (
            <>
              <TextComponent type="boldText" style={styles.sectionHeader}>
                Active Practices
              </TextComponent>
{apiPractices.map((item: any, index: number) => {
  const { reps, day } = extractRepsAndDay(item);

  return (
    <Card key={`active-${index}`} style={styles.itemRow}>
      <View style={{ flex: 1 }}>
        <TextComponent type="mediumText">
          {item?.name || item?.title}
        </TextComponent>

        <TextComponent style={styles.itemType}>
          {getPracticeType(item.practice_id)}
          {day ? ` • ${day}` : ""}
          {reps ? ` • ${reps}×` : ""}
        </TextComponent>
      </View>
    </Card>
  );
})}

              <View
                style={{
                  height: 1,
                  backgroundColor: "#D4A017",
                  opacity: 0.3,
                  marginVertical: 12,
                }}
              />
            </>
          )}

          {recentlyAdded.length > 0 && (
            <TextComponent type="boldText" style={styles.sectionHeader}>
              Added Recently
            </TextComponent>
          )}

          {recentlyAdded.map((item: any) => (
            <Card key={item.unified_id ?? item.id} style={styles.itemRow}>
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <TextComponent type="mediumText">
                    {item?.title || item?.name}
                  </TextComponent>
<TextComponent style={styles.itemType}>
  {getPracticeType(item.practice_id)}
  {item?.details?.day || item?.day ? ` • ${item.details?.day ?? item.day}` : ""}
  {item?.details?.reps || item?.reps ? ` • ${item.details?.reps ?? item.reps}×` : ""}
</TextComponent>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    removePractice(item.unified_id ?? item.id)
                  }
                >
                  <Ionicons name="close-circle" size={26} color="#C0392B" />
                </TouchableOpacity>
              </View>
            </Card>
          ))}
          {apiPractices.length === 0 && recentlyAdded.length === 0 && (
            <TextComponent style={{ textAlign: "center", marginTop: 20 }}>
              No Practices Added
            </TextComponent>
          )}
        </ScrollView>
        {recentlyAdded.length > 0 && (
          <View style={{ marginTop: 20,marginBottom: 20 }}>
            <LoadingButton
              loading={loading}
              text="Submit"
              disabled={loading}
              showGlobalLoader={true}
              style={{
                backgroundColor: "#D4A017",
                paddingVertical: 14,
                borderRadius: 25,
                alignItems: "center",
              }}
              textStyle={{
                color: "#fff",
                fontSize: 16,
                fontWeight: "600",
              }}
              onPress={async () => {
                try {
                  setLoading(true);
                  function extractRepsAndDay(pr: any) {
  const d = pr.details ?? pr;

  return {
    reps: d.reps ?? "",
    day: d.day ?? "Daily",
  };
}


                  const finalList = [
                    ...apiPractices.map((pr: any) => {
                      const { reps, day } = extractRepsAndDay(pr);
                      return {
                        ...pr,
                        source: "api",
                        reps,
                        day,
                      };
                    }),
                    ...recentlyAdded.map((pr: any) => ({
                      ...pr,
                      source: "new",
                    })),
                  ];

                  await onConfirm(finalList);
                  clearCart();
                  setCartModalVisible(false);
                } finally {
                  setLoading(false);
                }
              }}
            />
          </View>
        )}
<LoadingButton
  loading={false}
  text="Browse More Practices"
  showGlobalLoader={false}
  style={{
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#D4A017",
    marginBottom: 20,
  }}
  textStyle={{
    color: "#D4A017",
    fontSize: 15,
    fontWeight: "600",
  }}
  onPress={() => {
    setCartModalVisible(false);
    setTimeout(() => {
      navigation.navigate("TrackerTabs", { screen: "History" });
    }, 250);
  }}
/>
      </ImageBackground>
    </Modal>
  );
}
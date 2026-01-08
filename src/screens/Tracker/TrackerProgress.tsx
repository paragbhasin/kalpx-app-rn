import { useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  View
} from "react-native";
import { Card } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import Colors from "../../components/Colors";
import LoadingOverlay from "../../components/LoadingOverlay";
import PracticeDailyModal from "../../components/PracticeDailyModal";
import TextComponent from "../../components/TextComponent";
import { useUserLocation } from "../../components/useUserLocation";
import { RootState } from "../../store";
import { getDailyDharmaTracker } from "../Home/actions";
import { fetchDailyPractice, fetchPracticeHistory } from "../Streak/actions";
import { useScrollContext } from "../../context/ScrollContext";
import { Animated } from "react-native";

const { width } = Dimensions.get("window");
const BOX_SIZE = Dimensions.get("window").width / 9.5;

const startOfMonth = moment().startOf("month");
const daysInMonth = moment().daysInMonth();
const firstDayWeekIndex = startOfMonth.day(); // 0 = Sun, 6 = Sat

// Create leading empty placeholders before day 1
const emptyDays = Array.from({ length: firstDayWeekIndex }, () => ({
  empty: true,
  key: Math.random().toString(),
}));

// Create actual date boxes
const dateDays = Array.from({ length: daysInMonth }, (_, i) => {
  const date = startOfMonth.clone().add(i, "days");
  return {
    day: date.date(),
    fullDate: date.format("YYYY-MM-DD"),
    empty: false,
  };
});

// Final Calendar List
const calendarData = [...emptyDays, ...dateDays];

const TrackerProgress = () => {
  const navigation: any = useNavigation();
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [showPractiseModal, setShowPractiseModal] = useState(false);
  const [trackerData, setTrackerData] = useState<any>(null);
  const [fetchLoading, setLoading] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState({
    notCompleted: [],
    completed: [],
    status: "not_done",
  });
  const { handleScroll } = useScrollContext();

  const { t } = useTranslation();
  const { locationData, loading: locationLoading, error } = useUserLocation();
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const { data: streakData } = useSelector((state: RootState) => state.practiceStreaksReducer);

  useEffect(() => {
    dispatch(
      getDailyDharmaTracker((res) => {
        if (res.success) setTrackerData(res.data);
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (!locationLoading && locationData.timezone) {
      dispatch(fetchPracticeHistory(locationData.timezone));
    }
  }, [dispatch, locationData.timezone, locationLoading]);

  // ✅ Fetch today's active practices once location/timezone is ready
  useEffect(() => {
    if (!locationLoading && locationData.timezone) {
      const today = moment().format("YYYY-MM-DD");
      dispatch(fetchDailyPractice(today, locationData.timezone));
    }
  }, [dispatch, locationData.timezone, locationLoading]);

  const milestones = [
    { days: 9, name: t("streakScreen.milestones.blessing") },
    { days: 27, name: t("streakScreen.milestones.tapasya") },
    { days: 54, name: t("streakScreen.milestones.sadhana") },
    { days: 108, name: t("streakScreen.milestones.dharmaLight") },
  ];

  // const sankalpCount = streakData?.sankalp || 0;
  const sankalpCount: any = 10;
  const trackerCount = trackerData?.streak_count || 0;
  const mantraCount = streakData?.mantra || 0;

  const highestStreak = Math.max(sankalpCount ?? 0, mantraCount ?? 0);
  const currentMilestone =
    milestones.slice().reverse().find((m) => highestStreak >= m.days) || null;

  const dailyPractice: any = useSelector(
    (state: RootState) => state.dailyPracticeReducer
  );
  const weekDays = dailyPractice?.data?.week_days || {};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Colors.white }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.Colors.header_bg}
        translucent={false}
      />
      {/* <ImageBackground
                          source={require("../../../assets/Tracker_BG.png")}
                          style={{
                            alignSelf: "center",
                                justifyContent: "center",
                                alignItems: "center",
                                paddingVertical: 8,
                                // paddingHorizontal: 10,
                                borderTopRightRadius: 16,
                                borderTopLeftRadius: 16,
                                width: FontSize.CONSTS.DEVICE_WIDTH,
                          }}
                          imageStyle={{
                                borderTopRightRadius: 16,
          borderTopLeftRadius: 16,
          alignSelf: "center",
          justifyContent: "center",
          alignItems: "center",
                          }}
                        > */}
      <Animated.ScrollView
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <TextComponent type="headerSubBoldText" style={{ alignSelf: "center" }}>Your Progress</TextComponent>
        <TextComponent type="mediumText" style={{ alignSelf: "center", textAlign: "center", color: "#282828" }}>A gentle reminder of how your practice is unfolding.</TextComponent>
        <TextComponent type="streakSadanaText" style={{ alignSelf: "center", marginTop: 5 }} >
          {currentMilestone ? t("streakScreen.youEarned", { badge: currentMilestone.name }) : t("sadanaTracker.noBadge")}
        </TextComponent>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 6,
            alignSelf: "center"
          }}
        >
          <TextComponent type="streakSadanaText">  {t("sadanaTracker.streakCount", { count: trackerCount })}</TextComponent>
          {/* <Image
              source={require("../../../assets/Streak_A1.png")}
              style={{ height: 20, width: 20, marginLeft: 4 }}
            /> */}
        </View>
        <Card
          style={{
            backgroundColor: Colors.Colors.white,
            marginHorizontal: 14,
            marginTop: 20,
            borderColor: "#D4A017",
            borderWidth: 1,
            paddingBottom: 16,
          }}
        >
          <TextComponent
            type="DailyboldText"
            style={{ color: Colors.Colors.BLACK, margin: 8 }}
          >
            Current Week Status
          </TextComponent>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: 10, marginVertical: 5 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ backgroundColor: "#36BD00", width: 30, height: 24, borderRadius: 5, marginRight: 6 }} />
              <TextComponent type="mediumText" style={{ color: Colors.Colors.Daily_black }}>Completed</TextComponent>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ backgroundColor: "#E4E437", width: 30, height: 24, borderRadius: 5, marginRight: 6 }} />
              <TextComponent type="mediumText" style={{ color: Colors.Colors.Daily_black }}>Incomplete</TextComponent>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ backgroundColor: "#bb3f3f", width: 30, height: 24, borderRadius: 5, marginRight: 6 }} />
              <TextComponent type="mediumText" style={{ color: Colors.Colors.Daily_black }}>Missed</TextComponent>
            </View>
          </View>
          <View
            style={{
              borderBottomColor: "#616161",
              borderBottomWidth: 0.35,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              // justifyContent: "space-between",
              paddingHorizontal: 6,
              marginTop: 10,
            }}
          >
            {Object.keys(weekDays).map((dateKey) => {
              const info = weekDays[dateKey];
              const dayName = moment(dateKey).format("ddd");
              const isSelected = selectedDate === dateKey;

              const status = info?.status || "not_done";

              let bgColor = "#FFE1E1";
              if (status === "completed") bgColor = "#36BD00";
              else if (status === "partial") bgColor = "#E4E437";
              else if (status === "not_done") bgColor = "#bb3f3f";
              else if (status === "disabled") bgColor = "#F2F3F5";

              const isDisabled = status === "disabled";

              return (
                <TouchableOpacity
                  key={dateKey}
                  disabled={isDisabled}
                  onPress={() => {
                    setSelectedDate(dateKey);
                    setSelectedDayData({
                      notCompleted: info?.active || [],
                      completed: info?.completed || [],
                      status: status,
                    });
                    setShowPractiseModal(true);
                  }}
                  style={{
                    // padding:10,
                    // marginVertical: 6,
                    borderRadius: 8,
                    backgroundColor: bgColor,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: isSelected ? 1 : 0,
                    borderColor: isSelected ? "#282828" : "transparent",
                    width: 50,
                    height: 36,
                    margin: 4
                    // marginRight:16
                  }}
                >
                  <TextComponent type="semiBoldText" style={{ color: isDisabled ? "#616161" : Colors.Colors.white }}>
                    {dayName}
                  </TextComponent>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>


        <Card style={{ backgroundColor: Colors.Colors.white, marginHorizontal: 16, marginTop: 20, borderColor: Colors.Colors.Yellow, borderWidth: 1, }}>
          <TextComponent
            type="DailyboldText"
            style={{
              color: Colors.Colors.BLACK,
              marginTop: 10, alignSelf: "center"
            }}
          >
            {t("sadanaTracker.calendarTitle")}
          </TextComponent>
          <View style={{ borderBottomColor: Colors.Colors.Yellow, borderBottomWidth: 1, marginVertical: 8 }} />
          <View style={{ marginHorizontal: 16 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TextComponent type="semiBoldText" style={{ color: Colors.Colors.BLACK }}>{t("sadanaTracker.completedLabel", { count: dailyPractice?.data?.completed_today?.length || 0 })}</TextComponent>
              <TextComponent type="semiBoldText" style={{ color: Colors.Colors.BLACK, marginLeft: 20 }}>{t("sadanaTracker.notDoneLabel", { count: (dailyPractice?.data?.active_practices?.length || 0) - (dailyPractice?.data?.completed_today?.length || 0), })}
              </TextComponent>
            </View>
            <TextComponent type="subDailyText" style={{ color: "#000000", marginTop: 6, alignSelf: "center" }} >{t("sadanaTracker.selectedDateLabel")}{" "}{moment(selectedDate).format("DD MMM YYYY")}</TextComponent>
            <TextComponent type="subDailyText" style={{ color: "#000000", marginTop: 6, textDecorationLine: "underline", paddingBottom: 4, alignSelf: "center" }} >Today:{" "}{moment(selectedDate).format("DD MMM YYYY")}</TextComponent>
          </View>
          <View style={{ backgroundColor: "#FDF5E9", borderColor: "#000000", borderWidth: 0.5, alignSelf: "center", padding: 4, margin: 4, borderRadius: 6 }}>
            <TextComponent type="streakSadanaText">{moment().format("MMMM")}</TextComponent>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <View
                key={day}
                style={{
                  width: BOX_SIZE,
                  height: 28,
                  margin: 3,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#FDF5E9",
                  borderColor: Colors.Colors.Yellow,
                  borderWidth: 1,
                  borderRadius: 4,
                }}
              >
                <TextComponent type="subDailyText" style={{ color: "#000", fontWeight: "600" }}>
                  {day}
                </TextComponent>
              </View>
            ))}
          </View>
          <FlatList
            data={calendarData}
            keyExtractor={(item: any, index) => item.fullDate || `empty-${index}`}
            numColumns={7}
            contentContainerStyle={{
              alignItems: "center",
              justifyContent: "center",
              paddingBottom: 20,
            }}
            renderItem={({ item }: any) => {
              if (item.empty) {
                return (
                  <View
                    style={{
                      width: BOX_SIZE,
                      height: BOX_SIZE,
                      margin: 3,
                    }}
                  />
                );
              }

              // Actual dates
              const dayData = dailyPractice?.data?.calendar_days?.[item.fullDate] || {};
              const status = dayData.status || "not_done";

              let bgColor = "#FDF5E9";
              if (status === "completed") bgColor = "#36BD00";
              else if (status === "partial") bgColor = "#E4E437";
              else if (status === "not_done") bgColor = "#bb3f3f";
              else if (status === "disabled") bgColor = "#E5E7EB";

              const textColor =
                status === "disabled"
                  ? "#6B7280"
                  : "#FFFFFF";

              return (
                <TouchableOpacity
                  disabled={status === "disabled"}
                  onPress={() => {
                    setSelectedDate(item.fullDate);
                    const d = dailyPractice?.data?.calendar_days?.[item.fullDate] || {};

                    setSelectedDayData({
                      notCompleted: d?.active || [],
                      completed: d?.completed || [],
                      status: d?.status || "not_done",
                    });

                    setShowPractiseModal(true);
                  }}
                  style={{
                    width: BOX_SIZE,
                    height: BOX_SIZE,
                    margin: 3,
                    borderRadius: 4,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: bgColor,
                    borderColor:
                      item.fullDate === selectedDate ? "#D4A017" : "transparent",
                    borderWidth: 1,
                  }}
                >
                  <TextComponent type="cardText" style={{ color: textColor }}>
                    {item.day}
                  </TextComponent>
                </TouchableOpacity>
              );
            }}
          />
        </Card>
        <PracticeDailyModal
          visible={showPractiseModal}
          date={selectedDate}
          dailyPractice={{
            active_practices: selectedDayData.notCompleted || [],
            completed_today: selectedDayData.completed || [],
            status: selectedDayData.status || "not_done"
          }}
          onClose={() => setShowPractiseModal(false)}
        />
        <LoadingOverlay visible={fetchLoading} text="Submitting..." />
      </Animated.ScrollView>
      {/* </ImageBackground> */}
    </SafeAreaView>
  );
};

export default TrackerProgress;
import { useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import moment from "moment";
import React, { useEffect, useState } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";
import Header from "../../components/Header";
import LoadingOverlay from "../../components/LoadingOverlay";
import PracticeDailyModal from "../../components/PracticeDailyModal";
import TextComponent from "../../components/TextComponent";
import { useUserLocation } from "../../components/useUserLocation";
import { RootState } from "../../store";
import { getTranslatedPractice } from "../../utils/getTranslatedPractice";
import { fetchDailyPractice, fetchPracticeHistory } from "../Streak/actions";
import { getDailyDharmaTracker, trackDailyPractice } from "./actions";

const { width } = Dimensions.get("window");

const SadanaTrackerScreen = () => {
  const navigation: any = useNavigation();
  const [reason, setReason] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [showPractiseModal, setShowPractiseModal] = useState(false);
  const [trackerData, setTrackerData] = useState<any>(null);
  const [fetchLoading, setLoading] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState({
    notCompleted: [],
    completed: [],
    status: "not_done",
  });

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

  const rememberdata = [
    { label: t("sadanaTracker.reminder.schedule_conflict"), value: "schedule_conflict" },
    { label: t("sadanaTracker.reminder.no_longer_interested"), value: "no_longer_interested" },
    { label: t("sadanaTracker.reminder.technical_issue"), value: "technical_issue" },
    { label: t("sadanaTracker.reminder.other"), value: "other" },
  ];

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
  const nextMilestone = milestones.find((m) => highestStreak < m.days) || null;
  const remainingDays = nextMilestone ? nextMilestone.days - highestStreak : 0;

  const dailyPractice: any = useSelector(
    (state: RootState) => state.dailyPracticeReducer
  );

  const practiceHistory: any = useSelector(
    (state: RootState) => state.practiceReducer
  );

  console.log("dailyPractice.data.active_practices >>>>>", JSON.stringify(dailyPractice));

  const data = practiceHistory?.data ?? [];
  const loading = practiceHistory?.loading ?? false;

  // ✅ Fetch monthly history
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

  const renderMantraItem = ({ item }: { item: any }) => (
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
        {item.deity ? `Mantra: ${item.deity}` : "Mantra"}
      </TextComponent>

      <TextComponent
        type="semiBoldText"
        style={{ color: Colors.Colors.Light_black, marginTop: 4 }}
      >
        {item.devanagari}
      </TextComponent>

      <TextComponent
        type="semiBoldText"
        style={{ color: Colors.Colors.Light_black, marginVertical: 6 }}
      >
        {item.iast}
      </TextComponent>

      {Array.isArray(item.explanation) ? (
        item.explanation.map((line, idx) => (
          <TextComponent key={idx} style={{ marginTop: 4 }}>
            {line}
          </TextComponent>
        ))
      ) : (
        <TextComponent>{item.explanation}</TextComponent>
      )}

      <TextComponent
        type="semiBoldText"
        style={{
          color: Colors.Colors.Light_grey,
          fontSize: FontSize.CONSTS.FS_10,
          marginTop: 8,
        }}
      >
        Suggested reps: {item.suggested_reps}
      </TextComponent>
    </View>
  );

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
        {/* Heading Section */}
        <TextComponent
          type="cardText"
          style={{
            textAlign: "center",
            marginTop: 15,
            fontSize: FontSize.CONSTS.FS_16,
            color: Colors.Colors.BLACK,
          }}
        >
          {t("sadanaTracker.title")}
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
          {t("sadanaTracker.subtitle")}
        </TextComponent>
        <View
          style={{
            backgroundColor: "#F6F6F6",
            borderRadius: 4,
            padding: 12,
            margin: 20,
          }}
        >
          <TextComponent
            type="cardText"
            style={{
              color: Colors.Colors.BLACK,
              fontSize: FontSize.CONSTS.FS_18,
            }}
          >
            {currentMilestone
              ? t("streakScreen.youEarned", { badge: currentMilestone.name })
              : t("sadanaTracker.noBadge")}
          </TextComponent>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 12,
            }}
          >
            <TextComponent type="mediumText">  {t("sadanaTracker.streakCount", { count: trackerCount })}</TextComponent>
            <Image
              source={require("../../../assets/Streak_A1.png")}
              style={{ height: 20, width: 20, marginLeft: 4 }}
            />
          </View>
          <TextComponent
            type="mediumText"
            style={{
              color: Colors.Colors.Light_black,
              fontSize: FontSize.CONSTS.FS_14,
            }}
          >
            {t("sadanaTracker.welcomeText")}
          </TextComponent>
          <TextComponent
            type="mediumText"
            style={{
              color: Colors.Colors.BLACK,
              fontSize: FontSize.CONSTS.FS_14,
              marginTop: 12,
            }}
          >
            {t("sadanaTracker.progressSummary", {
              completed: dailyPractice?.data?.completed_today?.length || 0,
              total: dailyPractice?.data?.active_practices?.length || 0,
              date: moment().format("MM/DD/YYYY"),
            })}
            {/* {" "}
           {`${dailyPractice?.data?.completed_today?.length || 0}/${
    dailyPractice?.data?.active_practices?.length || 0
  } practices completed on ${moment().format("MM/DD/YYYY")}`} */}
          </TextComponent>
          <TouchableOpacity
            onPress={() => { navigation.navigate("MySadana") }}
            style={{
              borderColor: Colors.Colors.Yellow,
              padding: 12,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              marginVertical: 20,
              borderRadius: 10,
            }}
          >
            <TextComponent
              type="headerSubBoldText"
              style={{
                color: Colors.Colors.Yellow,
              }}
            >
              {t("sadanaTracker.addPractices")}
            </TextComponent>
          </TouchableOpacity>
          <TextComponent
            type="mediumText"
            style={{
              color: Colors.Colors.BLACK,
              fontSize: FontSize.CONSTS.FS_14,
              marginBottom: 12,
            }}
          >
            {t("streakScreen.moreDays", {
              count: remainingDays,
              nextBadge: nextMilestone ? nextMilestone.name : "",
            })}
            {/* 6 Days to earn your next Blessing Badge */}
          </TextComponent>
        </View>

        <TextComponent
          type="cardText"
          style={{ marginBottom: 10, marginLeft: 20 }}
        >
          {t("sadanaTracker.completeTodaysPractices")}
        </TextComponent>
        <FlatList
          data={dailyPractice?.data?.active_practices || []}
          keyExtractor={(item) => item.practice_id}
          contentContainerStyle={{
            paddingBottom: 20,
          }}
          renderItem={({ item }) => {
            const isSankalp =
              item.type === "sankalp" ||
              item.details?.type === "sankalp" ||
              item.details?.id?.startsWith("sankalp_");

            const translated = getTranslatedPractice(item.details || item, t);

            let displayName = "";
            let displayDescription = "";
            let mantraText = "";
            let displayMeaning = "";

            if (item.source === "custom") {
              displayName = item.name?.trim() || "Custom Practice";
              displayDescription = item.description?.trim() || "";
              mantraText = item.mantra || "";
              displayMeaning = item.meaning || "";
            } else {
              displayName = translated.name || item.name || "Unnamed Practice";
              displayDescription = translated.desc || "";
              mantraText = translated.mantra || "";
              displayMeaning = isSankalp
                ? (item.details?.short_text || item.short_text || "")
                : translated.meaning || "";
            }

            const isCompleted =
              dailyPractice?.data?.completed_today?.includes(item.practice_id);

            const triggerLabel = t(`submitPractice.reminder.${item.trigger}`, {
              defaultValue: item.trigger || t("sadanaTracker.noTrigger"),
            });


            return (
              <View
                style={{
                  borderColor: Colors.Colors.Light_grey,
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 12,
                  marginHorizontal: 20,
                  marginVertical: 10,
                  backgroundColor: Colors.Colors.white,
                }}
              >
                <TextComponent
                  type="mediumText"
                  style={{
                    fontSize: FontSize.CONSTS.FS_14,
                    color: Colors.Colors.BLACK,
                  }}
                >
                  {item.icon} {displayName}
                </TextComponent>

                {displayDescription ? (
                  <TextComponent
                    type="mediumText"
                    style={{
                      fontSize: FontSize.CONSTS.FS_13,
                      marginTop: 4,
                      color: Colors.Colors.Light_black,
                    }}
                  >
                    {displayDescription}
                  </TextComponent>
                ) : null}

                {mantraText ? (
                  <TextComponent
                    type="mediumText"
                    style={{
                      fontSize: FontSize.CONSTS.FS_14,
                      marginTop: 6,
                      color: Colors.Colors.Light_black,
                    }}
                  >
                    {isSankalp
                      ? t("sadanaTracker.sankalpLabel")
                      : item.source === "custom"
                        ? t("sadanaTracker.practiceLabel")
                        : item.type === "mantra" || item.details?.type === "mantra"
                          ? t("sadanaTracker.mantraLabel")
                          : t("sadanaTracker.sanatanPracticeLabel")
                    } {mantraText}
                  </TextComponent>
                ) : null}

                {displayMeaning?.trim()?.length > 0 && (
                  <TextComponent
                    type="mediumText"
                    style={{
                      fontSize: FontSize.CONSTS.FS_13,
                      marginTop: 4,
                      color: Colors.Colors.Light_black,
                    }}
                  >
                    {displayMeaning}
                  </TextComponent>
                )}
                <TextComponent
                  type="mediumText"
                  style={{
                    fontSize: FontSize.CONSTS.FS_14,
                    marginTop: 6,
                    color: Colors.Colors.Light_black,
                  }}
                >
                  {t("sadanaTracker.triggerLabel")} {triggerLabel}
                </TextComponent>

                {/* ✅ Last Practice Date */}
                {/* <TextComponent
          type="mediumText"
          style={{
            fontSize: FontSize.CONSTS.FS_14,
            marginTop: 6,
            color: Colors.Colors.Light_black,
          }}
        >
          {t("sadanaTracker.lastPracticeLabel")}{" "}
          {item.last_practice_date
            ? moment(item.last_practice_date).format("DD/MM/YYYY")
            : "—"}
        </TextComponent> */}

                {/* ✅ Mark as Done */}
                <TouchableOpacity
                  style={{
                    backgroundColor: isCompleted
                      ? "#36AE68"
                      : Colors.Colors.Yellow,
                    padding: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    marginVertical: 10,
                    borderRadius: 10,
                  }}
                  disabled={isCompleted}
                  onPress={() => {
                    setLoading(true);
                    if (!isCompleted && locationData?.timezone) {
                      const payload = {
                        practice_id: item.practice_id,
                        date: moment().format("YYYY-MM-DD"),
                        timezone: locationData.timezone,
                      };

                      console.log("📤 Submitting track payload:", payload);
                      dispatch(
                        trackDailyPractice(payload, (res) => {
                          setLoading(false);
                          if (res.success) {
                            console.log("✅ Practice marked complete:", res.data);
                            dispatch(
                              fetchDailyPractice(
                                moment().format("YYYY-MM-DD"),
                                locationData.timezone
                              )
                            );
                          } else {
                            console.log("❌ Failed to mark complete:", res.error);
                          }
                        })
                      );
                    }
                  }}
                >
                  <TextComponent
                    type="mediumText"
                    style={{
                      color: isCompleted
                        ? Colors.Colors.white
                        : Colors.Colors.BLACK,
                      fontSize: FontSize.CONSTS.FS_14,
                    }}
                  >
                    {isCompleted
                      ? t("sadanaTracker.completedButton")
                      : t("sadanaTracker.markAsDone")}
                  </TextComponent>
                </TouchableOpacity>
              </View>
            );
          }}
        />
        {/* Remainders & Calendar Section (unchanged) */}
        {/* <View style={styles.container}>
          <Dropdown
          selectedTextProps={{ allowFontScaling: false }}
            data={rememberdata}
            labelField="label"
            valueField="value"
           placeholder={t("sadanaTracker.reminder.placeholder")}
            value={reason}
            onChange={(item) => setReason(item.value)}
            style={styles.dropdown}
            selectedTextStyle={styles.selectedText}
            placeholderStyle={styles.placeholder}
  itemTextStyle={styles.dropdownItemText}
  containerStyle={styles.dropdownContainer}
          />
        </View> */}
        <View style={{ marginHorizontal: 20 }}>
          <TextComponent
            type="cardText"
            style={{
              color: Colors.Colors.BLACK,
              fontSize: FontSize.CONSTS.FS_18,
              marginTop: 10,
            }}
          >
            {t("sadanaTracker.calendarTitle")}
          </TextComponent>
          <TextComponent
            type="mediumText"
            style={{
              fontSize: FontSize.CONSTS.FS_14,
              marginTop: 10,
            }}
          >
            {t("sadanaTracker.calendarSubtitle")}
          </TextComponent>
          <View
            style={{
              marginTop: 10,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <TextComponent type="cardText">   {t("sadanaTracker.completedLabel", { count: dailyPractice?.data?.completed_today?.length || 0 })}</TextComponent>
            <View
              style={{
                width: 20,
                height: 20,
                backgroundColor: "#FFBFBA",
                borderRadius: 10,
                marginLeft: 30,
              }}
            />
            <TextComponent type="cardText" style={{ marginLeft: 20 }}>
              {t("sadanaTracker.notDoneLabel", {
                count:
                  (dailyPractice?.data?.active_practices?.length || 0) -
                  (dailyPractice?.data?.completed_today?.length || 0),
              })}
            </TextComponent>
          </View>
          <TextComponent
            type="cardText"
            style={{
              color: Colors.Colors.Light_grey,
              alignSelf: "flex-end",
              marginVertical: 15,
            }}
          >
            {t("sadanaTracker.selectedDateLabel")}{" "}
            <TextComponent
              type="cardText"
              style={{ color: Colors.Colors.BLACK }}
            >
              {moment(selectedDate).format("DD/MM/YYYY")}
            </TextComponent>
          </TextComponent>
        </View>
        <FlatList
          data={Array.from({ length: moment().daysInMonth() }, (_, i) => {
            const date = moment().startOf("month").add(i, "days");
            return {
              day: date.date(),
              fullDate: date.format("YYYY-MM-DD"),
              isPastOrToday: date.isSameOrBefore(moment(), "day"),
            };
          })}
          keyExtractor={(item) => item.fullDate}
          numColumns={4}
          contentContainerStyle={{
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 100,
          }}
          renderItem={({ item }) => {
            const dayData = dailyPractice?.data?.calendar_days?.[item.fullDate] || {};
            const status = dayData.status || "not_done";

            // 🎨 Status background color mapping
            let bgColor = "#FFE1E1"; // default = not_done (pink)

            if (status === "completed") bgColor = "#DBFCE7";       // completed = green
            else if (status === "partial") bgColor = "#F7FCC4";    // partial = yellow
            else if (status === "not_done") bgColor = "#FFE1E1";   // not done = pink
            else if (status === "disabled") bgColor = "#F3F3F5";   // future = gray

            const isDisabled = status === "disabled";

            const isCompleted = status === "completed";

            // 📝 Text color
            const textColor = isDisabled ? Colors.Colors.BLACK : isCompleted ? "green" : "#DB0000";

            return (
              <TouchableOpacity
                disabled={isDisabled}
                onPress={async () => {
                  setSelectedDate(item.fullDate);
                  const dayData = dailyPractice?.data?.calendar_days?.[item.fullDate] || {};

                  setSelectedDayData({
                    notCompleted: dayData?.active || [],
                    completed: dayData?.completed || [],
                    status: dayData?.status || "not_done",
                  });

                  setShowPractiseModal(true);
                }}
                style={{
                  width: 70,
                  height: 70,
                  margin: 4,
                  borderRadius: 4,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: bgColor,
                  // borderColor:
                  //   item.fullDate === selectedDate ? "#D4A017" : "#707070",
                  // borderWidth: 1,
                }}
              >
                <TextComponent
                  type="streakText"
                  style={{
                    color: textColor,
                  }}
                >
                  {moment(item.fullDate).format("MMM D")}
                </TextComponent>
              </TouchableOpacity>
            );
          }}
        />


        {/* <FlatList
          data={Array.from({ length: moment().daysInMonth() }, (_, i) => {
            const date = moment().startOf("month").add(i, "days");
            return {
              day: date.date(),
              fullDate: date.format("YYYY-MM-DD"),
              isPastOrToday: date.isSameOrBefore(moment(), "day"),
            };
          })}
          keyExtractor={(item) => item.fullDate}
          numColumns={4}
          contentContainerStyle={{
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 100,
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              disabled={!item.isPastOrToday}
              onPress={async() => {
  setSelectedDate(item.fullDate);
  const dayData = await dailyPractice?.data?.calendar_days?.[item.fullDate];
  console.log("Selected Day Data:",item.fullDate, JSON.stringify(dayData));
  setShowPractiseModal(true);
  setSelectedDayData({
    notCompleted: dayData?.active || [],
    completed: dayData?.completed || [],
    status: dayData?.status || "not_done",
  });
}}

              // onPress={() => {
              //   setSelectedDate(item.fullDate);
              //   if (!locationLoading && locationData.timezone) {
              //     dispatch(fetchDailyPractice(item.fullDate, locationData.timezone));
              //     console.log("practiceHistory >>>>>>>", JSON.stringify(practiceHistory));
              //     setShowPractiseModal(true);
              //   }
              // }}
              style={{
                width: 70,
                height: 70,
                margin: 4,
                borderRadius: 4,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: item.isPastOrToday ? "#FFE6E4" : "#FFFFFF",
                borderColor:
                  item.fullDate === selectedDate ? "#D4A017" : "#707070",
                borderWidth: item.isPastOrToday ? 1 : 0.5,
              }}
            >
              <TextComponent
                type="streakText"
                style={{
                  color: item.isPastOrToday
                    ? Colors.Colors.BLACK
                    : Colors.Colors.Light_grey,
                }}
              >
                {moment(item.fullDate).format("MMM D")}
              </TextComponent>
            </TouchableOpacity>
          )}
        /> */}

        <PracticeDailyModal
          visible={showPractiseModal}
          date={selectedDate}
          dailyPractice={{
            active_practices: selectedDayData.notCompleted || [],
            completed_today: selectedDayData.completed || [],
            status: selectedDayData.status || "not_done"
            //   active_practices: dailyPractice.data.active_practices || [],
            // completed_today: dailyPractice.data.completed_today || [],
          }}
          onClose={() => setShowPractiseModal(false)}
        />
        <LoadingOverlay visible={fetchLoading} text="Submitting..." />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SadanaTrackerScreen;





// import { useNavigation } from "@react-navigation/native";
// import { AnyAction } from "@reduxjs/toolkit";
// import moment from "moment";
// import React, { useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   Dimensions,
//   FlatList,
//   Image,
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { Dropdown } from "react-native-element-dropdown";
// import { useDispatch, useSelector } from "react-redux";
// import { ThunkDispatch } from "redux-thunk";
// import Colors from "../../components/Colors";
// import FontSize from "../../components/FontSize";
// import Header from "../../components/Header";
// import PracticeDailyModal from "../../components/PracticeDailyModal";
// import TextComponent from "../../components/TextComponent";
// import { useUserLocation } from "../../components/useUserLocation";
// import { RootState } from "../../store";
// import { fetchDailyPractice, fetchPracticeHistory } from "../Streak/actions";
// import styles from "./homestyles";
// import { trackDailyPractice } from "./actions";

// const { width } = Dimensions.get("window");

// const SadanaTrackerScreen = () => {
//   const navigation: any = useNavigation();
//   const [reason, setReason] = useState<string | null>(null);
//   const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
//   const [showPractiseModal, setShowPractiseModal] = useState(false);

//   const { t } = useTranslation();
//   const { locationData, loading: locationLoading, error } = useUserLocation();
//   const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

//   const rememberdata = [
//     { label: "Schedule conflict", value: "schedule_conflict" },
//     { label: "No longer interested", value: "no_longer_interested" },
//     { label: "Technical issue", value: "technical_issue" },
//     { label: "Other", value: "other" },
//   ];

//   const dailyPractice: any = useSelector(
//     (state: RootState) => state.dailyPracticeReducer
//   );

//   const practiceHistory: any = useSelector(
//     (state: RootState) => state.practiceReducer
//   );

//   console.log("dailyPractice.data.active_practices >>>>>", JSON.stringify(dailyPractice));

//   const data = practiceHistory?.data ?? [];
//   const loading = practiceHistory?.loading ?? false;

//   // ✅ Fetch monthly history
//   useEffect(() => {
//     if (!locationLoading && locationData.timezone) {
//       dispatch(fetchPracticeHistory(locationData.timezone));
//     }
//   }, [dispatch, locationData.timezone, locationLoading]);

//   // ✅ Fetch today's active practices once location/timezone is ready
//   useEffect(() => {
//     if (!locationLoading && locationData.timezone) {
//       const today = moment().format("YYYY-MM-DD");
//       dispatch(fetchDailyPractice(today, locationData.timezone));
//     }
//   }, [dispatch, locationData.timezone, locationLoading]);

//   const renderMantraItem = ({ item }: { item: any }) => (
//     <View
//       style={{
//         borderRadius: 6,
//         elevation: 3,
//         backgroundColor: Colors.Colors.white,
//         padding: 16,
//         borderColor: Colors.Colors.Light_grey,
//         borderWidth: 1,
//         marginVertical: 10,
//         marginHorizontal: 15,
//       }}
//     >
//       <TextComponent
//         type="boldText"
//         style={{
//           color: Colors.Colors.BLACK,
//           fontSize: FontSize.CONSTS.FS_14,
//         }}
//       >
//         {item.deity ? `Mantra: ${item.deity}` : "Mantra"}
//       </TextComponent>

//       <TextComponent
//         type="semiBoldText"
//         style={{ color: Colors.Colors.Light_black, marginTop: 4 }}
//       >
//         {item.devanagari}
//       </TextComponent>

//       <TextComponent
//         type="semiBoldText"
//         style={{ color: Colors.Colors.Light_black, marginVertical: 6 }}
//       >
//         {item.iast}
//       </TextComponent>

//       {Array.isArray(item.explanation) ? (
//         item.explanation.map((line, idx) => (
//           <TextComponent key={idx} style={{ marginTop: 4 }}>
//             {line}
//           </TextComponent>
//         ))
//       ) : (
//         <TextComponent>{item.explanation}</TextComponent>
//       )}

//       <TextComponent
//         type="semiBoldText"
//         style={{
//           color: Colors.Colors.Light_grey,
//           fontSize: FontSize.CONSTS.FS_10,
//           marginTop: 8,
//         }}
//       >
//         Suggested reps: {item.suggested_reps}
//       </TextComponent>
//     </View>
//   );

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Colors.white }}>
//       <StatusBar
//         barStyle="dark-content"
//         backgroundColor={Colors.Colors.header_bg}
//         translucent={false}
//       />
//       <Header />
//       <ScrollView
//         contentContainerStyle={{ paddingBottom: 30 }}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Heading Section */}
//         <TextComponent
//           type="cardText"
//           style={{
//             textAlign: "center",
//             marginTop: 15,
//             fontSize: FontSize.CONSTS.FS_16,
//             color: Colors.Colors.BLACK,
//           }}
//         >
//           Honor Your Daily Rituals
//         </TextComponent>

//         <TextComponent
//           type="mediumText"
//           style={{
//             fontSize: FontSize.CONSTS.FS_14,
//             textAlign: "center",
//             marginTop: 7,
//             marginHorizontal: 30,
//           }}
//         >
//           Simple steps to cultivate peace and mindfulness each day.
//         </TextComponent>

//         <View
//           style={{
//             backgroundColor: "#F6F6F6",
//             borderRadius: 4,
//             padding: 12,
//             margin: 20,
//           }}
//         >
//           <TextComponent
//             type="cardText"
//             style={{
//               color: Colors.Colors.BLACK,
//               fontSize: FontSize.CONSTS.FS_18,
//             }}
//           >
//             No Blessing Badge Earned Yet
//           </TextComponent>
//           <View
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               marginVertical: 12,
//             }}
//           >
//             <TextComponent type="mediumText">0 days streak</TextComponent>
//             <Image
//               source={require("../../../assets/Streak_A1.png")}
//               style={{ height: 20, width: 20, marginLeft: 4 }}
//             />
//           </View>
//           <TextComponent
//             type="mediumText"
//             style={{
//               color: Colors.Colors.Light_black,
//               fontSize: FontSize.CONSTS.FS_14,
//             }}
//           >
//             Welcome to your profile. Edit your details and Practices
//           </TextComponent>
//           <TextComponent
//             type="mediumText"
//             style={{
//               color: Colors.Colors.BLACK,
//               fontSize: FontSize.CONSTS.FS_14,
//               marginTop: 12,
//             }}
//           >
//             {" "}
//             1/1 practices completed on 10/3/2025
//           </TextComponent>
//           <View
//             style={{
//               borderColor: Colors.Colors.Yellow,
//               padding: 12,
//               alignItems: "center",
//               justifyContent: "center",
//               borderWidth: 1,
//               marginVertical: 20,
//               borderRadius: 10,
//             }}
//           >
//             <TextComponent
//               type="mediumText"
//               style={{
//                 color: Colors.Colors.Yellow,
//                 fontSize: FontSize.CONSTS.FS_14,
//               }}
//             >
//               {" "}
//               Add Practices
//             </TextComponent>
//           </View>

//           <TextComponent
//             type="mediumText"
//             style={{
//               color: Colors.Colors.BLACK,
//               fontSize: FontSize.CONSTS.FS_14,
//               marginBottom: 12,
//             }}
//           >
//             6 Days to earn your next Blessing Badge
//           </TextComponent>
//         </View>

//         <TextComponent
//           type="cardText"
//           style={{ marginBottom: 10, marginLeft: 20 }}
//         >
//           Complete Today's Practices
//         </TextComponent>

//         <FlatList
//           data={dailyPractice?.data?.active_practices || []}
//           keyExtractor={(item) => item.practice_id}
//           contentContainerStyle={{
//             paddingBottom: 20,
//           }}
//           renderItem={({ item }) => {
//             const isCompleted =
//               dailyPractice?.data?.completed_today?.includes(item.practice_id);

//             return (
//               <View
//                 style={{
//                   borderColor: Colors.Colors.Light_grey,
//                   borderWidth: 1,
//                   borderRadius: 10,
//                   padding: 12,
//                   marginHorizontal: 20,
//                   marginVertical: 10,
//                   backgroundColor: Colors.Colors.white,
//                 }}
//               >
//                 <TextComponent
//                   type="mediumText"
//                   style={{ fontSize: FontSize.CONSTS.FS_14 }}
//                 >
//                   {item.icon}{" "}
//                   {item.name === "Unnamed Practice"
//                     ? item.details.text
//                     : item.name}
//                 </TextComponent>

//                 <TextComponent
//                   type="mediumText"
//                   style={{
//                     fontSize: FontSize.CONSTS.FS_14,
//                     marginTop: 4,
//                     color: Colors.Colors.Light_black,
//                   }}
//                 >
//                   Mantra:{" "}
//                   {item.details?.devanagari ||
//                     item.mantra ||
//                     "No mantra available"}
//                 </TextComponent>

//                 <TextComponent
//                   type="mediumText"
//                   style={{
//                     fontSize: FontSize.CONSTS.FS_14,
//                     marginTop: 4,
//                     color: Colors.Colors.Light_black,
//                   }}
//                 >
//                   Trigger: {item.trigger}
//                 </TextComponent>

//                 <TextComponent
//                   type="mediumText"
//                   style={{
//                     fontSize: FontSize.CONSTS.FS_14,
//                     marginTop: 4,
//                     color: Colors.Colors.Light_black,
//                   }}
//                 >
//                   Last Practice:{" "}
//                   {item.last_practice_date
//                     ? moment(item.last_practice_date).format("DD/MM/YYYY")
//                     : "—"}
//                 </TextComponent>

//                 <TouchableOpacity
//                   style={{
//                     backgroundColor: isCompleted
//                       ? "#36AE68"
//                       : Colors.Colors.Yellow,
//                     padding: 12,
//                     alignItems: "center",
//                     justifyContent: "center",
//                     marginVertical: 10,
//                     borderRadius: 10,
//                   }}
//                   disabled={isCompleted}
//             onPress={() => {
//   if (!isCompleted && locationData?.timezone) {
//     const payload = {
//       practice_id: item.practice_id,
//       date: moment().format("YYYY-MM-DD"),
//       timezone: locationData.timezone,
//     };

//     console.log("📤 Submitting track payload:", payload);
//     dispatch(
//       trackDailyPractice(payload, (res) => {
//         if (res.success) {
//           console.log("✅ Practice marked complete:", res.data);
//         } else {
//           console.log("❌ Failed to mark complete:", res.error);
//         }
//       })
//     );
//   }
// }}
//                 >
//                   <TextComponent
//                     type="mediumText"
//                     style={{
//                       color: isCompleted
//                         ? Colors.Colors.white
//                         : Colors.Colors.BLACK,
//                       fontSize: FontSize.CONSTS.FS_14,
//                     }}
//                   >
//                     {isCompleted ? "Completed" : "Mark as Done"}
//                   </TextComponent>
//                 </TouchableOpacity>
//               </View>
//             );
//           }}
//         />

//         <View style={styles.container}>
//           <Dropdown
//             data={rememberdata}
//             labelField="label"
//             valueField="value"
//             placeholder="Remainders and Settings"
//             value={reason}
//             onChange={(item) => setReason(item.value)}
//             style={styles.dropdown}
//             selectedTextStyle={styles.selectedText}
//             placeholderStyle={styles.placeholder}
//           />
//         </View>

//         <View style={{ marginHorizontal: 20 }}>
//           <TextComponent
//             type="cardText"
//             style={{
//               color: Colors.Colors.BLACK,
//               fontSize: FontSize.CONSTS.FS_18,
//               marginTop: 10,
//             }}
//           >
//             Dharma Progress Calendar
//           </TextComponent>
//           <TextComponent
//             type="mediumText"
//             style={{
//               fontSize: FontSize.CONSTS.FS_14,
//               marginTop: 10,
//             }}
//           >
//             Your Daily practice Tracker
//           </TextComponent>
//           <View
//             style={{
//               marginTop: 10,
//               flexDirection: "row",
//               alignItems: "center",
//             }}
//           >
//             <TextComponent type="cardText">Completed (1)</TextComponent>
//             <View
//               style={{
//                 width: 20,
//                 height: 20,
//                 backgroundColor: "#FFBFBA",
//                 borderRadius: 10,
//                 marginLeft: 30,
//               }}
//             />
//             <TextComponent type="cardText" style={{ marginLeft: 20 }}>
//               Not Done (0)
//             </TextComponent>
//           </View>
//           <TextComponent
//             type="cardText"
//             style={{
//               color: Colors.Colors.Light_grey,
//               alignSelf: "flex-end",
//               marginVertical: 15,
//             }}
//           >
//             {" "}
//             Selected date :{" "}
//             <TextComponent
//               type="cardText"
//               style={{ color: Colors.Colors.BLACK }}
//             >
//               03/10/2025
//             </TextComponent>
//           </TextComponent>
//         </View>

//         <FlatList
//           data={Array.from({ length: moment().daysInMonth() }, (_, i) => {
//             const date = moment().startOf("month").add(i, "days");
//             return {
//               day: date.date(),
//               fullDate: date.format("YYYY-MM-DD"),
//               isPastOrToday: date.isSameOrBefore(moment(), "day"),
//             };
//           })}
//           keyExtractor={(item) => item.fullDate}
//           numColumns={4}
//           contentContainerStyle={{
//             alignItems: "center",
//             justifyContent: "center",
//             paddingBottom: 100,
//           }}
//           renderItem={({ item }) => (
//             <TouchableOpacity
//               disabled={!item.isPastOrToday}
//               onPress={() => {
//                 setSelectedDate(item.fullDate);
//                 if (!locationLoading && locationData.timezone) {
//                   dispatch(fetchDailyPractice(item.fullDate, locationData.timezone));
//                   console.log("practiceHistory >>>>>>>", JSON.stringify(practiceHistory));
//                   setShowPractiseModal(true);
//                 }
//               }}
//               style={{
//                 width: 70,
//                 height: 70,
//                 margin: 4,
//                 borderRadius: 4,
//                 alignItems: "center",
//                 justifyContent: "center",
//                 backgroundColor: item.isPastOrToday ? "#FFE6E4" : "#FFFFFF",
//                 borderColor:
//                   item.fullDate === selectedDate ? "#D4A017" : "#707070",
//                 borderWidth: item.isPastOrToday ? 1 : 0.5,
//               }}
//             >
//               <TextComponent
//                 type="streakText"
//                 style={{
//                   color: item.isPastOrToday
//                     ? Colors.Colors.BLACK
//                     : Colors.Colors.Light_grey,
//                 }}
//               >
//                 {moment(item.fullDate).format("MMM D")}
//               </TextComponent>
//             </TouchableOpacity>
//           )}
//         />

//         <PracticeDailyModal
//           visible={showPractiseModal}
//           date={selectedDate}
//           dailyPractice={{
//             active_practices: dailyPractice.data.active_practices || [],
//             completed_today: dailyPractice.data.completed_today || [],
//           }}
//           onClose={() => setShowPractiseModal(false)}
//         />
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default SadanaTrackerScreen;





// import { useNavigation } from "@react-navigation/native";
// import { AnyAction } from "@reduxjs/toolkit";
// import moment from "moment";
// import React, { useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   Dimensions,
//   FlatList,
//   Image,
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { Dropdown } from "react-native-element-dropdown";
// import { useDispatch, useSelector } from "react-redux";
// import { ThunkDispatch } from "redux-thunk";
// import Colors from "../../components/Colors";
// import FontSize from "../../components/FontSize";
// import Header from "../../components/Header";
// import PracticeDailyModal from "../../components/PracticeDailyModal";
// import TextComponent from "../../components/TextComponent";
// import { useUserLocation } from "../../components/useUserLocation";
// import { RootState } from "../../store";
// import { fetchDailyPractice, fetchPracticeHistory } from "../Streak/actions";
// import styles from "./homestyles";


// const { width } = Dimensions.get("window");

// const SadanaTrackerScreen = () => {
//   const navigation: any = useNavigation();
//     const [reason, setReason] = useState<string | null>(null);
//      const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD")); 
//   const [showPractiseModal,setShowPractiseModal] = useState(false);

//   const { t } = useTranslation();

//     const { locationData, loading: locationLoading, error } = useUserLocation();
//   const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
//   const rememberdata = [
//   { label: "Schedule conflict", value: "schedule_conflict" },
//   { label: "No longer interested", value: "no_longer_interested" },
//   { label: "Technical issue", value: "technical_issue" },
//   { label: "Other", value: "other" },
// ];

// const dailyPractice: any = useSelector(
//   (state: RootState) => state.dailyPracticeReducer
// );

//   const practiceHistory: any = useSelector(
//     (state: RootState) => state.practiceReducer
//   );


//   console.log("dailyPractice.data.active_practices >>>>>",JSON.stringify(dailyPractice));


//   const data = practiceHistory?.data ?? [];
//   const loading = practiceHistory?.loading ?? false;

//    useEffect(() => {
//       if (!locationLoading && locationData.timezone) {
//         dispatch(fetchPracticeHistory(locationData.timezone));
//       }
//     }, [dispatch, locationData.timezone, locationLoading]);

//   const renderMantraItem = ({ item }: { item: any }) => (
//     <View
//       style={{
//         borderRadius: 6,
//         elevation: 3,
//         backgroundColor: Colors.Colors.white,
//         padding: 16,
//         borderColor: Colors.Colors.Light_grey,
//         borderWidth: 1,
//         marginVertical: 10,
//         marginHorizontal: 15,
//       }}
//     >
//       <TextComponent
//         type="boldText"
//         style={{
//           color: Colors.Colors.BLACK,
//           fontSize: FontSize.CONSTS.FS_14,
//         }}
//       >
//         {item.deity ? `Mantra: ${item.deity}` : "Mantra"}
//       </TextComponent>

//       <TextComponent
//         type="semiBoldText"
//         style={{ color: Colors.Colors.Light_black, marginTop: 4 }}
//       >
//         {item.devanagari}
//       </TextComponent>

//       <TextComponent
//         type="semiBoldText"
//         style={{ color: Colors.Colors.Light_black, marginVertical: 6 }}
//       >
//         {item.iast}
//       </TextComponent>

//       {Array.isArray(item.explanation) ? (
//         item.explanation.map((line, idx) => (
//           <TextComponent key={idx} style={{ marginTop: 4 }}>
//             {line}
//           </TextComponent>
//         ))
//       ) : (
//         <TextComponent>{item.explanation}</TextComponent>
//       )}

//       <TextComponent
//         type="semiBoldText"
//         style={{
//           color: Colors.Colors.Light_grey,
//           fontSize: FontSize.CONSTS.FS_10,
//           marginTop: 8,
//         }}
//       >
//         Suggested reps: {item.suggested_reps}
//       </TextComponent>
//     </View>
//   );

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Colors.white }}>
//       <StatusBar
//         barStyle="dark-content"
//         backgroundColor={Colors.Colors.header_bg}
//         translucent={false}
//       />
//       <Header />
//       <ScrollView
//         contentContainerStyle={{ paddingBottom: 30 }}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Heading Section */}
//         <TextComponent
//           type="cardText"
//           style={{
//             textAlign: "center",
//             marginTop: 15,
//             fontSize: FontSize.CONSTS.FS_16,
//             color: Colors.Colors.BLACK,
//           }}
//         >
//           Honor Your Daily Rituals
//         </TextComponent>

//         <TextComponent
//           type="mediumText"
//           style={{
//             fontSize: FontSize.CONSTS.FS_14,
//             textAlign: "center",
//             marginTop: 7,
//             marginHorizontal: 30,
//           }}
//         >
//           Simple steps to cultivate peace and mindfulness each day.
//         </TextComponent>
//         <View
//           style={{
//             backgroundColor: "#F6F6F6",
//             borderRadius: 4,
//             padding: 12,
//             margin: 20,
//           }}
//         >
//           <TextComponent
//             type="cardText"
//             style={{
//               color: Colors.Colors.BLACK,
//               fontSize: FontSize.CONSTS.FS_18,
//             }}
//           >
//             No Blessing Badge Earned Yet
//           </TextComponent>
//           <View
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               marginVertical: 12,
//             }}
//           >
//             <TextComponent type="mediumText">0 days streak</TextComponent>
//             <Image
//               source={require("../../../assets/Streak_A1.png")}
//               style={{ height: 20, width: 20, marginLeft: 4 }}
//             />
//           </View>
//           <TextComponent
//             type="mediumText"
//             style={{
//               color: Colors.Colors.Light_black,
//               fontSize: FontSize.CONSTS.FS_14,
//             }}
//           >
//             Welcome to your profile. Edit your details and Practices
//           </TextComponent>
//           <TextComponent
//             type="mediumText"
//             style={{
//               color: Colors.Colors.BLACK,
//               fontSize: FontSize.CONSTS.FS_14,
//               marginTop: 12,
//             }}
//           >
//             {" "}
//             1/1 practices completed on 10/3/2025
//           </TextComponent>
//           <View
//             style={{
//               borderColor: Colors.Colors.Yellow,
//               padding: 12,
//               alignItems: "center",
//               justifyContent: "center",
//               borderWidth: 1,
//               marginVertical: 20,
//               borderRadius: 10,
//             }}
//           >
//             <TextComponent
//               type="mediumText"
//               style={{
//                 color: Colors.Colors.Yellow,
//                 fontSize: FontSize.CONSTS.FS_14,
//               }}
//             >
//               {" "}
//               Add Practices
//             </TextComponent>
//           </View>

//           <TextComponent
//             type="mediumText"
//             style={{
//               color: Colors.Colors.BLACK,
//               fontSize: FontSize.CONSTS.FS_14,
//               marginBottom: 12,
//             }}
//           >
//             6 Days to earn your next Blessing Badge
//           </TextComponent>

//           <View></View>
//         </View>
//         <TextComponent type="cardText" style={{marginBottom:10,marginLeft:20}}>Complete Today's Practices</TextComponent>

// <FlatList
//   data={dailyPractice?.data?.active_practices || []}
//   keyExtractor={(item) => item.practice_id}
//   contentContainerStyle={{
//     paddingBottom: 20,
//   }}
//   renderItem={({ item }) => {
//     const isCompleted =
//       dailyPractice?.data?.completed_today?.includes(item.practice_id);

//     return (
//       <View
//         style={{
//           borderColor: Colors.Colors.Light_grey,
//           borderWidth: 1,
//           borderRadius: 10,
//           padding: 12,
//           marginHorizontal: 20,
//           marginVertical: 10,
//           backgroundColor: Colors.Colors.white,
//         }}
//       >
//         <TextComponent
//           type="mediumText"
//           style={{ fontSize: FontSize.CONSTS.FS_14 }}
//         >
//           {item.icon} {item.name === "Unnamed Practice" ? item.details.text : item.name}
//         </TextComponent>

//         {/* {item.details?.deity ? (
//           <TextComponent
//             type="mediumText"
//             style={{
//               fontSize: FontSize.CONSTS.FS_14,
//               marginTop: 4,
//               color: Colors.Colors.Light_black,
//             }}
//           >
//             Deity: {item.details.deity}
//           </TextComponent>
//         ) : null} */}

//         <TextComponent
//           type="mediumText"
//           style={{
//             fontSize: FontSize.CONSTS.FS_14,
//             marginTop: 4,
//             color: Colors.Colors.Light_black,
//           }}
//         >
//           Mantra:{" "}
//           {item.details?.devanagari ||
//             item.mantra ||
//             "No mantra available"}
//         </TextComponent>

//         <TextComponent
//           type="mediumText"
//           style={{
//             fontSize: FontSize.CONSTS.FS_14,
//             marginTop: 4,
//             color: Colors.Colors.Light_black,
//           }}
//         >
//           Trigger: {item.trigger}
//         </TextComponent>

//         <TextComponent
//           type="mediumText"
//           style={{
//             fontSize: FontSize.CONSTS.FS_14,
//             marginTop: 4,
//             color: Colors.Colors.Light_black,
//           }}
//         >
//           Last Practice:{" "}
//           {item.last_practice_date
//             ? moment(item.last_practice_date).format("DD/MM/YYYY")
//             : "—"}
//         </TextComponent>

//         <TouchableOpacity
//           style={{
//             backgroundColor: isCompleted ? "#36AE68" : Colors.Colors.Yellow,
//             padding: 12,
//             alignItems: "center",
//             justifyContent: "center",
//             marginVertical: 10,
//             borderRadius: 10,
//           }}
//           disabled={isCompleted}
//           onPress={() => {
//             if (!isCompleted) {
//               // TODO: Dispatch action to mark as done (API call)
//               console.log("Marking as done:", item.practice_id);
//             }
//           }}
//         >
//           <TextComponent
//             type="mediumText"
//             style={{
//               color: isCompleted ? Colors.Colors.white : Colors.Colors.BLACK,
//               fontSize: FontSize.CONSTS.FS_14,
//             }}
//           >
//             {isCompleted ? "Completed" : "Mark as Done"}
//           </TextComponent>
//         </TouchableOpacity>
//       </View>
//     );
//   }}
// />
//           <View style={styles.container}>
//           <Dropdown
//             data={rememberdata}
//             labelField="label"
//             valueField="value"
//             placeholder="Remainders and Settings"
//             value={reason}
//             onChange={(item) => setReason(item.value)}
//             style={styles.dropdown}
//             selectedTextStyle={styles.selectedText}
//             placeholderStyle={styles.placeholder}
//           />
//         </View >
//         <View style={{marginHorizontal:20}}>
//         <TextComponent type="cardText" style={{ color: Colors.Colors.BLACK,fontSize: FontSize.CONSTS.FS_18,marginTop:10}}>Dharma Progress Calendar</TextComponent>
//         <TextComponent type="mediumText" style={{fontSize: FontSize.CONSTS.FS_14,marginTop:10}}>Your Daily practice Tracker</TextComponent>
//         <View style={{marginTop:10,flexDirection:"row",alignItems:"center"}}>
//         <TextComponent type="cardText" style={{}}>Completed (1)</TextComponent>
//         <View style={{width:20,height:20,backgroundColor:"#FFBFBA",borderRadius:10,marginLeft:30}}/>
//         <TextComponent type="cardText" style={{marginLeft:20}}>Not Done (0)</TextComponent>
//         </View>
//         <TextComponent type="cardText" style={{color:Colors.Colors.Light_grey,alignSelf:"flex-end",marginVertical:15}}> Selected date : <TextComponent type="cardText" style={{color:Colors.Colors.BLACK}}>03/10/2025</TextComponent></TextComponent>
//         </View>
//           <FlatList
//     data={Array.from({ length: moment().daysInMonth() }, (_, i) => {
//       const date = moment().startOf("month").add(i, "days");
//       return {
//         day: date.date(),
//         fullDate: date.format("YYYY-MM-DD"),
//         isPastOrToday: date.isSameOrBefore(moment(), "day"),
//       };
//     })}
//     keyExtractor={(item) => item.fullDate}
//     numColumns={4} // 4 per row
//     contentContainerStyle={{
//       alignItems: "center",
//       justifyContent: "center",
//       paddingBottom: 100,
//     }}
//     renderItem={({ item }) => (
//       <TouchableOpacity
//         disabled={!item.isPastOrToday}
//         onPress={() => {
//               setSelectedDate(item.fullDate);
//   if (!locationLoading && locationData.timezone) {
//     dispatch(fetchDailyPractice(item.fullDate, locationData.timezone));
//     console.log("practiceHistory >>>>>>>",JSON.stringify(practiceHistory));
//     setShowPractiseModal(true);
//   }
//         //   setSelectedDate(item.fullDate);
//         //   console.log(item.fullDate);
//         //   setShowPractiseModal(true);
//         }}
//         style={{
//           width: 70,
//           height: 70,
//           margin: 4,
//           borderRadius: 4,
//           alignItems: "center",
//           justifyContent: "center",
//           backgroundColor: item.isPastOrToday ? "#FFE6E4" : "#FFFFFF",
//           borderColor:
//             item.fullDate === selectedDate ? "#D4A017" : "#707070",
//           borderWidth: item.isPastOrToday  ? 1 : 0.5,
//         }}
//       >
//         <TextComponent
//           type="streakText"
//           style={{
//             color: item.isPastOrToday
//               ? Colors.Colors.BLACK
//               : Colors.Colors.Light_grey,
//           }}
//         >
//             {moment(item.fullDate).format("MMM D")}
//           {/* {item.day} */}
//         </TextComponent>
//       </TouchableOpacity>
//     )}
//   />

//   <PracticeDailyModal
//   visible={showPractiseModal}
//   date={selectedDate}
//   dailyPractice={{
//     active_practices: dailyPractice.data.active_practices || [],
//     completed_today: dailyPractice.data.completed_today || [],
//   }}
//   onClose={() => setShowPractiseModal(false)}
// />
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default SadanaTrackerScreen;

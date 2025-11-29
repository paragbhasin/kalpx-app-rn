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

const { width } = Dimensions.get("window");

const TrackerProgress = () => {
  const navigation: any = useNavigation();
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [showPractiseModal, setShowPractiseModal] = useState(false);
  const [trackerData, setTrackerData] = useState<any>(null);
  const [fetchLoading, setLoading] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState({
    notCompleted:[],
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
  const sankalpCount : any = 10;
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
      <ScrollView
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
       <TextComponent type="DailyHeaderText" style={{alignSelf:"center",marginTop:10}} >     
           {currentMilestone ? t("streakScreen.youEarned", { badge: currentMilestone.name }): t("sadanaTracker.noBadge")}
       </TextComponent>
             <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 6,
              alignSelf:"center"
            }}
          >
            <TextComponent type="DailyHeaderText">  {t("sadanaTracker.streakCount", { count: trackerCount })}</TextComponent>
            <Image
              source={require("../../../assets/Streak_A1.png")}
              style={{ height: 20, width: 20, marginLeft: 4 }}
            />
          </View>
<Card
  style={{
    backgroundColor: Colors.Colors.header_bg,
    marginHorizontal: 16,
    marginTop: 20,
    borderColor: "#D4A01724",
    borderWidth: 2,
    paddingBottom: 16,
  }}
>
  <TextComponent
    type="headerIncreaseText"
    style={{ color: Colors.Colors.BLACK, marginTop: 10, marginLeft: 12 }}
  >
    Current Week Status
  </TextComponent>

  <View
    style={{
      borderBottomColor: "#616161",
      borderBottomWidth: 0.35,
      marginVertical: 8,
    }}
  />

  <View
    style={{
      flexDirection: "row",
      flexWrap: "wrap",
      // justifyContent: "space-between",
      paddingHorizontal: 16,
      marginTop: 10,
    }}
  >
    {Object.keys(weekDays).map((dateKey) => {
      const info = weekDays[dateKey];
      const dayName = moment(dateKey).format("ddd");
      const isSelected = selectedDate === dateKey;

      const status = info?.status || "not_done";

      let bgColor = "#FFE1E1";
      if (status === "completed") bgColor = "#DBFCE7";
      else if (status === "partial") bgColor = "#F7FCC4";
      else if (status === "not_done") bgColor = "#FFE1E1";
      else if (status === "disabled") bgColor = "#F3F3F5";

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
            padding:10,
            marginVertical: 6,
            borderRadius: 8,
            backgroundColor: bgColor,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: isSelected ? 2 : 0,
            borderColor: isSelected ? "#D4A017" : "transparent",
            marginRight:16
          }}
        >
          <TextComponent type="headerText" style={{ color: Colors.Colors.BLACK }}>
            {dayName}
          </TextComponent>
        </TouchableOpacity>
      );
    })}
  </View>
</Card>


<Card style={{backgroundColor:Colors.Colors.header_bg,marginHorizontal:16, marginTop:20,       borderColor: "#D4A01724",
          borderWidth: 2,}}>
          <TextComponent
            type="headerIncreaseText"
            style={{
              color: Colors.Colors.BLACK,
              marginTop: 10,marginLeft:12
            }}
          >
         {t("sadanaTracker.calendarTitle")}
          </TextComponent>
          <View style={{borderBottomColor:"#616161",borderBottomWidth:0.35,marginVertical:8}} />
        <View style={{ marginHorizontal:16}}>
          <TextComponent
            type="streakSadanaText"
            style={{
              color:"#616161",
              marginTop:6
            }}
          >
            Track Your journey every day
           {/* {t("sadanaTracker.calendarSubtitle")} */}
          </TextComponent>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent:"space-between",
              marginTop:6
            }}
          >
            <TextComponent type="streakSadanaText" style={{color:"#616161", marginTop:6}}>{t("sadanaTracker.completedLabel", {count: dailyPractice?.data?.completed_today?.length || 0})}</TextComponent>
            <TextComponent type="streakSadanaText" style={{color:"#616161", marginTop:6}}>{t("sadanaTracker.notDoneLabel", {count: (dailyPractice?.data?.active_practices?.length || 0) - (dailyPractice?.data?.completed_today?.length || 0),})}
            </TextComponent>
          </View>
          <TextComponent  type="streakSadanaText"  style={{ color:"#616161", marginTop:6}} >
            {t("sadanaTracker.selectedDateLabel")}{" "}<TextComponent type="streakSadanaText" style={{ color: Colors.Colors.BLACK }}>{moment(selectedDate).format("DD/MM/YYYY")}</TextComponent>
          </TextComponent>
             <TextComponent  type="streakSadanaText"  style={{ color:"#616161", marginTop:6,marginBottom:10}} >
           Today date : {" "}<TextComponent type="streakSadanaText" style={{ color: Colors.Colors.BLACK }}>{moment(selectedDate).format("DD/MM/YYYY")}</TextComponent>
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
  numColumns={6}
  contentContainerStyle={{
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
  }}
  renderItem={({ item }) => {
    const dayData = dailyPractice?.data?.calendar_days?.[item.fullDate] || {};
    const status = dayData.status || "not_done";
    let bgColor = "#FFE1E1"; 
    if (status === "completed") bgColor = "#DBFCE7";       
    else if (status === "partial") bgColor = "#F7FCC4";   
    else if (status === "not_done") bgColor = "#FFE1E1";  
    else if (status === "disabled") bgColor = "#F3F3F5"; 

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
          width: 50,
          height: 50,
          margin: 4,
          borderRadius: 4,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: bgColor,
          borderColor:
            item.fullDate === selectedDate ? "#D4A017" : "transparent",
          borderWidth: 1,
        }}
      >
        <TextComponent
          type="streakText"
          style={{
            color: textColor,
          }}
        >
          {moment(item.fullDate).format("D")}
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default TrackerProgress;
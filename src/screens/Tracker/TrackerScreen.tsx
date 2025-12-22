import { useFocusEffect } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import moment from "moment";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
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
import FontSize from "../../components/FontSize";
import LoadingOverlay from "../../components/LoadingOverlay";
import TextComponent from "../../components/TextComponent";
import { useUserLocation } from "../../components/useUserLocation";
import { RootState } from "../../store";
import { getRawPracticeObject } from "../../utils/getPracticeObjectById";
import { trackDailyPractice } from "../Home/actions";
import { fetchDailyPractice, fetchPracticeHistory } from "../Streak/actions";


const TrackerScreen = () => {
  const [fetchLoading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { locationData, loading: locationLoading } = useUserLocation();
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const dailyPractice: any = useSelector(
    (state: RootState) => state.dailyPracticeReducer
  );


  useFocusEffect(
    useCallback(() => {
      if (!locationLoading && locationData?.timezone) {
        const today = moment().format("YYYY-MM-DD");
        dispatch(fetchPracticeHistory(locationData.timezone));
        dispatch(fetchDailyPractice(today, locationData.timezone));
      }
    }, [locationLoading, locationData?.timezone])
  );

  const sortedPractices =
    dailyPractice?.data?.active_practices
      ?.slice()
      ?.sort((a, b) => {
        const aDone = dailyPractice?.data?.completed_today?.includes(a.practice_id);
        const bDone = dailyPractice?.data?.completed_today?.includes(b.practice_id);
        return aDone === bDone ? 0 : aDone ? 1 : -1;
      }) || [];

      console.log("📝 Daily Practice Data:", JSON.stringify(dailyPractice));


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
                          paddingHorizontal: 10,
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
      <ScrollView
        contentContainerStyle={{ paddingBottom: 30 ,marginHorizontal:10}}
        showsVerticalScrollIndicator={false}
      >
                <TextComponent
          type="DailyboldText"
          style={{ alignSelf: "center", marginTop: 15, color: Colors.Colors.BLACK }}
        >
          {t("sadanaTracker.completeTodaysPractices")}
        </TextComponent>
    {/* // "progressSummary": "{{completed}}/{{total}} practices completed on {{date}}", */}
        <TextComponent
          type="subDailyText"
          style={{
            color: Colors.Colors.BLACK,
            marginTop: 2,
            alignSelf: "center",
          }}
        >
          {t("sadanaTracker.progressSummary", {
            completed: dailyPractice?.data?.completed_today?.length || 0,
            total: dailyPractice?.data?.active_practices?.length || 0,
          })}
        </TextComponent>
          <TextComponent
          type="subDailyText"
          style={{
            color: Colors.Colors.BLACK,
            marginTop: 2,
            alignSelf: "center",
          }}
        >
          {t("sadanaTracker.progressSummaryDate", {
            date: moment().format("MMM D, YYYY"),
          })}
        </TextComponent>
        <FlatList
          data={sortedPractices}
          keyExtractor={(item) => item.practice_id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => {
const id = item.practice_id;

let practiceType = "";

if (id.startsWith("mantra.")) {
  practiceType = "mantra :";
} else if (id.startsWith("sankalp.")) {
  practiceType = "sankalp :";
} else if (id.startsWith("practice.")) {
  practiceType = "practice :";
} else {
  practiceType = "";
}
             const fullObj = getRawPracticeObject(item.practice_id, item);
     let HeadertextTitle = fullObj?.title || fullObj?.text || fullObj?.short_text || fullObj?.name;
     let subTextCard = fullObj?.iast || fullObj?.line || fullObj?.summary || fullObj?.tooltip || fullObj?.description;
     let mantraMeaning = fullObj?.meaning;
     let lastPracticeDate = item?.last_practice_date;
            const isCompleted = dailyPractice?.data?.completed_today?.includes(
              item.practice_id
            );
                const reps = item.details?.reps
                const day = item.details?.day; 
                let practiceTypeKey = id.startsWith("mantra.")
  ? "mantra"
  : id.startsWith("sankalp.")
  ? "sankalp"
  : id.startsWith("practice.")
  ? "practice"
  : "";

let defaultReps =
  practiceTypeKey === "mantra"
    ? "9X"
    : practiceTypeKey === "sankalp"
    ? "1X"
    : practiceTypeKey === "practice"
    ? "1X"
    : "";

    const displayReps = reps
  ? reps.toString().toUpperCase().endsWith("X")
    ? reps.toString().toUpperCase()
    : `${reps}X`
  : defaultReps;

// let displayReps = reps ? `${reps}X` : defaultReps;
let displayDay = day ? day : "Daily";

            return (
              <Card
                style={{
                  borderColor: Colors.Colors.Yellow,
                  borderWidth: 1,
                  borderRadius: 20,
                  marginVertical: 10,
                  backgroundColor: Colors.Colors.white,
                }}
              >
                <TextComponent
                  type="DailyboldText"
                  style={{
                    margin:12
                  }}
                >
                  {HeadertextTitle}
                </TextComponent>
               <View
  style={{
    height: 0.5,
    backgroundColor: "#616161",
  }}
/>

                <View style={{margin:12}}>
                <TextComponent
                    type="mediumText"
                    style={{
                      fontSize: FontSize.CONSTS.FS_13,
                      // marginTop: 4,
                      color: Colors.Colors.Light_black,
                    }}
                  >
                <TextComponent
                    type="boldText"
                    style={{
                      color: Colors.Colors.BLACK,
                    }}>{practiceType ? practiceType : ""}</TextComponent> {subTextCard}
                  </TextComponent>
                  {mantraMeaning ? (
                  <TextComponent
                    type="mediumText"
                    style={{
                      fontSize: FontSize.CONSTS.FS_13,
                      marginTop: 4,
                      color: Colors.Colors.Light_black,
                    }}
                  >
                    {mantraMeaning}
                  </TextComponent>
                ) : null}
                  {lastPracticeDate ? (
                  <TextComponent
                    type="mediumText"
                    style={{
                      fontSize: FontSize.CONSTS.FS_13,
                      marginTop: 4,
                      color: Colors.Colors.Light_black,
                    }}
                  >
                    Last Practice : {lastPracticeDate}
                  </TextComponent>
                ) : null}
<View style={{backgroundColor:"#F7F0DD",borderColor:"#CC9B2F",borderWidth:1,alignSelf:"flex-start",marginTop:6,padding:4,borderRadius:4}}>
  <TextComponent type="boldText" style={{color:Colors.Colors.BLACK}}>{displayDay} - {displayReps} </TextComponent>
</View>
                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.Colors.white,
                    padding: 6,
                    alignItems: "center",
                    justifyContent: "center",
                    marginVertical: 10,
                    borderRadius: 5,
                    alignSelf: "center",
                    borderColor: Colors.Colors.Yellow,
                    borderWidth: 1,
                    flexDirection:"row"
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

                      dispatch(
                        trackDailyPractice(payload, (res) => {
                          setLoading(false);
                          if (res.success) {
                            dispatch(
                              fetchDailyPractice(
                                moment().format("YYYY-MM-DD"),
                                locationData.timezone
                              )
                            );
                          }
                        })
                      );
                    }
                  }}
                >
                  {!isCompleted &&  <Image
                                    source={require("../../../assets/CheckBox_Inactive.png")}
                                    style={{ }}
                                    resizeMode="contain"
                                  />}
                  <TextComponent
                    type="headerSubBoldText"
                    style={{
                      color:isCompleted ? Colors.Colors.Yellow : Colors.Colors.BLACK,
                        marginLeft:6
                    }}
                  >
                    {isCompleted
                      ? t("sadanaTracker.completedButton")
                      : t("sadanaTracker.markAsDone")}
                  </TextComponent>
                </TouchableOpacity>
                </View>
              </Card>
            );
          }}
        />

        <LoadingOverlay visible={fetchLoading} text="Submitting..." />
      </ScrollView>
      {/* </ImageBackground> */}
    </SafeAreaView>
  );
};

export default TrackerScreen;
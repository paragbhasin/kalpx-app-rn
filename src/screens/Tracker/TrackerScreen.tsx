import { useFocusEffect } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import moment from "moment";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
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
import FontSize from "../../components/FontSize";
import LoadingOverlay from "../../components/LoadingOverlay";
import TextComponent from "../../components/TextComponent";
import { useUserLocation } from "../../components/useUserLocation";
import { RootState } from "../../store";
import { getTranslatedPractice } from "../../utils/getTranslatedPractice";
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

  /* ---------------------------------------------------------
     🔄 REFRESH DATA EVERY TIME SCREEN COMES INTO FOCUS
  --------------------------------------------------------- */
  useFocusEffect(
    useCallback(() => {
      if (!locationLoading && locationData?.timezone) {
        const today = moment().format("YYYY-MM-DD");

        dispatch(fetchPracticeHistory(locationData.timezone));
        dispatch(fetchDailyPractice(today, locationData.timezone));
      }
    }, [locationLoading, locationData?.timezone])
  );

  /* ---------------------------------------------------------
     📌 SORT PRACTICES: UNCOMPLETED FIRST → COMPLETED LAST
  --------------------------------------------------------- */
  const sortedPractices =
    dailyPractice?.data?.active_practices
      ?.slice()
      ?.sort((a, b) => {
        const aDone = dailyPractice?.data?.completed_today?.includes(a.practice_id);
        const bDone = dailyPractice?.data?.completed_today?.includes(b.practice_id);
        return aDone === bDone ? 0 : aDone ? 1 : -1;
      }) || [];


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
        
        {/* ----------- HEADER TITLE ------------ */}
        <TextComponent
          type="cardHeaderText"
          style={{ alignSelf: "center", marginTop: 15, color: Colors.Colors.BLACK }}
        >
          {t("sadanaTracker.completeTodaysPractices")}
        </TextComponent>

        {/* ----------- PROGRESS SUMMARY ------------ */}
        <TextComponent
          type="subScrollText"
          style={{
            color: Colors.Colors.BLACK,
            marginTop: 12,
            alignSelf: "center",
          }}
        >
          {t("sadanaTracker.progressSummary", {
            completed: dailyPractice?.data?.completed_today?.length || 0,
            total: dailyPractice?.data?.active_practices?.length || 0,
            date: moment().format("MM/DD/YYYY"),
          })}
        </TextComponent>

        {/* ----------- PRACTICES LIST ------------ */}
        <FlatList
          data={sortedPractices}
          keyExtractor={(item) => item.practice_id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => {
            let displayName = "";
            let displayDescription = "";

            if (item.source === "custom") {
              displayName = item.name?.trim() || "Custom Practice";
              displayDescription = item.description?.trim() || "";
            } else {
              const translated = getTranslatedPractice(item.details || item, t);
              displayName = translated.name || item.name || "Unnamed Practice";
              displayDescription =
                translated.desc ||
                item.description ||
                item.details?.description ||
                "";
            }

            const isCompleted = dailyPractice?.data?.completed_today?.includes(
              item.practice_id
            );

            const mantraText =
              item.details?.devanagari ||
              item.mantra ||
              t(`practices.${item.details?.id}.mantra`, { defaultValue: "" });

            const isSankalp =
              item.type === "sankalp" ||
              item.details?.type === "sankalp" ||
              item.details?.id?.startsWith("sankalp_");

            const displayMeaning = isSankalp
              ? item.details?.short_text || item.short_text || ""
              : t(`practices.${item.details?.id}.meaning`, {
                  defaultValue: item.meaning || "",
                });

            return (
              <Card
                style={{
                  borderColor: "#D4A01724",
                  borderWidth: 2,
                  borderRadius: 10,
                  padding: 12,
                  marginHorizontal: 20,
                  marginVertical: 10,
                  backgroundColor: Colors.Colors.header_bg,
                }}
              >
                {/* NAME */}
                <TextComponent
                  type="mediumText"
                  style={{
                    fontSize: FontSize.CONSTS.FS_14,
                    color: Colors.Colors.BLACK,
                  }}
                >
                  {displayName}
                </TextComponent>

                <View
                  style={{
                    borderBottomColor: "#616161",
                    borderBottomWidth: 0.25,
                    marginVertical: 4,
                  }}
                />

                {/* DESCRIPTION */}
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

                {/* MANTRA */}
                {mantraText ? (
                  <TextComponent
                    type="mediumText"
                    style={{
                      fontSize: FontSize.CONSTS.FS_14,
                      marginTop: 6,
                      color: Colors.Colors.Light_black,
                    }}
                  >
                    {t("sadanaTracker.mantraLabel")} {mantraText}
                  </TextComponent>
                ) : null}

                {/* MEANING */}
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

                {/* MARK-AS-DONE BUTTON */}
                <TouchableOpacity
                  style={{
                    backgroundColor: isCompleted ? "#36AE68" : Colors.Colors.white,
                    padding: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    marginVertical: 10,
                    borderRadius: 30,
                    alignSelf: "center",
                    borderColor: isCompleted
                      ? "#36AE68"
                      : Colors.Colors.Yellow,
                    borderWidth: 1,
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
                  <TextComponent
                    type="headerSubBoldText"
                    style={{
                      color: isCompleted
                        ? Colors.Colors.white
                        : Colors.Colors.Yellow,
                    }}
                  >
                    {isCompleted
                      ? t("sadanaTracker.completedButton")
                      : t("sadanaTracker.markAsDone")}
                  </TextComponent>
                </TouchableOpacity>
              </Card>
            );
          }}
        />

        <LoadingOverlay visible={fetchLoading} text="Submitting..." />
      </ScrollView>
    </SafeAreaView>
  );
};

export default TrackerScreen;






// import { AnyAction } from "@reduxjs/toolkit";
// import moment from "moment";
// import React, { useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   FlatList,
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   TouchableOpacity,
//   View
// } from "react-native";
// import { Card } from "react-native-paper";
// import { useDispatch, useSelector } from "react-redux";
// import { ThunkDispatch } from "redux-thunk";
// import Colors from "../../components/Colors";
// import FontSize from "../../components/FontSize";
// import LoadingOverlay from "../../components/LoadingOverlay";
// import TextComponent from "../../components/TextComponent";
// import { useUserLocation } from "../../components/useUserLocation";
// import { RootState } from "../../store";
// import { getTranslatedPractice } from "../../utils/getTranslatedPractice";
// import { trackDailyPractice } from "../Home/actions";
// import { fetchDailyPractice, fetchPracticeHistory } from "../Streak/actions";


// const TrackerScreen = () => {
//   const [fetchLoading, setLoading] = useState(false);
//   const { t } = useTranslation();
//   const { locationData, loading: locationLoading, error } = useUserLocation();
//   const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
//   const { data: streakData } = useSelector((state: RootState) => state.practiceStreaksReducer);
//  const dailyPractice: any = useSelector((state: RootState) => state.dailyPracticeReducer);
 
//   useEffect(() => {
//     if (!locationLoading && locationData.timezone) {
//       dispatch(fetchPracticeHistory(locationData.timezone));
//     }
//   }, [dispatch, locationData.timezone, locationLoading]);

//   useEffect(() => {
//     if (!locationLoading && locationData.timezone) {
//       const today = moment().format("YYYY-MM-DD");
//       dispatch(fetchDailyPractice(today, locationData.timezone));
//     }
//   }, [dispatch, locationData.timezone, locationLoading]);

//   const sortedPractices =
//   dailyPractice?.data?.active_practices
//     ?.slice() // clone so we don't mutate redux
//     ?.sort((a, b) => {
//       const aDone = dailyPractice?.data?.completed_today?.includes(a.practice_id);
//       const bDone = dailyPractice?.data?.completed_today?.includes(b.practice_id);
//       return aDone === bDone ? 0 : aDone ? 1 : -1; 
//     }) || [];


//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Colors.white }}>
//       <StatusBar
//         barStyle="dark-content"
//         backgroundColor={Colors.Colors.header_bg}
//         translucent={false}
//       />
//       <ScrollView
//         contentContainerStyle={{ paddingBottom: 30 }}
//         showsVerticalScrollIndicator={false}
//       >
//         <TextComponent
//           type="cardHeaderText"
//           style={{alignSelf:"center",marginTop:15,color:Colors.Colors.BLACK}}
//         >
//        {t("sadanaTracker.completeTodaysPractices")}
//         </TextComponent> 
//            <TextComponent
//             type="subScrollText"
//             style={{
//               color: Colors.Colors.BLACK,
//               marginTop: 12,alignSelf:"center"
//             }}
//           >
//              {t("sadanaTracker.progressSummary", {
//   completed: dailyPractice?.data?.completed_today?.length || 0,
//   total: dailyPractice?.data?.active_practices?.length || 0,
//   date: moment().format("MM/DD/YYYY"),
// })}
//           </TextComponent>      
// <FlatList
// data={sortedPractices}
//   keyExtractor={(item) => item.practice_id}
//   contentContainerStyle={{
//     paddingBottom: 20,
//   }}
//   renderItem={({ item }) => {
// let displayName = "";
// let displayDescription = "";
// if (item.source === "custom") {
//   displayName = item.name?.trim() || "Custom Practice";
//   displayDescription = item.description?.trim() || "";
// } else {
//   const translated = getTranslatedPractice(item.details || item, t);
//   displayName = translated.name || item.name || "Unnamed Practice";
//   displayDescription =
//     translated.desc ||
//     item.description ||
//     item.details?.description ||
//     "";
// }
// const isCompleted = dailyPractice?.data?.completed_today?.includes(item.practice_id);
// const mantraText =
//   item.details?.devanagari ||
//   item.mantra ||
//   t(`practices.${item.details?.id}.mantra`, { defaultValue: "" });
// const triggerLabel = t(`submitPractice.reminder.${item.trigger}`, {
//   defaultValue: item.trigger || t("sadanaTracker.noTrigger"),
// });
// const isSankalp =
//   item.type === "sankalp" ||
//   item.details?.type === "sankalp" ||
//   item.details?.id?.startsWith("sankalp_");
// const displayMeaning = isSankalp
//   ? item.details?.short_text || item.short_text || ""
//   : t(`practices.${item.details?.id}.meaning`, {
//       defaultValue: item.meaning || "",
//     });

//     return (
//       <Card
//         style={{
//           borderColor: "#D4A01724",
//           borderWidth: 2,
//           borderRadius: 10,
//           padding: 12,
//           marginHorizontal: 20,
//           marginVertical: 10,
//           backgroundColor: Colors.Colors.header_bg,
//         }}
//       >
//         <TextComponent
//           type="mediumText"
//           style={{
//             fontSize: FontSize.CONSTS.FS_14,
//             color: Colors.Colors.BLACK,
//           }}
//         >
//           {/* {item.icon}  */}
//           {displayName}
//         </TextComponent>
// <View style={{borderBottomColor:"#616161",borderBottomWidth:0.25,paddingHorizontal:-12,marginVertical:4}} />
//         {displayDescription ? (
//           <TextComponent
//             type="mediumText"
//             style={{
//               fontSize: FontSize.CONSTS.FS_13,
//               marginTop: 4,
//               color: Colors.Colors.Light_black,
//             }}
//           >
//             {displayDescription}
//           </TextComponent>
//         ) : null}

//    {mantraText ? (
//   <TextComponent
//     type="mediumText"
//     style={{
//       fontSize: FontSize.CONSTS.FS_14,
//       marginTop: 6,
//       color: Colors.Colors.Light_black,
//     }}
//   >
//     {t("sadanaTracker.mantraLabel")} {mantraText}
//   </TextComponent>
// ) : null}

// {displayMeaning?.trim()?.length > 0 && (
//   <TextComponent
//     type="mediumText"
//     style={{
//       fontSize: FontSize.CONSTS.FS_13,
//       marginTop: 4,
//       color: Colors.Colors.Light_black,
//     }}
//   >
//     {displayMeaning}
//   </TextComponent>
// )}
//         {/* <TextComponent
//           type="mediumText"
//           style={{
//             fontSize: FontSize.CONSTS.FS_14,
//             marginTop: 6,
//             color: Colors.Colors.Light_black,
//           }}
//         >
//           {t("sadanaTracker.triggerLabel")} {triggerLabel}
//         </TextComponent> */}
//         <TouchableOpacity
//           style={{
//             backgroundColor: isCompleted? "#36AE68": Colors.Colors.white,
//             padding: 12,
//             alignItems: "center",
//             justifyContent: "center",
//             marginVertical: 10,
//             borderRadius: 30,
//             alignSelf:"center",
//             borderColor:isCompleted? "#36AE68":Colors.Colors.Yellow,
//             borderWidth:1
//           }}
//           disabled={isCompleted}
//           onPress={() => {
//     setLoading(true);
//             if (!isCompleted && locationData?.timezone) {
//               const payload = {
//                 practice_id: item.practice_id,
//                 date: moment().format("YYYY-MM-DD"),
//                 timezone: locationData.timezone,
//               };

//               console.log("📤 Submitting track payload:", payload);
//               dispatch(
//                 trackDailyPractice(payload, (res) => {
//     setLoading(false);
//                   // if (res.success) {
//                     console.log("✅ Practice marked complete:", res.data);
//                     dispatch(
//                       fetchDailyPractice(
//                         moment().format("YYYY-MM-DD"),
//                         locationData.timezone
//                       )
//                     );
//                   // } else {
//                   //   console.log("❌ Failed to mark complete:", res.error);
//                   // }
//                 })
//               );
//             }
//           }}
//         >
//           <TextComponent
//             type="headerSubBoldText"
//             style={{
//               color: isCompleted
//                 ? Colors.Colors.white
//                 : Colors.Colors.Yellow,
//             }}
//           >
//             {isCompleted
//               ? t("sadanaTracker.completedButton")
//               : t("sadanaTracker.markAsDone")}
//           </TextComponent>
//         </TouchableOpacity>
//       </Card>
//     );
//   }}
// />
// <LoadingOverlay visible={fetchLoading} text="Submitting..." />
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default TrackerScreen;
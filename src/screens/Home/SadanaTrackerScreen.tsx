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
import { Dropdown } from "react-native-element-dropdown";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";
import Header from "../../components/Header";
import PracticeDailyModal from "../../components/PracticeDailyModal";
import TextComponent from "../../components/TextComponent";
import { useUserLocation } from "../../components/useUserLocation";
import { RootState } from "../../store";
import { fetchDailyPractice, fetchPracticeHistory } from "../Streak/actions";
import { trackDailyPractice } from "./actions";
import styles from "./homestyles";

const { width } = Dimensions.get("window");

const SadanaTrackerScreen = () => {
  const navigation: any = useNavigation();
  const [reason, setReason] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [showPractiseModal, setShowPractiseModal] = useState(false);

  const { t } = useTranslation();
  const { locationData, loading: locationLoading, error } = useUserLocation();
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const rememberdata = [
    { label: "Schedule conflict", value: "schedule_conflict" },
    { label: "No longer interested", value: "no_longer_interested" },
    { label: "Technical issue", value: "technical_issue" },
    { label: "Other", value: "other" },
  ];

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
          Honor Your Daily Rituals
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
          Simple steps to cultivate peace and mindfulness each day.
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
            No Blessing Badge Earned Yet
          </TextComponent>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 12,
            }}
          >
            <TextComponent type="mediumText">0 days streak</TextComponent>
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
            Welcome to your profile. Edit your details and Practices
          </TextComponent>
          <TextComponent
            type="mediumText"
            style={{
              color: Colors.Colors.BLACK,
              fontSize: FontSize.CONSTS.FS_14,
              marginTop: 12,
            }}
          >
            {" "}
            1/1 practices completed on 10/3/2025
          </TextComponent>
          <View
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
              type="mediumText"
              style={{
                color: Colors.Colors.Yellow,
                fontSize: FontSize.CONSTS.FS_18,
    fontFamily: "Inter_700Bold",
              }}
            >
              {" "}
              Add Practices
            </TextComponent>
          </View>

          <TextComponent
            type="mediumText"
            style={{
              color: Colors.Colors.BLACK,
              fontSize: FontSize.CONSTS.FS_14,
              marginBottom: 12,
            }}
          >
            6 Days to earn your next Blessing Badge
          </TextComponent>
        </View>

        <TextComponent
          type="cardText"
          style={{ marginBottom: 10, marginLeft: 20 }}
        >
          Complete Today's Practices
        </TextComponent>

        <FlatList
          data={dailyPractice?.data?.active_practices || []}
          keyExtractor={(item) => item.practice_id}
          contentContainerStyle={{
            paddingBottom: 20,
          }}
          renderItem={({ item }) => {
            const isCompleted =
              dailyPractice?.data?.completed_today?.includes(item.practice_id);

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
                  style={{ fontSize: FontSize.CONSTS.FS_14 }}
                >
                  {item.icon}{" "}
                  {item.name === "Unnamed Practice"
                    ? item.details.text
                    : item.name}
                </TextComponent>

                <TextComponent
                  type="mediumText"
                  style={{
                    fontSize: FontSize.CONSTS.FS_14,
                    marginTop: 4,
                    color: Colors.Colors.Light_black,
                  }}
                >
                  Mantra:{" "}
                  {item.details?.devanagari ||
                    item.mantra ||
                    "No mantra available"}
                </TextComponent>

                <TextComponent
                  type="mediumText"
                  style={{
                    fontSize: FontSize.CONSTS.FS_14,
                    marginTop: 4,
                    color: Colors.Colors.Light_black,
                  }}
                >
                  Trigger: {item.trigger}
                </TextComponent>

                <TextComponent
                  type="mediumText"
                  style={{
                    fontSize: FontSize.CONSTS.FS_14,
                    marginTop: 4,
                    color: Colors.Colors.Light_black,
                  }}
                >
                  Last Practice:{" "}
                  {item.last_practice_date
                    ? moment(item.last_practice_date).format("DD/MM/YYYY")
                    : "—"}
                </TextComponent>

                {/* ✅ Updated Mark as Done logic */}
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
                    if (!isCompleted && locationData?.timezone) {
                      const payload = {
                        practice_id: item.practice_id,
                        date: moment().format("YYYY-MM-DD"),
                        timezone: locationData.timezone,
                      };

                      console.log("📤 Submitting track payload:", payload);
                      dispatch(
                        trackDailyPractice(payload, (res) => {
                          if (res.success) {
                            console.log("✅ Practice marked complete:", res.data);
                            // 🔁 Refresh the daily practice list
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
                    {isCompleted ? "Completed" : "Mark as Done"}
                  </TextComponent>
                </TouchableOpacity>
              </View>
            );
          }}
        />

        {/* Remainders & Calendar Section (unchanged) */}
        <View style={styles.container}>
          <Dropdown
            data={rememberdata}
            labelField="label"
            valueField="value"
            placeholder="Remainders and Settings"
            value={reason}
            onChange={(item) => setReason(item.value)}
            style={styles.dropdown}
            selectedTextStyle={styles.selectedText}
            placeholderStyle={styles.placeholder}
          />
        </View>

        <View style={{ marginHorizontal: 20 }}>
          <TextComponent
            type="cardText"
            style={{
              color: Colors.Colors.BLACK,
              fontSize: FontSize.CONSTS.FS_18,
              marginTop: 10,
            }}
          >
            Dharma Progress Calendar
          </TextComponent>
          <TextComponent
            type="mediumText"
            style={{
              fontSize: FontSize.CONSTS.FS_14,
              marginTop: 10,
            }}
          >
            Your Daily practice Tracker
          </TextComponent>
          <View
            style={{
              marginTop: 10,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <TextComponent type="cardText">Completed (1)</TextComponent>
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
              Not Done (0)
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
            {" "}
            Selected date :{" "}
            <TextComponent
              type="cardText"
              style={{ color: Colors.Colors.BLACK }}
            >
              03/10/2025
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
          renderItem={({ item }) => (
            <TouchableOpacity
              disabled={!item.isPastOrToday}
              onPress={() => {
                setSelectedDate(item.fullDate);
                if (!locationLoading && locationData.timezone) {
                  dispatch(fetchDailyPractice(item.fullDate, locationData.timezone));
                  console.log("practiceHistory >>>>>>>", JSON.stringify(practiceHistory));
                  setShowPractiseModal(true);
                }
              }}
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
        />

        <PracticeDailyModal
          visible={showPractiseModal}
          date={selectedDate}
          dailyPractice={{
            active_practices: dailyPractice.data.active_practices || [],
            completed_today: dailyPractice.data.completed_today || [],
          }}
          onClose={() => setShowPractiseModal(false)}
        />
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

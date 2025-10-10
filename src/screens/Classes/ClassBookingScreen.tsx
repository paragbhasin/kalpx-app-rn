import { AnyAction } from "@reduxjs/toolkit";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import CalendarUI from "../../components/CalendarUI";
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";
import LoadingButton from "../../components/LoadingButton"; // ✅ Import LoadingButton
import TextComponent from "../../components/TextComponent";
import { RootState } from "../../store";
import { bookSlot, rescheduleBooking, slotsList } from "./actions";
import styles from "./styles";

export default function ClassBookingScreen({ navigation, route }) {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const { t } = useTranslation();

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedSlotUTC, setSelectedSlotUTC] = useState<string>("");
  const [trailListed, setTrailListed] = useState(false);
  const [note, setNote] = useState("");
  const [loadingNext, setLoadingNext] = useState(false); // ✅ For LoadingButton

  console.log("route >>>>>>>>>", route?.params?.data?.id);

  // User timezone for API calls
  const userTimezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";

  // ✅ Fetch available slots
  const fetchSlots = (date: string) => {
    if (!date) return;
    setLoadingSlots(true);

    const offeringId = route?.params?.reschedule
      ? route?.params?.data?.offering?.id
      : route?.params?.data?.id;
    const tutor_timezone = route?.params?.reschedule
      ? route?.params?.data?.offering?.tutor?.timezone
      : route?.params?.data?.tutor?.timezone;

    console.log(
      "info >>>>>>>>>",
      offeringId,
      date,
      userTimezone,
      tutor_timezone
    );
    dispatch(
      slotsList(offeringId, date, userTimezone, tutor_timezone, (res: any) => {
        setLoadingSlots(false);
        if (res.success) {
          setAvailableSlots(res.data.slots || []);
        } else {
          setAvailableSlots([]);
        }
      })
    );
  };

  // ✅ On mount, fetch today’s slots
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    fetchSlots(today);
  }, []);

  // ✅ Slot time render
  const renderItem = ({ item }: { item: any }) => {
    const isSelected = item.start_user === selectedTime;
    return (
      <Pressable
        onPress={() => {
          setSelectedTime(item.start_user);
          setSelectedSlotUTC(item.start_utc);
        }}
        style={[
          styles.timeContainer,
          {
            backgroundColor: isSelected
              ? Colors.Colors.App_theme
              : Colors.Colors.class_bg,
          },
        ]}
      >
        <TextComponent
          type="semiBoldText"
          style={{
            color: isSelected ? Colors.Colors.white : Colors.Colors.BLACK,
          }}
        >
          {moment(item.start_user).format("hh:mm A")}
        </TextComponent>
      </Pressable>
    );
  };

  // ✅ Handle Next with loader + API call
  const handleNext = () => {
    if (!selectedSlotUTC) {
      alert("Please select a slot before continuing.");
      return;
    }

    setLoadingNext(true);

    // Prepare booking payload
    const payload = {
      offering_id: route?.params?.data?.id,
      scheduled_at: selectedSlotUTC,
      user_timezone: userTimezone,
      tutor_timezone: route?.params?.data?.tutor?.timezone,
      note,
      trial_selected: trailListed,
    };

    console.log("Booking payload >>>", payload);

    // Simulate API or dispatch your thunk
    dispatch(
      bookSlot(payload, (res: any) => {
        setLoadingNext(false);
        if (res.success) {
          console.log("res of Book slot >>>>>", res);
          navigation.navigate("ClassPaymentScreen", {
            bookingData: res,
            data: route?.params?.data,
          });
        } else {
          alert("Failed to fetch slot confirmation, please try again.");
        }
      })
    );
  };

  const handleReschedule = () => {
    if (!selectedSlotUTC) {
      alert("Please select a slot before continuing.");
      return;
    }

    setLoadingNext(true);

    // Prepare booking payload
    const payload = {
      new_time: selectedSlotUTC,
    };

    console.log("Booking payload >>>", payload);

    dispatch(
      rescheduleBooking(route?.params?.data?.id, payload, (res) => {
        if (res.success) {
          console.log("Rescheduled successfully:", res.data);
          navigation.navigate("ClassesScreen");
        } else console.error("Reschedule failed:", res.error);
      })
    );
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
      style={{ paddingHorizontal: 24 }}
    >
      {/* 🔙 Back Button */}
      <Pressable style={{ marginTop: 60 }} onPress={() => navigation.goBack()}>
        <View
          style={{
            backgroundColor: "#D9D9D9",
            alignSelf: "flex-start",
            padding: 10,
            borderRadius: 25,
          }}
        >
          <Image
            source={require("../../../assets/C_Arrow_back.png")}
            style={{ width: 20, height: 20 }}
            resizeMode="contain"
          />
        </View>
      </Pressable>

      {/* Progress bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 10,
        }}
      >
        <View style={{ alignItems: "center" }}>
          <View
            style={{
              backgroundColor: Colors.Colors.App_theme,
              borderRadius: 20,
              alignItems: "center",
              width: 40,
              height: 40,
            }}
          >
            <TextComponent
              type="headerText"
              style={{ color: Colors.Colors.white, marginTop: 10 }}
            >
              1
            </TextComponent>
          </View>
        </View>
        <View
          style={{
            borderColor: Colors.Colors.class_bg,
            borderWidth: 1,
            width: 100,
          }}
        />
        <View style={{ alignItems: "center" }}>
          <View
            style={{
              backgroundColor: Colors.Colors.class_bg,
              borderRadius: 20,
              alignItems: "center",
              width: 40,
              height: 40,
            }}
          >
            <TextComponent type="headerText" style={{ marginTop: 10 }}>
              2
            </TextComponent>
          </View>
        </View>
      </View>

      {/* Booking Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-evenly",
          marginTop: 4,
          marginBottom: 8,
        }}
      >
        <TextComponent
          type="semiBoldText"
          style={{ color: Colors.Colors.BLACK }}
        >
          Slot Booking
        </TextComponent>
        <TextComponent
          type="semiBoldText"
          style={{ color: Colors.Colors.BLACK }}
        >
          Payment
        </TextComponent>
      </View>

      {/* Class Info */}
      <TextComponent type="headerText" style={styles.label}>
        {route?.params?.reschedule
          ? route?.params?.data?.offering?.title
          : route?.params?.data?.title}
      </TextComponent>

      <TextComponent type="headerText" style={styles.label}>
        {route?.params?.reschedule
          ? route?.params?.data?.offering?.subtitle
          : route?.params?.data?.subtitle}
      </TextComponent>

      <View style={styles.row}>
        <TextComponent
          type="mediumText"
          style={{ ...styles.label, color: Colors.Colors.Light_grey }}
        >
          Duration :
        </TextComponent>
        <TextComponent type="mediumText" style={styles.label}>
          {route?.params?.reschedule
            ? route?.params?.data?.offering?.pricing?.per_person
                ?.session_length_min
            : route?.params?.data?.pricing?.per_person?.session_length_min}{" "}
          Minutes
        </TextComponent>
      </View>

      {/* Price */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}
      >
        <TextComponent
          type="boldText"
          style={{ fontSize: FontSize.CONSTS.FS_20 }}
        >
          {(route?.params?.reschedule
            ? route?.params?.data?.offering?.pricing?.currency
            : route?.params?.data?.pricing?.currency) === "INR"
            ? "₹"
            : "$"}{" "}
          {(route?.params?.reschedule
            ? route?.params?.data?.offering?.pricing?.per_person?.amount?.app
            : route?.params?.data?.pricing?.per_person?.amount?.app) ?? 0}
        </TextComponent>
        <TextComponent
          type="mediumText"
          style={{ fontSize: FontSize.CONSTS.FS_10, marginTop: -8 }}
        >
          / Per Person
        </TextComponent>
      </View>

      {/* Calendar */}
      <TextComponent
        type="boldText"
        style={{
          fontSize: FontSize.CONSTS.FS_14,
          marginVertical: 12,
          color: Colors.Colors.BLACK,
        }}
      >
        Slot Booking
      </TextComponent>

      <CalendarUI
        startDate={new Date().toISOString().split("T")[0]}
        onDayPress={(day: any) => {
          const date = day.dateString;
          setSelectedDate(date);
          fetchSlots(date);
        }}
      />

      {/* Available Slots */}
      <TextComponent
        type="boldText"
        style={{
          fontSize: FontSize.CONSTS.FS_14,
          marginVertical: 12,
          color: Colors.Colors.BLACK,
        }}
      >
        Available slots
      </TextComponent>

      {loadingSlots ? (
        <Text>Loading slots...</Text>
      ) : (
        <FlatList
          data={availableSlots}
          renderItem={renderItem}
          keyExtractor={(_, idx) => idx.toString()}
          numColumns={3}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: 8,
          }}
          ListEmptyComponent={<Text>No slots available.</Text>}
        />
      )}

      {/* Timezone Info */}
      <View style={{ flexDirection: "row" }}>
        <View style={styles.row}>
          <TextComponent
            type="mediumText"
            style={{ ...styles.label, color: Colors.Colors.Light_grey }}
          >
            Tutor TZ:
          </TextComponent>
          <TextComponent type="mediumText" style={styles.label}>
            {route?.params?.reschedule
              ? route?.params?.data?.offering?.tutor?.timezone
              : route?.params?.data?.tutor?.timezone}
          </TextComponent>
        </View>
        <View style={{ ...styles.row, marginLeft: 25 }}>
          <TextComponent
            type="mediumText"
            style={{ ...styles.label, color: Colors.Colors.Light_grey }}
          >
            Your TZ:
          </TextComponent>
          <TextComponent type="mediumText" style={styles.label}>
            {userTimezone}
          </TextComponent>
        </View>
      </View>

      {/* Trial Option */}
      {route?.params?.data?.pricing?.trial?.enabled && (
        <View style={{ ...styles.row, marginTop: 12 }}>
          <Pressable onPress={() => setTrailListed(!trailListed)}>
            {trailListed ? (
              <Image
                source={require("../../../assets/Check.png")}
                style={{
                  width: 20,
                  height: 20,
                  resizeMode: "contain",
                  marginRight: 8,
                  borderRadius: 4,
                }}
              />
            ) : (
              <View
                style={[styles.checkbox, trailListed && styles.checkedBox]}
              />
            )}
          </Pressable>

          <TextComponent
            type="mediumText"
            style={{ ...styles.label, color: Colors.Colors.Light_grey }}
          >
            Trial at :
          </TextComponent>
          <TextComponent type="mediumText" style={styles.label}>
            ₹ {route?.params?.data?.pricing?.trial?.amount}
          </TextComponent>
        </View>
      )}

      {/* Note */}
      <TextComponent
        type="boldText"
        style={{
          color: Colors.Colors.BLACK,
          fontSize: FontSize.CONSTS.FS_14,
          marginTop: 12,
        }}
      >
        Note to Tutor (Optional)
      </TextComponent>

      <TextInput
        style={styles.input}
        placeholder="Enter note"
        value={note}
        onChangeText={setNote}
      />

      {/* ✅ Replaced TouchableOpacity with LoadingButton */}
      <LoadingButton
        loading={loadingNext}
        text={route?.params?.reschedule ? "Reschedule" : "Next"}
        onPress={route?.params?.reschedule ? handleReschedule : handleNext}
        disabled={loadingNext}
        style={{
          backgroundColor: Colors.Colors.App_theme,
          paddingVertical: 10,
          paddingHorizontal: 22,
          borderRadius: 10,
          alignItems: "center",
          marginTop: 20,
          alignSelf: "flex-end",
          width: "40%",
        }}
        textStyle={{
          color: Colors.Colors.white,
          fontSize: FontSize.CONSTS.FS_12,
        }}
      />
    </ScrollView>
  );
}

// import { AnyAction } from "@reduxjs/toolkit";
// import moment from "moment";
// import React, { useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   FlatList,
//   Image,
//   Pressable,
//   ScrollView,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { useDispatch } from "react-redux";
// import { ThunkDispatch } from "redux-thunk";
// import CalendarUI from "../../components/CalendarUI";
// import Colors from "../../components/Colors";
// import FontSize from "../../components/FontSize";
// import TextComponent from "../../components/TextComponent";
// import { RootState } from "../../store";
// import { slotsList } from "./actions";
// import styles from "./styles";

// // Reusable ReadMore Component
// const ReadMoreText = ({ text }: { text: string }) => {
//   const [expanded, setExpanded] = useState(false);
//   const [showReadMore, setShowReadMore] = useState(false);

//   return (
//     <Text
//       style={{ color: Colors.Colors.Light_black, marginTop: 6 }}
//       numberOfLines={expanded ? undefined : 2}
//       onTextLayout={(e) => {
//         if (e.nativeEvent.lines.length > 2 && !showReadMore) {
//           setShowReadMore(true);
//         }
//       }}
//     >
//       {text}
//       {showReadMore ? (
//         <Text
//           style={{ color: Colors.Colors.App_theme, fontWeight: "600" }}
//           onPress={() => setExpanded(!expanded)}
//         >
//           {expanded ? "  Read Less" : "  Read More"}
//         </Text>
//       ) : null}
//     </Text>
//   );
// };

// export default function ClassBookingScreen({ navigation, route }) {
//    const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
//   const { t } = useTranslation();

//   console.log("route data >>>>>>>>>",JSON)

//   const [selectedDate, setSelectedDate] = useState<string>("");
//   const [availableSlots, setAvailableSlots] = useState<any[]>([]);
//   const [loadingSlots, setLoadingSlots] = useState(false);
//   const [selectedTime, setSelectedTime] = useState<string>("");
//   const [TrailListed, setTrailListed] = useState(false);

//   // User timezone for API calls
//   const userTimezone =
//     Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";

//   // ✅ Function to fetch available slots
//   const fetchSlots = (date: string) => {
//     if (!date) return;
//     setLoadingSlots(true);

//     const offeringId = route?.params?.data?.id;
//     const tutor_timezone = route?.params?.data?.tutor?.timezone;

//     console.log("Calling slotsList with:", {
//       offeringId,
//       date,
//       userTimezone,
//       tutor_timezone,
//     });

//     // ✅ Dispatch Redux thunk
//     dispatch(
//       slotsList(offeringId, date, userTimezone, tutor_timezone, (res: any) => {
//         console.log("slotsList callback result:", res);
//         setLoadingSlots(false);
//         if (res.success) {
//           setAvailableSlots(res.data.slots || []);
//         } else {
//           setAvailableSlots([]);
//         }
//       })
//     );
//   };

//   // ✅ On mount, fetch today’s slots
//   useEffect(() => {
//     const today = new Date().toISOString().split("T")[0];
//     setSelectedDate(today);
//     fetchSlots(today);
//   }, []);

//   // ✅ Slot time render
//   const renderItem = ({ item }: { item: any }) => {
//     const isSelected = item.start_user === selectedTime;
//     return (
//       <TouchableOpacity
//         onPress={() => setSelectedTime(item.start_user)}
//         style={[
//           styles.timeContainer,
//           {
//             backgroundColor: isSelected
//               ? Colors.Colors.App_theme
//               : Colors.Colors.class_bg,
//             marginBottom: 8,
//           },
//         ]}
//       >
//         <TextComponent
//           type="semiBoldText"
//           style={{
//             color: isSelected ? Colors.Colors.white : Colors.Colors.BLACK,
//           }}
//         >
//           {moment(item.start_user).format("hh:mm A")}
//         </TextComponent>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <ScrollView
//       contentContainerStyle={{ paddingBottom: 120 }}
//       showsVerticalScrollIndicator={false}
//       style={{ paddingHorizontal: 24 }}
//     >
//       {/* 🔙 Back Button */}
//       <TouchableOpacity
//         style={{ marginTop: 60 }}
//         onPress={() => navigation.goBack()}
//       >
//         <View
//           style={{
//             backgroundColor: "#D9D9D9",
//             alignSelf: "flex-start",
//             padding: 10,
//             borderRadius: 25,
//           }}
//         >
//           <Image
//             source={require("../../../assets/C_Arrow_back.png")}
//             style={{ width: 20, height: 20 }}
//             resizeMode="contain"
//           />
//         </View>
//       </TouchableOpacity>

//       {/* Progress bar */}
//       <View
//         style={{
//           flexDirection: "row",
//           alignItems: "center",
//           justifyContent: "center",
//           marginTop: 10,
//         }}
//       >
//         <View style={{ alignItems: "center" }}>
//           <View
//             style={{
//               backgroundColor: Colors.Colors.App_theme,
//               borderRadius: 20,
//               alignItems: "center",
//               width: 40,
//               height: 40,
//             }}
//           >
//             <TextComponent
//               type="headerText"
//               style={{ color: Colors.Colors.white, marginTop: 10 }}
//             >
//               1
//             </TextComponent>
//           </View>
//         </View>
//         <View
//           style={{
//             borderColor: Colors.Colors.class_bg,
//             borderWidth: 1,
//             width: 100,
//           }}
//         />
//         <View style={{ alignItems: "center" }}>
//           <View
//             style={{
//               backgroundColor: Colors.Colors.class_bg,
//               borderRadius: 20,
//               alignItems: "center",
//               width: 40,
//               height: 40,
//             }}
//           >
//             <TextComponent type="headerText" style={{ marginTop: 10 }}>
//               2
//             </TextComponent>
//           </View>
//         </View>
//       </View>

//       <View
//         style={{
//           flexDirection: "row",
//           justifyContent: "space-evenly",
//           marginTop: 4,
//           marginBottom: 8,
//         }}
//       >
//         <TextComponent type="semiBoldText" style={{ color: Colors.Colors.BLACK }}>
//           Slot Booking
//         </TextComponent>
//         <TextComponent type="semiBoldText" style={{ color: Colors.Colors.BLACK }}>
//           Payment
//         </TextComponent>
//       </View>

//       {/* Class Info */}
//       <View style={styles.row}>
//         <TextComponent type="headerText" style={styles.label}>
//           {route?.params?.data?.title}
//         </TextComponent>
//       </View>
//       <TextComponent type="headerText" style={styles.label}>
//         {route?.params?.data?.subtitle}
//       </TextComponent>

//       <View style={styles.row}>
//         <TextComponent
//           type="mediumText"
//           style={{ ...styles.label, color: Colors.Colors.Light_grey }}
//         >
//           Duration :
//         </TextComponent>
//         <TextComponent type="mediumText" style={styles.label}>
//           {route?.params?.data?.pricing.per_person.session_length_min} Minutes
//         </TextComponent>
//       </View>

//       <View
//         style={{
//           flexDirection: "row",
//           alignItems: "center",
//           marginTop: 2,
//         }}
//       >
//         <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
//           <TextComponent
//             type="boldText"
//             style={{ fontSize: FontSize.CONSTS.FS_20 }}
//           >
//             {route?.params?.data?.pricing?.currency === "INR" ? "₹" : "$"}{" "}
//             {route?.params?.data?.pricing?.per_person?.amount?.app ?? 0}
//           </TextComponent>
//           <TextComponent
//             type="mediumText"
//             style={{ fontSize: FontSize.CONSTS.FS_10, marginTop: -8 }}
//           >
//             / Per Person
//           </TextComponent>
//         </View>
//         <TextComponent type="semiBoldText" style={{ marginLeft: 6 }}>
//           View More Details
//         </TextComponent>
//       </View>

//       {/* 📅 Calendar */}
//       <TextComponent
//         type="boldText"
//         style={{
//           fontSize: FontSize.CONSTS.FS_14,
//           marginVertical: 12,
//           color: Colors.Colors.BLACK,
//         }}
//       >
//         Slot Booking
//       </TextComponent>

//       <CalendarUI
//         startDate={new Date().toISOString().split("T")[0]}
//         onDayPress={(day: any) => {
//           const date = day.dateString;
//           console.log("Selected date >>>>", date);
//           setSelectedDate(date);
//           fetchSlots(date);
//         }}
//       />

//       {/* 🕒 Slots */}
//       <TextComponent
//         type="boldText"
//         style={{
//           fontSize: FontSize.CONSTS.FS_14,
//           marginVertical: 12,
//           color: Colors.Colors.BLACK,
//         }}
//       >
//         Available slots
//       </TextComponent>

//       {loadingSlots ? (
//         <View style={{ padding: 16 }}>
//           <Text>Loading slots...</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={availableSlots}
//           renderItem={renderItem}
//           keyExtractor={(_, idx) => idx.toString()}
//           numColumns={3}
//           columnWrapperStyle={{
//             justifyContent: "space-between",
//             marginBottom: 8,
//           }}
//           contentContainerStyle={{
//             paddingHorizontal: 15,
//             paddingVertical: 10,
//           }}
//           ListEmptyComponent={<Text>No slots available.</Text>}
//         />
//       )}

//       {/* Timezone Info */}
//       <View style={{ flexDirection: "row" }}>
//         <View style={styles.row}>
//           <TextComponent
//             type="mediumText"
//             style={{ ...styles.label, color: Colors.Colors.Light_grey }}
//           >
//             Tutor TZ:
//           </TextComponent>
//           <TextComponent type="mediumText" style={styles.label}>
//             {route?.params?.data?.tutor?.timezone}
//           </TextComponent>
//         </View>
//         <View style={{ ...styles.row, marginLeft: 25 }}>
//           <TextComponent
//             type="mediumText"
//             style={{ ...styles.label, color: Colors.Colors.Light_grey }}
//           >
//             Your TZ:
//           </TextComponent>
//           <TextComponent type="mediumText" style={styles.label}>
//             {userTimezone}
//           </TextComponent>
//         </View>
//       </View>

//       {/* Trial Option */}
//       {route?.params?.data?.pricing?.trial?.enabled && (
//         <View style={{ ...styles.row, marginTop: 12 }}>
//           <Pressable onPress={() => setTrailListed(!TrailListed)}>
//             {TrailListed ? (
//               <Image
//                 source={require("../../../assets/Check.png")}
//                 style={{
//                   width: 20,
//                   height: 20,
//                   resizeMode: "contain",
//                   marginRight: 8,
//                   borderRadius: 4,
//                 }}
//               />
//             ) : (
//               <View style={[styles.checkbox, TrailListed && styles.checkedBox]} />
//             )}
//           </Pressable>

//           <TextComponent
//             type="mediumText"
//             style={{ ...styles.label, color: Colors.Colors.Light_grey }}
//           >
//             Trial at :
//           </TextComponent>
//           <TextComponent type="mediumText" style={styles.label}>
//             ₹ {route?.params?.data?.pricing?.trial?.amount}
//           </TextComponent>
//         </View>
//       )}

//       {/* Note */}
//       <TextComponent
//         type="boldText"
//         style={{
//           color: Colors.Colors.BLACK,
//           fontSize: FontSize.CONSTS.FS_14,
//           marginTop: 12,
//         }}
//       >
//         Note to Tutor (Optional)
//       </TextComponent>

//       <TextInput
//         style={styles.input}
//         placeholder={t("pooja.enterCity")}
//       />

//       {/* Next Button */}
//       <TouchableOpacity
//         onPress={() => navigation.navigate("ClassPaymentScreen")}
//         style={{
//           backgroundColor: Colors.Colors.App_theme,
//           paddingVertical: 10,
//           paddingHorizontal: 22,
//           borderRadius: 10,
//           alignItems: "center",
//           marginTop: 20,
//           alignSelf: "flex-end",
//         }}
//       >
//         <TextComponent
//           style={{
//             color: Colors.Colors.white,
//             fontSize: FontSize.CONSTS.FS_12,
//           }}
//         >
//           Next
//         </TextComponent>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

import { AnyAction } from "@reduxjs/toolkit";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import CalendarUI from "../../components/CalendarUI";
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";
import Header from "../../components/Header";
import LoadingButton from "../../components/LoadingButton"; // ✅ Import LoadingButton
import TextComponent from "../../components/TextComponent";
import { RootState } from "../../store";
import { ensureLoggedIn } from "../../utils/authHelpers";
import { bookSlot, rescheduleBooking, slotsList } from "./actions";
import styles from "./styles";

export default function ClassBookingScreen({ navigation, route }) {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const { t } = useTranslation();
  const isRestoringRef = useRef(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedSlotUTC, setSelectedSlotUTC] = useState<string>("");
  const [trailListed, setTrailListed] = useState(false);
  const [note, setNote] = useState("");
  const [loadingNext, setLoadingNext] = useState(false); // ✅ For LoadingButton
const [isRestored, setIsRestored] = useState(false);


  const classInfo =
    route?.params?.data ||
    route?.params?.resumeData?.classData ||
    null;

    // console.log("classInfo >>>>", JSON.stringify(classInfo)); 

const allowedWeekdays =
  classInfo?.class_availability?.weekly
    ?.filter(d => d.slots.length > 0)
    ?.map(d => d.weekday) || [];

    const highlightDates = classInfo?.available_slots?.map(s => s.date) || [];


    console.log("classInfo >>>>", JSON.stringify(highlightDates),JSON.stringify(highlightDates)); 


 const userTimezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";

    useEffect(() => {
  const firstDate = classInfo?.available_slots?.[0]?.date;
  const today = moment().format("YYYY-MM-DD");

  const initialDate = firstDate || today;

  setSelectedDate(initialDate);
  fetchSlots(initialDate);
}, []);


 useEffect(() => {
    if (!route.params?.resumeData) return;

    const data = route.params.resumeData;
    console.log("📩 Restoring pending class booking:", data);

    isRestoringRef.current = true;

    setSelectedDate(data.selectedDate || "");
    setSelectedSlotUTC(data.selectedSlotUTC || "");
    setSelectedTime(data.selectedTime || "");
    setTrailListed(data.trialListed || false);
    setNote(data.note || "");

    if (data.selectedDate) fetchSlots(data.selectedDate);

    setTimeout(() => {
      setIsRestored(true);
      isRestoringRef.current = false;
    }, 400);
  }, [route.params?.resumeData]);

  useEffect(() => {
    if (
      isRestored &&
      !loadingSlots &&
      selectedDate &&
      selectedSlotUTC &&
      selectedTime
    ) {
      console.log("🚀 Auto-submitting class booking after restore...");
      handleNext();
    }
  }, [isRestored, loadingSlots]);

  console.log("route >>>>>>>>>", classInfo?.id);


//   useEffect(() => {
//   const firstDate = classInfo?.available_slots?.[0]?.date;
//   const today = new Date().toISOString().split("T")[0];

//   const initialDate = firstDate || today;

//   console.log("📌 Initial selected date:", initialDate);

//   setSelectedDate(initialDate);
//   fetchSlots(initialDate);
// }, []);


  //   useEffect(() => {
  //   if (!isRestored) return;
  //   if (!selectedSlotUTC) return;

  //   const exists = availableSlots.some(s => s.start_utc === selectedSlotUTC);
  //   if (exists) {
  //     const slot = availableSlots.find(s => s.start_utc === selectedSlotUTC);
  //     setSelectedTime(slot.start_user);
  //   }
  // }, [availableSlots]);



 

  // ✅ Fetch available slots
  const fetchSlots = (date: string) => {
    if (!date) return;
    setLoadingSlots(true);

    const offeringId = route?.params?.reschedule
      ? classInfo?.offering?.id
      : classInfo?.id;
    const tutor_timezone = route?.params?.reschedule
      ? classInfo?.offering?.tutor?.timezone
      : classInfo?.tutor?.timezone;

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

  const handleNext = async () => {
    if (!selectedSlotUTC) {
      if (!isRestoringRef.current) {
        alert("Please select a slot before continuing.");
      }
      return false;
    }

    const pendingData = {
      selectedDate,
      selectedSlotUTC,
      selectedTime,
      trailListed,
      note,
      classData: classInfo,
    };

    const canProceed = await ensureLoggedIn(
      navigation,
      "pending_classes_data",
      pendingData
    );

    if (!canProceed) {
      console.log("⛔ No token, stopping API call.");
      return false;
    }

    setLoadingNext(true);

    const payload = {
      offering_id: classInfo?.id,
      scheduled_at: selectedSlotUTC,
      user_timezone: userTimezone,
      tutor_timezone: classInfo?.tutor?.timezone,
      note,
      trial_selected: trailListed,
    };

    dispatch(
      bookSlot(payload, (res) => {
        setLoadingNext(false);
        if (res.success) {
          navigation.navigate("ClassPaymentScreen", {
            bookingData: res,
            data: classInfo,
          });
        } else {
          alert("Failed to confirm slot. Please try again.");
        }
      })
    );
  };


  // ✅ Handle Next with loader + API call
  // const handleNext = () => {
  //   if (!selectedSlotUTC) {
  //     alert("Please select a slot before continuing.");
  //     return;
  //   }

  //   setLoadingNext(true);

  //   // Prepare booking payload
  //   const payload = {
  //     offering_id: classInfo?.id,
  //     scheduled_at: selectedSlotUTC,
  //     user_timezone: userTimezone,
  //     tutor_timezone: classInfo?.tutor?.timezone,
  //     note,
  //     trial_selected: trailListed,
  //   };

  //   console.log("Booking payload >>>", payload);

  //   // Simulate API or dispatch your thunk
  //   dispatch(
  //     bookSlot(payload, (res: any) => {
  //       setLoadingNext(false);
  //       if (res.success) {
  //         console.log("res of Book slot >>>>>", res);
  //         navigation.navigate("ClassPaymentScreen", {
  //           bookingData: res,
  //           data: classInfo,
  //         });
  //       } else {
  //         alert("Failed to fetch slot confirmation, please try again.");
  //       }
  //     })
  //   );
  // };

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
      rescheduleBooking(classInfo?.id, payload, (res) => {
        if (res.success) {
          console.log("Rescheduled successfully:", res.data);
          navigation.navigate("ClassesScreen");
        } else console.error("Reschedule failed:", res.error);
      })
    );
  };

  return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Colors.white }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.Colors.header_bg}
        translucent={false}
      />
      <Header />
    <ScrollView
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
      style={{ paddingHorizontal: 24 }}
    >
      {/* 🔙 Back Button */}
      <Pressable style={{ marginTop: 10 }}
      
      //  onPress={() => navigation.goBack()}
      onPress={() => navigation.navigate("ClassesScreen")}
      //  onPress={() =>  navigation.navigate('HomePage', { screen: 'ClassesScreen'})}
       >
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
<View style={{marginTop:-10}}>
      {/* Progress bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          // marginTop: 10,
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
</View>
      {/* Class Info */}
      <TextComponent type="headerText" style={styles.label}>
        {route?.params?.reschedule
          ? classInfo?.offering?.title
          : classInfo?.title}
      </TextComponent>

      <TextComponent type="headerText" style={styles.label}>
        {route?.params?.reschedule
          ? classInfo?.offering?.subtitle
          : classInfo?.subtitle}
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
            ? classInfo?.offering?.pricing?.per_person
                ?.session_length_min
            : classInfo?.pricing?.per_person?.session_length_min}{" "}
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
            ? classInfo?.offering?.pricing?.currency
            : classInfo?.pricing?.currency) === "INR"
            ? "₹"
            : "$"}{" "}
          {(route?.params?.reschedule
            ? classInfo?.offering?.pricing?.per_person?.amount?.app
            : classInfo?.pricing?.per_person?.amount?.app) ?? 0}
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
  startDate={selectedDate}
  allowedWeekdays={allowedWeekdays}
  highlightDates={highlightDates}
  onDayPress={(day) => {
    setSelectedDate(day.dateString);
    fetchSlots(day.dateString);
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
        <Text  allowFontScaling={false}>Loading slots...</Text>
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
          ListEmptyComponent={<Text  allowFontScaling={false}>No slots available.</Text>}
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
              ? classInfo?.offering?.tutor?.timezone
              : classInfo?.tutor?.timezone}
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
      {classInfo?.pricing?.trial?.enabled && (
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
            ₹ {classInfo?.pricing?.trial?.amount}
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
      allowFontScaling={false}
        style={styles.input}
        placeholder="Enter note"
        value={note}
        onChangeText={setNote}
      />
      {/* ✅ Replaced TouchableOpacity with LoadingButton */}
      {/* <LoadingButton
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
      /> */}
    </ScrollView>
    <View
  style={{
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: Colors.Colors.white,
    borderTopWidth: 1,
    borderColor: "#eee",
  }}
>
  <LoadingButton
    loading={loadingNext}
    text={route?.params?.reschedule ? "Reschedule" : "Next"}
    disabled={!selectedSlotUTC || loadingNext}   // 🔥 Enabled only when slot selected
    onPress={route?.params?.reschedule ? handleReschedule : handleNext}
    style={{
      width: "100%",                        // 🔥 Full width
      backgroundColor: selectedSlotUTC
        ? Colors.Colors.App_theme
        : "#cccccc",                        // 🔥 Grey if disabled
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    }}
    textStyle={{
      color: Colors.Colors.white,
      fontSize: FontSize.CONSTS.FS_14,
    }}
  />
</View>
    </SafeAreaView>
  );
}
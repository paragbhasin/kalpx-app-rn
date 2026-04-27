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
import { useDispatch, useSelector } from "react-redux";
import CommunityAuthModal from "../../components/CommunityAuthModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThunkDispatch } from "redux-thunk";
import CalendarUI from "../../components/CalendarUI";
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";
import Header from "../../components/Header";
import LoadingButton from "../../components/LoadingButton"; // ✅ Import LoadingButton
import LoadingOverlay from "../../components/LoadingOverlay";
import TextComponent from "../../components/TextComponent";
import api from "../../Networks/axios";
import { RootState } from "../../store";
import { ensureLoggedIn } from "../../utils/authHelpers";
import { bookSlot, rescheduleBooking, slotsList } from "./actions";
import styles from "./styles";

export default function ClassBookingScreen({ navigation, route }) {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const { t, i18n } = useTranslation();

  const isRestoringRef = useRef(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>("");

  // ✅ Auth Logic
  const reduxUser = useSelector((state: RootState) => state.login?.user || state.socialLoginReducer?.user);
  const [isLoggedIn, setIsLoggedIn] = useState(!!reduxUser);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [wasBlocked, setWasBlocked] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!reduxUser);
  }, [reduxUser]);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("access_token");
      if (token && !isLoggedIn) setIsLoggedIn(true);
    };
    checkLogin();
  }, [isLoggedIn]);

  // ✅ Auto-resume after login
  useEffect(() => {
    if (isLoggedIn && wasBlocked) {
      console.log("✅ User logged in (Booking), auto-proceeding Next");
      setShowAuthModal(false);
      setWasBlocked(false);
      handleNext();
    }
  }, [isLoggedIn, wasBlocked]);
  const [selectedSlotUTC, setSelectedSlotUTC] = useState<string>("");
  const [trailListed, setTrailListed] = useState(false);
  const [note, setNote] = useState("");
  const [loadingNext, setLoadingNext] = useState(false); // ✅ For LoadingButton
  const [isRestored, setIsRestored] = useState(false);
  const [monthSlotsData, setMonthSlotsData] = useState<any[]>([]);
  const [loadingMonth, setLoadingMonth] = useState(true);

  const submittingRef = useRef(false);

  const bookingData = route?.params?.data;

  const classInfo = route?.params?.reschedule
    ? bookingData?.offering
    : bookingData;

  const classSlug = classInfo?.slug;

  const [highlightDates, setHighlightDates] = useState<string[]>([]);

  const userTimezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";

  // useEffect(() => {
  //   const year = moment().year();
  //   const month = moment().month() + 1;

  //   const loadInitial = async () => {
  //     await fetchMonthSlots(year, month);

  //     setTimeout(() => {
  //       const firstDate = monthSlotsData.length
  //         ? monthSlotsData[0].date
  //         : moment().format("YYYY-MM-DD");

  //       setSelectedDate(firstDate);

  //       const slots = monthSlotsData.find(d => d.date === firstDate);
  //       setAvailableSlots(slots?.slots || []);
  //     }, 50);
  //   };

  //   loadInitial();
  // }, []);

  useEffect(() => {
    const year = moment().year();
    const month = moment().month() + 1;
    fetchMonthSlots(year, month);
  }, []);


  // AUTO-SELECT FIRST AVAILABLE DATE AFTER monthSlotsData LOADED
  useEffect(() => {
    if (!monthSlotsData.length) return;

    // clone → sort safe
    const sorted = [...monthSlotsData].sort(
      (a, b) => moment(a.date).valueOf() - moment(b.date).valueOf()
    );

    const firstDate = sorted[0].date;

    setSelectedDate(firstDate);
    setAvailableSlots(sorted[0].slots || []);
  }, [monthSlotsData]);



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

  console.log("route >>>>>>>>>", JSON.stringify(route?.params));


  const fetchSlots = (date: string): Promise<any[]> => {
    return new Promise((resolve) => {
      if (!date) return resolve([]);

      setLoadingSlots(true);

      const offeringId = route?.params?.reschedule
        ? bookingData?.offering?.id      // ⭐ Correct
        : bookingData?.id;               // ⭐ Correct

      const tutor_timezone = route?.params?.reschedule
        ? bookingData?.offering?.tutor?.timezone
        : bookingData?.tutor?.timezone;

      dispatch(
        slotsList(offeringId, date, userTimezone, tutor_timezone, (res: any) => {
          setLoadingSlots(false);
          resolve(res.success ? res.data.slots || [] : []);
        })
      );
    });
  };

  // ✅ Fetch available slots
  // const fetchSlots = (date: string): Promise<any[]> => {
  //   return new Promise((resolve) => {
  //     if (!date) return resolve([]);

  //     setLoadingSlots(true);
  // const offeringId = route?.params?.reschedule
  //   ? bookingData?.offering?.id     // Correct for reschedule
  //   : bookingData?.id;  

  //     // const offeringId = route?.params?.reschedule
  //     //   ? classInfo?.offering?.id
  //     //   : classInfo?.id;

  //     const tutor_timezone = route?.params?.reschedule
  //       ? classInfo?.offering?.tutor?.timezone
  //       : classInfo?.tutor?.timezone;

  //     dispatch(
  //       slotsList(offeringId, date, userTimezone, tutor_timezone, (res: any) => {
  //         setLoadingSlots(false);
  //         resolve(res.success ? res.data.slots || [] : []);
  //       })
  //     );
  //   });
  // };

  const fetchMonthSlots = async (year: number, month: number) => {
    if (!classSlug) return;
    setLoadingMonth(true);
    const start = moment({ year, month: month - 1 }).startOf("month").format("YYYY-MM-DD");
    const end = moment({ year, month: month - 1 }).endOf("month").format("YYYY-MM-DD");

    const url = `public/classes/${classSlug}/?user_timezone=${encodeURIComponent(userTimezone)}&start_date=${start}&end_date=${end}`;

    console.log("📡 Fetching Month Slots:", url);

    try {
      const res = await api.get(url);
      const slots = res.data?.available_slots || [];

      setMonthSlotsData(slots);               // full month
      setHighlightDates(slots.map(s => s.date)); // calendar highlights
    } catch (err) {
      console.log("❌ Month Slots Error", err);
    }
    setLoadingMonth(false);
  };


  // Return first slot date in that month
  const slotsFirstAvailable = (year: number, month: number) => {
    if (!monthSlotsData.length) return null;

    return monthSlotsData
      .map(d => d.date)
      .find(date => moment(date).month() + 1 === month);
  };

  const renderItem = ({ item }) => {
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
            width: "30%",             // 🔥 FIXED WIDTH (3 per row)
            height: 40,               // 🔥 FIXED HEIGHT
            marginBottom: 12,         // spacing
            justifyContent: "center",
            marginHorizontal: 6,
            alignItems: "center",
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
          {moment(item.start_user).locale(i18n.language?.split("-")[0] ?? "en").format("hh:mm A")}
        </TextComponent>
      </Pressable>
    );

  };


  // ✅ Slot time render
  // const renderItem = ({ item }: { item: any }) => {
  //   const isSelected = item.start_user === selectedTime;
  //   return (
  //     <Pressable
  //       onPress={() => {
  //         setSelectedTime(item.start_user);
  //         setSelectedSlotUTC(item.start_utc);
  //       }}
  //       style={[
  //         styles.timeContainer,
  //         {
  //           backgroundColor: isSelected
  //             ? Colors.Colors.App_theme
  //             : Colors.Colors.class_bg,
  //         },
  //       ]}
  //     >
  //       <TextComponent
  //         type="semiBoldText"
  //         style={{
  //           color: isSelected ? Colors.Colors.white : Colors.Colors.BLACK,
  //         }}
  //       >
  //         {moment(item.start_user).format("hh:mm A")}
  //       </TextComponent>
  //     </Pressable>
  //   );
  // };

  //   const handleNext = async () => {
  //  if (!selectedSlotUTC) {
  //   if (isRestoringRef.current) {
  //     // 🔥 IMPORTANT: stop the auto-submit loop when restoring pending data
  //     setIsRestored(false);
  //     isRestoringRef.current = false;
  //   } else {
  //     alert("The chosen slot is unavailable. Kindly select a different slot to proceed.");
  //   }
  //   return false;
  // }

  //   const todaySlots = await fetchSlots(selectedDate);
  //   const stillExists = todaySlots.some((s) => s.start_utc === selectedSlotUTC);

  // if (!stillExists) {
  //   alert("This slot is no longer available. Please select another slot.");
  //   setSelectedSlotUTC("");
  //   setSelectedTime("");

  //   // 🔥 Prevent infinite auto-submit after login restore
  //   setIsRestored(false);
  //   isRestoringRef.current = false;

  //   return;
  // }

  //     const pendingData = {
  //       selectedDate,
  //       selectedSlotUTC,
  //       selectedTime,
  //       trailListed,
  //       note,
  //       classData: classInfo,
  //     };

  //     const canProceed = await ensureLoggedIn(
  //   navigation,
  //   "pending_classes_data",
  //   pendingData,
  //   "ClassBookingScreen"      // ⭐ very important
  // );


  //     // const canProceed = await ensureLoggedIn(
  //     //   navigation,
  //     //   "pending_classes_data",
  //     //   pendingData
  //     // );

  //     if (!canProceed) {
  //       console.log("⛔ No token, stopping API call.");
  //       return false;
  //     }

  //     setLoadingNext(true);

  //     const payload = {
  //       offering_id: classInfo?.id,
  //       scheduled_at: selectedSlotUTC,
  //       user_timezone: userTimezone,
  //       tutor_timezone: classInfo?.tutor?.timezone,
  //       note,
  //       trial_selected: trailListed,
  //     };

  //     dispatch(
  //       bookSlot(payload, (res) => {
  //         setLoadingNext(false);
  //         if (res.success) {
  //           navigation.navigate("ClassPaymentScreen", {
  //             bookingData: res,
  //             data: classInfo,
  //           });
  //         } else {
  //           alert("The chosen slot is unavailable. Kindly select a different slot to proceed.");
  //         }
  //       })
  //     );
  //   };

  const handleNext = async () => {
    // 🔥 Prevent double submit
    if (submittingRef.current) {
      console.log("⏳ Prevented duplicate submission");
      return;
    }
    submittingRef.current = true;

    if (!selectedSlotUTC) {
      if (isRestoringRef.current) {
        setIsRestored(false);
        isRestoringRef.current = false;
      } else {
        alert("The chosen slot is unavailable. Kindly select a different slot to proceed.");
      }
      submittingRef.current = false;  // reset
      return false;
    }

    const todaySlots = await fetchSlots(selectedDate);
    const stillExists = todaySlots.some((s) => s.start_utc === selectedSlotUTC);

    if (!stillExists) {
      alert("This slot is no longer available. Please select another slot.");
      setSelectedSlotUTC("");
      setSelectedTime("");
      setIsRestored(false);
      isRestoringRef.current = false;
      submittingRef.current = false;  // reset
      return;
    }

    const pendingData = {
      selectedDate,
      selectedSlotUTC,
      selectedTime,
      trailListed,
      note,
      classData: classInfo,
    };

    // const canProceed = await ensureLoggedIn(
    //   navigation,
    //   "pending_classes_data",
    //   pendingData,
    //   "ClassBookingScreen"
    // );

    // if (!canProceed) {
    //   submittingRef.current = false; // reset
    //   return false;
    // }

    if (!isLoggedIn) {
      console.log("⛔ Not logged in, showing modal.");
      setWasBlocked(true);
      setShowAuthModal(true);
      submittingRef.current = false;
      return;
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
        submittingRef.current = false; // reset

        if (res.success) {
          navigation.navigate("ClassPaymentScreen", {
            bookingData: res,
            data: classInfo,
          });
        } else {
          alert("The chosen slot is unavailable. Kindly select a different slot to proceed.");
        }
      })
    );
  };


  const handleReschedule = async () => {
    if (!selectedSlotUTC) {
      alert("Please select a slot before continuing.");
      return;
    }
    const todaySlots = await fetchSlots(selectedDate);
    const stillExists = todaySlots.some((s) => s.start_utc === selectedSlotUTC);
    if (!stillExists) {
      alert("This slot is no longer available. Please select another slot.");
      setSelectedSlotUTC("");
      setSelectedTime("");
      return;
    }
    setLoadingNext(true);

    // Prepare booking payload
    const payload = {
      new_time: selectedSlotUTC,
    };

    console.log("Booking reschedule payload >>>", classInfo, JSON.stringify(payload));

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
        <View style={{ marginTop: -10 }}>
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
            {
              route?.params?.reschedule
                ? (
                  classInfo?.offering?.pricing?.type === "per_group"
                    ? classInfo?.offering?.pricing?.per_group?.amount?.web
                    : classInfo?.offering?.pricing?.per_person?.amount?.web
                )
                : (
                  classInfo?.pricing?.type === "per_group"
                    ? classInfo?.pricing?.per_group?.amount?.web
                    : classInfo?.pricing?.per_person?.amount?.web
                )
                ?? 0
            }

            {/* {(route?.params?.reschedule
            ? classInfo?.offering?.pricing?.per_person?.amount?.web
            : classInfo?.pricing?.per_person?.amount?.web) ?? 0} */}
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
          highlightDates={highlightDates}
          onDayPress={(day) => {
            const date = day.dateString;
            setSelectedDate(date);

            const findSlots = monthSlotsData.find(d => d.date === date);
            setAvailableSlots(findSlots?.slots || []);
          }}
          onMonthChange={async (m) => {
            await fetchMonthSlots(m.year, m.month);
          }}

        // onMonthChange={async (m) => {
        //   await fetchMonthSlots(m.year, m.month);

        //   // After fetching month slots, auto-select first available day
        //   const firstDate = slotsFirstAvailable(m.year, m.month);
        //   if (firstDate) {
        //     setSelectedDate(firstDate);

        //     const daySlots = monthSlotsData.find(d => d.date === firstDate);
        //     setAvailableSlots(daySlots?.slots || []);
        //   }
        // }}

        />


        {/* <CalendarUI
  startDate={selectedDate}
  // allowedWeekdays={allowedWeekdays}
  highlightDates={highlightDates}
onDayPress={(day) => {
  const date = day.dateString;
  setSelectedDate(date);

  const daySlots = monthSlotsData.find((d) => d.date === date);

  setAvailableSlots(daySlots?.slots || []);
}}
   onMonthChange={(m) => {
    console.log("📅 Month Changed:", m);
    fetchMonthSlots(m.year, m.month);
  }}
/> */}


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
          <Text allowFontScaling={false}>Loading slots...</Text>
        ) : (
          <FlatList
            data={availableSlots}
            renderItem={renderItem}
            keyExtractor={(_, idx) => idx.toString()}
            numColumns={3}
            columnWrapperStyle={{
              // justifyContent: "space-between",
              marginBottom: 8,
            }}
            ListEmptyComponent={<Text allowFontScaling={false}>No slots available.</Text>}
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
      <LoadingOverlay visible={loadingMonth} text="Fetching slots..." />
      {/* AUTH MODAL */}
      <CommunityAuthModal
        visible={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setWasBlocked(false);
        }}
        title={t("classBooking.authTitle")}
        description={t("classBooking.authDescription")}
        benefits={[
          t("classBooking.authBenefit1"),
          t("classBooking.authBenefit2"),
          t("classBooking.authBenefit3")
        ]}
      />
    </SafeAreaView>
  );
}
import { AnyAction } from '@reduxjs/toolkit';
import { initPaymentSheet, presentPaymentSheet, StripeProvider } from '@stripe/stripe-react-native';
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppState, BackHandler, Image, SafeAreaView, ScrollView, StatusBar, TouchableOpacity, View } from "react-native";
import { Card } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";
import Header from '../../components/Header';
import TextComponent from "../../components/TextComponent";
import api from '../../Networks/axios';
import { RootState } from '../../store';
import { releaseHoldAction } from './actions';
import styles from "./styles";

const times = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

// Reusable ReadMore Component


const  ClassPaymentScreen = ({ navigation,route }) => {
  const { t } = useTranslation();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [TrailListed, setTrailListed] = useState(false);
const [timeLeft, setTimeLeft] = useState(600); // 10 minutes = 600 seconds
const [elapsedTime, setElapsedTime] = useState(0);
const [loading, setLoading] = useState(false);
const [isPaymentDone, setIsPaymentDone] = useState(false);
const intervalRef: any = useRef<NodeJS.Timeout | null>(null);
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();


const tutorId = route?.params?.bookingData?.data?.booking_id

// ⏱ when timer completes
const onTimerComplete = () => {
  if (!isPaymentDone) {
  dispatch(releaseHoldAction(tutorId, (res) => {
        console.log("res >>>>>>>",res);
    if (res.success) {
      navigation.navigate("HomePage", { screen: "Home" });
    }
  }));
}
};

// 🔙 handle Android back press
useEffect(() => {
  const backAction = () => {
    if (!isPaymentDone) {
    dispatch(releaseHoldAction(tutorId, (res) => {
        console.log("res >>>>>>>",res);
      navigation.goBack();
    }));
  }
    return true;
  };
  const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

  return () => backHandler.remove();
}, [tutorId]);

// 🧭 handle navigation blur (user taps another tab)
useEffect(() => {
  const unsubscribe = navigation.addListener("blur", () => {
     if (!isPaymentDone) { 
    dispatch(releaseHoldAction(tutorId, (res) => {
        console.log("res >>>>>>>",res);
    if (res.success) {
      navigation.navigate("HomePage", { screen: "Home" });
    }
  }));
}
  });
  return unsubscribe;
}, [navigation, tutorId]);

// 📱 handle app state change (background/kill)
useEffect(() => {
  const subscription = AppState.addEventListener("change", (nextState) => {
  if (!isPaymentDone &&
   (nextState === "background" || nextState === "inactive")
) {
      dispatch(releaseHoldAction(tutorId, (res) => {
        console.log("res >>>>>>>",res);
    if (res.success) {
      navigation.navigate("HomePage", { screen: "Home" });
    }
  }));
    }
  });
  return () => subscription.remove();
}, [tutorId]);

useEffect(() => {
  // Store booking ID when entering screen
  // const bookingId = route?.params?.bookingData?.data?.booking_id;
  // if (bookingId) {
  //   AsyncStorage.setItem("currentBookingId", bookingId.toString());
  // }

  // Start countdown timer
  intervalRef.current = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(intervalRef.current!);
        onTimerComplete();
        return 0;
      }
      return prev - 1;
    });
    setElapsedTime((prev) => prev + 1);
  }, 1000);

  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
}, []);


const callPaymentStripeGateway = async () => {
  try {
    setLoading(true); // ⭐ show loader
    console.log("route?.params?.data?.id >>>>>", JSON.stringify(route?.params));

    let details = {
      booking_id: route?.params?.bookingData?.data?.booking_id,
    };

    const result = await api.post("payments/create_intent/", details);

    const res = await initPaymentSheet({
      paymentIntentClientSecret: result?.data?.client_secret,
      allowsDelayedPaymentMethods: true,
      merchantDisplayName: 'Tele Opinion',
      defaultBillingDetails: { name: "Sunil" },
      applePay: { merchantCountryCode: 'US' },
      googlePay: { merchantCountryCode: "US", testEnv: true },
      returnURL: 'your-app://stripe-redirect',
    });

    const { error } = await presentPaymentSheet();

    if (!error) {
        setIsPaymentDone(true);   // 🚀 stop all release actions
  clearInterval(intervalRef.current);
    navigation.navigate("ClassesScreen", { openTab: "MyBookings" });
      // navigation.navigate("HomePage", { screen: "Home" });
    }
  } catch (error) {
    console.log("create Initaiate Token Error===>>>", error?.response);
  } finally {
    setLoading(false); // ⭐ hide loader
  }
};

 
    //  const callPaymentStripeGateway = async () => {
    //   console.log("route?.params?.data?.id >>>>>",JSON.stringify(route?.params));
    //     try {
    //         let details = {
    //          booking_id: route?.params?.bookingData?.data?.booking_id
    //         }
    //         const result = await api.post("payments/create_intent/", details);
    //         console.log("result of payment intent >>>>>>",result);
    //         const res = await initPaymentSheet({
    //             // customerId: result?.data?.customer,
    //             // customerEphemeralKeySecret: result?.data?.ephemeralKey,
    //             paymentIntentClientSecret: result?.data?.client_secret,
    //             allowsDelayedPaymentMethods: true,
    //             customFlow: false,
    //             merchantDisplayName: 'Tele Opinion',
    //             defaultBillingDetails: {
    //                 name: "Sunil",
    //             },
    //             applePay: {
    //                 merchantCountryCode: 'US'
    //             },
    //             googlePay: {
    //                 merchantCountryCode: "US",
    //                 testEnv: true
    //             },
    //               returnURL: 'your-app://stripe-redirect',
    //         });
    //         const { error } = await presentPaymentSheet();
    //         if (error) {
    //             console.log(`Error code: ${error.code}`, error.message);
    //         } else {
    //             console.log('Success', 'Your order is confirmed!');
    //               navigation.navigate('HomePage', { screen: 'Home'});
    //             // navigation.navigate('Payment', { DocImg: docData?.photoUpload, DocName: docData?.fullName, DocAddress: docData?.clinicName, selectedDate: selectedDate, selectedTime: selectedTime, slotBookingId: slotBookingID, slotId: selectedSlotId, specilization: docData?.specialization });
    //         }
    //         // let Url = `${EndPoints.STRIPE_PAYMENT}/${result?.data?.paymentIntentId}`;
    //         // const Result = await api.put(Url);
    //     } catch (error: any) {
    //         console.log("create Initaiate Token Error===>>>", error?.response);
    //     }
    // }

// console.log("route of payments >>>>>>>>>",JSON.stringify(route?.params));

  const renderItem = ({ item }: { item: string }) => {
    const isSelected = item === selectedTime;
    return (
      <TouchableOpacity
        onPress={() => setSelectedTime(item)}
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
          {item}
        </TextComponent>
      </TouchableOpacity>
    );
  };
    // const publishableKey = "pk_test_51QGk8ICcC7GuO3wnhaq8gKpMr4MHzPEvqo3u8SlhZ6BTAprSD77fn4iu0dvU2yzuRYPxHkeU0ZSZFOHt8jrbZf2K00r3fSXaw9";
    const publishableKey = "pk_live_51I6KtQD0bc08Jx2avwsIu8didzBKMDB5NVDqnaXkSI5bjZ3citDSq0uCUBolX47mbIa85EW32S8tOAkeDD0b4D8p00eS94Q7sy";


  return (
     <StripeProvider
      publishableKey={publishableKey}
      merchantIdentifier=""
      urlScheme="your-url-scheme"
    >
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
      {/* Back Button */}
      <TouchableOpacity
        style={{
          marginTop: 10,
          // marginHorizontal: 16,
        }}
       onPress={() => {
    console.log("🔙 Back button pressed");
    console.log("TutorId >>>", tutorId);
    dispatch(
      releaseHoldAction(tutorId, (res) => {
        console.log("Back Press API Response >>>", res);
        navigation.goBack();
      })
    );
  }}
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
      </TouchableOpacity>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
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
              style={{
                AlignCenter: "center",
                marginTop: 10,
                color: Colors.Colors.white,
              }}
            >
              1
            </TextComponent>
          </View>
          {/* <TextComponent type='semiBoldText' style={{ color: Colors.Colors.BLACK }}>Slot Boking</TextComponent> */}
        </View>
        <View
          style={{
            borderColor: Colors.Colors.App_theme,
            borderWidth: 1,
            width: 100,
          }}
        />
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
              style={{
                AlignCenter: "center",
                marginTop: 10,
                color: Colors.Colors.white,
              }}
            >
              2
            </TextComponent>
          </View>
          {/* <TextComponent type='semiBoldText' style={{ color: Colors.Colors.BLACK }}>Payment </TextComponent> */}
        </View>
      </View>
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
          Slot Boking
        </TextComponent>
        <TextComponent
          type="semiBoldText"
          style={{ color: Colors.Colors.BLACK }}
        >
          Payment{" "}
        </TextComponent>
      </View>
    <Card style={styles.card}>
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    {/* Circular Timer */}
    <View
      style={{
        backgroundColor: "red",
        alignSelf: "flex-start",
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <TextComponent
        type="headerSubBoldText"
        style={{
          color: Colors.Colors.white,
          // fontSize: FontSize.CONSTS.FS_18,
        }}
      >
        {Math.floor(timeLeft / 60)
          .toString()
          .padStart(2, "0")}
        :
        {(timeLeft % 60).toString().padStart(2, "0")}
      </TextComponent>
    </View>

    {/* Text Section */}
    <View style={{ marginLeft: 12, flex: 1 }}>
      <TextComponent
        type="headerSubBoldText"
        style={{
          color: Colors.Colors.BLACK,
          // fontSize: FontSize.CONSTS.FS_16,
        }}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        Complete Your Payment
      </TextComponent>
<TextComponent
        type="headerSubBoldText"
        style={{
          color: Colors.Colors.Light_black,
          // fontSize: FontSize.CONSTS.FS_14,
          flexWrap: "wrap",
          flexShrink: 1,
        }}
      >
        Please complete your payment within{" "}
        <TextComponent
          type="headerSubBoldText"
          style={{
            color: "red",
            // fontSize: FontSize.CONSTS.FS_14,
          }}
        >
          {Math.floor(timeLeft / 60)
            .toString()
            .padStart(2, "0")}
          :
          {(timeLeft % 60).toString().padStart(2, "0")}
        </TextComponent>{" "}
        or your slot will be released.
      </TextComponent>
    </View>
  </View>

  {/* Progress Bar */}
  <View
    style={{
      height: 8,
      backgroundColor: "#f2f2f2",
      borderRadius: 10,
      overflow: "hidden",
      marginTop: 12,
    }}
  >
    <View
      style={{
        height: "100%",
        width: `${(elapsedTime / 600) * 100}%`,
        backgroundColor: "red",
        // transition: "width 1s linear", // for smooth visual update
      }}
    />
  </View>
</Card>

      <TextComponent
        type="headerText"
        style={{ color: Colors.Colors.Light_black, marginVertical: 15 }}
      >
        Summary
      </TextComponent>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        <TextComponent type="mediumText">Class Name</TextComponent>
        <TextComponent type="mediumText" style={{flexShrink: 1, textAlign: "right",marginLeft:35}}> {route?.params?.data?.title}</TextComponent>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        <TextComponent type="mediumText">Scheduled</TextComponent>
        <TextComponent type="mediumText" style={{flexShrink: 1, textAlign: "right",marginLeft:35}}>
             {`${moment(route?.params?.bookingData?.data?.start_utc).format("MMM DD, YYYY h:mm a")} - ${moment(route?.params?.bookingData?.data?.start_utc).format("MMM DD, YYYY h:mm a")}`}
        </TextComponent>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        <TextComponent type="mediumText">Price</TextComponent>
        <TextComponent type="mediumText">
  {route?.params?.data?.pricing?.currency === "INR" ? "₹" : "$"}{" "}
  {
    route?.params?.data?.pricing?.type === "per_group"
      ? route?.params?.data?.pricing?.per_group?.amount?.web
      : route?.params?.data?.pricing?.per_person?.amount?.web
  ?? 0}
</TextComponent>

        {/* <TextComponent type="mediumText">{route?.params?.data?.pricing?.currency === "INR" ? "₹" : "$"}{" "}{route?.params?.data?.pricing?.per_person?.amount?.web ?? 0}</TextComponent> */}
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginVertical: 8,
        }}
      >
        <TextComponent type="mediumText">Total</TextComponent>
        <TextComponent
  type="mediumText"
  style={{ color: Colors.Colors.App_theme }}
>
  {route?.params?.data?.pricing?.currency === "INR" ? "₹" : "$"}{" "}
  {
    route?.params?.data?.pricing?.type === "per_group"
      ? route?.params?.data?.pricing?.per_group?.amount?.web
      : route?.params?.data?.pricing?.per_person?.amount?.web
  ?? 0}
</TextComponent>
{/* 
        <TextComponent
          type="mediumText"
          style={{ color: Colors.Colors.App_theme }}
        >
           {route?.params?.data?.pricing?.currency === "INR" ? "₹" : "$"}{" "}
          {route?.params?.data?.pricing?.per_person?.amount?.web ?? 0}
        </TextComponent> */}
      </View>
      {/* <TouchableOpacity
        style={{
          backgroundColor: Colors.Colors.App_theme,
          paddingVertical: 10,
          paddingHorizontal: 22,
          borderRadius: 10,
          alignItems: "center",
          marginTop: 20,
          alignSelf: "flex-end",
        }}
        onPress={() => {callPaymentStripeGateway()}}
      >
        <TextComponent
          style={{
            color: Colors.Colors.white,
            fontSize: FontSize.CONSTS.FS_12,
          }}
        >
          Make Payment
        </TextComponent>
      </TouchableOpacity> */}
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
  <TouchableOpacity
    disabled={loading}
    onPress={callPaymentStripeGateway}
    style={{
      width: "100%",
      backgroundColor: loading ? "#ccc" : Colors.Colors.App_theme,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <TextComponent
      type="semiBoldText"
      style={{
        color: Colors.Colors.white,
        fontSize: FontSize.CONSTS.FS_14,
      }}
    >
      {loading ? "Processing..." : "Make Payment"}
    </TextComponent>
  </TouchableOpacity>
</View>
    </SafeAreaView>
    </StripeProvider>
  );
}


export default  ClassPaymentScreen;

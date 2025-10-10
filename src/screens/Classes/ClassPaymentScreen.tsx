import { initPaymentSheet, presentPaymentSheet, StripeProvider } from '@stripe/stripe-react-native';
import moment from "moment";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";
import TextComponent from "../../components/TextComponent";
import api from '../../Networks/axios';
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
const ReadMoreText = ({ text }: { text: string }) => {
  const [expanded, setExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);

  return (
    <Text
      style={{ color: Colors.Colors.Light_black, marginTop: 6 }}
      numberOfLines={expanded ? undefined : 2}
      onTextLayout={(e) => {
        // Check if more than 2 lines exist
        if (e.nativeEvent.lines.length > 2 && !showReadMore) {
          setShowReadMore(true);
        }
      }}
    >
      {text}
      {showReadMore ? (
        <Text
          style={{ color: Colors.Colors.App_theme, fontWeight: "600" }}
          onPress={() => setExpanded(!expanded)}
        >
          {expanded ? "  Read Less" : "  Read More"}
        </Text>
      ) : null}
    </Text>
  );
};

export default function ClassPaymentScreen({ navigation,route }) {
  const { t } = useTranslation();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [TrailListed, setTrailListed] = useState(false);


     const callPaymentStripeGateway = async () => {
        try {
            let details = {
             booking_id: route?.params?.data?.id
            }
            const result = await api.post("payments/create_intent/", details);
            console.log("result of payment intent >>>>>>",result);
            const res = await initPaymentSheet({
                // customerId: result?.data?.customer,
                // customerEphemeralKeySecret: result?.data?.ephemeralKey,
                paymentIntentClientSecret: result?.data?.client_secret,
                allowsDelayedPaymentMethods: true,
                customFlow: false,
                merchantDisplayName: 'Tele Opinion',
                defaultBillingDetails: {
                    name: "Sunil",
                },
                applePay: {
                    merchantCountryCode: 'US'
                },
                googlePay: {
                    merchantCountryCode: "US",
                    testEnv: true
                },
                  returnURL: 'your-app://stripe-redirect',
            });
            const { error } = await presentPaymentSheet();
            if (error) {
                console.log(`Error code: ${error.code}`, error.message);
            } else {
                console.log('Success', 'Your order is confirmed!');
                  navigation.navigate("HomePage");
                // navigation.navigate('Payment', { DocImg: docData?.photoUpload, DocName: docData?.fullName, DocAddress: docData?.clinicName, selectedDate: selectedDate, selectedTime: selectedTime, slotBookingId: slotBookingID, slotId: selectedSlotId, specilization: docData?.specialization });
            }
            // let Url = `${EndPoints.STRIPE_PAYMENT}/${result?.data?.paymentIntentId}`;
            // const Result = await api.put(Url);
        } catch (error: any) {
            console.log("create Initaiate Token Error===>>>", error?.response);
        }
    }

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

    const publishableKey = "pk_test_51QGk8ICcC7GuO3wnhaq8gKpMr4MHzPEvqo3u8SlhZ6BTAprSD77fn4iu0dvU2yzuRYPxHkeU0ZSZFOHt8jrbZf2K00r3fSXaw9";


  return (
     <StripeProvider
      publishableKey={publishableKey}
      merchantIdentifier="8X74S6KGZL"
      urlScheme="your-url-scheme"
    >
    <ScrollView
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
      style={{ paddingHorizontal: 24 }}
    >
      {/* Back Button */}
      <TouchableOpacity
        style={{
          marginTop: 60,
          // marginHorizontal: 16,
        }}
        onPress={() => navigation.goBack()}
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
        <TextComponent type="mediumText"> {route?.params?.data?.title}</TextComponent>
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
        <TextComponent type="mediumText">{route?.params?.data?.pricing?.currency === "INR" ? "₹" : "$"}{" "}{route?.params?.data?.pricing?.per_person?.amount?.app ?? 0}</TextComponent>
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
          {route?.params?.data?.pricing?.per_person?.amount?.app ?? 0}
        </TextComponent>
      </View>
      <TouchableOpacity
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
      </TouchableOpacity>
    </ScrollView>
    </StripeProvider>
  );
}

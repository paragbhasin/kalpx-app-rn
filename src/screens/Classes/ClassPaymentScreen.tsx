import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";
import TextComponent from "../../components/TextComponent";
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

export default function ClassPaymentScreen({ navigation }) {
  const { t } = useTranslation();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [TrailListed, setTrailListed] = useState(false);

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

  return (
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
        <TextComponent type="mediumText">Bharat Natyam</TextComponent>
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
          Jan 27, 2024 1:00 am - Jan 27, 2024 1:30 am
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
        <TextComponent type="mediumText">$ 3500</TextComponent>
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
          $ 3500
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
  );
}

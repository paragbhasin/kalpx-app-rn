import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    FlatList,
    Image,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import CalendarUI from "../../components/CalendarUI";
import ClassSuccessModal from "../../components/ClassSuccessModal";
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";
import TextComponent from "../../components/TextComponent";
import styles from "./styles";

const times = [
    "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM",
    "03:00 PM", "04:00 PM", "05:00 PM"
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

export default function ClassRescheduleScreen({ navigation }) {
    const { t } = useTranslation();
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [TrailListed, setTrailListed] = useState(false);
    const [rescheduleSuccess, setRescheduleSuccess] = useState(false);


    const renderItem = ({ item }: { item: string }) => {
        const isSelected = item === selectedTime;
        return (
            <TouchableOpacity
                onPress={() => setSelectedTime(item)}
                style={[
                    styles.timeContainer,
                    {
                        backgroundColor: isSelected ? Colors.Colors.App_theme : Colors.Colors.class_bg
                    }
                ]}
            >
                <TextComponent
                    type="semiBoldText"
                    style={{ color: isSelected ? Colors.Colors.white : Colors.Colors.BLACK }}
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
            <View style={{...styles.row,marginTop:12 }}>
                <TextComponent type="headerText" style={styles.label}>
                    Flute Series :
                </TextComponent>
                <TextComponent type="headerText" style={styles.label}>
                    Absolute Beginner
                </TextComponent>
            </View>
            <View style={styles.row}>
                <TextComponent
                    type="mediumText"
                    style={{ ...styles.label, color: Colors.Colors.Light_grey }}
                >
                    Duration :
                </TextComponent>
                <TextComponent type="mediumText" style={styles.label}>
                    60 Minutes
                </TextComponent>
            </View>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    // justifyContent: "space-between",
                    marginTop: 2,
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                    <TextComponent
                        type="boldText"
                        style={{ fontSize: FontSize.CONSTS.FS_20 }}
                    >
                        $ 3500{" "}
                    </TextComponent>
                    <TextComponent
                        type="mediumText"
                        style={{ fontSize: FontSize.CONSTS.FS_10, marginTop: -8 }}
                    >
                        / Per Person
                    </TextComponent>
                </View>
                <TextComponent type='semiBoldText' style={{ marginLeft: 6 }}>View More Details</TextComponent>
            </View>
                <TextComponent
                type="boldText"
                style={{
                    fontSize: FontSize.CONSTS.FS_14,
                    marginVertical: 12,
                    color: Colors.Colors.BLACK
                }}
            >Current Status
            </TextComponent>
            <View
  style={{
    backgroundColor: Colors.Colors.card_bg,
    borderColor: Colors.Colors.grey,
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
  }}
>
  {[
    { label: "Class", value: "Flute Series" },
    { label: "Status", value: "Confirmed" },
    { label: "Start", value: "Jan 27, 2024 1:00 am" },
    { label: "End", value: "Jan 27, 2024 1:00 am" },
    { label: "Price", value: "$ 3500" },
    { label: "Trial", value: "No" },
    { label: "Group Size", value: "12" },
    { label: "Note", value: "Text" },
  ].map((item, index) => (
    <View
      key={index}
      style={{
        flexDirection: "row",
        marginVertical: 4,
      }}
    >
      <TextComponent
        type="cardText"
        style={{ width:"44%", }} // fixed width for labels
      >
        {item.label}
      </TextComponent>
      <TextComponent
        type="cardText"
        style={{ flex: 1, }}
      >
        {item.value}
      </TextComponent>
    </View>
  ))}
</View>

            <TextComponent
                type="boldText"
                style={{
                    fontSize: FontSize.CONSTS.FS_14,
                    marginVertical: 12,
                    color: Colors.Colors.BLACK
                }}
            >Slot Booking
            </TextComponent>
            <CalendarUI startDate={new Date().toISOString().split("T")[0]} />
            <TextComponent
                type="boldText"
                style={{
                    fontSize: FontSize.CONSTS.FS_14,
                    marginVertical: 12,
                    color: Colors.Colors.BLACK
                }}
            >Available slots</TextComponent>
            <FlatList
                data={times}
                renderItem={renderItem}
                keyExtractor={(item) => item}
                numColumns={3}
                columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 8 }}
                contentContainerStyle={{ paddingHorizontal: 15, paddingVertical: 10 }}
            />
            <View style={{ flexDirection: "row" }}>
                <View style={styles.row}>
                    <TextComponent
                        type="mediumText"
                        style={{ ...styles.label, color: Colors.Colors.Light_grey }}
                    >
                        Tutor TZ:
                    </TextComponent>
                    <TextComponent type="mediumText" style={styles.label}>
                        Asia/Kolkata
                    </TextComponent>
                </View>
                <View style={{ ...styles.row, marginLeft: 25 }}>
                    <TextComponent
                        type="mediumText"
                        style={{ ...styles.label, color: Colors.Colors.Light_grey }}
                    >
                        Your:
                    </TextComponent>
                    <TextComponent type="mediumText" style={styles.label}>
                        60 Minutes
                    </TextComponent>
                </View>
            </View>
            <View style={{ ...styles.row, marginTop: 12 }}>
                <Pressable
                    onPress={() => setTrailListed(!TrailListed)}
                >
                    {TrailListed ? (
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
                            style={[styles.checkbox, TrailListed && styles.checkedBox]}
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
                    ₹0.00
                </TextComponent>
            </View>
            <TextComponent type='boldText' style={{
                color: Colors.Colors.BLACK,
                fontSize: FontSize.CONSTS.FS_14,
                marginTop: 12
            }}>Note to Tutor (Optional)</TextComponent>
            <TextInput
                style={styles.input}
                placeholder={t("pooja.enterCity")}
            //   value={city}
            //   onChangeText={setCity}
            />
            <TouchableOpacity onPress={() => {setRescheduleSuccess(true)}}
             style={{ backgroundColor: Colors.Colors.App_theme, paddingVertical: 10, paddingHorizontal: 22, borderRadius: 10, alignItems: "center", marginTop: 20, alignSelf: "flex-end" }}>
                <TextComponent style={{
                    color: Colors.Colors.white,
                    fontSize: FontSize.CONSTS.FS_12,
                }}>Reschedule</TextComponent>
            </TouchableOpacity>
            <ClassSuccessModal
            visible={rescheduleSuccess}
            title="Thanks !"
            subTitle="Your Booking Has Been Confirmed Payment Successful."
            onClose={() => {setRescheduleSuccess(false)}}
            />
        </ScrollView>
    );
}
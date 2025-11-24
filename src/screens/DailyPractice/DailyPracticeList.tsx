import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { Card } from "react-native-paper";
import Colors from "../../components/Colors";
import Header from "../../components/Header";
import TextComponent from "../../components/TextComponent";
import styles from "./dailyPracticeListStyle";

const categories = [
  {
    category: "Peace & Stress Relief",
    options: [
      { count: 9, label: "Quick Calm" },
      { count: 27, label: "Stress Release" },
      { count: 54, label: "Deep Peace" },
      { count: 108, label: "Inner Serenity" },
    ],
  },
  {
    category: "Focus & Motivation",
    options: [
      { count: 9, label: "Quick Focus" },
      { count: 27, label: "Mental Clarity" },
      { count: 54, label: "Steady Concentration" },
      { count: 108, label: "Unshakable Focus" },
    ],
  },
  {
    category: "Emotional Healing",
    options: [
      { count: 9, label: "Gentle Relief" },
      { count: 27, label: "Emotional Balance" },
      { count: 54, label: "Heart Healing" },
      { count: 108, label: "Inner Renewal" },
    ],
  },
  {
    category: "Gratitude & Positivity",
    options: [
      { count: 9, label: "Quick Gratitude" },
      { count: 27, label: "Positive Shift" },
      { count: 54, label: "Joy Expansion" },
      { count: 108, label: "Radiant Positivity" },
    ],
  },
  {
    category: "Spiritual Growth",
    options: [
      { count: 9, label: "Spiritual Touch" },
      { count: 27, label: "Divine Connection" },
      { count: 54, label: "Inner Awakening" },
      { count: 108, label: "Higher Alignment" },
    ],
  },
  {
    category: "Health & Well-Being",
    options: [
      { count: 9, label: "Vital Boost" },
      { count: 27, label: "Body Harmony" },
      { count: 54, label: "Deep Healing" },
      { count: 108, label: "Life Force Renewal" },
    ],
  },
  {
    category: "Career & Prosperity",
    options: [
      { count: 9, label: "Quick Boost" },
      { count: 27, label: "Success Flow" },
      { count: 54, label: "Prosperity Alignment" },
      { count: 108, label: "Abundance Activation" },
    ],
  },
];

const arrowIcon = require("../../../assets/arrow_home.png");

const DailyPracticeList = () => {
  const navigation : any= useNavigation();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Header />

      {/* Fixed Card Centered */}
      <Card style={styles.card}>
        <TextComponent
          type="mediumBigText"
          style={{
            marginTop: 6,
            color: Colors.Colors.Daily_black,
            alignSelf: "center",
          }}
        >
          How can we help ?
        </TextComponent>

        <TextComponent
          type="cardHeaderText"
          style={{ marginTop: 6, alignSelf: "center" }}
        >
          Daily Practices for :
        </TextComponent>

        {/* Scrollable Inner Section */}
        <ScrollView
          style={styles.innerScroll}
          showsVerticalScrollIndicator={false}
        >
          {categories.map((item, index) => (
            <TouchableOpacity
  key={index}
  activeOpacity={0.9}
  onPress={() => navigation.navigate("DailyPracticeSelectList")}
>
            <Card key={index} style={styles.subCard}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <TextComponent type="DailyHeaderText">
                  {item.category}
                </TextComponent>

                <Image
                  source={arrowIcon}
                  style={styles.arrowIcon}
                  resizeMode="contain"
                />
              </View>
            </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card>
    </View>
  );
};

export default DailyPracticeList;

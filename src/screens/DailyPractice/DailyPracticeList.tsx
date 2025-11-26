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
    name: "Peace & Calm",
    key: "peace-calm",
    description: "Find calm in the breath.",
  },
  {
    name: "Focus & Motivation",
    key: "focus",
    description: "Align. Focus. Rise.",
  },
  {
    name: "Emotional Healing",
    key: "healing",
    description: "Let go. Begin again.",
  },
  {
    name: "Gratitude & Positivity",
    key: "gratitude",
    description: "Gratitude transforms everything.",
  },
  {
    name: "Spiritual Growth",
    key: "spiritual-growth",
    description: "Grow through awareness.",
  },
  {
    name: "Health & Well-Being",
    key: "health",
    description: "Balance builds strength.",
  },
  {
    name: "Career & Prosperity",
    key: "career",
    description: "Opportunity follows action.",
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
  onPress={() => navigation.navigate("DailyPracticeSelectList",{item: item})}
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
                  {item.name}
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

import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { Card } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../../components/Colors";
import Header from "../../components/Header";
import TextComponent from "../../components/TextComponent";
import styles from "./dailyPracticeListStyle";

// Rooted practices aligned with dharma

const categories = [
  {
    name: "Peace & Calm",
    key: "peace-calm",
    description: "Restore balance and release daily stress",
    image: require("../../../assets/DP_1.png"),
  },
  {
    name: "Focus & Motivation",
    key: "focus",
    description: "Move from intention to action",
    image: require("../../../assets/DP_2.png"),
  },
  {
    name: "Emotional Healing",
    key: "healing",
    description: "Cultivate inner peace and resilience",
    image: require("../../../assets/DP_3.png"),
  },
  {
    name: "Gratitude & Positivity",
    key: "gratitude",
    description: "Shift into mindfulness and appreciation",
    image: require("../../../assets/DP_4.png"),
  },
  {
    name: "Spiritual Growth",
    key: "spiritual-growth",
    description: "Deepen sadhana and devotional discipline",
    image: require("../../../assets/DP_5.png"),
  },
  {
    name: "Health & Well-Being",
    key: "health",
    description: "Support vitality, energy, and balance",
    image: require("../../../assets/DP_6.png"),
  },
  {
    name: "Career & Prosperity",
    key: "career",
    description: "Build confidence, focus, and consistency",
    image: require("../../../assets/DP_7.png"),
  },
];

const sanatanImage = require("../../../assets/DP_8.png");
const createOwnImage = require("../../../assets/DP_9.png");
const arrowIcon = require("../../../assets/card_arrow.png");

const DailyPracticeList = () => {
  const navigation: any = useNavigation();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* <ImageBackground
                  source={require("../../../assets/Tracker_BG.png")}
                  style={{
                    flex: 1,
                    width: FontSize.CONSTS.DEVICE_WIDTH,
                    alignSelf: "center",
                    justifyContent: "flex-start",
                  }}
                  imageStyle={{
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                  }}
                > */}
      <Header />
      <ScrollView
        style={styles.innerScroll}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          // onPress={() => navigation.navigate("HomePage", { screen: "Home" })} 
          style={{ marginHorizontal: 16, marginBottom: 10 }}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        {/* Fixed Card Centered */}
        {/* <Card style={styles.card}> */}
        <TextComponent
          type="mediumBigText"
          style={{
            marginTop: -30,
            color: Colors.Colors.Daily_black,
            alignSelf: "center",
          }}
        >
          {t('dailyPracticeList.getStarted')}
        </TextComponent>

        <TextComponent
          type="subDailyText"
          style={{ marginTop: 6, alignSelf: "center", textAlign: "center" }}
        >
          {t('dailyPracticeList.description')}
        </TextComponent>
        {/* <View style={{flexDirection:"row",alignItems:"center",marginVertical:10}}> */}
        <TextComponent type="mediumText" style={{ marginVertical: 6, alignSelf: "center", textAlign: "center", color: Colors.Colors.blue_text }} >{t('dailyPracticeList.tapCategory')}</TextComponent>
        {/* <Image
        source={arrowIcon}
        style={[styles.arrowIcon, { marginLeft: 6 }]}
        resizeMode="contain"
      /> */}
        {/* </View> */}
        {/* Scrollable Inner Section */}
        {categories.map((item, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.9}
            onPress={() => navigation.navigate("DailyPracticeSelectList", { item: item })}
          >
            <Card key={index} style={styles.subCard}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                {/* Category Image */}
                <Image
                  source={item.image}
                  style={{ width: 40, height: 40 }}
                  resizeMode="contain"
                />

                <View style={{ width: "80%" }}>
                  <TextComponent type="cardText">
                    {t(`dailyPracticeList.categories.${item.key}.name`)}
                  </TextComponent>

                  <TextComponent
                    type="mediumText"
                    style={{ color: Colors.Colors.Daily_black, marginTop: 4 }}
                  >
                    {t(`dailyPracticeList.categories.${item.key}.description`)}
                  </TextComponent>
                </View>

                <Image
                  source={arrowIcon}
                  style={styles.arrowIcon}
                  resizeMode="contain"
                />
              </View>
            </Card>

          </TouchableOpacity>
        ))}
        {/* </Card> */}
        {/* ---- Sanatan Practices Card ---- */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("SanatanPractice")}
        >
          <Card style={styles.subCard}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>

              <Image source={sanatanImage} style={{ width: 40, height: 40 }} resizeMode="contain" />

              <View style={{ width: "80%" }}>
                <TextComponent type="cardText">{t('dailyPracticeList.sanatanPractices')}</TextComponent>
                <TextComponent type="mediumText" style={{ color: Colors.Colors.Daily_black, marginTop: 4 }}>
                  {t('dailyPracticeList.sanatanPracticesDesc')}
                </TextComponent>
              </View>

              <Image source={arrowIcon} style={styles.arrowIcon} resizeMode="contain" />
            </View>
          </Card>
        </TouchableOpacity>


        {/* ---- Create Your Own Card ---- */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("CreateOwnPractice")}
        >
          <Card style={styles.subCard}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>

              <Image source={createOwnImage} style={{ width: 40, height: 40 }} resizeMode="contain" />

              <View style={{ width: "80%" }}>
                <TextComponent type="cardText">{t('dailyPracticeList.createYourOwn')}</TextComponent>
                <TextComponent type="mediumText" style={{ color: Colors.Colors.Daily_black, marginTop: 4 }}>
                  {t('dailyPracticeList.createYourOwnDesc')}
                </TextComponent>
              </View>

              <Image source={arrowIcon} style={styles.arrowIcon} resizeMode="contain" />
            </View>
          </Card>
        </TouchableOpacity>
        <TextComponent type="mediumText" style={{ alignSelf: "center", textAlign: "center", color: Colors.Colors.blue_text, marginBottom: 30 }} >{t('dailyPracticeList.footerNote')}</TextComponent>
      </ScrollView>
      {/* </ImageBackground> */}
    </View>
  );
};

export default DailyPracticeList;

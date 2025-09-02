// screens/Home.js
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ExploreVideos from "../components/ExploreVideos";

export default function Home() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const categories = [
    {
      id: "1",
      name: t("categories.dharma"),
      title: "Dharma",
      icon: require("../../assets/Group.png"),
    },
    {
      id: "2",
      name: t("categories.explore"),
      title: "Explore",
      icon: require("../../assets/Exploreicon.png"),
    },
    {
      id: "3",
      name: t("categories.travel"),
      title: "Travel",
      icon: require("../../assets/darma.png"),
    },
    {
      id: "4",
      name: t("categories.pooja"),
      title: "Pooja",
      icon: require("../../assets/pooja.png"),
    },
    {
      id: "5",
      name: t("categories.retreat"),
      title: "Retreat",
      icon: require("../../assets/yoga.png"),
    },
     {
       id: "6",
      name: t("categories.classes"),
      title: "Classes",
      icon: require("../../assets/onlinecion.png"),
    },
  ];

  const dailyOptions = [
    {
      id: "1",
      title: t("daily.sankalpTitle"),
      route: "Sankalp",
      subtitle: t("daily.sankalpSubtitle"),
      icon: require("../../assets/lamp.png"),
    },
    {
      id: "2",
      title: t("daily.mantraTitle"),
      route: "Mantra",
      subtitle: t("daily.mantraSubtitle"),
      icon: require("../../assets/atom.png"),
    },
    {
      id: "3",
      title: t("daily.wisdomTitle"),
      route: "Wisdom",
      subtitle: t("daily.wisdomSubtitle"),
      icon: require("../../assets/sun.png"),
    },
    {
      id: "4",
      title: t("daily.festivalTitle"),
      route: "UpcomingFestivals",
      subtitle: t("daily.festivalSubtitle"),
      icon: require("../../assets/party.png"),
    },
  ];

  const kalpXData = [
    {
      id: "1",
      title: t("kalpx.learn"),
      name: "Learn",
      image: require("../../assets/learn.png"),
    },
    {
      id: "2",
      title: t("kalpx.explore"),
      name: "Explore",
      image: require("../../assets/explore.png"),
    },
    {
      id: "3",
      title: t("kalpx.practice"),
      name: "Practice",
      image: require("../../assets/daily.png"),
    },
    {
      id: "4",
      title: t("kalpx.journey"),
      name: "Journey",
      image: require("../../assets/journey.png"),
    },
    {
      id: "5",
      title: t("kalpx.poojas"),
      name: "Pooja",
      image: require("../../assets/poojafl.png"),
    },
    {
      id: "6",
      title: t("kalpx.retreats"),
      name: "Retreats",
      image: require("../../assets/retreatff.png"),
    },
     {
      id: "7",
      title: t("kalpx.Classes"),
      name: "Classes",
      image: require("../../assets/onlineclass.png"),
    },
  ];

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate(item?.title)}
    >
      <Image source={item.icon} style={styles.icon} resizeMode="contain" />
      <Text style={styles.cardText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderDailyOption = ({ item }) => (
    <TouchableOpacity
      style={styles.optionCard}
      onPress={() => navigation.navigate(item.route)}
    >
      <View style={styles.optionIconWrapper}>
        <Image
          source={item.icon}
          style={styles.optionIcon}
          resizeMode="contain"
        />
      </View>
      <View>
        <Text style={styles.optionTitle}>{item.title}</Text>
        <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderKalpXItem = ({ item }) => (
    <TouchableOpacity
      style={styles.kalpXCard}
      onPress={() => navigation.navigate(item?.name)}
    >
      <Image source={item.image} style={styles.kalpXImage} />
      <Text style={styles.kalpXTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff4dd"
        translucent={false}
      />

      <ImageBackground
        source={require("../../assets/home.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Header */}
        {/* <View style={styles.header}>
          <View style={styles.leftSection}>
            <TouchableOpacity>
              <Entypo name="menu" size={28} color="black" />
            </TouchableOpacity>
            <Text style={styles.greeting}>{t("home.greeting", { name: "Neha Jaiswal" })}</Text>
          </View>

          <View style={styles.rightIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Entypo name="dots-three-vertical" size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View> */}

        <ScrollView
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ✅ Horizontal Categories restored */}
          <View style={{ marginTop: 10 }}>
            <FlatList
              data={categories}
              renderItem={renderCategory}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 10,
                paddingBottom: 20,
              }}
            />
          </View>

          {/* Daily Section */}
          <View style={styles.dailyContainer}>
            <Text style={styles.sectionHeading}>{t("home.dailyHeading")}</Text>
            <FlatList
              data={dailyOptions}
              renderItem={renderDailyOption}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>

          {/* Explore Videos */}
          <View style={{ paddingLeft: 12 }}>
            <ExploreVideos />
          </View>

          {/* KalpX */}
          <View style={styles.kalpXContainer}>
            <Text style={styles.sectionHeading}>{t("home.kalpXHeading")}</Text>
            <FlatList
              data={kalpXData}
              renderItem={renderKalpXItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={{
                justifyContent: "space-between",
                marginBottom: 12,
              }}
              scrollEnabled={false}
            />
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: "cover" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftSection: { flexDirection: "row", alignItems: "center" },
  greeting: {
    fontSize: 18,
    fontWeight: "400",
    color: "#000",
    marginLeft: 10,
    fontFamily: "GelicaMedium",
    lineHeight: 22,
  },
  icon: { width: 28, height: 28, marginBottom: 6 },
  rightIcons: { flexDirection: "row", alignItems: "center" },
  iconButton: { marginLeft: 16 },
  card: {
    backgroundColor: "#fff",
    width: 64,
    height: 59,
    marginRight: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "400",
    color: "#000",
    textAlign: "center",
    fontFamily: "GelicaRegular",
    lineHeight: 16,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    width: 350,
    height: 59,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: "center",
  },
  optionIconWrapper: { marginRight: 12 },
  optionIcon: { width: 28, height: 28 },
  dailyContainer: { paddingHorizontal: 16, marginTop: 10 },
  sectionHeading: {
    fontSize: 18,
    fontFamily: "GelicaMedium",
    color: "#444",
    marginBottom: 12,
    paddingHorizontal: 4,
    lineHeight: 20,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: "GelicaMedium",
    color: "#000",
    marginBottom: 2,
    lineHeight: 20,
  },
  optionSubtitle: {
    fontSize: 13,
    fontFamily: "GelicaRegular",
    color: "#666",
    lineHeight: 18,
  },
  kalpXContainer: { paddingHorizontal: 16, marginTop: 20 },
  kalpXCard: {
    width: 150,
    height: 145,
    backgroundColor: "#fff",
    borderColor: "#ffd6a5",
    borderWidth: 0.5,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    padding: 8,
  },
  kalpXImage: { width: "100%", height: 100, borderRadius: 8 },
  kalpXTitle: {
    fontSize: 12,
    fontFamily: "GelicaMedium",
    color: "#000",
    marginTop: 6,
    marginHorizontal: 8,
    textAlign: "left",
    lineHeight: 18,
  },
});

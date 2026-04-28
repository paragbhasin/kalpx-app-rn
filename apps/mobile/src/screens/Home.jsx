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
  Platform,
} from "react-native";
import ExploreVideos from "../components/ExploreVideos";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useState, useEffect } from "react";

import {
  saveUserAction,
  getUserActions,
  clearUserActions,
} from "../utils/storage";

export default function Home() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [locationData, setLocationData] = useState({
    city: "",
    lat: "",
    long: "",
    timeZone: "",
  });

  const categories = [
    {
      id: "1",
      name: t("categories.dharma"),
      title: "Dharma",
      event_type: "click_dharma_card",
      component: "Dharma-card",
      icon: require("../../assets/Group.png"),
    },
    {
      id: "2",
      name: t("categories.explore"),
      title: "Explore",
      event_type: "click_explore_card",
      component: "Explore-card",
      icon: require("../../assets/Exploreicon.png"),
    },
    {
      id: "3",
      name: t("categories.travel"),
      title: "Travel",
      event_type: "click_travel_card",
      component: "Travel-card",
      icon: require("../../assets/darma.png"),
    },
    {
      id: "4",
      name: t("categories.pooja"),
      title: "Pooja",
      event_type: "click_pooja_card",
      component: "Pooja-card",
      icon: require("../../assets/pooja.png"),
    },
    {
      id: "5",
      name: t("categories.retreat"),
      title: "Retreat",
      event_type: "click_retreat_card",
      component: "Retreat-card",
      icon: require("../../assets/yoga.png"),
    },
    {
      id: "6",
      name: t("categories.classes"),
      title: "Classes",
      event_type: "click_classes_card",
      component: "Classes-card",
      icon: require("../../assets/onlinecion.png"),
    },
  ];

  const dailyOptions = [
    {
      id: "1",
      title: t("daily.sankalpTitle"),
      route: "Sankalp",
      event_type: "view_sankalp_card",
      component: "sankalp-card",
      subtitle: t("daily.sankalpSubtitle"),
      icon: require("../../assets/lamp.png"),
    },
    {
      id: "2",
      title: t("daily.mantraTitle"),
      route: "Mantra",
      event_type: "view_mantra_card",
      component: "mantra-card",
      subtitle: t("daily.mantraSubtitle"),
      icon: require("../../assets/atom.png"),
    },
    {
      id: "3",
      title: t("daily.wisdomTitle"),
      route: "Wisdom",
      event_type: "view_wisdom_card",
      component: "wisdom-card",
      subtitle: t("daily.wisdomSubtitle"),
      icon: require("../../assets/sun.png"),
    },
    {
      id: "4",
      title: t("daily.festivalTitle"),
      route: "UpcomingFestivals",
      event_type: "view_festival_card",
      component: "festival-card",
      subtitle: t("daily.festivalSubtitle"),
      icon: require("../../assets/party.png"),
    },
  ];

  const kalpXData = [
    {
      id: "1",
      title: t("kalpx.learn"),
      name: "Learn",
      event_type: "click_learn_card",
      component: "Learn-card",
      image: require("../../assets/learn.png"),
    },
    {
      id: "2",
      title: t("kalpx.explore"),
      name: "Explore",
      event_type: "click_explore_card",
      component: "Explore-card",
      image: require("../../assets/explore.png"),
    },
    {
      id: "3",
      title: t("kalpx.practice"),
      name: "Practice",
      event_type: "click_practice_card",
      component: "Practice-card",
      image: require("../../assets/daily.png"),
    },
    {
      id: "4",
      title: t("kalpx.journey"),
      name: "Journey",
      event_type: "click_journey_card",
      component: "Journey-card",
      image: require("../../assets/journey.png"),
    },
    {
      id: "5",
      title: t("kalpx.poojas"),
      name: "Pooja",
      event_type: "click_pooja_card",
      component: "Pooja-card",
      image: require("../../assets/poojafl.png"),
    },
    {
      id: "6",
      title: t("kalpx.retreats"),
      name: "Retreats",
      event_type: "click_retreats_card",
      component: "Retreats-card",
      image: require("../../assets/retreatff.png"),
    },
    {
      id: "7",
      title: t("kalpx.Classes"),
      name: "Classes",
      event_type: "click_classes_card",
      component: "Classes-card",
      image: require("../../assets/onlineclass.png"),
    },
  ];

  useEffect(() => {
    const getLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          // Permission denied → keep empty values
          return;
        }

        // Get coords
        let loc = await Location.getCurrentPositionAsync({});
        // Reverse geocode for city
        let geo = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        const cityName = geo.length > 0 ? geo[0].city || geo[0].region : "";

        // Get timezone from device
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

        setLocationData({
          city: cityName,
          lat: loc.coords.latitude.toString(),
          long: loc.coords.longitude.toString(),
          timeZone: tz,
        });
      } catch (err) {
        console.log("Location error:", err);
      }
    };

    getLocation();
  }, []);

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={async () => {
        try {
          const userId = await AsyncStorage.getItem("uuid");
          await saveUserAction({
            uuid: userId,
            timestamp: Date.now(),
            retryCount: 0,
            event_type: item?.event_type,
            event_data: {
              component: item?.component,
              city: locationData.city,
              lat: locationData.lat,
              long: locationData.long,
              timeZone: locationData.timeZone,
              device: Platform.OS === "ios" ? "mobile-ios" : "mobile-android",
              screen: "home",
            },
          });
          // clearUserActions()
          const actions = await getUserActions();
          console.log(actions);
          navigation.navigate(item.title);
        } catch (error) {
          console.error("Error fetching UUID:", error);
        }
      }}
    >
      <Image source={item.icon} style={styles.icon} resizeMode="contain" />
      <Text style={styles.cardText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderDailyOption = ({ item }) => (
    <TouchableOpacity
      style={styles.optionCard}
      onPress={async () => {
        try {
          const userId = await AsyncStorage.getItem("uuid");
          saveUserAction({
            uuid: userId,
            timestamp: Date.now(),
            retryCount: 0,
            event_type: item?.event_type,
            event_data: {
              component: item?.component,
              city: locationData.city,
              lat: locationData.lat,
              long: locationData.long,
              timeZone: locationData.timeZone,
              device: Platform.OS === "ios" ? "mobile-ios" : "mobile-android",
              screen: "home",
            },
          });
          navigation.navigate(item.route);
        } catch (error) {
          console.error("Error fetching UUID:", error);
        }
      }}
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
      onPress={async () => {
        try {
          const userId = await AsyncStorage.getItem("uuid");
          saveUserAction({
            uuid: userId,
            timestamp: Date.now(),
            retryCount: 0,
            event_type: item?.event_type,
            event_data: {
              component: item?.component,
              city: locationData.city,
              lat: locationData.lat,
              long: locationData.long,
              timeZone: locationData.timeZone,
              device: Platform.OS === "ios" ? "mobile-ios" : "mobile-android",
              screen: "home",
            },
          });
          navigation.navigate(item.name);
        } catch (error) {
          console.error("Error fetching UUID:", error);
        }
      }}
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

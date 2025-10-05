// screens/Home.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import ExploreVideos from "../../components/ExploreVideos";
import styles from "./homestyles";

import {
  getUserActions,
  saveUserAction
} from "../../utils/storage";

export default function Home() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [locationData, setLocationData] = useState({
    city: "",
    lat: "",
    long: "",
    timeZone: "",
  });


  // Define categories with translated names

  const categories = [
    {
      id: "1",
      name: t("categories.dharma"),
      title: "Dharma",
      event_type: "click_dharma_card",
      component: "Dharma-card",
      icon: require("../../../assets/Group.png"),
    },
    {
      id: "2",
      name: t("categories.explore"),
      title: "Explore",
      event_type: "click_explore_card",
      component: "Explore-card",
      icon: require("../../../assets/Exploreicon.png"),
    },
    {
      id: "3",
      name: t("categories.travel"),
      title: "Travel",
      event_type: "click_travel_card",
      component: "Travel-card",
      icon: require("../../../assets/darma.png"),
    },
    {
      id: "4",
      name: t("categories.pooja"),
      title: "Pooja",
      event_type: "click_pooja_card",
      component: "Pooja-card",
      icon: require("../../../assets/pooja.png"),
    },
    {
      id: "5",
      name: t("categories.retreat"),
      title: "Retreat",
      event_type: "click_retreat_card",
      component: "Retreat-card",
      icon: require("../../../assets/yoga.png"),
    },
    {
      id: "6",
      name: t("categories.classes"),
      title: "ClassesScreen",
      event_type: "click_classes_card",
      component: "Classes-card",
      icon: require("../../../assets/onlinecion.png"),
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
      icon: require("../../../assets/lamp.png"),
    },
    {
      id: "2",
      title: t("daily.mantraTitle"),
      route: "Mantra",
      event_type: "view_mantra_card",
      component: "mantra-card",
      subtitle: t("daily.mantraSubtitle"),
      icon: require("../../../assets/atom.png"),
    },
    {
      id: "3",
      title: t("daily.wisdomTitle"),
      route: "Wisdom",
      event_type: "view_wisdom_card",
      component: "wisdom-card",
      subtitle: t("daily.wisdomSubtitle"),
      icon: require("../../../assets/sun.png"),
    },
    {
      id: "4",
      title: t("daily.festivalTitle"),
      route: "UpcomingFestivals",
      event_type: "view_festival_card",
      component: "festival-card",
      subtitle: t("daily.festivalSubtitle"),
      icon: require("../../../assets/party.png"),
    },
  ];

  const kalpXData = [
    {
      id: "1",
      title: t("kalpx.learn"),
      name: "Learn",
      event_type: "click_learn_card",
      component: "Learn-card",
      image: require("../../../assets/learn.png"),
    },
    {
      id: "2",
      title: t("kalpx.explore"),
      name: "Explore",
      event_type: "click_explore_card",
      component: "Explore-card",
      image: require("../../../assets/explore.png"),
    },
    {
      id: "3",
      title: t("kalpx.practice"),
      name: "Practice",
      event_type: "click_practice_card",
      component: "Practice-card",
      image: require("../../../assets/daily.png"),
    },
    {
      id: "4",
      title: t("kalpx.journey"),
      name: "Journey",
      event_type: "click_journey_card",
      component: "Journey-card",
      image: require("../../../assets/journey.png"),
    },
    {
      id: "5",
      title: t("kalpx.poojas"),
      name: "Pooja",
      event_type: "click_pooja_card",
      component: "Pooja-card",
      image: require("../../../assets/poojafl.png"),
    },
    {
      id: "6",
      title: t("kalpx.retreats"),
      name: "Retreats",
      event_type: "click_retreats_card",
      component: "Retreats-card",
      image: require("../../../assets/retreatff.png"),
    },
    {
      id: "7",
      title: t("kalpx.Classes"),
      name: "Classes",
      event_type: "click_classes_card",
      component: "Classes-card",
      image: require("../../../assets/onlineclass.png"),
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
        source={require("../../../assets/home.jpg")}
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



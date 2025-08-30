// screens/Home.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import Entypo from "react-native-vector-icons/Entypo";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import ExploreVideos from "../components/ExploreVideos";
import { useNavigation } from "@react-navigation/native";

export default function Home() {
  const navigation = useNavigation();
  // Horizontal Categories
  const categories = [
    { id: "1", name: "Dharma", icon: require("../../assets/Group.png") },
    { id: "2", name: "Explore", icon: require("../../assets/Exploreicon.png") },
    { id: "3", name: "Travel", icon: require("../../assets/darma.png") },
    { id: "4", name: "Pooja", icon: require("../../assets/pooja.png") },
    { id: "5", name: "Retreat", icon: require("../../assets/yoga.png") },
  ];

  // Vertical Cards
  const dailyOptions = [
    {
      id: "1",
      title: "Today Sankalp",
      route: "Sankalp",
      subtitle: "Do a small good thing",
      icon: require("../../assets/lamp.png"),
      color: "#f87171",
    },
    {
      id: "2",
      title: "Todays Mantra",
      route: "Mantra",
      subtitle: "Calm my mind",
      icon: require("../../assets/atom.png"),
      color: "#f59e0b",
    },
    {
      id: "3",
      title: "Todays Wisdom",
      route: "Wisdom",
      subtitle: "Keep a line of wisdom",
      icon: require("../../assets/sun.png"),
      color: "#eab308",
    },
    {
      id: "4",
      title: "Upcoming Festivals",
      route: "UpcomingFestivals",
      subtitle: "invited you to a chat",
      icon: require("../../assets/party.png"),
      color: "#22c55e",
    },
  ];

  const kalpXData = [
    {
      id: "1",
      title: "Learn and Grow",
      image: require("../../assets/learn.png"),
    },
    {
      id: "2",
      title: "Explore Videos",
      image: require("../../assets/explore.png"),
    },
    {
      id: "3",
      title: "Daily Practice",
      image: require("../../assets/daily.png"),
    },
    {
      id: "4",
      title: "Sacred Journeys",
      image: require("../../assets/journey.png"),
    },
    {
      id: "5",
      title: "Temple Poojas",
      image: require("../../assets/poojafl.png"),
    },
    {
      id: "6",
      title: "Retreats and Wellness",
      image: require("../../assets/retreatff.png"),
    },
  ];

  const renderKalpXItem = ({ item }) => (
    <TouchableOpacity style={styles.kalpXCard}>
      <Image source={item.image} style={styles.kalpXImage} />
      <Text style={styles.kalpXTitle}>{item.title.replace("and", "&")}</Text>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        navigation.navigate(item);
      }}
    >
      <Image source={item.icon} style={styles.icon} resizeMode="contain" />
      <Text style={styles.cardText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderDailyOption = ({ item }) => (
    <TouchableOpacity
      style={styles.optionCard}
      onPress={() => {
        console.log("Navigating to:", item.route);
        navigation.navigate(item.route);
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Keep UI below status bar */}
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
        {/* Fixed Header */}
        <View style={styles.header}>
          <View style={styles.leftSection}>
            <TouchableOpacity>
              <Entypo name="menu" size={28} color="black" />
            </TouchableOpacity>
            <Text style={styles.greeting}>Hi, Neha Jaiswal</Text>
          </View>

          <View style={styles.rightIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Entypo name="dots-three-vertical" size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Horizontal Scroll Categories */}
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

          {/* Vertical List of Options */}
          <View style={styles.dailyContainer}>
            <Text style={styles.sectionHeading}>
              What would you like today?
            </Text>
            <FlatList
              data={dailyOptions}
              renderItem={renderDailyOption}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={{ paddingVertical: 10 }}
            />
          </View>

          {/* Explore Videos */}
          <ExploreVideos />

          {/* KalpX Section */}
          <View style={styles.kalpXContainer}>
            <Text style={styles.sectionHeading}>
              What You’ll Find on KalpX?
            </Text>
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

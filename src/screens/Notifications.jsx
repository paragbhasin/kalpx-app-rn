// screens/Notifications.js
import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function Notifications() {
  const navigation = useNavigation();

  const notifications = [
    {
      id: "1",
      title: "Practice Reminders",
      message:
        "“It’s time for your morning mantra \nComplete today’s meditation to keep your streak”",
      time: "2 days ago",
      icon: require("../../assets/not.png"),
    },
    {
      id: "2",
      title: "Classes Updates",
      message: "Your class on Vedic Chanting starts in 1 hour",
      time: "6 days ago",
      icon: require("../../assets/not.png"),
    },
    {
      id: "3",
      title: "Dharma Alerts",
      message: "Full Moon tonight: Auspicious for mantra practice",
      time: "9 days ago",
      icon: require("../../assets/not.png"),
    },
    {
      id: "4",
      title: "Personal Journey",
      message: "“Your Sankalp progress: 7 days streak 🔥”",
      time: "13 days ago",
      icon: require("../../assets/not.png"),
    },
    {
      id: "5",
      title: "System Notifications",
      message: "App updates, new features, reminders",
      time: "11 days ago",
      icon: require("../../assets/not.png"),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Notification List */}
      <ScrollView>
        {notifications.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.row,
              index === 0 && styles.firstRow, // top border for first row
            ]}
          >
            <Image source={item.icon} style={styles.icon} />
            <View style={styles.textContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text style={styles.message}>{item.message}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffaf5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  headerText: {
    fontSize: 16,
    fontFamily: "GelicaMedium",
    color: "#000",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.7,
    borderBottomColor: "#ddd",
  },
  firstRow: {
    borderTopWidth: 0.7,
    borderTopColor: "#ddd",
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: 12,
    marginTop: 4,
    resizeMode: "contain",
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 14,
    fontFamily: "GelicaMedium",
    color: "#000",
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    fontFamily: "GelicaRegular",
    color: "#888",
    lineHeight: 18,
  },
  message: {
    fontSize: 13,
    fontFamily: "GelicaRegular",
    color: "#444",
    lineHeight: 18,
  },
});

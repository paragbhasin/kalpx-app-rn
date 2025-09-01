// screens/Profile.js
// screens/Profile.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

export default function Profile() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const menuItems = [
    { key: "saved", route: "SavedMessages" },
    { key: "recent", route: "RecentVideos" },
    { key: "practices", route: "Practices" },
    { key: "notifications", route: "Notifications" },
    { key: "language", route: "Language" },
    { key: "privacy", route: "Privacy" },
    { key: "storage", route: "Storage" },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{t("profile.title")}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Image
            source={require("../../assets/Avatar.png")}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editIcon}>
            <Ionicons name="pencil" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{t("profile.name")}</Text>
        <Text style={styles.level}>{t("profile.level")}</Text>
      </View>

      {/* Menu Options */}
      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.route)}
          >
            <Text style={styles.menuText}>{t(`profile.menu.${item.key}`)}</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
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
  profileSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#cce0ff",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007bff",
    borderRadius: 12,
    padding: 4,
  },
  name: {
    fontSize: 18,
    fontFamily: "GelicaMedium",
    color: "#000",
    marginTop: 10,
    lineHeight: 22,
  },
  level: {
    fontSize: 14,
    fontFamily: "GelicaRegular",
    color: "#666",
    lineHeight: 18,
  },
  menu: {
    marginTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  menuText: {
    fontSize: 16,
    fontFamily: "GelicaRegular",
    color: "#333",
    lineHeight: 20,
  },
});

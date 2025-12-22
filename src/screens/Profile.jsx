// screens/Profile.js
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function Profile() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const menuItems = [
    { key: "myProfile", icon: "person-outline", route: "ProfileDetails" },
    { key: "setReminders", icon: "time-outline", route: "Reminders" },
    { key: "myPractices", icon: "calendar-outline", route: "Practices" },
    {
      key: "notifications",
      icon: "notifications-outline",
      route: "Notifications",
    },
    { key: "faqs", icon: "help-circle-outline", route: "Faqs" },
    { key: "language", icon: "globe-outline", route: "Language" },
    { key: "privacy", icon: "key-outline", route: "Privacy" },
    { key: "settings", icon: "settings-outline", route: "Settings" },
    { key: "inviteFriends", icon: "people-outline", route: "InviteFriends" },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
<<<<<<< HEAD
        <Text style={styles.headerText}>{t("profile.title")}</Text>
=======
        <Text  allowFontScaling={false} style={styles.headerText}>{t("profile.title")}</Text>
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
        <View style={{ width: 24 }} />
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Image
            source={require("../../assets/Avatar.png")}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editIcon}>
            <Ionicons name="pencil" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
<<<<<<< HEAD
        <Text style={styles.name}>{t("profile.name")}</Text>
        <Text style={styles.level}>{t("profile.level")}</Text>
=======
        <Text  allowFontScaling={false} style={styles.name}>{t("profile.name")}</Text>
        <Text  allowFontScaling={false} style={styles.level}>{t("profile.level")}</Text>
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
      </View>

      {/* Menu Items */}
      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.route)}
          >
            <View style={styles.menuLeft}>
              <Ionicons name={item.icon} size={20} color="#a67c52" />
<<<<<<< HEAD
              <Text style={styles.menuText}>
=======
              <Text  allowFontScaling={false} style={styles.menuText}>
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
                {t(`profile.menu.${item.key}`)}
              </Text>
            </View>
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
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: 16,
    paddingVertical: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
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
    fontSize: 16,
    fontFamily: "GelicaMedium",
    color: "#000",
    marginTop: 10,
  },
  level: {
    fontSize: 13,
    fontFamily: "GelicaRegular",
    color: "#666",
    marginTop: 2,
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
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuText: {
    fontSize: 15,
    fontFamily: "GelicaRegular",
    color: "#333",
<<<<<<< HEAD
    lineHeight: 18,
=======
    // lineHeight: 18,
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
  },
});

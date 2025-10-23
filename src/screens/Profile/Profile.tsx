// screens/Profile.js
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Privacy from "../../components/Privacy";
import styles from "./styles";

const  Profile = () => {
  const navigation: any = useNavigation();
  const { t } = useTranslation();
    const [showPrivacy, setShowPrivacy] = useState(false);

  const menuItems = [
    { key: "myProfile", icon: "person-outline", route: "ProfileDetails" },
    // { key: "setReminders", icon: "time-outline", route: "Reminders" },
    // { key: "myPractices", icon: "calendar-outline", route: "Practices" },
    // {
    //   key: "notifications",
    //   icon: "notifications-outline",
    //   route: "Notifications",
    // },
    // { key: "faqs", icon: "help-circle-outline", route: "Faqs" },
    { key: "language", icon: "globe-outline", route: "Language" },
    // { key: "privacy", icon: "key-outline", route: "Privacy" },
        { key: "privacy", icon: "key-outline", action: () => setShowPrivacy(true) },
    // { key: "settings", icon: "settings-outline", route: "Settings" },
    // { key: "inviteFriends", icon: "people-outline", route: "InviteFriends" },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{t("profile.title")}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Profile Card */}
      {/* <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Image
            source={require("../../../assets/Avatar.png")}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editIcon}>
            <Ionicons name="pencil" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{t("profile.name")}</Text>
        <Text style={styles.level}>{t("profile.level")}</Text>
      </View> */}

      {/* Menu Items */}
      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            // onPress={() => navigation.navigate(item.route)}
                onPress={() =>
                item.action ? item.action() : navigation.navigate(item.route)
              }
          >
            <View style={styles.menuLeft}>
              <Ionicons name={item.icon} size={20} color="#a67c52" />
              <Text style={styles.menuText}>
                {t(`profile.menu.${item.key}`)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
        ))}
      </View>
 {showPrivacy && <Privacy onClose={() => setShowPrivacy(false)} />}
    </ScrollView>
  );
}

export default Profile;



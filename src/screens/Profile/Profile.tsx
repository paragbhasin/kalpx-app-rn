// screens/Profile.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import Header from "../../components/Header";
import store, { RootState } from "../../store";
import { deleteUserAccount } from "./actions";
import Privacy from "./Privacy";
import styles from "./styles";

const  Profile = () => {
  const navigation: any = useNavigation();
  const { t } = useTranslation();
    const [showPrivacy, setShowPrivacy] = useState(false);
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

     const handleLogout = async () => {
  await AsyncStorage.clear();
  store.dispatch({ type: "RESET_APP" });

  const parentNav = navigation.getParent();
  parentNav?.reset({
    index: 0,
    routes: [{ name: "Welcome" }],
  });
};


const handleDelete = () => {
     dispatch(
              deleteUserAccount({ confirm_deletion: true, force: true }, (res) => {
                console.log("res delete>>>>>>>>>>",JSON.stringify(res));
       console.log("✅ Response full object >>>>>>>>>>>");
    console.log("Status:", res.status);
    console.log("Headers:", JSON.stringify(res.headers, null, 2));
    console.log("Data:", JSON.stringify(res.data, null, 2));
                if (res.success) {
                  handleLogout();
                  Alert.alert("✅ Account deleted successfully!");
                  // Optionally navigate to login or clear AsyncStorage here
                } else {
                  Alert.alert("❌ Failed", res.error);
                }
              })
            );
  };

const menuItems = [
  { key: "myProfile", icon: "person-outline", route: "ProfileDetails" },
  { key: "language", icon: "globe-outline", route: "Language" },
  { key: "privacy", icon: "key-outline", route: "Privacy" },
    // action: () => setShowPrivacy(true) },

  // New items below 👇
 {
      key: "logout",
      icon: "log-out-outline",
      action: () => {
        Alert.alert(
          t("profile.menu.logout"),
          t(
            "profile.menu.logoutConfirm",
            "Are you sure you want to log out?"
          ),
          [
            { text: t("common.cancel", "Cancel"), style: "cancel" },
            {
              text: t("common.yes", "Yes"),
              style: "destructive",
              onPress: handleLogout,
            },
          ]
        );
      },
    },
   {
      key: "deleteAccount",
      icon: "trash-outline",
      action: () => {
        Alert.alert(
          t("profile.menu.deleteAccount"),
          t(
            "profile.menu.deleteAccountConfirm",
            "This action is permanent. Do you really want to delete your account?"
          ),
          [
            { text: t("common.cancel", "Cancel"), style: "cancel" },
            {
              text: t("common.delete", "Delete"),
              style: "destructive",
              onPress: handleDelete,
            },
          ]
        );
      },
    },
];


  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Header/>
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



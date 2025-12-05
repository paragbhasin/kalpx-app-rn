// screens/Profile.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Linking,
  ScrollView,
  TouchableOpacity,
  View
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import Header from "../../components/Header";
import LogoutPopup from "../../components/LogoutPopup";
import TextComponent from "../../components/TextComponent";
import store, { RootState } from "../../store";
import unregisterDeviceFromBackend from '../../utils/unregisterDevice';
import { deleteUserAccount } from "./actions";
import Privacy from "./Privacy";
import styles from "./styles";

const  Profile = () => {
  const navigation: any = useNavigation();
  const { t } = useTranslation();
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

    useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        setIsLoggedIn(!!token);
      } catch (error) {
        console.log("Error checking login:", error);
      }
    };
    checkLogin();
  }, []);

     const handleLogout = async () => {
  await AsyncStorage.clear();
  await unregisterDeviceFromBackend();
  store.dispatch({ type: "RESET_APP" });
// await GoogleSignin.signOut();
// await GoogleSignin.revokeAccess();
  const parentNav = navigation.getParent();
  parentNav?.reset({
    index: 0,
    routes: [{ name: "Welcome" }],
  });
};


const handleDelete =  () => {
     dispatch(
              deleteUserAccount({ confirm_deletion: true, force: true }, async (res) => {
                console.log("res delete>>>>>>>>>>",JSON.stringify(res));
       console.log("✅ Response full object >>>>>>>>>>>");
    console.log("Status:", res.status);
    console.log("Headers:", JSON.stringify(res.headers, null, 2));
    console.log("Data:", JSON.stringify(res.data, null, 2));
                if (res.success) {
  await unregisterDeviceFromBackend();
                  handleLogout();
                  Alert.alert("✅ Account deleted successfully!");
                } else {
                  Alert.alert("❌ Failed", res.error);
                }
              })
            );
  };

const loggedInItems = [
  { key: "myProfile", icon: "person-outline", route: "ProfileDetails" },
    { key: "language", icon: "globe-outline", route: "Language" },
  { key: "privacy", icon: "key-outline", route: "Privacy" },
  {
    key: "logout",
    icon: "log-out-outline",
    action: () => setShowLogoutPopup(true),
  },
  {
    key: "deleteAccount",
    icon: "trash-outline",
    action: () => setShowDeletePopup(true),
  },
];

const guestItems = [
  {
    key: "login",
    icon: "log-in-outline",
    route: "Login",
  },
    { key: "language", icon: "globe-outline", route: "Language" },
  { key: "privacy", icon: "key-outline", route: "Privacy" },
];

const menuItems = isLoggedIn
  ? [...loggedInItems]
  : [...guestItems];



  return (
      <View style={{ flex: 1 ,backgroundColor:"#fffaf5"}}>
    <ScrollView style={styles.container}>
      {/* Header */}
      <Header/>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TextComponent type="headerText" style={styles.headerText}>{t("profile.title")}</TextComponent>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.menu}>
        {menuItems.map((item: any, index) => (
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
              <TextComponent type="headerSubBoldText" style={styles.menuText}>
                {t(`profile.menu.${item.key}`)}
              </TextComponent>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
        ))}
      </View>
      <LogoutPopup
  visible={showLogoutPopup}
  headerText={t("profile.menu.logout")}
  subText={t(
    "profile.menu.logoutConfirm",
    "Are you sure you want to log out of your account?"
  )}
  cancelText={t("common.cancel", "Cancel")}
  confirmText={t("common.yes", "Yes")}
  onCancel={() => setShowLogoutPopup(false)}
  onConfirm={() => {
    setShowLogoutPopup(false);
    handleLogout();
  }}
  onClose={() => setShowLogoutPopup(false)}
/>

<LogoutPopup
  visible={showDeletePopup}
  headerText={t("profile.menu.deleteAccount")}
  subText={t(
    "profile.menu.deleteAccountConfirm",
    "This action is permanent. Do you really want to delete your account?"
  )}
  cancelText={t("common.cancel", "Cancel")}
  confirmText={t("common.delete", "Delete")}
  onCancel={() => setShowDeletePopup(false)}
  onConfirm={() => {
    setShowDeletePopup(false);
    handleDelete();
  }}
  onClose={() => setShowDeletePopup(false)}
/>

 {showPrivacy && <Privacy onClose={() => setShowPrivacy(false)} />}
    </ScrollView>
     {/* Follow Us Section */}
<View style={{ marginBottom: 50, alignItems: "center",backgroundColor:"#fffaf5"}}>
  <View style={{ flexDirection: "row", gap: 25 ,alignItems:"center"}}>
  <TextComponent
    type="streakSadanaText"
    style={{ fontSize: 18, color: "#000"}}
  >
    {t("profile.followUs", "Follow us")}
  </TextComponent>

    {/* Facebook */}
    <TouchableOpacity
      onPress={() => Linking.openURL("https://www.facebook.com/KalpxOfficial/")}
    >
      <Ionicons name="logo-facebook" size={34} color="#4267B2" />
    </TouchableOpacity>

    {/* Instagram */}
    <TouchableOpacity
      onPress={() => Linking.openURL("https://www.instagram.com/kalpxofficial")}
    >
      <Ionicons name="logo-instagram" size={34} color="#C13584" />
    </TouchableOpacity>
  </View>
</View>
</View>
  );
}

export default Profile;



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
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import LogoutPopup from "../../components/LogoutPopup";
import TextComponent from "../../components/TextComponent";
import { useScrollContext } from "../../context/ScrollContext";
import { RootState } from "../../store";
import { performLogout } from "../../utils/logout";
import unregisterDeviceFromBackend from "../../utils/unregisterDevice";
import { deleteUserAccount } from "./actions";
import Privacy from "./Privacy";

const BRAND = "#a67c52";
const BG = "#fffaf5";
const SECTION_LABEL = "#999";
const DESTRUCTIVE = "#c0392b";

const Profile = () => {
  const { handleScroll } = useScrollContext();
  const navigation: any = useNavigation();
  const { t } = useTranslation();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const profileDetails = useSelector(
    (state: RootState) => state.profileDetailsReducer?.data,
  );
  const profileName = profileDetails?.profile?.profile_name ?? "";
  const avatarLetter = profileName?.[0]?.toUpperCase() ?? "";

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
    await performLogout();
    navigation.navigate("HomePage", { screen: "Home" } as any);
  };

  const handleDelete = () => {
    dispatch(
      deleteUserAccount(
        { confirm_deletion: true, force: true },
        async (res) => {
          if (res.success) {
            await unregisterDeviceFromBackend();
            handleLogout();
            Alert.alert("Account deleted successfully!");
          } else {
            Alert.alert("Failed", res.error);
          }
        },
      ),
    );
  };

  const sections = isLoggedIn
    ? [
        {
          title: "ACCOUNT",
          items: [
            {
              key: "myProfile",
              icon: "person-outline",
              route: "ProfileDetails",
            },
            {
              key: "savedReflections",
              icon: "bookmark-outline",
              route: "RoomMemoryScreen",
            },
          ],
        },
        {
          title: "PREFERENCES",
          items: [
            {
              key: "notificationPreferences",
              icon: "notifications-outline",
              route: "NotificationPreferences",
            },
            {
              key: "reminders",
              icon: "time-outline",
              route: "Reminders",
            },
            // { key: "language", icon: "globe-outline", route: "Language" },
          ],
        },
        {
          title: "SECURITY",
          items: [
            {
              key: "security",
              icon: "shield-checkmark-outline",
              route: "Security",
            },
          ],
        },
        {
          title: "LEGAL",
          items: [
            {
              key: "privacy",
              icon: "key-outline",
              action: () => Linking.openURL("https://kalpx.com/en/privacy"),
            },
            {
              key: "indiaPrivacy",
              icon: "flag-outline",
              action: () =>
                Linking.openURL("https://kalpx.com/en/privacy/india"),
            },
            {
              key: "terms",
              icon: "document-text-outline",
              action: () => Linking.openURL("https://kalpx.com/en/terms"),
            },
            {
              key: "dataDeletion",
              icon: "trash-bin-outline",
              action: () =>
                Linking.openURL("https://kalpx.com/en/data-deletion"),
            },
          ],
        },
        {
          title: "ACCOUNT ACTIONS",
          items: [
            {
              key: "logout",
              icon: "log-out-outline",
              action: () => setShowLogoutPopup(true),
              destructive: true,
            },
            {
              key: "deleteAccount",
              icon: "trash-outline",
              action: () => setShowDeletePopup(true),
              destructive: true,
            },
          ],
        },
      ]
    : [
        {
          title: "ACCESS",
          items: [{ key: "login", icon: "log-in-outline", route: "Login" }],
        },
        {
          title: "PREFERENCES",
          items: [
            // { key: "language", icon: "globe-outline", route: "Language" },
          ],
        },
        {
          title: "LEGAL",
          items: [
            {
              key: "privacy",
              icon: "key-outline",
              action: () => Linking.openURL("https://kalpx.com/en/privacy"),
            },
            {
              key: "indiaPrivacy",
              icon: "flag-outline",
              action: () =>
                Linking.openURL("https://kalpx.com/en/privacy/india"),
            },
            {
              key: "terms",
              icon: "document-text-outline",
              action: () => Linking.openURL("https://kalpx.com/en/terms"),
            },
            {
              key: "dataDeletion",
              icon: "trash-bin-outline",
              action: () =>
                Linking.openURL("https://kalpx.com/en/data-deletion"),
            },
          ],
        },
      ];

  const getMenuLabel = (key: string) => {
    if (key === "notificationPreferences") {
      return t("profile.menu.notificationPreferences", {
        defaultValue: "Notification Preferences",
      });
    }
    if (key === "reminders") return "Reminders";
    if (key === "security") return "App Lock";
    if (key === "terms") return "Terms of Service";
    if (key === "indiaPrivacy") return "India Privacy Notice";
    if (key === "dataDeletion") return "Data Deletion";
    return t(`profile.menu.${key}`);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.avatarCircle}>
            {avatarLetter ? (
              <TextComponent type="headerText" style={styles.avatarLetter}>
                {avatarLetter}
              </TextComponent>
            ) : (
              <Ionicons name="person" size={36} color="#888" />
            )}
          </View>
          <TextComponent type="headerText" style={styles.heroName}>
            {profileName || t("profile.title", "Profile")}
          </TextComponent>
          {isLoggedIn && profileName ? (
            <TextComponent type="bodyText" style={styles.heroSub}>
              {t("profile.member", "KalpX Member")}
            </TextComponent>
          ) : null}
        </View>

        {/* Grouped sections */}
        <View style={styles.sectionsWrapper}>
          {sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <TextComponent type="bodyText" style={styles.sectionLabel}>
                {section.title}
              </TextComponent>
              <View style={styles.sectionCard}>
                {section.items.map((item: any, idx) => {
                  const isLast = idx === section.items.length - 1;
                  const color = item.destructive ? DESTRUCTIVE : BRAND;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[styles.row, !isLast && styles.rowBorder]}
                      onPress={() =>
                        item.action
                          ? item.action()
                          : navigation.navigate(item.route)
                      }
                      testID={`profile_menu_${item.key}`}
                      accessibilityLabel={`profile_menu_${item.key}`}
                    >
                      <View style={styles.rowLeft}>
                        <View
                          style={[
                            styles.iconBadge,
                            { backgroundColor: color + "18" },
                          ]}
                        >
                          <Ionicons name={item.icon} size={18} color={color} />
                        </View>
                        <TextComponent
                          type="headerSubBoldText"
                          style={[
                            styles.rowLabel,
                            item.destructive && { color: DESTRUCTIVE },
                          ]}
                        >
                          {getMenuLabel(item.key)}
                        </TextComponent>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={item.destructive ? DESTRUCTIVE + "99" : "#ccc"}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          {/* Follow us */}
          <View style={styles.section}>
            <TextComponent type="bodyText" style={styles.sectionLabel}>
              FOLLOW US
            </TextComponent>
            <View style={[styles.sectionCard, styles.followCard]}>
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() =>
                  Linking.openURL("https://www.facebook.com/KalpxOfficial/")
                }
              >
                <Ionicons name="logo-facebook" size={26} color="#4267B2" />
                <TextComponent type="bodyText" style={styles.socialLabel}>
                  Facebook
                </TextComponent>
              </TouchableOpacity>
              <View style={styles.socialDivider} />
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() =>
                  Linking.openURL("https://www.instagram.com/kalpxofficial")
                }
              >
                <Ionicons name="logo-instagram" size={26} color="#C13584" />
                <TextComponent type="bodyText" style={styles.socialLabel}>
                  Instagram
                </TextComponent>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <LogoutPopup
        visible={showLogoutPopup}
        headerText={t("profile.menu.logout")}
        subText={t(
          "profile.menu.logoutConfirm",
          "Are you sure you want to log out of your account?",
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
          "This action is permanent. Do you really want to delete your account?",
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

      {showPrivacy && <Privacy />}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  hero: {
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e8e8e8",
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  avatarLetter: {
    fontSize: 32,
    color: "#333",
  },
  heroName: {
    color: "#1a1a1a",
    fontSize: 20,
    letterSpacing: 0.3,
  },
  heroSub: {
    color: "#888",
    fontSize: 13,
    marginTop: 4,
  },
  sectionsWrapper: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 20,
  },
  section: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: SECTION_LABEL,
    letterSpacing: 1,
    paddingLeft: 4,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f0ede8",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontSize: 15,
    color: "#222",
  },
  followCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 0,
  },
  socialBtn: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  socialDivider: {
    width: StyleSheet.hairlineWidth,
    height: 40,
    backgroundColor: "#e8e2da",
  },
  socialLabel: {
    fontSize: 12,
    color: "#666",
  },
});

export default Profile;

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { AnyAction } from "@reduxjs/toolkit";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import Colors from "../../components/Colors";
import TextComponent from "../../components/TextComponent";
import { getDailyDharmaTracker } from "../../screens/Home/actions";
import store, { RootState } from "../../store";
import BottomMenu from "./BottomMenu";

const Drawer = createDrawerNavigator();
const { width } = Dimensions.get("window");

export default function AppDrawerNavigator() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Drawer.Navigator
        id="MainDrawer"
        screenOptions={{
          headerShown: false,
          drawerType: "slide",
          drawerPosition: "right",
          drawerStyle: {
            width: width * 0.55,
            backgroundColor: "#fff",
            overflow: "hidden",
          },
        }}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen
          name="HomePage"
          component={BottomMenu}
          options={{ drawerItemStyle: { display: "none" } }}
        />
      </Drawer.Navigator>
    </SafeAreaView>
  );
}

const CustomDrawerContent = (props) => {
  const { t } = useTranslation();
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();


  const user = useSelector((state: RootState) => state.login?.user || state.socialLoginReducer?.user);
  const [isLoggedIn, setIsLoggedIn] = React.useState(!!user);
  const [trackerData, setTrackerData] = React.useState(null);  // ✅ ADD THIS

  // -----------------------------
  // ✅ FETCH DAILY DHARMA TRACKER HERE
  // -----------------------------
  React.useEffect(() => {
    dispatch(
      getDailyDharmaTracker((res) => {
        if (res.success) {
          setTrackerData(res.data);
        } else {
          console.log("❌ Failed to load tracker:", res.error);
        }
      })
    );
  }, [dispatch]);

  React.useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  React.useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("access_token");
      if (token && !isLoggedIn) {
        setIsLoggedIn(true);
      }
    };
    checkLogin();
  }, [isLoggedIn]);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    store.dispatch({ type: "RESET_APP" });

    await GoogleSignin.signOut();
    await GoogleSignin.revokeAccess();

    const parentNav = props.navigation.getParent();
    parentNav?.reset({
      index: 0,
      routes: [{ name: "Welcome" }],
    });
  };

  const handleLogin = () => {
    props.navigation.closeDrawer();
    props.navigation.navigate("Login");
  };

  //   const categories = [
  //     {
  //       id: "1",
  //     name:  trackerData?.active_practices?.length > 0 ? t("categories.sadana"): t("categories.dharma"),
  //     title: trackerData?.active_practices?.length > 0 ? "SadanaTrackerScreen" : "Dharma",
  //       icon: require("../../../assets/Group.png"),
  //     },
  //     {
  //       id: "2",
  //       name: t("categories.explore"),
  //       title: "Explore",
  //       icon: require("../../../assets/Exploreicon.png"),
  //     },
  //     // {
  //     //   id: "3",
  //     //   name: t("categories.travel"),
  //     //   title: "Travel",
  //     //   icon: require("../../../assets/darma.png"),
  //     // },
  //     // {
  //     //   id: "4",
  //     //   name: t("categories.pooja"),
  //     //   title: "Pooja",
  //     //   icon: require("../../../assets/pooja.png"),
  //     // },
  //     // {
  //     //   id: "5",
  //     //   name: t("categories.retreat"),
  //     //   title: "Retreat",
  //     //   icon: require("../../../assets/yoga.png"),
  //     // },
  //     {
  //       id: "6",
  //       name: t("categories.classes"),
  //       title: "ClassesScreen",
  //       icon: require("../../../assets/onlinecion.png"),
  //     },
  // {
  //   id: "7",
  //   name: t("tabs.profile"),
  //   title: "Profile",
  //   icon: "person-outline",
  //   activeIcon: "person"
  // },

  //   ];

  const categories = [
    {
      id: "1",
      name: t("drawer.myRoutine"),
      title: trackerData?.active_practices?.length > 0 ? "TrackerTabs" : "DailyPracticeLogin",
      iconType: "image",
      icon: require("../../../assets/Group.png"),
    },
    {
      id: "2",
      name: t("categories.explore"),
      title: "Explore",
      iconType: "image",
      icon: require("../../../assets/Exploreicon.png"),
    },
    {
      id: "3",
      name: t("drawer.community"),
      title: "CommunityLanding",
      iconType: "vector",
      icon: "people-outline",
      activeIcon: "people",
    },
    {
      id: "6",
      name: t("categories.classes"),
      title: "ClassesScreen",
      iconType: "image",
      icon: require("../../../assets/onlinecion.png"),
    },
    {
      id: "7",
      name: t("tabs.profile"),
      title: "Profile",
      iconType: "vector",
      icon: "person-outline",
      activeIcon: "person-outline",
    },
  ];


  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={{ flexDirection: "row", alignItems: "center", padding: 12 }}
      onPress={() => {

        if (item.title === "Profile") {
          props.navigation.navigate("HomePage", {
            screen: "Profile",
          });
        } else {
          props.navigation.navigate("HomePage", {
            screen: "HomePage",
            params: { screen: item.title },
          });
        }

        props.navigation.closeDrawer();
      }}
    >

      {/* 🔥 Handle VECTOR icon */}
      {item.iconType === "vector" && (
        <Ionicons
          name={item.icon}
          size={22}
          color="#CA8A04"
          style={{ marginRight: 15 }}
        />
      )}

      {/* 🔥 Handle PNG IMAGE icon */}
      {item.iconType === "image" && (
        <Image
          source={item.icon}
          style={{ width: 24, height: 24, marginRight: 15 }}
        />
      )}

      <TextComponent type="headerText" allowFontScaling={false} style={{}}>
        {item.name}
      </TextComponent>
    </TouchableOpacity>
  );


  return (
    <View style={{ flex: 1, paddingHorizontal: 10 }}>
      {/* Close button */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          marginBottom: 20,
        }}
      >
        <TouchableOpacity onPress={() => props.navigation.closeDrawer()}>
          <Ionicons name="close" size={28} color="#CA8A04" />
        </TouchableOpacity>
      </View>

      {/* Drawer items */}
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />

      {/* LOGIN / LOGOUT SWITCH */}
      <View
        style={{
          borderTopWidth: 1,
          borderColor: "#eee",
          marginTop: 20,
          paddingTop: 15,
          alignItems: "center",
        }}
      >
        {isLoggedIn ? (
          // LOGOUT
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, marginBottom: 10 }}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={22} color="red" />
            <TextComponent type="headerText"
              allowFontScaling={false}
              style={{ marginLeft: 10, color: "red" }}
            >
              {t("drawer.logout")}
            </TextComponent>
          </TouchableOpacity>
        ) : (
          // LOGIN
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}
            onPress={handleLogin}
          >
            <Ionicons name="log-in-outline" size={22} color="#000" />
            <TextComponent type="headerText"
              allowFontScaling={false}
              style={{ marginLeft: 10 }}
            >
              {t("drawer.login")}
            </TextComponent>
          </TouchableOpacity>
        )}
      </View>

      {/* Footer */}
      <View
        style={{
          marginTop: "auto",
          borderTopWidth: 1,
          borderColor: "#eee",
          paddingVertical: 15,
        }}
      >
        <View style={{ marginBottom: 20, alignItems: "center", backgroundColor: Colors.Colors.white }}>
          <View style={{ flexDirection: "row", gap: 25, alignItems: "center" }}>
            <TextComponent
              type="streakSadanaText"
              style={{ color: "#000" }}
            >
              {t("drawer.followUs")}
            </TextComponent>

            {/* Facebook */}
            <TouchableOpacity
              onPress={() => {
                props.navigation.closeDrawer();
                Linking.openURL("https://www.facebook.com/KalpxOfficial/")
              }}
            >
              <Ionicons name="logo-facebook" size={34} color="#4267B2" />
            </TouchableOpacity>

            {/* Instagram */}
            <TouchableOpacity
              onPress={() => {
                props.navigation.closeDrawer();
                Linking.openURL("https://www.instagram.com/kalpxofficial")
              }}
            >
              <Ionicons name="logo-instagram" size={34} color="#C13584" />
            </TouchableOpacity>
          </View>
        </View>
        <TextComponent type="streakText"
          allowFontScaling={false}
          style={{ textAlign: "center", color: "#999", fontSize: 12 }}
        >
          {t("drawer.allRightsReserved")}
        </TextComponent>
      </View>
    </View>
  );
};
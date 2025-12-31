import AsyncStorage from "@react-native-async-storage/async-storage";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useFocusEffect, useNavigation, useNavigationState, useRoute } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import Header from "../../components/Header";
import { RootState } from "../../store";
import { getDailyDharmaTracker } from "../Home/actions";
import TrackerEdit from "./TrackerEdit";
import TrackerProgress from "./TrackerProgress";
import TrackerScreen from "./TrackerScreen";

const Tab: any = createMaterialTopTabNavigator();

const TopTabsNavigator = () => {
  const navigation: any = useNavigation();
  const route: any = useRoute();   // ⭐ added
  const navState = useNavigationState((state) => state);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [trackerData, setTrackerData] = useState(null);

  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  /** ⭐ STEP 1 — GET SCREEN FROM LOGIN */
  const initialTab = route?.params?.screen || "Tracker"; // ⭐ default always Tracker

  /** CHECK LOGIN */
  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("access_token");
      setIsLoggedIn(!!token);
    };
    checkLogin();
  }, []);

  /** FETCH TRACKER DATA */
  /** CHECK LOGIN */
  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("access_token");
      setIsLoggedIn(!!token);
    };
    checkLogin();
  }, []);

  /** 🔥 REFETCH TRACKER DATA WHENEVER SCREEN IS FOCUSED */
  useFocusEffect(
    React.useCallback(() => {
      dispatch(
        getDailyDharmaTracker((res) => {
          if (res.success) {
            setTrackerData(res.data);
          }
        })
      );
    }, [])
  );


  /** CONDITIONS */
  // const hasActivePractices =
  //   trackerData?.active_practices?.length > 0 ? true : false;

  const hasActivePractices =
    trackerData === null
      ? true   // ⛔️ assume allowed until data arrives
      : trackerData.active_practices?.length > 0;


  const shouldRestrictTabs = (!isLoggedIn || !hasActivePractices) && !route?.params?.fromSetup;

  useEffect(() => {
    if (!trackerData) return; // ⛔️ WAIT

    if (!navState || navState.routes.length === 0) return;

    const currentScreen = navState.routes[navState.index]?.name;

    if (
      shouldRestrictTabs &&
      (currentScreen === "Tracker" || currentScreen === "Stats")
    ) {
      navigation.navigate("History");
    }
  }, [shouldRestrictTabs, navState, trackerData]);


  // /** 🔥 AUTO-REDIRECT IF USER TRIES TO OPEN BLOCKED TABS */
  // useEffect(() => {
  //   if (!navState || navState.routes.length === 0) return;

  //   const currentScreen = navState.routes[navState.index]?.name;

  //   if (
  //     shouldRestrictTabs &&
  //     (currentScreen === "Tracker" || currentScreen === "Stats")
  //   ) {
  //     navigation.navigate("History");
  //   }
  // }, [shouldRestrictTabs, navState]);

  return (
    <View style={styles.container}>
      <Header />

      <Tab.Navigator
        key={shouldRestrictTabs ? "restricted" : "full"}

        /** ⭐ STEP 2 — APPLY INITIAL TAB LOGIC */
        initialRouteName={shouldRestrictTabs ? "History" : initialTab}

        screenOptions={({ route }) => {
          const isRestricted =
            (route.name === "Tracker" || route.name === "Stats") &&
            shouldRestrictTabs;

          return {
            swipeEnabled: !shouldRestrictTabs,
            tabBarActiveTintColor: isRestricted ? "#A9A9A9" : "#D4A017",
            tabBarInactiveTintColor: "#000000",
            tabBarIndicatorStyle: {
              backgroundColor: isRestricted ? "transparent" : "#D4A017",
              height: 3,
            },
            tabBarLabelStyle: { fontSize: 16, fontWeight: "600" },
            tabBarStyle: { backgroundColor: "#FFFFFF" },
            tabBarPress: (e) => {
              if (isRestricted) e.preventDefault();
            },
          };
        }}
      >
        {shouldRestrictTabs ? (
          <Tab.Screen
            name="History"
            component={TrackerEdit}
            initialParams={route.params}
            options={{ title: "Edit Routine" }}
            key={route?.params?.resumeData ? "history-restore" : "history-normal"}
          />
        ) : (
          <>
            <Tab.Screen
              name="Tracker"
              component={TrackerScreen}
              options={{ title: "My Routine" }}
            />
            <Tab.Screen
              name="Stats"
              component={TrackerProgress}
              options={{ title: "Progress" }}
            />
            <Tab.Screen
              name="History"
              initialParams={route.params}
              component={TrackerEdit}
              options={{ title: "Edit Routine" }}
              key={route?.params?.resumeData ? "history-restore" : "history-normal"}
            />
          </>
        )}
      </Tab.Navigator>
    </View>
  );
};

export default TopTabsNavigator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
});








// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
// import { useNavigation, useNavigationState } from "@react-navigation/native";
// import React, { useEffect, useState } from "react";
// import { StyleSheet, View } from "react-native";
// import { useDispatch } from "react-redux";

// import { AnyAction } from "@reduxjs/toolkit";
// import { ThunkDispatch } from "redux-thunk";
// import Header from "../../components/Header";
// import { RootState } from "../../store";
// import { getDailyDharmaTracker } from "../Home/actions";
// import TrackerEdit from "./TrackerEdit";
// import TrackerProgress from "./TrackerProgress";
// import TrackerScreen from "./TrackerScreen";

// const Tab: any = createMaterialTopTabNavigator();

// const TopTabsWithHeaderScreen = () => {
//   const navigation: any = useNavigation();
//   const navState = useNavigationState(state => state);

//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [trackerData, setTrackerData] = useState(null);

//   const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

//   /** CHECK LOGIN */
//   useEffect(() => {
//     const checkLogin = async () => {
//       const token = await AsyncStorage.getItem("access_token");
//       setIsLoggedIn(!!token);
//     };
//     checkLogin();
//   }, []);

//   /** FETCH TRACKER DATA */
//   useEffect(() => {
//     dispatch(
//       getDailyDharmaTracker((res) => {
//         if (res.success) {
//           setTrackerData(res.data);
//           console.log("Tracker Data ::::", res.data);
//         }
//       })
//     );
//   }, [dispatch]);

//   /** CONDITION */
//   const hasActivePractices =
//     trackerData?.active_practices?.length > 0 ? true : false;

//   const shouldRestrictTabs = !isLoggedIn || !hasActivePractices;

//   /** 🔥 AUTO-REDIRECT IF APP TRIES TO OPEN RESTRICTED TABS */
//   useEffect(() => {
//     if (!navState || navState.routes.length === 0) return;

//     const currentScreen = navState.routes[navState.index]?.name;

//     if (
//       shouldRestrictTabs &&
//       (currentScreen === "Tracker" || currentScreen === "Stats")
//     ) {
//       // Force redirect
//       navigation.navigate("History");
//     }
//   }, [shouldRestrictTabs, navState]);

// return (
//   <View style={styles.container}>
//     <Header />

//     <Tab.Navigator
//       key={shouldRestrictTabs ? "restricted" : "full-tabs"}   // 🔥 Force complete reset
//       screenOptions={({ route }) => {
//         const isRestricted =
//           (route.name === "Tracker" || route.name === "Stats") &&
//           shouldRestrictTabs;

//         return {
//           swipeEnabled: !shouldRestrictTabs,
//           tabBarActiveTintColor: isRestricted ? "#A9A9A9" : "#D4A017",
//           tabBarInactiveTintColor: "#A9A9A9",
//           tabBarIndicatorStyle: {
//             backgroundColor: isRestricted ? "transparent" : "#D4A017",
//             height: 3,
//           },
//           tabBarLabelStyle: { fontSize: 16, fontWeight: "600" },
//           tabBarStyle: { backgroundColor: "#FFFFFF" },
//           tabBarPress: (e) => {
//             if (isRestricted) {
//               e.preventDefault();
//             }
//           },
//         };
//       }}
//     >
//       {shouldRestrictTabs ? (
//         <>
//           <Tab.Screen
//             name="History"
//             component={TrackerEdit}
//             options={{ title: "Edit Routine" }}
//           />
//         </>
//       ) : (
//         <>
//           <Tab.Screen
//             name="Tracker"
//             component={TrackerScreen}
//             options={{ title: "My Routine" }}
//           />
//           <Tab.Screen
//             name="Stats"
//             component={TrackerProgress}
//             options={{ title: "Progress" }}
//           />
//           <Tab.Screen
//             name="History"
//             component={TrackerEdit}
//             options={{ title: "Edit Routine" }}
//           />
//         </>
//       )}
//     </Tab.Navigator>
//   </View>
// );


// };

// export default TopTabsWithHeaderScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FFF",
//   },
// });
import React from "react";
import { StyleSheet, View } from "react-native";

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Header from "../../components/Header";
import TrackerEdit from "./TrackerEdit";
import TrackerProgress from "./TrackerProgress";
import TrackerScreen from "./TrackerScreen";

const Tab: any = createMaterialTopTabNavigator();

const TopTabsWithHeaderScreen = () => {
  return (
    <View style={styles.container}>
      {/* 🔥 HEADER ON TOP */}
      <Header />

      {/* 🔥 TOP TABS */}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#D4A017",
          tabBarInactiveTintColor: "#000000",
          tabBarIndicatorStyle: { backgroundColor: "#D4A017", height: 3 },
          tabBarLabelStyle: { fontSize: 16, fontWeight: "600" },
          tabBarStyle: { backgroundColor: "#FFFFFF" },
        }}
      >
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
          component={TrackerEdit}
          options={{ title: "Edit Routine" }}
        />
      </Tab.Navigator>
    </View>
  );
};

export default TopTabsWithHeaderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
});

import React from "react";
import { TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";

import Home from "../screens/Home";
import Explore from "../screens/Explore";
import Search from "../screens/Search";
import Profile from "../screens/Profile";

const Tab = createBottomTabNavigator();

export default function BottomMenu() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFF", // White background
          borderTopWidth: 0.5,        // Thin border line
          borderTopColor: "#d1d1d1",  // Light gray line
          elevation: 0,               // Removes Android shadow
          shadowOpacity: 0,           // Removes iOS shadow
          height: 60,
        },
        tabBarActiveTintColor: "#8d5524", // Brown (active)
        tabBarInactiveTintColor: "#000", // Black (inactive)
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
        tabBarButton: (props) => (
          <TouchableOpacity {...props} activeOpacity={0.7} />
        ),
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Icon name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={Explore}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? "play-circle" : "play-circle-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={Search}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? "search" : "search-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

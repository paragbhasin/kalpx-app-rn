import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

import FontSize from "../../components/FontSize";
import { HomeStackNavigator, NotificationStackNavigator, ProfileStackNavigator } from "../StackNavigator";

const Tab = createBottomTabNavigator();

const BottomMenu = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          // includeFontPadding: false,
          backgroundColor: "#FFF",
          borderTopWidth: 0.5,
          borderTopColor: "#d1d1d1",
          elevation: 0,
          shadowOpacity: 0,
             height: FontSize.CONSTS.DEVICE_HEIGHT * 0.07,
               paddingBottom: Platform.OS === 'ios' ? 10 : 6
        },
        tabBarActiveTintColor: "#8d5524",
        tabBarInactiveTintColor: "#000",
          tabBarAllowFontScaling: false,

        tabBarLabelStyle: {
          fontSize: 12,
          // marginBottom: 5,
        },
        tabBarButton: (props) => (
          <TouchableOpacity {...props} activeOpacity={0.7} />
        ),
      }}
    >
      <Tab.Screen
        name="HomePage"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: t("tabs.home"),
          tabBarIcon: ({ color, focused }) => (
            <Icon name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
        listeners={({ navigation, route }) => ({
          tabPress: e => {
            // Prevent default action
            e.preventDefault();

            // Reset the stack of the current tab to its initial route
            // navigation.dispatch(
            //   StackActions.popToTop()
            // );

            // Navigate to the tab
            navigation.navigate("AppDrawer", {
            screen: "HomePage", // bottom tab
            params: {
              screen: "HomePage", // tab screen containing HomeStack
              params: {
                screen: "Home"
              },
            },
          });
          },
        })}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationStackNavigator}
        options={{
          tabBarLabel: t("tabs.notifications"),
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? "notifications" : "notifications-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: t("tabs.profile"),
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Menu"
        component={() => null} // dummy screen
        listeners={{
          tabPress: (e) => {
            e.preventDefault(); // stop navigation
            navigation.dispatch(DrawerActions.openDrawer()); // open drawer
          },
        }}
        options={{
          tabBarLabel:  t("tabs.Menu"),
          tabBarIcon: ({ color, focused }) => (
            <Icon name="menu" size={28} color={color} />
            // <Icon
            //   name={focused ? "search" : "search-outline"}
            //   size={24}
            //   color={color}
            // />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomMenu;

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  StackActions,
  DrawerActions,
  getFocusedRouteNameFromRoute,
  useNavigation,
} from "@react-navigation/native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { Ionicons as Icon } from "@expo/vector-icons";

import FontSize from "../../components/FontSize";
import GlobalScrollLayout from "../../components/GlobalScrollLayout";
import { ScrollProvider, useScrollContext } from "../../context/ScrollContext";
import { useScreenStore } from "../../engine/useScreenBridge";
import {
  HomeStackNavigator,
  NotificationStackNavigator,
  ProfileStackNavigator,
} from "../StackNavigator";
import { isMitraRouteName } from "./mitraRouteNames";

const Tab = createBottomTabNavigator();

const DEFAULT_SURFACE = "#FAF7F2";
const NullComponent = () => null;
const TabBarButton = (props) => <TouchableOpacity {...props} activeOpacity={0.7} />;

const BottomMenuContent = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { isVisible } = useScrollContext();
  const currentBackground = useScreenStore((state) => state.currentBackground);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const tabIconSize = isTablet ? 30 : 24;
  const tabBarHeight = isTablet ? 80 : FontSize.CONSTS.DEVICE_HEIGHT * 0.07;

  return (
    <GlobalScrollLayout>
      <Tab.Navigator
        sceneContainerStyle={{ backgroundColor: "transparent" }}
        screenOptions={({ route }) => {
          const nestedRouteName =
            route.name === "HomePage"
              ? getFocusedRouteNameFromRoute(route) || "Home"
              : route.name;
          const isMitraSurface = isMitraRouteName(nestedRouteName);
          const shouldUseTransparentTabBar = isMitraSurface;
          const shouldUseDefaultSurface =
            !shouldUseTransparentTabBar && !currentBackground;

          return {
            headerShown: false,
            // Hide the tab bar while the keyboard is open so it doesn't sit
            // between the content and the keyboard, pushing inputs (e.g. the
            // Tell Mitra composer) underneath it.
            tabBarHideOnKeyboard: true,
            tabBarStyle: {
              display: isVisible ? "flex" : "none",
              backgroundColor: shouldUseTransparentTabBar
                ? "transparent"
                : shouldUseDefaultSurface
                  ? DEFAULT_SURFACE
                  : "#FFF",
              borderTopWidth: shouldUseTransparentTabBar
                ? 0
                : 0.5,
              borderTopColor: shouldUseTransparentTabBar
                ? "transparent"
                : "#d1d1d1",
              elevation: 0,
              shadowOpacity: 0,
              shadowColor: "transparent",
              height: tabBarHeight,
              paddingBottom: Platform.OS === "ios" ? 10 : 6,
              position: "relative",
            },
            tabBarBackground: () => null,
            tabBarActiveTintColor: "#8d5524",
            tabBarInactiveTintColor: "#000",
            tabBarAllowFontScaling: false,
            tabBarLabelStyle: {
              fontSize: isTablet ? 15 : 12,
            },
            tabBarButton: TabBarButton,
          };
        }}
      >
        <Tab.Screen
          name="HomePage"
          component={HomeStackNavigator}
          options={{
            tabBarLabel: t("tabs.home"),
            tabBarIcon: ({ color, focused }) => (
              <Icon
                name={focused ? "home" : "home-outline"}
                size={tabIconSize}
                color={color}
              />
            ),
          }}
          listeners={({ navigation, route }) => ({
            tabPress: (e) => {
              e.preventDefault();
              const homeStackKey = route.state?.key;
              if (homeStackKey) {
                navigation.dispatch({
                  ...StackActions.popToTop(),
                  target: homeStackKey,
                });
              }
              navigation.navigate("HomePage", {
                screen: "Home",
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
                size={tabIconSize}
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
                size={tabIconSize}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Menu"
          component={NullComponent}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              navigation.dispatch(DrawerActions.openDrawer());
            },
          }}
          options={{
            tabBarLabel: t("tabs.Menu"),
            tabBarIcon: ({ color, focused }) => (
              <Icon name="menu" size={tabIconSize} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </GlobalScrollLayout>
  );
};

const styles = StyleSheet.create({});

const BottomMenu = () => {
  return (
    <ScrollProvider>
      <BottomMenuContent />
    </ScrollProvider>
  );
};

export default BottomMenu;

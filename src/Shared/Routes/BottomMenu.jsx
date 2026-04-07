import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

import FontSize from "../../components/FontSize";
import GlobalScrollLayout from "../../components/GlobalScrollLayout";
import { ScrollProvider, useScrollContext } from "../../context/ScrollContext";
import {
  HomeStackNavigator,
  NotificationStackNavigator,
  ProfileStackNavigator,
} from "../StackNavigator";

const Tab = createBottomTabNavigator();
import { useScreenStore } from "../../engine/useScreenBridge";

const BottomMenuContent = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { isVisible } = useScrollContext();
  const currentBackground = useScreenStore((state) => state.currentBackground);

  return (
    <GlobalScrollLayout>
      <Tab.Navigator
        sceneContainerStyle={{ backgroundColor: "transparent" }}
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            display: isVisible ? "flex" : "none",
            backgroundColor: currentBackground ? "transparent" : "#FFF",
            borderTopWidth: currentBackground ? 0 : 0.5,
            borderTopColor: "#d1d1d1",
            elevation: 0,
            shadowOpacity: 0,
            height: FontSize.CONSTS.DEVICE_HEIGHT * 0.07,
            paddingBottom: Platform.OS === "ios" ? 10 : 6,
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
              <Icon
                name={focused ? "home" : "home-outline"}
                size={24}
                color={color}
              />
            ),
          }}
          listeners={({ navigation, route }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate("AppDrawer", {
                screen: "HomePage",
                params: {
                  screen: "HomePage",
                  params: {
                    screen: "Home",
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
          component={() => null}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              navigation.dispatch(DrawerActions.openDrawer());
            },
          }}
          options={{
            tabBarLabel: t("tabs.Menu"),
            tabBarIcon: ({ color, focused }) => (
              <Icon name="menu" size={24} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </GlobalScrollLayout>
  );
};

const BottomMenu = () => {
  return (
    <ScrollProvider>
      <BottomMenuContent />
    </ScrollProvider>
  );
};

export default BottomMenu;

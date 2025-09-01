import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

// Import Screens
import WelcomeScreen from "./src/screens/WelcomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/SignupScreen";
import BottomMenu from "./src/components/BottomMenu";
import TravelPlannerScreen from "./src/screens/TravelPlannerScreen";
import Sankalp from "./src/screens/Sankalp";
import PoojaScreen from "./src/screens/PoojaScreen"
import RetreatsScreen from "./src/screens/RetreatsScreen"
import Language from "./src/screens/Language";
import Explore from "./src/screens/Explore";
import "./src/config/i18n"

const Stack = createNativeStackNavigator();

// 👇 Keep splash visible while fonts load
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, error] = useFonts({
    GelicaRegular: require("./assets/fonts/gelica-regular.otf"),
    GelicaLight: require("./assets/fonts/gelica-light.otf"),
    GelicaMedium: require("./assets/fonts/gelica-medium.otf"),
    GelicaBold: require("./assets/fonts/gelica-bold.otf"),
  });

  useEffect(() => {
    if (fontsLoaded || error) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) {
    // Splash screen will stay visible until fonts are ready
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Travel"
          component={TravelPlannerScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Sankalp"
          component={Sankalp}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HomePage"
          component={BottomMenu}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Pooja"
          component={PoojaScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Retreat"
          component={RetreatsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Language"
          component={Language}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Explore"
          component={Explore}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

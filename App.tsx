import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { MenuProvider } from "react-native-popup-menu";
import { Provider, useDispatch, useSelector } from "react-redux";
import SnackBar from "./src/components/SnackBar";
import "./src/config/i18n";
import { navigationRef } from "./src/Shared/Routes/NavigationService";
import Routes from "./src/Shared/Routes/Routes";
import { store } from "./src/store";
import { hideSnackBar } from "./src/store/snackBarSlice";

// Prevent splash from auto-hiding
SplashScreen.preventAutoHideAsync();

function SnackBarContainer() {
  const dispatch = useDispatch();
  const { visible, message } = useSelector((state: any) => state.snackBar);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (visible) {
      timer = setTimeout(() => dispatch(hideSnackBar()), 3000);
    }
    return () => clearTimeout(timer);
  }, [visible, dispatch]);

  return <SnackBar visible={visible} message={message} />;
}

export default function App() {
  const [fontsLoaded, error] = useFonts({
    GelicaRegular: require("./assets/fonts/gelica-regular.otf"),
    GelicaLight: require("./assets/fonts/gelica-light.otf"),
    GelicaMedium: require("./assets/fonts/gelica-medium.otf"),
    GelicaBold: require("./assets/fonts/gelica-bold.otf"),
  });

  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Wait for fonts first
        if (!fontsLoaded && !error) return;

        // Retrieve tokens
        const accessToken = await AsyncStorage.getItem("access_token");
        const refreshToken = await AsyncStorage.getItem("refresh_token");

        console.log("🔥 Startup Tokens:", { accessToken, refreshToken });

        // Decide the route
        if (accessToken && refreshToken) {
          setInitialRoute("AppDrawer");
        } else {
          setInitialRoute("Welcome");
        }

        // Small delay ensures NavigationContainer initializes properly
        await new Promise((res) => setTimeout(res, 300));
      } catch (err) {
        console.log("Error checking tokens:", err);
        setInitialRoute("Welcome");
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    init();
  }, [fontsLoaded, error]);

  // Wait until both fonts + token check complete
  if (!fontsLoaded || initialRoute === null) {
    return null;
  }

  return (
    <MenuProvider>
      <Provider store={store}>
        <NavigationContainer ref={navigationRef}>
          <Routes initialRouteName={initialRoute} />
          <SnackBarContainer />
        </NavigationContainer>
      </Provider>
    </MenuProvider>
  );
}

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { MenuProvider } from "react-native-popup-menu";
import { Provider, useDispatch, useSelector } from 'react-redux';
import SnackBar from './src/components/SnackBar';
import { store } from './src/store';
import { hideSnackBar } from './src/store/snackBarSlice';

// Import Screens
import BottomMenu from "./src/components/BottomMenu";
import "./src/config/i18n";
import ClassBookingScreen from './src/screens/Classes/ClassBookingScreen';
import ClassesScreen from "./src/screens/Classes/classesScreen";
import ClassPaymentScreen from './src/screens/Classes/ClassPaymentScreen';
import ClassRescheduleScreen from './src/screens/Classes/ClassRescheduleScreen';
import ClassTutorDetailsScreen from './src/screens/Classes/ClassTutorDetailsScreen';
import Explore from "./src/screens/Explore";
import ForgotPassword from "./src/screens/ForgotPassword/ForgotPassword";
import SetNewPasswordScreen from "./src/screens/ForgotPassword/SetNewPasswordScreen";
import VerificationScreen from "./src/screens/ForgotPassword/VerificationScreen";
import PoojaScreen from "./src/screens/Home/PoojaScreen";
import RetreatsScreen from "./src/screens/Home/RetreatsScreen";
import TravelPlannerScreen from "./src/screens/Home/TravelPlannerScreen";
import Language from "./src/screens/Language";
import LoginScreen from "./src/screens/Login/LoginScreen";
import OnlineclassesScreen from "./src/screens/OnlineclassesScreen";
import Sankalp from "./src/screens/Sankalp";
import SignupScreen from "./src/screens/Signup/SignupScreen";
import LandingScreen from "./src/screens/WelcomeScreen/LandingScreen";
import WelcomeScreen from "./src/screens/WelcomeScreen/WelcomeScreen";



const Stack = createNativeStackNavigator();

// 👇 Keep splash visible while fonts load
SplashScreen.preventAutoHideAsync();

function SnackBarContainer() {
  const dispatch = useDispatch();
  const { visible, message } = useSelector(state => state.snackBar);
  useEffect(() => {
    let timer;
    if (visible) {
      timer = setTimeout(() => {
        dispatch(hideSnackBar());
      }, 3000);
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

  useEffect(() => {
    if (fontsLoaded || error) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (__DEV__) {
    require("./ReactotronConfig");
  }

  if (!fontsLoaded && !error) {
    // Splash screen will stay visible until fonts are ready
    return null;
  }

  return (
        <MenuProvider>
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome">
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="LandingScreen" component={LandingScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
          <Stack.Screen name="VerificationScreen" component={VerificationScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SetNewPasswordScreen" component={SetNewPasswordScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Travel" component={TravelPlannerScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Sankalp" component={Sankalp} options={{ headerShown: false }} />
          <Stack.Screen name="HomePage" component={BottomMenu} options={{ headerShown: false }} />
          <Stack.Screen name="Pooja" component={PoojaScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Retreat" component={RetreatsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Language" component={Language} options={{ headerShown: false }} />
          <Stack.Screen name="Explore" component={Explore} options={{ headerShown: false }} />
          <Stack.Screen name="Classes" component={OnlineclassesScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ClassesScreen" component={ClassesScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ClassTutorDetailsScreen" component={ClassTutorDetailsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ClassBookingScreen" component={ClassBookingScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ClassPaymentScreen" component={ClassPaymentScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ClassRescheduleScreen" component={ClassRescheduleScreen} options={{ headerShown: false }} />          
        </Stack.Navigator>
        <SnackBarContainer />
      </NavigationContainer>
    </Provider>
    </MenuProvider>
  );
}

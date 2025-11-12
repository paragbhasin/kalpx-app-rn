import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import ClassBookingScreen from "../../screens/Classes/ClassBookingScreen";
import ClassesScreen from "../../screens/Classes/classesScreen";
import ClassPaymentScreen from "../../screens/Classes/ClassPaymentScreen";
import ClassRescheduleScreen from "../../screens/Classes/ClassRescheduleScreen";
import ClassTutorDetailsScreen from "../../screens/Classes/ClassTutorDetailsScreen";
import ForgotPassword from "../../screens/ForgotPassword/ForgotPassword";
import SetNewPasswordScreen from "../../screens/ForgotPassword/SetNewPasswordScreen";
import VerificationScreen from "../../screens/ForgotPassword/VerificationScreen";
import Dharma from "../../screens/Home/DailyDharma";
import Explore from "../../screens/Home/Explore";
import Home from "../../screens/Home/Home";
import LearnMore from "../../screens/Home/LearnMore";
import MySadana from "../../screens/Home/MySadana";
import PoojaScreen from "../../screens/Home/PoojaScreen";
import RelatedVideosScreen from "../../screens/Home/RelatedVideosScreen";
import RetreatsScreen from "../../screens/Home/RetreatsScreen";
import SadanaTrackerScreen from "../../screens/Home/SadanaTrackerScreen";
import SubmitMantraScreen from "../../screens/Home/SubmitMantraScreen";
import TravelPlannerScreen from "../../screens/Home/TravelPlannerScreen";
import LoginScreen from "../../screens/Login/LoginScreen";
import OnlineclassesScreen from "../../screens/OnlineclassesScreen";
import Language from "../../screens/Profile/Language";
import Privacy from "../../screens/Profile/Privacy";
import ProfileDetails from "../../screens/Profile/ProfileDetails";
import Sankalp from "../../screens/Sankalp";
import SignupScreen from "../../screens/Signup/SignupScreen";
import StreakScreen from "../../screens/Streak/StreakScreen";
import LandingScreen from "../../screens/WelcomeScreen/LandingScreen";
import WelcomeScreen from "../../screens/WelcomeScreen/WelcomeScreen";
import BottomMenu from "./BottomMenu";
import AppDrawerNavigator from "./DrawerNavigator";

const Stack: any = createNativeStackNavigator();

const Routes = ({ initialRouteName = "Welcome" }) => {
  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="LandingScreen" component={LandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="VerificationScreen" component={VerificationScreen} />
      <Stack.Screen name="SetNewPasswordScreen" component={SetNewPasswordScreen} />
      <Stack.Screen name="HomePage" component={BottomMenu} />
    <Stack.Screen name="Home" component={Home}/>
      <Stack.Screen name="Travel" component={TravelPlannerScreen} />
      <Stack.Screen name="Pooja" component={PoojaScreen} />
      <Stack.Screen name="Retreat" component={RetreatsScreen} />
      <Stack.Screen name="Language" component={Language} />
      <Stack.Screen name="Explore" component={Explore} />
      <Stack.Screen name="Sankalp" component={Sankalp} />
      <Stack.Screen name="StreakScreen" component={StreakScreen} />
      <Stack.Screen name="Classes" component={OnlineclassesScreen} />
      <Stack.Screen name="ClassesScreen" component={ClassesScreen} />
      <Stack.Screen name="ClassTutorDetailsScreen" component={ClassTutorDetailsScreen} />
      <Stack.Screen name="ClassBookingScreen" component={ClassBookingScreen} />
      <Stack.Screen name="ClassPaymentScreen" component={ClassPaymentScreen} />
      <Stack.Screen name="ClassRescheduleScreen" component={ClassRescheduleScreen} />
      <Stack.Screen name="AppDrawer" component={AppDrawerNavigator} />
      <Stack.Screen name="MySadana" component={MySadana} />
      <Stack.Screen name="SubmitMantraScreen" component={SubmitMantraScreen} />
      <Stack.Screen name="SadanaTrackerScreen" component={SadanaTrackerScreen} />
      <Stack.Screen name="Dharma" component={Dharma} />
      <Stack.Screen name="ProfileDetails" component={ProfileDetails} />
      <Stack.Screen name="LearnMore" component={LearnMore} />
      <Stack.Screen name="RelatedVideosScreen" component={RelatedVideosScreen} />
      <Stack.Screen name="Privacy" component={Privacy} />
    </Stack.Navigator>
  );
};

export default Routes;

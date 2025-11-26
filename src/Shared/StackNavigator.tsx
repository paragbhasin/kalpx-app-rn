import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import ClassBookingScreen from "../screens/Classes/ClassBookingScreen";
import ClassesScreen from "../screens/Classes/classesScreen";
import ClassPaymentScreen from "../screens/Classes/ClassPaymentScreen";
import ClassRescheduleScreen from "../screens/Classes/ClassRescheduleScreen";
import ClassTutorDetailsScreen from "../screens/Classes/ClassTutorDetailsScreen";
import DailyPracticeDetailSelectedPractice from "../screens/DailyPractice/DailyPracticeDetailSelectedPractice";
import DailyPracticeList from "../screens/DailyPractice/DailyPracticeList";
import DailyPracticeSelectList from "../screens/DailyPractice/DailyPracticeSelectList";
import Dharma from "../screens/Home/DailyDharma";
import Explore from "../screens/Home/Explore";
import Home from "../screens/Home/Home";
import LearnMore from "../screens/Home/LearnMore";
import MySadana from "../screens/Home/MySadana";
import PoojaScreen from "../screens/Home/PoojaScreen";
import RelatedVideosScreen from "../screens/Home/RelatedVideosScreen";
import RetreatsScreen from "../screens/Home/RetreatsScreen";
import SadanaTrackerScreen from "../screens/Home/SadanaTrackerScreen";
import SubmitMantraScreen from "../screens/Home/SubmitMantraScreen";
import TravelPlannerScreen from "../screens/Home/TravelPlannerScreen";
import Notifications from "../screens/Notifications/Notifications";
import OnlineclassesScreen from "../screens/OnlineclassesScreen";
import Language from "../screens/Profile/Language";
import Privacy from "../screens/Profile/Privacy";
import Profile from "../screens/Profile/Profile";
import ProfileDetails from "../screens/Profile/ProfileDetails";
import Sankalp from "../screens/Sankalp";
import StreakScreen from "../screens/Streak/StreakScreen";
import TrackerScreen from "../screens/Tracker/TrackerScreen";

const Stack: any = createNativeStackNavigator();

export const HomeStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false}} >
    <Stack.Screen
        name="Home"
        component={Home}
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
        name="Explore"
        component={Explore}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Classes"
        component={OnlineclassesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ClassesScreen"
        component={ClassesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ClassTutorDetailsScreen"
        component={ClassTutorDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ClassBookingScreen"
        component={ClassBookingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ClassPaymentScreen"
        component={ClassPaymentScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ClassRescheduleScreen"
        component={ClassRescheduleScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StreakScreen"
        component={StreakScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="MySadana" component={MySadana}    options={{ headerShown: false }}/>
      <Stack.Screen name="SubmitMantraScreen" component={SubmitMantraScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SadanaTrackerScreen" component={SadanaTrackerScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="Dharma" component={Dharma} options={{ headerShown: false }} />
      <Stack.Screen name="LearnMore" component={LearnMore}  options={{ headerShown: false }}  />
      <Stack.Screen name="RelatedVideosScreen" component={RelatedVideosScreen}   options={{ headerShown: false }} />
      <Stack.Screen name="DailyPracticeList" component={DailyPracticeList}   options={{ headerShown: false }} />
      <Stack.Screen name="DailyPracticeSelectList" component={DailyPracticeSelectList}  options={{ headerShown: false }} />
      <Stack.Screen name="DailyPracticeDetailSelectedPractice" component={DailyPracticeDetailSelectedPractice}  options={{ headerShown: false }} />
      <Stack.Screen name="TrackerScreen" component={TrackerScreen}  options={{ headerShown: false }} />
  </Stack.Navigator>
);

export const NotificationStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Notifications" component={Notifications}  options={{ headerShown: false }}/>
    {/* Add notification screens here */}
  </Stack.Navigator>
);

export const ProfileStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={Profile}  options={{ headerShown: false }}/>
      <Stack.Screen name="ProfileDetails" component={ProfileDetails}  options={{ headerShown: false }}/>
     <Stack.Screen name="Language" component={Language}  options={{ headerShown: false }} />
     <Stack.Screen name="Privacy" component={Privacy}  options={{ headerShown: false }} />
  </Stack.Navigator>
);

export const MenuStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {/* Add menu screens here */}
  </Stack.Navigator>
);

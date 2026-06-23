import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import ScreenRenderer from "../engine/ScreenRenderer";
import ClassBookingScreen from "../screens/Classes/ClassBookingScreen";
import ClassesScreen from "../screens/Classes/classesScreen";
import ClassPaymentScreen from "../screens/Classes/ClassPaymentScreen";
import ClassRescheduleScreen from "../screens/Classes/ClassRescheduleScreen";
import ClassTutorDetailsScreen from "../screens/Classes/ClassTutorDetailsScreen";
import ConfirmDailyPractices from "../screens/DailyPractice/ConfirmDailyPractices";
import ConfirmSanatanPractices from "../screens/DailyPractice/ConfirmSanatanPractices";
import CreateOwnPractice from "../screens/DailyPractice/CreateOwnPractice";
import DailyPracticeDetailSelectedPractice from "../screens/DailyPractice/DailyPracticeDetailSelectedPractice";
import DailyPracticeList from "../screens/DailyPractice/DailyPracticeList";
import DailyPracticeLogin from "../screens/DailyPractice/DailyPracticeLogin";
import DailyPracticeMantra from "../screens/DailyPractice/DailyPracticeMantra";
import DailyPracticeSelectList from "../screens/DailyPractice/DailyPracticeSelectList";
import SanatanPractice from "../screens/DailyPractice/SanatanPractice";
import SubmitDailyPracticesScreen from "../screens/DailyPractice/SubmitDailyPracticesScreen";
import Dharma from "../screens/Home/DailyDharma";
import Explore from "../screens/Home/Explore";
import Home from "../screens/Home/Home";
import LearnMore from "../screens/Home/LearnMore";
import MySadana from "../screens/Home/MySadana";
import PoojaScreen from "../screens/Home/PoojaScreen";
import RelatedVideosScreen from "../screens/Home/RelatedVideosScreen";
import RetreatsScreen from "../components/Retreats/RetreatsScreen";
import RetreatDetailsScreen from "../screens/Home/RetreatDetailsScreen";
import RetreatPackageScreen from "../screens/Home/RetreatPackageScreen";
import RetreatBookingScreen from "../screens/Home/RetreatBookingScreen";
import RetreatBookingDetailsScreen from "../screens/Home/RetreatBookingDetailsScreen";
import RetreatPaymentScreen from "../screens/Home/RetreatPaymentScreen";
import RetreatCancellationScreen from "../screens/Home/RetreatCancellationScreen";
import SadanaTrackerScreen from "../screens/Home/SadanaTrackerScreen";
import SubmitMantraScreen from "../screens/Home/SubmitMantraScreen";
import TravelPlannerScreen from "../screens/Home/TravelPlannerScreen";
import HaatLandingView from "../screens/KalpXHaat/HaatLandingView";
import StoreDetailView from "../screens/KalpXHaat/StoreDetailView";
import ProductDetails from "../screens/KalpXHaat/ProductDetails";
import ServiceDetails from "../screens/KalpXHaat/ServiceDetails";
import HaatCart from "../screens/KalpXHaat/HaatCart";
import PaymentDetails from "../screens/KalpXHaat/PaymentDetails";
import AddressListView from "../screens/KalpXHaat/AddressListView";
import AddNewAddress from "../screens/KalpXHaat/AddNewAddress";
import PackageDetails from "../screens/KalpXHaat/PackageDetails";
import ServiceCheckout from "../screens/KalpXHaat/ServiceCheckout";
import Notifications from "../screens/Notifications/Notifications";
import OnlineclassesScreen from "../screens/OnlineclassesScreen";
import Language from "../screens/Profile/Language";
import NotificationPreferences from "../screens/Profile/NotificationPreferences";
import Privacy from "../screens/Profile/Privacy";
import Profile from "../screens/Profile/Profile";
import ProfileDetails from "../screens/Profile/ProfileDetails";
import SecurityScreen from "../screens/Profile/SecurityScreen";
import RoomMemoryScreen from "../screens/Room/RoomMemoryScreen";
import Sankalp from "../screens/Sankalp";
import CommunityDetail from "../screens/Social/CommunityDetail";
import CommunityLanding from "../screens/Social/CommunityLanding";
import CreateSocialPost from "../screens/Social/CreateSocialPost";
import GlobalSearchScreen from "../screens/Social/GlobalSearchScreen";
import SocialExplore from "../screens/Social/SocialExplore";
import SocialPostDetailScreen from "../screens/Social/SocialPostDetailScreen";
import StreakScreen from "../screens/Streak/StreakScreen";
import TopTabsNavigator from "../screens/Tracker/TopTabsNavigator";
import TrackerEdit from "../screens/Tracker/TrackerEdit";
import TrackerProgress from "../screens/Tracker/TrackerProgress";
import TrackerScreen from "../screens/Tracker/TrackerScreen";
import RhythmEditScreen from "../screens/Mitra/RhythmEditScreen";
import RhythmHomeScreen from "../screens/Mitra/RhythmHomeScreen";
import RhythmSetupScreen from "../screens/Mitra/RhythmSetupScreen";
import QuickResetScreen from "../screens/Mitra/QuickResetScreen";
import DigitalMalaScreen from "../screens/Mitra/DigitalMalaScreen";
import RemindersScreen from "../screens/Mitra/RemindersScreen";
import QuickCheckinScreen from "../screens/Mitra/QuickCheckinScreen";
import BrowseRoomsScreen from "../screens/Mitra/BrowseRoomsScreen";
import InnerPathScreen from "../screens/Mitra/InnerPathScreen";
import TellMitraScreen from "../screens/Mitra/TellMitraScreen";
import MitraIntentionScreen from "../screens/Mitra/MitraIntentionScreen";
import MitraStartScreen from "../screens/Mitra/MitraStartScreen";
import NewMitraShell from "../screens/Mitra/NewMitraShell";
import InnerPathMantraRunner from "../screens/Mitra/runners/InnerPathMantraRunner";
import InnerPathSankalpRunner from "../screens/Mitra/runners/InnerPathSankalpRunner";
import InnerPathPracticeRunner from "../screens/Mitra/runners/InnerPathPracticeRunner";
import RhythmMantraRunner from "../screens/Mitra/runners/RhythmMantraRunner";
import RhythmSankalpRunner from "../screens/Mitra/runners/RhythmSankalpRunner";
import RhythmPracticeRunner from "../screens/Mitra/runners/RhythmPracticeRunner";
import InnerPathMantraCompletion from "../screens/Mitra/completions/InnerPathMantraCompletion";
import InnerPathSankalpCompletion from "../screens/Mitra/completions/InnerPathSankalpCompletion";
import InnerPathPracticeCompletion from "../screens/Mitra/completions/InnerPathPracticeCompletion";
import RhythmMantraCompletion from "../screens/Mitra/completions/RhythmMantraCompletion";
import RhythmSankalpCompletion from "../screens/Mitra/completions/RhythmSankalpCompletion";
import RhythmPracticeCompletion from "../screens/Mitra/completions/RhythmPracticeCompletion";
// Program Distribution OS — Gate 3
import ProgramInviteClaimScreen from "../screens/Program/ProgramInviteClaimScreen";
import ProgramDayScreen from "../screens/Program/ProgramDayScreen";
import ProgramCompletionScreen from "../screens/Program/ProgramCompletionScreen";
import ProgramDay8TransitionScreen from "../screens/Program/ProgramDay8TransitionScreen";
import ProgramMantraRunner from "../screens/Program/runners/ProgramMantraRunner";
import ProgramSankalpRunner from "../screens/Program/runners/ProgramSankalpRunner";
import ProgramPracticeRunner from "../screens/Program/runners/ProgramPracticeRunner";
// TLP Phase 1 — Trusted Leader Platform
import LiveSessionsListScreen from "../screens/Program/LiveSessionsListScreen";
import LiveSessionDetailScreen from "../screens/Program/LiveSessionDetailScreen";
import ProgramsDiscoveryScreen from "../screens/Program/ProgramsDiscoveryScreen";

const Stack: any = createNativeStackNavigator();

export const HomeStackNavigator = ({ initialRouteName = "Home" }) => (
  <Stack.Navigator
    initialRouteName={initialRouteName}
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: 'transparent' }
    }}
  >
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
      name="RetreatsScreen"
      component={RetreatsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="RetreatDetails"
      component={RetreatDetailsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="RetreatPackage"
      component={RetreatPackageScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="RetreatBooking"
      component={RetreatBookingScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="RetreatBookingDetails"
      component={RetreatBookingDetailsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="RetreatPayment"
      component={RetreatPaymentScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="RetreatCancellation"
      component={RetreatCancellationScreen}
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
      name="HaatLandingView"
      component={HaatLandingView}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="StoreDetailView"
      component={StoreDetailView}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ProductDetails"
      component={ProductDetails}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ServiceDetails"
      component={ServiceDetails}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="HaatCart"
      component={HaatCart}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="PaymentDetails"
      component={PaymentDetails}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="AddressListView"
      component={AddressListView}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="AddNewAddress"
      component={AddNewAddress}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="PackageDetails"
      component={PackageDetails}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ServiceCheckout"
      component={ServiceCheckout}
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
    <Stack.Screen
      name="MySadana"
      component={MySadana}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="SubmitMantraScreen"
      component={SubmitMantraScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="SadanaTrackerScreen"
      component={SadanaTrackerScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Dharma"
      component={Dharma}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="LearnMore"
      component={LearnMore}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="RelatedVideosScreen"
      component={RelatedVideosScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="DailyPracticeList"
      component={DailyPracticeList}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="DailyPracticeSelectList"
      component={DailyPracticeSelectList}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="DailyPracticeDetailSelectedPractice"
      component={DailyPracticeDetailSelectedPractice}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="TrackerScreen"
      component={TrackerScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen name="TrackerTabs" component={TopTabsNavigator} />
    <Stack.Screen
      name="TrackerProgress"
      component={TrackerProgress}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="TrackerEdit"
      component={TrackerEdit}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="SocialExplore"
      component={SocialExplore}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="CommunityLanding"
      component={CommunityLanding}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="CommunityDetail"
      component={CommunityDetail}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="SocialPostDetailScreen"
      component={SocialPostDetailScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="CreateSocialPost"
      component={CreateSocialPost}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="CreateOwnPractice"
      component={CreateOwnPractice}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="SanatanPractice"
      component={SanatanPractice}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ConfirmSanatanPractices"
      component={ConfirmSanatanPractices}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ConfirmDailyPractices"
      component={ConfirmDailyPractices}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="SubmitDailyPracticesScreen"
      component={SubmitDailyPracticesScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="DailyPracticeLogin"
      component={DailyPracticeLogin}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="DailyPracticeMantra"
      component={DailyPracticeMantra}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="GlobalSearchScreen"
      component={GlobalSearchScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="DynamicEngine"
      component={ScreenRenderer}
      options={{ headerShown: false }}
    />
    <Stack.Screen name="RhythmHome" component={RhythmHomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="RhythmSetup" component={RhythmSetupScreen} options={{ headerShown: false }} />
    <Stack.Screen name="RhythmEdit" component={RhythmEditScreen} options={{ headerShown: false }} />
    <Stack.Screen name="QuickReset" component={QuickResetScreen} options={{ headerShown: false }} />
    <Stack.Screen name="DigitalMala" component={DigitalMalaScreen} options={{ headerShown: false }} />
    <Stack.Screen name="QuickCheckin" component={QuickCheckinScreen} options={{ headerShown: false }} />
    <Stack.Screen name="BrowseRooms" component={BrowseRoomsScreen} options={{ headerShown: false, gestureEnabled: false }} />
    <Stack.Screen name="InnerPath" component={InnerPathScreen} options={{ headerShown: false }} />
    <Stack.Screen name="TellMitra" component={TellMitraScreen} options={{ headerShown: false }} />
    <Stack.Screen name="MitraIntention" component={MitraIntentionScreen} options={{ headerShown: false }} />
    <Stack.Screen name="MitraStart" component={MitraStartScreen} options={{ headerShown: false, gestureEnabled: false }} />
    <Stack.Screen name="NewMitraHome" component={NewMitraShell} options={{ headerShown: false }} />
    <Stack.Screen name="InnerPathMantraRunner" component={InnerPathMantraRunner} options={{ headerShown: false }} />
    <Stack.Screen name="InnerPathSankalpRunner" component={InnerPathSankalpRunner} options={{ headerShown: false }} />
    <Stack.Screen name="InnerPathPracticeRunner" component={InnerPathPracticeRunner} options={{ headerShown: false }} />
    <Stack.Screen name="RhythmMantraRunner" component={RhythmMantraRunner} options={{ headerShown: false }} />
    <Stack.Screen name="RhythmSankalpRunner" component={RhythmSankalpRunner} options={{ headerShown: false }} />
    <Stack.Screen name="RhythmPracticeRunner" component={RhythmPracticeRunner} options={{ headerShown: false }} />
    <Stack.Screen name="InnerPathMantraCompletion" component={InnerPathMantraCompletion} options={{ headerShown: false }} />
    <Stack.Screen name="InnerPathSankalpCompletion" component={InnerPathSankalpCompletion} options={{ headerShown: false }} />
    <Stack.Screen name="InnerPathPracticeCompletion" component={InnerPathPracticeCompletion} options={{ headerShown: false }} />
    <Stack.Screen name="RhythmMantraCompletion" component={RhythmMantraCompletion} options={{ headerShown: false }} />
    <Stack.Screen name="RhythmSankalpCompletion" component={RhythmSankalpCompletion} options={{ headerShown: false }} />
    <Stack.Screen name="RhythmPracticeCompletion" component={RhythmPracticeCompletion} options={{ headerShown: false }} />
    {/* Program Distribution OS — Gate 3 screens */}
    <Stack.Screen name="ProgramInviteClaimScreen" component={ProgramInviteClaimScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ProgramDayScreen" component={ProgramDayScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ProgramCompletionScreen" component={ProgramCompletionScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ProgramDay8TransitionScreen" component={ProgramDay8TransitionScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ProgramMantraRunner" component={ProgramMantraRunner} options={{ headerShown: false }} />
    <Stack.Screen name="ProgramSankalpRunner" component={ProgramSankalpRunner} options={{ headerShown: false }} />
    <Stack.Screen name="ProgramPracticeRunner" component={ProgramPracticeRunner} options={{ headerShown: false }} />
    {/* TLP Phase 1 — Trusted Leader Platform */}
    <Stack.Screen name="LiveSessionsList" component={LiveSessionsListScreen} options={{ headerShown: false }} />
    <Stack.Screen name="LiveSessionDetail" component={LiveSessionDetailScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ProgramsDiscovery" component={ProgramsDiscoveryScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

export const NotificationStackNavigator = () => (
  <Stack.Navigator screenOptions={{
    headerShown: false,
    contentStyle: { backgroundColor: 'transparent' }
  }}>
    <Stack.Screen
      name="Notifications"
      component={Notifications}
      options={{ headerShown: false }}
    />
    {/* Add notification screens here */}
  </Stack.Navigator>
);

export const ProfileStackNavigator = () => (
  <Stack.Navigator screenOptions={{
    headerShown: false,
    contentStyle: { backgroundColor: 'transparent' }
  }}>
    <Stack.Screen
      name="Profile"
      component={Profile}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ProfileDetails"
      component={ProfileDetails}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Language"
      component={Language}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Privacy"
      component={Privacy}
    />
    <Stack.Screen
      name="NotificationPreferences"
      component={NotificationPreferences}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="RoomMemoryScreen"
      component={RoomMemoryScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Reminders"
      component={RemindersScreen}
      options={{ headerShown: false, gestureEnabled: false }}
    />
    <Stack.Screen
      name="Security"
      component={SecurityScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

export const MenuStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {/* Add menu screens here */}
  </Stack.Navigator>
);

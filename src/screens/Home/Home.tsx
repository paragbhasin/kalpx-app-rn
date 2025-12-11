// screens/Home.js
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import * as Notifications from 'expo-notifications';
import * as Updates from "expo-updates";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Linking,
  Platform,
  SafeAreaView,
  // ScrollView,
  StatusBar,
  TouchableOpacity,
  View
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Card } from "react-native-paper";
import VersionCheck from "react-native-version-check-expo";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import ClassHomeCard from "../../components/ClassHomeCard";
import Colors from "../../components/Colors";
import FestivalCard from "../../components/FestivalCard";
import FontSize from "../../components/FontSize";
import Header from "../../components/Header";
import LoadingOverlay from "../../components/LoadingOverlay";
import MantraCard from "../../components/MantraCard";
import NotificationPermissionModal from "../../components/NotificationPermissionModal";
import SankalpCard from "../../components/SankalpCard";
import SigninPopup from "../../components/SigninPopup";
import TextComponent from "../../components/TextComponent";
import UpdateAppModal from "../../components/UpdateModal";
import { useUserLocation } from "../../components/useUserLocation";
import WisdomCard from "../../components/WisdomCard";
import { CATALOGS } from "../../data/mantras";
import { usePracticeStore } from "../../data/Practice";
import { BASE_IMAGE_URL } from "../../Networks/baseURL";
import { RootState } from "../../store";
import { saveUserAction } from "../../utils/storage";
import { classesHomeList } from "../Classes/actions";
import {
  completeMantra,
  getDailyDharmaTracker,
  getPracticeStreaks,
  getPracticeToday,
  getVideos,
  startMantraPractice,
} from "./actions";
import styles from "./homestyles";

const { width } = Dimensions.get("window");
const CARD_MARGIN = 14;
const CARD_WIDTH = (width - CARD_MARGIN * 3) / 2; 

export const collapseControl = { avoidCollapse: false };

export default function Home() {
  const navigation: any = useNavigation();
  const { t,i18n } = useTranslation();
    const userLang = i18n.language.split("-")[0]; 
  const [trackerData, setTrackerData] = useState<any>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [showLangTZModal, setShowLangTZModal] = useState(false);
    const { locationData, loading: locationLoading, error: locationError } = useUserLocation();
const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showMantraTaken, setShowMantraTaken] = useState(false);
  const [showLoginMantraTaken, setShowLoginMantraTaken] = useState(false);
  const [showMantraComplete, setShowMantraComplete] = useState(false);
  const [showLoginMantraComplete, setShowLoginMantraComplete] = useState(false);
  const [showSankalpTaken, setShowSankalpTaken] = useState(false);
  const [showLoginSankalpTaken, setShowLoginSankalpTaken] = useState(false);
  const [showSankalpComplete, setShowSankalpComplete] = useState(false);
  const [showLoginSankalpComplete, setShowLoginSankalpComplete] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
const [updateType, setUpdateType] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { setDailyMantras } = usePracticeStore();
  const [apiloading, setApiLoading] = useState(false);
  const [classPage, setClassPage] = useState(1);
const [homeClasses, setHomeClasses] = useState([]);
const [classHasMore, setClassHasMore] = useState(true);
const [loadingClasses, setLoadingClasses] = useState(false);
  const [selectedMantraForPopup, setSelectedMantraForPopup] = useState(null);
  const [selectedSankalpForPopup, setSelectedSankalpForPopup] = useState(null);
 const currentLang = i18n.language.split("-")[0];
  const youtubeUrl = "https://www.youtube.com/watch?v=INS2diQXIjA";
  const videoId = youtubeUrl.split("v=")[1];
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;

  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const { data: streakData, loading: streakLoading } = useSelector((state: RootState) => state.practiceStreaksReducer);

  const { data: exploreVideos, loading: exploreLoading, page, hasMore } = useSelector((state: RootState) => state.videosReducer);

  useFocusEffect(
  React.useCallback(() => {
    const checkNotificationPermission = async () => {
      const settings = await Notifications.getPermissionsAsync();
      if (settings.status !== "granted") {
        setShowNotificationPopup(true);
      } else {
        setShowNotificationPopup(false);
      }
    };
    checkNotificationPermission();
  }, [])
);


useFocusEffect(
  React.useCallback(() => {
    if (collapseControl.avoidCollapse) {
      collapseControl.avoidCollapse = false;
      return;
    }
    setExpandedItemId(null);
  }, [])
);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        setIsLoggedIn(!!token);
      } catch (error) {
        console.log("Error checking login:", error);
      }
    };
    checkLogin();
  }, []);

useEffect(() => {
  const checkForUpdates = async () => {
    console.log("🔍 Checking for updates...");
    try {
      const update = await Updates.checkForUpdateAsync();
      console.log("🟡 OTA Update Check Result:", update);
      if (update.isAvailable) {
        setUpdateType("OTA");
        setShowUpdateModal(true);
        console.log("🚀 OTA update available!");
        return;
      }
      const latestVersion = await VersionCheck.getLatestVersion();
      const currentVersion = await VersionCheck.getCurrentVersion();
      console.log("📱 App Versions:", { latestVersion, currentVersion });
      if (latestVersion && latestVersion !== currentVersion) {
        console.log("🆕 Store update available!");
        setUpdateType("STORE");
        setShowUpdateModal(true);
      } else {
        console.log("✅ App is up to date.");
      }
    } catch (err) {
      console.log("❌ Error checking updates:", err);
    }
  };

  checkForUpdates();
}, []);

useEffect(() => {
  const checkShowLocation = async () => {
    const shouldShow = await AsyncStorage.getItem("showLocationConfirm");
    if (shouldShow === "true") {
      setShowLangTZModal(true);
      await AsyncStorage.removeItem("showLocationConfirm");
    }
  };
  checkShowLocation();
}, []);

useEffect(() => {
  const preloadMantras = () => {
    const langKey = currentLang.toLowerCase();
    const allMantras = CATALOGS[langKey] || CATALOGS.en;
    const startOfCycle = moment('2025-01-01');
    const today = moment().startOf('day');
    const dayIndex = today.diff(startOfCycle, 'days'); 
    const startIndex = (dayIndex * 5) % allMantras.length;
    const endIndex = startIndex + 5;
    const dailyFive =
      endIndex <= allMantras.length
        ? allMantras.slice(startIndex, endIndex)
        : [
            ...allMantras.slice(startIndex),
            ...allMantras.slice(0, endIndex - allMantras.length),
          ];
    console.log("🔁 Today's Mantras:", dailyFive.map(m => m.id));
    setDailyMantras(dailyFive);
  };

  preloadMantras();
}, [currentLang]);

  useEffect(() => {
    const langKey = currentLang.toLowerCase();
    const allMantras = CATALOGS[langKey] || CATALOGS.en;
    const dailyFive = allMantras.slice(0, 5);
    setDailyMantras(dailyFive);
  }, [currentLang]);

  useEffect(() => {
    dispatch(
      getVideos(
        {
          page: 1,
          per_page: 22,
          category: "All",
          language: "All",
        },
        (res) => {
          if (res.success) {
            console.log("✅ Home Explore Videos fetched:", res.data.length);
          } else {
            console.error("❌ Failed to fetch Home Explore videos:", res.error);
          }
        }
      )
    );
  }, [dispatch]);

  const handleLoadMore = () => {
    if (!exploreLoading && hasMore) {
      dispatch(
        getVideos(
          {
            page: page + 1,
            per_page: 22,
            category: "All",
            language: "All",
          },
          (res) => {
            if (res.success) {
              console.log(`📺 Loaded more explore videos: Page ${page + 1}`);
            } else {
              console.error("❌ Pagination failed:", res.error);
            }
          }
        )
      );
    }
  };

  useEffect(() => {
    dispatch(
      getDailyDharmaTracker((res) => {
        if (res.success) {
          setTrackerData(res.data);
          console.log("✅ Daily Dharma Tracker Data::::::::::", res.data);
        } else {
          console.error("❌ Failed to fetch tracker:", res.error);
        }
      })
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      getPracticeStreaks((res) => {
        console.log("✅ Streaks fetched:", res);
      })
    );
  }, [dispatch]);

  const { data: practiceTodayData, loading } = useSelector(
    (state: RootState) => state.practiceTodayReducer
  );

  const loadHomeClasses = (pageNo = 1) => {
  if (loadingClasses || !classHasMore) return;

  setLoadingClasses(true);

  dispatch(
    classesHomeList(pageNo, locationData?.timezone, (res) => {
      console.log("classes Home Response >>>>>>>>>>",JSON.stringify(res));
      if (res.success) {
        const onlyAvailable = res.data.filter(
          (item) => item?.available_slots?.length > 0
        );

        if (res.data.length === 0) {
          setClassHasMore(false);
        }

        const newList =
          pageNo === 1 ? onlyAvailable : [...homeClasses, ...onlyAvailable];

        setHomeClasses(newList);
      } else {
        setClassHasMore(false);
      }

      setLoadingClasses(false);
    })
  );
};


// const loadHomeClasses = (pageNo = 1) => {
//   if (loadingClasses || !classHasMore) return;

//   setLoadingClasses(true);

//   dispatch(
//     classesExploreList(pageNo, 10, "", locationData?.timezone, (res) => {
//       if (res.success) {
//         const onlyAvailable = res.data.filter(
//           (item) => item?.available_slots?.length > 0
//         );

//         // STOP PAGINATION ONLY WHEN NO DATA
//     if (res.data.length === 0) {   // stop only when API truly has no data
//   setClassHasMore(false);
// }


//         const newList =
//           pageNo === 1 ? onlyAvailable : [...homeClasses, ...onlyAvailable];

//        setHomeClasses(newList);   // NO slicing


//       } else {
//         setClassHasMore(false);
//       }

//       setLoadingClasses(false);
//     })
//   );
// };




// First load
useEffect(() => {
  loadHomeClasses(1);
}, []);

  useEffect(() => {
    dispatch(
      getPracticeToday((res) => {
        console.log("✅ practiceTodayData Practice Today Callback Response:::::::::>>>>>>>>>>>>>", practiceTodayData);
      })
    );
  }, [dispatch]);

  const topChips = [
    { id: "1", label: t("cards.sankalp") },
    { id: "2", label: t("cards.mantra") },
    { id: "3", label:t("cards.festival")  },
    { id: "4", label:t("cards.wisdom") },
  ];

  const handleChipPress = (id: string) => {
    setExpandedItemId((prev) => (prev === id ? null : id));
  };

  const baseCategories = [
  {
    id: "1",
    name: t("categories.sadana"),
      // trackerData?.active_practices?.length > 0
      //   ? t("categories.sadana")
      //   : t("categories.dharma"),
    // title: trackerData?.active_practices?.length > 0
    //   ? "SadanaTrackerScreen"
    //   : "Dharma",
      title: trackerData?.active_practices?.length > 0
      ? "TrackerTabs"
      : "DailyPracticeList",
      // title: trackerData?.active_practices?.length > 0 ? "DailyPracticeList" : "DailyPracticeList",
    iconType: "image",
    icon: require("../../../assets/Group.png"),
    event_type: "click_dharma_card",
    component: "Dharma-card",
  },
  {
    id: "2",
    name: t("categories.explore"),
    title: "Explore",
    iconType: "image",
    icon: require("../../../assets/Exploreicon.png"),
    event_type: "click_explore_card",
    component: "Explore-card",
  },
  {
    id: "6",
    name: t("categories.classes"),
    title: "ClassesScreen",
    iconType: "image",
    icon: require("../../../assets/onlinecion.png"),
    event_type: "click_classes_card",
    component: "Classes-card",
  },
  {
  id: "8",
  name: t("categories.socialExplore"),
  title: "SocialExplore",
  iconType: "vector",
  icon: "people-outline",   // 🔥 posts/feed icon
  event_type: "click_social_explore",
  component: "SocialExplore-card",
}

];

const categories = isLoggedIn
  ? baseCategories // hide login
  : [
      ...baseCategories,
      {
        id: "7",
        name: t("forgotPassword.login"),
        title: "Login",
        iconType: "vector",
        icon: "log-in-outline",
        event_type: "click_login_card",
        component: "Login-card",
      },
    ];


  const dailyOptions = [
      {
    id: "1",
    title: t("cards.mantra_card.title"),
    subtitle: t("cards.mantra_card.subtitle"),
    route: "Mantra",
    event_type: "view_mantra_card",
    component: "mantra-card",
    icon: require("../../../assets/atom.png"),
  },
  {
    id: "2",
    title: t("cards.sankalp_card.title"),
    subtitle: t("cards.sankalp_card.subtitle"),
    route: "Sankalp",
    event_type: "view_sankalp_card",
    component: "sankalp-card",
    icon: require("../../../assets/lamp.png"),
  },
  {
    id: "3",
    title: t("cards.festival_card.title"),
    subtitle: t("cards.festival_card.subtitle"),
    route: "Wisdom",
    event_type: "view_wisdom_card",
    component: "wisdom-card",
    icon: require("../../../assets/sun.png"),
  },
  {
    id: "4",
    title: t("cards.wisdom_card.title"),
    subtitle: t("cards.wisdom_card.subtitle"),
    route: "UpcomingFestivals",
    event_type: "view_festival_card",
    component: "festival-card",
    icon: require("../../../assets/party.png"),
  },
];

  const kalpXData = [
    {
      id: "1",
      title: t("kalpx.learn"),
       name: "ClassesScreen",
      // name: "LearnMore",
      event_type: "click_learn_card",
      component: "Learn-card",
      image: require("../../../assets/learn.png"),
    },
    {
      id: "2",
      title: t("categories.explore"),
      name: "Explore",
      event_type: "click_explore_card",
      component: "Explore-card",
      image: require("../../../assets/explore.png"),
    },
    {
      id: "3",
      title:  trackerData?.active_practices?.length > 0 ? t("categories.sadana"): t("categories.dharma"),
      // title: t("kalpx.practice"),
      name: trackerData?.active_practices?.length > 0
      ? "TrackerTabs"
      : "DailyPracticeList",
      // trackerData?.active_practices?.length > 0 ? "MySadana" : "Dharma",
      event_type: "click_practice_card",
      component: "Practice-card",
      image: require("../../../assets/daily.png"),
    },
    // {
    //   id: "4",
    //   title: t("kalpx.journey"),
    //   name: "Travel",
    //   event_type: "click_journey_card",
    //   component: "Journey-card",
    //   image: require("../../../assets/journey.png"),
    // },
    // {
    //   id: "5",
    //   title: t("kalpx.poojas"),
    //   name: "Pooja",
    //   event_type: "click_pooja_card",
    //   component: "Pooja-card",
    //   image: require("../../../assets/poojafl.png"),
    // },
    // {
    //   id: "6",
    //   title: t("kalpx.retreats"),
    //   name: "Retreat",
    //   event_type: "click_retreats_card",
    //   component: "Retreats-card",
    //   image: require("../../../assets/retreatff.png"),
    // },
    // {
    //   id: "7",
    //   title: t("kalpx.Classes"),
    //   name: "ClassesScreen",
    //   event_type: "click_classes_card",
    //   component: "Classes-card",
    //   image: require("../../../assets/onlineclass.png"),
    // },
  ];

  const handleStartMantra = (mantra,reps) => {
    const payload = {
      kind: "mantra",
      practice_id: mantra.id,
      date_local: moment().format("YYYY-MM-DD"),
      tz: locationData?.timezone,
      reps:reps
    };

    console.log("payload >>>>>>>>>", payload);

    dispatch(
      startMantraPractice(payload, (res) => {
        console.log("🎯 Mantra start callback:", res);
        if (res.success) {
          if(!isLoggedIn){
          setShowMantraTaken(true);
          }else{
            setShowLoginMantraTaken(true);
          }
          dispatch(getPracticeToday(() => {}));
        }
      })
    );
  };

  const DoneMantraCalled = (mantra) => {
    if (!mantra?.id) return;

    const payload = {
      type: "mantra",
      item_id: mantra.id,
      tz: locationData?.timezone || "Asia/Kolkata",
    };

    console.log("Complete Mantra payload >>>>", payload);

    dispatch(
      completeMantra(payload, (res) => {
        if (res.success) {
              dispatch(getPracticeStreaks((res) => {
        console.log("✅ Streaks fetched:", res);
      }))
           if(!isLoggedIn){
          setShowMantraComplete(true);
           } else{
             setShowLoginMantraComplete(true);
           }
          dispatch(getPracticeToday(() => {}));
        }
      })
    );
  };

  const handleStartSankalp = (sankalp) => {
    const payload = {
      kind: "sankalp",
      practice_id: sankalp.id,
      date_local: moment().format("YYYY-MM-DD"),
      tz: locationData?.timezone,
    };

    dispatch(
      startMantraPractice(payload, (res) => {
        if (res.success) {
          if(!isLoggedIn){
          setShowSankalpTaken(true);
          }else{
            setShowLoginSankalpTaken(true);
          }
          dispatch(getPracticeToday(() => {}));
        }
      })
    );
  };

  const DoneSankalpCalled = (sankalp) => {
    if (!sankalp?.id) return;

    const payload = {
      type: "sankalp",
      item_id: sankalp.id,
      tz: locationData?.timezone || "Asia/Kolkata",
    };

    dispatch(
      completeMantra(payload, (res) => {
        if (res.success) {
            dispatch(getPracticeStreaks((res) => {
        console.log("✅ Streaks fetched:", res);
      }))
            if(!isLoggedIn){
          setShowSankalpComplete(true);
            }else{
          setShowLoginSankalpComplete(true);
            }
          dispatch(getPracticeToday(() => {}));
        }
      })
    );
  };

  const renderCategory = ({ item }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={async () => {
      try {
        const userId = await AsyncStorage.getItem("uuid");
        await saveUserAction({
          uuid: userId,
          timestamp: Date.now(),
          retryCount: 0,
          event_type: item?.event_type,
          event_data: {
            component: item?.component,
            city: locationData.city,
            lat: locationData.latitude,
            long: locationData.longitude,
            timeZone: locationData.timezone,
            device: Platform.OS === "ios" ? "mobile-ios" : "mobile-android",
            screen: "home",
          },
        });

        navigation.navigate(item.title);
      } catch (error) {
        console.error("Error fetching UUID:", error);
      }
    }}
  >
    {item.iconType === "vector" && (
      <Ionicons
        name={item.icon}
        size={28}
        color="#9A7548"
        style={styles.icon}
      />
    )}
    {item.iconType === "image" && (
      <Image source={item.icon} style={styles.icon} resizeMode="contain" />
    )}
    <TextComponent type="headerSubBoldText" style={styles.cardText}>
      {item.name}
    </TextComponent>
  </TouchableOpacity>
);

  const renderDailyOption = ({ item }) => (
    <>
      <Card
        style={styles.dailyCard}
        onPress={async () => {
          try {
            const userId = await AsyncStorage.getItem("uuid");
            saveUserAction({
              uuid: userId,
              timestamp: Date.now(),
              retryCount: 0,
              event_type: item?.event_type,
              event_data: {
                component: item?.component,
                city: locationData.city,
                lat: locationData.latitude,
                long: locationData.longitude,
                timeZone: locationData.timezone,
                device:
                  Platform.OS === "ios" ? "mobile-ios" : "mobile-android",
                screen: "home",
              },
            });
            if (item.id) {
              setExpandedItemId((prev) =>
                prev === item.id ? null : item.id
              );
            }
          } catch (error) {
            console.error("Error fetching UUID:", error);
          }
        }}
      >
        <View style={styles.cardContent}>
          <Image
            source={item.icon}
            style={styles.optionIcon}
            resizeMode="contain"
          />
          <View style={styles.textWrapper}>
            <TextComponent type="boldText" style={styles.optionTitle}>
              {item.title}
            </TextComponent>
            <TextComponent type="mediumText" style={styles.optionSubtitle}>
              {item.subtitle}
            </TextComponent>
          </View>
          <Image
            source={require("../../../assets/card_arrow.png")}
         style={[
    styles.arrowIcon,
    {
      transform: [
        { rotate: expandedItemId === item.id ? "270deg" : "0deg" },
      ],
    },
  ]}
            resizeMode="contain"
          />
        </View>
      </Card>
      {expandedItemId === item.id && item.id === "1" && (
        <View style={{ marginTop: 10, zIndex: 999,}}>
          <SankalpCard
            practiceTodayData={practiceTodayData}
            onPressStartSankalp={(sankalp) => {
            setSelectedSankalpForPopup(sankalp);
              handleStartSankalp(sankalp);
            }}
            onCompleteSankalp={(sankalp) =>{
            setSelectedSankalpForPopup(sankalp);
          DoneSankalpCalled(sankalp);
        }}
          />
        </View>
      )}
      {expandedItemId === item.id && item.id === "2" && (
        <View style={{ marginTop: 10, zIndex: 999,}}>
           <MantraCard
          practiceTodayData={practiceTodayData}
          onPressChantMantra={(mantra,reps) => {
            console.log("Selected Mantra for Start:", mantra,reps);
            setSelectedMantraForPopup(mantra);
            handleStartMantra(mantra,reps);
          }}
          DoneMantraCalled={(mantra) => {
            console.log("confirm Mantra for Start:", mantra);
            setSelectedMantraForPopup(mantra);
            DoneMantraCalled(mantra);
          }}
        />
        </View>
      )}
      {expandedItemId === item.id && item.id === "4" && (
        <View style={{ marginTop: 10, zIndex: 999, }}>
          <WisdomCard />
        </View>
      )}

      {expandedItemId === item.id && item.id === "3" && (
        <View style={{ marginTop: 10, zIndex: 999,}}>
          <FestivalCard />
        </View>
      )}
    </>
  );

  const renderKalpXItem = ({ item }) => (
  <TouchableOpacity
    style={[styles.kalpXCard, { width: CARD_WIDTH }]} 
    onPress={async () => {
      try {
        const userId = await AsyncStorage.getItem("uuid");
        await saveUserAction({
          uuid: userId,
          timestamp: Date.now(),
          retryCount: 0,
          event_type: item?.event_type,
          event_data: {
            component: item?.component,
            city: locationData.city,
            lat: locationData.latitude,
            long: locationData.longitude,
            timeZone: locationData.timezone,
            device: Platform.OS === "ios" ? "mobile-ios" : "mobile-android",
            screen: "home",
          },
        });
        navigation.navigate(item.name);
      } catch (error) {
        console.error("Error fetching UUID:", error);
      }
    }}
  >
    <Image source={item.image} style={styles.kalpXImage} resizeMode="cover" />
    <TextComponent type="semiBoldText" style={styles.kalpXTitle}>{item.title}</TextComponent>
  </TouchableOpacity>
);


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Colors.white }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.Colors.header_bg}
        translucent={false}
      />
      <Header />
      <ScrollView
        nestedScrollEnabled={true}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginTop: 0,alignItems:"center"}}>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 10,
              paddingBottom: 8,
            }}
          />
        </View>
        {isLoggedIn &&
  <View style={{alignItems:"center"}}>
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.streakScrollContainer}
  >
        <Card style={styles.streakItem}  onPress={() => navigation.navigate("StreakScreen")}>
      <View style={{flexDirection:"row"}}>
      <Image
        source={require("../../../assets/streak1.png")}
        style={styles.streakIcon}
      />
      <TextComponent type="streakSubText" style={styles.count}>
        {streakData?.sankalp ?? 0}
      </TextComponent>
      <TextComponent type="streakSubText" style={styles.streakText}>
        {t("streak.sankalp")}
      </TextComponent>
      </View>
    </Card>
    <Card style={styles.streakItem}  onPress={() => navigation.navigate("StreakScreen")}>
      <View style={{flexDirection:"row"}}>
      <Image
        source={require("../../../assets/streak2.png")}
        style={styles.streakIcon}
      />
      <TextComponent type="streakSubText" style={styles.count}>
        {streakData?.mantra ?? 0}
      </TextComponent>
      <TextComponent type="streakSubText" style={styles.streakText}>
        {t("streak.mantra")}
      </TextComponent>
      </View>
    </Card>
    <Card style={styles.streakItem}  onPress={() => navigation.navigate("StreakScreen")}>
      <View style={{flexDirection:"row"}}>
      <Image
        source={require("../../../assets/streak3.png")}
        style={styles.streakIcon}
      />
      <TextComponent type="streakSubText" style={styles.count}>
        {trackerData?.streak_count ?? 0}
      </TextComponent>
      <TextComponent type="streakSubText" style={styles.streakText}>
        {t("streak.DailyPractice")}
      </TextComponent>
      </View>
    </Card>
  </ScrollView>
  </View>
}
     <TouchableOpacity style={{ alignItems: "center", marginTop: 20 }} onPress={() => {navigation.navigate("DailyPracticeList")}}>
      <ImageBackground
        source={require("../../../assets/locus.png")}
        style={styles.image}
        resizeMode="contain"
      >
        <TextComponent type="semiBoldText" style={[styles.label, styles.leftLabel]}>
          Peace {"\n"}& Calm
        </TextComponent>
       <TextComponent type="semiBoldText" style={[styles.label, styles.centerLabel]}>
          Career {"\n"}& Prosperity
        </TextComponent>
        <TextComponent type="semiBoldText" style={[styles.label, styles.rightLabel]}>
          Spiritual {"\n"}Growth
        </TextComponent>
      </ImageBackground>
    </TouchableOpacity>
    <TouchableOpacity style={{ flexDirection:"row",alignSelf: "center", marginTop: 4, alignItems: "center",marginLeft:30 }} onPress={() => {navigation.navigate("DailyPracticeList")}}>
        <TextComponent
    type="cardText"
    style={{
      color: Colors.Colors.BLACK,
      textDecorationLine: "underline",
      marginTop: 6,
    }}
  >
    View More
  </TextComponent>
  <TouchableOpacity style={styles.circleButton}>
    <Ionicons name="arrow-forward" size={12} color="#FFF6DA" />
  </TouchableOpacity>
</TouchableOpacity>
        <View style={styles.dailyContainer}>
          <TextComponent type="headerText" style={styles.sectionHeading}>
            {t("streak.stepText")}
          </TextComponent>
            <View style={{ 
                  height: expandedItemId ? 'auto' : 0,
    opacity: expandedItemId ? 1 : 0,
    overflow: 'hidden', 
    marginVertical: expandedItemId ? 10 : 0,
             }}>
              <FlatList
                data={topChips}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 10 }}
                renderItem={({ item }) => {
                  const isActive = expandedItemId === item.id;
                  return (
                    <TouchableOpacity
                      onPress={() => handleChipPress(item.id)}
                      activeOpacity={0.8}
                      style={{
                        backgroundColor: isActive
                          ? Colors.Colors.App_theme
                          : Colors.Colors.white,
                        borderColor: Colors.Colors.App_theme,
                        borderWidth: 1,
                        borderRadius: 20,
                        paddingHorizontal: 14,
                        paddingVertical: 6,
                        marginRight: 10,
                      }}
                    >
                      <TextComponent
                        type="cardText"
                        style={{
                          color: isActive
                            ? Colors.Colors.white
                            : Colors.Colors.App_theme,
                        }}
                      >
                        {item.label}
                      </TextComponent>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>

          <FlatList
            data={
              expandedItemId
                ? [
                    dailyOptions.find((x) => x.id === expandedItemId),
                    ...dailyOptions.filter((x) => x.id !== expandedItemId),
                  ]
                : dailyOptions
            }
            renderItem={renderDailyOption}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* <View style={{ margin: 16 }}>
          <TouchableOpacity
  activeOpacity={0.8}
  style={{ marginTop: 16, borderRadius: 10, overflow: "hidden" }}
  onPress={() => setShowVideo(true)}
>
  <View style={{ position: "relative" }}>
    <Image
      source={{ uri: thumbnailUrl }}
      style={{ width: "100%", height: 200, borderRadius: 8 }}
      resizeMode="cover"
    />
    <Image
      source={require("../../../assets/videopaly.png")}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 60,
        height: 60,
        transform: [{ translateX: -30 }, { translateY: -30 }],
        opacity: 0.9,
      }}
      resizeMode="contain"
    />
  </View>
</TouchableOpacity>
          <TextComponent
            type="boldText"
            style={{
              color: Colors.Colors.BLACK,
              fontSize: FontSize.CONSTS.FS_16,
              marginTop: 8,
            }}
          >
            {t("cards.kalpxTitle")}
          </TextComponent>
          <TextComponent
            type="cardText"
            style={{
              color: Colors.Colors.Light_grey,
              marginTop: 4,
            }}
          >
          {t("cards.kalpxText")}
          </TextComponent>
          <TextComponent
            type="cardText"
            style={{
              color: Colors.Colors.Light_grey,
              marginTop: 4,
            }}
          >
        {t("cards.kalpxSubText")}
          </TextComponent>
          <YoutubeModal
            visible={showVideo}
            onClose={() => setShowVideo(false)}
            youtubeUrl="https://www.youtube.com/watch?v=INS2diQXIjA"
          />
        </View> */}

        {/* <View style={{ paddingHorizontal: 12,marginTop:12 }}>
          <ExploreVideos
      videos={exploreVideos}
      onLoadMore={handleLoadMore}
      loading={exploreLoading}
      home={true}
    />
        </View> */}

        {/* <View style={styles.kalpXContainer}>
          <Text style={styles.sectionHeading}>{t("home.kalpXHeading")}</Text>
          <FlatList
            data={kalpXData}
            renderItem={renderKalpXItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={{
              justifyContent: "space-between",
              marginBottom: 12,
            }}
            scrollEnabled={false}
          />
        </View> */}
        {/* ===================== EXPLORE CLASSES ===================== */}
<View style={{ marginTop: 25,marginHorizontal:16 }}>
  <View style={{ 
    flexDirection: "row", 
    justifyContent: "space-between", 
    // paddingRight: 16 
  }}>
    <TextComponent type="headerText" style={{ fontSize: 16 }}>
      Explore Classes
    </TextComponent>

    <TouchableOpacity onPress={() => navigation.navigate("ClassesScreen")}>
      <TextComponent type="mediumText" style={{ color: Colors.Colors.App_theme }}>
        Show All
      </TextComponent>
    </TouchableOpacity>
  </View>
    <FlatList
      data={homeClasses}
      horizontal
      keyExtractor={(item) => item.id.toString()}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{  marginTop: 10}}
      renderItem={({ item }) => (
          <ClassHomeCard
          fromHome = {true}
          imageUrl={
            item?.cover_media?.key
              ? `${BASE_IMAGE_URL}/${item.cover_media.key}`
              : null
          }
          title={item?.title}
          description={item?.subtitle || item?.description}
          duration={item?.pricing?.per_person?.session_length_min}
          // price={item?.pricing?.per_person?.amount?.web}
          price={
  item?.pricing?.type === "per_group"
    ? item?.pricing?.per_group?.amount?.web
    : item?.pricing?.per_person?.amount?.web
}
          onViewDetails={() =>
            navigation.navigate("ClassTutorDetailsScreen", { data: item })
          }
          onBookNow={() =>
            navigation.navigate("ClassBookingScreen", { data: item, reschedule: false })
          }
          tutor={item?.tutor}
            currency={item?.pricing?.currency}
  trailenabled={item?.pricing?.trial?.enabled}
  trailAmt={item?.pricing?.trial?.amount}
        />
      )}

      scrollEventThrottle={16}
      onScroll={({ nativeEvent }) => {
        const scrollX = nativeEvent.contentOffset.x;
        const contentWidth = nativeEvent.contentSize.width;
        const viewWidth = nativeEvent.layoutMeasurement.width;

        if (contentWidth <= viewWidth) return;

        // Trigger pagination when scrolled more than 30%
        const progress = scrollX / (contentWidth - viewWidth);

        if (progress > 0.3 && !loadingClasses && classHasMore) {
          const next = classPage + 1;
          setClassPage(next);
          loadHomeClasses(next);
        }
      }}

      ListFooterComponent={
        loadingClasses ? (
          <ActivityIndicator size="small" style={{ marginLeft: 10 }} />
        ) : null
      }
    />
  {/* </View> */}
  {/* </Card> */}
</View>

<View style={styles.kalpXContainer}>
  <TextComponent
            type="headerText"
            style={{
              color: Colors.Colors.BLACK,
              fontSize: FontSize.CONSTS.FS_16,
                alignSelf:"center",
                marginVertical:14,
            }}
          >{t("home.kalpXHeading")}</TextComponent>

  <FlatList
    data={kalpXData}
    renderItem={renderKalpXItem}
    keyExtractor={(item) => item.id}
    numColumns={2}
    showsVerticalScrollIndicator={false}
    columnWrapperStyle={{
      justifyContent: "space-between",
      marginBottom: 12,
    }}
    contentContainerStyle={{ paddingBottom: 20 }}
  />
</View>
<SigninPopup
  visible={showMantraTaken}
  onClose={() => setShowMantraTaken(false)}
  onConfirmCancel={() => setShowMantraTaken(false)}
  title={t("popup.mantraTaken_title1")}
  subTitle={t("popup.mantraTaken_subtitle1")}
  subText={t("popup.mantraTaken_sub1")}
  infoTexts={[
    t("popup.mantraTaken_info1.0"),
    t("popup.mantraTaken_info1.1"),
    t("popup.mantraTaken_info1.2"),
  ]}
  bottomText={t("popup.mantraTaken_bottom")}
/>
<SigninPopup
  visible={showLoginMantraTaken}
  onClose={() => setShowLoginMantraTaken(false)}
  onConfirmCancel={() => setShowLoginMantraTaken(false)}
  title={t("popup.mantraTaken_title2")}
  subTitle={t("popup.mantraTaken_subtitle1")}
  subText={t("popup.mantraTaken_sub2")}
  infoTexts={[
    t("popup.mantraTaken_info2.0"),
    t("popup.mantraTaken_info2.1"),
  ]}
  // bottomText={t("popup.mantraTaken_bottom")}
  MantraButtonTitle={t("popup.mantraTaken_button")}
  onSadhanPress={() => {
    setShowLoginMantraTaken(false);
    if (selectedMantraForPopup) {
      navigation.navigate("MySadana", {
        selectedmantra: selectedMantraForPopup,
      });
    }
  }}
/>
<SigninPopup
  visible={showMantraComplete}
  onClose={() => setShowMantraComplete(false)}
  onConfirmCancel={() => setShowMantraComplete(false)}
  title={t("popup.mantraComplete_title1")}
    subTitle={t("popup.mantraTaken_subtitle1")}
  subText={t("popup.mantraComplete_sub1")}
  infoTexts={[
    t("popup.mantraComplete_info1.0"),
    t("popup.mantraComplete_info1.1"),
    t("popup.mantraComplete_info1.2"),
  ]}
/>
<SigninPopup
  visible={showLoginMantraComplete}
  onClose={() => setShowLoginMantraComplete(false)}
  onConfirmCancel={() => {}}
  title={t("popup.mantraComplete_title2")}
  subText={t("popup.mantraComplete_sub2")}
  infoTexts={[
    t("popup.mantraComplete_info2.0"),
    t("popup.mantraComplete_info2.1"),
  ]}
    MantraButtonTitle={t("popup.mantraTaken_Continue")}
  onSadhanPress={() => setShowLoginMantraComplete(false)}
/>
<SigninPopup
  visible={showSankalpTaken}
  onClose={() => setShowSankalpTaken(false)}
  onConfirmCancel={() => setShowMantraTaken(false)}
  title={t("popup.sankalpTaken_title")}
  subText={t("popup.sankalpTaken_sub")}
  infoTexts={[
    t("popup.sankalpTaken_info.0"),
    t("popup.sankalpTaken_info.1"),
    t("popup.sankalpTaken_info.2"),
  ]}
  bottomText={t("popup.sankalpTaken_bottom")}
/>
<SigninPopup
  visible={showLoginSankalpTaken}
  onClose={() => setShowLoginSankalpTaken(false)}
  onConfirmCancel={() => setShowLoginMantraTaken(false)}
  title={t("popup.sankalpTaken_title3")}
  subTitle={t("popup.mantraTaken_subtitle1")}
  subText={t("popup.mantraTaken_sub2")}
  infoTexts={[
    t("popup.sankalpTaken_info2.0"),
    t("popup.sankalpTaken_info2.1"),
  ]}
    MantraButtonTitle={t("popup.sankalpTaken_button")}
   onSadhanPress={() => {
    setShowLoginSankalpTaken(false);
    if (selectedSankalpForPopup) {
      navigation.navigate("MySadana", {
        selectedmantra: selectedSankalpForPopup,
      });
    }
  }}
  // bottomText={t("popup.sankalpTaken_bottom")}
/>
<SigninPopup
  visible={showSankalpComplete}
  onClose={() => setShowSankalpComplete(false)}
  onConfirmCancel={() => {}}
  title={t("popup.sankalpComplete_title")}
  subText={t("popup.sankalpComplete_sub")}
  infoTexts={[
    t("popup.sankalpComplete_info.0"),
    t("popup.sankalpComplete_info.1"),
    t("popup.sankalpComplete_info.2"),
  ]}
  bottomText=""
/>
<SigninPopup
  visible={showLoginSankalpComplete}
  onClose={() => setShowLoginSankalpComplete(false)}
  onConfirmCancel={() => setShowLoginSankalpComplete(false)}
  title={t("popup.mantraComplete_title2")}
  subText={t("popup.sankalpComplete_sub2")}
  infoTexts={[
    t("popup.sankalpComplete_info2.0"),
    t("popup.sankalpComplete_info2.1"),
  ]}
  bottomText=""
      MantraButtonTitle={t("popup.mantraTaken_Continue")}
  onSadhanPress={() => setShowLoginSankalpComplete(false)}
/>
  {/* <LanguageTimezoneModal
    visible={showLangTZModal}
    onClose={() => setShowLangTZModal(false)}
  /> */}
  <UpdateAppModal
  visible={showUpdateModal}
  onLater={() => setShowUpdateModal(false)}
  onUpdateNow={async () => {
    console.log("updateType >>>>>>",updateType);
    if (updateType === "OTA") {
      try {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync(); // restarts with new OTA update
      } catch (e) {
        console.log("OTA update failed:", e);
      }
    } else {
      const storeUrl =
        Platform.OS === "ios"
          ? "https://apps.apple.com/app/kalpx/id6755144623"
          : "market://details?id=com.kalpx.app";
      Linking.openURL(storeUrl);
    }
  }}
/>
<NotificationPermissionModal
  visible={showNotificationPopup}
  onClose={() => setShowNotificationPopup(false)}
/>
         <LoadingOverlay visible={apiloading} text="Processing..." />
      </ScrollView>
    </SafeAreaView>
  );
}

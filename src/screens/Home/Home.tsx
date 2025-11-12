// screens/Home.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import * as Updates from "expo-updates";
import moment from "moment";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  Image,
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
import Colors from "../../components/Colors";
import ExploreVideos from "../../components/ExploreVideos";
import FestivalCard from "../../components/FestivalCard";
import FontSize from "../../components/FontSize";
import Header from "../../components/Header";
import LanguageTimezoneModal from "../../components/LanguageTimezoneModal";
import MantraCard from "../../components/MantraCard";
import SankalpCard from "../../components/SankalpCard";
import SigninPopup from "../../components/SigninPopup";
import TextComponent from "../../components/TextComponent";
import UpdateAppModal from "../../components/UpdateModal";
import { useUserLocation } from "../../components/useUserLocation";
import WisdomCard from "../../components/WisdomCard";
import YoutubeModal from "../../components/youtubeModal";
import { CATALOGS } from "../../data/mantras";
import { usePracticeStore } from "../../data/Practice";
import { RootState } from "../../store";
import { saveUserAction } from "../../utils/storage";
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



export default function Home() {
  const navigation: any = useNavigation();
  const { t,i18n } = useTranslation();
    const userLang = i18n.language.split("-")[0]; 
  const [trackerData, setTrackerData] = useState<any>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [showLangTZModal, setShowLangTZModal] = useState(false);

  // ✅ Use our reusable hook
  const { locationData, loading: locationLoading, error: locationError } = useUserLocation();

  const [showVideo, setShowVideo] = useState(false);
  const [showMantraTaken, setShowMantraTaken] = useState(false);
  const [showMantraComplete, setShowMantraComplete] = useState(false);
  const [showSankalpTaken, setShowSankalpTaken] = useState(false);
  const [showSankalpComplete, setShowSankalpComplete] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
const [updateType, setUpdateType] = useState("");
  const { setDailyMantras } = usePracticeStore();
 const currentLang = i18n.language.split("-")[0];
  const youtubeUrl = "https://www.youtube.com/watch?v=INS2diQXIjA";
  const videoId = youtubeUrl.split("v=")[1];
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;

  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const { data: streakData, loading: streakLoading } = useSelector(
    (state: RootState) => state.practiceStreaksReducer
  );

    // ✅ New states for Explore videos
  const { data: exploreVideos, loading: exploreLoading, page, hasMore } = useSelector(
    (state: RootState) => state.videosReducer
  );

useEffect(() => {
  const checkForUpdates = async () => {
    console.log("🔍 Checking for updates...");

    try {
      // Check Expo OTA updates
      const update = await Updates.checkForUpdateAsync();
      console.log("🟡 OTA Update Check Result:", update);

      if (update.isAvailable) {
        setUpdateType("OTA");
        setShowUpdateModal(true);
        console.log("🚀 OTA update available!");
        return;
      }

      // Check Store versions
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

// useEffect(() => {
//   console.log("Manually showing update modal for testing...");
//   setShowUpdateModal(true);
// }, []);


useEffect(() => {
  const checkShowLocation = async () => {
    const shouldShow = await AsyncStorage.getItem("showLocationConfirm");
    if (shouldShow === "true") {
      setShowLangTZModal(true);
      // ✅ remove flag so it shows only once
      await AsyncStorage.removeItem("showLocationConfirm");
    }
  };
  checkShowLocation();
}, []);

useEffect(() => {
  const preloadMantras = () => {
    const langKey = currentLang.toLowerCase();
    const allMantras = CATALOGS[langKey] || CATALOGS.en;

    // 🗓️ Determine day index since a fixed start (like Jan 1, 2025)
    const startOfCycle = moment('2025-01-01');
    const today = moment().startOf('day');
    const dayIndex = today.diff(startOfCycle, 'days'); // number of days since start

    // 📦 Get next 5 mantras cyclically
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


  // ✅ Reload instantly when language changes
  useEffect(() => {
    const langKey = currentLang.toLowerCase();
    const allMantras = CATALOGS[langKey] || CATALOGS.en;
    const dailyFive = allMantras.slice(0, 5);
    setDailyMantras(dailyFive);
  }, [currentLang]);

  // ✅ Fetch All/All explore videos
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

  // ✅ Load more for Explore videos
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



  useEffect(() => {
    dispatch(
      getPracticeToday((res) => {
        console.log("✅ Practice Today Callback Response:::::::::>>>>>>>>>>>>>", res);
      })
    );
  }, [dispatch]);

  const topChips = [
    { id: "1", label: t("cards.mantra") },
    { id: "2", label: t("cards.sankalp") },
    { id: "3", label:t("cards.festival")  },
    { id: "4", label:t("cards.wisdom") },
  ];

  const handleChipPress = (id: string) => {
    setExpandedItemId((prev) => (prev === id ? null : id));
  };

  const categories = [
    {
      id: "1",
      name:
        trackerData?.active_practices?.length > 0
          ? t("categories.sadana")
          : t("categories.dharma"),
      title: trackerData?.active_practices?.length > 0 ? "MySadana" : "Dharma",
      event_type: "click_dharma_card",
      component: "Dharma-card",
      icon: require("../../../assets/Group.png"),
    },
    {
      id: "2",
      name: t("categories.explore"),
      title: "Explore",
      event_type: "click_explore_card",
      component: "Explore-card",
      icon: require("../../../assets/Exploreicon.png"),
    },
    // {
    //   id: "3",
    //   name: t("categories.travel"),
    //   title: "Travel",
    //   event_type: "click_travel_card",
    //   component: "Travel-card",
    //   icon: require("../../../assets/darma.png"),
    // },
    // {
    //   id: "4",
    //   name: t("categories.pooja"),
    //   title: "Pooja",
    //   event_type: "click_pooja_card",
    //   component: "Pooja-card",
    //   icon: require("../../../assets/pooja.png"),
    // },
    {
      id: "5",
      name: t("categories.retreat"),
      title: "Retreat",
      event_type: "click_retreat_card",
      component: "Retreat-card",
      icon: require("../../../assets/yoga.png"),
    },
    // {
    //   id: "6",
    //   name: t("categories.classes"),
    //   title: "ClassesScreen",
    //   event_type: "click_classes_card",
    //   component: "Classes-card",
    //   icon: require("../../../assets/onlinecion.png"),
    // },
  ];

  const dailyOptions = [
  {
    id: "1",
    title: t("cards.sankalp_card.title"),
    subtitle: t("cards.sankalp_card.subtitle"),
    route: "Sankalp",
    event_type: "view_sankalp_card",
    component: "sankalp-card",
    icon: require("../../../assets/lamp.png"),
  },
  {
    id: "2",
    title: t("cards.mantra_card.title"),
    subtitle: t("cards.mantra_card.subtitle"),
    route: "Mantra",
    event_type: "view_mantra_card",
    component: "mantra-card",
    icon: require("../../../assets/atom.png"),
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


  // const dailyOptions = [
  //   {
  //     id: "1",
  //     title: "Chant Today’s Mantra",
  //     route: "Sankalp",
  //     event_type: "view_sankalp_card",
  //     component: "sankalp-card",
  //     subtitle:
  //       "Feel the peace unfold within start your day by chanting today’s mantra.",
  //     icon: require("../../../assets/lamp.png"),
  //   },
  //   {
  //     id: "2",
  //     title: "Set Your Sankalp",
  //     route: "Mantra",
  //     event_type: "view_mantra_card",
  //     component: "mantra-card",
  //     subtitle:
  //       "Set a sacred intension that connects your heart to your purpose.",
  //     icon: require("../../../assets/atom.png"),
  //   },
  //   {
  //     id: "3",
  //     title: "Explore Festivals",
  //     route: "Wisdom",
  //     event_type: "view_wisdom_card",
  //     component: "wisdom-card",
  //     subtitle: "Discover upcoming festivals and their significance.",
  //     icon: require("../../../assets/sun.png"),
  //   },
  //   {
  //     id: "4",
  //     title: "Reflect on Wisdom",
  //     route: "UpcomingFestivals",
  //     event_type: "view_festival_card",
  //     component: "festival-card",
  //     subtitle: "Find inspiration in timeless sanatan insights.",
  //     icon: require("../../../assets/party.png"),
  //   },
  // ];

  const kalpXData = [
    {
      id: "1",
      title: t("kalpx.learn"),
      name: "LearnMore",
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
      name: trackerData?.active_practices?.length > 0 ? "MySadana" : "Dharma",
      event_type: "click_practice_card",
      component: "Practice-card",
      image: require("../../../assets/daily.png"),
    },
    {
      id: "4",
      title: t("kalpx.journey"),
      name: "Travel",
      event_type: "click_journey_card",
      component: "Journey-card",
      image: require("../../../assets/journey.png"),
    },
    {
      id: "5",
      title: t("kalpx.poojas"),
      name: "Pooja",
      event_type: "click_pooja_card",
      component: "Pooja-card",
      image: require("../../../assets/poojafl.png"),
    },
    {
      id: "6",
      title: t("kalpx.retreats"),
      name: "Retreat",
      event_type: "click_retreats_card",
      component: "Retreats-card",
      image: require("../../../assets/retreatff.png"),
    },
    {
      id: "7",
      title: t("kalpx.Classes"),
      name: "ClassesScreen",
      event_type: "click_classes_card",
      component: "Classes-card",
      image: require("../../../assets/onlineclass.png"),
    },
  ];

  const handleStartMantra = (mantra) => {
    const payload = {
      kind: "mantra",
      practice_id: mantra.id,
      date_local: moment().format("YYYY-MM-DD"),
      tz: locationData?.timezone,
    };

    console.log("payload >>>>>>>>>", payload);

    dispatch(
      startMantraPractice(payload, (res) => {
        console.log("🎯 Mantra start callback:", res);
        if (res.success) {
          setShowMantraTaken(true);
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
          setShowMantraComplete(true);
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
          setShowSankalpTaken(true);
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
          setShowSankalpComplete(true);
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
      <Image source={item.icon} style={styles.icon} resizeMode="contain" />
      <TextComponent type="headerSubBoldText" style={styles.cardText}>{item.name}</TextComponent>
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
        <View style={{ marginTop: 10, zIndex: 999, height:640 }}>
           <MantraCard
          practiceTodayData={practiceTodayData}
          onPressChantMantra={(mantra) => handleStartMantra(mantra)}
          DoneMantraCalled={(mantra) => {
            DoneMantraCalled(mantra);
          }}
        />
        </View>
      )}
      {expandedItemId === item.id && item.id === "2" && (
        <View style={{ marginTop: 10, zIndex: 999, height: 560 }}>
          <SankalpCard
            practiceTodayData={practiceTodayData}
            onPressStartSankalp={(sankalp) => handleStartSankalp(sankalp)}
            onCompleteSankalp={(sankalp) => DoneSankalpCalled(sankalp)}
          />
        </View>
      )}
      {expandedItemId === item.id && item.id === "4" && (
        <View style={{ marginTop: 10, zIndex: 999, height: 500 }}>
          <WisdomCard />
        </View>
      )}

      {expandedItemId === item.id && item.id === "3" && (
        <View style={{ marginTop: 10, zIndex: 999, height: 640}}>
          <FestivalCard />
        </View>
      )}
    </>
  );



  const renderKalpXItem = ({ item }) => (
  <TouchableOpacity
    style={[styles.kalpXCard, { width: CARD_WIDTH }]} // ✅ dynamic width applied
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
        {/* ✅ Horizontal Categories */}
        <View style={{ marginTop: 15,alignItems:"center"}}>
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
        <Card
  style={styles.streakCard}
  onPress={() => navigation.navigate("StreakScreen")}
>
  <View style={{alignItems:"center"}}>
  {/* ✅ Scrollable single-row layout */}
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.streakScrollContainer}
  >
    {/* 🔹 Sankalp */}
    <View style={styles.streakItem}>
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

    {/* 🔹 Mantra */}
    <View style={styles.streakItem}>
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

    {/* 🔹 Daily Practice */}
    <View style={styles.streakItem}>
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
  </ScrollView>
  </View>
</Card>
{/* 
     <Card
  style={styles.streakCard}
  onPress={() => {
    navigation.navigate("StreakScreen");
  }}
>
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap", // ✅ allow multiple lines
    }}
  >
    <View style={{ flexDirection: "row", alignItems: "center", flexShrink: 1 }}>
      <Image
        source={require("../../../assets/streak1.png")}
        style={{ height: 20, width: 20 }}
      />
      <TextComponent
        type="streakSubText"
        style={[styles.count, { flexShrink: 1 }]} // ✅ allow shrinking
      >
        {streakData?.sankalp ?? 0}
      </TextComponent>
      <TextComponent
        type="streakSubText"
        style={[styles.streakText, { flexWrap: "wrap", flexShrink: 1, maxWidth: 80 }]} // ✅ wrap text
      >
        {t("streak.sankalp")}
      </TextComponent>
    </View>

    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 20,
        flexShrink: 1,
      }}
    >
      <Image
        source={require("../../../assets/streak2.png")}
        style={{ height: 20, width: 20 }}
      />
      <TextComponent
        type="streakSubText"
        style={[styles.count, { flexShrink: 1 }]}
      >
        {streakData?.mantra ?? 0}
      </TextComponent>
      <TextComponent
        type="streakSubText"
        style={[styles.streakText, { flexWrap: "wrap", flexShrink: 1, maxWidth: 80 }]}
      >
        {t("streak.mantra")}
      </TextComponent>
    </View>

    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 20,
        flexShrink: 1,
      }}
    >
      <Image
        source={require("../../../assets/streak3.png")}
        style={{ height: 20, width: 20 }}
      />
      <TextComponent
        type="streakSubText"
        style={[styles.count, { flexShrink: 1 }]}
      >
        {trackerData?.streak_count ?? 0}
      </TextComponent>
      <TextComponent
        type="streakSubText"
        style={[styles.streakText, { flexWrap: "wrap", flexShrink: 1, maxWidth: 80 }]} // ✅ wraps text
      >
        {t("streak.DailyPractice")}
      </TextComponent>
    </View>
  </View>
</Card> */}


        <View style={styles.dailyContainer}>
          <TextComponent type="headerText" style={styles.sectionHeading}>
                                                    {t("streak.stepText")}
          </TextComponent>

          {expandedItemId && (
            <View style={{ marginVertical: 10 }}>
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
          )}

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

        <View style={{ margin: 16 }}>
          <TouchableOpacity
  activeOpacity={0.8}
  style={{ marginTop: 16, borderRadius: 10, overflow: "hidden" }}
  onPress={() => setShowVideo(true)}
>
  <View style={{ position: "relative" }}>
    {/* 🎥 Thumbnail */}
    <Image
      source={{ uri: thumbnailUrl }}
      style={{ width: "100%", height: 200, borderRadius: 8 }}
      resizeMode="cover"
    />

    {/* ▶️ Centered Play Button */}
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

          {/* <TouchableOpacity
            activeOpacity={0.8}
            style={{ marginTop: 16, borderRadius: 10, overflow: "hidden" }}
            onPress={() => setShowVideo(true)}
          >
            <Image
              source={{ uri: thumbnailUrl }}
              style={{ width: "100%", height: 200, borderRadius: 8 }}
              resizeMode="cover"
            />
          </TouchableOpacity> */}
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
        </View>

        <View style={{ paddingHorizontal: 12 }}>
          <ExploreVideos
      videos={exploreVideos}
      onLoadMore={handleLoadMore}
      loading={exploreLoading}
      home={true}
    />
        </View>

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
        {/* Popups */}
        <SigninPopup
          visible={showMantraTaken}
          onClose={() => setShowMantraTaken(false)}
          onConfirmCancel={() => {}}
          title="🌟 Mantra Taken!"
          subText='"One small step, one powerful shift. You’ve committed to building your inner strength today."'
          infoTexts={[
            "Get daily reminders",
            "Track your Mantra streak",
            "Make this part of your daily spiritual practice",
            // "Make this my Daily Mantra",
          ]}
          bottomText="Want a gentle reminder to complete your Mantra by day's end?"
        />
           <SigninPopup
          visible={showMantraTaken}
          onClose={() => setShowMantraTaken(false)}
          onConfirmCancel={() => {}}
          title="🌟 Great job taking your Mantra!"
          subText='"Your journey toward inner strength is on track. Tap below to repeat this intention every day and build your streak."'
          infoTexts={[
          "Want to make this your Daily Mantra?",
"You'll get reminders and track how many days you stay committed!"
          ]}
          bottomText="Want a gentle reminder to complete your Mantra by day's end?"
        />

        <SigninPopup
          visible={showMantraComplete}
          onClose={() => setShowMantraComplete(false)}
          onConfirmCancel={() => {}}
          title="🌼 Beautiful! You've completed your Mantra today."
          subText='"But your progress isn’t being saved."'
          infoTexts={[
            "Keep your Mantra streak alive",
            "Receive gentle nudges to stay on track",
            "View your growth over time",
          ]}
          bottomText=""
        />

          <SigninPopup
          visible={showMantraComplete}
          onClose={() => setShowMantraComplete(false)}
          onConfirmCancel={() => {}}
          title="🌼 Well done!"
          subText='"Every time you complete your Mantra, you nurture your inner self."'
          infoTexts={[
           "You're keeping your streak alive!",
"See you tomorrow for your next step on this journey."
          ]}
          bottomText=""
        />

        <SigninPopup
          visible={showSankalpTaken}
          onClose={() => setShowSankalpTaken(false)}
          onConfirmCancel={() => {}}
          title="Sankalp Taken!"
          subText={
            "One small step, one powerful shift. You've committed to building your inner strength today."
          }
          infoTexts={[
            "Get daily reminders",
            "Track your Sankalp streak",
            "Make this part of your daily spiritual practice",
          ]}
          bottomText="Want a gentle reminder to complete your Sankalp by day's end?"
        />
  <LanguageTimezoneModal
    visible={showLangTZModal}
    onClose={() => setShowLangTZModal(false)}
  />
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
          ? "itms-apps://apps.apple.com/app/YOUR_APP_ID"
          : "market://details?id=com.kalpx.app";
      Linking.openURL(storeUrl);
    }
  }}
/>

        <SigninPopup
          visible={showSankalpComplete}
          onClose={() => setShowSankalpComplete(false)}
          onConfirmCancel={() => {}}
          title="🌼 Beautiful! You've completed your Sankalp today."
          subText={"But your progress isn't being saved."}
          infoTexts={[
            "• Keep your Sankalp streak alive",
            "• Receive gentle nudges to stay on track",
            "• View your growth over time",
          ]}
          bottomText=""
        />
      </ScrollView>
    </SafeAreaView>
  );
}

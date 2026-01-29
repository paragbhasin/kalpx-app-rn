// screens/Home.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  // ScrollView,
  StatusBar,
  TouchableOpacity,
  View
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Card } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import Colors from "../../components/Colors";
import FestivalCard from "../../components/FestivalCard";
import Header from "../../components/Header";
import LoadingOverlay from "../../components/LoadingOverlay";
import MantraCard from "../../components/MantraCard";
import SankalpCard from "../../components/SankalpCard";
import SigninPopup from "../../components/SigninPopup";
import TextComponent from "../../components/TextComponent";
import { useUserLocation } from "../../components/useUserLocation";
import WisdomCard from "../../components/WisdomCard";
import { CATALOGS } from "../../data/mantras";
import { usePracticeStore } from "../../data/Practice";
import { RootState } from "../../store";
import { saveUserAction } from "../../utils/storage";
import {
  completeMantra,
  getDailyDharmaTracker,
  getPracticeStreaks,
  getPracticeToday,
  startMantraPractice
} from "../Home/actions";
import styles from "../Home/homestyles";

const { width } = Dimensions.get("window");
const CARD_MARGIN = 14;
const CARD_WIDTH = (width - CARD_MARGIN * 3) / 2;

export const collapseControl = { avoidCollapse: false };

export default function DailyPracticeMantra() {
  const navigation: any = useNavigation();
  const { t, i18n } = useTranslation();
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
  const user = useSelector((state: RootState) => state.login?.user || state.socialLoginReducer?.user);
  const isLoggedIn = !!user;
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
      if (collapseControl.avoidCollapse) {
        collapseControl.avoidCollapse = false;
        return;
      }
      setExpandedItemId(null);
    }, [])
  );



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
        console.log("✅ practiceTodayData Practice Today Callback Response:::::::::>>>>>>>>>>>>>", practiceTodayData);
      })
    );
  }, [dispatch]);

  const topChips = [
    { id: "1", label: t("cards.sankalp") },
    { id: "2", label: t("cards.mantra") },
    { id: "4", label: t("cards.wisdom") },
    { id: "3", label: t("cards.festival") },
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
        : "DailyPracticeLogin",
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
      id: "4",
      title: t("cards.wisdom_card.title"),
      subtitle: t("cards.wisdom_card.subtitle"),
      route: "UpcomingFestivals",
      event_type: "view_festival_card",
      component: "festival-card",
      icon: require("../../../assets/party.png"),
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
  ];

  const handleStartMantra = (mantra, reps) => {
    const payload = {
      kind: "mantra",
      practice_id: mantra.id,
      date_local: moment().format("YYYY-MM-DD"),
      tz: locationData?.timezone,
      reps: reps
    };

    console.log("payload >>>>>>>>>", payload);

    dispatch(
      startMantraPractice(payload, (res) => {
        console.log("🎯 Mantra start callback:", res);
        if (res.success) {
          if (!isLoggedIn) {
            setShowMantraTaken(true);
          } else {
            setShowLoginMantraTaken(true);
          }
          dispatch(getPracticeToday(() => { }));
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
          if (!isLoggedIn) {
            setShowMantraComplete(true);
          } else {
            setShowLoginMantraComplete(true);
          }
          dispatch(getPracticeToday(() => { }));
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
          if (!isLoggedIn) {
            setShowSankalpTaken(true);
          } else {
            setShowLoginSankalpTaken(true);
          }
          dispatch(getPracticeToday(() => { }));
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
          if (!isLoggedIn) {
            setShowSankalpComplete(true);
          } else {
            setShowLoginSankalpComplete(true);
          }
          dispatch(getPracticeToday(() => { }));
        }
      })
    );
  };



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
        <View style={{ marginTop: 10, zIndex: 999, }}>
          <SankalpCard
            practiceTodayData={practiceTodayData}
            onPressStartSankalp={(sankalp) => {
              setSelectedSankalpForPopup(sankalp);
              handleStartSankalp(sankalp);
            }}
            onCompleteSankalp={(sankalp) => {
              setSelectedSankalpForPopup(sankalp);
              DoneSankalpCalled(sankalp);
            }}
          />
        </View>
      )}
      {expandedItemId === item.id && item.id === "2" && (
        <View style={{ marginTop: 10, zIndex: 999, }}>
          <MantraCard
            practiceTodayData={practiceTodayData}
            onPressChantMantra={(mantra, reps) => {
              console.log("Selected Mantra for Start:", mantra, reps);
              setSelectedMantraForPopup(mantra);
              handleStartMantra(mantra, reps);
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
        <View style={{ marginTop: 10, zIndex: 999, }}>
          <FestivalCard />
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Colors.white }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.Colors.header_bg}
        translucent={false}
      />
      {/* <ImageBackground
            source={require("../../../assets/Tracker_BG.png")}
            style={{
              flex: 1,
              width: FontSize.CONSTS.DEVICE_WIDTH,
              alignSelf: "center",
              justifyContent: "flex-start",
            }}
            imageStyle={{
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }}
          > */}
      <Header />
      <ScrollView
        nestedScrollEnabled={true}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={{
            marginHorizontal: 16, marginTop: 12
          }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <View style={styles.dailyContainer}>
          <TextComponent type="headerText" style={styles.sectionHeading}>
            {t("streak.stepText")}
          </TextComponent>
          <TextComponent type="cardSubTitleText" style={{ alignSelf: "center", textAlign: "center", marginBottom: 10, marginTop: 4, marginHorizontal: 12 }}>
            {t("dailyPracticeLogin.vedictext")}
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
        <TextComponent type="mediumText" style={{ alignSelf: "center", textAlign: "center", color: Colors.Colors.blue_text, marginTop: 20 }} >“{t("dailyPracticeLogin.todaytext")}”</TextComponent>
        <TextComponent type="mediumText" style={{ alignSelf: "center", textAlign: "center", color: Colors.Colors.blue_text, marginBottom: 30 }} > {t("dailyPracticeLogin.simplepractce")}</TextComponent>
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
          onConfirmCancel={() => { }}
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
          onConfirmCancel={() => { }}
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
        <LoadingOverlay visible={apiloading} text="Processing..." />
      </ScrollView>

      {/* </ImageBackground> */}
    </SafeAreaView>
  );
}

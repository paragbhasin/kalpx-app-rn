// screens/Home.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import moment from "moment";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Card } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import Colors from "../../components/Colors";
import ExploreVideos from "../../components/ExploreVideos";
import FestivalCard from "../../components/FestivalCard";
import FontSize from "../../components/FontSize";
import Header from "../../components/Header";
import MantraCard from "../../components/MantraCard";
import SankalpCard from "../../components/SankalpCard";
import SigninPopup from "../../components/SigninPopup";
import TextComponent from "../../components/TextComponent";
import { useUserLocation } from "../../components/useUserLocation";
import WisdomCard from "../../components/WisdomCard";
import YoutubeModal from "../../components/youtubeModal";
import { RootState } from "../../store";
import { saveUserAction } from "../../utils/storage";
import {
  completeMantra,
  getDailyDharmaTracker,
  getPracticeStreaks,
  getPracticeToday,
  startMantraPractice,
} from "./actions";
import styles from "./homestyles";

export default function Home() {
  const navigation: any = useNavigation();
  const { t } = useTranslation();
  const [trackerData, setTrackerData] = useState<any>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // ✅ Use our reusable hook
  const { locationData, loading: locationLoading, error: locationError } = useUserLocation();

  const [showVideo, setShowVideo] = useState(false);
  const [showMantraTaken, setShowMantraTaken] = useState(false);
  const [showMantraComplete, setShowMantraComplete] = useState(false);
  const [showSankalpTaken, setShowSankalpTaken] = useState(false);
  const [showSankalpComplete, setShowSankalpComplete] = useState(false);

  const youtubeUrl = "https://www.youtube.com/watch?v=INS2diQXIjA";
  const videoId = youtubeUrl.split("v=")[1];
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;

  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const { data: streakData, loading: streakLoading } = useSelector(
    (state: RootState) => state.practiceStreaksReducer
  );

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
    { id: "1", label: "Mantra" },
    { id: "2", label: "Sankalp" },
    { id: "3", label: "Festival" },
    { id: "4", label: "Wisdom" },
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
    {
      id: "3",
      name: t("categories.travel"),
      title: "Travel",
      event_type: "click_travel_card",
      component: "Travel-card",
      icon: require("../../../assets/darma.png"),
    },
    {
      id: "4",
      name: t("categories.pooja"),
      title: "Pooja",
      event_type: "click_pooja_card",
      component: "Pooja-card",
      icon: require("../../../assets/pooja.png"),
    },
    {
      id: "5",
      name: t("categories.retreat"),
      title: "Retreat",
      event_type: "click_retreat_card",
      component: "Retreat-card",
      icon: require("../../../assets/yoga.png"),
    },
    {
      id: "6",
      name: t("categories.classes"),
      title: "ClassesScreen",
      event_type: "click_classes_card",
      component: "Classes-card",
      icon: require("../../../assets/onlinecion.png"),
    },
  ];

  const dailyOptions = [
    {
      id: "1",
      title: "Chant Today’s Mantra",
      route: "Sankalp",
      event_type: "view_sankalp_card",
      component: "sankalp-card",
      subtitle:
        "Feel the peace unfold within start your day by chanting today’s mantra.",
      icon: require("../../../assets/lamp.png"),
    },
    {
      id: "2",
      title: "Set Your Sankalp",
      route: "Mantra",
      event_type: "view_mantra_card",
      component: "mantra-card",
      subtitle:
        "Set a sacred intension that connects your heart to your purpose.",
      icon: require("../../../assets/atom.png"),
    },
    {
      id: "3",
      title: "Explore Festivals",
      route: "Wisdom",
      event_type: "view_wisdom_card",
      component: "wisdom-card",
      subtitle: "Discover upcoming festivals and their significance.",
      icon: require("../../../assets/sun.png"),
    },
    {
      id: "4",
      title: "Reflect on Wisdom",
      route: "UpcomingFestivals",
      event_type: "view_festival_card",
      component: "festival-card",
      subtitle: "Find inspiration in timeless sanatan insights.",
      icon: require("../../../assets/party.png"),
    },
  ];

  const kalpXData = [
    {
      id: "1",
      title: t("kalpx.learn"),
      name: "Learn",
      event_type: "click_learn_card",
      component: "Learn-card",
      image: require("../../../assets/learn.png"),
    },
    {
      id: "2",
      title: t("kalpx.explore"),
      name: "Explore",
      event_type: "click_explore_card",
      component: "Explore-card",
      image: require("../../../assets/explore.png"),
    },
    {
      id: "3",
      title: t("kalpx.practice"),
      name: "Practice",
      event_type: "click_practice_card",
      component: "Practice-card",
      image: require("../../../assets/daily.png"),
    },
    {
      id: "4",
      title: t("kalpx.journey"),
      name: "Journey",
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
      name: "Retreats",
      event_type: "click_retreats_card",
      component: "Retreats-card",
      image: require("../../../assets/retreatff.png"),
    },
    {
      id: "7",
      title: t("kalpx.Classes"),
      name: "Classes",
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
      <Text style={styles.cardText}>{item.name}</Text>
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
            style={styles.arrowIcon}
            resizeMode="contain"
          />
        </View>
      </Card>

      {expandedItemId === item.id && item.id === "1" && (
        <View style={{ marginTop: 10, zIndex: 999, height: 500 }}>
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
        <View style={{ marginTop: 10, zIndex: 999, height: 380 }}>
          <SankalpCard
            practiceTodayData={practiceTodayData}
            onPressStartSankalp={(sankalp) => handleStartSankalp(sankalp)}
            onCompleteSankalp={(sankalp) => DoneSankalpCalled(sankalp)}
          />
        </View>
      )}

      {expandedItemId === item.id && item.id === "4" && (
        <View style={{ marginTop: 10, zIndex: 999, height: 380 }}>
          <WisdomCard />
        </View>
      )}

      {expandedItemId === item.id && item.id === "3" && (
        <View style={{ marginTop: 10, zIndex: 999, height: 950 }}>
          <FestivalCard />
        </View>
      )}
    </>
  );

  const renderKalpXItem = ({ item }) => (
    <TouchableOpacity
      style={styles.kalpXCard}
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
      <Image source={item.image} style={styles.kalpXImage} />
      <Text style={styles.kalpXTitle}>{item.title}</Text>
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
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ✅ Horizontal Categories */}
        <View style={{ marginTop: 10 }}>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 10,
              paddingBottom: 20,
            }}
          />
        </View>

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
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("../../../assets/streak1.png")}
                style={{ height: 20, width: 20 }}
              />
              <TextComponent type="boldText" style={styles.count}>
                {streakData?.sankalp ?? 0}
              </TextComponent>
              <TextComponent type="mediumText" style={styles.streakText}>
                Sankalp
              </TextComponent>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginLeft: 20,
              }}
            >
              <Image
                source={require("../../../assets/streak2.png")}
                style={{ height: 20, width: 20 }}
              />
              <TextComponent type="boldText" style={styles.count}>
                {streakData?.mantra ?? 0}
              </TextComponent>
              <TextComponent type="mediumText" style={styles.streakText}>
                Mantra
              </TextComponent>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginLeft: 20,
              }}
            >
              <Image
                source={require("../../../assets/streak3.png")}
                style={{ height: 20, width: 20 }}
              />
              <TextComponent type="boldText" style={styles.count}>
                {trackerData?.streak_count ?? 0}
              </TextComponent>
              <TextComponent type="mediumText" style={styles.streakText}>
                Daily Practice
              </TextComponent>
            </View>
          </View>
        </Card>

        <View style={styles.dailyContainer}>
          <TextComponent type="mediumText" style={styles.sectionHeading}>
            Step Into Today With Purpose
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
                            ? Colors.Colors.BLACK
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
            <Image
              source={{ uri: thumbnailUrl }}
              style={{ width: "100%", height: 200, borderRadius: 8 }}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <TextComponent
            type="boldText"
            style={{
              color: Colors.Colors.BLACK,
              fontSize: FontSize.CONSTS.FS_16,
              marginTop: 8,
            }}
          >
            KalpX – Connect to Your Roots
          </TextComponent>
          <TextComponent
            type="cardText"
            style={{
              color: Colors.Colors.Light_grey,
              marginTop: 4,
            }}
          >
            Discover the soul of Sanatan Dharma through Explore Videos, Daily
            Practice, Live Darshan, Temple Poojas, Retreats, Satsang Circles,
            Mantra Chanting, and Sacred Journeys.
          </TextComponent>
          <TextComponent
            type="cardText"
            style={{
              color: Colors.Colors.Light_grey,
              marginTop: 4,
            }}
          >
            Whether you’re seeking knowledge, devotion, or inner balance — your
            journey begins here.
          </TextComponent>
          <YoutubeModal
            visible={showVideo}
            onClose={() => setShowVideo(false)}
            youtubeUrl="https://www.youtube.com/watch?v=INS2diQXIjA"
          />
        </View>

        <View style={{ paddingLeft: 12 }}>
          <ExploreVideos />
        </View>

        <View style={styles.kalpXContainer}>
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







// // screens/Home.js
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import { AnyAction } from "@reduxjs/toolkit";
// import * as Location from "expo-location";
// import moment from "moment";
// import { useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   FlatList,
//   Image,
//   Platform,
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { Card } from "react-native-paper";
// import { useDispatch, useSelector } from "react-redux";
// import { ThunkDispatch } from "redux-thunk";
// import Colors from "../../components/Colors";
// import ExploreVideos from "../../components/ExploreVideos";
// import FestivalCard from "../../components/FestivalCard";
// import FontSize from "../../components/FontSize";
// import Header from "../../components/Header";
// import MantraCard from "../../components/MantraCard";
// import SankalpCard from "../../components/SankalpCard";
// import SigninPopup from "../../components/SigninPopup";
// import TextComponent from "../../components/TextComponent";
// import WisdomCard from "../../components/WisdomCard";
// import YoutubeModal from "../../components/youtubeModal";
// import { RootState } from "../../store";
// import { getUserActions, saveUserAction } from "../../utils/storage";
// import { completeMantra, getDailyDharmaTracker, getPracticeStreaks, getPracticeToday, startMantraPractice } from "./actions";
// import styles from "./homestyles";

// export default function Home() {
//   const navigation: any = useNavigation();
//   const { t } = useTranslation();
//   const [trackerData, setTrackerData] = useState<any>(null);


//   const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
//   const [locationData, setLocationData] = useState({
//     city: "",
//     lat: "",
//     long: "",
//     timeZone: "",
//   });

//   const [showVideo, setShowVideo] = useState(false);
// const [showMantraTaken, setShowMantraTaken] = useState(false);
// const [showMantraComplete, setShowMantraComplete] = useState(false);
// const [showSankalpTaken, setShowSankalpTaken] = useState(false);
// const [showSankalpComplete, setShowSankalpComplete] = useState(false);


//   const youtubeUrl = "https://www.youtube.com/watch?v=INS2diQXIjA";
//   const videoId = youtubeUrl.split("v=")[1];
//   const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
  
//   const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

//   const { data: streakData, loading: streakLoading } = useSelector(
//   (state: RootState) => state.practiceStreaksReducer
// );

// useEffect(() => {
//   dispatch(
//     getDailyDharmaTracker((res) => {
//       if (res.success) {
//          setTrackerData(res.data);
//         console.log("✅ Daily Dharma Tracker Data::::::::::", res.data);
//       } else {
//         console.error("❌ Failed to fetch tracker:", res.error);
//       }
//     })
//   );
// }, [dispatch]);

// useEffect(() => {
//   dispatch(
//     getPracticeStreaks((res) => {
//       console.log("✅ Streaks fetched:", res);
//     })
//   );
// }, [dispatch]);

//   const { data: practiceTodayData, loading } = useSelector(
//     (state: RootState) => state.practiceTodayReducer
//   );

//   // ✅ Proper callback with ThunkDispatch typing
//   useEffect(() => {
//     dispatch(
//       getPracticeToday((res) => {
//         console.log("✅ Practice Today Callback Response:::::::::>>>>>>>>>>>>>", res);
//       })
//     );
//   }, [dispatch]);

//     const topChips = [
//     { id: "1", label: "Mantra" },
//     { id: "2", label: "Sankalp" },
//     { id: "3", label: "Festival" },
//     { id: "4", label: "Wisdom" },
//   ];

//   const handleChipPress = (id: string) => {
//     // If already selected, collapse it
//     setExpandedItemId((prev) => (prev === id ? null : id));
//   };


//   // Define categories with translated names

//   const categories = [
//     {
//       id: "1",
//       name: trackerData?.active_practices?.length > 0 ? t("categories.sadana"): t("categories.dharma"),
//       title: trackerData?.active_practices?.length > 0 ?  "MySadana" : "Dharma",
//       event_type: "click_dharma_card",
//       component: "Dharma-card",
//       icon: require("../../../assets/Group.png"),
//     },
//     {
//       id: "2",
//       name: t("categories.explore"),
//       title: "Explore",
//       event_type: "click_explore_card",
//       component: "Explore-card",
//       icon: require("../../../assets/Exploreicon.png"),
//     },
//     {
//       id: "3",
//       name: t("categories.travel"),
//       title: "Travel",
//       event_type: "click_travel_card",
//       component: "Travel-card",
//       icon: require("../../../assets/darma.png"),
//     },
//     {
//       id: "4",
//       name: t("categories.pooja"),
//       title: "Pooja",
//       event_type: "click_pooja_card",
//       component: "Pooja-card",
//       icon: require("../../../assets/pooja.png"),
//     },
//     {
//       id: "5",
//       name: t("categories.retreat"),
//       title: "Retreat",
//       event_type: "click_retreat_card",
//       component: "Retreat-card",
//       icon: require("../../../assets/yoga.png"),
//     },
//     {
//       id: "6",
//       name: t("categories.classes"),
//       title: "ClassesScreen",
//       event_type: "click_classes_card",
//       component: "Classes-card",
//       icon: require("../../../assets/onlinecion.png"),
//     },
//   ];

//   const dailyOptions = [
//     {
//       id: "1",
//       title: "Chant Today’s Mantra",
//       route: "Sankalp",
//       event_type: "view_sankalp_card",
//       component: "sankalp-card",
//       subtitle: "Feel the peace unfold within start your day by chanting today’s mantra." ,
//       icon: require("../../../assets/lamp.png"),
//     },
//     {
//       id: "2",
//       title: "Set Your Sankalp",
//       route: "Mantra",
//       event_type: "view_mantra_card",
//       component: "mantra-card",
//       subtitle: "Set a sacred intension that connects your heart to your purpose.",
//       icon: require("../../../assets/atom.png"),
//     },
//     {
//       id: "3",
//       title: "Explore Festivals",
//       route: "Wisdom",
//       event_type: "view_wisdom_card",
//       component: "wisdom-card",
//       subtitle: "Discover upcoming festivals and their significance.",
//       icon: require("../../../assets/sun.png"),
//     },
//     {
//       id: "4",
//       title: "Reflect on Wisdom",
//       route: "UpcomingFestivals",
//       event_type: "view_festival_card",
//       component: "festival-card",
//       subtitle: "Find inspiration in timeless sanatan insights.",
//       icon: require("../../../assets/party.png"),
//     },
//   ];

//   const kalpXData = [
//     {
//       id: "1",
//       title: t("kalpx.learn"),
//       name: "Learn",
//       event_type: "click_learn_card",
//       component: "Learn-card",
//       image: require("../../../assets/learn.png"),
//     },
//     {
//       id: "2",
//       title: t("kalpx.explore"),
//       name: "Explore",
//       event_type: "click_explore_card",
//       component: "Explore-card",
//       image: require("../../../assets/explore.png"),
//     },
//     {
//       id: "3",
//       title: t("kalpx.practice"),
//       name: "Practice",
//       event_type: "click_practice_card",
//       component: "Practice-card",
//       image: require("../../../assets/daily.png"),
//     },
//     {
//       id: "4",
//       title: t("kalpx.journey"),
//       name: "Journey",
//       event_type: "click_journey_card",
//       component: "Journey-card",
//       image: require("../../../assets/journey.png"),
//     },
//     {
//       id: "5",
//       title: t("kalpx.poojas"),
//       name: "Pooja",
//       event_type: "click_pooja_card",
//       component: "Pooja-card",
//       image: require("../../../assets/poojafl.png"),
//     },
//     {
//       id: "6",
//       title: t("kalpx.retreats"),
//       name: "Retreats",
//       event_type: "click_retreats_card",
//       component: "Retreats-card",
//       image: require("../../../assets/retreatff.png"),
//     },
//     {
//       id: "7",
//       title: t("kalpx.Classes"),
//       name: "Classes",
//       event_type: "click_classes_card",
//       component: "Classes-card",
//       image: require("../../../assets/onlineclass.png"),
//     },
//   ];

//   useEffect(() => {
//   const getLocation = async () => {
//     try {
//       // ✅ 1️⃣ Try reading cached location (avoid reverse geocode spam)
//       const cached = await AsyncStorage.getItem("user_location");
//       if (cached) {
//         const parsed = JSON.parse(cached);
//         setLocationData(parsed);
//         console.log("📍 Using cached location:", parsed);
//         return;
//       }

//       // ✅ 2️⃣ Ask for permission
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         console.warn("Location permission denied");
//         return;
//       }

//       // ✅ 3️⃣ Get coordinates
//       const loc = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.High,
//       });

//       // ✅ 4️⃣ Get timezone
//       const tz =
//         Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";

//       // ✅ 5️⃣ Try reverse geocode safely
//       let cityName = "";
//       try {
//         const geo = await Location.reverseGeocodeAsync({
//           latitude: loc.coords.latitude,
//           longitude: loc.coords.longitude,
//         });
//         cityName = geo[0]?.city || geo[0]?.region || "";
//       } catch (geoError) {
//         console.warn("⚠️ Reverse geocode failed:", geoError.message);
//       }

//       // ✅ 6️⃣ Save + cache
//       const newData = {
//         city: cityName,
//         lat: loc.coords.latitude.toString(),
//         long: loc.coords.longitude.toString(),
//         timeZone: tz,
//       };

//       setLocationData(newData);
//       await AsyncStorage.setItem("user_location", JSON.stringify(newData));
//       console.log("✅ Saved location:", newData);
//     } catch (err) {
//       console.error("❌ Location error:", err);
//     }
//   };

//   getLocation();
// }, []);


//   // useEffect(() => {
//   //   const getLocation = async () => {
//   //     try {
//   //       let { status } = await Location.requestForegroundPermissionsAsync();
//   //       if (status !== "granted") {
//   //         // Permission denied → keep empty values
//   //         return;
//   //       }

//   //       // Get coords
//   //       let loc = await Location.getCurrentPositionAsync({});
//   //       // Reverse geocode for city
//   //       let geo = await Location.reverseGeocodeAsync({
//   //         latitude: loc.coords.latitude,
//   //         longitude: loc.coords.longitude,
//   //       });

//   //       const cityName = geo.length > 0 ? geo[0].city || geo[0].region : "";

//   //       // Get timezone from device
//   //       const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

//   //       setLocationData({
//   //         city: cityName,
//   //         lat: loc.coords.latitude.toString(),
//   //         long: loc.coords.longitude.toString(),
//   //         timeZone: tz,
//   //       });
//   //     } catch (err) {
//   //       console.log("Location error:", err);
//   //     }
//   //   };

//   //   getLocation();
//   // }, []);

//     const handleStartMantra = (mantra) => {
//       console.log("mantra >>>>>",mantra);
//     // if (!practiceTodayData?.ids?.mantra) return;

//     const payload = {
//       kind: "mantra",
//       practice_id: mantra.id,
//       date_local: moment().format("YYYY-MM-DD"),
//       tz: locationData?.timeZone
//     };

//     console.log("payload >>>>>>>>>",payload);

//     dispatch(
//       startMantraPractice(payload, (res) => {
//         console.log("🎯 Mantra start callback:", res);
//               if (res.success) {
//                  setShowMantraTaken(true);
//            dispatch(
//       getPracticeToday((res) => {
//         console.log("✅ Practice Today Callback Response:::::::::>>>>>>>>>>>>>", res);
//       })
//     );
//      } })
//     );
//   };

// const DoneMantraCalled = (mantra) => {
//   if (!mantra?.id) return;

//   const payload = {
//     type: "mantra",
//     item_id: mantra.id,
//     tz: locationData?.timeZone || "Asia/Calcutta",
//   };

//   console.log("Complete Mantra payload >>>>", payload);

//   dispatch(
//     completeMantra(payload, (res) => {
//       if (res.success) {
//          setShowMantraComplete(true);
//              dispatch(
//       getPracticeToday((res) => {
//         console.log("✅ Practice Today Callback Response:::::::::>>>>>>>>>>>>>", res);
//       })
//     );
//         console.log("✅ Mantra completed successfully:", res.data);
//       } else {
//         console.error("❌ Complete mantra error:", res.error);
//       }
//     })
//   );
// };

// const handleStartSankalp = (sankalp) => {
//   console.log("sankalp >>>>>", sankalp);

//   const payload = {
//     kind: "sankalp",
//     practice_id: sankalp.id,
//     date_local: moment().format("YYYY-MM-DD"),
//     tz: locationData?.timeZone,
//   };

//   console.log("Sankalp payload >>>>>>>>>", payload);

//   dispatch(
//     startMantraPractice(payload, (res) => {
//       console.log("🎯 Sankalp start callback:", res);
//         if (res.success) {
//         setShowSankalpTaken(true);
//       dispatch(
//         getPracticeToday((res) => {
//           console.log("✅ Practice Today refreshed after start Sankalp", res);
//         })
//       );
//  } })
//   );
// };

// const DoneSankalpCalled = (sankalp) => {
//   if (!sankalp?.id) return;

//   const payload = {
//     type: "sankalp",
//     item_id: sankalp.id,
//     tz: locationData?.timeZone || "Asia/Calcutta",
//   };

//   console.log("Complete Sankalp payload >>>>", payload);

//   dispatch(
//     completeMantra(payload, (res) => {
//       if (res.success) {
//           setShowSankalpComplete(true);
//         dispatch(
//           getPracticeToday((res) => {
//             console.log("✅ Practice Today refreshed after complete Sankalp", res);
//           })
//         );
//         console.log("✅ Sankalp completed successfully:", res.data);
//       } else {
//         console.error("❌ Complete Sankalp error:", res.error);
//       }
//     })
//   );
// };



//   const renderCategory = ({ item }) => (
//     <TouchableOpacity
//       style={styles.card}
//       onPress={async () => {
//         try {
//           const userId = await AsyncStorage.getItem("uuid");
//           await saveUserAction({
//             uuid: userId,
//             timestamp: Date.now(),
//             retryCount: 0,
//             event_type: item?.event_type,
//             event_data: {
//               component: item?.component,
//               city: locationData.city,
//               lat: locationData.lat,
//               long: locationData.long,
//               timeZone: locationData.timeZone,
//               device: Platform.OS === "ios" ? "mobile-ios" : "mobile-android",
//               screen: "home",
//             },
//           });
//           // clearUserActions()
//           const actions = await getUserActions();
//           console.log(actions);
//           navigation.navigate(item.title);
//         } catch (error) {
//           console.error("Error fetching UUID:", error);
//         }
//       }}
//     >
//       <Image source={item.icon} style={styles.icon} resizeMode="contain" />
//       <Text style={styles.cardText}>{item.name}</Text>
//     </TouchableOpacity>
//   );

//   const renderDailyOption = ({ item }) => (
//     <>
// <Card
//   style={styles.dailyCard}
//   onPress={async () => {
//     try {
//       const userId = await AsyncStorage.getItem("uuid");
//       saveUserAction({
//         uuid: userId,
//         timestamp: Date.now(),
//         retryCount: 0,
//         event_type: item?.event_type,
//         event_data: {
//           component: item?.component,
//           city: locationData.city,
//           lat: locationData.lat,
//           long: locationData.long,
//           timeZone: locationData.timeZone,
//           device: Platform.OS === "ios" ? "mobile-ios" : "mobile-android",
//           screen: "home",
//         },
//       });
//          if (item.id) {
//               // 👇 toggle MantraCard visibility only for this card
//               setExpandedItemId((prev) => (prev === item.id ? null : item.id));
//             } 
//       // navigation.navigate(item.route);
//     } catch (error) {
//       console.error("Error fetching UUID:", error);
//     }
//   }}
// >
//   <View style={styles.cardContent}>
//     {/* Left Icon */}
//     <Image
//       source={item.icon}
//       style={styles.optionIcon}
//       resizeMode="contain"
//     />

//     {/* Middle text */}
//     <View style={styles.textWrapper}>
//       <TextComponent type="boldText" style={styles.optionTitle}>
//         {item.title}
//       </TextComponent>
//       <TextComponent type="mediumText" style={styles.optionSubtitle}>
//         {item.subtitle}
//       </TextComponent>
//     </View>

//     {/* Arrow at the end */}
//     <Image
//       source={require("../../../assets/card_arrow.png")}
//       style={styles.arrowIcon}
//       resizeMode="contain"
//     />
//   </View>
// </Card>
// {expandedItemId === item.id && item.id === "1" && (
//         <View style={{ marginTop: 10 ,zIndex:999,height:500}}>
//          <MantraCard 
//         practiceTodayData={practiceTodayData} 
//      onPressChantMantra={(mantra) => handleStartMantra(mantra)}
//      DoneMantraCalled={(mantra) => {DoneMantraCalled(mantra)}}
//          />
//         </View>
//       )}
//       {expandedItemId === item.id && item.id === "2" && (
//   <View style={{ marginTop: 10, zIndex: 999 ,height:380}}>
//     <SankalpCard
//       practiceTodayData={practiceTodayData}
//       onPressStartSankalp={(sankalp) => handleStartSankalp(sankalp)}
//       onCompleteSankalp={(sankalp) => DoneSankalpCalled(sankalp)}
//     />
//   </View>
// )}
//        {expandedItemId === item.id && item.id === "4" && (
//         <View style={{ marginTop: 10 ,zIndex:999,height:380}}>
//           <WisdomCard />
//         </View>
//       )}
//         {expandedItemId === item.id && item.id === "3" && (
//         <View style={{ marginTop: 10 ,zIndex:999,height:950}}>
//           <FestivalCard />
//         </View>
//       )}
// </>
//   );

//   const renderKalpXItem = ({ item }) => (
//     <TouchableOpacity
//       style={styles.kalpXCard}
//       onPress={async () => {
//         try {
//           const userId = await AsyncStorage.getItem("uuid");
//           saveUserAction({
//             uuid: userId,
//             timestamp: Date.now(),
//             retryCount: 0,
//             event_type: item?.event_type,
//             event_data: {
//               component: item?.component,
//               city: locationData.city,
//               lat: locationData.lat,
//               long: locationData.long,
//               timeZone: locationData.timeZone,
//               device: Platform.OS === "ios" ? "mobile-ios" : "mobile-android",
//               screen: "home",
//             },
//           });
//           navigation.navigate(item.name);
//         } catch (error) {
//           console.error("Error fetching UUID:", error);
//         }
//       }}
//     >
//       <Image source={item.image} style={styles.kalpXImage} />
//       <Text style={styles.kalpXTitle}>{item.title}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Colors.white }}>
//       <StatusBar
//         barStyle="dark-content"
//         backgroundColor={Colors.Colors.header_bg}
//         translucent={false}
//       />
//       {/* <ImageBackground
//         source={require("../../../assets/home.jpg")}
//         style={styles.background}
//         resizeMode="cover"
//       > */}
//       <Header />
//       <ScrollView
//         contentContainerStyle={{ paddingBottom: 30 }}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* ✅ Horizontal Categories restored */}
//         <View style={{ marginTop: 10 }}>
//           <FlatList
//             data={categories}
//             renderItem={renderCategory}
//             keyExtractor={(item) => item.id}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={{
//               paddingHorizontal: 10,
//               paddingBottom: 20,
//             }}
//           />
//         </View>
//         <Card style={styles.streakCard } onPress={() => {navigation.navigate("StreakScreen")}}>
//           <View
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <View style={{ flexDirection: "row", alignItems: "center" }}>
//               <Image
//                 source={require("../../../assets/streak1.png")}
//                 style={{ height: 20, width: 20 }}
//               />
//               <TextComponent type="boldText" style={styles.count}>
//                 {streakData?.sankalp ?? 0}
//               </TextComponent>
//               <TextComponent type="mediumText" style={styles.streakText}>
//                 Sankalp
//               </TextComponent>
//             </View>
//             <View
//               style={{
//                 flexDirection: "row",
//                 alignItems: "center",
//                 marginLeft: 20,
//               }}
//             >
//               <Image
//                 source={require("../../../assets/streak2.png")}
//                 style={{ height: 20, width: 20 }}
//               />
//               <TextComponent type="boldText" style={styles.count}>
//                  {streakData?.mantra ?? 0}
//               </TextComponent>
//               <TextComponent type="mediumText" style={styles.streakText}>
//                 Mantra
//               </TextComponent>
//             </View>
//             <View
//               style={{
//                 flexDirection: "row",
//                 alignItems: "center",
//                 marginLeft: 20,
//               }}
//             >
//               <Image
//                 source={require("../../../assets/streak3.png")}
//                 style={{ height: 20, width: 20 }}
//               />
//               <TextComponent type="boldText" style={styles.count}>
//                 {trackerData?.streak_count ?? 0}
//               </TextComponent>
//               <TextComponent type="mediumText" style={styles.streakText}>
//                 Daily Practice
//               </TextComponent>
//             </View>
//           </View>
//         </Card>
//         {/* <MantraCard/> */}
//         {/* Daily Section */}
//         <View style={styles.dailyContainer}>
//           <TextComponent type="mediumText" style={styles.sectionHeading}>Step Into Today With Purpose</TextComponent>

// {/* ✅ Show top chips only if any card is expanded */}
// {expandedItemId && (
//   <View style={{ marginVertical: 10 }}>
//     <FlatList
//       data={topChips}
//       keyExtractor={(item) => item.id}
//       horizontal
//       showsHorizontalScrollIndicator={false}
//       contentContainerStyle={{ paddingHorizontal: 10 }}
//       renderItem={({ item }) => {
//         const isActive = expandedItemId === item.id;
//         return (
//           <TouchableOpacity
//             onPress={() => handleChipPress(item.id)}
//             activeOpacity={0.8}
//             style={{
//               backgroundColor: isActive
//                 ? Colors.Colors.App_theme
//                 : Colors.Colors.white,
//               borderColor: Colors.Colors.App_theme,
//               borderWidth: 1,
//               borderRadius: 20,
//               paddingHorizontal: 14,
//               paddingVertical: 6,
//               marginRight: 10,
//             }}
//           >
//             <TextComponent
//               type="cardText"
//               style={{
//                 color: isActive ? Colors.Colors.BLACK : Colors.Colors.App_theme,
//               }}
//             >
//               {item.label}
//             </TextComponent>
//           </TouchableOpacity>
//         );
//       }}
//     />
//   </View>
// )}
// {/* Reorder list: move expanded item to top */}
// <FlatList
//   data={
//     expandedItemId
//       ? [
//           // move selected item to top
//           dailyOptions.find((x) => x.id === expandedItemId),
//           ...dailyOptions.filter((x) => x.id !== expandedItemId),
//         ]
//       : dailyOptions
//   }
//   renderItem={renderDailyOption}
//   keyExtractor={(item) => item.id}
//   scrollEnabled={false}
// />

//         </View>

//         <View style={{margin:16}}>
//                <TouchableOpacity
//           activeOpacity={0.8}
//           style={{ marginTop: 16, borderRadius: 10, overflow: "hidden" }}
//           onPress={() => setShowVideo(true)}
//         >
//           <Image
//             source={{ uri: thumbnailUrl }}
//             style={{ width: "100%", height: 200, borderRadius: 8 }}
//             resizeMode="cover"
//           />
//           {/* Optional play icon overlay */}
//           {/* <View style={styles.playButton}>
//             <Image
//               source={require("../../assets/play_icon.png")} // add a play.png icon in your assets
//               style={{ width: 50, height: 50, tintColor: "#fff" }}
//             />
//           </View> */}
//         </TouchableOpacity>
//           <TextComponent type="boldText" style={{ color: Colors.Colors.BLACK,fontSize: FontSize.CONSTS.FS_16,marginTop:8}}>KalpX – Connect to Your Roots</TextComponent>
//           <TextComponent type="cardText" style={{color:Colors.Colors.Light_grey,marginTop:4}}>Discover the soul of Sanatan Dharma through Explore Videos, Daily Practice, Live Darshan, Temple Poojas, Retreats, Satsang Circles, Mantra Chanting, and Sacred Journeys.</TextComponent>
//           <TextComponent type="cardText" style={{color:Colors.Colors.Light_grey,marginTop:4}}>Whether you’re seeking knowledge, devotion, or inner balance — your journey begins here.</TextComponent>
//    <YoutubeModal
//         visible={showVideo}
//         onClose={() => setShowVideo(false)}
//         youtubeUrl="https://www.youtube.com/watch?v=INS2diQXIjA"
//       />
//         </View>

//         {/* Explore Videos */}
//         <View style={{ paddingLeft: 12 }}>
//           <ExploreVideos />
//         </View>

//         {/* KalpX */}
//         <View style={styles.kalpXContainer}>
//           <Text style={styles.sectionHeading}>{t("home.kalpXHeading")}</Text>
//           <FlatList
//             data={kalpXData}
//             renderItem={renderKalpXItem}
//             keyExtractor={(item) => item.id}
//             numColumns={2}
//             columnWrapperStyle={{
//               justifyContent: "space-between",
//               marginBottom: 12,
//             }}
//             scrollEnabled={false}
//           />
//         </View>
//          <SigninPopup
//   visible={showMantraTaken}
//   onClose={() => setShowMantraTaken(false)}
//   onConfirmCancel={() => {}}
//   title="Mantra Taken!"
//   subText='"One small step, one powerful shift. You’ve committed to building your inner strength today."'
//   infoTexts={[
//     "Get daily reminders",
//     "Track your Mantra streak",
//     "Make this my Daily Mantra",
//   ]}
//   bottomText="Want a gentle reminder to complete your Mantra by day's end?"
// />
// <SigninPopup
//   visible={showMantraComplete}
//   onClose={() => setShowMantraComplete(false)}
//   onConfirmCancel={() => {}}
//   title="Beautiful! You've completed your Mantra today."
//   subText='"But your progress isn’t being saved."'
//   infoTexts={[
//     "Keep your Mantra streak alive",
//     "Receive gentle nudges to stay on track",
//     "View your growth over time",
//   ]}
//   bottomText=""/>
// <SigninPopup
//   visible={showSankalpTaken}
//   onClose={() => setShowSankalpTaken(false)}
//   onConfirmCancel={() => {}}
//   title="Sankalp Taken!"
//   subText={"One small step, one powerful shift. You've committed to building your inner strength today."}
//   infoTexts={[
//     "Get daily reminders",
//     "Track your Sankalp streak",
//     "Make this part of your daily spiritual practice",
//   ]}
//   bottomText="Want a gentle reminder to complete your Sankalp by day's end?"
// />
// <SigninPopup
//   visible={showSankalpComplete}
//   onClose={() => setShowSankalpComplete(false)}
//   onConfirmCancel={() => {}}
//   title="🌼 Beautiful! You've completed your Sankalp today."
//   subText={"But your progress isn't being saved."}
//   infoTexts={[
//     "• Keep your Sankalp streak alive",
//     "• Receive gentle nudges to stay on track",
//     "• View your growth over time",
//   ]}
//   bottomText=""
// />


//       </ScrollView>
//       {/* </ImageBackground> */}
//     </SafeAreaView>
//   );
// }

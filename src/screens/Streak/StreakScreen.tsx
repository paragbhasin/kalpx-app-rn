import { AnyAction } from "@reduxjs/toolkit";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ViewShot, { captureRef } from "react-native-view-shot";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";
import Header from "../../components/Header";
import PracticeDailyModal from "../../components/PracticeDailyModal";
import TextComponent from "../../components/TextComponent";
import { useUserLocation } from "../../components/useUserLocation";
import { RootState } from "../../store";
import { getDailyDharmaTracker, getPracticeStreaks } from "../Home/actions";
import { fetchDailyPractice, fetchPracticeHistory } from "./actions";
import styles from "./styles";

const StreakScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const viewShotRef = useRef(null);
  const badgeRef = useRef(null);
  const streakRef = useRef(null);

  const [selected, setSelected] = useState<"badge" | "streak">("badge");
  const [showPractiseModal, setShowPractiseModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"sankalp" | "daily">("sankalp");
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const [trackerData, setTrackerData] = useState<any>(null);
  const [selectedDayData, setSelectedDayData] = useState({
    notCompleted:[],
  completed: [],
  status: "not_done",
});
  const practiceHistory: any = useSelector((state: RootState) => state.practiceReducer);
  const dailyPractice: any = useSelector((state: RootState) => state.dailyPracticeReducer);
  const { locationData, loading: locationLoading } = useUserLocation();
  const { data: streakData } = useSelector((state: RootState) => state.practiceStreaksReducer);

  const data = practiceHistory?.data ?? [];
  const loading = practiceHistory?.loading ?? false;

  useEffect(() => {
    dispatch(
            getPracticeStreaks((res) => {
        console.log("✅ Streaks fetched:", res);
      })
    );
    dispatch(
      getDailyDharmaTracker((res) => {
        if (res.success) setTrackerData(res.data);
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (!locationLoading && locationData.timezone) {
      dispatch(fetchPracticeHistory(locationData.timezone));
    }
  }, [dispatch, locationData.timezone, locationLoading]);

    useEffect(() => {
      if (!locationLoading && locationData.timezone) {
        const today = moment().format("YYYY-MM-DD");
        dispatch(fetchDailyPractice(today, locationData.timezone));
      }
    }, [dispatch, locationData.timezone, locationLoading]);

  const milestones = [
    { days: 9, name: t("streakScreen.milestones.blessing") },
    { days: 27, name: t("streakScreen.milestones.tapasya") },
    { days: 54, name: t("streakScreen.milestones.sadhana") },
    { days: 108, name: t("streakScreen.milestones.dharmaLight") },
  ];



  const sankalpCount = streakData?.sankalp || 0;
  const mantraCount = streakData?.mantra || 0;
  const trackerCount = trackerData?.streak_count || 0;
  //     const sankalpCount: any = 1;
  // const mantraCount : any= 40;
  // const trackerCount: any  = 10;

  const highestStreak = Math.max(sankalpCount ?? 0, mantraCount ?? 0);
  const highestStreakRoutine = trackerCount ?? 0;

  const currentMilestone =
    milestones.slice().reverse().find((m) => highestStreak >= m.days) || null;
  const nextMilestone = milestones.find((m) => highestStreak < m.days) || null;
  const remainingDays = nextMilestone ? nextMilestone.days - highestStreak : 0;
  
    const currentMilestoneRoutine =
    milestones.slice().reverse().find((m) => highestStreakRoutine >= m.days) || null;
  const nextMilestoneRoutine = milestones.find((m) => highestStreakRoutine < m.days) || null;
  const remainingDaysRoutine = nextMilestoneRoutine ? nextMilestoneRoutine.days - highestStreakRoutine : 0;

  // ✅ detect card existence
  const hasBadge =
    (selectedTab === "sankalp" && (mantraCount >= 9 || sankalpCount >= 9)) ||
    (selectedTab === "daily" && trackerCount >= 9);

  const hasStreak =
    (selectedTab === "sankalp" && (mantraCount > 0 || sankalpCount > 0)) ||
    (selectedTab === "daily" && trackerCount > 0);

  // ✅ dynamic download
  const handleDownload = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Please allow access to save images.");
        return;
      }

      const targetRef =
        selected === "badge" && hasBadge
          ? badgeRef
          : selected === "streak" && hasStreak
          ? streakRef
          : viewShotRef;

      const uri = await captureRef(targetRef, { format: "png", quality: 1 });
      const fileUri = `${FileSystem.cacheDirectory}Kalpx_${selected}_${Date.now()}.png`;
      await FileSystem.copyAsync({ from: uri, to: fileUri });
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync("KalpX Cards", asset, false);

      Alert.alert("✅ Saved!", "Your card has been saved to your gallery.");
    } catch (error) {
      console.error("❌ Error saving card:", error);
      Alert.alert("Error", "Unable to save image.");
    }
  };

  // ✅ dynamic share
  const handleShare = async () => {
    try {
      const targetRef =
        selected === "badge" && hasBadge
          ? badgeRef
          : selected === "streak" && hasStreak
          ? streakRef
          : viewShotRef;

      const uri = await captureRef(targetRef, { format: "png", quality: 1 });
      const fileUri = `${FileSystem.cacheDirectory}${selected}_share.png`;
      await FileSystem.copyAsync({ from: uri, to: fileUri });

      const message =
        selected === "badge"
          ? t("streakScreen.share.badge")
          : t("streakScreen.share.streak");

      // const message =
      //   selected === "badge"
      //     ? `🌟 I just earned my Blessing Badge on Kalpx!\n\nKalpX — Connect to Your Roots\nhttps://kalpx.com\nhttps://dev.kalpx.com/`
      //     : `🔥 I’m on a spiritual streak with Kalpx!\n\nKalpX — Connect to Your Roots\nhttps://kalpx.com\nhttps://dev.kalpx.com/`;

      if (!(await Sharing.isAvailableAsync())) {
        alert("Sharing is not available on this device.");
        return;
      }

      await Sharing.shareAsync(fileUri, {
        dialogTitle: "Share your Kalpx card",
        mimeType: "image/png",
        UTI: "image/png",
        message,
      });
    } catch (error) {
      console.error("❌ Error sharing:", error);
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={{
        borderColor: "#707070",
        borderWidth: 0.5,
        borderRadius: 4,
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
        width: 80,
        margin: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {item.sankalp ? (
          <Image
            source={require("../../../assets/Streak_A1.png")}
            style={{ height: 20, width: 20, marginRight: 4 }}
          />
        ) : (
          <Image
            source={require("../../../assets/Streak_D1.png")}
            style={{ height: 20, width: 20, marginRight: 8 }}
          />
        )}
        {item.mantra ? (
          <Image
            source={require("../../../assets/Styrak_A2.png")}
            style={{ height: 20, width: 20 }}
          />
        ) : (
          <Image
            source={require("../../../assets/Streak_D2.png")}
            style={{ height: 20, width: 20, marginRight: 8 }}
          />
        )}
      </View>
      <TextComponent
        type="streakText"
        style={{ color: Colors.Colors.BLACK, marginTop: 4 }}
      >
        {moment(item.date).format("MMM D")}
      </TextComponent>
    </View>
  );

  return (
    <SafeAreaProvider>
        <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.Colors.header_bg}
        translucent={false}
      />
      <Header />
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 200 }}
          showsVerticalScrollIndicator={false}
          style={{ paddingHorizontal: 24 }}
        >
          <TouchableOpacity
            style={{
              marginVertical:10,
            }}
            onPress={() => navigation.goBack()}
          >
            <View
              style={{
                backgroundColor: "#D9D9D9",
                alignSelf: "flex-start",
                padding: 10,
                borderRadius: 25,
              }}
            >
              <Image
                source={require("../../../assets/C_Arrow_back.png")}
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
          <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#D4A0171C",
          padding: 8,
          borderRadius: 8,
        }}
      >
        {/* Sankalp & Mantra */}
        <TouchableOpacity
          onPress={() => setSelectedTab("sankalp")}
          style={{
            backgroundColor: selectedTab === "sankalp" ? Colors.Colors.App_theme : Colors.Colors.white,
            alignSelf: "flex-start",
            paddingHorizontal: 6,
            paddingVertical:10,
            borderRadius: 8,
            width: FontSize.CONSTS.DEVICE_WIDTH*0.40,
            marginRight: 15,
            alignItems:"center"
          }}
        >
          <TextComponent
            type="cardText"
            style={{ color: selectedTab === "sankalp" ? Colors.Colors.BLACK : Colors.Colors.Light_grey }}
          >
        {t("streakScreen.tabs.sankalp")}
          </TextComponent>
        </TouchableOpacity>

        {/* Daily Practices */}
        <TouchableOpacity
          onPress={() => setSelectedTab("daily")}
          style={{
            backgroundColor: selectedTab === "daily" ? Colors.Colors.App_theme : Colors.Colors.white,
            alignSelf: "flex-start",
             paddingHorizontal: 6,
            paddingVertical:10,
            borderRadius: 8,
                    width: FontSize.CONSTS.DEVICE_WIDTH*0.40,
            alignItems:"center"
          }}
        >
          <TextComponent
            type="cardText"
            style={{ color: selectedTab === "daily" ? Colors.Colors.BLACK : Colors.Colors.Light_grey }}
          >
        {t("streakScreen.tabs.daily")}
          </TextComponent>
        </TouchableOpacity>
      </View>
          <TextComponent
            type="mediumText"
            style={{ color: Colors.Colors.BLACK, marginVertical: 20 }}
          >
        {t("streakScreen.streakInfo")}
          </TextComponent>
          <View
  style={{
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDFBF6",
    borderColor: Colors.Colors.App_theme,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  }}
>
  <Image
    source={require("../../../assets/streak_1.png")}
    style={{ height: 30, width: 30 }}
  />
  <View style={{ marginLeft: 18 }}>
    {/* <TextComponent
      type="boldText"
      style={{
        color: Colors.Colors.BLACK,
        fontSize: FontSize.CONSTS.FS_14,
      }}
    >
      {highestStreak} Days
    </TextComponent> */}

    {(currentMilestone || currentMilestoneRoutine) ? (
      <>
        <TextComponent
            type="boldText"
      style={{
        color: Colors.Colors.BLACK,
        fontSize: FontSize.CONSTS.FS_14,
      }}
        >
         {t("streakScreen.keepGoing")}
        </TextComponent>

        <TextComponent
          type="mediumText"
          style={{
            color: Colors.Colors.Light_black,
            fontSize: FontSize.CONSTS.FS_12,
            marginTop:4
          }}
        >
          {t("streakScreen.youEarned", { badge:selectedTab === "sankalp" ? currentMilestone.name : currentMilestoneRoutine.name})}
        </TextComponent>

        {nextMilestone && (
          <TextComponent
            type="mediumText"
            style={{
              color: Colors.Colors.Light_black,
              fontSize: FontSize.CONSTS.FS_12,
            marginTop:4
            }}
          >
          {t("streakScreen.moreDays", { count: selectedTab === "sankalp" ? remainingDays : remainingDaysRoutine, nextBadge: selectedTab === "sankalp" ? nextMilestone.name : nextMilestoneRoutine.name})}
          </TextComponent>
        )}
      </>
    ) : (
      <>
        <TextComponent
            type="boldText"
      style={{
        color: Colors.Colors.BLACK,
        fontSize: FontSize.CONSTS.FS_14,
      }}
        >
       {t("streakScreen.keepGoing")}
        </TextComponent>
        <TextComponent
          type="mediumText"
          style={{
            color: Colors.Colors.Light_black,
            fontSize: FontSize.CONSTS.FS_12,
            marginTop:4
          }}
        >
        {t("streakScreen.noBadge")}
        </TextComponent>
        <TextComponent
          type="mediumText"
          style={{
            color: Colors.Colors.Light_black,
            fontSize: FontSize.CONSTS.FS_12,
            marginTop:4
          }}
        >
            {t("streakScreen.daysToFirst", { days: milestones[0].days - highestStreak, badge: milestones[0].name })}
          {/* {remainingDays || milestones[0].days - highestStreak} more days to your{" "}
          {milestones[0].name}. */}
        </TextComponent>
      </>
    )}
  </View>
</View>
          {selectedTab === "sankalp" &&
          <View
            style={{
              marginVertical: 20,
              flexDirection: "row",
              alignSelf: "center",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("../../../assets/streak1.png")}
                style={{ height: 20, width: 20, marginRight: 8 }}
              />
              <TextComponent type="cardText" style={styles.count}>
                {t("streakScreen.sankalpStreaks")} : {streakData?.sankalp ?? 0}
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
                style={{ height: 20, width: 20, marginRight: 8 }}
              />
              <TextComponent type="cardText" style={styles.count}>
             {t("streakScreen.mantraStreaks")} : {streakData?.mantra ?? 0}
              </TextComponent>
            </View>
          </View>
}
   {selectedTab === "daily" &&
          <View
            style={{
              marginVertical: 20,
              // flexDirection: "row",
              justifyContent:"center",
              alignSelf: "center",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {/* <Image
                source={require("../../../assets/streak1.png")}
                style={{ height: 20, width: 20, marginRight: 8 }}
              /> */}
              <TextComponent type="cardText" style={styles.count}>
               {t("streakScreen.practiceStreaks")} : {trackerData?.streak_count ?? 0}
              </TextComponent>
            </View>
          </View>
}




          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => setSelected("badge")}
              style={[
                styles.tab,
                selected === "badge" && {
                  borderBottomColor: Colors.Colors.App_theme,
                  borderBottomWidth: 2,
                },
              ]}
            >
              <TextComponent
                type="cardText"
                style={{
                  color:
                    selected === "badge"
                      ? Colors.Colors.App_theme
                      : Colors.Colors.BLACK,
                }}
              >
               {t("streakScreen.yourBadge")}
              </TextComponent>
            </TouchableOpacity>

            {/* Your Streak */}
            <TouchableOpacity
              onPress={() => setSelected("streak")}
              style={[
                styles.tab,
                selected === "streak" && {
                  borderBottomColor: Colors.Colors.App_theme,
                  borderBottomWidth: 2,
                },
              ]}
            >
              <TextComponent
                type="cardText"
                style={{
                  color:
                    selected === "streak"
                      ? Colors.Colors.App_theme
                      : Colors.Colors.BLACK,
                }}
              >
              {t("streakScreen.yourStreak")}
              </TextComponent>
            </TouchableOpacity> 
{((selected === "badge" && hasBadge) || (selected === "streak" && hasStreak)) && (
  <TouchableOpacity
    onPress={handleDownload}
    style={{
      flexDirection: "row",
      alignItems: "center",
      borderColor: Colors.Colors.App_theme,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      // width:"40%"
    }}
  >
    <TextComponent type="streakText" style={{}}>
       {selected === "badge"
          ? t("streakScreen.downloadBadge")
          : t("streakScreen.downloadStreak")}
    </TextComponent>
    <Image
      source={require("../../../assets/Download.png")}
      style={{ height: 16, width: 16, marginLeft: 8 }}
    />
  </TouchableOpacity>
)}

          </View>
          {selected === "badge" && (
            <>
            {((selectedTab === "sankalp" &&  mantraCount < 9 && sankalpCount < 9) || (selectedTab === "daily" && trackerCount < 9 ) ) &&
            <>
            <View style={{borderColor:Colors.Colors.Light_grey,borderWidth:0.6,borderRadius:4,padding:20,marginVertical:15}}>
<TextComponent type="cardText" style={{textAlign:"center",color:Colors.Colors.Light_grey,fontSize:FontSize.CONSTS.FS_16}}><TextComponent type="cardText" style={{textAlign:"center",color:Colors.Colors.App_theme,fontSize:FontSize.CONSTS.FS_16}}> {t("streakScreen.noBadgesTitle")}</TextComponent> {t("streakScreen.noBadgesMessage")}<TextComponent type="cardText" style={{textAlign:"center",color:Colors.Colors.BLACK,fontSize:FontSize.CONSTS.FS_16}}>9 </TextComponent>{t("streakScreen.dayText")}</TextComponent>
<TextComponent type="cardText" style={{textAlign:"center",fontSize:FontSize.CONSTS.FS_16}}>{t("streakScreen.noBadgesAction")}  <TextComponent type="cardText" style={{textAlign:"center",color:Colors.Colors.App_theme,fontSize:FontSize.CONSTS.FS_16}}>{t("streakScreen.blessedText")}</TextComponent></TextComponent>
<View style={{backgroundColor:Colors.Colors.App_theme,padding:12,alignItems:"center",marginVertical:12,borderRadius:4}}>
  <TextComponent type="cardText" style={{color:Colors.Colors.white,fontSize:FontSize.CONSTS.FS_16}}>{t("streakScreen.startJourney")}</TextComponent>
</View>
            </View>
            </>
           }
           {(
           (selectedTab === "sankalp" && (mantraCount >= 9 || sankalpCount >= 9)) ||
          (selectedTab === "daily" && trackerCount >= 9)
           ) && 
    <ViewShot ref={badgeRef} options={{ format: "png", quality: 1 }}>
            <View style={{ marginVertical: 20 }}>
              <ImageBackground
                source={require("../../../assets/Streak_bg.png")}
                style={{ flex: 1 }} // adjust height as needed
                              resizeMode="contain"
              >
                <View style={{ alignItems: "center", padding: 40 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginVertical: 7,
                    }}
                  >
                    <TextComponent
                      type="boldText"
                      style={{
                        color: "#925910",
                        fontSize: FontSize.CONSTS.FS_14,
                      }}
                    >
                   {t("streakScreen.feelingBlessed")}
                    </TextComponent>
                    <Image
                      source={require("../../../assets/Feeling_blessed.png")}
                      style={{ height: 20, width: 20, marginLeft: 8 }}
                    />
                  </View>
                  <TextComponent
                    type="boldText"
                    style={{ color: "#925910", fontSize: 18, marginTop: 8 }}
                  >
{selectedTab === "sankalp"
  ? `${currentMilestone?.days || ""} ${currentMilestone?.name || ""}`
  : `${currentMilestoneRoutine?.days || ""} ${currentMilestoneRoutine?.name || ""}`
}
                      {/* {selectedTab === "sankalp"
    ? (mantraCount >= sankalpCount ? mantraCount : sankalpCount)
    : trackerCount}{" "} {t("streakScreen.days")} {currentMilestone?.name} */}
                  </TextComponent>
                  <Image
                    source={require("../../../assets/streak_1.png")}
                    style={{ marginVertical: 18 }}
                  />
                  <TextComponent
                    type="boldText"
                    style={{ color: "#925910", fontSize: 18 ,textAlign:"center"}}
                  >
                    {t("streakScreen.commitmentGift")} {" "}
                  </TextComponent>
                  {/* <TextComponent
                    type="boldText"
                    style={{ color: "#925910", fontSize: 18 }}
                  >
                    my heart.
                  </TextComponent> */}
                  <TextComponent
                    type="boldText"
                    style={{
                      color: Colors.Colors.App_theme,
                      fontSize: 30,
                      marginVertical: 12,
                    }}
                  >
                    Kalpx
                  </TextComponent>
                  <TextComponent
                    type="boldText"
                    style={{ color: "#925910", fontSize: 20 }}
                  >
                    Connect to Your Roots
                  </TextComponent>
                  <TextComponent
                    type="boldText"
                    style={{
                      color: Colors.Colors.App_theme,
                      fontSize: 14,
                      marginTop: 10,
                    }}
                  >
                    KalpX.com
                  </TextComponent>
                </View>
              </ImageBackground>
            </View>
            </ViewShot>
}
            </>
             
            
          )}
          {selected === "streak" && (
            <>
                {(selectedTab === "sankalp" &&  mantraCount === 0 && sankalpCount === 0 ) &&
            <>
                        <View style={{borderColor:Colors.Colors.Light_grey,borderWidth:0.6,borderRadius:4,padding:20,marginVertical:15}}>
 <TextComponent type="cardText" style={{textAlign:"center"}}>{t("streakScreen.cardData")}</TextComponent>
 <TouchableOpacity style={{backgroundColor:Colors.Colors.App_theme,padding:12,alignItems:"center",marginVertical:12,borderRadius:4}} onPress={() => {navigation.navigate('HomePage', { screen: 'Home'})}}>
  <TextComponent type="cardText" style={{color:Colors.Colors.white}}>{t("streakScreen.beginJourney")}</TextComponent>
 </TouchableOpacity>
             </View>
            </>
                }
                 {(selectedTab === "daily" && trackerCount === 0  ) &&
            <>
             <View style={{borderColor:Colors.Colors.Light_grey,borderWidth:0.6,borderRadius:4,padding:20,marginVertical:15}}>
<TextComponent type="cardText" style={{textAlign:"center"}}>{t("streakScreen.spiritualText")}</TextComponent>
<TouchableOpacity 
onPress={() => {
  if(trackerData?.active_practices?.length > 0){
navigation.navigate("MySadana");
  }else{
navigation.navigate("Dharma");
  }
}}
style={{backgroundColor:Colors.Colors.App_theme,padding:12,alignItems:"center",marginVertical:12,borderRadius:4}}>
  <TextComponent type="cardText" style={{color:Colors.Colors.white}}>{t("streakScreen.setUp")}</TextComponent>
</TouchableOpacity>
            </View>
            </>
                }
                  {(
           (selectedTab === "sankalp" && (mantraCount > 0 || sankalpCount > 0)) ||
          (selectedTab === "daily" && trackerCount > 0)
           ) && 
               <ViewShot ref={streakRef} options={{ format: "png", quality: 1 }}>
            <View style={{ marginVertical: 20 }}>
              <ImageBackground
                source={require("../../../assets/Streak_bg.png")}
                style={{ flex: 1 }} // adjust height as needed
                resizeMode="contain"
              >
                <View style={{ alignItems: "center", padding: 40 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginVertical: 7,
                    }}
                  >
                    <TextComponent
                      type="boldText"
                      style={{
                        color: "#925910",
                        fontSize: FontSize.CONSTS.FS_20,
                        marginTop: 25,
                      }}
                    >
                         {t("streakScreen.Streaks")}
                    </TextComponent>
                  </View>
                  {sankalpCount !== 0 && selectedTab === "sankalp" && 
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image
                      source={require("../../../assets/streak1.png")}
                      style={{ height: 20, width: 20, marginRight: 8 }}
                    />
                    <TextComponent
                      type="cardText"
                      style={{
                        ...styles.count,
                        color: "#925910",
                        marginTop: 12,
                      }}
                    >
                      {t("streakScreen.StreakCount")} : {sankalpCount ?? 0}
                    </TextComponent>
                  </View>
}
{mantraCount !== 0 && selectedTab === "sankalp" &&
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop:10
                    }}
                  >
                    <Image
                      source={require("../../../assets/streak2.png")}
                      style={{ height: 20, width: 20, marginRight: 8 }}
                    />
                    <TextComponent
                      type="cardText"
                      style={{ ...styles.count, color: "#925910" }}
                    >
                      {t("streakScreen.mantraCount")} : {mantraCount ?? 0}
                    </TextComponent>
                  </View>
}
{trackerCount !== 0 && selectedTab === "daily" &&
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <TextComponent
                      type="cardText"
                      style={{ ...styles.count, color: "#925910" }}
                    >
                       {t("streakScreen.practiceStreaks")} : {trackerCount ?? 0}
                    </TextComponent>
                  </View>
}
                  <View style={{ marginVertical: 24 }}>
                    <TextComponent
                      type="boldText"
                      style={{
                        color: "#925910",
                        fontSize: 18,
                        textAlign: "center",
                      }}
                    >
                    {t("streakScreen.card1")}
                    </TextComponent>
                    <TextComponent
                      type="boldText"
                      style={{
                        color: "#925910",
                        fontSize: 18,
                        textAlign: "center",
                        marginTop: 8,
                      }}
                    >
                    {t("streakScreen.card2")}
                    </TextComponent>
                    <TextComponent
                      type="boldText"
                      style={{
                        color: "#925910",
                        fontSize: 18,
                        textAlign: "center",
                        marginTop: 8,
                      }}
                    >
                    {t("streakScreen.card3")}
                    </TextComponent>
                  </View>
                  <TextComponent
                    type="boldText"
                    style={{
                      color: Colors.Colors.App_theme,
                      fontSize: 30,
                      marginVertical: 12,
                    }}
                  >
                    Kalpx
                  </TextComponent>
                  <TextComponent
                    type="boldText"
                    style={{ color: "#925910", fontSize: 20 }}
                  >
                    Connect to Your Roots
                  </TextComponent>
                  <TextComponent
                    type="boldText"
                    style={{
                      color: Colors.Colors.App_theme,
                      fontSize: 14,
                      marginTop: 10,
                    }}
                  >
                    KalpX.com
                  </TextComponent>
                </View>
              </ImageBackground>
            </View>
            </ViewShot>
}
            </>
          )}
{((selected === "badge" && hasBadge) || (selected === "streak" && hasStreak)) && (
          <View
            style={{
              alignSelf: "flex-end",
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <TextComponent
              type="semiBoldText"
              style={{
                color: "#DAAB32",
                fontSize: FontSize.CONSTS.FS_20,
                marginRight: 12,
              }}
            >
            {t("streakScreen.shareText")}
            </TextComponent>
            <TouchableOpacity onPress={handleShare}>
            <Image
              source={require("../../../assets/Streak_S1.png")}
              style={{ height: 20, width: 20, marginRight: 8 }}
            />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare}>
            <Image
              source={require("../../../assets/Streak_S2.png")}
              style={{ height: 20, width: 20, marginRight: 8 }}
            />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare}>
            <Image
              source={require("../../../assets/Streak_S3.png")}
              style={{ height: 20, width: 20, marginRight: 8 }}
            />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare}>
            <Image
              source={require("../../../assets/Streak_S4.png")}
              style={{ height: 20, width: 20, marginRight: 8 }}
            />
            </TouchableOpacity>
          </View>
          )}

          
          {selectedTab === "sankalp" && (
  <>
    {loading ? (
      <TextComponent>{t("streakScreen.load")}</TextComponent>
    ) : (
      <FlatList
        data={Array.from({ length: moment().daysInMonth() }, (_, i) => {
          const date = moment().startOf("month").add(i, "days");
          const apiData = data?.find(
            (d) => moment(d.date).isSame(date, "day")
          );

          return {
            date: date.format("YYYY-MM-DD"),
            sankalp: apiData?.sankalp ?? false,
            mantra: apiData?.mantra ?? false,
          };
        })}
        renderItem={renderItem}
        keyExtractor={(item) => item.date}
        numColumns={3}
        contentContainerStyle={{
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 100,
        }}
      />
    )}
  </>
)}
{selectedTab === "daily" && (
<FlatList
  data={Array.from({ length: moment().daysInMonth() }, (_, i) => {
    const date = moment().startOf("month").add(i, "days");
    return {
      day: date.date(),
      fullDate: date.format("YYYY-MM-DD"),
      isPastOrToday: date.isSameOrBefore(moment(), "day"),
    };
  })}
  keyExtractor={(item) => item.fullDate}
  numColumns={4}
  contentContainerStyle={{
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
  }}
  renderItem={({ item }) => {
    const dayData = dailyPractice?.data?.calendar_days?.[item.fullDate] || {};
    const status = dayData.status || "not_done";

    // 🎨 Status background color mapping
    let bgColor = "#FFE1E1"; // default = not_done (pink)

    if (status === "completed") bgColor = "#DBFCE7";       // completed = green
    else if (status === "partial") bgColor = "#F7FCC4";    // partial = yellow
    else if (status === "not_done") bgColor = "#FFE1E1";   // not done = pink
    else if (status === "disabled") bgColor = "#F3F3F5";   // future = gray

    const isDisabled = status === "disabled";

    const isCompleted = status === "completed";

    // 📝 Text color
    const textColor = isDisabled ? Colors.Colors.BLACK : isCompleted ? "green" : "#DB0000";

    return (
      <TouchableOpacity
        disabled={isDisabled}
        onPress={async () => {
         setSelectedDate(item.fullDate);
  const dayData = dailyPractice?.data?.calendar_days?.[item.fullDate] || {};

  setSelectedDayData({
    notCompleted: dayData?.active || [],
    completed: dayData?.completed || [],
    status: dayData?.status || "not_done",
  });

  setShowPractiseModal(true);
        }}
        style={{
          width: 70,
          height: 70,
          margin: 4,
          borderRadius: 4,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: bgColor,
          // borderColor:
          //   item.fullDate === selectedDate ? "#D4A017" : "#707070",
          // borderWidth: 1,
        }}
      >
        <TextComponent
          type="streakText"
          style={{
            color: textColor,
          }}
        >
          {moment(item.fullDate).format("MMM D")}
        </TextComponent>
      </TouchableOpacity>
    );
  }}
/>
)}
   <PracticeDailyModal
          visible={showPractiseModal}
          date={selectedDate}
          dailyPractice={{
            active_practices: selectedDayData.notCompleted || [],
           completed_today: selectedDayData.completed || [],
           status: selectedDayData.status || "not_done"
            //   active_practices: dailyPractice.data.active_practices || [],
            // completed_today: dailyPractice.data.completed_today || [],
          }}
          onClose={() => setShowPractiseModal(false)}
        />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default StreakScreen;
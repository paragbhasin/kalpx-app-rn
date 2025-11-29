import { useNavigation } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import i18next from "i18next";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Image, ImageBackground, StyleSheet, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Card } from "react-native-paper";
import Swiper from "react-native-swiper";
import Icon from "react-native-vector-icons/Ionicons";
import ViewShot, { captureRef } from "react-native-view-shot";
import enFestivals from "../config/locales/en/festivals-en.json"; // Adjust path accordingly
import { Festival, getTodayFestival, getUpcomingFestivals } from "../data/festivals";
import Colors from "./Colors";
import FontSize from "./FontSize";
import TextComponent from "./TextComponent";


const FestivalCard = () => {
  const navigation: any = useNavigation();
  const { i18n, t } = useTranslation();
  const swiperRef = useRef<Swiper>(null);
  const shareRef = useRef(null);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [shareVisible, setShareVisible] = useState(false);
  const [festivalToShare, setFestivalToShare] = useState<Festival | null>(null);

  useEffect(() => {
    const today = getTodayFestival();
    const upcoming = getUpcomingFestivals(3);
    const all = today ? [today, ...upcoming] : upcoming;
    setFestivals(all);
    setLoading(false);
  }, [i18next.language]);

  const handleShareFestival = async (festival: Festival) => {
    try {
      setFestivalToShare(festival);
      setShareVisible(true);
      await new Promise((resolve) => setTimeout(resolve, 400));
      const uri = await captureRef(shareRef, { format: "png", quality: 1 });
      const fileUri = `${FileSystem.cacheDirectory}festival_share_${Date.now()}.png`;
      await FileSystem.copyAsync({ from: uri, to: fileUri });
      setShareVisible(false);
      if (!(await Sharing.isAvailableAsync())) {
        alert(t("festivalCard.sharingNotAvailable"));
        return;
      }
      await Sharing.shareAsync(fileUri, {
        dialogTitle: t("festivalCard.shareDialogTitle"),
        mimeType: "image/png",
        UTI: "image/png",
      });
    } catch (error) {
      console.error("❌ Error sharing Festival:", error);
      setShareVisible(false);
    }
  };

  const getEnglishFestivalKeywords = (festival: any): string[] => {
  try {
    const name = (festival?.name || "").toLowerCase().trim();

    // 💡 1. Try exact id or key match first
    const idKey = festival?.id || festival?.key;
    if (idKey && (enFestivals as any)[idKey]?.videoKeywords?.length) {
      return (enFestivals as any)[idKey].videoKeywords;
    }

    // 💡 2. Try by normalized English key pattern
    const normalized = name.replace(/[^\w\s]/g, "").replace(/\s+/g, "_");
    if ((enFestivals as any)[normalized]?.videoKeywords?.length) {
      return (enFestivals as any)[normalized].videoKeywords;
    }

    // 💡 3. Try fuzzy name match (for translated names)
    const matchKey = Object.keys(enFestivals).find((key) => {
      const englishName = (enFestivals as any)[key]?.name?.toLowerCase()?.trim();
      return englishName && englishName.includes(name);
    });

    if (matchKey && (enFestivals as any)[matchKey]?.videoKeywords?.length) {
      return (enFestivals as any)[matchKey].videoKeywords;
    }

    console.warn(`⚠️ No English video keywords found for festival name: ${festival.name}`);
    return [];
  } catch (error) {
    console.error("❌ Error in getEnglishFestivalKeywords:", error);
    return [];
  }
};


  const getEnglishVideoKeywords = (festivalId: string): string[] => {
  try {
    const englishFestival = (enFestivals as any)[festivalId];
    if (englishFestival?.videoKeywords?.length) {
      return englishFestival.videoKeywords;
    }
    return [];
  } catch (err) {
    console.error("Error fetching English keywords:", err);
    return [];
  }
};


  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.Colors.App_theme} />
        <TextComponent>{t("festivalCard.loading")}</TextComponent>
      </View>
    );
  }

  if (festivals.length === 0) {
    return (
      <Card style={styles.card}>
        <TextComponent type="semiBoldText" style={{ color: Colors.Colors.App_theme, textAlign: "center" }}>
          {t("festivalCard.noFestival")}
        </TextComponent>
        <TextComponent
          type="mediumText"
          style={{ marginTop: 8, textAlign: "center", color: Colors.Colors.Light_black }}
        >
          {t("festivalCard.checkTomorrow")}
        </TextComponent>
      </Card>
    );
  }

  const handleComplete = (festivalName: string) => {
    if (!completedIds.includes(festivalName)) {
      setCompletedIds((prev) => [...prev, festivalName]);
    }
  };

  return (
    <Swiper
      ref={swiperRef}
      loop={false}
      index={activeIndex}
      showsPagination={false}
      onIndexChanged={(i) => setActiveIndex(i)}
      autoplay={false}
      horizontal
      removeClippedSubviews={false}
      style={{ height: "auto" }}
    >
      {festivals.map((festival: any, index) => {
        const isCompleted = completedIds.includes(festival.name);
        return (
          <View
            key={index}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              width: FontSize.CONSTS.DEVICE_WIDTH,
              paddingHorizontal: 5,
            }}
          >
            {/* LEFT ARROW */}
            <TouchableOpacity
              disabled={index === 0}
              onPress={() => swiperRef.current?.scrollBy(-1)}
              style={[
                styles.arrowButton,
                {
                  backgroundColor: index === 0 ? "#707070" : Colors.Colors.App_theme,
                  left: 2,
                },
              ]}
            >
              <Image source={require("../../assets/arrow_home.png")} style={{ transform: [{ rotate: "180deg" }] }} />
            </TouchableOpacity>

            {/* CARD */}
            <Card style={[styles.card, isCompleted && { backgroundColor: Colors.Colors.Light_grey }]}>
              <View>
                  <ScrollView
                  showsVerticalScrollIndicator={true}
                  style={{ maxHeight: 520}}
                  contentContainerStyle={{ paddingBottom: 10 }}
                >
                       <ImageBackground
                                                      source={require("../../assets/CardBG.png")}
                                                      // resizeMode="center"
                                                      style={styles.partialBgContainer}
                                                      imageStyle={styles.partialBgImage}
                                                    >
                <TextComponent type="semiBoldText" style={{  color:Colors.Colors.App_theme,marginBottom:4 }}>
                  {t("festivalCard.blessingQuote")}
                </TextComponent>

                {/* Header */}
                <View style={styles.headerRow}>
                  <TextComponent       type="cardHeaderText"
                    style={{marginRight: 25,marginBottom:8}}>
                    {moment(festival.date).isSame(moment(), "day")
                      ? t("festivalCard.todayFestival")
                      : t("festivalCard.upcomingFestival")}
                  </TextComponent>
                
                </View>
              <View style={{flexDirection:"row",alignSelf:"flex-end",right:18,marginTop:-40}}>
  <TouchableOpacity onPress={() => handleShareFestival(festival)} style={{ flexDirection: "row", alignItems: "center" }}>
                    {/* <Image source={require("../../assets/Streak_S1.png")} style={styles.streakIcon} />
                    <Image source={require("../../assets/Streak_S2.png")} style={styles.streakIcon} />
                    <Image source={require("../../assets/Streak_S3.png")} style={styles.streakIcon} /> */}
                    <Image source={require("../../assets/Streak_S4.png")} style={styles.streakIcon} />
                  </TouchableOpacity>
                       <TouchableOpacity
                    style={{
                      marginLeft: 8,
                      padding: 6,
                      backgroundColor: Colors.Colors.Yellow,
                      borderRadius: 50,
                      justifyContent: "center",
                      alignItems: "center",
                      alignSelf: "flex-end",
                    }}
                   onPress={() => {
  // 1️⃣ Use the date as the only lookup key
  const currentDate = festival?.date;

  if (!currentDate) {
    console.warn("⚠️ No date found for current festival");
    return;
  }

  // 2️⃣ Find the English festival with the same date
  const englishFestivalKey = Object.keys(enFestivals).find((key) => {
    const englishFestival = (enFestivals as any)[key];
    return englishFestival?.date === currentDate;
  });

  const englishFestival = englishFestivalKey
    ? (enFestivals as any)[englishFestivalKey]
    : null;

  if (!englishFestival) {
    console.warn(`⚠️ No English festival found for date: ${currentDate}`);
    return;
  }

  // 3️⃣ Extract video keywords, date, and name
  const englishKeywords = englishFestival.videoKeywords || [];
  const englishName = englishFestival.name;
  const festivalDate = englishFestival.date;

  if (!englishKeywords.length) {
    console.warn(`⚠️ No video keywords found for date: ${festivalDate}`);
    return;
  }

  // 4️⃣ Format keywords into search query
  const searchQuery = englishKeywords.map((kw) => `"${kw}"`).join(" ");

  console.log("🎥 Navigating with English keywords:", englishKeywords, "📅 Date:", festivalDate);

  // 5️⃣ Navigate with full English data
  navigation.navigate("RelatedVideosScreen", {
    tag: englishKeywords,
    search: searchQuery,
    date: festivalDate,
    title: englishName,
  });
}}
                  >
                    <Icon name="videocam-outline" size={18} color="#fff" />
                  </TouchableOpacity>
</View>
                {/* Name + Date + Video */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <TextComponent                type="cardText"
                                      style={{ color: Colors.Colors.blue_text,textAlign:"center",marginHorizontal:10,marginTop:4 }}>
                    {festival.name}
                  </TextComponent>
                
                </View>

                <TextComponent
  type="semiBoldText"
                    style={{
                      color: Colors.Colors.blue_text,
                      marginVertical: 6,textAlign:"center",marginHorizontal:10
                    }}
                >
                  {moment(festival.date, "YYYY-MM-DD").format("MMM DD, YYYY")}
                </TextComponent>
</ImageBackground>
<View style={{marginHorizontal:6,alignItems:"center"}}>
                {/* <View style={styles.quoteBox}> */}
                  <TextComponent type="streakSadanaText" style={{textAlign:"center"}}>
                    {festival.quote.text}
                  </TextComponent>
                  <TextComponent type="headerSubBoldText" style={{alignSelf:"flex-end"}}>
                    — {festival.quote.source}
                  </TextComponent>
                {/* </View> */}

                {/* ✅ ScrollView starts at Fasting Rules */}
                  <TextComponent type="headerSubBoldText" style={{}}>
                    {t("festivalCard.fastingRules")}
                  </TextComponent>
                  <TextComponent type="streakSadanaText" style={{textAlign:"center"}}>
                    {festival.fasting.rules}
                  </TextComponent>

                  <TextComponent type="headerSubBoldText" style={{marginTop:4}}>
                    {t("festivalCard.fastingSignificance")}
                  </TextComponent>
                  <TextComponent type="streakSadanaText" style={{textAlign:"center"}}>
                    {festival.fasting.significance}
                  </TextComponent>

                  <TextComponent type="headerSubBoldText" style={{marginTop:4}}>
                    {t("festivalCard.spiritualBenefit")}
                  </TextComponent>
                  <TextComponent type="streakSadanaText" style={{textAlign:"center"}}>
                    {festival.spiritualBenefit}
                  </TextComponent>

                  <TextComponent type="headerSubBoldText" style={{marginTop:4}}>
                    {t("festivalCard.story")}
                  </TextComponent>
                  <TextComponent type="streakSadanaText" style={{textAlign:"center"}}>
                    {festival.mythology.story}
                  </TextComponent>
                  <TextComponent
                    type="headerSubBoldText"
                    style={{ marginTop: 4 }}
                  >
                  {t("festivalCard.source")} :<TextComponent type="streakSadanaText" >{festival.mythology.reference}</TextComponent>
                  </TextComponent>

                  <TextComponent type="streakSadanaText" style={{textAlign:"center"}}>
                    {Array.isArray(festival.deity) ? festival.deity.join(", ") : festival.deity}
                  </TextComponent>
                   <TextComponent type="streakSadanaText"
                    style={{ textAlign:"center",color: Colors.Colors.blue_text, marginTop: 2, marginBottom: 8 }}
                  >
                    {festival.fasting.observers}
                  </TextComponent>
                  </View>
{/* <View
  style={{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginVertical: 10,
  }}
>
  {["celebrationPractices", "traditionalFoods", "symbols"].map((key, idx) => (
    <View
      key={idx}
      style={{
        flex: 1,
        marginHorizontal: 4,
        alignItems:"center"
      }}
    >
      <TextComponent
        type="cardText"
        style={{
          color: Colors.Colors.Light_black,
          textAlign: "center",
          marginBottom: 8,
          minHeight: 50, 
          justifyContent: "center",
          textAlignVertical: "center",
          alignSelf:"center"
        }}
      >
        {t(`festivalCard.${key}`)}
      </TextComponent>
      <View style={{ alignItems: "center" }}>
        {(festival as any)[key]?.map((item: string, i: number) => (
          <TextComponent
            key={i}
            type="mediumText"
            style={{
              color: Colors.Colors.App_theme,
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            {item}
          </TextComponent>
        ))}
      </View>
    </View>
  ))}
</View> */}

<View style={{
  // borderRadius: 6,
    overflow: "hidden",
    marginVertical: 10,
    backgroundColor: "#FFF4CE",
    // borderWidth: 1,
    // borderColor: Colors.Colors.App_theme,
    // ✅ elevation + shadow
    elevation: 3,
    shadowColor: Colors.Colors.App_theme,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
}}>
  <View style={{    flexDirection: "row",backgroundColor:"#FFF4CE",borderBottomWidth: 1,borderBottomColor: Colors.Colors.App_theme}}>
    {["celebrationPractices", "traditionalFoods", "symbols"].map((key, idx) => (
      <View key={idx} style={{ flex: 1,alignItems: "center",justifyContent: "center", paddingVertical: 8,paddingHorizontal: 4,}}>
        <TextComponent type="cardText" style={styles.headerText}>
          {t(`festivalCard.${key}`)}
        </TextComponent>
      </View>
    ))}
  </View>
  {Array.from(
    { length: Math.max(
      (festival.celebrationPractices?.length || 0),
      (festival.traditionalFoods?.length || 0),
      (festival.symbols?.length || 0)
    ) }
  ).map((_, rowIndex) => (
    <View key={rowIndex} style={{flexDirection: "row",backgroundColor:"#FFF4CE",flex:1}}>
      {["celebrationPractices", "traditionalFoods", "symbols"].map((key, colIndex) => {
        const items = (festival as any)[key] || [];
        const value = items[rowIndex] || "";
        return (
          <View key={colIndex} style={[styles.tableCell, styles.dataCell]}>
            <TextComponent type="mediumText" style={styles.cellText}>
              {value || "—"}
            </TextComponent>
          </View>
        );
      })}
    </View>
  ))}
</View>

                  {/* <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    {["celebrationPractices", "traditionalFoods", "symbols"].map((key, idx) => (
                      <View key={idx} style={{ flex: 1, marginHorizontal: 4 }}>
                        <TextComponent
                          type="cardText"
                          style={{
                            color: Colors.Colors.Light_black,
                            textAlign: "center",
                            marginBottom: 6,
                          }}
                        >
                          {t(`festivalCard.${key}`)}
                        </TextComponent>
                        {(festival as any)[key]?.map((item: string, i: number) => (
                          <TextComponent
                            key={i}
                            type="mediumText"
                            style={{
                              color: Colors.Colors.App_theme,
                              textAlign: "center",
                              marginBottom: 4,
                            }}
                          >
                            {item}
                          </TextComponent>
                        ))}
                      </View>
                    ))}
                  </View> */}
<View style={{marginHorizontal:2,alignItems:"center"}}>

                  <TextComponent type="streakSadanaText" style={{marginTop:6}}>
                    {t("festivalCard.regionalCustoms")}
                  </TextComponent>
                  <TextComponent type="mediumText" style={{marginTop:4,textAlign:"center",color:Colors.Colors.BLACK}}>
                    {typeof festival.regionalCustoms === "object"
                      ? Object.entries(festival.regionalCustoms)
                          .map(([region, desc]) => `${region}: ${desc}`)
                          .join("\n")
                      : festival.regionalCustoms || "—"}
                  </TextComponent>
                  </View>
                </ScrollView>
                {/* ✅ ScrollView ends before buttons */}

                {/* Buttons */}
                {/* <View style={styles.buttonRow}> */}
                  <TouchableOpacity
                    style={styles.outlineBtn}
                    onPress={() => navigation.navigate("DailyPracticeList")}
                  >
                    <TextComponent type="semiBoldText" style={{ color: Colors.Colors.white}}>
                      {t("festivalCard.setupPractice")}
                    </TextComponent>
                  </TouchableOpacity>
                {/* </View> */}

                {/* Footer */}
                {/* <View style={styles.footer}>
                  <TextComponent type="semiBoldText" style={{ color: Colors.Colors.Light_grey }}>
                    {t("festivalCard.finishStreak")}
                  </TextComponent>
                  <Image
                    source={require("../../assets/Streak_A1.png")}
                    style={{ height: 20, width: 20, marginLeft: 4 }}
                  />
                </View> */}
              </View>
            </Card>

            {/* Share layout (unchanged) */}
            {shareVisible && festivalToShare && (
              <View
                style={{
                  position: "absolute",
                  top: -9999,
                  left: 0,
                  opacity: 0,
                }}
                pointerEvents="none"
              >
                <ViewShot ref={shareRef} options={{ format: "png", quality: 1 }}>
                  <ImageBackground
                    source={require("../../assets/Streak_bg.png")}
                    style={{
                      width: FontSize.CONSTS.DEVICE_WIDTH,
                      height: 480,
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 40,
                    }}
                resizeMode="contain"
                  >
                    <TextComponent
                      type="boldText"
                      style={{
                        color: "#925910",
                        fontSize: FontSize.CONSTS.FS_22,
                        marginBottom: 10,
                        textAlign: "center",
                      }}
                    >
                      {festivalToShare.name}
                    </TextComponent>

                    <TextComponent
                      type="mediumText"
                      style={{
                        color: "#925910",
                        fontSize: FontSize.CONSTS.FS_18,
                        textAlign: "center",
                        marginBottom: 20,
                      }}
                    >
                      {festivalToShare.quote.text}
                    </TextComponent>

                    <TextComponent
                      type="semiBoldText"
                      style={{
                        color: Colors.Colors.App_theme,
                        fontSize: FontSize.CONSTS.FS_20,
                        textAlign: "center",
                      }}
                    >
                      {moment(festivalToShare.date).format("MMM DD, YYYY")}
                    </TextComponent>

                    <TextComponent
                      type="boldText"
                      style={{
                        color: Colors.Colors.App_theme,
                        fontSize: FontSize.CONSTS.FS_22,
                        marginTop: 20,
                      }}
                    >
                      KalpX
                    </TextComponent>
                    <TextComponent
                      type="semiBoldText"
                      style={{
                        color: "#925910",
                        fontSize: FontSize.CONSTS.FS_14,
                      }}
                    >
                      Connect to Your Roots
                    </TextComponent>
                  </ImageBackground>
                </ViewShot>
              </View>
            )}

            {/* RIGHT ARROW */}
            <TouchableOpacity
              disabled={index === festivals.length - 1}
              onPress={() => swiperRef.current?.scrollBy(1)}
              style={[
                styles.arrowButton,
                {
                  backgroundColor:
                    index === festivals.length - 1 ? "#707070" : Colors.Colors.App_theme,
                  right: 4,
                },
              ]}
            >
              <Image source={require("../../assets/arrow_home.png")} />
            </TouchableOpacity>
          </View>
        );
      })}
    </Swiper>
  );
};

export default FestivalCard;

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 },
  card: {
    borderRadius: 6,
    elevation: 3,
     backgroundColor: "#FFFCF7",
    width: FontSize.CONSTS.DEVICE_WIDTH * 0.91,
        overflow: "hidden",
            borderWidth:1,
            borderColor:Colors.Colors.App_theme
  },
  arrowButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -15 }],
    borderRadius: 20,
    alignItems: "center",
    width: 30,
    height: 30,
    justifyContent: "center",
    zIndex: 99,
  },
  headerRow: {     flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,},
   streakIcon: { height: 30, width: 30, marginLeft: 5,marginRight:5 },
  quoteBox: {
    backgroundColor: "#FDFBF6",
    borderRadius: 6,
    padding: 10,
    borderColor: Colors.Colors.App_theme,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    marginVertical: 4,
  },
  quoteText: { fontSize: FontSize.CONSTS.FS_14, color: Colors.Colors.BLACK },
  quoteSource: { fontSize: FontSize.CONSTS.FS_12, color: Colors.Colors.Light_grey, marginTop: 4 },
  sectionTitle: { color: Colors.Colors.Light_black, marginTop: 10 },
  sectionText: { marginTop: 4, color: Colors.Colors.BLACK },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 15 },
  outlineBtn: {
    // flex: 1,
    backgroundColor: Colors.Colors.Yellow,
    //  borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
       marginHorizontal:16,
    // marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
    marginVertical:15
  },
  footer: { alignSelf: "center", alignItems: "center", flexDirection: "row" },
    partialBgContainer: {
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderTopRightRadius: 16,
        borderTopLeftRadius:16,
        // marginTop: 8,
        width: FontSize.CONSTS.DEVICE_WIDTH ,
      },
      partialBgImage: {
         borderTopRightRadius: 16,
        borderTopLeftRadius:16,
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center",
        // resizeMode: "center",
        // opacity: 0.9, // optional: adjust background intensity
      },
      tableContainer: {
    borderRadius: 4,
    overflow: "hidden",
    // marginHorizontal: 6,
    marginVertical: 10,
    backgroundColor:"#FFF4CE"
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor:"#FFF4CE",
  },
  tableHeader: {
    backgroundColor: "red", // light header background
  },
  tableCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor:""
    // borderRightWidth: 1,
    // borderColor: Colors.Colors.BLACK,
  },
  headerCell: {
    // borderRightWidth: 1,
    // borderColor: Colors.Colors.BLACK,
  },
  dataCell: {
    backgroundColor: "#FFF4CE",
  },
   headerText: {
    color: Colors.Colors.App_theme,
    textAlign: "center",
  },
  cellText: {
    color: Colors.Colors.BLACK,
    textAlign: "center",
  },
});

















// import { useNavigation } from "@react-navigation/native";
// import * as FileSystem from "expo-file-system";
// import * as Sharing from "expo-sharing";
// import i18next from "i18next";
// import moment from "moment";
// import React, { useEffect, useRef, useState } from "react";
// import { useTranslation } from "react-i18next";
// import { ActivityIndicator, Image, ImageBackground, StyleSheet, TouchableOpacity, View } from "react-native";
// import { Card } from "react-native-paper";
// import Swiper from "react-native-swiper";
// import Icon from "react-native-vector-icons/Ionicons";
// import ViewShot, { captureRef } from "react-native-view-shot";
// import { Festival, getTodayFestival, getUpcomingFestivals } from "../data/festivals";
// import Colors from "./Colors";
// import FontSize from "./FontSize";
// import TextComponent from "./TextComponent";

// const FestivalCard = () => {
//   const navigation: any = useNavigation();
//       const { i18n , t} = useTranslation();
//   const swiperRef = useRef<Swiper>(null);
//     const shareRef = useRef(null);
//   const [festivals, setFestivals] = useState<Festival[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [completedIds, setCompletedIds] = useState<string[]>([]);
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [shareVisible, setShareVisible] = useState(false);
//   const [festivalToShare, setFestivalToShare] = useState<Festival | null>(null);

//   useEffect(() => {
//     const today = getTodayFestival();
//     const upcoming = getUpcomingFestivals(3);
//     const all = today ? [today, ...upcoming] : upcoming;
//     setFestivals(all);
//     setLoading(false);
//   }, [i18next.language]);


//   // 🟢 2️⃣ Updated: Now this function takes a festival parameter
//   const handleShareFestival = async (festival: Festival) => {
//     try {
//       setFestivalToShare(festival); // 🟢 3️⃣ Store which festival is clicked
//       setShareVisible(true);

//       await new Promise((resolve) => setTimeout(resolve, 400));

//       // 🟢 4️⃣ Capture that specific festival's data
//       const uri = await captureRef(shareRef, { format: "png", quality: 1 });
//       const fileUri = `${FileSystem.cacheDirectory}festival_share_${Date.now()}.png`;
//       await FileSystem.copyAsync({ from: uri, to: fileUri });

//       setShareVisible(false);

//       if (!(await Sharing.isAvailableAsync())) {
//          alert(t("festivalCard.sharingNotAvailable"));
//         return;
//       }

//       await Sharing.shareAsync(fileUri, {
//       dialogTitle: t("festivalCard.shareDialogTitle"),
//         mimeType: "image/png",
//         UTI: "image/png",
//       });
//     } catch (error) {
//       console.error("❌ Error sharing Festival:", error);
//       setShareVisible(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={Colors.Colors.App_theme} />
//         <TextComponent>{t("festivalCard.loading")}</TextComponent>
//       </View>
//     );
//   }

//   if (festivals.length === 0) {
//     return (
//       <Card style={styles.card}>
//         <TextComponent type="semiBoldText" style={{ color: Colors.Colors.App_theme, textAlign: "center" }}>
//            {t("festivalCard.noFestival")}
//         </TextComponent>
//         <TextComponent
//           type="mediumText"
//           style={{ marginTop: 8, textAlign: "center", color: Colors.Colors.Light_black }}
//         >
//            {t("festivalCard.checkTomorrow")}
//         </TextComponent>
//       </Card>
//     );
//   }

//   const handleComplete = (festivalName: string) => {
//     if (!completedIds.includes(festivalName)) {
//       setCompletedIds((prev) => [...prev, festivalName]);
//     }
//   };

//   return (
//     <Swiper
//       ref={swiperRef}
//       loop={false}
//       index={activeIndex}
//       showsPagination={false}
//       onIndexChanged={(i) => setActiveIndex(i)}
//       autoplay={false}
//       horizontal
//       removeClippedSubviews={false}
//       style={{ height: "auto" }}
//     >
//       {festivals.map((festival, index) => {
//         const isCompleted = completedIds.includes(festival.name);
//         return (
//           <View
//             key={index}
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               justifyContent: "center",
//               width: FontSize.CONSTS.DEVICE_WIDTH,
//               paddingHorizontal: 5,
//             }}
//           >
//             {/* LEFT ARROW */}
//             <TouchableOpacity
//               disabled={index === 0}
//               onPress={() => swiperRef.current?.scrollBy(-1)}
//               style={[
//                 styles.arrowButton,
//                 {
//                   backgroundColor: index === 0 ? "#707070" : Colors.Colors.App_theme,
//                   left: 2,
//                 },
//               ]}
//             >
//               <Image source={require("../../assets/arrow_home.png")} style={{ transform: [{ rotate: "180deg" }] }} />
//             </TouchableOpacity>

//             {/* CARD */}
//             <Card style={[styles.card, isCompleted && { backgroundColor: Colors.Colors.Light_grey }]}>
//               <View>
//                 <TextComponent type="semiBoldText" style={{ alignSelf: "flex-end" }}>
//                    {t("festivalCard.blessingQuote")}
//                 </TextComponent>

//                 {/* Header */}
//                 <View style={styles.headerRow}>
//                   <TextComponent type="semiBoldText" style={{ color: Colors.Colors.BLACK }}>
//                                         {moment(festival.date).isSame(moment(), "day") ? t("festivalCard.todayFestival") : t("festivalCard.upcomingFestival")}
//                     {/* {moment(festival.date).isSame(moment(), "day") ? "Today’s Festival" : "Upcoming Festival"} */}
//                   </TextComponent>
//                   <TouchableOpacity onPress={() => {handleShareFestival(festival)}}  style={{ flexDirection: "row", alignItems: "center" }}>
//                     <Image source={require("../../assets/Streak_S1.png")} style={styles.streakIcon} />
//                     <Image source={require("../../assets/Streak_S2.png")} style={styles.streakIcon} />
//                     <Image source={require("../../assets/Streak_S3.png")} style={styles.streakIcon} />
//                     <Image source={require("../../assets/Streak_S4.png")} style={styles.streakIcon} />
//                   </TouchableOpacity>
//                 </View>

//                 {/* Name + Date */}
//                 <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
//                 <TextComponent type="semiBoldText" style={{ color: Colors.Colors.App_theme }}>
//                   {festival.name}
//                 </TextComponent>
//                   <TouchableOpacity
//                                   // onPress={() =>
//                                   //   navigation.navigate("RelatedVideosScreen", {
//                                   //     tag: currentMantra.tags,
//                                   //   })
//                                   // }
//                                   style={{
//                                     marginLeft: 8,
//                                     padding: 6,
//                                     backgroundColor: Colors.Colors.App_theme,
//                                     borderRadius: 50,
//                                     justifyContent: "center",
//                                     alignItems: "center",
//                                     alignSelf: "flex-end",
//                                   }}
//                                 >
//                                   <Icon name="videocam-outline" size={18} color="#fff" />
//                                 </TouchableOpacity>
//                                 </View>
//                 <TextComponent
//                   type="semiBoldText"
//                   style={{ color: Colors.Colors.App_theme, marginVertical: 6 }}
//                 >
//                   {moment(festival.date, "YYYY-MM-DD").format("MMM DD, YYYY")}
//                 </TextComponent>

//                 {/* Quote */}
//                 <View style={styles.quoteBox}>
//                   <TextComponent type="mediumText" style={styles.quoteText}>
//                     {festival.quote.text}
//                   </TextComponent>
//                   <TextComponent type="mediumText" style={styles.quoteSource}>
//                     — {festival.quote.source}
//                   </TextComponent>
//                 </View>

//                 {/* Info Sections */}
//                 <TextComponent type="cardText" style={styles.sectionTitle}>
//                             {t("festivalCard.fastingRules")}
//                 </TextComponent>
//                 <TextComponent type="mediumText" style={styles.sectionText}>
//                   {festival.fasting.rules}
//                 </TextComponent>

//                 <TextComponent type="cardText" style={styles.sectionTitle}>
//                 {t("festivalCard.fastingSignificance")}
//                 </TextComponent>
//                 <TextComponent type="mediumText" style={styles.sectionText}>
//                   {festival.fasting.significance}
//                 </TextComponent>

//                 <TextComponent type="cardText" style={styles.sectionTitle}>
//              {t("festivalCard.spiritualBenefit")}
//                 </TextComponent>
//                 <TextComponent type="mediumText" style={styles.sectionText}>
//                   {festival.spiritualBenefit}
//                 </TextComponent>

//                 <TextComponent type="cardText" style={styles.sectionTitle}>
//             {t("festivalCard.reference")}
//                 </TextComponent>
//                 <TextComponent type="mediumText" style={styles.sectionText}>
//                   {festival.mythology.story}
//                 </TextComponent>
//                 <TextComponent
//                   type="mediumText"
//                   style={{ color: Colors.Colors.Light_grey, marginTop: 4 }}
//                 >
//                  {t("festivalCard.referenceLabel")}:{festival.mythology.reference}
//                 </TextComponent>

//                 {/* Deity + Observers */}
//                 <TextComponent type="mediumText" style={{ marginTop: 4 }}>
//                   {Array.isArray(festival.deity) ? festival.deity.join(", ") : festival.deity}
//                 </TextComponent>
//                 <TextComponent
//                   type="mediumText"
//                   style={{ color: Colors.Colors.App_theme, marginTop: 2, marginBottom: 8 }}
//                 >
//                   {festival.fasting.observers}
//                 </TextComponent>

//                 {/* Celebration, Foods, Symbols */}
//             <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
//   {["celebrationPractices", "traditionalFoods", "symbols"].map((key, index) => (
//     <View key={index} style={{ flex: 1, marginHorizontal: 4 }}>
//       <TextComponent
//         type="cardText"
//         style={{
//           color: Colors.Colors.Light_black,
//           textAlign: "center",
//           marginBottom: 6,
//         }}
//       >
//         {t(`festivalCard.${key}`, {
//           defaultValue:
//             key === "celebrationPractices"
//               ? "Celebration Practices"
//               : key === "traditionalFoods"
//               ? "Traditional Foods"
//               : "Symbols",
//         })}
//       </TextComponent>

//       {(festival as any)[key]?.map((item: string, idx: number) => (
//         <TextComponent
//           key={idx}
//           type="mediumText"
//           style={{
//             color: Colors.Colors.App_theme,
//             textAlign: "center",
//             marginBottom: 4,
//           }}
//         >
//           {item}
//         </TextComponent>
//       ))}
//     </View>
//   ))}
// </View>


//                 {/* Regional Customs */}
//                 <TextComponent type="cardText" style={styles.sectionTitle}>
//                   {t("festivalCard.regionalCustoms", { defaultValue: "Regional Customs" })}
//                 </TextComponent>
//                 <TextComponent type="mediumText" style={styles.sectionText}>
//                   {typeof festival.regionalCustoms === "object"
//                     ? Object.entries(festival.regionalCustoms)
//                         .map(([region, desc]) => `${region}: ${desc}`)
//                         .join("\n")
//                     : festival.regionalCustoms || "—"}
//                 </TextComponent>

//                 {/* Buttons */}
//                 <View style={styles.buttonRow}>
//                   <TouchableOpacity
//                     style={styles.outlineBtn}
//                     onPress={() => navigation.navigate("MySadana")}
//                   >
//                     <TextComponent type="semiBoldText">{t("festivalCard.setupPractice")}</TextComponent>
//                   </TouchableOpacity>
//                 </View>

//                 {/* Footer */}
//                 <View style={styles.footer}>
//                   <TextComponent type="semiBoldText" style={{ color: Colors.Colors.Light_grey }}>
//                   {t("festivalCard.finishStreak")}
//                   </TextComponent>
//                   <Image source={require("../../assets/Streak_A1.png")} style={{ height: 20, width: 20, marginLeft: 4 }} />
//                 </View>
//               </View>
//             </Card>
// {shareVisible && festivalToShare && (
//         <View
//           style={{
//             position: "absolute",
//             top: -9999,
//             left: 0,
//             opacity: 0,
//           }}
//           pointerEvents="none"
//         >
//           <ViewShot ref={shareRef} options={{ format: "png", quality: 1 }}>
//             <ImageBackground
//               source={require("../../assets/Streak_bg.png")}
//               style={{
//                 width: FontSize.CONSTS.DEVICE_WIDTH,
//                 height: 480,
//                 alignItems: "center",
//                 justifyContent: "center",
//                 padding: 40,
//               }}
//               resizeMode="cover"
//             >
//               <TextComponent
//                 type="boldText"
//                 style={{
//                   color: "#925910",
//                   fontSize: FontSize.CONSTS.FS_22,
//                   marginBottom: 10,
//                   textAlign: "center",
//                 }}
//               >
//                 {festivalToShare.name}
//               </TextComponent>

//               <TextComponent
//                 type="mediumText"
//                 style={{
//                   color: "#925910",
//                   fontSize: FontSize.CONSTS.FS_18,
//                   textAlign: "center",
//                   marginBottom: 20,
//                 }}
//               >
//                 {festivalToShare.quote.text}
//               </TextComponent>

//               <TextComponent
//                 type="semiBoldText"
//                 style={{
//                   color: Colors.Colors.App_theme,
//                   fontSize: FontSize.CONSTS.FS_20,
//                   textAlign: "center",
//                 }}
//               >
//                 {moment(festivalToShare.date).format("MMM DD, YYYY")}
//               </TextComponent>

//               <TextComponent
//                 type="boldText"
//                 style={{
//                   color: Colors.Colors.App_theme,
//                   fontSize: FontSize.CONSTS.FS_22,
//                   marginTop: 20,
//                 }}
//               >
//                 KalpX
//               </TextComponent>
//               <TextComponent
//                 type="semiBoldText"
//                 style={{
//                   color: "#925910",
//                   fontSize: FontSize.CONSTS.FS_14,
//                 }}
//               >
//                 Connect to Your Roots
//               </TextComponent>
//             </ImageBackground>
//           </ViewShot>
//         </View>
//       )}
//             {/* RIGHT ARROW */}
//             <TouchableOpacity
//               disabled={index === festivals.length - 1}
//               onPress={() => swiperRef.current?.scrollBy(1)}
//               style={[
//                 styles.arrowButton,
//                 {
//                   backgroundColor:
//                     index === festivals.length - 1 ? "#707070" : Colors.Colors.App_theme,
//                   right: 4,
//                 },
//               ]}
//             >
//               <Image source={require("../../assets/arrow_home.png")} />
//             </TouchableOpacity>
//           </View>
//         );
//       })}
//     </Swiper>
//   );
// };

// export default FestivalCard;

// const styles = StyleSheet.create({
//   centered: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 },
//   card: {
//     borderRadius: 6,
//     elevation: 3,
//     backgroundColor: Colors.Colors.white,
//     padding: 16,
//     width: FontSize.CONSTS.DEVICE_WIDTH * 0.91,
//   },
//   arrowButton: {
//     position: "absolute",
//     top: "50%",
//     transform: [{ translateY: -15 }],
//     borderRadius: 20,
//     alignItems: "center",
//     width: 30,
//     height: 30,
//     justifyContent: "center",
//     zIndex: 99,
//   },
//   headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 12 },
//   streakIcon: { height: 20, width: 20, marginRight: 8 },
//   quoteBox: {
//     backgroundColor: "#FDFBF6",
//     borderRadius: 6,
//     padding: 10,
//     borderColor: Colors.Colors.App_theme,
//     borderLeftWidth: 3,
//     borderRightWidth: 3,
//     marginVertical: 4,
//   },
//   quoteText: { fontSize: FontSize.CONSTS.FS_14, color: Colors.Colors.BLACK },
//   quoteSource: { fontSize: FontSize.CONSTS.FS_12, color: Colors.Colors.Light_grey, marginTop: 4 },
//   sectionTitle: { color: Colors.Colors.Light_black, marginTop: 10 },
//   sectionText: { marginTop: 4, color: Colors.Colors.BLACK },
//   buttonRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 15 },
//   outlineBtn: {
//     flex: 1,
//     borderColor: Colors.Colors.Yellow,
//     borderWidth: 1,
//     borderRadius: 6,
//     paddingVertical: 10,
//     marginRight: 8,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   fillBtn: {
//     flex: 1,
//     backgroundColor: Colors.Colors.Yellow,
//     borderRadius: 6,
//     paddingVertical: 10,
//     marginLeft: 8,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   footer: { alignSelf: "center", alignItems: "center", flexDirection: "row" },
// });

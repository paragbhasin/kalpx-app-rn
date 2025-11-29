import { useNavigation } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import i18next from "i18next";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  // ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Card } from "react-native-paper";
import Swiper from "react-native-swiper";
import Icon from "react-native-vector-icons/Ionicons";
import ViewShot, { captureRef } from "react-native-view-shot";
import { getLocalizedWisdom } from "../data/wisdom";
import Colors from "./Colors";
import FontSize from "./FontSize";
import TextComponent from "./TextComponent";

const ITEMS_PER_DAY = 5;

const WisdomCard = () => {
  const navigation: any = useNavigation();
  const { i18n, t } = useTranslation();
  const swiperRef = useRef<Swiper>(null);
  const shareRef = useRef(null);
  const [wisdomData, setWisdomData] = useState<any[]>([]);
  const [currentBatch, setCurrentBatch] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [shareVisible, setShareVisible] = useState(false);

  const MOTIVATIONAL_QUOTES: any = t("wisdomCard.shareQuotes", {
    returnObjects: true,
  });

  useEffect(() => {
    const allWisdoms = getLocalizedWisdom();
    setWisdomData(allWisdoms);

    if (allWisdoms.length > 0) {
      const dayOfYear = moment().dayOfYear();
      const totalBatches = Math.ceil(allWisdoms.length / ITEMS_PER_DAY);
      const batchIndex = (dayOfYear - 1) % totalBatches;
      const start = batchIndex * ITEMS_PER_DAY;
      const end = start + ITEMS_PER_DAY;
      setCurrentBatch(allWisdoms.slice(start, end));
      setActiveIndex(0);
    }

    setLoading(false);
  }, [i18next.language]);

  const handleShareWisdom = async () => {
    try {
      setShareVisible(true);
      await new Promise((resolve) => setTimeout(resolve, 400));

      const uri = await captureRef(shareRef, { format: "png", quality: 1 });
      const fileUri = `${
        FileSystem.cacheDirectory
      }wisdom_share_${Date.now()}.png`;
      await FileSystem.copyAsync({ from: uri, to: fileUri });

      setShareVisible(false);

      if (!(await Sharing.isAvailableAsync())) {
        alert(t("wisdomCard.shareNotAvailable"));
        return;
      }

      await Sharing.shareAsync(fileUri, {
        dialogTitle: t("wisdomCard.shareTitle"),
        mimeType: "image/png",
        UTI: "image/png",
      });
    } catch (error) {
      console.error("❌ Error sharing Wisdom:", error);
      setShareVisible(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.Colors.App_theme} />
        <TextComponent>{t("wisdomCard.loading")}</TextComponent>
      </View>
    );
  }

  if (!currentBatch.length) {
    return (
      <Card style={styles.card}>
        <TextComponent
          type="semiBoldText"
          style={{ color: Colors.Colors.App_theme, textAlign: "center" }}
        >
          {t("wisdomCard.noWisdomTitle")}
        </TextComponent>
        <TextComponent
          type="mediumText"
          style={{
            marginTop: 8,
            textAlign: "center",
            color: Colors.Colors.Light_black,
          }}
        >
          {t("wisdomCard.noWisdomSubtitle")}
        </TextComponent>
      </Card>
    );
  }

  const handleComplete = (id: string) => {
    if (!completedIds.includes(id)) {
      setCompletedIds([...completedIds, id]);
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
      {currentBatch.map((wisdom, index) => {
        const isCompleted = completedIds.includes(wisdom.id);
        const quote =
          MOTIVATIONAL_QUOTES[
            Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
          ];

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
                  backgroundColor:
                    index === 0 ? "#707070" : Colors.Colors.App_theme,
                  left: 2,
                },
              ]}
            >
              <Image
                source={require("../../assets/arrow_home.png")}
                style={{ transform: [{ rotate: "180deg" }] }}
              />
            </TouchableOpacity>

            {/* CARD */}
            <Card
              style={[
                styles.card,
                isCompleted && { backgroundColor: Colors.Colors.Light_grey },
              ]}
            >
              <View>
                <ScrollView
                  showsVerticalScrollIndicator={true}
                  style={{ maxHeight: 320 }}
                  contentContainerStyle={{ paddingBottom: 10 }}
                >
                  <ImageBackground
                    source={require("../../assets/CardBG.png")}
                    // resizeMode="center"
                    style={styles.partialBgContainer}
                    imageStyle={styles.partialBgImage}
                  >
                    <TextComponent
                      type="semiBoldText"
                      style={{ color: Colors.Colors.App_theme ,marginBottom:8}}
                    >
                      {t("wisdomCard.spreadTruth")}
                    </TextComponent>

                    {/* Header */}
                    <View style={styles.headerRow}>
                      <TextComponent
                        type="cardHeaderText"
                        style={{ marginBottom:10 }}
                      >
                        {t("wisdomCard.dailyWisdom")}
                      </TextComponent>
                    </View>
                  <View style={{flexDirection:"row",alignSelf:"flex-end",right:20,marginTop:-46}}>
  <TouchableOpacity
                        onPress={() => {
                          handleShareWisdom();
                        }}
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        {/* <Image
                      source={require("../../assets/Streak_S1.png")}
                      style={styles.streakIcon}
                    />
                    <Image
                      source={require("../../assets/Streak_S2.png")}
                      style={styles.streakIcon}
                    />
                    <Image
                      source={require("../../assets/Streak_S3.png")}
                      style={styles.streakIcon}
                    /> */}
                        <Image
                          source={require("../../assets/Streak_S4.png")}
                          style={styles.streakIcon}
                        />
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
                          try {
                            // 🔍 Find the English wisdom item by its ID
                            const englishWisdom = require("../config/locales/en/wisdom-en.json");

                            const matchedWisdom = englishWisdom.find(
                              (item: any) => item.id === wisdom.id
                            );

                            if (!matchedWisdom) {
                              console.warn(
                                `⚠️ No English wisdom found for ID: ${wisdom.id}`
                              );
                              return;
                            }

                            // 🎯 Extract tags
                            const englishTags = matchedWisdom.tags || [];

                            if (!englishTags.length) {
                              console.warn(
                                `⚠️ No English tags found for wisdom: ${wisdom.id}`
                              );
                              return;
                            }

                            // 🧩 Format search query
                            const searchQuery = englishTags
                              .map((kw) => `"${kw}"`)
                              .join(" ");

                            console.log(
                              "🎥 Navigating with wisdom tags:",
                              englishTags,
                              searchQuery
                            );

                            // 🚀 Navigate to video screen
                            navigation.navigate("RelatedVideosScreen", {
                              tag: englishTags,
                              search: searchQuery,
                            });
                          } catch (error) {
                            console.error(
                              "❌ Error fetching English wisdom tags:",
                              error
                            );
                          }
                        }}
                      >
                        <Icon name="videocam-outline" size={18} color="#fff" />
                      </TouchableOpacity>
                      </View>
                    <TextComponent
                      type="cardText"
                      style={{
                        color: Colors.Colors.blue_text,
                        textAlign: "center",
                        marginHorizontal: 10,
                        marginTop:8
                      }}
                    >
                      {t(wisdom.text)}
                    </TextComponent>
                    {/* Fixed Video Icon */}
                  </ImageBackground>

                  {/* ✅ Scrollable content starts here */}

                  {/* Explanation */}
                  {Array.isArray(wisdom.explanation) ? (
                    wisdom.explanation.map((line, idx) => (
                      <TextComponent
                        type="mediumText"
                        style={{
                          color: Colors.Colors.Light_black,
                          marginVertical: 2,
                          textAlign: "center",
                        }}
                        key={idx}
                      >
                        {line}
                      </TextComponent>
                    ))
                  ) : (
                    <TextComponent
                      type="mediumText"
                      style={{
                        color: Colors.Colors.Light_black,
                        marginVertical: 2,
                        textAlign: "center",
                      }}
                    >
                      {wisdom.explanation}
                    </TextComponent>
                  )}

                  {/* Source */}
                  <TextComponent
                    type="headerSubBoldText"
                    style={{
                      color: Colors.Colors.blue_text,
                      alignSelf: "center",
                    }}
                  >
                    {t("wisdomCard.source")} :
                  </TextComponent>
                  {Array.isArray(wisdom.source.title) ? (
                    wisdom.source.title.map((line, idx) => (
                      <TextComponent
                        type="streakSadanaText"
                        style={{
                          color: Colors.Colors.blue_text,
                          textAlign: "center",
                        }}
                        key={idx}
                      >
                        {line}
                      </TextComponent>
                    ))
                  ) : (
                    <TextComponent
                      type="streakSadanaText"
                      style={{
                        color: Colors.Colors.blue_text,
                        textAlign: "center",
                      }}
                    >
                      {wisdom.source.title}
                    </TextComponent>
                  )}

                  {/* Tags */}
                  <View
                    style={{
                      flexDirection: "row",
                      marginVertical: 6,
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {wisdom.tags?.map((tag: string, i: number) => (
                      <View key={i} style={styles.tag}>
                        <TextComponent
                          type="streakSadanaText"
                          style={{ color: Colors.Colors.blue_text }}
                        >
                          #{tag}
                        </TextComponent>
                      </View>
                    ))}
                  </View>
                </ScrollView>
                {/* ✅ ScrollView ends before buttons */}

                {/* Buttons */}
                {/* <View style={styles.buttonRow}> */}
                  <TouchableOpacity
                    style={styles.outlineBtn}
                    onPress={() => navigation.navigate("DailyPracticeList")}
                  >
                    <TextComponent
                      type="semiBoldText"
                      style={{ textAlign: "center" ,color:Colors.Colors.white}}
                    >
                      {t("wisdomCard.setRoutine")}
                    </TextComponent>
                  </TouchableOpacity>
                {/* </View> */}

                {/* Footer */}
                <View style={styles.footer}>
                  <TextComponent
                    type="semiBoldText"
                    style={{ color: Colors.Colors.Light_grey }}
                  >
                    {t("wisdomCard.finishStreak")}
                  </TextComponent>
                  <Image
                    source={require("../../assets/Streak_A1.png")}
                    style={{ height: 20, width: 20, marginLeft: 4 }}
                  />
                </View>
              </View>
            </Card>

            {shareVisible && (
              <View
                style={{
                  position: "absolute",
                  top: -9999,
                  left: 0,
                  opacity: 0,
                }}
                pointerEvents="none"
              >
                <ViewShot
                  ref={shareRef}
                  options={{ format: "png", quality: 1 }}
                >
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
                        fontSize: FontSize.CONSTS.FS_20,
                        marginBottom: 10,
                        textAlign: "center",
                      }}
                    >
                      {quote}
                    </TextComponent>

                    {Array.isArray(wisdom.explanation) ? (
                      wisdom.explanation.map((line, idx) => (
                        <TextComponent
                          key={idx}
                          type="semiBoldText"
                          style={{
                            color: "#925910",
                            fontSize: FontSize.CONSTS.FS_18,
                            textAlign: "center",
                            marginBottom: 16,
                          }}
                        >
                          {line}
                        </TextComponent>
                      ))
                    ) : (
                      <TextComponent>{wisdom.explanation}</TextComponent>
                    )}

                    <TextComponent
                      type="semiBoldText"
                      style={{
                        color: Colors.Colors.App_theme,
                        fontSize: FontSize.CONSTS.FS_24,
                        marginVertical: 8,
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
              disabled={index === currentBatch.length - 1}
              onPress={() => swiperRef.current?.scrollBy(1)}
              style={[
                styles.arrowButton,
                {
                  backgroundColor:
                    index === currentBatch.length - 1
                      ? "#707070"
                      : Colors.Colors.App_theme,
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

export default WisdomCard;

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  card: {
    borderRadius: 6,
    overflow: "hidden",
    elevation: 3,
    backgroundColor: "#FFFCF7",
    width: FontSize.CONSTS.DEVICE_WIDTH * 0.91,
    borderWidth: 1,
    borderColor: Colors.Colors.App_theme,
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,
  },
  streakIcon: { height: 30, width: 30, marginLeft: 15, marginRight: 15 },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    marginRight: 4,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
    marginVertical: 15,
  },
  outlineBtn: {
    // flex: 1,
    backgroundColor: Colors.Colors.Yellow,
    // borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 8,
    // marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal:22
  },
  fillBtn: {
    flex: 1,
    backgroundColor: Colors.Colors.Yellow,
    borderRadius: 6,
    paddingVertical: 10,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: { alignSelf: "center", alignItems: "center", flexDirection: "row" ,marginVertical:12},
  partialBgContainer: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    // marginTop: 8,
    width: FontSize.CONSTS.DEVICE_WIDTH,
  },
  partialBgImage: {
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    // resizeMode: "center",
    // opacity: 0.9, // optional: adjust background intensity
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
// import { getLocalizedWisdom } from "../data/wisdom";
// import Colors from "./Colors";
// import FontSize from "./FontSize";
// import TextComponent from "./TextComponent";

// const ITEMS_PER_DAY = 5;

// // const MOTIVATIONAL_QUOTES = [
// //   "🪔 Let this wisdom illuminate your day.",
// //   "🌿 Ancient truth. Timeless light.",
// //   "💫 Reflect. Awaken. Grow with purpose.",
// //   "🌸 Every verse holds a seed of peace.",
// //   "🔥 A moment of wisdom can change your world.",
// // ];

// const WisdomCard = () => {
//   const navigation: any = useNavigation();
//       const { i18n , t} = useTranslation();
//   const swiperRef = useRef<Swiper>(null);
//     const shareRef = useRef(null);
//   const [wisdomData, setWisdomData] = useState<any[]>([]);
//   const [currentBatch, setCurrentBatch] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [completedIds, setCompletedIds] = useState<string[]>([]);
//   const [activeIndex, setActiveIndex] = useState(0);
//     const [shareVisible, setShareVisible] = useState(false);

//     const MOTIVATIONAL_QUOTES: any = t("wisdomCard.shareQuotes", { returnObjects: true });

//  useEffect(() => {
//   const allWisdoms = getLocalizedWisdom();
//   setWisdomData(allWisdoms);

//   if (allWisdoms.length > 0) {
//     const dayOfYear = moment().dayOfYear();
//     const totalBatches = Math.ceil(allWisdoms.length / ITEMS_PER_DAY);
//     const batchIndex = (dayOfYear - 1) % totalBatches;
//     const start = batchIndex * ITEMS_PER_DAY;
//     const end = start + ITEMS_PER_DAY;
//     setCurrentBatch(allWisdoms.slice(start, end));
//     setActiveIndex(0);
//   }

//   setLoading(false);
// }, [i18next.language]); // 👈 re-run when language changes

//   const handleShareWisdom = async () => {
//     try {
//       setShareVisible(true);
//       await new Promise((resolve) => setTimeout(resolve, 400));

//       const uri = await captureRef(shareRef, { format: "png", quality: 1 });
//       const fileUri = `${FileSystem.cacheDirectory}wisdom_share_${Date.now()}.png`;
//       await FileSystem.copyAsync({ from: uri, to: fileUri });

//       setShareVisible(false);

//       if (!(await Sharing.isAvailableAsync())) {
//     alert(t("wisdomCard.shareNotAvailable"));
//         return;
//       }

//       await Sharing.shareAsync(fileUri, {
//         dialogTitle: t("wisdomCard.shareTitle"),
//         mimeType: "image/png",
//         UTI: "image/png",
//       });
//     } catch (error) {
//       console.error("❌ Error sharing Wisdom:", error);
//       setShareVisible(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={Colors.Colors.App_theme} />
//          <TextComponent>{t("wisdomCard.loading")}</TextComponent>
//       </View>
//     );
//   }

//   if (!currentBatch.length) {
//     return (
//       <Card style={styles.card}>
//         <TextComponent
//           type="semiBoldText"
//           style={{ color: Colors.Colors.App_theme, textAlign: "center" }}
//         >
//          {t("wisdomCard.noWisdomTitle")}
//         </TextComponent>
//         <TextComponent
//           type="mediumText"
//           style={{
//             marginTop: 8,
//             textAlign: "center",
//             color: Colors.Colors.Light_black,
//           }}
//         >
//          {t("wisdomCard.noWisdomSubtitle")}
//         </TextComponent>
//       </Card>
//     );
//   }

//   const handleComplete = (id: string) => {
//     if (!completedIds.includes(id)) {
//       setCompletedIds([...completedIds, id]);
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
//       {currentBatch.map((wisdom, index) => {
//         const isCompleted = completedIds.includes(wisdom.id);
// const quote =
//   MOTIVATIONAL_QUOTES[
//     Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
//   ];

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
//                   backgroundColor:
//                     index === 0 ? "#707070" : Colors.Colors.App_theme,
//                   left: 2,
//                 },
//               ]}
//             >
//               <Image
//                 source={require("../../assets/arrow_home.png")}
//                 style={{ transform: [{ rotate: "180deg" }] }}
//               />
//             </TouchableOpacity>

//             {/* CARD */}
//             <Card
//               style={[
//                 styles.card,
//                 isCompleted && { backgroundColor: Colors.Colors.Light_grey },
//               ]}
//             >
//               <View>
//                 <TextComponent type="semiBoldText" style={{ alignSelf: "flex-end" }}>
//                  {t("wisdomCard.spreadTruth")}
//                 </TextComponent>

//                 {/* Header */}
//                 <View style={styles.headerRow}>
//                   <TextComponent type="semiBoldText" style={{ color: Colors.Colors.BLACK }}>
//               {t("wisdomCard.dailyWisdom")}
//                   </TextComponent>
//                   <TouchableOpacity onPress={() => {handleShareWisdom()}} style={{ flexDirection: "row", alignItems: "center" }} >
//                     <Image source={require("../../assets/Streak_S1.png")} style={styles.streakIcon} />
//                     <Image source={require("../../assets/Streak_S2.png")} style={styles.streakIcon} />
//                     <Image source={require("../../assets/Streak_S3.png")} style={styles.streakIcon} />
//                     <Image source={require("../../assets/Streak_S4.png")} style={styles.streakIcon} />
//                   </TouchableOpacity>
//                 </View>
//  <TouchableOpacity
//                   // onPress={() =>
//                   //   navigation.navigate("RelatedVideosScreen", {
//                   //     tag: currentMantra.tags,
//                   //   })
//                   // }
//                   style={{
//                     marginLeft: 8,
//                     padding: 6,
//                     backgroundColor: Colors.Colors.App_theme,
//                     borderRadius: 50,
//                     justifyContent: "center",
//                     alignItems: "center",
//                     alignSelf: "flex-end",
//                   }}
//                 >
//                   <Icon name="videocam-outline" size={18} color="#fff" />
//                 </TouchableOpacity>
//                 {/* Explanation */}
//                 {Array.isArray(wisdom.explanation)
//                   ? wisdom.explanation.map((line, idx) => (
//                       <TextComponent key={idx} style={{ marginTop: 4 }}>
//                         {line}
//                       </TextComponent>
//                     ))
//                   : (
//                     <TextComponent>{wisdom.explanation}</TextComponent>
//                   )}

//                 {/* Source */}
//                 <TextComponent
//                   type="semiBoldText"
//                   style={{ color: Colors.Colors.Light_black, marginVertical: 6 }}
//                 >
//               {t("wisdomCard.source")}
//                 </TextComponent>
//                 {Array.isArray(wisdom.source.title)
//                   ? wisdom.source.title.map((line, idx) => (
//                       <TextComponent key={idx} style={{ marginTop: 4 }}>
//                         {line}
//                       </TextComponent>
//                     ))
//                   : (
//                     <TextComponent>{wisdom.source.title}</TextComponent>
//                   )}

//                 {/* Tags */}
//                 <View style={{ flexDirection: "row", marginVertical: 8, flexWrap: "wrap" }}>
//                   {wisdom.tags?.map((tag: string, i: number) => (
//                     <View key={i} style={styles.tag}>
//                       <TextComponent type="semiBoldText"># {tag}</TextComponent>
//                     </View>
//                   ))}
//                 </View>

//                 {/* Buttons */}
//                 <View style={styles.buttonRow}>
//                   <TouchableOpacity
//                     style={styles.outlineBtn}
//                     onPress={() => navigation.navigate("MySadana")}
//                   >
//                     <TextComponent type="semiBoldText" style={{ textAlign: "center" }}>
//                     {t("wisdomCard.setRoutine")}
//                     </TextComponent>
//                   </TouchableOpacity>
//                 </View>

//                 {/* Footer */}
//                 <View style={styles.footer}>
//                   <TextComponent type="semiBoldText" style={{ color: Colors.Colors.Light_grey }}>
//                    {t("wisdomCard.finishStreak")}
//                   </TextComponent>
//                   <Image
//                     source={require("../../assets/Streak_A1.png")}
//                     style={{ height: 20, width: 20, marginLeft: 4 }}
//                   />
//                 </View>
//               </View>
//             </Card>
// {shareVisible && (
//               <View
//                 style={{
//                   position: "absolute",
//                   top: -9999,
//                   left: 0,
//                   opacity: 0,
//                 }}
//                 pointerEvents="none"
//               >
//                 <ViewShot ref={shareRef} options={{ format: "png", quality: 1 }}>
//                   <ImageBackground
//                     source={require("../../assets/Streak_bg.png")}
//                     style={{
//                       width: FontSize.CONSTS.DEVICE_WIDTH,
//                       height: 480,
//                       alignItems: "center",
//                       justifyContent: "center",
//                       padding: 40,
//                     }}
//                     resizeMode="cover"
//                   >
//                     <TextComponent
//                       type="boldText"
//                       style={{
//                         color: "#925910",
//                         fontSize: FontSize.CONSTS.FS_20,
//                         marginBottom: 10,
//                         textAlign: "center",
//                       }}
//                     >
//                       {quote}
//                     </TextComponent>
//      {/* Explanation */}
//                 {Array.isArray(wisdom.explanation)
//                   ? wisdom.explanation.map((line, idx) => (
//                      <TextComponent
//                       type="semiBoldText"
//                       style={{
//                         color: "#925910",
//                         fontSize: FontSize.CONSTS.FS_18,
//                         textAlign: "center",
//                         marginBottom: 16,
//                       }}
//                     >
//                       {line}
//                     </TextComponent>
//                     ))
//                   : (
//                     <TextComponent>{wisdom.explanation}</TextComponent>
//                   )}

//                     <TextComponent
//                       type="semiBoldText"
//                       style={{
//                         color: Colors.Colors.App_theme,
//                         fontSize: FontSize.CONSTS.FS_24,
//                         marginVertical: 8,
//                       }}
//                     >
//                       KalpX
//                     </TextComponent>

//                     <TextComponent
//                       type="semiBoldText"
//                       style={{
//                         color: "#925910",
//                         fontSize: FontSize.CONSTS.FS_14,
//                       }}
//                     >
//                       Connect to Your Roots
//                     </TextComponent>
//                   </ImageBackground>
//                 </ViewShot>
//               </View>
//             )}
//             {/* RIGHT ARROW */}
//             <TouchableOpacity
//               disabled={index === currentBatch.length - 1}
//               onPress={() => swiperRef.current?.scrollBy(1)}
//               style={[
//                 styles.arrowButton,
//                 {
//                   backgroundColor:
//                     index === currentBatch.length - 1
//                       ? "#707070"
//                       : Colors.Colors.App_theme,
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

// export default WisdomCard;

// const styles = StyleSheet.create({
//   centered: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 },
//   card: {
//     borderRadius: 6,
//     overflow: "hidden",
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
//   tag: {
//     paddingVertical: 6,
//     paddingHorizontal: 6,
//     marginRight: 4,
//   },
//   buttonRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "stretch",
//     marginVertical: 15,
//   },
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

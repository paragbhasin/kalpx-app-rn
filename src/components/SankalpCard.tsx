import { useNavigation } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Card } from "react-native-paper";
import Swiper from "react-native-swiper";
import Icon from "react-native-vector-icons/Ionicons";
import ViewShot, { captureRef } from "react-native-view-shot";
import enSankalps from "../config/locales/en/sankalps-en.json"; // adjust path accordingly
import { DAILY_SANKALPS } from "../data/sankalps";
import Colors from "./Colors";
import FontSize from "./FontSize";
import TextComponent from "./TextComponent";
import { parseSourceToTags } from "./parseSourceToTags";


// ✅ Deterministic daily random shuffle
const getTodaySeed = () => new Date().toISOString().split("T")[0];
function seededShuffle(array, seed) {
  const result = [...array];
  let x = Math.sin(seed.length) * 10000;
  const rand = () => {
    x = Math.sin(x) * 10000;
    return x - Math.floor(x);
  };
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ✅ Clean source → tags for videos
// ✅ Smart universal tag parser
// const parseSourceToTags = (source, id) => {
//   if (!source) return [id];

//   // Normalize text: remove punctuation but preserve meaningful words
//   const cleaned = source
//     .replace(/[.,;:()\-–]/g, " ") // remove punctuation
//     .replace(/[0-9]/g, "") // remove verse numbers
//     .replace(/\s+/g, " ") // collapse spaces
//     .trim()
//     .toLowerCase();

//   // Split into words
//   const words = cleaned.split(" ").filter(Boolean);

//   // Stopword list — skip short fillers only
//   const skipWords = new Set([
//     "of", "the", "and", "for", "with", "from", "into", "that", "this",
//     "those", "these", "are", "was", "will", "on", "in", "to", "by", "as", "is"
//   ]);

//   // Filter out meaningless words, keep rich terms like “ethical”, “living”, “principles”
//   const meaningful = words.filter(w => !skipWords.has(w) && w.length > 2);

//   // Deduplicate
//   const unique = [...new Set(meaningful)];

//   // Ensure Sankalp id (e.g., "truth_speech") is first
//   const tags = [id, ...unique];

//   // Limit to about 10 to keep search efficient
//   return tags.slice(0, 10);
// };


const SankalpCard = ({ practiceTodayData, onPressStartSankalp, onCompleteSankalp }) => {
  const navigation: any = useNavigation();
  const { t, i18n } = useTranslation();
  const swiperRef = useRef<Swiper>(null);
  const shareRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [shareVisible, setShareVisible] = useState(false);

  const startedSankalp = practiceTodayData?.started?.sankalp;
  const doneSankalp = practiceTodayData?.done?.sankalp;
  const sankalpId = practiceTodayData?.ids?.sankalp;

  const shareStage = doneSankalp ? 3 : startedSankalp ? 2 : 1;

  const { p: primaryText, s: secondaryText } = useMemo(() => {
    const s1: any = t("sankalpCard.stage1", { returnObjects: true });
    const s2: any = t("sankalpCard.stage2", { returnObjects: true });
    const s3: any = t("sankalpCard.stage3", { returnObjects: true });

    const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    if (shareStage === 3) return pick(s3);
    if (shareStage === 2) return pick(s2);
    return pick(s1);
  }, [shareStage, i18n.language]);

  // ✅ Randomize 5 Sankalps daily (same for that day)
  const filteredSankalps = useMemo(() => {
    if (startedSankalp && sankalpId) {
      const found = DAILY_SANKALPS.find((s) => s.id === sankalpId);
      return found ? [found] : [];
    }
    const shuffled = seededShuffle(DAILY_SANKALPS, getTodaySeed());
    return shuffled.slice(0, 5);
  }, [startedSankalp, sankalpId, i18n.language]);

  const handleShareSankalp = async () => {
    try {
      setShareVisible(true);
      await new Promise((resolve) => setTimeout(resolve, 400));

      const uri = await captureRef(shareRef, { format: "png", quality: 1 });
      const fileUri = `${FileSystem.cacheDirectory}sankalp_share_${Date.now()}.png`;
      await FileSystem.copyAsync({ from: uri, to: fileUri });

      setShareVisible(false);

      if (!(await Sharing.isAvailableAsync())) {
        alert("Sharing is not available on this device.");
        return;
      }

      await Sharing.shareAsync(fileUri, {
        dialogTitle: t("sankalpCard.shareDialogTitle"),
        mimeType: "image/png",
        UTI: "image/png",
      });
    } catch (error) {
      console.error("❌ Error sharing Sankalp:", error);
      setShareVisible(false);
    }
  };

  if (!filteredSankalps || filteredSankalps.length === 0) {
    return (
      <View style={{ padding: 20 }}>
        <TextComponent>{t("sankalpCard.noSankalps")}</TextComponent>
      </View>
    );
  }

  const getEnglishSourceForSankalp = (sankalpId: string): string => {
  const key = `sankalps.${sankalpId}.source`;
  return enSankalps[key] || "";
};


  return (
    <Swiper
      ref={swiperRef}
      loop={false}
      index={activeIndex}
      showsPagination={false}
      onIndexChanged={(i) => setActiveIndex(i)}
      scrollEnabled={!startedSankalp}
      autoplay={false}
      horizontal
      removeClippedSubviews={false}
      style={{ height: "auto" }}
    >
      {filteredSankalps.map((currentSankalp, index) => (
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
          {!startedSankalp && (
            <TouchableOpacity
              disabled={index === 0}
              onPress={() => swiperRef.current?.scrollBy(-1)}
              style={[
                styles.arrowButton,
                {
                  backgroundColor:
                    index === 0 ? "#707070" : Colors.Colors.App_theme,
                  left: 2,
                  zIndex: 999,
                },
              ]}
            >
              <Image
                source={require("../../assets/arrow_home.png")}
                style={{ transform: [{ rotate: "180deg" }] }}
              />
            </TouchableOpacity>
          )}

          <Card style={styles.card}>
            <View>
                 <ScrollView
                showsVerticalScrollIndicator={true}
                style={{ maxHeight: 350, marginTop: 5 }}
                contentContainerStyle={{ paddingBottom: 10 }}
              >
              <TextComponent type="semiBoldText" style={{ alignSelf: "flex-end" }}>
                {t("sankalpCard.shareHeader")}
              </TextComponent>

              <View style={styles.header}>
                <TextComponent
                  type="semiBoldText"
                  style={{
                    color: Colors.Colors.BLACK,
                    fontSize: FontSize.CONSTS.FS_16,
                  }}
                >
                  {t("sankalpCard.dailySankalp")}
                </TextComponent>
                <TouchableOpacity
                  onPress={() => handleShareSankalp()}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <Image source={require("../../assets/Streak_S1.png")} style={styles.streakIcon} />
                  <Image source={require("../../assets/Streak_S2.png")} style={styles.streakIcon} />
                  <Image source={require("../../assets/Streak_S3.png")} style={styles.streakIcon} />
                  <Image source={require("../../assets/Streak_S4.png")} style={styles.streakIcon} />
                </TouchableOpacity>
              </View>
{/* <TouchableOpacity
  onPress={() => {
    // Always use English text for parsing tags
    const englishSankalp = DAILY_SANKALPS.find(s => s.id === currentSankalp.id);
    const englishSource = englishSankalp?.source || currentSankalp.source;

    const tags = parseSourceToTags(englishSource, currentSankalp.id);
console.log("tags >>>>>>>>>>>>",tags);
    // 🔹 Just send the array as-is
    navigation.navigate("RelatedVideosScreen", { tag: tags });
  }}
  style={{
    marginLeft: 8,
    padding: 6,
    backgroundColor: Colors.Colors.App_theme,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
  }}
>
  <Icon name="videocam-outline" size={18} color="#fff" />
</TouchableOpacity> */}
<TouchableOpacity
  onPress={() => {
  // ✅ always get English source text, regardless of app language
    const englishSource = getEnglishSourceForSankalp(currentSankalp.id);

    // ✅ parse English source into search-friendly tags
    const { tags, searchQuery } = parseSourceToTags(englishSource, currentSankalp.id);

    console.log("🔍 Tags:", tags);
    console.log("🔎 Search Query:", searchQuery);

    navigation.navigate("RelatedVideosScreen", { tag: tags, search: searchQuery });
  }}
  style={{
    marginLeft: 8,
    padding: 6,
    backgroundColor: Colors.Colors.App_theme,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
  }}
>
  <Icon name="videocam-outline" size={18} color="#fff" />
</TouchableOpacity>


              {/* Scroll content */}
           
                <TextComponent
                  type="semiBoldText"
                  style={{
                    color: Colors.Colors.Light_black,
                    fontSize: FontSize.CONSTS.FS_14,
                  }}
                >
                  {t(currentSankalp.i18n?.short) || currentSankalp.short_text}
                </TextComponent>

                <TextComponent
                  type="semiBoldText"
                  style={{
                    color: Colors.Colors.Light_black,
                    marginVertical: 6,
                    fontSize: FontSize.CONSTS.FS_14,
                  }}
                >
                  {t("sankalpCard.whyThisMatters")}
                </TextComponent>
                <TextComponent style={{ fontSize: FontSize.CONSTS.FS_14 }}>
                  {t(currentSankalp.i18n?.tooltip) || currentSankalp.tooltip}
                </TextComponent>

                <TextComponent
                  type="semiBoldText"
                  style={{
                    color: Colors.Colors.Light_black,
                    marginVertical: 6,
                    fontSize: FontSize.CONSTS.FS_14,
                  }}
                >
                  {t("sankalpCard.suggestedPractice")}
                </TextComponent>
                <TextComponent style={{ fontSize: FontSize.CONSTS.FS_14 }}>
                  {t(currentSankalp.i18n?.suggested) || currentSankalp.suggested_practice}
                </TextComponent>

                <View style={styles.row}>
                  <TextComponent type="semiBoldText" style={styles.root}>
                    {t("sankalpCard.root")}
                  </TextComponent>
                  <TextComponent
                    type="semiBoldText"
                    style={{
                      color: Colors.Colors.Light_grey,
                      fontSize: FontSize.CONSTS.FS_14,
                    }}
                  >
                    {t(`sankalps.${currentSankalp.id}.root`) || currentSankalp.root}
                  </TextComponent>
                </View>

                {currentSankalp.meta?.timeOfDay && (
                  <View style={styles.row}>
                    <TextComponent type="semiBoldText" style={styles.root}>
                      {t("sankalpCard.bestTimes")}
                    </TextComponent>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {currentSankalp.meta.timeOfDay.map((tag, i) => (
                        <View key={i} style={styles.tag}>
                          <TextComponent
                            type="semiBoldText"
                            style={{
                              color: Colors.Colors.Light_grey,
                              fontSize: FontSize.CONSTS.FS_14,
                            }}
                          >
                            {t(`sankalpCard.best.${tag}`, { defaultValue: tag })}
                          </TextComponent>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {currentSankalp.meta?.context && (
                  <View style={styles.row}>
                    <TextComponent type="semiBoldText" style={styles.root}>
                      {t("context")}
                    </TextComponent>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {currentSankalp.meta.context.map((tag, i) => (
                        <View key={i} style={styles.tag}>
                          <TextComponent
                            type="semiBoldText"
                            style={{
                              color: Colors.Colors.App_theme,
                              fontSize: FontSize.CONSTS.FS_14,
                            }}
                          >
                            #{t(`context.${tag}`, { defaultValue: tag })}
                          </TextComponent>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <View style={styles.row}>
                  <TextComponent type="semiBoldText" style={styles.root}>
                    {t("sankalpCard.source")}
                  </TextComponent>
                  <TextComponent
                    type="semiBoldText"
                    style={{
                      color: Colors.Colors.App_theme,
                      fontSize: FontSize.CONSTS.FS_14,
                      // paddingLeft:10,
                        flexShrink: 1,
      flexWrap: "wrap",
                    }}
                  >
                    {t(`sankalps.${currentSankalp.id}.source`) || currentSankalp.source}
                  </TextComponent>
                </View>
              </ScrollView>

              {/* Buttons */}
              <View style={styles.buttonRow}>
                {!startedSankalp ? (
                  <TouchableOpacity
                    style={styles.startBtn}
                    onPress={() => onPressStartSankalp(currentSankalp)}
                  >
                    <TextComponent type="semiBoldText" style={{ textAlign: "center" }}>
                      {t("sankalpCard.iWillDo")}
                    </TextComponent>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={{ marginRight: 25, flexDirection: "row", marginTop: 10 }}
                    onPress={() => onCompleteSankalp(currentSankalp)}
                  >
                    {!doneSankalp && (
                      <View
                        style={{
                          width: 15,
                          height: 15,
                          borderColor: Colors.Colors.Light_grey,
                          borderWidth: 1,
                          borderRadius: 4,
                          marginRight: 10,
                        }}
                      />
                    )}
                    <TextComponent>
                      {doneSankalp
                        ? t("sankalpCard.done")
                        : t("sankalpCard.markDone")}
                    </TextComponent>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.dailyBtn}
                  onPress={() =>
                    navigation.navigate("MySadana", { selectedmantra: currentSankalp })
                  }
                >
                  <TextComponent
                    type="boldText"
                    style={{ color: Colors.Colors.Light_black, textAlign: "center" }}
                  >
                    {t("sankalpCard.addToDaily")}
                  </TextComponent>
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <TextComponent type="semiBoldText" style={{ color: Colors.Colors.Light_grey }}>
                  {t("sankalpCard.finishStreak")}
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
                  resizeMode="cover"
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
                    {primaryText}
                  </TextComponent>

                  <TextComponent
                    type="mediumText"
                    style={{
                      color: "#925910",
                      textAlign: "center",
                      fontSize: FontSize.CONSTS.FS_18,
                      marginBottom: 20,
                    }}
                  >
                    {secondaryText}
                  </TextComponent>

                  <TextComponent
                    type="semiBoldText"
                    style={{
                      color: "#925910",
                      fontSize: FontSize.CONSTS.FS_22,
                      textAlign: "center",
                      marginBottom: 10,
                    }}
                  >
                    {filteredSankalps[activeIndex]?.short_text}
                  </TextComponent>

                  <TextComponent
                    type="boldText"
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
                    style={{ color: "#925910", fontSize: FontSize.CONSTS.FS_14 }}
                  >
                    Connect to Your Roots
                  </TextComponent>

                  <TextComponent
                    type="semiBoldText"
                    style={{
                      color: Colors.Colors.App_theme,
                      fontSize: FontSize.CONSTS.FS_12,
                      marginTop: 8,
                    }}
                  >
                    KalpX.com
                  </TextComponent>
                </ImageBackground>
              </ViewShot>
            </View>
          )}

          {!startedSankalp && (
            <TouchableOpacity
              disabled={index === filteredSankalps.length - 1}
              onPress={() => swiperRef.current?.scrollBy(1)}
              style={[
                styles.arrowButton,
                {
                  backgroundColor:
                    index === filteredSankalps.length - 1
                      ? "#707070"
                      : Colors.Colors.App_theme,
                  right: 4,
                },
              ]}
            >
              <Image source={require("../../assets/arrow_home.png")} />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </Swiper>
  );
};

export default React.memo(SankalpCard);

const styles = StyleSheet.create({
  card: {
    borderRadius: 6,
    overflow: "hidden",
    elevation: 3,
    backgroundColor: Colors.Colors.white,
    padding: 16,
    width: FontSize.CONSTS.DEVICE_WIDTH * 0.91,
    maxHeight: 550,
    marginBottom: 40,
    zIndex: 99,
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },
  streakIcon: { height: 20, width: 20, marginRight: 8 },
  row: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  tag: { paddingHorizontal: 4, paddingVertical: 4, marginRight: 4 },
  root: { color: Colors.Colors.BLACK, fontSize: FontSize.CONSTS.FS_14, marginRight: 6 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
    marginVertical: 15,
    fontSize: FontSize.CONSTS.FS_14,
  },
  startBtn: {
    flex: 1,
    borderColor: Colors.Colors.Yellow,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  dailyBtn: {
    flex: 1,
    backgroundColor: Colors.Colors.Yellow,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: { alignSelf: "center", alignItems: "center", flexDirection: "row" },
});
















// import { useNavigation } from "@react-navigation/native";
// import * as FileSystem from "expo-file-system";
// import * as Sharing from "expo-sharing";
// import React, { useMemo, useRef, useState } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   Image,
//   ImageBackground,
//   // ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { ScrollView } from "react-native-gesture-handler";
// import { Card } from "react-native-paper";
// import Swiper from "react-native-swiper";
// import Icon from "react-native-vector-icons/Ionicons";
// import ViewShot, { captureRef } from "react-native-view-shot";
// import { DAILY_SANKALPS } from "../data/sankalps";
// import Colors from "./Colors";
// import FontSize from "./FontSize";
// import TextComponent from "./TextComponent";

// const SankalpCard = ({ practiceTodayData, onPressStartSankalp, onCompleteSankalp }) => {
//   const navigation: any = useNavigation();
//   const { t, i18n } = useTranslation();
//   const swiperRef = useRef<Swiper>(null);
//   const shareRef = useRef(null);
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [shareVisible, setShareVisible] = useState(false);

//   const startedSankalp = practiceTodayData?.started?.sankalp;
//   const doneSankalp = practiceTodayData?.done?.sankalp;
//   const sankalpId = practiceTodayData?.ids?.sankalp;

//   const shareStage = doneSankalp ? 3 : startedSankalp ? 2 : 1;

//   const { p: primaryText, s: secondaryText } = useMemo(() => {
//     const s1: any = t("sankalpCard.stage1", { returnObjects: true });
//     const s2: any = t("sankalpCard.stage2", { returnObjects: true });
//     const s3: any = t("sankalpCard.stage3", { returnObjects: true });

//     const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
//     if (shareStage === 3) return pick(s3);
//     if (shareStage === 2) return pick(s2);
//     return pick(s1);
//   }, [shareStage, i18n.language]);

//   const filteredSankalps = useMemo(() => {
//     if (startedSankalp && sankalpId) {
//       const found = DAILY_SANKALPS.find((s) => s.id === sankalpId);
//       return found ? [found] : [];
//     }
//     return DAILY_SANKALPS.slice(0, 5);
//   }, [startedSankalp, sankalpId]);

//   const handleShareSankalp = async () => {
//     try {
//       setShareVisible(true);
//       await new Promise((resolve) => setTimeout(resolve, 400));

//       const uri = await captureRef(shareRef, { format: "png", quality: 1 });
//       const fileUri = `${FileSystem.cacheDirectory}sankalp_share_${Date.now()}.png`;
//       await FileSystem.copyAsync({ from: uri, to: fileUri });

//       setShareVisible(false);

//       if (!(await Sharing.isAvailableAsync())) {
//         alert("Sharing is not available on this device.");
//         return;
//       }

//       await Sharing.shareAsync(fileUri, {
//         dialogTitle: t("sankalpCard.shareDialogTitle"),
//         mimeType: "image/png",
//         UTI: "image/png",
//       });
//     } catch (error) {
//       console.error("❌ Error sharing Sankalp:", error);
//       setShareVisible(false);
//     }
//   };

//   if (!filteredSankalps || filteredSankalps.length === 0) {
//     return (
//       <View style={{ padding: 20 }}>
//         <TextComponent>{t("sankalpCard.noSankalps")}</TextComponent>
//       </View>
//     );
//   }

//   return (
//     <Swiper
//       ref={swiperRef}
//       loop={false}
//       index={activeIndex}
//       showsPagination={false}
//       onIndexChanged={(i) => setActiveIndex(i)}
//       scrollEnabled={!startedSankalp}
//       autoplay={false}
//       horizontal
//       removeClippedSubviews={false}
//       // style={{ height: "70%" }}
//        style={{ height: "auto" }}
//     >
//       {filteredSankalps.map((currentSankalp, index) => (
//         <View
//           key={index}
//           style={{
//             flexDirection: "row",
//             alignItems: "center",
//             justifyContent: "center",
//             width: FontSize.CONSTS.DEVICE_WIDTH,
//             paddingHorizontal: 5,
//           }}
//         >
//           {!startedSankalp && (
//             <TouchableOpacity
//               disabled={index === 0}
//               onPress={() => swiperRef.current?.scrollBy(-1)}
//               style={[
//                 styles.arrowButton,
//                 {
//                   backgroundColor:
//                     index === 0 ? "#707070" : Colors.Colors.App_theme,
//                   left: 2,
//                     zIndex:999
//                 },
//               ]}
//             >
//               <Image
//                 source={require("../../assets/arrow_home.png")}
//                 style={{ transform: [{ rotate: "180deg" }] }}
//               />
//             </TouchableOpacity>
//           )}

//           <Card style={styles.card}>
//             <View>
//               <TextComponent type="semiBoldText" style={{ alignSelf: "flex-end" }}>
//                 {t("sankalpCard.shareHeader")}
//               </TextComponent>

//               <View style={styles.header}>
//                 <TextComponent
//                   type="semiBoldText"
//                   style={{
//                     color: Colors.Colors.BLACK,
//                     fontSize: FontSize.CONSTS.FS_16,
//                   }}
//                 >
//                   {t("sankalpCard.dailySankalp")}
//                 </TextComponent>
//                 <TouchableOpacity
//                   onPress={() => {
//                     handleShareSankalp();
//                   }}
//                   style={{ flexDirection: "row", alignItems: "center" }}
//                 >
//                   <Image source={require("../../assets/Streak_S1.png")} style={styles.streakIcon} />
//                   <Image source={require("../../assets/Streak_S2.png")} style={styles.streakIcon} />
//                   <Image source={require("../../assets/Streak_S3.png")} style={styles.streakIcon} />
//                   <Image source={require("../../assets/Streak_S4.png")} style={styles.streakIcon} />
//                 </TouchableOpacity>
//               </View>

//               <TouchableOpacity
//                 style={{
//                   marginLeft: 8,
//                   padding: 6,
//                   backgroundColor: Colors.Colors.App_theme,
//                   borderRadius: 50,
//                   justifyContent: "center",
//                   alignItems: "center",
//                   alignSelf: "flex-end",
//                 }}
//               >
//                 <Icon name="videocam-outline" size={18} color="#fff" />
//               </TouchableOpacity>

//               {/* ✅ Scrollable section added here */}
//               <ScrollView
//                 showsVerticalScrollIndicator={true}
//                 style={{ maxHeight: 230, marginTop: 5 }}
//                 contentContainerStyle={{ paddingBottom: 10 }}
//               >
//                 <TextComponent
//                   type="semiBoldText"
//                   style={{
//                     color: Colors.Colors.Light_black,
//                     fontSize: FontSize.CONSTS.FS_14,
//                   }}
//                 >
//                   {t(currentSankalp.i18n?.short) || currentSankalp.short_text}
//                 </TextComponent>

//                 <TextComponent
//                   type="semiBoldText"
//                   style={{
//                     color: Colors.Colors.Light_black,
//                     marginVertical: 6,
//                     fontSize: FontSize.CONSTS.FS_14,
//                   }}
//                 >
//                   {t("sankalpCard.whyThisMatters")}
//                 </TextComponent>
//                 <TextComponent style={{ fontSize: FontSize.CONSTS.FS_14 }}>
//                   {t(currentSankalp.i18n?.tooltip) || currentSankalp.tooltip}
//                 </TextComponent>

//                 <TextComponent
//                   type="semiBoldText"
//                   style={{
//                     color: Colors.Colors.Light_black,
//                     marginVertical: 6,
//                     fontSize: FontSize.CONSTS.FS_14,
//                   }}
//                 >
//                   {t("sankalpCard.suggestedPractice")}
//                 </TextComponent>
//                 <TextComponent style={{ fontSize: FontSize.CONSTS.FS_14 }}>
//                   {t(currentSankalp.i18n?.suggested) || currentSankalp.suggested_practice}
//                 </TextComponent>

//                 <View style={styles.row}>
//                   <TextComponent type="semiBoldText" style={styles.root}>
//                     {t("sankalpCard.root")}
//                   </TextComponent>
//                   <TextComponent
//                     type="semiBoldText"
//                     style={{
//                       color: Colors.Colors.Light_grey,
//                       fontSize: FontSize.CONSTS.FS_14,
//                     }}
//                   >
//                     {t(`sankalps.${currentSankalp.id}.root`) || currentSankalp.root}
//                   </TextComponent>
//                 </View>

//                 {currentSankalp.meta?.timeOfDay && (
//                   <View style={styles.row}>
//                     <TextComponent type="semiBoldText" style={styles.root}>
//                       {t("sankalpCard.bestTimes")}
//                     </TextComponent>
//                     <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                       {currentSankalp.meta.timeOfDay.map((tag, i) => (
//                         <View key={i} style={styles.tag}>
//                           <TextComponent
//                             type="semiBoldText"
//                             style={{
//                               color: Colors.Colors.Light_grey,
//                               fontSize: FontSize.CONSTS.FS_14,
//                             }}
//                           >
//                             {t(`sankalpCard.best.${tag}`, { defaultValue: tag })}
//                           </TextComponent>
//                         </View>
//                       ))}
//                     </ScrollView>
//                   </View>
//                 )}

//                 {currentSankalp.meta?.context && (
//                   <View style={styles.row}>
//                     <TextComponent type="semiBoldText" style={styles.root}>
//                       {t("context")}
//                     </TextComponent>
//                     <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                       {currentSankalp.meta.context.map((tag, i) => (
//                         <View key={i} style={styles.tag}>
//                           <TextComponent
//                             type="semiBoldText"
//                             style={{
//                               color: Colors.Colors.App_theme,
//                               fontSize: FontSize.CONSTS.FS_14,
//                             }}
//                           >
//                             #{t(`context.${tag}`, { defaultValue: tag })}
//                           </TextComponent>
//                         </View>
//                       ))}
//                     </ScrollView>
//                   </View>
//                 )}

//                 <View style={styles.row}>
//                   <TextComponent type="semiBoldText" style={styles.root}>
//                     {t("sankalpCard.source")}
//                   </TextComponent>
//                   <TextComponent
//                     type="semiBoldText"
//                     style={{
//                       color: Colors.Colors.App_theme,
//                       fontSize: FontSize.CONSTS.FS_14,
//                     }}
//                   >
//                     {t(`sankalps.${currentSankalp.id}.source`) || currentSankalp.source}
//                   </TextComponent>
//                 </View>
//               </ScrollView>
//               {/* ✅ ScrollView ends here */}

//               {/* Buttons */}
//               <View style={styles.buttonRow}>
//                 {!startedSankalp ? (
//                   <TouchableOpacity
//                     style={styles.startBtn}
//                     onPress={() => onPressStartSankalp(currentSankalp)}
//                   >
//                     <TextComponent type="semiBoldText" style={{ textAlign: "center" }}>
//                       {t("sankalpCard.iWillDo")}
//                     </TextComponent>
//                   </TouchableOpacity>
//                 ) : (
//                   <TouchableOpacity
//                     style={{ marginRight: 25, flexDirection: "row", marginTop: 10 }}
//                     onPress={() => onCompleteSankalp(currentSankalp)}
//                   >
//                     {!doneSankalp && (
//                       <View
//                         style={{
//                           width: 15,
//                           height: 15,
//                           borderColor: Colors.Colors.Light_grey,
//                           borderWidth: 1,
//                           borderRadius: 4,
//                           marginRight: 10,
//                         }}
//                       />
//                     )}
//                     <TextComponent>
//                       {doneSankalp
//                         ? t("sankalpCard.done")
//                         : t("sankalpCard.markDone")}
//                     </TextComponent>
//                   </TouchableOpacity>
//                 )}

//                 <TouchableOpacity
//                   style={styles.dailyBtn}
//                   onPress={() =>
//                     navigation.navigate("MySadana", { selectedmantra: currentSankalp })
//                   }
//                 >
//                   <TextComponent
//                     type="boldText"
//                     style={{ color: Colors.Colors.Light_black, textAlign: "center" }}
//                   >
//                     {t("sankalpCard.addToDaily")}
//                   </TextComponent>
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.footer}>
//                 <TextComponent type="semiBoldText" style={{ color: Colors.Colors.Light_grey }}>
//                   {t("sankalpCard.finishStreak")}
//                 </TextComponent>
//                 <Image
//                   source={require("../../assets/Streak_A1.png")}
//                   style={{ height: 20, width: 20, marginLeft: 4 }}
//                 />
//               </View>
//             </View>
//           </Card>

//           {shareVisible && (
//             <View
//               style={{
//                 position: "absolute",
//                 top: -9999,
//                 left: 0,
//                 opacity: 0,
//               }}
//               pointerEvents="none"
//             >
//               <ViewShot ref={shareRef} options={{ format: "png", quality: 1 }}>
//                 <ImageBackground
//                   source={require("../../assets/Streak_bg.png")}
//                   style={{
//                     width: FontSize.CONSTS.DEVICE_WIDTH,
//                     height: 480,
//                     alignItems: "center",
//                     justifyContent: "center",
//                     padding: 40,
//                   }}
//                   resizeMode="cover"
//                 >
//                   <TextComponent
//                     type="boldText"
//                     style={{
//                       color: "#925910",
//                       fontSize: FontSize.CONSTS.FS_20,
//                       marginBottom: 10,
//                       textAlign: "center",
//                     }}
//                   >
//                     {primaryText}
//                   </TextComponent>

//                   <TextComponent
//                     type="mediumText"
//                     style={{
//                       color: "#925910",
//                       textAlign: "center",
//                       fontSize: FontSize.CONSTS.FS_18,
//                       marginBottom: 20,
//                     }}
//                   >
//                     {secondaryText}
//                   </TextComponent>

//                   <TextComponent
//                     type="semiBoldText"
//                     style={{
//                       color: "#925910",
//                       fontSize: FontSize.CONSTS.FS_22,
//                       textAlign: "center",
//                       marginBottom: 10,
//                     }}
//                   >
//                     {filteredSankalps[activeIndex]?.short_text}
//                   </TextComponent>

//                   <TextComponent
//                     type="boldText"
//                     style={{
//                       color: Colors.Colors.App_theme,
//                       fontSize: FontSize.CONSTS.FS_24,
//                       marginVertical: 8,
//                     }}
//                   >
//                     KalpX
//                   </TextComponent>

//                   <TextComponent
//                     type="semiBoldText"
//                     style={{ color: "#925910", fontSize: FontSize.CONSTS.FS_14 }}
//                   >
//                     Connect to Your Roots
//                   </TextComponent>

//                   <TextComponent
//                     type="semiBoldText"
//                     style={{
//                       color: Colors.Colors.App_theme,
//                       fontSize: FontSize.CONSTS.FS_12,
//                       marginTop: 8,
//                     }}
//                   >
//                     KalpX.com
//                   </TextComponent>
//                 </ImageBackground>
//               </ViewShot>
//             </View>
//           )}

//           {!startedSankalp && (
//             <TouchableOpacity
//               disabled={index === filteredSankalps.length - 1}
//               onPress={() => swiperRef.current?.scrollBy(1)}
//               style={[
//                 styles.arrowButton,
//                 {
//                   backgroundColor:
//                     index === filteredSankalps.length - 1
//                       ? "#707070"
//                       : Colors.Colors.App_theme,
//                   right: 4,
//                 },
//               ]}
//             >
//               <Image source={require("../../assets/arrow_home.png")} />
//             </TouchableOpacity>
//           )}
//         </View>
//       ))}
//     </Swiper>
//   );
// };

// export default SankalpCard;

// const styles = StyleSheet.create({
//   card: {
//     borderRadius: 6,
//     overflow: "hidden",
//     elevation: 3,
//     backgroundColor: Colors.Colors.white,
//     padding: 16,
//     width: FontSize.CONSTS.DEVICE_WIDTH * 0.91,
//         maxHeight: 550,
//         marginBottom: 40,
//         zIndex: 99,
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
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginVertical: 12,
//   },
//   streakIcon: { height: 20, width: 20, marginRight: 8 },
//   row: { flexDirection: "row", alignItems: "center", marginTop: 6 },
//   tag: { paddingHorizontal: 4, paddingVertical: 4, marginRight: 4 },
//   root: { color: Colors.Colors.BLACK, fontSize: FontSize.CONSTS.FS_14, marginRight: 6 },
//   buttonRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "stretch",
//     marginVertical: 15,
//     fontSize: FontSize.CONSTS.FS_14,
//   },
//   startBtn: {
//     flex: 1,
//     borderColor: Colors.Colors.Yellow,
//     borderWidth: 1,
//     borderRadius: 6,
//     paddingVertical: 10,
//     paddingHorizontal: 8,
//     marginRight: 8,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   dailyBtn: {
//     flex: 1,
//     backgroundColor: Colors.Colors.Yellow,
//     borderRadius: 6,
//     paddingVertical: 10,
//     paddingHorizontal: 8,
//     marginLeft: 8,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   footer: { alignSelf: "center", alignItems: "center", flexDirection: "row" },
// });
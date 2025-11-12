import { useNavigation } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Card } from "react-native-paper";
import Swiper from "react-native-swiper";
import Icon from "react-native-vector-icons/Ionicons";
import { captureRef } from "react-native-view-shot";
import { usePracticeStore } from "../data/Practice";
import { CATALOGS } from "../data/mantras";
import Colors from "./Colors";
import FontSize from "./FontSize";
import TextComponent from "./TextComponent";

const suggestedRepsList = [11, 21, 27, 54, 108];

const MantraCard = ({
  practiceTodayData,
  onPressChantMantra,
  DoneMantraCalled,
}) => {
  const navigation: any = useNavigation();
  const shareMantraRef = useRef(null);
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language.split("-")[0];

  const {
    dailyMantras,
    currentMantraIndex,
    error,
    loadToday,
  } = usePracticeStore();

  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(currentMantraIndex);
  const [shareVisible, setShareVisible] = useState(false);

  // ✅ Only load once if store empty
  useEffect(() => {
    if (!dailyMantras || dailyMantras.length === 0) {
      loadToday();
    }
  }, []);

  useEffect(() => {
    setActiveIndex(currentMantraIndex);
  }, [currentMantraIndex]);

  const startedMantra = practiceTodayData?.started?.mantra;
  const endMantra = practiceTodayData?.done?.mantra;
  const mantraId = practiceTodayData?.ids?.mantra;

  const shareStage = endMantra ? 3 : startedMantra ? 2 : 1;

  const { p: primaryText, s: secondaryText } = useMemo(() => {
    const s1: any = t("mantraCard.stage1", { returnObjects: true });
    const s2: any = t("mantraCard.stage2", { returnObjects: true });
    const s3: any = t("mantraCard.stage3", { returnObjects: true });
    const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    if (shareStage === 3) return pick(s3);
    if (shareStage === 2) return pick(s2);
    return pick(s1);
  }, [shareStage, i18n.language]);

  const handleShareMantra = async () => {
    try {
      setShareVisible(true);
      await new Promise((resolve) => setTimeout(resolve, 400));

      const uri = await captureRef(shareMantraRef, {
        format: "png",
        quality: 1,
      });
      const fileUri = `${FileSystem.cacheDirectory}mantra_share_${Date.now()}.png`;
      await FileSystem.copyAsync({ from: uri, to: fileUri });
      setShareVisible(false);

      if (!(await Sharing.isAvailableAsync())) {
        alert("Sharing is not available on this device.");
        return;
      }

      await Sharing.shareAsync(fileUri, {
        dialogTitle: "Share your mantra",
        mimeType: "image/png",
        UTI: "image/png",
      });
    } catch (error) {
      console.error("❌ Error sharing mantra:", error);
      setShareVisible(false);
    }
  };

  const filteredMantras = useMemo(() => {
    const langKey = currentLang.toLowerCase();
    const allMantras = CATALOGS[langKey] || CATALOGS.en;

    if (startedMantra && mantraId) {
      const found = allMantras.find((m) => m.id === mantraId);
      return found ? [found] : [];
    }

    // ✅ Use dailyMantras if already preloaded
    if (dailyMantras && dailyMantras.length > 0) {
      return dailyMantras;
    }

    return allMantras.slice(0, 5);
  }, [startedMantra, mantraId, currentLang, dailyMantras]);

  if (error) {
    return (
      <View style={{ padding: 20 }}>
        <TextComponent style={{ color: "red" }}>{error}</TextComponent>
      </View>
    );
  }

  if (!filteredMantras || filteredMantras.length === 0) {
    return (
      <View style={{ padding: 20 }}>
        <TextComponent>No mantras found for today.</TextComponent>
      </View>
    );
  }

  return (
    <Swiper
      loadMinimal
  loadMinimalSize={1}
  removeClippedSubviews
      ref={swiperRef}
      loop={false}
      index={activeIndex}
      showsPagination={false}
      onIndexChanged={(i) => setActiveIndex(i)}
      scrollEnabled={!startedMantra}
      autoplay={false}
      horizontal
      // removeClippedSubviews={false}
      style={{ height: "auto" }}
    >
      {filteredMantras.map((currentMantra, index) => {
        const repsOrdered = [
          currentMantra.suggested_reps,
          ...suggestedRepsList.filter(
            (r) => r !== currentMantra.suggested_reps
          ),
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
            {!startedMantra && (
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
                  style={{ maxHeight: 440, marginTop: 5 }}
                >
                <TextComponent
                  type="semiBoldText"
                  style={{ alignSelf: "flex-end" }}
                >
                  {t("mantraCard.shareSadana")}
                </TextComponent>

                <View style={styles.headerRow}>
                  <TextComponent
                    type="semiBoldText"
                    style={{
                      color: Colors.Colors.BLACK,
                      fontSize: FontSize.CONSTS.FS_16,
                    }}
                  >
                    {t("mantraCard.dailyMantra")}
                  </TextComponent>
                  <TouchableOpacity
                    onPress={handleShareMantra}
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    <Image
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
                    />
                    <Image
                      source={require("../../assets/Streak_S4.png")}
                      style={styles.streakIcon}
                    />
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <TextComponent
                    type="semiBoldText"
                    style={{ color: Colors.Colors.Light_black }}
                  >
                    {currentMantra.devanagari}
                  </TextComponent>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    const englishMantra = CATALOGS.en.find(
                      (m) => m.id === currentMantra.id
                    );
                    const englishTags = englishMantra?.tags || [];
                    console.log("tages >>>>>",englishTags);
                    navigation.navigate("RelatedVideosScreen", {
                      tag: englishTags,
                    });
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
                  <TextComponent
                    type="semiBoldText"
                    style={{
                      color: Colors.Colors.Light_black,
                      marginVertical: 6,
                    }}
                  >
                    {currentMantra.iast}
                  </TextComponent>

                  {Array.isArray(currentMantra.explanation) ? (
                    currentMantra.explanation.map((line, idx) => (
                      <TextComponent key={idx} style={{ marginTop: 4 }}>
                        {line}
                      </TextComponent>
                    ))
                  ) : (
                    <TextComponent>{currentMantra.explanation}</TextComponent>
                  )}

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginVertical: 8 }}
                  >
                    {currentMantra.tags?.map((tag, i) => (
                      <View key={i} style={styles.tag}>
                        <TextComponent type="semiBoldText">
                          # {tag}
                        </TextComponent>
                      </View>
                    ))}
                  </ScrollView>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TextComponent
                      type="semiBoldText"
                      style={styles.repLabel}
                    >
                      {t("mantraCard.suggestedReps")}
                    </TextComponent>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{ marginVertical: 8 }}
                    >
                      {repsOrdered.map((rep, i) => (
                        <View
                          key={i}
                          style={[
                            styles.repBox,
                            rep === currentMantra.suggested_reps && {
                              backgroundColor: "#D4A0174A",
                              borderColor: Colors.Colors.Yellow,
                              borderWidth: 1,
                            },
                          ]}
                        >
                          <TextComponent
                            type="semiBoldText"
                            style={{ color: Colors.Colors.BLACK }}
                          >
                            X{rep}
                          </TextComponent>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </ScrollView>

                <View style={styles.buttonRow}>
                  {!startedMantra ? (
                    <TouchableOpacity
                      style={styles.startBtn}
                      onPress={() => onPressChantMantra(currentMantra)}
                    >
                      <TextComponent
                        type="semiBoldText"
                        style={{ textAlign: "center" }}
                      >
                        {t("mantraCard.willChant")}
                      </TextComponent>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={{
                        marginRight: 25,
                        flexDirection: "row",
                        marginTop: 10,
                        width: "45%",
                      }}
                      onPress={() => DoneMantraCalled(currentMantra)}
                    >
                      {!endMantra && (
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
                        {endMantra
                          ? t("mantraCard.done")
                          : t("mantraCard.markDone")}
                      </TextComponent>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.dailyBtn}
                    onPress={() => {
                      navigation.navigate("MySadana", {
                        selectedmantra: currentMantra,
                      });
                    }}
                  >
                    <TextComponent
                      type="boldText"
                      style={{ color: Colors.Colors.Light_black }}
                    >
                      {t("mantraCard.doDaily")}
                    </TextComponent>
                  </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                  <TextComponent
                    type="semiBoldText"
                    style={{ color: Colors.Colors.Light_grey }}
                  >
                    {t("mantraCard.finishToKeepStreak")}
                  </TextComponent>
                  <Image
                    source={require("../../assets/Streak_A1.png")}
                    style={{ height: 20, width: 20, marginLeft: 4 }}
                  />
                </View>
              </View>
            </Card>

            {!startedMantra && (
              <TouchableOpacity
                disabled={index === filteredMantras.length - 1}
                onPress={() => swiperRef.current?.scrollBy(1)}
                style={[
                  styles.arrowButton,
                  {
                    backgroundColor:
                      index === filteredMantras.length - 1
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
        );
      })}
    </Swiper>
  );
};

export default React.memo(MantraCard);

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  card: {
    borderRadius: 6,
    elevation: 3,
    backgroundColor: Colors.Colors.white,
    padding: 16,
    width: FontSize.CONSTS.DEVICE_WIDTH * 0.91,
    maxHeight: 620,
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },
  tag: { paddingHorizontal: 6, paddingVertical: 6, marginRight: 4 },
  repLabel: {
    color: Colors.Colors.Light_grey,
    fontSize: FontSize.CONSTS.FS_10,
    marginRight: 6,
  },
  repBox: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "#EAEAEA",
    marginRight: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
    marginVertical: 15,
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
    width: "45%",
  },
  footer: { alignSelf: "center", alignItems: "center", flexDirection: "row" },
  streakIcon: { height: 20, width: 20, marginRight: 8 },
});






// import { useNavigation } from "@react-navigation/native";
// import * as FileSystem from "expo-file-system";
// import * as Sharing from "expo-sharing";
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   ActivityIndicator,
//   Image,
//   // ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   View
// } from "react-native";
// import { ScrollView } from "react-native-gesture-handler";
// import { Card } from "react-native-paper";
// import Swiper from "react-native-swiper";
// import Icon from "react-native-vector-icons/Ionicons";
// import { captureRef } from "react-native-view-shot";
// import { usePracticeStore } from "../data/Practice";
// import { CATALOGS } from "../data/mantras";
// import Colors from "./Colors";
// import FontSize from "./FontSize";
// import TextComponent from "./TextComponent";

// const suggestedRepsList = [11, 21, 27, 54, 108];

// const MantraCard = ({
//   practiceTodayData,
//   onPressChantMantra,
//   DoneMantraCalled,
// }) => {
//   const navigation: any = useNavigation();
//   const shareMantraRef = useRef(null);
//   const { i18n, t } = useTranslation();
//   const currentLang = i18n.language.split("-")[0];

//   const {
//     dailyMantras,
//     currentMantraIndex,
//     loading,
//     error,
//     loadToday,
//   } = usePracticeStore();

//   const swiperRef = useRef<Swiper>(null);
//   const [activeIndex, setActiveIndex] = useState(currentMantraIndex);
//   const [shareVisible, setShareVisible] = useState(false);

//   useEffect(() => {
//     loadToday();
//   }, []);

//   useEffect(() => {
//     setActiveIndex(currentMantraIndex);
//   }, [currentMantraIndex]);

//   const startedMantra = practiceTodayData?.started?.mantra;
//   const endMantra = practiceTodayData?.done?.mantra;
//   const mantraId = practiceTodayData?.ids?.mantra;

//   const shareStage = endMantra ? 3 : startedMantra ? 2 : 1;

//   const { p: primaryText, s: secondaryText } = useMemo(() => {
//     const s1: any = t("mantraCard.stage1", { returnObjects: true });
//     const s2: any = t("mantraCard.stage2", { returnObjects: true });
//     const s3: any = t("mantraCard.stage3", { returnObjects: true });
//     const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
//     if (shareStage === 3) return pick(s3);
//     if (shareStage === 2) return pick(s2);
//     return pick(s1);
//   }, [shareStage, i18n.language]);

//   const handleShareMantra = async () => {
//     try {
//       setShareVisible(true);
//       await new Promise((resolve) => setTimeout(resolve, 400));

//       const uri = await captureRef(shareMantraRef, {
//         format: "png",
//         quality: 1,
//       });
//       const fileUri = `${FileSystem.cacheDirectory}mantra_share_${Date.now()}.png`;
//       await FileSystem.copyAsync({ from: uri, to: fileUri });
//       setShareVisible(false);

//       if (!(await Sharing.isAvailableAsync())) {
//         alert("Sharing is not available on this device.");
//         return;
//       }

//       await Sharing.shareAsync(fileUri, {
//         dialogTitle: "Share your mantra",
//         mimeType: "image/png",
//         UTI: "image/png",
//       });
//     } catch (error) {
//       console.error("❌ Error sharing mantra:", error);
//       setShareVisible(false);
//     }
//   };

//   const filteredMantras = useMemo(() => {
//     const langKey = currentLang.toLowerCase();
//     const allMantras = CATALOGS[langKey] || CATALOGS.en;

//     if (startedMantra && mantraId) {
//       const found = allMantras.find((m) => m.id === mantraId);
//       return found ? [found] : [];
//     }
//     return allMantras.slice(0, 5);
//   }, [startedMantra, mantraId, currentLang]);
  

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={Colors.Colors.App_theme} />
//         <TextComponent>Loading your daily mantras...</TextComponent>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={{ padding: 20 }}>
//         <TextComponent style={{ color: "red" }}>{error}</TextComponent>
//       </View>
//     );
//   }

//   if (!filteredMantras || filteredMantras.length === 0) {
//     return (
//       <View style={{ padding: 20 }}>
//         <TextComponent>No mantras found for today.</TextComponent>
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
//       scrollEnabled={!startedMantra}
//       autoplay={false}
//       horizontal
//       removeClippedSubviews={false}
//       style={{ height: "auto" }}
//     >
//       {filteredMantras.map((currentMantra, index) => {
//         const repsOrdered = [
//           currentMantra.suggested_reps,
//           ...suggestedRepsList.filter(
//             (r) => r !== currentMantra.suggested_reps
//           ),
//         ];

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
//             {!startedMantra && (
//               <TouchableOpacity
//                 disabled={index === 0}
//                 onPress={() => swiperRef.current?.scrollBy(-1)}
//                 style={[
//                   styles.arrowButton,
//                   {
//                     backgroundColor:
//                       index === 0 ? "#707070" : Colors.Colors.App_theme,
//                     left: 2,
//                     zIndex:999
//                   },
//                 ]}
//               >
//                 <Image
//                   source={require("../../assets/arrow_home.png")}
//                   style={{ transform: [{ rotate: "180deg" }] }}
//                 />
//               </TouchableOpacity>
//             )}

//             <Card style={styles.card}>
//               <View>
//                 <TextComponent
//                   type="semiBoldText"
//                   style={{ alignSelf: "flex-end" }}
//                 >
//                   {t("mantraCard.shareSadana")}
//                 </TextComponent>

//                 <View style={styles.headerRow}>
//                   <TextComponent
//                     type="semiBoldText"
//                     style={{
//                       color: Colors.Colors.BLACK,
//                       fontSize: FontSize.CONSTS.FS_16,
//                     }}
//                   >
//                     {t("mantraCard.dailyMantra")}
//                   </TextComponent>
//                   <TouchableOpacity
//                     onPress={handleShareMantra}
//                     style={{ flexDirection: "row", alignItems: "center" }}
//                   >
//                     <Image
//                       source={require("../../assets/Streak_S1.png")}
//                       style={styles.streakIcon}
//                     />
//                     <Image
//                       source={require("../../assets/Streak_S2.png")}
//                       style={styles.streakIcon}
//                     />
//                     <Image
//                       source={require("../../assets/Streak_S3.png")}
//                       style={styles.streakIcon}
//                     />
//                     <Image
//                       source={require("../../assets/Streak_S4.png")}
//                       style={styles.streakIcon}
//                     />
//                   </TouchableOpacity>
//                 </View>

//                 <View
//                   style={{
//                     flexDirection: "row",
//                     justifyContent: "space-between",
//                   }}
//                 >
//                   <TextComponent
//                     type="semiBoldText"
//                     style={{ color: Colors.Colors.Light_black }}
//                   >
//                     {currentMantra.devanagari}
//                   </TextComponent>
//                 </View>

//                 {/* Fixed Video Icon */}
//                 <TouchableOpacity
//                   onPress={() => {
//                     console.log("currentMantra.tags >>>>>",currentMantra.tags);
//                     navigation.navigate("RelatedVideosScreen", {
//                       tag: currentMantra.tags,
//                     })
//                   }}
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

//                 {/* ✅ Scrollable section */}
//                 <ScrollView
//                   showsVerticalScrollIndicator={true}
//                   style={{ maxHeight: 300, marginTop: 5 }}
//                 >
//                   <TextComponent
//                     type="semiBoldText"
//                     style={{
//                       color: Colors.Colors.Light_black,
//                       marginVertical: 6,
//                     }}
//                   >
//                     {currentMantra.iast}
//                   </TextComponent>

//                   {Array.isArray(currentMantra.explanation) ? (
//                     currentMantra.explanation.map((line, idx) => (
//                       <TextComponent key={idx} style={{ marginTop: 4 }}>
//                         {line}
//                       </TextComponent>
//                     ))
//                   ) : (
//                     <TextComponent>{currentMantra.explanation}</TextComponent>
//                   )}

//                   <ScrollView
//                     horizontal
//                     showsHorizontalScrollIndicator={false}
//                     style={{ marginVertical: 8 }}
//                   >
//                     {currentMantra.tags?.map((tag, i) => (
//                       <View key={i} style={styles.tag}>
//                         <TextComponent type="semiBoldText">
//                           # {tag}
//                         </TextComponent>
//                       </View>
//                     ))}
//                   </ScrollView>

//                   <View style={{ flexDirection: "row", alignItems: "center" }}>
//                     <TextComponent
//                       type="semiBoldText"
//                       style={styles.repLabel}
//                     >
//                       {t("mantraCard.suggestedReps")}
//                     </TextComponent>
//                     <ScrollView
//                       horizontal
//                       showsHorizontalScrollIndicator={false}
//                       style={{ marginVertical: 8 }}
//                     >
//                       {repsOrdered.map((rep, i) => (
//                         <View
//                           key={i}
//                           style={[
//                             styles.repBox,
//                             rep === currentMantra.suggested_reps && {
//                               backgroundColor: "#D4A0174A",
//                               borderColor: Colors.Colors.Yellow,
//                               borderWidth: 1,
//                             },
//                           ]}
//                         >
//                           <TextComponent
//                             type="semiBoldText"
//                             style={{ color: Colors.Colors.BLACK }}
//                           >
//                             X{rep}
//                           </TextComponent>
//                         </View>
//                       ))}
//                     </ScrollView>
//                   </View>
//                 </ScrollView>

//                 {/* Buttons (fixed) */}
//                 <View style={styles.buttonRow}>
//                   {!startedMantra ? (
//                     <TouchableOpacity
//                       style={styles.startBtn}
//                       onPress={() => onPressChantMantra(currentMantra)}
//                     >
//                       <TextComponent
//                         type="semiBoldText"
//                         style={{ textAlign: "center" }}
//                       >
//                         {t("mantraCard.willChant")}
//                       </TextComponent>
//                     </TouchableOpacity>
//                   ) : (
//                     <TouchableOpacity
//                       style={{
//                         marginRight: 25,
//                         flexDirection: "row",
//                         marginTop: 10,
//                         width:"45%"
//                       }}
//                       onPress={() => DoneMantraCalled(currentMantra)}
//                     >
//                       {!endMantra && (
//                         <View
//                           style={{
//                             width: 15,
//                             height: 15,
//                             borderColor: Colors.Colors.Light_grey,
//                             borderWidth: 1,
//                             borderRadius: 4,
//                             marginRight: 10,
//                           }}
//                         />
//                       )}
//                       <TextComponent>
//                         {endMantra
//                           ? t("mantraCard.done")
//                           : t("mantraCard.markDone")}
//                       </TextComponent>
//                     </TouchableOpacity>
//                   )}

//                   <TouchableOpacity
//                     style={styles.dailyBtn}
//                     onPress={() =>{
//                       console.log("currentMantra >>>>>",currentMantra);
//                       navigation.navigate("MySadana", {
//                         selectedmantra: currentMantra,
//                       })
//                     }}
//                   >
//                     <TextComponent
//                       type="boldText"
//                       style={{ color: Colors.Colors.Light_black }}
//                     >
//                       {t("mantraCard.doDaily")}
//                     </TextComponent>
//                   </TouchableOpacity>
//                 </View>

//                 {/* Footer (fixed) */}
//                 <View style={styles.footer}>
//                   <TextComponent
//                     type="semiBoldText"
//                     style={{ color: Colors.Colors.Light_grey }}
//                   >
//                     {t("mantraCard.finishToKeepStreak")}
//                   </TextComponent>
//                   <Image
//                     source={require("../../assets/Streak_A1.png")}
//                     style={{ height: 20, width: 20, marginLeft: 4 }}
//                   />
//                 </View>
//               </View>
//             </Card>

//             {!startedMantra && (
//               <TouchableOpacity
//                 disabled={index === filteredMantras.length - 1}
//                 onPress={() => swiperRef.current?.scrollBy(1)}
//                 style={[
//                   styles.arrowButton,
//                   {
//                     backgroundColor:
//                       index === filteredMantras.length - 1
//                         ? "#707070"
//                         : Colors.Colors.App_theme,
//                     right: 4,
//                   },
//                 ]}
//               >
//                 <Image source={require("../../assets/arrow_home.png")} />
//               </TouchableOpacity>
//             )}
//           </View>
//         );
//       })}
//     </Swiper>
//   );
// };

// export default MantraCard;

// const styles = StyleSheet.create({
//   centered: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingVertical: 40,
//   },
//   card: {
//     borderRadius: 6,
//     elevation: 3,
//     backgroundColor: Colors.Colors.white,
//     padding: 16,
//     width: FontSize.CONSTS.DEVICE_WIDTH * 0.91,
//     maxHeight: 620,
//     marginBottom: 40,
//     zIndex: 99,
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
//   headerRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginVertical: 12,
//   },
//   tag: { paddingHorizontal: 6, paddingVertical: 6, marginRight: 4 },
//   repLabel: {
//     color: Colors.Colors.Light_grey,
//     fontSize: FontSize.CONSTS.FS_10,
//     marginRight: 6,
//   },
//   repBox: {
//     paddingVertical: 8,
//     paddingHorizontal: 10,
//     borderRadius: 6,
//     backgroundColor: "#EAEAEA",
//     marginRight: 8,
//   },
//   buttonRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "stretch",
//     marginVertical: 15,
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
//                         width:"45%"
//   },
//   footer: { alignSelf: "center", alignItems: "center", flexDirection: "row" },
//   streakIcon: { height: 20, width: 20, marginRight: 8 },
// });
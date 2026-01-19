import { useNavigation } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Card } from "react-native-paper";
import Swiper from "react-native-swiper";
import Icon from "react-native-vector-icons/Ionicons";
import ViewShot, { captureRef } from "react-native-view-shot";
import { usePracticeStore } from "../data/Practice";
import { CATALOGS } from "../data/mantras";
import Colors from "./Colors";
import FontSize from "./FontSize";
import TextComponent from "./TextComponent";
import { getTranslatedPractice } from "../utils/getTranslatedPractice";


const suggestedRepsList = [11, 21, 27, 54, 108];

const MantraCard = ({
  practiceTodayData,
  onPressChantMantra,
  DoneMantraCalled,
  viewOnly = false,
  onAddToMyPractice = null,
}) => {
  const navigation: any = useNavigation();
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language.split("-")[0];

  const {
    dailyMantras,
    currentMantraIndex,
    error,
    loadToday,
  } = usePracticeStore();
  const shareRef = useRef(null);
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(currentMantraIndex);
  const [shareVisible, setShareVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedReps, setSelectedReps] = useState({});
  const [slideHeight, setSlideHeight] = useState(0);


  // ✅ Only load once if store empty
  // useEffect(() => {
  //   if (!dailyMantras || dailyMantras.length === 0) {
  //     loadToday();
  //   }
  // }, []);

  useEffect(() => {
    if (!dailyMantras || dailyMantras.length === 0) {
      loadToday().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  console.log("practiceTodayData >>>>", JSON.stringify(practiceTodayData))


  useEffect(() => {
    setActiveIndex(currentMantraIndex);
  }, [currentMantraIndex]);

  const startedMantra = practiceTodayData?.started?.mantra;
  const endMantra = practiceTodayData?.done?.mantra;
  const mantraId = practiceTodayData?.ids?.mantra;
  const selectedAPIReps = practiceTodayData?.daily_practice?.ui?.mantra_reps;


  const shareStage = endMantra ? 3 : startedMantra ? 2 : 1;
  const uiStage = endMantra ? 3 : startedMantra ? 2 : 1;

  const uiHeaderText = useMemo(() => {
    const s1 = t("mantraHeaderText.stageHeader1", { returnObjects: true });
    const s2 = t("mantraHeaderText.stageHeader2", { returnObjects: true });
    const s3 = t("mantraHeaderText.stageHeader3", { returnObjects: true });

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    if (uiStage === 3) return pick(s3);
    if (uiStage === 2) return pick(s2);
    return pick(s1);
  }, [uiStage, i18n.language]);


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

      const uri = await captureRef(shareRef.current, {
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.Colors.App_theme} />
        {/* <TextComponent>{t("mantraCard.loading")}</TextComponent> */}
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
      style={{ height: slideHeight }}
    >
      {filteredMantras.map((currentMantra, index) => {
        const activeMantra = filteredMantras[activeIndex];
        const repsOrdered = activeMantra
          ? [
            activeMantra.suggested_reps,
            ...suggestedRepsList.filter(
              (r) => r !== activeMantra.suggested_reps
            ),
          ]
          : [];
        // const repsOrdered = [
        //   currentMantra.suggested_reps,
        //   ...suggestedRepsList.filter(
        //     (r) => r !== currentMantra.suggested_reps
        //   ),
        // ];

        const translated = getTranslatedPractice(currentMantra, t);
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

            <Card style={styles.card} onLayout={(e) => {
              const h = e.nativeEvent.layout.height;
              if (h > slideHeight) setSlideHeight(h);
            }}>
              <View>
                <ImageBackground
                  source={require("../../assets/CardBG.png")}
                  style={styles.partialBgContainer}
                  imageStyle={styles.partialBgImage}
                >
                  {!viewOnly && (
                    <TextComponent
                      type="semiBoldText"
                      style={{ color: Colors.Colors.App_theme }}
                    >
                      {uiHeaderText}
                    </TextComponent>
                  )}
                  {!viewOnly && (
                    <View style={styles.headerRow}>
                      <TextComponent
                        type="cardHeaderText"
                        style={{ textTransform: "uppercase", }}
                      >
                        {t("mantraCard.dailyMantra")}
                      </TextComponent>
                    </View>
                  )}
                  {!viewOnly && (
                    <View style={{ flexDirection: "row", alignSelf: "flex-end", right: 20, marginTop: -37 }}>
                      <TouchableOpacity
                        onPress={handleShareMantra}
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Image
                          source={require("../../assets/Streak_S4.png")}
                          style={styles.streakIcon}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          const englishMantra = CATALOGS.en.find(
                            (m) => m.id === currentMantra.id
                          );
                          const englishTags = englishMantra?.tags || [];
                          navigation.navigate("RelatedVideosScreen", {
                            tag: englishTags,
                          });
                        }}
                        style={{
                          marginLeft: 8,
                          padding: 6,
                          backgroundColor: Colors.Colors.Yellow,
                          borderRadius: 50,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Icon name="videocam-outline" size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <TextComponent
                      type="cardText"
                      style={{ color: Colors.Colors.blue_text, textAlign: "center", marginHorizontal: 14, marginTop: 8 }}
                    >
                      {translated.mantra || currentMantra.devanagari}
                    </TextComponent>
                  </View>
                  <TextComponent
                    type="semiBoldText"
                    style={{
                      color: Colors.Colors.blue_text,
                      marginVertical: 6, textAlign: "center", marginHorizontal: 14
                    }}
                  >
                    {translated.iast || currentMantra.iast}
                  </TextComponent>
                </ImageBackground>
                <View style={{ paddingHorizontal: 16, }}>
                  {translated.desc ? (
                    <TextComponent type="mediumText" style={{ marginTop: 4, color: Colors.Colors.card_subtext, textAlign: "center" }}>
                      {translated.desc}
                    </TextComponent>
                  ) : Array.isArray(currentMantra.explanation) ? (
                    currentMantra.explanation.map((line, idx) => (
                      <TextComponent type="mediumText" key={idx} style={{ marginTop: 4, color: Colors.Colors.card_subtext, textAlign: "center" }}>
                        {line}
                      </TextComponent>
                    ))
                  ) : (
                    <TextComponent type="mediumText" STYLE={{ marginTop: 4, color: Colors.Colors.card_subtext, textAlign: "center" }}>{currentMantra.explanation}</TextComponent>
                  )}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginVertical: 4, alignSelf: "center" }}
                  >
                    {(translated.tags && translated.tags.length > 0 ? translated.tags : currentMantra.tags)?.map((tag, i) => (
                      <View key={i} style={styles.tag}>
                        <TextComponent type="subScrollText">
                          # {tag}
                        </TextComponent>
                      </View>
                    ))}
                  </ScrollView>
                  {!viewOnly && (
                    <>
                      <View
                        style={{
                          borderColor: Colors.Colors.App_theme,
                          borderTopWidth: 0.6,
                          marginHorizontal: -16,
                        }}
                      />

                      <View style={{ alignItems: "center" }}>
                        <TextComponent type="cardText" style={styles.repLabel}>
                          {t("mantraCard.suggestedReps")}
                        </TextComponent>

                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          style={{ marginVertical: 8 }}
                        >
                          {repsOrdered.map((rep, i) => {
                            const isLocked = startedMantra;
                            const apiSelected = selectedAPIReps === rep;

                            const selected = isLocked
                              ? apiSelected
                              : selectedReps[currentMantra.id]
                                ? selectedReps[currentMantra.id] === rep
                                : rep === currentMantra.suggested_reps;

                            return (
                              <TouchableOpacity
                                key={i}
                                disabled={isLocked}
                                onPress={() => {
                                  if (!isLocked) {
                                    setSelectedReps((prev) => ({
                                      ...prev,
                                      [currentMantra.id]: rep,
                                    }));
                                  }
                                }}
                                style={[
                                  styles.repBox,
                                  selected && {
                                    backgroundColor: "#D4A0174A",
                                    borderColor: Colors.Colors.Yellow,
                                    borderWidth: 1,
                                  },
                                  isLocked && !selected && {
                                    opacity: 0.3,
                                  },
                                ]}
                              >
                                <TextComponent
                                  type="semiBoldText"
                                  style={{
                                    color: Colors.Colors.BLACK,
                                    opacity: isLocked && !selected ? 0.5 : 1,
                                  }}
                                >
                                  {rep}X
                                </TextComponent>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      </View>

                      <View
                        style={{
                          borderColor: Colors.Colors.App_theme,
                          borderTopWidth: 0.6,
                          marginHorizontal: -16,
                        }}
                      />
                    </>
                  )}
                </View>
                {/* </ScrollView> */}
                {!viewOnly && (
                  <>
                    {!startedMantra ? (
                      <TouchableOpacity
                        style={styles.startBtn}
                        onPress={async () => {
                          const reps = selectedReps[currentMantra.id] ?? currentMantra.suggested_reps;
                          onPressChantMantra(currentMantra, reps);
                        }}
                      >
                        <TextComponent
                          type="semiBoldText"
                          style={{ textAlign: "center", color: Colors.Colors.white }}
                        >
                          {t("mantraCard.willChant")}
                        </TextComponent>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          marginTop: 10,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onPress={() => DoneMantraCalled(currentMantra)}
                      >
                        {/* ✅ Checkbox logic */}
                        {endMantra ? (
                          <View
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 4,
                              marginRight: 10,
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "green",
                            }}
                          >
                            <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>✓</Text>
                          </View>
                        ) : (
                          <View
                            style={{
                              width: 15,
                              height: 15,
                              borderColor: Colors.Colors.BLACK,
                              borderWidth: 1,
                              borderRadius: 4,
                              marginRight: 10,
                            }}
                          />
                        )}

                        <TextComponent type="streakSadanaText">
                          {endMantra
                            ? t("mantraCard.done")
                            : t("mantraCard.markDone")}
                        </TextComponent>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.dailyBtn}
                      onPress={() => {
                        navigation.navigate("TrackerTabs", {
                          screen: "History",
                          params: {
                            from: "mantra",
                            selectedMantra: currentMantra,
                            autoSelectCategory: "daily-mantra",
                          },
                        });

                        //                         navigation.navigate("TrackerTabs", {
                        //   screen: "History",
                        //   params: {
                        //     selectedmantra: currentMantra,
                        //   },
                        // });

                        // navigation.navigate("MySadana", {
                        //   selectedmantra: currentMantra,
                        // });
                      }}
                    >
                      <TextComponent
                        type="boldText"
                        style={{ color: Colors.Colors.Light_black }}
                      >
                        {t("mantraCard.doDaily")}
                      </TextComponent>
                    </TouchableOpacity>
                    {/* </View> */}
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
                  </>
                )}
                {viewOnly && onAddToMyPractice && (
                  <TouchableOpacity
                    style={styles.startBtn}
                    onPress={onAddToMyPractice}
                  >
                    <TextComponent
                      type="semiBoldText"
                      style={{ textAlign: "center", color: Colors.Colors.white, marginBottom: 2 }}
                    >
                        {t("sadanaTracker.detailsCard.addToMyPractice")}
                    </TextComponent>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
            {shareVisible && (
              <View
                style={{
                  position: "absolute",
                  top: -9999,      // keep off-screen
                  left: 0,
                  opacity: 0,      // invisible
                }}
                collapsable={false}   // IMPORTANT for Android
              >
                <ViewShot
                  ref={shareRef}
                  options={{ format: "png", quality: 1 }}
                >
                  <ImageBackground
                    source={require("../../assets/Streak_bg.png")}
                    style={{
                      width: FontSize.CONSTS.DEVICE_WIDTH,
                      // height: 500,
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 40,
                    }}
                    resizeMode="contain"
                  >

                    {/* Primary text */}
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

                    {/* Secondary text */}
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

                    {/* Mantra text */}
                    <TextComponent
                      type="semiBoldText"
                      style={{
                        color: "#925910",
                        fontSize: FontSize.CONSTS.FS_20,
                        textAlign: "center",
                        marginBottom: 8,
                      }}
                    >
                      {filteredMantras[activeIndex]?.devanagari}
                    </TextComponent>

                    <TextComponent
                      type="semiBoldText"
                      style={{
                        color: "#925910",
                        fontSize: FontSize.CONSTS.FS_18,
                        textAlign: "center",
                        marginBottom: 16,
                      }}
                    >
                      {filteredMantras[activeIndex]?.iast}
                    </TextComponent>

                    {/* App branding */}
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
                      style={{
                        color: "#925910",
                        fontSize: FontSize.CONSTS.FS_14,
                      }}
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
    backgroundColor: "#FFFCF7",
    // padding: 16,
    width: FontSize.CONSTS.DEVICE_WIDTH * 0.91,
    // maxHeight: 620,
    marginBottom: 40,
    zIndex: 99,
    borderWidth: 1,
    borderColor: Colors.Colors.App_theme
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
    alignSelf: "center",
    justifyContent: "center",
    // justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  tag: { paddingHorizontal: 6, paddingVertical: 6, marginRight: 4 },
  repLabel: {
    color: Colors.Colors.blue_text,
    // fontSize: FontSize.CONSTS.FS_10,
    // marginRight: 6,
    marginVertical: 4
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
    // flex: 1,
    backgroundColor: Colors.Colors.Yellow,
    // borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20
  },
  dailyBtn: {
    // flex: 1,
    borderColor: Colors.Colors.Yellow,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginHorizontal: 16,
    // marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20
    // width: "45%",
  },
  footer: { alignSelf: "center", alignItems: "center", flexDirection: "row", marginVertical: 12 },
  streakIcon: {
    height: 30, width: 30,
    // marginLeft: 25,
    // marginRight:15 
  },
  partialBgContainer: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    // paddingHorizontal: 10,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    // marginTop: 8,
    width: "100%",
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
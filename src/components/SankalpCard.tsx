import { useNavigation } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useMemo, useRef, useState } from "react";
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

const SankalpCard = ({ practiceTodayData, onPressStartSankalp, onCompleteSankalp, viewOnly = false }) => {
  const navigation: any = useNavigation();
  const { t, i18n } = useTranslation();
  const swiperRef = useRef<Swiper>(null);
  const shareRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [shareVisible, setShareVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const startedSankalp = practiceTodayData?.started?.sankalp;
  const doneSankalp = practiceTodayData?.done?.sankalp;
  const sankalpId = practiceTodayData?.ids?.sankalp;
  const [slideHeight, setSlideHeight] = useState(0);
  const shareStage = doneSankalp ? 3 : startedSankalp ? 2 : 1;
  const uiStage = doneSankalp ? 3 : startedSankalp ? 2 : 1;

  const uiHeaderText = useMemo(() => {
    const s1 = t("sankalpHeaderText.uiStage1", { returnObjects: true });
    const s2 = t("sankalpHeaderText.uiStage2", { returnObjects: true });
    const s3 = t("sankalpHeaderText.uiStage3", { returnObjects: true });

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    if (uiStage === 3) return pick(s3);
    if (uiStage === 2) return pick(s2);
    return pick(s1);
  }, [uiStage, i18n.language]);


  const { p: primaryText, s: secondaryText } = useMemo(() => {
    const s1: any = t("sankalpCard.stage1", { returnObjects: true });
    const s2: any = t("sankalpCard.stage2", { returnObjects: true });
    const s3: any = t("sankalpCard.stage3", { returnObjects: true });

    const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    if (shareStage === 3) return pick(s3);
    if (shareStage === 2) return pick(s2);
    return pick(s1);
  }, [shareStage, i18n.language]);

  const filteredSankalps = useMemo(() => {
    if (startedSankalp && sankalpId) {
      const found = DAILY_SANKALPS.find((s) => s.id === sankalpId);
      return found ? [found] : [];
    }
    const shuffled = seededShuffle(DAILY_SANKALPS, getTodaySeed());
    return shuffled.slice(0, 5);
  }, [startedSankalp, sankalpId, i18n.language]);

  React.useEffect(() => {
    if (filteredSankalps && filteredSankalps.length > 0) {
      setLoading(false);
    }
  }, [filteredSankalps]);

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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.Colors.App_theme} />
      </View>
    );
  }

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
      style={{
        // height: "auto"
        // backgroundColor:"red",
        height: slideHeight
      }}
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

          <Card style={styles.card} onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (h > slideHeight) setSlideHeight(h);
          }}>
            <View>
              {/* <ScrollView
                showsVerticalScrollIndicator={true}
                style={{ maxHeight: 350}}
                contentContainerStyle={{ paddingBottom: 10 }}
              > */}
              <ImageBackground
                source={require("../../assets/CardBG.png")}
                // resizeMode="center"
                style={styles.partialBgContainer}
                imageStyle={styles.partialBgImage}
              >
                <TextComponent type="semiBoldText" style={{ color: Colors.Colors.App_theme }}>
                  {uiHeaderText}
                </TextComponent>

                <View style={styles.header}>
                  <TextComponent
                    type="cardHeaderText"
                    style={{ marginLeft: 25 }}
                  >
                    {t("sankalpCard.dailySankalp")}
                  </TextComponent>
                </View>
                <View style={{ flexDirection: "row", alignSelf: "flex-end", right: 20, marginTop: -30 }}>
                  <TouchableOpacity
                    onPress={() => handleShareSankalp()}
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    <Image source={require("../../assets/Streak_S4.png")} style={styles.streakIcon} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const englishSource = getEnglishSourceForSankalp(currentSankalp.id);
                      const { tags, searchQuery } = parseSourceToTags(englishSource, currentSankalp.id);
                      console.log("🔍 Tags:", tags);
                      console.log("🔎 Search Query:", searchQuery);
                      navigation.navigate("RelatedVideosScreen", { tag: tags, search: searchQuery });
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
                <TextComponent
                  type="cardText"
                  style={{ color: Colors.Colors.blue_text, textAlign: "center", marginHorizontal: 10 }}
                >
                  {t(currentSankalp.i18n?.short) || currentSankalp.short_text}
                </TextComponent>
              </ImageBackground>
              <View style={{ paddingHorizontal: 16, alignItems: "center" }}>
                <TextComponent
                  type="streakSadanaText"
                  style={{
                    color: Colors.Colors.BLACK,
                  }}
                >
                  {t("sankalpCard.whyThisMatters")}
                </TextComponent>
                <TextComponent type="mediumText"
                  style={{
                    color: Colors.Colors.Light_black,
                    marginVertical: 2, textAlign: "center"
                  }}
                >
                  {t(currentSankalp.i18n?.tooltip) || currentSankalp.tooltip}
                </TextComponent>
                <TextComponent
                  type="streakSadanaText"
                  style={{
                    color: Colors.Colors.BLACK,
                  }}
                >
                  {t("sankalpCard.suggestedPractice")}
                </TextComponent>
                <TextComponent type="mediumText"
                  style={{
                    color: Colors.Colors.Light_black,
                    marginVertical: 2, textAlign: "center"
                  }}>
                  {t(currentSankalp.i18n?.suggested) || currentSankalp.suggested_practice}
                </TextComponent>
                <View style={{ ...styles.row, marginTop: 4 }}>
                  <TextComponent type="headerSubBoldText" style={styles.root}>
                    {t("sankalpCard.root")}
                  </TextComponent>
                  <TextComponent
                    type="headerSubBoldText"
                    style={{
                      color: Colors.Colors.BLACK,
                    }}
                  >
                    {t(`sankalps.${currentSankalp.id}.root`) || currentSankalp.root}
                  </TextComponent>
                </View>
                {currentSankalp.meta?.timeOfDay && (
                  <View style={styles.bestTimeWrapper}>
                    <View style={styles.bestTimeInner}>
                      <TextComponent type="headerSubBoldText" style={styles.root}>
                        {t("sankalpCard.bestTimes")}
                      </TextComponent>

                      <View style={styles.tagsRow}>
                        {currentSankalp.meta.timeOfDay.map((tag, i) => (
                          <View key={i} style={styles.tag}>
                            <TextComponent
                              type="headerSubBoldText"
                              style={{ color: Colors.Colors.BLACK }}
                            >
                              {t(`sankalpCard.best.${tag}`, { defaultValue: tag })}
                            </TextComponent>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                )}
                {currentSankalp.meta?.context && (
                  <View style={styles.bestTimeWrapper}>
                    <View style={styles.bestTimeInner}>
                      <TextComponent type="headerSubBoldText" style={{ ...styles.root, color: Colors.Colors.blue_text, }}>
                        {t("context")} :
                      </TextComponent>

                      <View style={styles.tagsRow}>
                        {currentSankalp.meta.context.map((tag, i) => (
                          <View key={i} style={styles.tag}>
                            <TextComponent
                              type="headerSubBoldText"
                              style={{
                                color: Colors.Colors.blue_text,
                              }}
                            >
                              #{t(`context.${tag}`, { defaultValue: tag })}
                            </TextComponent>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                )}
                <View style={{ alignItems: "center", marginTop: 4 }}>
                  <TextComponent type="headerSubBoldText" style={{ ...styles.root, color: Colors.Colors.blue_text, }}>
                    {t("sankalpCard.source")}
                  </TextComponent>
                  <TextComponent
                    type="streakSadanaText"
                    style={{
                      color: Colors.Colors.blue_text,
                      textAlign: "center",
                    }}
                  >
                    {t(`sankalps.${currentSankalp.id}.source`) || currentSankalp.source}
                  </TextComponent>
                </View>
              </View>
              {/* </ScrollView> */}
              {!viewOnly && (
                <>
                  {!startedSankalp ? (
                    <TouchableOpacity
                      style={styles.startBtn}
                      onPress={() => onPressStartSankalp(currentSankalp)}
                    >
                      <TextComponent
                        type="semiBoldText"
                        style={{ textAlign: "center", color: Colors.Colors.white }}
                      >
                        {t("sankalpCard.iWillDo")}
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
                      onPress={() => onCompleteSankalp(currentSankalp)}
                    >
                      {/* ✅ Checkbox logic */}
                      {doneSankalp ? (
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
                        {doneSankalp ? t("sankalpCard.done") : t("sankalpCard.markDone")}
                      </TextComponent>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.dailyBtn}
                    onPress={() =>
                      navigation.navigate("TrackerTabs", {
                        screen: "History",
                        params: {
                          from: "sankalp",
                          selectedSankalp: currentSankalp,
                          autoSelectCategory: "daily-sankalp",
                          // selectedmantra: currentSankalp,
                        }
                      })
                    }

                  >
                    <TextComponent
                      type="boldText"
                      style={{ color: Colors.Colors.Light_black }}
                    >
                      {t("sankalpCard.addToDaily")}
                    </TextComponent>
                  </TouchableOpacity>
                  <View style={styles.footer}>
                    <TextComponent type="semiBoldText" style={{ color: Colors.Colors.Light_grey }}>
                      {t("sankalpCard.finishStreak")}
                    </TextComponent>
                    <Image
                      source={require("../../assets/Streak_A1.png")}
                      style={{ height: 20, width: 20, marginLeft: 4 }}
                    />
                  </View>
                </>
              )}
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
                    // height: 480,
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
    // padding: 16,
    width: FontSize.CONSTS.DEVICE_WIDTH * 0.91,
    // maxHeight: 550,
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,
  },
  streakIcon: { height: 30, width: 30 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
    marginVertical: 15,
    fontSize: FontSize.CONSTS.FS_14,
  },
  startBtn: {
    backgroundColor: Colors.Colors.Yellow,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20
  },
  dailyBtn: {
    borderColor: Colors.Colors.Yellow,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20
  },
  footer: { alignSelf: "center", alignItems: "center", flexDirection: "row", marginVertical: 12 },
  partialBgContainer: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    width: FontSize.CONSTS.DEVICE_WIDTH,
  },
  partialBgImage: {
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  bestTimeWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  bestTimeInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  tag: {
    marginHorizontal: 3,
  },
  root: {
    color: Colors.Colors.BLACK,
    marginRight: 6,
  },
});
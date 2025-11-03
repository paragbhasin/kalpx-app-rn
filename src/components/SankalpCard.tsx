import { useNavigation } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Card } from "react-native-paper";
import Swiper from "react-native-swiper";
import ViewShot, { captureRef } from "react-native-view-shot";
import { DAILY_SANKALPS } from "../data/sankalps";
import Colors from "./Colors";
import FontSize from "./FontSize";
import TextComponent from "./TextComponent";

// 🌿 Stage-based text
// const stage1 = [
//   { p: "This sankalp found me today.", s: "Maybe it's meant for you too — discover yours on KalpX." },
//   { p: "Sometimes, the right intention finds you.", s: "Pause. Reflect. Commit. Your sankalp might be waiting on KalpX." },
//   { p: "This intention spoke to me today.", s: "Find your own moment of purpose — start on KalpX." },
//   { p: "A single commitment can change your day.", s: "Take today's sankalp and feel the shift within — KalpX." },
//   { p: "The power of intention begins with awareness.", s: "Discover the sankalp that speaks to you today — KalpX." },
//   { p: "Not every intention is heard — some are felt.", s: "Find yours and begin your journey on KalpX." },
//   { p: "This sankalp touched something within.", s: "Maybe it'll do the same for you — explore KalpX." },
// ];

// const stage2 = [
//   { p: "I've taken today's sankalp as my commitment.", s: "Commit to your sankalp today — a few moments of purpose await." },
//   { p: "Today, I choose intention through this sankalp.", s: "Choose yours and begin your daily rhythm on KalpX." },
//   { p: "One sankalp. One intention. One new start.", s: "Start your sankalp practice today — KalpX awaits your first step." },
//   { p: "I'm doing this sankalp today — for purpose, for presence.", s: "Do yours and feel the shift — KalpX makes it easy." },
//   { p: "Every commitment begins with a choice.", s: "Make yours today — find your sankalp on KalpX." },
//   { p: "This is my sankalp today.", s: "Take yours too — a few breaths can change your day." },
//   { p: "I've begun my sankalp practice for today.", s: "Start yours now and begin your journey toward purpose." },
// ];

// const stage3 = [
//   { p: "Sankalp done for today 🙏 Feeling purposeful and aligned.", s: "Do yours today on KalpX and start your own streak of intention." },
//   { p: "I completed my sankalp — purpose feels sacred again.", s: "Start your streak today — one small commitment at a time on KalpX." },
//   { p: "Purpose isn't found — it's practiced. Today, I practiced.", s: "Begin your sankalp streak today — one small commitment at a time on KalpX." },
//   { p: "One sankalp closer to purpose. One step deeper in dharma.", s: "Join me — do today's sankalp on KalpX and start your streak." },
//   { p: "Today's sankalp complete 🌸 My heart feels aligned.", s: "Start your daily practice today — purpose grows with each commitment." },
//   { p: "I've done my sankalp for today — a few minutes, lifelong purpose.", s: "Do yours and begin your streak of intention on KalpX." },
//   { p: "Sankalp done ✅ Commitment renewed.", s: "Start your streak on KalpX and feel the power of daily intention." },
// ];

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

  // ✅ Determine stage
  const shareStage = doneSankalp ? 3 : startedSankalp ? 2 : 1;

  // ✅ Pick random text based on stage
const { p: primaryText, s: secondaryText } = useMemo(() => {
  const s1: any = t("sankalpCard.stage1", { returnObjects: true });
  const s2: any = t("sankalpCard.stage2", { returnObjects: true });
  const s3 : any= t("sankalpCard.stage3", { returnObjects: true });

  const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
  if (shareStage === 3) return pick(s3);
  if (shareStage === 2) return pick(s2);
  return pick(s1);
}, [shareStage, i18n.language]);


  // ✅ Only 5 Sankalps at a time
  const filteredSankalps = useMemo(() => {
    if (startedSankalp && sankalpId) {
      const found = DAILY_SANKALPS.find((s) => s.id === sankalpId);
      return found ? [found] : [];
    }
    return DAILY_SANKALPS.slice(0, 5);
  }, [startedSankalp, sankalpId]);

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
        dialogTitle:t('sankalpCard.shareDialogTitle'),
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
        <TextComponent>{t('sankalpCard.noSankalps')}</TextComponent>
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
      style={{ height: "70%" }}
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
          {/* LEFT ARROW */}
          {!startedSankalp && (
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
              <Image
                source={require("../../assets/arrow_home.png")}
                style={{ transform: [{ rotate: "180deg" }] }}
              />
            </TouchableOpacity>
          )}

          {/* CARD */}
          <Card style={styles.card}>
            <View>
              <TextComponent type="semiBoldText" style={{ alignSelf: "flex-end" }}>
               {t('sankalpCard.shareHeader')}
              </TextComponent>

              <View style={styles.header}>
                <TextComponent type="semiBoldText" style={{ color: Colors.Colors.BLACK,fontSize: FontSize.CONSTS.FS_16 }}>
                {t('sankalpCard.dailySankalp')}
                </TextComponent>
                <TouchableOpacity onPress={() => {handleShareSankalp()}} style={{ flexDirection: "row", alignItems: "center" }} >
                  <Image source={require("../../assets/Streak_S1.png")} style={styles.streakIcon} />
                  <Image source={require("../../assets/Streak_S2.png")} style={styles.streakIcon} />
                  <Image source={require("../../assets/Streak_S3.png")} style={styles.streakIcon} />
                  <Image source={require("../../assets/Streak_S4.png")} style={styles.streakIcon} />
                </TouchableOpacity>
              </View>

              <TextComponent type="semiBoldText" style={{ color: Colors.Colors.Light_black ,fontSize: FontSize.CONSTS.FS_14}}>
                 {t(currentSankalp.i18n?.short) || currentSankalp.short_text}
              </TextComponent>

              <TextComponent
                type="semiBoldText"
                style={{ color: Colors.Colors.Light_black, marginVertical: 6,fontSize: FontSize.CONSTS.FS_14 }}
              >
              {t('sankalpCard.whyThisMatters')}
              </TextComponent>
              <TextComponent style={{fontSize: FontSize.CONSTS.FS_14}}>{t(currentSankalp.i18n?.tooltip) || currentSankalp.tooltip}</TextComponent>

              <TextComponent
                type="semiBoldText"
                style={{ color: Colors.Colors.Light_black, marginVertical: 6,fontSize: FontSize.CONSTS.FS_14 }}
              >
               {t('sankalpCard.suggestedPractice')}
              </TextComponent>
              <TextComponent style={{fontSize: FontSize.CONSTS.FS_14}} >{t(currentSankalp.i18n?.suggested) || currentSankalp.suggested_practice}</TextComponent>

              <View style={styles.row}>
                <TextComponent type="semiBoldText" style={styles.root}>
                   {t('sankalpCard.root')}
                </TextComponent>
                <TextComponent type="semiBoldText" style={{ color: Colors.Colors.Light_grey ,fontSize: FontSize.CONSTS.FS_14}}>
                {t(`sankalps.${currentSankalp.id}.root`) || currentSankalp.root}
                </TextComponent>
              </View>
{/* Time of Day */}
{currentSankalp.meta?.timeOfDay && (
  <View style={styles.row}>
    <TextComponent type="semiBoldText" style={styles.root}>
      {t('sankalpCard.bestTimes')}
    </TextComponent>

    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {currentSankalp.meta.timeOfDay.map((tag, i) => (
        <View key={i} style={styles.tag}>
          <TextComponent
            type="semiBoldText"
            style={{ color: Colors.Colors.Light_grey, fontSize: FontSize.CONSTS.FS_14 }}
          >
            {/* ✅ Correct key path */}
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
      {t('context')}
    </TextComponent>

    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {currentSankalp.meta.context.map((tag, i) => (
        <View key={i} style={styles.tag}>
          <TextComponent
            type="semiBoldText"
            style={{ color: Colors.Colors.App_theme, fontSize: FontSize.CONSTS.FS_14 }}
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
                {t('sankalpCard.source')}
                </TextComponent>
                <TextComponent type="semiBoldText" style={{ color: Colors.Colors.App_theme ,fontSize: FontSize.CONSTS.FS_14}}>
                 {t(`sankalps.${currentSankalp.id}.source`) || currentSankalp.source}
                </TextComponent>
              </View>

              {/* Buttons */}
              <View style={styles.buttonRow}>
                {!startedSankalp ? (
                  <TouchableOpacity
                    style={styles.startBtn}
                    onPress={() => onPressStartSankalp(currentSankalp)}
                  >
                    <TextComponent type="semiBoldText" style={{ textAlign: "center" ,}}>
                    {t('sankalpCard.iWillDo')}
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
                    <TextComponent>{doneSankalp ? t('sankalpCard.done') : t('sankalpCard.markDone')}</TextComponent>
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
                 {t('sankalpCard.addToDaily')}
                  </TextComponent>
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <TextComponent type="semiBoldText" style={{ color: Colors.Colors.Light_grey }}>
                {t('sankalpCard.finishStreak')}
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
                style={{ color: "#925910", fontSize: FontSize.CONSTS.FS_20, marginBottom: 10, textAlign: "center" }}
              >
                {primaryText}
              </TextComponent>

              <TextComponent
                type="mediumText"
                style={{ color: "#925910", textAlign: "center", fontSize: FontSize.CONSTS.FS_18, marginBottom: 20 }}
              >
                {secondaryText}
              </TextComponent>

              <TextComponent
                type="semiBoldText"
                style={{ color: "#925910", fontSize: FontSize.CONSTS.FS_22, textAlign: "center", marginBottom: 10 }}
              >
                {filteredSankalps[activeIndex]?.short_text}
              </TextComponent>

              <TextComponent
                type="boldText"
                style={{ color: Colors.Colors.App_theme, fontSize: FontSize.CONSTS.FS_24, marginVertical: 8 }}
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
                style={{ color: Colors.Colors.App_theme, fontSize: FontSize.CONSTS.FS_12, marginTop: 8 }}
              >
                KalpX.com
              </TextComponent>
            </ImageBackground>
          </ViewShot>
        </View>
      )}
          {/* RIGHT ARROW */}
          {!startedSankalp && (
            <TouchableOpacity
              disabled={index === filteredSankalps.length - 1}
              onPress={() => swiperRef.current?.scrollBy(1)}
              style={[
                styles.arrowButton,
                {
                  backgroundColor:
                    index === filteredSankalps.length - 1 ? "#707070" : Colors.Colors.App_theme,
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

export default SankalpCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 6,
    overflow: "hidden",
    elevation: 3,
    backgroundColor: Colors.Colors.white,
    padding: 16,
    width: FontSize.CONSTS.DEVICE_WIDTH * 0.91,
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
  row: { flexDirection: "row", alignItems: "center" ,marginTop:6},
  tag: { paddingHorizontal: 4, paddingVertical: 4, marginRight: 4 },
  root: { color: Colors.Colors.BLACK, fontSize: FontSize.CONSTS.FS_14, marginRight: 6 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
    marginVertical: 15,
    fontSize: FontSize.CONSTS.FS_14
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

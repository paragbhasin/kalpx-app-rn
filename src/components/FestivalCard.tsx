import { useNavigation } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import i18next from "i18next";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Image, ImageBackground, StyleSheet, TouchableOpacity, View } from "react-native";
import { Card } from "react-native-paper";
import Swiper from "react-native-swiper";
import ViewShot, { captureRef } from "react-native-view-shot";
import { Festival, getTodayFestival, getUpcomingFestivals } from "../data/festivals";
import Colors from "./Colors";
import FontSize from "./FontSize";
import TextComponent from "./TextComponent";

const FestivalCard = () => {
  const navigation: any = useNavigation();
      const { i18n , t} = useTranslation();
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


  // 🟢 2️⃣ Updated: Now this function takes a festival parameter
  const handleShareFestival = async (festival: Festival) => {
    try {
      setFestivalToShare(festival); // 🟢 3️⃣ Store which festival is clicked
      setShareVisible(true);

      await new Promise((resolve) => setTimeout(resolve, 400));

      // 🟢 4️⃣ Capture that specific festival's data
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
      {festivals.map((festival, index) => {
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
                <TextComponent type="semiBoldText" style={{ alignSelf: "flex-end" }}>
                   {t("festivalCard.blessingQuote")}
                </TextComponent>

                {/* Header */}
                <View style={styles.headerRow}>
                  <TextComponent type="semiBoldText" style={{ color: Colors.Colors.BLACK }}>
                                        {moment(festival.date).isSame(moment(), "day") ? t("festivalCard.todayFestival") : t("festivalCard.upcomingFestival")}
                    {/* {moment(festival.date).isSame(moment(), "day") ? "Today’s Festival" : "Upcoming Festival"} */}
                  </TextComponent>
                  <TouchableOpacity onPress={() => {handleShareFestival(festival)}}  style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image source={require("../../assets/Streak_S1.png")} style={styles.streakIcon} />
                    <Image source={require("../../assets/Streak_S2.png")} style={styles.streakIcon} />
                    <Image source={require("../../assets/Streak_S3.png")} style={styles.streakIcon} />
                    <Image source={require("../../assets/Streak_S4.png")} style={styles.streakIcon} />
                  </TouchableOpacity>
                </View>

                {/* Name + Date */}
                <TextComponent type="semiBoldText" style={{ color: Colors.Colors.App_theme }}>
                  {festival.name}
                </TextComponent>
                <TextComponent
                  type="semiBoldText"
                  style={{ color: Colors.Colors.App_theme, marginVertical: 6 }}
                >
                  {moment(festival.date, "YYYY-MM-DD").format("MMM DD, YYYY")}
                </TextComponent>

                {/* Quote */}
                <View style={styles.quoteBox}>
                  <TextComponent type="mediumText" style={styles.quoteText}>
                    {festival.quote.text}
                  </TextComponent>
                  <TextComponent type="mediumText" style={styles.quoteSource}>
                    — {festival.quote.source}
                  </TextComponent>
                </View>

                {/* Info Sections */}
                <TextComponent type="cardText" style={styles.sectionTitle}>
                            {t("festivalCard.fastingRules")}
                </TextComponent>
                <TextComponent type="mediumText" style={styles.sectionText}>
                  {festival.fasting.rules}
                </TextComponent>

                <TextComponent type="cardText" style={styles.sectionTitle}>
                {t("festivalCard.fastingSignificance")}
                </TextComponent>
                <TextComponent type="mediumText" style={styles.sectionText}>
                  {festival.fasting.significance}
                </TextComponent>

                <TextComponent type="cardText" style={styles.sectionTitle}>
             {t("festivalCard.spiritualBenefit")}
                </TextComponent>
                <TextComponent type="mediumText" style={styles.sectionText}>
                  {festival.spiritualBenefit}
                </TextComponent>

                <TextComponent type="cardText" style={styles.sectionTitle}>
            {t("festivalCard.reference")}
                </TextComponent>
                <TextComponent type="mediumText" style={styles.sectionText}>
                  {festival.mythology.story}
                </TextComponent>
                <TextComponent
                  type="mediumText"
                  style={{ color: Colors.Colors.Light_grey, marginTop: 4 }}
                >
                 {t("festivalCard.referenceLabel")}:{festival.mythology.reference}
                </TextComponent>

                {/* Deity + Observers */}
                <TextComponent type="mediumText" style={{ marginTop: 4 }}>
                  {Array.isArray(festival.deity) ? festival.deity.join(", ") : festival.deity}
                </TextComponent>
                <TextComponent
                  type="mediumText"
                  style={{ color: Colors.Colors.App_theme, marginTop: 2, marginBottom: 8 }}
                >
                  {festival.fasting.observers}
                </TextComponent>

                {/* Celebration, Foods, Symbols */}
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
  {["celebrationPractices", "traditionalFoods", "symbols"].map((key, index) => (
    <View key={index} style={{ flex: 1, marginHorizontal: 4 }}>
      <TextComponent
        type="cardText"
        style={{
          color: Colors.Colors.Light_black,
          textAlign: "center",
          marginBottom: 6,
        }}
      >
        {t(`festivalCard.${key}`, {
          defaultValue:
            key === "celebrationPractices"
              ? "Celebration Practices"
              : key === "traditionalFoods"
              ? "Traditional Foods"
              : "Symbols",
        })}
      </TextComponent>

      {(festival as any)[key]?.map((item: string, idx: number) => (
        <TextComponent
          key={idx}
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
</View>


                {/* Regional Customs */}
                <TextComponent type="cardText" style={styles.sectionTitle}>
                  {t("festivalCard.regionalCustoms", { defaultValue: "Regional Customs" })}
                </TextComponent>
                <TextComponent type="mediumText" style={styles.sectionText}>
                  {typeof festival.regionalCustoms === "object"
                    ? Object.entries(festival.regionalCustoms)
                        .map(([region, desc]) => `${region}: ${desc}`)
                        .join("\n")
                    : festival.regionalCustoms || "—"}
                </TextComponent>

                {/* Buttons */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.outlineBtn}
                    onPress={() => navigation.navigate("MySadana")}
                  >
                    <TextComponent type="semiBoldText">{t("festivalCard.setupPractice")}</TextComponent>
                  </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                  <TextComponent type="semiBoldText" style={{ color: Colors.Colors.Light_grey }}>
                  {t("festivalCard.finishStreak")}
                  </TextComponent>
                  <Image source={require("../../assets/Streak_A1.png")} style={{ height: 20, width: 20, marginLeft: 4 }} />
                </View>
              </View>
            </Card>
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
              resizeMode="cover"
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
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 12 },
  streakIcon: { height: 20, width: 20, marginRight: 8 },
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
    flex: 1,
    borderColor: Colors.Colors.Yellow,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
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
  footer: { alignSelf: "center", alignItems: "center", flexDirection: "row" },
});

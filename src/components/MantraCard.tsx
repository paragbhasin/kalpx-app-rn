import { useNavigation } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { Card } from "react-native-paper";
import Swiper from "react-native-swiper";
import ViewShot, { captureRef } from "react-native-view-shot";
import { usePracticeStore } from "../data/Practice";
import { CATALOGS } from "../data/mantras";
import Colors from "./Colors";
import FontSize from "./FontSize";
import TextComponent from "./TextComponent";



const suggestedRepsList = [11, 21, 27, 54, 108];

const stage1 = [
  { p: "This sankalp found me today.", s: "Maybe it's meant for you too — discover yours on KalpX." },
  { p: "Sometimes, the right intention finds you.", s: "Pause. Reflect. Commit. Your sankalp might be waiting on KalpX." },
  { p: "This intention spoke to me today.", s: "Find your own moment of purpose — start on KalpX." },
  { p: "A single commitment can change your day.", s: "Take today's sankalp and feel the shift within — KalpX." },
  { p: "The power of intention begins with awareness.", s: "Discover the sankalp that speaks to you today — KalpX." },
  { p: "Not every intention is heard — some are felt.", s: "Find yours and begin your journey on KalpX." },
  { p: "This sankalp touched something within.", s: "Maybe it'll do the same for you — explore KalpX." },
];

const stage2 = [
  { p: "I've taken today's sankalp as my commitment.", s: "Commit to your sankalp today — a few moments of purpose await." },
  { p: "Today, I choose intention through this sankalp.", s: "Choose yours and begin your daily rhythm on KalpX." },
  { p: "One sankalp. One intention. One new start.", s: "Start your sankalp practice today — KalpX awaits your first step." },
  { p: "I'm doing this sankalp today — for purpose, for presence.", s: "Do yours and feel the shift — KalpX makes it easy." },
  { p: "Every commitment begins with a choice.", s: "Make yours today — find your sankalp on KalpX." },
  { p: "This is my sankalp today.", s: "Take yours too — a few breaths can change your day." },
  { p: "I've begun my sankalp practice for today.", s: "Start yours now and begin your journey toward purpose." },
];

const stage3 = [
  { p: "Sankalp done for today 🙏 Feeling purposeful and aligned.", s: "Do yours today on KalpX and start your own streak of intention." },
  { p: "I completed my sankalp — purpose feels sacred again.", s: "Start your streak today — one small commitment at a time on KalpX." },
  { p: "Purpose isn't found — it's practiced. Today, I practiced.", s: "Begin your sankalp streak today — one small commitment at a time on KalpX." },
  { p: "One sankalp closer to purpose. One step deeper in dharma.", s: "Join me — do today's sankalp on KalpX and start your streak." },
  { p: "Today's sankalp complete 🌸 My heart feels aligned.", s: "Start your daily practice today — purpose grows with each commitment." },
  { p: "I've done my sankalp for today — a few minutes, lifelong purpose.", s: "Do yours and begin your streak of intention on KalpX." },
  { p: "Sankalp done ✅ Commitment renewed.", s: "Start your streak on KalpX and feel the power of daily intention." },
];

const MantraCard = ({ practiceTodayData, onPressChantMantra, DoneMantraCalled }) => {
  const navigation: any = useNavigation();
  const shareMantraRef = useRef(null);

  const {
    dailyMantras,
    currentMantraIndex,
    loading,
    error,
    loadToday,
    nextMantra,
    prevMantra,
  } = usePracticeStore();

  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(currentMantraIndex);
const [shareVisible, setShareVisible] = useState(false);

  useEffect(() => {
    loadToday();
  }, []);

  useEffect(() => {
    setActiveIndex(currentMantraIndex);
  }, [currentMantraIndex]);

  const startedMantra = practiceTodayData?.started?.mantra;
  const endMantra = practiceTodayData?.done?.mantra;
  const mantraId = practiceTodayData?.ids?.mantra;

    // determine current stage
  const shareStage = endMantra ? 3 : startedMantra ? 2 : 1;

  // pick random primary & secondary text based on stage
  const { p: primaryText, s: secondaryText } = useMemo(() => {
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    if (shareStage === 3) return pick(stage3);
    if (shareStage === 2) return pick(stage2);
    return pick(stage1);
  }, [shareStage]);

const handleShareMantra = async () => {
  try {
    // show the hidden share view
    setShareVisible(true);

    // wait for layout to render before capture
    await new Promise((resolve) => setTimeout(resolve, 400));

    const uri = await captureRef(shareMantraRef, { format: "png", quality: 1 });
    const fileUri = `${FileSystem.cacheDirectory}mantra_share_${Date.now()}.png`;
    await FileSystem.copyAsync({ from: uri, to: fileUri });

    // hide share view after capture
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



  // ✅ Filtered list
  const filteredMantras = useMemo(() => {
    if (startedMantra && mantraId) {
      const allMantras = Object.values(CATALOGS).flat();
      const found = allMantras.find((m) => m.id === mantraId);
      return found ? [found] : [];
    }
    return dailyMantras.slice(0, 5);
  }, [startedMantra, mantraId, dailyMantras]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.Colors.App_theme} />
        <TextComponent>Loading your daily mantras...</TextComponent>
      </View>
    );
  }

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
      ref={swiperRef}
      loop={false}
      index={activeIndex}
      showsPagination={false}
      onIndexChanged={(i) => setActiveIndex(i)}
      scrollEnabled={!startedMantra}
      autoplay={false}
      horizontal
      removeClippedSubviews={false}
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
            {/* LEFT ARROW */}
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
                  🌞 Share your sādhanā, awaken another heart.
                </TextComponent>

                {/* Header */}
                <View style={styles.headerRow}>
                  <TextComponent type="semiBoldText" style={{ color: Colors.Colors.BLACK }}>
                    Daily Mantra
                  </TextComponent>
                  <TouchableOpacity onPress={handleShareMantra} style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image source={require("../../assets/Streak_S1.png")} style={styles.streakIcon} />
                    <Image source={require("../../assets/Streak_S2.png")} style={styles.streakIcon} />
                    <Image source={require("../../assets/Streak_S3.png")} style={styles.streakIcon} />
                    <Image source={require("../../assets/Streak_S4.png")} style={styles.streakIcon} />
                  </TouchableOpacity>
                </View>

                {/* Text */}
                <TextComponent type="semiBoldText" style={{ color: Colors.Colors.Light_black }}>
                  {currentMantra.devanagari}
                </TextComponent>
                <TextComponent type="semiBoldText" style={{ color: Colors.Colors.Light_black, marginVertical: 6 }}>
                  {currentMantra.iast}
                </TextComponent>

                {/* Explanation */}
                {Array.isArray(currentMantra.explanation)
                  ? currentMantra.explanation.map((line, idx) => (
                      <TextComponent key={idx} style={{ marginTop: 4 }}>
                        {line}
                      </TextComponent>
                    ))
                  : <TextComponent>{currentMantra.explanation}</TextComponent>}

                {/* Tags */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
                  {currentMantra.tags?.map((tag, i) => (
                    <View key={i} style={styles.tag}>
                      <TextComponent type="semiBoldText"># {tag}</TextComponent>
                    </View>
                  ))}
                </ScrollView>

                {/* Suggested Reps */}
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TextComponent type="semiBoldText" style={styles.repLabel}>
                    Suggested reps:
                  </TextComponent>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
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
                        <TextComponent type="semiBoldText" style={{ color: Colors.Colors.BLACK }}>
                          X{rep}
                        </TextComponent>
                      </View>
                    ))}
                  </ScrollView>
                </View>

                {/* Buttons */}
                <View style={styles.buttonRow}>
                  {!startedMantra ? (
                    <TouchableOpacity
                      style={styles.startBtn}
                      onPress={() => onPressChantMantra(currentMantra)}
                    >
                      <TextComponent type="semiBoldText" style={{ textAlign: "center" }}>
                        I will chant this mantra today
                      </TextComponent>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={{ marginRight: 25, flexDirection: "row", marginTop: 10 }}
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
                      <TextComponent>{endMantra ? "Done" : "Mark Mantra Done"}</TextComponent>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.dailyBtn}
                    onPress={() => navigation.navigate("MySadana", { selectedmantra: currentMantra })}
                  >
                    <TextComponent type="boldText" style={{ color: Colors.Colors.Light_black }}>
                      Do this mantra daily
                    </TextComponent>
                  </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                  <TextComponent type="semiBoldText" style={{ color: Colors.Colors.Light_grey }}>
                    Finish today to keep streak
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
      top: -9999, // completely off-screen
      left: 0,
      opacity: 0, // invisible
    }}
    pointerEvents="none"
  >
    <ViewShot ref={shareMantraRef} options={{ format: "png", quality: 1 }}>
      <ImageBackground
        source={require("../../assets/Streak_bg.png")}
        style={{
          width: FontSize.CONSTS.DEVICE_WIDTH,
          height: 500,
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
        resizeMode="cover"
      >
        {/* <TextComponent
          type="boldText"
          style={{
            color: "#925910",
            fontSize: FontSize.CONSTS.FS_18,
            marginBottom: 10,
          }}
        >
          Mantra
        </TextComponent> */}
              <TextComponent type="boldText" style={{ color: "#925910", fontSize: FontSize.CONSTS.FS_20, marginBottom: 10 , textAlign: "center",}}>
                {primaryText}
              </TextComponent>
                <TextComponent type="mediumText" style={{ color: "#925910", textAlign: "center", fontSize: FontSize.CONSTS.FS_18, marginBottom: 20 }}>
                {secondaryText}
              </TextComponent>
        <TextComponent
          type="semiBoldText"
          style={{
            color:  "#925910",
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
            color:  "#925910",
            fontSize: FontSize.CONSTS.FS_18,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          {filteredMantras[activeIndex]?.iast}
        </TextComponent>

        {/* <TextComponent
          type="mediumText"
          style={{
            color: "#925910",
            textAlign: "center",
            fontSize: FontSize.CONSTS.FS_14,
            marginBottom: 20,
          }}
        >
          “Chanting connects your breath to peace.”
        </TextComponent> */}

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
            {/* RIGHT ARROW */}
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

export default MantraCard;

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 },
  card: {
    borderRadius: 6,
    // overflow: "hidden",
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
  tag: { paddingHorizontal: 6, paddingVertical: 6, marginRight: 4 },
  repLabel: {
    color: Colors.Colors.Light_grey,
    fontSize: FontSize.CONSTS.FS_10,
    marginRight: 6,
  },
  repBox: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6, backgroundColor: "#EAEAEA", marginRight: 8 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "stretch", marginVertical: 15 },
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
  streakIcon: { height: 20, width: 20, marginRight: 8 },
});

import { useNavigation, useRoute } from "@react-navigation/native";
import React from "react";
import { ImageBackground, SafeAreaView, StyleSheet } from "react-native";
import PracticeRunnerView from "../../../blocks/runners/PracticeRunnerView";

const BEIGE_BG = require("../../../../assets/beige_bg.png");

export default function RhythmPracticeRunner() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { item, slot, journeyId, dayNumber } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={BEIGE_BG} style={styles.bg}>
        <PracticeRunnerView
          item={item}
          onComplete={(durationSec) => {
            navigation.replace("RhythmPracticeCompletion", {
              item_id: item.item_id,
              item_type: "practice",
              item_title: item.title || item.title_snapshot,
              slot,
              journeyId,
              dayNumber,
            });
          }}
          onBack={() => navigation.goBack()}
          isDevMode={__DEV__}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FBF5F5" },
  bg: { flex: 1 },
});

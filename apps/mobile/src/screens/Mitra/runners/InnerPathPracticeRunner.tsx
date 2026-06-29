import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import PracticeRunnerView from "../../../blocks/runners/PracticeRunnerView";
import { useScreenStore } from "../../../engine/useScreenBridge";

const BEIGE_BG = require("../../../../assets/beige_bg.webp");

export default function InnerPathPracticeRunner() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { item, journeyId, dayNumber } = route.params;
  const updateBackground = useScreenStore((state) => state.updateBackground);

  useFocusEffect(
    useCallback(() => {
      updateBackground(BEIGE_BG);
      return () => updateBackground(null);
    }, [updateBackground]),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <PracticeRunnerView
        item={item}
        liveActivityDeepLink="kalpx://mitra/inner_path/home?source=la"
        onComplete={(durationSec) => {
          navigation.replace("InnerPathPracticeCompletion", {
            item_id: item.item_id,
            item_type: "practice",
            item_title: item.title,
            item_subtitle: item.subtitle || item.line || item.summary || '',
            journeyId,
            dayNumber,
          });
        }}
        onBack={() => navigation.goBack()}
        isDevMode={__DEV__}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "transparent" },
});

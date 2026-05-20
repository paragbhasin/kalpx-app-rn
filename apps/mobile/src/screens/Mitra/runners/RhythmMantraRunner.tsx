import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import MantraRunnerView from "../../../blocks/runners/MantraRunnerView";
import { useScreenStore } from "../../../engine/useScreenBridge";

const BEIGE_BG = require("../../../../assets/beige_bg.png");

export default function RhythmMantraRunner() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { item, slot, journeyId, dayNumber } = route.params;
  const updateBackground = useScreenStore((state) => state.updateBackground);

  useFocusEffect(
    useCallback(() => {
      updateBackground(BEIGE_BG);
      return () => updateBackground(null);
    }, [updateBackground]),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <MantraRunnerView
        item={item}
        onComplete={(repsCompleted, durationSec) => {
          navigation.replace("RhythmMantraCompletion", {
            item_id: item.item_id,
            item_type: "mantra",
            item_title: item.title || item.title_snapshot,
            slot,
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

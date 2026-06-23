/**
 * ProgramPracticeRunner — forked from InnerPathPracticeRunner.
 * DO NOT modify InnerPathPracticeRunner — this is an independent fork.
 */
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import PracticeRunnerView from "../../../blocks/runners/PracticeRunnerView";
import { useScreenStore } from "../../../engine/useScreenBridge";

const BEIGE_BG = require("../../../../assets/beige_bg.webp");

export default function ProgramPracticeRunner() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { item, dayNumber, completedItems = [] } = route.params;
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
        onComplete={() => {
          const updated = [...new Set([...completedItems, item.item_id])];
          navigation.navigate("ProgramDayScreen", { dayNumber, completedItems: updated });
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

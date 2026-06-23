/**
 * ProgramSankalpRunner — forked from InnerPathSankalpRunner.
 * DO NOT modify InnerPathSankalpRunner — this is an independent fork.
 */
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import SankalpRunnerView from "../../../blocks/runners/SankalpRunnerView";
import { useScreenStore } from "../../../engine/useScreenBridge";

const BEIGE_BG = require("../../../../assets/beige_bg.webp");

export default function ProgramSankalpRunner() {
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
      <SankalpRunnerView
        item={item}
        sourceSurface="program"
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

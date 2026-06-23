/**
 * ProgramMantraRunner — forked from InnerPathMantraRunner.
 * DO NOT modify InnerPathMantraRunner — this is an independent fork.
 *
 * Source surface: "program" (never "inner_path").
 * On complete: returns to ProgramDayScreen (goBack).
 */
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useRef } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import MantraRunnerView from "../../../blocks/runners/MantraRunnerView";
import { useScreenStore } from "../../../engine/useScreenBridge";

const BEIGE_BG = require("../../../../assets/beige_bg.webp");

export default function ProgramMantraRunner() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { item, dayNumber, completedItems = [] } = route.params;
  const updateBackground = useScreenStore((state) => state.updateBackground);

  const engineApiRef = useRef<{ syncNow: () => Promise<void>; refreshStats: () => Promise<void> } | null>(null);

  useFocusEffect(
    useCallback(() => {
      updateBackground(BEIGE_BG);
      engineApiRef.current?.refreshStats();
      return () => {
        updateBackground(null);
        engineApiRef.current?.syncNow();
      };
    }, [updateBackground]),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <MantraRunnerView
        item={item}
        mantraRef={item.item_id ?? null}
        sourceSurface="program"
        onEngineReady={(api) => { engineApiRef.current = api; api.refreshStats(); }}
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

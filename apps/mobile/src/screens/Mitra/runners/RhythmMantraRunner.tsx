import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import MantraRunnerView from "../../../blocks/runners/MantraRunnerView";
import { useScreenStore } from "../../../engine/useScreenBridge";
import { mitraRhythmResolveItem } from "../../../engine/mitraApi";

const BEIGE_BG = require("../../../../assets/beige_bg.webp");

export default function RhythmMantraRunner() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { item: initialItem, slot, journeyId, dayNumber } = route.params;
  const { i18n } = useTranslation();
  const [item, setItem] = useState(initialItem);
  const updateBackground = useScreenStore((state) => state.updateBackground);

  useEffect(() => {
    mitraRhythmResolveItem(slot, initialItem.item_id, initialItem.item_type, i18n.language || 'en')
      .then((resolved) => { if (resolved?.resolved) setItem((prev: any) => ({ ...prev, ...resolved })); })
      .catch(() => {});
  }, [i18n.language]);

  const engineApiRef = useRef<{ syncNow: () => Promise<void>; refreshStats: () => Promise<void> } | null>(null);

  useFocusEffect(
    useCallback(() => {
      updateBackground(BEIGE_BG);
      // Screen focused — fetch fresh counts
      engineApiRef.current?.refreshStats();
      return () => {
        updateBackground(null);
        // Screen blurred — flush unsynced delta
        engineApiRef.current?.syncNow();
      };
    }, [updateBackground]),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <MantraRunnerView
        item={item}
        mantraRef={item.item_id ?? null}
        sourceSurface="daily_rhythm"
        onEngineReady={(api) => { engineApiRef.current = api; api.refreshStats(); }}
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

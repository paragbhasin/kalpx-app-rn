import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import SankalpRunnerView from "../../../blocks/runners/SankalpRunnerView";
import { useScreenStore } from "../../../engine/useScreenBridge";
import { mitraRhythmResolveItem } from "../../../engine/mitraApi";

const BEIGE_BG = require("../../../../assets/beige_bg.webp");

export default function RhythmSankalpRunner() {
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
        sourceSurface="daily_rhythm"
        onComplete={(durationSec) => {
          navigation.replace("RhythmSankalpCompletion", {
            item_id: item.item_id,
            item_type: "sankalp",
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

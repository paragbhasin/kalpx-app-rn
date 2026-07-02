import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ImageBackground, SafeAreaView, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import PracticeRunnerView from "../../../blocks/runners/PracticeRunnerView";
import { mitraRhythmResolveItem } from "../../../engine/mitraApi";

const BEIGE_BG = require("../../../../assets/beige_bg.webp");

export default function RhythmPracticeRunner() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { item: initialItem, slot, journeyId, dayNumber } = route.params;
  const { i18n } = useTranslation();
  const [item, setItem] = useState(initialItem);

  useEffect(() => {
    mitraRhythmResolveItem(slot, initialItem.item_id, initialItem.item_type, i18n.language || 'en')
      .then((resolved) => { if (resolved?.resolved) setItem((prev: any) => ({ ...prev, ...resolved })); })
      .catch(() => {});
  }, [i18n.language]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={BEIGE_BG} style={styles.bg}>
        <PracticeRunnerView
          item={item}
          liveActivityDeepLink={`kalpx://mitra/rhythm_home/${slot}?source=la`}
          onComplete={(durationSec) => {
            navigation.replace("RhythmPracticeCompletion", {
              item_id: item.item_id,
              item_type: "practice",
              item_title: item.title || item.title_snapshot,
              item_subtitle: item.subtitle || item.line || item.summary || '',
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

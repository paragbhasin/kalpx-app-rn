import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { ImageBackground, SafeAreaView, StyleSheet } from "react-native";
import RunnerCompletionView from "../../../components/RunnerCompletionView";
import { RHYTHM_PRACTICE_COMPLETION_COPY as COPY } from "../../../constants/completionCopy";
import {
  mitraRhythmComplete,
  mitraTrackCompletion,
} from "../../../engine/mitraApi";

const BEIGE_BG = require("../../../../assets/beige_bg.png");

export default function RhythmPracticeCompletion() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { item_id, item_title, slot, journeyId, dayNumber } = route.params;
  const completedRef = useRef(false);
  const [badge, setBadge] = useState<string>(COPY.pending);

  useEffect(() => {
    if (completedRef.current) return;
    completedRef.current = true;

    Promise.all([
      mitraRhythmComplete(slot, item_id),
      mitraTrackCompletion({ itemType: "practice", itemId: item_id, source: "rhythm_daily", journeyId, dayNumber }),
    ])
      .then(([result]) => setBadge(result ? COPY.badgeSuccess : COPY.failure))
      .catch(() => setBadge(COPY.failure));
  }, []);

  const handleReturn = () => navigation.navigate("RhythmHome" as any);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={BEIGE_BG} style={styles.bg}>
        <RunnerCompletionView
          title={COPY.title}
          subtitle={COPY.subtitle}
          badgeLabel={badge}
          ctaLabel={COPY.cta}
          onCtaPress={handleReturn}
          testID={__DEV__ ? "test_rhythm_practice_completion_return" : undefined}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FBF5F5" },
  bg: { flex: 1 },
});

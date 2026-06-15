import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ImageBackground, SafeAreaView, StyleSheet } from "react-native";
import { useDispatch } from "react-redux";
import RunnerCompletionView from "../../../components/RunnerCompletionView";
import { useCompletionCopy } from "../../../constants/completionCopy";
import {
  mitraJourneyHomeV3,
  mitraRhythmComplete,
  mitraTrackCompletion,
} from "../../../engine/mitraApi";
import { setHomeData } from "../../../store/doorSlice";
import { useAppRating } from "../../../hooks/useAppRating";

const BEIGE_BG = require("../../../../assets/beige_bg.webp");

export default function RhythmPracticeCompletion() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const { item_id, item_title, slot, journeyId, dayNumber } = route.params;
  const completedRef = useRef(false);
  const COPY = useCompletionCopy("rhythm_practice");
  const [badge, setBadge] = useState<string>(COPY.pending);
  const { recordAndMaybePrompt, renderRatingModal } = useAppRating();

  useEffect(() => {
    if (completedRef.current) return;
    completedRef.current = true;

    Promise.all([
      mitraRhythmComplete(slot, item_id),
      mitraTrackCompletion({ itemType: "practice", itemId: item_id, source: "rhythm_daily", journeyId, dayNumber }),
    ])
      .then(([result]) => {
        setBadge(result ? COPY.badgeSuccess : COPY.failure);
        setTimeout(() => recordAndMaybePrompt('rhythm'), 1500);
      })
      .catch(() => setBadge(COPY.failure));
  }, []);

  const handleReturn = useCallback(async () => {
    try {
      const fresh = await mitraJourneyHomeV3({ forceFresh: true });
      if (fresh) dispatch(setHomeData(fresh));
    } catch (_) {}
    navigation.navigate("RhythmHome" as any);
  }, [dispatch, navigation]);

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
      {renderRatingModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FBF5F5" },
  bg: { flex: 1 },
});

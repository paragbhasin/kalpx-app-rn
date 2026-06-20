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
import { useCompletionReflection } from "./useCompletionReflection";

const BEIGE_BG = require("../../../../assets/beige_bg.webp");

export default function RhythmSankalpCompletion() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const { item_id, item_title, slot, journeyId, dayNumber } = route.params;
  const completedRef = useRef(false);
  const COPY = useCompletionCopy("rhythm_sankalp");
  const [badge, setBadge] = useState<string>(COPY.pending);
  const onReflect = useCompletionReflection(COPY.variant, item_id);

  useEffect(() => {
    if (completedRef.current) return;
    completedRef.current = true;

    Promise.all([
      mitraRhythmComplete(slot, item_id),
      mitraTrackCompletion({ itemType: "sankalp", itemId: item_id, source: "rhythm_daily", journeyId, dayNumber }),
    ])
      .then(([result]) => setBadge(result ? COPY.badgeSuccess : COPY.failure))
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
          liveActivity={item_title ? { type: COPY.variant, name: item_title } : undefined}
          nameCard={item_title ? { label: COPY.nameCardLabel, text: item_title, guideLine: COPY.nameCardGuide } : undefined}
          reflection={{ prompt: COPY.reflectionPrompt, onSubmit: onReflect }}
          testID={__DEV__ ? "test_rhythm_sankalp_completion_return" : undefined}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FBF5F5" },
  bg: { flex: 1 },
});

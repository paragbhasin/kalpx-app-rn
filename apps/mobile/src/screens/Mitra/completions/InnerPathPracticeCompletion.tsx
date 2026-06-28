import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { ImageBackground, SafeAreaView, StyleSheet } from "react-native";
import RunnerCompletionView from "../../../components/RunnerCompletionView";
import { useCompletionCopy } from "../../../constants/completionCopy";
import { useCompletionReflection } from "./useCompletionReflection";
import {
  mitraInnerPathComplete,
  mitraTrackCompletion,
} from "../../../engine/mitraApi";
import { liveActivity } from "../../../native/liveActivity";

const BEIGE_BG = require("../../../../assets/beige_bg.webp");

export default function InnerPathPracticeCompletion() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { item_id, item_title, journeyId, dayNumber } = route.params;
  const completedRef = useRef(false);
  const COPY = useCompletionCopy("innerPath_practice");
  const [badge, setBadge] = useState<string>(COPY.pending);
  const onReflect = useCompletionReflection(COPY.variant, item_id);

  useEffect(() => {
    if (completedRef.current) return;
    completedRef.current = true;

    Promise.all([
      mitraInnerPathComplete("practice", item_id),
      mitraTrackCompletion({ itemType: "practice", itemId: item_id, source: "core", journeyId, dayNumber }),
    ])
      .then(([result]) => setBadge(result ? COPY.badgeSuccess : COPY.failure))
      .catch(() => setBadge(COPY.failure));
  }, []);

  const handleReturn = () => navigation.navigate("InnerPath" as any);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={BEIGE_BG} style={styles.bg}>
        <RunnerCompletionView
          title={COPY.title}
          subtitle={COPY.subtitle}
          badgeLabel={badge}
          ctaLabel={COPY.cta}
          onCtaPress={handleReturn}
          liveActivity={item_title ? {
            type: COPY.variant,
            name: item_title,
            onActivate: () => liveActivity.startSankalp(item_title, '', 'kalpx://mitra/inner_path/home?source=la').catch(() => {}),
          } : undefined}
          nameCard={item_title ? { label: COPY.nameCardLabel, text: item_title, guideLine: COPY.nameCardGuide } : undefined}
          reflection={{ prompt: COPY.reflectionPrompt, onSubmit: onReflect }}
          testID={__DEV__ ? "test_ip_practice_completion_return" : undefined}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FBF5F5" },
  bg: { flex: 1 },
});

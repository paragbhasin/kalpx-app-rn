import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { ImageBackground, SafeAreaView, StyleSheet } from "react-native";
import RunnerCompletionView from "../../../components/RunnerCompletionView";
import { INNER_PATH_SANKALP_COMPLETION_COPY as COPY } from "../../../constants/completionCopy";
import {
  mitraInnerPathComplete,
  mitraTrackCompletion,
} from "../../../engine/mitraApi";

const BEIGE_BG = require("../../../../assets/beige_bg.png");

export default function InnerPathSankalpCompletion() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { item_id, item_title, journeyId, dayNumber } = route.params;
  const completedRef = useRef(false);
  const [badge, setBadge] = useState<string>(COPY.pending);

  useEffect(() => {
    if (completedRef.current) return;
    completedRef.current = true;

    Promise.all([
      mitraInnerPathComplete("sankalp", item_id),
      mitraTrackCompletion({ itemType: "sankalp", itemId: item_id, source: "core", journeyId, dayNumber }),
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
          testID={__DEV__ ? "test_ip_sankalp_completion_return" : undefined}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FBF5F5" },
  bg: { flex: 1 },
});

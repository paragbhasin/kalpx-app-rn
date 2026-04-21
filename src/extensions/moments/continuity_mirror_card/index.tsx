// Dashboard block (card): ContinuityMirrorCard
// Spec: kalpx-frontend/docs/specs/mitra-v3-experience/screens/route_dashboard_day_active.md §1
// ISOLATED SCAFFOLD — not registered. See ./README.md for wire-up.

import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  block?: any;
  screenData?: any;
};

const ContinuityMirrorCard: React.FC<Props> = ({ block, screenData }) => {
  // v3 journey: continuity is a tier-aware block. Render when tier !== "none".
  const cont = screenData?.continuity;
  const blockPayload = block?.payload;
  const tierActive = cont?.tier && cont.tier !== "none";
  if (!blockPayload && !tierActive) return null;
  const title =
    blockPayload?.title ?? blockPayload?.headline ?? cont?.headline ?? "";
  const body = blockPayload?.body ?? blockPayload?.message ?? cont?.body ?? "";
  if (!title && !body) return null;
  return (
    <View
      style={styles.card}
      accessibilityLabel="continuity_mirror_card"
      testID="continuity_mirror_card"
    >
      {!!title && <Text style={styles.title}>{title}</Text>}
      {!!body && <Text style={styles.body}>{body}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#E8DFCD",
    borderRadius: 12,
    padding: 14,
    marginVertical: 8,
    backgroundColor: "#FFFDF7",
  },
  title: { color: "#2d2a24", fontSize: 15, fontWeight: "600", marginBottom: 4 },
  body: { color: "#6b6155", fontSize: 14, lineHeight: 20 },
});

export default ContinuityMirrorCard;

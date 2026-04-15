// Dashboard block (card): PredictiveAlertCard
// Spec: kalpx-frontend/docs/specs/mitra-v3-experience/screens/route_dashboard_day_active.md
// ISOLATED SCAFFOLD — not registered. See ./README.md for wire-up.

import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  block?: any;
  screenData?: any;
};

const PredictiveAlertCard: React.FC<Props> = ({ block, screenData }) => {
  const payload = block?.payload ?? screenData?.predictive_alert ?? null;
  if (!payload) return null;
  const title = payload.title ?? payload.headline ?? "";
  const body = payload.body ?? payload.message ?? "";
  return (
    <View style={styles.card} accessibilityLabel="predictive_alert_card">
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

export default PredictiveAlertCard;

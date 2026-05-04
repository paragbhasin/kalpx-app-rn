/**
 * PredictiveAlertCard — Gate 5 in-app surface.
 *
 * Renders a calm, dismissible suggestion card from a PredictiveAlert row.
 * Displays copy_text only — no trigger_reason, entity names, evidence lines,
 * confidence scores, or internal labels are ever shown to the user.
 *
 * Actions:
 *   "See suggestion" → accept (JourneyActivity write, navigate to prep context)
 *   "Not today"      → dismiss (JourneyActivity write, hides card)
 */

import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../theme/colors";
import { Fonts } from "../../theme/fonts";

type Alert = {
  id: number | string;
  copy: string;
  suggested_prep_context?: string;
};

type Props = {
  alert: Alert;
  onDismiss: (alertId: number | string) => void;
  onAccept: (alertId: number | string, prepContext?: string) => void;
};

const PredictiveAlertCard: React.FC<Props> = ({ alert, onDismiss, onAccept }) => {
  const copy = typeof alert.copy === "string" ? alert.copy.trim() : "";
  if (!copy) return null;

  return (
    <View
      style={styles.card}
      accessibilityLabel="predictive_alert_card"
      testID="predictive_alert_card"
    >
      <Text style={styles.body}>{copy}</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => onAccept(alert.id, alert.suggested_prep_context)}
          accessibilityRole="button"
        >
          <Text style={styles.primaryLabel}>See suggestion</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => onDismiss(alert.id)}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryLabel}>Not today</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: Colors.goldHairline,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginVertical: 8,
    backgroundColor: Colors.cream,
  },
  body: {
    fontFamily: Fonts.serif.regular,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.brownDeep,
    marginBottom: 14,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  primaryBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: Colors.gold,
  },
  primaryLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 12,
    color: Colors.white,
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.goldHairline,
  },
  secondaryLabel: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: Colors.brownMuted,
  },
});

export default PredictiveAlertCard;

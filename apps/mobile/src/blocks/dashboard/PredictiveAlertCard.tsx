/**
 * PredictiveAlertCard — Gate 6A in-app surface.
 *
 * Renders a calm, dismissible suggestion card from a PredictiveAlert row.
 * Displays copy_text only — no trigger_reason, entity names, evidence lines,
 * confidence scores, or internal labels are ever shown to the user.
 *
 * Gate 6A additions:
 *   - safe_explanation: "Why this may help today" (expander)
 *   - "Show me why" toggle: reveals safe_explanation only
 *   - "Add to today" action (optional, calls onAddToday if provided)
 *
 * Actions:
 *   "See suggestion" → accept (JourneyActivity write, navigate to prep context)
 *   "Not today"      → dismiss (JourneyActivity write, hides card)
 *   "Show me why"    → toggle safe_explanation
 *   "Add to today"   → add suggestion to daily triad (optional)
 */

import React, { useState } from "react";
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
  copy_text?: string;
  safe_explanation?: string;
  suggested_prep_context?: string;
};

type Props = {
  alert: Alert;
  onDismiss: (alertId: number | string) => void;
  onAccept: (alertId: number | string, prepContext?: string) => void;
  onAddToday?: (alertId: number | string) => void;
};

const PredictiveAlertCard: React.FC<Props> = ({ alert, onDismiss, onAccept, onAddToday }) => {
  const copy = (typeof alert.copy_text === "string" && alert.copy_text.trim())
    ? alert.copy_text.trim()
    : (typeof alert.copy === "string" ? alert.copy.trim() : "");

  const [whyOpen, setWhyOpen] = useState(false);

  if (!copy) return null;

  const safeExplanation = typeof alert.safe_explanation === "string"
    ? alert.safe_explanation.trim()
    : "";

  return (
    <View
      style={styles.card}
      accessibilityLabel="predictive_alert_card"
      testID="predictive_alert_card"
    >
      <Text style={styles.body}>{copy}</Text>

      {safeExplanation ? (
        <TouchableOpacity
          onPress={() => setWhyOpen(o => !o)}
          accessibilityRole="button"
          style={styles.whyLink}
        >
          <Text style={styles.whyLinkText}>{whyOpen ? "Hide" : "Show me why"}</Text>
        </TouchableOpacity>
      ) : null}

      {whyOpen && safeExplanation ? (
        <View style={styles.explanationBox} testID="safe-explanation">
          <Text style={styles.explanationText}>{safeExplanation}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => onAccept(alert.id, alert.suggested_prep_context)}
          accessibilityRole="button"
        >
          <Text style={styles.primaryLabel}>See suggestion</Text>
        </TouchableOpacity>
        {onAddToday ? (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => onAddToday(alert.id)}
            accessibilityRole="button"
          >
            <Text style={styles.addLabel}>Add to today</Text>
          </TouchableOpacity>
        ) : null}
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
    marginBottom: 10,
  },
  whyLink: {
    marginBottom: 8,
  },
  whyLinkText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: Colors.brownMuted,
    textDecorationLine: "underline",
  },
  explanationBox: {
    backgroundColor: "#FAF6ED",
    borderLeftWidth: 3,
    borderLeftColor: Colors.goldHairline,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  explanationText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.brownMuted,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
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
  addBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  addLabel: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: "#6B7280",
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

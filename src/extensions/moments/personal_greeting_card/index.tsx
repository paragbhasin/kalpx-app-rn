// Dashboard block (card): PersonalGreetingCard
// Spec: NONE (derived from mitra_vision_core + feedback_contextual_return memos)
// ISOLATED SCAFFOLD — not registered. See ./README.md for wire-up.

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Fonts } from "../../../theme/fonts";

type Cta = { id: string; label: string };
type Props = {
  block?: any;
  screenData?: any;
  onCtaPress?: (ctaId: string) => void;
};

const CONTEXTUAL_MESSAGES: Record<string, string> = {
  morning: "One quiet start is enough for today.",
  evening: "The day is softening. Pause here.",
  low_engagement: "Small return. That is sadhana.",
  milestone: "A week's steadiness is not small.",
};

const DEFAULT_CTAS: Cta[] = [
  { id: "start_today", label: "Start today" },
  { id: "review", label: "Review" },
  { id: "reflect", label: "Reflect" },
  { id: "ask_mitra", label: "Ask Mitra" },
];

const PersonalGreetingCard: React.FC<Props> = ({
  block,
  screenData,
  onCtaPress,
}) => {
  const sd = screenData ?? block?.screenData ?? {};
  const firstName: string =
    sd?.user?.first_name || sd?.first_name || "";
  const greetingContext: string = sd?.greeting_context || "";
  const contextualMessage =
    CONTEXTUAL_MESSAGES[greetingContext] ||
    "Still here. That is the practice.";
  const ctas: Cta[] =
    Array.isArray(sd?.greeting_ctas) && sd.greeting_ctas.length
      ? sd.greeting_ctas
      : DEFAULT_CTAS;

  const greetingLine = firstName ? `Hi, ${firstName}.` : "";

  return (
    <View
      style={styles.card}
      accessibilityLabel="personal_greeting_card"
    >
      {greetingLine ? <Text style={styles.greeting}>{greetingLine}</Text> : null}
      <Text style={styles.contextual}>{contextualMessage}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.ctaRow}
      >
        {ctas.map((cta) => (
          <TouchableOpacity
            key={cta.id}
            activeOpacity={0.8}
            onPress={() => onCtaPress?.(cta.id)}
            style={styles.ctaTouchable}
          >
            <LinearGradient
              colors={["#E5D4CA", "#F5EDEA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaPill}
            >
              <Text style={styles.ctaLabel}>{cta.label}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFDF7",
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#EDE1D3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  greeting: {
    fontFamily: Fonts.serif.bold,
    fontSize: 22,
    color: "#D4A017",
    marginBottom: 6,
  },
  contextual: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#5A4E3C",
    marginBottom: 10,
    lineHeight: 20,
  },
  prompt: {
    fontFamily: Fonts.sans.medium,
    fontSize: 15,
    color: "#432104",
    marginBottom: 14,
  },
  ctaRow: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 8,
  },
  ctaTouchable: {
    marginRight: 8,
  },
  ctaPill: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  ctaLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 13,
    color: "#432104",
  },
});

export default PersonalGreetingCard;

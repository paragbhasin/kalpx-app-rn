/**
 * GreetingCard — hero card at the top of the new dashboard (M_new_dashboard_greeting).
 *
 * Spec: docs/NEW_DASHBOARD_V1_SPEC.md §2 #1
 *
 * Always-visible core block (per founder dashboard contract): the
 * greeting card is part of the stable dashboard skeleton and must
 * render every time. Emotional copy (greeting_context, tone) comes
 * from backend ContentPacks; when a slot is empty we fall back to a
 * neutral structural greeting rather than hiding the card, so the
 * dashboard keeps its visual presence even on cold hydration.
 *
 * Visual: gold left-border card on cream background; serif headline
 * with subtitle; right-side Om mandala placeholder uses the existing
 * mantra-lotus-3d SVG.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MantraLotus3d from "../../../assets/mantra-lotus-3d.svg";
import { Colors } from "../../theme/colors";
import { Fonts } from "../../theme/fonts";

type Props = {
  screenData?: Record<string, any>;
};

const isSameCalendarDay = (a: number, b: number) => {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

const GreetingCard: React.FC<Props> = ({ screenData }) => {
  const sd = screenData ?? {};
  const context: string = sd.greeting_context ?? "";
  const userName: string = sd.user_name ?? "";
  const tone: string = sd.greeting_tone ?? "";

  // SOV-1 (2026-04-20): sovereignty-strict. `displayContext` reads
  // directly from BE-sourced `greeting_context` (now wired to
  // M_new_dashboard_greeting.contextual_fallback ContentPack slot via
  // journey_envelope._get_slot_from_contentpack). If BE ships empty,
  // the context line self-hides below rather than falling back to an
  // English string. `displayName` retains the structural "friend"
  // fallback since a name is required for the greeting to grammar.
  //
  // Notifications bell removed 2026-04-18 — bottom-nav tab carries it.
  const displayName = userName || "friend";
  const displayContext = context;

  // Joy Carry same-day chip (founder adjustment #3, 2026-04-19 — Option A
  // frontend-first). Stamped by `carry_joy_forward` action when the user
  // taps the Carry pill inside the Joy room. Chip hides automatically
  // when captured_at is not today (calendar-day boundary). Label
  // preserves the sovereign pill label the user actually tapped.
  const joyCarry = sd.joy_carry;
  const carryIsToday =
    joyCarry &&
    typeof joyCarry.captured_at === "number" &&
    isSameCalendarDay(joyCarry.captured_at, Date.now());
  const carryLabel: string =
    typeof joyCarry?.label === "string" && joyCarry.label ? joyCarry.label : "";

  return (
    <View>
      <View style={styles.card} accessibilityLabel="greeting_card">
        <View style={styles.leftAccent} />
        <View style={styles.body}>
          <Text style={styles.name}>Welcome, {displayName}.</Text>
          {!!displayContext && (
            <Text style={styles.context}>{displayContext}</Text>
          )}
          {!!tone && <Text style={styles.tone}>{tone}</Text>}
        </View>
        <View style={styles.mandalaWrap} accessibilityElementsHidden>
          <MantraLotus3d width={56} height={56} />
        </View>
      </View>
      {carryIsToday && (
        <View style={styles.carryChip} accessibilityLabel="joy_carry_chip">
          <Text style={styles.carryChipText} numberOfLines={1}>
            {carryLabel ? `${carryLabel} — held today` : "Joy carried forward"}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cream,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderCream,
    paddingVertical: 14,
    paddingRight: 12,
    paddingLeft: 0,
    marginVertical: 10,
    overflow: "hidden",
  },
  leftAccent: {
    width: 4,
    alignSelf: "stretch",
    backgroundColor: Colors.gold,
    marginRight: 14,
  },
  body: {
    flex: 1,
    paddingRight: 8,
  },
  name: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: Colors.brownDeep,
    marginBottom: 2,
  },
  context: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: Colors.textSoft,
    lineHeight: 20,
  },
  tone: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: Colors.brownMuted,
    fontStyle: "italic",
    marginTop: 4,
  },
  mandalaWrap: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  carryChip: {
    alignSelf: "flex-start",
    marginTop: -4,
    marginBottom: 6,
    // marginLeft: 18,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.goldHairline,
    backgroundColor: Colors.creamWarm,
  },
  carryChipText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    color: Colors.brownDeep,
    letterSpacing: 0.2,
  },
});

export default GreetingCard;

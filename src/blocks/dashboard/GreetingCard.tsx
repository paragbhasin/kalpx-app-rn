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

const GreetingCard: React.FC<Props> = ({ screenData }) => {
  const sd = screenData ?? {};
  const context: string = sd.greeting_context ?? "";
  const userName: string = sd.user_name ?? "";
  const tone: string = sd.greeting_tone ?? "";

  // Always-visible block. When backend copy is missing, fall back to
  // a neutral structural greeting using the user name so the card
  // still anchors the dashboard top.
  const displayName = userName || "friend";
  const displayContext = context || "You're here. Begin wherever feels right.";

  return (
    <View style={styles.card} accessibilityLabel="greeting_card">
      <View style={styles.leftAccent} />
      <View style={styles.body}>
        <Text style={styles.name}>Welcome, {displayName}.</Text>
        <Text style={styles.context}>{displayContext}</Text>
        {!!tone && <Text style={styles.tone}>{tone}</Text>}
      </View>
      <View style={styles.mandalaWrap} accessibilityElementsHidden>
        <MantraLotus3d width={56} height={56} />
      </View>
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
    fontSize: 14,
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
});

export default GreetingCard;

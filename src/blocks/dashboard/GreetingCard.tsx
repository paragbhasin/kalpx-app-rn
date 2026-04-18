/**
 * GreetingCard — hero card at the top of the new dashboard (M_new_dashboard_greeting).
 *
 * Spec: docs/NEW_DASHBOARD_V1_SPEC.md §2 #1
 *
 * Sovereignty: all user-facing strings come from screenData
 * (greeting_context, user_name, greeting_tone). NO English fallbacks.
 * When the slot is absent the card renders nothing.
 *
 * Visual: gold left-border card on cream background; serif headline
 * with subtitle; right-side Om mandala placeholder uses the existing
 * mantra-lotus-3d SVG (visually doubles as an Om mandala until a
 * dedicated asset ships).
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

  // Sovereignty rule: if backend has not seeded a greeting, render nothing.
  if (!context && !userName && !tone) return null;

  return (
    <View style={styles.card} accessibilityLabel="greeting_card">
      <View style={styles.leftAccent} />
      <View style={styles.body}>
        {!!userName && <Text style={styles.name}>{userName}</Text>}
        {!!context && <Text style={styles.context}>{context}</Text>}
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

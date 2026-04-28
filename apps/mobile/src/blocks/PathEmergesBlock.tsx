/**
 * PathEmergesBlock — Turn 7. Three cards: mantra / sankalp / practice.
 *
 * Web counterpart: kalpx-frontend/src/blocks/PracticeCardBlock.vue + MantraDisplay.vue (triad layout).
 * Spec: docs/specs/mitra-v3-experience/screens/route_welcome_onboarding.md §1 Turn 7, §2.
 * Regression cases: REG-015 (cards are display-only — no tap action; single "I'm ready" below).
 *
 * Each card shows title + 1-line "why this for you".
 * Data pulled from screenData (set by generate-companion response in Turn 5 handler).
 */

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useScreenStore } from "../engine/useScreenBridge";
import { Fonts } from "../theme/fonts";

const DEEP_BROWN = "#432104";

interface Item {
  kind: "mantra" | "sankalp" | "practice";
  title_key: string;
  why_key: string;
  line_key?: string;
}

const ITEMS: Item[] = [
  {
    kind: "mantra",
    title_key: "companion_mantra_title",
    why_key: "companion_mantra_one_line",
  },
  {
    kind: "sankalp",
    title_key: "companion_sankalp_line",
    line_key: "companion_sankalp_line",
    why_key: "companion_sankalp_one_line",
  },
  {
    kind: "practice",
    title_key: "companion_practice_title",
    why_key: "companion_practice_one_line",
  },
];

const LABELS: Record<string, string> = {
  mantra: "Your mantra",
  sankalp: "Your intention",
  practice: "Your practice",
};

const CARD_THEME: Record<
  Item["kind"],
  { accent: string; bg: string; border: string }
> = {
  mantra: {
    accent: "#5E8D55",
    bg: "rgba(244, 250, 241, 0.95)",
    border: "rgba(207, 224, 199, 0.95)",
  },
  sankalp: {
    accent: "#8168AA",
    bg: "rgba(249, 246, 255, 0.95)",
    border: "rgba(215, 204, 236, 0.95)",
  },
  practice: {
    accent: "#C08F2C",
    bg: "rgba(255, 250, 242, 0.95)",
    border: "rgba(233, 214, 181, 0.95)",
  },
};

// ─── Theme Icon ───────────────────────────────────────────────────────────────

const ThemeIcon: React.FC<{ kind: Item["kind"]; accent: string }> = ({
  kind,
  accent,
}) => {
  const iconStyle = { fontSize: 18, color: accent, lineHeight: 22 };
  if (kind === "mantra") return <Text style={iconStyle}>ॐ</Text>;
  if (kind === "sankalp") return <Text style={iconStyle}>♡</Text>;
  if (kind === "practice") return <Text style={iconStyle}>🧘</Text>;
  return null;
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  block: any;
}

const PathEmergesBlock: React.FC<Props> = () => {
  const { screenData } = useScreenStore();

  return (
    <View style={styles.wrap}>
      {!!screenData.v3_start_failed && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>
            Something went wrong. Please try again.
          </Text>
        </View>
      )}

      {ITEMS.map((it) => {
        const theme = CARD_THEME[it.kind];
        const title =
          it.kind === "sankalp"
            ? `'${String(screenData[it.title_key] || "").trim()}'`
            : String(screenData[it.title_key] || "—");
        const why = String(screenData[it.why_key] || "");

        return (
          <View
            key={it.kind}
            style={[
              styles.card,
              { backgroundColor: theme.bg, borderColor: theme.border },
            ]}
          >
            <View style={styles.cardRow}>
              <View
                style={[
                  styles.iconCircle,
                  { borderColor: `${theme.accent}33` },
                ]}
              >
                <ThemeIcon kind={it.kind} accent={theme.accent} />
              </View>

              <View style={styles.textWrap}>
                <Text style={[styles.label, { color: theme.accent }]}>
                  {LABELS[it.kind].toUpperCase()}
                </Text>
                <Text style={styles.title}>{title}</Text>
                {!!why && (
                  <Text
                    style={[
                      styles.why,
                      it.kind === "sankalp" ? styles.whyPurple : null,
                    ]}
                  >
                    {why}
                  </Text>
                )}
              </View>

              <Ionicons name="chevron-forward" size={20} color={theme.accent} />
            </View>
          </View>
        );
      })}

      <View style={styles.footerDivider}>
        <View style={styles.footerLine} />
        <Text style={styles.footerLotus}>
          <Image
            source={require("../../assets/lotus_icon.png")}
            style={styles.lotusIcon}
          />
        </Text>
        <View style={styles.footerLine} />
      </View>

      <Text style={styles.footer}>
        This isn't homework. It's sadhana — a daily practice that builds
        something real over time.
      </Text>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrap: { marginTop: 8, marginBottom: 12 },
  card: {
    borderRadius: 26,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 14,
    position: "relative",
    overflow: "hidden",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 52,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
    marginRight: 16,
  },
  lotusIcon: {
    width: 20,
    height: 16,
    marginHorizontal: 12,

    opacity: 0.6,
  },
  textWrap: {
    flex: 1,
    paddingRight: 8,
  },
  label: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 13,
    letterSpacing: 3.2,
    marginBottom: 8,
  },
  title: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    lineHeight: 25,
    color: DEEP_BROWN,
    marginBottom: 4,
  },
  why: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    lineHeight: 22,
    color: "#5D5B58",
    marginTop: 2,
  },
  whyPurple: {
    color: "#6F6190",
  },
  mantraDivider: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    width: 150,
  },
  mantraLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(199, 154, 43, 0.55)",
    marginHorizontal: 6,
  },
  mantraDiamond: {
    fontSize: 11,
    color: "#C79A2B",
    lineHeight: 14,
  },
  footerDivider: {
    marginTop: 4,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerLine: {
    height: 1,
    width: 130,
    backgroundColor: "rgba(199, 154, 43, 0.55)",
    marginHorizontal: 10,
  },
  footerLotus: {
    fontSize: 10,
  },
  footer: {
    fontFamily: Fonts.serif.regular,
    fontSize: 17,
    lineHeight: 30,
    color: DEEP_BROWN,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  errorBanner: {
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#e6a817",
  },
  errorText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#7a5c00",
    lineHeight: 20,
  },
});

export default PathEmergesBlock;

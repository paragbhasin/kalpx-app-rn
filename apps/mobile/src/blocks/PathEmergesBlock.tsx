/**
 * PathEmergesBlock — Turn 8 triad reveal.
 *
 * Mirrors the web PathEmergesBlock behavior:
 *   - triad cards are tappable and open read-only info surfaces
 *   - "Why these were chosen" is rendered as a separate expandable card
 *   - per-card 1-line reasons are not shown inline on the triad cards
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { rfs, TABLET_MAX_CARD_WIDTH } from "../utils/responsive";
import { executeAction } from "../engine/actionExecutor";
import { useScreenStore } from "../engine/useScreenBridge";
import appStore from "../store";
import { screenActions } from "../store/screenSlice";
import { Fonts } from "../theme/fonts";

const DEEP_BROWN = "#432104";

type Kind = "mantra" | "sankalp" | "practice";

interface CardDef {
  kind: Kind;
  titleKey: string;
  whyKey: string;
}

const CARDS: CardDef[] = [
  {
    kind: "mantra",
    titleKey: "companion_mantra_title",
    whyKey: "companion_mantra_one_line",
  },
  {
    kind: "sankalp",
    titleKey: "companion_sankalp_line",
    whyKey: "companion_sankalp_one_line",
  },
  {
    kind: "practice",
    titleKey: "companion_practice_title",
    whyKey: "companion_practice_one_line",
  },
];

const LABELS: Record<Kind, string> = {
  mantra: "Your mantra",
  sankalp: "Your intention",
  practice: "Your practice",
};

const THEME: Record<Kind, { accent: string; bg: string; border: string }> = {
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

const ThemeIcon: React.FC<{ kind: Kind; accent: string }> = ({
  kind,
  accent,
}) => {
  const iconStyle = { fontSize: 18, color: accent, lineHeight: 22 };
  if (kind === "mantra") return <Text style={iconStyle}>ॐ</Text>;
  if (kind === "sankalp") return <Text style={iconStyle}>♡</Text>;
  return <Text style={iconStyle}>🧘</Text>;
};

function getShift(context: any): string {
  return context?.target_shift || context?.mitra_shift || "";
}

function sentence(value: string | null | undefined, fallback = ""): string {
  const text = String(value || fallback).trim();
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

interface Props {
  block: any;
}

const PathEmergesBlock: React.FC<Props> = () => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [whyOpen, setWhyOpen] = useState(false);
  const triad = screenData.onboarding_triad_data?.triad || {};

  const whyTabs = CARDS.filter((card) => {
    const item = triad[card.kind] || {};
    const context = item.context || {};
    return !!(
      item.title ||
      context.mitra_frame_through ||
      getShift(context) ||
      context.mitra_use_for ||
      context.commentary_lineage
    );
  });

  const [activeWhyTab, setActiveWhyTab] = useState<Kind>(
    whyTabs[0]?.kind || "mantra",
  );

  const activeWhyKind = whyTabs.some((tab) => tab.kind === activeWhyTab)
    ? activeWhyTab
    : (whyTabs[0]?.kind ?? "mantra");
  const activeWhyItem = triad[activeWhyKind] || {};
  const activeWhyContext = activeWhyItem.context || {};
  const activeShift = getShift(activeWhyContext);

  const handleViewInfo = (kind: Kind, manualData: any) => {
    executeAction(
      {
        type: "view_info",
        payload: {
          type: kind,
          manualData,
          read_only: true,
          back_label: "Back",
          back_target: {
            container_id: "welcome_onboarding",
            state_id: "turn_8",
          },
        },
        currentScreen,
      },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          appStore.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: { ...screenData },
      },
    );
  };

  return (
    <View style={[styles.wrap, isTablet && { maxWidth: TABLET_MAX_CARD_WIDTH, alignSelf: 'center', width: '100%' }]}>
      {!!screenData.v3_start_failed && (
        <View style={styles.errorBanner}>
          <Text style={[styles.errorText, { fontSize: rfs(14, width) }]}>
            Something went wrong. Please try again.
          </Text>
        </View>
      )}

      {CARDS.map((card) => {
        const theme = THEME[card.kind];
        const triadItem = triad[card.kind] || {};
        const rawTitle = triadItem.title || screenData[card.titleKey] || "";
        if (!rawTitle) return null;
        const title =
          card.kind === "sankalp" ? `'${String(rawTitle).trim()}'` : rawTitle;

        return (
          <TouchableOpacity
            key={card.kind}
            activeOpacity={0.84}
            onPress={() => handleViewInfo(card.kind, triadItem)}
            style={[
              styles.card,
              { backgroundColor: theme.bg, borderColor: theme.border },
              isTablet && { paddingHorizontal: 24, paddingVertical: 22, marginBottom: 18 },
            ]}
            testID={`triad-${card.kind}`}
            accessibilityLabel={`triad-${card.kind}`}
          >
            <View style={styles.cardRow}>
              <View
                style={[
                  styles.iconCircle,
                  { borderColor: `${theme.accent}33` },
                  isTablet && { width: 48, height: 48, borderRadius: 24 },
                ]}
              >
                <ThemeIcon kind={card.kind} accent={theme.accent} />
              </View>

              <View style={styles.textWrap}>
                <Text style={[styles.label, { color: theme.accent, fontSize: rfs(13, width) }]}>
                  {LABELS[card.kind].toUpperCase()}
                </Text>
                <Text style={[styles.title, { fontSize: rfs(18, width) }]}>{title}</Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={isTablet ? 24 : 20}
                color={theme.accent}
              />
            </View>
          </TouchableOpacity>
        );
      })}

      <View style={styles.footerDivider}>
        <View style={styles.footerLine} />
        <Image
          source={require("../../assets/lotus_icon.png")}
          style={styles.lotusIcon}
        />
        <View style={styles.footerLine} />
      </View>

      {whyTabs.length > 0 && (
        <View style={styles.whyCard}>
          <TouchableOpacity
            activeOpacity={0.86}
            onPress={() => {
              if (!whyOpen && !whyTabs.some((tab) => tab.kind === activeWhyKind)) {
                setActiveWhyTab(whyTabs[0].kind);
              }
              setWhyOpen((value) => !value);
            }}
            style={styles.whyHeader}
          >
            <View style={styles.whyLotusCircle}>
              <Image
                source={require("../../assets/lotus_icon.png")}
                style={styles.whyLotusIcon}
              />
            </View>
            <View style={styles.whyHeaderTextWrap}>
              <Text style={[styles.whyHeaderTitle, { fontSize: rfs(18, width) }]}>Why these were chosen</Text>
              {!whyOpen && (
                <Text style={[styles.whyHeaderSubtitle, { fontSize: rfs(14, width) }]}>
                  Understand why Mitra selected this mantra, sankalp, and
                  practice.
                </Text>
              )}
            </View>
            <Ionicons
              name={whyOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color="#A89068"
            />
          </TouchableOpacity>

          {whyOpen && (
            <View style={styles.whyBody}>
              <View style={styles.whyBodyHeader}>
                <Text style={[styles.whyEyebrow, { fontSize: rfs(11, width) }]}>Chosen with care</Text>
                <Text style={[styles.whyBodyTitle, { fontSize: rfs(18, width) }]}>Why this supports today</Text>
              </View>

              <View style={styles.tabRow}>
                {whyTabs.map((tab) => {
                  const selected = activeWhyKind === tab.kind;
                  return (
                    <TouchableOpacity
                      key={tab.kind}
                      activeOpacity={0.85}
                      onPress={() => setActiveWhyTab(tab.kind)}
                      style={[
                        styles.tabChip,
                        selected && {
                          borderColor: THEME[tab.kind].accent,
                          backgroundColor: THEME[tab.kind].bg,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tabChipText,
                          {
                            color: selected
                              ? THEME[tab.kind].accent
                              : "#7A6A58",
                            fontSize: rfs(11, width),
                          },
                        ]}
                      >
                        {tab.kind === "sankalp"
                          ? "Sankalp"
                          : tab.kind === "mantra"
                            ? "Mantra"
                            : "Practice"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.whyDetail}>
                <Text
                  style={[
                    styles.whyDetailLabel,
                    { color: THEME[activeWhyKind].accent, fontSize: rfs(11, width) },
                  ]}
                >
                  {activeWhyKind === "sankalp"
                    ? "Sankalp"
                    : activeWhyKind === "mantra"
                      ? "Mantra"
                      : "Practice"}
                </Text>
                <Text style={[styles.whyDetailTitle, { fontSize: rfs(18, width) }]}>
                  {activeWhyKind === "sankalp"
                    ? activeWhyItem.title || ""
                    : `${activeWhyItem.title || ""}`}
                </Text>

                {!!activeWhyContext.mitra_frame_through && (
                  <View style={styles.primaryReasonCard}>
                    <Text style={[styles.reasonLabel, { fontSize: rfs(11, width) }]}>Essence</Text>
                    <Text style={[styles.reasonBody, { fontSize: rfs(15, width) }]}>
                      {sentence(
                        activeWhyKind === "sankalp"
                          ? `This is ${activeWhyContext.mitra_frame_through}`
                          : `${activeWhyItem.title || "This"} is ${activeWhyContext.mitra_frame_through}`,
                      )}
                    </Text>
                  </View>
                )}

                {!!activeShift && (
                  <View style={styles.primaryReasonCard}>
                    <Text style={[styles.reasonLabel, { fontSize: rfs(11, width) }]}>Shift</Text>
                    <Text style={[styles.reasonBody, { fontSize: rfs(15, width) }]}>
                      {sentence(
                        `Mitra chose this to guide you from ${activeShift}`,
                      )}
                    </Text>
                  </View>
                )}

                <View style={styles.secondaryReasonGrid}>
                  {!!activeWhyContext.mitra_use_for && (
                    <View style={styles.secondaryReasonCard}>
                      <Text style={[styles.reasonLabel, { fontSize: rfs(11, width) }]}>Useful for</Text>
                      <Text style={[styles.reasonBody, { fontSize: rfs(15, width) }]}>
                        {sentence(activeWhyContext.mitra_use_for)}
                      </Text>
                    </View>
                  )}

                  {!!activeWhyContext.commentary_lineage && (
                    <View style={styles.secondaryReasonCard}>
                      <Text style={[styles.reasonLabel, { fontSize: rfs(11, width) }]}>Rooted in</Text>
                      <Text style={[styles.reasonBody, { fontSize: rfs(15, width) }]}>
                        {sentence(activeWhyContext.commentary_lineage)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      <View style={styles.footerDividerBottom}>
        <View style={styles.footerLine} />
        <Image
          source={require("../../assets/lotus_icon.png")}
          style={styles.lotusIcon}
        />
        <View style={styles.footerLine} />
      </View>

      <Text style={[styles.footer, { fontSize: rfs(17, width) }]}>
        This isn&apos;t homework. It&apos;s sadhana — a daily practice that
        builds something real over time.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginTop: 8, marginBottom: 12 },
  card: {
    borderRadius: 26,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 14,
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
  },
  footerDivider: {
    marginTop: 4,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerDividerBottom: {
    marginTop: 12,
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
  lotusIcon: {
    width: 20,
    height: 16,
    opacity: 0.7,
  },
  whyCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(226, 208, 174, 0.9)",
    backgroundColor: "rgba(255, 249, 240, 0.97)",
    overflow: "hidden",
  },
  whyHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  whyLotusCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(250, 244, 229, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(226, 208, 174, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  whyLotusIcon: {
    width: 20,
    height: 16,
    opacity: 0.8,
  },
  whyHeaderTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  whyHeaderTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    lineHeight: 24,
    color: DEEP_BROWN,
  },
  whyHeaderSubtitle: {
    marginTop: 6,
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    lineHeight: 21,
    color: "#6B6257",
  },
  whyBody: {
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  whyBodyHeader: {
    marginBottom: 18,
  },
  whyEyebrow: {
    marginBottom: 3,
    fontFamily: Fonts.sans.bold,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: "#B38722",
  },
  whyBodyTitle: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    lineHeight: 22,
    color: DEEP_BROWN,
  },
  tabRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  tabChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(214,183,130,0.42)",
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  tabChipText: {
    fontFamily: Fonts.sans.bold,
    fontSize: 11,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  whyDetail: {
    borderTopWidth: 1,
    borderTopColor: "rgba(214,183,130,0.28)",
    paddingTop: 20,
  },
  whyDetailLabel: {
    marginBottom: 8,
    fontFamily: Fonts.sans.bold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  whyDetailTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    lineHeight: 22,
    color: DEEP_BROWN,
    marginBottom: 18,
  },
  primaryReasonCard: {
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "rgba(230, 214, 186, 0.9)",
  },
  secondaryReasonGrid: {
    gap: 12,
  },
  secondaryReasonCard: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.64)",
    borderWidth: 1,
    borderColor: "rgba(230, 214, 186, 0.86)",
  },
  reasonLabel: {
    marginBottom: 8,
    fontFamily: Fonts.sans.bold,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: "#A57A2B",
  },
  reasonBody: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    lineHeight: 25,
    color: "#5D5348",
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

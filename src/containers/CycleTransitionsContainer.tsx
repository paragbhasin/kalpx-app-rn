import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import BlockRenderer from "../engine/BlockRenderer";
import { useScreenStore } from "../engine/useScreenBridge";
import { interpolate } from "../engine/utils/interpolation";
import { Fonts } from "../theme/fonts";

// SVGs
import { SvgUri } from "react-native-svg";
import MantraLotus3d from "../../assets/mantra-lotus-3d.svg";

const { width } = Dimensions.get("window");

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CycleTransitionsContainerProps {
  schema: any;
}

type ActivityType = "mantra" | "sankalp" | "practice" | null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const hasContent = (val: any): boolean => {
  if (!val) return false;
  if (typeof val === "string") return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === "object") return Object.keys(val).length > 0;
  return true;
};

// ---------------------------------------------------------------------------
// Collapsible Card sub-component
// ---------------------------------------------------------------------------

interface CollapsibleCardProps {
  label: string;
  children: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
}

const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  label,
  children,
  expanded,
  onToggle,
}) => (
  <TouchableOpacity
    style={[styles.card, expanded && styles.cardExpanded]}
    onPress={() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      onToggle();
    }}
    activeOpacity={0.8}
  >
    <View style={styles.cardHeader}>
      <View style={styles.dividerLine} />
      <View style={styles.headerLabelGroup}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.toggleIcon}>{expanded ? "\u25B2" : "\u25BC"}</Text>
      </View>
      <View style={styles.dividerLine} />
    </View>
    {expanded && <View style={styles.cardContent}>{children}</View>}
  </TouchableOpacity>
);

// ---------------------------------------------------------------------------
// Section Header (non-collapsible)
// ---------------------------------------------------------------------------

interface SectionHeaderProps {
  label: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ label }) => (
  <View style={styles.cardHeader}>
    <View style={styles.dividerLineThin} />
    <Text style={styles.cardLabelSmall}>{label}</Text>
    <View style={styles.dividerLineThin} />
  </View>
);

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const CycleTransitionsContainer: React.FC<CycleTransitionsContainerProps> = ({
  schema,
}) => {
  const {
    updateBackground,
    updateHeaderHidden,
    screenData,
    currentStateId,
    loadScreen,
  } = useScreenStore();

  // Expand/collapse state
  const [meaningExpanded, setMeaningExpanded] = useState(false);
  const [benefitsExpanded, setBenefitsExpanded] = useState(false);
  const [essenceExpanded, setEssenceExpanded] = useState(false);
  const [mantraExpanded, setMantraExpanded] = useState(false);

  React.useEffect(() => {
    updateBackground(require("../../assets/beige_bg.png"));
    updateHeaderHidden(false);
    return () => {
      updateBackground(null);
    };
  }, [updateBackground, updateHeaderHidden]);

  const info = useMemo(() => screenData?.info || {}, [screenData]);
  const stateId = currentStateId || "";

  const currentType: ActivityType = useMemo(() => {
    // 1. Check direct info.type
    if (info?.type) {
      const t = info.type.toLowerCase();
      if (t === "mantra") return "mantra";
      if (t === "sankalp" || t === "sankalpa") return "sankalp";
      if (t === "practice") return "practice";
    }

    // 2. Check screenData flags
    if (screenData?.info_is_mantra) return "mantra";
    if (screenData?.info_is_sankalp) return "sankalp";
    if (screenData?.info_is_practice) return "practice";

    return null;
  }, [screenData, info]);

  const isInfoScreen = useMemo(
    () =>
      (stateId === "info_reveal" ||
        stateId === "offering_reveal" ||
        stateId === "view_info" ||
        stateId === "daily_insight") &&
      currentType !== null,
    [stateId, currentType],
  );

  const blocks = schema?.blocks || [];
  const footerBlocks = useMemo(
    () =>
      blocks.filter(
        (b: any) => b.position === "footer" || b.position === "footer_actions",
      ),
    [blocks],
  );
  const visibleFooterBlocks = useMemo(
    () =>
      footerBlocks.filter((block: any) => {
        if (block.hide_condition) {
          const hideVal = screenData?.[block.hide_condition];
          if (hideVal === true || (hideVal && hideVal !== false)) return false;
        }

        if (block.visibility_condition) {
          const value = screenData?.[block.visibility_condition];
          const isVisible = Array.isArray(value)
            ? value.length > 0
            : typeof value === "boolean"
              ? value
              : !!value;
          if (!isVisible) return false;
        }

        const resolvedBlock = interpolate(block, screenData);
        const hasRenderableContent =
          hasContent(resolvedBlock.content) ||
          hasContent(resolvedBlock.label) ||
          hasContent(resolvedBlock.subtext) ||
          !!resolvedBlock.action;

        if (
          (resolvedBlock.type === "subtext" ||
            resolvedBlock.type === "primary_button") &&
          !hasRenderableContent
        ) {
          return false;
        }

        return true;
      }),
    [footerBlocks, screenData],
  );

  const handleBack = () => {
    const target = screenData.info_back_target;
    if (target) {
      loadScreen({
        container_id: target.container_id || target.id,
        state_id: target.state_id || target.id,
      });
    } else {
      loadScreen({
        container_id: "companion_dashboard",
        state_id: "day_active",
      });
    }
  };

  if (isInfoScreen) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.infoScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Practice Visual (Lotus) */}
          <View style={styles.visualContainer}>
            {typeof MantraLotus3d === "number" ? (
              <SvgUri
                uri={Image.resolveAssetSource(MantraLotus3d)?.uri ?? null}
                width={180}
                height={180}
              />
            ) : (
              <MantraLotus3d width={180} height={180} />
            )}

            {currentType === "sankalp" && (
              <Text style={styles.sankalpMainText}>
                {info.meaning || info.summary}
              </Text>
            )}

            {currentType === "mantra" && (
              <View style={styles.mantraMainContainer}>
                {/* 1. Title (Deity) */}
                {info.title && (
                  <Text style={styles.deityTitle}>{info.title}</Text>
                )}
                {(info.full_mantra || info.subtitle) && (
                  <Text
                    style={styles.mantraDevanagariLarge}
                    numberOfLines={mantraExpanded ? 0 : 2}
                    ellipsizeMode="tail"
                  >
                    {info.full_mantra || info.subtitle}
                  </Text>
                )}

                {/* 2. IAST Section (2 lines limit) */}
                {info.iast && (
                  <Text
                    style={styles.mantraIAST}
                    numberOfLines={mantraExpanded ? 0 : 2}
                    ellipsizeMode="tail"
                  >
                    {info.iast || info.title}
                  </Text>
                )}

                <TouchableOpacity
                  style={styles.viewFullMantraBtn}
                  onPress={() => setMantraExpanded(!mantraExpanded)}
                >
                  <Text style={styles.viewFullMantraText}>
                    {mantraExpanded
                      ? "Tap to collapse "
                      : "Tap to view full mantra \u2192"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {currentType === "practice" && (
              <Text style={styles.deityTitle}>{info.title}</Text>
            )}
          </View>

          {/* Main Content Card */}
          {(currentType === "practice" || currentType === "sankalp") && (
            <View style={styles.mainCard}>
              {currentType === "practice" &&
                info.steps &&
                info.steps.length > 0 && (
                  <>
                    <SectionHeader label="What this practice asks of you" />
                    <View style={styles.practiceStepsList}>
                      {info.steps.map((step: string, i: number) => (
                        <View key={i} style={styles.practiceStep}>
                          <Text style={styles.stepNum}>{i + 1}.</Text>
                          <Text style={styles.stepText}>{step}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}

              {currentType === "sankalp" && (
                <>
                  <SectionHeader label="How To Live" />
                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.howToLiveText}>
                      {info.how_to_live ||
                        "Stay mindful and carry this intention with every breath."}
                    </Text>
                  </View>
                </>
              )}
            </View>
          )}

          {/* Prompt / Action Text */}
          <Text style={styles.practicePrompt}>
            {currentType === "mantra"
              ? "Chant slowly and let the meaning settle within."
              : currentType === "sankalp"
                ? "Carry this intention gently into your thoughts and actions."
                : "Begin when you feel ready. This takes 2-3 minutes. There is no rush."}
          </Text>

          {/* Actions */}
          {visibleFooterBlocks.length > 0 && (
            <View style={styles.infoActions}>
              {visibleFooterBlocks.map((block: any, i: number) => {
                const resolvedBlock = { ...block };
                if (resolvedBlock.type === "primary_button") {
                  if (currentType === "mantra")
                    resolvedBlock.label = "Begin Chanting";
                  else if (currentType === "sankalp")
                    resolvedBlock.label = "I Embody This";
                  else if (currentType === "practice")
                    resolvedBlock.label = "Begin Practice";
                }
                return <BlockRenderer key={`f-${i}`} block={resolvedBlock} />;
              })}
            </View>
          )}

          {/* Accordion Sections */}
          <View style={styles.collapsibleSections}>
            {/* Consolidated Meaning Section for Practices and Mantras */}
            {currentType !== "sankalp" &&
              ((currentType === "practice" && hasContent(info.summary)) ||
                (currentType === "mantra" &&
                  (hasContent(info.meaning) || hasContent(info.summary)))) && (
                <CollapsibleCard
                  label="Meaning"
                  expanded={meaningExpanded}
                  onToggle={() => setMeaningExpanded(!meaningExpanded)}
                >
                  <Text style={styles.cardText}>
                    {currentType === "practice"
                      ? info.summary
                      : info.meaning || info.summary}
                  </Text>
                </CollapsibleCard>
              )}

            {currentType === "sankalp" && (
              <>
                <CollapsibleCard
                  label="Meaning"
                  expanded={meaningExpanded}
                  onToggle={() => setMeaningExpanded(!meaningExpanded)}
                >
                  <Text style={styles.cardText}>
                    {info.essence || info.summary}
                  </Text>
                </CollapsibleCard>
                <CollapsibleCard
                  label="Benefits"
                  expanded={benefitsExpanded}
                  onToggle={() => setBenefitsExpanded(!benefitsExpanded)}
                >
                  <Text style={styles.cardText}>
                    Focus and calm are cultivated through this intention.
                  </Text>
                </CollapsibleCard>
              </>
            )}

            {currentType === "mantra" && (
              <CollapsibleCard
                label="Essence"
                expanded={essenceExpanded}
                onToggle={() => setEssenceExpanded(!essenceExpanded)}
              >
                <Text style={styles.cardText}>
                  {info.essence ||
                    info.insight ||
                    "The vibration of this mantra connects you with profound spiritual wisdom."}
                </Text>
              </CollapsibleCard>
            )}

            {currentType === "practice" && (
              <>
                {hasContent(info.benefits) && (
                  <CollapsibleCard
                    label="Benefits"
                    expanded={benefitsExpanded}
                    onToggle={() => setBenefitsExpanded(!benefitsExpanded)}
                  >
                    {Array.isArray(info.benefits) ? (
                      <View style={styles.benefitList}>
                        {info.benefits.map((b: string, idx: number) => (
                          <Text key={idx} style={styles.benefitItem}>
                            {"\u2022"} {b}
                          </Text>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.cardText}>{info.benefits}</Text>
                    )}
                  </CollapsibleCard>
                )}

                {hasContent(info.essence || info.insight) && (
                  <CollapsibleCard
                    label="Why this works"
                    expanded={essenceExpanded}
                    onToggle={() => setEssenceExpanded(!essenceExpanded)}
                  >
                    <Text style={styles.cardText}>
                      {info.essence || info.insight}
                    </Text>
                  </CollapsibleCard>
                )}
              </>
            )}
          </View>


          <TouchableOpacity onPress={handleBack} style={styles.backLink}>
            <Text style={styles.backLinkText}>Back</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Generic Transition Mode
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {blocks.map((block: any, i: number) => (
            <BlockRenderer key={`c-${i}`} block={block} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const GOLD = "#D4A017";
const BROWN = "#432104";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scroll: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  infoScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 60,
    alignItems: "center",
  },
  visualContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  deityTitle: {
    fontSize: 26,
    fontFamily: Fonts.serif.bold,
    color: BROWN,
    textAlign: "center",
    marginTop: 20,
  },
  mainCard: {
    width: "100%",
    // backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E8C587",
    padding: 20,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E8C587",
    opacity: 0.6,
  },
  dividerLineThin: {
    width: 20,
    height: 1,
    backgroundColor: "#E8C587",
    opacity: 0.6,
  },
  cardLabel: {
    fontSize: 18,
    fontFamily: Fonts.serif.bold,
    color: BROWN,
    marginHorizontal: 12,
  },
  cardLabelSmall: {
    fontSize: 18,
    fontFamily: Fonts.serif.bold,
    color: BROWN,
    marginHorizontal: 10,
  },
  headerLabelGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleIcon: {
    fontSize: 12,
    color: GOLD,
    marginLeft: 4,
  },
  collapsibleSections: {
    width: "100%",
    gap: 12,
    marginBottom: 30,
  },
  card: {
    width: "100%",
    // backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E8C587",
    padding: 16,
  },
  cardExpanded: {
    // backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  cardContent: {
    marginTop: 12,
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#5a3c21",
    fontFamily: Fonts.serif.regular,
    textAlign: "center",
  },
  practiceStepsList: {
    marginTop: 16,
    gap: 12,
  },
  practiceStep: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepNum: {
    fontSize: 18,
    fontFamily: Fonts.serif.bold,
    color: BROWN,
    marginRight: 8,
    width: 24,
  },
  stepText: {
    flex: 1,
    fontSize: 17,
    lineHeight: 24,
    color: BROWN,
    fontFamily: Fonts.serif.regular,
  },
  howToLiveText: {
    fontSize: 18,
    fontFamily: Fonts.serif.regular,
    fontStyle: "italic",
    color: "#4A4A4A",
    lineHeight: 28,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  sankalpMainText: {
    fontSize: 24,
    fontFamily: Fonts.serif.bold,
    color: "#432104",
    textAlign: "center",
    lineHeight: 34,
    marginTop: -30,
    paddingHorizontal: 5,
  },
  mantraMainContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: -65,

    paddingHorizontal: 5,
  },
  mantraDevanagariLarge: {
    fontSize: 18,
    fontFamily: Fonts.serif.bold,
    color: "#432104",
    textAlign: "center",
    // marginBottom: 8,
  },
  mantraIAST: {
    fontSize: 20,
    fontFamily: Fonts.serif.bold,
    fontStyle: "italic",
    color: "#432104",
    textAlign: "center",
    marginBottom: 5,
    marginTop: -24,
  },
  mantraBrief: {
    fontSize: 16,
    fontFamily: Fonts.serif.regular,
    color: "#432104",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 10,
  },
  viewFullMantraBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "#E8C587",
    // backgroundColor: "rgba(255, 255, 255, 0.5)",
    shadowColor: "#d7a64a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  viewFullMantraText: {
    fontSize: 15,
    fontFamily: Fonts.serif.bold,
    color: "#432104",
  },
  deityMetadata: {
    fontSize: 18,
    fontFamily: Fonts.serif.regular,
    color: "#432104",
    textAlign: "center",
    // marginTop: 24,
    marginBottom: 10,
  },
  practicePrompt: {
    fontSize: 16,
    fontFamily: Fonts.serif.regular,
    fontStyle: "italic",
    color: "#432104",
    textAlign: "center",
    marginTop: 3,
    marginBottom: 10,
    lineHeight: 24,
    paddingHorizontal: 30,
  },
  infoActions: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  benefitList: {
    gap: 4,
  },
  benefitItem: {
    fontSize: 16,
    lineHeight: 24,
    color: "#5a3c21",
    fontFamily: Fonts.serif.regular,
  },
  backLink: {
    // marginTop: 2,
    paddingVertical: 1,
  },
  backLinkText: {
    fontSize: 16,
    fontFamily: Fonts.serif.regular,
    color: BROWN,
    textDecorationLine: "underline",
  },
  content: {
    gap: 20,
  },
});

export default CycleTransitionsContainer;

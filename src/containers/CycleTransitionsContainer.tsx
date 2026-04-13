import { ChevronDown, ChevronUp } from "lucide-react-native";
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
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";
import RudrakshSvg from "../../assets/rudraksh.svg";
import AudioPlayerBlock from "../blocks/AudioPlayerBlock";
import BlockRenderer from "../engine/BlockRenderer";
import { executeAction } from "../engine/actionExecutor";
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
// Constants
// ---------------------------------------------------------------------------

const MAX_VISUAL_BEADS = 18;

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
// Mantra Text Card sub-component
// ---------------------------------------------------------------------------

interface MantraTextCardProps {
  text: string;
  isDevanagari?: boolean;
  expanded: boolean;
  onToggle: () => void;
}

const MantraTextCard: React.FC<MantraTextCardProps> = ({
  text,
  isDevanagari,
  expanded,
  onToggle,
}) => {
  const [showToggle, setShowToggle] = React.useState(false);

  return (
    <TouchableOpacity
      style={[styles.card, expanded && styles.cardExpanded, { padding: 12 }]}
      onPress={() => {
        if (showToggle) {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          onToggle();
        }
      }}
      activeOpacity={0.8}
    >
      <View style={styles.textCardHeader}>
        <Text
          style={[
            styles.textCardHeaderContent,
            isDevanagari && {
              fontSize: 20,
              fontFamily: "NotoSansDevanagari_500Medium",
            },
          ]}
          numberOfLines={expanded ? undefined : 2}
          onTextLayout={(e) => {
            const lines = e.nativeEvent.lines.length;
            if (lines > 2) {
              setShowToggle(true);
            }
          }}
        >
          {text}
        </Text>
      </View>

      {showToggle && (
        <View style={styles.toggleIcon}>
          {expanded ? (
            <ChevronUp size={18} color="#B89450" />
          ) : (
            <ChevronDown size={18} color="#B89450" />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

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
    updateScreenData,
    goBack,
  } = useScreenStore();

  // Expand/collapse state
  const [meaningExpanded, setMeaningExpanded] = useState(false);
  const [benefitsExpanded, setBenefitsExpanded] = useState(false);
  const [essenceExpanded, setEssenceExpanded] = useState(false);
  const [iastExpanded, setIastExpanded] = useState(false);
  const [devanagariExpanded, setDevanagariExpanded] = useState(false);
  const [isMantraTruncatable, setIsMantraTruncatable] = useState(false);

  // Mantra Practice State
  const [chantCount, setChantCount] = useState(0);
  const [selectedTarget, setSelectedTarget] = useState(
    Number(screenData.reps_total) || 27,
  );
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());

  // Reanimated values for Mala
  const rotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);

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
    if (
      screenData?.info_is_mantra ||
      screenData?.runner_active_item?.type === "mantra"
    )
      return "mantra";
    if (screenData?.info_is_sankalp) return "sankalp";
    if (screenData?.info_is_practice) return "practice";

    return null;
  }, [screenData, info]);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 40000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );

    pulseScale.value = withRepeat(
      withTiming(1.05, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [rotation, pulseScale]);

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedCenterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const visualBeadsCount = Math.min(selectedTarget, MAX_VISUAL_BEADS);

  const beads = useMemo(() => {
    const arr = [];
    const count = visualBeadsCount;
    const radius = 90;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      arr.push({
        x: Math.cos(angle) * (radius + 10),
        y: Math.sin(angle) * (radius + 10),
        index: i,
      });
    }
    return arr;
  }, [visualBeadsCount]);

  const isBeadTapped = (index: number) => {
    if (selectedTarget > MAX_VISUAL_BEADS) {
      const progressInCycle = chantCount % visualBeadsCount;
      return index < progressInCycle;
    }
    return index < chantCount;
  };

  const isBeadActive = (index: number) => {
    if (selectedTarget > MAX_VISUAL_BEADS) {
      return index === chantCount % visualBeadsCount;
    }
    return index === chantCount;
  };

  const handleIncrement = () => {
    const nextCount = chantCount + 1;
    setChantCount(nextCount);

    if (nextCount >= selectedTarget) {
      // Handle completion
      const completeAction = screenData.info_start_action || {
        type: "navigate",
        target: {
          container_id: "practice_runner",
          state_id: "mantra_complete",
        },
      };

      const durationSeconds = Math.round(
        (Date.now() - sessionStartTime) / 1000,
      );

      // Track engagement properly
      updateScreenData("chant_duration", durationSeconds);
      updateScreenData("mantra_progress_reps", nextCount);
      updateScreenData("reps_done", nextCount);

      setTimeout(() => {
        executeAction(completeAction, {
          loadScreen,
          goBack,
          setScreenValue: (val: any, k: string) => updateScreenData(k, val),
          screenState: { ...screenData },
        });
      }, 800);
    }
  };

  React.useEffect(() => {
    updateBackground(require("../../assets/beige_bg.png"));
    updateHeaderHidden(false);
    return () => {
      updateBackground(null);
    };
  }, [updateBackground, updateHeaderHidden]);

  // Reset truncation state when mantra info changes
  React.useEffect(() => {
    setIsMantraTruncatable(false);
  }, [info]);

  const isInfoScreen = useMemo(
    () =>
      (stateId === "info_reveal" ||
        stateId === "offering_reveal" ||
        stateId === "view_info" ||
        stateId === "daily_insight") &&
      currentType !== null,
    [stateId, currentType],
  );
  const isAckScreen = stateId === "quick_checkin_ack";

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

        // Duplicate-prevention: the info_reveal template already renders
        // the "Chant slowly..." / "Carry this intention..." / practice
        // start help hint as a dedicated practicePrompt Text below the
        // lotus. Filter out those subtexts from the footer list so we
        // don't render them twice.
        if (resolvedBlock.type === "subtext") {
          const content = String(resolvedBlock.content || "").toLowerCase();
          if (
            content.includes("chant slowly and let the meaning settle") ||
            content.includes("carry this intention gently") ||
            content.includes("begin when you feel ready")
          ) {
            return false;
          }
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
          {/* Package for Mantra combined flow */}
          {currentType === "mantra" && (
            <View style={styles.combinedMantraFlow}>
              {/* Top Mantra Cards */}
              <View style={styles.topCardsRow}>
                {info.iast && (
                  <MantraTextCard
                    text={info.iast}
                    expanded={iastExpanded}
                    onToggle={() => setIastExpanded(!iastExpanded)}
                  />
                )}
                <View style={{ height: 5 }} />
                {info.devanagari && (
                  <MantraTextCard
                    text={info.devanagari}
                    isDevanagari
                    expanded={devanagariExpanded}
                    onToggle={() => setDevanagariExpanded(!devanagariExpanded)}
                  />
                )}
              </View>

              {/* Progress Count */}
              <View style={styles.progressCounter}>
                <Text style={styles.currentCountText}>{chantCount}</Text>
                <Text style={styles.totalCountText}> / {selectedTarget}</Text>
              </View>

              {/* Mala beads interaction area */}
              <View style={styles.interactionArea}>
                {/* Glow Background Layer */}
                <View style={styles.glowOuter}>
                  <View style={styles.glowMiddle}>
                    <View style={styles.glowInner} />
                  </View>
                </View>

                <Animated.View style={[styles.beadsRing, animatedRingStyle]}>
                  <View style={styles.ringCircle} />

                  {beads.map((bead) => {
                    const tapped = isBeadTapped(bead.index);
                    const active = isBeadActive(bead.index);
                    return (
                      <View
                        key={bead.index}
                        style={[
                          styles.beadWrapper,
                          {
                            transform: [
                              { translateX: bead.x },
                              { translateY: bead.y },
                              { scale: tapped ? 0.6 : 1 },
                            ],
                            opacity: tapped ? 0.2 : 1,
                          },
                        ]}
                      >
                        <TouchableOpacity
                          onPress={handleIncrement}
                          disabled={tapped}
                          style={styles.beadInner}
                          activeOpacity={1}
                        >
                          <RudrakshSvg width={30} height={30} />
                          {active && <View style={styles.beadPointer} />}
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </Animated.View>

                <Animated.View
                  style={[styles.centerTapTarget, animatedCenterStyle]}
                >
                  <TouchableOpacity
                    style={styles.tapTouchable}
                    onPress={handleIncrement}
                    activeOpacity={0.8}
                  >
                    <View style={styles.tapContent}>
                      <Text style={styles.tapText}>TAP</Text>
                      <Text style={styles.subTap}>HERE</Text>
                      <View style={styles.tapCheck}>
                        <Svg
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <Circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="#B89450"
                            strokeWidth="1"
                          />
                          <Path
                            d="M8 12L11 15L16 9"
                            stroke="#B89450"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              </View>
              <Text style={styles.combinedHelpText}>
                Choose your chant count and tap the bead after each mantra.
              </Text>
              {/* Rep Selection Pills */}
              <View style={styles.repPillsContainer}>
                {[1, 9, 27, 54, 108].map((option) => {
                  const isSelected = option === selectedTarget;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.repPill,
                        isSelected && styles.repPillSelected,
                      ]}
                      onPress={() => {
                        setSelectedTarget(option);
                        setChantCount(0); // Reset count when target changes
                      }}
                    >
                      <Text
                        style={[
                          styles.repPillText,
                          isSelected && styles.repPillTextSelected,
                        ]}
                      >
                        {option} {isSelected && " \u2713"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Audio Player if URL exists */}
              {info?.audio_url &&
              (info.source === "core" || info.source === "additional") ? (
                <View
                  style={{
                    width: "100%",
                    marginBottom: 30,
                    paddingHorizontal: 10,
                  }}
                >
                  <AudioPlayerBlock
                    block={{
                      audio_url: info.audio_url,
                      label: info.title || "Mantra Audio",
                    }}
                  />
                </View>
              ) : null}

              {/* Consolidated Meaning/Essence Section */}
              <View style={styles.collapsibleSectionsCombined}>
                {hasContent(info.meaning) || hasContent(info.summary) ? (
                  <CollapsibleCard
                    label="Meaning"
                    expanded={meaningExpanded}
                    onToggle={() => setMeaningExpanded(!meaningExpanded)}
                  >
                    <Text style={styles.cardText}>
                      {info.meaning || info.summary}
                    </Text>
                  </CollapsibleCard>
                ) : null}

                <View style={{ height: 12 }} />

                {hasContent(info.essence) || hasContent(info.insight) ? (
                  <CollapsibleCard
                    label="Essence"
                    expanded={essenceExpanded}
                    onToggle={() => setEssenceExpanded(!essenceExpanded)}
                  >
                    <Text style={styles.cardText}>{info.essence}</Text>
                  </CollapsibleCard>
                ) : null}
              </View>

              <TouchableOpacity onPress={handleBack} style={styles.backLink}>
                <Text style={styles.backLinkText}>Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Legacy Practice Visual (Lotus) - only for Sankalp and Practice */}
          {currentType !== "mantra" && (
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
                <View style={styles.mantraMainContainer}>
                  {/* TIT-01: Render Title and Line separately for Sankalp.
                    Order: Title -> Line -> How To Live (below). */}
                  {info.title && (
                    <Text style={styles.deityTitle}>{info.title}</Text>
                  )}
                  {(info.line ||
                    info.subtitle ||
                    info.iast ||
                    info.meaning ||
                    info.summary) && (
                    <Text
                      style={[
                        styles.sankalpMainText,
                        info.title ? { marginTop: 10 } : null,
                      ]}
                    >
                      {interpolate(
                        info.line ||
                          info.subtitle ||
                          info.iast ||
                          info.meaning ||
                          info.summary,
                        { ...screenData, ...info },
                      )}
                    </Text>
                  )}
                </View>
              )}

              {currentType === "practice" && (
                <View style={styles.mantraMainContainer}>
                  <Text style={[styles.deityTitle, { textAlign: "center" }]}>
                    {info.title}
                  </Text>
                  {(info.subtitle || info.line) && (
                    <Text
                      style={[
                        styles.sankalpMainText,
                        {
                          fontSize: 18,
                          fontFamily: Fonts.serif.regular,
                          marginTop: 8,
                          textAlign: "center",
                        },
                      ]}
                    >
                      {interpolate(info.subtitle || info.line, {
                        ...screenData,
                        ...info,
                      })}
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Main Content Card - only for Sankalp and Practice */}
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

          {/* Actions - only for Sankalp and Practice */}
          {visibleFooterBlocks.length > 0 && currentType !== "mantra" && (
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

          {/* Prompt / Action Text - Moved below actions per user feedback - only for Sankalp and Practice */}
          {currentType !== "mantra" && (
            <Text style={styles.practicePrompt}>
              {currentType === "sankalp"
                ? "Carry this intention gently into your thoughts and actions."
                : "Begin when you feel ready. This takes 2-3 minutes. There is no rush."}
            </Text>
          )}

          {/* Accordion Sections - only for Sankalp and Practice */}
          {currentType !== "mantra" && (
            <View style={styles.collapsibleSections}>
              {/* Consolidated Meaning Section for Practices and Mantras */}
              {currentType !== "sankalp" &&
                ((currentType === "practice" && hasContent(info.summary)) ||
                  (currentType === "mantra" &&
                    (hasContent(info.meaning) ||
                      hasContent(info.summary)))) && (
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
                      {info.meaning || info.essence || info.summary}
                    </Text>
                  </CollapsibleCard>
                  <CollapsibleCard
                    label="Benefits"
                    expanded={benefitsExpanded}
                    onToggle={() => setBenefitsExpanded(!benefitsExpanded)}
                  >
                    {hasContent(info.benefits) ? (
                      Array.isArray(info.benefits) ? (
                        <View style={styles.benefitList}>
                          {info.benefits.map((b: string, idx: number) => (
                            <Text key={idx} style={styles.benefitItem}>
                              {"\u2022"} {b}
                            </Text>
                          ))}
                        </View>
                      ) : (
                        <Text style={styles.cardText}>{info.benefits}</Text>
                      )
                    ) : (
                      <Text style={styles.cardText}>
                        Focus and calm are cultivated through this intention.
                      </Text>
                    )}
                  </CollapsibleCard>
                </>
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
          )}

          {currentType !== "mantra" && (
            <TouchableOpacity onPress={handleBack} style={styles.backLink}>
              <Text style={styles.backLinkText}>Back</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  }

  if (isAckScreen) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.ackScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.visualContainer}>
            {typeof MantraLotus3d === "number" ? (
              <SvgUri
                uri={Image.resolveAssetSource(MantraLotus3d)?.uri ?? null}
                width={200}
                height={200}
              />
            ) : (
              <MantraLotus3d width={200} height={200} />
            )}
          </View>

          <View style={styles.ackContent}>
            <Text style={styles.ackHeadline}>
              {screenData.checkin_ack_headline}
            </Text>

            <Text style={styles.ackBody}>{screenData.checkin_ack_body}</Text>

            {screenData.checkin_ack_accent ? (
              <Text style={styles.ackAccent}>
                {screenData.checkin_ack_accent}
              </Text>
            ) : null}
          </View>

          {visibleFooterBlocks.length > 0 && (
            <View style={styles.ackActions}>
              {visibleFooterBlocks.map((block: any, i: number) => (
                <BlockRenderer key={`ack-f-${i}`} block={block} />
              ))}
            </View>
          )}
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
    // paddingTop: 200,
    paddingBottom: 60,
    alignItems: "center",
  },
  ackScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    // paddingTop: 80,
    // paddingBottom: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  visualContainer: {
    alignItems: "center",
    // marginBottom: 20,
  },
  deityTitle: {
    fontSize: 26,
    fontFamily: Fonts.serif.bold,
    color: BROWN,
    textAlign: "center",
    marginTop: -40,
  },
  mainCard: {
    width: "100%",
    // backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E8C587",
    padding: 20,
    marginBottom: 10,
    marginTop: 10,
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
    display: "flex",
    alignItems: "center",
    alignSelf: "center",

    // marginLeft: 4,
  },
  collapsibleSections: {
    width: "100%",
    gap: 12,
    marginBottom: 30,
  },
  card: {
    width: "100%",

    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(184, 148, 80, 0.1)",
    padding: 10,
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
    marginTop: 6,
    paddingHorizontal: 12,
  },
  mantraDevanagariLarge: {
    fontSize: 18,
    fontFamily: Fonts.serif.bold,
    color: "#432104",
    textAlign: "center",
    marginTop: 15,
    marginBottom: 4,
  },
  mantraIAST: {
    fontSize: 16,
    fontFamily: Fonts.serif.regular,
    fontStyle: "italic",
    color: "#6a4d28",
    textAlign: "center",
    marginTop: 2,
    marginBottom: 10,
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
    marginTop: -20,
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
  ackContent: {
    alignItems: "center",
    // marginBottom: 40,
  },
  ackHeadline: {
    fontSize: 28,
    fontFamily: Fonts.serif.bold,
    color: BROWN,
    textAlign: "center",
    lineHeight: 38,
    marginBottom: 24,
  },
  ackBody: {
    fontSize: 18,
    lineHeight: 28,
    color: "#5C5648",
    fontFamily: Fonts.serif.regular,
    textAlign: "center",
    marginBottom: 24,
  },
  ackAccent: {
    fontSize: 17,
    fontFamily: Fonts.serif.bold,
    fontStyle: "italic",
    color: GOLD,
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  ackActions: {
    width: "100%",
    alignItems: "center",
    // marginTop: "auto",
  },
  content: {
    gap: 20,
  },
  combinedMantraFlow: {
    width: "100%",
    alignItems: "center",
    paddingTop: 40,
  },
  topCardsRow: {
    width: "100%",
    marginBottom: 24,
    marginTop: 0,
    gap: 2,
  },
  textCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    width: "100%",
  },
  textCardHeaderContent: {
    flex: 1,
    fontSize: 17,
    fontFamily: Fonts.serif.medium,
    color: BROWN,
    lineHeight: 24,
    textAlign: "center",
  },
  combinedHelpText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#5a4a2a",
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
    lineHeight: 26,
    opacity: 0.8,
  },
  progressCounter: {
    flexDirection: "row",
    alignItems: "baseline",
    // marginBottom: 0,
    marginTop: -40,
  },
  currentCountText: {
    fontSize: 64,
    fontFamily: Fonts.serif.regular,
    color: "#b89450",
  },
  totalCountText: {
    fontSize: 32,
    fontFamily: Fonts.serif.regular,
    color: "#d1c1a1",
  },
  interactionArea: {
    width: 260,
    height: 260,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  glowOuter: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    // backgroundColor: "rgba(232, 197, 135, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  glowMiddle: {
    width: 210,
    height: 210,
    borderRadius: 105,
    shadowColor: "#E8C587",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  glowInner: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#E8C587",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  beadsRing: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  ringCircle: {
    position: "absolute",
    width: 180,
    height: 180,
    // borderRadius: 100,
    // borderWidth: 1.5,
    // borderColor: "rgba(184, 148, 80, 0.2)",
  },
  beadWrapper: {
    position: "absolute",
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  beadInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  beadPointer: {
    position: "absolute",
    top: -2,
    width: 6,
    height: 6,
    backgroundColor: "#b89450",
    borderRadius: 3,
  },
  centerTapTarget: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fffdf9",
    borderWidth: 1,
    borderColor: "#e8c587",
    elevation: 4,
    shadowColor: "#b89450",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  tapTouchable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tapContent: {
    alignItems: "center",
  },
  tapText: {
    fontSize: 20,
    letterSpacing: 4,
    fontFamily: Fonts.sans.bold,
    color: "#b89450",
  },
  subTap: {
    fontSize: 10,
    letterSpacing: 1,
    color: "#8a7a5a",
    fontFamily: Fonts.sans.medium,
    marginTop: 2,
  },
  tapCheck: {
    marginTop: 5,
  },
  repPillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginTop: 20,
    paddingHorizontal: 5,
    marginBottom: 25,
  },
  repPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e8c587",
    backgroundColor: "transparent",
  },
  repPillSelected: {
    backgroundColor: "#b89450",
    borderColor: "#b89450",
  },
  repPillText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: "#8a7a5a",
  },
  repPillTextSelected: {
    color: "#fff",
  },
  repPillsLabel: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: "#8a7a5a",
    marginTop: 8,
    marginBottom: 30,
  },
  collapsibleSectionsCombined: {
    width: "100%",
    paddingHorizontal: 0,
    marginBottom: 40,
  },
  cardTextLarge: {
    fontSize: 18,
    lineHeight: 28,
  },
});

export default CycleTransitionsContainer;

import { Ionicons } from "@expo/vector-icons";
import {
  getQuickResetActionLabel,
  normalizeBrowseMantras,
  pickDifferentMantra,
} from "@kalpx/contracts";
import type {
  QuickChantCompleteResponse,
  QuickResetMantra,
  QuickResetOpeningState,
} from "@kalpx/types";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  LayoutAnimation,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import RudrakshBead from "../../../assets/rudraksh.svg";
import AudioPlayerBlock from "../../blocks/AudioPlayerBlock";
import MalaMantraCounter from "../../components/MalaMantraCounter";
import type { MantraTextCardProps } from "../../containers/CycleTransitionsContainer";
import {
  getQuickResetOpening,
  postBrowseMantras,
  postQuickChantComplete,
  postQuickResetSetDefault,
} from "../../engine/mitraApi";
import { useScreenStore } from "../../engine/useScreenBridge";
import { Fonts } from "../../theme/fonts";

type Phase = "loading" | "opening" | "preview" | "running" | "done" | "error";
const REP_OPTIONS = [1, 9, 27, 54, 108];

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function getVisualBeadCount(total: number): number {
  if (total <= 1) return 1;
  return Math.min(total, 18);
}

function CollapsibleCard({
  label,
  expanded,
  onToggle,
  children,
}: {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.collapsibleCard}>
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.8}
        style={styles.collapsibleHeader}
      >
        <View style={styles.collapsibleLine} />
        <Text style={styles.collapsibleLabel}>
          {label} {expanded ? "▴" : "▾"}
        </Text>
        <View style={styles.collapsibleLine} />
      </TouchableOpacity>
      {expanded ? <Text style={styles.collapsibleBody}>{children}</Text> : null}
    </View>
  );
}

function MantraTextCard({
  text,
  expanded,
  onToggle,
  isDevanagari = false,
}: MantraTextCardProps) {
  const [isTruncated, setIsTruncated] = React.useState(false);
  const baseTextStyle: any[] = [
    isDevanagari ? styles.verseDevanagari : styles.verseIast,
  ];

  return (
    <View
      style={[
        styles.verseTextGroup,
        !isTruncated && styles.verseTextGroupNoArrow,
        expanded && styles.expandedSection,
      ]}
    >
      <Text
        style={[baseTextStyle, styles.verseMeasureText]}
        onTextLayout={(e) => {
          setIsTruncated(e.nativeEvent.lines.length > 2);
        }}
      >
        {text}
      </Text>
      <TouchableOpacity
        onPress={() => {
          if (!isTruncated) return;
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          onToggle();
        }}
        activeOpacity={isTruncated ? 0.9 : 1}
        disabled={!isTruncated}
      >
        <Text style={baseTextStyle} numberOfLines={expanded ? undefined : 2}>
          {text}
        </Text>
        {isTruncated ? (
          <View style={styles.expandArrowWrap}>
            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={18}
              color="#B89450"
            />
          </View>
        ) : null}
      </TouchableOpacity>
    </View>
  );
}

export default function QuickResetScreen({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const navigation = useNavigation<any>();
  const { goBack } = useScreenStore();

  const [phase, setPhase] = useState<Phase>("loading");
  const [openingState, setOpeningState] =
    useState<QuickResetOpeningState | null>(null);
  const [selectedMantra, setSelectedMantra] = useState<QuickResetMantra | null>(
    null,
  );
  const [completionData, setCompletionData] =
    useState<QuickChantCompleteResponse | null>(null);
  const [beadCount, setBeadCount] = useState(0);
  const [selectedReps, setSelectedReps] = useState(108);
  const [iastExpanded, setIastExpanded] = useState(false);
  const [devExpanded, setDevExpanded] = useState(false);
  const [meaningExpanded, setMeaningExpanded] = useState(false);
  const [essenceExpanded, setEssenceExpanded] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerMantras, setPickerMantras] = useState<QuickResetMantra[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [defaultSetConfirmed, setDefaultSetConfirmed] = useState(false);

  const runnerStartedAt = useRef<number>(0);

  const activeMantra = selectedMantra ?? openingState?.mantra ?? null;

  // ── Initial load ────────────────────────────────────────────────────────────
  const loadOpening = useCallback(async () => {
    setPhase("loading");
    const state = await getQuickResetOpening();
    if (state) {
      setOpeningState(state);
      setSelectedMantra(null);
      setPhase("opening");
    } else {
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    loadOpening();
  }, [loadOpening]);

  // ── Secondary action: "Show another calming mantra" ────────────────────────
  const handleShowAnother = useCallback(async () => {
    if (!activeMantra) return;
    const raw = await postBrowseMantras("peacecalm");
    const candidates = normalizeBrowseMantras(raw);
    const different = pickDifferentMantra(candidates, activeMantra.item_id);
    if (different) {
      setSelectedMantra(different);
    }
    // If none found, keep current — silent
  }, [activeMantra]);

  // ── Secondary action: "Set as my Quick Reset mantra" ──────────────────────
  const handleSetDefault = useCallback(
    async (mantra: QuickResetMantra) => {
      await postQuickResetSetDefault(mantra.item_id);
      setDefaultSetConfirmed(true);
      await loadOpening();
    },
    [loadOpening],
  );

  // ── Mantra picker modal ────────────────────────────────────────────────────
  const openPicker = useCallback(async () => {
    setPickerVisible(true);
    setPickerLoading(true);
    const raw = await postBrowseMantras("peacecalm");
    setPickerMantras(normalizeBrowseMantras(raw));
    setPickerLoading(false);
  }, []);

  const handlePickerSelect = useCallback((mantra: QuickResetMantra) => {
    setSelectedMantra(mantra);
    setPickerVisible(false);
    setPhase("preview");
  }, []);

  // ── Runner start ───────────────────────────────────────────────────────────
  const handleBeginChanting = useCallback(() => {
    runnerStartedAt.current = Date.now();
    setBeadCount(0);
    setPhase("running");
  }, []);

  // ── Done chanting ──────────────────────────────────────────────────────────
  const handleDoneChanting = useCallback(async () => {
    if (!activeMantra) return;
    const duration_ms = Date.now() - runnerStartedAt.current;
    const result = await postQuickChantComplete({
      mantra_ref: activeMantra.item_id,
      duration_ms,
      completed: true,
    });
    if (result && result.copy) {
      setCompletionData(result);
      setPhase("done");
    } else {
      if (embedded) {
        goBack();
      } else {
        navigation.goBack();
      }
    }
  }, [activeMantra, embedded, goBack, navigation]);

  // ── End early — always silent ──────────────────────────────────────────────
  const handleEndEarly = useCallback(async () => {
    if (!activeMantra) {
      if (embedded) {
        goBack();
      } else {
        navigation.goBack();
      }
      return;
    }
    const duration_ms = Date.now() - runnerStartedAt.current;
    postQuickChantComplete({
      mantra_ref: activeMantra.item_id,
      duration_ms,
      completed: false,
    });
    if (embedded) {
      goBack();
    } else {
      navigation.goBack();
    }
  }, [activeMantra, embedded, goBack, navigation]);

  // ── Secondary actions handler ──────────────────────────────────────────────
  const handleSecondaryAction = useCallback(
    (action: string) => {
      if (action === "mitra_suggest_for_this_moment") {
        handleShowAnother();
      } else if (action === "set_as_default" && activeMantra) {
        handleSetDefault(activeMantra);
      } else if (
        action === "change_mantra" ||
        action === "choose_from_library"
      ) {
        openPicker();
      }
    },
    [handleShowAnother, handleSetDefault, openPicker, activeMantra],
  );

  // ── Render helpers ─────────────────────────────────────────────────────────
  const renderOpeningSurface = (
    mantra: QuickResetMantra,
    primaryLabel: string,
    secondaryActions: string[],
  ) => {
    const visualBeadCount = getVisualBeadCount(selectedReps);
    const beads = Array.from({ length: visualBeadCount }, (_, i) => {
      const angle = (i / visualBeadCount) * 2 * Math.PI - Math.PI / 2;
      const cx = 115 + Math.cos(angle) * 86;
      const cy = 115 + Math.sin(angle) * 86;
      return { cx, cy, i };
    });

    return (
      <View style={styles.openingShell}>
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.7}
          style={styles.contentBackBtn}
        >
          <Text style={styles.contentBackBtnText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.openingHeading}>{mantra.title}</Text>
        <Text style={styles.openingSubhead}>Quick Reset Mantra</Text>

        <View style={styles.progressWrap}>
          <Text style={styles.progressMain}>0</Text>
          <Text style={styles.progressSub}>/ {selectedReps}</Text>
        </View>

        <View style={styles.previewRingWrap}>
          <View style={styles.previewRing}>
            {beads.map(({ cx, cy, i }) => (
              <RudrakshBead
                key={i}
                width={28}
                height={28}
                style={[
                  styles.previewBead,
                  {
                    left: cx - 14,
                    top: cy - 14,
                  },
                ]}
              />
            ))}
          </View>
          <TouchableOpacity
            onPress={handleBeginChanting}
            activeOpacity={0.85}
            style={styles.previewTapButton}
          >
            <Text style={styles.previewTapText}>TAP</Text>
            <Text style={styles.previewTapSubtext}>HERE</Text>
            <View style={styles.previewTapCheckWrap}>
              <Text style={styles.previewTapCheck}>✓</Text>
            </View>
          </TouchableOpacity>
        </View>

        {!!mantra.iast && (
          <MantraTextCard
            text={mantra.iast}
            expanded={iastExpanded}
            onToggle={() => setIastExpanded((value) => !value)}
          />
        )}

        {!!mantra.devanagari && (
          <MantraTextCard
            text={mantra.devanagari}
            isDevanagari
            expanded={devExpanded}
            onToggle={() => setDevExpanded((value) => !value)}
          />
        )}

        <View style={styles.repsRow}>
          {REP_OPTIONS.map((count) => {
            const selected = count === selectedReps;
            return (
              <TouchableOpacity
                key={count}
                onPress={() => setSelectedReps(count)}
                activeOpacity={0.8}
                style={[styles.repChip, selected && styles.repChipActive]}
              >
                <Text
                  style={[
                    styles.repChipText,
                    selected && styles.repChipTextActive,
                  ]}
                >
                  {count}
                  {selected ? " ✓" : ""}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {mantra.audio_url ? (
          <View style={styles.audioWrap}>
            <Text style={styles.audioLabel}>MANTRA AUDIO</Text>
            <AudioPlayerBlock
              block={{
                audio_url: mantra.audio_url,
                label: "Guided Audio",
              }}
            />
          </View>
        ) : null}

        {!!mantra.meaning && (
          <CollapsibleCard
            label="Meaning"
            expanded={meaningExpanded}
            onToggle={() => setMeaningExpanded((value) => !value)}
          >
            {mantra.meaning}
          </CollapsibleCard>
        )}

        {!!mantra.essence && (
          <CollapsibleCard
            label="Essence"
            expanded={essenceExpanded}
            onToggle={() => setEssenceExpanded((value) => !value)}
          >
            {mantra.essence}
          </CollapsibleCard>
        )}

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleBeginChanting}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>{primaryLabel}</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          {secondaryActions.map((action) => (
            <TouchableOpacity
              key={action}
              onPress={() => handleSecondaryAction(action)}
              activeOpacity={0.75}
              style={styles.secondaryActionRow}
            >
              <View style={styles.secondaryActionIconWrap}>
                <Text style={styles.secondaryActionIcon}>
                  {action === "change_mantra" ? "⟳" : "☷"}
                </Text>
              </View>
              <View style={styles.secondaryActionCopy}>
                <Text style={styles.secondaryActionRowText}>
                  {getQuickResetActionLabel(action)}
                </Text>
                <View style={styles.secondaryActionUnderline} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {defaultSetConfirmed ? (
          <Text style={styles.confirmText}>
            Set as your Quick Reset mantra.
          </Text>
        ) : null}
      </View>
    );
  };

  const renderCopyWithBreaks = (text: string) =>
    text.split("\n").map((line, i) => (
      <Text key={i} style={styles.copyLine}>
        {line}
      </Text>
    ));

  const handleBack = useCallback(() => {
    if (embedded) {
      goBack();
      return;
    }
    navigation.goBack();
  }, [embedded, goBack, navigation]);

  // ── Phases ─────────────────────────────────────────────────────────────────

  if (phase === "loading") {
    return (
      <SafeAreaView
        style={[styles.safeArea, embedded && styles.embeddedTransparent]}
      >
        <ImageBackground
          source={require("../../../assets/beige_bg.png")}
          style={styles.background}
          imageStyle={styles.backgroundImage}
        >
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#C99317" />
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  if (phase === "error") {
    return (
      <SafeAreaView
        style={[styles.safeArea, embedded && styles.embeddedTransparent]}
      >
        <ImageBackground
          source={require("../../../assets/beige_bg.png")}
          style={styles.background}
          imageStyle={styles.backgroundImage}
        >
          <View style={styles.centerContent}>
            <TouchableOpacity
              onPress={handleBack}
              activeOpacity={0.7}
              style={styles.contentBackBtn}
            >
              <Text style={styles.contentBackBtnText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>Unable to open Quick Reset</Text>
            <Text style={styles.subtleText}>Please try again.</Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={loadOpening}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  if (phase === "opening" && openingState) {
    const displayMantra = activeMantra!;
    return (
      <SafeAreaView
        style={[styles.safeArea, embedded && styles.embeddedTransparent]}
      >
        <ImageBackground
          source={require("../../../assets/beige_bg.png")}
          style={styles.background}
          imageStyle={styles.backgroundImage}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderOpeningSurface(
              displayMantra,
              openingState.primary_cta,
              openingState.secondary_actions,
            )}
          </ScrollView>
          {renderPickerModal()}
        </ImageBackground>
      </SafeAreaView>
    );
  }

  if (phase === "preview" && selectedMantra) {
    return (
      <SafeAreaView
        style={[styles.safeArea, embedded && styles.embeddedTransparent]}
      >
        <ImageBackground
          source={require("../../../assets/beige_bg.png")}
          style={styles.background}
          imageStyle={styles.backgroundImage}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderOpeningSurface(selectedMantra, "Begin chanting", [
              "set_as_default",
              "change_mantra",
            ])}
          </ScrollView>
          {renderPickerModal()}
        </ImageBackground>
      </SafeAreaView>
    );
  }

  if (phase === "running" && activeMantra) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <MalaMantraCounter
          mantraTitle={activeMantra.title}
          hindiText={activeMantra.devanagari}
          mantraText={activeMantra.meaning}
          targetCount={selectedReps}
          currentCount={beadCount}
          onIncrement={() => setBeadCount((c) => c + 1)}
          onExit={handleEndEarly}
          footerContent={
            <View style={styles.runnerFooter}>
              {activeMantra.audio_url ? (
                <AudioPlayerBlock
                  block={{ audio_url: activeMantra.audio_url }}
                />
              ) : null}
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleDoneChanting}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryBtnText}>Done chanting</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleEndEarly}
                activeOpacity={0.7}
                style={styles.endEarlyBtn}
              >
                <Text style={styles.endEarlyText}>End early</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </SafeAreaView>
    );
  }

  if (phase === "done" && completionData?.copy) {
    const fromBrowse = selectedMantra !== null;
    const isExplicit = openingState?.screen_state === "explicit";
    return (
      <SafeAreaView
        style={[styles.safeArea, embedded && styles.embeddedTransparent]}
      >
        <ImageBackground
          source={require("../../../assets/beige_bg.png")}
          style={styles.background}
          imageStyle={styles.backgroundImage}
        >
          <View style={styles.centerContent}>
            <TouchableOpacity
              onPress={handleBack}
              activeOpacity={0.7}
              style={styles.contentBackBtn}
            >
              <Text style={styles.contentBackBtnText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.copyBlock}>
              {renderCopyWithBreaks(completionData.copy.headline)}
              {completionData.copy.subtext ? (
                <Text style={styles.copySubtext}>
                  {completionData.copy.subtext}
                </Text>
              ) : null}
            </View>
            {fromBrowse && !isExplicit && selectedMantra && (
              <TouchableOpacity
                onPress={() => handleSetDefault(selectedMantra)}
                activeOpacity={0.7}
                style={styles.secondaryActionBtn}
              >
                <Text style={styles.secondaryActionText}>
                  Set as my Quick Reset mantra
                </Text>
              </TouchableOpacity>
            )}
            {defaultSetConfirmed && (
              <Text style={styles.confirmText}>
                Set as your Quick Reset mantra.
              </Text>
            )}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  // Fallback during phase transition
  return (
    <SafeAreaView
      style={[styles.safeArea, embedded && styles.embeddedTransparent]}
    >
      <ImageBackground
        source={require("../../../assets/beige_bg.png")}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#C99317" />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );

  function renderPickerModal() {
    return (
      <Modal
        visible={pickerVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setPickerVisible(false)}
      >
        <SafeAreaView style={styles.safeArea}>
          <ImageBackground
            source={require("../../../assets/beige_bg.png")}
            style={styles.background}
            imageStyle={styles.backgroundImage}
          >
            <View style={styles.pickerHeader}>
              <TouchableOpacity
                onPress={() => setPickerVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.contentBackBtnText}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Choose a Mantra</Text>
            </View>
            {pickerLoading ? (
              <View style={styles.centerContent}>
                <ActivityIndicator size="large" color="#C99317" />
              </View>
            ) : (
              <ScrollView
                contentContainerStyle={styles.pickerList}
                showsVerticalScrollIndicator={false}
              >
                {pickerMantras.map((mantra) => (
                  <TouchableOpacity
                    key={mantra.item_id}
                    style={styles.pickerItem}
                    onPress={() => handlePickerSelect(mantra)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.pickerItemTitle}>{mantra.title}</Text>
                    {!!mantra.devanagari && (
                      <Text style={styles.pickerItemDevanagari}>
                        {mantra.devanagari}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </ImageBackground>
        </SafeAreaView>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF8EF",
  },
  embeddedTransparent: {
    backgroundColor: "transparent",
  },
  background: {
    flex: 1,
  },
  backgroundImage: {
    resizeMode: "cover",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 64,
    alignItems: "center",
    gap: 20,
  },
  openingShell: {
    width: "100%",
    gap: 18,
    alignItems: "center",
  },
  contentBackBtn: {
    alignSelf: "flex-start",
    marginBottom: 14,
  },
  contentBackBtnText: {
    fontSize: 15,
    color: "#C99317",
    fontFamily: Fonts.sans.medium,
  },
  openingHeading: {
    fontSize: 28,
    fontFamily: Fonts.serif.bold,
    color: "#432104",
    textAlign: "center",
    lineHeight: 36,
  },
  openingSubhead: {
    fontSize: 12,
    letterSpacing: 2.2,
    color: "#C7A048",
    fontFamily: Fonts.sans.bold,
    textTransform: "uppercase",
  },
  progressWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    marginTop: -4,
    marginBottom: 2,
  },
  progressMain: {
    fontSize: 60,
    lineHeight: 60,
    color: "#C7A048",
    fontFamily: Fonts.serif.regular,
  },
  progressSub: {
    fontSize: 28,
    lineHeight: 34,
    color: "#D8C6A2",
    fontFamily: Fonts.serif.regular,
  },
  previewRingWrap: {
    width: 230,
    height: 230,
    position: "relative",
    marginBottom: 2,
  },
  previewRing: {
    ...StyleSheet.absoluteFillObject,
  },
  previewBead: {
    position: "absolute",
    shadowColor: "#6B431A",
    shadowOpacity: 0.22,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  previewTapButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 108,
    height: 108,
    marginLeft: -54,
    marginTop: -54,
    borderRadius: 54,
    backgroundColor: "#FFFDF9",
    borderWidth: 1.5,
    borderColor: "#E8C587",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    shadowColor: "#B89450",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  previewTapText: {
    fontSize: 20,
    letterSpacing: 4,
    color: "#B89450",
    fontFamily: Fonts.sans.bold,
  },
  previewTapSubtext: {
    fontSize: 10,
    letterSpacing: 1.2,
    color: "#8A7A5A",
    fontFamily: Fonts.sans.medium,
  },
  previewTapCheckWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#B89450",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  previewTapCheck: {
    fontSize: 13,
    color: "#B89450",
    fontFamily: Fonts.sans.bold,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 20,
  },
  mantraBlock: {
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  mantraTitle: {
    fontSize: 22,
    fontFamily: Fonts.serif.bold,
    color: "#432104",
    fontWeight: "700",
    textAlign: "center",
  },
  mantraDevanagari: {
    fontSize: 34,
    color: "#C99317",
    fontFamily: Fonts.sans.regular,
    textAlign: "center",
    lineHeight: 42,
  },
  mantraMeaning: {
    fontSize: 15,
    fontFamily: Fonts.sans.regular,
    color: "#7B6550",
    textAlign: "center",
  },
  verseTextGroup: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(184, 148, 80, 0.1)",
    padding: 5,
  },
  verseTextGroupNoArrow: {
    padding: 15,
  },
  verseMeasureText: {
    position: "absolute",
    opacity: 0,
    zIndex: -1,
    left: 5,
    right: 5,
  },
  expandedSection: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  verseIast: {
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#615247",
    fontFamily: Fonts.sans.regular,
    textAlign: "center",
    lineHeight: 18,
  },
  verseDevanagari: {
    fontFamily: "NotoSansDevanagari_500Medium",
    fontSize: 15,
    color: "#615247",
    textAlign: "center",
  },
  expandArrowWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    opacity: 0.6,
  },
  repsRow: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    marginTop: 4,
  },
  repChip: {
    width: 76,
    height: 60,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E8C587",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  repChipActive: {
    backgroundColor: "#C7A048",
    borderColor: "#C7A048",
  },
  repChipText: {
    fontSize: 16,
    color: "#8A7A5A",
    fontFamily: Fonts.sans.semiBold,
  },
  repChipTextActive: {
    color: "#fff",
  },
  audioWrap: {
    width: "100%",
    gap: 12,
    marginTop: 10,
  },
  audioLabel: {
    fontSize: 16,
    letterSpacing: 5,
    color: "#C7A048",
    fontFamily: Fonts.sans.bold,
    textAlign: "center",
  },
  collapsibleCard: {
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(218,194,142,0.65)",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.72)",
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  collapsibleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  collapsibleLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(199,160,72,0.45)",
  },
  collapsibleLabel: {
    fontSize: 16,
    color: "#432104",
    fontFamily: Fonts.serif.bold,
  },
  collapsibleBody: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 24,
    color: "#7B6550",
    fontFamily: Fonts.sans.regular,
    textAlign: "center",
  },
  primaryBtn: {
    backgroundColor: "#C99317",
    borderRadius: 15,
    paddingHorizontal: 40,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
    marginTop: 6,
  },
  primaryBtnText: {
    fontSize: 17,
    fontFamily: Fonts.sans.semiBold,
    color: "#fff",
  },
  secondaryActions: {
    width: "100%",
    gap: 14,
    alignItems: "stretch",
  },
  secondaryActionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  secondaryActionText: {
    fontSize: 15,
    color: "#C99317",
    fontFamily: Fonts.sans.medium,
    textDecorationLine: "underline",
  },
  secondaryActionRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  secondaryActionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(212,160,23,0.38)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.42)",
  },
  secondaryActionIcon: {
    fontSize: 22,
    color: "#C99317",
  },
  secondaryActionCopy: {
    flex: 1,
  },
  secondaryActionRowText: {
    fontSize: 16,
    color: "#432104",
    fontFamily: Fonts.serif.regular,
  },
  secondaryActionUnderline: {
    marginTop: 7,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(232,197,135,0.95)",
    borderStyle: "dotted",
  },
  confirmText: {
    fontSize: 14,
    color: "#7B6550",
    fontFamily: Fonts.sans.regular,
    textAlign: "center",
  },
  subtleText: {
    fontSize: 15,
    color: "#7B6550",
    fontFamily: Fonts.sans.regular,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: Fonts.serif.bold,
    color: "#432104",
    fontWeight: "700",
    textAlign: "center",
  },
  copyBlock: {
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
  },
  copyLine: {
    fontSize: 22,
    fontFamily: Fonts.serif.bold,
    color: "#432104",
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 32,
  },
  copySubtext: {
    fontSize: 15,
    fontFamily: Fonts.sans.regular,
    color: "#7B6550",
    textAlign: "center",
    marginTop: 8,
  },
  runnerFooter: {
    gap: 12,
    alignItems: "center",
    paddingBottom: 16,
  },
  endEarlyBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  endEarlyText: {
    fontSize: 14,
    color: "#9b8b77",
    fontFamily: Fonts.sans.regular,
    textDecorationLine: "underline",
  },
  pickerList: {
    padding: 16,
    gap: 2,
  },
  pickerHeader: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 20,
  },
  pickerTitle: {
    marginTop: 24,
    fontSize: 22,
    fontFamily: Fonts.serif.bold,
    color: "#432104",
    textAlign: "center",
  },
  pickerItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#DAC28E",
    gap: 4,
  },
  pickerItemTitle: {
    fontSize: 17,
    fontFamily: Fonts.serif.bold,
    color: "#432104",
    fontWeight: "700",
  },
  pickerItemDevanagari: {
    fontSize: 15,
    color: "#8B6914",
    fontFamily: Fonts.sans.regular,
  },
});

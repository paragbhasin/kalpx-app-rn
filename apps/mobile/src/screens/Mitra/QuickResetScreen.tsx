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
import { useJapaEngine } from "../../engine/useJapaEngine";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
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
const RudrakshBead = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/rudraksh.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
import AudioPlayerBlock, {
  stopAllAudioPlayerSounds,
} from "../../blocks/AudioPlayerBlock";
import type { MantraTextCardProps } from "../../containers/CycleTransitionsContainer";
import {
  getQuickResetOpening,
  postBrowseMantras,
  postQuickChantComplete,
  postQuickResetSetDefault,
} from "../../engine/mitraApi";
import { useScreenStore } from "../../engine/useScreenBridge";
import { navigate as rootNavigate } from "../../Shared/Routes/NavigationService";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Fonts } from "../../theme/fonts";
import { platformShadow } from "../../theme/shadows";

type Phase = "loading" | "opening" | "preview" | "done" | "error";
const VISUAL_BEAD_COUNT = 18;

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
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

function HighlightedToast({
  visible,
  title,
  message,
  onClose,
}: {
  visible: boolean;
  title: string;
  message?: string | null;
  onClose: () => void;
}) {
  if (!visible) return null;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <View style={styles.toastOverlay}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={styles.toastBackdrop}
        />
        <View style={styles.toastShell}>
          <View style={styles.toastCard}>
            <View style={styles.toastGlow} />
            <View style={styles.toastIconWrap}>
              <Ionicons name="flower-outline" size={28} color="#BE9A56" />
            </View>
            <View style={styles.toastCopy}>
              <Text style={styles.toastTitle}>{title}</Text>
              {message ? (
                <Text style={styles.toastMessage}>{message}</Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={styles.toastCloseBtn}
            >
              <Text style={styles.toastCloseText}>×</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
              size={16}
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
  const insets = useSafeAreaInsets();
  const { goBack, updateBackground, updateHeaderHidden } = useScreenStore();

  useFocusEffect(
    useCallback(() => {
      if (!embedded) {
        updateBackground(require("../../../assets/beige_bg.webp"));
        updateHeaderHidden(false);
        return () => {
          updateBackground(null);
          updateHeaderHidden(false);
        };
      }
    }, [updateBackground, updateHeaderHidden, embedded]),
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        stopAllAudioPlayerSounds().catch((err) => {
          console.warn("[QuickResetScreen] failed to stop audio:", err);
        });
      };
    }, []),
  );

  const [phase, setPhase] = useState<Phase>("loading");
  const [openingState, setOpeningState] =
    useState<QuickResetOpeningState | null>(null);
  const [selectedMantra, setSelectedMantra] = useState<QuickResetMantra | null>(
    null,
  );
  const [completionData, setCompletionData] =
    useState<QuickChantCompleteResponse | null>(null);
  const [isChantingActive, setIsChantingActive] = useState(false);

  const activeMantraRef = (selectedMantra ?? openingState?.mantra)?.item_id ?? null;
  // Stable ref so onGoalReached never changes identity (avoids engine re-init)
  const onGoalReachedRef = useRef<(() => void) | null>(null);
  const japaEngine = useJapaEngine({
    mantraRef: activeMantraRef,
    sourceSurface: "quick_chant",
    goalType: "unlimited",
    onGoalReached: useCallback(() => { onGoalReachedRef.current?.(); }, []),
  });
  const beadCount = japaEngine.sessionCount;

  // Sync on leave, refresh on enter — no API per tap
  useFocusEffect(
    useCallback(() => {
      // Screen focused: fetch fresh counts from server
      japaEngine.refreshStats();
      return () => {
        // Screen blurred (navigating away): flush any unsynced delta immediately
        japaEngine.syncNow();
      };
    }, [japaEngine.refreshStats, japaEngine.syncNow]),
  );

  const [iastExpanded, setIastExpanded] = useState(false);
  const [devExpanded, setDevExpanded] = useState(false);
  const [meaningExpanded, setMeaningExpanded] = useState(false);
  const [essenceExpanded, setEssenceExpanded] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerMantras, setPickerMantras] = useState<QuickResetMantra[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [defaultSetConfirmed, setDefaultSetConfirmed] = useState(false);
  const [highlightedToastTitle, setHighlightedToastTitle] =
    useState("Mantra Updated ✦");
  const [highlightedToastMessage, setHighlightedToastMessage] = useState(
    "Your rhythm has been gently realigned.",
  );
  const [mantraUpdatedToastVisible, setMantraUpdatedToastVisible] =
    useState(false);
  const [returnToFourDoorOnToastClose, setReturnToFourDoorOnToastClose] =
    useState(false);

  const runnerStartedAt = useRef<number>(0);
  const ringSpin = useRef(new Animated.Value(0)).current;

  const activeMantra = selectedMantra ?? openingState?.mantra ?? null;

  // ── Initial load ────────────────────────────────────────────────────────────
  const loadOpening = useCallback(async () => {
    setPhase("loading");
    setIsChantingActive(false);
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

  useEffect(() => {
    ringSpin.setValue(0);
    const animation = Animated.loop(
      Animated.timing(ringSpin, {
        toValue: 1,
        duration: 40000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => {
      animation.stop();
    };
  }, [ringSpin]);

  const handleHighlightedToastClose = useCallback(() => {
    setMantraUpdatedToastVisible(false);
    if (!returnToFourDoorOnToastClose) return;

    setReturnToFourDoorOnToastClose(false);
    if (embedded) {
      goBack();
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    rootNavigate("Home");
  }, [embedded, goBack, navigation, returnToFourDoorOnToastClose]);

  useEffect(() => {
    if (!mantraUpdatedToastVisible) return;
    const timeout = setTimeout(() => {
      handleHighlightedToastClose();
    }, 2600);
    return () => clearTimeout(timeout);
  }, [handleHighlightedToastClose, mantraUpdatedToastVisible]);

  // ── Secondary action: "Show another calming mantra" ────────────────────────
  const handleShowAnother = useCallback(async () => {
    if (!activeMantra) return;
    const raw = await postBrowseMantras("peacecalm");
    const candidates = normalizeBrowseMantras(raw);
    const different = pickDifferentMantra(candidates, activeMantra.item_id);
    if (different) {
      setDefaultSetConfirmed(false);
      setSelectedMantra(different);
      setHighlightedToastTitle("Mantra Updated ✦");
      setHighlightedToastMessage("Your rhythm has been gently realigned.");
      setMantraUpdatedToastVisible(true);
    }
    // If none found, keep current — silent
  }, [activeMantra]);

  // ── Secondary action: "Set as my Quick Reset mantra" ──────────────────────
  const handleSetDefault = useCallback(
    async (mantra: QuickResetMantra) => {
      await postQuickResetSetDefault(mantra.item_id);
      setDefaultSetConfirmed(true);
      setHighlightedToastTitle("Quick Reset Mantra Set ✦");
      setHighlightedToastMessage(
        "Your mantra has been set for future Quick Reset moments.",
      );
      setMantraUpdatedToastVisible(true);
      await loadOpening();
    },
    [loadOpening],
  );

  // ── Mantra picker modal ────────────────────────────────────────────────────
  const openPicker = useCallback(async () => {
    setPickerVisible(true);
    setPickerLoading(true);
    try {
      const raw = await postBrowseMantras("peacecalm");
      setPickerMantras(normalizeBrowseMantras(raw));
    } finally {
      setPickerLoading(false);
    }
  }, []);

  const handlePickerSelect = useCallback((mantra: QuickResetMantra) => {
    setDefaultSetConfirmed(false);
    setIsChantingActive(false);
    setSelectedMantra(mantra);
    setPickerVisible(false);
    setPhase("preview");
    setHighlightedToastTitle("Mantra Updated ✦");
    setHighlightedToastMessage("Your rhythm has been gently realigned.");
    setMantraUpdatedToastVisible(true);
  }, []);

  // ── Runner start ───────────────────────────────────────────────────────────
  const handleTapBead = useCallback(() => {
    if (!activeMantra) return;
    if (!isChantingActive) {
      runnerStartedAt.current = Date.now();
      setIsChantingActive(true);
    }
    japaEngine.increment();
  }, [activeMantra, isChantingActive, japaEngine]);

  // ── Done chanting ──────────────────────────────────────────────────────────
  // Keep ref in sync so goal-reached callback always calls the latest version
  const handleDoneChanting = useCallback(async () => {
    onGoalReachedRef.current = null; // prevent double-fire after manual done
    if (!activeMantra) return;
    const duration_ms = isChantingActive
      ? Date.now() - runnerStartedAt.current
      : 0;
    // Flush the japa engine (sync final count + mark session complete on backend)
    await japaEngine.completeSession();
    const result = await postQuickChantComplete({
      mantra_ref: activeMantra.item_id,
      duration_ms,
      completed: true,
    });
    if (result && result.copy) {
      setCompletionData(result);
      setHighlightedToastTitle(result.copy.headline);
      setHighlightedToastMessage(result.copy.subtext ?? "");
      setReturnToFourDoorOnToastClose(true);
      setMantraUpdatedToastVisible(true);
    } else {
      if (embedded) {
        goBack();
      } else {
        navigation.goBack();
      }
    }
  }, [activeMantra, embedded, goBack, isChantingActive, navigation]);

  // Wire onGoalReached ref to the latest handleDoneChanting
  useEffect(() => {
    onGoalReachedRef.current = handleDoneChanting;
  }, [handleDoneChanting]);

  const handleCloseToHome = useCallback(() => {
    rootNavigate("Home");
  }, []);

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
    secondaryActions: string[],
  ) => {
    const visualBeadCount = VISUAL_BEAD_COUNT;
    const progressInCycle = beadCount % visualBeadCount;
    const beads = Array.from({ length: visualBeadCount }, (_, i) => {
      const angle = (i / visualBeadCount) * 2 * Math.PI - Math.PI / 2;
      const cx = 115 + Math.cos(angle) * 86;
      const cy = 115 + Math.sin(angle) * 86;
      return { cx, cy, i };
    });
    const spin = ringSpin.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
    });

    return (
      <View style={styles.openingShell}>
        <Text style={styles.openingHeading}>{mantra.title}</Text>
        <Text style={styles.openingSubhead}>Quick Reset Mantra</Text>

        <View style={styles.progressWrap}>
          <Text style={styles.progressMain}>{beadCount}</Text>
        </View>
        {(japaEngine.todayCount > 0 || japaEngine.weekCount > 0 || japaEngine.lifetimeCount > 0) && (
          <View style={styles.statsRow}>
            {japaEngine.todayCount > 0 && (
              <Text style={styles.statItem}>
                Today {japaEngine.todayCount.toLocaleString()}
              </Text>
            )}
            {japaEngine.weekCount > 0 && (
              <Text style={styles.statItem}>
                Week {japaEngine.weekCount.toLocaleString()}
              </Text>
            )}
            {japaEngine.lifetimeCount > 0 && (
              <Text style={styles.statItem}>
                Lifetime {japaEngine.lifetimeCount.toLocaleString()}
              </Text>
            )}
          </View>
        )}
        {japaEngine.completedMalas > 0 && (
          <Text style={styles.malaLabel}>
            {japaEngine.completedMalas} {japaEngine.completedMalas === 1 ? "mala" : "malas"}{" "}
            {japaEngine.beadInRound > 0 ? `· ${japaEngine.beadInRound} beads` : "completed"}
          </Text>
        )}

        <View style={styles.previewRingWrap}>
          <Animated.View
            style={[styles.previewRing, { transform: [{ rotate: spin }] }]}
          >
            {beads.map(({ cx, cy, i }) => (
              <View
                key={i}
                style={[
                  styles.previewBeadWrap,
                  {
                    left: cx - 14,
                    top: cy - 14,
                    opacity: i < progressInCycle ? 0.2 : 1,
                    transform: [{ scale: i < progressInCycle ? 0.6 : 1 }],
                  },
                ]}
              >
                <RudrakshBead
                  width={28}
                  height={28}
                  style={styles.previewBead}
                />
                {i === progressInCycle && (
                  <View style={styles.previewBeadPointer} />
                )}
              </View>
            ))}
          </Animated.View>
          <TouchableOpacity
            onPress={handleTapBead}
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

        {mantra.audio_url ? (
          <View style={styles.audioWrap}>
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

        <View style={styles.actionRow}>
          {japaEngine.canUndo && (
            <TouchableOpacity
              style={styles.undoBtn}
              onPress={japaEngine.undo}
              activeOpacity={0.7}
            >
              <Text style={styles.undoBtnText}>↩ Undo</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.primaryBtn, japaEngine.canUndo && styles.primaryBtnFlex]}
            onPress={handleDoneChanting}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Done chanting</Text>
          </TouchableOpacity>
        </View>

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

        {/* {defaultSetConfirmed ? (
          <Text style={styles.confirmText}>
            Set as your Quick Reset mantra.
          </Text>
        ) : null} */}
      </View>
    );
  };

  const renderCopyWithBreaks = (text: string) =>
    text.split("\n").map((line, i) => (
      <Text key={i} style={styles.copyLine}>
        {line}
      </Text>
    ));

  // ── Phases ─────────────────────────────────────────────────────────────────

  if (phase === "loading") {
    return (
      <SafeAreaView
        style={[styles.safeArea, embedded && styles.embeddedTransparent]}
      >
        <ImageBackground
          source={require("../../../assets/beige_bg.webp")}
          style={styles.background}
          imageStyle={styles.backgroundImage}
        >
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#C99317" />
          </View>
          <HighlightedToast
            visible={mantraUpdatedToastVisible}
            title={highlightedToastTitle}
            message={highlightedToastMessage}
            onClose={handleHighlightedToastClose}
          />
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
          source={require("../../../assets/beige_bg.webp")}
          style={styles.background}
          imageStyle={styles.backgroundImage}
        >
          <View style={styles.centerContent}>
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
          <HighlightedToast
            visible={mantraUpdatedToastVisible}
            title={highlightedToastTitle}
            message={highlightedToastMessage}
            onClose={handleHighlightedToastClose}
          />
        </ImageBackground>
      </SafeAreaView>
    );
  }

  if (phase === "opening" && openingState && activeMantra) {
    const displayMantra = activeMantra;
    return (
      <SafeAreaView
        style={[styles.safeArea, embedded && styles.embeddedTransparent]}
      >
        <ImageBackground
          source={require("../../../assets/beige_bg.webp")}
          style={styles.background}
          imageStyle={styles.backgroundImage}
        >
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
            showsVerticalScrollIndicator={false}
          >
            {renderOpeningSurface(
              displayMantra,
              openingState.secondary_actions,
            )}
          </ScrollView>
          {renderPickerModal()}
          <HighlightedToast
            visible={mantraUpdatedToastVisible}
            title={highlightedToastTitle}
            message={highlightedToastMessage}
            onClose={handleHighlightedToastClose}
          />
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
          source={require("../../../assets/beige_bg.webp")}
          style={styles.background}
          imageStyle={styles.backgroundImage}
        >
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
            showsVerticalScrollIndicator={false}
          >
            {renderOpeningSurface(selectedMantra, [
              "set_as_default",
              "change_mantra",
            ])}
          </ScrollView>
          {renderPickerModal()}
          <HighlightedToast
            visible={mantraUpdatedToastVisible}
            title={highlightedToastTitle}
            message={highlightedToastMessage}
            onClose={handleHighlightedToastClose}
          />
        </ImageBackground>
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
          source={require("../../../assets/beige_bg.webp")}
          style={styles.background}
          imageStyle={styles.backgroundImage}
        >
          <View style={styles.centerContent}>
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
              onPress={handleCloseToHome}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
          <HighlightedToast
            visible={mantraUpdatedToastVisible}
            title={highlightedToastTitle}
            message={highlightedToastMessage}
            onClose={handleHighlightedToastClose}
          />
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
        source={require("../../../assets/beige_bg.webp")}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#C99317" />
        </View>
        <HighlightedToast
          visible={mantraUpdatedToastVisible}
          title={highlightedToastTitle}
          message={highlightedToastMessage}
          onClose={handleHighlightedToastClose}
        />
      </ImageBackground>
    </SafeAreaView>
  );

  function renderPickerModal() {
    return (
      <Modal
        visible={pickerVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setPickerVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <ImageBackground
            source={require("../../../assets/beige_bg.webp")}
            style={styles.background}
            imageStyle={styles.backgroundImage}
          >
            <View style={styles.pickerHeader}>
              <TouchableOpacity
                onPress={() => setPickerVisible(false)}
                activeOpacity={0.7}
                style={styles.pickerBackBtn}
              >
                <Text style={styles.contentBackBtnText}>Close</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Choose a Mantra</Text>
              <View style={styles.pickerDivider}>
                <View style={styles.pickerDividerLine} />
                <Text style={styles.pickerDividerIcon}>✦</Text>
                <View style={styles.pickerDividerLine} />
              </View>
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
  modalSafeArea: {
    flex: 1,
    backgroundColor: "rgba(67, 33, 4, 0.12)",
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
    alignItems: "center",
    gap: 20,
  },
  openingShell: {
    width: "100%",
    gap: 18,
    alignItems: "center",
  },
  contentBackBtnText: {
    fontSize: 15,
    color: "#C99317",
    fontFamily: Fonts.sans.medium,
  },
  openingHeading: {
    fontSize: 22,
    fontFamily: Fonts.serif.bold,
    color: "#432104",
    textAlign: "center",
    lineHeight: 36,
    // marginTop: -30,
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
  statsRow: {
    flexDirection: "row",
    gap: 18,
    marginTop: -8,
    marginBottom: 2,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  statItem: {
    fontSize: 12,
    color: "#8A7A5A",
    fontFamily: Fonts.sans.regular,
    letterSpacing: 0.4,
  },
  malaLabel: {
    fontSize: 12,
    color: "#C7A048",
    fontFamily: Fonts.sans.medium,
    letterSpacing: 0.3,
    textAlign: "center",
    marginBottom: 2,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 6,
  },
  undoBtn: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "rgba(199,160,72,0.5)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Platform.OS === "android" ? "#FEFCF9" : "rgba(255,255,255,0.5)",
  },
  undoBtnText: {
    fontSize: 14,
    color: "#B89450",
    fontFamily: Fonts.sans.medium,
  },
  primaryBtnFlex: {
    flex: 1,
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
  previewBeadWrap: {
    position: "absolute",
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  previewBead: {
    ...platformShadow("#6B431A", 2, 0.22, 4, 2),
  },
  previewBeadPointer: {
    position: "absolute",
    top: -10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#B89450",
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
    ...platformShadow("#B89450", 2, 0.16, 10, 2),
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
    backgroundColor: Platform.OS === "android" ? "#FEFCF9" : "rgba(255, 255, 255, 0.4)",
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
    backgroundColor: Platform.OS === "android" ? "#FEFCF9" : "rgba(255, 255, 255, 0.8)",
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
    borderRadius: 11,
    backgroundColor: Platform.OS === "android" ? "#FEFCF9" : "rgba(255,255,255,0.72)",
    paddingHorizontal: 8,
    paddingVertical: 10,
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
    borderRadius: 11,
    // paddingHorizontal: 40,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
    marginTop: 6,
  },
  primaryBtnText: {
    fontSize: 14,
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
    width: 40,
    height: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(212,160,23,0.38)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Platform.OS === "android" ? "#FEFCF9" : "rgba(255,255,255,0.42)",
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
  pickerList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  pickerHeader: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    position: "relative",
  },
  pickerBackBtn: {
    alignSelf: "flex-start",
    marginBottom: 26,
  },
  pickerTitle: {
    fontSize: 24,
    fontFamily: Fonts.serif.bold,
    color: "#432104",
    textAlign: "center",
    marginBottom: 16,
  },
  pickerDivider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    marginBottom: 6,
  },
  pickerDividerLine: {
    width: 102,
    height: 1,
    backgroundColor: "rgba(199,160,72,0.45)",
  },
  pickerDividerIcon: {
    color: "#C7A048",
    fontSize: 18,
    lineHeight: 18,
  },
  pickerItem: {
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(218,194,142,0.55)",
    backgroundColor: Platform.OS === "android" ? "#FEFCF9" : "rgba(255,255,255,0.82)",
    ...platformShadow("#C9A84C", 6, 0.06, 14, 2),
    gap: 10,
    marginBottom: 18,
  },
  pickerItemTitle: {
    fontSize: 18,
    fontFamily: Fonts.serif.bold,
    color: "#432104",
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 24,
  },
  pickerItemDevanagari: {
    fontSize: 16,
    color: "#8B6914",
    fontFamily: Fonts.sans.regular,
    textAlign: "center",
    lineHeight: 26,
  },
  toastOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  toastBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(67, 33, 4, 0.12)",
  },
  toastShell: {
    width: "100%",
    maxWidth: 560,
  },
  toastCard: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    padding: 15,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: "rgba(233, 186, 88, 0.9)",
    backgroundColor: "rgba(255,250,241,0.96)",
    ...platformShadow("#D4A017", 12, 0.28, 28, 10),
  },
  toastGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  toastIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(250,225,155,0.72)",
    borderWidth: 2,
    borderColor: "rgba(255,249,235,0.95)",
  },
  toastCopy: {
    flex: 1,
    minWidth: 0,
  },
  toastTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: "#432104",
    lineHeight: 22,
    marginBottom: 8,
  },
  toastMessage: {
    fontSize: 12,
    lineHeight: 18,
    color: "#6E563E",
    fontFamily: Fonts.sans.regular,
  },
  toastCloseBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 2,
  },
  toastCloseText: {
    color: "#BE9A56",
    fontSize: 32,
    lineHeight: 32,
    fontFamily: Fonts.sans.regular,
  },
});

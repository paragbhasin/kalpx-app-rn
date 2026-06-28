import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { LiveActivityPreferenceBanner } from "../../components/LiveActivityPreferenceBanner";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AppState,
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  Vibration,
  View,
  useWindowDimensions,
} from "react-native";
import { useKeepAwake } from "expo-keep-awake";
import { useJapaEngine } from "../../engine/useJapaEngine";
import type { JapaSourceSurface } from "@kalpx/types";

function deepLinkFromSurface(surface?: JapaSourceSurface): string {
  switch (surface) {
    case 'inner_path':   return 'kalpx://mitra/inner_path/home';
    case 'daily_rhythm': return 'kalpx://mitra/rhythm_home/morning';
    case 'quick_reset':  return 'kalpx://mitra/quick_reset/home';
    default:             return 'kalpx://mitra/quick_chant/home'; // routes to QuickReset
  }
}
import { EVENT_NAMES } from '@kalpx/analytics';
import { getLiveActivityState } from "../../engine/mitraApi";
import { liveActivity } from "../../native/liveActivity";
import { logEvent } from "../../utils/initAnalytics";
import i18n from "../../config/i18n";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useTranslation } from "react-i18next";
const RudrakshSvg = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/rudraksh.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
import AudioPlayerBlock from "../AudioPlayerBlock";
import { stopRoomAmbientAudio } from "../../engine/roomAmbientAudio";
import { Fonts } from "../../theme/fonts";
import { sfs } from "../../utils/responsive";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MAX_VISUAL_BEADS = 18;
const BROWN = "#432104";

export interface MantraItem {
  title?: string;
  iast?: string;
  devanagari?: string;
  meaning?: string;
  essence?: string;
  insight?: string;
  summary?: string;
  deity?: string;
  source?: string;
  audio_url?: string;
}

export interface MantraRunnerViewProps {
  item: MantraItem;
  isViewOnly?: boolean;
  initialReps?: number;
  runnerStartTimeKey?: number | string | null;
  onComplete: (repsCompleted: number, durationSec: number) => void;
  onBack: () => void;
  isDevMode?: boolean;
  isCommunityRunner?: boolean;
  addLoading?: boolean;
  onAddToPractice?: () => void;
  // Japa engine wiring
  mantraRef?: string | null;
  sourceSurface?: JapaSourceSurface;
  // Called by parent screen's useFocusEffect so the engine syncs on nav events
  onEngineReady?: (api: {
    syncNow: () => Promise<void>;
    refreshStats: () => Promise<void>;
  }) => void;
}

const hasContent = (val: any): boolean => {
  if (!val) return false;
  if (typeof val === "string") return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === "object") return Object.keys(val).length > 0;
  return true;
};

// --- Sub-components ---

const CollapsibleCard: React.FC<{
  label: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ label, expanded, onToggle, children }) => (
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
        <Text style={styles.toggleIcon}>{expanded ? "▲" : "▼"}</Text>
      </View>
      <View style={styles.dividerLine} />
    </View>
    {expanded && <View style={styles.cardContent}>{children}</View>}
  </TouchableOpacity>
);

const MantraTextCard: React.FC<{
  text: string;
  isDevanagari?: boolean;
  expanded: boolean;
  onToggle: () => void;
}> = ({ text, isDevanagari, expanded, onToggle }) => {
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
        onTextLayout={(e) => setIsTruncated(e.nativeEvent.lines.length > 2)}
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
        {isTruncated && (
          <View style={styles.expandArrowWrap}>
            {expanded ? (
              <ChevronUp size={18} color="#B89450" />
            ) : (
              <ChevronDown size={18} color="#B89450" />
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const CommunityActionBar: React.FC<{
  addLoading?: boolean;
  onAdd?: () => void;
}> = ({ addLoading, onAdd }) => (
  <View style={styles.communityActionBar}>
    <TouchableOpacity
      onPress={onAdd}
      disabled={addLoading}
      activeOpacity={0.85}
      style={[
        styles.communityAddButton,
        addLoading && styles.communityAddButtonDisabled,
      ]}
    >
      <Text style={styles.communityAddButtonText}>
        {addLoading ? "Adding..." : "Add to My Practice"}
      </Text>
    </TouchableOpacity>
  </View>
);

// --- Main Component ---

const CommunityMantraRunnerView: React.FC<MantraRunnerViewProps> = ({
  item,
  isViewOnly,
  initialReps,
  runnerStartTimeKey,
  onComplete,
  onBack,
  isDevMode,
  isCommunityRunner,
  addLoading,
  onAddToPractice,
  mantraRef,
  sourceSurface = "inner_path",
  onEngineReady,
}) => {
  // Keep the screen awake for the whole chanting session; auto-released on unmount.
  useKeepAwake();
  const { t } = useTranslation();
  const [selectedTarget, setSelectedTarget] = useState(initialReps || 27);
  const [meaningExpanded, setMeaningExpanded] = useState(false);
  const [essenceExpanded, setEssenceExpanded] = useState(true);
  const [iastExpanded, setIastExpanded] = useState(false);
  const [devanagariExpanded, setDevanagariExpanded] = useState(false);
  const sessionStartTimeRef = useRef(Date.now());
  const isCompletingRef = useRef(false);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const interactionSize = isTablet ? 300 : 220;
  const beadOrbitRadius = isTablet ? 100 : 72;
  const onCompleteRef = useRef(onComplete);
  const isLAActiveRef = useRef(false);
  const laCompleteCalledRef = useRef(false);
  const preferredLARef = useRef<{ type: string; name: string } | null>(null);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    AsyncStorage.getItem('kalpx:preferred_la').then(raw => {
      preferredLARef.current = raw ? JSON.parse(raw) : null;
    }).catch(() => { preferredLARef.current = null; });
  }, []);

  // Reset LA tracking on new session
  useEffect(() => {
    isLAActiveRef.current = false;
    laCompleteCalledRef.current = false;
  }, [mantraRef]);

  // ── Japa engine — only active when mantraRef is provided ──────────────────
  // onGoalReached intentionally NOT wired — completion is detected in
  // handleIncrement based on localCount (starts at 0 per session).
  const japaEngine = useJapaEngine({
    mantraRef: mantraRef ?? null,
    sourceSurface,
    goalType: "count",
    goalValue: selectedTarget,
  });

  // chantCount: always use local session count for display so the counter
  // starts at 0 each session regardless of cumulative todayCount in the engine.
  const [localCount, setLocalCount] = useState(0);
  const chantCount = localCount;

  // Expose sync/refresh to parent screen so it can hook into navigation events
  useEffect(() => {
    if (!mantraRef || !onEngineReady) return;
    onEngineReady({
      syncNow: japaEngine.syncNow,
      refreshStats: japaEngine.refreshStats,
    });
  }, [mantraRef, onEngineReady, japaEngine.syncNow, japaEngine.refreshStats]);

  useEffect(() => {
    stopRoomAmbientAudio().catch(() => {});
  }, []);

  useEffect(() => {
    isCompletingRef.current = false;
    setLocalCount(0);
    setSelectedTarget(initialReps || 27);
    sessionStartTimeRef.current = Date.now();
  }, [runnerStartTimeKey]);

  const rotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 40000, easing: Easing.linear }),
      -1,
      false,
    );
    pulseScale.value = withRepeat(
      withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
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
    for (let i = 0; i < visualBeadsCount; i++) {
      const angle = (i / visualBeadsCount) * 2 * Math.PI - Math.PI / 2;
      arr.push({
        x: Math.cos(angle) * (beadOrbitRadius + 8),
        y: Math.sin(angle) * (beadOrbitRadius + 8),
        index: i,
      });
    }
    return arr;
  }, [visualBeadsCount, beadOrbitRadius]);

  const isBeadTapped = (index: number) => {
    if (selectedTarget > MAX_VISUAL_BEADS)
      return index < chantCount % visualBeadsCount;
    return index < chantCount;
  };
  const isBeadActive = (index: number) => {
    if (selectedTarget > MAX_VISUAL_BEADS)
      return index === chantCount % visualBeadsCount;
    return index === chantCount;
  };

  const handleIncrement = useCallback(() => {
    if (chantCount >= selectedTarget || isCompletingRef.current) return;
    const nextCount = chantCount + 1;
    if (mantraRef) {
      japaEngine.increment();
      setLocalCount(nextCount);

      if (nextCount >= selectedTarget && !isCompletingRef.current) {
        isCompletingRef.current = true;
        const durationSec = Math.round((Date.now() - sessionStartTimeRef.current) / 1000);
        if (isLAActiveRef.current && !laCompleteCalledRef.current) {
          laCompleteCalledRef.current = true;
          const pref = preferredLARef.current;
          const isAnchor = pref?.type === 'mantra' && pref?.name === (item.title ?? '');
          if (isAnchor) {
            // Anchor mode: preferred mantra — keep LA alive on lock screen after completion
            logEvent(EVENT_NAMES.LIVE_ACTIVITY_CHANT_KEPT_AS_ANCHOR, { activity_type: 'mantra' }).catch(() => {});
          } else {
            // Session mode: end LA and potentially transition to sankalp anchor
            liveActivity.end();
            isLAActiveRef.current = false;
            logEvent(EVENT_NAMES.LIVE_ACTIVITY_CHANT_ENDED_SESSION, { activity_type: 'mantra' }).catch(() => {});
            if (pref === null) {
              getLiveActivityState(i18n.language || 'en').then((state) => {
                if (AppState.currentState === 'active' && state.type === 'sankalp') {
                  liveActivity.startSankalp(state.title, state.line);
                }
              }).catch(() => {});
            }
          }
        }
        setTimeout(() => onCompleteRef.current(selectedTarget, durationSec), 800);
      } else {
        const curToday    = japaEngine.todayCount;
        const curWeek     = japaEngine.weekCount;
        const curLifetime = japaEngine.lifetimeCount;
        const elapsedSec  = Math.floor(japaEngine.elapsedMs / 1000);
        if (!isLAActiveRef.current) {
          if (AppState.currentState === 'active') {
            const pref = preferredLARef.current;
            const canStart = pref === null || (pref.type === 'mantra' && pref.name === (item.title ?? ''));
            if (canStart) {
              isLAActiveRef.current = true;
              const laMode = pref !== null ? 'anchor' : 'session';
              liveActivity.start(
                item.title ?? '',
                item.devanagari ?? '',
                curToday, curWeek, curLifetime, curLifetime, elapsedSec,
                deepLinkFromSurface(sourceSurface),
              );
              logEvent(EVENT_NAMES.LIVE_ACTIVITY_CHANT_STARTED, { activity_type: 'mantra', mode: laMode }).catch(() => {});
            }
          }
        } else {
          liveActivity.update(curToday, curWeek, curLifetime, curLifetime, elapsedSec);
        }
      }
    } else {
      // Fallback: legacy local-only counting (no engine wired)
      Vibration.vibrate(50);
      setLocalCount((prev) => {
        const next = prev + 1;
        if (next >= selectedTarget && !isCompletingRef.current) {
          isCompletingRef.current = true;
          const durationSec = Math.round(
            (Date.now() - sessionStartTimeRef.current) / 1000,
          );
          setTimeout(() => onCompleteRef.current(next, durationSec), 800);
        }
        return next;
      });
    }
  }, [chantCount, japaEngine, mantraRef, selectedTarget]);

  const audioUrl =
    typeof item.audio_url === "string" && item.audio_url.trim().length > 0
      ? item.audio_url.trim()
      : "";

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, isTablet && { paddingHorizontal: 40 }]}
        showsVerticalScrollIndicator={false}
      >
      {isDevMode && (
        <TouchableOpacity
          testID="test_runner_force_complete"
          accessibilityLabel="test_runner_force_complete"
          accessible={true}
          accessibilityRole="button"
          onPress={() => {
            if (isCompletingRef.current) return;
            isCompletingRef.current = true;
            const durationSec = Math.round(
              (Date.now() - sessionStartTimeRef.current) / 1000,
            );
            onComplete(selectedTarget, durationSec);
          }}
          style={{
            position: "absolute",
            top: 60,
            right: 4,
            width: 24,
            height: 24,
            opacity: 0.01,
            zIndex: 9999,
          }}
        >
          <View style={{ width: 24, height: 24 }} />
        </TouchableOpacity>
      )}

      <View style={[styles.combinedMantraFlow, isTablet && { maxWidth: 640, alignSelf: 'center' }]}>
        <Text style={[styles.mantraTitle, { marginBottom: 12 }]}>
          {item.title}
        </Text>

        {(!!item.deity || !!item.source) && (
          <Text style={styles.mantraTraditionLine}>
            {item.deity && item.source
              ? `${item.deity} — ${item.source}`
              : item.deity || item.source}
          </Text>
        )}

        {!isViewOnly && (
          <>
            <View style={styles.progressCounter}>
              <Text style={styles.currentCountText}>{chantCount}</Text>
              <Text style={styles.totalCountText}> / {selectedTarget}</Text>
            </View>

            {mantraRef &&
              (japaEngine.todayCount > 0 ||
                japaEngine.weekCount > 0 ||
                japaEngine.yearCount > 0 ||
                japaEngine.lifetimeCount > 0) && (
                <View style={styles.japaStatsRow}>
                  {japaEngine.todayCount > 0 && (
                    <Text style={styles.japaStatItem}>
                      Today {japaEngine.todayCount.toLocaleString()}
                    </Text>
                  )}
                  {japaEngine.weekCount > 0 && (
                    <Text style={styles.japaStatItem}>
                      Week {japaEngine.weekCount.toLocaleString()}
                    </Text>
                  )}
                  {japaEngine.yearCount > 0 && (
                    <Text style={styles.japaStatItem}>
                      Year {japaEngine.yearCount.toLocaleString()}
                    </Text>
                  )}
                  {japaEngine.lifetimeCount > 0 && (
                    <Text style={styles.japaStatItem}>
                      Lifetime {japaEngine.lifetimeCount.toLocaleString()}
                    </Text>
                  )}
                </View>
              )}

            <View style={[styles.interactionArea, isTablet && { width: interactionSize, height: interactionSize }]}>
              <View style={[styles.glowOuter, isTablet && { width: 290, height: 290, borderRadius: 145 }]}>
                <View style={[styles.glowMiddle, isTablet && { width: 250, height: 250, borderRadius: 125 }]}>
                  <View style={[styles.glowInner, isTablet && { width: 190, height: 190, borderRadius: 95 }]} />
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
                style={[styles.centerTapTarget, animatedCenterStyle, isTablet && { width: 140, height: 140, borderRadius: 70 }]}
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
          </>
        )}

        <View style={styles.topCardsRow}>
          {item.iast && (
            <MantraTextCard
              text={item.iast}
              expanded={iastExpanded}
              onToggle={() => setIastExpanded(!iastExpanded)}
            />
          )}
          {item.devanagari && (
            <MantraTextCard
              text={item.devanagari}
              isDevanagari
              expanded={devanagariExpanded}
              onToggle={() => setDevanagariExpanded(!devanagariExpanded)}
            />
          )}
        </View>

        {!isViewOnly && (
          <View style={styles.repPillsContainer}>
            {[1, 9, 27, 54, 108].map((option) => {
              const isSelected = option === selectedTarget;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.repPill, isSelected && styles.repPillSelected]}
                  onPress={() => {
                    setSelectedTarget(option);
                    setLocalCount(0);
                  }}
                >
                  <Text
                    style={[
                      styles.repPillText,
                      isSelected && styles.repPillTextSelected,
                    ]}
                  >
                    {option}
                    {isSelected && " ✓"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {!!audioUrl && (
          <View
            style={{ width: "100%", marginBottom: 30, paddingHorizontal: 10 }}
          >
            <AudioPlayerBlock
              block={{
                audio_url: audioUrl,
                label: item.title || "Mantra Audio",
              }}
            />
          </View>
        )}

        <View style={styles.collapsibleSectionsCombined}>
          {hasContent(item.meaning) || hasContent(item.summary) ? (
            <CollapsibleCard
              label={t("quickReset.meaning")}
              expanded={meaningExpanded}
              onToggle={() => setMeaningExpanded(!meaningExpanded)}
            >
              <Text style={styles.cardText}>
                {item.meaning || item.summary}
              </Text>
            </CollapsibleCard>
          ) : null}

          <View style={{ height: 12 }} />

          {hasContent(item.essence) || hasContent(item.insight) ? (
            <CollapsibleCard
              label={t("quickReset.essence")}
              expanded={essenceExpanded}
              onToggle={() => setEssenceExpanded(!essenceExpanded)}
            >
              <Text style={styles.cardText}>{item.essence}</Text>
            </CollapsibleCard>
          ) : null}
        </View>

        <TouchableOpacity onPress={onBack} style={styles.backLink}>
          <Text style={styles.backLinkText}>{t("quickReset.back")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    {!isViewOnly && (
      <LiveActivityPreferenceBanner
        experienceType="mantra"
        experienceName={item.title ?? ''}
        onActivate={() => {
          if (!isLAActiveRef.current) {
            isLAActiveRef.current = true;
          }
          liveActivity.start(
            item.title ?? '',
            item.devanagari ?? '',
            japaEngine.todayCount,
            japaEngine.weekCount,
            japaEngine.lifetimeCount,
            japaEngine.lifetimeCount,
            Math.floor(japaEngine.elapsedMs / 1000),
            deepLinkFromSurface(sourceSurface),
          );
        }}
      />
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    alignItems: "center",
  },
  combinedMantraFlow: {
    width: "100%",
    alignItems: "center",
    paddingTop: 40,
  },
  mantraTitle: {
    fontSize: sfs(23),
    fontFamily: Fonts.serif.bold,
    color: BROWN,
    textAlign: "center",
    marginTop: -20,
  },
  mantraTraditionLine: {
    fontSize: sfs(11),
    letterSpacing: 1.3,
    fontFamily: Fonts.sans.medium,
    color: "#B89450",
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 14,
    marginTop: -6,
  },
  progressCounter: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: -30,
    marginBottom:30
  },
  currentCountText: {
    fontSize: sfs(64),
    fontFamily: Fonts.serif.regular,
    color: "#b89450",
  },
  totalCountText: {
    fontSize: sfs(32),
    fontFamily: Fonts.serif.regular,
    color: "#d1c1a1",
  },
  interactionArea: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  glowOuter: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    alignItems: "center",
    justifyContent: "center",
  },
  glowMiddle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    shadowColor: Platform.OS === "ios" ? "#E8C587" : "transparent",
    shadowOffset:
      Platform.OS === "ios" ? { width: 0, height: 0 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === "ios" ? 0.8 : 0,
    shadowRadius: Platform.OS === "ios" ? 20 : 0,
    elevation: Platform.OS === "android" ? 0 : 8,
    alignItems: "center",
    justifyContent: "center",
  },
  glowInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: Platform.OS === "ios" ? "#E8C587" : "transparent",
    shadowOffset:
      Platform.OS === "ios" ? { width: 0, height: 0 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === "ios" ? 0.8 : 0,
    shadowRadius: Platform.OS === "ios" ? 20 : 0,
    elevation: Platform.OS === "android" ? 0 : 8,
  },
  beadsRing: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  ringCircle: {
    position: "absolute",
    width: 144,
    height: 144,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fffdf9",
    borderWidth: 1,
    borderColor: "#e8c587",
    elevation: Platform.OS === "android" ? 0 : 4,
    shadowColor: Platform.OS === "ios" ? "#b89450" : "transparent",
    shadowOffset:
      Platform.OS === "ios" ? { width: 0, height: 2 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === "ios" ? 0.1 : 0,
    shadowRadius: Platform.OS === "ios" ? 6 : 0,
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
    fontSize: sfs(20),
    letterSpacing: 4,
    fontFamily: Fonts.sans.bold,
    color: "#b89450",
  },
  subTap: {
    fontSize: sfs(10),
    letterSpacing: 1,
    color: "#8a7a5a",
    fontFamily: Fonts.sans.medium,
    marginTop: 2,
  },
  tapCheck: {
    marginTop: 5,
  },
  topCardsRow: {
    width: "100%",
    marginTop: 20,
    marginBottom: 0,
    gap: 12,
  },
  repPillsContainer: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    gap: Platform.OS === "android" ? 6 : 10,
    marginTop: 20,
    width: "100%",
    paddingHorizontal: Platform.OS === "android" ? 2 : 5,
    marginBottom: 25,
  },
  repPill: {
    minWidth: Platform.OS === "android" ? 48 : 56,
    paddingHorizontal: Platform.OS === "android" ? 10 : 16,
    paddingVertical: Platform.OS === "android" ? 7 : 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e8c587",
    backgroundColor: "transparent",
    alignItems: "center",
  },
  repPillSelected: {
    backgroundColor: "#b89450",
    borderColor: "#b89450",
  },
  repPillText: {
    fontFamily: Fonts.sans.medium,
    fontSize: Platform.OS === "android" ? sfs(13) : sfs(14),
    color: "#8a7a5a",
  },
  repPillTextSelected: {
    color: "#fff",
  },
  collapsibleSectionsCombined: {
    width: "100%",
    paddingHorizontal: 0,
    marginBottom: 40,
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(184, 148, 80, 0.1)",
    padding: 15,
  },
  cardExpanded: {},
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
  headerLabelGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardLabel: {
    fontSize: sfs(18),
    fontFamily: Fonts.serif.bold,
    color: BROWN,
    marginHorizontal: 12,
  },
  toggleIcon: {
    fontSize: sfs(12),
    color: "#D4A017",
    display: "flex",
    alignItems: "center",
    alignSelf: "center",
  },
  cardContent: {
    marginTop: 12,
  },
  cardText: {
    fontSize: sfs(16),
    lineHeight: sfs(24),
    color: "#5a3c21",
    fontFamily: Fonts.serif.regular,
    textAlign: "center",
  },
  verseTextGroup: {
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
    fontSize: sfs(13),
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#615247",
    fontFamily: Fonts.sans.regular,
    textAlign: "center",
    lineHeight: 18,
  },
  verseDevanagari: {
    fontFamily: "NotoSansDevanagari_500Medium",
    fontSize: sfs(15),
    color: "#615247",
    textAlign: "center",
  },
  expandArrowWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    opacity: 0.6,
  },
  communityActionBar: {
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  communityAddButton: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D9BC76",
    backgroundColor: "rgba(255,248,239,0.92)",
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  communityAddButtonDisabled: {
    opacity: 0.65,
  },
  communityAddButtonText: {
    color: "#B88413",
    fontFamily: Fonts.sans.bold,
    fontSize: sfs(14),
  },
  backLink: {
    paddingVertical: 1,
  },
  backLinkText: {
    fontSize: sfs(16),
    fontFamily: Fonts.serif.regular,
    color: BROWN,
    textDecorationLine: "underline",
  },
  japaStatsRow: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: -8,
    marginBottom: 4,
  },
  japaStatItem: {
    fontSize: 11,
    color: "#b89450",
    fontFamily: Fonts.sans.regular,
    letterSpacing: 0.4,
    opacity: 0.8,
  },
});

export default CommunityMantraRunnerView;

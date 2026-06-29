/**
 * RhythmHomeScreen — My Rhythm door destination.
 *
 * Reads companion_rhythm from Redux doorSlice.homeData.companion_rhythm.
 * If has_rhythm === false: empty state + "Set up My Rhythm" button.
 * If has_rhythm === true: morning/afternoon/night band cards.
 */

import { useTranslation } from "react-i18next";
import { RHYTHM_BAND_LABELS } from "@kalpx/contracts";
import type { RhythmItem, RhythmTimeBand } from "@kalpx/types";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import LibrarySearchModal, {
  type LibrarySearchItem,
} from "../../components/LibrarySearchModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getLiveActivityState,
  mitraJourneyHomeV3,
  mitraRhythmResolveItem,
  postRhythmItemAdd,
} from "../../engine/mitraApi";
import { liveActivity } from "../../native/liveActivity";
import { rememberRunnerRoute } from "../../utils/deeplink";
import { useScreenStore } from "../../engine/useScreenBridge";
import { setHomeData } from "../../store/doorSlice";
import { screenActions } from "../../store/screenSlice";
import { Fonts } from "../../theme/fonts";
import { platformShadow } from "../../theme/shadows";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { sfs } from "../../utils/responsive";

const RHYTHM_BG = require("../../../assets/beige_bg.webp");

function formatReminderTime(hms: string): string {
  const [h, m] = hms.split(":").map(Number);
  const suffix = h < 12 ? "AM" : "PM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function beginLabel(itemType: string, t: (key: string) => string): string {
  if (itemType === "mantra") return t("rhythmHome.beginChanting");
  if (itemType === "sankalp") return t("rhythmHome.beginEmbodying");
  return t("rhythmHome.beginPractice");
}

function itemHeldLabel(itemType: string, t: (key: string) => string): string {
  if (itemType === "mantra") return t("rhythmHome.heldToday.mantra");
  if (itemType === "sankalp") return t("rhythmHome.heldToday.sankalp");
  if (itemType === "practice") return t("rhythmHome.heldToday.practice");
  if (itemType === "reflection") return t("rhythmHome.heldToday.reflection");
  return t("rhythmHome.heldToday.default");
}

function cardLabel(itemType: string, t: (key: string) => string): string {
  if (itemType === "mantra") return t("rhythmHome.badge.mantra");
  if (itemType === "sankalp") return t("rhythmHome.badge.sankalp");
  if (itemType === "reflection") return t("rhythmHome.badge.reflection");
  return t("rhythmHome.badge.practice");
}

function itemDuration(item: RhythmItem): string | null {
  const rawDuration = (item as any).duration_minutes;
  if (typeof rawDuration === "number" && Number.isFinite(rawDuration)) {
    return `${rawDuration} min`;
  }
  return null;
}

function RhythmItemCard({
  item,
  onAction,
  resolving,
  held,
  isTablet,
  t,
}: {
  item: RhythmItem;
  onAction: () => void;
  resolving?: boolean;
  held?: boolean;
  isTablet?: boolean;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const cardContent = (
    <>
      <View style={styles.cardTopRow}>
        <Text style={[styles.itemTypeBadge, isTablet && { fontSize: 13, paddingHorizontal: 10, paddingVertical: 6 }]}>{cardLabel(item.item_type, t)}</Text>
        {!!itemDuration(item) && (
          <Text style={[styles.durationText, isTablet && { fontSize: 17 }]}>{itemDuration(item)}</Text>
        )}
      </View>
      <Text style={[styles.itemTitle, isTablet && { fontSize: 22, marginBottom: 28 }]}>{item.title_snapshot}</Text>
      <View style={styles.cardDivider}>
        <View style={styles.cardDividerLine} />
        <Image
          source={require("../../../assets/lotus_icon.png")}
          style={[styles.cardDividerLotus, isTablet && { width: 28, height: 22 }]}
          resizeMode="contain"
        />
        <View style={styles.cardDividerLine} />
      </View>
      {item.reminder_enabled && item.reminder_time ? (
        <Text style={styles.reminderLine}>
          {t("rhythmHome.reminderLine", { time: formatReminderTime(item.reminder_time) })}
        </Text>
      ) : null}
      {/* On mobile: description inside card; on tablet: moved to right panel */}
      {!isTablet && item.description_snapshot ? (
        <Text style={styles.itemDescription}>{item.description_snapshot}</Text>
      ) : null}
      {!!held && (
        <Text style={styles.itemHeldLabel}>
          {itemHeldLabel(item.item_type, t)}
        </Text>
      )}
      <TouchableOpacity
        style={[styles.actionBtn, resolving && styles.actionBtnResolving, isTablet && { paddingVertical: 14 }]}
        onPress={resolving ? undefined : onAction}
        activeOpacity={resolving ? 1 : 0.8}
      >
        <Text style={[styles.actionBtnSparkle, isTablet && { fontSize: 22 }]}>✦</Text>
        <Text style={[styles.actionBtnText, isTablet && { fontSize: 20 }]}>
          {resolving ? t("rhythmHome.opening") : beginLabel(item.item_type, t)}
        </Text>
      </TouchableOpacity>
    </>
  );

  if (isTablet && item.description_snapshot) {
    return (
      <View style={[styles.itemCard, styles.itemCardTablet]}>
        <View style={styles.tabletLeftPanel}>{cardContent}</View>
        <View style={styles.tabletPanelDivider} />
        <View style={styles.tabletRightPanel}>
          <Text style={styles.tabletMeaningLabel}>MEANING</Text>
          <Text style={styles.tabletMeaningText}>{item.description_snapshot}</Text>
        </View>
      </View>
    );
  }

  return <View style={styles.itemCard}>{cardContent}</View>;
}

function slotHeldLabel(band: RhythmTimeBand, t: (key: string) => string): string {
  if (band === "morning") return t("rhythmHome.bandHeld.morning");
  if (band === "afternoon") return t("rhythmHome.bandHeld.afternoon");
  return t("rhythmHome.bandHeld.night");
}

function RhythmBand({
  band,
  items,
  onItemAction,
  resolvingItemId,
  onAddItem,
  isTablet,
  t,
}: {
  band: RhythmTimeBand;
  items: RhythmItem[];
  onItemAction: (item: RhythmItem) => void;
  resolvingItemId?: string | null;
  onAddItem: (band: RhythmTimeBand) => void;
  isTablet?: boolean;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  if (items.length === 0) return null;
  const slotHeld =
    items.length > 0 && items.every((i) => i.completed_today === true);
  return (
    <View style={styles.band}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <Text style={[styles.bandLabel, isTablet && { fontSize: 17 }]}>
          {t(`rhythmHome.bandTitle.${band}`, { defaultValue: `${RHYTHM_BAND_LABELS[band]} Practice` })}
        </Text>
        {slotHeld && (
          <Text style={styles.bandHeldLabel}>{slotHeldLabel(band, t)}</Text>
        )}
      </View>
      <View style={styles.bandDivider}>
        <View style={styles.bandDividerLine} />
        <Text style={styles.bandDividerDiamond}>◇</Text>
        <View style={styles.bandDividerLine} />
      </View>
      {items.map((item) => (
        <RhythmItemCard
          key={item.rhythm_item_id}
          item={item}
          onAction={() => onItemAction(item)}
          resolving={resolvingItemId === item.item_id}
          held={item.completed_today === true}
          isTablet={isTablet}
          t={t}
        />
      ))}
      <TouchableOpacity
        onPress={() => onAddItem(band)}
        activeOpacity={0.7}
        style={[styles.addToSlotBtn, isTablet && { paddingVertical: 14 }]}
      >
        <Text style={[styles.addToSlotText, isTablet && { fontSize: 16 }]}>{t("rhythmHome.addToRhythm", { band })}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function RhythmHomeScreen({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const homeData = useSelector((state: any) => state.door?.homeData);
  const rhythm = homeData?.companion_rhythm;

  const hasRhythm = rhythm?.has_rhythm === true;

  const [resolvingItemId, setResolvingItemId] = useState<string | null>(null);
  const [homeBand, setHomeBand] = useState<RhythmTimeBand | null>(null);
  const lastLABandRef = useRef<RhythmTimeBand | null>(null);
  // Captures the just-completed band so the Sankalp transition deep link uses the correct band.
  const completedRhythmBandRef = useRef<string | null>(null);

  // Holds the user's chosen LA preference. When set, it has priority — the
  // Daily Rhythm LA must never override it, even on explicit actions.
  const preferredLARef = useRef<{ type: string; name: string } | null>(null);
  useEffect(() => {
    AsyncStorage.getItem('kalpx:preferred_la').then(raw => {
      preferredLARef.current = raw ? JSON.parse(raw) : null;
    }).catch(() => { preferredLARef.current = null; });
  }, []);

  const screenBridge = useScreenStore();
  const screenBridgeRef = useRef(screenBridge);

  // Re-fetch homeData when locale changes so item titles update in the new language
  const homeLocaleRef = useRef(i18n.language);
  useEffect(() => {
    const prev = homeLocaleRef.current;
    homeLocaleRef.current = i18n.language;
    if (i18n.language === prev) return;
    mitraJourneyHomeV3({ forceFresh: true, locale: i18n.language || 'en' })
      .then((fresh) => { if (fresh) dispatch(setHomeData(fresh)); })
      .catch(() => {});
  }, [i18n.language, dispatch]);
  useEffect(() => {
    screenBridgeRef.current = screenBridge;
  });

  useFocusEffect(
    useCallback(() => {
      screenBridgeRef.current.updateBackground(RHYTHM_BG);
      // P0-D: refresh home data on focus so slot completion state is current after runner return
      mitraJourneyHomeV3({ forceFresh: true, locale: i18n.language || 'en' })
        .then((fresh) => {
          if (fresh) {
            dispatch(setHomeData(fresh));
            // End Rhythm LA if the band the user was working on is now complete
            const b = lastLABandRef.current;
            if (b) {
              const bandItems: RhythmItem[] = (fresh as any).companion_rhythm?.[b]?.items ?? [];
              const done = bandItems.length > 0 && bandItems.every((i: RhythmItem) => i.completed_today === true);
              if (done) {
                completedRhythmBandRef.current = b;
                lastLABandRef.current = null;
                liveActivity.updateRhythm(true);
                setTimeout(() => liveActivity.endRhythm(), 3_000);
              }
            }
          }
        })
        .catch(() => {});
      // No preference → default (start sankalp if type matches).
      // Preference exists → only start if it matches.
      Promise.all([
        getLiveActivityState(i18n.language || 'en'),
        AsyncStorage.getItem('kalpx:preferred_la'),
      ]).then(([state, preferredRaw]) => {
        if (AppState.currentState !== 'active') return;
        const pref = preferredRaw ? JSON.parse(preferredRaw) : null;
        const band = completedRhythmBandRef.current;
        completedRhythmBandRef.current = null;
        const deepLink = band ? `kalpx://mitra/rhythm_home/${band}?source=la` : 'kalpx://mitra/rhythm_home?source=la';
        if (pref?.type === 'practice') {
          // Practice anchor: show the practice on lock screen; server state type is irrelevant.
          // Prefer stored deepLink (has the exact slot) over the generic computed one.
          liveActivity.startSankalp(pref.name, pref.line ?? '', pref.deepLink || deepLink, pref.type);
          return;
        }
        if (state.type !== 'sankalp') return;
        if (!pref || (pref.type === 'sankalp' && pref.name === state.title)) {
          liveActivity.startSankalp(state.title, state.line, deepLink);
        }
      }).catch(() => {});
    }, [dispatch, i18n.language]),
  );

  const openRhythmSetup = useCallback(() => {
    navigation.navigate("RhythmSetup" as any);
  }, [navigation]);

  const openRhythmEdit = useCallback(() => {
    navigation.navigate("RhythmEdit" as any);
  }, [navigation]);



  const handleHomeBandItemSelected = useCallback(
    async (picked: LibrarySearchItem) => {
      if (!homeBand) return;
      const slot = homeBand;
      const slotItems: RhythmItem[] =
        homeData?.companion_rhythm?.[slot]?.items ?? [];
      const pickedItemId = picked.itemId || (picked as any).item_id || "";
      const alreadyInSlot = slotItems.some((i) => i.item_id === pickedItemId);
      setHomeBand(null);
      if (alreadyInSlot) return;
      try {
        await postRhythmItemAdd({
          slot,
          item_type: ((picked as any).item_type ||
            picked.itemType ||
            "practice") as any,
          item_id: pickedItemId,
          title_snapshot: picked.title,
          description_snapshot: picked.description ?? null,
          source: "user_chosen",
          sort_order: slotItems.length + 1,
          reminder_enabled: false,
          reminder_time: null,
        });
        const fresh = await mitraJourneyHomeV3({ forceFresh: true });
        dispatch(setHomeData(fresh));
      } catch (e: any) {
        console.warn("[RhythmHome] addItem failed", e?.message);
      }
    },
    [homeBand, homeData, dispatch],
  );

  async function handleItemAction(item: RhythmItem, band: RhythmTimeBand) {
    if (resolvingItemId) return;
    setResolvingItemId(item.item_id);
    let enrichedItem: Record<string, unknown> = {
      item_id: item.item_id,
      title_snapshot: item.title_snapshot,
      description_snapshot: item.description_snapshot ?? "",
      item_type: item.item_type,
    };
    try {
      const resolved = await mitraRhythmResolveItem(
        band,
        item.item_id,
        item.item_type,
        i18n.language || 'en',
      );
      if (resolved?.resolved) {
        enrichedItem = {
          ...enrichedItem,
          ...resolved,
          title_snapshot:
            item.title_snapshot ||
            resolved.title ||
            resolved.title_snapshot ||
            "",
          description_snapshot:
            item.description_snapshot ||
            resolved.description_snapshot ||
            resolved.subtitle ||
            "",
        };
      }
    } catch {
      // fall through with snapshot item
    } finally {
      setResolvingItemId(null);
    }
    const journeyId = String(
      (homeData as any)?.inner_path_summary?.journey_id ?? "",
    );
    const dayNumber = Number((homeData as any)?.day_number) || 0;

    // Start Daily Rhythm LA on explicit user action (not on screen mount).
    // If the user has chosen a preferred LA, it has priority — never override it.
    if (preferredLARef.current === null) {
      const anchorDevanagari = item.item_type === 'mantra'
        ? String((enrichedItem as any).devanagari ?? (enrichedItem as any).devanagari_snapshot ?? '')
        : '';
      liveActivity.startRhythm(
        band,
        String(RHYTHM_BAND_LABELS[band] ?? band),
        String(enrichedItem.title_snapshot ?? item.title_snapshot ?? ''),
        item.item_type,
        anchorDevanagari,
      );
      lastLABandRef.current = band;
    }

    const runnerName =
      item.item_type === "mantra" ? "RhythmMantraRunner"
      : item.item_type === "sankalp" ? "RhythmSankalpRunner"
      : "RhythmPracticeRunner";
    const runnerParams = { item: enrichedItem, slot: band, journeyId, dayNumber };
    // Remember this runner so tapping the Daily Rhythm Live Activity returns here.
    rememberRunnerRoute("rhythm_home", runnerName, runnerParams);
    navigation.navigate(runnerName as any, runnerParams);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + insets.bottom + 16 },
          isTablet && { paddingHorizontal: 32, paddingTop: 36 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.shell, isTablet && { maxWidth: 820 }]}>
          <Text style={[styles.headerTitle, isTablet && { fontSize: 38, marginBottom: 6 }]}>{t("rhythmHome.title")}</Text>

          {!hasRhythm ? (
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyTitle}>
                {t("rhythmHome.emptyState")}
              </Text>
              <TouchableOpacity
                style={styles.setupBtn}
                onPress={openRhythmSetup}
                activeOpacity={0.8}
              >
                <Text style={styles.setupBtnText}>{t("rhythmHome.setupCta")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {(["morning", "afternoon", "night"] as RhythmTimeBand[]).map(
                (band) => (
                  <RhythmBand
                    key={band}
                    band={band}
                    items={rhythm?.[band]?.items ?? []}
                    onItemAction={(item) => void handleItemAction(item, band)}
                    resolvingItemId={resolvingItemId}
                    onAddItem={setHomeBand}
                    isTablet={isTablet}
                    t={t}
                  />
                ),
              )}

              <TouchableOpacity
                onPress={openRhythmEdit}
                activeOpacity={0.8}
                style={[styles.editRhythmBtn, isTablet && { paddingVertical: 16 }]}
              >
                <Text style={[styles.editRhythmBtnText, isTablet && { fontSize: 19 }]}>{t("rhythmHome.editCta")}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
      <LibrarySearchModal
        isVisible={homeBand !== null}
        onClose={() => setHomeBand(null)}
        onItemAdded={() => {}}
        mode="select_for_rhythm"
        onItemSelected={handleHomeBandItemSelected}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerTitle: {
    fontSize: sfs(28),
    fontFamily: Fonts.serif.bold,
    color: "#432104",
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  shell: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    position: "relative",
  },
  emptyStateCard: {
    backgroundColor: "rgba(250,245,240,0.95)",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.25)",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: sfs(17),
    fontFamily: Fonts.serif.regular,
    color: "#432104",
    textAlign: "center",
    marginBottom: 20,
  },
  setupBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#C99317",
  },
  setupBtnText: {
    fontSize: sfs(16),
    fontFamily: Fonts.serif.bold,
    color: "#fff",
  },
  band: {
    marginBottom: 8,
  },
  bandLabel: {
    fontSize: sfs(14),
    fontFamily: Fonts.serif.regular,
    color: "#432104",
  },
  bandHeldLabel: {
    fontSize: sfs(11),
    fontFamily: Fonts.serif.bold,
    color: "#7A9E7E",
    marginBottom: 2,
    backgroundColor: "#EAF7EE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#7A9E7E",
  },
  bandDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  itemHeldLabel: {
    fontFamily: Fonts.serif.bold,
    fontSize: sfs(13),
    color: "#7A9E7E",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  bandDividerLine: {
    width: 35,
    height: 1,
    backgroundColor: "rgba(210,166,61,0.45)",
  },
  bandDividerDiamond: {
    fontSize: sfs(14),
    color: "#D2A63D",
  },
  itemCard: {
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.35)",
    borderRadius: 28,
    backgroundColor: Platform.OS === "android" ? "#FDF9F3" : "rgba(255,252,247,0.9)",
    padding: 15,
    marginBottom: 18,
    ...platformShadow("#C9A84C", 18, 0.08, 24, 4),
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 22,
  },
  itemTypeBadge: {
    fontSize: sfs(12),
    fontFamily: Fonts.sans.bold,
    letterSpacing: 1.4,
    color: "#A97C14",
    textTransform: "uppercase",
    backgroundColor: "#F6EED8",
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    overflow: "hidden",
  },
  durationText: {
    fontSize: sfs(15),
    color: "#8B6A43",
    fontFamily: Fonts.sans.regular,
  },
  itemTitle: {
    fontSize: sfs(18),
    fontFamily: Fonts.serif.bold,
    color: "#432104",
    textAlign: "center",
    marginBottom: 24,
  },
  cardDivider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    marginBottom: 8,
  },
  cardDividerLine: {
    width: 86,
    height: 1,
    backgroundColor: "rgba(210,166,61,0.45)",
  },
  cardDividerLotus: {
    width: 22,
    height: 18,
    tintColor: "#D2A63D",
  },
  itemDescription: {
    fontSize: sfs(16),
    fontFamily: Fonts.serif.regular,
    textAlign: "center",
    color: "#7A6040",
    lineHeight: sfs(30),
    marginBottom: 28,
  },
  actionBtn: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 11,
    borderWidth: 0,
    backgroundColor: "#C99317",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    ...platformShadow("#C99317", 18, 0.24, 20, 4),
  },
  actionBtnSparkle: {
    fontSize: sfs(20),
    lineHeight: sfs(20),
    color: "#fff",
  },
  actionBtnResolving: {
    opacity: 0.7,
  },
  actionBtnText: {
    fontSize: sfs(18),
    fontFamily: Fonts.serif.bold,
    color: "#fff",
  },
  editRhythmBtn: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.55)",
    backgroundColor: Platform.OS === "android" ? "#FDF9F3" : "rgba(255,252,247,0.6)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 40,
  },
  editRhythmBtnText: {
    fontSize: sfs(17),
    fontFamily: Fonts.sans.regular,
    color: "#7B6550",
  },
  reminderLine: {
    fontSize: sfs(11),
    color: "rgba(67,33,4,0.5)",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  addToSlotBtn: {
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#d4a01b",
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginTop: 12,
    alignItems: "center",
  },
  addToSlotText: {
    fontSize: sfs(13),
    fontStyle: "italic",
    color: "#432104",
    fontFamily: Fonts.sans.regular,
  },

  // ── Tablet two-column card layout ──────────────────────────────────────
  itemCardTablet: {
    flexDirection: "row",
    alignItems: "stretch",
    padding: 0,
    overflow: "hidden",
  },
  tabletLeftPanel: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  tabletPanelDivider: {
    width: 1,
    backgroundColor: "rgba(201,168,76,0.28)",
    marginVertical: 20,
  },
  tabletRightPanel: {
    flex: 1,
    padding: 24,
    justifyContent: "flex-start",
  },
  tabletMeaningLabel: {
    fontSize: sfs(12),
    fontFamily: Fonts.sans.bold,
    letterSpacing: 1.6,
    color: "#A97C14",
    textTransform: "uppercase",
    backgroundColor: "#F6EED8",
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    overflow: "hidden",
    alignSelf: "flex-start",
    marginBottom: 18,
  },
  tabletMeaningText: {
    fontSize: sfs(17),
    fontFamily: Fonts.serif.regular,
    color: "#7A6040",
    lineHeight: sfs(30),
  },
});

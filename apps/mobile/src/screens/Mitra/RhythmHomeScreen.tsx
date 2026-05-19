/**
 * RhythmHomeScreen — My Rhythm door destination.
 *
 * Reads companion_rhythm from Redux doorSlice.homeData.companion_rhythm.
 * If has_rhythm === false: empty state + "Set up My Rhythm" button.
 * If has_rhythm === true: morning/afternoon/night band cards.
 */

import { RHYTHM_BAND_LABELS } from "@kalpx/contracts";
import type { RhythmItem, RhythmTimeBand } from "@kalpx/types";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import LibrarySearchModal, {
  type LibrarySearchItem,
} from "../../components/LibrarySearchModal";
import { executeAction } from "../../engine/actionExecutor";
import {
  mitraJourneyHomeV3,
  mitraRhythmResolveItem,
  postRhythmItemAdd,
} from "../../engine/mitraApi";
import { useScreenStore } from "../../engine/useScreenBridge";
import { setHomeData } from "../../store/doorSlice";
import {
  goBackWithData,
  loadScreenWithData,
  screenActions,
} from "../../store/screenSlice";
import { Fonts } from "../../theme/fonts";

const RHYTHM_BG = require("../../../assets/beige_bg.png");

function formatReminderTime(hms: string): string {
  const [h, m] = hms.split(":").map(Number);
  const suffix = h < 12 ? "AM" : "PM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function beginLabel(itemType: string): string {
  if (itemType === "mantra") return "Begin Chanting";
  if (itemType === "sankalp") return "Begin Embodying";
  return "Begin Practice";
}

function cardLabel(itemType: string): string {
  if (itemType === "mantra") return "MANTRA";
  if (itemType === "sankalp") return "SANKALP";
  if (itemType === "reflection") return "REFLECTION";
  return "PRACTICE";
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
}: {
  item: RhythmItem;
  onAction: () => void;
  resolving?: boolean;
}) {
  return (
    <View style={styles.itemCard}>
      <View style={styles.cardTopRow}>
        <Text style={styles.itemTypeBadge}>{cardLabel(item.item_type)}</Text>
        {!!itemDuration(item) && (
          <Text style={styles.durationText}>{itemDuration(item)}</Text>
        )}
      </View>
      <Text style={styles.itemTitle}>{item.title_snapshot}</Text>
      <View style={styles.cardDivider}>
        <View style={styles.cardDividerLine} />
        <Image
          source={require("../../../assets/lotus_icon.png")}
          style={styles.cardDividerLotus}
          resizeMode="contain"
        />
        <View style={styles.cardDividerLine} />
      </View>
      {item.reminder_enabled && item.reminder_time ? (
        <Text style={styles.reminderLine}>
          Mitra will gently remind you at{" "}
          {formatReminderTime(item.reminder_time)}
        </Text>
      ) : null}
      {item.description_snapshot ? (
        <Text style={styles.itemDescription}>{item.description_snapshot}</Text>
      ) : null}
      <TouchableOpacity
        style={[styles.actionBtn, resolving && styles.actionBtnResolving]}
        onPress={resolving ? undefined : onAction}
        activeOpacity={resolving ? 1 : 0.8}
      >
        <Text style={styles.actionBtnSparkle}>✦</Text>
        <Text style={styles.actionBtnText}>
          {resolving ? "Opening…" : beginLabel(item.item_type)}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function RhythmBand({
  band,
  items,
  onItemAction,
  resolvingItemId,
  onAddItem,
  slotDone,
}: {
  band: RhythmTimeBand;
  items: RhythmItem[];
  onItemAction: (item: RhythmItem) => void;
  resolvingItemId?: string | null;
  onAddItem: (band: RhythmTimeBand) => void;
  slotDone?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <View style={styles.band}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Text style={styles.bandLabel}>{RHYTHM_BAND_LABELS[band]} Practice</Text>
        {slotDone && <Text style={styles.bandDoneLabel}>✓ Done today</Text>}
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
        />
      ))}
      <TouchableOpacity
        onPress={() => onAddItem(band)}
        activeOpacity={0.7}
        style={styles.addToSlotBtn}
      >
        <Text style={styles.addToSlotText}>Add to your {band} rhythm</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function RhythmHomeScreen({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const homeData = useSelector((state: any) => state.door?.homeData);
  const rhythm = homeData?.companion_rhythm;

  const hasRhythm = rhythm?.has_rhythm === true;

  const [resolvingItemId, setResolvingItemId] = useState<string | null>(null);
  const [homeBand, setHomeBand] = useState<RhythmTimeBand | null>(null);

  const screenBridge = useScreenStore();
  const screenBridgeRef = useRef(screenBridge);
  useEffect(() => {
    screenBridgeRef.current = screenBridge;
  });

  const buildActionContext = useCallback(() => {
    return {
      screenState: screenBridgeRef.current.screenData || {},
      setScreenValue: (value: any, key: string) => {
        dispatch(screenActions.setScreenValue({ key, value }));
      },
      loadScreen: (target: any) => {
        const containerId =
          typeof target === "string"
            ? "generic"
            : target?.container_id || target?.containerId || "generic";
        const stateId =
          typeof target === "string"
            ? target
            : target?.state_id || target?.stateId || "";
        dispatch(loadScreenWithData({ containerId, stateId }) as any);
        navigation.navigate("DynamicEngine");
      },
      goBack: () => {
        dispatch(goBackWithData() as any);
      },
      currentScreen: screenBridgeRef.current.currentScreen,
    };
  }, [dispatch, navigation]);

  useFocusEffect(
    useCallback(() => {
      screenBridgeRef.current.updateBackground(RHYTHM_BG);
      // P0-D: refresh home data on focus so slot completion state is current after runner return
      mitraJourneyHomeV3({ forceFresh: true })
        .then((fresh) => { if (fresh) dispatch(setHomeData(fresh)); })
        .catch(() => {});
    }, [dispatch]),
  );

  const openRhythmSetup = useCallback(() => {
    navigation.navigate("RhythmSetup" as any);
  }, [navigation]);

  const openRhythmEdit = useCallback(() => {
    navigation.navigate("RhythmEdit" as any);
  }, [navigation]);

  const handleBack = useCallback(() => {
    if (embedded) {
      dispatch(
        screenActions.setScreenValue({
          key: "dashboard_entry_surface",
          value: null,
        }),
      );
    }
    navigation.goBack();
  }, [dispatch, embedded, navigation]);

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
    } catch (_) {
      // fall through with snapshot item
    } finally {
      setResolvingItemId(null);
    }
    dispatch(
      screenActions.setScreenValue({ key: "practice_launch_surface", value: "rhythm" }),
    );
    void executeAction(
      {
        type: "start_runner",
        payload: {
          source: "rhythm_daily",
          variant: item.item_type,
          rhythm_slot: band,
          item: enrichedItem,
        },
      } as any,
      buildActionContext() as any,
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.shell}>
          <Image
            source={require("../../../../web/public/leaves-bird.png")}
            style={styles.heroLeaves}
          />

          <Text style={styles.headerTitle}>My Rhythm</Text>

          {!hasRhythm ? (
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyTitle}>
                You haven't set up your rhythm yet.
              </Text>
              <TouchableOpacity
                style={styles.setupBtn}
                onPress={openRhythmSetup}
                activeOpacity={0.8}
              >
                <Text style={styles.setupBtnText}>Set up My Rhythm</Text>
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
                    slotDone={(rhythm as any)?.[`${band}_done`] === true}
                    onItemAction={(item) => void handleItemAction(item, band)}
                    resolvingItemId={resolvingItemId}
                    onAddItem={setHomeBand}
                  />
                ),
              )}

              <TouchableOpacity
                onPress={openRhythmEdit}
                activeOpacity={0.8}
                style={styles.editRhythmBtn}
              >
                <Text style={styles.editRhythmBtnText}>Edit My Rhythm</Text>
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
    fontSize: 28,
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
  heroLeaves: {
    position: "absolute",
    top: -140,
    right: -60,
    width: 300,
    height: 300,

    resizeMode: "contain",
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
    fontSize: 17,
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
    fontSize: 16,
    fontFamily: Fonts.serif.bold,
    color: "#fff",
  },
  band: {
    marginBottom: 8,
  },
  bandLabel: {
    fontSize: 14,
    fontFamily: Fonts.serif.regular,
    color: "#432104",
  },
  bandDoneLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#7A9E7E",
    marginBottom: 2,
  },
  bandDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  bandDividerLine: {
    width: 35,
    height: 1,
    backgroundColor: "rgba(210,166,61,0.45)",
  },
  bandDividerDiamond: {
    fontSize: 14,
    color: "#D2A63D",
  },
  itemCard: {
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.35)",
    borderRadius: 28,
    backgroundColor: "rgba(255,252,247,0.9)",
    padding: 15,
    marginBottom: 18,
    shadowColor: "#C9A84C",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
    elevation: 4,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 22,
  },
  itemTypeBadge: {
    fontSize: 12,
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
    fontSize: 15,
    color: "#8B6A43",
    fontFamily: Fonts.sans.regular,
  },
  itemTitle: {
    fontSize: 18,
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
    fontSize: 16,
    fontFamily: Fonts.serif.regular,
    textAlign: "center",
    color: "#7A6040",
    lineHeight: 30,
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
    shadowColor: "#C99317",
    shadowOpacity: 0.24,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 18 },
    elevation: 4,
  },
  actionBtnSparkle: {
    fontSize: 20,
    lineHeight: 20,
    color: "#fff",
  },
  actionBtnResolving: {
    opacity: 0.7,
  },
  actionBtnText: {
    fontSize: 18,
    fontFamily: Fonts.serif.bold,
    color: "#fff",
  },
  editRhythmBtn: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.55)",
    backgroundColor: "rgba(255,252,247,0.6)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 40,
  },
  editRhythmBtnText: {
    fontSize: 17,
    fontFamily: Fonts.sans.regular,
    color: "#7B6550",
  },
  reminderLine: {
    fontSize: 11,
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
    fontSize: 13,
    fontStyle: "italic",
    color: "#432104",
    fontFamily: Fonts.sans.regular,
  },
});

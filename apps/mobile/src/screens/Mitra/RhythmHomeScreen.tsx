/**
 * RhythmHomeScreen — My Rhythm door destination.
 *
 * Reads companion_rhythm from Redux doorSlice.homeData.companion_rhythm.
 * If has_rhythm === false: empty state + "Set up My Rhythm" button.
 * If has_rhythm === true: morning/afternoon/night band cards.
 */

import { RHYTHM_BAND_LABELS } from "@kalpx/contracts";
import type { RhythmItem, RhythmTimeBand } from "@kalpx/types";
import { useNavigation } from "@react-navigation/native";
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
import { executeAction } from "../../engine/actionExecutor";
import { mitraRhythmResolveItem } from "../../engine/mitraApi";
import { useScreenStore } from "../../engine/useScreenBridge";
import {
  goBackWithData,
  loadScreenWithData,
  screenActions,
} from "../../store/screenSlice";
import { Fonts } from "../../theme/fonts";

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
}: {
  band: RhythmTimeBand;
  items: RhythmItem[];
  onItemAction: (item: RhythmItem) => void;
  resolvingItemId?: string | null;
}) {
  if (items.length === 0) return null;
  const featuredItem = items[0];
  return (
    <View style={styles.band}>
      <Text style={styles.bandLabel}>{RHYTHM_BAND_LABELS[band]} Practice</Text>
      <View style={styles.bandDivider}>
        <View style={styles.bandDividerLine} />
        <Text style={styles.bandDividerDiamond}>◇</Text>
        <View style={styles.bandDividerLine} />
      </View>
      <RhythmItemCard
        key={featuredItem.id}
        item={featuredItem}
        onAction={() => onItemAction(featuredItem)}
        resolving={resolvingItemId === featuredItem.item_id}
      />
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

  const openRhythmSetup = useCallback(() => {
    dispatch(
      screenActions.setScreenValue({
        key: "dashboard_entry_surface",
        value: "my_rhythm_setup",
      }),
    );
    dispatch(
      loadScreenWithData({
        containerId: "companion_dashboard",
        stateId: "day_active",
      }) as any,
    );
    navigation.navigate("DynamicEngine");
  }, [dispatch, navigation]);

  const openRhythmEdit = useCallback(() => {
    dispatch(
      screenActions.setScreenValue({
        key: "dashboard_entry_surface",
        value: "my_rhythm_edit",
      }),
    );
    dispatch(
      loadScreenWithData({
        containerId: "companion_dashboard",
        stateId: "day_active",
      }) as any,
    );
    navigation.navigate("DynamicEngine");
  }, [dispatch, navigation]);

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

          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.7}
            style={styles.backBtn}
          >
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>

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
                    onItemAction={(item) => void handleItemAction(item, band)}
                    resolvingItemId={resolvingItemId}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  backBtnText: {
    fontSize: 14,
    color: "#C99317",
    fontFamily: Fonts.sans.regular,
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
    marginBottom: 8,
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
    // marginBottom: 18,
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
});

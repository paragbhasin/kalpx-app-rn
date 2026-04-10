import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import LibrarySearchModal from "../components/LibrarySearchModal";
import { executeAction } from "../engine/actionExecutor";
import {
  mitraCompleteAdditionalItem,
  mitraFetchAdditionalItems,
  mitraLibrarySearch,
  mitraRemoveAdditionalItem,
} from "../engine/mitraApi";
import { useScreenStore } from "../engine/useScreenBridge";
import { Fonts } from "../theme/fonts";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AdditionalItem {
  id: string;
  itemId: string;
  title: string;
  subtitle?: string;
  itemType: "mantra" | "sankalp" | "practice";
  completedToday?: boolean;
  sessionsCount?: number;
  source?: string;
  duration?: string;
  audio_url?: string;
}

interface UIHints {
  shouldCollapse?: boolean;
  highlightIds?: string[];
}

interface Props {
  block: {
    items_key?: string;
    label?: string;
    style?: any;
  };
}

const AdditionalItemsSectionBlock: React.FC<Props> = ({ block }) => {
  const { screenData, updateScreenData, loadScreen, currentScreen, goBack } =
    useScreenStore();

  const [items, setItems] = useState<AdditionalItem[]>([]);
  const [uiHints, setUiHints] = useState<UIHints>({});
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(true);
  const [showLibrary, setShowLibrary] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const journeyId = screenData.journey_id;

  const fetchItems = async () => {
    try {
      const data = await mitraFetchAdditionalItems();
      setItems(data?.items || []);
      setUiHints(data?.uiHints || {});
      if (data?.uiHints?.shouldCollapse) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    } catch (err) {
      console.error("[AdditionalItems] Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const visibleItems = useMemo(() => {
    if (!collapsed) return items;
    return items.slice(0, 2);
  }, [items, collapsed]);

  const hasMore = collapsed && items.length > 2;

  const handleComplete = async (item: AdditionalItem) => {
    if (completingId) return;
    setCompletingId(item.id);
    try {
      await mitraCompleteAdditionalItem(item.id);
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                completedToday: true,
                sessionsCount: (i.sessionsCount || 0) + 1,
              }
            : i,
        ),
      );
    } catch (err) {
      console.error("[AdditionalItems] Complete failed:", err);
    } finally {
      setCompletingId(null);
    }
  };

  const handleRemove = async (item: AdditionalItem) => {
    if (removingId) return;
    setRemovingId(item.id);
    try {
      await mitraRemoveAdditionalItem(item.id);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      console.error("[AdditionalItems] Remove failed:", err);
    } finally {
      setRemovingId(null);
    }
  };

  const handleLaunchRunner = async (item: AdditionalItem) => {
    if (item.source === "additional_custom") {
      handleComplete(item);
      return;
    }

    // Fetch full data for the info screen
    setCompletingId(item.id);
    try {
      // 1. Initial manual data from the dashboard item (fallback)
      const baseManualData = {
        title: item.title,
        id: item.itemId,
        item_id: item.itemId,
        type: item.itemType,
        item_type: item.itemType,
        duration: item.duration || "",
        audio_url: item.audio_url || "",
      };

      // 2. Try to fetch high-detail data from library
      const searchRes = await mitraLibrarySearch(
        item.itemId || item.title,
        item.itemType,
      );

      // Use String() for type-agnostic matching (int vs string IDs)
      const fullData =
        searchRes?.results?.find(
          (r: any) => String(r.itemId) === String(item.itemId),
        ) || searchRes?.results?.[0];

      const manualData = {
        ...baseManualData,
        ...fullData, // Merge library details if found
      };

      const START_ACTIONS: Record<string, any> = {
        mantra: {
          type: "navigate",
          target: {
            container_id: "practice_runner",
            state_id: "mantra_rep_selection",
          },
        },
        sankalp: {
          type: "navigate",
          target: {
            container_id: "practice_runner",
            state_id: "sankalp_embody",
          },
        },
        sankalpa: {
          type: "navigate",
          target: {
            container_id: "practice_runner",
            state_id: "sankalp_embody",
          },
        },
        practice: {
          type: "navigate",
          target: {
            container_id: "practice_runner",
            state_id: "practice_step_runner",
          },
        },
      };

      const infoType = item.itemType.toLowerCase();

      await executeAction(
        {
          type: "view_info",
          payload: {
            type: infoType,
            manualData,
            start_action: START_ACTIONS[infoType],
          },
          currentScreen,
        },
        {
          loadScreen,
          goBack,
          setScreenValue: (val: any, k: string) => updateScreenData(k, val),
          screenState: { ...screenData },
        },
      );
    } catch (err) {
      console.error("[AdditionalItems] Launch failed:", err);
    } finally {
      setCompletingId(null);
    }
  };

  if (loading && items.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#d4a017" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.label}>
          {block.label || "Additional Practices"}
        </Text>
        <TouchableOpacity onPress={() => setShowLibrary(true)}>
          <Text style={styles.addBtn}>+ Add from Library</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <View style={styles.list}>
        {visibleItems.map((item) => (
          <View
            key={item.id}
            style={[styles.card, item.completedToday && styles.cardCompleted]}
          >
            <View style={styles.cardInfo}>
              <View style={styles.badgeRow}>
                <Text style={styles.typeBadge}>{item.itemType}</Text>
                {item.completedToday && (
                  <View style={styles.doneBadge}>
                    <Text style={styles.doneText}>Done</Text>
                  </View>
                )}
              </View>
              <Text style={styles.title}>{item.title}</Text>
              {!!item.subtitle && (
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              )}
              {!!item.sessionsCount && (
                <Text style={styles.sessionsText}>
                  {item.sessionsCount}{" "}
                  {item.sessionsCount === 1 ? "session" : "sessions"}
                </Text>
              )}
            </View>

            <View style={styles.cardActions}>
              {!item.completedToday ? (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() =>
                    item.itemType === "mantra" ||
                    item.itemType === "sankalp" ||
                    item.itemType === "practice"
                      ? handleLaunchRunner(item)
                      : handleComplete(item)
                  }
                  disabled={!!completingId}
                >
                  <LinearGradient
                    colors={["#c9a84c", "#a8873a"]}
                    style={styles.actionBtnGradient}
                  >
                    {completingId === item.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.actionBtnText}>
                        {item.itemType === "mantra"
                          ? "Chant"
                          : item.itemType === "sankalp"
                            ? "Embody"
                            : "Practice"}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => handleRemove(item)}
                disabled={!!removingId}
              >
                {removingId === item.id ? (
                  <ActivityIndicator size="small" color="#8c8881" />
                ) : (
                  <Ionicons name="trash-outline" size={18} color="#8c8881" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Toggle */}
        {hasMore && (
          <TouchableOpacity
            onPress={() => setCollapsed(false)}
            style={styles.toggleBtn}
          >
            <Text style={styles.toggleText}>See all ({items.length})</Text>
          </TouchableOpacity>
        )}
        {!collapsed && items.length > 2 && (
          <TouchableOpacity
            onPress={() => setCollapsed(true)}
            style={styles.toggleBtn}
          >
            <Text style={styles.toggleText}>Show less</Text>
          </TouchableOpacity>
        )}
      </View>

      <LibrarySearchModal
        isVisible={showLibrary}
        journeyId={journeyId}
        onClose={() => setShowLibrary(false)}
        onItemAdded={fetchItems}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 18,
    backgroundColor: "rgba(255, 253, 249, 0.9)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(192, 145, 61, 0.4)",
    padding: 2,
    shadowColor: "#7f5a22",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  loadingContainer: {
    padding: 30,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  label: {
    fontSize: 14,
    fontFamily: Fonts.sans.bold,
    color: "#a98763",
    textTransform: "uppercase",
    // letterSpacing: 2,
  },
  addBtn: {
    fontSize: 14,
    fontFamily: Fonts.serif.bold,
    color: "#bc8f36",
  },
  list: {
    padding: 12,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(228, 197, 145, 0.8)",
    padding: 16,
    gap: 12,
  },
  cardCompleted: {
    backgroundColor: "rgba(16, 185, 129, 0.03)",
    borderColor: "rgba(16, 185, 129, 0.15)",
  },
  cardInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  typeBadge: {
    fontSize: 10,
    textTransform: "uppercase",
    fontFamily: Fonts.sans.bold,
    color: "#8a7a5a",
    backgroundColor: "#f5f0e0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: "hidden",
  },
  doneBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  doneText: {
    fontSize: 10,
    fontFamily: Fonts.sans.bold,
    color: "#10b981",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 17,
    fontFamily: Fonts.serif.bold,
    color: "#432104",
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.serif.regular,
    color: "#615247",
    marginBottom: 4,
    lineHeight: 18,
  },
  sessionsText: {
    fontSize: 11,
    fontFamily: Fonts.sans.regular,
    color: "#8c8881",
  },
  cardActions: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 8,
  },
  actionBtn: {
    borderRadius: 20,
    overflow: "hidden",
  },
  actionBtnGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: "center",
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: Fonts.serif.bold,
    fontWeight: "700",
  },
  removeBtn: {
    padding: 6,
  },
  toggleBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 13,
    fontFamily: Fonts.sans.medium,
    color: "#d4a017",
  },
});

export default AdditionalItemsSectionBlock;

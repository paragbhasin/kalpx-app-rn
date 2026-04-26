/**
 * RoomMemoryScreen — user-visible saved reflections history.
 *
 * Fetches GET /api/mitra/rooms/memory/ and renders the user's saved
 * room entries (carry-pill writes, step-pill writes, inquiry journals)
 * newest-first, lightly grouped by room.
 *
 * Delete: tap trash → Alert confirm → DELETE /api/mitra/rooms/memory/<id>/
 * → optimistic removal from list.
 *
 * Entry: ProfileStackNavigator → Profile → "Saved reflections" menu item.
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import api from "../../Networks/axios";
import { Colors } from "../../theme/colors";

// ── Display label maps ─────────────────────────────────────────────────────

const ROOM_LABELS: Record<string, string> = {
  room_joy:        "Joy",
  room_connection: "Connection",
  room_release:    "Release",
  room_clarity:    "Clarity",
  room_growth:     "Growth",
  room_stillness:  "Stillness",
};

const ROOM_BADGE_COLOR: Record<string, string> = {
  room_joy:        "#D4A017",
  room_connection: "#9B7FA8",
  room_release:    "#888888",
  room_clarity:    "#5B8FA8",
  room_growth:     "#7A9E6F",
  room_stillness:  "#9EABBA",
};

const EVENT_LABELS: Record<string, string> = {
  joy_named:            "What felt good",
  joy_carry:            "Carried joy",
  connection_named:     "Named connection",
  connection_reach_out: "Message drafted",
  growth_journal:       "Growth note",
  clarity_journal:      "Honest question",
  release_named:        "Set down",
  stillness_named:      "What became still",
};

const CONTEXT_LABELS: Record<string, string> = {
  work_career:       "Work",
  relationships:     "Relationships",
  self:              "Self",
  health_energy:     "Health & energy",
  money_security:    "Money & security",
  purpose_direction: "Purpose",
  daily_life:        "Daily life",
};

// ── Types ──────────────────────────────────────────────────────────────────

interface MemoryEntry {
  memory_id: string;
  room_id: string;
  event_type: string;
  text: string;
  action_label: string;
  source_surface: string;
  life_context: string;
  journey_id: number | null;
  day_number: number | null;
  captured_at: string | null;
  user_deletable: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// Group memories by room_id, preserve newest-first order within each room,
// and return room sections in the order the first entry of each room appears.
function groupByRoom(memories: MemoryEntry[]): Array<{ room_id: string; items: MemoryEntry[] }> {
  const order: string[] = [];
  const map: Record<string, MemoryEntry[]> = {};
  for (const m of memories) {
    if (!map[m.room_id]) {
      map[m.room_id] = [];
      order.push(m.room_id);
    }
    map[m.room_id].push(m);
  }
  return order.map((room_id) => ({ room_id, items: map[room_id] }));
}

// ── Sub-components ─────────────────────────────────────────────────────────

const MemoryCard: React.FC<{
  entry: MemoryEntry;
  onDelete: (memory_id: string) => void;
}> = ({ entry, onDelete }) => {
  const badgeColor = ROOM_BADGE_COLOR[entry.room_id] ?? Colors.gold;
  const eventLabel = EVENT_LABELS[entry.event_type] ?? entry.event_type;
  const contextLabel = entry.life_context ? CONTEXT_LABELS[entry.life_context] ?? entry.life_context : null;
  const dateStr = formatDate(entry.captured_at);

  const handleDelete = () => {
    Alert.alert(
      "Remove this reflection?",
      "It will be removed from your saved reflections.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => onDelete(entry.memory_id),
        },
      ],
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.eventBadgeRow}>
          <View style={[styles.colorDot, { backgroundColor: badgeColor }]} />
          <Text style={styles.eventLabel}>{eventLabel}</Text>
        </View>
        {entry.user_deletable && (
          <TouchableOpacity
            onPress={handleDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Remove reflection"
            accessibilityRole="button"
          >
            <Ionicons name="trash-outline" size={17} color={Colors.textFaint} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.cardText}>{entry.text}</Text>

      <View style={styles.cardMeta}>
        {dateStr ? <Text style={styles.metaText}>{dateStr}</Text> : null}
        {contextLabel ? (
          <View style={styles.contextChip}>
            <Text style={styles.contextChipLabel}>{contextLabel}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const RoomSection: React.FC<{
  room_id: string;
  items: MemoryEntry[];
  onDelete: (memory_id: string) => void;
}> = ({ room_id, items, onDelete }) => (
  <View style={styles.section}>
    <Text style={styles.sectionHeader}>
      {ROOM_LABELS[room_id] ?? room_id.replace("room_", "")}
    </Text>
    {items.map((entry) => (
      <MemoryCard key={entry.memory_id} entry={entry} onDelete={onDelete} />
    ))}
  </View>
);

// ── Main screen ────────────────────────────────────────────────────────────

const RoomMemoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMemories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("mitra/rooms/memory/");
      setMemories(res?.data?.memories ?? []);
    } catch (err: any) {
      setError("Couldn't load your reflections. Please try again.");
      if (__DEV__) {
        console.warn("[RoomMemoryScreen] fetch failed:", err?.response?.status || err?.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const handleDelete = useCallback(async (memory_id: string) => {
    // Optimistic removal
    setMemories((prev) => prev.filter((m) => m.memory_id !== memory_id));
    try {
      await api.delete(`mitra/rooms/memory/${memory_id}/`);
    } catch (err: any) {
      // Restore on failure
      fetchMemories();
      if (__DEV__) {
        console.warn("[RoomMemoryScreen] delete failed:", err?.response?.status || err?.message);
      }
    }
  }, [fetchMemories]);

  const sections = groupByRoom(memories);

  const renderSection = ({ item }: { item: { room_id: string; items: MemoryEntry[] } }) => (
    <RoomSection
      room_id={item.room_id}
      items={item.items}
      onDelete={handleDelete}
    />
  );

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={22} color={Colors.brownDeep} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved reflections</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color={Colors.gold} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchMemories}>
            <Text style={styles.retryLabel}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : memories.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Nothing saved yet.</Text>
          <Text style={styles.emptySubtitle}>
            When you name something, write it down, or set it down in a room,{"\n"}
            it will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.room_id}
          renderItem={renderSection}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.parchment,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderCream,
    backgroundColor: Colors.parchment,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.brownDeep,
    letterSpacing: 0.2,
  },
  headerRight: {
    width: 22,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 15,
    color: Colors.textSoft,
    textAlign: "center",
    marginBottom: 16,
  },
  retryBtn: {
    paddingVertical: 9,
    paddingHorizontal: 22,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  retryLabel: {
    fontSize: 14,
    color: Colors.brownDeep,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.brownDeep,
    textAlign: "center",
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSoft,
    textAlign: "center",
    lineHeight: 21,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.gold,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 12,
    paddingLeft: 2,
  },
  card: {
    backgroundColor: Colors.cream,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderCream,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  eventBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  eventLabel: {
    fontSize: 12,
    color: Colors.textSoft,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  cardText: {
    fontSize: 15,
    color: Colors.brownDeep,
    lineHeight: 23,
    marginBottom: 12,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  metaText: {
    fontSize: 12,
    color: Colors.textFaint,
  },
  contextChip: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: Colors.goldPale,
  },
  contextChipLabel: {
    fontSize: 11,
    color: Colors.brownDeep,
    fontWeight: "500",
  },
});

export default RoomMemoryScreen;

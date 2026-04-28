import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../Networks/axios";
import { mitraLibrarySearch } from "../engine/mitraApi";
import { Fonts } from "../theme/fonts";

interface LibraryItem {
  itemId: string;
  item_id?: string;
  title: string;
  itemType: string;
  item_type?: string;
  description?: string;
  subtitle?: string;
}

interface LibrarySearchModalProps {
  isVisible: boolean;
  onClose: () => void;
  onItemAdded: () => void;
  journeyId?: string | number;
}

const LibrarySearchModal: React.FC<LibrarySearchModalProps> = ({
  isVisible,
  onClose,
  onItemAdded,
  journeyId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  const performSearch = async (query: string) => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // Vue logic: iterate through types mantra, sankalp, practice
      const types = ["mantra", "sankalp", "practice"];
      const searchPromises = types.map((t) => mitraLibrarySearch(query, t));
      const resList = await Promise.all(searchPromises);

      const allResults: LibraryItem[] = [];
      resList.forEach((res, index) => {
        const items = (res?.results || []).map((item: any) => ({
          ...item,
          _type: types[index],
        }));
        allResults.push(...items);
      });

      setResults(allResults);
    } catch (err) {
      console.error("[LibrarySearch] Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) performSearch(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddItem = async (item: any) => {
    if (item.alreadyInCore || item.alreadyAdded || addingId !== null) return;

    const itemId = item.itemId || item.item_id;
    const itemType = item._type || item.itemType || item.item_type;

    setAddingId(itemId);
    try {
      await api.post("mitra/journey/additional/", {
        itemId,
        itemType,
        source: "additional_library",
      });

      // Update local state to reflect 'Added'
      setResults((prev) =>
        prev.map((r) =>
          r.itemId === itemId || (r as any).item_id === itemId
            ? { ...r, alreadyAdded: true }
            : r,
        ),
      );

      onItemAdded();
    } catch (err) {
      console.error("[LibraryAdd] Failed:", err);
    } finally {
      setAddingId(null);
    }
  };

  const getLevelLabel = (item: any) => {
    const level = String(item.level || "")
      .trim()
      .toLowerCase();
    if (level === "beginner") return "Beginner";
    if (level === "intermediate") return "Intermediate";
    if (level === "advanced") return "Advanced";
    return item.beginnerSafe ? "Beginner" : "";
  };

  const getLevelStyle = (item: any) => {
    const level = String(item.level || "")
      .trim()
      .toLowerCase();
    if (level === "intermediate")
      return { color: "#8a5a1d", backgroundColor: "rgba(212, 168, 76, 0.16)" };
    if (level === "advanced")
      return { color: "#7a3358", backgroundColor: "rgba(164, 97, 137, 0.14)" };
    return { color: "#3f7a67", backgroundColor: "rgba(115, 171, 147, 0.14)" };
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Browse Library</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={28} color="#958b80" />
            </TouchableOpacity>
          </View>

          <Text style={styles.helpText}>
            Search for mantras, sankalps, or practices to add to your daily
            journey.
          </Text>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#8f877f"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, tradition"
              placeholderTextColor="#a39b93"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>

          {/* Results */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#d4a017" />
              <Text style={styles.searchingText}>Searching...</Text>
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item, idx) =>
                (item.itemId || (item as any).item_id || "") + idx
              }
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                searchQuery.length >= 2 ? (
                  <Text style={styles.emptyText}>
                    No results found. Try a different search.
                  </Text>
                ) : (
                  <Text style={styles.emptyText}>
                    Type at least 2 characters to search.
                  </Text>
                )
              }
              renderItem={({ item }: { item: any }) => (
                <View
                  style={[
                    styles.itemCard,
                    (item.alreadyInCore || item.alreadyAdded) &&
                      styles.disabledCard,
                  ]}
                >
                  <View style={styles.itemInfo}>
                    <View style={styles.badgeRow}>
                      <Text style={styles.itemTypeBadge}>
                        {item._type || item.itemType}
                      </Text>
                      {Boolean(getLevelLabel(item)) && (
                        <Text style={[styles.levelBadge, getLevelStyle(item)]}>
                          {getLevelLabel(item)}
                        </Text>
                      )}
                    </View>

                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {Boolean(item.subtitle || item.description) && (
                      <Text style={styles.itemSubtitle} numberOfLines={2}>
                        {item.subtitle || item.description}
                      </Text>
                    )}

                    {item.tags && item.tags.length > 0 && (
                      <View style={styles.tagRow}>
                        {item.tags.map((tag: string) => (
                          <Text key={tag} style={styles.tag}>
                            {tag}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>

                  <View style={styles.actionWrap}>
                    {item.alreadyInCore ? (
                      <Text style={styles.statusText}>In core</Text>
                    ) : item.alreadyAdded ? (
                      <Text style={styles.statusText}>Added</Text>
                    ) : (
                      <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => handleAddItem(item)}
                        disabled={addingId !== null}
                      >
                        {addingId === (item.itemId || item.item_id) ? (
                          <ActivityIndicator size="small" color="#d4a017" />
                        ) : (
                          <Text style={styles.addBtnText}>Add</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffdfa",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 38,
    paddingTop: 34,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: Fonts.serif.bold,
    color: "#4a2508",
    fontWeight: "700",
  },
  closeBtn: {
    padding: 4,
  },
  helpText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 14,
    color: "#432104",
    paddingHorizontal: 38,
    lineHeight: 20,
    marginTop: 4,
    // marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginHorizontal: 30,
    marginVertical: 18,
    borderRadius: 15,
    paddingHorizontal: 22,
    borderWidth: 1.5,
    borderColor: "rgba(223, 205, 181, 0.9)",
  },
  searchIcon: {
    marginRight: 14,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 20,
    fontFamily: Fonts.serif.regular,
    color: "#4c2a0f",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  searchingText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#8b8177",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 14,
    color: "#8b8177",
    fontFamily: Fonts.sans.regular,
    paddingHorizontal: 40,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.82)",
    borderWidth: 1,
    borderColor: "rgba(227, 214, 196, 0.9)",
    borderRadius: 28,
    padding: 24,
    marginBottom: 14,
    shadowColor: "#74542a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 22,
    elevation: 3,
  },
  disabledCard: {
    opacity: 0.56,
  },
  itemInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  itemTypeBadge: {
    fontSize: 12,
    textTransform: "uppercase",
    color: "#8b6838",
    backgroundColor: "#f4ecdf",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    fontFamily: Fonts.serif.bold,
    overflow: "hidden",
  },
  levelBadge: {
    fontSize: 11,
    textTransform: "uppercase",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    fontFamily: Fonts.sans.bold,
    letterSpacing: 1,
    overflow: "hidden",
  },
  itemTitle: {
    fontSize: 24,
    fontFamily: Fonts.serif.bold,
    color: "#4b260a",
    fontWeight: "700",
    lineHeight: 28,
  },
  itemSubtitle: {
    fontSize: 16,
    fontFamily: Fonts.serif.regular,
    color: "#7f756d",
    marginTop: 8,
    lineHeight: 20,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  tag: {
    fontSize: 12,
    fontFamily: Fonts.serif.regular,
    color: "#84766a",
    backgroundColor: "rgba(232, 225, 217, 0.7)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  actionWrap: {
    marginLeft: 15,
    justifyContent: "flex-end",
  },
  statusText: {
    fontSize: 15,
    fontFamily: Fonts.serif.regular,
    color: "#8d8176",
  },
  addBtn: {
    backgroundColor: "rgba(212, 160, 23, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 160, 23, 0.3)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  addBtnText: {
    color: "#d4a017",
    fontSize: 13,
    fontFamily: Fonts.sans.semiBold,
  },
});

export default LibrarySearchModal;

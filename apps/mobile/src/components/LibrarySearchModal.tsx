import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
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

export type LibrarySearchItem = LibraryItem;

interface LibrarySearchModalProps {
  isVisible: boolean;
  onClose: () => void;
  onItemAdded: () => void;
  journeyId?: string | number;
  mode?: "add_to_journey" | "select_for_rhythm";
  onItemSelected?: (item: LibrarySearchItem) => void;
}

const LibrarySearchModal: React.FC<LibrarySearchModalProps> = ({
  isVisible,
  onClose,
  onItemAdded,
  journeyId,
  mode,
  onItemSelected,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const inputRef = useRef<TextInput | null>(null);

  const performSearch = useCallback(
    async (query: string) => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        if (selectedType === "all") {
          const [mantras, sankalps, practices] = await Promise.allSettled([
            mitraLibrarySearch(query, "mantra"),
            mitraLibrarySearch(query, "sankalp"),
            mitraLibrarySearch(query, "practice"),
          ]);
          const merged: LibraryItem[] = [
            ...(mantras.status === "fulfilled"
              ? (mantras.value?.results || []).map((i: any) => ({ ...i, _type: "mantra" }))
              : []),
            ...(sankalps.status === "fulfilled"
              ? (sankalps.value?.results || []).map((i: any) => ({ ...i, _type: "sankalp" }))
              : []),
            ...(practices.status === "fulfilled"
              ? (practices.value?.results || []).map((i: any) => ({ ...i, _type: "practice" }))
              : []),
          ];
          setResults(merged);
        } else {
          const effectiveType = ["mantra", "sankalp", "practice"].includes(selectedType)
            ? selectedType
            : "practice";
          const res = await mitraLibrarySearch(query, effectiveType);
          setResults(
            (res?.results || []).map((item: any) => ({ ...item, _type: effectiveType })),
          );
        }
      } catch (err) {
        console.error("[LibrarySearch] Failed:", err);
      } finally {
        setLoading(false);
      }
    },
    [selectedType],
  );

  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) performSearch(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [isVisible, performSearch, searchQuery]);

  useEffect(() => {
    if (!isVisible) return;
    setSearchQuery("");
    setResults([]);
    setSelectedType("all");
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 250);
    return () => clearTimeout(timer);
  }, [isVisible]);

  const selectType = (type: string) => {
    setSelectedType(type);
  };

  const handleAddItem = async (item: any) => {
    if (mode === "select_for_rhythm" && onItemSelected) {
      onItemSelected(item as LibrarySearchItem);
      return;
    }
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
    <Modal visible={isVisible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={onClose}
            style={styles.backdrop}
          />
          <View style={styles.sheet}>
            <View style={styles.handle} />

            <View style={styles.header}>
              <Text style={styles.headerTitle}>Add from Library</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={28} color="#958b80" />
              </TouchableOpacity>
            </View>

            <View style={styles.typeWrap}>
              {[
                { label: "All", value: "all" },
                { label: "Mantra", value: "mantra" },
                { label: "Sankalp", value: "sankalp" },
                { label: "Practice", value: "practice" },
              ].map((type) => {
                const active = selectedType === type.value;
                return (
                  <TouchableOpacity
                    key={type.value}
                    onPress={() => selectType(type.value)}
                    activeOpacity={0.8}
                    style={[styles.typeChip, active && styles.typeChipActive]}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        active && styles.typeChipTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.searchRow}>
              <View style={styles.searchContainer}>
                <TextInput
                  ref={inputRef}
                  style={styles.searchInput}
                  placeholder="Search..."
                  placeholderTextColor="#a39b93"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                  selectionColor="#C99317"
                  cursorColor="#C99317"
                  underlineColorAndroid="transparent"
                />
              </View>
              <TouchableOpacity
                onPress={() => performSearch(searchQuery)}
                activeOpacity={0.85}
                style={styles.searchBtn}
              >
                <Text style={styles.searchBtnText}>Search</Text>
              </TouchableOpacity>
            </View>

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
                keyboardShouldPersistTaps="handled"
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
                          <Text
                            style={[styles.levelBadge, getLevelStyle(item)]}
                          >
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
                            <Text style={styles.addBtnText}>
                              {mode === "select_for_rhythm" ? "Select" : "Add"}
                            </Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(33, 22, 15, 0.18)",
    justifyContent: "flex-end",
  },
  keyboardView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: "#FFF8EF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 18,
    paddingBottom: 22,
    maxHeight: "76%",
  },
  handle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(149, 139, 128, 0.35)",
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: Fonts.serif.bold,
    color: "#4a2508",
    fontWeight: "700",
  },
  closeBtn: {
    padding: 4,
  },
  typeWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
    marginBottom: 16,
  },
  typeChip: {
    borderWidth: 1,
    borderColor: "rgba(216, 188, 119, 0.95)",
    borderRadius: 11,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 253, 249, 0.85)",
  },
  typeChipActive: {
    backgroundColor: "#F4E5BE",
  },
  typeChipText: {
    fontSize: 13,
    color: "#4A2508",
    fontFamily: Fonts.sans.medium,
  },
  typeChipTextActive: {
    color: "#7D5408",
    fontFamily: Fonts.sans.semiBold,
  },
  searchRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: 16,
    paddingHorizontal: 18,
    minHeight: 40,
    borderWidth: 1,
    borderColor: "rgba(223, 205, 181, 0.9)",
    justifyContent: "center",
  },
  searchInput: {
    flex: 1,
    height: 24,
    fontSize: 16,
    fontFamily: Fonts.serif.regular,
    color: "#4c2a0f",
    paddingVertical: 0,
    textAlignVertical: "center",
  },
  searchBtn: {
    minWidth: 80,
    borderRadius: 11,
    backgroundColor: "#D39A14",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  searchBtnText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: Fonts.sans.semiBold,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: "center",
    gap: 12,
  },
  searchingText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#8b8177",
  },
  listContent: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 28,
    fontSize: 14,
    color: "#8b8177",
    fontFamily: Fonts.sans.regular,
    paddingHorizontal: 20,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.82)",
    borderWidth: 1,
    borderColor: "rgba(227, 214, 196, 0.9)",
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
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
    fontSize: 10,
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
    fontSize: 10,
    textTransform: "uppercase",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    fontFamily: Fonts.sans.bold,
    letterSpacing: 1,
    overflow: "hidden",
  },
  itemTitle: {
    fontSize: 18,
    fontFamily: Fonts.serif.bold,
    color: "#4b260a",
    fontWeight: "700",
    lineHeight: 24,
  },
  itemSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.serif.regular,
    color: "#7f756d",
    marginTop: 8,
    lineHeight: 18,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  tag: {
    fontSize: 11,
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
    fontSize: 13,
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
    fontSize: 12,
    fontFamily: Fonts.sans.semiBold,
  },
});

export default LibrarySearchModal;

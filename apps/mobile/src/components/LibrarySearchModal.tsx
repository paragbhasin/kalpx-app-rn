import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
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
  // Mantra-specific fields returned by library/search
  devanagari?: string;
  iast?: string;
  meaning?: string;
  essence?: string;
  audio_url?: string | null;
  deity?: string;
  tradition?: string;
  tags?: string[];
  level?: string;
  beginnerSafe?: boolean;
  alreadyInCore?: boolean;
  alreadyAdded?: boolean;
  summary?: string;
  // Sankalp / Practice fields
  line?: string;
  insight?: string;
  how_to_live?: string[];
  benefits?: string[];
  steps?: string[];
}

export type LibrarySearchItem = LibraryItem;

interface LibrarySearchModalProps {
  isVisible: boolean;
  onClose: () => void;
  onItemAdded: () => void;
  journeyId?: string | number;
  mode?: "add_to_journey" | "select_for_rhythm" | "select";
  onItemSelected?: (item: LibrarySearchItem) => void;
  /** Lock to a single content type: hides type tabs and enables browse-on-open */
  lockedItemType?: "mantra" | "sankalp" | "practice";
  /** Override the action button label in select/select_for_rhythm mode */
  selectLabel?: string;
  /** Override the modal header title */
  headerTitle?: string;
}

const LibrarySearchModal: React.FC<LibrarySearchModalProps> = ({
  isVisible,
  onClose,
  onItemAdded,
  journeyId,
  mode,
  onItemSelected,
  lockedItemType,
  selectLabel,
  headerTitle,
}) => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>(lockedItemType ?? "all");
  // When set, the detail panel for this item replaces the browse/search list.
  const [detailItem, setDetailItem] = useState<any | null>(null);
  const inputRef = useRef<TextInput | null>(null);
  const PAGE_SIZE = 20;

  const fetchPage = useCallback(
    async (query: string, offset: number, append: boolean) => {
      const lang = i18n.language || "en";
      let newItems: LibraryItem[] = [];
      let more = false;

      if (lockedItemType) {
        const res = await mitraLibrarySearch(query, lockedItemType, lang, offset);
        newItems = (res?.results || []).map((item: any) => ({ ...item, _type: lockedItemType }));
        more = res?.hasMore ?? false;
      } else if (selectedType === "all") {
        const [mantras, sankalps, practices] = await Promise.allSettled([
          mitraLibrarySearch(query, "mantra", lang, offset),
          mitraLibrarySearch(query, "sankalp", lang, offset),
          mitraLibrarySearch(query, "practice", lang, offset),
        ]);
        newItems = [
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
        more =
          (mantras.status === "fulfilled" && mantras.value?.hasMore) ||
          (sankalps.status === "fulfilled" && sankalps.value?.hasMore) ||
          (practices.status === "fulfilled" && practices.value?.hasMore);
      } else {
        const effectiveType = ["mantra", "sankalp", "practice"].includes(selectedType)
          ? selectedType
          : "practice";
        const res = await mitraLibrarySearch(query, effectiveType, lang, offset);
        newItems = (res?.results || []).map((item: any) => ({ ...item, _type: effectiveType }));
        more = res?.hasMore ?? false;
      }

      if (append) {
        setResults((prev) => [...prev, ...newItems]);
      } else {
        setResults(newItems);
      }
      setHasMore(more);
      setCurrentOffset(offset + newItems.length);
    },
    [selectedType, lockedItemType],
  );

  const performSearch = useCallback(
    async (query: string) => {
      if (!lockedItemType && query.length === 1) return;
      setLoading(true);
      try {
        await fetchPage(query, 0, false);
      } catch (err) {
        console.error("[LibrarySearch] Failed:", err);
      } finally {
        setLoading(false);
      }
    },
    [fetchPage, lockedItemType],
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    try {
      await fetchPage(searchQuery.trim(), currentOffset, true);
    } catch (err) {
      console.error("[LibrarySearch] loadMore failed:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, loading, fetchPage, searchQuery, currentOffset]);

  // Load the list whenever the sheet opens, the query changes, or the active
  // tab changes.
  useEffect(() => {
    if (!isVisible) return;
    const q = searchQuery.trim();
    if (!lockedItemType && q.length === 1) return;
    const delay = q.length === 0 ? 0 : 350;
    const timer = setTimeout(() => {
      performSearch(q);
    }, delay);
    return () => clearTimeout(timer);
  }, [isVisible, performSearch, searchQuery, lockedItemType]);

  // Reset state each time the sheet opens.
  useEffect(() => {
    if (!isVisible) return;
    setSearchQuery("");
    setDetailItem(null);
    setSelectedType(lockedItemType ?? "all");
    setCurrentOffset(0);
    setHasMore(false);
  }, [isVisible]); // lockedItemType is a stable prop; intentionally excluded from deps

  const selectType = (type: string) => {
    if (type === selectedType) return;
    setSelectedType(type);
    setSearchQuery("");
  };

  const handleAddItem = async (item: any) => {
    if ((mode === "select_for_rhythm" || mode === "select") && onItemSelected) {
      onItemSelected(item as LibrarySearchItem);
      setDetailItem(null);
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
      setDetailItem(null);
    } catch (err) {
      console.error("[LibraryAdd] Failed:", err);
    } finally {
      setAddingId(null);
    }
  };

  const TYPE_BADGE_LABELS: Record<string, string> = {
    mantra: t("libraryModal.badgeMantra"),
    sankalp: t("libraryModal.badgeSankalp"),
    practice: t("libraryModal.badgePractice"),
  };

  const getLevelLabel = (item: any) => {
    const level = String(item.level || "")
      .trim()
      .toLowerCase();
    if (level === "beginner") return t("libraryModal.levelBeginner");
    if (level === "intermediate") return t("libraryModal.levelIntermediate");
    if (level === "advanced") return t("libraryModal.levelAdvanced");
    return item.beginnerSafe ? t("libraryModal.levelBeginner") : "";
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
    <Modal visible={isVisible} animationType="fade" transparent onShow={() => inputRef.current?.blur()}>
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
              {detailItem ? (
                <TouchableOpacity
                  onPress={() => setDetailItem(null)}
                  style={styles.backBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-back" size={22} color="#7d5408" />
                  <Text style={styles.backText} numberOfLines={1}>
                    {headerTitle ?? t("libraryModal.title")}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.headerTitle}>{headerTitle ?? t("libraryModal.title")}</Text>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={28} color="#958b80" />
              </TouchableOpacity>
            </View>

            {detailItem ? (
              <>
                {/* ── Sticky top: badges+button row, then title ── */}
                <View style={styles.detailStickyTop}>
                  <View style={[styles.badgeRow, { justifyContent: 'space-between' }]}>
                    <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1 }}>
                      <Text style={styles.itemTypeBadge}>
                        {TYPE_BADGE_LABELS[detailItem._type || detailItem.itemType] ||
                          (detailItem._type || detailItem.itemType)}
                      </Text>
                      {Boolean(getLevelLabel(detailItem)) && (
                        <Text style={[styles.levelBadge, getLevelStyle(detailItem)]}>
                          {getLevelLabel(detailItem)}
                        </Text>
                      )}
                    </View>
                    {detailItem.alreadyInCore ? (
                      <Text style={styles.statusText}>{t("libraryModal.inCore")}</Text>
                    ) : detailItem.alreadyAdded ? (
                      <Text style={styles.statusText}>{t("libraryModal.added")}</Text>
                    ) : (
                      <TouchableOpacity
                        style={styles.detailActionBtnCompact}
                        onPress={() => handleAddItem(detailItem)}
                        disabled={addingId !== null}
                        activeOpacity={0.85}
                      >
                        {addingId === (detailItem.itemId || detailItem.item_id) ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.detailActionBtnText}>
                            {mode === "select_for_rhythm" || mode === "select"
                              ? selectLabel ?? t("libraryModal.select")
                              : t("libraryModal.add")}
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.detailTitle}>{detailItem.title}</Text>
                  <View style={styles.detailDivider} />
                </View>

                {/* ── Scrollable details below ── */}
                <ScrollView
                  style={styles.detailScroll}
                  contentContainerStyle={styles.detailContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  {(() => {
                    const itemType = detailItem._type || detailItem.item_type || detailItem.itemType;
                    const BenefitPills = ({ items }: { items: string[] }) => (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                        {items.map((b: string, i: number) => (
                          <View key={i} style={{ backgroundColor: 'rgba(201,168,76,0.1)', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 12 }}>
                            <Text style={{ fontSize: 12, color: '#7B6550' }}>{b}</Text>
                          </View>
                        ))}
                      </View>
                    );
                    const BulletList = ({ items }: { items: string[] }) => (
                      <>
                        {items.map((s: string, i: number) => (
                          <View key={i} style={{ flexDirection: 'row', marginTop: 6, gap: 8 }}>
                            <Text style={{ color: '#C99317', fontSize: 14, lineHeight: 22 }}>•</Text>
                            <Text style={[styles.detailBody, { flex: 1, marginTop: 0 }]}>{s}</Text>
                          </View>
                        ))}
                      </>
                    );
                    const TagRow = () => detailItem.tags?.length > 0 ? (
                      <View style={styles.tagRow}>
                        {detailItem.tags.map((tag: string) => (
                          <Text key={tag} style={styles.tag}>{tag}</Text>
                        ))}
                      </View>
                    ) : null;

                    if (itemType === 'mantra') {
                      return <>
                        {Boolean(detailItem.devanagari) && (
                          <Text style={styles.detailDevanagari}>{detailItem.devanagari}</Text>
                        )}
                        {Boolean(detailItem.iast) && (
                          <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>{t("libraryModal.pronunciation")}</Text>
                            <Text style={styles.detailBody}>{detailItem.iast}</Text>
                          </View>
                        )}
                        {Boolean(detailItem.meaning || detailItem.summary) && (
                          <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>{t("libraryModal.meaning")}</Text>
                            <Text style={styles.detailBody}>{detailItem.meaning || detailItem.summary}</Text>
                          </View>
                        )}
                        {Boolean(detailItem.essence || detailItem.insight) && (
                          <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>{t("libraryModal.essence")}</Text>
                            <Text style={styles.detailBody}>{detailItem.essence || detailItem.insight}</Text>
                          </View>
                        )}
                        {(Boolean(detailItem.deity) || Boolean(detailItem.tradition)) && (
                          <View style={styles.detailMetaRow}>
                            {Boolean(detailItem.deity) && (
                              <View style={styles.detailMetaItem}>
                                <Text style={styles.detailLabel}>{t("libraryModal.deity")}</Text>
                                <Text style={styles.detailMetaValue}>{detailItem.deity}</Text>
                              </View>
                            )}
                            {Boolean(detailItem.tradition) && (
                              <View style={styles.detailMetaItem}>
                                <Text style={styles.detailLabel}>{t("libraryModal.tradition")}</Text>
                                <Text style={styles.detailMetaValue}>{detailItem.tradition}</Text>
                              </View>
                            )}
                          </View>
                        )}
                        <TagRow />
                      </>;
                    }

                    if (itemType === 'sankalp') {
                      return <>
                        {Boolean(detailItem.insight || detailItem.essence) && (
                          <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>{t("libraryModal.essence")}</Text>
                            <Text style={[styles.detailBody, { fontStyle: 'italic' }]}>{detailItem.insight || detailItem.essence}</Text>
                          </View>
                        )}
                        {detailItem.benefits?.length > 0 && (
                          <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>BENEFITS</Text>
                            <BenefitPills items={detailItem.benefits} />
                          </View>
                        )}
                        {detailItem.how_to_live?.length > 0 && (
                          <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>HOW TO LIVE THIS</Text>
                            <BulletList items={detailItem.how_to_live} />
                          </View>
                        )}
                        <TagRow />
                      </>;
                    }

                    // practice
                    return <>
                      {Boolean(detailItem.essence || detailItem.insight) && (
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>{t("libraryModal.essence")}</Text>
                          <Text style={styles.detailBody}>{detailItem.essence || detailItem.insight}</Text>
                        </View>
                      )}
                      {detailItem.benefits?.length > 0 && (
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>BENEFITS</Text>
                          <BenefitPills items={detailItem.benefits} />
                        </View>
                      )}
                      {detailItem.steps?.length > 0 && (
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>STEPS</Text>
                          {detailItem.steps.map((step: string, i: number) => (
                            <View key={i} style={{ flexDirection: 'row', marginTop: 8, gap: 10 }}>
                              <Text style={{ color: '#C99317', fontSize: 13, fontFamily: Fonts.sans.semiBold, minWidth: 20 }}>{i + 1}.</Text>
                              <Text style={[styles.detailBody, { flex: 1, marginTop: 0 }]}>{step}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                      <TagRow />
                    </>;
                  })()}
                </ScrollView>
              </>
            ) : (
              <>
            {!lockedItemType && (
              <View style={styles.typeWrap}>
                {[
                  { label: t("libraryModal.typeAll"), value: "all" },
                  { label: t("libraryModal.typeMantra"), value: "mantra" },
                  { label: t("libraryModal.typeSankalp"), value: "sankalp" },
                  { label: t("libraryModal.typePractice"), value: "practice" },
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
            )}

            <View style={styles.searchRow}>
              <View style={styles.searchContainer}>
                <TextInput
                  ref={inputRef}
                  style={styles.searchInput}
                  placeholder={t("libraryModal.searchPlaceholder")}
                  placeholderTextColor="#a39b93"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus={false}
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
                <Text style={styles.searchBtnText}>{t("libraryModal.searchBtn")}</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#d4a017" />
                <Text style={styles.searchingText}>{t("libraryModal.searching")}</Text>
              </View>
            ) : (
              <FlatList
                data={results}
                keyExtractor={(item, idx) =>
                  (item.itemId || (item as any).item_id || "") + idx
                }
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                onEndReached={loadMore}
                onEndReachedThreshold={0.4}
                ListFooterComponent={
                  loadingMore ? (
                    <View style={{ paddingVertical: 16, alignItems: "center" }}>
                      <ActivityIndicator size="small" color="#C99317" />
                    </View>
                  ) : null
                }
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    {searchQuery.trim().length >= 2
                      ? t("libraryModal.noResults")
                      : t("libraryModal.browseHint")}
                  </Text>
                }
                renderItem={({ item }: { item: any }) => (
                  <View
                    style={[
                      styles.itemCard,
                      (item.alreadyInCore || item.alreadyAdded) &&
                        styles.disabledCard,
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.itemInfo}
                      activeOpacity={0.7}
                      onPress={() => setDetailItem(item)}
                    >
                      <View style={styles.badgeRow}>
                        <Text style={styles.itemTypeBadge}>
                          {TYPE_BADGE_LABELS[item._type || item.itemType] || (item._type || item.itemType)}
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

                      <View style={styles.detailsHintRow}>
                        <Text style={styles.detailsHintText}>
                          {t("libraryModal.viewDetails")}
                        </Text>
                        <Ionicons name="chevron-forward" size={14} color="#b08a3e" />
                      </View>
                    </TouchableOpacity>

                    <View style={styles.actionWrap}>
                      {item.alreadyInCore ? (
                        <Text style={styles.statusText}>{t("libraryModal.inCore")}</Text>
                      ) : item.alreadyAdded ? (
                        <Text style={styles.statusText}>{t("libraryModal.added")}</Text>
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
                              {(mode === "select_for_rhythm" || mode === "select")
                                ? (selectLabel ?? t("libraryModal.select"))
                                : t("libraryModal.add")}
                            </Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              />
            )}
              </>
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
    height: "76%",
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

  // "View details" affordance on each list card
  detailsHintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 12,
  },
  detailsHintText: {
    fontSize: 12,
    color: "#b08a3e",
    fontFamily: Fonts.sans.semiBold,
  },

  // Back button (detail header)
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    flex: 1,
    marginRight: 12,
  },
  backText: {
    fontSize: 17,
    color: "#7d5408",
    fontFamily: Fonts.serif.bold,
    fontWeight: "700",
  },

  // Detail panel
  detailStickyTop: {
    paddingBottom: 8,
  },
  detailTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 6,
  },
  detailDivider: {
    height: 1,
    backgroundColor: "rgba(201,168,76,0.18)",
    marginTop: 10,
  },
  detailActionBtnCompact: {
    backgroundColor: "#D39A14",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginTop: 8,
  },
  detailScroll: {
    marginTop: 6,
  },
  detailContent: {
    paddingBottom: 24,
  },
  detailTitle: {
    fontSize: 22,
    fontFamily: Fonts.serif.bold,
    color: "#4b260a",
    fontWeight: "700",
    lineHeight: 28,
    marginTop: 4,
  },
  detailDevanagari: {
    fontSize: 22,
    fontFamily: Fonts.serif.regular,
    color: "#6b3d12",
    lineHeight: 36,
    marginTop: 14,
  },
  detailSection: {
    marginTop: 12,
  },
  detailLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#a07c45",
    fontFamily: Fonts.sans.bold,
    marginBottom: 6,
  },
  detailBody: {
    fontSize: 16,
    fontFamily: Fonts.serif.regular,
    color: "#544a40",
    lineHeight: 24,
  },
  detailMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 28,
    marginTop: 20,
  },
  detailMetaItem: {
    minWidth: 100,
  },
  detailMetaValue: {
    fontSize: 15,
    fontFamily: Fonts.serif.bold,
    color: "#4b260a",
  },
  detailActionWrap: {
    marginTop: 28,
  },
  detailActionBtn: {
    backgroundColor: "#D39A14",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  detailActionBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: Fonts.sans.semiBold,
  },
});

export default LibrarySearchModal;

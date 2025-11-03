import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import Accordion from "../../components/Accordion";
import ExploreVideosVertical from "../../components/ExporeVideosVertical";
import TextComponent from "../../components/TextComponent";
import { RootState } from "../../store";
import { getVideoCategoriesWithLanguages, getVideos } from "./actions";
import styles from "./exploreStyles";

const LANGUAGE_CODE_MAP: Record<string, string> = {
  Bengali: "bn",
  English: "en",
  Gujarati: "gu",
  Hindi: "hi",
  Kannada: "kn",
  Malayalam: "ml",
  Marathi: "mr",
  Odia: "or",
  Tamil: "ta",
  Telugu: "te",
};

const Explore = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [kidsHub, setKidsHub] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<{ id: string | number; name: string }>({
    id: "All",
    name: "All",
  });
  const [selectedLanguage, setSelectedLanguage] = useState("All");

  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const { data, loading } = useSelector((state: RootState) => state.videoCategoriesReducer);
  const { data: videoData, loading: videoLoading, page, hasMore } = useSelector(
    (state: RootState) => state.videosReducer
  );

  useEffect(() => {
    dispatch(
      getVideoCategoriesWithLanguages((res) => {
        if (res.success) console.log("✅ Category Data:", res.data);
      })
    );
  }, [dispatch]);

  

  // 🎬 Fetch videos (default / filters)
  useEffect(() => {
    if (searchText.trim().length > 0) return; // prevent auto fetch when searching
    fetchVideos(1);
  }, [selectedCategory, selectedLanguage, kidsHub]);

  // 🎬 Fetch videos (default / filters / search)
const fetchVideos = (pageNumber: number, isSearch = false) => {
  const categoryParam = selectedCategory.id !== "All" ? selectedCategory.id : undefined;
  const languageParam =
    selectedLanguage !== "All" ? LANGUAGE_CODE_MAP[selectedLanguage] : undefined;
  const searchParam = searchText.trim() ? searchText.trim() : undefined;

  const params: Record<string, any> = {
    paginate: true,
    per_page: 22,
    page: pageNumber,
    _cacheBuster: Date.now(),
  };

  if (categoryParam) params.category = categoryParam;
  if (languageParam) params.language = languageParam;
  if (isSearch && searchParam) params.search = searchParam;

  // build query string manually
  const queryString = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");

  console.log("🌐 Fetching videos from:", `videos/list_videos/?${queryString}`);

  dispatch(
    getVideos(params, (res) => {
      if (res.success) {
        console.log(
          `✅ Loaded Page ${pageNumber} → ${res.data.length} videos (${
            isSearch ? "Search" : "Browse"
          })`
        );
      } else {
        console.error("❌ Failed to load videos:", res.error);
      }
    })
  );
};


  // 🔹 Search handler
  const handleSearch = () => {
    if (!searchText.trim()) return;
    console.log(`🔍 Searching for "${searchText}" ...`);
    fetchVideos(1, true);
  };

  // 🔹 Clear search
  const handleClearSearch = () => {
    setSearchText("");
    fetchVideos(1);
  };

  // 🔹 Pagination
  const handleLoadMore = () => {
    if (!videoLoading && hasMore) {
      fetchVideos(page + 1, !!searchText.trim());
    }
  };

  // 🧩 Build categories
  const categories = useMemo(() => {
    if (data?.categories?.length) {
      return [{ id: "All", name: "All" }, ...data.categories.map((c: any) => ({
        id: c.category_id,
        name: c.category_name,
      }))];
    }
    return [{ id: "All", name: "All" }];
  }, [data]);

  // 🧩 Build languages
  const languages = useMemo(() => {
    if (!data?.categories?.length) return ["All"];
    if (selectedCategory.id === "All") return ["All", ...(data?.all_languages || [])];
    const selectedCatObj = data.categories.find(
      (c: any) => c.category_id === selectedCategory.id
    );
    if (selectedCatObj?.languages?.length) return ["All", ...selectedCatObj.languages];
    return ["All"];
  }, [data, selectedCategory]);

  const handleSelectOption = (option: any, type: string) => {
    if (type === "category") {
      setSelectedCategory(option);
      setCategoryModalVisible(false);
      setSelectedLanguage("All");
    } else {
      setSelectedLanguage(option);
      setLanguageModalVisible(false);
    }
  };

  const resetFilters = () => {
    setSelectedCategory({ id: "All", name: "All" });
    setSelectedLanguage("All");
    setSearchText("");
    fetchVideos(1);
  };

  const renderRadioOptions = (options: any[], selected: any, type: string) => (
    <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
      {options.map((item, idx) => {
        const isSelected = type === "category" ? selected?.id === item.id : selected === item;
        const label = type === "category" ? item.name : item;
        return (
          <Pressable key={idx} style={styles.radioRow} onPress={() => handleSelectOption(item, type)}>
            <Ionicons
              name={isSelected ? "radio-button-on" : "radio-button-off"}
              size={20}
              color={isSelected ? "#b97f28" : "#999"}
            />
            <Text style={styles.radioText}>{label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#b97f28" />
        <Text style={{ marginTop: 10 }}>Loading categories...</Text>
      </SafeAreaView>
    );
  }

  const showCombinedFilter =
    selectedCategory.id !== "All" || selectedLanguage !== "All" || searchText.length > 0;
  const filterLabelParts = [];
  if (searchText.length > 0) filterLabelParts.push(`"${searchText}"`);
  if (selectedCategory.id !== "All") filterLabelParts.push(selectedCategory.name);
  if (selectedLanguage !== "All") filterLabelParts.push(selectedLanguage);
  const filterLabel = filterLabelParts.join(" : ");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff4dd" />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.rowBetween}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={styles.topButtons}>
              <View style={styles.iconButton}>
                <Ionicons name="arrow-back" size={22} color="#fff" onPress={() => navigation.goBack()} />
              </View>
            </View>
            <TextComponent type="headerBoldText" style={styles.title}>
              {t("explore.title")}
            </TextComponent>
          </View>

          <View style={styles.row}>
            <TextComponent type="headerBoldText" style={styles.kidsText}>
              {t("explore.kids")}
            </TextComponent>
            <Switch
              value={kidsHub}
              onValueChange={setKidsHub}
              thumbColor="#fff"
              trackColor={{ false: "#ccc", true: "#b97f28" }}
            />
          </View>
        </View>

        {/* 🔍 Search Bar */}
        <View style={styles.searchBar}>
          <TextInput
            placeholder={t("explore.search")}
            placeholderTextColor="#999"
            style={[styles.searchInput, { flex: 1 }]}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <Pressable onPress={handleClearSearch}>
              <Ionicons name="close-circle" size={20} color="#999" style={{ marginHorizontal: 6 }} />
            </Pressable>
          )}
          <Pressable onPress={handleSearch}>
            <Ionicons name="search" size={22} color="#b97f28" />
          </Pressable>
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterButton} onPress={() => setCategoryModalVisible(true)}>
            <TextComponent type="headerBoldText" style={styles.filterText}>
              {t("explore.filters.category")}
            </TextComponent>
            <Ionicons name="chevron-down" size={16} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton} onPress={() => setLanguageModalVisible(true)}>
            <TextComponent type="headerBoldText" style={styles.filterText}>
              {t("explore.filters.language")}
            </TextComponent>
            <Ionicons name="chevron-down" size={16} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Active Filters Tag */}
        {showCombinedFilter && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 8 }}>
            <View style={styles.activeFilterTag}>
              <TextComponent type="headerText" style={styles.activeFilterText}>{filterLabel}</TextComponent>
              <Pressable onPress={resetFilters}>
                <Ionicons name="close" size={20} color="#fff" />
              </Pressable>
            </View>
          </View>
        )}

        {/* Videos */}
        <TextComponent type="headerBoldText" style={styles.subtitle}>
          {t("explore.subtitle")}
        </TextComponent>

        <ScrollView style={{ marginTop: 16 }} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
          <ExploreVideosVertical videos={videoData} onLoadMore={handleLoadMore} loading={videoLoading} home={false}/>
          <TextComponent type="headerBoldText" style={styles.subtitleTwo}>
            {t("explore.subtitleTwo")}
          </TextComponent>
          <Accordion data={t("explore.faq", { returnObjects: true })} />
        </ScrollView>
      </View>

      {/* Category Modal */}
      <Modal visible={categoryModalVisible} animationType="slide" transparent onRequestClose={() => setCategoryModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("explore.modal.category")}</Text>
              <Pressable onPress={() => setCategoryModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </Pressable>
            </View>
            {renderRadioOptions(categories, selectedCategory, "category")}
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal visible={languageModalVisible} animationType="slide" transparent onRequestClose={() => setLanguageModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("explore.modal.language")}</Text>
              <Pressable onPress={() => setLanguageModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </Pressable>
            </View>
            {renderRadioOptions(languages, selectedLanguage, "language")}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Explore;
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Switch,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import Accordion from "../../components/Accordion";
import ExploreVideosVertical from "../../components/ExporeVideosVertical";
import Header from "../../components/Header";
import TextComponent from "../../components/TextComponent";
import api from "../../Networks/axios";
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

const PER_PAGE = 12;

import { useScrollContext } from "../../context/ScrollContext";

const Explore = () => {
  const { handleScroll } = useScrollContext();
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef<ScrollView | null>(null);

  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const { data, loading } = useSelector((state: RootState) => state.videoCategoriesReducer);
  const { data: videoData, loading: videoLoading } = useSelector(
    (state: RootState) => state.videosReducer
  );

  useEffect(() => {
    dispatch(
      getVideoCategoriesWithLanguages((res) => {
        if (res.success) console.log("✅ Category Data:", res.data);
      })
    );
  }, [dispatch]);

  useEffect(() => {
    fetchVideos(1);
  }, [selectedCategory, selectedLanguage, kidsHub]);

  const fetchVideos = async (pageNumber: number, isSearch = false) => {
    const categoryParam = selectedCategory.id !== "All" ? selectedCategory.id : undefined;
    const languageParam =
      selectedLanguage !== "All" ? LANGUAGE_CODE_MAP[selectedLanguage] : undefined;
    const searchParam = searchText.trim() ? searchText.trim() : undefined;

    const params: Record<string, any> = {
      paginate: true,
      per_page: PER_PAGE,
      page: pageNumber,
      _cacheBuster: Date.now(),
    };

    if (categoryParam) params.category = categoryParam;
    if (languageParam) params.language = languageParam;
    if (isSearch && searchParam) params.search = searchParam;
    if (kidsHub) params.child_anime_filter = "true";

    const queryString = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join("&");

    const fetchUrl = `videos/list_videos/?${queryString}`;
    console.log("🌐 Fetching:", fetchUrl);

    dispatch(
      getVideos(
        {
          page: pageNumber,
          per_page: PER_PAGE,
          category: selectedCategory.id === "All" ? "All" : selectedCategory.name,
          language: selectedLanguage === "All" ? "All" : selectedLanguage,
          search: isSearch ? searchParam : "",
          kidsHub,
        },
        (res) => {
          if (res.success) {
            fadeIn();
          }
        }
      )
    );

    if (pageNumber === 1) {
      try {
        const resp = await api.get(fetchUrl);
        const count = resp?.data?.count;
        if (typeof count === "number") {
          const pages = Math.max(1, Math.ceil(count / PER_PAGE));
          setTotalPages(pages);
          console.log(`🎬 Total Pages: ${pages}`);
        }
      } catch (err) {
        console.error("⚠️ Error fetching total count:", err);
      }
    }
  };

  const fadeIn = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  };

  const handleSearch = () => {
    if (!searchText.trim()) return;
    setCurrentPage(1);
    fetchVideos(1, true);
  };

  const handleClearSearch = () => {
    if (!searchText) return;
    setSearchText("");
    setCurrentPage(1);
    fetchVideos(1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchVideos(nextPage);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchVideos(prevPage);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const categories = useMemo(() => {
    if (data?.categories?.length) {
      return [{ id: "All", name: "All" }, ...data.categories.map((c: any) => ({
        id: c.category_id,
        name: c.category_name,
      }))];
    }
    return [{ id: "All", name: "All" }];
  }, [data]);

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
      setCurrentPage(1);
    } else {
      setSelectedLanguage(option);
      setLanguageModalVisible(false);
      setCurrentPage(1);
    }
  };

  const resetFilters = () => {
    setSelectedCategory({ id: "All", name: "All" });
    setSelectedLanguage("All");
    setSearchText("");
    setCurrentPage(1);
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
            <TextComponent type="headerText" style={styles.radioText}>{label}</TextComponent>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  // if (loading) {
  //   return (
  //     <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
  //       <ActivityIndicator size="large" color="#b97f28" />
  //       <TextComponent type="headerText" style={{ marginTop: 10 }}>
  //         Loading categories...
  //       </TextComponent>
  //     </SafeAreaView>
  //   );
  // }

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
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
          ref={(r) => { scrollRef.current = r; }}
          style={{ marginTop: 0 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View style={{ height: 60 }} />
          {/* Top Section */}
          <View style={styles.rowBetween}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={styles.iconButton}>
                <Ionicons name="arrow-back" size={22} color="#fff" onPress={() => navigation.goBack()} />
              </View>
              <TextComponent type="headerSubBoldText" style={styles.title}>
                {t("explore.title")}
              </TextComponent>
            </View>

            <View style={styles.row}>
              <TextComponent type="headerSubBoldText" style={styles.kidsText}>
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
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <TextInput
              allowFontScaling={false}
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
              <TextComponent type="headerSubBoldText" style={styles.filterText}>
                {t("explore.filters.category")}
              </TextComponent>
              <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.filterButton} onPress={() => setLanguageModalVisible(true)}>
              <TextComponent type="headerSubBoldText" style={styles.filterText}>
                {t("explore.filters.language")}
              </TextComponent>
              <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          {/* Active Filters */}
          {showCombinedFilter && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 8, alignSelf: "center" }}>
              <View style={styles.activeFilterTag}>
                <TextComponent type="headerSubBoldText" style={styles.activeFilterText}>{filterLabel}</TextComponent>
                <Pressable onPress={resetFilters}>
                  <Ionicons name="close" size={20} color="#fff" />
                </Pressable>
              </View>
            </View>
          )}
          {/* Videos */}
          <TextComponent type="headerSubBoldText" style={styles.subtitle}>
            {t("explore.subtitle")}
          </TextComponent>
          <ExploreVideosVertical
            videos={videoData}
            loading={videoLoading}
            totalPages={totalPages}
            currentPage={currentPage}
            onNext={handleNextPage}
            onPrev={handlePrevPage}
          />
          {!videoLoading &&
            <>
              <TextComponent type="headerSubBoldText" style={styles.subtitleTwo}>
                {t("explore.subtitleTwo")}
              </TextComponent>
              <Accordion data={t("explore.faq", { returnObjects: true })} />
            </>
          }
        </ScrollView>
      </Animated.View>

      {/* Category Modal */}
      <Modal visible={categoryModalVisible} animationType="slide" transparent onRequestClose={() => setCategoryModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TextComponent type="mediumText" style={styles.modalTitle}>{t("explore.modal.category")}</TextComponent>
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
              <TextComponent type="mediumText" style={styles.modalTitle}>{t("explore.modal.language")}</TextComponent>
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
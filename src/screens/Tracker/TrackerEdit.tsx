// screens/Tracker/TrackerEdit.tsx

/* --- PART 1 START --- */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import React, { useEffect, useMemo, useRef, useState, memo } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { useScrollContext } from "../../context/ScrollContext";
import { Animated } from "react-native";
import AddPracticeInputModal from "../../components/AddPracticeInputModal";
import CartModal from "../../components/CartModal";
import CommunityAuthModal from "../../components/CommunityAuthModal";
import Colors from "../../components/Colors";
import ConfirmDiscardModal from "../../components/ConfirmDiscardModal";
import DailyPracticeDetailsCard from "../../components/DailyPracticeDetailsCard";
import DailyPracticeMantraCard from "../../components/DailyPracticeMantraCard";
import MantraCard from "../../components/MantraCard";
import SankalpCard from "../../components/SankalpCard";
import LoadingButton from "../../components/LoadingButton";
import LoadingOverlay from "../../components/LoadingOverlay";
import TextComponent from "../../components/TextComponent";
import i18n from "../../config/i18n";
import { useCart } from "../../context/CartContext";
import { CATALOGS } from "../../data/mantras";
import { SANATAN_PRACTICES_FINAL } from "../../data/sanatanPractices";
import { DAILY_SANKALPS } from "../../data/sankalps";
import { RootState } from "../../store";
import { getRawPracticeObject } from "../../utils/getPracticeObjectById";
import { getTranslatedPractice } from "../../utils/getTranslatedPractice";
import { getDailyDharmaTracker, submitDailyDharmaSetup } from "../Home/actions";
import styles from "./TrackerEditStyles";

// --- Sub-components for better performance ---

const PracticeCardItem = memo(({ item, isAdded, onToggle, onInfo, t, capsuleHeight }: any) => {
  const translated = getTranslatedPractice(item, t);
  const displayName = translated.name || item.title || item.name || t("sadanaTracker.unnamedPractice");
  const displayDescription = translated.desc || item.description || "";
  const isMantraOrSankalp = ["daily-mantra", "daily-sankalp"].includes(item.category);

  return (
    <View style={[
      styles.simpleCard,
      {
        height: isMantraOrSankalp ? capsuleHeight : undefined,
        backgroundColor: "#FFFFFF",
        borderColor: "#CC9B2F",
        borderWidth: 1,
        marginBottom: 12,
      }
    ]}>
      <TouchableOpacity
        onPress={() => onToggle(item)}
        style={{
          width: 22,
          height: 22,
          borderWidth: 1,
          borderColor: isAdded ? "#D4A017" : "#000000",
          borderRadius: 4,
          backgroundColor: isAdded ? "#D4A017" : "#FFFFFF",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {isAdded && (
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
        )}
      </TouchableOpacity>

      <View style={{ flex: 1, marginLeft: 14 }}>
        <TextComponent type="boldText" style={styles.cardTitle} numberOfLines={1}>
          {item.category === 'sanatan' && item.icon ? `${item.icon} ` : ""}
          {displayName}
        </TextComponent>

        <TextComponent style={styles.cardSubtitle} numberOfLines={2}>
          {displayDescription}
        </TextComponent>
      </View>

      <View style={styles.cardRightIcons}>
        <TouchableOpacity onPress={() => onInfo(item)}>
          <Ionicons
            name="information-circle-outline"
            size={26}
            color="#D4A017"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const initialCategories = [
  {
    name: "sadanaTracker.categories.peace-calm.name",
    key: "peace-calm",
    description: "sadanaTracker.categories.peace-calm.description",
  },
  {
    name: "sadanaTracker.categories.focus.name",
    key: "focus",
    description: "sadanaTracker.categories.focus.description",
  },
  {
    name: "sadanaTracker.categories.healing.name",
    key: "healing",
    description: "sadanaTracker.categories.healing.description",
  },
  {
    name: "sadanaTracker.categories.gratitude.name",
    key: "gratitude",
    description: "sadanaTracker.categories.gratitude.description",
  },
  {
    name: "sadanaTracker.categories.spiritual-growth.name",
    key: "spiritual-growth",
    description: "sadanaTracker.categories.spiritual-growth.description",
  },
  {
    name: "sadanaTracker.categories.health.name",
    key: "health",
    description: "sadanaTracker.categories.health.description",
  },
  {
    name: "sadanaTracker.categories.career.name",
    key: "career",
    description: "sadanaTracker.categories.career.description",
  },
  {
    name: "sadanaTracker.categories.sanatan.name",
    key: "sanatan",
    description: "sadanaTracker.categories.sanatan.description",
  },
  {
    name: "sadanaTracker.categories.daily-mantra.name",
    key: "daily-mantra",
    description: "sadanaTracker.categories.daily-mantra.description",
  },
  {
    name: "sadanaTracker.categories.daily-sankalp.name",
    key: "daily-sankalp",
    description: "sadanaTracker.categories.daily-sankalp.description",
  },
];

const TrackerEdit = ({ route }) => {
  const { handleScroll } = useScrollContext();
  const navigation: any = useNavigation();
  const { t } = useTranslation();
  const categoryRef = useRef<any>(null);
  const fromRoute = route?.params?.from;

  const selectedmantra = route?.params?.selectedmantra;
  const selectedMantraFromRoute = route?.params?.selectedMantra;
  const autoCategory = route?.params?.autoSelectCategory;
  const selectedSankalpFromRoute = route?.params?.selectedSankalp;
  const sankalpListRef = useRef<FlatList>(null);
  const hasAutoScrolledRef = useRef(false);

  const CAPSULE_ITEM_HEIGHT = 96; // adjust if needed (90–110 is fine)


  // const [selectedCategory, setSelectedCategory] = useState(
  //   initialCategories[0].key
  // );
  const [selectedCategory, setSelectedCategory] = useState(
    route?.params?.autoSelectCategory ?? initialCategories[0].key
  );
  const [selectedPractices, setSelectedPractices] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState("mantra");
  const [searchText, setSearchText] = useState("");
  const [isAddMoreScreen, setIsAddMoreScreen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsList, setDetailsList] = useState<any[]>([]);
  const [detailsIndex, setDetailsIndex] = useState(0);
  const [detailsCategoryItem, setDetailsCategoryItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCount, setSelectedCount] = useState<number | null>(null);
  const [inputModalVisible, setInputModalVisible] = useState(false);
  const [selectedPracticeForModal, setSelectedPracticeForModal] =
    useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [discardModalVisible, setDiscardModalVisible] = useState(false);
  const [allowHydrate, setAllowHydrate] = useState(true);
  const [removedApiOnce, setRemovedApiOnce] = useState(false);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingSubmitPayload, setPendingSubmitPayload] = useState<any>(null);

  const user = useSelector((state: RootState) => state.login?.user || state.socialLoginReducer?.user);
  const isUserLoggedIn = !!user;


  // const [sanatanRenderCount, setSanatanRenderCount] = useState(15);

  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const resumeData = route?.params?.resumeData;

  const dailyPractice: any = useSelector(
    (state: RootState) => state.dailyPracticeReducer
  );

  const {
    localPractices,
    addPractice,
    removePractice,
    removeApiPractice,
    cartModalVisible,
    setCartModalVisible,
    resetFromMerged,
    clearCart,
    removedApiIds,   // ← ADD THIS
  } = useCart();

  console.log("localPractices >>>>>", JSON.stringify(localPractices));

  const allData = i18n.getResourceBundle(i18n.language, "translation");

  useEffect(() => {
    if (fromRoute === "sankalp" || fromRoute === "mantra") {
      setIsAddMoreScreen(true);
    }
  }, [fromRoute]);



  useEffect(() => {
    if (autoCategory === "daily-sankalp") {
      setSelectedCategory("daily-sankalp");
    }
  }, [autoCategory]);

  const getTagFromItem = (item: any) => {
    if (
      item.source === "mantra" ||
      item.id?.startsWith("mantra.")
    ) {
      return "mantra";
    }

    if (
      item.source === "sankalp" ||
      item.id?.startsWith("sankalp.")
    ) {
      return "sankalp";
    }

    return "practice";
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
      setDiscardModalVisible(true);
    });

    return unsubscribe;
  }, [hasUnsavedChanges, navigation]);

  // useEffect(() => {
  //   if (selectedCategory === "sanatan") {
  //     setSanatanRenderCount(15);
  //   }
  // }, [selectedCategory, searchText]);

  const safeAddPractice = (p: any) => {
    setAllowHydrate(false);
    addPractice(p);
    setHasUnsavedChanges(true);
  };

  const apiPracticeIdSet = useMemo(() => {
    return new Set(
      (dailyPractice?.data?.active_practices || []).map(
        (p: any) => p.practice_id ?? p.id
      )
    );
  }, [dailyPractice]);

  const sanatanList = useMemo(() => {
    const safeList = SANATAN_PRACTICES_FINAL.map((p: any, index) => ({
      ...p,
      id: p.id ?? `sanatan_${index}`,
      practice_id: p.practice_id ?? p.id ?? `sanatan_${index}`,
      category: 'sanatan'
    }));

    return safeList.filter(
      (p: any) =>
        !apiPracticeIdSet.has(p.practice_id)
    ).filter((practice) => {
      const nameKey = `practices.${practice.id}.name`;
      const n = t(nameKey, { defaultValue: practice.name ?? "" }).toLowerCase();
      const d = t(`practices.${practice.id}.description`, { defaultValue: practice.description ?? "" }).toLowerCase();
      const s = searchText.toLowerCase();
      return n.includes(s) || d.includes(s);
    });
  }, [apiPracticeIdSet, searchText, t]);

  const mantraList = useMemo(() => {
    return Object.values(allData)
      .filter(
        (item: any) =>
          item?.category === selectedCategory &&
          item?.id?.startsWith("mantra.") &&
          !apiPracticeIdSet.has(item.id)     // 🔥 FILTER
      )
      .filter((item: any) =>
        item.title?.toLowerCase().includes(searchText.toLowerCase())
      ).map((item: any) => ({ ...item, category: selectedCategory }));
  }, [allData, selectedCategory, searchText, apiPracticeIdSet]);

  // const hasSelectionInCurrentCategory = useMemo(() => {
  //   return localPractices.some(
  //     (p: any) => p.category === selectedCategory
  //   );
  // }, [localPractices, selectedCategory]);



  const sankalpList = useMemo(() => {
    return Object.values(allData)
      .filter(
        (item: any) =>
          item?.category === selectedCategory &&
          item?.id?.startsWith("sankalp.") &&
          !apiPracticeIdSet.has(item.id)
      )
      .filter((item: any) =>
        item.title?.toLowerCase().includes(searchText.toLowerCase())
      ).map((item: any) => ({ ...item, category: selectedCategory }));
  }, [allData, selectedCategory, searchText, apiPracticeIdSet]);

  const practiceList = useMemo(() => {
    return Object.values(allData)
      .filter(
        (item: any) =>
          item?.category === selectedCategory &&
          item?.id?.startsWith("practice.") &&
          !apiPracticeIdSet.has(item.id)
      )
      .filter((item: any) =>
        item.title?.toLowerCase().includes(searchText.toLowerCase())
      ).map((item: any) => ({ ...item, category: selectedCategory }));
  }, [allData, selectedCategory, searchText, apiPracticeIdSet]);

  const normalizePractice = (p: any) => ({
    ...p,
    id: p?.id || p?.practice_id,
    practice_id: p?.practice_id || p?.id,
    title: p?.title || p?.name || p?.short_text,
    name: p?.name || p?.title || p?.tooltip,
    icon: p?.icon || "",
    category: p.category || "",

    details: {
      ...(p.details || {}),
      day: p.details?.day ?? p.day ?? t("sadanaTracker.dailyLabel"),
      reps: p.details?.reps ?? p.reps ?? "",
    },

    day: p.details?.day ?? p.day ?? t("sadanaTracker.dailyLabel"),
    reps: p.details?.reps ?? p.reps ?? "",
  });

  const normalizeForMantraCard = (item: any) => {
    const translated = getTranslatedPractice(item, t);
    return {
      ...item,
      title: translated.name,
      description: translated.desc,
      category: item.category,
      day: item.day ?? item.details?.day ?? t("sadanaTracker.dailyLabel"),
      reps: item.reps ?? item.details?.reps,
    };
  };


  const mergedPractices = useMemo(() => {
    const apiList =
      dailyPractice?.data?.active_practices?.map(normalizePractice) || [];

    const resumePractices =
      resumeData?.pendingPractices ||
      resumeData?.payload?.pendingPractices ||
      [];

    const resumeList = resumePractices.map(normalizePractice);

    const selectedList = selectedmantra
      ? [normalizePractice(selectedmantra)]
      : [];

    const map = new Map<string | number, any>();

    apiList.forEach((p) => map.set(p.practice_id, p));
    resumeList.forEach((p) => map.set(p.practice_id, p));
    selectedList.forEach((p) => map.set(p.practice_id, p));
    return Array.from(map.values()).filter(
      (p: any) => !removedApiIds.has(p.practice_id ?? p.id ?? p.unified_id)
    );

  }, [dailyPractice, resumeData, selectedmantra]);

  const isSanatan = selectedCategory === "sanatan";

  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (!allowHydrate) return;       // user is editing → don't touch anything

    if (!hasHydratedRef.current) {
      if (mergedPractices?.length) {
        resetFromMerged(mergedPractices);
        hasHydratedRef.current = true;
        setHasUnsavedChanges(false);
      }
      return;
    }

    if (allowHydrate && mergedPractices?.length) {
      resetFromMerged(mergedPractices);
      setHasUnsavedChanges(false);
    }
  }, [mergedPractices, allowHydrate]);


  const dailyMantraList = useMemo(() => {
    const langKey = i18n.language.split("-")[0];
    const allMantras = CATALOGS[langKey] || CATALOGS.en;

    return allMantras.filter((m: any) => {
      const title =
        m.title ||
        m.name ||
        m.iast ||
        m.devanagari ||
        "";

      return title.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [i18n.language, searchText]);

  const dailySankalpList = useMemo(() => {
    return DAILY_SANKALPS.filter((s: any) => {
      const text =
        s.short_text ||
        s.tooltip ||
        "";

      return text.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [searchText]);

  const normalizedMantras = useMemo(() => {
    return dailyMantraList.map((m: any, index) => {
      const translated = getTranslatedPractice(m, t);
      return {
        ...m,
        id: m.id || `mantra_${index}`,
        practice_id: m.id || `mantra_${index}`,
        title: translated.name,
        description: translated.desc,
        category: "daily-mantra",
      };
    }).filter(
      (m: any) => !apiPracticeIdSet.has(m.practice_id)
    );
  }, [dailyMantraList, apiPracticeIdSet, t]);


  const normalizedSankalps = useMemo(() => {
    return dailySankalpList.map((s: any, index) => {
      const translated = getTranslatedPractice(s, t);
      return {
        ...s,
        id: s.id || `sankalp_${index}`,
        practice_id: s.id || `sankalp_${index}`,
        title: translated.name,
        description: translated.desc,
        category: "daily-sankalp",
      };
    }).filter(
      (s: any) => !apiPracticeIdSet.has(s.practice_id)
    );
  }, [dailySankalpList, apiPracticeIdSet, t]);

  useEffect(() => {
    if (
      !isAddMoreScreen ||
      selectedCategory !== "daily-sankalp" ||
      !selectedSankalpFromRoute ||
      !normalizedSankalps.length
    ) {
      return;
    }

    const unifiedId = selectedSankalpFromRoute.id;

    const normalizedItem = normalizedSankalps.find(
      (s: any) => s.id === unifiedId
    );

    if (!normalizedItem) return;

    const alreadyAdded = localPractices.some(
      (p: any) =>
        p.unified_id === unifiedId ||
        p.practice_id === unifiedId ||
        p.id === unifiedId
    );

    if (!alreadyAdded) {
      setAllowHydrate(false);
      hasHydratedRef.current = true;

      addPractice({
        ...normalizedItem,
        unified_id: unifiedId,
        day: t("sadanaTracker.dailyLabel"),
        reps: "",
      });
    }
  }, [
    isAddMoreScreen,
    selectedCategory,
    normalizedSankalps,
    selectedSankalpFromRoute,
  ]);

  useEffect(() => {
    if (
      !isAddMoreScreen ||
      selectedCategory !== "daily-mantra" ||
      !selectedMantraFromRoute ||
      !normalizedMantras.length
    ) {
      return;
    }

    const unifiedId = selectedMantraFromRoute.id;

    const normalizedItem = normalizedMantras.find(
      (m: any) => m.id === unifiedId
    );

    if (!normalizedItem) return;

    const alreadyAdded = localPractices.some(
      (p: any) =>
        p.unified_id === unifiedId ||
        p.practice_id === unifiedId ||
        p.id === unifiedId
    );

    if (!alreadyAdded) {
      setAllowHydrate(false);
      hasHydratedRef.current = true;

      addPractice({
        ...normalizedItem,
        unified_id: unifiedId,
        day: t("sadanaTracker.dailyLabel"),
        reps: "",
      });
    }
  }, [
    isAddMoreScreen,
    selectedCategory,
    normalizedMantras,
    selectedMantraFromRoute,
  ]);

  useEffect(() => {
    if (
      !isAddMoreScreen ||
      selectedCategory !== "daily-mantra" ||
      !normalizedMantras.length ||
      hasAutoScrolledRef.current
    ) {
      return;
    }

    setTimeout(() => {
      sankalpListRef.current?.scrollToEnd({ animated: true });
      hasAutoScrolledRef.current = true;
    }, 300);
  }, [isAddMoreScreen, selectedCategory, normalizedMantras]);


  // useEffect(() => {
  //   if (
  //     selectedCategory === "daily-sankalp" &&
  //     selectedSankalpFromRoute &&
  //     normalizedSankalps?.length
  //   ) {
  //     const index = normalizedSankalps.findIndex(
  //       (s: any) =>
  //         s.id === selectedSankalpFromRoute.id
  //     );

  //     if (index >= 0) {
  //       setTimeout(() => {
  //         sankalpListRef.current?.scrollToIndex({
  //           index,
  //           animated: true,
  //           viewPosition: 0.5,
  //         });
  //       }, 300);
  //     }
  //   }
  // }, [selectedCategory, normalizedSankalps]);

  useEffect(() => {
    if (
      !isAddMoreScreen ||                       // must be on Add To My Practice
      selectedCategory !== "daily-sankalp" ||
      !selectedSankalpFromRoute ||
      !normalizedSankalps.length ||
      hasAutoScrolledRef.current                // prevent repeat
    ) {
      return;
    }

    const index = normalizedSankalps.findIndex(
      (s: any) => s.id === selectedSankalpFromRoute.id
    );

    if (index >= 0) {
      // wait for FlatList layout
      requestAnimationFrame(() => {
        sankalpListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.4,
        });
        hasAutoScrolledRef.current = true;
      });
    }
  }, [
    isAddMoreScreen,
    selectedCategory,
    normalizedSankalps,
    selectedSankalpFromRoute,
  ]);

  // Debug: Track login state changes
  useEffect(() => {
    console.log("👤 TrackerEdit: User login state changed:", { isUserLoggedIn, user: !!user, hasPendingPayload: !!pendingSubmitPayload });
  }, [isUserLoggedIn, pendingSubmitPayload]);

  // ✅ Auto-submit after authentication
  useEffect(() => {
    if (isUserLoggedIn && pendingSubmitPayload && !loading) {
      console.log("🚀 Auto-submit triggered (TrackerEdit)!", pendingSubmitPayload);

      const handleAutoSubmit = async () => {
        setLoading(true);
        setShowAuthModal(false);

        // CartModal submission
        if (pendingSubmitPayload.cartList) {
          console.log("📥 Fetching tracker data for cart submission...");
          dispatch(getDailyDharmaTracker(async (trackerRes) => {
            if (trackerRes.success) {
              submitCartToServer(pendingSubmitPayload.cartList);
            }
            setPendingSubmitPayload(null);
          }));
        }
        // Confirm navigation
        else if (pendingSubmitPayload.practices) {
          setPendingSubmitPayload(null);
          navigation.navigate("ConfirmDailyPractices", {
            practices: pendingSubmitPayload.practices,
            trackerEdit: true
          });
          setLoading(false);
        }
      };

      handleAutoSubmit();
    }
  }, [isUserLoggedIn, pendingSubmitPayload]);



  const apiPractices = dailyPractice?.data?.active_practices ?? [];




  // API practices (still active, excluding removed ones)
  const activeApiPractices = useMemo(() => {
    return apiPractices.filter(
      (api: any) =>
        !removedApiIds.has(api.practice_id ?? api.id)
    );
  }, [apiPractices, removedApiIds]);

  // Locally added (not part of API)
  const addedLocalPractices = useMemo(() => {
    return localPractices.filter(
      (lp: any) =>
        !apiPractices.some(
          (api: any) =>
            api.practice_id === lp.practice_id
        )
    );
  }, [localPractices, apiPractices]);

  const toggleAddItem = (item: any) => {
    const unifiedId = item.practice_id ?? item.id;

    setSelectedPractices((prev) => {
      const exists = prev.some(
        (p) =>
          p.unified_id === unifiedId ||
          p.practice_id === unifiedId ||
          p.id === unifiedId
      );

      if (exists) {
        return prev.filter(
          (p) =>
            p.unified_id !== unifiedId &&
            p.practice_id !== unifiedId &&
            p.id !== unifiedId
        );
      }

      return [
        ...prev,
        {
          ...item,
          unified_id: unifiedId,
          reps: "",
          day: t("sadanaTracker.dailyLabel"),
        },
      ];
    });
  };

  const isAdded = (item: any) => {
    const unifiedId = item.practice_id ?? item.id;
    return selectedPractices.some(
      (p) =>
        p.unified_id === unifiedId ||
        p.practice_id === unifiedId ||
        p.id === unifiedId
    );
  };

  const addMoreData = useMemo(() => {
    if (selectedCategory === "sanatan") return sanatanList;
    if (selectedCategory === "daily-mantra") return normalizedMantras;
    if (selectedCategory === "daily-sankalp") return normalizedSankalps;

    return selectedType === "mantra"
      ? mantraList
      : selectedType === "sankalp"
        ? sankalpList
        : practiceList;
  }, [selectedCategory, selectedType, sanatanList, normalizedMantras, normalizedSankalps, mantraList, sankalpList, practiceList]);

  const hasSelectionInCurrentCategory = useMemo(() => {
    return selectedPractices.some(
      (p) => p.category === selectedCategory
    );
  }, [selectedPractices, selectedCategory]);


  //   const toggleAddItem = (item: any) => {
  //     const unifiedId = item.practice_id ?? item.id;

  //    const exists = localPractices.some(
  //   (x: any) =>
  //     x.unified_id === unifiedId ||
  //     x.practice_id === unifiedId ||
  //     x.id === unifiedId
  // );


  //     if (exists) {
  //       removePractice(unifiedId);
  //       setHasUnsavedChanges(true);
  //     } else {
  //       // Ask for reps/day
  //        setAllowHydrate(false); 
  //          safeAddPractice({
  //     ...item,
  //     unified_id: unifiedId,
  //     reps: "",  // leave empty
  //     day: "Daily",
  //   });
  //     }
  //   };

  //   const isAdded = (item: any) => {
  //     const unifiedId = item.practice_id ?? item.id;
  // return localPractices.some(
  //   (x: any) =>
  //     x.unified_id === unifiedId ||
  //     x.practice_id === unifiedId ||
  //     x.id === unifiedId
  // );
  //   };

  const recentlyAdded = localPractices.filter(
    (item: any) =>
      !apiPractices.some(
        (x: any) => x.practice_id === item.practice_id
      )
  );

  const handleSavePracticeInput = ({ reps, day }: any) => {
    if (!selectedPracticeForModal) return;

    safeAddPractice({
      ...selectedPracticeForModal,
      reps,
      day,
      unified_id:
        selectedPracticeForModal.practice_id ?? selectedPracticeForModal.id,
    });

    setSelectedPracticeForModal(null);
  };

  const submitCartToServer = (practicesList: any[]) => {
    const unique = Array.from(
      new Map(
        practicesList.map((p) => [p.id || p.practice_id, p])
      ).values()
    );

    const payload = {
      practices: unique.map((p: any) => ({
        practice_id: p.id || p.practice_id,
        source: p.id?.startsWith("mantra.")
          ? "mantra"
          : p.id?.startsWith("sankalp.")
            ? "sankalp"
            : "library",
        category: p.category || detailsCategoryItem?.name || "",
        name: p.title || p.name || p.text || "",
        description: p.description || p.summary || p.meaning || "",
        benefits: p.benefits || [],
        reps: p.reps || null,
      })),
      is_authenticated: true,
      recaptcha_token: "not_available",
    };

    setLoading(true);
    try {
      categoryRef.current?.scrollToOffset({
        offset: 0,
        animated: true,
      });
    } catch { }

    dispatch(
      submitDailyDharmaSetup(payload, (res: any) => {
        setLoading(false);

        if (res.success) {
          setAllowHydrate(true);

          // refresh API
          dispatch(getDailyDharmaTracker((res) => { }));

          setHasUnsavedChanges(false);
          navigation.navigate("TrackerTabs", { screen: "Tracker" });
        }
        else {
          console.log("❌ Error saving:", res.error);
        }
      })
    );
  };

  const handleCategoryPress = (item: any, index: number) => {
    setSelectedCategory(item.key);
    categoryRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.3,
    });
  };

  const onShowDetails = (item: any, categoryItem?: any) => {
    const selectedCat = categoryItem || initialCategories.find(c => c.key === (item.category || selectedCategory)) || initialCategories[0];
    setDetailsCategoryItem({
      ...selectedCat,
      key: selectedCat.key,
    });
    setDetailsList([item]);
    setDetailsIndex(0);
    setShowDetails(true);
  };

  const renderDetailsCard = () => {
    if (!showDetails) return null;

    const raw = detailsList[detailsIndex];
    const { data: item } = getRawPracticeObject(raw?.practice_id, raw);
    const category = raw?.category || item?.category;

    const nextItem = () => {
      const updatedIndex = (detailsIndex + 1) % detailsList.length;
      setDetailsIndex(updatedIndex);
    };

    const isEditMode = localPractices.some(
      (p: any) => p.practice_id === item.practice_id
    );

    // Check if this is a daily-mantra or daily-sankalp
    if (category === "daily-mantra") {
      return (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#FFFFFF",
            zIndex: 999,
            flex: 1,
          }}
        >
          <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
            <Ionicons
              name="arrow-back"
              size={26}
              color="#000"
              onPress={() => setShowDetails(false)}
            />
          </View>

          <ScrollView
            style={{ flex: 1, marginTop: 10 }}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            showsVerticalScrollIndicator={false}
          >
            <MantraCard
              practiceTodayData={{
                started: { mantra: true },
                ids: { mantra: raw?.practice_id || raw?.id }
              }}
              onPressChantMantra={() => { }}
              DoneMantraCalled={() => { }}
              viewOnly={true}
            />
          </ScrollView>
        </View>
      );
    }

    if (category === "daily-sankalp") {
      return (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#FFFFFF",
            zIndex: 999,
            flex: 1,
          }}
        >
          <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
            <Ionicons
              name="arrow-back"
              size={26}
              color="#000"
              onPress={() => setShowDetails(false)}
            />
          </View>

          <ScrollView
            style={{ flex: 1, marginTop: 10 }}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            showsVerticalScrollIndicator={false}
          >
            <SankalpCard
              practiceTodayData={{
                started: { sankalp: true },
                ids: { sankalp: raw?.practice_id || raw?.id }
              }}
              onPressStartSankalp={() => { }}
              onCompleteSankalp={() => { }}
              viewOnly={true}
            />
          </ScrollView>
        </View>
      );
    }

    // Default: show DailyPracticeDetailsCard for all other practices
    return (
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#FFFFFF",
          zIndex: 999,
          flex: 1,
        }}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
          <Ionicons
            name="arrow-back"
            size={26}
            color="#000"
            onPress={() => setShowDetails(false)}
          />
        </View>

        <ScrollView
          style={{ flex: 1, marginTop: 10 }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <DailyPracticeDetailsCard
            mode={isEditMode ? "edit" : "new"}
            data={item}
            item={detailsCategoryItem}
            onChange={nextItem}
            onBackPress={() => {
              const updatedItem = {
                ...item,
                reps: selectedCount ?? item.reps ?? null,
              };

              if (!isEditMode) {
                setAllowHydrate(false);
                safeAddPractice(updatedItem);
              }

              setShowDetails(false);
            }}
            isLocked={true}
            selectedCount={selectedCount}
            onSelectCount={setSelectedCount}
          />
        </ScrollView>
      </View>
    );
  };

  // Data logic moved to useMemo hooks above.



  const handleRemoveFromRoutine = (item: any) => {
    setAllowHydrate(false);
    const practiceId = item.practice_id ?? item.id ?? item.unified_id;

    const isApi = apiPractices.some(
      (p: any) => (p.practice_id ?? p.id) === practiceId
    );
    if (isApi) {
      setAllowHydrate(false);          // 🔒 STOP resetFromMerged
      hasHydratedRef.current = true;  // 🔒 prevent future hydration
      removeApiPractice(practiceId);
      setRemovedApiOnce(true);
    } else {
      removePractice(item.unified_id ?? practiceId);
    }



    setHasUnsavedChanges(true);
  };

  const normalizeForConfirm = (item) => {
    const translated = getTranslatedPractice(item, t);
    return {
      practice_id: item.practice_id ?? item.id,
      id: item.id ?? item.practice_id,
      name: translated.name,
      title: translated.name,
      description: translated.desc,
      source: item.source ||
        (item.id?.startsWith("mantra.") ? "mantra" :
          item.id?.startsWith("sankalp.") ? "sankalp" : "practice"),
      category: item.category || "",
      reps: item.reps || "",
      day: item.day || t("sadanaTracker.dailyLabel"),
      benefits: item.benefits || [],
      details: item.details || {},
      full_item: item,
    };
  };


  const handleConfirmPress = async () => {
    const itemsToConfirm = isAddMoreScreen ? selectedPractices : recentlyAdded;
    const newItemsOnly = itemsToConfirm.map((p) => normalizeForConfirm(p));

    if (!isUserLoggedIn) {
      console.log("📦 Storing pending payload (TrackerEdit Confirm):", newItemsOnly);
      setPendingSubmitPayload({ practices: newItemsOnly, trackerEdit: true });
      setShowAuthModal(true);
      return;
    }

    navigation.navigate("ConfirmDailyPractices", {
      practices: newItemsOnly,
      trackerEdit: true
    });
  };

  const canSaveRoutine =
    removedApiOnce || addedLocalPractices.length > 0;



  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {/* <ImageBackground
                    source={require("../../../assets/Tracker_BG.png")}
                    style={{
                      alignSelf: "center",
                          justifyContent: "center",
                          alignItems: "center",
                          borderTopRightRadius: 16,
                          borderTopLeftRadius: 16,
                          width: FontSize.CONSTS.DEVICE_WIDTH,
                    }}
                    imageStyle={{
                          borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
                    }}
                  > */}
      {/* Cart Modal */}
      <CartModal
        onConfirm={async (list: any[]) => {
          if (!isUserLoggedIn) {
            console.log("📦 Storing pending payload (TrackerEdit Cart):", list);
            setPendingSubmitPayload({ cartList: list });
            setShowAuthModal(true);
            return;
          }

          submitCartToServer(list);
        }}
      />

      {renderDetailsCard()}

      {isAddMoreScreen ? (
        <Animated.FlatList
          ref={selectedCategory === "daily-sankalp" ? sankalpListRef : null}
          data={addMoreData}
          keyExtractor={(item, index) => `${item.practice_id || item.id}-${index}`}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 170, paddingTop: 10 }}
          ListHeaderComponent={
            <View onStartShouldSetResponder={() => true}>
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 16,
                }}
              >
                <TouchableOpacity onPress={() => setIsAddMoreScreen(false)}>
                  <Ionicons name="arrow-back" size={26} color="#000" />
                </TouchableOpacity>
                <TextComponent
                  type="DailyHeaderText"
                  style={{
                    color: Colors.Colors.BLACK,
                    textAlign: "center",
                    flex: 1,
                    marginHorizontal: 10,
                  }}
                >
                  {t("sadanaTracker.addPractices")}
                </TextComponent>
                <TouchableOpacity
                  onPress={() => setCartModalVisible(true)}
                  style={{ position: "relative" }}
                >
                  <View
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      backgroundColor: "#1877F2",
                      minWidth: 18,
                      height: 18,
                      borderRadius: 9,
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 4,
                      zIndex: 10,
                    }}
                  >
                    <TextComponent
                      type="semiBoldText"
                      style={{ color: "#fff", fontSize: 11 }}
                    >
                      {localPractices.length}
                    </TextComponent>
                  </View>

                  <Image
                    source={require("../../../assets/cart.png")}
                    style={{ width: 30, height: 30 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
              <TextComponent type="mediumText" style={{ color: Colors.Colors.BLACK, textAlign: "center", marginHorizontal: 3, marginTop: 10 }}>
                {t("sadanaTracker.setupInstruction", { defaultValue: "Select mantra or practices to add to your routine" })}
              </TextComponent>

              <TextInput
                placeholder={t("sadanaTracker.searchPlaceholder", { defaultValue: "e.g., Shiva Ashtakam, Vishnu, Tulsi Pooja " })}
                placeholderTextColor="#8A8A8A"
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
              />
              <TextComponent type="mediumText" style={{ marginHorizontal: 16, marginVertical: 4, color: Colors.Colors.BLACK, marginTop: 10 }}>
                {t("sadanaTracker.sadanatext", { defaultValue: "Practices to settle the mind and restore balance." })}


                {/* {t(initialCategories.find((c) => c.key === selectedCategory)?.description || "")} */}
              </TextComponent>
              <FlatList
                ref={categoryRef}
                data={initialCategories}
                horizontal
                keyExtractor={(item) => item.key}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryList}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    onPress={() => handleCategoryPress(item, index)}
                    style={[
                      styles.categoryChip,
                      selectedCategory === item.key &&
                      styles.categoryChipSelected,
                    ]}
                  >
                    <TextComponent
                      type="cardText"
                      style={[
                        styles.categoryChipText,
                        selectedCategory === item.key &&
                        styles.categoryChipTextSelected,
                      ]}
                    >
                      {t(item.name)}
                    </TextComponent>
                  </TouchableOpacity>
                )}
              />

              {!["sanatan", "daily-mantra", "daily-sankalp"].includes(selectedCategory) && (
                <View style={styles.typeTabs}>
                  {["mantra", "sankalp", "practice"].map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setSelectedType(type)}
                      style={[
                        styles.typeTab,
                        selectedType === type && styles.typeTabSelected,
                      ]}
                    >
                      <TextComponent
                        type="cardText"
                        style={[
                          styles.typeTabText,
                          selectedType === type &&
                          styles.typeTabTextSelected,
                        ]}
                      >
                        {t(`sadanaTracker.${type}Title`)}
                      </TextComponent>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <View style={{ height: 16 }} />
            </View>
          }
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: 16 }}>
              <PracticeCardItem
                item={item}
                isAdded={isAdded(item)}
                onToggle={toggleAddItem}
                onInfo={onShowDetails}
                t={t}
                capsuleHeight={CAPSULE_ITEM_HEIGHT}
              />
            </View>
          )}
          ListFooterComponent={
            <View style={[styles.bottomButtonContainer, { paddingHorizontal: 16 }]}>
              <LoadingButton
                loading={false}
                text={t("sadanaTracker.addSelectedToRoutine")}
                disabled={!hasSelectionInCurrentCategory}
                onPress={async () => {
                  await handleConfirmPress();
                }}
                style={{
                  ...styles.button, backgroundColor: hasSelectionInCurrentCategory
                    ? "#D4A017"
                    : "#E0E0E0",
                }}
                textStyle={styles.buttonText}
                showGlobalLoader={true}
              />
              <TextComponent type="ButtonBottomText" style={{ textAlign: "center", marginTop: 6, marginBottom: 20 }}>{t("sadanaTracker.adjustNextStep")}</TextComponent>
            </View>
          }
        />
      ) : (
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 170 }}
        >
          <>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 16,
                marginTop: 10,
              }}
            >
              {selectedmantra && (
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 30 }}>
                  <Ionicons name="arrow-back" size={26} color="#000" />
                </TouchableOpacity>
              )}
              <TextComponent
                type="DailyboldText"
                style={{
                  color: Colors.Colors.BLACK,
                  textAlign: "center",
                  flex: 1,
                  marginTop: selectedmantra ? 100 : 0,
                }}
              >
                {t("sadanaTracker.yourDailyRoutine")}
              </TextComponent>
              <TouchableOpacity
                onPress={() => setCartModalVisible(true)}
                style={{ position: "relative", width: 30, height: 30 }}
              >
                <View
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    backgroundColor: "#1877F2",
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 4,
                    zIndex: 10,
                  }}
                >
                  <TextComponent
                    type="semiBoldText"
                    style={{ color: "#fff", fontSize: 11 }}
                  >
                    {localPractices.length}
                  </TextComponent>
                </View>

                <Image
                  source={require("../../../assets/cart.png")}
                  style={{ width: 30, height: 30 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            <View style={{ marginHorizontal: 16 }}>
              <TextComponent type="subDailyText" style={{}}>{t("sadanaTracker.updateRoutineDesc")}</TextComponent>
              {/* <TextComponent type="DailyHeaderText">Active Practices ({localPractices.length})</TextComponent>
            <TextComponent type="subDailyText">These will become part of your routine</TextComponent> */}
              {/* ACTIVE API PRACTICES */}
              <TextComponent type="DailyHeaderText">
                {t("sadanaTracker.activePracticesLabel", { count: activeApiPractices.length })}
              </TextComponent>
              <TextComponent type="subDailyText">
                {t("sadanaTracker.activePracticesDesc")}
              </TextComponent>

              <View style={{ marginTop: 10 }}>
                {activeApiPractices.map((item: any) => {
                  const data = normalizeForMantraCard(item);

                  return (
                    <View key={item.practice_id}>
                      <DailyPracticeMantraCard
                        onChange={undefined}
                        isedit={true}
                        data={data}
                        tag={getTagFromItem(item)}
                        showIcons={false}
                        isSelected={false}
                        onToggleSelect={() => { }}
                        onPress={() => {
                          const { data: fullData } = getRawPracticeObject(
                            item.practice_id,
                            item
                          );
                          setDetailsCategoryItem(
                            initialCategories.find(c => c.key === item.category)
                          );
                          setDetailsList([fullData ?? item]);
                          setDetailsIndex(0);
                          setShowDetails(true);
                        }}
                      />

                      {/* REMOVE API PRACTICE */}
                      <TouchableOpacity
                        onPress={() => handleRemoveFromRoutine(item)}
                        style={{
                          position: "absolute",
                          top: 36,
                          right: 6,
                          backgroundColor: Colors.Colors.Yellow,
                          borderRadius: 6,
                          padding: 4,
                        }}
                      >
                        <Ionicons name="close" size={14} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>

              {/* ADDED PRACTICES */}
              {addedLocalPractices.length > 0 && (
                <>
                  <TextComponent
                    type="DailyHeaderText"
                    style={{ marginTop: 20 }}
                  >
                    {t("sadanaTracker.addedPracticesLabel", { count: addedLocalPractices.length })}
                  </TextComponent>
                  <TextComponent type="subDailyText">
                    {t("sadanaTracker.addedPracticesDesc")}
                  </TextComponent>

                  <View style={{ marginTop: 10 }}>
                    {addedLocalPractices.map((item: any) => {
                      const data = normalizeForMantraCard(item);

                      return (
                        <View key={item.practice_id ?? item.unified_id}>
                          <DailyPracticeMantraCard
                            onChange={undefined}
                            isedit={true}
                            data={data}
                            tag="added"
                            showIcons={false}
                            isSelected={false}
                            onToggleSelect={() => { }}
                            onPress={() => {
                              const { data: fullData } = getRawPracticeObject(
                                item.practice_id,
                                item
                              );
                              setDetailsCategoryItem(
                                initialCategories.find(c => c.key === item.category)
                              );
                              setDetailsList([fullData ?? item]);
                              setDetailsIndex(0);
                              setShowDetails(true);
                            }}
                          />

                          <TouchableOpacity
                            onPress={() => handleRemoveFromRoutine(item)}
                            style={{
                              position: "absolute",
                              top: 36,
                              right: 6,
                              backgroundColor: Colors.Colors.Yellow,
                              borderRadius: 6,
                              padding: 4,
                            }}
                          >
                            <Ionicons name="close" size={14} color="#FFF" />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                </>
              )}
            </View>
            <View
              style={{
                marginTop: 20,
                borderColor: "#CC9B2F",
                borderWidth: 1,
                borderRadius: 8,
                alignItems: "center",
                marginHorizontal: 16,
                padding: 8,
                backgroundColor: Colors.Colors.white
              }}
            >
              <TextComponent
                type="headerSubBoldText"
                style={{ color: "#282828", textAlign: "center" }}
              >
                {t("sadanaTracker.readyToExpand")}
              </TextComponent>

              <TextComponent
                type="subDailyText"
                style={{ marginTop: 4, textAlign: "center" }}
              >
                {t("sadanaTracker.expandDesc")}
              </TextComponent>

              <TouchableOpacity
                onPress={() => setIsAddMoreScreen(true)}
                style={{
                  backgroundColor: "#FDF5E9",
                  alignSelf: "center",
                  padding: 6,
                  borderRadius: 8,
                  marginTop: 14,
                  borderColor: "#CC9B2F",
                  borderWidth: 1,
                  flexDirection: "row",
                  alignItems: "center"
                }}
              >
                <Ionicons name="add" size={20} color="#CC9B2F" style={{ marginRight: 2 }} />
                <TextComponent
                  type="headerSubBoldText"
                  style={{ color: "#CC9B2F" }}
                >
                  {t("sadanaTracker.addMorePractice")}
                </TextComponent>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("CreateOwnPractice");
                }}
                style={{
                  backgroundColor: "#D4A017",
                  alignSelf: "center",
                  padding: 6,
                  borderRadius: 8,
                  marginTop: 14,
                  flexDirection: "row",
                  alignItems: "center"
                }}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 2 }} />
                <TextComponent
                  type="headerSubBoldText"
                  style={{ color: "#FFFFFF" }}
                >
                  {t("sadanaTracker.createCustomPractice")}
                </TextComponent>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: canSaveRoutine ? "#D4A017" : "#E0E0E0",
                // backgroundColor: "#D4A017",
                alignSelf: "center",
                padding: 6,
                borderRadius: 8,
                marginTop: 30,
                paddingHorizontal: 30,
              }}
              onPress={handleConfirmPress}
              disabled={!canSaveRoutine}
            >
              <TextComponent
                type="headerSubBoldText"
                style={{ color: "#FFFFFF" }}
              >
                {t("sadanaTracker.saveRoutine")}
              </TextComponent>
            </TouchableOpacity>
            <TextComponent type="boldText" style={{ color: Colors.Colors.BLACK, alignSelf: "center", textAlign: "center", marginTop: 10, marginBottom: 20 }}>{t("sadanaTracker.saveRoutineNotice")}</TextComponent>
          </>
        </Animated.ScrollView>
      )}
      <ConfirmDiscardModal
        visible={discardModalVisible}
        onViewCart={() => {
          setDiscardModalVisible(false);
          setCartModalVisible(true);
        }}
        onLeave={() => {
          resetFromMerged(mergedPractices);
          setHasUnsavedChanges(false);
          setDiscardModalVisible(false);
          navigation.goBack();
        }}
        onCancel={() => setDiscardModalVisible(false)}
      />
      <AddPracticeInputModal
        visible={inputModalVisible}
        practice={selectedPracticeForModal}
        isSankalp={
          selectedPracticeForModal?.id?.startsWith("sankalp.") ||
          selectedPracticeForModal?.practice_id?.startsWith("sankalp.")
        }
        onClose={() => setInputModalVisible(false)}
        onSave={(data: any) => {
          handleSavePracticeInput(data);
          setInputModalVisible(false);
        }}
      />
      <LoadingOverlay visible={loading} text={t("sadanaTracker.submitting")} />

      <CommunityAuthModal
        visible={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
        }}
        title={t("trackerEdit.authTitle", { defaultValue: "Save Your Routine" })}
        description={t("trackerEdit.authDescription", { defaultValue: "Create an account to save your routine" })}
        benefits={[
          t("trackerEdit.authBenefit1", { defaultValue: "Track your daily practice" }),
          t("trackerEdit.authBenefit2", { defaultValue: "Save your custom routine" }),
        ]}
      />
      {/* </ImageBackground> */}
    </SafeAreaView>
  );
};

export default TrackerEdit;
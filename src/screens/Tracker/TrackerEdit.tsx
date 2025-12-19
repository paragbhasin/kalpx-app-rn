// screens/Tracker/TrackerEdit.tsx

/* --- PART 1 START --- */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import AddPracticeInputModal from "../../components/AddPracticeInputModal";
import CartModal from "../../components/CartModal";
import Colors from "../../components/Colors";
import ConfirmDiscardModal from "../../components/ConfirmDiscardModal";
import DailyPracticeDetailsCard from "../../components/DailyPracticeDetailsCard";
import DailyPracticeMantraCard from "../../components/DailyPracticeMantraCard";
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
import { getDailyDharmaTracker, submitDailyDharmaSetup } from "../Home/actions";
import styles from "./TrackerEditStyles";

const initialCategories = [
  {
    name: "Peace & Calm",
    key: "peace-calm",
    description: "Find calm in the breath.",
  },
  {
    name: "Focus & Motivation",
    key: "focus",
    description: "Align. Focus. Rise.",
  },
  {
    name: "Emotional Healing",
    key: "healing",
    description: "Let go. Begin again.",
  },
  {
    name: "Gratitude & Positivity",
    key: "gratitude",
    description: "Gratitude transforms everything.",
  },
  {
    name: "Spiritual Growth",
    key: "spiritual-growth",
    description: "Grow through awareness.",
  },
  {
    name: "Health & Well-Being",
    key: "health",
    description: "Balance builds strength.",
  },
  {
    name: "Career & Prosperity",
    key: "career",
    description: "Opportunity follows action.",
  },
  {
    name: "Sanatan",
    key: "sanatan",
    description: "Ancient traditions & timeless wisdom.",
  },
   {
    name: "Daily Mantra",
    key: "daily-mantra",
    description: "Sacred mantras for daily practice.",
  },
  {
    name: "Daily Sankalp",
    key: "daily-sankalp",
    description: "Daily intentions to guide your path.",
  },
];

const TrackerEdit = ({ route }) => {
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


  const [sanatanRenderCount, setSanatanRenderCount] = useState(15);

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

console.log("localPractices >>>>>",JSON.stringify(localPractices));

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

// useEffect(() => {
//   if (
//     selectedCategory !== "daily-sankalp" ||
//     !selectedSankalpFromRoute
//   ) return;

//   const unifiedId =
//     selectedSankalpFromRoute.id ??
//     selectedSankalpFromRoute.practice_id;

//   const alreadyAdded = localPractices.some(
//     (p: any) =>
//       p.practice_id === unifiedId ||
//       p.id === unifiedId ||
//       p.unified_id === unifiedId
//   );

//   if (!alreadyAdded) {
//     setAllowHydrate(false);          // 🔒 LOCK hydration
//     hasHydratedRef.current = true;   // 🔒 PREVENT resetFromMerged

//     addPractice({
//       ...selectedSankalpFromRoute,
//       id: unifiedId,
//       practice_id: unifiedId,
//       unified_id: unifiedId,
//       category: "daily-sankalp",
//       day: "Daily",
//       reps: "",
//     });
//   }
// }, [selectedCategory, selectedSankalpFromRoute]);


// useEffect(() => {
//   if (
//     selectedCategory === "daily-sankalp" &&
//     selectedSankalpFromRoute
//   ) {
//     const unifiedId =
//       selectedSankalpFromRoute.id ??
//       selectedSankalpFromRoute.practice_id;

//     const alreadyAdded = localPractices.some(
//       (p: any) =>
//         p.practice_id === unifiedId ||
//         p.id === unifiedId ||
//         p.unified_id === unifiedId
//     );

//     if (!alreadyAdded) {
//       setAllowHydrate(false);

//       addPractice({
//         ...selectedSankalpFromRoute,
//         id: unifiedId,
//         practice_id: unifiedId,
//         unified_id: unifiedId,
//         category: "daily-sankalp",
//         day: "Daily",
//         reps: "",
//       });
//     }
//   }
// }, [selectedCategory, selectedSankalpFromRoute]);



  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
      setDiscardModalVisible(true);
    });

    return unsubscribe;
  }, [hasUnsavedChanges, navigation]);

  useEffect(() => {
    if (selectedCategory === "sanatan") {
      setSanatanRenderCount(15);
    }
  }, [selectedCategory, searchText]);

  const safeAddPractice = (p: any) => {
     setAllowHydrate(false);
    addPractice(p);
    setHasUnsavedChanges(true);
  };

  const mantraList = useMemo(() => {
    return Object.values(allData)
      .filter(
        (item: any) =>
          item?.category === selectedCategory &&
          item?.id?.startsWith("mantra.")
      )
      .filter((item: any) =>
        item.title?.toLowerCase().includes(searchText.toLowerCase())
      );
  }, [allData, selectedCategory, searchText]);

  const sankalpList = useMemo(() => {
    return Object.values(allData)
      .filter(
        (item: any) =>
          item?.category === selectedCategory &&
          item?.id?.startsWith("sankalp.")
      )
      .filter((item: any) =>
        item.title?.toLowerCase().includes(searchText.toLowerCase())
      );
  }, [allData, selectedCategory, searchText]);

  const practiceList = useMemo(() => {
    return Object.values(allData)
      .filter(
        (item: any) =>
          item?.category === selectedCategory &&
          item?.id?.startsWith("practice.")
      )
      .filter((item: any) =>
        item.title?.toLowerCase().includes(searchText.toLowerCase())
      );
  }, [allData, selectedCategory, searchText]);

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
    day: p.details?.day ?? p.day ?? "Daily",
    reps: p.details?.reps ?? p.reps ?? "",
  },

  day: p.details?.day ?? p.day ?? "Daily",
  reps: p.details?.reps ?? p.reps ?? "",
});

const normalizeForMantraCard = (item: any) => ({
  ...item,
  title:
    item.title ||
    item.name ||
    item.iast ||
    item.short_text ||
    "Practice",

  description:
    item.description ||
    item.summary ||
    item.meaning ||
    item.tooltip ||
    "",

  category: item.category,
  day: item.day ?? item.details?.day,
  reps: item.reps ?? item.details?.reps,
});


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

const normalizedMantras = dailyMantraList.map((m: any, index) => ({
  ...m,
  id: m.id || `mantra_${index}`,
  practice_id: m.id || `mantra_${index}`,
  title: m.title || m.iast,
  description: m.explanation,
  category: "daily-mantra",
}));

const normalizedSankalps = dailySankalpList.map((s: any, index) => ({
  ...s,
  id: s.id || `sankalp_${index}`,
  practice_id: s.id || `sankalp_${index}`,
  title: s.short_text,
  description: s.tooltip,
  category: "daily-sankalp",
}));

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
      day: "Daily",
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
      day: "Daily",
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

   const exists = localPractices.some(
  (x: any) =>
    x.unified_id === unifiedId ||
    x.practice_id === unifiedId ||
    x.id === unifiedId
);


    if (exists) {
      removePractice(unifiedId);
      setHasUnsavedChanges(true);
    } else {
      // Ask for reps/day
       setAllowHydrate(false); 
         safeAddPractice({
    ...item,
    unified_id: unifiedId,
    reps: "",  // leave empty
    day: "Daily",
  });
    }
  };

  const isAdded = (item: any) => {
    const unifiedId = item.practice_id ?? item.id;
return localPractices.some(
  (x: any) =>
    x.unified_id === unifiedId ||
    x.practice_id === unifiedId ||
    x.id === unifiedId
);
  };

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
    } catch {}

    dispatch(
      submitDailyDharmaSetup(payload, (res: any) => {
        setLoading(false);

       if (res.success) {
  setAllowHydrate(true);
  
  // refresh API
  dispatch(getDailyDharmaTracker((res) => {}));

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

  const SimplePracticeCard = ({ item, categoryItem }: any) => {
    const added = isAdded(item);
    const displayMeaning =
      item.meaning || item.summary || item.line || item.description;

    return (
      <View style={styles.simpleCard}>
   <TouchableOpacity
  onPress={() => toggleAddItem(item)}
  style={{
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: added ? "#D4A017" : "#D4A017",
    borderRadius: 4,
    backgroundColor: added ? "#D4A017" : "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  }}
>
  {added && (
    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
  )}
</TouchableOpacity>


        <View style={{ flex: 1 ,marginLeft:14}}>
          <TextComponent type="boldText" style={styles.cardTitle}>
            {item.title}
          </TextComponent>

          <TextComponent style={styles.cardSubtitle} numberOfLines={2}>
            {displayMeaning}
          </TextComponent>
        </View>

        <View style={styles.cardRightIcons}>
          <TouchableOpacity
            onPress={() => {
              const selectedCat = categoryItem || initialCategories[0];

              setDetailsCategoryItem({
                ...selectedCat,
                key: selectedCat.key,
              });

              setDetailsList([item]);
              setDetailsIndex(0);
              setShowDetails(true);
            }}
            style={{ 
              // marginLeft: 14 
            }}
          >
            <Ionicons
              name="information-circle-outline"
              size={26}
              color="#D4A017"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderDetailsCard = () => {
    if (!showDetails) return null;

    const raw = detailsList[detailsIndex];
    const item = getRawPracticeObject(raw?.practice_id, raw);

    const nextItem = () => {
      const updatedIndex = (detailsIndex + 1) % detailsList.length;
      setDetailsIndex(updatedIndex);
    };

    const isEditMode = localPractices.some(
      (p: any) => p.practice_id === item.practice_id
    );

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

  const renderSanatanList = () => {
    const safeList = SANATAN_PRACTICES_FINAL.map((p: any, index) => ({
  ...p,
  id: p.id ?? `sanatan_${index}`,
  practice_id: p.practice_id ?? p.id ?? `sanatan_${index}`
}));

  const fullList = safeList.filter((practice) => {
  const nameKey = `practices.${practice.id}.name`;

  const n = t(nameKey, {
    defaultValue: practice.name ?? ""
  })?.toLowerCase() ?? "";

  const d = t(`practices.${practice.id}.description`, {
    defaultValue: practice.description ?? ""
  })?.toLowerCase() ?? "";

  const s = searchText.toLowerCase();

  return n.includes(s) || d.includes(s);
});


    const limitedList = fullList.slice(0, sanatanRenderCount);

    return (
      <FlatList
        data={limitedList}
       keyExtractor={(item: any, index) =>
    `${item.practice_id || item.id || 'sanatan'}-${index}`
  }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 50,
          paddingTop:16
        }}
        onEndReachedThreshold={0.3}
        onEndReached={() => {
          if (sanatanRenderCount < fullList.length) {
            setSanatanRenderCount((prev) => prev + 15);
          }
        }}
        renderItem={({ item }) => {
          const isSelected = localPractices.some(
            (p: any) =>
              (p.id || p.practice_id) ===
              (item.id || item.practice_id)
          );

          const displayName = t(`practices.${item.id}.name`, {
            defaultValue: item.name,
          });

          const displayDescription = t(
            `practices.${item.id}.description`,
            { defaultValue: item.description }
          );

          return (
            <View
              style={[
                styles.simpleCard,
                {
                  backgroundColor: "#FFFFFF",
                  borderColor: "#CC9B2F",
                  borderWidth: 1,
                  marginBottom: 12,
                },
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity
  onPress={() =>
    toggleAddItem({
      ...item,
      practice_id: item.practice_id ?? item.id,
    })
  }
  style={{
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: isSelected ? "#D4A017" : "#000000",
    borderRadius: 4,
    backgroundColor: isSelected ? "#D4A017" : "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  }}
>
  {isSelected && (
    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
  )}
</TouchableOpacity>

                <View style={{ marginLeft:14,width:"80%" }}>
                  <TextComponent
                    type="boldText"
                    style={styles.cardTitle}
                    numberOfLines={1}
                  >
                    {item.icon ? `${item.icon} ` : ""}
                    {displayName}
                  </TextComponent>

                  <TextComponent
                    style={styles.cardSubtitle}
                    numberOfLines={2}
                  >
                    {displayDescription}
                  </TextComponent>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setDetailsCategoryItem(
                      initialCategories.find(
                        (c) => c.key === "sanatan"
                      )
                    );
                    setDetailsList([item]);
                    setDetailsIndex(0);
                    setShowDetails(true);
                  }}
                  style={{ marginRight: 14 }}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={26}
                    color="#D4A017"
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    );
  };

  const renderCapsuleFlatList = (data: any[]) => {
  return (
    <FlatList
      ref={selectedCategory === "daily-sankalp" ? sankalpListRef : null}
      data={data}
      keyExtractor={(item: any, index) =>
        `${item.practice_id || item.id}-${index}`
      }

      getItemLayout={(_, index) => ({
        length: CAPSULE_ITEM_HEIGHT,
        offset: CAPSULE_ITEM_HEIGHT * index,
        index,
      })}

      onScrollToIndexFailed={(info) => {
        // fallback – scroll close and retry
        setTimeout(() => {
          sankalpListRef.current?.scrollToIndex({
            index: Math.max(0, info.index - 1),
            animated: true,
          });
        }, 300);
      }}

      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingBottom: 50,
        paddingTop: 16,
      }}

      renderItem={({ item }) => {
        const isSelected = isAdded(item);

        return (
          <View
            style={[
              styles.simpleCard,
              {
                height: CAPSULE_ITEM_HEIGHT, // 🔥 IMPORTANT
                backgroundColor: "#FFFFFF",
                borderColor: "#CC9B2F",
                borderWidth: 1,
                marginBottom: 12,
              },
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {/* CHECKBOX */}
              <TouchableOpacity
                onPress={() => toggleAddItem(item)}
                style={{
                  width: 22,
                  height: 22,
                  borderWidth: 1,
                  borderColor: isSelected ? "#D4A017" : "#000",
                  borderRadius: 4,
                  backgroundColor: isSelected ? "#D4A017" : "#FFF",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={18} color="#FFF" />
                )}
              </TouchableOpacity>

              {/* TEXT */}
              <View style={{ marginLeft: 14, width: "80%" }}>
                <TextComponent
                  type="boldText"
                  style={styles.cardTitle}
                  numberOfLines={1}
                >
                  {item.title}
                </TextComponent>

                <TextComponent
                  style={styles.cardSubtitle}
                  numberOfLines={2}
                >
                  {item.description || ""}
                </TextComponent>
              </View>

              {/* INFO */}
              <TouchableOpacity
                onPress={() => {
                  setDetailsCategoryItem(
                    initialCategories.find(
                      (c) => c.key === selectedCategory
                    )
                  );
                  setDetailsList([item]);
                  setDetailsIndex(0);
                  setShowDetails(true);
                }}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={26}
                  color="#D4A017"
                />
              </TouchableOpacity>
            </View>
          </View>
        );
      }}
    />
  );
};


//   const renderCapsuleFlatList = (data: any[]) => {
//   return (
//     <FlatList
//     ref={selectedCategory === "daily-sankalp" ? sankalpListRef : null}
//   data={data}
//   keyExtractor={(item: any, index) =>
//     `${item.practice_id || item.id}-${index}`
//   }
//   onLayout={() => {
//     if (
//       selectedCategory === "daily-sankalp" &&
//       selectedSankalpFromRoute &&
//       !hasAutoScrolledRef.current
//     ) {
//       const index = data.findIndex(
//         (s: any) => s.id === selectedSankalpFromRoute.id
//       );

//       if (index >= 0) {
//         requestAnimationFrame(() => {
//           sankalpListRef.current?.scrollToIndex({
//             index,
//             animated: true,
//             viewPosition: 0.35,
//           });
//           hasAutoScrolledRef.current = true;
//         });
//       }
//     }
//   }}
//       contentContainerStyle={{
//         paddingHorizontal: 16,
//         paddingBottom: 50,
//         paddingTop: 16,
//       }}
//       renderItem={({ item }) => {
//         const isSelected = isAdded(item);

//         return (
//           <View
//             style={[
//               styles.simpleCard,
//               {
//                 backgroundColor: "#FFFFFF",
//                 borderColor: "#CC9B2F",
//                 borderWidth: 1,
//                 marginBottom: 12,
//               },
//             ]}
//           >
//             <View style={{ flexDirection: "row", alignItems: "center" }}>
//               {/* CHECKBOX */}
//               <TouchableOpacity
//                 onPress={() => toggleAddItem(item)}
//                 style={{
//                   width: 22,
//                   height: 22,
//                   borderWidth: 1,
//                   borderColor: isSelected ? "#D4A017" : "#000",
//                   borderRadius: 4,
//                   backgroundColor: isSelected ? "#D4A017" : "#FFF",
//                   justifyContent: "center",
//                   alignItems: "center",
//                 }}
//               >
//                 {isSelected && (
//                   <Ionicons name="checkmark" size={18} color="#FFF" />
//                 )}
//               </TouchableOpacity>

//               {/* TEXT */}
//               <View style={{ marginLeft: 14, width: "80%" }}>
//                 <TextComponent
//                   type="boldText"
//                   style={styles.cardTitle}
//                   numberOfLines={1}
//                 >
//                   {item.icon ? `${item.icon} ` : ""}
//                   {item.title || item.name}
//                 </TextComponent>

//                 <TextComponent
//                   style={styles.cardSubtitle}
//                   numberOfLines={2}
//                 >
//                   {item.description ||
//                     item.summary ||
//                     item.tooltip ||
//                     ""}
//                 </TextComponent>
//               </View>

//               {/* INFO */}
//               <TouchableOpacity
//                 onPress={() => {
//                   setDetailsCategoryItem(
//                     initialCategories.find(
//                       (c) => c.key === selectedCategory
//                     )
//                   );
//                   setDetailsList([item]);
//                   setDetailsIndex(0);
//                   setShowDetails(true);
//                 }}
//               >
//                 <Ionicons
//                   name="information-circle-outline"
//                   size={26}
//                   color="#D4A017"
//                 />
//               </TouchableOpacity>
//             </View>
//           </View>
//         );
//       }}
//     />
//   );
// };


  const handleRemoveFromRoutine = (item: any) => {
     setAllowHydrate(false);
    const practiceId = item.practice_id ?? item.id ?? item.unified_id;

    const isApi = apiPractices.some(
      (p: any) => (p.practice_id ?? p.id) === practiceId
    );

    // if (isApi) {
    //   removeApiPractice(practiceId);
    // } else {
    //   removePractice(item.unified_id ?? practiceId);
    // }
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

  const normalizeForConfirm = (item) => ({
  practice_id: item.practice_id ?? item.id,
  id: item.id ?? item.practice_id,
  name: item.name || item.title || item.line || "",
  title: item.title || item.name || "",
  description: item.description || item.summary || item.meaning || item.line || "",
  source: item.source ||
    (item.id?.startsWith("mantra.") ? "mantra" :
    item.id?.startsWith("sankalp.") ? "sankalp" : "practice"),
  category: item.category || "",
  reps: item.reps || "",
  day: item.day || "Daily",
  benefits: item.benefits || [],
  details: item.details || {},
  full_item: item,
});


  const handleConfirmPress = async () => {
    const token = await AsyncStorage.getItem("access_token");

    if (!token) {
      await AsyncStorage.setItem(
        "pending_tracker_edit_data",
        JSON.stringify({
          pendingPractices: localPractices,
          from: "TrackerEdit",
        })
      );
      await AsyncStorage.setItem("resume_tracker_flow", "true");

      navigation.navigate("Login", {
        redirect_to: "TrackerEdit",
        selectedmantra,
        goToHistory: true,
      });
      return;
    }
    const newItemsOnly = recentlyAdded.map((p) => normalizeForConfirm(p));

navigation.navigate("ConfirmDailyPractices", {
  practices: newItemsOnly,
  trackerEdit:true
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
          const token = await AsyncStorage.getItem("access_token");

          if (!token) {
            await AsyncStorage.setItem(
              "pending_tracker_edit_data",
              JSON.stringify({
                pendingPractices: list,
                from: "TrackerEdit",
              })
            );
            await AsyncStorage.setItem("resume_tracker_flow", "true");

            navigation.navigate("Login", {
              redirect_to: "TrackerEdit",
              selectedmantra,
              goToHistory: true,
            });
            return;
          }

          submitCartToServer(list);
        }}
      />

      {renderDetailsCard()}

      {isAddMoreScreen ? (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ marginBottom: 10 }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 16,
                marginTop: 10,
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
                Add To My Practice
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
              <TextComponent type="mediumText" style={{color:Colors.Colors.BLACK,textAlign:"center",marginHorizontal:3}}>Select mantra or practices to add to your routine</TextComponent>

            <TextInput
              placeholder="e.g., Shiva Ashtakam, Vishnu, Tulsi Pooja "
              placeholderTextColor="#8A8A8A"
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
            />
<TextComponent type="mediumText" style={{marginHorizontal:16,marginVertical:4,color:Colors.Colors.BLACK}}>Practices to settle the mind and restore balance.</TextComponent>
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
                    {item.name}
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
          {type.toUpperCase()}
        </TextComponent>
      </TouchableOpacity>
    ))}
  </View>
)}

            {selectedCategory === "sanatan" && renderSanatanList()}

{selectedCategory === "daily-mantra" &&
  renderCapsuleFlatList(normalizedMantras)}

{selectedCategory === "daily-sankalp" &&
  renderCapsuleFlatList(normalizedSankalps)}

{!["sanatan", "daily-mantra", "daily-sankalp"].includes(selectedCategory) && (
  <View style={styles.itemsContainer}>
    {(selectedType === "mantra"
      ? mantraList
      : selectedType === "sankalp"
      ? sankalpList
      : practiceList
    ).map((item: any, idx: number) => (
      <SimplePracticeCard
        key={idx}
        item={item}
        categoryItem={initialCategories.find(
          (c) => c.key === selectedCategory
        )}
      />
    ))}
  </View>
)}

{/* 
            {isSanatan ? (
              renderSanatanList()
            ) : (
              <View style={styles.itemsContainer}>
                {(selectedType === "mantra"
                  ? mantraList
                  : selectedType === "sankalp"
                  ? sankalpList
                  : practiceList
                ).map((item: any, idx: number) => (
                  <SimplePracticeCard
                    key={idx}
                    item={item}
                    categoryItem={initialCategories.find(
                      (c) => c.key === selectedCategory
                    )}
                  />
                ))}
              </View>
            )} */}
              <View style={styles.bottomButtonContainer}>
            <LoadingButton
              loading={false}
              text="Add Selected Practices to My Routine"
              onPress={async () => {
                await handleConfirmPress();
              }}
              disabled={false}
              style={styles.button}
              textStyle={styles.buttonText}
              showGlobalLoader={true}
            />
            <TextComponent type="ButtonBottomText" style={{textAlign:"center",marginTop:6}}>You can adjust repetition and frequency in the next step</TextComponent>
          </View>
          </ScrollView>

        </>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
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
              <View style={{ width: 30 }} />
              <TextComponent
                type="DailyboldText"
                style={{
                  color: Colors.Colors.BLACK,
                  textAlign: "center",
                  flex: 1,
                }}
              >
                Your Daily Routine
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
            <View style={{marginHorizontal:16}}>
            <TextComponent type="subDailyText" style={{}}>Update your routine to stay aligned with your growth journey.</TextComponent>
            {/* <TextComponent type="DailyHeaderText">Active Practices ({localPractices.length})</TextComponent>
            <TextComponent type="subDailyText">These will become part of your routine</TextComponent> */}
            {/* ACTIVE API PRACTICES */}
<TextComponent type="DailyHeaderText">
  Active Practices ({activeApiPractices.length})
</TextComponent>
<TextComponent type="subDailyText">
  These are already part of your routine
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
          tag="Active"
          showIcons={false}
          isSelected={false}
          onToggleSelect={() => {}}
          onPress={() => {
            const fullData = getRawPracticeObject(
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
      Added Practices ({addedLocalPractices.length})
    </TextComponent>
    <TextComponent type="subDailyText">
      These will be added once you save
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
              tag="Added"
              showIcons={false}
              isSelected={false}
              onToggleSelect={() => {}}
              onPress={() => {
                const fullData = getRawPracticeObject(
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
            {/* <View style={{ marginHorizontal: 16, marginTop: 10 }}>
  {localPractices.map((item: any) => {
    const data = normalizeForMantraCard(item);

    return (
      <View key={item.practice_id ?? item.unified_id}>
        <DailyPracticeMantraCard
        isedit={true}
          data={data}
          tag={
            item.source === "mantra"
              ? "Mantra"
              : item.source === "sankalp"
              ? "Sankalp"
              : "Practice"
          }
          showIcons={false}
          onChange={undefined}
          isSelected={false}
          onToggleSelect={() => {}}
          onPress={() => {
            const fullData = getRawPracticeObject(
              item.practice_id,
              item
            );
            const categoryItem =
              initialCategories.find(
                (c) => c.key === item.category
              ) || initialCategories[0];

            setDetailsCategoryItem(categoryItem);
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
            zIndex: 30,
          }}
        >
          <Ionicons name="close" size={14} color="#FFF" />
        </TouchableOpacity>
      </View>
    );
  })}
</View> */}

{/* <View
  style={{
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
  }}
>
  {localPractices.map((item: any) => (
    <Card
      key={item.practice_id ?? item.unified_id}
      style={{
        width: "48%",
        backgroundColor:Colors.Colors.white,
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#D4A017",
        elevation: 3,
        position: "relative",
      }}
    >
      <TouchableOpacity
  onPress={() => handleRemoveFromRoutine(item)}
  style={{
    position: "absolute",
    top: -18,
    right: -10,
    backgroundColor: Colors.Colors.Yellow,
    borderRadius: 4,
    padding: 1,
  }}
>
  <Ionicons name="close" size={14} color="#FFFFFF" />
</TouchableOpacity>
        <View
          style={{
            marginTop: -12,
            backgroundColor: "#CC9B2F",
            borderRadius: 4,
            paddingVertical: 2,
            paddingHorizontal: 12,
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "center",
          }}
        >

          <TextComponent
            type="boldText"
            style={{
              color:Colors.Colors.white
            }}
          >
        {item?.details?.day ?? item?.day ?? ""}   {item?.details?.reps ?? item?.reps ?? ""} X
          </TextComponent>
        </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop:2
        }}
      >
        <TextComponent
          type="mediumText"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            fontSize: FontSize.CONSTS.FS_13,
            color: Colors.Colors.BLACK,
            flex: 1,
          }}
        >
          {item.name ||
            item.details?.name ||
            item?.title ||
            item?.iast ||
            item?.short_text ||
            "Practice"}
        </TextComponent>
        <TouchableOpacity
          onPress={() => {
            const fullData = getRawPracticeObject(item.practice_id, item);
            const detailsData = fullData
              ? { ...fullData, practice_id: item.practice_id }
              : item;

            const categoryItem =
              initialCategories.find(
                (c) =>
                  c.key === detailsData.category || c.key === item.category
              ) || initialCategories[0];

            setDetailsCategoryItem(categoryItem);
            setDetailsList([detailsData]);
            setDetailsIndex(0);
            setShowDetails(true);
          }}
        >
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={Colors.Colors.Yellow}
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>
      </View>
    </Card>
  ))}
</View> */}
            <View
              style={{
                marginTop: 20,
                borderColor: "#CC9B2F",
                borderWidth: 1,
                borderRadius: 8,
                alignItems: "center",
                marginHorizontal: 16,
                padding: 8,
                backgroundColor:Colors.Colors.white
              }}
            >
              <TextComponent
                type="headerSubBoldText"
                style={{ color: "#282828", textAlign: "center" }}
              >
                Ready to expand your practice?
              </TextComponent>

              <TextComponent
                type="subDailyText"
                style={{ marginTop: 4, textAlign: "center" }}
              >
               Add new mantras or practices to deepen your routine.
              </TextComponent>

              <TouchableOpacity
                onPress={() => setIsAddMoreScreen(true)}
                style={{
                  backgroundColor: "#FDF5E9",
                  alignSelf: "center",
                  padding: 6,
                  borderRadius: 8,
                  marginTop: 14,
                  borderColor:"#CC9B2F",
                  borderWidth:1,
                  flexDirection:"row",
                  alignItems:"center"
                }}
              >
                  <Ionicons name="add" size={20} color="#CC9B2F" style={{ marginRight: 2 }} />
                <TextComponent
                  type="headerSubBoldText"
                  style={{ color: "#CC9B2F" }}
                >
                  Add More Practice
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
                     flexDirection:"row",
                  alignItems:"center"
                }}
              >
                  <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 2 }} />
                <TextComponent
                  type="headerSubBoldText"
                  style={{ color: "#FFFFFF" }}
                >
                  Create Custom Practice
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
                Save my routine
              </TextComponent>
            </TouchableOpacity>
            <TextComponent type="boldText" style={{color:Colors.Colors.BLACK,alignSelf:"center",textAlign:"center",marginTop:10,marginBottom:20}}>Your updated routine will reflect from tomorrow morning</TextComponent>
          </>
        </ScrollView>
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
      <LoadingOverlay visible={loading} text="Submitting..." />
      {/* </ImageBackground> */}
    </SafeAreaView>
  );
};

export default TrackerEdit;





// /* --- PART 1 START --- */

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import { AnyAction } from "@reduxjs/toolkit";
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   FlatList,
//   Image,
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   TextInput,
//   TouchableOpacity,
//   View
// } from "react-native";
// import { Card } from "react-native-paper";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import { useDispatch, useSelector } from "react-redux";
// import { ThunkDispatch } from "redux-thunk";
// import AddPracticeInputModal from "../../components/AddPracticeInputModal";
// import CartModal from "../../components/CartModal";
// import Colors from "../../components/Colors";
// import ConfirmDiscardModal from "../../components/ConfirmDiscardModal";
// import DailyPracticeDetailsCard from "../../components/DailyPracticeDetailsCard";
// import FontSize from "../../components/FontSize";
// import LoadingButton from "../../components/LoadingButton";
// import LoadingOverlay from "../../components/LoadingOverlay";
// import TextComponent from "../../components/TextComponent";
// import i18n from "../../config/i18n";
// import { useCart } from "../../context/CartContext";
// import { SANATAN_PRACTICES_FINAL } from "../../data/sanatanPractices";
// import { RootState } from "../../store";
// import { getRawPracticeObject } from "../../utils/getPracticeObjectById";
// import { submitDailyDharmaSetup } from "../Home/actions";
// import styles from "./TrackerEditStyles";

// const initialCategories = [
//   {
//     name: "Peace & Calm",
//     key: "peace-calm",
//     description: "Find calm in the breath.",
//   },
//   {
//     name: "Focus & Motivation",
//     key: "focus",
//     description: "Align. Focus. Rise.",
//   },
//   {
//     name: "Emotional Healing",
//     key: "healing",
//     description: "Let go. Begin again.",
//   },
//   {
//     name: "Gratitude & Positivity",
//     key: "gratitude",
//     description: "Gratitude transforms everything.",
//   },
//   {
//     name: "Spiritual Growth",
//     key: "spiritual-growth",
//     description: "Grow through awareness.",
//   },
//   {
//     name: "Health & Well-Being",
//     key: "health",
//     description: "Balance builds strength.",
//   },
//   {
//     name: "Career & Prosperity",
//     key: "career",
//     description: "Opportunity follows action.",
//   },

//   // ⭐ NEW CAPSULE
//   {
//     name: "Sanatan",
//     key: "sanatan",
//     description: "Ancient traditions & timeless wisdom.",
//   },
// ];

// const TrackerEdit = ({ route }) => {
//   const navigation: any = useNavigation();
//   const { t } = useTranslation();
//   const categoryRef = useRef<any>(null);
//   const selectedmantra = route?.params?.selectedmantra;

//   const [selectedCategory, setSelectedCategory] = useState(
//     initialCategories[0].key
//   );
//   const [selectedType, setSelectedType] = useState("mantra");
//   const [searchText, setSearchText] = useState("");
//   const [isAddMoreScreen, setIsAddMoreScreen] = useState(false);
//   const [showDetails, setShowDetails] = useState(false);
//   const [detailsList, setDetailsList] = useState([]);
//   const [detailsIndex, setDetailsIndex] = useState(0);
//   const [detailsCategoryItem, setDetailsCategoryItem] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [selectedCount, setSelectedCount] = useState(null);
//   const [inputModalVisible, setInputModalVisible] = useState(false);
// const [selectedPracticeForModal, setSelectedPracticeForModal] = useState(null);
// const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
// const [discardModalVisible, setDiscardModalVisible] = useState(false);
// const [sanatanRenderCount, setSanatanRenderCount] = useState(15);

// useEffect(() => {
//   const unsubscribe = navigation.addListener("beforeRemove", (e) => {
//     if (!hasUnsavedChanges) return; // leave normally

//     e.preventDefault(); // block navigation
//     setDiscardModalVisible(true); // show popup
//   });

//   return unsubscribe;
// }, [hasUnsavedChanges]);



//   const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

//   const resumeData = route?.params?.resumeData;

//   console.log("resumeData :::", resumeData);

//   const dailyPractice: any = useSelector(
//     (state: RootState) => state.dailyPracticeReducer
//   );

//   const {
//     localPractices,
//     addPractice,
//     removePractice,
//     cartModalVisible,
//     setCartModalVisible,
//     clearCart,
//   } = useCart();

//   const allData = i18n.getResourceBundle(i18n.language, "translation");

//   const safeAddPractice = (p) => {
//   addPractice(p);
//   setHasUnsavedChanges(true);
// };

// const safeRemovePractice = (id) => {
//   removePractice(id);
//   setHasUnsavedChanges(true);
// };


//   const mantraList = useMemo(() => {
//     return Object.values(allData)
//       .filter(
//         (item: any) =>
//           item?.category === selectedCategory && item?.id?.startsWith("mantra.")
//       )
//       .filter((item: any) =>
//         item.title?.toLowerCase().includes(searchText.toLowerCase())
//       );
//   }, [selectedCategory, searchText]);

//   const sankalpList = useMemo(() => {
//     return Object.values(allData)
//       .filter(
//         (item: any) =>
//           item?.category === selectedCategory &&
//           item?.id?.startsWith("sankalp.")
//       )
//       .filter((item: any) =>
//         item.title?.toLowerCase().includes(searchText.toLowerCase())
//       );
//   }, [selectedCategory, searchText]);

//   const practiceList = useMemo(() => {
//     return Object.values(allData)
//       .filter(
//         (item: any) =>
//           item?.category === selectedCategory &&
//           item?.id?.startsWith("practice.")
//       )
//       .filter((item: any) =>
//         item.title?.toLowerCase().includes(searchText.toLowerCase())
//       );
//   }, [selectedCategory, searchText]);

//   const normalizePractice = (p: any) => ({
//     ...p,
//     id: p?.id || p?.practice_id,
//     practice_id: p?.practice_id || p?.id,
//     title: p?.title || p?.name || p?.short_text,
//     name: p?.name || p?.title || p?.tooltip,
//     icon: p?.icon || "",
//     category: p.category || "",
//   });

//   const mergedPractices = useMemo(() => {
//     const apiList =
//       dailyPractice?.data?.active_practices?.map(normalizePractice) || [];

//     const resumePractices =
//       resumeData?.pendingPractices ||
//       resumeData?.payload?.pendingPractices ||
//       [];

//     const resumeList = resumePractices.map(normalizePractice);

//     const selectedList = selectedmantra
//       ? [normalizePractice(selectedmantra)]
//       : [];

//     const map = new Map();

//     apiList.forEach((p) => map.set(p.practice_id, p));
//     resumeList.forEach((p) => map.set(p.practice_id, p));
//     selectedList.forEach((p) => map.set(p.practice_id, p));

//     return Array.from(map.values());
//   }, [dailyPractice, resumeData, selectedmantra]);

//   console.log("🟪 Merged Practices:", JSON.stringify(mergedPractices));

//   const isSanatan = selectedCategory === "sanatan";

//   // 🔄 Hydrate global cart with merged practices (no duplicates)
//   useEffect(() => {
//     if (!mergedPractices || mergedPractices.length === 0) return;

//     mergedPractices.forEach((p) => safeAddPractice(p));
//   }, [mergedPractices]);

// const toggleAddItem = (item) => {
//   const unifiedId = item.practice_id ?? item.id;

//   const exists = localPractices.some(
//     (x) => x.unified_id === unifiedId
//   );

//   if (exists) {
//     safeRemovePractice(unifiedId);
//   } else {
//     // ⭐ Instead of adding directly → open modal
//     setSelectedPracticeForModal(item);
//     setInputModalVisible(true);
//   }
// };


//   const isAdded = (item) => {
//     const unifiedId = item.practice_id ?? item.id;
//     return localPractices.some((x) => x.unified_id === unifiedId);
//   };

//   const apiPractices = dailyPractice?.data?.active_practices ?? [];

//   const recentlyAdded = localPractices.filter(
//     (item) =>
//       !apiPractices.some((x) => x.practice_id === item.practice_id)
//   );

//   const handleSavePracticeInput = ({ reps, day }) => {
//   if (!selectedPracticeForModal) return;

//   safeAddPractice({
//     ...selectedPracticeForModal,
//     reps,
//     day,
//     unified_id: selectedPracticeForModal.practice_id ?? selectedPracticeForModal.id
//   });

//   setSelectedPracticeForModal(null);
// };


//   const submitCartToServer = (practicesList) => {
//     console.log("🟦 [API] Preparing payload from list:", practicesList);
//     const unique = Array.from(
//       new Map(
//         practicesList.map((p) => [p.id || p.practice_id, p])
//       ).values()
//     );

//     console.log("🟩 [CART] Unique Items:", unique);
//     const payload = {
//       practices: unique.map((p: any) => ({
//         practice_id: p.id || p.practice_id,
//         source: p.id?.startsWith("mantra.")
//           ? "mantra"
//           : p.id?.startsWith("sankalp.")
//           ? "sankalp"
//           : "library",
//         category: p.category || detailsCategoryItem?.name || "",
//         name: p.title || p.name || p.text || "",
//         description: p.description || p.summary || p.meaning || "",
//         benefits: p.benefits || [],
//         reps: p.reps || null,
//       })),
//       is_authenticated: true,
//       recaptcha_token: "not_available",
//     };
//     console.log("📦 [PAYLOAD]:", JSON.stringify(payload, null, 2));
//     try {
//       categoryRef.current?.scrollToOffset({ offset: 0, animated: true });
//     } catch (err) {
//       console.log("⚠ scrollToTop failed, likely not a flatlist");
//     }

//     setLoading(true);
//     dispatch(
//       submitDailyDharmaSetup(payload, (res) => {
//         setLoading(false);

//         if (res.success) {
//           console.log("✅ Saved successfully!");
//           navigation.navigate("TrackerTabs", {
//             screen: "Tracker",
//           });
//         } else {
//           console.log("❌ Error saving:", res.error);
//         }
//       })
//     );
//   };

//   const handleCategoryPress = (item, index) => {
//     setSelectedCategory(item.key);
//     categoryRef.current?.scrollToIndex({
//       index,
//       animated: true,
//       viewPosition: 0.3,
//     });
//   };

//   const SimplePracticeCard = ({ item, categoryItem }) => {
//     const added = isAdded(item);

//     const displayMeaning =
//       item.meaning || item.summary || item.line || item.description;

//     return (
//       <View style={styles.simpleCard}>
//         <View style={{ flex: 1 }}>
//           <TextComponent type="mediumText" style={styles.cardTitle}>
//             {item.title}
//           </TextComponent>

//           <TextComponent style={styles.cardSubtitle} numberOfLines={2}>
//             {displayMeaning}
//           </TextComponent>
//         </View>

//         <View style={styles.cardRightIcons}>
//           <TouchableOpacity onPress={() => toggleAddItem(item)}>
//             <Ionicons
//               name={added ? "remove-circle" : "add-circle"}
//               size={28}
//               color={added ? "#C0392B" : "#D4A017"}
//             />
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={() => {
//               const selectedCat = categoryItem || initialCategories[0];

//               setDetailsCategoryItem({
//                 ...selectedCat,
//                 key: selectedCat.key, // ensure key ALWAYS exists
//               });

//               setDetailsList([item]);
//               setDetailsIndex(0);
//               setShowDetails(true);
//             }}
//             style={{ marginLeft: 14 }}
//           >
//             <Ionicons
//               name="information-circle-outline"
//               size={26}
//               color="#6E5C2E"
//             />
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   const renderDetailsCard = () => {
//     if (!showDetails) return null;

//     // ⭐ Always hydrate full practice object
//     const raw = detailsList[detailsIndex];
//     const item = getRawPracticeObject(raw?.practice_id, raw);

//     const nextItem = () => {
//       const updatedIndex = (detailsIndex + 1) % detailsList.length;
//       setDetailsIndex(updatedIndex);
//     };

//     const isEditMode = localPractices.some(
//       (p) => p.practice_id === item.practice_id
//     );

//     return (
//       <View
//         style={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           backgroundColor: "#FFFFFF",
//           zIndex: 999,
//           flex: 1,
//         }}
//       >
//         <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
//           <Ionicons
//             name="arrow-back"
//             size={26}
//             color="#000"
//             onPress={() => setShowDetails(false)}
//           />
//         </View>

//         <ScrollView
//           style={{ flex: 1, marginTop: 10 }}
//           contentContainerStyle={{ paddingHorizontal: 16 }}
//           showsVerticalScrollIndicator={false}
//         >
//           <DailyPracticeDetailsCard
//             mode={isEditMode ? "edit" : "new"}
//             data={item}
//             item={detailsCategoryItem}
//             onChange={nextItem}
//             onBackPress={() => {
//               const updatedItem = {
//                 ...item,
//                 reps: selectedCount ?? item.reps ?? null,
//               };

//               if (!isEditMode) {
//                 safeAddPractice(updatedItem);
//               }

//               setShowDetails(false);
//             }}
//             isLocked={true}
//             selectedCount={selectedCount}
//             onSelectCount={setSelectedCount}
//           />
//         </ScrollView>
//       </View>
//     );
//   };

// const renderSanatanList = () => {
//   const fullList = SANATAN_PRACTICES_FINAL;

//   const limitedList = fullList.slice(0, sanatanRenderCount);

//   return (
//     <FlatList
//       data={limitedList}
//       keyExtractor={(item: any, index) => item.id || item.practice_id || index.toString()}
//       contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 50 }}
//       onEndReachedThreshold={0.3}
//       onEndReached={() => {
//         if (sanatanRenderCount < fullList.length) {
//           setSanatanRenderCount(prev => prev + 15);
//         }
//       }}
//       renderItem={({ item }) => {
//         const isSelected = localPractices.some(
//           (p) =>
//             (p.id || p.practice_id) === (item.id || item.practice_id)
//         );

//         const displayName = t(`practices.${item.id}.name`, {
//           defaultValue: item.name,
//         });

//         const displayDescription = t(
//           `practices.${item.id}.description`,
//           { defaultValue: item.description }
//         );

//         return (
//           <Card
//             style={[
//               styles.simpleCard,
//               {
//                 backgroundColor: isSelected ? "#F7F0DD" : "#FFFFFF",
//                 borderColor: isSelected ? "#D4A017" : "#E0D8C8",
//                 borderWidth: 1,
//                 marginBottom: 12,
//               },
//             ]}
//           >
//             <View style={{ flexDirection: "row", alignItems: "center" }}>
//               <View style={{ flex: 1, paddingRight: 10 }}>
//                 {/* Name */}
//                 <TextComponent
//                   type="mediumText"
//                   style={styles.cardTitle}
//                   numberOfLines={1}
//                 >
//                   {item.icon ? `${item.icon} ` : ""}
//                   {displayName}
//                 </TextComponent>

//                 {/* Description */}
//                 <TextComponent
//                   style={styles.cardSubtitle}
//                   numberOfLines={2}
//                 >
//                   {displayDescription}
//                 </TextComponent>
//               </View>

//               {/* Add/Remove */}
//               <TouchableOpacity
//                 onPress={() =>
//                   toggleAddItem({
//                     ...item,
//                     practice_id: item.practice_id ?? item.id,
//                   })
//                 }
//               >
//                 <Ionicons
//                   name={isSelected ? "remove-circle" : "add-circle"}
//                   size={28}
//                   color={isSelected ? "#C0392B" : "#D4A017"}
//                 />
//               </TouchableOpacity>

//               {/* Info icon */}
//               <TouchableOpacity
//                 onPress={() => {
//                   setDetailsCategoryItem(
//                     initialCategories.find((c) => c.key === "sanatan")
//                   );
//                   setDetailsList([item]);
//                   setDetailsIndex(0);
//                   setShowDetails(true);
//                 }}
//                 style={{ marginLeft: 14 }}
//               >
//                 <Ionicons
//                   name="information-circle-outline"
//                   size={26}
//                   color="#6E5C2E"
//                 />
//               </TouchableOpacity>
//             </View>
//           </Card>
//         );
//       }}
//     />
//   );
// };


//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="dark-content" />

//       {/* ✅ GLOBAL CART MODAL (shared across app) */}
//       <CartModal
//         onConfirm={async (list) => {
//           const token = await AsyncStorage.getItem("access_token");

//           if (!token) {
//             await AsyncStorage.setItem(
//               "pending_tracker_edit_data",
//               JSON.stringify({
//                 pendingPractices: list,
//                 from: "TrackerEdit",
//               })
//             );
//             await AsyncStorage.setItem("resume_tracker_flow", "true");

//             navigation.navigate("Login", {
//               redirect_to: "TrackerEdit",
//               selectedmantra,
//               goToHistory: true,
//             });
//             return;
//           }

//           submitCartToServer(list);
//         }}
//       />

//       {renderDetailsCard()}

//       {isAddMoreScreen ? (
//         <>
//           <ScrollView
//             showsVerticalScrollIndicator={false}
//             style={{ marginBottom: 50 }}
//           >
//             <View
//               style={{
//                 flexDirection: "row",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 paddingHorizontal: 16,
//                 marginTop: 10,
//               }}
//             >
//               <TouchableOpacity onPress={() => setIsAddMoreScreen(false)}>
//                 <Ionicons name="arrow-back" size={26} color="#000" />
//               </TouchableOpacity>
//               <TextComponent
//                 type="DailyHeaderText"
//                 style={{
//                   color: Colors.Colors.BLACK,
//                   textAlign: "center",
//                   flex: 1,
//                   marginHorizontal: 10,
//                 }}
//               >
//                 Add To My Practice
//               </TextComponent>
//               <TouchableOpacity
//                 onPress={() => setCartModalVisible(true)}
//                 style={{ position: "relative" }}
//               >
//                 <View
//                   style={{
//                     position: "absolute",
//                     top: -6,
//                     right: -6,
//                     backgroundColor: "#1877F2",
//                     minWidth: 18,
//                     height: 18,
//                     borderRadius: 9,
//                     alignItems: "center",
//                     justifyContent: "center",
//                     paddingHorizontal: 4,
//                     zIndex: 10,
//                   }}
//                 >
//                   <TextComponent
//                     type="semiBoldText"
//                     style={{ color: "#fff", fontSize: 11 }}
//                   >
//                     {localPractices.length}
//                   </TextComponent>
//                 </View>

//                 {/* CART ICON */}
//                 <Image
//                   source={require("../../../assets/cart.png")}
//                   style={{ width: 30, height: 30 }}
//                   resizeMode="contain"
//                 />
//               </TouchableOpacity>
//             </View>

//             <TextInput
//               placeholder="Search"
//               placeholderTextColor="#8A8A8A"
//               style={styles.searchInput}
//               value={searchText}
//               onChangeText={setSearchText}
//             />

//             <FlatList
//               ref={categoryRef}
//               data={initialCategories}
//               horizontal
//               keyExtractor={(item) => item.key}
//               showsHorizontalScrollIndicator={false}
//               contentContainerStyle={styles.categoryList}
//               renderItem={({ item, index }) => (
//                 <TouchableOpacity
//                   onPress={() => handleCategoryPress(item, index)}
//                   style={[
//                     styles.categoryChip,
//                     selectedCategory === item.key &&
//                       styles.categoryChipSelected,
//                   ]}
//                 >
//                   <TextComponent
//                     type="cardText"
//                     style={[
//                       styles.categoryChipText,
//                       selectedCategory === item.key &&
//                         styles.categoryChipTextSelected,
//                     ]}
//                   >
//                     {item.name}
//                   </TextComponent>
//                 </TouchableOpacity>
//               )}
//             />

//             {!isSanatan && (
//               <>
//                 <View style={styles.typeTabs}>
//                   {["mantra", "sankalp", "practice"].map((type) => (
//                     <TouchableOpacity
//                       key={type}
//                       onPress={() => setSelectedType(type)}
//                       style={[
//                         styles.typeTab,
//                         selectedType === type && styles.typeTabSelected,
//                       ]}
//                     >
//                       <TextComponent
//                         type="cardText"
//                         style={[
//                           styles.typeTabText,
//                           selectedType === type &&
//                             styles.typeTabTextSelected,
//                         ]}
//                       >
//                         {type.toUpperCase()}
//                       </TextComponent>
//                     </TouchableOpacity>
//                   ))}
//                 </View>
//               </>
//             )}

//             {/* ⭐ SANATAN SECTION — MATCH SimplePracticeCard UI */}
//             {isSanatan ? (
//               <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
//                 {SANATAN_PRACTICES_FINAL.filter((practice) => {
//                   const n = t(`practices.${practice.id}.name`, {
//                     defaultValue: practice.name,
//                   }).toLowerCase();

//                   const d = t(
//                     `practices.${practice.id}.description`,
//                     {
//                       defaultValue: practice.description,
//                     }
//                   ).toLowerCase();

//                   const s = searchText.toLowerCase();
//                   return n.includes(s) || d.includes(s);
//                 }).map((practice: any, idx) => {
//                   const isSelected = localPractices.some(
//                     (p) =>
//                       (p.id || p.practice_id) ===
//                       (practice.id || practice.practice_id)
//                   );

//                   const displayName = t(
//                     `practices.${practice.id}.name`,
//                     {
//                       defaultValue: practice.name,
//                     }
//                   );

//                   const displayDescription = t(
//                     `practices.${practice.id}.description`,
//                     {
//                       defaultValue: practice.description,
//                     }
//                   );
//                   console.log(
//                     "🟧 Rendering Sanatan Practice:",
//                     displayName,
//                     displayDescription,
//                     isSelected
//                   );
//                   return (
//                     <Card
//                       key={idx}
//                       style={[
//                         styles.simpleCard,
//                         {
//                           backgroundColor: isSelected
//                             ? "#F7F0DD"
//                             : "#FFFFFF",
//                           borderColor: isSelected
//                             ? "#D4A017"
//                             : "#E0D8C8",
//                           borderWidth: 1,
//                           marginBottom: 12,
//                         },
//                       ]}
//                     >
//                       <View
//                         style={{
//                           flexDirection: "row",
//                           alignItems: "center",
//                         }}
//                       >
//                         <View style={{ width: "80%" }}>
//                           {/* ⭐ ICON + NAME (one line) */}
//                           <TextComponent
//                             type="mediumText"
//                             style={styles.cardTitle}
//                             numberOfLines={1}
//                           >
//                             {practice.icon ? `${practice.icon} ` : ""}
//                             {displayName}
//                           </TextComponent>

//                           {/* ⭐ DESCRIPTION (below name) */}
//                           <TextComponent
//                             style={styles.cardSubtitle}
//                             numberOfLines={2}
//                           >
//                             {displayDescription}
//                           </TextComponent>
//                         </View>

//                         {/* ⭐ +/- BUTTON */}
//                         <TouchableOpacity
//                           onPress={() => toggleAddItem(practice)}
//                           style={{ marginLeft: 10 }}
//                         >
//                           <Ionicons
//                             name={
//                               isSelected
//                                 ? "remove-circle"
//                                 : "add-circle"
//                             }
//                             size={28}
//                             color={
//                               isSelected ? "#C0392B" : "#D4A017"
//                             }
//                           />
//                         </TouchableOpacity>

//                         {/* ⭐ INFO BUTTON */}
//                         <TouchableOpacity
//                           onPress={() => {
//                             setDetailsCategoryItem({
//                               ...initialCategories.find(
//                                 (c) => c.key === "sanatan"
//                               ),
//                             });
//                             setDetailsList([practice]);
//                             setDetailsIndex(0);
//                             setShowDetails(true);
//                           }}
//                           style={{ marginLeft: 14 }}
//                         >
//                           <Ionicons
//                             name="information-circle-outline"
//                             size={26}
//                             color="#6E5C2E"
//                           />
//                         </TouchableOpacity>
//                       </View>
//                     </Card>
//                   );
//                 })}
//               </View>
//             ) : (
//               /* NORMAL MANTRA/SANKALP FLOW */
//               <View style={styles.itemsContainer}>
//                 {(selectedType === "mantra"
//                   ? mantraList
//                   : selectedType === "sankalp"
//                   ? sankalpList
//                   : practiceList
//                 ).map((item, idx) => (
//                   <SimplePracticeCard
//                     key={idx}
//                     item={item}
//                     categoryItem={initialCategories.find(
//                       (c) => c.key === selectedCategory
//                     )}
//                   />
//                 ))}
//               </View>
//             )}
//           </ScrollView>
//           <View style={styles.bottomButtonContainer}>
//             <LoadingButton
//               loading={false}
//               text="Confirm"
//               onPress={async () => {
//                 const token = await AsyncStorage.getItem("access_token");

//                 if (!token) {
//                   await AsyncStorage.setItem(
//                     "pending_tracker_edit_data",
//                     JSON.stringify({
//                       pendingPractices: localPractices,
//                       from: "TrackerEdit",
//                     })
//                   );
//                   await AsyncStorage.setItem(
//                     "resume_tracker_flow",
//                     "true"
//                   );

//                   navigation.navigate("Login", {
//                     redirect_to: "TrackerEdit",
//                     selectedmantra,
//                     goToHistory: true,
//                   });

//                   return;
//                 }
//                 setCartModalVisible(true);
//                 // submitCartToServer(localPractices);
//               }}
//               disabled={false}
//               style={styles.button}
//               textStyle={styles.buttonText}
//               showGlobalLoader={true}
//             />
//           </View>
//         </>
//       ) : (
//         <ScrollView showsVerticalScrollIndicator={false}>
//           <>
//             <View
//               style={{
//                 flexDirection: "row",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 paddingHorizontal: 16,
//                 marginTop: 10,
//               }}
//             >
//               <View style={{ width: 30 }} />
//               <TextComponent
//                 type="DailyHeaderText"
//                 style={{
//                   color: Colors.Colors.BLACK,
//                   textAlign: "center",
//                   flex: 1,
//                 }}
//               >
//                 Your Daily Routine
//               </TextComponent>
//               <TouchableOpacity
//                 onPress={() => setCartModalVisible(true)}
//                 style={{ position: "relative", width: 30, height: 30 }}
//               >
//                 <View
//                   style={{
//                     position: "absolute",
//                     top: -6,
//                     right: -6,
//                     backgroundColor: "#1877F2",
//                     minWidth: 18,
//                     height: 18,
//                     borderRadius: 9,
//                     alignItems: "center",
//                     justifyContent: "center",
//                     paddingHorizontal: 4,
//                     zIndex: 10,
//                   }}
//                 >
//                   <TextComponent
//                     type="semiBoldText"
//                     style={{ color: "#fff", fontSize: 11 }}
//                   >
//                     {localPractices.length}
//                   </TextComponent>
//                 </View>

//                 {/* CART ICON */}
//                 <Image
//                   source={require("../../../assets/cart.png")}
//                   style={{ width: 30, height: 30 }}
//                   resizeMode="contain"
//                 />
//               </TouchableOpacity>
//             </View>

//             <View
//               style={{
//                 flexDirection: "row",
//                 flexWrap: "wrap",
//                 justifyContent: "space-between",
//                 paddingHorizontal: 20,
//                 marginTop: 20,
//               }}
//             >
//               {localPractices.map((item) => (
//                 <Card
//                   key={item.practice_id}
//                   style={{
//                     width: "48%",
//                     backgroundColor: "#F7F0DD",
//                     borderRadius: 10,
//                     padding: 10,
//                     marginBottom: 15,
//                     borderWidth: 1,
//                     borderColor: "#D4A017",
//                     elevation: 3,
//                     position: "relative",
//                   }}
//                 >
//                   <Ionicons
//                     name="close-circle"
//                     size={20}
//                     color="#D4A017"
//                     style={{ position: "absolute", top: -18, right: -20 }}
//                     onPress={() => safeRemovePractice(item.unified_id)}
//                   />
//                   <View
//                     style={{
//                       flexDirection: "row",
//                       alignItems: "center",
//                       justifyContent: "space-between",
//                     }}
//                   >
//                     <View
//                       style={{
//                         flexDirection: "row",
//                         alignItems: "center",
//                         flex: 1,
//                       }}
//                     >
//                       <TextComponent
//                         type="mediumText"
//                         numberOfLines={1}
//                         ellipsizeMode="tail"
//                         style={{
//                           marginLeft: 6,
//                           fontSize: FontSize.CONSTS.FS_13,
//                           color: Colors.Colors.BLACK,
//                           flex: 1,
//                         }}
//                       >
//                         {item.name ||
//                           item.details?.name ||
//                           item?.title ||
//                           item?.iast ||
//                           item?.short_text ||
//                           "Practice"}
//                       </TextComponent>
//                     </View>
//                     <Ionicons
//                       name="information-circle-outline"
//                       size={18}
//                       color="#6E5C2E"
//                       style={{ marginLeft: 6 }}
//                       onPress={() => {
//                         const fullData = getRawPracticeObject(
//                           item.practice_id,
//                           item
//                         );
//                         const detailsData = fullData
//                           ? {
//                               ...fullData,
//                               practice_id: item.practice_id,
//                             }
//                           : item;
//                         const categoryItem = initialCategories.find(
//                           (c) =>
//                             c.key === detailsData.category ||
//                             c.key === item.category
//                         );

//                         setDetailsCategoryItem(
//                           categoryItem || initialCategories[0]
//                         );

//                         setDetailsList([detailsData]);
//                         setDetailsIndex(0);
//                         setShowDetails(true);
//                       }}
//                     />
//                   </View>
//                 </Card>
//               ))}
//             </View>

//             <View
//               style={{
//                 marginTop: 20,
//                 borderColor: "#CC9B2F",
//                 borderWidth: 1,
//                 borderRadius: 8,
//                 alignItems: "center",
//                 marginHorizontal: 16,
//                 padding: 18,
//               }}
//             >
//               <TextComponent
//                 type="headerSubBoldText"
//                 style={{ color: "#282828", textAlign: "center" }}
//               >
//                 Ready to expand your practice?
//               </TextComponent>

//               <TextComponent
//                 type="subDailyText"
//                 style={{ marginTop: 8, textAlign: "center" }}
//               >
//                 Discover and add new wellness practices to deepen your
//                 journey.
//               </TextComponent>

//               <TouchableOpacity
//                 onPress={() => setIsAddMoreScreen(true)}
//                 style={{
//                   backgroundColor: "#D4A017",
//                   alignSelf: "center",
//                   padding: 10,
//                   borderRadius: 8,
//                   marginTop: 14,
//                 }}
//               >
//                 <TextComponent
//                   type="headerSubBoldText"
//                   style={{ color: "#FFFFFF" }}
//                   onPress={() => setIsAddMoreScreen(true)}
//                 >
//                   Add More Practice
//                 </TextComponent>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 onPress={() => {
//                   navigation.navigate("CreateOwnPractice");
//                 }}
//                 style={{
//                   backgroundColor: "#D4A017",
//                   alignSelf: "center",
//                   padding: 10,
//                   borderRadius: 8,
//                   marginTop: 14,
//                 }}
//               >
//                 <TextComponent
//                   type="headerSubBoldText"
//                   style={{ color: "#FFFFFF" }}
//                 >
//                   Create Custom Practice
//                 </TextComponent>
//               </TouchableOpacity>
//             </View>

//             <TouchableOpacity
//               style={{
//                 backgroundColor: "#D4A017",
//                 alignSelf: "center",
//                 padding: 10,
//                 borderRadius: 8,
//                 marginTop: 30,
//                 paddingHorizontal: 30,
//               }}
//               onPress={async () => {
//                 const token = await AsyncStorage.getItem("access_token");

//                 if (!token) {
//                   await AsyncStorage.setItem(
//                     "pending_tracker_edit_data",
//                     JSON.stringify({
//                       pendingPractices: localPractices,
//                       from: "TrackerEdit",
//                     })
//                   );
//                   await AsyncStorage.setItem(
//                     "resume_tracker_flow",
//                     "true"
//                   );

//                   navigation.navigate("Login", {
//                     redirect_to: "TrackerEdit",
//                     selectedmantra,
//                     goToHistory: true,
//                   });
//                   return;
//                 }
//                 setCartModalVisible(true);
//                 // submitCartToServer(localPractices);
//               }}
//             >
//               <TextComponent
//                 type="headerSubBoldText"
//                 style={{ color: "#FFFFFF" }}
//               >
//                 Confirm
//               </TextComponent>
//             </TouchableOpacity>
//           </>
//         </ScrollView>
//       )}
//       <ConfirmDiscardModal
//   visible={discardModalVisible}
//   onViewCart={() => {
//     setDiscardModalVisible(false);
//     setCartModalVisible(true);
//   }}
//   onLeave={() => {
//     // restore from API (mergedPractices)
//     clearCart();
//     mergedPractices.forEach((p) => addPractice(p));

//     setHasUnsavedChanges(false);
//     setDiscardModalVisible(false);
//     navigation.goBack();
//   }}
//   onCancel={() => setDiscardModalVisible(false)}
// />

// <AddPracticeInputModal
//   visible={inputModalVisible}
//   practice={selectedPracticeForModal}
//   isSankalp={
//     selectedPracticeForModal?.id?.startsWith("sankalp.") ||
//     selectedPracticeForModal?.practice_id?.startsWith("sankalp.")
//   }
//   onClose={() => setInputModalVisible(false)}
//   onSave={(data) => {
//     handleSavePracticeInput(data);
//     setInputModalVisible(false);
//   }}
// />

//       <LoadingOverlay visible={loading} text="Submitting..." />
//     </SafeAreaView>
//   );
// };

// export default TrackerEdit;



// /* --- PART 1 START --- */

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import { AnyAction } from "@reduxjs/toolkit";
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   FlatList,
//   Image,
//   ImageBackground,
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import Modal from "react-native-modal";
// import { Card } from "react-native-paper";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import { useDispatch, useSelector } from "react-redux";
// import { ThunkDispatch } from "redux-thunk";
// import Colors from "../../components/Colors";
// import DailyPracticeDetailsCard from "../../components/DailyPracticeDetailsCard";
// import FontSize from "../../components/FontSize";
// import LoadingButton from "../../components/LoadingButton";
// import LoadingOverlay from "../../components/LoadingOverlay";
// import TextComponent from "../../components/TextComponent";
// import i18n from "../../config/i18n";
// import { useCart } from "../../context/CartContext";
// import { SANATAN_PRACTICES_FINAL } from "../../data/sanatanPractices";
// import { RootState } from "../../store";
// import { getRawPracticeObject } from "../../utils/getPracticeObjectById";
// import { submitDailyDharmaSetup } from "../Home/actions";
// import styles from "./TrackerEditStyles";

// // const initialCategories = [
// //   {
// //     name: "Peace & Calm",
// //     key: "peace-calm",
// //     description: "Find calm in the breath.",
// //   },
// //   {
// //     name: "Focus & Motivation",
// //     key: "focus",
// //     description: "Align. Focus. Rise.",
// //   },
// //   {
// //     name: "Emotional Healing",
// //     key: "healing",
// //     description: "Let go. Begin again.",
// //   },
// //   {
// //     name: "Gratitude & Positivity",
// //     key: "gratitude",
// //     description: "Gratitude transforms everything.",
// //   },
// //   {
// //     name: "Spiritual Growth",
// //     key: "spiritual-growth",
// //     description: "Grow through awareness.",
// //   },
// //   {
// //     name: "Health & Well-Being",
// //     key: "health",
// //     description: "Balance builds strength.",
// //   },
// //   {
// //     name: "Career & Prosperity",
// //     key: "career",
// //     description: "Opportunity follows action.",
// //   },
// // ];

// const initialCategories = [
//   {
//     name: "Peace & Calm",
//     key: "peace-calm",
//     description: "Find calm in the breath.",
//   },
//   {
//     name: "Focus & Motivation",
//     key: "focus",
//     description: "Align. Focus. Rise.",
//   },
//   {
//     name: "Emotional Healing",
//     key: "healing",
//     description: "Let go. Begin again.",
//   },
//   {
//     name: "Gratitude & Positivity",
//     key: "gratitude",
//     description: "Gratitude transforms everything.",
//   },
//   {
//     name: "Spiritual Growth",
//     key: "spiritual-growth",
//     description: "Grow through awareness.",
//   },
//   {
//     name: "Health & Well-Being",
//     key: "health",
//     description: "Balance builds strength.",
//   },
//   {
//     name: "Career & Prosperity",
//     key: "career",
//     description: "Opportunity follows action.",
//   },

//   // ⭐ NEW CAPSULE
//   {
//     name: "Sanatan",
//     key: "sanatan",
//     description: "Ancient traditions & timeless wisdom.",
//   },
// ];


// const TrackerEdit = ({route}) => {
//   const navigation: any = useNavigation();
//     const { t } = useTranslation();
//   const categoryRef = useRef<any>(null);
// const selectedmantra = route?.params?.selectedmantra;
//   const [selectedCategory, setSelectedCategory] = useState(
//     initialCategories[0].key
//   );
//   const [selectedType, setSelectedType] = useState("mantra");
//   const [searchText, setSearchText] = useState("");
//   const [isAddMoreScreen, setIsAddMoreScreen] = useState(false);
//   const [cartModalVisible, setCartModalVisible] = useState(false);
//   const [showDetails, setShowDetails] = useState(false);
//   const [detailsList, setDetailsList] = useState([]);
//   const [detailsIndex, setDetailsIndex] = useState(0);
//   const [detailsCategoryItem, setDetailsCategoryItem] = useState(null);
//     const [loading, setLoading] = useState(false);
//     // ⬅️ Add this at top inside TrackerEdit()
// const [selectedCount, setSelectedCount] = useState(null);

//   const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

//   const resumeData = route?.params?.resumeData;

// console.log("resumeData :::", resumeData);

//   const dailyPractice: any = useSelector(
//     (state: RootState) => state.dailyPracticeReducer
//   );
//   // const [localPractices, setLocalPractices] = useState([]);

//   const { localPractices, addPractice, removePractice } = useCart();


//   const allData = i18n.getResourceBundle(i18n.language, "translation");

//   const mantraList = useMemo(() => {
//     return Object.values(allData)
//       .filter(
//         (item: any) =>
//           item?.category === selectedCategory && item?.id?.startsWith("mantra.")
//       )
//       .filter((item: any) =>
//         item.title?.toLowerCase().includes(searchText.toLowerCase())
//       );
//   }, [selectedCategory, searchText]);

//   const sankalpList = useMemo(() => {
//     return Object.values(allData)
//       .filter(
//         (item: any) =>
//           item?.category === selectedCategory &&
//           item?.id?.startsWith("sankalp.")
//       )
//       .filter((item: any) =>
//         item.title?.toLowerCase().includes(searchText.toLowerCase())
//       );
//   }, [selectedCategory, searchText]);

//   const practiceList = useMemo(() => {
//     return Object.values(allData)
//       .filter(
//         (item: any) =>
//           item?.category === selectedCategory &&
//           item?.id?.startsWith("practice.")
//       )
//       .filter((item: any) =>
//         item.title?.toLowerCase().includes(searchText.toLowerCase())
//       );
//   }, [selectedCategory, searchText]);

// const normalizePractice = (p: any) => ({
//   ...p,
//   id: p?.id || p?.practice_id,       
//   practice_id: p?.practice_id || p?.id,
//   title: p?.title || p?.name || p?.short_text,      
//   name: p?.name || p?.title || p?.tooltip,
//   icon: p?.icon || "",              
//   category: p.category || "",  
// });

// const mergedPractices = useMemo(() => {
//   const apiList =
//     dailyPractice?.data?.active_practices?.map(normalizePractice) || [];

//   // Support both possible structures
// const resumePractices =
//   resumeData?.pendingPractices ||
//   resumeData?.payload?.pendingPractices ||
//   [];

// const resumeList = resumePractices.map(normalizePractice);



//   // const resumeList =
//   //   resumeData?.payload?.pendingPractices?.map(normalizePractice) || [];

//   const selectedList =
//     selectedmantra ? [normalizePractice(selectedmantra)] : [];

//   const map = new Map();

//   apiList.forEach(p => map.set(p.practice_id, p));
//   resumeList.forEach(p => map.set(p.practice_id, p));
//   selectedList.forEach(p => map.set(p.practice_id, p));

//   return Array.from(map.values());
// }, [dailyPractice, resumeData, selectedmantra]);

// console.log("🟪 Merged Practices:", JSON.stringify(mergedPractices));

// const isSanatan = selectedCategory === "sanatan";


// useEffect(() => {
//   setLocalPractices(mergedPractices);
// }, [mergedPractices]);

// const toggleAddItem = (item) => {
//   const unifiedId = item.practice_id ?? item.id;

//   const exists = localPractices.some(
//     (x) => x.unified_id === unifiedId
//   );

//   if (exists) {
//     removePractice(unifiedId);
//   } else {
//     addPractice(item);
//   }
// };


//   // const toggleAddItem = (item) => {
//   //   const exists = localPractices.find((x) => x.id === item.id);

//   //   if (exists) {
//   //     setLocalPractices((prev) => prev.filter((x) => x.id !== item.id));
//   //   } else {
//   //     setLocalPractices((prev) => [...prev, item]);
//   //   }
//   // };

//   const isAdded = (item) => localPractices.some((x) => x.id === item.id);

//   const apiPractices = dailyPractice?.data?.active_practices ?? [];

//   // const recentlyAdded = localPractices.filter(
//   //   (item) => !apiPractices.some((x) => x.id === item.id)
//   // );

//   const recentlyAdded = localPractices.filter(
//   (item) =>
//     !apiPractices.some((x) => x.practice_id === item.practice_id)
// );


//   const submitCartToServer = (practicesList) => {
//   console.log("🟦 [API] Preparing payload from list:", practicesList);
//   const unique = Array.from(
//     new Map(practicesList.map((p) => [p.id || p.practice_id, p])).values()
//   );

//   console.log("🟩 [CART] Unique Items:", unique);
//   const payload = {
//     practices: unique.map((p: any) => ({
//       practice_id: p.id || p.practice_id,
//       source: p.id?.startsWith("mantra.")
//         ? "mantra"
//         : p.id?.startsWith("sankalp.")
//         ? "sankalp"
//         : "library",
//       category: p.category || detailsCategoryItem?.name || "",
//       name: p.title || p.name || p.text || "",
//       description: p.description || p.summary || p.meaning || "",
//       benefits: p.benefits || [],
//       reps : p.reps || null
//     })),
//     is_authenticated: true,
//     recaptcha_token: "not_available",
//   };
//   console.log("📦 [PAYLOAD]:", JSON.stringify(payload, null, 2));
//   try {
//     categoryRef.current?.scrollToOffset({ offset: 0, animated: true });
//   } catch (err) {
//     console.log("⚠ scrollToTop failed, likely not a flatlist");
//   }

//   setLoading(true);
//   dispatch(
//     submitDailyDharmaSetup(payload, (res) => {
//       setLoading(false);

//       if (res.success) {
//         console.log("✅ Saved successfully!");
//         navigation.navigate("TrackerTabs", {
//           screen: "Tracker",
//         });
//       } else {
//         console.log("❌ Error saving:", res.error);
//       }
//     })
//   );
// };

//   const handleCategoryPress = (item, index) => {
//     setSelectedCategory(item.key);
//     categoryRef.current?.scrollToIndex({
//       index,
//       animated: true,
//       viewPosition: 0.3,
//     });
//   };



//   const SimplePracticeCard = ({ item, categoryItem }) => {
//     const added = isAdded(item);

//     const displayMeaning =
//       item.meaning || item.summary || item.line || item.description;

//     return (
//       <View style={styles.simpleCard}>
//         <View style={{ flex: 1 }}>
//           <TextComponent type="mediumText" style={styles.cardTitle}>
//             {item.title}
//           </TextComponent>

//           <TextComponent style={styles.cardSubtitle} numberOfLines={2}>
//             {displayMeaning}
//           </TextComponent>
//         </View>

//         <View style={styles.cardRightIcons}>
//           <TouchableOpacity onPress={() => toggleAddItem(item)}>
//             <Ionicons
//               name={added ? "remove-circle" : "add-circle"}
//               size={28}
//               color={added ? "#C0392B" : "#D4A017"}
//             />
//           </TouchableOpacity>

//           <TouchableOpacity
//             // onPress={() =>
//             //   navigation.navigate("DailyPracticeDetailSelectedPractice", {
//             //     item: categoryItem,
//             //     fullList: [item],
//             //     startingIndex: 0,
//             //     onUpdateSelection: () => {},
//             //     isLocked: false,
//             //   })
//             // }
//           onPress={() => {
//   const selectedCat = categoryItem || initialCategories[0];

//   setDetailsCategoryItem({
//     ...selectedCat,
//     key: selectedCat.key   // ensure key ALWAYS exists
//   });

//   setDetailsList([item]);
//   setDetailsIndex(0);
//   setShowDetails(true);
// }}

//             style={{ marginLeft: 14 }}
//           >
//             <Ionicons
//               name="information-circle-outline"
//               size={26}
//               color="#6E5C2E"
//             />
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   const CartModal = () => (
//     <Modal
//       isVisible={cartModalVisible}
//       onBackdropPress={() => setCartModalVisible(false)}
//       onBackButtonPress={() => setCartModalVisible(false)}
//       backdropOpacity={0.6}
//       animationIn="slideInUp"
//       animationOut="slideOutDown"
//       animationInTiming={400}
//       animationOutTiming={350}
//       useNativeDriver
//     >
//       <View style={styles.modalOverlay}>
//         <ImageBackground
//           source={require("../../../assets/CardBG.png")}
//           style={styles.bottomSheet}
//           imageStyle={styles.modalBGImage}
//         >
//           <View style={styles.dragIndicator} />
//           <View style={styles.modalHeader}>
//             <TextComponent type="headerBoldText" style={{ color: "#282828" }}>
//               Your Cart ({localPractices.length})
//             </TextComponent>
//             <Ionicons
//               name="close"
//               size={24}
//               color="#000"
//               onPress={() => setCartModalVisible(false)}
//             />
//           </View>
//           <ScrollView style={{ maxHeight: 400, paddingBottom: 40 }}>
//             {apiPractices.length > 0 && (
//               <TextComponent type="boldText" style={styles.sectionHeader}>
//                 Active Practices
//               </TextComponent>
//             )}
//             {apiPractices.map((item, idx) => (
//               <Card key={idx} style={styles.itemRow}>
//                 <View style={{ flex: 1 }}>
//                   <TextComponent type="mediumText">{item.name}</TextComponent>
//                   <TextComponent style={styles.itemType}>
//                     {item.type ?? "Practice"}
//                   </TextComponent>
//                 </View>
//               </Card>
//             ))}
//             <View style={styles.divider} />
//             {recentlyAdded.length > 0 && (
//               <TextComponent type="boldText" style={styles.sectionHeader}>
//                 Added Recently
//               </TextComponent>
//             )}

//             {recentlyAdded.map((item, idx) => (
//               <Card key={idx} style={styles.itemRow}>
//                 <View style={{ flex: 1 }}>
//                   <TextComponent type="mediumText">{item?.title || item?.iast || item?.short_text}</TextComponent>
//                   <TextComponent style={styles.itemType}>
//                     {item.id.startsWith("mantra.")
//                       ? "Mantra"
//                       : item.id.startsWith("sankalp.")
//                       ? "Sankalp"
//                       : "Practice"}
//                   </TextComponent>
//                 </View>
//               </Card>
//             ))}
//             {apiPractices.length === 0 && recentlyAdded.length === 0 && (
//               <TextComponent style={{ textAlign: "center", marginTop: 20 }}>
//                 No Practices Added
//               </TextComponent>
//             )}
//           </ScrollView>
//         </ImageBackground>
//       </View>
//     </Modal>
//   );

// const renderDetailsCard = () => {
//   if (!showDetails) return null;

//   // ⭐ Always hydrate full practice object
//   const raw = detailsList[detailsIndex];
//   const item = getRawPracticeObject(raw?.practice_id, raw);

//   const nextItem = () => {
//     const updatedIndex = (detailsIndex + 1) % detailsList.length;
//     setDetailsIndex(updatedIndex);
//   };

//   const isEditMode = localPractices.some(
//     (p) => p.practice_id === item.practice_id
//   );

//   return (
//     <View
//       style={{
//         position: "absolute",
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         backgroundColor: "#FFFFFF",
//         zIndex: 999,
//         flex: 1,
//       }}
//     >
//       <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
//         <Ionicons
//           name="arrow-back"
//           size={26}
//           color="#000"
//           onPress={() => setShowDetails(false)}
//         />
//       </View>

//       <ScrollView
//         style={{ flex: 1, marginTop: 10 }}
//         contentContainerStyle={{ paddingHorizontal: 16 }}
//         showsVerticalScrollIndicator={false}
//       >
//         <DailyPracticeDetailsCard
//           mode={isEditMode ? "edit" : "new"}
//           data={item}
//           item={detailsCategoryItem}
//           onChange={nextItem}
//           onBackPress={() => {
//             const updatedItem = {
//               ...item,
//               reps: selectedCount ?? item.reps ?? null,
//             };

//             if (!isEditMode) {
//               setLocalPractices((prev) => {
//                 const exists = prev.some(
//                   (p) => p.practice_id === updatedItem.practice_id
//                 );
//                 if (exists) return prev;
//                 return [...prev, updatedItem];
//               });
//             }

//             setShowDetails(false);
//           }}
//           isLocked={true}
//           selectedCount={selectedCount}
//           onSelectCount={setSelectedCount}
//         />
//       </ScrollView>
//     </View>
//   );
// };

// const renderSanatanList = () => {
//   return (
//     <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
//       {SANATAN_PRACTICES_FINAL.map((practice: any, idx) => {
//         const isSelected = localPractices.some(
//           (p: any) => (p.id || p.practice_id) === (practice.id || practice.practice_id)
//         );

//         const displayName = t(`practices.${practice.id}.name`, {
//           defaultValue: practice.name,
//         });

//         const displayDescription = t(
//           `practices.${practice.id}.description`,
//           { defaultValue: practice.description }
//         );

//         return (
//           <Card
//             key={idx}
//             style={[
//               styles.simpleCard,
//               {
//                 backgroundColor: isSelected ? "#F7F0DD" : "#FFFFFF",
//                 borderColor: isSelected ? "#D4A017" : "#E0D8C8",
//                 borderWidth: 1,
//               },
//             ]}
//           >
//             <TouchableOpacity
//               onPress={() => 
//                 toggleAddItem({
//   ...practice,
//   practice_id: practice.practice_id ?? practice.id,
// })
//                 // toggleAddItem(practice)
//               }
//               style={{ flexDirection: "row", flex: 1 }}
//             >
//               <View style={{ flex: 1 }}>
//                 <TextComponent type="mediumText" style={styles.cardTitle}>
//                   {displayName}
//                 </TextComponent>
//                 {!!displayDescription && (
//                   <TextComponent style={styles.cardSubtitle}>
//                     {displayDescription}
//                   </TextComponent>
//                 )}
//               </View>

//               <Ionicons
//                 name={isSelected ? "remove-circle" : "add-circle"}
//                 size={28}
//                 color={isSelected ? "#C0392B" : "#D4A017"}
//                 style={{ alignSelf: "center" }}
//               />
//             </TouchableOpacity>
//           </Card>
//         );
//       })}
//     </View>
//   );
// };



//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="dark-content" />
//       {CartModal()}
//       {renderDetailsCard()}
//       {isAddMoreScreen ? (
//         <>
//           <ScrollView
//             showsVerticalScrollIndicator={false}
//             style={{ marginBottom: 50 }}
//           >
// <View
//   style={{
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     marginTop: 10,
//   }}
// >
//   <TouchableOpacity onPress={() => setIsAddMoreScreen(false)}>
//     <Ionicons name="arrow-back" size={26} color="#000" />
//   </TouchableOpacity>
//   <TextComponent
//     type="DailyHeaderText"
//     style={{
//       color: Colors.Colors.BLACK,
//       textAlign: "center",
//       flex: 1,
//       marginHorizontal: 10,
//     }}
//   >
//     Add To My Practice
//   </TextComponent>
//   <TouchableOpacity
//     onPress={() => setCartModalVisible(true)}
//     style={{ position: "relative" }}
//   >
//     <View
//       style={{
//         position: "absolute",
//         top: -6,
//         right: -6,
//         backgroundColor: "#1877F2",
//         minWidth: 18,
//         height: 18,
//         borderRadius: 9,
//         alignItems: "center",
//         justifyContent: "center",
//         paddingHorizontal: 4,
//         zIndex: 10,
//       }}
//     >
//       <TextComponent
//         type="semiBoldText"
//         style={{ color: "#fff", fontSize: 11 }}
//       >
//         {localPractices.length}
//       </TextComponent>
//     </View>

//     {/* CART ICON */}
//     <Image
//       source={require("../../../assets/cart.png")}
//       style={{ width: 30, height: 30 }}
//       resizeMode="contain"
//     />
//   </TouchableOpacity>
// </View>

//             <TextInput
//               placeholder="Search"
//               placeholderTextColor="#8A8A8A"
//               style={styles.searchInput}
//               value={searchText}
//               onChangeText={setSearchText}
//             />
//             <FlatList
//               ref={categoryRef}
//               data={initialCategories}
//               horizontal
//               keyExtractor={(item) => item.key}
//               showsHorizontalScrollIndicator={false}
//               contentContainerStyle={styles.categoryList}
//               renderItem={({ item, index }) => (
//                 <TouchableOpacity
//                   onPress={() => handleCategoryPress(item, index)}
//                   style={[
//                     styles.categoryChip,
//                     selectedCategory === item.key &&
//                       styles.categoryChipSelected,
//                   ]}
//                 >
//                   <TextComponent type="cardText"
//                     style={[
//                       styles.categoryChipText,
//                       selectedCategory === item.key &&
//                         styles.categoryChipTextSelected,
//                     ]}
//                   >
//                     {item.name}
//                   </TextComponent>
//                 </TouchableOpacity>
//               )}
//             />
//             {!isSanatan && (
//   <>
//             <View style={styles.typeTabs}>
//               {["mantra", "sankalp", "practice"].map((type) => (
//                 <TouchableOpacity
//                   key={type}
//                   onPress={() => setSelectedType(type)}
//                   style={[
//                     styles.typeTab,
//                     selectedType === type && styles.typeTabSelected,
//                   ]}
//                 >
//                   <TextComponent type="cardText"
//                     style={[
//                       styles.typeTabText,
//                       selectedType === type && styles.typeTabTextSelected,
//                     ]}
//                   >
//                     {type.toUpperCase()}
//                   </TextComponent>
//                 </TouchableOpacity>
//               ))}
//             </View>
//   </>
// )}
// {/* ⭐ SANATAN SECTION — MATCH SimplePracticeCard UI */}
// {isSanatan ? (
//   <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
//     {SANATAN_PRACTICES_FINAL
//       .filter((practice) => {
//         // search support
//         const n = t(`practices.${practice.id}.name`, {
//           defaultValue: practice.name,
//         }).toLowerCase();

//         const d = t(`practices.${practice.id}.description`, {
//           defaultValue: practice.description,
//         }).toLowerCase();

//         const s = searchText.toLowerCase();
//         return n.includes(s) || d.includes(s);
//       })
//       .map((practice, idx) => {
//         const isSelected = localPractices.some(
//           (p) =>
//             (p.id || p.practice_id) ===
//             (practice.id || practice.practice_id)
//         );

//         const displayName = t(`practices.${practice.id}.name`, {
//           defaultValue: practice.name,
//         });

//         const displayDescription = t(
//           `practices.${practice.id}.description`,
//           {
//             defaultValue: practice.description,
//           }
//         );
// console.log("🟧 Rendering Sanatan Practice:", displayName,displayDescription, isSelected);
//         return (
//           <Card
//             key={idx}
//             style={[
//               styles.simpleCard,
//               {
//                 backgroundColor: isSelected ? "#F7F0DD" : "#FFFFFF",
//                 borderColor: isSelected ? "#D4A017" : "#E0D8C8",
//                 borderWidth: 1,
//                 marginBottom: 12,
//               },
//             ]}
//           >
//             <View style={{ flexDirection: "row" ,alignItems:"center"}}>
//               <View style={{width: '80%'}}>
//                 {/* ⭐ ICON + NAME (one line) */}
//                 <TextComponent
//                   type="mediumText"
//                   style={styles.cardTitle}
//                   numberOfLines={1}
//                 >
//                   {practice.icon ? `${practice.icon} ` : ""}
//                   {displayName}
//                 </TextComponent>

//                 {/* ⭐ DESCRIPTION (below name) */}
//                 <TextComponent
//                   style={styles.cardSubtitle}
//                   numberOfLines={2}
//                 >
//                   {displayDescription}
//                 </TextComponent>
//               </View>

//               {/* ⭐ +/- BUTTON */}
//               <TouchableOpacity
//                 onPress={() => toggleAddItem(practice)}
//                 style={{ marginLeft: 10 }}
//               >
//                 <Ionicons
//                   name={isSelected ? "remove-circle" : "add-circle"}
//                   size={28}
//                   color={isSelected ? "#C0392B" : "#D4A017"}
//                 />
//               </TouchableOpacity>

//               {/* ⭐ INFO BUTTON */}
//               <TouchableOpacity
//                 onPress={() => {
//                   setDetailsCategoryItem({
//                     ...initialCategories.find(c => c.key === "sanatan"),
//                   });
//                   setDetailsList([practice]);
//                   setDetailsIndex(0);
//                   setShowDetails(true);
//                 }}
//                 style={{ marginLeft: 14 }}
//               >
//                 <Ionicons
//                   name="information-circle-outline"
//                   size={26}
//                   color="#6E5C2E"
//                 />
//               </TouchableOpacity>
//             </View>
//           </Card>
//         );
//       })}
//   </View>
// ) : (
//   /* NORMAL MANTRA/SANKALP FLOW */
//   <View style={styles.itemsContainer}>
//     {(selectedType === "mantra"
//       ? mantraList
//       : selectedType === "sankalp"
//       ? sankalpList
//       : practiceList
//     ).map((item, idx) => (
//       <SimplePracticeCard
//         key={idx}
//         item={item}
//         categoryItem={initialCategories.find(
//           (c) => c.key === selectedCategory
//         )}
//       />
//     ))}
//   </View>
// )}




//             {/* <View style={styles.itemsContainer}>
//               {(selectedType === "mantra"
//                 ? mantraList
//                 : selectedType === "sankalp"
//                 ? sankalpList
//                 : practiceList
//               ).map((item, idx) => (
//                 <SimplePracticeCard
//                   key={idx}
//                   item={item}
//                   categoryItem={initialCategories.find(
//                     (c) => c.key === selectedCategory
//                   )}
//                 />
//               ))}
//             </View> */}
//           </ScrollView>
//           <View style={styles.bottomButtonContainer}>
//             <LoadingButton
//               loading={false}
//               text="Confirm"
//         onPress={async () => {
//   const token = await AsyncStorage.getItem("access_token");

//   if (!token) {
//     await AsyncStorage.setItem(
//       "pending_tracker_edit_data",
//       JSON.stringify({
//         pendingPractices: localPractices,
//         from: "TrackerEdit",
//       })
//     );
// await AsyncStorage.setItem("resume_tracker_flow", "true");

//     navigation.navigate("Login", {
//       redirect_to: "TrackerEdit",
//       selectedmantra,
//       goToHistory: true,
//     });

//     return;
//   }
//   submitCartToServer(localPractices);
// }}
//               disabled={false}
//               style={styles.button}
//               textStyle={styles.buttonText}
//               showGlobalLoader={true}
//             />
//           </View>
//         </>
//       ) : (
//         <ScrollView showsVerticalScrollIndicator={false}> 
//         <>
// <View
//   style={{
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     marginTop: 10,
//   }}
// >
//   <View style={{ width: 30 }} />
//   <TextComponent
//     type="DailyHeaderText"
//     style={{
//       color: Colors.Colors.BLACK,
//       textAlign: "center",
//       flex: 1,
//     }}
//   >
//    Your Daily Routine
//   </TextComponent>
//   <TouchableOpacity
//     onPress={() => setCartModalVisible(true)}
//     style={{ position: "relative", width: 30, height: 30 }}
//   >
//     <View
//       style={{
//         position: "absolute",
//         top: -6,
//         right: -6,
//         backgroundColor: "#1877F2",
//         minWidth: 18,
//         height: 18,
//         borderRadius: 9,
//         alignItems: "center",
//         justifyContent: "center",
//         paddingHorizontal: 4,
//         zIndex: 10,
//       }}
//     >
//       <TextComponent
//         type="semiBoldText"
//         style={{ color: "#fff", fontSize: 11 }}
//       >
//         {localPractices.length}
//       </TextComponent>
//     </View>

//     {/* CART ICON */}
//     <Image
//       source={require("../../../assets/cart.png")}
//       style={{ width: 30, height: 30 }}
//       resizeMode="contain"
//     />
//   </TouchableOpacity>
// </View>

//           <View
//             style={{
//               flexDirection: "row",
//               flexWrap: "wrap",
//               justifyContent: "space-between",
//               paddingHorizontal: 20,
//               marginTop: 20,
//             }}
//           >
//             {localPractices.map((item) => (
//               <Card
//                 key={item.practice_id}
//                 style={{
//                   width: "48%",
//                   backgroundColor: "#F7F0DD",
//                   borderRadius: 10,
//                   padding: 10,
//                   marginBottom: 15,
//                   borderWidth: 1,
//                   borderColor: "#D4A017",
//                   elevation: 3,
//                   position: "relative",
//                 }}
//               >
//                 <Ionicons
//                   name="close-circle"
//                   size={20}
//                   color="#D4A017"
//                   style={{ position: "absolute", top: -18, right: -20 }}
//                   onPress={() => removePractice(item.unified_id)}

//                   // onPress={() =>
//                   //   setLocalPractices((prev) =>
//                   //     prev.filter((x) => x.practice_id !== item.practice_id)
//                   //   )
//                   // }
//                 />
//                 <View
//                   style={{
//                     flexDirection: "row",
//                     alignItems: "center",
//                     justifyContent: "space-between",
//                   }}
//                 >
//                   <View
//                     style={{
//                       flexDirection: "row",
//                       alignItems: "center",
//                       flex: 1,
//                     }}
//                   >
//                     <TextComponent
//                       type="mediumText"
//                       numberOfLines={1}
//                       ellipsizeMode="tail"
//                       style={{
//                         marginLeft: 6,
//                         fontSize: FontSize.CONSTS.FS_13,
//                         color: Colors.Colors.BLACK,
//                         flex: 1,
//                       }}
//                     >
//                       {item.name ||
//                         item.details?.name ||
//                         item?.title || item?.iast || item?.short_text ||
//                         "Practice"}
//                     </TextComponent>
//                   </View>
//                   <Ionicons
//                     name="information-circle-outline"
//                     size={18}
//                     color="#6E5C2E"
//                     style={{ marginLeft: 6 }}
//                     onPress={() => {
//                       const fullData = getRawPracticeObject(item.practice_id, item);
//   // const fullData = getPracticeById(item.practice_id);
//   const detailsData = fullData ? { ...fullData, practice_id: item.practice_id } : item;
//   const categoryItem = initialCategories.find(
//     (c) => c.key === detailsData.category || c.key === item.category
//   );

// setDetailsCategoryItem(
//   categoryItem || initialCategories[0]
// );

//   setDetailsList([detailsData]);
//   setDetailsIndex(0);
//   setShowDetails(true);
// }}
//                   />
//                 </View>
//               </Card>
//             ))}
//           </View>
//           <View
//             style={{
//               marginTop: 20,
//               borderColor: "#CC9B2F",
//               borderWidth: 1,
//               borderRadius: 8,
//               alignItems: "center",
//               marginHorizontal: 16,
//               padding: 18,
//             }}
//           >
//             <TextComponent
//               type="headerSubBoldText"
//               style={{ color: "#282828", textAlign: "center" }}
//             >
//               Ready to expand your practice?
//             </TextComponent>

//             <TextComponent
//               type="subDailyText"
//               style={{ marginTop: 8, textAlign: "center" }}
//             >
//               Discover and add new wellness practices to deepen your journey.
//             </TextComponent>

//             <TouchableOpacity
//             onPress={() => setIsAddMoreScreen(true)}
//               style={{
//                 backgroundColor: "#D4A017",
//                 alignSelf: "center",
//                 padding: 10,
//                 borderRadius: 8,
//                 marginTop: 14,
//               }}
//             >
//               <TextComponent
//                 type="headerSubBoldText"
//                 style={{ color: "#FFFFFF" }}
//                 onPress={() => setIsAddMoreScreen(true)}
//               >
//                 Add More Practice
//               </TextComponent>
//             </TouchableOpacity>


//             <TouchableOpacity
//             onPress={() => {navigation.navigate("CreateOwnPractice")}}
//               style={{
//                 backgroundColor: "#D4A017",
//                 alignSelf: "center",
//                 padding: 10,
//                 borderRadius: 8,
//                 marginTop: 14,
//               }}
//             >
//               <TextComponent
//                 type="headerSubBoldText"
//                 style={{ color: "#FFFFFF" }}
//               >
//                 Create Custom Practice
//               </TextComponent>
//             </TouchableOpacity>
//           </View>
//           <TouchableOpacity
//             style={{
//               backgroundColor: "#D4A017",
//               alignSelf: "center",
//               padding: 10,
//               borderRadius: 8,
//               marginTop: 30,
//               paddingHorizontal: 30,
//             }}
//     onPress={async () => {
//   const token = await AsyncStorage.getItem("access_token");

//   if (!token) {
//     await AsyncStorage.setItem(
//       "pending_tracker_edit_data",
//       JSON.stringify({
//         pendingPractices: localPractices,
//         from: "TrackerEdit",
//       })
//     );
// await AsyncStorage.setItem("resume_tracker_flow", "true");

//     navigation.navigate("Login", {
//       redirect_to: "TrackerEdit",
//       selectedmantra,
//       goToHistory: true,
//     });
//     return;
//   }
//   submitCartToServer(localPractices);
// }}
//           >
//             <TextComponent
//               type="headerSubBoldText"
//               style={{ color: "#FFFFFF" }}
//             >
//               Confirm
//             </TextComponent>
//           </TouchableOpacity>
//         </>
//         </ScrollView>
//       )}
// <LoadingOverlay visible={loading} text="Submitting..." />

//     </SafeAreaView>
//   );
// };

// export default TrackerEdit;

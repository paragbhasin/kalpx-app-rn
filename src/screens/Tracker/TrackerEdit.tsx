/* --- PART 1 START --- */

import { useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import { Card } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import Colors from "../../components/Colors";
import DailyPracticeDetailsCard from "../../components/DailyPracticeDetailsCard";
import FontSize from "../../components/FontSize";
import LoadingButton from "../../components/LoadingButton";
import LoadingOverlay from "../../components/LoadingOverlay";
import TextComponent from "../../components/TextComponent";
import i18n from "../../config/i18n";
import { RootState } from "../../store";
import { submitDailyDharmaSetup } from "../Home/actions";
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
];

const TrackerEdit = ({route}) => {
  const navigation: any = useNavigation();
  const categoryRef = useRef<any>(null);
const selectedmantra = route?.params?.selectedmantra;
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategories[0].key
  );
  const [selectedType, setSelectedType] = useState("mantra");
  const [searchText, setSearchText] = useState("");
  const [isAddMoreScreen, setIsAddMoreScreen] = useState(false);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsList, setDetailsList] = useState([]);
  const [detailsIndex, setDetailsIndex] = useState(0);
  const [detailsCategoryItem, setDetailsCategoryItem] = useState(null);
    const [loading, setLoading] = useState(false);
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const dailyPractice: any = useSelector(
    (state: RootState) => state.dailyPracticeReducer
  );
  const [localPractices, setLocalPractices] = useState([]);

  const allData = i18n.getResourceBundle(i18n.language, "translation");

  const mantraList = useMemo(() => {
    return Object.values(allData)
      .filter(
        (item: any) =>
          item?.category === selectedCategory && item?.id?.startsWith("mantra.")
      )
      .filter((item: any) =>
        item.title?.toLowerCase().includes(searchText.toLowerCase())
      );
  }, [selectedCategory, searchText]);

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
  }, [selectedCategory, searchText]);

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
  }, [selectedCategory, searchText]);

  // --- NORMALIZE FUNCTION ---
const normalizePractice = (p: any) => ({
  ...p,
  id: p?.id || p?.practice_id,        // UI expects id
  practice_id: p?.practice_id || p?.id,
  title: p?.title || p?.name,         // UI expects title
  name: p?.name || p?.title,
  icon: p?.icon || "",              // fallback
  category: p.category || "",  // safe fallback
});

// --- LOAD API PRACTICES + KEEP EXISTING ITEMS ---
useEffect(() => {
  if (dailyPractice?.data?.active_practices) {
    const normalizedAPI = dailyPractice.data.active_practices.map(normalizePractice);

    setLocalPractices((prev) => {
      if (prev.length === 0) {
        return normalizedAPI; // first load → fill UI
      }

      // Merge API + already selected without duplicates
      const merged = [
        ...normalizedAPI,
        ...prev.filter((p) => 
          !normalizedAPI.some((api) => api.practice_id === p.practice_id)
        ),
      ];

      return merged;
    });
  }
}, [dailyPractice?.data?.active_practices]);


// --- ADD selectedmantra AFTER NORMALIZATION ---
useEffect(() => {
  if (selectedmantra) {
    console.log("🔥 Adding selected mantra to TrackerEdit:", selectedmantra);

    const normalized = normalizePractice(selectedmantra);

    setLocalPractices((prev) => {
      const exists = prev.some(
        (p) => p.practice_id === normalized.practice_id
      );
      if (exists) return prev;

      return [...prev, normalized];
    });
  }
}, [selectedmantra]);


//   useEffect(() => {
//   if (selectedmantra) {
//     console.log("🔥 Adding selected mantra to TrackerEdit:", selectedmantra);

//     setLocalPractices(prev => {
//       // Avoid duplicates
//       const exists = prev.some(p => p.practice_id === selectedmantra.practice_id);
//       if (exists) return prev;

//       return [...prev, selectedmantra];
//     });
//   }
// }, [selectedmantra]);


//   useEffect(() => {
//     if (dailyPractice?.data?.active_practices) {
//       setLocalPractices((prev) => {
//         // Prevent overwriting if user already added items
//         if (prev.length === 0) {
//           return dailyPractice.data.active_practices;
//         }
//         return prev;
//       });
//     }
//   }, [dailyPractice?.data?.active_practices]);

  const toggleAddItem = (item) => {
    const exists = localPractices.find((x) => x.id === item.id);

    if (exists) {
      setLocalPractices((prev) => prev.filter((x) => x.id !== item.id));
    } else {
      setLocalPractices((prev) => [...prev, item]);
    }
  };

  const isAdded = (item) => localPractices.some((x) => x.id === item.id);

  const apiPractices = dailyPractice?.data?.active_practices ?? [];

  const recentlyAdded = localPractices.filter(
    (item) => !apiPractices.some((x) => x.id === item.id)
  );

  const submitCartToServer = (practicesList) => {
  console.log("🟦 [API] Preparing payload from list:", practicesList);

  // REMOVE DUPLICATES BY `id`
  const unique = Array.from(
    new Map(practicesList.map((p) => [p.id || p.practice_id, p])).values()
  );

  console.log("🟩 [CART] Unique Items:", unique);

  // BUILD PAYLOAD
  const payload = {
    practices: unique.map((p: any) => ({
      practice_id: p.id || p.practice_id,
      source: p.id?.startsWith("mantra.")
        ? "mantra"
        : p.id?.startsWith("sankalp.")
        ? "sankalp"
        : "library",
      category: p.category || detailsCategoryItem?.name || "",
      name: p.title || p.name || "",
      description: p.description || p.summary || p.meaning || "",
      benefits: p.benefits || [],
    })),
    is_authenticated: true,
    recaptcha_token: "not_available",
  };

  console.log("📦 [PAYLOAD]:", JSON.stringify(payload, null, 2));

  // AUTO SCROLL TO TOP
  try {
    categoryRef.current?.scrollToOffset({ offset: 0, animated: true });
  } catch (err) {
    console.log("⚠ scrollToTop failed, likely not a flatlist");
  }

  setLoading(true);
  dispatch(
    submitDailyDharmaSetup(payload, (res) => {
      setLoading(false);

      if (res.success) {
        console.log("✅ Saved successfully!");

        // Redirect to first tab
        navigation.navigate("TrackerTabs", {
          screen: "Tracker", // Change this to your first tab name
        });
      } else {
        console.log("❌ Error saving:", res.error);
      }
    })
  );
};

const getPracticeById = (practice_id) => {
  try {
    const bundle = i18n.getResourceBundle(i18n.language, "translation");

    if (!bundle) return null;

    // Direct key lookup - because translation keys match practice_id
    return bundle[practice_id] || null;
  } catch (e) {
    console.log("❌ getPracticeById error:", e);
    return null;
  }
};



  const handleCategoryPress = (item, index) => {
    setSelectedCategory(item.key);
    categoryRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.3,
    });
  };



  const SimplePracticeCard = ({ item, categoryItem }) => {
    const added = isAdded(item);

    const displayMeaning =
      item.meaning || item.summary || item.line || item.description;

    return (
      <View style={styles.simpleCard}>
        <View style={{ flex: 1 }}>
          <TextComponent type="mediumText" style={styles.cardTitle}>
            {item.title}
          </TextComponent>

          <TextComponent style={styles.cardSubtitle} numberOfLines={2}>
            {displayMeaning}
          </TextComponent>
        </View>

        <View style={styles.cardRightIcons}>
          <TouchableOpacity onPress={() => toggleAddItem(item)}>
            <Ionicons
              name={added ? "remove-circle" : "add-circle"}
              size={28}
              color={added ? "#C0392B" : "#D4A017"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            // onPress={() =>
            //   navigation.navigate("DailyPracticeDetailSelectedPractice", {
            //     item: categoryItem,
            //     fullList: [item],
            //     startingIndex: 0,
            //     onUpdateSelection: () => {},
            //     isLocked: false,
            //   })
            // }
            onPress={() => {
              setDetailsCategoryItem(categoryItem);
              setDetailsList([item]); // single item list
              setDetailsIndex(0);
              setShowDetails(true); // open card
            }}
            style={{ marginLeft: 14 }}
          >
            <Ionicons
              name="information-circle-outline"
              size={26}
              color="#6E5C2E"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const CartModal = () => (
    <Modal
      isVisible={cartModalVisible}
      onBackdropPress={() => setCartModalVisible(false)}
      onBackButtonPress={() => setCartModalVisible(false)}
      backdropOpacity={0.6}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={400}
      animationOutTiming={350}
      useNativeDriver
    >
      <View style={styles.modalOverlay}>
        <ImageBackground
          source={require("../../../assets/CardBG.png")}
          style={styles.bottomSheet}
          imageStyle={styles.modalBGImage}
        >
          <View style={styles.dragIndicator} />
          <View style={styles.modalHeader}>
            <TextComponent type="headerBoldText" style={{ color: "#282828" }}>
              Your Cart ({localPractices.length})
            </TextComponent>
            <Ionicons
              name="close"
              size={24}
              color="#000"
              onPress={() => setCartModalVisible(false)}
            />
          </View>
          <ScrollView style={{ maxHeight: 400, paddingBottom: 40 }}>
            {apiPractices.length > 0 && (
              <TextComponent type="boldText" style={styles.sectionHeader}>
                Active Practices
              </TextComponent>
            )}
            {apiPractices.map((item, idx) => (
              <Card key={idx} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <TextComponent type="mediumText">{item.name}</TextComponent>
                  <TextComponent style={styles.itemType}>
                    {item.type ?? "Practice"}
                  </TextComponent>
                </View>
              </Card>
            ))}
            <View style={styles.divider} />
            {recentlyAdded.length > 0 && (
              <TextComponent type="boldText" style={styles.sectionHeader}>
                Added Recently
              </TextComponent>
            )}

            {recentlyAdded.map((item, idx) => (
              <Card key={idx} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <TextComponent type="mediumText">{item?.title || item?.iast || item?.short_text}</TextComponent>
                  <TextComponent style={styles.itemType}>
                    {item.id.startsWith("mantra.")
                      ? "Mantra"
                      : item.id.startsWith("sankalp.")
                      ? "Sankalp"
                      : "Practice"}
                  </TextComponent>
                </View>
              </Card>
            ))}
            {apiPractices.length === 0 && recentlyAdded.length === 0 && (
              <TextComponent style={{ textAlign: "center", marginTop: 20 }}>
                No Practices Added
              </TextComponent>
            )}
          </ScrollView>
        </ImageBackground>
      </View>
    </Modal>
  );

  const renderDetailsCard = () => {
    if (!showDetails) return null;
    const item = detailsList[detailsIndex];
    const nextItem = () => {
      const updatedIndex = (detailsIndex + 1) % detailsList.length;
      setDetailsIndex(updatedIndex);
    };
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
            data={item}
            item={detailsCategoryItem}
            onChange={nextItem}
            onBackPress={() => setShowDetails(false)}
            isLocked={true}
          />
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {/* <ScrollView showsVerticalScrollIndicator={false}> */}
      {CartModal()}
      {renderDetailsCard()}
      {isAddMoreScreen ? (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ marginBottom: 50 }}
          >
     {/* HEADER ROW */}
<View
  style={{
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 10,
  }}
>
  {/* BACK ARROW */}
  <TouchableOpacity onPress={() => setIsAddMoreScreen(false)}>
    <Ionicons name="arrow-back" size={26} color="#000" />
  </TouchableOpacity>

  {/* TITLE */}
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

  {/* CART + BADGE */}
  <TouchableOpacity
    onPress={() => setCartModalVisible(true)}
    style={{ position: "relative" }}
  >
    {/* BADGE */}
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

    {/* CART ICON */}
    <Image
      source={require("../../../assets/cart.png")}
      style={{ width: 30, height: 30 }}
      resizeMode="contain"
    />
  </TouchableOpacity>
</View>

            <TextInput
              placeholder="Search"
              placeholderTextColor="#8A8A8A"
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
            />
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
                  <TextComponent type="cardText"
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
                  <TextComponent type="cardText"
                    style={[
                      styles.typeTabText,
                      selectedType === type && styles.typeTabTextSelected,
                    ]}
                  >
                    {type.toUpperCase()}
                  </TextComponent>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.itemsContainer}>
              {(selectedType === "mantra"
                ? mantraList
                : selectedType === "sankalp"
                ? sankalpList
                : practiceList
              ).map((item, idx) => (
                <SimplePracticeCard
                  key={idx}
                  item={item}
                  categoryItem={initialCategories.find(
                    (c) => c.key === selectedCategory
                  )}
                />
              ))}
            </View>
          </ScrollView>
          <View style={styles.bottomButtonContainer}>
            <LoadingButton
              loading={false}
              text="Confirm"
           onPress={() => {
  submitCartToServer(localPractices);
}}
              disabled={false}
              style={styles.button}
              textStyle={styles.buttonText}
              showGlobalLoader={true}
            />
          </View>
        </>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}> 
        <>
      {/* HEADER ROW */}
<View
  style={{
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 10,
  }}
>
  {/* LEFT EMPTY SPACE (to keep title centered) */}
  <View style={{ width: 30 }} />

  {/* CENTER TITLE */}
  <TextComponent
    type="DailyHeaderText"
    style={{
      color: Colors.Colors.BLACK,
      textAlign: "center",
      flex: 1,
    }}
  >
   Your Daily Routine
  </TextComponent>

  {/* RIGHT CART ICON WITH BADGE */}
  <TouchableOpacity
    onPress={() => setCartModalVisible(true)}
    style={{ position: "relative", width: 30, height: 30 }}
  >
    {/* BADGE */}
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

    {/* CART ICON */}
    <Image
      source={require("../../../assets/cart.png")}
      style={{ width: 30, height: 30 }}
      resizeMode="contain"
    />
  </TouchableOpacity>
</View>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              marginTop: 20,
            }}
          >
            {localPractices.map((item) => (
              <Card
                key={item.practice_id}
                style={{
                  width: "48%",
                  backgroundColor: "#F7F0DD",
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 15,
                  borderWidth: 1,
                  borderColor: "#D4A017",
                  elevation: 3,
                  position: "relative",
                }}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color="#D4A017"
                  style={{ position: "absolute", top: -18, right: -20 }}
                  onPress={() =>
                    setLocalPractices((prev) =>
                      prev.filter((x) => x.practice_id !== item.practice_id)
                    )
                  }
                />
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    {/* <TextComponent
                      type="mediumText"
                      style={{
                        fontSize: FontSize.CONSTS.FS_14,
                        color: Colors.Colors.BLACK,
                      }}
                    >
                      {item.icon}
                    </TextComponent> */}
                    <TextComponent
                      type="mediumText"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{
                        marginLeft: 6,
                        fontSize: FontSize.CONSTS.FS_13,
                        color: Colors.Colors.BLACK,
                        flex: 1,
                      }}
                    >
                      {item.name ||
                        item.details?.name ||
                        item?.title || item?.iast || item?.short_text ||
                        "Practice"}
                    </TextComponent>
                  </View>

                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color="#6E5C2E"
                    style={{ marginLeft: 6 }}
                    onPress={() => {
  // 1️⃣ Fetch full details from i18n using practice_id
  const fullData = getPracticeById(item.practice_id);

  // 2️⃣ If nothing found, fallback to API item
  const detailsData = fullData ? { ...fullData, practice_id: item.practice_id } : item;

  // 3️⃣ Fix category if missing
  const categoryItem = initialCategories.find(
    (c) => c.key === detailsData.category || c.key === item.category
  );

  setDetailsCategoryItem(categoryItem);
  setDetailsList([detailsData]);
  setDetailsIndex(0);
  setShowDetails(true);
}}

                    // onPress={() => {
                    //   const categoryItem = initialCategories.find(
                    //     (c) =>
                    //       c.key === item.category || c.key === selectedCategory
                    //   );

                    //   setDetailsCategoryItem(categoryItem);
                    //   setDetailsList([item]);
                    //   setDetailsIndex(0);
                    //   setShowDetails(true);
                    // }}
                  />
                </View>
              </Card>
            ))}
          </View>
          <View
            style={{
              marginTop: 20,
              borderColor: "#CC9B2F",
              borderWidth: 1,
              borderRadius: 8,
              alignItems: "center",
              marginHorizontal: 16,
              padding: 18,
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
              style={{ marginTop: 8, textAlign: "center" }}
            >
              Discover and add new wellness practices to deepen your journey.
            </TextComponent>

            <View
              style={{
                backgroundColor: "#D4A017",
                alignSelf: "center",
                padding: 10,
                borderRadius: 8,
                marginTop: 14,
              }}
            >
              <TextComponent
                type="headerSubBoldText"
                style={{ color: "#FFFFFF" }}
                onPress={() => setIsAddMoreScreen(true)}
              >
                Add More Practice
              </TextComponent>
            </View>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: "#D4A017",
              alignSelf: "center",
              padding: 10,
              borderRadius: 8,
              marginTop: 30,
              paddingHorizontal: 30,
            }}
            onPress={() => {
  submitCartToServer(localPractices);
}}

          >
            <TextComponent
              type="headerSubBoldText"
              style={{ color: "#FFFFFF" }}
            >
              Confirm
            </TextComponent>
          </TouchableOpacity>
        </>
        </ScrollView>
      )}
<LoadingOverlay visible={loading} text="Submitting..." />

    </SafeAreaView>
  );
};

export default TrackerEdit;

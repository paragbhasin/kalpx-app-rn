/* --- PART 1 START --- */

import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { getRawPracticeObject } from "../../utils/getPracticeObjectById";
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
    // ⬅️ Add this at top inside TrackerEdit()
const [selectedCount, setSelectedCount] = useState(null);

  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const resumeData = route?.params?.resumeData;

console.log("resumeData :::", resumeData);

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

const normalizePractice = (p: any) => ({
  ...p,
  id: p?.id || p?.practice_id,       
  practice_id: p?.practice_id || p?.id,
  title: p?.title || p?.name || p?.short_text,      
  name: p?.name || p?.title || p?.tooltip,
  icon: p?.icon || "",              
  category: p.category || "",  
});

const mergedPractices = useMemo(() => {
  const apiList =
    dailyPractice?.data?.active_practices?.map(normalizePractice) || [];

  // Support both possible structures
const resumePractices =
  resumeData?.pendingPractices ||
  resumeData?.payload?.pendingPractices ||
  [];

const resumeList = resumePractices.map(normalizePractice);



  // const resumeList =
  //   resumeData?.payload?.pendingPractices?.map(normalizePractice) || [];

  const selectedList =
    selectedmantra ? [normalizePractice(selectedmantra)] : [];

  const map = new Map();

  apiList.forEach(p => map.set(p.practice_id, p));
  resumeList.forEach(p => map.set(p.practice_id, p));
  selectedList.forEach(p => map.set(p.practice_id, p));

  return Array.from(map.values());
}, [dailyPractice, resumeData, selectedmantra]);

console.log("🟪 Merged Practices:", JSON.stringify(mergedPractices));

useEffect(() => {
  setLocalPractices(mergedPractices);
}, [mergedPractices]);

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

  // const recentlyAdded = localPractices.filter(
  //   (item) => !apiPractices.some((x) => x.id === item.id)
  // );

  const recentlyAdded = localPractices.filter(
  (item) =>
    !apiPractices.some((x) => x.practice_id === item.practice_id)
);


  const submitCartToServer = (practicesList) => {
  console.log("🟦 [API] Preparing payload from list:", practicesList);
  const unique = Array.from(
    new Map(practicesList.map((p) => [p.id || p.practice_id, p])).values()
  );

  console.log("🟩 [CART] Unique Items:", unique);
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
      reps : p.reps || null
    })),
    is_authenticated: true,
    recaptcha_token: "not_available",
  };
  console.log("📦 [PAYLOAD]:", JSON.stringify(payload, null, 2));
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
        navigation.navigate("TrackerTabs", {
          screen: "Tracker",
        });
      } else {
        console.log("❌ Error saving:", res.error);
      }
    })
  );
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
  const selectedCat = categoryItem || initialCategories[0];

  setDetailsCategoryItem({
    ...selectedCat,
    key: selectedCat.key   // ensure key ALWAYS exists
  });

  setDetailsList([item]);
  setDetailsIndex(0);
  setShowDetails(true);
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

  // ⭐ Always hydrate full practice object
  const raw = detailsList[detailsIndex];
  const item = getRawPracticeObject(raw?.practice_id, raw);

  const nextItem = () => {
    const updatedIndex = (detailsIndex + 1) % detailsList.length;
    setDetailsIndex(updatedIndex);
  };

  const isEditMode = localPractices.some(
    (p) => p.practice_id === item.practice_id
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
              setLocalPractices((prev) => {
                const exists = prev.some(
                  (p) => p.practice_id === updatedItem.practice_id
                );
                if (exists) return prev;
                return [...prev, updatedItem];
              });
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


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {CartModal()}
      {renderDetailsCard()}
      {isAddMoreScreen ? (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ marginBottom: 50 }}
          >
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
        onPress={async () => {
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
    type="DailyHeaderText"
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
                      const fullData = getRawPracticeObject(item.practice_id, item);
  // const fullData = getPracticeById(item.practice_id);
  const detailsData = fullData ? { ...fullData, practice_id: item.practice_id } : item;
  const categoryItem = initialCategories.find(
    (c) => c.key === detailsData.category || c.key === item.category
  );

setDetailsCategoryItem(
  categoryItem || initialCategories[0]
);

  setDetailsList([detailsData]);
  setDetailsIndex(0);
  setShowDetails(true);
}}
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
    onPress={async () => {
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

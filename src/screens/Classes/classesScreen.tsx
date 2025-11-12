import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import BookingFilterModal from "../../components/BookingsFilterModal";
import ClassBookingCard from "../../components/ClassBookingCard";
import ClassCancelModal from "../../components/ClassCancelModal";
import ClassDetailsModal from "../../components/ClassDetailsModal";
import ClassEventCard from "../../components/ClassEventCard";
import Colors from "../../components/Colors";
import FilterModal from "../../components/FilterModal";
import Header from "../../components/Header";
import TextComponent from "../../components/TextComponent";
import { RootState } from "../../store";
import {
  cancelBooking,
  classesBookingsList,
  classesExploreList,
  fetchFilteredBookings,
  filteredClassesExploreList,
  searchBookings,
  searchClasses,
} from "./actions";

export default function ClassesScreen({ navigation }) {
  const { t } = useTranslation();
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  // ========== REDUX STATES ==========
  const exploreState = useSelector((state: RootState) => state.classesExploreReducer);
  const bookingsState = useSelector((state: RootState) => state.classesBookingsReducer);
  const searchExploreState = useSelector((state: RootState) => state.searchClassesReducer);
  const searchBookingsState = useSelector((state: RootState) => state.searchBookingsReducer);
  const filterExploreState = useSelector((state: RootState) => state.classesFilterExploreReducer);
  const filterBookingsState = useSelector((state: RootState) => state.myBookingsFilterReducer);

  // ========== LOCAL STATES ==========
  const [activeTab, setActiveTab] = useState<"ExploreClasses" | "MyBookings">("ExploreClasses");
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({});
  const [closeFilterModal, setCloseFilterModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [tutorId, setTutorId] = useState<any>(null);
  const [explorePage, setExplorePage] = useState(1);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  // ✅ RESET FUNCTION (Fix for your bug)
  const resetToDefaultList = () => {
    setIsSearching(false);
    setIsFiltering(false);
    setSearchText("");
    setFilters({});
    setExplorePage(1);
    setBookingsPage(1);

    if (activeTab === "ExploreClasses") {
      dispatch(classesExploreList(1, 10));
    } else {
      dispatch(classesBookingsList(1, 10));
    }

    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  // ========== SEARCH (Smooth 2s delay logic) ==========
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchText.trim()) {
        setIsSearching(true);
        setIsFiltering(false);

        if (activeTab === "ExploreClasses") {
          dispatch(searchClasses(searchText, 1, 10));
        } else {
          dispatch(searchBookings(searchText, 1, 10));
        }
      } else {
        resetToDefaultList(); // reset if cleared
      }
    }, 2000); // Wait 2s after last keystroke

    return () => clearTimeout(delayDebounce);
  }, [searchText, activeTab]);

  const handleSearchInput = (text: string) => {
    setSearchText(text);
  };

  // ========== FILTER ==========
  const handleFilterApply = (selectedFilters: any) => {
    setFilters(selectedFilters);
    setIsFiltering(true);
    setIsSearching(false);

    if (activeTab === "ExploreClasses") {
      dispatch(filteredClassesExploreList(selectedFilters, 1, 10));
    } else {
      dispatch(fetchFilteredBookings(selectedFilters, 1, 10));
    }

    setCloseFilterModal(false);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  // ========== PAGINATION / REFRESH ==========
  const handleLoadMore = () => {
    if (activeTab === "ExploreClasses" && exploreState.hasMore && !exploreState.loading) {
      const nextPage = explorePage + 1;
      setExplorePage(nextPage);
      dispatch(classesExploreList(nextPage, 10));
    } else if (activeTab === "MyBookings" && bookingsState.hasMore && !bookingsState.loading) {
      const nextPage = bookingsPage + 1;
      setBookingsPage(nextPage);
      dispatch(classesBookingsList(nextPage, 10));
    }
  };

  const handleRefresh = () => {
    resetToDefaultList(); // unified refresh
  };

  // ========== CANCEL BOOKING ==========
  const handleCancelBooking = (data: any) => {
    if (!tutorId) return;
    dispatch(
      cancelBooking(tutorId, data, (res) => {
        if (res.success) {
          setShowCancel(false);
          dispatch(classesBookingsList(1, 10));
        }
      })
    );
  };

  // ========== INITIAL LOAD ==========
  useEffect(() => {
    dispatch(classesExploreList(1, 10));
    dispatch(classesBookingsList(1, 10));
  }, [dispatch]);

  useEffect(() => {
    resetToDefaultList(); // reset when switching tabs
  }, [activeTab]);

  // ========== RENDER ITEMS ==========
  const renderItem = ({ item }: any) => {
    if (activeTab === "ExploreClasses") {
      return (
        <ClassEventCard
          imageUrl={
            item?.cover_media?.key
              ? `https://dev.kalpx.com/${item.cover_media.key}`
              : null
          }
          title={item?.title}
          description={item?.description}
          duration={item?.pricing?.per_person?.session_length_min}
          price={item?.pricing?.per_person?.amount?.app}
          onViewDetails={() =>
            navigation.navigate("ClassTutorDetailsScreen", { data: item })
          }
          onBookNow={() =>
            navigation.navigate("ClassBookingScreen", { data: item, reschedule: false })
          }
          tutor={item?.tutor}
        />
      );
    } else {
      return (
        <ClassBookingCard
          imageUrl={
            item?.offering?.cover_media?.key
              ? `https://dev.kalpx.com/${item.offering.cover_media.key}`
              : null
          }
          title={item?.offering?.title}
          start={item?.start}
          end={item?.end}
          link={item?.link}
          price={item?.amount}
          status={item?.status}
          onDetails={() => {
            setDetails(item);
            setShowDetails(true);
          }}
          onCancel={() => {
            setTutorId(item?.offering?.id);
            setShowCancel(true);
          }}
          onReschedule={() =>
            navigation.navigate("ClassBookingScreen", { data: item, reschedule: true })
          }
        />
      );
    }
  };

  // ========== FINAL DATA SELECTION ==========
  const displayedData =
    activeTab === "ExploreClasses"
      ? isSearching
        ? searchExploreState.data
        : isFiltering
        ? filterExploreState.data
        : exploreState.data
      : isSearching
      ? searchBookingsState.data
      : isFiltering
      ? filterBookingsState.data
      : bookingsState.data;

  const isLoading =
    activeTab === "ExploreClasses"
      ? exploreState.loading ||
        searchExploreState.loading ||
        filterExploreState.loading
      : bookingsState.loading ||
        searchBookingsState.loading ||
        filterBookingsState.loading;

  // ========== RENDER UI ==========
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Colors.white }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.Colors.header_bg} />

      <Header />

      {/* Tabs */}
      <View
        style={{
          marginTop: 10,
          marginHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View
            style={{
              backgroundColor: "#D9D9D9",
              alignSelf: "flex-start",
              padding: 10,
              borderRadius: 25,
            }}
          >
            <Image
              source={require("../../../assets/C_Arrow_back.png")}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>

        <View
          style={{
            flex: 1,
            backgroundColor: "#EBEBEB",
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
            padding: 8,
            borderRadius: 4,
            marginLeft: 15,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setActiveTab("ExploreClasses");
              flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
            }}
            style={{
              backgroundColor:
                activeTab === "ExploreClasses"
                  ? Colors.Colors.Yellow
                  : "transparent",
              padding: 6,
              borderRadius: 6,
              paddingHorizontal: 12,
            }}
          >
            <TextComponent type="headerText">Explore Classes</TextComponent>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setActiveTab("MyBookings");
              flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
            }}
            style={{
              backgroundColor:
                activeTab === "MyBookings"
                  ? Colors.Colors.Yellow
                  : "transparent",
              padding: 6,
              borderRadius: 6,
              paddingHorizontal: 12,
            }}
          >
            <TextComponent type="headerText">My Bookings</TextComponent>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search + Filter */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 20,
          marginHorizontal: 16,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.Colors.grey,
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 8,
            marginRight: 12,
            height: 48,
          }}
        >
          <Image
            source={require("../../../assets/C_Vector.png")}
            style={{ width: 20, height: 20, marginHorizontal: 10 }}
          />
          <TextInput
          allowFontScaling={false}
            placeholder="Search by tag, title, Tutor..."
            style={{ flex: 1, fontSize: 14 }}
            value={searchText}
            onChangeText={handleSearchInput}
          />
        </View>

        <TouchableOpacity onPress={() => setCloseFilterModal(true)}>
          <Image
            source={require("../../../assets/C_Filter.png")}
            style={{ width: 24, height: 24 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        ref={flatListRef}
        data={displayedData}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item?.id || index}`}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          isLoading ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null
        }
        ListEmptyComponent={
          <Text  allowFontScaling={false} style={{ textAlign: "center", marginTop: 30 }}>
            {activeTab === "ExploreClasses"
              ? "No classes available."
              : "You have no bookings yet."}
          </Text>
        }
        refreshing={isLoading}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      />

      {/* Modals */}
      <ClassDetailsModal
        visible={showDetails}
        onClose={() => setShowDetails(false)}
        details={{
          className: details?.offering?.title || "",
          status: details?.status || "",
          start: details?.start || "",
          end: details?.end || "",
          price: details?.amount?.toString() || "",
          trial: details?.trial_class ? "Yes" : "No",
          groupSize: details?.group_size?.toString() || "",
          note: details?.notes || "",
        }}
      />

      <ClassCancelModal
        visible={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirmCancel={handleCancelBooking}
      />

      {activeTab === "ExploreClasses" ? (
        <FilterModal
          visible={closeFilterModal}
          onClose={() => setCloseFilterModal(false)}
          onApply={handleFilterApply}
          onClear={resetToDefaultList}
        />
      ) : (
        <BookingFilterModal
          visible={closeFilterModal}
          onClose={() => setCloseFilterModal(false)}
          onApply={handleFilterApply}
          onClear={resetToDefaultList}
        />
      )}
    </SafeAreaView>
  );
}

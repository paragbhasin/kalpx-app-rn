import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { useUserLocation } from "../../components/useUserLocation";
import { BASE_IMAGE_URL } from "../../Networks/baseURL";
import { RootState } from "../../store";
import {
  cancelBooking,
  classesBookingsList,
  classesExploreList,
  filteredClassesExploreList,
  searchBookings,
  searchClasses
} from "./actions";

export default function ClassesScreen({ navigation, route }) {
  const { t } = useTranslation();
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const flatListRef = useRef<FlatList>(null);

  const { locationData } = useUserLocation();
  const userTimezone = locationData?.timezone || "Asia/Kolkata";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ⭐ API subject for all calls
  const [subjectQuery, setSubjectQuery] = useState("");

  // UI-only highlight
  const [selectedSubject, setSelectedSubject] = useState("All");

  const [selectedBookingStatus, setSelectedBookingStatus] = useState<string[]>([
    "requested",
    "confirmed",
  ]);

  const subjectOptions = [
    { value: "All", label: "All" },
    { value: "Mantra Chanting", label: "Mantra Chanting" },
    { value: "Sanatan Teachings", label: "Sanatan Teachings" },
    { value: "Everyday Vedanta", label: "Everyday Vedanta" },
    { value: "Yoga", label: "Yoga" },
    { value: "Indian Classical Dance", label: "Indian Classical Dance" },
    { value: "Indian Classical Music", label: "Indian Classical Music" },
    { value: "Vedas & Upanishads", label: "Vedas & Upanishads" },
  ];

  const statusData = [
    { label: "Requested", value: "requested" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Completed", value: "completed" },
    { label: "Rejected", value: "rejected" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Pending", value: "pending" },
  ];

  

  const fetchLoading =
    exploreState.loading ||
    searchExploreState.loading ||
    filterExploreState.loading;

  // ========== LOGIN CHECK ==========
  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("access_token");
      setIsLoggedIn(!!token);
    };
    checkLogin();
  }, []);

  // ========== INITIAL LOAD ==========
  useEffect(() => {
    setSubjectQuery(""); // "All"
    dispatch(classesExploreList(1, 10, "", userTimezone, (res) => {
    // console.log("📡 ExploreClasses API Response:", res);
  })
);
  }, []);

  // 🔥 When coming from payment, open MyBookings tab
useEffect(() => {
  if (route?.params?.openTab === "MyBookings") {
    setActiveTab("MyBookings");

    // Make sure we load data
    setBookingsPage(1);
    fetchMyBookings(1);

    // Clear param after using it
    navigation.setParams({ openTab: null });
  }
}, [route?.params?.openTab]);


  // ========== SWITCH TABS ==========
  useEffect(() => {
    if (activeTab === "MyBookings") {
      setSelectedBookingStatus(["requested", "confirmed"]);
      setBookingsPage(1);
      fetchMyBookings(1);
    } else {
      resetToDefaultList();
    }
  }, [activeTab]);

  // =============================
  // ⭐ RESET LIST (FINAL VERSION)
  // =============================
  const resetToDefaultList = () => {
    setIsSearching(false);
    setIsFiltering(false);
    setSearchText("");
    setFilters({});
    setExplorePage(1);

    if (activeTab === "ExploreClasses") {
      const subjectToSend = subjectQuery;

      // Clear old Explore list
      dispatch({
        type: "EXPLORE_SUCCESS",
        payload: { data: [], page: 1, hasMore: true },
      });

      dispatch(classesExploreList(1, 10, subjectToSend, userTimezone, (res) => {
    // console.log("📡 ExploreClasses API Response:", res);
  })
);
    }

    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  };


  useEffect(() => {
  const delayDebounce = setTimeout(() => {
    if (searchText.trim()) {
      setIsSearching(true);
      setIsFiltering(false);

      if (activeTab === "ExploreClasses") {
           dispatch(searchClasses(searchText, 1, 10, subjectQuery, (res) => {
    // console.log("📡 ExploreClasses API Response:", res);
  })
);
      } else {
        dispatch(searchBookings(searchText, 1, 10));
      }
    } else if (searchText === "") {
      // reset ONLY when clearing search, not on subject change
      if (!isFiltering) {
        resetToDefaultList();
      }
    }
  }, 600);

  return () => clearTimeout(delayDebounce);
}, [searchText, activeTab]);   // ❌ removed subjectQuery


  // =============================
  // SEARCH (uses subjectQuery)
  // =============================
//   useEffect(() => {
//     const delayDebounce = setTimeout(() => {
//       if (searchText.trim()) {
//         setIsSearching(true);
//         setIsFiltering(false);

//         if (activeTab === "ExploreClasses") {
//           dispatch(searchClasses(searchText, 1, 10, subjectQuery, (res) => {
//     // console.log("📡 ExploreClasses API Response:", res);
//   })
// );
//         } else {
//           dispatch(searchBookings(searchText, 1, 10));
//         }
//       } else {
//         resetToDefaultList();
//       }
//     }, 800);

//     return () => clearTimeout(delayDebounce);
//   }, [searchText, activeTab, subjectQuery]);

  // =============================
  // FILTER APPLY
  // =============================

  const handleFilterApply = (selectedFilters: any) => {
  setFilters(selectedFilters);
if (activeTab === "ExploreClasses") {
  setIsFiltering(true);
}
  setIsSearching(false);

  if (activeTab === "ExploreClasses") {
      dispatch(filteredClassesExploreList(selectedFilters, 1, 10, subjectQuery, (res) => {
    // console.log("📡 ExploreClasses API Response:", res);
  })
);
  }

  if (activeTab === "MyBookings") {
    const { status } = selectedFilters;

    setBookingsPage(1);

    if (!status || status === "" || status === "all") {
      setSelectedBookingStatus(["requested", "confirmed"]);
      fetchMyBookings(1);
    } else {
      setSelectedBookingStatus([status]);
      dispatch(classesBookingsList(1, 10, status, userTimezone));
    }
  }

  // 🔥 Common actions
  setCloseFilterModal(false);
  flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
};

//   const handleFilterApply = (selectedFilters: any) => {
//     setFilters(selectedFilters);
//     setIsFiltering(true);
//     setIsSearching(false);

//     if (activeTab === "ExploreClasses") {
//       dispatch(filteredClassesExploreList(selectedFilters, 1, 10, subjectQuery, (res) => {
//     // console.log("📡 ExploreClasses API Response:", res);
//   })
// );
//     } 
//     if (activeTab === "MyBookings") {
//   const { status } = selectedFilters;

//   setBookingsPage(1);

//   if (!status || status === "" || status === "all") {
//     setSelectedBookingStatus(["requested", "confirmed"]);
//     fetchMyBookings(1);
//   } else {
//     setSelectedBookingStatus([status]);
//     dispatch(classesBookingsList(1, 10, status, userTimezone));
//   }

//   setCloseFilterModal(false);
//   flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
//   return;
// }


//     setCloseFilterModal(false);
//     flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
//   };

  

  // =============================
  // PAGINATION
  // =============================
  const handleLoadMore = () => {
    if (
      activeTab === "ExploreClasses" &&
      exploreState.hasMore &&
      !exploreState.loading
    ) {
      const nextPage = explorePage + 1;
      setExplorePage(nextPage);

      dispatch(classesExploreList(nextPage, 10, subjectQuery, userTimezone, (res) => {
    // console.log("📡 ExploreClasses API Response:", res);
  })
);
      return;
    }

    if (
      activeTab === "MyBookings" &&
      bookingsState.hasMore &&
      !bookingsState.loading
    ) {
      const nextPage = bookingsPage + 1;
      setBookingsPage(nextPage);

      Promise.all([
        dispatch(classesBookingsList(nextPage, 10, "requested", userTimezone)),
        dispatch(classesBookingsList(nextPage, 10, "confirmed", userTimezone)),
      ]);

      return;
    }
  };

  // =============================
  // Fetch bookings (requested + confirmed)
  // =============================
const fetchMyBookings = async (page = 1) => {
  let allResults: any[] = [];

  const statuses = ["requested", "confirmed"];

  for (const status of statuses) {
    await dispatch(
      classesBookingsList(page, 10, status, userTimezone, (res) => {
        console.log("📌 API =>", status, res.data);
        if (res.success && res.data) {
          allResults.push(...res.data);
        }
      })
    );
  }

  // remove duplicates
  allResults = allResults.filter(
    (item, index, arr) => arr.findIndex((x) => x.id === item.id) === index
  );

  // sort
  allResults.sort(
    (a, b) =>
      new Date(b.updated_at).getTime() -
      new Date(a.updated_at).getTime()
  );

  console.log("📌 Final merged bookings:", allResults);

  dispatch({
    type: "BOOKINGS_SUCCESS", // 🔥 FIXED
    payload: {
      data: allResults,
      hasMore: false,
      page,
    },
  });
};



  // =============================
  // CANCEL BOOKING
  // =============================
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

  // =============================
  // RENDER ITEMS
  // =============================
  const renderItem = ({ item }: any) => {
    if (activeTab === "ExploreClasses") {
      return (
        <ClassEventCard
          imageUrl={
            item?.cover_media?.key
              ? `${BASE_IMAGE_URL}/${item.cover_media.key}`
              : null
          }
          title={item?.title}
          description={item?.subtitle}
          duration={item?.pricing?.trial?.session_length_min ? item?.pricing?.trial?.session_length_min : item?.pricing?.per_person?.session_length_min}
          // price={item?.pricing?.per_person?.amount?.web}
          price={
  (item?.pricing?.type === "per_group"
    ? item?.pricing?.per_group?.amount?.web
    : item?.pricing?.per_person?.amount?.web) ?? 0
}
          onViewDetails={() =>
            navigation.navigate("ClassTutorDetailsScreen", { data: item })
          }
          onBookNow={() =>
            navigation.navigate("ClassBookingScreen", { data: item, reschedule: false })
          }
          tutor={item?.tutor}
            currency={item?.pricing?.currency}
  trailenabled={item?.pricing?.trial?.enabled}
  trailAmt={item?.pricing?.trial?.amount}
        />
      );
    }

    // My Bookings Card
    return (
      <ClassBookingCard
        imageUrl={
          item?.offering?.cover_media?.key
            ? `${BASE_IMAGE_URL}/${item.offering.cover_media.key}`
            : null
        }
        joinUrl={item.join_url}
        title={item?.offering?.title}
        start={item?.start}
        end={item?.end}
        link={item?.join_url}
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
  };

  let rawData =
  activeTab === "ExploreClasses"
    ? isSearching
      ? searchExploreState.data
      : isFiltering
      ? filterExploreState.data
      : exploreState.data
    : isSearching
    ? searchBookingsState.data
    : bookingsState.data;   // 🔥 ALWAYS USE THIS FOR MyBookings


// let rawData =
//   activeTab === "ExploreClasses"
//     ? isSearching
//       ? searchExploreState.data
//       : isFiltering
//       ? filterExploreState.data
//       : exploreState.data
//     : isSearching
//     ? searchBookingsState.data
//     : isFiltering
//     ? filterBookingsState.data
//     : bookingsState.data;

// 🚫 Filter out cards where available_slots is empty
const displayedData =
  activeTab === "ExploreClasses"
    ? rawData.filter(item => item?.available_slots && item.available_slots.length > 0)
    : rawData;


  const isLoading =
    activeTab === "ExploreClasses"
      ? exploreState.loading ||
        searchExploreState.loading ||
        filterExploreState.loading
      : bookingsState.loading ||
        searchBookingsState.loading ||
        filterBookingsState.loading;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Colors.white }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.Colors.header_bg} />
      <Header />

      {/* Tabs */}
      <View style={{ marginTop: 10, marginHorizontal: 16, flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity onPress={() => navigation.navigate('HomePage', { screen: 'Home'})}>
          <View style={{ backgroundColor: "#D9D9D9", padding: 10, borderRadius: 25 }}>
            <Image source={require("../../../assets/C_Arrow_back.png")} style={{ width: 20, height: 20 }} />
          </View>
        </TouchableOpacity>

        <View style={{
          flex: 1,
          backgroundColor: "#EBEBEB",
          flexDirection: "row",
          justifyContent: "space-evenly",
          alignItems: "center",
          padding: 8,
          borderRadius: 4,
          marginLeft: 15,
        }}>
          <TouchableOpacity
            onPress={() => {
              setActiveTab("ExploreClasses");
              flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
            }}
            style={{
              backgroundColor:
                activeTab === "ExploreClasses" ? Colors.Colors.Yellow : "transparent",
              padding: 6,
              borderRadius: 6,
              paddingHorizontal: 12,
            }}
          >
            <TextComponent type="headerSubBoldText" style={{
              color: activeTab === "MyBookings" ? Colors.Colors.BLACK : Colors.Colors.white
            }}>
              Explore Classes
            </TextComponent>
          </TouchableOpacity>

          {isLoggedIn && (
            <TouchableOpacity
              onPress={() => {
                setActiveTab("MyBookings");
                flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
              }}
              style={{
                backgroundColor:
                  activeTab === "MyBookings" ? Colors.Colors.Yellow : "transparent",
                padding: 6,
                borderRadius: 6,
                paddingHorizontal: 12,
              }}
            >
              <TextComponent type="headerSubBoldText" style={{
                color: activeTab === "MyBookings" ? Colors.Colors.white : Colors.Colors.BLACK
              }}>
                My Bookings
              </TextComponent>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search */}
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 20, marginHorizontal: 16 }}>
        <View style={{
          flex: 1,
          backgroundColor: Colors.Colors.grey,
          flexDirection: "row",
          alignItems: "center",
          borderRadius: 8,
          marginRight: 12,
          height: 48,
        }}>
          <Image
            source={require("../../../assets/C_Vector.png")}
            style={{ width: 20, height: 20, marginHorizontal: 10 }}
          />
          <TextInput
            allowFontScaling={false}
            placeholder="Search by tag, title, Tutor..."
            placeholderTextColor={Colors.Colors.Light_black}
            style={{ flex: 1, fontSize: 14 }}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <TouchableOpacity onPress={() => setCloseFilterModal(true)}>
          <Image source={require("../../../assets/C_Filter.png")} style={{ width: 24, height: 24 }} />
        </TouchableOpacity>
      </View>

      {/* Subject Chips */}
      {activeTab === "ExploreClasses" && (
        <View style={{ marginVertical: 10 }}>
          <FlatList
            data={subjectOptions}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.value}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => {
              const isSelected = selectedSubject === item.value;

              return (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedSubject(item.value);

                    const subjectToSend = item.value === "All" ? "" : item.value;
                    setSubjectQuery(subjectToSend);

                    setExplorePage(1);

                    dispatch({
                      type: "EXPLORE_SUCCESS",
                      payload: { data: [], page: 1, hasMore: true },
                    });

                    dispatch(classesExploreList(1, 10, subjectToSend, userTimezone, (res) => {
    // console.log("📡 ExploreClasses API Response:", res);
  })
);
                  }}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    backgroundColor: isSelected ? Colors.Colors.Yellow : "#EEE",
                    borderRadius: 20,
                    marginRight: 10,
                    minWidth: 70,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TextComponent
  type="cardText"
  style={{
    color: isSelected ? Colors.Colors.white : Colors.Colors.Light_black,
  }}
>
  {item.label}
</TextComponent>

                  {/* {fetchLoading && isSelected ? (
                    <ActivityIndicator size="small" color={isSelected ? Colors.Colors.white : Colors.Colors.Light_black} />
                  ) : (
                    <TextComponent type="cardText" style={{
                      color: isSelected ? Colors.Colors.white : Colors.Colors.Light_black
                    }}>
                      {item.label}
                    </TextComponent>
                  )} */}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      {/* STATUS Chips */}
      {activeTab === "MyBookings" && (
        <View style={{ marginTop: 10 }}>
          <FlatList
            data={statusData}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.value}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => {
              const isSelected = selectedBookingStatus.includes(item.value);
              return (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedBookingStatus([item.value]);
                    setBookingsPage(1);

                    dispatch(classesBookingsList(1, 10, item.value, userTimezone));
                  }}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    backgroundColor: isSelected ? Colors.Colors.Yellow : "#EEE",
                    borderRadius: 20,
                    marginRight: 10,
                    minWidth: 90,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TextComponent
                    type="cardText"
                    style={{
                      color: isSelected ? Colors.Colors.white : Colors.Colors.Light_black,
                    }}
                  >
                    {item.label}
                  </TextComponent>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      {/* DATA LIST */}
      <FlatList
        ref={flatListRef}
        data={displayedData}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item?.id || index}`}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
    ListEmptyComponent={
  isLoading ? (
    <ActivityIndicator style={{ marginTop: 40 }} size="large" />
  ) : (
    <Text
      allowFontScaling={false}
      style={{ textAlign: "center", marginTop: 30 }}
    >
      {activeTab === "ExploreClasses"
        ? "No classes available."
        : "You have no bookings yet."}
    </Text>
  )
}
        refreshing={isLoading}
        onRefresh={resetToDefaultList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      />

      {/* MODALS */}
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











// import AsyncStorage from "@react-native-async-storage/async-storage";
// import React, { useEffect, useRef, useState } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   ActivityIndicator,
//   FlatList,
//   Image,
//   SafeAreaView,
//   StatusBar,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { useDispatch, useSelector } from "react-redux";
// import { AnyAction } from "redux";
// import { ThunkDispatch } from "redux-thunk";
// import BookingFilterModal from "../../components/BookingsFilterModal";
// import ClassBookingCard from "../../components/ClassBookingCard";
// import ClassCancelModal from "../../components/ClassCancelModal";
// import ClassDetailsModal from "../../components/ClassDetailsModal";
// import ClassEventCard from "../../components/ClassEventCard";
// import Colors from "../../components/Colors";
// import FilterModal from "../../components/FilterModal";
// import Header from "../../components/Header";
// import TextComponent from "../../components/TextComponent";
// import { useUserLocation } from "../../components/useUserLocation";
// import { BASE_IMAGE_URL } from "../../Networks/baseURL";
// import { RootState } from "../../store";
// import {
//   cancelBooking,
//   classesBookingsList,
//   classesExploreList,
//   filteredClassesExploreList,
//   searchBookings,
//   searchClasses
// } from "./actions";



// export default function ClassesScreen({ navigation ,route}) {
//   const { t } = useTranslation();
//   const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

//   const { locationData } = useUserLocation();
// const userTimezone = locationData?.timezone || "Asia/Kolkata";

//   // ========== REDUX STATES ==========
//   const exploreState = useSelector((state: RootState) => state.classesExploreReducer);
//   const bookingsState = useSelector((state: RootState) => state.classesBookingsReducer);
//   const searchExploreState = useSelector((state: RootState) => state.searchClassesReducer);
//   const searchBookingsState = useSelector((state: RootState) => state.searchBookingsReducer);
//   const filterExploreState = useSelector((state: RootState) => state.classesFilterExploreReducer);
//   const filterBookingsState = useSelector((state: RootState) => state.myBookingsFilterReducer);

//   // ========== LOCAL STATES ==========
//   const [activeTab, setActiveTab] = useState<"ExploreClasses" | "MyBookings">("ExploreClasses");
//   const [searchText, setSearchText] = useState("");
//   const [filters, setFilters] = useState({});
//   const [closeFilterModal, setCloseFilterModal] = useState(false);
//   const [showDetails, setShowDetails] = useState(false);
//   const [details, setDetails] = useState<any>(null);
//   const [showCancel, setShowCancel] = useState(false);
//   const [tutorId, setTutorId] = useState<any>(null);
//   const [explorePage, setExplorePage] = useState(1);
//   const [bookingsPage, setBookingsPage] = useState(1);
//   const [isSearching, setIsSearching] = useState(false);
//   const [isFiltering, setIsFiltering] = useState(false);
//     const [isLoggedIn, setIsLoggedIn] = useState(false);
// const [selectedSubject, setSelectedSubject] = useState("All");
// const [selectedBookingStatus, setSelectedBookingStatus] = useState<string[]>([
//   "requested",
//   "confirmed",
// ]);



// const statusData = [
//   { label: "Requested", value: "requested" },
//   { label: "Confirmed", value: "confirmed" },
//   { label: "Completed", value: "completed" },
//   { label: "Rejected", value: "rejected" },
//   { label: "Cancelled", value: "cancelled" },
//   { label: "Pending", value: "pending" },
// ];



// const subjectOptions = [
//   { value: "All", label: "All" },
//   { value: "Yoga", label: "Yoga" },
//   { value: "Indian Classical Music", label: "Indian Classical Music" },
//   { value: "Indian Classical Dance", label: "Indian Classical Dance" },
//   { value: "Mantra Chanting", label: "Mantra Chanting" },
//   { value: "Vedas & Upanishads", label: "Vedas & Upanishads" },
//   { value: "Sanatan Teachings", label: "Sanatan Teachings" },
//   { value: "Everyday Vedanta", label: "Everyday Vedanta" },
// ];

// const fetchLoading =
//   exploreState.loading ||
//   searchExploreState.loading ||
//   filterExploreState.loading;

//   useEffect(() => {
//   if (route?.params?.openTab === "MyBookings") {
//     setActiveTab("MyBookings");
//   }
// }, [route?.params?.openTab]);




//   const flatListRef = useRef<FlatList>(null);
  
//       useEffect(() => {
//       const checkLogin = async () => {
//         try {
//           const token = await AsyncStorage.getItem("access_token");
//           setIsLoggedIn(!!token);
//         } catch (error) {
//           console.log("Error checking login:", error);
//         }
//       };
//       checkLogin();
//     }, []);


//       const loadDefaultBookingStatuses = async () => {
//     let finalResults: any[] = [];

//     // 1️⃣ load requested
//     await dispatch(
//       classesBookingsList(1, 10, "requested", userTimezone, (res) => {
//         if (res.success) {
//           finalResults = [...finalResults, ...res.data];
//         }
//       })
//     );

//     // 2️⃣ load confirmed
//     await dispatch(
//       classesBookingsList(1, 10, "confirmed", userTimezone, (res) => {
//         if (res.success) {
//           finalResults = [...finalResults, ...res.data];
//         }
//       })
//     );

//     // Remove duplicates & sort by updated_at
//     finalResults = finalResults
//       .filter((v, i, arr) => arr.findIndex((a) => a.id === v.id) === i)
//       .sort(
//         (a, b) =>
//           new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
//       );

//     dispatch({
//       type: "MY_BOOKINGS_SUCCESS", // 👈 this must match your BOOKINGS reducer's SUCCESS type (probably MY_BOOKINGS_SUCCESS or BOOKINGS_SUCCESS)
//       payload: { data: finalResults, hasMore: false, page: 1 },
//     });
//   };

//   const resetToDefaultList = () => {
//   setIsSearching(false);
//   setIsFiltering(false);
//   setSearchText("");
//   setFilters({});
//   setExplorePage(1);
//   setBookingsPage(1);

//   if (activeTab === "ExploreClasses") {
//     dispatch(classesExploreList(1, 10, "", userTimezone));
//   } else {
//     // MyBookings → do not load anything here
//   }

//   flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
// };


//   // ✅ RESET FUNCTION (Fix for your bug)
//   // const resetToDefaultList = () => {
//   //   setIsSearching(false);
//   //   setIsFiltering(false);
//   //   setSearchText("");
//   //   setFilters({});
//   //   setExplorePage(1);
//   //   setBookingsPage(1);

//   //   if (activeTab === "ExploreClasses") {
//   //  dispatch(classesExploreList(1, 10, "", userTimezone));
//   //   } else {
//   //     dispatch(classesBookingsList(1, 10));
//   //   }

//   //   flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
//   // };

//   // ========== SEARCH (Smooth 2s delay logic) ==========
//   useEffect(() => {
//     const delayDebounce = setTimeout(() => {
//       if (searchText.trim()) {
//         setIsSearching(true);
//         setIsFiltering(false);

//         if (activeTab === "ExploreClasses") {
//           dispatch(searchClasses(searchText, 1, 10));
//         } else {
//           dispatch(searchBookings(searchText, 1, 10));
//         }
//       } else {
//         resetToDefaultList(); // reset if cleared
//       }
//     }, 2000); // Wait 2s after last keystroke

//     return () => clearTimeout(delayDebounce);
//   }, [searchText, activeTab]);

//   const handleSearchInput = (text: string) => {
//     setSearchText(text);
//   };

//   // ========== FILTER ==========
//   const handleFilterApply = (selectedFilters: any) => {
//     setFilters(selectedFilters);
//     setIsFiltering(true);
//     setIsSearching(false);

//     if (activeTab === "ExploreClasses") {
//       dispatch(filteredClassesExploreList(selectedFilters, 1, 10));
//     } else {
//        setSelectedBookingStatus(["requested", "confirmed"]);
//   setBookingsPage(1);
//   loadDefaultBookingStatuses();
//     }

//     setCloseFilterModal(false);
//     flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
//   };

// const handleLoadMore = () => {
//   // ---------------------------
//   // 🔹 PAGINATION: Explore Tab
//   // ---------------------------
//   if (
//     activeTab === "ExploreClasses" &&
//     exploreState.hasMore &&
//     !exploreState.loading
//   ) {
//     const nextPage = explorePage + 1;
//     setExplorePage(nextPage);
//     dispatch(classesExploreList(nextPage, 10));
//     return;
//   }

//   // ---------------------------
//   // 🔹 PAGINATION: MyBookings Tab (Requested + Confirmed)
//   // ---------------------------
//   if (
//     activeTab === "MyBookings" &&
//     bookingsState.hasMore &&
//     !bookingsState.loading
//   ) {
//     const nextPage = bookingsPage + 1;
//     setBookingsPage(nextPage);

//     console.log("📌 Loading MyBookings page:", nextPage);

//     // 🔥 Load BOTH at same time
//     Promise.all([
//       dispatch(
//         classesBookingsList(nextPage, 10, "requested", userTimezone, () => {})
//       ),
//       dispatch(
//         classesBookingsList(nextPage, 10, "confirmed", userTimezone, () => {})
//       ),
//     ]).then(() => {
//       console.log("⚡ Loaded Requested + Confirmed page:", nextPage);
//     });

//     return;
//   }
// };


//   // ========== PAGINATION / REFRESH ==========
//   // const handleLoadMore = () => {
//   //   if (activeTab === "ExploreClasses" && exploreState.hasMore && !exploreState.loading) {
//   //     const nextPage = explorePage + 1;
//   //     setExplorePage(nextPage);
//   //     dispatch(classesExploreList(nextPage, 10));
//   //   } else if (activeTab === "MyBookings" && bookingsState.hasMore && !bookingsState.loading) {
//   //     const nextPage = bookingsPage + 1;
//   //     setBookingsPage(nextPage);
//   //     dispatch(classesBookingsList(nextPage, 10));
//   //   }
//   // };

//   const handleRefresh = () => {
//     resetToDefaultList(); // unified refresh
//   };

//   // ========== CANCEL BOOKING ==========
//   const handleCancelBooking = (data: any) => {
//     if (!tutorId) return;
//     dispatch(
//       cancelBooking(tutorId, data, (res) => {
//         if (res.success) {
//           setShowCancel(false);
//           dispatch(classesBookingsList(1, 10));
//         }
//       })
//     );
//   };

// const fetchMyBookings = async (page = 1) => {
//   let allResults: any[] = [];

//   const statuses = ["requested", "confirmed"];

//   for (const status of statuses) {
//     await dispatch(
//       classesBookingsList(page, 10, status, userTimezone, (res) => {
//         if (res.success) allResults.push(...res.data);
//       })
//     );
//   }

//   // Deduplicate + sort
//   allResults = allResults
//     .filter((v, i, arr) => arr.findIndex((a) => a.id === v.id) === i)
//     .sort(
//       (a, b) =>
//         new Date(b.updated_at).getTime() -
//         new Date(a.updated_at).getTime()
//     );

//   // Send to reducer
//   dispatch({
//     type: "MY_BOOKINGS_SUCCESS",
//     payload: { data: allResults, page, hasMore: false },
//   });
// };



//   // ========== INITIAL LOAD ==========
//   useEffect(() => {
//    dispatch(classesExploreList(1, 10, "", userTimezone));
//     // dispatch(classesBookingsList(1, 10));
//   }, [dispatch]);

// useEffect(() => {
//   if (activeTab === "MyBookings") {
//     // default: requested + confirmed
//     setSelectedBookingStatus(["requested", "confirmed"]);
//     setBookingsPage(1);
//     fetchMyBookings(1);
//     // loadDefaultBookingStatuses();
//   } else {
//     // Explore tab — use your existing reset logic
//     resetToDefaultList();
//   }
// }, [activeTab]);


//   // useEffect(() => {
//   //   resetToDefaultList(); // reset when switching tabs
//   // }, [activeTab]);

//   // ========== RENDER ITEMS ==========
//   const renderItem = ({ item }: any) => {
//     if (activeTab === "ExploreClasses") {
//       return (
//         <ClassEventCard
//           imageUrl={
//             item?.cover_media?.key
//               ? `${BASE_IMAGE_URL}/${item.cover_media.key}`
//               : null
//           }
//           title={item?.title}
//           description={item?.description}
//           duration={item?.pricing?.per_person?.session_length_min}
//           price={item?.pricing?.per_person?.amount?.app}
//           onViewDetails={() =>
//             navigation.navigate("ClassTutorDetailsScreen", { data: item })
//           }
//           onBookNow={() =>
//             navigation.navigate("ClassBookingScreen", { data: item, reschedule: false })
//           }
//           tutor={item?.tutor}
//         />
//       );
//     } else {
//       return (
//         <ClassBookingCard
//           imageUrl={
//             item?.offering?.cover_media?.key
//               ? `${BASE_IMAGE_URL}/${item.offering.cover_media.key}`
//               : null
//           }
//           joinUrl={item.join_url} 
//           title={item?.offering?.title}
//           start={item?.start}
//           end={item?.end}
//           link={item?.join_url}
//           price={item?.amount}
//           status={item?.status}
//           onDetails={() => {
//             setDetails(item);
//             setShowDetails(true);
//           }}
//           onCancel={() => {
//             setTutorId(item?.offering?.id);
//             setShowCancel(true);
//           }}
//           onReschedule={() =>
//             navigation.navigate("ClassBookingScreen", { data: item, reschedule: true })
//           }
//         />
//       );
//     }
//   };

//   // ========== FINAL DATA SELECTION ==========
//   const displayedData =
//     activeTab === "ExploreClasses"
//       ? isSearching
//         ? searchExploreState.data
//         : isFiltering
//         ? filterExploreState.data
//         : exploreState.data
//       : isSearching
//       ? searchBookingsState.data
//       : isFiltering
//       ? filterBookingsState.data
//       : bookingsState.data;

//   const isLoading =
//     activeTab === "ExploreClasses"
//       ? exploreState.loading ||
//         searchExploreState.loading ||
//         filterExploreState.loading
//       : bookingsState.loading ||
//         searchBookingsState.loading ||
//         filterBookingsState.loading;

//   // ========== RENDER UI ==========
//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Colors.white }}>
//       <StatusBar barStyle="dark-content" backgroundColor={Colors.Colors.header_bg} />

//       <Header />

//       {/* Tabs */}
//       <View
//         style={{
//           marginTop: 10,
//           marginHorizontal: 16,
//           flexDirection: "row",
//           alignItems: "center",
//         }}
//       >
//         <TouchableOpacity onPress={() => navigation.navigate('HomePage', { screen: 'Home'})}>
//           <View
//             style={{
//               backgroundColor: "#D9D9D9",
//               alignSelf: "flex-start",
//               padding: 10,
//               borderRadius: 25,
//             }}
//           >
//             <Image
//               source={require("../../../assets/C_Arrow_back.png")}
//               style={{ width: 20, height: 20 }}
//               resizeMode="contain"
//             />
//           </View>
//         </TouchableOpacity>

//         <View
//           style={{
//             flex: 1,
//             backgroundColor: "#EBEBEB",
//             flexDirection: "row",
//             justifyContent: "space-evenly",
//             alignItems: "center",
//             padding: 8,
//             borderRadius: 4,
//             marginLeft: 15,
//           }}
//         >
//           <TouchableOpacity
//             onPress={() => {
//               setActiveTab("ExploreClasses");
//               flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
//             }}
//             style={{
//               backgroundColor:
//                 activeTab === "ExploreClasses"
//                   ? Colors.Colors.Yellow
//                   : "transparent",
//               padding: 6,
//               borderRadius: 6,
//               paddingHorizontal: 12,
//             }}
//           >
//             <TextComponent type="headerSubBoldText" style={{color:activeTab === "MyBookings" ? Colors.Colors.BLACK : Colors.Colors.white}}>Explore Classes</TextComponent>
//           </TouchableOpacity>
// {isLoggedIn &&
//           <TouchableOpacity
//             onPress={() => {
//               setActiveTab("MyBookings");
//               flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
//             }}
//             style={{
//               backgroundColor:
//                 activeTab === "MyBookings"
//                   ? Colors.Colors.Yellow
//                   : "transparent",
//               padding: 6,
//               borderRadius: 6,
//               paddingHorizontal: 12,
//             }}
//           >
//             <TextComponent type="headerSubBoldText" style={{color:activeTab === "MyBookings" ? Colors.Colors.white : Colors.Colors.BLACK}}>My Bookings</TextComponent>
//           </TouchableOpacity>
// }
//         </View>
//       </View>

//       {/* Search + Filter */}
//       <View
//         style={{
//           flexDirection: "row",
//           alignItems: "center",
//           marginTop: 20,
//           marginHorizontal: 16,
//         }}
//       >
//         <View
//           style={{
//             flex: 1,
//             backgroundColor: Colors.Colors.grey,
//             flexDirection: "row",
//             alignItems: "center",
//             borderRadius: 8,
//             marginRight: 12,
//             height: 48,
//           }}
//         >
//           <Image
//             source={require("../../../assets/C_Vector.png")}
//             style={{ width: 20, height: 20, marginHorizontal: 10 }}
//           />
//           <TextInput
//           allowFontScaling={false}
//             placeholder="Search by tag, title, Tutor..."
//             style={{ flex: 1, fontSize: 14 }}
//             value={searchText}
//             onChangeText={handleSearchInput}
//           />
//         </View>

//         <TouchableOpacity onPress={() => setCloseFilterModal(true)}>
//           <Image
//             source={require("../../../assets/C_Filter.png")}
//             style={{ width: 24, height: 24 }}
//             resizeMode="contain"
//           />
//         </TouchableOpacity>
//       </View>
//       {activeTab === "ExploreClasses" &&
//      <View style={{ marginTop: 10 }}>
//   <FlatList
//     data={subjectOptions}
//     horizontal
//     showsHorizontalScrollIndicator={false}
//     keyExtractor={(item) => item.value}
//     contentContainerStyle={{ paddingHorizontal: 16 }}
//     renderItem={({ item }) => {
//       const isSelected = selectedSubject === item.value;

//       return (
//         <TouchableOpacity
//           onPress={() => {
//             setSelectedSubject(item.value);
//             setExplorePage(1);

//             const subjectToSend = item.value === "All" ? "" : item.value;
//             dispatch(classesExploreList(1, 10, subjectToSend, userTimezone));
//           }}
//           style={{
//             paddingVertical: 8,
//             paddingHorizontal: 16,
//             backgroundColor: isSelected ? Colors.Colors.Yellow : "#EEE",
//             borderRadius: 20,
//             marginRight: 10,
//             minWidth: 70,
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//         >
//           {/* 🔥 Loader only on selected chip */}
//           {fetchLoading && isSelected ? (
//             <ActivityIndicator
//               size="small"
//               color={isSelected ? Colors.Colors.white : Colors.Colors.Light_black}
//             />
//           ) : (
//             <TextComponent
//               type="cardText"
//               style={{
//                 color: isSelected
//                   ? Colors.Colors.white
//                   : Colors.Colors.Light_black,
//               }}
//             >
//               {item.label}
//             </TextComponent>
//           )}
//         </TouchableOpacity>
//       );
//     }}
//   />
// </View>
// }
// {/* FILTER CHIPS BELOW SEARCH BAR */}
// {activeTab === "MyBookings" && (
//   <View style={{ marginTop: 10 }}>
//     <FlatList
//       data={statusData}
//       horizontal
//       showsHorizontalScrollIndicator={false}
//       keyExtractor={(item) => item.value}
//       contentContainerStyle={{ paddingHorizontal: 16 }}
//       renderItem={({ item }: any) => {
//             const isSelected = selectedBookingStatus.includes(item.value);
//         return (
//           <TouchableOpacity
//             onPress={() => {
//   // now only this one is active
//   setSelectedBookingStatus([item.value]);
//   setBookingsPage(1);

//   dispatch(
//     classesBookingsList(1, 10, item.value, userTimezone)
//   );
// }}
//             style={{
//               paddingVertical: 8,
//               paddingHorizontal: 16,
//               backgroundColor: isSelected ? Colors.Colors.Yellow : "#EEE",
//               borderRadius: 20,
//               marginRight: 10,
//               minWidth: 90,
//               justifyContent: "center",
//               alignItems: "center",
//             }}
//           >
//             {fetchLoading && isSelected ? (
//               <ActivityIndicator
//                 size="small"
//                 color={isSelected ? Colors.Colors.white : Colors.Colors.Light_black}
//               />
//             ) : (
//               <TextComponent
//                 type="cardText"
//                 style={{
//                   color: isSelected
//                     ? Colors.Colors.white
//                     : Colors.Colors.Light_black,
//                 }}
//               >
//                 {item.label}
//               </TextComponent>
//             )}
//           </TouchableOpacity>
//         );
//       }}
//     />
//   </View>
// )}


// {/* <View style={{ marginTop: 10 }}>
//   <FlatList
//     data={subjectOptions}
//     horizontal
//     showsHorizontalScrollIndicator={false}
//     keyExtractor={(item) => item.value}
//     contentContainerStyle={{ paddingHorizontal: 16 }}
//     renderItem={({ item }) => (
//     <TouchableOpacity
//     onPress={() => {
//   setSelectedSubject(item.value);
//   setExplorePage(1);
//   const subjectToSend = item.value === "All" ? "" : item.value;
//   dispatch(classesExploreList(1, 10, subjectToSend, userTimezone));
// }}

//       style={{
//         paddingVertical: 8,
//         paddingHorizontal: 16,
//         backgroundColor:
//           selectedSubject === item.value ? Colors.Colors.Yellow : "#EEE",
//         borderRadius: 20,
//         marginRight: 10,
//       }}
//     >
//       <TextComponent type="cardText" style={{color: selectedSubject === item.value ? Colors.Colors.white : Colors.Colors.Light_black}}>
//         {item.label}
//       </TextComponent>
//     </TouchableOpacity>
//   )}
// />
// </View> */}
//       {/* List */}
//       <FlatList
//         ref={flatListRef}
//         data={displayedData}
//         renderItem={renderItem}
//         keyExtractor={(item, index) => `${item?.id || index}`}
//         onEndReached={handleLoadMore}
//         onEndReachedThreshold={0.5}
//         ListFooterComponent={() =>
//           isLoading ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null
//         }
//         ListEmptyComponent={
//           <Text  allowFontScaling={false} style={{ textAlign: "center", marginTop: 30 }}>
//             {activeTab === "ExploreClasses"
//               ? "No classes available."
//               : "You have no bookings yet."}
//           </Text>
//         }
//         refreshing={isLoading}
//         onRefresh={handleRefresh}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
//       />

//       {/* Modals */}
//       <ClassDetailsModal
//         visible={showDetails}
//         onClose={() => setShowDetails(false)}
//         details={{
//           className: details?.offering?.title || "",
//           status: details?.status || "",
//           start: details?.start || "",
//           end: details?.end || "",
//           price: details?.amount?.toString() || "",
//           trial: details?.trial_class ? "Yes" : "No",
//           groupSize: details?.group_size?.toString() || "",
//           note: details?.notes || "",
//         }}
//       />

//       <ClassCancelModal
//         visible={showCancel}
//         onClose={() => setShowCancel(false)}
//         onConfirmCancel={handleCancelBooking}
//       />

//       {activeTab === "ExploreClasses" ? (
//         <FilterModal
//           visible={closeFilterModal}
//           onClose={() => setCloseFilterModal(false)}
//           onApply={handleFilterApply}
//           onClear={resetToDefaultList}
//         />
//       ) : (
//         <BookingFilterModal
//           visible={closeFilterModal}
//           onClose={() => setCloseFilterModal(false)}
//           onApply={handleFilterApply}
//           onClear={resetToDefaultList}
//         />
//       )}
// {/* <LoadingOverlay visible={fetchLoading} text="Loading ..." /> */}
//     </SafeAreaView>
//   );
// }

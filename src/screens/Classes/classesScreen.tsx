import { debounce } from "lodash";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
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
import TextComponent from "../../components/TextComponent";
import { RootState } from "../../store"; // Adjust the path based on your project structure
import {
  cancelBooking,
  classesBookingsList,
  classesExploreList,
  fetchFilteredBookings,
  filteredClassesExploreList,
  searchBookings,
  searchClasses,
} from "./actions";
import styles from "./styles";

// Interfaces for each type of card
interface ExploreClass {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: string;
  imageUrl: any;
  tutor?: string; // additional prop for explore classes
}

interface BookingClass {
  id: string;
  title: string;
  time: string;
  link: string;
  price: string;
  imageUrl: any;
}

export default function ClassesScreen({ navigation }) {
  const { t } = useTranslation();
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const exploreState = useSelector(
    (state: RootState) => state.classesExploreReducer
  );
  const bookingsState = useSelector(
    (state: RootState) => state.classesBookingsReducer
  );

  // State for both tabs
  const [exploreData, setExploreData] = useState<ExploreClass[]>([]);
  const [bookingsData, setBookingsData] = useState<BookingClass[]>([]);
  const [explorePage, setExplorePage] = useState(1);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [loadingExplore, setLoadingExplore] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [hasMoreExplore, setHasMoreExplore] = useState(true);
  const [hasMoreBookings, setHasMoreBookings] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [details, setDetails] = useState<any>();
  const [tutorId, setTutorId] = useState<any>();
  const [showReschedule, setShowReschedule] = useState(false);
  const [closeFilterModal, setCloseFilterModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"MyBookings" | "ExploreClasses">(
    "ExploreClasses"
  );

  const debouncedSearch = debounce((text) => handleSearch(text), 500);

  // Fetch Explore Classes with pagination
  const fetchExploreClasses = (pageNum: number) => {
    dispatch(
      classesExploreList(pageNum, 10, (response) => {
        if (!response.success) {
          console.error("Error fetching explore classes:", response.error);
        }
      })
    );
  };

  // Fetch My Bookings with pagination
  const fetchBookings = (pageNum: number) => {
    dispatch(
      classesBookingsList(pageNum, 10, (response) => {
        if (!response.success) {
          console.error("Error fetching bookings:", response.error);
        }
      })
    );
  };

  const FilteredExploreData = (filters) => {
    dispatch(
      filteredClassesExploreList(filters, 1, 10, (res) => {
        if (res.success) {
          console.log("✅ Filtered Classes:", res.data);
          console.log("🌐 Request URL:", res.url);
        } else {
          console.error("❌ Error:", res.error);
        }
      })
    );
  };

  const BookingFilteredData = (filters) => {
    dispatch(
      fetchFilteredBookings(filters, 1, 10, (res) => {
        if (res.success) {
          console.log("✅ My Bookings:", res.data);
          console.log("🌐 Request URL:", res.url);
        } else {
          console.error("❌ Error:", res.error);
        }
      })
    );
  };

  const handleSearch = (text) => {
    if (activeTab === "ExploreClasses") {
      dispatch(
        searchClasses(text, 1, 10, (res) => {
          if (res.success) {
            console.log("✅ Search results:", res.data);
          } else {
            console.error("❌ Search error:", res.error);
          }
        })
      );
    } else {
      dispatch(
        searchBookings(text, 1, 10, (res) => {
          if (res.success) {
            console.log("✅ Booking search results:", res.data);
          } else {
            console.error("❌ Booking search error:", res.error);
          }
        })
      );
    }
  };

  useEffect(() => {
    fetchExploreClasses(explorePage);
  }, [explorePage]);

  useEffect(() => {
    fetchBookings(bookingsPage);
  }, [bookingsPage]);

  const loadMoreExplore = () => {
    if (!exploreState.loading && exploreState.hasMore) {
      setExplorePage((prev) => prev + 1);
    }
  };

  const loadMoreBookings = () => {
    if (!bookingsState.loading && bookingsState.hasMore) {
      setBookingsPage((prev) => prev + 1);
    }
  };

  const CancelBookingCalled = (data) => {
    dispatch(
      cancelBooking(tutorId, data, (res) => {
        if (res.success) {
          console.log("Booking cancelled successfully:", res.data);
          setShowCancel(false);
          // optionally refresh bookings list here
          // dispatch(classesBookingsList(1, 10));
        } else {
          console.error("Cancel booking failed:", res.error);
        }
      })
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={{
          marginTop: 60,
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

        {/* Tabs */}
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
            onPress={() => setActiveTab("ExploreClasses")}
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
            onPress={() => setActiveTab("MyBookings")}
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

      {/* Search Bar */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 20,
          marginHorizontal: 16,
        }}
      >
        <View
          style={{
            backgroundColor: Colors.Colors.grey,
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 8,
            flex: 1,
            marginRight: 16,
            height: 50,
          }}
        >
          <Image
            source={require("../../../assets/C_Vector.png")}
            style={{ width: 20, height: 20, marginHorizontal: 10 }}
            resizeMode="contain"
          />
          <TextInput
            style={{ flex: 1, fontSize: 14 }}
            placeholder="Search by tag, title, Tutor.."
            onChangeText={debouncedSearch}
          />
        </View>
        <TouchableOpacity
          onPress={() => {
            setCloseFilterModal(true);
          }}
        >
          <Image
            source={require("../../../assets/C_Filter.png")}
            style={{ width: 24, height: 24 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Classes List */}
      <FlatList
        data={
          activeTab === "ExploreClasses"
            ? exploreState.data
            : bookingsState.data
        }
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          activeTab === "ExploreClasses" ? (
            <ClassEventCard
              imageUrl={`https://dev.kalpx.com/${item.cover_media.key}`}
              title={item.title}
              description={item.description}
              duration={item.pricing.per_person.session_length_min}
              price={item.pricing.per_person.amount.app}
              onViewDetails={() =>
                navigation.navigate("ClassTutorDetailsScreen", { data: item })
              }
              onBookNow={() => console.log("Book Now", item.id)}
              tutor={item.tutor}
            />
          ) : (
            <ClassBookingCard
              imageUrl={`https://dev.kalpx.com/${item.offering.cover_media.key}`}
              title={item.offering.title}
              start={item.start}
              end={item.end}
              link={item.link}
              price={item.amount}
              status={item.status}
              onDetails={async () => {
                console.log("item >>>>>>", item);
                setDetails(item);
                setShowDetails(true);
              }}
              onCancel={() => {
                setTutorId(item?.offering?.id);
                setShowCancel(true);
              }}
              onReschedule={() =>
                navigation.navigate("ClassBookingScreen", {
                  data: item,
                  reschedule: true,
                })
              }
              // {() => navigation.navigate("ClassRescheduleScreen")}
            />
          )
        }
        onEndReached={
          activeTab === "ExploreClasses" ? loadMoreExplore : loadMoreBookings
        }
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          activeTab === "ExploreClasses"
            ? exploreState.loading && <ActivityIndicator />
            : bookingsState.loading && <ActivityIndicator />
        }
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            {activeTab === "MyBookings"
              ? "You have no bookings yet."
              : "No classes available."}
          </Text>
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />
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
        onConfirmCancel={(data) => {
          console.log("cancel data >>>>", data);
          CancelBookingCalled(data);
          // setShowCancel(false);
        }}
      />
      {activeTab === "ExploreClasses" ? (
        <FilterModal
          visible={closeFilterModal}
          onClear={() => {}}
          onClose={() => setCloseFilterModal(false)}
          onApply={(filters) => {
            console.log("Selected Filters:", filters);
            FilteredExploreData(filters);
            // You can save it in state or send to API
            // Example: setFilters(filters)
          }}
        />
      ) : (
        <BookingFilterModal
          visible={closeFilterModal}
          onClose={() => setCloseFilterModal(false)}
          onClear={() => {}}
          onApply={(filters) => {
            console.log("Selected Filters:", filters);
            BookingFilteredData(filters);
            // You can save it in state or send to API
            // Example: setFilters(filters)
          }}
        />
      )}
    </View>
  );
}

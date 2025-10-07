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
import ClassBookingCard from "../../components/ClassBookingCard";
import ClassCancelModal from "../../components/ClassCancelModal";
import ClassDetailsModal from "../../components/ClassDetailsModal";
import ClassEventCard from "../../components/ClassEventCard";
import Colors from "../../components/Colors";
import TextComponent from "../../components/TextComponent";
import { RootState } from "../../store"; // Adjust the path based on your project structure
import { classesBookingsList, classesExploreList } from "./actions";
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
  const exploreState = useSelector((state: RootState) => state.classesExploreReducer);
  const bookingsState = useSelector((state: RootState) => state.classesBookingsReducer);

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
  const [showReschedule, setShowReschedule] = useState(false);
  const [activeTab, setActiveTab] = useState<"MyBookings" | "ExploreClasses">(
    "ExploreClasses"
  );

  // Fetch Explore Classes with pagination
  const fetchExploreClasses = (pageNum: number) => {
    dispatch(classesExploreList(pageNum, 10, (response) => {
      if (!response.success) {
        console.error("Error fetching explore classes:", response.error);
      }
    }));
  };

  // Fetch My Bookings with pagination
  const fetchBookings = (pageNum: number) => {
    dispatch(classesBookingsList(pageNum, 10, (response) => {
      if (!response.success) {
        console.error("Error fetching bookings:", response.error);
      }
    }));
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
          />
        </View>
        <Image
          source={require("../../../assets/C_Filter.png")}
          style={{ width: 24, height: 24 }}
          resizeMode="contain"
        />
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
              imageUrl={item.imageUrl}
              title={item.title}
              description={item.description}
              duration={item.pricing.per_person.session_length_min}
              price={item.pricing.per_person.amount.app}
              onViewDetails={() => navigation.navigate("ClassTutorDetailsScreen")}
              onBookNow={() => console.log("Book Now", item.id)}
              tutor={item.tutor}
            />
          ) : (
            <ClassBookingCard
              imageUrl={item.imageUrl}
              title={item.title}
              time={item.time}
              link={item.link}
              price={item.price}
              onDetails={() => setShowDetails(true)}
              onCancel={() => setShowCancel(true)}
              onReschedule={() => navigation.navigate("ClassRescheduleScreen")}
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
          className: "Bharat Natyam Dance",
          status: "Confirmed",
          start: "12/06/2020, 8:00 AM",
          end: "12/06/2020, 9:00 AM",
          price: "2234",
          trial: "No",
          groupSize: "1",
          note: "dwgf dghdh",
        }}
      />
      <ClassCancelModal
        visible={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirmCancel={() => setShowCancel(false)}
      />
    </View>
  );
}

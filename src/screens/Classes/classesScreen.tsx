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
import ClassBookingCard from "../../components/ClassBookingCard";
import ClassCancelModal from "../../components/ClassCancelModal";
import ClassDetailsModal from "../../components/ClassDetailsModal";
import ClassEventCard from "../../components/ClassEventCard";
import Colors from "../../components/Colors";
import TextComponent from "../../components/TextComponent";
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
  const fetchExploreClasses = async (pageNum: number) => {
    if (loadingExplore || !hasMoreExplore) return;
    setLoadingExplore(true);

    setTimeout(() => {
      const newData: ExploreClass[] = Array.from({ length: 10 }, (_, i) => {
        const id = (pageNum - 1) * 10 + i + "";
        return {
          id,
          title: `Class ${id}`,
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          duration: "60 Minutes",
          price: "$5500",
          imageUrl: require("../../../assets/C_Sample.png"),
          tutor: "John Doe", // example extra prop
        };
      });

      setExploreData((prev) => [...prev, ...newData]);
      setHasMoreExplore(newData.length > 0);
      setLoadingExplore(false);
    }, 1000);
  };

  // Fetch My Bookings with pagination
  const fetchBookings = async (pageNum: number) => {
    if (loadingBookings || !hasMoreBookings) return;
    setLoadingBookings(true);

    setTimeout(() => {
      const newData: BookingClass[] = Array.from({ length: 5 }, (_, i) => {
        const id = "b" + (pageNum - 1) * 5 + i + 1;
        return {
          id,
          title: `Booked Class ${id}`,
          time: "Jan 27, 2024 1:00 am - Jan 27, 2024 1:30 am",
          link: "The URL will be available 15 minutes before the class begins.",
          price: "$1200",
          imageUrl: require("../../../assets/C_Sample.png"),
        };
      });

      setBookingsData((prev) => [...prev, ...newData]);
      setHasMoreBookings(newData.length > 0);
      setLoadingBookings(false);
    }, 1000);
  };

  useEffect(() => {
    fetchExploreClasses(explorePage);
  }, [explorePage]);

  useEffect(() => {
    fetchBookings(bookingsPage);
  }, [bookingsPage]);

  const loadMoreExplore = () => {
    if (!loadingExplore && hasMoreExplore) setExplorePage((prev) => prev + 1);
  };

  const loadMoreBookings = () => {
    if (!loadingBookings && hasMoreBookings)
      setBookingsPage((prev) => prev + 1);
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
            ? (exploreData as Array<ExploreClass | BookingClass>)
            : (bookingsData as Array<ExploreClass | BookingClass>)
        }
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          activeTab === "ExploreClasses" ? (
            <ClassEventCard
              imageUrl={item.imageUrl}
              title={item.title}
              description={(item as ExploreClass).description}
              duration={(item as ExploreClass).duration}
              price={item.price}
              onViewDetails={() => navigation.navigate("ClassTutorDetailsScreen")}
              onBookNow={() => console.log("Book Now", item.id)}
              tutor={(item as ExploreClass).tutor}
            />
          ) : (
            <ClassBookingCard
              imageUrl={item.imageUrl}
              title={item.title}
              time={(item as BookingClass).time}
              link={(item as BookingClass).link}
              price={item.price}
              onDetails={() => setShowDetails(true)}
              onCancel={() => setShowCancel(true)}
              onReschedule={() => setShowReschedule(true)}
            />
          )
        }
        onEndReached={
          activeTab === "ExploreClasses" ? loadMoreExplore : loadMoreBookings
        }
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          activeTab === "ExploreClasses"
            ? loadingExplore && <ActivityIndicator />
            : loadingBookings && <ActivityIndicator />
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

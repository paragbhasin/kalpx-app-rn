import { ResizeMode, Video } from "expo-av";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import ClassEventCard from "../../components/ClassEventCard";
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";
import Header from "../../components/Header";
import TextComponent from "../../components/TextComponent";
import { RootState } from "../../store";
import { tutorDataList } from "./actions";
import styles from "./styles";

// Interfaces
interface ExploreClass {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: string;
  imageUrl: any;
  tutor?: string;
}

// Reusable ReadMore Component
const ReadMoreText = ({ text }: { text: string }) => {
  const [expanded, setExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);

  return (
    <Text
      style={{ color: Colors.Colors.Light_black, marginTop: 6 }}
      numberOfLines={expanded ? undefined : 2}
      onTextLayout={(e) => {
        // Check if more than 2 lines exist
        if (e.nativeEvent.lines.length > 2 && !showReadMore) {
          setShowReadMore(true);
        }
      }}
    >
      {text}
      {showReadMore ? (
        <Text
          style={{ color: Colors.Colors.App_theme, fontWeight: "600" }}
          onPress={() => setExpanded(!expanded)}
        >
          {expanded ? "  Read Less" : "  Read More"}
        </Text>
      ) : null}
    </Text>
  );
};

export default function ClassTutorDetailsScreen({ navigation, route }) {
  const { t } = useTranslation();
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const [exploreData, setExploreData] = useState<any[]>([]);
  const [explorePage, setExplorePage] = useState(1);
  const [loadingExplore, setLoadingExplore] = useState(false);
  const [hasMoreExplore, setHasMoreExplore] = useState(true);

  // Map API class object to ClassEventCard props
  const mapClassToCard = (item: any) => ({
    id: item.id,
    imageUrl: item.cover_media?.key ? `https://dev.kalpx.com/${item.cover_media.key}` : undefined,
    title: item.title,
    description: item.description,
    duration: item.pricing?.per_person?.session_length_min,
    price: item.pricing?.per_person?.amount?.app,
    tutor: item.tutor,
    raw: item,
  });

  const fetchTutorClasses = (pageNum: number) => {
    if (loadingExplore || !hasMoreExplore) return;
    setLoadingExplore(true);
    dispatch(
      tutorDataList(route?.params?.data?.creator_id, pageNum, (res: any) => {
        setLoadingExplore(false);
        if (res.success) {
          const newClasses = res.data?.classes?.results || [];
          setExploreData((prev) =>
            pageNum === 1 ? newClasses : [...prev, ...newClasses]
          );
          // Pagination: if next is null, no more pages
          setHasMoreExplore(!!res.data?.classes?.next);
        } else {
          setHasMoreExplore(false);
          console.error("Tutor Data Fetch Failed:", res.error);
        }
      })
    );
  };

  useEffect(() => {
    fetchTutorClasses(explorePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [explorePage]);

  const loadMoreExplore = () => {
    if (!loadingExplore && hasMoreExplore) setExplorePage((prev) => prev + 1);
  };

  return (
       <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Colors.white }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.Colors.header_bg}
        translucent={false}
      />
      <Header />
    <ScrollView
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Back Button */}
      <TouchableOpacity
        style={{
          marginTop: 10,
          marginHorizontal: 16,
        }}
        onPress={() => navigation.goBack()}
      >
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

      {/* Class Info Card */}
      <View
        style={{
          borderColor: Colors.Colors.Light_grey,
          borderWidth: 1,
          borderRadius: 10,
          padding: 12,
          marginHorizontal: 16,
          marginTop: 15,
        }}
      >
        <Video
          source={{
            uri: `https://dev.kalpx.com/${route?.params?.data?.intro_media?.key}`,
          }}
          style={{
            width: "100%",
            height: 200,
            borderRadius: 10,
            backgroundColor: "#000",
          }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN} // ✅ correct enum usage
          shouldPlay
          isLooping
        />
        <View style={styles.row}>
          {/* <TextComponent type="headerText" style={styles.label}>
            Flute Series :
          </TextComponent> */}
          <TextComponent type="headerText" style={styles.label}>
            {route?.params?.data?.title}
          </TextComponent>
        </View>
        <TextComponent type="headerText" style={styles.label}>
          {route?.params?.data?.subtitle}
        </TextComponent>
        <View style={styles.row}>
          <TextComponent
            type="mediumText"
            style={{ ...styles.label, color: Colors.Colors.Light_grey }}
          >
            Duration :
          </TextComponent>
          <TextComponent type="mediumText" style={styles.label}>
            {route?.params?.data?.pricing.per_person.session_length_min} minutes
          </TextComponent>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 2,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TextComponent
              type="boldText"
              style={{ fontSize: FontSize.CONSTS.FS_20 }}
            >
              {route?.params?.data?.pricing?.currency === "INR" ? "₹" : "$"}{" "}
              {route?.params?.data?.pricing?.per_person?.amount?.app ?? 0}
            </TextComponent>
            <TextComponent
              type="mediumText"
              style={{ fontSize: FontSize.CONSTS.FS_14 }}
            >
              / Per Person
            </TextComponent>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("ClassBookingScreen",{data: route?.params?.data,reschedule:false})}
            style={{
              backgroundColor: Colors.Colors.App_theme,
              padding: 10,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <TextComponent
              type="semiBoldText"
              style={{ color: Colors.Colors.white }}
            >
              Book Now
            </TextComponent>
          </TouchableOpacity>
        </View>

        {/* Read More / Less */}
        <ReadMoreText text={route?.params?.data?.description} />
      </View>

      {/* Tutor Section */}
      <TextComponent
        type="headerText"
        style={{
          fontSize: FontSize.CONSTS.FS_14,
          marginVertical: 12,
          marginHorizontal: 16,
        }}
      >
        About Tutor
      </TextComponent>
      <View
        style={{
          borderColor: Colors.Colors.Light_grey,
          borderWidth: 1,
          borderRadius: 10,
          padding: 12,
          marginHorizontal: 16,
        }}
      >
        <Video
          source={{
            uri: `${route?.params?.data?.tutor?.intro_video?.url}`,
          }}
          style={{
            width: "100%",
            height: 200,
            borderRadius: 10,
            backgroundColor: "#000",
          }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN} // ✅ correct enum usage
          shouldPlay
          isLooping
        />
        <TextComponent
          type="headerText"
          style={{ ...styles.label, marginTop: 4 }}
        >
          {route?.params?.data?.tutor?.profile_name}
        </TextComponent>
        <View style={styles.row}>
          <TextComponent
            type="mediumText"
            style={{ ...styles.label, color: Colors.Colors.Light_grey }}
          >
            Experience :
          </TextComponent>
          <TextComponent type="mediumText" style={styles.label}>
            {route?.params?.data?.tutor?.attributes?.experience_years} Years
          </TextComponent>
        </View>
        <View style={styles.row}>
          <TextComponent
            type="mediumText"
            style={{ ...styles.label, color: Colors.Colors.Light_grey }}
          >
            Languages :
          </TextComponent>
          <TextComponent type="mediumText" style={styles.label}>
            {route?.params?.data?.tutor?.languages?.join(", ")}
          </TextComponent>
        </View>

        {/* Read More / Less */}
        <ReadMoreText text={route?.params?.data?.tutor?.description} />
      </View>

      {/* Explore Classes List */}
      <FlatList
        data={exploreData.map(mapClassToCard)}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={({ item }) => (
          <ClassEventCard
            imageUrl={item.imageUrl}
            title={item.title}
            description={item.description}
            duration={item.duration}
            price={item.price}
            onViewDetails={() => navigation.navigate("ClassTutorDetailsScreen", { data: item.raw })}
            onBookNow={() => navigation.navigate("ClassBookingScreen", { data: item.raw })}
            tutor={item.tutor}
          />
        )}
        onEndReached={loadMoreExplore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingExplore ? <ActivityIndicator /> : null}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No classes available.
          </Text>
        }
        scrollEnabled={false} // disable FlatList scroll because ScrollView is parent
        contentContainerStyle={{ padding: 16 }}
      />
    </ScrollView>
    </SafeAreaView>
  );
}

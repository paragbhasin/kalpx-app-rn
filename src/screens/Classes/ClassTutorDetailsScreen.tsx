import { ResizeMode, Video } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
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
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import ClassEventCard from "../../components/ClassEventCard";
import Colors from "../../components/Colors";
import FontSize from "../../components/FontSize";
import Header from "../../components/Header";
import TextComponent from "../../components/TextComponent";
import { BASE_IMAGE_URL } from "../../Networks/baseURL";
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
    <Text  allowFontScaling={false}
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
        <Text  allowFontScaling={false}
          style={{ color: Colors.Colors.App_theme, fontWeight: "600" }}
          onPress={() => setExpanded(!expanded)}
        >
          {expanded ? "  Read Less" : "  Read More"}
        </Text>
      ) : null}
    </Text>
  );
};

console.log("BASE_IMAGE_URL >>>>",BASE_IMAGE_URL);

export default function ClassTutorDetailsScreen({ navigation, route }) {
  const { t } = useTranslation();
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const [exploreData, setExploreData] = useState<any[]>([]);
  const [explorePage, setExplorePage] = useState(1);
  const [loadingExplore, setLoadingExplore] = useState(false);
  const [hasMoreExplore, setHasMoreExplore] = useState(true);
  const videoRef1 = useRef<Video>(null);
  const videoRef2 = useRef<Video>(null);
const [isPlaying1, setIsPlaying1] = useState(false);
const [isPlaying2, setIsPlaying2] = useState(false);

const scrollRef = useRef<ScrollView>(null);

useEffect(() => {
  // Scroll to top
  scrollRef.current?.scrollTo({ y: 0, animated: true });

  // Stop both videos when screen data changes
  setIsPlaying1(false);
  setIsPlaying2(false);
  videoRef1.current?.pauseAsync();
  videoRef2.current?.pauseAsync();
}, [route?.params?.data]);


  // Map API class object to ClassEventCard props
  const mapClassToCard = (item: any) => ({
    id: item.id,
    imageUrl: item.cover_media?.key ? `${BASE_IMAGE_URL}/${item.cover_media.key}` : undefined,
    title: item.title,
    description: item.description,
    duration: item?.pricing?.trial?.session_length_min ? item?.pricing?.trial?.session_length_min : item?.pricing?.per_person?.session_length_min,
    // price: item.pricing?.per_person?.amount?.web,
    price: (
  item?.pricing?.type === "per_group"
    ? item?.pricing?.per_group?.amount?.web
    : item?.pricing?.per_person?.amount?.web
) ?? 0,
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
          console.log("Fetched Tutor Classes:", JSON.stringify(newClasses));
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
      ref={scrollRef}
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
        <View style={{ position: "relative" }}>
  <Video
    ref={videoRef1}
    source={{ uri: `${BASE_IMAGE_URL}/${route?.params?.data?.intro_media?.key}` }}
    style={{
      width: "100%",
      height: 200,
      borderRadius: 10,
      backgroundColor: "#000",
    }}
    resizeMode={ResizeMode.CONTAIN}
    shouldPlay={isPlaying1}
    useNativeControls={isPlaying1}
    isLooping={false}
    onPlaybackStatusUpdate={(status: any) => {
      if (status.isPlaying) {
        setIsPlaying2(false);
        videoRef2.current?.pauseAsync();
      }
    }}
  />

  {!isPlaying1 && (
    <TouchableOpacity
      onPress={() => {
        setIsPlaying1(true);
        setIsPlaying2(false);
        videoRef2.current?.pauseAsync();
      }}
      style={{
        position: "absolute",
        top: "40%",
        left: "45%",
        zIndex: 10,
      }}
    >
      <Ionicons name="play-circle" size={60} color="#ffffffcc" />
    </TouchableOpacity>
  )}
</View>
        {/* <Video
          source={{
            uri: `${BASE_IMAGE_URL}/${route?.params?.data?.intro_media?.key}`,
          }}
          style={{
            width: "100%",
            height: 200,
            borderRadius: 10,
            backgroundColor: "#000",
          }}
          useNativeControls={true}
          resizeMode={ResizeMode.CONTAIN} // ✅ correct enum usage
          // shouldPlay
          isLooping
        /> */}
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
  {
    route?.params?.data?.pricing?.type === "per_group"
      ? route?.params?.data?.pricing?.per_group?.amount?.web
      : route?.params?.data?.pricing?.per_person?.amount?.web
  ?? 0}
</TextComponent>

            {/* <TextComponent
              type="boldText"
              style={{ fontSize: FontSize.CONSTS.FS_20 }}
            >
              {route?.params?.data?.pricing?.currency === "INR" ? "₹" : "$"}{" "}
              {route?.params?.data?.pricing?.per_person?.amount?.web ?? 0}
            </TextComponent> */}
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
        {/* <Video
         ref={videoRef2}
          source={{
            uri: `${route?.params?.data?.tutor?.intro_video?.url}`,
          }}
          style={{
            width: "100%",
            height: 200,
            borderRadius: 10,
            backgroundColor: "#000",
          }}
          useNativeControls={true}
          resizeMode={ResizeMode.CONTAIN} // ✅ correct enum usage
          // shouldPlay
          isLooping
             onPlaybackStatusUpdate={(status: any) => {
          if (status.isPlaying) {
            videoRef1.current?.pauseAsync(); // 🔴 Pause video 1 when 2 plays
          }
        }}
        /> */}
        <View style={{ position: "relative" }}>
  <Video
    ref={videoRef2}
    source={{ uri: `${route?.params?.data?.tutor?.intro_video?.url}` }}
    style={{
      width: "100%",
      height: 200,
      borderRadius: 10,
      backgroundColor: "#000",
    }}
    resizeMode={ResizeMode.CONTAIN}
    shouldPlay={isPlaying2}
    useNativeControls={isPlaying2}
    isLooping={false}
    onPlaybackStatusUpdate={(status: any) => {
      if (status.isPlaying) {
        setIsPlaying1(false);
        videoRef1.current?.pauseAsync();
      }
    }}
  />

  {!isPlaying2 && (
    <TouchableOpacity
      onPress={() => {
        setIsPlaying2(true);
        setIsPlaying1(false);
        videoRef1.current?.pauseAsync();
      }}
      style={{
        position: "absolute",
        top: "40%",
        left: "45%",
        zIndex: 10,
      }}
    >
      <Ionicons name="play-circle" size={60} color="#ffffffcc" />
    </TouchableOpacity>
  )}
</View>
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
        renderItem={({ item }: any) => (
          <ClassEventCard
            imageUrl={item.imageUrl}
            title={item.title}
            description={item.description}
            duration={item.duration}
            price={item.price}
            onViewDetails={() => navigation.navigate("ClassTutorDetailsScreen", { data: item.raw })}
            onBookNow={() => navigation.navigate("ClassBookingScreen", { data: item.raw })}
            tutor={item.tutor}
            currency={item?.pricing?.currency}
  trailenabled={item?.pricing?.trial?.enabled}
  trailAmt={item?.pricing?.trial?.amount}
          />
        )}
        onEndReached={loadMoreExplore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingExplore ? <ActivityIndicator /> : null}
        ListEmptyComponent={
          <Text  allowFontScaling={false} style={{ textAlign: "center", marginTop: 20 }}>
            No classes available.
          </Text>
        }
        // scrollEnabled={false} // disable FlatList scroll because ScrollView is parent
        contentContainerStyle={{ padding: 16 }}
      />
    </ScrollView>
    </SafeAreaView>
  );
}

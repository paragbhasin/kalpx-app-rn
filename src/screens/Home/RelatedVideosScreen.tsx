import { useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import Colors from "../../components/Colors";
import LoadingButton from "../../components/LoadingButton";
import TextComponent from "../../components/TextComponent";
import YoutubeModal from "../../components/youtubeModal";
import { RootState } from "../../store";
import { collapseControl } from "../Home/Home";
import { getVideos } from "./actions";
import styles from "./relatedVideoStyles";

// Extract YouTube ID
const extractYoutubeId = (url: string): string | null => {
  if (!url) return null;
  const regex =
    /(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Video Card
const VideoCard = ({ item }: any) => {
  const navigation: any = useNavigation();
  const [showVideo, setShowVideo] = useState(false);
  const youtubeId = useMemo(() => extractYoutubeId(item.youtube_url), [item.youtube_url]);

  const thumbnailUrl =
    item.thumbnail ||
    (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null);

  return (
    <View style={styles.videoCard}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setShowVideo(true)}
        style={styles.thumbnailWrapper}
      >
        <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} resizeMode="cover" />
        <Image
          source={require("../../../assets/videopaly.png")}
          style={styles.playButton}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Text allowFontScaling={false} style={styles.videoTitle} numberOfLines={2}>
        {item.title}
      </Text>

      <YoutubeModal
        visible={showVideo}
        onClose={() => setShowVideo(false)}
        youtubeUrl={item.youtube_url}
      />
    </View>
  );
};

// Merge unique videos (remove duplicates)
const mergeUniqueVideos = (primary: any[], fallback: any[]) => {
  const map = new Map();
  primary.forEach((v) => map.set(v.id, v));
  fallback.forEach((v) => map.set(v.id, v));
  return Array.from(map.values());
};

const RelatedVideosScreen = ({ route }: any) => {
  const navigation: any = useNavigation();
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const rawTags = route?.params?.tag;
  const customSearch = route?.params?.search;

  // Process tags
  const allTags = useMemo(() => {
    if (!rawTags) return [];
    if (Array.isArray(rawTags)) return rawTags;
    if (typeof rawTags === "string") return rawTags.split(",").map((t) => t.trim());
    return [];
  }, [rawTags]);

  // Final search query
  const searchQuery = useMemo(() => {
    if (customSearch && customSearch.trim().length > 0) return customSearch;
    return allTags.join(" ");
  }, [customSearch, allTags]);

  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch Videos = Tag Videos + Fallback
  const fetchVideos = useCallback(() => {
    setLoading(true);

    // Step 1 → Fetch TAG videos
    dispatch(
      getVideos(
        {
          page: 1,
          per_page: 20,
          category: "All",
          language: "All",
          search: searchQuery,
        },
        (res) => {
          let tagVideos = res.success ? res.data : [];
          let finalList = [...tagVideos];

          // If 20 found → stop
          if (tagVideos.length >= 20) {
            setVideos(tagVideos.slice(0, 20));
            setLoading(false);
            return;
          }

          // Step 2 → Fetch fallback
          dispatch(
            getVideos(
              {
                page: 1,
                per_page: 50,
                category: "All",
                language: "All",
                search: "",
              },
              (fallbackRes) => {
                let fallbackVideos = fallbackRes.success ? fallbackRes.data : [];

                // Merge and limit to 20
                finalList = mergeUniqueVideos(tagVideos, fallbackVideos);
                setVideos(finalList.slice(0, 20));

                setLoading(false);
              }
            )
          );
        }
      )
    );
  }, [dispatch, searchQuery]);

  // Initial Fetch
  useEffect(() => {
    setVideos([]);
    fetchVideos();
  }, [searchQuery]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 12 }}>
        <Pressable
          style={styles.iconButton}
          onPress={() => {
collapseControl.avoidCollapse = true;   // tell Home not to collapse
  navigation.goBack();        // correctly return to Home
}}
          // onPress={() => navigation.navigate("HomePage", { screen: "Home" })}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>

        <TextComponent type="boldText" style={styles.heading}>
          Related Videos
        </TextComponent>
      </View>

      {/* List */}
      <FlatList
        data={videos}
        renderItem={({ item }) => <VideoCard item={item} />}
        keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          !loading && (
            <View style={{ alignItems: "center", marginTop: 30 }}>
              <Text allowFontScaling={false} style={{ color: "#777" }}>
                No videos found.
              </Text>
            </View>
          )
        }
      />
      {/* Initial Loader */}
      {loading && videos.length === 0 && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.Colors.App_theme} />
          <Text
            allowFontScaling={false}
            style={{  color: Colors.Colors.Light_black }}
          >
            Loading videos...
          </Text>
        </View>
      )}
         <LoadingButton
                      loading={false}
                      text="Explore More Videos"
                  onPress={() => navigation.navigate("Explore")}
                      disabled={false}
                      style={styles.button1}
                      textStyle={styles.buttonText1}
                      showGlobalLoader={true}
                    />
    </View>
  );
};

export default RelatedVideosScreen;
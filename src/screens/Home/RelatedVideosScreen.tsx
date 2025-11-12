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
import TextComponent from "../../components/TextComponent";
import YoutubeModal from "../../components/youtubeModal";
import { RootState } from "../../store";
import { getVideos } from "./actions";
import styles from "./relatedVideoStyles";

// ✅ Extract YouTube ID safely
const extractYoutubeId = (url: string): string | null => {
  if (!url) return null;
  const regex =
    /(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// ✅ Reuse the same VideoCard UI
const VideoCard = ({ item }: any) => {
    const navigation: any = useNavigation();
  const [showVideo, setShowVideo] = useState(false);
  const youtubeId = useMemo(() => extractYoutubeId(item.youtube_url), [item.youtube_url]);
  const thumbnailUrl =
    item.thumbnail ||
    (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null);

  return (
    <View style={styles.videoCard}>
      {/* ▶️ Thumbnail */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setShowVideo(true)}
        style={styles.thumbnailWrapper}
      >
        <Image
          source={{ uri: thumbnailUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <Image
          source={require("../../../assets/videopaly.png")}
          style={styles.playButton}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Title */}
      <Text  allowFontScaling={false} style={styles.videoTitle} numberOfLines={2}>
        {item.title}
      </Text>

      {/* 🎥 YouTube Modal */}
      <YoutubeModal
        visible={showVideo}
        onClose={() => setShowVideo(false)}
        youtubeUrl={item.youtube_url}
      />
    </View>
  );
};

const RelatedVideosScreen = ({ route }: any) => {
  const navigation: any = useNavigation();
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const rawTags = route?.params?.tag;
const customSearch = route?.params?.search;

const allTags = useMemo(() => {
  if (!rawTags) return [];
  if (Array.isArray(rawTags)) return rawTags;
  if (typeof rawTags === "string")
    return rawTags.split(",").map((t) => t.trim());
  return [];
}, [rawTags]);

const searchQuery = useMemo(() => {
  if (customSearch && customSearch.trim().length > 0) return customSearch;
  return allTags.join(" ");
}, [customSearch, allTags]);


  // 🏷️ Extract tags (can be string or array)
  // const rawTags = route?.params?.tag;
  // const allTags = useMemo(() => {
  //   if (!rawTags) return [];
  //   if (Array.isArray(rawTags)) return rawTags;
  //   if (typeof rawTags === "string")
  //     return rawTags.split(",").map((t) => t.trim());
  //   return [];
  // }, [rawTags]);

  // // 🔍 Join tags into "peace+protection+Vishnu"
  // const searchQuery = useMemo(() => allTags.join(" "), [allTags]);

  const [page, setPage] = useState(1);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 🧠 Fetch videos
  // const fetchVideos = useCallback(
  //   (pageNum = 1) => {
  //     if (loading) return;
  //     setLoading(true);

  //     dispatch(
  //       getVideos(
  //         {
  //           page: pageNum,
  //           per_page: 16,
  //           category: "All",
  //           language: "All",
  //           search: searchQuery, // ✅ all tags joined here
  //         },
  //         (res) => {
  //           if (res.success) {
  //             console.log(`✅ Related Videos fetched (page ${pageNum}):`, res.data.length);
  //             setVideos((prev) =>
  //               pageNum === 1 ? res.data : [...prev, ...res.data]
  //             );
  //             if (res.data.length === 0) setHasMore(false);
  //           } else {
  //             console.error("❌ Failed to fetch related videos:", res.error);
  //             setHasMore(false);
  //           }
  //           setLoading(false);
  //         }
  //       )
  //     );
  //   },
  //   [dispatch, searchQuery, loading]
  // );

  const fetchVideos = useCallback(
  (pageNum = 1, allowFallback = true) => {
    if (loading) return;
    setLoading(true);

    dispatch(
      getVideos(
        {
          page: pageNum,
          per_page: 16,
          category: "All",
          language: "All",
          search: searchQuery, // ✅ use Sankalp-derived query
        },
        (res) => {
          if (res.success) {
            console.log(`✅ Related Videos fetched (page ${pageNum}):`, res.data.length);

            if (res.data.length === 0 && allowFallback) {
              console.warn("⚠️ No related videos found — fetching default feed instead...");

              // 🟡 fallback call (no search param)
              dispatch(
                getVideos(
                  {
                    page: 1,
                    per_page: 50,
                    category: "All",
                    language: "All",
                    search: "", // ✅ empty search
                  },
                  (fallbackRes) => {
                    if (fallbackRes.success) {
                      console.log("✅ Default feed fetched:", fallbackRes.data.length);
                      setVideos(fallbackRes.data);
                      setHasMore(fallbackRes.data.length > 0);
                    } else {
                      console.error("❌ Fallback feed failed:", fallbackRes.error);
                      setHasMore(false);
                    }
                    setLoading(false);
                  }
                )
              );

              return; // stop further processing
            }

            // ✅ Normal handling if we got data
            setVideos((prev) =>
              pageNum === 1 ? res.data : [...prev, ...res.data]
            );
            if (res.data.length === 0) setHasMore(false);
          } else {
            console.error("❌ Failed to fetch related videos:", res.error);
            setHasMore(false);
          }
          setLoading(false);
        }
      )
    );
  },
  [dispatch, searchQuery, loading]
);


  // 🚀 Initial fetch
  useEffect(() => {
    setVideos([]);
    setPage(1);
    setHasMore(true);
    if (searchQuery.trim().length > 0) fetchVideos(1);
  }, [dispatch, searchQuery]);

  // 🔁 Pagination
  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchVideos(nextPage);
    }
  };

  const renderFooter = useCallback(
    () =>
      loading ? (
        <View style={styles.footer}>
          <ActivityIndicator color={Colors.Colors.App_theme} />
          <Text  allowFontScaling={false} style={styles.footerText}>Loading more...</Text>
        </View>
      ) : null,
    [loading]
  );

  const renderEmpty = useCallback(
    () =>
      !loading ? (
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <Text  allowFontScaling={false} style={{ color: "#999" }}>No videos found.</Text>
        </View>
      ) : null,
    [loading]
  );

  return (
    <View style={styles.container}>
      <View style={{flexDirection:"row",alignItems:"center",marginVertical:12}}>
      {/* Title */}
         <Pressable
          style={styles.iconButton}
          onPress={() => {
            // navigation.navigate("HomePage")
            navigation.navigate('HomePage', { screen: 'Home'});
          }}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
      <TextComponent type="boldText" style={styles.heading}>
        Related Videos
      </TextComponent>
</View>
      {/* Vertical Video List */}
      <FlatList
        data={videos}
        renderItem={({ item }) => <VideoCard item={item} />}
        keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      {/* Loading indicator for initial fetch */}
      {loading && videos.length === 0 && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.Colors.App_theme} />
          <Text  allowFontScaling={false} style={{ marginTop: 10, color: Colors.Colors.Light_black }}>
            Loading videos...
          </Text>
        </View>
      )}
    </View>
  );
};

export default RelatedVideosScreen;

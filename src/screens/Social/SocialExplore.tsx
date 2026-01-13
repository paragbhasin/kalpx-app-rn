import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "../../components/Header";
import LoadingOverlay from "../../components/LoadingOverlay";
import api from "../../Networks/axios";
import SocialPostCard from "../../components/SocialPostCard";
import ShimmerPlaceholder from "../../components/ShimmerPlaceholder";
import { FlatList, ActivityIndicator, Alert } from "react-native";
import { Video, ResizeMode } from 'expo-av';
import { useDispatch, useSelector } from "react-redux";
import { fetchUserActivity } from "../UserActivity/actions";
import { followCommunity, unfollowCommunity } from "./actions";
import { votePostDetail, savePostDetail, unsavePostDetail, hidePostDetail, reportContent } from "../PostDetail/actions";
import styles from "./SocialExplorestyles";


const screenWidth = Dimensions.get("window").width;
const COLUMN_WIDTH = screenWidth / 2 - 20;

interface SocialExploreProps {
  showHeader?: boolean;
  viewMode?: "grid" | "list";
  onScroll?: (event: any) => void;
}

export default function SocialExplore({ showHeader = true, viewMode = "grid", onScroll }: SocialExploreProps) {
  const { i18n } = useTranslation();
  const navigation: any = useNavigation();
  const dispatch = useDispatch();
  const { handleScroll: contextHandleScroll } = require("../../context/ScrollContext").useScrollContext();
  const activeHandleScroll = onScroll || contextHandleScroll;
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const { followed_communities } = useSelector((state: any) => state.userActivity);
  const [viewableItems, setViewableItems] = useState<any>({});


  const fetchExplore = async (pageNo = 1) => {
    try {
      if (pageNo === 1) {
        setLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      // construct URL with pagination
      const res = await api.get(`/public/explore-posts/?paginate=true&page=${pageNo}&page_size=10&lang=${i18n.language}`);
      let result = res.data || [];

      // Handle paginated response or wrapped data
      if (!Array.isArray(result)) {
        if (result.results && Array.isArray(result.results)) {
          result = result.results;
        } else if (result.data && Array.isArray(result.data)) {
          result = result.data;
        } else {
          console.warn("Unexpected API response structure:", result);
          result = [];
        }
      }

      if (result.length < 10) {
        setHasMore(false);
      }

      // Preload image sizes or use aspect ratio from layout
      const mapped = await Promise.all(
        result.map(
          (item) =>
            new Promise((resolve) => {
              const hookImage = item.hook_image;
              const isVideo = hookImage?.toLowerCase().endsWith('.mp4') || hookImage?.toLowerCase().endsWith('.mov');

              const getAspectRatioFromLayout = () => {
                const ratioStr = item.layout?.aspect_ratio ||
                  item.slides?.[0]?.layout?.aspect_ratio ||
                  item.slide_layouts?.[0]?.layout?.aspect_ratio ||
                  item.resolved_slide_layouts?.[0]?.layout?.aspect_ratio;
                if (ratioStr) {
                  const [w, h] = ratioStr.split(":").map(Number);
                  if (w && h) return w / h;
                }
                return 1;
              };

              if (hookImage && !isVideo) {
                Image.getSize(
                  hookImage,
                  (w, h) => resolve({ ...item, aspect: w / h }),
                  () => resolve({ ...item, aspect: getAspectRatioFromLayout() })
                );
              } else {
                resolve({ ...item, aspect: getAspectRatioFromLayout() });
              }
            })
        )
      );

      setItems(prev => pageNo === 1 ? mapped : [...prev, ...mapped]);
    } catch (e) {
      console.log("❌ Fetch Explore Error:", e);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  // useFocusEffect(
  //   useCallback(() => {
  //     fetchExplore();
  //   }, [])
  // );

  useEffect(() => {
    fetchExplore(1);
    dispatch(fetchUserActivity("followed_communities") as any);
  }, [i18n.language]);


  const handleLoadMore = () => {
    if (!loading && !isFetchingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchExplore(nextPage);
    }
  };

  const handleInteraction = (type: string, post: any) => {
    if (type === 'comment') {
      navigation.navigate('SocialPostDetailScreen', { post: post });
    } else if (type === 'askQuestion') {
      navigation.navigate('SocialPostDetailScreen', { post: post, isQuestion: true });
    } else if (type === 'followToggle') {
      const communityId = post.community?.slug || post.community_slug || post.community?.id?.toString();
      if (communityId) {
        if (post.is_joined) {
          dispatch(unfollowCommunity(communityId) as any);
        } else {
          dispatch(followCommunity(communityId) as any);
        }
      }
    } else if (type === 'upvote' || type === 'downvote' || type === 'save' || type === 'unsave') {
      // Optimistic local update for SocialExplore's local items state
      const interaction = type;
      setItems(prevItems => prevItems.map(item => {
        const mergedPostId = item.community_post?.id || item.id;
        if (mergedPostId !== post.id) return item;

        let updatedItem = { ...item };
        let updatedPost = { ...(item.community_post || {}), ...item }; // handle both structures

        if (interaction === 'upvote') {
          const userVote = updatedPost.user_vote || 0;
          if (userVote === 1) {
            updatedPost.score = (updatedPost.score || 0) - 1;
            updatedPost.user_vote = 0;
          } else if (userVote === -1) {
            updatedPost.score = (updatedPost.score || 0) + 2;
            updatedPost.user_vote = 1;
          } else {
            updatedPost.score = (updatedPost.score || 0) + 1;
            updatedPost.user_vote = 1;
          }
        } else if (interaction === 'downvote') {
          const userVote = updatedPost.user_vote || 0;
          if (userVote === -1) {
            updatedPost.score = (updatedPost.score || 0) + 1;
            updatedPost.user_vote = 0;
          } else if (userVote === 1) {
            updatedPost.score = (updatedPost.score || 0) - 2;
            updatedPost.user_vote = -1;
          } else {
            updatedPost.score = (updatedPost.score || 0) - 1;
            updatedPost.user_vote = -1;
          }
        } else if (interaction === 'save') {
          updatedPost.is_saved = true;
        } else if (interaction === 'unsave') {
          updatedPost.is_saved = false;
        }

        // Sync back to the specific structure
        if (updatedItem.community_post) {
          updatedItem.community_post = { ...updatedItem.community_post, ...updatedPost };
        } else {
          updatedItem = { ...updatedItem, ...updatedPost };
        }
        return updatedItem;
      }));

      // Dispatch Redux action for backend sync and other components
      if (type === 'upvote') dispatch(votePostDetail(post.id, 'upvote') as any);
      else if (type === 'downvote') dispatch(votePostDetail(post.id, 'downvote') as any);
      else if (type === 'save') dispatch(savePostDetail(post.id) as any);
      else if (type === 'unsave') dispatch(unsavePostDetail(post.id) as any);

    } else if (type === 'hide') {
      setItems(prev => prev.filter(item => (item.community_post?.id || item.id) !== post.id));
      dispatch(hidePostDetail(post.id) as any);
    }
  };



  const onViewableItemsChanged = React.useRef(({ viewableItems: currentlyViewable }: any) => {
    const viewableMap = {};
    currentlyViewable.forEach((item: any) => {
      viewableMap[item.key] = true;
    });
    setViewableItems(viewableMap);
  }).current;

  const viewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Split into two columns (masonry)
  const leftColumn: any[] = [];
  const rightColumn: any[] = [];
  let leftHeight = 0;
  let rightHeight = 0;

  items.forEach((item: any, index: number) => {
    const height = COLUMN_WIDTH / (item.aspect || 1);

    if (leftHeight <= rightHeight) {
      leftColumn.push({ ...item, height, index });
      leftHeight += height;
    } else {
      rightColumn.push({ ...item, height, index });
      rightHeight += height;
    }
  });

  const renderItem = (item: any) => {
    const isVideo = item.hook_image?.toLowerCase().endsWith('.mp4') || item.hook_image?.toLowerCase().endsWith('.mov');
    const isVisible = item.isVisible || viewableItems[item.id.toString()];

    return (
      <TouchableOpacity
        key={item.id}
        style={{
          marginBottom: 12,
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: '#f0f0f0', // Placeholder color
        }}
        onPress={() => {
          const mergedPost = {
            ...item,
            ...(item.community_post || {}),
            content: item.community_post?.content || item.base_text || item.summary,
            images: item.community_post?.images?.length
              ? item.community_post.images
              : (item.slides?.map((s: any) => ({ image: s.image_url })) || [{ image: item.hook_image }]),
            community_name: item.community_name || item.community_post?.community_name || "Community",
          };
          navigation.navigate("SocialPostDetailScreen", {
            post: mergedPost,
          });
        }}
      >
        {isVideo ? (
          <View style={{ width: COLUMN_WIDTH, height: item.height }}>
            <Video
              source={{ uri: item.hook_image }}
              style={{
                width: COLUMN_WIDTH,
                height: item.height,
                borderRadius: 12,
              }}
              resizeMode={ResizeMode.COVER}
              shouldPlay={isVisible}
              isMuted={true}
              isLooping={true}
            />
            {!isVisible && (
              <View style={{
                position: 'absolute',
                top: 10,
                right: 10,
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: 12,
                padding: 4,
                zIndex: 1
              }}>
                <Ionicons name="play" size={16} color="white" />
              </View>
            )}
          </View>
        ) : (
          <Image
            source={{ uri: item.hook_image }}
            style={{
              width: COLUMN_WIDTH,
              height: item.height,
              borderRadius: 12,
            }}
            resizeMode="cover"
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderListItem = ({ item }: { item: any }) => {
    // Merge the top-level explore item with the nested community_post
    // community_post usually contains more details like linked_item, full content, etc.
    const mergedPost = {
      ...item,
      ...(item.community_post || {}),
      // Ensure content and images are in the format SocialPostCard expects
      content: item.community_post?.content || item.base_text || item.summary,
      images: item.community_post?.images?.length
        ? item.community_post.images
        : (item.slides?.map((s: any) => ({ image: s.image_url })) || [{ image: item.hook_image }]),
      community_name: item.community_name || item.community_post?.community_name || "Community",
    };

    const isJoined = mergedPost.is_joined ||
      followed_communities.data.some((c: any) => {
        const cSlug = c.slug?.toLowerCase();
        const itemSlug = (mergedPost.community_slug || mergedPost.community?.slug || mergedPost.slug)?.toLowerCase();
        const cId = c.id?.toString();
        const itemId = (mergedPost.community_id || mergedPost.community?.id || mergedPost.community || mergedPost.id)?.toString();

        return (cSlug && itemSlug && cSlug === itemSlug) || (cId && itemId && cId === itemId);
      });

    const isVisible = viewableItems[item.id.toString()];

    return (
      <SocialPostCard
        post={{ ...mergedPost, is_joined: isJoined }}
        onComment={() => handleInteraction('comment', mergedPost)}
        onAskQuestion={() => handleInteraction('askQuestion', mergedPost)}
        onJoin={() => handleInteraction('followToggle', { ...mergedPost, is_joined: isJoined })}
        onUpvote={() => handleInteraction('upvote', mergedPost)}
        onDownvote={() => handleInteraction('downvote', mergedPost)}
        onSave={() => handleInteraction('save', mergedPost)}
        onUnsave={() => handleInteraction('unsave', mergedPost)}
        onHide={() => handleInteraction('hide', mergedPost)}
        onReport={(reason, details) => {
          dispatch(reportContent('post', mergedPost.id, reason, details) as any);
          Alert.alert("Reported", "Thank you for reporting. We will review this post.");
        }}
        onUserPress={() => { }} // Handle if needed
        isVisible={isVisible}
      />
    );
  };


  const renderShimmer = (height: number) => (
    <View
      style={{
        marginBottom: 12,
        borderRadius: 12,
        overflow: "hidden",
        width: COLUMN_WIDTH,
      }}
    >
      <ShimmerPlaceholder width={COLUMN_WIDTH} height={height} style={{ borderRadius: 12 }} />
    </View>
  );

  const renderListShimmer = () => (
    <View style={{ marginBottom: 20 }}>
      <ShimmerPlaceholder width="100%" height={250} style={{ borderRadius: 12 }} />
      <View style={{ padding: 15 }}>
        <ShimmerPlaceholder width="60%" height={20} style={{ marginBottom: 10 }} />
        <ShimmerPlaceholder width="90%" height={16} style={{ marginBottom: 6 }} />
        <ShimmerPlaceholder width="40%" height={16} />
      </View>
    </View>
  );

  const [gridScrollY, setGridScrollY] = useState(0);

  return (
    <View style={styles.container}>
      {showHeader && <Header />}


      {loading && items.length === 0 ? (
        viewMode === "grid" ? (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 15,
              paddingTop: 10,
            }}
          >
            <View style={{ width: COLUMN_WIDTH }}>
              {[200, 250, 180].map((h, i) => <View key={i}>{renderShimmer(h)}</View>)}
            </View>
            <View style={{ width: COLUMN_WIDTH }}>
              {[240, 190, 220].map((h, i) => <View key={i}>{renderShimmer(h)}</View>)}
            </View>
          </View>
        ) : (
          <FlatList
            data={[1, 2, 3]}
            renderItem={() => renderListShimmer()}
            keyExtractor={(it) => it.toString()}
            contentContainerStyle={{ padding: 15 }}
            scrollEnabled={false}
          />
        )
      ) : viewMode === "grid" ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={(e) => {
            activeHandleScroll?.(e);
            const scrollY = e.nativeEvent.contentOffset.y;
            setGridScrollY(scrollY);

            // Simple viewability logic for ScrollView grid
            const viewportTop = scrollY;
            const viewportBottom = scrollY + e.nativeEvent.layoutMeasurement.height;

            const newVisibleItems = { ...viewableItems };
            items.forEach((item: any) => {
              // This is an approximation since we don't have exact Y positions easily in ScrollView
              // but we can estimate based on height and columns.
              // For accuracy, we'd need onLayout for each item, but let's try a simpler approach:
              // For now, let's just use FlatList for list view and simple autoplay for all visible in ScrollView
              // To make it better, we'd need to use a better masonry component.
            });

            const paddingToBottom = 20;
            const isBottom = e.nativeEvent.layoutMeasurement.height + e.nativeEvent.contentOffset.y >= e.nativeEvent.contentSize.height - paddingToBottom;

            if (isBottom) {
              handleLoadMore();
            }
          }}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingTop: 110 }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 15,
              paddingTop: 10,
              paddingBottom: 10,
            }}
          >
            <View style={{ width: COLUMN_WIDTH }}>
              {leftColumn.map((item) => renderItem({ ...item, isVisible: true }))}
            </View>

            <View style={{ width: COLUMN_WIDTH }}>
              {rightColumn.map((item) => renderItem({ ...item, isVisible: true }))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          key={`explore-list-${items.length}`}
          data={items}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id.toString()}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          onScroll={activeHandleScroll}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          contentContainerStyle={{ paddingTop: 110 }}
          removeClippedSubviews={false}
          maintainVisibleContentPosition={null}
          ListFooterComponent={() =>
            isFetchingMore ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#D69E2E" />
                <Text style={{ marginTop: 10 }}>Loading more...</Text>
              </View>
            ) : <View style={{ height: 20 }} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {loading && <LoadingOverlay visible={true} text="Loading Explore..." />}
      {isFetchingMore && (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <LoadingOverlay visible={false} text="" />

          <Text>Loading more...</Text>
        </View>
      )}
    </View>
  );
}

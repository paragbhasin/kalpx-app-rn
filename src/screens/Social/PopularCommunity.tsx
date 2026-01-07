import React, { useEffect, useState, useCallback } from "react";
import { View, FlatList, ActivityIndicator, RefreshControl, StyleSheet, Text, Dimensions, Image, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Carousel from "react-native-reanimated-carousel";
import Ionicons from "react-native-vector-icons/Ionicons";

import { fetchPopularPosts, upvotePost, downvotePost, savePost, unsavePost, hidePost } from "../Feed/actions"
import { reportContent } from "../PostDetail/actions";
import { followCommunity, unfollowCommunity } from "../Social/actions";
import { fetchUserActivity } from "../UserActivity/actions";
import SocialPostCard from "../../components/SocialPostCard";

import ShimmerPlaceholder from "../../components/ShimmerPlaceholder";

const { width } = Dimensions.get("window");

const PopularCommunity = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const {
        popularPosts: posts,
        loadingPopular: loading,
        loadingMorePopular: loadingMore,
        error,
        popularPagination: pagination
    } = useSelector((state: any) => state.feed);
    const { followed_communities } = useSelector((state: any) => state.userActivity);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadFeed();
        dispatch(fetchUserActivity("followed_communities") as any);
    }, []);

    const loadFeed = (page = 1) => {
        dispatch(fetchPopularPosts(page) as any);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await dispatch(fetchPopularPosts(1) as any);
        setRefreshing(false);
    };

    const onLoadMore = () => {
        if (!loading && !loadingMore && pagination.currentPage < pagination.totalPages) {
            dispatch(fetchPopularPosts(pagination.currentPage + 1) as any);
        }
    };

    const handleInteraction = (type: string, post: any) => {
        // Dispatch actions based on type
        if (type === 'upvote') {
            dispatch(upvotePost(post.id) as any);
        } else if (type === 'downvote') {
            dispatch(downvotePost(post.id) as any);
        } else if (type === 'comment') {
            (navigation as any).navigate('SocialPostDetailScreen', { post: post });
        } else if (type === 'share') {
            // Share logic
        } else if (type === 'askQuestion') {
            (navigation as any).navigate('SocialPostDetailScreen', { post: post, isQuestion: true });
        } else if (type === 'save') {
            dispatch(savePost(post.id) as any);
        } else if (type === 'unsave') {
            dispatch(unsavePost(post.id) as any);
        } else if (type === 'hide') {
            dispatch(hidePost(post.id) as any);
        } else if (type === 'report') {
            const { reason, details } = post.reportData;
            dispatch(reportContent('post', post.id, reason, details) as any);
        } else if (type === 'followToggle') {
            const communityId = post.community?.slug || post.community_slug || post.community?.id?.toString();
            if (communityId) {
                if (post.is_joinedValue ?? post.is_joined) {
                    dispatch(unfollowCommunity(communityId) as any);
                } else {
                    dispatch(followCommunity(communityId) as any);
                }
            }
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const isJoined = item.is_joined ||
            followed_communities.data.some((c: any) => {
                const cSlug = c.slug?.toLowerCase();
                const itemSlug = (item.community_slug || item.community?.slug || item.slug)?.toLowerCase();
                const cId = c.id?.toString();
                const itemId = (item.community_id || item.community?.id || item.community)?.toString();

                return (cSlug && itemSlug && cSlug === itemSlug) || (cId && itemId && cId === itemId);
            });

        return (
            <SocialPostCard
                post={{ ...item, is_joined: isJoined }}
                onUpvote={() => handleInteraction('upvote', item)}
                onDownvote={() => handleInteraction('downvote', item)}
                onComment={() => handleInteraction('comment', item)}
                onShare={() => handleInteraction('share', item)}
                onAskQuestion={() => handleInteraction('askQuestion', item)}
                onUserPress={() => {
                    // Navigate to community or profile?
                    // if (item.community_slug) navigation.navigate('CommunityDetail', { slug: item.community_slug });
                }}
                onJoin={() => handleInteraction('followToggle', { ...item, is_joinedValue: isJoined })}
                onSave={() => handleInteraction('save', item)}
                onUnsave={() => handleInteraction('unsave', item)}
                onHide={() => handleInteraction('hide', item)}
                onReport={(reason, details) => handleInteraction('report', { ...item, reportData: { reason, details } })}
            />
        );
    };

    const renderShimmer = () => (
        <View style={{ marginBottom: 20 }}>
            <ShimmerPlaceholder width="100%" height={250} style={{ borderRadius: 12 }} />
            <View style={{ padding: 15 }}>
                <ShimmerPlaceholder width="60%" height={20} style={{ marginBottom: 10 }} />
                <ShimmerPlaceholder width="90%" height={16} style={{ marginBottom: 6 }} />
                <ShimmerPlaceholder width="40%" height={16} />
            </View>
        </View>
    );

    const getPostImage = (post: any) => {
        if (post.images && post.images.length > 0) {
            const first = post.images[0];
            return first.image_url || first.image || (typeof first === 'string' ? first : null);
        }
        return post.hook_image || null;
    };

    const CarouselItem = ({ item }: { item: any }) => {
        const imageUrl = getPostImage(item);
        if (!imageUrl) return null;

        return (
            <TouchableOpacity
                style={styles.carouselItem}
                onPress={() => (navigation as any).navigate('SocialPostDetailScreen', { post: item })}
            >
                <Image source={{ uri: imageUrl }} style={styles.carouselImage} />
                {/* <View style={styles.carouselOverlay}>
                    <Text style={styles.carouselTitle} numberOfLines={2}>{item.title}</Text>
                </View> */}
            </TouchableOpacity>
        );
    };

    const CarouselHeader = () => {
        // Filter posts that have at least one valid image
        const carouselPosts = posts.filter((p: any) => !!getPostImage(p)).slice(0, 5);
        const carouselRef = React.useRef(null);

        if (carouselPosts.length === 0) return null;

        return (
            <View style={styles.carouselContainer}>
                <View style={styles.carouselWrapper}>
                    <Carousel
                        ref={carouselRef}
                        loop
                        width={width}
                        height={240}
                        autoPlay={false}
                        data={carouselPosts}
                        scrollAnimationDuration={500}
                        renderItem={({ item }) => <CarouselItem item={item} />}
                        mode="parallax"
                        modeConfig={{
                            parallaxScrollingScale: 0.9,
                            parallaxScrollingOffset: 80,
                        }}
                    />
                    {/* Left Arrow */}
                    <TouchableOpacity
                        style={[styles.arrowButton, styles.leftArrow]}
                        onPress={() => (carouselRef.current as any)?.prev()}
                    >
                        <Ionicons name="chevron-back" size={28} color="#333" />
                    </TouchableOpacity>

                    {/* Right Arrow */}
                    <TouchableOpacity
                        style={[styles.arrowButton, styles.rightArrow]}
                        onPress={() => (carouselRef.current as any)?.next()}
                    >
                        <Ionicons name="chevron-forward" size={28} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const Footer = () => {
        if (loadingMore) {
            return <ActivityIndicator style={{ padding: 20 }} size="small" color="#D69E2E" />;
        }
        return <View style={{ height: 20 }} />;
    }

    if (loading && !refreshing && posts.length === 0) {
        return (
            <View style={styles.container}>
                <FlatList
                    data={[1, 2, 3]}
                    renderItem={renderShimmer}
                    keyExtractor={(it) => it.toString()}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    scrollEnabled={false}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={posts}
                ListHeaderComponent={CarouselHeader}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#D69E2E"]} />
                }
                onEndReached={onLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={Footer}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    carouselContainer: {
        paddingVertical: 16,
    },
    carouselWrapper: {
        width: '100%',
        height: 240,
    },
    carouselItem: {
        width: width * 0.82,   // show side peek
        height: 240,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#eee',
        marginHorizontal: 8,
    },
    carouselImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    carouselOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 14,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    carouselTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    arrowButton: {
        position: 'absolute',
        top: '50%',
        transform: [{ translateY: -22 }],
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
    },
    leftArrow: {
        left: 16,
    },
    rightArrow: {
        right: 16,
    },
});

export default PopularCommunity;

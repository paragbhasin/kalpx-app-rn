import React, { useEffect, useState, useCallback } from "react";
import { View, FlatList, ActivityIndicator, RefreshControl, StyleSheet, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { fetchFeed, upvotePost, downvotePost, savePost, unsavePost, hidePost } from "./actions"; // Import from local actions
import { reportContent } from "../PostDetail/actions";
import { followCommunity, unfollowCommunity } from "../Social/actions";
import { fetchUserActivity } from "../UserActivity/actions";
import SocialPostCard from "../../components/SocialPostCard";


import ShimmerPlaceholder from "../../components/ShimmerPlaceholder";

const FeedScreen = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const { posts, loading, loadingMore, error, pagination } = useSelector((state: any) => state.feed);
    const { followed_communities } = useSelector((state: any) => state.userActivity);
    const [refreshing, setRefreshing] = useState(false);


    useEffect(() => {
        loadFeed();
        dispatch(fetchUserActivity("followed_communities") as any);
    }, []);


    const loadFeed = (page = 1) => {
        dispatch(fetchFeed(page) as any);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await dispatch(fetchFeed(1) as any);
        setRefreshing(false);
    };

    const onLoadMore = () => {
        if (!loading && !loadingMore && pagination.currentPage < pagination.totalPages) {
            dispatch(fetchFeed(pagination.currentPage + 1) as any);
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
            {/* If you want a header here, include it */}

            <FlatList
                data={posts}
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
        backgroundColor: '#ffffffff'
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default FeedScreen;

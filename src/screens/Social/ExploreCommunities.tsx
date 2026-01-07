import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchCommunities, followCommunity, unfollowCommunity } from "./actions";
import { fetchUserActivity } from "../UserActivity/actions";
import ShimmerPlaceholder from "../../components/ShimmerPlaceholder";
import styles from "./ExploreCommunitiesStyles";

const ExploreCommunities = () => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState<"all" | "followed">("all");
    const [refreshing, setRefreshing] = useState(false);

    const { data: communities, loading, pagination } = useSelector(
        (state: any) => state.communities
    );
    const { followed_communities } = useSelector((state: any) => state.userActivity);

    useEffect(() => {
        loadCommunities();
        dispatch(fetchUserActivity("followed_communities") as any);
    }, [dispatch]);


    useEffect(() => {
        if (activeTab === "followed") {
            dispatch(fetchUserActivity("followed_communities") as any);
        }
    }, [activeTab, dispatch]);

    const loadCommunities = (page = 1) => {
        dispatch(fetchCommunities(page) as any);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        if (activeTab === "all") {
            await dispatch(fetchCommunities(1) as any);
        } else {
            await dispatch(fetchUserActivity("followed_communities") as any);
        }
        setRefreshing(false);
    };

    const handleLoadMore = () => {
        if (!loading && pagination.currentPage < pagination.totalPages) {
            loadCommunities(pagination.currentPage + 1);
        }
    };

    const handleFollowToggle = (community: any) => {
        const isFollowed = community.is_followed ||
            followed_communities.data.some((c: any) => {
                const cSlug = c.slug?.toLowerCase();
                const itemSlug = (community.slug || community.community_slug)?.toLowerCase();
                const cId = c.id?.toString();
                const itemId = (community.id || community.community_id || community.community)?.toString();

                return (cSlug && itemSlug && cSlug === itemSlug) || (cId && itemId && cId === itemId);
            });


        if (isFollowed) {
            dispatch(unfollowCommunity(community.slug) as any);
        } else {
            dispatch(followCommunity(community.slug) as any);
        }
    };


    const filteredCommunities = activeTab === "all"
        ? communities
        : followed_communities.data.map((c: any) => ({ ...c, is_followed: true }));

    const isLoading = activeTab === "all" ? loading : followed_communities.loading;

    const renderCommunityCard = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.communityInfo}>
                    <Text style={styles.communityName}>{item.name}</Text>
                    <Text style={styles.visitorCount}>
                        {item.weekly_visitors || Math.floor(Math.random() * 50 + 50)}k weekly visitors
                    </Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.joinButton,
                        (item.is_followed || followed_communities.data.some((c: any) => {
                            const cSlug = c.slug?.toLowerCase();
                            const itemSlug = (item.slug || item.community_slug)?.toLowerCase();
                            const cId = c.id?.toString();
                            const itemId = (item.id || item.community_id || item.community)?.toString();
                            return (cSlug && itemSlug && cSlug === itemSlug) || (cId && itemId && cId === itemId);
                        })) && styles.joinedButton,
                    ]}
                    onPress={() => handleFollowToggle(item)}
                >
                    <Text style={[styles.joinText, (item.is_followed || followed_communities.data.some((c: any) => {
                        const cSlug = c.slug?.toLowerCase();
                        const itemSlug = (item.slug || item.community_slug)?.toLowerCase();
                        const cId = c.id?.toString();
                        const itemId = (item.id || item.community_id || item.community)?.toString();
                        return (cSlug && itemSlug && cSlug === itemSlug) || (cId && itemId && cId === itemId);
                    })) && styles.joinedText]}>
                        {(item.is_followed || followed_communities.data.some((c: any) => {
                            const cSlug = c.slug?.toLowerCase();
                            const itemSlug = (item.slug || item.community_slug)?.toLowerCase();
                            const cId = c.id?.toString();
                            const itemId = (item.id || item.community_id || item.community)?.toString();
                            return (cSlug && itemSlug && cSlug === itemSlug) || (cId && itemId && cId === itemId);
                        })) ? "Joined" : "Join"}
                    </Text>
                </TouchableOpacity>


            </View>
            <Text style={styles.description} numberOfLines={3}>
                {item.description || "Share festival memories, meanings, and ways to keep their sacred essence alive."}
            </Text>
        </View>
    );

    const renderShimmer = () => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.communityInfo}>
                    <ShimmerPlaceholder width={150} height={20} style={{ marginBottom: 4 }} />
                    <ShimmerPlaceholder width={100} height={14} />
                </View>
                <ShimmerPlaceholder width={80} height={32} style={{ borderRadius: 12 }} />
            </View>
            <ShimmerPlaceholder width="100%" height={16} style={{ marginBottom: 6, marginTop: 10 }} />
            <ShimmerPlaceholder width="90%" height={16} style={{ marginBottom: 6 }} />
            <ShimmerPlaceholder width="40%" height={16} />
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Explore Communities</Text>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "all" && styles.activeTab]}
                    onPress={() => setActiveTab("all")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "all" && styles.activeTabText,
                        ]}
                    >
                        All
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "followed" && styles.activeTab]}
                    onPress={() => setActiveTab("followed")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "followed" && styles.activeTabText,
                        ]}
                    >
                        Followed by me
                    </Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>
                {activeTab === "all" ? "Recommended for you" : "Communities you follow"}
            </Text>

            {isLoading && filteredCommunities.length === 0 ? (
                <FlatList
                    data={[1, 2, 3, 4, 5]}
                    renderItem={renderShimmer}
                    keyExtractor={(it) => it.toString()}
                    contentContainerStyle={styles.listContent}
                    scrollEnabled={false}
                />
            ) : (
                <FlatList
                    data={filteredCommunities}
                    renderItem={renderCommunityCard}
                    keyExtractor={(item) => (item.id || item.slug).toString()}
                    contentContainerStyle={styles.listContent}
                    onEndReached={activeTab === "all" ? handleLoadMore : null}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#D69E2E"]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {activeTab === "followed"
                                    ? "You haven't followed any communities yet."
                                    : "No communities found."}
                            </Text>
                        </View>
                    }
                    ListFooterComponent={
                        isLoading && filteredCommunities.length > 0 ? (
                            <ActivityIndicator
                                size="small"
                                color="#D69E2E"
                                style={{ marginVertical: 20 }}
                            />
                        ) : null
                    }
                />
            )}
        </View>
    );
};

export default ExploreCommunities;

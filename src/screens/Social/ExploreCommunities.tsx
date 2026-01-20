import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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

import { useNavigation } from "@react-navigation/native";

const ExploreCommunities = ({ onScroll }: { onScroll?: (event: any) => void }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigation = useNavigation<any>();
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

    const loadCommunities = React.useCallback((page = 1) => {
        dispatch(fetchCommunities(page) as any);
    }, [dispatch]);

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

    const followedSet = React.useMemo(() => {
        const set = new Set();
        if (followed_communities?.data) {
            followed_communities.data.forEach((c: any) => {
                if (c.slug) set.add(c.slug.toLowerCase());
                if (c.id) set.add(c.id.toString());
            });
        }
        return set;
    }, [followed_communities.data]);

    const filteredCommunities = React.useMemo(() => {
        const raw = activeTab === "all"
            ? communities
            : (followed_communities?.data || []).map((c: any) => ({ ...c, is_followed: true }));

        return raw.map((item: any) => {
            const isFollowed = item.is_followed ||
                followedSet.has(item.slug?.toLowerCase()) ||
                followedSet.has(item.community_slug?.toLowerCase()) ||
                followedSet.has(item.id?.toString()) ||
                followedSet.has(item.community_id?.toString()) ||
                followedSet.has(item.community?.toString());
            return { ...item, is_followed: isFollowed };
        });
    }, [communities, followed_communities.data, activeTab, followedSet]);

    const handleFollowToggle = React.useCallback((community: any) => {
        const isFollowed = community.is_followed ||
            followedSet.has(community.slug?.toLowerCase()) ||
            followedSet.has(community.community_slug?.toLowerCase()) ||
            followedSet.has(community.id?.toString()) ||
            followedSet.has(community.community_id?.toString()) ||
            followedSet.has(community.community?.toString());

        if (isFollowed) {
            dispatch(unfollowCommunity(community.slug) as any);
        } else {
            dispatch(followCommunity(community.slug) as any);
        }
    }, [dispatch, followedSet]);

    const isLoading = activeTab === "all" ? loading : followed_communities.loading;

    const renderCommunityCard = React.useCallback(({ item }: { item: any }) => {
        const isFollowed = item.is_followed;

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <TouchableOpacity
                        style={styles.communityInfo}
                        onPress={() => navigation.navigate("CommunityDetail", { slug: item.slug })}
                    >
                        <Text style={styles.communityName}>{item.name}</Text>
                        <Text style={styles.visitorCount}>
                            {t("community.weeklyVisitors", { count: item.weekly_visitors || Math.floor(Math.random() * 50 + 50) })}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.joinButton,
                            isFollowed && styles.joinedButton,
                        ]}
                        onPress={() => handleFollowToggle(item)}
                    >
                        <Text style={[styles.joinText, isFollowed && styles.joinedText]}>
                            {isFollowed ? t("community.joined") : t("community.join")}
                        </Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate("CommunityDetail", { slug: item.slug })}
                >
                    <Text style={styles.description} numberOfLines={3}>
                        {item.description || "Share festival memories, meanings, and ways to keep their sacred essence alive."}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }, [navigation, t, handleFollowToggle]);


    const renderShimmer = React.useCallback(() => (
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
    ), []);

    return (
        <View style={styles.container}>
            {isLoading && filteredCommunities.length === 0 ? (
                <FlatList
                    data={[1, 2, 3, 4, 5]}
                    renderItem={renderShimmer}
                    keyExtractor={(it) => it.toString()}
                    contentContainerStyle={[styles.listContent, { paddingTop: 110 }]}
                    scrollEnabled={false}
                    ListHeaderComponent={
                        <>
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

                                        {t("community.tabs.all")}
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

                                        {t("community.tabs.followed")}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.sectionTitle}>
                                {activeTab === "all" ? t("community.sections.recommended") : t("community.sections.following")}
                            </Text>
                        </>
                    }
                />
            ) : (
                <FlatList
                    data={filteredCommunities}
                    renderItem={renderCommunityCard}
                    keyExtractor={(item) => (item.id || item.slug || item.name).toString()}
                    style={{ flex: 1 }}
                    contentContainerStyle={[styles.listContent, { paddingTop: 110 }]}
                    onEndReached={activeTab === "all" ? handleLoadMore : null}
                    onEndReachedThreshold={0.5}
                    onScroll={onScroll}
                    scrollEventThrottle={16}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    initialNumToRender={5}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#D69E2E"]}
                        />
                    }
                    ListHeaderComponent={
                        <>
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

                                        {t("community.tabs.all")}
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

                                        {t("community.tabs.followed")}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.sectionTitle}>
                                {activeTab === "all" ? t("community.sections.recommended") : t("community.sections.following")}
                            </Text>
                        </>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {activeTab === "followed"
                                    ? t("community.empty.noFollowed")
                                    : t("community.empty.noResults")}
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

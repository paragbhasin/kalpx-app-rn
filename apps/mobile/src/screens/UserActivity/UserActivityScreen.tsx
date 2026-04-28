import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ScrollView,
    ActivityIndicator,
    Dimensions,
    Alert
} from "react-native";
import { Image } from "expo-image";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";

import { fetchUserActivity } from "./actions";
import { fetchProfileDetails } from "../Profile/actions";
import SocialPostCard from "../../components/SocialPostCard";
import { upvotePost, downvotePost, savePost, unsavePost, hidePost } from "../Feed/actions";
import { reportContent } from "../PostDetail/actions";
import { followCommunity, unfollowCommunity, deletePost } from "../Social/actions";
import { RootState } from "../../store";

import Colors from "../../components/Colors";


const TAB_TO_TYPE: Record<string, string> = {
    overview: "my_posts",
    post: "my_posts",
    questions: "my_questions",
    comments: "my_comments",
    useful: "useful_marks",
    saved: "saved_posts",
    hidden: "hidden_posts",
    upvoted: "upvotes",
    downvoted: "downvotes"
};

const UserActivityScreen = ({ onScroll }: { onScroll?: (event: any) => void }) => {
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    const navigation = useNavigation<any>();
    const [activeTab, setActiveTab] = useState("overview");

    const userActivity = useSelector((state: any) => state.userActivity || {});
    const profileDetails = useSelector((state: RootState) => state.profileDetailsReducer);

    const stats = userActivity?.stats?.data || {};

    const tabs = [
        { id: "overview", label: t("community.activity.tabs.overview") },
        { id: "post", label: t("community.activity.tabs.post") },
        { id: "questions", label: t("community.activity.tabs.questions") },
        { id: "comments", label: t("community.activity.tabs.comments") },
        { id: "useful", label: t("community.activity.tabs.useful") },
        { id: "saved", label: t("community.activity.tabs.saved") },
        { id: "hidden", label: t("community.activity.tabs.hidden") },
        { id: "upvoted", label: t("community.activity.tabs.upvoted") },
        { id: "downvoted", label: t("community.activity.tabs.downvoted") },
    ];

    useEffect(() => {
        if (!profileDetails.data) {
            dispatch(fetchProfileDetails(() => { }) as any);
        }
        dispatch(fetchUserActivity("stats") as any);
        dispatch(fetchUserActivity("followed_communities") as any);
    }, [dispatch]);

    useEffect(() => {
        const type = TAB_TO_TYPE[activeTab];
        if (type) {
            dispatch(fetchUserActivity(type) as any);
        }
    }, [dispatch, activeTab]);

    const handleInteraction = (type: string, post: any) => {
        const postId = post.id || post.post_id;
        if (!postId) return;

        if (type === 'upvote') {
            dispatch(upvotePost(postId) as any);
        } else if (type === 'downvote') {
            dispatch(downvotePost(postId) as any);
        } else if (type === 'comment') {
            navigation.navigate('SocialPostDetailScreen', { post: post });
        } else if (type === 'askQuestion') {
            navigation.navigate('SocialPostDetailScreen', { post: post, isQuestion: true });
        } else if (type === 'save') {
            dispatch(savePost(postId) as any);
        } else if (type === 'unsave') {
            dispatch(unsavePost(postId) as any);
        } else if (type === 'hide') {
            dispatch(hidePost(postId) as any);
        } else if (type === 'report') {
            const { reason, details } = post.reportData || {};
            dispatch(reportContent('post', postId, reason, details) as any);
        } else if (type === 'followToggle') {
            const communityId = post.community?.slug || post.community_slug || post.community?.id?.toString();
            if (communityId) {
                const isJoined = (post.is_joinedValue ?? post.is_joined);
                if (isJoined) {
                    dispatch(unfollowCommunity(communityId) as any);
                } else {
                    dispatch(followCommunity(communityId) as any);
                }
            }
        } else if (type === 'edit') {
            navigation.navigate('CreateSocialPost', { post: post });
        } else if (type === 'delete') {
            Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const res: any = await dispatch(deletePost(postId) as any);
                        if (res.success) {
                            const typeToRefetch = TAB_TO_TYPE[activeTab];
                            if (typeToRefetch) {
                                dispatch(fetchUserActivity(typeToRefetch) as any);
                            }
                        } else {
                            Alert.alert("Error", res.error || "Failed to delete post.");
                        }
                    }
                }
            ]);
        }
    };

    const renderActivityItem = ({ item }: { item: any }) => {
        const followedCommunities = userActivity?.followed_communities?.data || [];
        const isJoined = item.is_joined ||
            followedCommunities.some((c: any) => {
                const cSlug = c.slug?.toLowerCase();
                const itemSlug = (item.community_slug || item.community?.slug || item.slug)?.toLowerCase();
                const cId = c.id?.toString();
                const itemId = (item.community_id || item.community?.id || item.community)?.toString();
                return (cSlug && itemSlug && cSlug === itemSlug) || (cId && itemId && cId === itemId);
            });

        return (
            <View style={styles.itemWrapper}>
                {item.is_useful_mark && (
                    <View style={styles.usefulMarkHeader}>
                        <View style={styles.usefulMarkRow}>
                            <Text style={styles.usefulMarkTitle}>{t("community.activity.markedUseful")}</Text>
                            <Text style={styles.dotSeparator}>•</Text>
                            <Text style={styles.markedTime}>{moment(item.marked_useful_at).locale(i18n.language?.split("-")[0] || "en").fromNow()}</Text>
                        </View>
                        <Text style={styles.usefulCommentText}>"{item.comment?.content}"</Text>
                    </View>
                )}
                <SocialPostCard
                    post={{ ...item, is_joined: isJoined }}
                    onUpvote={() => handleInteraction('upvote', item)}
                    onDownvote={() => handleInteraction('downvote', item)}
                    onComment={() => handleInteraction('comment', item)}
                    onShare={() => handleInteraction('share', item)}
                    onAskQuestion={() => handleInteraction('askQuestion', item)}
                    onUserPress={() => { }}
                    onJoin={() => handleInteraction('followToggle', { ...item, is_joinedValue: isJoined })}
                    onSave={() => handleInteraction('save', item)}
                    onUnsave={() => handleInteraction('unsave', item)}
                    onHide={() => handleInteraction('hide', item)}
                    onReport={(reason, details) => handleInteraction('report', { ...item, reportData: { reason, details } })}
                    onEdit={() => handleInteraction('edit', item)}
                    onDelete={() => handleInteraction('delete', item)}
                />
            </View>
        );
    };

    const userProfile = profileDetails.data?.profile || {};

    const filteredActivity = () => {
        const type = TAB_TO_TYPE[activeTab];
        return userActivity[type]?.data || [];
    };

    const isLoadingState = () => {
        const type = TAB_TO_TYPE[activeTab];
        return userActivity[type]?.loading || userActivity?.stats?.loading;
    };

    const data = filteredActivity();

    return (
        <View style={styles.container}>
            <FlatList
                data={data}
                renderItem={renderActivityItem}
                keyExtractor={(item, index) => `${item._activity_id || item.id || 'activity'}-${index}`}
                ListHeaderComponent={
                    <View style={styles.headerContainer}>
                        {/* Profile Header */}
                        <View style={styles.profileHeader}>
                            <View style={styles.profileInfo}>
                                <Image
                                    source={{ uri: userProfile.avatar || `https://ui-avatars.com/api/?name=${userProfile.profile_name || 'User'}` }}
                                    style={styles.avatar}
                                />
                                <View>
                                    <Text style={styles.displayName}>{userProfile.profile_name || "User"}</Text>
                                    <Text style={styles.usernameText}>{userProfile.user?.username || "user"}</Text>
                                </View>
                            </View>
                            {/* <TouchableOpacity style={styles.createPostBtn} onPress={() => navigation.navigate("CreateSocialPost")}>
                                <Text style={styles.plusSign}>+</Text>
                                <Text style={styles.createPostText}>Create post</Text>
                            </TouchableOpacity> */}
                        </View>

                        {/* Stats Row */}
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{stats.karma || 1}</Text>
                                <Text style={styles.statLabel}>{t("community.activity.stats.karma")}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{(stats.posts_count || 0) + (stats.comments_count || 0) || 1}</Text>
                                <Text style={styles.statLabel}>{t("community.activity.stats.contribution")}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{stats.days_active ?? 0} d</Text>
                                <Text style={styles.statLabel}>{t("community.activity.stats.onKalpx")}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <View style={styles.activeInRow}>
                                    <Text style={styles.statValue}>{stats.communities_active || 0}</Text>
                                </View>
                                <Text style={styles.statLabel}>{t("community.activity.stats.activeIn")} {'>'}</Text>
                            </View>
                        </View>

                        {/* Tabs */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
                            {tabs.map((tab) => (
                                <TouchableOpacity
                                    key={tab.id}
                                    style={styles.tabButton}
                                    onPress={() => setActiveTab(tab.id)}
                                >
                                    <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                                        {tab.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                }
                ListHeaderComponentStyle={styles.listHeader}
                ListEmptyComponent={
                    isLoadingState() ? (
                        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.Colors.App_theme} />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyTitle}>{t("community.activity.empty.title")}</Text>
                                <Text style={styles.emptySubtitle}>
                                    {t("community.activity.empty.subtitle")}
                                </Text>
                            </View>
                        </View>
                    )
                }
                onScroll={onScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingBottom: 20, paddingTop: 110 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    headerContainer: {
        paddingHorizontal: 16,
        // paddingTop: 16,
    },
    listHeader: {
        marginBottom: 8,
    },
    profileHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    profileInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#eee",
        borderWidth: 2,
        borderColor: "#fff",
    },
    displayName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#111",
    },
    usernameText: {
        fontSize: 14,
        color: "#999",
    },
    createPostBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: Colors.Colors.App_theme,
        gap: 6,
    },
    plusSign: {
        fontSize: 18,
        color: Colors.Colors.App_theme,
        fontWeight: "bold",
        marginTop: -2,
    },
    createPostText: {
        color: Colors.Colors.App_theme,
        fontWeight: "bold",
        fontSize: 14,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: Colors.Colors.header_bg,
        padding: 12,
        borderRadius: 8,
        marginBottom: 24,
    },
    statItem: {
        alignItems: "flex-start",
    },
    activeInRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    statValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#111",
    },
    statLabel: {
        fontSize: 12,
        color: "#999",
        fontWeight: "500",
        marginTop: 2,
    },
    tabsScroll: {
        marginBottom: 8,
    },
    tabButton: {
        marginRight: 20,
        paddingVertical: 8,
    },
    tabText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#8E8D8D",
    },
    activeTabText: {
        color: Colors.Colors.App_theme,
    },
    itemWrapper: {
        marginBottom: 16,
    },
    usefulMarkHeader: {
        backgroundColor: "#FFF9E6",
        marginHorizontal: 16,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#FFE082",
        marginBottom: -12,
        zIndex: 1,
    },
    usefulMarkRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    usefulMarkTitle: {
        fontSize: 11,
        fontWeight: "800",
        color: "#B8860B",
        letterSpacing: 0.5,
    },
    dotSeparator: {
        marginHorizontal: 6,
        color: "#ccc",
    },
    markedTime: {
        fontSize: 11,
        color: "#999",
    },
    usefulCommentText: {
        fontSize: 13,
        color: "#444",
        fontStyle: "italic",
    },
    emptyContainer: {
        flex: 1,
        padding: 40,
        alignItems: "center",
    },
    emptyBox: {
        alignItems: "center",
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111",
        textAlign: "center",
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
        lineHeight: 20,
    },
});

export default UserActivityScreen;

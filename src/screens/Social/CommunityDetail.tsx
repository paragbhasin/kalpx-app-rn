import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    Dimensions,
    ScrollView,
    Modal,
    Alert,
    Animated,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { fetchCommunityDetail, fetchCommunityPosts, followCommunity, unfollowCommunity, deletePost } from "./actions";
import { votePostDetail, savePostDetail, unsavePostDetail, hidePostDetail, reportContent } from "../PostDetail/actions";
import SocialPostCard from "../../components/SocialPostCard";
import Header from "../../components/Header";
import { COMMUNITY_BACKGROUNDS } from "../../utils/CommunityAssets";
import { fetchUserActivity } from "../UserActivity/actions";
import { useScrollContext } from "../../context/ScrollContext";

const { width } = Dimensions.get("window");

const CommunityDetail = () => {
    const { i18n } = useTranslation();
    const { handleScroll, headerY } = useScrollContext();
    const dispatch = useDispatch();
    const navigation = useNavigation<any>();
    const [showMenu, setShowMenu] = useState(false);
    const [menuPos, setMenuPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
    const filterRef = useRef<any>(null);
    const [sortBy, setSortBy] = useState<'new' | 'top' | 'hot'>('new');
    const route = useRoute();
    const { slug } = route.params as { slug: string };

    const { communityDetail, communityPosts } = useSelector((state: any) => state.communities);
    const { followed_communities } = useSelector((state: any) => state.userActivity);

    const [activeTab, setActiveTab] = useState<"Feed" | "About">("Feed");
    const [expandedRules, setExpandedRules] = useState<number[]>([]);
    useEffect(() => {
        dispatch(fetchCommunityDetail(slug, i18n.language) as any);
        dispatch(fetchCommunityPosts(slug, 1, sortBy, i18n.language) as any);
    }, [dispatch, slug, sortBy, i18n.language]);

    const getTranslatedContent = (item: any, field: string) => {
        const language = i18n.language;
        if (language === "en" || !item[`resolved_${field}`]) {
            return item[field];
        }
        return item[`resolved_${field}`] || item[field];
    };

    const community = communityDetail.data;
    const translatedCommunityName = community ? getTranslatedContent(community, 'name') : "Community";
    const translatedCommunityDescription = community ? getTranslatedContent(community, 'description') : "";
    const posts = communityPosts.data;
    const loading = communityDetail.loading || (communityPosts.loading && communityPosts.pagination.currentPage === 1);

    const isJoined = followed_communities.data.some((c: any) => {
        const cSlug = c.slug?.toLowerCase();
        const itemSlug = slug?.toLowerCase();
        const cId = c.id?.toString();
        const itemId = community?.id?.toString();

        return (cSlug && itemSlug && cSlug === itemSlug) || (cId && itemId && cId === itemId);
    });

    const handleJoin = async () => {
        if (isJoined) {
            await dispatch(unfollowCommunity(slug) as any);
        } else {
            await dispatch(followCommunity(slug) as any);
        }
        // Refresh followed communities to sync state
        dispatch(fetchUserActivity("followed_communities") as any);
    };

    const handleLoadMore = () => {
        if (!communityPosts.loading && communityPosts.pagination.currentPage < communityPosts.pagination.totalPages) {
            dispatch(fetchCommunityPosts(slug, communityPosts.pagination.currentPage + 1, sortBy, i18n.language) as any);
        }
    };

    const toggleRule = (index: number) => {
        setExpandedRules((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    const handleInteraction = (type: string, post: any) => {
        switch (type) {
            case 'comment':
                navigation.navigate('SocialPostDetailScreen', { post: post });
                break;
            case 'askQuestion':
                navigation.navigate('SocialPostDetailScreen', { post: post, isQuestion: true });
                break;
            case 'upvote':
                dispatch(votePostDetail(post.id, 'upvote') as any);
                break;
            case 'downvote':
                dispatch(votePostDetail(post.id, 'downvote') as any);
                break;
            case 'save':
                dispatch(savePostDetail(post.id) as any);
                break;
            case 'unsave':
                dispatch(unsavePostDetail(post.id) as any);
                break;
            case 'hide':
                dispatch(hidePostDetail(post.id) as any);
                break;
            case 'report':
                // report is handled via onReport prop which receives reason and details
                break;
            case 'edit':
                navigation.navigate('CreateSocialPost', { post: post });
                break;
            case 'delete':
                Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                            const res: any = await dispatch(deletePost(post.id) as any);
                            if (res.success) {
                                // Refresh posts
                                dispatch(fetchCommunityPosts(slug, 1, sortBy, i18n.language) as any);
                            } else {
                                Alert.alert("Error", res.error || "Failed to delete post");
                            }
                        }
                    }
                ]);
                break;
        }
    };

    const getPostImage = (post: any) => {
        if (post.images && post.images.length > 0) {
            const firstImage = post.images[0];
            return firstImage.image_url || firstImage.image || firstImage;
        }
        return post.hook_image || post.image_url || post.image;
    };

    const highlightPosts = posts.filter((p: any) => getPostImage(p)).slice(0, 5);

    const renderHeader = () => (
        <View style={styles.communityHeader}>

            <View style={styles.headerContent}>
                <View style={styles.avatarWrapper}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={COMMUNITY_BACKGROUNDS[slug] || { uri: "https://via.placeholder.com/400x150" }}
                            style={styles.avatar}
                        />
                    </View>
                </View>
                <View style={styles.communityInfo}>
                    <Text style={styles.communityName}>{translatedCommunityName}</Text>
                    <View style={styles.statsRow}>
                        <Text style={styles.statsText}>Followers:{community?.follower_count || 0}</Text>
                        <Text style={[styles.statsText, { marginLeft: 16 }]}>Posts:{community?.post_count || 0}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.joinButton, isJoined && styles.joinedButton]}
                        onPress={handleJoin}
                    >
                        <Text style={[styles.joinButtonText, isJoined && styles.joinedButtonText]}>
                            {isJoined ? "Joined" : "Join"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                style={styles.createPostButton}
                onPress={() => navigation.navigate("CreateSocialPost", { communitySlug: slug })}
            >
                <Ionicons name="add" size={20} color="#000" />
                <Text style={styles.createPostText}>create post</Text>
            </TouchableOpacity>

            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "Feed" && styles.activeTab]}
                    onPress={() => setActiveTab("Feed")}
                >
                    <Text style={[styles.tabText, activeTab === "Feed" && styles.activeTabText]}>Feed</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "About" && styles.activeTab]}
                    onPress={() => setActiveTab("About")}
                >
                    <Text style={[styles.tabText, activeTab === "About" && styles.activeTabText]}>About</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }} />
                <TouchableOpacity
                    ref={filterRef}
                    style={styles.filterButton}
                    onPress={() => {
                        filterRef.current?.measureInWindow((x, y, width, height) => {
                            setMenuPos({
                                top: y + height + 6,
                                right: 16,
                            });
                            setShowMenu(true);
                        });
                    }}
                >
                    <Ionicons name="filter" size={20} color="#000" />
                </TouchableOpacity>
            </View>
            <Modal
                visible={showMenu}
                transparent
                animationType="fade"
                onRequestClose={() => setShowMenu(false)}
            >
                <TouchableOpacity
                    style={styles.menuBackdrop}
                    activeOpacity={1}
                    onPress={() => setShowMenu(false)}
                />

                <View style={[styles.menuContainer, { top: menuPos.top, right: menuPos.right }]}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            setSortBy('new');
                            setShowMenu(false);
                        }}
                    >
                        <Text style={[
                            styles.menuItemText,
                            sortBy === 'new' && { color: '#D69E2E', fontWeight: '700' },
                        ]}

                        >New</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            setSortBy('top');
                            setShowMenu(false);
                        }}
                    >
                        <Text style={[
                            styles.menuItemText,
                            sortBy === 'top' && { color: '#D69E2E', fontWeight: '700' },
                        ]}>Top</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomWidth: 0 }]}
                        onPress={() => {
                            setSortBy('hot');
                            setShowMenu(false);
                        }}
                    >
                        <Text style={[
                            styles.menuItemText,
                            sortBy === 'hot' && { color: '#D69E2E', fontWeight: '700' },
                        ]}>Hot</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* {activeTab === "Feed" && highlightPosts.length > 0 && (
                <View style={styles.highlightsSection}>
                    <View style={styles.highlightsHeader}>
                        <Ionicons name="pin-outline" size={20} color="#333" />
                        <Text style={styles.highlightsTitle}>Community highlights</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.highlightsScroll}>
                        {highlightPosts.map((post: any, index: number) => (
                            <TouchableOpacity key={post.id.toString()} style={styles.highlightCard}>
                                <Image source={{ uri: getPostImage(post) }} style={styles.highlightImage} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )} */}
        </View>
    );

    const renderAbout = () => {
        const weeklyVisitors = (Math.floor(Math.random() * 200) + 50) + "k";
        const weeklyContribution = (Math.floor(Math.random() * 2000) + 500);

        const rules = [
            { title: "No Spam", content: "Do not post spam or self-promotional content." },
            { title: "No Politically Based Comments", content: "Keep the discussion focused on the community's theme and avoid political debate." },
            { title: "No Personal Attacks", content: "Be respectful. Personal attacks and harassment will not be tolerated." }
        ];

        return (
            <View style={styles.aboutContainer}>
                <Text style={styles.aboutCommunityName}>{translatedCommunityName}</Text>
                <Text style={styles.aboutDescription}>{translatedCommunityDescription || "No description available."}</Text>

                <View style={styles.createdRow}>
                    <Ionicons name="document-outline" size={20} color="#666" />
                    <Text style={styles.createdText}>Created 4 months ago</Text>
                </View>

                <View style={styles.statsMetricsRow}>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricValue}>{weeklyVisitors}</Text>
                        <Text style={styles.metricLabel}>Weekly Visitors</Text>
                    </View>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricValue}>{weeklyContribution}</Text>
                        <Text style={styles.metricLabel}>Weekly Contribution</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.rulesTitle}>{community?.name} Rules</Text>
                {rules.map((rule, index) => (
                    <View key={index} style={styles.ruleItem}>
                        <TouchableOpacity style={styles.ruleHeader} onPress={() => toggleRule(index)}>
                            <Text style={styles.ruleLabel}>{index + 1}. {rule.title}</Text>
                            <Ionicons
                                name={expandedRules.includes(index) ? "chevron-up" : "chevron-down"}
                                size={20}
                                color="#666"
                            />
                        </TouchableOpacity>
                        {expandedRules.includes(index) && (
                            <Text style={styles.ruleContent}>{rule.content}</Text>
                        )}
                    </View>
                ))}
            </View>
        );
    };

    if (loading && !community) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#D69E2E" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={{ height: 0 }}>
                {/* Global header handles logo. Use a minimal back button if needed, but here it might overlap */}
            </View>
            <Animated.View style={[styles.navHeader, { transform: [{ translateY: headerY }] }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
            </Animated.View>
            <FlatList
                data={activeTab === "Feed" ? posts : []}
                ListHeaderComponent={renderHeader}
                renderItem={({ item }) => (
                    <SocialPostCard
                        post={item}
                        onComment={() => handleInteraction('comment', item)}
                        onAskQuestion={() => handleInteraction('askQuestion', item)}
                        onUpvote={() => handleInteraction('upvote', item)}
                        onDownvote={() => handleInteraction('downvote', item)}
                        onSave={() => handleInteraction('save', item)}
                        onUnsave={() => handleInteraction('unsave', item)}
                        onHide={() => handleInteraction('hide', item)}
                        onReport={(reason, details) => {
                            dispatch(reportContent('post', item.id, reason, details) as any);
                            Alert.alert("Reported", "Thank you for reporting. We will review this post.");
                        }}
                        onEdit={() => handleInteraction('edit', item)}
                        onDelete={() => handleInteraction('delete', item)}
                    />
                )}
                keyExtractor={(item) => item.id.toString()}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                contentContainerStyle={{ paddingTop: 100 }}
                ListFooterComponent={() =>
                    communityPosts.loading && communityPosts.pagination.currentPage > 1 ? (
                        <ActivityIndicator style={{ padding: 20 }} color="#D69E2E" />
                    ) : <View style={{ height: 20 }} />
                }
                ListEmptyComponent={() => {
                    if (activeTab === "About") {
                        return renderAbout();
                    }

                    // Show loading spinner when posts are being fetched
                    if (communityPosts.loading && communityPosts.pagination.currentPage === 1) {
                        return (
                            <View style={styles.emptyContainer}>
                                <ActivityIndicator size="large" color="#D69E2E" />
                            </View>
                        );
                    }

                    // Show empty state when no posts are available
                    return (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No posts available.</Text>
                        </View>
                    );
                }}
            />
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    communityHeader: {
        backgroundColor: "#FFF",
    },
    banner: {
        width: "100%",
        height: 120,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingHorizontal: 16,
        // marginTop: 100,
    },
    avatarWrapper: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderRadius: 50,
        backgroundColor: "transparent",
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 5,
        borderColor: "#FFF",
        overflow: "hidden",
        backgroundColor: "#EEE",
    },
    avatar: {
        width: "100%",
        height: "100%",
    },
    communityInfo: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        marginLeft: 16,
        paddingRight: 16,
    },
    communityName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#2D3748",
        textAlign: 'center'
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
        textAlign: 'center',
        justifyContent: 'center'

    },
    statsText: {
        fontSize: 13,
        color: "#718096",
        fontWeight: "600",
    },
    joinButton: {
        backgroundColor: "#D69E2E",
        paddingVertical: 10,
        paddingHorizontal: 32,
        borderRadius: 24,
        marginTop: 12,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
    },
    joinedButton: {
        backgroundColor: "#E2E8F0",
    },
    joinButtonText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 17,
    },
    joinedButtonText: {
        color: "#4A5568",
    },
    createPostButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#D4A017",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        alignSelf: "flex-start",
        marginHorizontal: 16,
        marginTop: 20,
    },
    createPostText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: "500",
        color: "#333",
    },
    tabsContainer: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#EEE",
        marginTop: 20,
        paddingHorizontal: 16,
    },
    tab: {
        paddingVertical: 12,
        marginRight: 24,
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    activeTab: {
        borderBottomColor: "#D69E2E",
    },
    tabText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#999",
    },
    activeTabText: {
        color: "#000",
    },
    filterButton: {
        justifyContent: "center",
        paddingHorizontal: 8,
    },
    aboutContainer: {
        padding: 20,
    },
    aboutCommunityName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 8,
    },
    aboutDescription: {
        fontSize: 16,
        color: "#666",
        lineHeight: 22,
        marginBottom: 20,
    },
    createdRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },
    createdText: {
        marginLeft: 8,
        fontSize: 15,
        color: "#333",
        fontWeight: "500",
    },
    statsMetricsRow: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginBottom: 24,
    },
    metricItem: {
        marginRight: 40,
    },
    metricValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    metricLabel: {
        fontSize: 14,
        color: "#999",
        marginTop: 4,
    },
    divider: {
        height: 1,
        backgroundColor: "#F0F0F0",
        marginBottom: 24,
    },
    rulesTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 16,
    },
    ruleItem: {
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
        paddingBottom: 16,
    },
    ruleHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    ruleLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
    },
    ruleContent: {
        fontSize: 14,
        color: "#666",
        marginTop: 8,
        lineHeight: 20,
    },
    highlightsSection: {
        paddingVertical: 16,
        backgroundColor: "#FFF",
    },
    highlightsHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    highlightsTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginLeft: 8,
    },
    highlightsScroll: {
        paddingLeft: 16,
    },
    highlightCard: {
        width: 160,
        height: 120,
        marginRight: 12,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#EEE",
    },
    highlightImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    emptyContainer: {
        padding: 40,
        alignItems: "center",
    },
    emptyText: {
        color: "#999",
        fontSize: 16,
    },
    navHeader: {
        position: 'absolute',
        top: 40,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        backgroundColor: "#FFF",
    },
    backButton: {
        marginRight: 12,
    },
    navHeaderTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#000",
    },
    menuContainer: {
        position: 'absolute',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 12,
        minWidth: 160,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
        zIndex: 1000,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    menuBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    menuItemText: {
        fontSize: 14,
        marginLeft: 12,
        color: '#333',
        fontWeight: '500',
    },
});



export default CommunityDetail;

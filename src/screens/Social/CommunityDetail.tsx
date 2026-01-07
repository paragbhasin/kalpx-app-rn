import React, { useEffect, useState } from "react";
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
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { fetchCommunityDetail, fetchCommunityPosts, followCommunity, unfollowCommunity } from "./actions";
import SocialPostCard from "../../components/SocialPostCard";
import Header from "../../components/Header";
import { COMMUNITY_BACKGROUNDS } from "../../utils/CommunityAssets";
import { fetchUserActivity } from "../UserActivity/actions";

const { width } = Dimensions.get("window");

const CommunityDetail = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const route = useRoute();
    const { slug } = route.params as { slug: string };

    const { communityDetail, communityPosts } = useSelector((state: any) => state.communities);
    const { followed_communities } = useSelector((state: any) => state.userActivity);

    const [activeTab, setActiveTab] = useState<"Feed" | "About">("Feed");
    const [expandedRules, setExpandedRules] = useState<number[]>([]);

    useEffect(() => {
        dispatch(fetchCommunityDetail(slug) as any);
        dispatch(fetchCommunityPosts(slug, 1) as any);
        dispatch(fetchUserActivity("followed_communities") as any);
    }, [dispatch, slug]);

    const community = communityDetail.data;
    const posts = communityPosts.data;
    const loading = communityDetail.loading || (communityPosts.loading && communityPosts.pagination.currentPage === 1);

    const isJoined = followed_communities.data.some((c: any) => c.slug === slug || c.id === community?.id);

    const handleJoin = () => {
        if (isJoined) {
            dispatch(unfollowCommunity(slug) as any);
        } else {
            dispatch(followCommunity(slug) as any);
        }
    };

    const handleLoadMore = () => {
        if (!communityPosts.loading && communityPosts.pagination.currentPage < communityPosts.pagination.totalPages) {
            dispatch(fetchCommunityPosts(slug, communityPosts.pagination.currentPage + 1) as any);
        }
    };

    const toggleRule = (index: number) => {
        setExpandedRules((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
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
                    <Text style={styles.communityName}>{community?.name || "Community"}</Text>
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

            <TouchableOpacity style={styles.createPostButton}>
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
                <TouchableOpacity style={styles.filterButton}>
                    <Ionicons name="filter" size={20} color="#000" />
                </TouchableOpacity>
            </View>

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
                <Text style={styles.aboutCommunityName}>{community?.name}</Text>
                <Text style={styles.aboutDescription}>{community?.description || "No description available."}</Text>

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
            <View>
                <Header />
                <View style={styles.navHeader}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.navHeaderTitle}>Community</Text>
                </View>
            </View>
            <FlatList
                data={activeTab === "Feed" ? posts : []}
                ListHeaderComponent={renderHeader}
                renderItem={({ item }) => <SocialPostCard post={item} />}
                keyExtractor={(item) => item.id.toString()}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() =>
                    communityPosts.loading && communityPosts.pagination.currentPage > 1 ? (
                        <ActivityIndicator style={{ padding: 20 }} color="#D69E2E" />
                    ) : <View style={{ height: 20 }} />
                }
                ListEmptyComponent={() => activeTab === "About" ? renderAbout() : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No posts available.</Text>
                    </View>
                )}
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
marginTop:15,
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
        marginLeft: 16,
        marginTop: 15,
    },
    communityName: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#2D3748",
    },
    statsRow: {
        flexDirection: "row",
        marginTop: 2,
justifyContent:'center'
    },
    statsText: {
        fontSize: 13,
        color: "#718096",
        fontWeight: "600",
    },
    joinButton: {
        backgroundColor: "#D69E2E",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        marginTop: 12,
justifyContent:'center',
  
        minWidth: 120,
        alignItems: "center",

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
});



export default CommunityDetail;

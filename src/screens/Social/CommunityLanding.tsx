import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View, ScrollView, TextInput, FlatList, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { Dropdown } from "react-native-element-dropdown";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";

import { useGlobalSearch } from "../../hooks/useGlobalSearch";
import Colors from "../../components/Colors";

import SocialExplore from "./SocialExplore";
import ExploreCommunities from "./ExploreCommunities";
import Header from "../../components/Header";
import FeedScreen from "../Feed/FeedScreen";
import Popular from "../Social/PopularCommunity";
import { fetchCommunities, fetchTopCommunities } from "./actions";
import TopCommunities from "./TopCommunities";
import UserActivityScreen from "../UserActivity/UserActivityScreen";
import UserAgreements from "./UserAgreements";
import { fetchUserActivity } from "../UserActivity/actions";

import { useScrollContext } from "../../context/ScrollContext";
import { Animated } from "react-native";
import { COMMUNITY_BACKGROUNDS } from "../../utils/CommunityAssets";

const CommunityLanding = () => {
    const { handleScroll, headerY } = useScrollContext();
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();
    const [selectedCategory, setSelectedCategory] = useState("Home");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [isSearching, setIsSearching] = useState(false);

    const { searchQuery, setSearchQuery, results, loading, error } = useGlobalSearch();

    const { data: communities, loading: communitiesLoading } = useSelector((state: any) => state.communities);
    const { followed_communities } = useSelector((state: any) => state.userActivity);

    const dropdownRef = useRef<any>(null);

    const categories = [
        { label: "Home", value: "Home" },
        { label: "Top", value: "Top" }, // Renders SocialExplore
        { label: "Popular", value: "Popular" },
        { label: "Explore", value: "Explore" },
        { label: "Communities", value: "Communities" },
        { label: "KalpX Rules", value: "kalpxRules" },
        { label: "Privacy Policy", value: "privacyPolicy" },
        { label: "User agreements", value: "userAgreements" },
        { label: "About KalpX", value: "aboutKalpx" },
        { label: "Your Activity", value: "yourActivity" }

    ];

    useEffect(() => {
        if (selectedCategory === "Home") {
            dispatch(fetchCommunities(1) as any);
        }
    }, [dispatch, selectedCategory]);

    useEffect(() => {
        dispatch(fetchUserActivity("followed_communities") as any);
    }, [dispatch]);

    const renderHeader = () => (
        <Animated.View style={[styles.animatedHeader, { transform: [{ translateY: headerY }] }]}>
            <View style={styles.headerContainer}>
                {isSearching ? (
                    <View style={styles.searchBarContainer}>
                        <TouchableOpacity onPress={() => {
                            setIsSearching(false);
                            setSearchQuery("");
                        }} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#000" />
                        </TouchableOpacity>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search communities, posts, users..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
                                <Ionicons name="close-circle" size={20} color="#999" />
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <>
                        {/* Title */}
                        <Text style={styles.headerTitle}>Community</Text>

                        {/* Dropdown */}
                        <Dropdown
                            ref={dropdownRef}
                            style={styles.dropdownTrigger}
                            containerStyle={styles.dropdownContainer}
                            data={categories}
                            labelField="label"
                            valueField="value"
                            value={selectedCategory}
                            onChange={(item) => setSelectedCategory(item.value)}
                            selectedTextStyle={styles.selectedTextStyle}
                            placeholderStyle={styles.placeholderStyle}
                            iconStyle={styles.iconStyle}
                            dropdownPosition="bottom"
                            showsVerticalScrollIndicator={false}
                            selectedTextProps={{ numberOfLines: 1, ellipsizeMode: 'tail' }}
                            renderRightIcon={() => (
                                <Ionicons name="caret-down-outline" size={12} color="#000" style={{ marginLeft: 4 }} />
                            )}
                            renderItem={(item) => {
                                // Check if this is the position where RECENT should be inserted
                                const isAfterExplore = item.value === "Communities";
                                const isYourActivity = item.value === "yourActivity";

                                return (
                                    <>
                                        {isAfterExplore && followed_communities?.data?.length > 0 && (
                                            <View>
                                                <Text style={styles.dropdownSectionHeader}>RECENT</Text>
                                                {followed_communities.data.slice(0, 5).map((community: any, index: number) => (
                                                    <TouchableOpacity
                                                        key={`recent-${index}`}
                                                        style={styles.dropdownRecentItem}
                                                        onPress={() => {
                                                            dropdownRef.current?.close();
                                                            navigation.navigate("CommunityDetail", { slug: community.slug });
                                                        }}
                                                    >
                                                        <Image
                                                            source={COMMUNITY_BACKGROUNDS[community.slug] || COMMUNITY_BACKGROUNDS[community.id] || require("../../../assets/Exploreicon.png")}
                                                            style={styles.dropdownRecentIcon}
                                                        />
                                                        <Text style={styles.dropdownRecentText} numberOfLines={1} ellipsizeMode="tail">
                                                            {community.name || community.slug}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        )}
                                        {isYourActivity && (
                                            <View>
                                                <Text style={styles.dropdownSectionHeader}>YOUR ACTIVITY</Text>
                                            </View>
                                        )}
                                        {item.value === "Communities" && (
                                            <View>
                                                <Text style={styles.dropdownSectionHeader}>RESOURCES</Text>
                                            </View>
                                        )}
                                        <TouchableOpacity
                                            style={styles.dropdownItem}
                                            onPress={() => {
                                                dropdownRef.current?.close();
                                                setSelectedCategory(item.value);
                                            }}
                                        >
                                            <Text style={styles.dropdownItemText} numberOfLines={1} ellipsizeMode="tail">
                                                {item.label}
                                            </Text>
                                        </TouchableOpacity>
                                    </>
                                );
                            }}
                        />
                        {/* Action Icons */}
                        <View style={styles.actionIcons}>
                            {selectedCategory === "Top" && (
                                <>
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => setViewMode("list")}
                                    >
                                        <Ionicons
                                            name="list-outline"
                                            size={24}
                                            color={viewMode === "list" ? "#D69E2E" : "#000"}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => setViewMode("grid")}
                                    >
                                        <Ionicons
                                            name="grid-outline"
                                            size={24}
                                            color={viewMode === "grid" ? "#D69E2E" : "#000"}
                                        />
                                    </TouchableOpacity>
                                </>
                            )}
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => setIsSearching(true)}
                            >
                                <Ionicons name="search-outline" size={24} color="#000" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => navigation.navigate("CreateSocialPost")}
                            >
                                <Ionicons name="add-circle-outline" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </Animated.View>
    );

    const renderKalpxRules = () => (
        <ScrollView style={styles.rulesContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.rulesContent}>
                <Text style={styles.mainHeading}>KalpX Community Rules</Text>

                <View style={styles.ruleItem}>
                    <Text style={styles.ruleTitle}>1. Respect for Dharma (Righteousness)</Text>
                    <Text style={styles.normalText}>
                        We uphold truth, compassion, and non-violence (Ahimsa) in all our
                        interactions. Speak with kindness and integrity. Adhere to the
                        principles of Dharma in your conduct within the community.
                    </Text>
                </View>

                <View style={styles.ruleItem}>
                    <Text style={styles.ruleTitle}>2. Authenticity of Scripture</Text>
                    <Text style={styles.normalText}>
                        When discussing Shastras, Vedas, Puranas, or other sacred texts,
                        please cite your sources respectfully and accurately. Misleading
                        interpretations or fabricating information is discouraged.
                    </Text>
                </View>

                <View style={styles.ruleItem}>
                    <Text style={styles.ruleTitle}>3. No Hate Speech or Adharmic Conduct</Text>
                    <Text style={styles.normalText}>
                        We have zero tolerance for malice, blasphemy, discrimination, or
                        intent to harm others. Any speech that spreads hatred or division
                        is considered Adharmic and will be removed.
                    </Text>
                </View>

                <View style={styles.ruleItem}>
                    <Text style={styles.ruleTitle}>4. Constructive Debate (Shastrartha)</Text>
                    <Text style={styles.normalText}>
                        Debates should be grounded in the spirit of Jigyasa (seeking
                        truth), not Ahankara (ego). Engage in discussions to learn and
                        share knowledge, not to prove superiority.
                    </Text>
                </View>

                <View style={styles.ruleItem}>
                    <Text style={styles.ruleTitle}>5. Respect for Deities and Gurus</Text>
                    <Text style={styles.normalText}>
                        Maintain reverence when speaking of Deities, Gurus, and spiritual
                        teachers. Constructive discussion is welcome, but disrespect is
                        not tolerated.
                    </Text>
                </View>

                <View style={styles.sidebarSection}>
                    <View style={styles.sidebarCard}>
                        <Image
                            source={require("../../../assets/about-kalpx3.png")}

                            style={styles.sidebarImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.quoteText}>
                            "Dharmo Rakshati Rakshitah"
                        </Text>
                        <Text style={styles.quoteTranslation}>
                            Dharma protects those who protect it.
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );

    const renderPrivacyPolicy = () => (
        <ScrollView style={styles.rulesContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.rulesContent}>
                <Text style={styles.mainHeading}>Privacy Policy</Text>

                <View style={styles.ruleItem}>
                    <Text style={styles.ruleTitle}>1. Sanctity of Your Data</Text>
                    <Text style={styles.normalText}>
                        We consider your personal sadhana data, journal entries, and
                        spiritual progress as sacred and private. We treat your
                        information with the highest level of confidentiality and respect.
                    </Text>
                </View>

                <View style={styles.ruleItem}>
                    <Text style={styles.ruleTitle}>2. Data Collection</Text>
                    <Text style={styles.normalText}>
                        We collect minimal data necessary to provide you with a
                        personalized spiritual experience. This includes your username,
                        email (for account recovery), and your interactions within the
                        community to improve content recommendations.
                    </Text>
                </View>

                <View style={styles.ruleItem}>
                    <Text style={styles.ruleTitle}>3. Usage of Information</Text>
                    <Text style={styles.normalText}>
                        Your data is used solely to enhance your journey on KalpX. We do
                        not sell your personal information to third-party advertisers. We
                        believe your spiritual growth is not a product.
                    </Text>
                </View>

                <View style={styles.ruleItem}>
                    <Text style={styles.ruleTitle}>4. Third-Party Services</Text>
                    <Text style={styles.normalText}>
                        We may use trusted third-party services for hosting, analytics,
                        and communication. These partners are bound by strict
                        confidentiality agreements and are only provided with data
                        necessary to perform their functions.
                    </Text>
                </View>

                <View style={styles.ruleItem}>
                    <Text style={styles.ruleTitle}>5. Security</Text>
                    <Text style={styles.normalText}>
                        We employ industry-standard security measures to protect your data
                        from unauthorized access, alteration, or disclosure. However, no
                        method of transmission over the internet is 100% secure.
                    </Text>
                </View>


            </View>
        </ScrollView>
    );

    const renderAboutKalpx = () => (
        <ScrollView style={styles.aboutKalpxContainer} showsVerticalScrollIndicator={false}>
            {/* HERO SECTION */}
            <View style={styles.aboutHero}>
                <Text style={styles.aboutHeroHeading}>The heart of your inner journey</Text>
                <Text style={styles.aboutHeroText}>
                    KalpX is home to countless paths for personal growth, mindful
                    practices, and genuine self-discovery. Whether you’re exploring
                    meditation, building inner resilience, seeking clarity in your
                    career, or simply nurturing calm in daily life, there’s a guided
                    journey on KalpX for you.
                </Text>
                <Image
                    source={require("../../../assets/about-kalpx3.png")}
                    style={styles.heroImage}
                    contentFit="contain"
                />
            </View>

            {/* POST SECTION */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeading}>Post</Text>
                <Text style={styles.sectionText}>
                    The Community can share content by posting stories, links, image, and
                    Videos.
                </Text>
                <View style={styles.imageContainer}>
                    <Image
                        source={require("../../../assets/about-kalpx2.png")}
                        style={styles.sectionImage}
                        contentFit="contain"
                    />
                </View>
            </View>

            {/* COMMENT SECTION */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeading}>Comment</Text>
                <Text style={styles.sectionText}>
                    The Community can share content by posting stories, links, images, and
                    videos.
                </Text>
                <View style={styles.phoneContainer}>
                    <View style={styles.phoneWrapper}>
                        {/* Placeholder for about-phone.svg since it's missing */}
                        <Image
                            source={require("../../../assets/about-kalpx4.png")}
                            style={styles.sectionImage}
                            contentFit="contain"
                        />

                        {/* Floating Comments */}
                        <View style={[styles.commentBubble, styles.leftComment]}>
                            <Text style={styles.commentText}>I Like the fact that everyone is here is so spiritual</Text>
                        </View>

                        <View style={[styles.commentBubble, styles.rightComment]}>
                            <Text style={styles.commentText}>Pure devotion, pure strength. This story never fails to touch the heart.</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* VOTE SECTION */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeading}>Vote</Text>
                <Text style={styles.sectionText}>
                    Components & posts can be Upvoted or downvoted. The most interesting
                    content rises to the top.
                </Text>
                <View style={styles.voteContainer}>
                    <Image
                        source={require("../../../assets/about-kalpx2.png")}
                        style={styles.sectionImage}
                        contentFit="contain"
                    />
                    <View style={styles.voteBadge}>
                        <Ionicons name="arrow-down" size={14} color="#D69E2E" />
                        <Text style={styles.voteBadgeText}>Vote</Text>
                        <Ionicons name="arrow-up" size={14} color="#D69E2E" />
                    </View>
                </View>
            </View>
            <View style={{ height: 40 }} />
        </ScrollView>
    );

    const renderSearchResultItem = ({ item }: { item: any }) => {
        if (item.type === 'header') {
            return (
                <View style={styles.searchSectionHeader}>
                    <Text style={styles.searchSectionTitle}>{item.title}</Text>
                </View>
            );
        }

        const iconName = item.type === 'community' ? 'people-outline'
            : item.type === 'post' ? 'document-text-outline'
                : 'person-outline';

        return (
            <TouchableOpacity
                style={styles.searchResultItem}
                onPress={() => {
                    if (item.type === 'community') {
                        navigation.navigate("CommunityDetail", { slug: item.slug });
                    } else if (item.type === 'post') {
                        navigation.navigate("SocialPostDetailScreen", { post: item });
                    }
                }}
            >
                <View style={styles.searchIconCircle}>
                    <Ionicons name={iconName} size={20} color={Colors.Colors.App_theme} />
                </View>
                <View style={styles.searchTextContainer}>
                    <Text style={styles.searchItemTitle} numberOfLines={1}>
                        {item.name || item.title || item.content || item.username || "Result"}
                    </Text>
                    <Text style={styles.searchItemSubtitle}>
                        {item.type === 'community' ? `${item.member_count || 0} members`
                            : item.type === 'post' ? `in ${item.community_name || "Community"}`
                                : 'User'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderSearchResults = () => {
        const combinedData = [
            ...(results.communities.length > 0 ? [{ type: 'header', title: 'Communities', id: 'h-comm' }, ...results.communities.map(i => ({ ...i, type: 'community' }))] : []),
            ...(results.posts.length > 0 ? [{ type: 'header', title: 'Posts', id: 'h-posts' }, ...results.posts.map(i => ({ ...i, type: 'post' }))] : []),
            ...(results.users.length > 0 ? [{ type: 'header', title: 'Users', id: 'h-users' }, ...results.users.map(i => ({ ...i, type: 'user' }))] : []),
        ];

        return (
            <View style={styles.searchResultsContainer}>
                {loading && searchQuery.length > 0 && (
                    <ActivityIndicator style={{ marginTop: 20 }} color={Colors.Colors.App_theme} />
                )}
                {error && <Text style={styles.errorText}>{error}</Text>}
                {!loading && searchQuery.length > 0 && combinedData.length === 0 && (
                    <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
                )}
                <FlatList
                    data={combinedData}
                    keyExtractor={(item, index) => item.id?.toString() || `search-${index}`}
                    renderItem={renderSearchResultItem}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            </View>
        );
    };

    const renderContent = () => {
        if (isSearching) return renderSearchResults();

        switch (selectedCategory) {
            case "Top":
                return <SocialExplore showHeader={false} viewMode={viewMode} onScroll={handleScroll} />;
            case "Home":
                return <FeedScreen onScroll={handleScroll} />;
            case "Popular":
                return <Popular onScroll={handleScroll} />;
            case "Explore":
                return <ExploreCommunities onScroll={handleScroll} />;
            case "Communities":
                return <TopCommunities onScroll={handleScroll} />;
            case "kalpxRules":
                return renderKalpxRules();
            case "privacyPolicy":
                return renderPrivacyPolicy();
            case "aboutKalpx":
                return renderAboutKalpx();
            case "userAgreements":
                return <UserAgreements onScroll={handleScroll} />;
            case "yourActivity":
                return <UserActivityScreen onScroll={handleScroll} />;
            default:
                return (
                    <View style={styles.placeholderContainer}>
                        <Text style={styles.placeholderText}>{selectedCategory} Content Coming Soon</Text>
                    </View>
                );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
            <View style={styles.mainLayout}>
                {renderHeader()}
                <View style={styles.contentContainer}>
                    {renderContent()}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#FFF",
    },
    animatedHeader: {
        position: 'absolute',
        top: 40, // Below Global Header (~54px)
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: "#FFF",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    mainLayout: {
        flex: 1,
        position: 'relative',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#000",
        marginRight: 10,
    },
    dropdownTrigger: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 6,
        paddingVertical: 2,
        maxWidth: 150,
        minWidth: 60,
    },
    dropdownContainer: {
        width: 220,
        borderRadius: 12,
    },
    selectedTextStyle: {
        fontSize: 14,
        color: "#000",
        fontWeight: "500",
        flexShrink: 1,
        maxWidth: 60,
    },
    placeholderStyle: {
        fontSize: 16,
        color: "#888",
    },
    iconStyle: {
        width: 12,
        height: 12,
    },
    dropdownSectionHeader: {
        fontSize: 11,
        fontWeight: "600",
        color: "#888",
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#f8f8f8",
        textTransform: "uppercase",
    },
    dropdownItem: {
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    dropdownItemText: {
        fontSize: 14,
        color: "#000",
    },
    dropdownRecentItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    dropdownRecentIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 10,
    },
    dropdownRecentText: {
        fontSize: 14,
        color: "#000",
        flex: 1,
    },
    actionIcons: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: "auto",
    },
    iconButton: {
        marginLeft: 16,
    },
    contentContainer: {
        flex: 1,
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    placeholderText: {
        fontSize: 16,
        color: "#888",
    },
    rulesContainer: {
        flex: 1,
        backgroundColor: "#FFF",
        marginTop:80
    },
    rulesContent: {
        padding: 20,
    },
    mainHeading: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1a1a1b",
        marginBottom: 24,
        fontFamily: "Piazzolla", // Note: Ensure font is loaded
    },
    ruleItem: {
        marginBottom: 32,
    },
    ruleTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1a1a1b",
        marginBottom: 8,
        fontFamily: "Piazzolla",
    },
    normalText: {
        fontSize: 15,
        color: "#4a4a4a",
        lineHeight: 24,
        fontFamily: "Inter",
    },
    sidebarSection: {
        marginTop: 40,
        marginBottom: 40,
    },
    sidebarCard: {
        backgroundColor: "#fdfaf2",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#f0e6cc",
    },
    sidebarImage: {
        width: "100%",
        height: 200,
        marginBottom: 20,
    },
    quoteText: {
        fontSize: 18,
        fontFamily: "Piazzolla",
        fontStyle: "italic",
        textAlign: "center",
        color: "#4a4a4a",
        marginBottom: 8,
    },
    quoteTranslation: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
    },
    aboutKalpxContainer: {
        flex: 1,
        backgroundColor: "#FFF",
        marginTop:80
    },
    aboutHero: {
        padding: 24,
        alignItems: "center",
        backgroundColor: "#fdfaf2",
        paddingBottom: 40,
    },
    aboutHeroHeading: {
        fontSize: 28,
        fontFamily: "Piazzolla",
        fontWeight: "bold",
        color: "#1a1a1b",
        textAlign: "center",
        marginBottom: 16,
    },
    aboutHeroText: {
        fontSize: 15,
        color: "#4a4a4a",
        textAlign: "center",
        lineHeight: 24,
        fontFamily: "Inter",
        marginBottom: 24,
    },
    heroImage: {
        width: "90%",
        height: 220,
    },
    sectionContainer: {
        padding: 24,
        paddingTop: 40,
        backgroundColor: "#FFF",
    },
    sectionHeading: {
        fontSize: 32,
        fontFamily: "Piazzolla",
        fontWeight: "bold",
        color: "#1a1a1b",
        marginBottom: 12,
    },
    sectionText: {
        fontSize: 15,
        color: "#4a4a4a",
        lineHeight: 24,
        fontFamily: "Inter",
        marginBottom: 24,
    },
    imageContainer: {
        alignItems: "center",
        paddingTop: 20,
    },
    sectionImage: {
        width: "100%",
        height: 180,
    },
    phoneContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        height: 260,
    },
    phoneWrapper: {
        width: 200,
        height: 200,
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
    },
    phonePlaceholder: {
        backgroundColor: "#E6FFFA",
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: "#B2F5EA",
    },
    commentBubble: {
        position: "absolute",
        backgroundColor: "#FFF",
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        maxWidth: 160,
    },
    leftComment: {
        top: -10,
        left: -40,
    },
    rightComment: {
        bottom: 20,
        right: -60,
    },
    commentText: {
        fontSize: 11,
        color: "#4A5568",
        lineHeight: 16,
    },
    voteContainer: {
        position: "relative",
        alignItems: "center",
    },
    voteBadge: {
        position: "absolute",
        top: "50%",
        left: 0,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    voteBadgeText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#1A202C",
        marginHorizontal: 8,
    },
    // Search Styles
    searchBarContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        borderRadius: 20,
        paddingHorizontal: 12,
        height: 40,
    },
    backButton: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: "#000",
        height: "100%",
        padding: 0,
    },
    clearButton: {
        padding: 4,
    },
    searchResultsContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    searchSectionHeader: {
        backgroundColor: "#f8f8f8",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    searchSectionTitle: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#666",
        textTransform: "uppercase",
    },
    searchResultItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    searchIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#f9f9f9",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
        borderWidth: 1,
        borderColor: "#eee",
    },
    searchTextContainer: {
        flex: 1,
    },
    searchItemTitle: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
    },
    searchItemSubtitle: {
        fontSize: 13,
        color: "#888",
        marginTop: 2,
    },
    noResultsText: {
        textAlign: "center",
        marginTop: 40,
        color: "#999",
        fontSize: 15,
    },
    errorText: {
        textAlign: "center",
        marginTop: 20,
        color: "#e53e3e",
    },
});

export default CommunityLanding;

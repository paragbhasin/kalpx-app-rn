import React, { useEffect, useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { Image } from "expo-image";
import { Dropdown } from "react-native-element-dropdown";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";

import SocialExplore from "./SocialExplore";
import ExploreCommunities from "./ExploreCommunities";
import Header from "../../components/Header";
import FeedScreen from "../Feed/FeedScreen";
import Popular from "../Social/PopularCommunity";
import { fetchCommunities, fetchTopCommunities } from "./actions";
import TopCommunities from "./TopCommunities";

const CommunityLanding = () => {
    const dispatch = useDispatch();
    const [selectedCategory, setSelectedCategory] = useState("Home");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");


    const { data: communities, loading } = useSelector((state: any) => state.communities);

    useEffect(() => {
        if (selectedCategory === "Home") {
            dispatch(fetchCommunities(1) as any);
        }
    }, [dispatch, selectedCategory]);


    const categories = [
        { label: "Home", value: "Home" },
        { label: "Top", value: "Top" }, // Renders SocialExplore
        { label: "Popular", value: "Popular" },
        { label: "Explore", value: "Explore" },
        { label: "Communities", value: "Communities" },
        { label: "KalpX Rules", value: "kalpxRules" },
        { label: "Privacy Policy", value: "privacyPolicy" },
        { label: "User agreements", value: "userAgreements" },
        { label: "About KalpX", value: "aboutKalpx" }

    ];

    const renderHeader = () => (

        <View >
            <Header />
            <View style={styles.headerContainer}>
                {/* Title */}
                <Text style={styles.headerTitle}>Community</Text>

                {/* Dropdown */}
                <Dropdown
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
                    renderRightIcon={() => (
                        <Ionicons name="caret-down-outline" size={12} color="#000" style={{ marginLeft: 4 }} />
                    )}
                />

                <View style={{ flex: 1 }} />

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
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="search-outline" size={24} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="add-circle-outline" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
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

    const renderContent = () => {
        switch (selectedCategory) {
            case "Top":
                return <SocialExplore showHeader={false} viewMode={viewMode} />;
            case "Home":
                return <FeedScreen />;
            case "Popular":
                return <Popular />;
            case "Explore":
                return <ExploreCommunities />;
            case "Communities":
                return <TopCommunities />;
            case "kalpxRules":
                return renderKalpxRules();
            case "privacyPolicy":
                return renderPrivacyPolicy();
            case "aboutKalpx":
                return renderAboutKalpx();
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
            {renderHeader()}
            <View style={styles.contentContainer}>
                {renderContent()}
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
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        backgroundColor: "#FFF",
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#000",
        marginRight: 10,
    },
    dropdownTrigger: {
        marginLeft: 6,
        paddingHorizontal: 4,
        paddingVertical: 2,
        alignSelf: "flex-start",
    },
    dropdownContainer: {
        width: 220,
        borderRadius: 12,
    },
    selectedTextStyle: {
        fontSize: 16,
        color: "#000",
        textDecorationLine: "underline",
        fontWeight: "500",
        flexShrink: 1,            // ⬅️ text-based width
        minWidth: 60,
    },
    placeholderStyle: {
        fontSize: 16,
        color: "#888",
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    actionIcons: {
        flexDirection: "row",
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
});

export default CommunityLanding;

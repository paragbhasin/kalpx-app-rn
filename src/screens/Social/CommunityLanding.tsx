import React, { useEffect, useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
});

export default CommunityLanding;

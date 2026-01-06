import React, { useEffect, useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
// import Colors from "../../components/Colors"; // Check if this import is needed or if styles serve enough
import SocialExplore from "./SocialExplore";
import FeedScreen from "../Feed/FeedScreen";
import { fetchCommunities, fetchTopCommunities } from "./actions"; // Import actions from local actions file (or alias)

const CommunityLanding = () => {
    const dispatch = useDispatch();
    const [selectedCategory, setSelectedCategory] = useState("Home");


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
    ];

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Title */}
            <Text style={styles.headerTitle}>Community</Text>

            {/* Dropdown */}
            <Dropdown
                style={styles.dropdown}
                data={categories}
                labelField="label"
                valueField="value"
                placeholder="Select"
                value={selectedCategory}
                onChange={(item) => setSelectedCategory(item.value)}
                selectedTextStyle={styles.selectedTextStyle}
                placeholderStyle={styles.placeholderStyle}
                iconStyle={styles.iconStyle}
                renderRightIcon={() => (
                    <Ionicons name="caret-down-outline" size={12} color="#000" style={{ marginLeft: 4 }} />
                )}
            />

            <View style={{ flex: 1 }} />

            {/* Action Icons */}
            <View style={styles.actionIcons}>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="search-outline" size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="add-circle-outline" size={24} color="#000" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderContent = () => {
        switch (selectedCategory) {
            case "Top":
                // "Top" renders the SocialExplore component which has its own logic for now.
                // If we want to move SocialExplore to Redux, that's a bigger Refactor. 
                // For now, keep it as is, because `SocialExplore` is working.
                return <SocialExplore showHeader={false} />;

            case "Home":
                return <FeedScreen />;

            case "Popular":
            case "Explore":
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
    dropdown: {
        width: 90,
        marginLeft: 0,
    },
    selectedTextStyle: {
        fontSize: 16,
        color: "#000",
        textDecorationLine: "underline",
        fontWeight: "500",
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

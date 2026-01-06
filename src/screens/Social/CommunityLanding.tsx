import React, { useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../../components/Colors";
import SocialExplore from "./SocialExplore";

const CommunityLanding = () => {
    const [selectedCategory, setSelectedCategory] = useState("Home");

    const categories = [
        { label: "Home", value: "Home" },
        { label: "Top", value: "Top" },
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
                return <SocialExplore showHeader={false} />;
            case "Home":
            case "Popular":
            case "Explore":
            default:
                // Placeholder for other tabs
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
        width: 90, // compact width
        marginLeft: 0,
    },
    selectedTextStyle: {
        fontSize: 16,
        color: "#000",
        textDecorationLine: "underline", // mimic the mock style
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

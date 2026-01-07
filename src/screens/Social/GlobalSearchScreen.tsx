import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Keyboard,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useGlobalSearch } from "../../hooks/useGlobalSearch";
import Colors from "../../components/Colors";

const GlobalSearchScreen = () => {
    const navigation = useNavigation<any>();
    const inputRef = useRef<TextInput>(null);
    const { searchQuery, setSearchQuery, results, loading, error } = useGlobalSearch();

    useEffect(() => {
        // Focus input on mount
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const clearSearch = () => {
        setSearchQuery("");
    };

    const renderCommunityItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => navigation.navigate("CommunityDetail", { slug: item.slug })}
        >
            <View style={styles.iconContainer}>
                <Ionicons name="people-outline" size={24} color={Colors.Colors.App_theme} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemSubtitle}>{item.member_count || 0} members</Text>
            </View>
        </TouchableOpacity>
    );

    const renderPostItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => navigation.navigate("SocialPostDetailScreen", { post: item })}
        >
            <View style={styles.iconContainer}>
                <Ionicons name="document-text-outline" size={24} color={Colors.Colors.App_theme} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.title || item.content || "Post"}</Text>
                <Text style={styles.itemSubtitle}>in {item.community_name || "Community"}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderUserItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => {/* Navigate to user profile if implemented */ }}
        >
            <View style={styles.iconContainer}>
                <Ionicons name="person-outline" size={24} color={Colors.Colors.App_theme} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.itemTitle}>{item.username || item.display_name || "User"}</Text>
                <Text style={styles.itemSubtitle}>User</Text>
            </View>
        </TouchableOpacity>
    );

    const renderSectionHeader = (title: string) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
    );

    const combinedData = [
        ...(results.communities.length > 0 ? [{ type: 'header', title: 'Communities', id: 'h-comm' }, ...results.communities.map(i => ({ ...i, type: 'community' }))] : []),
        ...(results.posts.length > 0 ? [{ type: 'header', title: 'Posts', id: 'h-posts' }, ...results.posts.map(i => ({ ...i, type: 'post' }))] : []),
        ...(results.users.length > 0 ? [{ type: 'header', title: 'Users', id: 'h-users' }, ...results.users.map(i => ({ ...i, type: 'user' }))] : []),
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                    <TextInput
                        ref={inputRef}
                        style={styles.input}
                        placeholder="Search communities, posts, users..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={20} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {loading && searchQuery.length > 0 && (
                <ActivityIndicator style={styles.loader} color={Colors.Colors.App_theme} />
            )}

            {error && (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {!loading && searchQuery.length > 0 && combinedData.length === 0 && (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>No results found for "{searchQuery}"</Text>
                </View>
            )}

            {!loading && searchQuery.length === 0 && (
                <View style={styles.centerContainer}>
                    <Ionicons name="search-outline" size={64} color="#eee" />
                    <Text style={styles.emptyText}>Type to search communities, posts, and users</Text>
                </View>
            )}

            <FlatList
                data={combinedData}
                keyExtractor={(item, index) => item.id?.toString() || `item-${index}`}
                renderItem={({ item }) => {
                    if (item.type === 'header') return renderSectionHeader(item.title);
                    if (item.type === 'community') return renderCommunityItem({ item });
                    if (item.type === 'post') return renderPostItem({ item });
                    if (item.type === 'user') return renderUserItem({ item });
                    return null;
                }}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    backButton: {
        padding: 5,
    },
    searchContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        borderRadius: 20,
        paddingHorizontal: 10,
        marginLeft: 10,
        height: 40,
    },
    searchIcon: {
        marginRight: 5,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: "#000",
        paddingVertical: 0,
    },
    clearButton: {
        padding: 5,
    },
    loader: {
        marginTop: 20,
    },
    listContent: {
        paddingBottom: 20,
    },
    sectionHeader: {
        backgroundColor: "#f8f8f8",
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#666",
        textTransform: "uppercase",
    },
    resultItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    iconContainer: {
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
    textContainer: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
    },
    itemSubtitle: {
        fontSize: 13,
        color: "#888",
        marginTop: 2,
    },
    centerContainer: {
        marginTop: 100,
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 15,
        color: "#999",
        textAlign: "center",
        marginTop: 10,
    },
    errorText: {
        fontSize: 15,
        color: "#e53e3e",
        textAlign: "center",
    },
});

export default GlobalSearchScreen;
